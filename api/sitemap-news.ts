import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_URL = process.env.SITE_URL || 'https://koora.com';
const PER_PAGE = 1000;

async function fetchJson(path: string) {
  try {
    const r = await fetch(path);
    return await r.json();
  } catch (e) {
    return [];
  }
}

function normalizeNews(news: unknown) {
  if (Array.isArray(news)) return news as unknown[];
  if (news && typeof news === 'object' && Array.isArray((news as any).posts)) return (news as any).posts as unknown[];
  return [];
}

function slugFor(n: unknown) {
  if (!n || typeof n !== 'object') return 'article';
  const obj = n as Record<string, unknown>;
  if (typeof obj.slug === 'string') return obj.slug;
  if (typeof obj.slugified === 'string') return obj.slugified;
  if (typeof obj.id === 'number' || typeof obj.id === 'string') return String(obj.id);
  if (typeof obj.title === 'string') return encodeURIComponent(obj.title.toLowerCase().replaceAll(/\s+/g, '-'));
  return 'article';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // page can come from query or route rewrite (vercel.json sets ?page=)
    const pageParam = (req.query && (req.query.page as string)) || '1';
    const page = Math.max(1, parseInt(String(pageParam), 10) || 1);

    const newsRaw = await fetchJson(`${BASE_URL}/api/news`);
    const newsList = normalizeNews(newsRaw);

    const start = (page - 1) * PER_PAGE;
    const slice = (newsList || []).slice(start, start + PER_PAGE);

    const newsUrls = (slice || []).map((n: unknown) => {
      const slug = slugFor(n);
      const obj = n as Record<string, unknown>;
      const lastmod = new Date(obj.updatedAt ?? obj.publishedAt ?? obj.date ?? Date.now()).toISOString();

      const imageUrl = (obj.image || obj.featured_image || obj.thumbnail) as string | undefined;
      const imageTag = imageUrl ? `\n      <image:image>\n        <image:loc>${imageUrl}</image:loc>\n      </image:image>` : '';

      return `\n    <url>\n      <loc>${BASE_URL}/news/${slug}</loc>\n      <lastmod>${lastmod}</lastmod>${imageTag}\n      <changefreq>daily</changefreq>\n      <priority>0.9</priority>\n    </url>`;
    }).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n    ${newsUrls}\n  </urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(sitemap);
  } catch (err) {
    res.status(500).send('');
  }
}
