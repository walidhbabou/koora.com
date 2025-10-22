import type { VercelRequest, VercelResponse } from '@vercel/node';

const WP_API = process.env.WP_API_URL || 'https://koora.com/wp-json/wp/v2/posts?_embed&per_page=100';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const page = req.query.page ? `&page=${encodeURIComponent(String(req.query.page))}` : '';
    const url = WP_API + page;
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) {
      res.status(r.status).json([]);
      return;
    }
    const json = await r.json();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json([]);
  }
}
