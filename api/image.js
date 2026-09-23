export default async function handler(req, res) {
  try {
    const requestUrl = new URL(req.url || '/', `https://${req.headers?.host || 'indonesia-punya-masalah.vercel.app'}`);
    const src = requestUrl.searchParams.get('src');
    if (!src) return res.status(400).send('Missing src');

    const target = new URL(String(src));
    const allowedHosts = new Set(['commons.wikimedia.org', 'upload.wikimedia.org']);
    if (!allowedHosts.has(target.hostname)) return res.status(403).send('Image source not allowed');

    const upstream = await fetch(target.toString(), {
      headers: {
        'User-Agent': 'NuansaKita/1.0 (+https://indonesia-punya-masalah.vercel.app/)'
      },
      redirect: 'follow'
    });

    if (!upstream.ok) return res.status(upstream.status).send('Image fetch failed');

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) return res.status(415).send('Not an image');

    const body = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('X-Content-Source', target.hostname);
    return res.status(200).send(body);
  } catch (e) {
    return res.status(500).send('Image proxy error');
  }
}
