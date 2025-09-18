import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import CategoryFilterHeader from "@/components/CategoryFilterHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, TrendingUp, Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { MAIN_LEAGUES } from "@/config/api";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Types for Editor.js content
interface EditorJsBlock {
  type: string;
  data: {
    text?: string;
    items?: string[];
    [key: string]: unknown;
  };
}

interface EditorJsContent {
  blocks: EditorJsBlock[];
  version?: string;
  time?: number;
}

// Function to parse Editor.js content and extract text
const parseEditorJsContent = (content: string): string => {
  try {
    const parsed: EditorJsContent = JSON.parse(content);
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .map((block: EditorJsBlock) => {
          if (block.type === 'paragraph' && block.data && block.data.text) {
            return block.data.text;
          }
          if (block.type === 'header' && block.data && block.data.text) {
            return block.data.text;
          }
          if (block.type === 'list' && block.data && block.data.items) {
            return block.data.items.join(' ');
          }
          return '';
        })
        .filter(Boolean)
        .join(' ');
    }
  } catch (e) {
    // If it's not JSON or has a different format, return as is
    return content;
  }
  return content;
};

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

  interface NewsDBRow {
    id: number;
    title: string;
    content: string;
    created_at: string;
    image_url?: string;
    status: string;
    competition_internationale_id?: number;
    competition_mondiale_id?: number;
    competition_continentale_id?: number;
    competition_locale_id?: number;
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
  const [selectedChampion, setSelectedChampion] = useState<number | null>(null);
  const [showLeagueModal, setShowLeagueModal] = useState(false);
  
  // States pour CategoryFilterHeader
  const [selectedHeaderCategory, setSelectedHeaderCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);

  // No longer fetching champions from database - using hardcoded league mapping

  // Simplified categories - removed database dependency
  const categories = [
    {
      id: null,
      name: currentLanguage === 'ar' ? 'جميع الأخبار' : 'Toutes les actualités',
      count: allNews.length,
      active: true
    }
  ];

  const fetchNews = useCallback(async (nextPage: number, append: boolean = false) => {
    setLoadingNews(true);
    try {
      let query = supabase
        .from('news')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range((nextPage - 1) * pageSize, nextPage * pageSize - 1);
      
      // Filter by competition type if selected
      if (selectedChampion) {
        // Map champion selection to competition filters
        switch(selectedChampion) {
          case 1: // Champions League
            query = query.eq('competition_internationale_id', 1);
            break;
          case 2: // Premier League
            query = query.eq('competition_internationale_id', 2);
            break;
          case 3: // La Liga
            query = query.eq('competition_internationale_id', 3);
            break;
          case 4: // Serie A
            query = query.eq('competition_internationale_id', 4);
            break;
          case 5: // Bundesliga
            query = query.eq('competition_internationale_id', 5);
            break;
          case 6: // Ligue 1
            query = query.eq('competition_internationale_id', 6);
            break;
        }
      }
      
      const { data, count, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const stripHtml = (html: string) =>
          html
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/\s+/g, ' ')
            .trim();

        const mapped: NewsCardItem[] = data.map((n: NewsDBRow) => {
          // Parse Editor.js content first, then strip HTML
          const parsedContent = parseEditorJsContent(String(n.content || ''));
          const plain = stripHtml(parsedContent);
          return {
            id: String(n.id || ''),
            title: String(n.title || '-'),
            summary: plain.slice(0, 160) + (plain.length > 160 ? '…' : ''),
            imageUrl: String(n.image_url || '/placeholder.svg'),
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
  }, [selectedChampion, pageSize]);

  useEffect(() => { fetchNews(1, false); }, [fetchNews]);

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
      } catch (rpcErr: unknown) {
        const err = rpcErr as { message?: string };
        const msg = err?.message || '';
        const fnMissing = msg.includes('create_report') && msg.toLowerCase().includes('function');
        if (!fnMissing) throw rpcErr;
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
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast({ title: 'Erreur', description: err?.message || 'تعذر إرسال البلاغ', variant: 'destructive' });
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

  const handleChampionClick = (championId: number | null) => {
    setSelectedChampion(championId);
    setPage(1);
    setAllNews([]);
    fetchNews(1);
  };

  // Trending topics derived from latest news titles
  const trendingTopics = allNews.slice(0, 5).map(n => n.title);

  // Mapping between league IDs and competition IDs (adjust these based on your actual data)
  const leagueToCompetitionMap: { [key: number]: number } = {
    [MAIN_LEAGUES.CHAMPIONS_LEAGUE]: 1,   // competition_internationale_id
    [MAIN_LEAGUES.PREMIER_LEAGUE]: 2,     // competition_internationale_id  
    [MAIN_LEAGUES.LA_LIGA]: 3,           // competition_internationale_id
    [MAIN_LEAGUES.SERIE_A]: 4,           // competition_internationale_id
    [MAIN_LEAGUES.BUNDESLIGA]: 5,        // competition_internationale_id
    [MAIN_LEAGUES.LIGUE_1]: 6,           // competition_internationale_id
  };

  // Leagues list (left sidebar) localized
  const leagues = [
    {
      id: MAIN_LEAGUES.CHAMPIONS_LEAGUE,
      name: currentLanguage === 'ar' ? 'دوري أبطال أوروبا' : 'Champions League',
      logo: 'https://media.api-sports.io/football/leagues/2.png',
      championId: leagueToCompetitionMap[MAIN_LEAGUES.CHAMPIONS_LEAGUE],
    },
    {
      id: MAIN_LEAGUES.PREMIER_LEAGUE,
      name: currentLanguage === 'ar' ? 'الدوري الإنجليزي الممتاز' : 'Premier League',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      championId: leagueToCompetitionMap[MAIN_LEAGUES.PREMIER_LEAGUE],
    },
    {
      id: MAIN_LEAGUES.LA_LIGA,
      name: currentLanguage === 'ar' ? 'الدوري الإسباني الممتاز' : 'La Liga',
      logo: 'https://media.api-sports.io/football/leagues/140.png',
      championId: leagueToCompetitionMap[MAIN_LEAGUES.LA_LIGA],
    },
    {
      id: MAIN_LEAGUES.SERIE_A,
      name: currentLanguage === 'ar' ? 'الدوري الإيطالي الممتاز' : 'Serie A',
      logo: 'https://media.api-sports.io/football/leagues/135.png',
      championId: leagueToCompetitionMap[MAIN_LEAGUES.SERIE_A],
    },
    {
      id: MAIN_LEAGUES.BUNDESLIGA,
      name: currentLanguage === 'ar' ? 'الدوري الألماني الممتاز' : 'Bundesliga',
      logo: 'https://media.api-sports.io/football/leagues/78.png',
      championId: leagueToCompetitionMap[MAIN_LEAGUES.BUNDESLIGA],
    },
    {
      id: MAIN_LEAGUES.LIGUE_1,
      name: currentLanguage === 'ar' ? 'الدوري الفرنسي الممتاز' : 'Ligue 1',
      logo: 'https://media.api-sports.io/football/leagues/61.png',
      championId: leagueToCompetitionMap[MAIN_LEAGUES.LIGUE_1],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
       <CategoryFilterHeader
        selectedHeaderCategory={selectedHeaderCategory}
        setSelectedHeaderCategory={setSelectedHeaderCategory}
        selectedSubCategory={selectedSubCategory}
        setSelectedSubCategory={setSelectedSubCategory}
        currentLanguage={currentLanguage}
      />
      <TeamsLogos />
      
      {/* Header de filtrage (ne s'affiche que si les tables existent) */}
     
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar (Leagues) */}
          <div className="hidden lg:block w-80 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-sport-dark">البطولات</h3>
                {selectedChampion && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChampionClick(null)}
                    className="text-xs"
                  >
                    {currentLanguage === 'ar' ? 'إلغاء التصفية' : 'Clear Filter'}
                  </Button>
                )}
              </div>
              <ul className="space-y-3">
                {leagues.map((l, i) => (
                  <li key={i}>
                    <div 
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm hover:shadow-md cursor-pointer transition-all ${isRTL ? 'flex-row-reverse' : ''} ${
                        selectedChampion === l.championId 
                          ? 'bg-sport-green text-white border-sport-green' 
                          : 'bg-white dark:bg-[#181a20] border-gray-100 dark:border-[#23262f]'
                      }`}
                      onClick={() => handleChampionClick(l.championId)}
                    >
                      <div className={`shrink-0 ${selectedChampion === l.championId ? 'text-white' : 'text-gray-400'}`}>
                        {isRTL ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div className={`flex-1 ${isRTL ? 'text-right pr-3' : 'text-left pl-3'}`}>
                        <div className={`text-sm font-medium ${selectedChampion === l.championId ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                          {l.name}
                        </div>
                      </div>
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
          

            {/* Featured News */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-sport-green" />
                <h2 className="text-xl font-bold text-sport-dark">الأخبار المميزة</h2>
              </div>
              
              {(loadingNews ? [] : allNews.slice(0,1)).map((news) => (
                <Link to={`/news/${news.id}`} key={news.id} className="block space-y-2">
                  <NewsCard news={news} size="large" />
                </Link>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(loadingNews ? [] : allNews.slice(1, 3)).map((news) => (
                  <Link to={`/news/${news.id}`} key={news.id} className="block space-y-2">
                    <NewsCard news={news} size="medium" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Latest News */}
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

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="bg-white dark:bg-[#181a20] border-gray-100 dark:border-[#23262f] shadow-md hover:shadow-lg"
          onClick={() => setShowLeagueModal(true)}
        >
          <Filter className="w-5 h-5 text-gray-800 dark:text-gray-100" />
        </Button>
      </div>
    </div>
  );
};

export default News;