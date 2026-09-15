import { createClient } from "npm:@supabase/supabase-js@2";

const BIG_QUERY_URL =
  "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_KECAMATAN_AR/MapServer/0/query";

const PROGRESS_TABLE = "region_geometry_progress_district";
const JOB_NAME = "district-geometry";
const DEFAULT_BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 10;
const CONCURRENCY = 5;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function processOne(
  supabase: ReturnType<typeof createClient>,
  region: any,
) {
  const districtCode = String(
    region.admin_code_pum ?? region.code ?? "",
  ).trim();

  const url = new URL(BIG_QUERY_URL);
  url.searchParams.set("where", `KDCPUM = '${districtCode}'`);
  url.searchParams.set(
    "outFields",
    "OBJECTID,KDCPUM,KDPKAB,KDPPUM,NAMOBJ,WADMKC,WADMKK,WADMPR",
  );
  url.searchParams.set("returnGeometry", "true");
  url.searchParams.set("outSR", "4326");
  url.searchParams.set("returnZ", "false");
  url.searchParams.set("returnM", "false");
  url.searchParams.set("maxAllowableOffset", "0.0001");
  url.searchParams.set("geometryPrecision", "6");
  url.searchParams.set("f", "geojson");

  const response = await fetch(url);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`BIG_HTTP_${response.status}: ${text.slice(0, 500)}`);
  }

  const fc = JSON.parse(text);
  if (fc?.type !== "FeatureCollection") {
    throw new Error(`BIG_GEOJSON_TYPE: ${fc?.type ?? "unknown"}`);
  }

  const features = Array.isArray(fc.features) ? fc.features : [];
  if (features.length === 0) {
    throw new Error(`BIG_ZERO_FEATURES: ${districtCode}`);
  }

  const geometry = features[0]?.geometry;
  if (!geometry) {
    throw new Error(`BIG_EMPTY_GEOMETRY: ${districtCode}`);
  }

  if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") {
    throw new Error(`BIG_UNSUPPORTED_GEOMETRY: ${districtCode}:${geometry.type}`);
  }

  const geometryText = JSON.stringify(geometry);
  const geometryHash = await sha256(geometryText);

  const rpc = await supabase.rpc("set_region_geometry", {
    p_region_id: region.id,
    p_geojson: geometryText,
    p_geometry_hash: geometryHash,
  });

  if (!rpc) {
    throw new Error(`RPC_UNDEFINED: ${districtCode}`);
  }

  if (rpc.error) {
    throw new Error(`RPC: ${rpc.error.message}`);
  }

  const updated = Number(rpc.data ?? 0);
  if (updated !== 1) {
    throw new Error(`GEOMETRY_NOT_UPDATED: ${districtCode}:${updated}`);
  }

  return {
    code: districtCode,
    name: region.name,
    updated: 1,
    response_size_mb: Number((text.length / 1024 / 1024).toFixed(2)),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok");
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const rawKeys = Deno.env.get("SUPABASE_SECRET_KEYS");

    if (!supabaseUrl || !rawKeys) {
      throw new Error("Supabase configuration missing");
    }

    const keys = JSON.parse(rawKeys);
    const secretKey = keys?.default;
    if (!secretKey) throw new Error("Default secret key missing");

    const supabase = createClient(supabaseUrl, secretKey);

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const requestedBatch = Number(body.batch_size ?? DEFAULT_BATCH_SIZE);
    const batchSize = Math.min(
      Math.max(Number.isFinite(requestedBatch) ? requestedBatch : DEFAULT_BATCH_SIZE, 1),
      MAX_BATCH_SIZE,
    );

    // Read current progress.
    const progressResult = await supabase
      .from(PROGRESS_TABLE)
      .select("*")
      .eq("job_name", JOB_NAME)
      .maybeSingle();

    if (!progressResult) throw new Error("Progress response undefined");
    if (progressResult.error) {
      throw new Error(`PROGRESS_READ: ${progressResult.error.message}`);
    }

    const progress = progressResult.data;

    // Read all districts once. The table contains only ~7k rows,
    // which is small enough to select without geometry.
    const regionsResult = await supabase
      .from("regions")
      .select("id,code,name,admin_code_pum,parent_region_id")
      .eq("level", "district")
      .eq("source_name", "BIG")
      .order("admin_code_pum", { ascending: true });

    if (!regionsResult) throw new Error("Regions response undefined");
    if (regionsResult.error) {
      throw new Error(`REGIONS_READ: ${regionsResult.error.message}`);
    }

    const districts = Array.isArray(regionsResult.data)
      ? regionsResult.data
      : [];

    if (districts.length === 0) {
      throw new Error("No BIG districts found");
    }

    const lastCode = String(progress?.last_code ?? "");
    const candidates = districts.filter((r: any) => {
      const code = String(r.admin_code_pum ?? r.code ?? "").trim();
      return code && (!lastCode || code > lastCode);
    });

    if (candidates.length === 0) {
      await supabase
        .from(PROGRESS_TABLE)
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("job_name", JOB_NAME);

      return json({
        ok: true,
        stage: "DISTRICT_GEOMETRY_COMPLETE",
        status: "completed",
        processed: progress?.processed ?? 0,
        success_count: progress?.success_count ?? 0,
        failed_count: progress?.failed_count ?? 0,
      });
    }

    const batch = candidates.slice(0, batchSize);
    const groups = chunk(batch, CONCURRENCY);

    const successes: any[] = [];
    const failures: any[] = [];

    // Process up to CONCURRENCY districts in parallel.
    for (const group of groups) {
      const results = await Promise.all(
        group.map(async (region: any) => {
          try {
            return {
              ok: true,
              result: await processOne(supabase, region),
            };
          } catch (error) {
            return {
              ok: false,
              code: String(region.admin_code_pum ?? region.code ?? ""),
              name: region.name,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }),
      );

      for (const item of results) {
        if (item.ok) successes.push(item.result);
        else failures.push(item);
      }
    }

    // Only advance progress through the last contiguous successful code.
    // This prevents skipping a failed district while allowing later parallel
    // requests to complete.
    const successCodes = new Set(successes.map((x) => String(x.code)));
    let contiguousLast = lastCode;
    let contiguousCount = 0;

    for (const region of batch) {
      const code = String(region.admin_code_pum ?? region.code ?? "").trim();
      if (!successCodes.has(code)) break;
      contiguousLast = code;
      contiguousCount++;
    }

    if (contiguousCount > 0) {
      const processed = Number(progress?.processed ?? 0) + contiguousCount;
      const successCount = Number(progress?.success_count ?? 0) + contiguousCount;

      const progressUpdate = await supabase
        .from(PROGRESS_TABLE)
        .update({
          last_code: contiguousLast,
          processed,
          success_count: successCount,
          status: "running",
          last_error: failures.length ? JSON.stringify(failures) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("job_name", JOB_NAME);

      if (!progressUpdate) {
        throw new Error("Progress update response undefined");
      }
      if (progressUpdate.error) {
        throw new Error(`PROGRESS_UPDATE: ${progressUpdate.error.message}`);
      }
    } else if (failures.length > 0) {
      await supabase
        .from(PROGRESS_TABLE)
        .update({
          status: "running",
          last_error: JSON.stringify(failures),
          updated_at: new Date().toISOString(),
        })
        .eq("job_name", JOB_NAME);
    }

    return json({
      ok: failures.length === 0 && contiguousCount === batch.length,
      stage: "DISTRICT_GEOMETRY_BATCH",
      batch_requested: batch.length,
      parallel_width: CONCURRENCY,
      succeeded: successes.length,
      failed: failures.length,
      contiguous_advanced: contiguousCount,
      last_code: contiguousLast || null,
      successes,
      failures,
    });
  } catch (error) {
    return json(
      {
        ok: false,
        stage: "DISTRICT_GEOMETRY_RUNNER_ERROR",
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});
