import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import Sidebar from "@/components/Sidebar";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, TrendingUp, Clock, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, MoreHorizontal, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/hooks/useTranslation";

// CommentsSection removed from the list page; moved to reusable component for details page

const News = () => {
  type NewsCardItem = {
    id: string;
    title: string;
    summary: string;
    imageUrl: string;
    publishedAt: string;
    category: string;
  };

  const [allNews, setAllNews] = useState<NewsCardItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const { isRTL } = useTranslation();

  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, content, created_at, image_url, status')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const mapped: NewsCardItem[] = (data || []).map((n: any) => ({
        id: String(n.id),
        title: n.title ?? '-',
        summary: (n.content ?? '').toString().replace(/\s+/g, ' ').slice(0, 160) + ((n?.content && n.content.length > 160) ? '…' : ''),
        imageUrl: n.image_url || '/placeholder.svg',
        publishedAt: n.created_at ? new Date(n.created_at).toISOString().slice(0, 10) : '',
        category: 'أخبار',
      }));
      setAllNews(mapped);
    } catch (e) {
      console.error('Failed to load news', e);
      setAllNews([]);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const categories = [
    { name: "جميع الأخبار", count: 245, active: true },
    { name: "الانتقالات", count: 67, active: false },
    { name: "البطولات", count: 45, active: false },
    { name: "إصابات", count: 23, active: false },
    { name: "تصريحات", count: 38, active: false },
    { name: "إنجازات", count: 29, active: false }
  ];

  const trendingTopics = [
    "مبابي ريال مدريد",
    "صلاح ليفربول", 
    "برشلونة انتقالات",
    "الكلاسيكو",
    "دوري الأبطال"
  ];

  // Leagues list (left sidebar) with logos like the screenshot
  const leagues = [
    { name: 'دوري أبطال أوروبا', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/UEFA_Champions_League_logo_2.svg/64px-UEFA_Champions_League_logo_2.svg.png' },
    { name: 'الدوري الإنجليزي الممتاز', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/64px-Premier_League_Logo.svg.png' },
    { name: 'الدوري الإسباني الممتاز', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/92/LaLiga_Santander.svg/64px-LaLiga_Santander.svg.png' },
    { name: 'الدوري الإيطالي الممتاز', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Serie_A_logo_%282019%29.svg/64px-Serie_A_logo_%282019%29.svg.png' },
    { name: 'الدوري الألماني الممتاز', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Bundesliga_logo_%282017%29.svg/64px-Bundesliga_logo_%282017%29.svg.png' },
    { name: 'الدوري الفرنسي الممتاز', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/Ligue1.svg/64px-Ligue1.svg.png' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
      <TeamsLogos />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar (Leagues) */}
          <div className="hidden lg:block w-80 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-sport-dark mb-4">البطولات</h3>
              <ul className="space-y-3">
                {leagues.map((l, i) => (
                  <li key={i}>
                    <div className={`flex items-center justify-between rounded-2xl bg-white dark:bg-[#181a20] border border-gray-100 dark:border-[#23262f] px-4 py-3 shadow-sm hover:shadow-md cursor-pointer transition-all ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {/* Chevron */}
                      <div className={`shrink-0 text-gray-400`}>
                        {isRTL ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronLeft className="w-4 h-4" />
                        )}
                      </div>
                      {/* Name */}
                      <div className={`flex-1 ${isRTL ? 'text-right pr-3' : 'text-left pl-3'}`}>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{l.name}</div>
                      </div>
                      {/* Logo */}
                      <div className="shrink-0">
                        <img src={l.logo} alt={l.name} className="w-9 h-9 rounded-md object-contain bg-white" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sport-dark to-sport-green bg-clip-text text-transparent">
                  الأخبار
                </h1>
                <p className="text-muted-foreground mt-1">آخر أخبار كرة القدم من حول العالم</p>
              </div>
              
              <div className="flex gap-3">

                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  تصفية
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Badge 
                  key={index}
                  variant={category.active ? "default" : "secondary"}
                  className={`cursor-pointer px-4 py-2 ${
                    category.active 
                      ? "bg-sport-green text-white" 
                      : "hover:bg-sport-green/10"
                  }`}
                >
                  {category.name} ({category.count})
                </Badge>
              ))}
            </div>

            {/* Featured News (hero + two cards) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-sport-green" />
                <h2 className="text-xl font-bold text-sport-dark">الأخبار المميزة</h2>
              </div>
              
              {/* Hero first */}
              {(loadingNews ? [] : allNews.slice(0,1)).map((news) => (
                <Link to={`/news/${news.id}`} key={news.id} className="block space-y-2">
                  <NewsCard news={news} size="large" />
                </Link>
              ))}

              {/* Two secondary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(loadingNews ? [] : allNews.slice(1, 3)).map((news) => (
                  <Link to={`/news/${news.id}`} key={news.id} className="block space-y-2">
                    <NewsCard news={news} size="medium" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Latest News (compact vertical list) */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-sport-green" />
                <h2 className="text-xl font-bold text-sport-dark">آخر الأخبار</h2>
              </div>

              <div className="space-y-3">
                {(loadingNews ? [] : allNews.slice(3)).map((news) => (
                  <Link to={`/news/${news.id}`} key={news.id} className="block">
                    <Card className={`p-2 sm:p-3 rounded-xl hover:shadow-[var(--shadow-hover)] transition-all bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40`}> 
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <img
                          src={news.imageUrl}
                          alt={news.title}
                          className="w-20 h-14 sm:w-24 sm:h-16 object-cover rounded-md flex-shrink-0"
                        />
                        <div className={`min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
                            {news.title}
                          </h3>
                          <div className={`mt-1 text-[11px] sm:text-xs text-slate-500 flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-start' : ''}`}>
                            <Clock className="w-3 h-3 opacity-70" />
                            <span>{news.publishedAt}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Load More */}
            <div className="flex justify-center pt-8">
              <Button size="lg" variant="outline" className="border-sport-green text-sport-green hover:bg-sport-green hover:text-white">
                تحميل المزيد من الأخبار
              </Button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
            
            
            {/* Trending Topics */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-sport-dark mb-4">المواضيع الأكثر بحثاً</h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-sport-light/20 cursor-pointer transition-colors"
                  >
                    <span className="text-sm font-medium text-sport-green">#{index + 1}</span>
                    <span className="text-sm">{topic}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* News by Category */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-sport-dark mb-4">التصنيفات</h3>
              <div className="space-y-3">
                {categories.slice(1).map((category, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-sport-light/20 cursor-pointer transition-colors"
                  >
                    <span className="text-sm">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default News;
