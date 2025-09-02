import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import Sidebar from "@/components/Sidebar";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Calendar, Filter } from "lucide-react";
import { useTodayMatches } from "@/hooks/useFootballAPI";

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
  // Matches (today)
  const { data: matchesData, loading: loadingMatches } = useTodayMatches({ translateContent: true });
  const today = new Date();
  const weekday = today.toLocaleDateString('ar-EG', { weekday: 'long' });
  const fullDate = today.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const fetchLatestNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("news")
        .select("id, title, content, created_at, image_url, status")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;

      const mapped: NewsCardItem[] = (data || []).map((n: any) => ({
        id: String(n.id),
        title: n.title ?? "-",
        summary:
          (n.content ?? "").toString().replace(/\s+/g, " ").slice(0, 160) +
          ((n?.content && n.content.length > 160) ? "…" : ""),
        imageUrl: n.image_url || "/placeholder.svg",
        publishedAt: n.created_at
          ? new Date(n.created_at).toISOString().slice(0, 10)
          : "",
        category: "أخبار",
      }));

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch gap-4 sm:gap-6 auto-rows-[1fr]">
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
                  <div className="h-full"><NewsCard news={newsItems[0]} size="large" /></div>
                </div>
              )}
              {!loading && newsItems[1] && <div className="h-full"><NewsCard news={newsItems[1]} size="medium" /></div>}
              {!loading && newsItems[2] && <div className="h-full"><NewsCard news={newsItems[2]} size="medium" /></div>}
              {!loading && newsItems[3] && <div className="h-full"><NewsCard news={newsItems[3]} size="small" /></div>}
              {!loading && newsItems[4] && <div className="h-full"><NewsCard news={newsItems[4]} size="small" /></div>}
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
                    <div key={news.id} className="h-full"><NewsCard news={news} size="small" /></div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar (Today Matches) */}
          <div className="hidden md:block md:w-72 lg:w-80 space-y-6 lg:sticky lg:top-28">
            {/* Date/Header Bar */}
            <Card className="p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="font-semibold text-right">{weekday}</div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="w-5 h-5" />
                  <Filter className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center rounded-full bg-sport-green/10 text-sport-green px-3 py-1 text-xs font-medium whitespace-nowrap">{fullDate}</span>
              </div>
            </Card>

            {/* Today Matches summary */}
            <Card className="p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-orange-500 text-white grid place-items-center text-xs font-bold">CF</div>
                  <div className="font-semibold">المباريات اليوم</div>
                </div>
                <div className="text-sport-green text-sm">الأخبار</div>
              </div>

              <div className="mt-3">
                {loadingMatches ? (
                  <div className="h-24 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 animate-pulse" />
                ) : (matchesData?.response?.length ?? 0) === 0 ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/30">
                    لا توجد مباريات لهذا اليوم
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                    {matchesData!.response.slice(0, 6).map((fx: any) => (
                      <div key={fx.fixture?.id || `${fx.league?.id}-${fx.teams?.home?.id}-${fx.teams?.away?.id}`} className="flex items-center justify-between rounded-xl bg-white dark:bg-[#181a20] border border-gray-100 dark:border-[#23262f] px-3 py-2 hover:shadow">
                        <div className="text-xs text-slate-500">{fx.league?.nameTranslated?.arabic || fx.league?.name}</div>
                        <div className="text-sm font-medium">
                          {(fx.teams?.home?.nameTranslated?.arabic || fx.teams?.home?.name) + ' — ' + (fx.teams?.away?.nameTranslated?.arabic || fx.teams?.away?.name)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* League placeholder card (tabs style) */}
        
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
