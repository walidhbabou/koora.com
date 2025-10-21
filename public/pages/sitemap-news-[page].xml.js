// pages/sitemap-news-[page].xml.js

export async function getServerSideProps({ params, res }) {
  const baseUrl = "https://koora.com";
  const page = parseInt(params.page || '1', 10) || 1;
  const perPage = 1000; // same as sitemap.xml.js

  const allNews = await fetch(`${baseUrl}/api/news`).then(r => r.json()).catch(() => []);
  const newsList = Array.isArray(allNews) ? allNews : (allNews && Array.isArray(allNews.posts) ? allNews.posts : []);

  const start = (page - 1) * perPage;
  const slice = newsList.slice(start, start + perPage);

  const newsUrls = (slice || []).map(n => {
    const slug = n.slug || n.slugified || n.id || (n.title ? encodeURIComponent(String(n.title).toLowerCase().replaceAll(/\s+/g, '-')) : 'article');
    const lastmod = new Date(n.updatedAt || n.publishedAt || n.date || Date.now()).toISOString();
    // include image if available
    const imageTag = n.image || n.featured_image || n.thumbnail ? `\n      <image:image>\n        <image:loc>${n.image || n.featured_image || n.thumbnail}</image:loc>\n      </image:image>` : '';
    return `
    <url>
      <loc>${baseUrl}/news/${slug}</loc>
      <lastmod>${lastmod}</lastmod>${imageTag}
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>`;
  }).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n    ${newsUrls}\n  </urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function NewsSitemap() { return null; }
