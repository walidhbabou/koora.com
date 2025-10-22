import type { VercelRequest, VercelResponse } from '@vercel/node';

const WP_API = process.env.WP_API_URL || 'https://koora.com/wp-json/wp/v2/posts?_embed&per_page=100';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const page = req.query.page ? `&page=${encodeURIComponent(String(req.query.page))}` : '';
  const url = WP_API + page;

  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    const text = await r.text();
    if (!r.ok) {
      console.error('[api/news] upstream WP API error', { url, status: r.status, statusText: r.statusText, bodySnippet: text.slice(0, 500) });
      res.setHeader('Content-Type', 'application/json');
      res.status(502).json({ error: 'Upstream WP API error', status: r.status, statusText: r.statusText, body: text.slice(0, 2000) });
      return;
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (parseErr) {
      console.error('[api/news] failed to parse JSON from WP API', { url, parseErr: String(parseErr), textSnippet: text.slice(0, 500) });
      res.setHeader('Content-Type', 'application/json');
      res.status(502).json({ error: 'Invalid JSON from upstream WP API', message: String(parseErr) });
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(json);
  } catch (err) {
    console.error('[api/news] unexpected error', err);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Internal server error', message: String(err) });
  }

}
