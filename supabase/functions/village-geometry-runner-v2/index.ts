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
    headers: { "Content-Type": "application/json" },
  });
}

function getServiceKey() {
  const direct = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (direct) return direct;

  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!raw) throw new Error("SUPABASE_SECRET_KEYS missing");

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("SUPABASE_SECRET_KEYS_INVALID_JSON");
  }

  const key = parsed?.default;
  if (!key) throw new Error("Default service key missing");
  return key;
}

async function supabaseFetch(
  baseUrl: string,
  serviceKey: string,
  path: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("apikey", serviceKey);
  headers.set("Authorization", `Bearer ${serviceKey}`);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`SUPABASE_HTTP_${response.status}:${text.slice(0, 800)}`);
  }

  return text;
}

async function sha256(text: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function polygonParts(geometry: any): number[][][][] {
  if (geometry?.type === "Polygon") return [geometry.coordinates];
  if (geometry?.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

function mergeGeometry(features: any[], code: string) {
  const parts: number[][][][] = [];
  for (const feature of features) parts.push(...polygonParts(feature?.geometry));
  if (!parts.length) throw new Error(`BIG_NO_POLYGON_GEOMETRY:${code}`);
  return parts.length === 1
    ? { type: "Polygon", coordinates: parts[0] }
    : { type: "MultiPolygon", coordinates: parts };
}

async function processOne(baseUrl: string, serviceKey: string, region: any) {
  const code = String(region?.admin_code_pum ?? region?.code ?? "").trim();
  if (!code) throw new Error("EMPTY_VILLAGE_CODE");

  const url = new URL(BIG_QUERY_URL);
  url.searchParams.set("where", `KDEPUM = '${code}'`);
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

  const bigResponse = await fetch(url);
  const bigText = await bigResponse.text();
  if (!bigResponse.ok) {
    throw new Error(`BIG_HTTP_${bigResponse.status}:${bigText.slice(0, 800)}`);
  }

  let fc: any;
  try {
    fc = JSON.parse(bigText);
  } catch {
    throw new Error(`BIG_INVALID_JSON:${code}`);
  }

  if (fc?.type !== "FeatureCollection") {
    throw new Error(`BIG_GEOJSON_TYPE:${fc?.type ?? "unknown"}`);
  }

  const features = Array.isArray(fc.features) ? fc.features : [];
  if (!features.length) throw new Error(`BIG_ZERO_FEATURES:${code}`);

  const geometry = mergeGeometry(features, code);
  const geometryText = JSON.stringify(geometry);
  const geometryHash = await sha256(geometryText);

  const rpcText = await supabaseFetch(
    baseUrl,
    serviceKey,
    "/rest/v1/rpc/set_region_geometry",
    {
      method: "POST",
      body: JSON.stringify({
        p_region_id: region.id,
        p_geojson: geometryText,
        p_geometry_hash: geometryHash,
      }),
    },
  );

  let rpcData: any;
  try {
    rpcData = JSON.parse(rpcText);
  } catch {
    rpcData = rpcText;
  }

  const updated = Number(rpcData ?? 0);
  if (updated !== 1) throw new Error(`GEOMETRY_NOT_UPDATED:${code}:${updated}`);

  return {
    code,
    name: region.name,
    updated: 1,
    feature_count: features.length,
    response_size_mb: Number((bigText.length / 1024 / 1024).toFixed(2)),
  };
}

async function loadPage(baseUrl: string, serviceKey: string, lastCode: string) {
  const params = new URLSearchParams();
  params.set("select", "id,code,name,admin_code_pum,parent_region_id");
  params.set("level", "eq.village");
  params.set("source_name", "eq.BIG");
  params.set("order", "admin_code_pum.asc");
  params.set("limit", String(PAGE_SIZE));
  if (lastCode) params.set("admin_code_pum", `gt.${lastCode}`);

  const text = await supabaseFetch(
    baseUrl,
    serviceKey,
    `/rest/v1/regions?${params.toString()}`,
  );

  let rows: any;
  try {
    rows = JSON.parse(text);
  } catch {
    throw new Error("REGIONS_INVALID_JSON");
  }

  if (!Array.isArray(rows)) throw new Error("REGIONS_NOT_ARRAY");
  return rows;
}

async function readProgress(baseUrl: string, serviceKey: string) {
  const params = new URLSearchParams();
  params.set("select", "*");
  params.set("job_name", `eq.${JOB_NAME}`);
  params.set("limit", "1");

  const text = await supabaseFetch(
    baseUrl,
    serviceKey,
    `/rest/v1/${PROGRESS_TABLE}?${params.toString()}`,
  );

  const rows = JSON.parse(text);
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function updateProgress(
  baseUrl: string,
  serviceKey: string,
  patch: Record<string, unknown>,
) {
  const params = new URLSearchParams();
  params.set("job_name", `eq.${JOB_NAME}`);

  await supabaseFetch(
    baseUrl,
    serviceKey,
    `/rest/v1/${PROGRESS_TABLE}?${params.toString()}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok");

  try {
    const baseUrl = Deno.env.get("SUPABASE_URL");
    if (!baseUrl) throw new Error("SUPABASE_URL missing");

    const serviceKey = getServiceKey();
    let progress = await readProgress(baseUrl, serviceKey);

    if (!progress) {
      await supabaseFetch(
        baseUrl,
        serviceKey,
        "/rest/v1/region_geometry_progress_village",
        {
          method: "POST",
          headers: { Prefer: "resolution=ignore-duplicates" },
          body: JSON.stringify({
            job_name: JOB_NAME,
            last_code: "",
            processed: 0,
            success_count: 0,
            failed_count: 0,
            status: "running",
          }),
        },
      );
      progress = await readProgress(baseUrl, serviceKey);
    }

    if (!progress) throw new Error("PROGRESS_ROW_UNAVAILABLE");

    if (progress.status === "completed") {
      return json({ ok: true, stage: "VILLAGE_GEOMETRY_COMPLETE", ...progress });
    }

    const lastCode = String(progress.last_code ?? "");
    const villages = await loadPage(baseUrl, serviceKey, lastCode);

    if (!villages.length) {
      await updateProgress(baseUrl, serviceKey, {
        status: "completed",
        updated_at: new Date().toISOString(),
      });
      return json({
        ok: true,
        stage: "VILLAGE_GEOMETRY_COMPLETE",
        status: "completed",
        processed: progress.processed ?? 0,
        success_count: progress.success_count ?? 0,
        failed_count: progress.failed_count ?? 0,
      });
    }

    const successes: any[] = [];
    const failures: any[] = [];

    for (let i = 0; i < villages.length; i += CONCURRENCY) {
      const group = villages.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        group.map(async (region: any) => {
          try {
            return { ok: true, result: await processOne(baseUrl, serviceKey, region) };
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

      for (const result of results) {
        if (result.ok) successes.push(result.result);
        else failures.push(result);
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

    if (contiguousCount > 0) {
      const nextProcessed = Number(progress.processed ?? 0) + contiguousCount;
      const nextSuccess = Number(progress.success_count ?? 0) + contiguousCount;
      await updateProgress(baseUrl, serviceKey, {
        last_code: contiguousLast,
        processed: nextProcessed,
        success_count: nextSuccess,
        status: "running",
        last_error: failures.length ? JSON.stringify(failures) : null,
        updated_at: new Date().toISOString(),
      });
    } else if (failures.length) {
      await updateProgress(baseUrl, serviceKey, {
        status: "running",
        last_error: JSON.stringify(failures),
        updated_at: new Date().toISOString(),
      });
    }

    return json({
      ok: failures.length === 0 && contiguousCount === villages.length,
      stage: "VILLAGE_GEOMETRY_BATCH_V2",
      page_requested: villages.length,
      parallel_width: CONCURRENCY,
      succeeded: successes.length,
      failed: failures.length,
      contiguous_advanced: contiguousCount,
      processed_total: Number(progress.processed ?? 0) + contiguousCount,
      last_code: contiguousLast || null,
      successes,
      failures,
    });
  } catch (error) {
    return json({
      ok: false,
      stage: "VILLAGE_GEOMETRY_RUNNER_V2_ERROR",
      error: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});
