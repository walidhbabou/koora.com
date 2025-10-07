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
  const MIN_REQUEST_INTERVAL = 2000; // Minimum 2 seconds between requests
  const requestCount = useRef<number>(0);
  const MAX_REQUESTS_PER_MINUTE = 5; // Maximum 5 requests per minute
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
          .range(0, 49); // Reduced from 99 to 49 to limit resource usage

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
        perPage: 20, // Reduced from 100
        page: 1,
        maxTotal: 50, // Reduced from 200 to prevent overwhelming the server
        categories: wpCategories.length > 0 ? wpCategories : undefined // Only add categories if we have specific filters
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
      // Check throttling first
      if (shouldThrottleRequest()) {
        console.warn('fetchAllNews request throttled');
        return;
      }

      console.log(`Fetching news for page ${nextPage}, append: ${append}`);
      setLoadingNews(true);
      try {
        const promises = [];

        // Récupérer les news Supabase (toutes en une fois)
        console.log("Starting Supabase fetch...");
        promises.push(fetchSupabaseNews(1)); // Récupérer toutes les news Supabase

        // TOUJOURS récupérer les news WordPress avec les filtres actuels
        console.log("Starting WordPress fetch with current filters...");
        promises.push(fetchWordPressNewsData());

        const results = await Promise.all(promises);
        const supabaseNews = results[0] || [];
        const wordpressNews = results[1] || [];

        console.log(`Supabase news: ${supabaseNews.length}`);
        console.log(`WordPress news: ${wordpressNews.length}`);

        let combinedNews: NewsCardItem[];

        if (!append || allNews.length === 0) {
          // Pour la première charge, mélanger WordPress et Supabase
          combinedNews = [...wordpressNews, ...supabaseNews];

          // Trier par date (plus récent en premier)
          combinedNews.sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime()
          );

          console.log("Combined news:", combinedNews.length);
          console.log("WordPress articles:", wordpressNews.length);
          console.log("Supabase articles:", supabaseNews.length);
          
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
    fetchAllNews(1, false);
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
    }, 2000) // Debounce filter changes by 2 seconds
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
    if (loadingNews || !hasMore) return;
    const nextPage = page + 1;
    paginateNews(allNews, nextPage);
    setPage(nextPage);
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

  // Debug logs - only in development
  if (process.env.NODE_ENV === "development") {
    console.log("Total news loaded:", allNews.length);
    console.log("Displayed news (current page):", displayedNews.length);
    console.log("Current page:", page, "of", totalPages);
    console.log(
      "WordPress news count:",
      allNews.filter((n) => n.source === "wordpress").length
    );
    console.log(
      "Supabase news count:",
      allNews.filter((n) => n.source === "supabase").length
    );
  }

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
          {/* Slider des dernières news */}
          {/* {!loadingNews && allNews.length > 0 && (
            <div className="flex justify-center mb-6">
              <div className="w-full max-w-3xl">
                <NewsSlider
                  news={allNews.slice(0, 5).map(n => ({
                    id: n.id,
                    title: n.title,
                    imageUrl: n.imageUrl,
                    publishedAt: n.publishedAt,
                  }))}
                />
              </div>
            </div>
          )} */}

          {/* Featured News en grand sous le slider */}
          {!loadingNews && displayedNews.length > 0 && (
            <div className="mb-6">
              <Link to={`/news/${displayedNews[0].id}`}>
                <div className="relative">
                  <FeaturedNewsCard
                    title={displayedNews[0].title}
                    imageUrl={displayedNews[0].imageUrl}
                    publishedAt={displayedNews[0].publishedAt}
                    category={displayedNews[0].category}
                  />
                  {displayedNews[0].source === "wordpress" && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                      {currentLanguage === "ar" ? "كورة نيوز" : "Koora News"}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-1 sm:gap-2 lg:gap-4">
            {/* Main Content - Grid Layout */}
            <div className="flex-1">
              {/* Loading state - Responsive Grid */}
              {loadingNews && (
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

            

              {/* News Grid - Responsive - Starting from index 1 to avoid duplicating featured news */}
              {!loadingNews && displayedNews.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 lg:gap-4">
                  {displayedNews.slice(1).map((newsItem) => (
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

              {/* Pagination Controls */}
              {!loadingNews && allNews.length > pageSize && (
                <div className="flex justify-center items-center gap-2 pt-4 sm:pt-6 lg:pt-8">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-60"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    السابق
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {/* Afficher les numéros de page */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={page === pageNum ? "default" : "outline"}
                          className={`w-8 h-8 p-0 ${
                            page === pageNum 
                              ? "bg-blue-600 text-white" 
                              : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          }`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-60"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    التالي
                  </Button>
                  
                  <span className="text-sm text-gray-600 ml-4">
                    صفحة {page} من {totalPages} 
                  </span>
                </div>
              )}

              {/* Load More Button - Keep for backward compatibility */}
              {!loadingNews && displayedNews.length > 0 && hasMore && totalPages <= 1 && (
                <div className="flex justify-center pt-2 sm:pt-3 lg:pt-4">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-60 px-3 sm:px-4 lg:px-6 text-xs sm:text-sm lg:text-base py-1.5 sm:py-2"
                    onClick={handleLoadMore}
                    disabled={loadingNews || !hasMore}
                  >
                    {loadingNews
                      ? "جاري التحميل..."
                      : hasMore
                      ? currentLanguage === "ar"
                        ? "تحميل المزيد"
                        : "Charger plus"
                      : currentLanguage === "ar"
                      ? "لا مزيد من الأخبار"
                      : "Plus d'actualités"}
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
