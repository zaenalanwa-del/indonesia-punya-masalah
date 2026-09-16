export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const report = req.body || {};
  const title = String(report.title || report.reportTitle || '').trim();
  const narrative = String(report.narrative || report.description || report.content || '').trim();
  if (!title) return res.status(400).json({ error: 'title is required' });
  if (!narrative) return res.status(400).json({ error: 'narrative is required' });
  return res.status(202).json({
    status: 'received',
    verification_status: 'received',
    persistence: 'pending_production_storage',
    message: 'Laporan diterima untuk antrean review. Penyimpanan permanen produksi belum aktif.',
    report: { ...report, title, narrative }
  });
}
