// pages/sitemap.xml.js

export async function getServerSideProps({ res }) {
  const baseUrl = "https://koora.com";

  // 👇 عدّل الروابط أدناه حسب API موقعك
  const [matches, leagues, teams] = await Promise.all([
    fetch(`${baseUrl}/api/matches`).then((r) => r.json()).catch(() => []),
    fetch(`${baseUrl}/api/leagues`).then((r) => r.json()).catch(() => []),
    fetch(`${baseUrl}/api/teams`).then((r) => r.json()).catch(() => []),
  ]);

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
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticUrls}
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
