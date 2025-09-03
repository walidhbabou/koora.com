import Header from "@/components/Header";

import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, TrendingUp, Calendar, Loader2 } from "lucide-react";
import TeamsLogos from "@/components/TeamsLogos";
// Removed per-club fallback list to keep general transfers only
import { useTranslation } from "@/hooks/useTranslation";
import { TransferEnriched, useMainLeaguesTransfers } from "@/hooks/useTransfers";
import TransferCard from "@/components/TransferCard";
import { useState, useEffect } from "react";
import DOMPurify from 'dompurify';
import "../styles/rtl.css";

const Transfers = () => {
  const { t, currentLanguage } = useTranslation();
  const currentSeason = 2025; // Forcer l'affichage des transferts de 2025
  const [activeTab, setActiveTab] = useState("confirmed");
  const [selectedSeason, setSelectedSeason] = useState(2025);
  // Use hook to get transfers data
  const { data, loading, error } = useMainLeaguesTransfers(selectedSeason);
  const isRTL = currentLanguage === "ar";

  // directRaw and fallback fetching removed

  // Barre de recherche
  const [search, setSearch] = useState("");
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Tri par date décroissante (sans filtrage strict par saison pour garantir l'affichage)
  // Normaliser: si API retourne grouped objects (player + transfers[]), aplatir en éléments individuels
  interface LocalTransfer {
    date?: string | null;
    update?: string | null;
    transfers?: LocalTransfer[];
    player?: Record<string, unknown>;
    [k: string]: unknown;
  }

  type TransferLike = LocalTransfer;
  const normalizeResponse = (): TransferLike[] => {
  // No API calls here; normalized response is empty by default. Provide data from props or a parent hook instead.
  const resp: TransferLike[] = [];
  const flattened: TransferLike[] = [];
    resp.forEach((item: TransferLike) => {
      // If object already looks like a single transfer (has date + teams), use directly
      if (item && (item.date || item.teams) ) {
        const normalizedDate = item.date || item.update || null;
        const yearMatch = normalizedDate ? String(normalizedDate).match(/(\d{4})/) : null;
        flattened.push({ ...item, normalizedDate, year: yearMatch ? parseInt(yearMatch[1], 10) : null });
        return;
      }
      // If grouped by player with transfers array
      if (item && Array.isArray(item.transfers) && item.transfers.length > 0) {
        item.transfers.forEach((tr: LocalTransfer) => {
          const normalizedDate = tr?.date || tr?.update || item.update || null;
          const yearMatch = normalizedDate ? String(normalizedDate).match(/(\d{4})/) : null;
          flattened.push({ ...tr, player: item.player, update: item.update, normalizedDate, year: yearMatch ? parseInt(yearMatch[1], 10) : null });
        });
        return;
      }
      // Last fallback: push the item as-is
      flattened.push(item);
    });
    return flattened;
  };

  const allTransfers = normalizeResponse();
  // DEV: log first few normalized items (empty unless parent provides data)
  if (import.meta.env.DEV) {
    console.log('[debug] normalized transfers (first 10):', allTransfers.slice(0, 10));
  }

  // Client-side fallback: try to load a scraped HTML snippet saved at /scraped-transfers.json and sanitize it
  const [scrapedHtml, setScrapedHtml] = useState<string | null>(null);
  useEffect(() => {
    if (allTransfers.length > 0) return;
    (async () => {
      try {
        const r = await fetch('/scraped-transfers.json');
        if (!r.ok) return;
        const j = await r.json();
        if (j && j.html) {
          const clean = DOMPurify.sanitize(String(j.html), { USE_PROFILES: { html: true } });
          setScrapedHtml(clean);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [allTransfers.length]);

  // If no transfers exist for the currently selected season but we have data,
  // automatically switch to the most recent year present so the UI isn't empty.
  // No data-driven season auto-switch (API calls removed)
  const sortedTransfers = allTransfers.slice().sort((a, b) => {
    const getTime = (t: TransferLike) => {
      const s = (t as LocalTransfer)?.normalizedDate || t.date || t.update || null;
      const n = s ? Date.parse(String(s)) : NaN;
      return Number.isNaN(n) ? 0 : n;
    };
    return getTime(b) - getTime(a);
  });

  // Helper: extract year from a transfer record robustly
  const getTransferYear = (tr: LocalTransfer): number | null => {
    const tryParse = (s?: string | null): number | null => {
      if (!s) return null;
      const m = String(s).match(/(\d{4})/);
      if (m) return parseInt(m[1], 10);
      return null;
    };

    if (!tr) return null;

    // Prefer precomputed year if available (could be number or string)
    const trRec = tr as Record<string, unknown>;
    if (typeof trRec['year'] !== 'undefined' && trRec['year'] !== null) {
      const y = Number(String(trRec['year']));
      if (!Number.isNaN(y)) return y;
    }

    // Prefer top-level date
    let year = tryParse(tr.date as string | null);
    if (year) return year;
    // fallback to update timestamp
    year = tryParse(tr.update as string | null);
    if (year) return year;
    // sometimes data nested differently, try nested transfer date
    if (Array.isArray(tr.transfers) && tr.transfers.length > 0) {
      year = tryParse((tr.transfers[0].date as string) || (tr.transfers[0].update as string) || null);
      if (year) return year;
    }
    return null;
  };


  // Filtrer par saison (selectedSeason) en utilisant getTransferYear
  const transfersForSeason = sortedTransfers.filter(tr => getTransferYear(tr) === selectedSeason);

  // Appliquer le filtre de recherche (nom joueur ou club entrant)
  const applySearch = (list: LocalTransfer[]) => list.filter((tr) => {
    const trRec = tr as Record<string, unknown>;
    const player = trRec['player'] as Record<string, unknown> | undefined;
    const teams = trRec['teams'] as Record<string, unknown> | undefined;
    const teamIn = teams?.['in'] as Record<string, unknown> | undefined;
    const playerName = String(player?.['name'] ?? '').toLowerCase();
    const clubName = String(teamIn?.['name'] ?? '').toLowerCase();
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return playerName.includes(q) || clubName.includes(q);
  });

  let filteredTransfers = applySearch(transfersForSeason as LocalTransfer[]);

  // Fallback: if no transfers found for the season, show recent transfers (still respect search)
  if (filteredTransfers.length === 0) {
    filteredTransfers = applySearch(sortedTransfers);
  }

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
              {import.meta.env.DEV && (
                <div className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-100 text-xs text-slate-700">
                  <div className="font-medium mb-1">DEV DEBUG: transfers source</div>
                  <div>main.len: {data?.response?.length ?? 0} • normalized.len: {allTransfers.length}</div>
                  <div className="mt-2">
                    <details>
                      <summary className="cursor-pointer">Mostrar primeros items (raw)</summary>
                      <pre className="whitespace-pre-wrap max-h-48 overflow-auto text-xs">{JSON.stringify((data?.response || []).slice(0,3), null, 2)}</pre>
                    </details>
                  </div>
                </div>
              )}
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
                  {paginatedTransfers.map((transfer, index) => {
                    const t = transfer as Record<string, unknown>;
                    const player = t['player'] as Record<string, unknown> | undefined;
                    const pid = player?.['id'] ?? 'unknown';
                    const dateKey = t['date'] ?? t['normalizedDate'] ?? 'nodate';
                    return (
                      <TransferCard key={`${pid}-${dateKey}-${index}`} transfer={transfer as unknown as TransferEnriched} />
                    );
                  })}
                </div>
              ) : scrapedHtml ? (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: scrapedHtml }} />
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
