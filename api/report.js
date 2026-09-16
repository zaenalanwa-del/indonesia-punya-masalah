export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const report = req.body || {};
  return res.status(202).json({ status: 'received', verification_status: 'received', report });
}
