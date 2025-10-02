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
import React, { useEffect, useMemo, useState } from "react";

const NEWS_PER_PAGE = 15;
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
import { footballAPI } from "@/config/api";
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
};

const Index = () => {
  const [newsItems, setNewsItems] = useState<NewsCardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [search, setSearch] = useState("");
  // Matches (dynamic by date + filter)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [mainLeaguesOnly, setMainLeaguesOnly] = useState<boolean>(true);
  // Ligues spécifiques à afficher selon l'image
  // (déplacé en dehors du composant)

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

  const fetchNews = async (nextPage: number, append: boolean = false) => {
    setLoading(true);
    try {
      // Fetch Supabase news
      const query = supabase
        .from("news")
        .select("*", { count: "exact" })
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range((nextPage - 1) * NEWS_PER_PAGE, nextPage * NEWS_PER_PAGE - 1);

      const { data: supabaseData, count, error: supabaseError } = await query;
      if (supabaseError) throw supabaseError;

      // Fetch MySQL news from API
      let mysqlData: {
        ID: string | number;
        post_title?: string;
        post_excerpt?: string;
        post_content?: string;
        post_date?: string;
      }[] = [];
      try {
        const mysqlResp = await fetch("/api/news");
        if (mysqlResp.ok) {
          // Try to parse JSON, fallback to empty array if error
          try {
            mysqlData = await mysqlResp.json();
          } catch (jsonErr) {
            console.error("MySQL API returned invalid JSON:", jsonErr);
            mysqlData = [];
          }
        } else {
          console.error(
            "MySQL API error:",
            mysqlResp.status,
            await mysqlResp.text()
          );
        }
      } catch (apiErr) {
        console.error("Failed to fetch MySQL news:", apiErr);
        mysqlData = [];
      }

      // Helper: extract text from Editor.js JSON
      const extractTextFromEditorJs = (content: string) => {
        try {
          const cleanContent = content
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, " ")
            .replace(/\\"/g, '"');
          const parsed = JSON.parse(cleanContent);
          if (parsed.blocks && Array.isArray(parsed.blocks)) {
            return parsed.blocks
              .map(
                (block: {
                  type: string;
                  data?: { text?: string; items?: string[] };
                }) => {
                  if (
                    (block.type === "paragraph" || block.type === "header") &&
                    block.data?.text
                  ) {
                    return block.data.text
                      .replace(/<[^>]*>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim();
                  }
                  if (block.type === "list" && block.data?.items) {
                    return block.data.items.join(" ");
                  }
                  return "";
                }
              )
              .filter((text) => text.length > 0)
              .join(" ");
          }
          return "";
        } catch {
          // Fallback: try to extract text from raw JSON or string
          const textMatches = content.match(/"text":\s*"([^"]+)"/g);
          if (textMatches && textMatches.length > 0) {
            return textMatches
              .map((match) => match.replace(/"text":\s*"([^"]+)"/, "$1"))
              .join(" ");
          }
          return "";
        }
      };

      const stripHtml = (html: string) =>
        html
          .replace(/<[^>]*>/g, " ")
          .replace(/&nbsp;/gi, " ")
          .replace(/&amp;/gi, "&")
          .replace(/&lt;/gi, "<")
          .replace(/&gt;/gi, ">")
          .replace(/\s+/g, " ")
          .trim();

      // Map Supabase news
      const supabaseMapped: NewsCardItem[] = (supabaseData || []).map(
        (n: {
          id: string;
          title: string;
          content: string;
          image_url: string;
          created_at: string;
        }) => {
          const textContent = extractTextFromEditorJs(n.content ?? "");
          const plain = stripHtml(textContent);
          return {
            id: String(n.id),
            title: n.title ?? "-",
            summary: plain.slice(0, 160) + (plain.length > 160 ? "…" : ""),
            imageUrl: n.image_url || "/placeholder.svg",
            publishedAt: n.created_at
              ? new Date(n.created_at).toISOString().slice(0, 10)
              : "",
            category: "أخبار",
          };
        }
      );

      // Map MySQL news
      const mysqlMapped: NewsCardItem[] = (mysqlData || []).map(
        (n: {
          ID: string | number;
          post_title?: string;
          post_excerpt?: string;
          post_content?: string;
          post_date?: string;
        }) => {
          // Use excerpt if available, else first 160 chars of content
          const summaryRaw = n.post_excerpt || n.post_content || "";
          const plain = stripHtml(summaryRaw);
          return {
            id: String(n.ID),
            title: n.post_title ?? "-",
            summary: plain.slice(0, 160) + (plain.length > 160 ? "…" : ""),
            imageUrl: "/placeholder.svg", // You can update if you have image field
            publishedAt: n.post_date
              ? new Date(n.post_date).toISOString().slice(0, 10)
              : "",
            category: "أخبار",
          };
        }
      );

      // Merge and sort all news by publishedAt desc
      const allNews = [...supabaseMapped, ...mysqlMapped].sort((a, b) =>
        b.publishedAt.localeCompare(a.publishedAt)
      );
      setTotalCount(allNews.length);
      setNewsItems((prev) => (append ? [...prev, ...allNews] : allNews));
    } catch (e) {
      console.error("Failed to load news", e);
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(1, false);
  }, []);

  // Re-fetch news on page change
  useEffect(() => {
    fetchNews(page, false);
  }, [page]);

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
          <div className="flex-1 space-y-6 lg:space-y-8">
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

            {/* Additional News Section */}
            {newsItems.length > 5 && (
              <div className="mt-8 lg:mt-12">
                <h2 className="text-lg sm:text-xl font-bold text-sport-dark mb-4 lg:mb-6">
                  المزيد من الأخبار
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                  {newsItems.slice(5).map((news) => (
                    <Link
                      key={news.id}
                      to={`/news/${news.id}`}
                      className="block"
                    >
                      <NewsCard news={news} size="medium" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalCount > NEWS_PER_PAGE && (
              <div className="flex justify-center items-center mt-8">
                <button
                  className="px-4 py-2 mx-2 bg-sport-dark text-white rounded disabled:opacity-50"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  السابق
                </button>
                <span className="mx-2">
                  صفحة {page} من {Math.ceil(totalCount / NEWS_PER_PAGE)}
                </span>
                <button
                  className="px-4 py-2 mx-2 bg-sport-dark text-white rounded disabled:opacity-50"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(totalCount / NEWS_PER_PAGE)}
                >
                  التالي
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar (Today Matches + Ads) */}
          <div className="lg:w-80 xl:w-80 space-y-6">
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

          {/* Additional News Grid - Mobile */}
          <div className="grid grid-cols-1 gap-4 animate-in fade-in-50">
            {!loading &&
              newsItems.length > 5 &&
              newsItems.slice(5).map((news, idx) => (
                <Link key={news.id} to={`/news/${news.id}`} className="block">
                  <NewsCard news={news} size="medium" />
                </Link>
              ))}
            {/* Pagination Controls Mobile */}
            {totalCount > NEWS_PER_PAGE && (
              <div className="flex justify-center items-center mt-8">
                <button
                  className="px-4 py-2 mx-2 bg-sport-dark text-white rounded disabled:opacity-50"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  السابق
                </button>
                <span className="mx-2">
                  صفحة {page} من {Math.ceil(totalCount / NEWS_PER_PAGE)}
                </span>
                <button
                  className="px-4 py-2 mx-2 bg-sport-dark text-white rounded disabled:opacity-50"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(totalCount / NEWS_PER_PAGE)}
                >
                  التالي
                </button>
              </div>
            )}
            {!loading && newsItems.length === 0 && (
              <Card className="mt-4 p-8 text-center text-muted-foreground">
                لا توجد أخبار متاحة حالياً
              </Card>
            )}
          </div>
          <Sidebar />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
