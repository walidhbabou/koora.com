const SPECIFIC_LEAGUES = [
  {
    id: 2,
    name: "UEFA Champions League",
    nameAr: "دوري أبطال أوروبا",
    country: "EU أوروبا",
  },
  {
    id: 39,
    name: "Premier League",
    nameAr: "الدوري الإنجليزي الممتاز",
    country: "إنجلترا",
  },
  {
    id: 140,
    name: "La Liga",
    nameAr: "الدوري الإسباني الممتاز",
    country: "ES إسبانيا",
  },
  {
    id: 135,
    name: "Serie A",
    nameAr: "الدوري الإيطالي الممتاز",
    country: "IT إيطاليا",
  },
  {
    id: 78,
    name: "Bundesliga",
    nameAr: "الدوري الألماني الممتاز",
    country: "DE ألمانيا",
  },
  {
    id: 61,
    name: "Ligue 1",
    nameAr: "الدوري الفرنسي الممتاز",
    country: "FR فرنسا",
  },
  {
    id: 564,
    name: "Botola Pro",
    nameAr: "البطولة المغربية - البطولة برو",
    country: "MA المغرب",
  },
];
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";

const NEWS_PER_PAGE = 30; // Augmenté à 30 actualités par page comme News.tsx
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import Sidebar from "@/components/Sidebar";
import NewsCard from "@/components/NewsCard";
import NewsSlider from "@/components/NewsSlider";
import Footer from "@/components/Footer";
import {
  HeaderAd,
  SidebarAd,
  MobileAd,
  SponsorsSection,
} from "@/components/AdWrapper";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { fetchWordPressNews } from "@/utils/newsUtils";
import { footballAPI } from "@/config/api";
import { generateUniqueSlug, generateWordPressSlug } from "@/utils/slugUtils";
import { Filter } from "lucide-react";
import { useMatchesByDateAndLeague, useLeagues } from "@/hooks/useFootballAPI";
import { Fixture } from "@/config/api";

