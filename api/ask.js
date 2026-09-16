import { answerQuestion } from '../backend/orchestrator.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const question = req.method === 'POST' ? (req.body?.question || '') : (req.query?.question || '');
    if (!question.trim()) return res.status(400).json({ error: 'question is required' });
    const result = await answerQuestion(question);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Intelligence service error', detail: error.message });
  }
}
