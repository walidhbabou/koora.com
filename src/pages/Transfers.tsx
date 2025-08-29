import Header from "@/components/Header";

import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, TrendingUp, Calendar, Loader2 } from "lucide-react";
import TeamsLogos from "@/components/TeamsLogos";
import { useMainLeaguesTransfers } from "@/hooks/useTransfers";
// Removed per-club fallback list to keep general transfers only
import { useTranslation } from "@/hooks/useTranslation";
import { TransferEnriched } from "@/hooks/useTransfers";
import TransferCard from "@/components/TransferCard";
import { useState } from "react";
import "../styles/rtl.css";

const Transfers = () => {
  const { t, currentLanguage } = useTranslation();
  const currentSeason = 2025; // Forcer l'affichage des transferts de 2025
  const [activeTab, setActiveTab] = useState("confirmed");
  const [selectedSeason, setSelectedSeason] = useState(2025);
  const { data, loading, error } = useMainLeaguesTransfers(selectedSeason);
  const isRTL = currentLanguage === "ar";

  // Barre de recherche
  const [search, setSearch] = useState("");
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Tri par date décroissante (sans filtrage strict par saison pour garantir l'affichage)
  const allTransfers = (data?.response || []);
  const sortedTransfers = allTransfers.slice().sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  // Filtrage par recherche
  const filteredTransfers = sortedTransfers.filter(tr => {
    const playerName = tr.player?.name?.toLowerCase() || "";
    const clubName = tr.teams?.in?.name?.toLowerCase() || "";
    return (
      playerName.includes(search.toLowerCase()) ||
      clubName.includes(search.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransfers.length / pageSize) || 1;
  const safePage = Math.min(page, totalPages);
  const paginatedTransfers = filteredTransfers.slice((safePage - 1) * pageSize, safePage * pageSize);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxShown = 5;
    if (totalPages <= maxShown) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    pages.push(1);
    if (start > 2) pages.push('…');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مؤكد":
      case "confirmed": return "bg-green-500";
      case "شائعة":
      case "rumor": return "bg-yellow-500";
      case "مرفوض":
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const formatTransferFee = (fee: string | number) => {
    if (typeof fee === 'string') return fee;
    if (!fee || fee === 0) return isRTL ? "مجاناً" : "Free";
    if (fee >= 1000000) return `€${(fee / 1000000).toFixed(1)}M`;
    if (fee >= 1000) return `€${(fee / 1000).toFixed(0)}K`;
    return `€${fee}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return isRTL ? "غير محدد" : "TBD";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onImgError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const img = e.currentTarget as HTMLImageElement & { dataset: Record<string, string> };
    if (img.dataset.fallbackApplied === 'true') return;
    img.dataset.fallbackApplied = 'true';
    img.src = '/placeholder.svg';
  };

  

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
        <Header />
        <TeamsLogos />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-sport-green" />
            <span className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
              {isRTL ? "جاري التحميل..." : "Loading..."}
            </span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
        <Header />
        <TeamsLogos />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">{isRTL ? "خطأ في تحميل البيانات" : "Error loading data"}</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      <TeamsLogos />
      <div className="w-full max-w-7xl mx-auto px-4 py-3">
        {/* Main Content full width */}
        <div className="space-y-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sport-dark to-sport-green bg-clip-text text-transparent">
                  {isRTL ? "الانتقالات" : "Transfers"}
                </h1>
                <p className="text-muted-foreground mt-0.5">
                  {isRTL ? "آخر أخبار سوق الانتقالات والصفقات" : "Latest transfer market news and deals"}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? "نافذة الانتقالات" : "Transfer Window"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={selectedSeason === 2025 ? 'bg-blue-100 border-blue-300' : ''}
                  onClick={() => { setSelectedSeason(2025); setPage(1); }}
                >
                  {isRTL ? "2025" : "2025"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={selectedSeason === 2024 ? 'bg-blue-100 border-blue-300' : ''}
                  onClick={() => { setSelectedSeason(2024); setPage(1); }}
                >
                  {isRTL ? "2024" : "2024"}
                </Button>
              </div>
            </div>

            {/* Latest Confirmed Transfers */}
            <div className="space-y-4">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <TrendingUp className="w-5 h-5 text-sport-green" />
                <h2 className="text-xl font-bold text-sport-dark">
                  {isRTL ? `انتقالات ${selectedSeason}/${selectedSeason + 1}` : `Transfers ${selectedSeason}/${selectedSeason + 1}`}
                </h2>
              </div>
              
              
              
              
              {/* Barre de recherche */}
              <div className="mb-1 flex justify-center">
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder={isRTL ? "ابحث عن لاعب أو نادي..." : "Search player or club..."}
                  className={`w-full max-w-xl h-11 px-5 ${isRTL ? 'text-right' : 'text-left'} rounded-full bg-[hsl(var(--input))] border border-transparent text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]`}
                  style={{ direction: isRTL ? "rtl" : "ltr" }}
                />
              </div>

              {paginatedTransfers.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {paginatedTransfers.map((transfer, index) => (
                    <TransferCard key={`${transfer.player?.id || 'unknown'}-${transfer.date || 'nodate'}-${index}`} transfer={transfer} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  {isRTL ? "لا توجد انتقالات متاحة حالياً" : "No transfers available right now"}
                </div>
              )}

              {/* Pagination (always visible) */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{isRTL ? 'العناصر لكل صفحة' : 'Items per page'}:</span>
                  <span className="h-9 inline-flex items-center rounded-md bg-[hsl(var(--input))] px-3 text-sm">50</span>
                  <span className="text-xs text-muted-foreground">{filteredTransfers.length} {isRTL ? 'إجمالي' : 'total'}</span>
                  <span className="text-xs text-muted-foreground">
                    {(() => {
                      const start = filteredTransfers.length ? (safePage - 1) * pageSize + 1 : 0;
                      const end = Math.min(safePage * pageSize, filteredTransfers.length);
                      return isRTL ? `${start}–${end} من ${filteredTransfers.length}` : `${start}–${end} of ${filteredTransfers.length}`;
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" disabled={safePage === 1} onClick={() => setPage(1)}>{isRTL ? 'الأول' : 'First'}</Button>
                  <Button size="sm" variant="outline" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>{isRTL ? 'السابق' : 'Prev'}</Button>
                  {getPageNumbers().map((p, idx) => (
                    typeof p === 'number' ? (
                      <Button
                        key={`p-${p}-${idx}`}
                        size="sm"
                        variant={p === safePage ? 'default' : 'outline'}
                        className={p === safePage ? 'bg-sport text-white' : ''}
                        onClick={() => setPage(p)}
                      >{p}</Button>
                    ) : (
                      <span key={`dots-${idx}`} className="px-2 text-muted-foreground">{p}</span>
                    )
                  ))}
                  <Button size="sm" variant="outline" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>{isRTL ? 'التالي' : 'Next'}</Button>
                  <Button size="sm" variant="outline" disabled={safePage === totalPages} onClick={() => setPage(totalPages)}>{isRTL ? 'الأخير' : 'Last'}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      
      <Footer />
    </div>
  );
};

export default Transfers;
