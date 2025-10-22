import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import NewsCard from "@/components/NewsCard";
import Header from "@/components/Header";
import { generateUniqueSlug, generateWordPressSlug } from "@/utils/slugUtils";

const Search = () => {
  // Récupère le paramètre 'q' de l'URL
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("q") || "";

  // News state
  const [news, setNews] = useState([]);
  const [wpNews, setWpNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupère toutes les news publiées (Supabase) et les posts WordPress
    const fetchNews = async () => {
      setLoading(true);
      try {
        // Supabase
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setNews(data || []);
      } catch (e) {
        setNews([]);
      }
      // WordPress
      try {
        // On demande l'inclusion de l'image à l'API WordPress
  const WP_API = import.meta.env.VITE_WP_API_URL || 'https://koora.com/wp-json';
  const wpRes = await fetch(`${WP_API}/wp/v2/posts?per_page=20&status=publish&search=${encodeURIComponent(query)}&_embed=wp:featuredmedia`);
        if (wpRes.ok) {
          const wpData = await wpRes.json();
          setWpNews(Array.isArray(wpData) ? wpData : []);
        } else {
          setWpNews([]);
        }
      } catch {
        setWpNews([]);
      }
      setLoading(false);
    };
    fetchNews();
  }, [query]);

  // Mapper les news Supabase pour NewsCard
  const mappedNews = news.map(n => {
    let summary = "";
    try {
      const parsed = JSON.parse(n.content ?? "{}");
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        summary = parsed.blocks
          .map(block => {
            if ((block.type === 'paragraph' || block.type === 'header') && block.data?.text) {
              return block.data.text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            }
            if (block.type === 'list' && block.data?.items) {
              return block.data.items.join(' ');
            }
            return '';
          })
          .filter(Boolean)
          .join(' ');
      }
    } catch (e) {
      // ignore JSON parse error
    }
    return {
      id: String(n.id),
      title: n.title ?? '-',
      summary: summary.slice(0, 160) + (summary.length > 160 ? '…' : ''),
      imageUrl: n.image_url || '/placeholder.svg',
      publishedAt: n.created_at ? new Date(n.created_at).toISOString().slice(0, 10) : '',
      category: 'أخبار',
      source: 'supabase',
      wpLink: undefined,
    };
  });

  // Mapper les news WordPress pour NewsCard
  const mappedWpNews = wpNews.map((n) => {
    // Utiliser le champ excerpt ou content pour le résumé
    let summary = '';
    if (n.excerpt && n.excerpt.rendered) {
      summary = n.excerpt.rendered.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } else if (n.content && n.content.rendered) {
      summary = n.content.rendered.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    // Image: priorité à jetpack_featured_media_url, sinon _embedded, sinon extraire du contenu, sinon placeholder
    let imageUrl = n.jetpack_featured_media_url;
    // Essayer _embedded["wp:featuredmedia"]
    if (!imageUrl && n._embedded && n._embedded["wp:featuredmedia"] && n._embedded["wp:featuredmedia"][0]?.source_url) {
      imageUrl = n._embedded["wp:featuredmedia"][0].source_url;
    }
    // Si toujours rien, essayer d'extraire l'image du contenu
    if (!imageUrl && n.content && n.content.rendered) {
      const imgMatch = n.content.rendered.match(/<img[^>]+src=["']([^"'>]+)["']/);
      if (imgMatch) imageUrl = imgMatch[1];
    }
    if (!imageUrl) imageUrl = '/placeholder.svg';
    return {
      id: String(n.id),
      title: n.title?.rendered ? n.title.rendered.replace(/<[^>]*>/g, '').trim() : '-',
      summary: summary.slice(0, 160) + (summary.length > 160 ? '…' : ''),
      imageUrl,
      publishedAt: n.date ? n.date.slice(0, 10) : '',
      category: 'أخبار',
      source: 'wordpress',
      wpLink: n.link,
    };
  });

  // Fusionner les deux sources
  const allNews = [...mappedNews, ...mappedWpNews];

  // Filtrer les news par mot-clé (dans le titre ou le résumé)
  const filteredNews = allNews.filter(n => {
    if (!query.trim()) return true;
    const txt = (n.title + " " + n.summary).toLowerCase();
    return txt.includes(query.trim().toLowerCase());
  });

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Résultats de recherche</h1>
        <p className="mb-6">Vous avez cherché : <span className="font-semibold text-emerald-600">{query}</span></p>
        {loading ? (
          <div className="text-gray-500">Chargement...</div>
        ) : filteredNews.length === 0 ? (
          <div className="text-gray-500">Aucun résultat pour l'instant.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in-50">
            {filteredNews.map(news => (
              news.source === 'wordpress' ? (
                <Link key={news.id} to={`/news/${generateWordPressSlug(news.title, Number(news.id.toString().replace('wp_', '')))}`} className="block">
                  <NewsCard news={news} size="medium" />
                </Link>
              ) : (
                <Link key={news.id} to={`/news/${generateUniqueSlug(news.title, news.id)}`} className="block">
                  <NewsCard news={news} size="medium" />
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Search;
