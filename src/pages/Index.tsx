import React, { useEffect, useMemo, useState } from "react";
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
  const [selectedLeagues, setSelectedLeagues] = useState<number[]>(SELECTED_LEAGUES);
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

  const fetchLatestNews = async () => {
    try {
      setLoading(true);
      setError(null);
      // Try primary API first
      let mapped: NewsCardItem[] = [];
      try {
        const apiRes: any = await footballAPI.getLatestNews(20);
        const items = (apiRes?.response || apiRes || []) as any[];
        if (Array.isArray(items)) {
          mapped = items.map((n: any) => ({
            id: String(n.id || n.slug || n.uuid || Math.random()),
            title: n.title ?? "-",
            summary: (n.summary || n.content || "").toString().replace(/\s+/g, " ").slice(0, 160) + (((n?.summary || n?.content)?.length > 160) ? "…" : ""),
            imageUrl: n.imageUrl || n.image_url || "/placeholder.svg",
            publishedAt: n.publishedAt || n.created_at ? new Date(n.publishedAt || n.created_at).toISOString().slice(0, 10) : "",
            category: n.category || "أخبار",
          }));
        }
      } catch (apiErr) {
        // Silently fallback to Supabase
        console.debug('News API failed, falling back to Supabase', apiErr);
      }

      if (!mapped.length) {
        const { data, error } = await supabase
          .from("news")
          .select("id, title, content, created_at, image_url, status")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) throw error;
        mapped = (data || []).map((n: any) => ({
          id: String(n.id),
          title: n.title ?? "-",
          summary: (n.content ?? "").toString().replace(/\s+/g, " ").slice(0, 160) + ((n?.content && n.content.length > 160) ? "…" : ""),
          imageUrl: n.image_url || "/placeholder.svg",
          publishedAt: n.created_at ? new Date(n.created_at).toISOString().slice(0, 10) : "",
          category: "أخبار",
        }));
      }

      setNewsItems(mapped);
    } catch (e) {
      console.error("Failed to load latest news", e);
      setError("تعذر تحميل الأخبار");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestNews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
      <TeamsLogos />
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-10 items-start">
          {/* Sidebar - Hidden on mobile, visible on large screens */}
       
          
          {/* Main Content */}
          <div className="flex-1 space-y-6 lg:space-y-8">
         
            
            {/* News Grid - Responsive layout */}
            {/* Note: remove forced equal row height on mobile to avoid large gaps between cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:auto-rows-[1fr] animate-in fade-in-50">
              {loading && (
                <>
                  <Card className="sm:col-span-2 sm:row-span-2 h-64 animate-pulse bg-slate-100/60 dark:bg-slate-800/40" />
                  <Card className="h-48 animate-pulse bg-slate-100/60 dark:bg-slate-800/40" />
                  <Card className="h-48 animate-pulse bg-slate-100/60 dark:bg-slate-800/40" />
                  <Card className="h-36 animate-pulse bg-slate-100/60 dark:bg-slate-800/40" />
                  <Card className="h-36 animate-pulse bg-slate-100/60 dark:bg-slate-800/40" />
                </>
              )}
              {!loading && newsItems[0] && (
                <div className="sm:col-span-2 lg:col-span-2 h-full">
                  <Link to={`/news/${newsItems[0].id}`} className="block h-full">
                    <div className="h-full"><NewsCard news={newsItems[0]} size="large" /></div>
                  </Link>
                </div>
              )}
              {!loading && newsItems[1] && (
                <div className="h-full">
                  <Link to={`/news/${newsItems[1].id}`} className="block h-full"><NewsCard news={newsItems[1]} size="medium" /></Link>
                </div>
              )}
              {!loading && newsItems[2] && (
                <div className="h-full">
                  <Link to={`/news/${newsItems[2].id}`} className="block h-full"><NewsCard news={newsItems[2]} size="medium" /></Link>
                </div>
              )}
              {!loading && newsItems[3] && (
                <div className="h-full">
                  <Link to={`/news/${newsItems[3].id}`} className="block h-full"><NewsCard news={newsItems[3]} size="small" /></Link>
                </div>
              )}
              {!loading && newsItems[4] && (
                <div className="h-full">
                  <Link to={`/news/${newsItems[4].id}`} className="block h-full"><NewsCard news={newsItems[4]} size="small" /></Link>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch gap-3 sm:gap-4">
                  {newsItems.slice(5).map((news) => (
                    <Link key={news.id} to={`/news/${news.id}`} className="block h-full">
                      <div className="h-full"><NewsCard news={news} size="small" /></div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar (Today Matches) */}
          {/* Right Sidebar (Today Matches) */}
<div className="hidden md:block md:w-72 lg:w-80 space-y-4 md:sticky md:top-24 lg:top-28">

  {/* Header (unified with mobile style) */}
  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b dark:border-slate-800">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center">
          {/* Football icon (SVG) instead of emoji for consistent rendering) */}
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="12" r="10" opacity=".2"></circle>
            <path d="M12 7l2.2 1.6-.8 2.5H10.6l-.8-2.5L12 7zm-5.8 3.5l2.6-.2 1 2.4-1.9 1.6-1.7-1.4.1-2.4zm11.6 0l.1 2.4-1.7 1.4-1.9-1.6 1-2.4 2.5.2zM9.9 15.6l1.1-2.3h2l1.1 2.3-2.1 1.5-2.1-1.5z" />
          </svg>
        </div>
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">مباريات {weekday}</div>
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{fullDate}</div>
    </div>
  </div>

  {/* Matches List */}
  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[650px] overflow-y-auto">
    {(() => {
      if (loadingMatches) {
        return <div className="h-24 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 animate-pulse m-4" />;
      }
      const filteredGroups = mainLeaguesOnly
        ? groupedByLeague.filter(({ league }) => selectedLeagues.includes(league?.id))
        : groupedByLeague;
      const hasAny = filteredGroups.length > 0 && filteredGroups.some(g => (g.fixtures?.length || 0) > 0);
      if (!hasAny) {
        return (
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-6 text-center bg-white dark:bg-slate-900 shadow-sm m-4">
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
        );
      }
      return (
        <>
          {filteredGroups.map(({ league, fixtures }) => (
            <div key={league?.id}>
              {/* League Header */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                {league?.logo && <img src={league.logo} className="w-5 h-5 rounded-full" />}
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {league?.nameTranslated?.arabic || league?.name}
                </span>
                {league?.flag && <img src={league.flag} className="w-4 h-3 rounded-sm ml-auto" />}
              </div>

              {/* Fixtures */}
              <div className="divide-y">
                {fixtures.map((fx: any) => {
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
                        {/* Home */}
                        <div className="flex justify-end items-center gap-2 col-span-2">
                          <span className="text-sm text-slate-800 dark:text-slate-100 truncate">
                            {fx.teams?.home?.nameTranslated?.arabic || fx.teams?.home?.name}
                          </span>
                          {fx.teams?.home?.logo && (
                            <img src={fx.teams.home.logo} className="w-6 h-6 rounded-full" />
                          )}
                        </div>

                        {/* Score & Status */}
                        <div className="text-center">
                          {isScheduled ? (
                            <>
                              <div className="text-green-600 font-bold text-sm">
                                {formatKickoffAr(fx.fixture?.date)}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">لم تبدأ</div>
                            </>
                          ) : (
                            <>
                              <div className={`font-bold text-lg ${isLive ? "text-red-500" : "text-slate-800 dark:text-slate-100"}`}>
                                {homeScore} - {awayScore}
                              </div>
                              <div className={`text-xs ${isLive ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`}>
                                {isLive && elapsed ? `${elapsed}'` : isFinished ? "انتهت" : ""}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Away */}
                        <div className="flex justify-start items-center gap-2 col-span-2">
                          {fx.teams?.away?.logo && (
                            <img src={fx.teams.away.logo} className="w-6 h-6 rounded-full" />
                          )}
                          <span className="text-sm text-slate-800 dark:text-slate-100 truncate">
                            {fx.teams?.away?.nameTranslated?.arabic || fx.teams?.away?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      );
    })()}
  </div>
</div>

        </div>
      </div>

      {/* Mobile Today Matches (visible on phones) */}
      <div className="px-4 pb-6 md:hidden">
        <Card className="p-4 rounded-2xl shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between flex-row-reverse relative">
            <div className="font-semibold text-right">{weekday}</div>
            <div className="flex items-center gap-3 text-slate-600">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="sr-only"
                id="home-date-picker-mobile"
              />
              <div className="relative">
                <Filter
                  className={`w-5 h-5 cursor-pointer ${mainLeaguesOnly ? 'text-sport-green' : ''}`}
                  onClick={() => setShowLeagueFilter((s) => !s)}
                  title="تحديد الدوريات"
                />
                {showLeagueFilter && (
                  <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 p-3 text-right">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold">اختر الدوريات</div>
                      <button
                        className="text-xs text-sport-green hover:underline"
                        onClick={() => setSelectedLeagues(SELECTED_LEAGUES)}
                      >
                        المفضلة
                      </button>
                    </div>
                    <div className="max-h-56 overflow-auto pr-1">
                      {loadingLeagues && <div className="text-xs text-slate-500 dark:text-slate-400">جارٍ التحميل…</div>}
                      {!loadingLeagues && leaguesData?.response
                        ?.filter((item) => SELECTED_LEAGUES.includes(item.league.id))
                        ?.sort((a, b) => SELECTED_LEAGUES.indexOf(a.league.id) - SELECTED_LEAGUES.indexOf(b.league.id))
                        ?.map((item) => {
                          const id = item.league.id;
                          const name = item.league.name;
                          const checked = selectedLeagues.includes(id);
                          return (
                            <label key={id} className="flex items-center gap-2 py-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  setMainLeaguesOnly(true);
                                  setSelectedLeagues((prev) => e.target.checked ? [...prev, id] : prev.filter((x) => x !== id));
                                }}
                              />
                              <span className="text-xs">{name}</span>
                            </label>
                          );
                        })}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        className="text-xs text-slate-600 dark:text-slate-400 hover:underline"
                        onClick={() => { setMainLeaguesOnly(true); setSelectedLeagues(SELECTED_LEAGUES); }}
                      >
                        الدوريات الخمسة
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs text-slate-600 dark:text-slate-400 hover:underline"
                          onClick={() => { setMainLeaguesOnly(false); setShowLeagueFilter(false); }}
                          title="عرض كل الدوريات"
                        >
                          كل الدوريات
                        </button>
                        <button
                          className="text-xs text-slate-600 dark:text-slate-400 hover:underline"
                          onClick={() => setSelectedLeagues([])}
                        >
                          مسح
                        </button>
                        <button
                          className="text-xs bg-sport-green text-white px-2 py-1 rounded"
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
          <div className="mt-3 flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 text-xs font-medium whitespace-nowrap cursor-pointer select-none"
              onClick={() => document.getElementById('home-date-picker-mobile')?.click()}
              title="Choisir la date"
            >
              {fullDateFr}
            </span>
            <span
              className="inline-flex items-center rounded-full bg-sport-green/10 text-sport-green px-3 py-1 text-xs font-medium whitespace-nowrap cursor-pointer select-none"
              onClick={() => document.getElementById('home-date-picker-mobile')?.click()}
              title="اختيار التاريخ"
            >
              {fullDate}
            </span>
            {mainLeaguesOnly ? (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {selectedLeagues.length > 0 ? `دوريات مختارة (${selectedLeagues.length})` : 'الدوريات الرئيسية'}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap">كل الدوريات</span>
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
                  <path d="M12 7l2.2 1.6-.8 2.5H10.6l-.8 2.5L12 7zm-5.8 3.5l2.6-.2 1 2.4-1.9 1.6-1.7-1.4.1-2.4zm11.6 0l.1 2.4-1.7 1.4-1.9-1.6 1-2.4 2.5.2zM9.9 15.6l1.1-2.3h2l1.1 2.3-2.1 1.5-2.1-1.5z" />
                </svg>
              </div>
              <div className="text-sm font-semibold">مباريات {weekday}</div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{fullDate}</div>
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
                      {fixtures.map((fx: any) => {
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
