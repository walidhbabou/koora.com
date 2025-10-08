import {
  stripHtml,
  parseEditorJsContent,
  fetchWordPressNews,
  transformWordPressNews,
  getWordPressCategoriesForFilter,
} from "@/utils/newsUtils";
import {
  EditorJsBlock,
  EditorJsContent,
  WordPressNewsItem,
  NewsCardItem,
  Category,
  DisplayCategory,
  NewsDBRow,
} from "@/types/news";
import { Link } from "react-router-dom";
import NewsCard from "../components/NewsCard";
import FeaturedNewsCard from "../components/FeaturedNewsCard";
import NewsSlider from "../components/NewsSlider";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import Footer from "@/components/Footer";
import CategoryFilterHeader from "@/components/CategoryFilterHeader";
import { HeaderAd, MobileAd, SidebarAd } from "../components/AdWrapper";
import { Button } from "@/components/ui/button";
import { Clock, Flag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { MAIN_LEAGUES } from "@/config/api";
import { requestCache, debounce } from "@/utils/requestCache";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState, useCallback, useRef } from "react";
// Types for Editor.js content

const News = () => {
  // ...existing code...

  const [allNews, setAllNews] = useState<NewsCardItem[]>([]);
  const [displayedNews, setDisplayedNews] = useState<NewsCardItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15; // Limiter à 15 actualités par page
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isPageTransition, setIsPageTransition] = useState<boolean>(false);
  const { currentLanguage } = useTranslation();
  const { toast } = useToast();
  const [reportingId, setReportingId] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [reportOpenId, setReportOpenId] = useState<string | null>(null);
  const [reportDesc, setReportDesc] = useState("");
  const [selectedChampion, setSelectedChampion] = useState<number | null>(null);
  const [news, setNews] = useState<WordPressNewsItem[]>([]);

  // Add request throttling to prevent infinite loops
  const lastRequestTime = useRef<number>(0);
  const MIN_REQUEST_INTERVAL = 500; // Réduit de 2000 à 500ms
  const requestCount = useRef<number>(0);
  const MAX_REQUESTS_PER_MINUTE = 10; // Augmenté de 5 à 10 requêtes par minute
  const requestTimes = useRef<number[]>([]);

  // States pour CategoryFilterHeader - set to non-null initially to prevent immediate API calls
  const [selectedHeaderCategory, setSelectedHeaderCategory] = useState<
    number | null
  >(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(
    null
  );

  // Flag to prevent initial filter-triggered requests
  const initialLoadComplete = useRef(false);

  // Function to check if we should throttle requests
  const shouldThrottleRequest = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    
    // Check minimum interval
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      console.warn('Request throttled: too soon since last request');
      return true;
    }
    
    // Clean old request times (older than 1 minute)
    requestTimes.current = requestTimes.current.filter(time => now - time < 60000);
    
    // Check rate limit
    if (requestTimes.current.length >= MAX_REQUESTS_PER_MINUTE) {
      console.warn('Request throttled: rate limit exceeded');
      return true;
    }
    
    // Update tracking
    lastRequestTime.current = now;
    requestTimes.current.push(now);
    requestCount.current++;
    
    return false;
  }, []);

  // Fonction pour paginer les news déjà chargées
  const paginateNews = useCallback((newsArray: NewsCardItem[], currentPage: number) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedNews = newsArray.slice(startIndex, endIndex);
    const totalPagesCount = Math.ceil(newsArray.length / pageSize);
    
    setDisplayedNews(paginatedNews);
    setTotalPages(totalPagesCount);
    setHasMore(currentPage < totalPagesCount);
    
    return paginatedNews;
  }, [pageSize]);

  // Fonction pour récupérer les news Supabase
  const fetchSupabaseNews = useCallback(
    async (nextPage: number): Promise<NewsCardItem[]> => {
      // Check throttling first
      if (shouldThrottleRequest()) {
        console.warn('Supabase request throttled');
        return [];
      }

      try {
        let query = supabase
          .from("news")
          .select("*", { count: "exact" })
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .range(0, 99); // Augmenté de 49 à 99 pour récupérer plus d'articles

        // Filter by category header selection
        if (selectedHeaderCategory && selectedSubCategory) {
          switch (selectedHeaderCategory) {
            case 1:
              query = query.eq(
                "competition_internationale_id",
                selectedSubCategory
              );
              break;
            case 2:
              query = query.eq("competition_mondiale_id", selectedSubCategory);
              break;
            case 3:
              query = query.eq(
                "competition_continentale_id",
                selectedSubCategory
              );
              break;
            case 4:
              query = query.eq("competition_locale_id", selectedSubCategory);
              break;
            case 5:
              query = query.eq("transfert_news_id", selectedSubCategory);
              break;
          }
        } else if (selectedHeaderCategory) {
          switch (selectedHeaderCategory) {
            case 1:
              query = query.not("competition_internationale_id", "is", null);
              break;
            case 2:
              query = query.not("competition_mondiale_id", "is", null);
              break;
            case 3:
              query = query.not("competition_continentale_id", "is", null);
              break;
            case 4:
              query = query.not("competition_locale_id", "is", null);
              break;
            case 5:
              query = query.not("transfert_news_id", "is", null);
              break;
        }
      }

      if (selectedChampion) {
        switch (selectedChampion) {
          case 1:
            query = query.eq("competition_internationale_id", 1);
            break;
          case 2:
            query = query.eq("competition_internationale_id", 2);
            break;
          case 3:
            query = query.eq("competition_internationale_id", 3);
            break;
          case 4:
            query = query.eq("competition_internationale_id", 4);
            break;
          case 5:
            query = query.eq("competition_internationale_id", 5);
            break;
          case 6:
            query = query.eq("competition_internationale_id", 6);
            break;
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        return [];
      }

      if (data) {
        console.log(`Supabase news fetched: ${data.length} articles`);
        return data.map((n: NewsDBRow) => {
          const parsedContent = parseEditorJsContent(String(n.content || ""));
          const plain = stripHtml(parsedContent);
          return {
            id: String(n.id || ""),
            title: String(n.title || "-"),
            summary: plain.slice(0, 160) + (plain.length > 160 ? "…" : ""),
            imageUrl: String(n.image_url || "/placeholder.svg"),
            publishedAt: n.created_at
              ? new Date(n.created_at).toISOString().slice(0, 10)
              : "",
            category: "أخبار",
            source: "supabase",
          };
        });
      }

      return [];
    } catch (error) {
      console.error("Supabase fetch error:", error);
      return [];
    }
    },
    [selectedChampion, selectedHeaderCategory, selectedSubCategory, shouldThrottleRequest]
  );

  // Fonction pour récupérer les news WordPress
  const fetchWordPressNewsData = useCallback(async (): Promise<NewsCardItem[]> => {
    try {
      console.log("Fetching WordPress news...");
      
      // Get WordPress categories based on current filter selection
      const wpCategories = getWordPressCategoriesForFilter(selectedHeaderCategory, selectedSubCategory);
      
      const result = await fetchWordPressNews({
        perPage: 100, // Augmenté de 20 à 100
        page: 1,
        maxTotal: 300, // Augmenté de 50 à 300 pour utiliser la nouvelle fonction
      });
      
      console.log(`WordPress news fetched: ${result.length} articles${wpCategories.length > 0 ? ` for categories ${wpCategories.join(',')}` : ''}`);
      return result;
    } catch (error) {
      console.error("WordPress news fetch failed:", error);
      return [];
    }
  }, [selectedHeaderCategory, selectedSubCategory]); // Add dependencies for filtering

  // Fonction principale pour récupérer et combiner toutes les news
  const fetchAllNews = useCallback(
    async (nextPage: number = 1, append: boolean = false) => {
      // Réduire le throttling pour les requêtes normales
      if (shouldThrottleRequest() && requestCount.current > 3) {
        console.warn('fetchAllNews request throttled');
        return;
      }

      console.log(`Fetching news for page ${nextPage}, append: ${append}`);
      setLoadingNews(true);
      try {
        // Charger les sources en parallèle pour améliorer la performance
        const [supabaseNews, wordpressNews] = await Promise.allSettled([
          fetchSupabaseNews(1),
          fetchWordPressNewsData(),
        ]);

        const supabaseResult = supabaseNews.status === 'fulfilled' ? supabaseNews.value : [];
        const wordpressResult = wordpressNews.status === 'fulfilled' ? wordpressNews.value : [];

        console.log(`Supabase news: ${supabaseResult.length}`);
        console.log(`WordPress news: ${wordpressResult.length}`);

        let combinedNews: NewsCardItem[];

        if (!append || allNews.length === 0) {
          // Pour la première charge, mélanger WordPress et Supabase
          combinedNews = [...wordpressResult, ...supabaseResult];

          // Trier par date (plus récent en premier)
          combinedNews.sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime()
          );

          console.log("Combined news:", combinedNews.length);
          console.log("WordPress articles:", wordpressResult.length);
          console.log("Supabase articles:", supabaseResult.length);
          
          setAllNews(combinedNews);
        } else {
          combinedNews = allNews;
        }

        // Paginer les résultats
        if (combinedNews.length > 0) {
          paginateNews(combinedNews, nextPage);
          setPage(nextPage);
        } else {
          // Si aucune news n'est trouvée, essayer de charger quelques news de test
          console.warn("No news found, creating placeholder news");
          const placeholderNews: NewsCardItem[] = [
            {
              id: "placeholder-1",
              title: "أخبار كرة القدم اليوم",
              summary: "تابع آخر الأخبار الرياضية والمباريات اليوم...",
              imageUrl: "/placeholder.svg",
              publishedAt: new Date().toISOString().slice(0, 10),
              category: "أخبار",
              source: "supabase"
            }
          ];
          setAllNews(placeholderNews);
          paginateNews(placeholderNews, 1);
          setPage(1);
        }
      } catch (e) {
        console.error("Failed to load news", e);
        setAllNews([]);
        setDisplayedNews([]);
        setHasMore(false);
      } finally {
        setLoadingNews(false);
      }
    },
    [fetchSupabaseNews, fetchWordPressNewsData, allNews, paginateNews, shouldThrottleRequest]
  );

  // useEffect pour charger les news WordPress (pour debug et état séparé)


  // useEffect principal pour charger toutes les news
  useEffect(() => {
    console.log("News component mounted, fetching news...");
    initialLoadComplete.current = true;
    
    // Chargement immédiat sans attendre
    const loadNewsImmediately = async () => {
      setLoadingNews(true);
      try {
        // Essayer d'abord Supabase (plus rapide)
        const quickSupabaseNews = await fetchSupabaseNews(1);
        if (quickSupabaseNews.length > 0) {
          setAllNews(quickSupabaseNews);
          paginateNews(quickSupabaseNews, 1);
          setLoadingNews(false);
          
          // Charger WordPress en arrière-plan
          fetchWordPressNewsData().then(wpNews => {
            if (wpNews.length > 0) {
              const combined = [...wpNews, ...quickSupabaseNews].sort(
                (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
              );
              setAllNews(combined);
              paginateNews(combined, 1);
            }
          }).catch(err => console.warn('WordPress background fetch failed:', err));
        } else {
          // Si Supabase est vide, charger WordPress
          fetchAllNews(1, false);
        }
      } catch (error) {
        console.error('Quick load failed, falling back to full fetch:', error);
        fetchAllNews(1, false);
      }
    };
    
    loadNewsImmediately();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect pour recharger quand les filtres changent
  const prevFiltersRef = useRef({ selectedHeaderCategory, selectedSubCategory, selectedChampion });
  const filterChangeDebounced = useRef(
    debounce(() => {
      console.log("Filters changed (debounced), refetching news...");
      // Clear cache for WordPress requests when filters change
      requestCache.clearCache('wordpress');
      setAllNews([]);
      setDisplayedNews([]);
      fetchAllNews(1, false);
    }, 1000) // Réduit le debounce de 2000 à 1000ms pour une réactivité plus rapide
  );

  useEffect(() => {
    // Don't trigger on initial mount
    if (!initialLoadComplete.current) {
      return;
    }

    const prev = prevFiltersRef.current;
    const hasFilterChanged = 
      prev.selectedHeaderCategory !== selectedHeaderCategory ||
      prev.selectedSubCategory !== selectedSubCategory ||
      prev.selectedChampion !== selectedChampion;

    if (hasFilterChanged && (selectedHeaderCategory !== null || selectedSubCategory !== null || selectedChampion !== null)) {
      // Use debounced version to prevent rapid fire requests
      filterChangeDebounced.current();
    }

    prevFiltersRef.current = { selectedHeaderCategory, selectedSubCategory, selectedChampion };
  }, [selectedHeaderCategory, selectedSubCategory, selectedChampion]);

  const reportNews = async (newsId: string, description: string) => {
    if (reportingId) return;
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "يجب تسجيل الدخول لإرسال البلاغ",
        variant: "destructive",
      });
      return;
    }

    // Ne pas permettre le signalement des news WordPress
    if (newsId.startsWith("wp_")) {
      toast({
        title: "غير متاح",
        description: "لا يمكن الإبلاغ عن هذا المحتوى الخارجي",
        variant: "destructive",
      });
      return;
    }

    setReportingId(newsId);
    try {
      try {
        const { error } = await supabase.rpc("create_report", {
          p_type: "content",
          p_target: `news:${newsId}`,
          p_reason: "inappropriate",
          p_description: description,
          p_reported_by: user.id,
        });
        if (error) throw error;
      } catch (rpcErr: unknown) {
        const err = rpcErr as { message?: string };
        const msg = err?.message || "";
        const fnMissing =
          msg.includes("create_report") &&
          msg.toLowerCase().includes("function");
        if (!fnMissing) throw rpcErr;
        const { error: insErr } = await supabase.from("reports").insert({
          type: "content",
          target: `news:${newsId}`,
          reason: "inappropriate",
          description,
          reported_by: user.id,
        });
        if (insErr) throw insErr;
      }
      toast({ description: "تم إرسال البلاغ" });
      setReportOpenId(null);
      setReportDesc("");
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast({
        title: "Erreur",
        description: err?.message || "تعذر إرسال البلاغ",
        variant: "destructive",
      });
    } finally {
      setReportingId(null);
    }
  };

  const handleLoadMore = async () => {
    if (loadingNews || isPageTransition || page >= totalPages) return;
    
    setIsPageTransition(true);
    
    // Charger la page suivante et ajouter au contenu existant
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const newItems = allNews.slice(startIndex, endIndex);
    
    setTimeout(() => {
      setDisplayedNews(prevItems => [...prevItems, ...newItems]);
      setPage(nextPage);
      setHasMore(nextPage < totalPages);
      setIsPageTransition(false);
    }, 100); // Réduit de 300ms à 100ms pour une réactivité plus rapide
  };

  const handlePageChange = (newPage: number) => {
    if (loadingNews || newPage < 1 || newPage > totalPages) return;
    paginateNews(allNews, newPage);
    setPage(newPage);
    // Scroll vers le haut quand on change de page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChampionClick = (championId: number | null) => {
    setSelectedChampion(championId);
    setPage(1);
    setAllNews([]);
    setDisplayedNews([]);
    fetchAllNews(1);
  };

  // Trending topics derived from latest news titles
  const trendingTopics = displayedNews.slice(0, 5).map((n) => n.title);

  // Mapping between league IDs and competition IDs (adjust these based on your actual data)
  const leagueToCompetitionMap: { [key: number]: number } = {
    [MAIN_LEAGUES.CHAMPIONS_LEAGUE]: 1,
    [MAIN_LEAGUES.PREMIER_LEAGUE]: 2,
    [MAIN_LEAGUES.LA_LIGA]: 3,
    [MAIN_LEAGUES.SERIE_A]: 4,
    [MAIN_LEAGUES.BUNDESLIGA]: 5,
    [MAIN_LEAGUES.LIGUE_1]: 6,
  };

  // Leagues list (left sidebar) localized
  const leagues = [
    {
      id: MAIN_LEAGUES.CHAMPIONS_LEAGUE,
      name: currentLanguage === "ar" ? "دوري أبطال أوروبا" : "Champions League",
      logo: "https://media.api-sports.io/football/leagues/2.png",
      championId: leagueToCompetitionMap[MAIN_LEAGUES.CHAMPIONS_LEAGUE],
    },
    {
      id: MAIN_LEAGUES.PREMIER_LEAGUE,
      name:
        currentLanguage === "ar"
          ? "الدوري الإنجليزي الممتاز"
          : "Premier League",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      championId: leagueToCompetitionMap[MAIN_LEAGUES.PREMIER_LEAGUE],
    },
    {
      id: MAIN_LEAGUES.LA_LIGA,
      name: currentLanguage === "ar" ? "الدوري الإسباني الممتاز" : "La Liga",
      logo: "https://media.api-sports.io/football/leagues/140.png",
      championId: leagueToCompetitionMap[MAIN_LEAGUES.LA_LIGA],
    },
    {
      id: MAIN_LEAGUES.SERIE_A,
      name: currentLanguage === "ar" ? "الدوري الإيطالي الممتاز" : "Serie A",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      championId: leagueToCompetitionMap[MAIN_LEAGUES.SERIE_A],
    },
    {
      id: MAIN_LEAGUES.BUNDESLIGA,
      name: currentLanguage === "ar" ? "الدوري الألماني الممتاز" : "Bundesliga",
      logo: "https://media.api-sports.io/football/leagues/78.png",
      championId: leagueToCompetitionMap[MAIN_LEAGUES.BUNDESLIGA],
    },
    {
      id: MAIN_LEAGUES.LIGUE_1,
      name: currentLanguage === "ar" ? "الدوري الفرنسي الممتاز" : "Ligue 1",
      logo: "https://media.api-sports.io/football/leagues/61.png",
      championId: leagueToCompetitionMap[MAIN_LEAGUES.LIGUE_1],
    },
  ];



  return (
    <React.Fragment>
      <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
        <SEO
          title="الأخبار | كورة - آخر أخبار كرة القدم والرياضة"
          description="تابع آخر أخبار كرة القدم العربية والعالمية، أخبار الانتقالات، تحليلات المباريات، وكل ما يخص عالم الرياضة على كورة."
          keywords={[
            "أخبار كرة القدم",
            "أخبار رياضية",
            "انتقالات لاعبين",
            "تحليلات رياضية",
            "أخبار الدوريات",
            "كورة أخبار",
          ]}
          type="website"
        />
        <Header />

        {/* Header Ad - Hidden on mobile */}
        <HeaderAd testMode={process.env.NODE_ENV === "development"} />

        <CategoryFilterHeader
          selectedHeaderCategory={selectedHeaderCategory}
          setSelectedHeaderCategory={setSelectedHeaderCategory}
          selectedSubCategory={selectedSubCategory}
          setSelectedSubCategory={setSelectedSubCategory}
          currentLanguage={currentLanguage}
        />
        <TeamsLogos />

        {/* Mobile Ad - Compact version */}
        <MobileAd testMode={process.env.NODE_ENV === "development"} />

        <div className="container mx-auto px-1 sm:px-2 lg:px-4 py-1 sm:py-2 lg:py-4">
          

         

          <div className="flex flex-col lg:flex-row gap-1 sm:gap-2 lg:gap-4">
            {/* Main Content - Grid Layout */}
            <div className="flex-1">
              {/* Loading state - Responsive Grid */}
              {loadingNews && displayedNews.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 lg:gap-3">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden animate-pulse"
                    >
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

              {/* Afficher le contenu existant même pendant le chargement de nouvelles données */}
              {displayedNews.length > 0 && (
                <>
                  {/* News Grid - Responsive - Tous les articles disponibles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 lg:gap-4">
                    {displayedNews.map((newsItem) => (
                      <div key={newsItem.id} className="relative">
                        <Link to={`/news/${newsItem.id}`}>
                          <NewsCard news={newsItem} size="medium" />
                          {newsItem.source === "wordpress" && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                              {currentLanguage === "ar" ? "كورة" : "Koora"}
                            </div>
                          )}
                        </Link>
                      </div>
                    ))}
                  </div>
                  
                  {/* Indicateur de chargement de contenu supplémentaire */}
                  {loadingNews && (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sport-dark"></div>
                      <span className="ml-2 text-gray-600">جاري تحميل المزيد...</span>
                    </div>
                  )}
                </>
              )}

              {/* No news state */}
              {!loadingNews && displayedNews.length === 0 && allNews.length === 0 && (
                <div className="flex justify-center py-8 sm:py-12">
                  <NewsCard
                    news={{
                      id: "empty",
                      title:
                        currentLanguage === "ar"
                          ? "لا توجد أخبار متاحة حالياً"
                          : "Aucune actualité disponible",
                      summary:
                        currentLanguage === "ar"
                          ? "انتظر تحديثات جديدة قريباً."
                          : "De nouvelles actualités arriveront bientôt.",
                      imageUrl: "/placeholder.svg",
                      publishedAt: "",
                      category: currentLanguage === "ar" ? "أخبار" : "News",
                    }}
                    size="medium"
                  />
                </div>
              )}

              {/* Load More Button */}
              {page < totalPages && (
                <div className="flex justify-center pt-4 sm:pt-6 lg:pt-8">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-sport-dark text-white hover:bg-sport-dark/80 transition-colors disabled:opacity-50 px-6 py-3"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLoadMore();
                    }}
                    disabled={loadingNews || isPageTransition}
                  >
                    {loadingNews || isPageTransition ? 'جاري التحميل...' : 'اظهر المزيد'}
                  </Button>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
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
                        {topic.length > 50
                          ? topic.substring(0, 50) + "..."
                          : topic}
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
      <Dialog
        open={!!reportOpenId}
        onOpenChange={(o) => {
          setReportOpenId(o ? reportOpenId : null);
          if (!o) setReportDesc("");
        }}
      >
        <DialogContent className="w-[90vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base lg:text-lg">
              {currentLanguage === "ar"
                ? "سبب التبليغ"
                : "Raison du signalement"}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={
              currentLanguage === "ar"
                ? "اكتب سبب التبليغ بإيجاز"
                : "Décrivez brièvement la raison"
            }
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
                setReportDesc("");
              }}
              disabled={!!reportingId}
              className="order-2 sm:order-1 w-full sm:w-auto text-xs sm:text-sm lg:text-base py-2"
            >
              {currentLanguage === "ar" ? "إلغاء" : "Annuler"}
            </Button>
            <Button
              onClick={() => {
                const d = reportDesc.trim();
                if (!d) {
                  toast({
                    title:
                      currentLanguage === "ar"
                        ? "مطلوب وصف"
                        : "Description requise",
                    description:
                      currentLanguage === "ar"
                        ? "يرجى كتابة سبب التبليغ"
                        : "Veuillez écrire la raison du signalement",
                    variant: "destructive",
                  });
                  return;
                }
                if (reportOpenId) reportNews(reportOpenId, d);
              }}
              disabled={!!reportingId}
              className="order-1 sm:order-2 w-full sm:w-auto text-xs sm:text-sm lg:text-base py-2"
            >
              {reportingId
                ? "..."
                : currentLanguage === "ar"
                ? "إرسال البلاغ"
                : "Envoyer le signalement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default News;
