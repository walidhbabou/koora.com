// pages/sitemap.xml.js

export async function getServerSideProps({ res }) {
  const baseUrl = process.env.SITE_URL || (typeof process !== 'undefined' && process.env && process.env.SITE_URL) || "https://koora.com";

  // 👇 عدّل الروابط أدناه حسب API موقعك
  const [matches, leagues, teams, news] = await Promise.all([
    fetch(`${baseUrl}/api/matches`).then((r) => r.json()).catch(() => []),
    fetch(`${baseUrl}/api/leagues`).then((r) => r.json()).catch(() => []),
    fetch(`${baseUrl}/api/teams`).then((r) => r.json()).catch(() => []),
    // Fetch latest news/posts to include in sitemap for better indexing
    fetch(`${baseUrl}/api/news`).then((r) => r.json()).catch(() => []),
  ]);

  // Normalise les news (certaines APIs retournent { posts: [] } ou [] directement)
  let newsList = [];
  if (Array.isArray(news)) {
    newsList = news;
  } else if (news && Array.isArray(news.posts)) {
    newsList = news.posts;
  }

  // 🏟️ روابط المباريات
  const matchUrls = matches
    .map(
      (m) => `
    <url>
      <loc>${baseUrl}/match/${m.id}</loc>
      <lastmod>${new Date(m.updatedAt || Date.now()).toISOString()}</lastmod>
      <changefreq>hourly</changefreq>
      <priority>0.9</priority>
    </url>`
    )
    .join("");

  // 🏆 روابط البطولات
  const leagueUrls = leagues
    .map(
      (l) => `
    <url>
      <loc>${baseUrl}/league/${l.slug || l.id}</loc>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>`
    )
    .join("");

  // 👕 روابط الفرق
  const teamUrls = teams
    .map(
      (t) => `
    <url>
      <loc>${baseUrl}/team/${t.slug || t.id}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`
    )
    .join("");

  // 📰 روابط المقالات/الأخبار
  const newsUrls = (newsList || [])
    .map((n) => {
      // Support common fields: slug, id, or fallback to title-based slug
  const slug = n.slug || n.slugified || n.id || (n.title ? encodeURIComponent(String(n.title).toLowerCase().replaceAll(/\s+/g, '-')) : 'article');
      const lastmod = new Date(n.updatedAt || n.publishedAt || n.date || Date.now()).toISOString();
      return `
    <url>
      <loc>${baseUrl}/news/${slug}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>`;
    })
    .join("");

  // 🏠 صفحات ثابتة (اختياري)
  const staticUrls = `
    <url>
      <loc>${baseUrl}</loc>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>${baseUrl}/matches</loc>
      <priority>0.9</priority>
    </url>
    <url>
      <loc>${baseUrl}/leagues</loc>
      <priority>0.8</priority>
    </url>
    <url>
      <loc>${baseUrl}/contact</loc>
      <priority>0.5</priority>
    </url>
  `;

  // 🧩 جمع كل الروابط
  // If we have many news items, return a sitemap index that references paginated news sitemaps
  const newsPerPage = 1000; // sensible default; adjust if needed
  if ((newsList || []).length > newsPerPage) {
    const pages = Math.ceil(newsList.length / newsPerPage);
    const sitemapIndexEntries = Array.from({ length: pages }).
      map((_, i) => `
    <sitemap>
      <loc>${baseUrl}/sitemap-news-${i + 1}.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`)
      .join('');

    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${sitemapIndexEntries}
  </sitemapindex>`;

    res.setHeader("Content-Type", "text/xml");
    res.write(sitemapIndex);
    res.end();

    return { props: {} };
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${staticUrls}
    ${newsUrls}
    ${leagueUrls}
    ${teamUrls}
    ${matchUrls}
  </urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function SiteMap() {
  return null;
}
