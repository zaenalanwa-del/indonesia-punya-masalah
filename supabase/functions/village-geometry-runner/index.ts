import { createClient } from "npm:@supabase/supabase-js@2";

const BIG_QUERY_URL =
  "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_DESAKEL_AR/MapServer/0/query";

const PROGRESS_TABLE = "region_geometry_progress_village";
const JOB_NAME = "village-geometry";
const PAGE_SIZE = 100;
const CONCURRENCY = 10;
const MAX_FEATURES_PER_VILLAGE = 200;

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

function responseError(result: any, context: string): string | null {
  if (!result) return `${context}:EMPTY_RESPONSE`;
  if (result.error) return `${context}:${result.error.message}`;
  return null;
}

async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function polygonParts(geometry: any): number[][][][] {
  if (geometry?.type === "Polygon") return [geometry.coordinates];
  if (geometry?.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

function mergePolygonGeometries(features: any[], villageCode: string) {
  const parts: number[][][][] = [];
  for (const feature of features) parts.push(...polygonParts(feature?.geometry));
  if (parts.length === 0) throw new Error(`BIG_NO_POLYGON_GEOMETRY:${villageCode}`);
  return parts.length === 1
    ? { type: "Polygon", coordinates: parts[0] }
    : { type: "MultiPolygon", coordinates: parts };
}

async function processOne(supabase: ReturnType<typeof createClient>, region: any) {
  const villageCode = String(region.admin_code_pum ?? region.code ?? "").trim();
  if (!villageCode) throw new Error("EMPTY_VILLAGE_CODE");

  const url = new URL(BIG_QUERY_URL);
  url.searchParams.set("where", `KDEPUM = '${villageCode}'`);
  url.searchParams.set(
    "outFields",
    "OBJECTID,KDEPUM,KDCPUM,KDPKAB,KDPPUM,NAMOBJ,WADMKD,WADMKC,WADMKK,WADMPR",
  );
  url.searchParams.set("returnGeometry", "true");
  url.searchParams.set("outSR", "4326");
  url.searchParams.set("returnZ", "false");
  url.searchParams.set("returnM", "false");
  url.searchParams.set("maxAllowableOffset", "0.0001");
  url.searchParams.set("geometryPrecision", "6");
  url.searchParams.set("resultRecordCount", String(MAX_FEATURES_PER_VILLAGE));
  url.searchParams.set("f", "geojson");

  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) throw new Error(`BIG_HTTP_${response.status}:${text.slice(0, 500)}`);

  let fc: any;
  try {
    fc = JSON.parse(text);
  } catch {
    throw new Error(`BIG_INVALID_JSON:${villageCode}`);
  }

  if (fc?.type !== "FeatureCollection") {
    throw new Error(`BIG_GEOJSON_TYPE:${fc?.type ?? "unknown"}`);
  }

  const features = Array.isArray(fc.features) ? fc.features : [];
  if (features.length === 0) throw new Error(`BIG_ZERO_FEATURES:${villageCode}`);

  const geometry = mergePolygonGeometries(features, villageCode);
  const geometryText = JSON.stringify(geometry);
  const geometryHash = await sha256(geometryText);

  const rpc = await supabase.rpc("set_region_geometry", {
    p_region_id: region.id,
    p_geojson: geometryText,
    p_geometry_hash: geometryHash,
  });

  const rpcError = responseError(rpc, `RPC:${villageCode}`);
  if (rpcError) throw new Error(rpcError);

  const updated = Number(rpc?.data ?? 0);
  if (updated !== 1) throw new Error(`GEOMETRY_NOT_UPDATED:${villageCode}:${updated}`);

  return {
    code: villageCode,
    name: region.name,
    updated: 1,
    feature_count: features.length,
    response_size_mb: Number((text.length / 1024 / 1024).toFixed(2)),
  };
}

async function loadVillagePage(supabase: ReturnType<typeof createClient>, lastCode: string) {
  let query = supabase
    .from("regions")
    .select("id,code,name,admin_code_pum,parent_region_id")
    .eq("level", "village")
    .eq("source_name", "BIG")
    .order("admin_code_pum", { ascending: true })
    .limit(PAGE_SIZE);

  if (lastCode) query = query.gt("admin_code_pum", lastCode);

  const result = await query;
  const resultError = responseError(result, "REGIONS_READ");
  if (resultError) throw new Error(resultError);
  return Array.isArray(result?.data) ? result.data : [];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const rawKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
    if (!supabaseUrl || !rawKeys) throw new Error("Supabase configuration missing");

    let keys: any;
    try {
      keys = JSON.parse(rawKeys);
    } catch {
      throw new Error("SUPABASE_SECRET_KEYS_INVALID_JSON");
    }

    const secretKey = keys?.default;
    if (!secretKey) throw new Error("Default secret key missing");
    const supabase = createClient(supabaseUrl, secretKey);

    const progressResult = await supabase
      .from(PROGRESS_TABLE)
      .select("*")
      .eq("job_name", JOB_NAME)
      .maybeSingle();

    const progressError = responseError(progressResult, "PROGRESS_READ");
    if (progressError) throw new Error(progressError);

    let progress: any = progressResult?.data ?? null;
    if (!progress) {
      const seed = await supabase
        .from(PROGRESS_TABLE)
        .upsert({
          job_name: JOB_NAME,
          last_code: "",
          processed: 0,
          success_count: 0,
          failed_count: 0,
          status: "running",
          last_error: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "job_name" });

      const seedError = responseError(seed, "PROGRESS_SEED");
      if (seedError) throw new Error(seedError);

      progress = {
        job_name: JOB_NAME,
        last_code: "",
        processed: 0,
        success_count: 0,
        failed_count: 0,
        status: "running",
      };
    }

    if (progress?.status === "completed") {
      return json({ ok: true, stage: "VILLAGE_GEOMETRY_COMPLETE", ...progress });
    }

    const lastCode = String(progress?.last_code ?? "");
    const villages = await loadVillagePage(supabase, lastCode);

    if (villages.length === 0) {
      const done = await supabase
        .from(PROGRESS_TABLE)
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("job_name", JOB_NAME);
      const doneError = responseError(done, "PROGRESS_COMPLETE");
      if (doneError) throw new Error(doneError);

      return json({
        ok: true,
        stage: "VILLAGE_GEOMETRY_COMPLETE",
        status: "completed",
        processed: progress?.processed ?? 0,
        success_count: progress?.success_count ?? 0,
        failed_count: progress?.failed_count ?? 0,
      });
    }

    const successes: any[] = [];
    const failures: any[] = [];

    for (let i = 0; i < villages.length; i += CONCURRENCY) {
      const group = villages.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        group.map(async (region: any) => {
          try {
            return { ok: true, result: await processOne(supabase, region) };
          } catch (error) {
            return {
              ok: false,
              code: String(region?.admin_code_pum ?? region?.code ?? ""),
              name: region?.name,
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

    const successCodes = new Set(successes.map((x) => String(x.code)));
    let contiguousLast = lastCode;
    let contiguousCount = 0;

    for (const region of villages) {
      const code = String(region?.admin_code_pum ?? region?.code ?? "").trim();
      if (!successCodes.has(code)) break;
      contiguousLast = code;
      contiguousCount++;
    }

    const nextProcessed = Number(progress?.processed ?? 0) + contiguousCount;
    const nextSuccessCount = Number(progress?.success_count ?? 0) + contiguousCount;

    if (contiguousCount > 0) {
      const updated = await supabase
        .from(PROGRESS_TABLE)
        .update({
          last_code: contiguousLast,
          processed: nextProcessed,
          success_count: nextSuccessCount,
          status: "running",
          last_error: failures.length ? JSON.stringify(failures) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("job_name", JOB_NAME);

      const updateError = responseError(updated, "PROGRESS_UPDATE");
      if (updateError) throw new Error(updateError);
    } else if (failures.length) {
      const updated = await supabase
        .from(PROGRESS_TABLE)
        .update({
          status: "running",
          last_error: JSON.stringify(failures),
          updated_at: new Date().toISOString(),
        })
        .eq("job_name", JOB_NAME);

      const updateError = responseError(updated, "PROGRESS_FAILURE");
      if (updateError) throw new Error(updateError);
    }

    return json({
      ok: failures.length === 0 && contiguousCount === villages.length,
      stage: "VILLAGE_GEOMETRY_BATCH",
      page_requested: villages.length,
      parallel_width: CONCURRENCY,
      succeeded: successes.length,
      failed: failures.length,
      contiguous_advanced: contiguousCount,
      processed_total: nextProcessed,
      last_code: contiguousLast || null,
      successes,
      failures,
    });
  } catch (error) {
    return json({
      ok: false,
      stage: "VILLAGE_GEOMETRY_RUNNER_ERROR",
      error: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});