// Type for matches data structure
type MatchData = {
  id: number;
  date: string;
  status?: string;
  goals: {
    home: number | null;
    away: number | null;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  league: {
    id: number;
    name: string;
    logo: string;
    nameAr?: string;
  };
  fixture?: {
    status?: {
      short?: string;
      elapsed?: number;
    };
    date?: string;
  };
};
import { SELECTED_LEAGUES } from "@/config/api";

type NewsCardItem = {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  publishedAt: string;
  category: string;
  source?: string;
};

const Index = () => {
  const [newsItems, setNewsItems] = useState<NewsCardItem[]>([]);
  const [allNewsItems, setAllNewsItems] = useState<NewsCardItem[]>([]); // Stocker toutes les news
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [isPageTransition, setIsPageTransition] = useState<boolean>(false);
  

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [mainLeaguesOnly, setMainLeaguesOnly] = useState<boolean>(true);
  const [selectedLeagues, setSelectedLeagues] = useState<number[]>(
    SPECIFIC_LEAGUES.map((l) => l.id)
  );
  const [showLeagueFilter, setShowLeagueFilter] = useState<boolean>(false);
  const { data: leaguesData, loading: loadingLeagues } = useLeagues();
  const { data: matchesData, loading: loadingMatches } =
    useMatchesByDateAndLeague({
      date: selectedDate,
      leagueIds: mainLeaguesOnly ? selectedLeagues : [],
    });
  const displayDate = new Date(selectedDate);
  const weekday = displayDate.toLocaleDateString("ar-EG", { weekday: "long" });
  const fullDate = displayDate.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const fullDateFr = displayDate.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format de date amélioré : الاثنين 08 سبتمبر 2025
  const dayName = displayDate.toLocaleDateString("ar-EG", { weekday: "long" });
  const dayNumber = displayDate.getDate().toString().padStart(2, "0");
  const monthName = displayDate.toLocaleDateString("ar-EG", { month: "long" });
  const year = displayDate.getFullYear();
  const formattedDate = `${dayName} ${dayNumber} ${monthName} ${year}`;

  // Helpers to format time and status
  const formatKickoffAr = (isoDate?: string) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return d.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  const statusLabel = (fx: MatchData) => {
    // Handle both flattened and nested structure for compatibility
    const s = fx?.fixture?.status?.short || fx?.status;
    const elapsed = fx?.fixture?.status?.elapsed;
    if (!s) return "";
    switch (s) {
      case "NS":
        return "لم تبدأ";
      case "HT":
        return "استراحة";
      case "FT":
        return "انتهت";
      case "AET":
        return "أشواط إضافية";
      case "PEN":
        return "ركلات ترجيح";
      case "SUSP":
        return "موقوفة";
      case "PST":
        return "مؤجلة";
      case "CANC":
        return "أُلغيت";
      default:
        return typeof elapsed === "number" ? `${elapsed}′` : s;
    }
  };

  // Group fixtures by league
  const groupedByLeague = useMemo(() => {
    const resp = matchesData?.response || [];
    const map = new Map<
      number,
      { league: MatchData["league"]; fixtures: MatchData[] }
    >();
    const sorted = [...resp].sort((a, b) => (a.id || 0) - (b.id || 0));
    for (const fx of sorted) {
      const lid = fx?.league?.id || 0;
      if (!map.has(lid)) map.set(lid, { league: fx.league, fixtures: [] });
      map.get(lid)!.fixtures.push(fx as MatchData);
    }
    return Array.from(map.values());
  }, [matchesData]);

  // Fonction pour paginer les news
  const paginateNews = (allNews: NewsCardItem[], currentPage: number) => {
    const startIndex = (currentPage - 1) * NEWS_PER_PAGE;
    const endIndex = startIndex + NEWS_PER_PAGE;
    const paginatedNews = allNews.slice(startIndex, endIndex);
    const totalPagesCount = Math.ceil(allNews.length / NEWS_PER_PAGE);
    
    setNewsItems(paginatedNews);
    setTotalPages(totalPagesCount);
    setTotalCount(allNews.length);
    
    return paginatedNews;
  };

  const fetchNews = async (nextPage: number = 1, append: boolean = false) => {
    setLoading(true);
    try {
      // Fetch WordPress news uniquement
      let wordPressNews: NewsCardItem[] = [];
      try {
        wordPressNews = await fetchWordPressNews({
          perPage: 100,
          page: 1,
          maxTotal: 300 // Augmenté pour charger plus d'articles
        });
        console.log(`WordPress news fetched: ${wordPressNews.length} articles`);
      } catch (wpError) {
        console.error("Failed to fetch WordPress news:", wpError);
        wordPressNews = [];
      }

      // Trier par date
      wordPressNews.sort((a, b) => 
        b.publishedAt.localeCompare(a.publishedAt)
      );
      
      // Stocker toutes les news et paginer
      if (!append) {
        setAllNewsItems(wordPressNews);
        paginateNews(wordPressNews, nextPage);
      } else {
        const updatedAllNews = [...allNewsItems, ...wordPressNews];
        setAllNewsItems(updatedAllNews);
        paginateNews(updatedAllNews, nextPage);
      }
    } catch (e) {
      console.error("Failed to load news", e);
      setNewsItems([]);
      setAllNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(1, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fonction pour charger plus d'articles à partir du cache
  const handleLoadMore = useCallback(() => {
    if (loading || isPageTransition || page >= totalPages) return;
    
    setIsPageTransition(true);
    
    // Utiliser les données déjà chargées en cache au lieu de recharger
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * NEWS_PER_PAGE;
    const endIndex = startIndex + NEWS_PER_PAGE;
    const newItems = allNewsItems.slice(startIndex, endIndex);
    
    console.log(`Loading more from cache: page ${nextPage}, items ${startIndex}-${endIndex}`);
    
    setTimeout(() => {
      setNewsItems(prevItems => [...prevItems, ...newItems]);
      setPage(nextPage);
      setIsPageTransition(false);
    }, 50); // Réduit pour une réactivité maximale
  }, [loading, isPageTransition, page, totalPages, allNewsItems]);

  // Système de scroll infini automatique - DÉSACTIVÉ
  // useEffect(() => {
  //   if (!loadMoreRef.current) return;

  //   observerRef.current = new IntersectionObserver(
  //     (entries) => {
  //       const target = entries[0];
  //       if (target.isIntersecting && page < totalPages && !loading && !isPageTransition && !isAutoLoading) {
  //         console.log('Scroll infini détecté, chargement automatique...');
  //         setIsAutoLoading(true);
  //         handleLoadMore();
  //         setTimeout(() => setIsAutoLoading(false), 1000);
  //       }
  //     },
  //     {
  //       threshold: 0.1,
  //       rootMargin: '100px', // Déclencher 100px avant d'atteindre l'élément
  //     }
  //   );

  //   if (loadMoreRef.current) {
  //     observerRef.current.observe(loadMoreRef.current);
  //   }

  //   return () => {
  //     if (observerRef.current) {
  //       observerRef.current.disconnect();
  //     }
  //   };
  // }, [page, totalPages, loading, isPageTransition, isAutoLoading, handleLoadMore]);

  // Re-fetch news on page change - Commenté car on utilise la pagination locale
  // useEffect(() => {
  //   fetchNews(page, false);
  // }, [page]);

  // Carousel navigation functions
  const nextSlide = () => {
    if (newsItems.length > 4) {
      setCarouselIndex((prev) => (prev + 4 >= newsItems.length ? 0 : prev + 4));
    }
  };

  const prevSlide = () => {
    if (newsItems.length > 4) {
      setCarouselIndex((prev) =>
        prev - 4 < 0 ? Math.max(0, newsItems.length - 4) : prev - 4
      );
    }
  };

  // Get current carousel items (4 items)
  const currentCarouselItems = newsItems.slice(
    carouselIndex,
    carouselIndex + 4
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <SEO
        title="كورة | الرئيسية - آخر الأخبار والمباريات اليوم"
        description={`تابع نتائج ومباريات اليوم - ${formattedDate}. أحدث الأخبار من الدوريات الأوروبية والعربية.`}
        canonical="/"
      />
      <Header />

      {/* Header Ad */}
      <HeaderAd testMode={process.env.NODE_ENV === "development"} />

      <TeamsLogos />

      {/* Mobile Ad */}
      <MobileAd testMode={process.env.NODE_ENV === "development"} />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Desktop layout */}
        <div className="hidden lg:flex flex-row xl:flex-row gap-5 lg:gap-8 xl:gap-10 items-start">
          {/* Main Content */}
          <div className="flex-1 space-y-6 lg:space-y-8 order-1">
            {/* Featured News Slider */}
            {!loading && newsItems.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-sport-dark dark:text-white flex items-center gap-3">
                    <div className="w-1 h-8 bg-sport-primary rounded-full"></div>
                    أبرز الأخبار
                  </h2>
                  <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    مباشر
                  </div>
                </div>
                <NewsSlider
                  news={newsItems.slice(0, 5).map((item) => ({
                    ...item,
                    summary: item.summary,
                  }))}
                  autoplay={true}
                  autoplayDelay={3000}
                  showThumbnails={true}
                  className="max-w-full"
                />
              </div>
            )}

            {/* Loading state for slider */}
            {loading && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="w-32 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </div>
                </div>
                <Card className="h-80 lg:h-96 animate-pulse bg-slate-100/60 dark:bg-slate-800/40 rounded-2xl" />
                <div className="flex justify-center gap-2 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && newsItems.length === 0 && (
              <Card className="mt-4 p-8 text-center text-muted-foreground">
                لا توجد أخبار متاحة حالياً
              </Card>
            )}

            {/* Featured News Carousel Section */}
            {!loading && newsItems.length > 0 && (
              <section className="mt-8 lg:mt-12">
                <div className="relative">
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    disabled={newsItems.length <= 4}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={newsItems.length <= 4}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 text-white rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Carousel Container */}
                  <div className="grid grid-cols-1 lg:grid-cols-4  h-auto lg:h-96 mb-4 overflow-hidden">
                    {/* Left Side - 1 card on top, 2 cards below */}
                    <div className="lg:col-span-2 grid  h-full">
                      {/* First Row - Single Card */}
                      {currentCarouselItems[0] && (
                        <Link
                          to={`/news/${generateWordPressSlug(currentCarouselItems[0].title, Number(currentCarouselItems[0].id.toString().replace('wp_', '')))}`}
                          className="block h-full"
                        >
                          <Card className="relative overflow-hidden h-full group cursor-pointer !rounded-none">
                            <img
                              src={
                                currentCarouselItems[0].imageUrl ||
                                "/placeholder.svg"
                              }
                              alt={currentCarouselItems[0].title}
                              className="w-full h-48 lg:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            {/* <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                              أكتوبر 4, 2025
                            </div> */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                              <h3 className="font-bold text-sm lg:text-base leading-tight mb-2 line-clamp-2">
                                {currentCarouselItems[0].title}
                              </h3>
                              <p className="text-xs text-gray-200 line-clamp-2">
                                {currentCarouselItems[0].summary}
                              </p>
                            </div>
                          </Card>
                        </Link>
                      )}

                      {/* Second Row - Two Cards */}
                      <div className="grid grid-cols-2 ">
                        {currentCarouselItems.slice(1, 3).map((news) => (
                          <Link
                            key={news.id}
                            to={`/news/${generateWordPressSlug(news.title, Number(news.id.toString().replace('wp_', '')))}`}
                            className="block h-full"
                          >
                            <Card className="relative overflow-hidden h-full group cursor-pointer !rounded-none">
                              <img
                                src={news.imageUrl || "/placeholder.svg"}
                                alt={news.title}
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                              {/* <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                                أكتوبر 4, 2025
                              </div> */}
                              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                <h3 className="font-bold text-xs lg:text-sm leading-tight mb-1 line-clamp-2">
                                  {news.title}
                                </h3>
                              </div>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Right Side - Main Featured Article */}
                    <div className="lg:col-span-2">
                      {currentCarouselItems[3] && (
                        <Link
                          to={`/news/${generateWordPressSlug(currentCarouselItems[3].title, Number(currentCarouselItems[3].id.toString().replace('wp_', '')))}`}
                          className="block h-full"
                        >
                          <Card className="relative overflow-hidden h-full group cursor-pointer !rounded-none">
                            <img
                              src={
                                currentCarouselItems[3].imageUrl ||
                                "/placeholder.svg"
                              }
                              alt={currentCarouselItems[3].title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            {/* <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
                              فبراير 4, 2025
                            </div> */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                              <h2 className="font-bold text-xl lg:text-2xl leading-tight mb-3 line-clamp-2">
                                {currentCarouselItems[3].title}
                              </h2>
                              <p className="text-sm text-gray-200 line-clamp-2 lg:line-clamp-3">
                                {currentCarouselItems[3].summary}
                              </p>
                            </div>
                          </Card>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Additional News Section - Layout amélioré comme News.tsx */}
            {newsItems.length >= 8 && (
              <div className="mt-8 pt-10 lg:mt-12">
                <h2 className="text-lg sm:text-xl font-bold text-sport-dark mb-4 lg:mb-6 flex items-center gap-3">
                  <div className="w-1 h-6 bg-sport-primary rounded-full"></div>
                  المزيد من الأخبار
                </h2>
                
                {/* Grid responsive avec cartes comme News.tsx */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {newsItems.slice(5).map((news, index) => (
                    <div key={news.id} className="relative">
                      <Link
                        to={`/news/${generateWordPressSlug(news.title, Number(news.id.toString().replace('wp_', '')))}`}
                        className="block"
                      >
                        <NewsCard news={news} size="medium" />
                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                          كورة
                        </div>
                      </Link>
                      
                      {/* Insérer une annonce après chaque 6 articles */}
                      {(index + 1) % 6 === 0 && index < newsItems.slice(5).length - 1 && (
                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 my-4">
                          <SidebarAd testMode={process.env.NODE_ENV === "development"} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Load More Button - Pagination manuelle uniquement */}
            {page < totalPages && (
              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  className="px-6 py-3 bg-sport-dark text-white hover:bg-sport-dark/80 transition-colors disabled:opacity-50 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLoadMore();
                  }}
                  disabled={loading || isPageTransition}
                >
                  {loading || isPageTransition ? 'جاري التحميل...' : `اظهر المزيد (${allNewsItems.length - newsItems.length} متبقي)`}
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar (Today Matches + Ads) */}
          <div className="lg:w-80 xl:w-80 space-y-6 order-2 lg:order-2 xl:order-2" style={{direction: 'ltr'}}>
            <Sidebar />
            {/* Sidebar Ad */}
            <SidebarAd testMode={process.env.NODE_ENV === "development"} />
          </div>
        </div>

  {/* Mobile layout */}
  <div className="flex flex-col lg:hidden gap-5 items-stretch">
          {/* Featured News Slider - Mobile */}
          {!loading && newsItems.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-sport-dark dark:text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-sport-primary rounded-full"></div>
                  أبرز الأخبار
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  مباشر
                </div>
              </div>
              <NewsSlider
                news={newsItems.slice(0, 5).map((item) => ({
                  ...item,
                  summary: item.summary,
                }))}
                autoplay={true}
                autoplayDelay={4000}
                showThumbnails={false}
                className="max-w-full"
              />
            </div>
          )}

          {/* Loading state for mobile slider */}
          {loading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                  <div className="w-24 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              </div>
              <Card className="h-72 animate-pulse bg-slate-100/60 dark:bg-slate-800/40 rounded-2xl" />
              <div className="flex justify-center gap-2 mt-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          )}

          {/* Featured News Carousel Section - Mobile */}
          {!loading && newsItems.length > 0 && (
            <section className="mb-2  w-[360] h-[480]">
              <div className="">
                {/* Main Featured Article */}
                {newsItems.length > 2 && (
                  <>
                    <Link to={`/news/${newsItems[2].source === 'wordpress' ? generateWordPressSlug(newsItems[2].title, Number(newsItems[2].id.toString().replace('wp_', ''))) : generateUniqueSlug(newsItems[2].title, newsItems[2].id)}`} className="block ">
                      <Card className="relative overflow-hidden h-48 group cursor-pointer !rounded-none">
                        <img
                          src={newsItems[2].imageUrl || "/placeholder.svg"}
                          alt={newsItems[2].title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Date Badge */}
                        {/* <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        فبراير 4, 2025
                      </div> */}

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h2 className="font-bold text-lg leading-tight mb-2 line-clamp-2">
                            {newsItems[2].title}
                          </h2>
                          {/* <p className="text-sm text-gray-200 line-clamp-2">
                            {newsItems[2].summary}
                          </p> */}
                        </div>
                      </Card>
                    </Link>
                    <Link to={`/news/${newsItems[1].source === 'wordpress' ? generateWordPressSlug(newsItems[1].title, Number(newsItems[1].id.toString().replace('wp_', ''))) : generateUniqueSlug(newsItems[1].title, newsItems[1].id)}`} className="block">
                      <Card className="relative overflow-hidden h-36 group cursor-pointer !rounded-none">
                        <img
                          src={newsItems[1].imageUrl || "/placeholder.svg"}
                          alt={newsItems[1].title}
                          className="w-full h-full object-cover object-[20%_20%] group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Date Badge */}
                        {/* <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        فبراير 4, 2025
                      </div> */}

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h2 className="font-bold text-lg leading-tight mb-2 line-clamp-2">
                            {newsItems[1].title}
                          </h2>
                          {/* <p className="text-sm text-gray-200 line-clamp-2">
                            {newsItems[1].summary}
                          </p> */}
                        </div>
                      </Card>
                    </Link>
                  </>
                )}

                {/* Two Side Articles in a Row */}
                <div className="grid grid-cols-2 ">
                  {newsItems.slice(2, 4).map((news, index) => (
                    <Link
                      key={news.id}
                      to={`/news/${generateWordPressSlug(news.title, Number(news.id.toString().replace('wp_', '')))}`}
                      className="block"
                    >
                      <Card className="relative overflow-hidden h-36 group cursor-pointer !rounded-none">
                        <img
                          src={news.imageUrl || "/placeholder.svg"}
                          alt={news.title}
                          className="w-full h-full object-cover  group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Date Badge */}
                        {/* <div className="absolute top-2 right-2 bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                          أكتوبر 4, 2025
                        </div> */}

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          <h3 className="font-bold text-xs leading-tight mb-1 line-clamp-2">
                            {news.title}
                          </h3>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Additional News Grid - Mobile amélioré */}
          <div className="grid grid-cols-1 gap-4 animate-in fade-in-50">
            {!loading &&
              newsItems.length >= 8 &&
              newsItems.slice(5).map((news, idx) => (
                <div key={news.id} className="relative">
                  <Link 
                    to={`/news/${generateWordPressSlug(news.title, Number(news.id.toString().replace('wp_', '')))}`} 
                    className="block"
                  >
                    <NewsCard news={news} size="medium" />
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                      كورة
                    </div>
                  </Link>
                  
                  {/* Insérer une annonce après chaque 4 articles sur mobile */}
                  {(idx + 1) % 4 === 0 && idx < newsItems.slice(5).length - 1 && (
                    <div className="my-4">
                      <MobileAd testMode={process.env.NODE_ENV === "development"} />
                    </div>
                  )}
                </div>
              ))}
            
            {!loading && newsItems.length === 0 && (
              <Card className="mt-4 p-8 text-center text-muted-foreground">
                لا توجد أخبار متاحة حالياً
              </Card>
            )}
            
            {/* Load More Button Mobile - Pagination manuelle uniquement */}
            {page < totalPages && (
              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  className="px-6 py-3 bg-sport-dark text-white hover:bg-sport-dark/80 transition-colors disabled:opacity-50 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLoadMore();
                  }}
                  disabled={loading || isPageTransition}
                >
                  {loading || isPageTransition ? 'جاري التحميل...' : `اظهر المزيد (${allNewsItems.length - newsItems.length} متبقي)`}
                </button>
              </div>
            )}
            
            {!loading && newsItems.length === 0 && (
              <Card className="mt-4 p-8 text-center text-muted-foreground">
                لا توجد أخبار متاحة حالياً
              </Card>
            )}
          </div>
          
          <div style={{direction: 'ltr'}}>
            <Sidebar />
          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* Statistiques de performance (dev mode) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded-lg z-50">
          <div>📊 Articles: {allNewsItems.length} total, {newsItems.length} affichés</div>
          <div>📄 Page: {page}/{totalPages}</div>
          <div>⚡ Sources: WordPress uniquement</div>
        </div>
      )}
    </div>
  );
};

export default Index;
