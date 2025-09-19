import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import CategoryFilterHeader from "@/components/CategoryFilterHeader";
import { HeaderAd, MobileAd, InArticleAd, SidebarAd } from "../components/AdWrapper";
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

  useEffect(() => { 
    fetchNews(1, false); 
  }, [fetchNews]);

  const reportNews = async (newsId: string, description: string) => {
    if (reportingId) return;
    if (!isAuthenticated || !user?.id) {
      toast({ 
        title: 'يرجى تسجيل الدخول', 
        description: 'يجب تسجيل الدخول لإرسال البلاغ', 
        variant: 'destructive' 
      });
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
      toast({ 
        title: 'Erreur', 
        description: err?.message || 'تعذر إرسال البلاغ', 
        variant: 'destructive' 
      });
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
    <React.Fragment>
      <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
        <SEO 
          title="الأخبار | كورة - آخر أخبار كرة القدم والرياضة"
          description="تابع آخر أخبار كرة القدم العربية والعالمية، أخبار الانتقالات، تحليلات المباريات، وكل ما يخص عالم الرياضة على كورة."
          keywords={["أخبار كرة القدم", "أخبار رياضية", "انتقالات لاعبين", "تحليلات رياضية", "أخبار الدوريات", "كورة أخبار"]}
          type="website"
        />
        <Header />
        
        {/* Header Ad - Hidden on mobile */}
        <HeaderAd testMode={process.env.NODE_ENV === 'development'} />
        
        <CategoryFilterHeader
          selectedHeaderCategory={selectedHeaderCategory}
          setSelectedHeaderCategory={setSelectedHeaderCategory}
          selectedSubCategory={selectedSubCategory}
          setSelectedSubCategory={setSelectedSubCategory}
          currentLanguage={currentLanguage}
        />
        <TeamsLogos />
        
        {/* Mobile Ad - Compact version */}
        <MobileAd testMode={process.env.NODE_ENV === 'development'} />
        
        <div className="container mx-auto px-1 sm:px-2 lg:px-4 py-1 sm:py-2 lg:py-4">
          <div className="flex flex-col lg:flex-row gap-1 sm:gap-2 lg:gap-4">
            {/* Mobile Leagues Filter - Grid Layout */}
            <div className="lg:hidden mb-2 sm:mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 sm:p-3">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 text-center">
                  {currentLanguage === 'ar' ? 'اختر الدوري' : 'Choisir une ligue'}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2">
                  <button
                    className={`flex flex-col items-center gap-1 p-1 sm:p-2 rounded-lg transition-colors text-center ${
                      selectedChampion === null
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleChampionClick(null)}
                  >
                    <span className="font-medium text-xs leading-tight">
                      {currentLanguage === 'ar' ? 'الكل' : 'Tous'}
                    </span>
                  </button>
                  {leagues.map((league) => (
                    <button
                      key={league.id}
                      className={`flex flex-col items-center gap-1 p-1 sm:p-2 rounded-lg transition-colors text-center ${
                        selectedChampion === league.championId
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => handleChampionClick(league.championId)}
                    >
                      <img
                        src={league.logo}
                        alt={league.name}
                        className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                      />
                      <span className="font-medium text-xs leading-tight max-w-full truncate">
                        {league.name.length > 8 ? league.name.substring(0, 8) + '...' : league.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Left Sidebar - Leagues Filter */}
            <div className="hidden lg:block w-64 space-y-4">
              {/* Leagues Filter */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
                  {currentLanguage === 'ar' ? 'الدوريات' : 'Ligues'}
                </h3>
                <div className="space-y-2">
                  <button
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-right ${
                      selectedChampion === null
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleChampionClick(null)}
                  >
                    <span className="font-medium text-sm">
                      {currentLanguage === 'ar' ? 'جميع الأخبار' : 'Toutes les actualités'}
                    </span>
                  </button>
                  {leagues.map((league) => (
                    <button
                      key={league.id}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-right ${
                        selectedChampion === league.championId
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => handleChampionClick(league.championId)}
                    >
                      <img
                        src={league.logo}
                        alt={league.name}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="font-medium text-sm">{league.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Sidebar Ad */}
              <SidebarAd testMode={process.env.NODE_ENV === 'development'} />
              
              {/* Additional Advertisement Space */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <img
                  src="/placeholder.svg"
                  alt="Advertisement"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          
            

            {/* Main Content - Grid Layout */}
            <div className="flex-1">
              {/* Featured News - Responsive */}
              {!loadingNews && allNews.length > 0 && (
                <div className="mb-2 sm:mb-3 lg:mb-4">
                  <Link to={`/news/${allNews[0].id}`} className="block">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={allNews[0].imageUrl}
                          alt={allNews[0].title}
                          className="w-full h-32 sm:h-40 md:h-56 lg:h-80 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 lg:p-4 text-white">
                          <h1 className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold mb-1 sm:mb-2 leading-tight">
                            {allNews[0].title}
                          </h1>
                          <p className="text-gray-200 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-2">
                            {allNews[0].summary}
                          </p>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{allNews[0].publishedAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Loading state - Responsive Grid */}
              {loadingNews && allNews.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 lg:gap-3">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden animate-pulse">
                      <div className="w-full h-28 sm:h-32 lg:h-40 bg-gray-200 dark:bg-gray-700"></div>
                      <div className="p-2 sm:p-3 lg:p-4 space-y-1 sm:space-y-2">
                        <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* News Grid - Responsive - Starting from index 1 to avoid duplicating featured news */}
              {!loadingNews && allNews.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 lg:gap-3">
                  {allNews.slice(1).map((news, index) => (
                    <Link to={`/news/${news.id}`} key={news.id} className="block">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow h-full">
                        <div className="relative">
                          <img
                            src={news.imageUrl}
                            alt={news.title}
                            className="w-full h-28 sm:h-32 lg:h-40 object-cover"
                            loading="lazy"
                          />
                          <button
                            className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black/50 text-white p-1 sm:p-1.5 rounded-full hover:bg-black/70 transition-colors touch-manipulation"
                            onClick={(e) => { 
                              e.preventDefault(); 
                              e.stopPropagation(); 
                              setReportOpenId(news.id); 
                            }}
                            disabled={reportingId === news.id}
                            title="تبليغ عن الخبر"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="p-2 sm:p-3 lg:p-4">
                          <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 line-clamp-2 leading-tight">
                            {news.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-2">
                            {news.summary}
                          </p>
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{news.publishedAt}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* No news state */}
              {!loadingNews && allNews.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-lg">
                    {currentLanguage === 'ar' ? 'لا توجد أخبار متاحة حالياً' : 'Aucune actualité disponible'}
                  </p>
                </div>
              )}

              {/* Load More Button - Mobile Responsive */}
              {!loadingNews && allNews.length > 0 && (
                <div className="flex justify-center pt-2 sm:pt-3 lg:pt-4">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-60 px-3 sm:px-4 lg:px-6 text-xs sm:text-sm lg:text-base py-1.5 sm:py-2"
                    onClick={handleLoadMore}
                    disabled={loadingNews || !hasMore}
                  >
                    {loadingNews ? 'جاري التحميل...' : hasMore ? (currentLanguage === 'ar' ? 'تحميل المزيد' : 'Charger plus') : (currentLanguage === 'ar' ? 'لا مزيد من الأخبار' : 'Plus d\'actualités')}
                  </Button>
                </div>
              )}
            </div>

            {/* Right Sidebar - More Secondary Content */}
            <div className="hidden xl:block w-64 space-y-4">
              {/* Trending Topics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
                  المواضيع الأكثر بحثاً
                </h3>
                <div className="space-y-3">
                  {trendingTopics.slice(0, 5).map((topic, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <span className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 w-6 h-6 rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2 flex-1">
                        {topic.length > 50 ? topic.substring(0, 50) + '...' : topic}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Advertisement Space */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <img
                  src="/placeholder.svg"
                  alt="Advertisement"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
        
      {/* Report Dialog - Mobile Responsive */}
      <Dialog open={!!reportOpenId} onOpenChange={(o) => { 
        setReportOpenId(o ? reportOpenId : null); 
        if (!o) setReportDesc(''); 
      }}>
        <DialogContent className="w-[90vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base lg:text-lg">
              {currentLanguage === 'ar' ? 'سبب التبليغ' : 'Raison du signalement'}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={currentLanguage === 'ar' ? 'اكتب سبب التبليغ بإيجاز' : 'Décrivez brièvement la raison'}
            value={reportDesc}
            onChange={(e) => setReportDesc(e.target.value)}
            className="min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] text-xs sm:text-sm lg:text-base"
            dir="auto"
          />
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => { 
                setReportOpenId(null); 
                setReportDesc(''); 
              }} 
              disabled={!!reportingId}
              className="order-2 sm:order-1 w-full sm:w-auto text-xs sm:text-sm lg:text-base py-2"
            >
              {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
            </Button>
            <Button
              onClick={() => {
                const d = reportDesc.trim();
                if (!d) {
                  toast({ 
                    title: currentLanguage === 'ar' ? 'مطلوب وصف' : 'Description requise', 
                    description: currentLanguage === 'ar' ? 'يرجى كتابة سبب التبليغ' : 'Veuillez écrire la raison du signalement', 
                    variant: 'destructive' 
                  });
                  return;
                }
                if (reportOpenId) reportNews(reportOpenId, d);
              }}
              disabled={!!reportingId}
              className="order-1 sm:order-2 w-full sm:w-auto text-xs sm:text-sm lg:text-base py-2"
            >
              {reportingId ? '...' : (currentLanguage === 'ar' ? 'إرسال البلاغ' : 'Envoyer le signalement')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default News;