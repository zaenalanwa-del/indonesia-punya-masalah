export default function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.status(200).json({ status: 'demo', answer: 'Mode demo: sumber data produksi belum diaktifkan.', confidence: 0, sources: [] });
}
