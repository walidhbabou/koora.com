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
import { Search, Filter, TrendingUp, Clock, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, MoreHorizontal, MessageSquare, Flag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { MAIN_LEAGUES } from "@/config/api";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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

  interface Category {
    id: string;
    name: string;
    name_ar: string;
  }

  interface DisplayCategory {
    id: string | null;
    name: string;
    count: number;
    active: boolean;
  }

  const [allNews, setAllNews] = useState<NewsCardItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(true);
  const { isRTL, currentLanguage } = useTranslation();
  const { toast } = useToast();
  const [reportingId, setReportingId] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [reportOpenId, setReportOpenId] = useState<string | null>(null);
  const [reportDesc, setReportDesc] = useState('');
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Get all categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, name_ar');
        
        if (categoriesError) throw categoriesError;
        
        // Get total count for all news
        const { count: totalCount, error: totalCountError } = await supabase
          .from('news')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');
        
        if (totalCountError) throw totalCountError;
        
        // Get counts per category
        const categoriesWithCounts = await Promise.all(
          (categoriesData || []).map(async (cat) => {
            const { count, error: countError } = await supabase
              .from('news')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'published')
              .eq('category_id', cat.id);
            
            if (countError) throw countError;
            return {
              id: cat.id,
              name: currentLanguage === 'ar' ? cat.name_ar : cat.name,
              count: count || 0,
              active: selectedCategory === cat.id
            };
          })
        );
        
        setCategories([
          {
            id: null,
            name: currentLanguage === 'ar' ? 'جميع الأخبار' : 'Toutes les actualités',
            count: totalCount || 0,
            active: !selectedCategory
          },
          ...categoriesWithCounts
        ]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: currentLanguage === 'ar' ? 'خطأ' : 'Error',
          description: currentLanguage === 'ar' 
            ? 'تعذر تحميل الفئات' 
            : 'Could not load categories',
          variant: 'destructive'
        });
      }
    };
    
    fetchCategories();
  }, [currentLanguage, selectedCategory]);

  const fetchNews = async (nextPage: number, append: boolean = false) => {
    setLoadingNews(true);
    try {
      let query = supabase
        .from('news')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range((nextPage - 1) * pageSize, nextPage * pageSize - 1);
      
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      
      const { data, count, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const stripHtml = (html: string) =>
          html
            .replace(/<[^>]*>/g, ' ')               // remove tags
            .replace(/&nbsp;/gi, ' ')               // decode common entities
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/\s+/g, ' ')                  // collapse spaces
            .trim();

        const mapped: NewsCardItem[] = (data || []).map((n: any) => {
          const plain = stripHtml((n.content ?? '').toString());
          return {
            id: String(n.id),
            title: n.title ?? '-',
            summary: plain.slice(0, 160) + (plain.length > 160 ? '…' : ''),
            imageUrl: n.image_url || '/placeholder.svg',
            publishedAt: n.created_at ? new Date(n.created_at).toISOString().slice(0, 10) : '',
            category: 'أخبار',
          };
        });

        setAllNews(prev => append ? [...prev, ...mapped] : mapped);
        setHasMore(mapped.length === pageSize);
        if (!append) setPage(nextPage);
      }
    } catch (e) {
      console.error('Failed to load news', e);
      if (!append) setAllNews([]);
      setHasMore(false);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => { fetchNews(1, false); }, []);

  const reportNews = async (newsId: string, description: string) => {
    if (reportingId) return;
    if (!isAuthenticated || !user?.id) {
      toast({ title: 'يرجى تسجيل الدخول', description: 'يجب تسجيل الدخول لإرسال البلاغ', variant: 'destructive' });
      return;
    }
    setReportingId(newsId);
    try {
      try {
        const { error } = await supabase.rpc('create_report', {
          p_type: 'content',
          p_target: `news:${newsId}`,
          p_reason: 'inappropriate',
          p_description: description,
          p_reported_by: user.id
        });
        if (error) throw error;
      } catch (rpcErr: any) {
        const msg = rpcErr?.message || '';
        const fnMissing = msg.includes('create_report') && msg.toLowerCase().includes('function');
        if (!fnMissing) throw rpcErr; // do not fallback on RLS/permission errors
        const { error: insErr } = await supabase.from('reports').insert({
          type: 'content',
          target: `news:${newsId}`,
          reason: 'inappropriate',
          description,
          reported_by: user.id
        });
        if (insErr) throw insErr;
      }
      toast({ description: 'تم إرسال البلاغ' });
      setReportOpenId(null);
      setReportDesc('');
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'تعذر إرسال البلاغ', variant: 'destructive' });
    } finally {
      setReportingId(null);
    }
  };

  const handleLoadMore = async () => {
    if (loadingNews || !hasMore) return;
    const next = page + 1;
    await fetchNews(next, true);
    setPage(next);
  };

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
    setAllNews([]);
    fetchNews(1);
  };

  // Trending topics derived from latest news titles
  const trendingTopics = allNews.slice(0, 5).map(n => n.title);

  // Leagues list (left sidebar) localized, consistent with Standings.tsx
  const leagues = [
    {
      id: MAIN_LEAGUES.CHAMPIONS_LEAGUE,
      name: currentLanguage === 'ar' ? 'دوري أبطال أوروبا' : 'Champions League',
      logo: 'https://media.api-sports.io/football/leagues/2.png',
    },
    {
      id: MAIN_LEAGUES.PREMIER_LEAGUE,
      name: currentLanguage === 'ar' ? 'الدوري الإنجليزي الممتاز' : 'Premier League',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
    },
    {
      id: MAIN_LEAGUES.LA_LIGA,
      name: currentLanguage === 'ar' ? 'الدوري الإسباني الممتاز' : 'La Liga',
      logo: 'https://media.api-sports.io/football/leagues/140.png',
    },
    {
      id: MAIN_LEAGUES.SERIE_A,
      name: currentLanguage === 'ar' ? 'الدوري الإيطالي الممتاز' : 'Serie A',
      logo: 'https://media.api-sports.io/football/leagues/135.png',
    },
    {
      id: MAIN_LEAGUES.BUNDESLIGA,
      name: currentLanguage === 'ar' ? 'الدوري الألماني الممتاز' : 'Bundesliga',
      logo: 'https://media.api-sports.io/football/leagues/78.png',
    },
    {
      id: MAIN_LEAGUES.LIGUE_1,
      name: currentLanguage === 'ar' ? 'الدوري الفرنسي الممتاز' : 'Ligue 1',
      logo: 'https://media.api-sports.io/football/leagues/61.png',
    },
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
                  onClick={() => handleCategoryClick(category.id)}
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
                    <Card className={`p-2 sm:p-3 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all bg-white dark:bg-[#0f1115] border border-slate-200/70 dark:border-slate-800/60`}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <img
                          src={news.imageUrl}
                          alt={news.title}
                          className="w-20 h-14 sm:w-24 sm:h-16 object-cover rounded-md flex-shrink-0"
                        />
                        <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
                            {news.title}
                          </h3>
                          <div className={`mt-1 text-[11px] sm:text-xs text-slate-500 flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-start' : ''}`}>
                            <Clock className="w-3 h-3 opacity-70" />
                            <span>{news.publishedAt}</span>
                          </div>
                        </div>
                        <button
                          className="shrink-0 inline-flex items-center gap-1 text-slate-500 hover:text-red-600"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setReportOpenId(news.id); }}
                          disabled={reportingId === news.id}
                          title="تبليغ عن الخبر"
                        >
                          <Flag className="w-4 h-4" />
                          <span className="text-[11px]">{reportingId === news.id ? '...' : 'تبليغ'}</span>
                        </button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Load More */}
            <div className="flex justify-center pt-8">
              <Button
                size="lg"
                variant="outline"
                className="border-sport-green text-sport-green hover:bg-sport-green hover:text-white disabled:opacity-60"
                onClick={handleLoadMore}
                disabled={loadingNews || !hasMore}
              >
                {loadingNews ? '...جاري التحميل' : hasMore ? 'تحميل المزيد من الأخبار' : 'لا مزيد من الأخبار'}
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

      {/* Report Dialog */}
      <Dialog open={!!reportOpenId} onOpenChange={(o) => { setReportOpenId(o ? reportOpenId : null); if (!o) setReportDesc(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>سبب التبليغ</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="اكتب سبب التبليغ بإيجاز"
            value={reportDesc}
            onChange={(e) => setReportDesc(e.target.value)}
            className="min-h-[120px]"
            dir="auto"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReportOpenId(null); setReportDesc(''); }} disabled={!!reportingId}>إلغاء</Button>
            <Button
              onClick={() => {
                const d = reportDesc.trim();
                if (!d) {
                  toast({ title: 'مطلوب وصف', description: 'يرجى كتابة سبب التبليغ', variant: 'destructive' });
                  return;
                }
                if (reportOpenId) reportNews(reportOpenId, d);
              }}
              disabled={!!reportingId}
            >
              {reportingId ? '...' : 'إرسال البلاغ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default News;
