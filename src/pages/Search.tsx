import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import NewsCard from "@/components/NewsCard";
import Header from "@/components/Header";

const Search = () => {
  // Récupère le paramètre 'q' de l'URL
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("q") || "";

  // News state
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupère toutes les news publiées
    const fetchNews = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setNews(data || []);
      } catch (e) {
        setNews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [query]);

  // Mapper les news pour NewsCard
  const mappedNews = news.map(n => {
    // Extraction du résumé comme dans Index
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
    } catch {}
    return {
      id: String(n.id),
      title: n.title ?? '-',
      summary: summary.slice(0, 160) + (summary.length > 160 ? '…' : ''),
      imageUrl: n.image_url || '/placeholder.svg',
      publishedAt: n.created_at ? new Date(n.created_at).toISOString().slice(0, 10) : '',
      category: 'أخبار',
    };
  });

  // Filtrer les news par mot-clé (dans le titre ou le résumé)
  const filteredNews = mappedNews.filter(n => {
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
              <Link key={news.id} to={`/news/${news.id}`} className="block">
                <NewsCard news={news} size="medium" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Search;
