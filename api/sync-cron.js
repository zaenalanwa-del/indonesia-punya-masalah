import syncHandler from './sync.js';

export default async function handler(req, res) {
  req.query = { ...(req.query || {}), connector: 'bnpb_catalog,big_boundaries' };
  return syncHandler(req, res);
}
