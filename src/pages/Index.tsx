import React, { useEffect, useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import Sidebar from "@/components/Sidebar";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { footballAPI } from "@/config/api";
import { Filter } from "lucide-react";
import { useMatchesByDateAndLeague, useLeagues } from "@/hooks/useFootballAPI";
import { Fixture } from "@/config/api";
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
  // Matches (dynamic by date + filter)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [mainLeaguesOnly, setMainLeaguesOnly] = useState<boolean>(true);
  // Ligues spécifiques à afficher selon l'image
  const SPECIFIC_LEAGUES = [
    { id: 2, name: 'UEFA Champions League', nameAr: 'دوري أبطال أوروبا', country: 'EU أوروبا' },
    { id: 39, name: 'Premier League', nameAr: 'الدوري الإنجليزي الممتاز', country: 'إنجلترا' },
    { id: 140, name: 'La Liga', nameAr: 'الدوري الإسباني الممتاز', country: 'ES إسبانيا' },
    { id: 135, name: 'Serie A', nameAr: 'الدوري الإيطالي الممتاز', country: 'IT إيطاليا' },
    { id: 78, name: 'Bundesliga', nameAr: 'الدوري الألماني الممتاز', country: 'DE ألمانيا' },
    { id: 61, name: 'Ligue 1', nameAr: 'الدوري الفرنسي الممتاز', country: 'FR فرنسا' },
    { id: 564, name: 'Botola Pro', nameAr: 'البطولة المغربية - البطولة برو', country: 'MA المغرب' }
  ];
  
  const [selectedLeagues, setSelectedLeagues] = useState<number[]>(SPECIFIC_LEAGUES.map(l => l.id));
  const [showLeagueFilter, setShowLeagueFilter] = useState<boolean>(false);
  const { data: leaguesData, loading: loadingLeagues } = useLeagues();
  const { data: matchesData, loading: loadingMatches } = useMatchesByDateAndLeague({
    date: selectedDate,
    leagueIds: mainLeaguesOnly ? selectedLeagues : [],
    translateContent: true,
  });
  const displayDate = new Date(selectedDate);
  const weekday = displayDate.toLocaleDateString('ar-EG', { weekday: 'long' });
  const fullDate = displayDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const fullDateFr = displayDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Format de date amélioré : الاثنين 08 سبتمبر 2025
  const dayName = displayDate.toLocaleDateString('ar-EG', { weekday: 'long' });
  const dayNumber = displayDate.getDate().toString().padStart(2, '0');
  const monthName = displayDate.toLocaleDateString('ar-EG', { month: 'long' });
  const year = displayDate.getFullYear();
  const formattedDate = `${dayName} ${dayNumber} ${monthName} ${year}`;

  // Helpers to format time and status
  const formatKickoffAr = (isoDate?: string) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  const statusLabel = (fx: any) => {
    const s = fx?.fixture?.status?.short;
    const elapsed = fx?.fixture?.status?.elapsed;
    if (!s) return '';
    switch (s) {
      case 'NS': return 'لم تبدأ';
      case 'HT': return 'استراحة';
      case 'FT': return 'انتهت';
      case 'AET': return 'أشواط إضافية';
      case 'PEN': return 'ركلات ترجيح';
      case 'SUSP': return 'موقوفة';
      case 'PST': return 'مؤجلة';
      case 'CANC': return 'أُلغيت';
      default:
        return typeof elapsed === 'number' ? `${elapsed}′` : s;
    }
  };

  // Group fixtures by league
  const groupedByLeague = useMemo(() => {
    const resp = matchesData?.response || [];
    const map = new Map<number, { league: any; fixtures: Fixture[] }>();
    const sorted = [...resp].sort((a: any, b: any) => (a.fixture?.timestamp || 0) - (b.fixture?.timestamp || 0));
    for (const fx of sorted) {
      const lid = fx?.league?.id || 0;
      if (!map.has(lid)) map.set(lid, { league: fx.league, fixtures: [] });
      map.get(lid)!.fixtures.push(fx as Fixture);
    }
    return Array.from(map.values());
  }, [matchesData]);

  const fetchNews = async (nextPage: number, append: boolean = false) => {
    setLoading(true);
    try {
      const query = supabase
        .from('news')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range((nextPage - 1) * 10, nextPage * 10 - 1);

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

        const mapped: NewsCardItem[] = (data || []).map((n: { id: string; title: string; content: string; image_url: string; created_at: string }) => {
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

        setNewsItems(prev => append ? [...prev, ...mapped] : mapped);
      }
    } catch (e) {
      console.error('Failed to load news', e);
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(1, false); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <SEO
        title="كورة | الرئيسية - آخر الأخبار والمباريات اليوم"
        description={`تابع نتائج ومباريات اليوم - ${formattedDate}. أحدث الأخبار من الدوريات الأوروبية والعربية.`}
        canonical="/"
      />
      <Header />
      <TeamsLogos />
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row xl:flex-row gap-5 lg:gap-8 xl:gap-10 items-start">
          {/* Main Content */}
          <div className="flex-1 space-y-6 lg:space-y-8">
         
            
            {/* News Grid - Responsive layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in-50">
              {loading && (
                <>
                  <Card className="sm:col-span-2 lg:col-span-2 h-80 animate-pulse bg-slate-100/60 dark:bg-slate-800/40" />
                  <Card className="h-64 animate-pulse bg-slate-100/60 dark:bg-slate-800/40" />
                  <Card className="h-64 animate-pulse bg-slate-100/60 dark:bg-slate-800/40" />
                  <Card className="h-64 animate-pulse bg-slate-100/60 dark:bg-slate-800/40" />
                  <Card className="h-64 animate-pulse bg-slate-100/60 dark:bg-slate-800/40" />
                </>
              )}
              {!loading && newsItems[0] && (
                <div className="sm:col-span-2 md:col-span-2 lg:col-span-2 xl:col-span-2">
                  <Link to={`/news/${newsItems[0].id}`} className="block">
                    <NewsCard news={newsItems[0]} size="large" />
                  </Link>
                </div>
              )}
              {!loading && newsItems[1] && (
                <div>
                  <Link to={`/news/${newsItems[1].id}`} className="block">
                    <NewsCard news={newsItems[1]} size="medium" />
                  </Link>
                </div>
              )}
              {!loading && newsItems[2] && (
                <div>
                  <Link to={`/news/${newsItems[2].id}`} className="block">
                    <NewsCard news={newsItems[2]} size="medium" />
                  </Link>
                </div>
              )}
              {!loading && newsItems[3] && (
                <div>
                  <Link to={`/news/${newsItems[3].id}`} className="block">
                    <NewsCard news={newsItems[3]} size="medium" />
                  </Link>
                </div>
              )}
              {!loading && newsItems[4] && (
                <div>
                  <Link to={`/news/${newsItems[4].id}`} className="block">
                    <NewsCard news={newsItems[4]} size="medium" />
                  </Link>
                </div>
              )}
            </div>

            {/* Empty state */}
            {!loading && newsItems.length === 0 && (
              <Card className="mt-4 p-8 text-center text-muted-foreground">لا توجد أخبار متاحة حالياً</Card>
            )}
            
            {/* Additional News Section */}
            {newsItems.length > 5 && (
              <div className="mt-8 lg:mt-12">
                <h2 className="text-lg sm:text-xl font-bold text-sport-dark mb-4 lg:mb-6">المزيد من الأخبار</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                  {newsItems.slice(5).map((news) => (
                    <Link key={news.id} to={`/news/${news.id}`} className="block">
                      <NewsCard news={news} size="medium" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar (Today Matches) */}
          <Sidebar />

        </div>
      </div>

      {/* Mobile Today Matches (visible on phones) */}
      <div className="px-4 pb-6 md:hidden">
       

        {/* Section des mises à jour */}
        <Card className="p-4 rounded-2xl shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {/* Header amélioré avec logo et date */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sport-green to-emerald-600 flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" opacity=".2"></circle>
                  <path d="M12 7l2.2 1.6-.8 2.5H10.6l-.8-2.5L12 7zm-5.8 3.5l2.6-.2 1 2.4-1.9 1.6-1.7-1.4.1-2.4zm11.6 0l.1 2.4-1.7 1.4-1.9-1.6 1-2.4 2.5.2zM9.9 15.6l1.1-2.3h2l1.1 2.3-2.1 1.5-2.1-1.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">مباريات اليوم</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">{formattedDate}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="sr-only"
                id="home-date-picker-mobile"
              />
              <div className="relative">
                <Filter
                  className={`w-5 h-5 cursor-pointer transition-colors ${mainLeaguesOnly ? 'text-sport-green' : 'text-slate-500 hover:text-sport-green'}`}
                  onClick={() => setShowLeagueFilter((s) => !s)}
                />
                {showLeagueFilter && (
                  <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-4 text-right">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">اختر الدوريات</div>
                      <button
                        className="text-xs text-sport-green hover:underline font-medium"
                        onClick={() => setSelectedLeagues(SPECIFIC_LEAGUES.map(l => l.id))}
                      >
                        المفضلة
                      </button>
                    </div>
                    <div className="max-h-56 overflow-auto pr-1">
                      {loadingLeagues && <div className="text-xs text-slate-500 dark:text-slate-400">جارٍ التحميل…</div>}
                      {!loadingLeagues && SPECIFIC_LEAGUES.map((league) => {
                        const checked = selectedLeagues.includes(league.id);
                        return (
                          <label key={league.id} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg px-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                setMainLeaguesOnly(true);
                                setSelectedLeagues((prev) => e.target.checked ? [...prev, league.id] : prev.filter((x) => x !== league.id));
                              }}
                              className="w-4 h-4 text-sport-green rounded border-slate-300"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{league.nameAr}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{league.country}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        className="text-xs text-slate-600 dark:text-slate-400 hover:underline font-medium"
                        onClick={() => { setMainLeaguesOnly(true); setSelectedLeagues(SPECIFIC_LEAGUES.map(l => l.id)); }}
                      >
                        الدوريات المختارة
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs text-slate-600 dark:text-slate-400 hover:underline font-medium"
                          onClick={() => { setMainLeaguesOnly(false); setShowLeagueFilter(false); }}
                          title="عرض كل الدوريات"
                        >
                          كل الدوريات
                        </button>
                        <button
                          className="text-xs text-slate-600 dark:text-slate-400 hover:underline font-medium"
                          onClick={() => setSelectedLeagues([])}
                        >
                          مسح
                        </button>
                        <button
                          className="text-xs bg-sport-green text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                          onClick={() => setShowLeagueFilter(false)}
                        >
                          تم
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Filtres améliorés */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              onClick={() => document.getElementById('home-date-picker-mobile')?.click()}
              title="Choisir la date"
            >
              {fullDateFr}
            </span>
            <span
              className="inline-flex items-center rounded-full bg-sport-green/10 text-sport-green px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer select-none hover:bg-sport-green/20 transition-colors"
              onClick={() => document.getElementById('home-date-picker-mobile')?.click()}
              title="اختيار التاريخ"
            >
              {formattedDate}
            </span>
            {mainLeaguesOnly ? (
              <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap bg-slate-50 dark:bg-slate-800">
                {selectedLeagues.length > 0 ? `دوريات مختارة (${selectedLeagues.length})` : 'الدوريات الرئيسية'}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap bg-slate-50 dark:bg-slate-800">كل الدوريات</span>
            )}
          </div>
        </Card>

        <Card className="mt-3 p-0 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {/* Mobile header unified with desktop */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" opacity=".2"></circle>
                  <path d="M12 7l2.2 1.6-.8 2.5H10.6l-.8-2.5L12 7zm-5.8 3.5l2.6-.2 1 2.4-1.9 1.6-1.7-1.4.1-2.4zm11.6 0l.1 2.4-1.7 1.4-1.9-1.6 1-2.4 2.5.2zM9.9 15.6l1.1-2.3h2l1.1 2.3-2.1 1.5-2.1-1.5z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">مباريات {weekday}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{formattedDate}</div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            {loadingMatches ? (
              <div className="h-24 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 animate-pulse" />
            ) : (matchesData?.response?.length ?? 0) === 0 ? (
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-6 text-center bg-white dark:bg-slate-900 shadow-sm">
                <div className="py-6">
                  <div className="text-slate-500 dark:text-slate-400 mb-4">لا توجد مباريات لهذا اليوم ضمن الدوريات المختارة</div>
                  <button
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md bg-sport-green text-white hover:opacity-95"
                    onClick={() => setMainLeaguesOnly(false)}
                  >
                    عرض كل المباريات لهذا اليوم
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-none shadow-sm border-0">
                {/* Matches list */}
                <div className="max-h-[480px] overflow-y-auto">
                  {groupedByLeague
                    .filter(({ league }) => {
                      // When mainLeaguesOnly is true, only show leagues that are in selectedLeagues
                      if (mainLeaguesOnly) return selectedLeagues.includes(league?.id);
                      return true;
                    })
                    .map(({ league, fixtures }) => (
                      <div key={league?.id} className="divide-y">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                        {league?.logo && <img src={league.logo} className="w-5 h-5 rounded-full" />}
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{league?.nameTranslated?.arabic || league?.name}</span>
                        {league?.flag && <img src={league.flag} className="w-4 h-3 rounded-sm ml-auto" />}
                      </div>
                      {fixtures.map((fx: Fixture) => {
                        const homeScore = fx.goals?.home ?? 0;
                        const awayScore = fx.goals?.away ?? 0;
                        const status = fx.fixture?.status?.short;
                        const elapsed = fx.fixture?.status?.elapsed;
                        const isLive = ["1H", "2H", "ET", "LIVE"].includes(status);
                        const isFinished = ["FT", "AET", "PEN"].includes(status);
                        const isScheduled = status === "NS";

                        return (
                          <div key={fx.fixture?.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <div className="grid grid-cols-5 items-center gap-2">
                              <div className="flex justify-end items-center gap-2 col-span-2">
                                <span className="text-sm text-slate-800 dark:text-slate-100 truncate">{fx.teams?.home?.nameTranslated?.arabic || fx.teams?.home?.name}</span>
                                {fx.teams?.home?.logo && <img src={fx.teams.home.logo} className="w-6 h-6 rounded-full" />}
                              </div>

                              <div className="text-center">
                                {isScheduled ? (
                                  <>
                                    <div className="text-green-600 font-bold text-sm">{formatKickoffAr(fx.fixture?.date)}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">لم تبدأ</div>
                                  </>
                                ) : (
                                  <>
                                    <div className={`font-bold text-lg ${isLive ? "text-red-500" : "text-slate-800 dark:text-slate-100"}`}>{homeScore} - {awayScore}</div>
                                    <div className={`text-xs ${isLive ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`}>{isLive && elapsed ? `${elapsed}'` : isFinished ? "انتهت" : ""}</div>
                                  </>
                                )}
                              </div>

                              <div className="flex justify-start items-center gap-2 col-span-2">
                                {fx.teams?.away?.logo && <img src={fx.teams.away.logo} className="w-6 h-6 rounded-full" />}
                                <span className="text-sm text-slate-800 dark:text-slate-100 truncate">{fx.teams?.away?.nameTranslated?.arabic || fx.teams?.away?.name}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
