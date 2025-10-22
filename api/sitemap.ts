import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_URL = process.env.SITE_URL || 'https://koora.com';
const NEWS_PER_PAGE = 1000;

async function fetchJson(path: string) {
  try {
    const res = await fetch(path);
    return await res.json();
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
    const [matches, leagues, teams, newsRaw] = await Promise.all([
      fetchJson(`${BASE_URL}/api/matches`),
      fetchJson(`${BASE_URL}/api/leagues`),
      fetchJson(`${BASE_URL}/api/teams`),
      fetchJson(`${BASE_URL}/api/news`),
    ]);

    const newsList = normalizeNews(newsRaw);

    // If too many news, return sitemap index referencing paginated news sitemaps
    if ((newsList || []).length > NEWS_PER_PAGE) {
      const pages = Math.ceil(newsList.length / NEWS_PER_PAGE);
      const sitemapIndexEntries = Array.from({ length: pages }).map((_, i) => `\n    <sitemap>\n      <loc>${BASE_URL}/sitemap-news-${i + 1}.xml</loc>\n      <lastmod>${new Date().toISOString()}</lastmod>\n    </sitemap>`).join('');

      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n    ${sitemapIndexEntries}\n  </sitemapindex>`;

      res.setHeader('Content-Type', 'text/xml');
      res.status(200).send(sitemapIndex);
      return;
    }

    const matchUrls = (matches || []).map((m: unknown) => {
      const obj = m as Record<string, unknown>;
      const id = obj.id ?? '';
            const updatedAtRaw = (obj.updatedAt ?? (typeof (obj as any)['updated_at'] !== 'undefined' ? (obj as any)['updated_at'] : undefined)) ?? Date.now();
      const updatedAtNum = Number(String(updatedAtRaw)) || Date.now();
      return `\n    <url>\n      <loc>${BASE_URL}/match/${id}</loc>\n      <lastmod>${new Date(updatedAtNum).toISOString()}</lastmod>\n      <changefreq>hourly</changefreq>\n      <priority>0.9</priority>\n    </url>`;
    }).join('');

    const leagueUrls = (leagues || []).map((l: unknown) => {
      const obj = l as Record<string, unknown>;
      const slugOrId = (typeof obj.slug === 'string' && obj.slug) || obj.id || '';
      return `\n    <url>\n      <loc>${BASE_URL}/league/${slugOrId}</loc>\n      <changefreq>daily</changefreq>\n      <priority>0.8</priority>\n    </url>`;
    }).join('');

    const teamUrls = (teams || []).map((t: unknown) => {
      const obj = t as Record<string, unknown>;
      const slugOrId = (typeof obj.slug === 'string' && obj.slug) || obj.id || '';
      return `\n    <url>\n      <loc>${BASE_URL}/team/${slugOrId}</loc>\n      <changefreq>weekly</changefreq>\n      <priority>0.7</priority>\n    </url>`;
    }).join('');

    const newsUrls = (newsList || []).map((n: unknown) => {
      const slug = slugFor(n);
      const obj = n as Record<string, unknown>;
      const lastmodRaw = (obj.updatedAt ?? obj.publishedAt ?? obj.date) ?? Date.now();
      const lastmodNum = Number(String(lastmodRaw)) || Date.now();
      const lastmod = new Date(lastmodNum).toISOString();
      return `\n    <url>\n      <loc>${BASE_URL}/news/${slug}</loc>\n      <lastmod>${lastmod}</lastmod>\n      <changefreq>daily</changefreq>\n      <priority>0.9</priority>\n    </url>`;
    }).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n    ${newsUrls}\n    ${leagueUrls}\n    ${teamUrls}\n    ${matchUrls}\n  </urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(sitemap);
  } catch (err) {
    res.status(500).send('');
  }
}
