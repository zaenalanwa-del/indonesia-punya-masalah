const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gfggmkeucgqkkyvummpu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

const clean = (v, max = 5000) => v == null ? null : String(v).trim().slice(0, max) || null;
const numberOrNull = v => { if (v === '' || v == null) return null; const n = Number(v); return Number.isFinite(n) ? n : null; };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!SUPABASE_KEY) return res.status(500).json({ error: 'Supabase is not configured' });
  const body = req.body || {};
  const title = clean(body.title || body.reportTitle, 240);
  const description = clean(body.description || body.narrative || body.content, 10000);
  if (!title) return res.status(400).json({ error: 'title is required' });
  if (!description) return res.status(400).json({ error: 'description is required' });

  const reportedAt = body.reported_at || body.occurred_at || new Date().toISOString();
  const payload = {
    title,
    description,
    category: clean(body.category, 100),
    severity: clean(body.severity, 50),
    reported_at: reportedAt,
    latitude: numberOrNull(body.latitude),
    longitude: numberOrNull(body.longitude),
    media_urls: Array.isArray(body.media_urls) ? body.media_urls.slice(0, 10) : [],
    source_type: 'citizen',
    verification_status: 'unverified',
    metadata: {
      client_source: 'public_portal',
      client_version: '2026.09',
      ...(body.metadata && typeof body.metadata === 'object' ? body.metadata : {})
    }
  };
  if (body.region_id) payload.region_id = clean(body.region_id, 80);

  const r = await fetch(`${SUPABASE_URL}/rest/v1/citizen_reports`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(payload)
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!r.ok) {
    console.error('citizen_reports insert failed', r.status, data);
    return res.status(502).json({ error: 'Laporan gagal disimpan ke database', details: data?.message || data?.hint || undefined });
  }
  const saved = Array.isArray(data) ? data[0] : data;
  return res.status(201).json({ status: 'received', persistence: 'supabase', verification_status: saved?.verification_status || 'unverified', report_id: saved?.id || null, message: 'Laporan berhasil diterima dan masuk antrean verifikasi.' });
}
