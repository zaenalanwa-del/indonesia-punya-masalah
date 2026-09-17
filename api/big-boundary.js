const BIG_LAYER = 'https://geoservices.big.go.id/gis/rest/services/DISIGT/BatasWilayah/MapServer/0/query';
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const name = String(req.query.name || '').trim();
  if (name && !/^[\p{L}\p{N} .,'()\/-]{1,120}$/u.test(name)) return res.status(400).json({ error: 'Invalid region name' });
  const params = new URLSearchParams({ where: name ? `NAMOBJ='${name.replace(/'/g, "''")}'` : '1=1', outFields: 'NAMOBJ,FCODE,REMARK', returnGeometry: 'true', outSR: '4326', f: 'geojson', resultRecordCount: '50' });
  try {
    const r = await fetch(`${BIG_LAYER}?${params}`);
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'BIG geoservice unavailable', upstream_status: r.status });
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ source: 'BIG', attribution: 'Badan Informasi Geospasial', generated_at: new Date().toISOString(), data });
  } catch (error) {
    return res.status(502).json({ error: 'BIG geoservice unavailable' });
  }
}
