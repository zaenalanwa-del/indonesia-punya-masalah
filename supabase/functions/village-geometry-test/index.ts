import { createClient } from "npm:@supabase/supabase-js@2";

const BIG_QUERY_URL =
  "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_DESAKEL_AR/MapServer/0/query";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const rawKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
    if (!supabaseUrl) throw new Error("SUPABASE_URL_MISSING");
    if (!rawKeys) throw new Error("SUPABASE_SECRET_KEYS_MISSING");

    let keys: any;
    try { keys = JSON.parse(rawKeys); }
    catch (e) { throw new Error(`SUPABASE_SECRET_KEYS_INVALID:${e instanceof Error ? e.message : String(e)}`); }

    const secretKey = keys?.default;
    if (!secretKey) throw new Error("DEFAULT_SECRET_KEY_MISSING");

    const supabase = createClient(supabaseUrl, secretKey);

    const dbResult = await supabase
      .from("regions")
      .select("id,code,name,admin_code_pum")
      .eq("level", "village")
      .eq("source_name", "BIG")
      .order("admin_code_pum", { ascending: true })
      .limit(1);

    if (dbResult == null) throw new Error("REGIONS_RESULT_NULL");
    if (dbResult.error != null) {
      throw new Error(`REGIONS_ERROR:${dbResult.error.message}`);
    }

    const village = Array.isArray(dbResult.data) ? dbResult.data[0] : null;
    if (!village) throw new Error("NO_VILLAGE_FOUND");

    const code = String(village.admin_code_pum ?? village.code ?? "").trim();
    if (!code) throw new Error("VILLAGE_CODE_EMPTY");

    const url = new URL(BIG_QUERY_URL);
    url.searchParams.set("where", `KDEPUM = '${code}'`);
    url.searchParams.set("outFields", "OBJECTID,KDEPUM,KDCPUM,KDPKAB,KDPPUM,NAMOBJ,WADMKD,WADMKC,WADMKK,WADMPR");
    url.searchParams.set("returnGeometry", "true");
    url.searchParams.set("outSR", "4326");
    url.searchParams.set("returnZ", "false");
    url.searchParams.set("returnM", "false");
    url.searchParams.set("maxAllowableOffset", "0.0001");
    url.searchParams.set("geometryPrecision", "6");
    url.searchParams.set("resultRecordCount", "10");
    url.searchParams.set("f", "geojson");

    const response = await fetch(url);
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`BIG_HTTP_${response.status}:${text.slice(0, 800)}`);
    }

    let fc: any;
    try { fc = JSON.parse(text); }
    catch (e) { throw new Error(`BIG_JSON_INVALID:${e instanceof Error ? e.message : String(e)}`); }

    const features = Array.isArray(fc?.features) ? fc.features : [];
    const geometryType = features[0]?.geometry?.type ?? null;

    return json({
      ok: true,
      stage: "VILLAGE_GEOMETRY_DIAGNOSTIC",
      database: { ok: true, village_code: code, village_name: village.name },
      big: {
        ok: true,
        feature_count: features.length,
        geometry_type: geometryType,
        response_size_mb: Number((text.length / 1024 / 1024).toFixed(2)),
      },
      next: "If this returns ok=true, the main runner can be deployed safely.",
    });
  } catch (error) {
    return json({
      ok: false,
      stage: "VILLAGE_GEOMETRY_DIAGNOSTIC_ERROR",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, 500);
  }
});
