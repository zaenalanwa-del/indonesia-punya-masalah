const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gfggmkeucgqkkyvummpu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

const allowed = new Set(['regions','problems','early_signals','forecasts','solutions','citizen_reports','data_sources']);

async function getTable(table, query='select=*') {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = []; }
  if (!r.ok) throw new Error(`${table}: ${r.status}`);
  return Array.isArray(data) ? data : [];
}

async function getRegionCounts() {
  const levels = ['country','province','regency','district','village'];
  const entries = await Promise.all(levels.map(async level => {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/regions?select=id&is_active=eq.true&level=eq.${encodeURIComponent(level)}&limit=1`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'count=exact'
      }
    });
    if (!r.ok) throw new Error(`regions:${level}: ${r.status}`);
    const range = r.headers.get('content-range') || '';
    const total = range.includes('/') ? Number(range.split('/').pop()) : null;
    return [level, Number.isFinite(total) ? total : 0];
  }));
  return Object.fromEntries(entries);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!SUPABASE_KEY) return res.status(500).json({ error: 'Supabase is not configured' });

  const requested = String(req.query.tables || 'regions,problems,early_signals,forecasts,solutions,citizen_reports').split(',').map(x=>x.trim()).filter(x=>allowed.has(x));
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const result = { generated_at: new Date().toISOString(), source: 'Supabase', tables: {} };

  try {
    const [regionCounts] = await Promise.all([getRegionCounts()]);
    result.region_counts = regionCounts;

    await Promise.all(requested.map(async table => {
      let q = `select=*&limit=${limit}`;
      if (table === 'regions') q = `select=id,code,parent_code,name,level,latitude,longitude,region_type,official_name,boundary_status,last_synced_at,sync_status&is_active=eq.true&limit=${limit}`;
      if (table === 'citizen_reports') q = `select=id,region_id,title,description,category,severity,reported_at,latitude,longitude,media_urls,verification_status,verification_score,source_type,created_at&verification_status=eq.verified&order=reported_at.desc&limit=${limit}`;
      if (table === 'problems') q = `select=id,region_id,title,description,category,subcategory,severity,status,first_detected_at,last_detected_at,trend_direction,confidence_score,impact_score,urgency_score,affected_population_estimate&order=updated_at.desc&limit=${limit}`;
      if (table === 'early_signals') q = `select=id,region_id,problem_id,title,description,signal_type,detected_at,trend_direction,change_percent,signal_strength,confidence_score,status,supporting_evidence_count&order=detected_at.desc&limit=${limit}`;
      if (table === 'forecasts') q = `select=id,region_id,topic,horizon_days,forecast_date,scenario_name,probability,confidence_score,model_name,model_version,summary,key_factors,uncertainty_factors,status&order=forecast_date.desc&limit=${limit}`;
      if (table === 'solutions') q = `select=id,problem_id,title,description,solution_type,estimated_cost,expected_impact,expected_risk,feasibility_score,status,assumptions,expected_outcomes&order=updated_at.desc&limit=${limit}`;
      if (table === 'data_sources') q = `select=id,name,publisher,source_type,base_url,api_url,access_type,license,update_frequency,attribution_required,reliability_score,freshness_score,quality_score,status&order=name.asc&limit=${limit}`;
      result.tables[table] = await getTable(table,q);
    }));
    result.counts = Object.fromEntries(Object.entries(result.tables).map(([k,v])=>[k,v.length]));
    result.data_status = {
      geography: 'authoritative_database',
      published_problems: result.tables.problems ? result.tables.problems.length : 0,
      verified_citizen_reports: result.tables.citizen_reports ? result.tables.citizen_reports.length : 0,
      intelligence_signals: result.tables.early_signals ? result.tables.early_signals.length : 0,
      forecasts: result.tables.forecasts ? result.tables.forecasts.length : 0,
      solutions: result.tables.solutions ? result.tables.solutions.length : 0
    };
    return res.status(200).json(result);
  } catch (error) {
    console.error('portal-data failed', error);
    return res.status(502).json({ error: 'Data portal gagal mengambil data produksi', message: error.message });
  }
}
