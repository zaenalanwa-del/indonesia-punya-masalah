const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!SUPABASE_URL || !SUPABASE_KEY) return res.status(500).json({ error: 'Supabase is not configured' });
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/data_sources?select=id,name,publisher,source_type,base_url,api_url,access_type,license,update_frequency,attribution_required,reliability_score,freshness_score,quality_score,status&status=eq.active&order=name.asc`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'Source catalog unavailable' });
    return res.status(200).json({ generated_at: new Date().toISOString(), source: 'Supabase', sources: Array.isArray(data) ? data : [] });
  } catch (error) {
    return res.status(502).json({ error: 'Source catalog unavailable' });
  }
}
