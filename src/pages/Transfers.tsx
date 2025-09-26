import SEO from "@/components/SEO";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { footballAPI, MAIN_LEAGUES, SELECTED_LEAGUES } from "@/config/api";
import TransferCard from "@/components/TransferCard";
import { useState, useEffect, useMemo, useDeferredValue } from "react";
import "../styles/rtl.css";


const Transfers = () => {
  const { t, currentLanguage } = useTranslation();
  const [selectedSeason, setSelectedSeason] = useState(2025);
  const isRTL = currentLanguage === "ar";
  const isMobile = useIsMobile();

  // NEW: Fast preview state for global transfers
  const [fastPreview, setFastPreview] = useState<any[] | null>(null);
  const [fastPreviewLoading, setFastPreviewLoading] = useState(true);
  const [fastPreviewError, setFastPreviewError] = useState<string | null>(null);

  // Hook for main leagues transfers (détail)
  const { data, loading, error } = useMainLeaguesTransfers(selectedSeason);

  // Fast preview: fetch global recent transfers on mount/season change
  useEffect(() => {
    let cancelled = false;
    setFastPreviewLoading(true);
    setFastPreviewError(null);
    setFastPreview(null);
    import("../config/api").then(({ footballAPI }) => {
      footballAPI.getAllRecentTransfers(selectedSeason)
        .then(res => {
          if (!cancelled) {
            setFastPreview(Array.isArray(res?.response) ? res.response : []);
            setFastPreviewLoading(false);
          }
        })
        .catch(e => {
          if (!cancelled) {
            setFastPreviewError("Erreur chargement rapide");
            setFastPreviewLoading(false);
          }
        });
    });
    return () => { cancelled = true; };
  }, [selectedSeason]);

  // directRaw and fallback fetching removed

  // Barre de recherche
  const [search, setSearch] = useState("");
  // Sélection de ligue
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [leagueTeamsMap, setLeagueTeamsMap] = useState<Record<number, Set<number>>>({});
  useEffect(() => {
    // Charger en parallèle les équipes pour chaque ligue (plus rapide sur mobile)
    const loadTeams = async () => {
      const probeSeason = selectedSeason || new Date().getFullYear();
      const entries = await Promise.all(
        SELECTED_LEAGUES.map(async (lid) => {
          try {
            const res = await footballAPI.getTeamsByLeague(lid, probeSeason);
            const ids = new Set<number>((res?.response || []).map((r: any) => r?.team?.id).filter((x: any) => typeof x === 'number'));
            return [lid, ids] as const;
          } catch {
            return [lid, new Set<number>()] as const;
          }
        })
      );
      const map: Record<number, Set<number>> = {};
      for (const [lid, ids] of entries) {
        if (ids.size > 0) map[lid] = ids;
      }
      setLeagueTeamsMap(map);
    };
    loadTeams();
  }, [selectedSeason]);
  // Pagination (responsive)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  useEffect(() => {
    setPageSize(20);
  }, [isMobile]);

  // Tri par date décroissante (sans filtrage strict par saison pour garantir l'affichage)
  // Les hooks `useMainLeaguesTransfers` renvoient déjà une liste aplatie de transferts enrichis
  interface LocalTransfer {
    date?: string | null;
    update?: string | null;
    transfers?: LocalTransfer[];
    player?: Record<string, unknown>;
    [k: string]: unknown;
  }

  type TransferLike = LocalTransfer;

  // Utiliser directement la réponse du hook (clubs des 5 ligues sélectionnées)
  const allTransfers: TransferLike[] = Array.isArray(data?.response) ? (data!.response as unknown as TransferLike[]) : [];

  // Supprimer les fallbacks HTML externes pour garder l'API officielle uniquement

  // If no transfers exist for the currently selected season but we have data,
  // automatically switch to the most recent year present so the UI isn't empty.
  // No data-driven season auto-switch (API calls removed)
  const sortedTransfers = useMemo(() => {
    return allTransfers.slice().sort((a, b) => {
      const getTime = (t: TransferLike) => {
        const s = (t as LocalTransfer)?.normalizedDate || t.date || t.update || null;
        const n = s ? Date.parse(String(s)) : NaN;
        return Number.isNaN(n) ? 0 : n;
      };
      return getTime(b) - getTime(a);
    });
  }, [allTransfers]);

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



  // Fallback automatique : si aucun transfert pour la saison sélectionnée, prendre la saison la plus récente disponible
  const transfersForSeason = useMemo(() => {
    const filtered = sortedTransfers.filter(tr => getTransferYear(tr) === selectedSeason);
    if (filtered.length > 0) return filtered;
    // Fallback : trouver la saison la plus récente avec des transferts
    const years = sortedTransfers.map(getTransferYear).filter(y => !!y) as number[];
    const mostRecentYear = years.length > 0 ? Math.max(...years) : null;
    if (mostRecentYear && mostRecentYear !== selectedSeason) {
      return sortedTransfers.filter(tr => getTransferYear(tr) === mostRecentYear);
    }
    return filtered;
  }, [sortedTransfers, selectedSeason]);

  // Filtrer uniquement par ligue sélectionnée (pas de VIP)
  const leagueFiltered = useMemo(() => (
    transfersForSeason.filter((t) => {
      if (!selectedLeagueId) return true;
      const set = leagueTeamsMap[selectedLeagueId];
      if (!set) return true;
      const outId = (t as TransferLike)?.teams?.out?.id;
      const inId = (t as TransferLike)?.teams?.in?.id;
      return (typeof outId === 'number' && set.has(outId)) || (typeof inId === 'number' && set.has(inId));
    })
  ), [transfersForSeason, selectedLeagueId, leagueTeamsMap]);

  // Appliquer le filtre de recherche (nom joueur ou club entrant) et trier par montant
  const deferredSearch = useDeferredValue(search);
  const filteredTransfers = useMemo(() => {
    const filtered = leagueFiltered.filter((t) => {
      const text = deferredSearch.trim().toLowerCase();
      if (!text) return true;
      const playerName = String((t as TransferLike)?.player?.name || '').toLowerCase();
      const fromName = String((t as TransferLike)?.teams?.out?.name || '').toLowerCase();
      const toName = String((t as TransferLike)?.teams?.in?.name || '').toLowerCase();
      return playerName.includes(text) || fromName.includes(text) || toName.includes(text);
    });
    // Tri par montant décroissant si disponible
    return filtered.slice().sort((a, b) => {
      const feeA = typeof a.fee === 'number' ? a.fee : 0;
      const feeB = typeof b.fee === 'number' ? b.fee : 0;
      return feeB - feeA;
    });
  }, [leagueFiltered, deferredSearch]);

  // Aucun fallback multi-années: si vide, on affiche vide (conforme au besoin)

  // Pagination
  const { totalPages, safePage, paginatedTransfers } = useMemo(() => {
    const total = Math.ceil(filteredTransfers.length / pageSize) || 1;
    const safe = Math.min(page, total);
    const slice = filteredTransfers.slice((safe - 1) * pageSize, safe * pageSize);
    return { totalPages: total, safePage: safe, paginatedTransfers: slice };
  }, [filteredTransfers, pageSize, page]);

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

  


  // Show fast preview if main data is loading
  if (loading && (fastPreviewLoading || !fastPreview)) {
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

  // Show fast preview results if available and main data is still loading
  if (loading && fastPreview && fastPreview.length > 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background ${isRTL ? 'rtl' : 'ltr'}`}>
        <SEO 
          title="الانتقالات | كورة - آخر انتقالات اللاعبين والصفقات"
          description="تابع آخر انتقالات اللاعبين وصفقات الأندية في الدوريات العربية والعالمية. أحدث الأخبار والشائعات حول انتقالات النجوم."
          keywords={["انتقالات اللاعبين", "صفقات الأندية", "انتقالات كرة القدم", "سوق الانتقالات", "أخبار الانتقالات"]}
          type="website"
        />
        <Header />
        <TeamsLogos />
        <div className="w-full max-w-7xl mx-auto px-4 py-3">
          <div className="space-y-6">
            <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'} flex-wrap`}>
              <div className={`${isRTL ? 'text-right' : 'text-left'} min-w-[200px] flex-1`} />
              <div className="flex gap-2 overflow-x-auto md:overflow-visible py-1">
                <Button variant="outline" size="sm">
                  <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? "نافذة الانتقالات" : "Transfer Window"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-blue-100 border-blue-300"
                >
                  {isRTL ? "2025" : "2025"}
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {isRTL ? `انتقالات ${selectedSeason}/${selectedSeason + 1}` : `Transfers ${selectedSeason}/${selectedSeason + 1}`}
                  <span className="ml-2 text-xs text-gray-400">{isRTL ? "عرض سريع" : "Fast preview"}</span>
                </h2>
              </div>
              <div className="mb-1 flex justify-center">
                <input
                  type="text"
                  disabled
                  value={search}
                  placeholder={isRTL ? "تحميل..." : "Loading..."}
                  className={`w-full max-w-xl h-11 px-5 ${isRTL ? 'text-right' : 'text-left'} rounded-full bg-[hsl(var(--input))] border border-transparent text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]`}
                  style={{ direction: isRTL ? "rtl" : "ltr" }}
                />
              </div>
              <div className="space-y-4 sm:space-y-3">
                {fastPreview.map((transfer, index) => {
                  const t = transfer as Record<string, unknown>;
                  const player = t['player'] as Record<string, unknown> | undefined;
                  const pid = player?.['id'] ?? 'unknown';
                  const dateKey = t['date'] ?? t['normalizedDate'] ?? 'nodate';
                  return (
                    <TransferCard key={`fast-${pid}-${dateKey}-${index}`} transfer={transfer as any} />
                  );
                })}
              </div>
              <div className="text-center text-xs text-gray-400 pt-4">
                {isRTL ? "يتم تحميل التفاصيل الكاملة..." : "Loading full details..."}
              </div>
            </div>
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
      <SEO 
        title="الانتقالات | كورة - آخر انتقالات اللاعبين والصفقات"
        description="تابع آخر انتقالات اللاعبين وصفقات الأندية في الدوريات العربية والعالمية. أحدث الأخبار والشائعات حول انتقالات النجوم."
        keywords={["انتقالات اللاعبين", "صفقات الأندية", "انتقالات كرة القدم", "سوق الانتقالات", "أخبار الانتقالات"]}
        type="website"
      />
      <Header />
      <TeamsLogos />
      <div className="w-full max-w-7xl mx-auto px-4 py-3">
        {/* Main Content full width */}
        <div className="space-y-6">
            <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'} flex-wrap`}>
              <div className={`${isRTL ? 'text-right' : 'text-left'} min-w-[200px] flex-1`}
              >
               
              </div>
              
              <div className="flex gap-2 overflow-x-auto md:overflow-visible py-1">
                <Button variant="outline" size="sm">
                  <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? "نافذة الانتقالات" : "Transfer Window"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-blue-100 border-blue-300"
                >
                  {isRTL ? "2025" : "2025"}
                </Button>
              </div>
            </div>

            {/* Latest Confirmed Transfers */}
            <div className="space-y-4">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {isRTL ? `انتقالات ${selectedSeason}/${selectedSeason + 1}` : `Transfers ${selectedSeason}/${selectedSeason + 1}`}
                </h2>
              </div>
              
              
              
              
              {/* Barre de recherche */}
              {/* Debug supprimé */}
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

              {/* Sélecteur de ligue (pills) */}
              <div className="w-full overflow-x-auto pb-2">
                <div className={`flex items-center gap-2 sm:gap-3 min-w-max ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {[{
                    id: MAIN_LEAGUES.PREMIER_LEAGUE, label: isRTL ? 'الإنجليزي' : 'Premier League'
                  }, {
                    id: MAIN_LEAGUES.LA_LIGA, label: isRTL ? 'الإسباني' : 'La Liga'
                  }, {
                    id: MAIN_LEAGUES.BUNDESLIGA, label: isRTL ? 'الألماني' : 'Bundesliga'
                  }, {
                    id: MAIN_LEAGUES.SERIE_A, label: isRTL ? 'الإيطالي' : 'Serie A'
                  }, {
                    id: MAIN_LEAGUES.LIGUE_1, label: isRTL ? 'الفرنسي' : 'Ligue 1'
                  }].map(l => (
                    <button
                      key={l.id}
                      onClick={() => { setSelectedLeagueId(prev => prev === l.id ? null : l.id); setPage(1); }}
                      className={`px-3 sm:px-4 h-8 sm:h-9 rounded-full border text-xs sm:text-sm whitespace-nowrap transition-all font-medium ${selectedLeagueId === l.id ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-white dark:bg-[#181a20] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-[#23262f] hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-md'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Debug: nombre de transferts trouvés */}
              
              {paginatedTransfers.length > 0 ? (
                <div className="space-y-4 sm:space-y-3">
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
              ) : (
                // Fallback : si aucun transfert pour la saison sélectionnée, afficher tous les transferts disponibles (20 max)
                filteredTransfers.length > 0 ? (
                  <div className="space-y-4 sm:space-y-3">
                    {filteredTransfers.slice(0, 20).map((transfer, index) => {
                      const t = transfer as Record<string, unknown>;
                      const player = t['player'] as Record<string, unknown> | undefined;
                      const pid = player?.['id'] ?? 'unknown';
                      const dateKey = t['date'] ?? t['normalizedDate'] ?? 'nodate';
                      return (
                        <TransferCard key={`fallback-${pid}-${dateKey}-${index}`} transfer={transfer as unknown as TransferEnriched} />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="text-6xl mb-4">⚽</div>
                    <div className="text-lg font-medium">
                      {isRTL ? "لا توجد انتقالات متاحة حالياً" : "No transfers available right now"}
                    </div>
                  </div>
                )
              )}

              {/* Pagination (always visible) */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                
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
