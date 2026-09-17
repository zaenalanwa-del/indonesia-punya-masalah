const BMKG = 'https://api.bmkg.go.id/publik';
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const adm4 = String(req.query.adm4 || '').trim();
  if (!/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(adm4)) return res.status(400).json({ error: 'adm4 must be an Indonesian level-IV administrative code' });
  try {
    const r = await fetch(`${BMKG}/prakiraan-cuaca?adm4=${encodeURIComponent(adm4)}`, { headers: { Accept: 'application/json' } });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'BMKG unavailable', upstream_status: r.status });
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    return res.status(200).json({ source: 'BMKG', attribution: 'Badan Meteorologi, Klimatologi, dan Geofisika', generated_at: new Date().toISOString(), data });
  } catch (error) {
    return res.status(502).json({ error: 'BMKG unavailable' });
  }
}
