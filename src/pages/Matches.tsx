import React, { useState } from "react";
import { isArabic, getDisplayTeamName, formatDisplayDate, formatTimeLocalized, flattenMatch } from "@/utils/matchUtils";
import { Fixture, League, Team } from "@/types/match";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import DatePicker from "@/components/DatePicker";
import LeagueSelector from "@/components/LeagueSelector";
import MockAPIAlert from "@/components/MockAPIAlert";
import { LEAGUES, getLeagueName } from "@/config/leagues";

import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, PlayCircle } from "lucide-react";
import { useLiveMatches, useMatchesByDateAndLeague } from "@/hooks/useFootballAPI";
import { useTranslation } from "@/hooks/useTranslation";
import { MAIN_LEAGUES } from "@/config/api";
import { getTeamTranslation } from "@/utils/teamNameMap.ts";
import MatchHeader from "@/components/MatchHeader";
import "../styles/rtl.css";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from "@/contexts/SettingsContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
// Utility to check if a string contains Arabic characters
// ...existing code...
dayjs.extend(utc);
dayjs.extend(timezone);
// ...existing code...

// Composant carte de match stylée avec bouton détails
const MatchCard = ({ match, currentLanguage, onDetails }: { match: import("@/config/api").Fixture, currentLanguage: string, onDetails: (match: any) => void }) => {
  const { isRTL, direction } = useTranslation();
  const homeLogo = match.teams?.home?.logo;
  const awayLogo = match.teams?.away?.logo;
  const homeName = match.teams?.home?.name || "";
  const awayName = match.teams?.away?.name || "";
  const displayHomeName = getDisplayTeamName(homeName, getTeamTranslation);
  const displayAwayName = getDisplayTeamName(awayName, getTeamTranslation);
  const homeScore = (match.goals?.home ?? match.score?.fulltime?.home ?? 0);
  const awayScore = (match.goals?.away ?? match.score?.fulltime?.away ?? 0);

  // Date affichée sous le centre, alignée avec TeamDetails.tsx
  const { timezone, hourFormat } = useSettings();
  const navigate = useNavigate();
  const getFormattedMatchDateTime = () => formatDisplayDate(match.date, currentLanguage, timezone);

  // Statut/heure
  const getMatchTime = (match, currentLanguage, timezone, hourFormat) => {
    if (!match.date) return '';
    const matchDate = new Date(match.date);

    // Utiliser le statut si disponible
    const status = match.status?.short || '';
    const elapsed = match.status?.elapsed || null;
    const isLive = ['LIVE', '1H', '2H', 'HT', 'ET'].includes(status);
    const isFinished = ['FT', 'AET', 'PEN'].includes(status);

    if (isLive) {
      return elapsed ? `${elapsed}'` : (currentLanguage === 'ar' ? 'مباشر' : 'En direct');
    }
    if (isFinished) {
      return currentLanguage === 'ar' ? 'انتهت' : 'Terminé';
    }

    // Match à venir : utiliser le même format que TeamDetails, avec fuseau et format heure
    return formatTimeLocalized(match.date, currentLanguage, timezone, hourFormat);
  };

  const statusShort = match.status || '';
  const isLiveState = ["LIVE", "1H", "2H", "HT", "ET"].includes(statusShort);
  const isFinishedState = ["FT", "AET", "PEN"].includes(statusShort);

  return (
    <div className="w-full mx-auto mb-2 sm:mb-3">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-row items-center p-2.5 sm:p-3 gap-2.5 sm:gap-3 overflow-hidden">
        {/* Heure et statut */}
        <div className="flex flex-col items-center min-w-[64px]">
          <span className="text-blue-500 text-[12px] sm:text-[14px] font-bold">
            {match.status?.short === 'LIVE' ? `${match.status.elapsed}'` : getMatchTime(match, currentLanguage, timezone, hourFormat)}
          </span>
          {match.status?.short === 'LIVE' && match.status.extra && (
            <span className="text-red-500 text-[10px] sm:text-[12px]">
              +{match.status.extra}'
            </span>
          )}
        </div>
        {/* Équipes et score */}
        <div className="flex-1 basis-0 min-w-0 w-full flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <img src={match.teams?.home?.logo} alt={match.teams?.home?.name} className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-[12px] sm:text-[14px] font-medium truncate">
              {displayHomeName}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[12px] sm:text-[14px] font-bold">
              {match.goals?.home} - {match.goals?.away}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[12px] sm:text-[14px] font-medium truncate">
              {displayAwayName}
            </span>
            <img src={match.teams?.away?.logo} alt={match.teams?.away?.name} className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Ancien composant (gardé pour référence)
const TranslatedMatchRow = ({ match, currentLanguage }: { match: import("@/config/api").Fixture, currentLanguage: string }) => {
  const { isRTL, direction } = useTranslation();
  const { timezone, hourFormat } = useSettings();
  const homeLogo = match.teams?.home?.logo;
  const awayLogo = match.teams?.away?.logo;
  const homeName = match.teams?.home?.name || "";
  const awayName = match.teams?.away?.name || "";
  const displayHomeName = getDisplayTeamName(homeName, getTeamTranslation);
  const displayAwayName = getDisplayTeamName(awayName, getTeamTranslation);

  // Formatage du temps de début du match
  const getMatchTime = () => {
    if (!match.date) return '';
    const matchDate = new Date(match.date);

    // Utiliser le statut si disponible
    const status = match.status || '';
    const isLive = ['LIVE', '1H', '2H', 'HT', 'ET'].includes(status);
    const isFinished = ['FT', 'AET', 'PEN'].includes(status);

    if (isLive) return currentLanguage === 'ar' ? 'مباشر' : 'En direct';
    if (isFinished) return currentLanguage === 'ar' ? 'انتهت' : 'Terminé';

    // Match à venir : utiliser le même format que TeamDetails, avec fuseau et format heure
    return formatTimeLocalized(match.date, currentLanguage, timezone, hourFormat);
  };
   const getFormattedMatchDateTime = () => formatDisplayDate(match.date, currentLanguage, timezone);
  const time = getMatchTime();
  // Status helpers for rendering
  const statusShort = match.status || '';
  const isLiveState = ['LIVE','1H','2H','HT','ET'].includes(statusShort);
  const isFinishedState = ['FT','AET','PEN'].includes(statusShort);
  const isUpcomingState = !(isLiveState || isFinishedState);
  const statusLabel = isLiveState
    ? (currentLanguage === 'ar' ? 'مباشر' : 'En direct')
    : isFinishedState
      ? (currentLanguage === 'ar' ? 'انتهت المباراة' : 'Terminé')
      : (currentLanguage === 'ar' ? 'موعد المباراة' : 'Heure du match');
  const matchDateObj = match.date ? new Date(match.date) : null;
  const upcomingArabicParts = (() => {
    if (!matchDateObj) return null;
    const h = matchDateObj.getHours();
    const m = matchDateObj.getMinutes();
    const hh = ((h % 12) || 12).toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const mer = h >= 12 ? 'م' : 'ص';
    return { hhmm: `${hh}:${mm}`, mer };
  })();
  const homeScore = match.goals?.home ?? 0;
  const awayScore = match.goals?.away ?? 0;

  const navigate = useNavigate();
  return (
    <div
      dir={direction}
      className={`flex flex-row items-center justify-between my-1.5 sm:my-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-[#0f172a] rounded-2xl shadow-sm border border-[#eef0f4] dark:border-[#334155] ${isRTL ? 'rtl' : 'ltr'} hover:shadow-md transition-shadow`}
      onClick={() => navigate(`/match/${match.id}`, { state: { match } })}
    >
      {/* Left: play badge */}
      <div className={`shrink-0 me-2 hidden sm:block`}>
        <div className="w-8 h-8 rounded-xl bg-[#e9edf5] dark:bg-[#1f2937] border border-[#e5e9f0] dark:border-[#334155] flex items-center justify-center">
          <PlayCircle className="w-5 h-5 text-blue-500" />
        </div>
      </div>
      <div className={`flex items-center gap-2 sm:gap-2.5 flex-1 basis-0 min-w-0 justify-end`}>
      {isRTL ? (
        <>
          <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-sm sm:text-base whitespace-nowrap truncate max-w-[120px] sm:max-w-[200px] ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{displayAwayName}</span>
          {awayLogo ? (
            <img
              src={awayLogo}
              alt={displayAwayName}
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const sib = target.nextElementSibling as HTMLElement | null;
                if (sib) sib.classList.remove('hidden');
              }}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          ) : null}
          <div className={`w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold ${awayLogo ? 'hidden' : ''}`}>A</div>
        </>
      ) : (
        <>
          {awayLogo ? (
            <img
              src={awayLogo}
              alt={displayAwayName}
              className="w-7 h-7 object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const sib = target.nextElementSibling as HTMLElement | null;
                if (sib) sib.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold ${awayLogo ? 'hidden' : ''}`}>A</div>
          <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-sm sm:text-base whitespace-nowrap truncate max-w-[120px] sm:max-w-[200px] ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{displayAwayName}</span>
        </>
      )}
    </div>
    
    {/* Centre: status label + score/time, stacked */}
    <div className="flex flex-col items-center justify-center w-[90px] min-w-[90px] sm:w-[140px] sm:min-w-[140px]">
      <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 whitespace-nowrap">{statusLabel}</span>
        {(isLiveState || isFinishedState)
          ? (
            <span className="font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-sm sm:text-base">
              {isRTL ? `${awayScore} - ${homeScore}` : `${homeScore} - ${awayScore}`}
            </span>
          ) : (
            currentLanguage === 'ar' && isUpcomingState && upcomingArabicParts ? (
              <span className="font-extrabold text-[#0f172a] dark:text-[#f1f5f9] text-sm sm:text-base">
                {upcomingArabicParts.hhmm} {upcomingArabicParts.mer}
              </span>
            ) : (
              <span className="font-extrabold text-[#0f172a] dark:text-[#f1f5f9] text-sm sm:text-base">{time}</span>
            )
          )
        }
    </div>
    
    {/* Home team (left) - right side of row, take equal space */}
  <div className={`flex items-center gap-2 flex-1 basis-0 min-w-0 justify-start`}>
      {isRTL ? (
        <>
          {homeLogo ? (
            <img
              src={homeLogo}
              alt={displayHomeName}
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const sib = target.nextElementSibling as HTMLElement | null;
                if (sib) sib.classList.remove('hidden');
              }}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          ) : null}
          <div className={`w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold ${homeLogo ? 'hidden' : ''}`}>H</div>
          <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-sm sm:text-base whitespace-nowrap truncate max-w-[120px] sm:max-w-[200px] ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{displayHomeName}</span>
        </>
      ) : (
        <>
          <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-sm sm:text-base whitespace-nowrap truncate max-w-[120px] sm:max-w-[200px] ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{displayHomeName}</span>
          {homeLogo ? (
            <img
              src={homeLogo}
              alt={displayHomeName}
              className="w-7 h-7 object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const sib = target.nextElementSibling as HTMLElement | null;
                if (sib) sib.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold ${homeLogo ? 'hidden' : ''}`}>H</div>
        </>
      )}
    </div>
    {/* Modal removed: navigation is used instead */}
  </div>
);
};

// Utilitaire pour aplatir un match (issu de l'API ou déjà à plat)
// ...existing code...

const Matches = () => {
  const { currentLanguage, isRTL, direction } = useTranslation();
  const { timezone, hourFormat } = useSettings();
  const navigate = useNavigate();
  // Use local timezone date (YYYY-MM-DD) to avoid UTC off-by-one issues
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [selectedLeagues, setSelectedLeagues] = useState<number[]>([]);
  // const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'league'|'time'>('league');
  const [statusFilter, setStatusFilter] = useState<'all'|'upcoming'|'live'|'finished'>('all');
  const [importanceFilter, setImportanceFilter] = useState<'all'|'important'|'most_important'>('all');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [currentLivePage, setCurrentLivePage] = useState(1);
  const [liveItemsPerPage] = useState(6);
  
  // Utilisation des hooks pour récupérer les données avec cache optimisé
  const liveMatches = useLiveMatches({ 
    translateContent: false,
    refreshInterval: 30000 // 30 secondes pour les matchs en direct
  });
  
  const selectedMatches = useMatchesByDateAndLeague({ 
    date: selectedDate,
    leagueIds: selectedLeagues,
    translateContent: false,
    refreshInterval: 300000 // 5 minutes pour les matchs programmés
  });

  // Données statiques pour les ligues demandées
  const leagues = LEAGUES.map(league => ({
    ...league,
    name: getLeagueName(league, currentLanguage)
  }));

  // Fonction pour vérifier si un match est en direct
  const isLiveMatch = (match: unknown): boolean => {
    const matchData = match as { status?: string };
    const status = matchData.status;
    return ['LIVE', '1H', '2H', 'HT', 'ET'].includes(status || '');
  };

  // Helpers status
  const isLiveShort = (s?: string) => ['LIVE','1H','2H','HT','ET'].includes((s||''));
  const isFinishedShort = (s?: string) => ['FT','AET','PEN'].includes((s||''));

  // Regrouper les matchs programmés par ligue (aplatis)
  const scheduledMatchesByLeague: {
    [key: number]: Array<{
      id: number;
      date: string;
      status: string;
      league: { id: number; name: string; logo: string };
      teams: {
        home: { id: number; name: string; logo: string };
        away: { id: number; name: string; logo: string };
      };
      goals: { home: number; away: number };
      score: {
        halftime?: { home: number; away: number };
        fulltime?: { home: number; away: number };
        extratime?: { home: number; away: number };
        penalty?: { home: number; away: number };
      };
    }>;
  } = {};
  if (selectedMatches.data?.response) {
    leagues.forEach(league => {
      let list = selectedMatches.data.response
        .filter((match: {
          league?: { id: number };
          status?: string;
        }) => (match.league?.id === league.id && !isLiveMatch(match)))
        .map(flattenMatch);

      if (statusFilter !== 'all') {
        list = list.filter((m: {
          status?: string;
        }) => {
          const s = m.status || '';
          if (statusFilter === 'live') return isLiveShort(s);
          if (statusFilter === 'finished') return isFinishedShort(s);
          return true;
        });
      }

      if (sortBy === 'time') {
        list = list.slice().sort((a: { date: string }, b: { date: string }) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }

      scheduledMatchesByLeague[league.id] = list;
    });
  }

  // Regrouper les matchs en direct par ligue (aplatis)
  const liveMatchesByLeague: {
    [key: number]: Array<{
      id: number;
      date: string;
      status: string;
      league: { id: number; name: string; logo: string };
      teams: {
        home: { id: number; name: string; logo: string };
        away: { id: number; name: string; logo: string };
      };
      goals: { home: number; away: number };
      score: {
        halftime?: { home: number; away: number };
        fulltime?: { home: number; away: number };
        extratime?: { home: number; away: number };
        penalty?: { home: number; away: number };
      };
    }>;
  } = {};
  const allLiveMatches = liveMatches.data?.response || [];
  leagues.forEach(league => {
    let list = allLiveMatches
      .filter((match: {
        league?: { id: number };
        date?: string;
      }) => match.league?.id === league.id && match.date?.slice(0, 10) === selectedDate)
      .map(flattenMatch);

    if (statusFilter !== 'all') {
      list = list.filter((m: {
        status?: string;
      }) => {
        const s = m.status || '';
        if (statusFilter === 'live') return isLiveShort(s);
        if (statusFilter === 'finished') return isFinishedShort(s);
        return true;
      });
    }

    if (sortBy === 'time') {
      list = list.slice().sort((a: { date: string }, b: { date: string }) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    liveMatchesByLeague[league.id] = list;
  });

  // Exclure les matchs en direct des matchs programmés
  Object.keys(scheduledMatchesByLeague).forEach(leagueId => {
    const liveIds = (liveMatchesByLeague[leagueId] || []).map(item => item.id);
    scheduledMatchesByLeague[leagueId] = scheduledMatchesByLeague[leagueId].filter(item => {
      return !liveIds.includes(item.id);
    });
  });

  // Simplification des labels pour les filtres
const getFilterLabel = (filter: 'all' | 'upcoming' | 'live' | 'finished', language: string): string => {
  const labels = {
    ar: {
      all: 'الكل',
      upcoming: 'قادمة',
      live: 'جارية',
      finished: 'انتهت'
    },
    fr: {
      all: 'Tous',
      upcoming: 'À venir',
      live: 'En direct',
      finished: 'Terminé'
    }
  };
  return labels[language === 'ar' ? 'ar' : 'fr'][filter];
};

  return (
    <div dir={direction} className={`min-h-screen bg-[#f6f7fa] dark:bg-[#020617] ${isRTL ? 'rtl' : 'ltr'}`}>
      <SEO 
        title="المباريات | كورة - مواعيد ونتائج مباريات كرة القدم"
        description="تابع مواعيد ونتائج جميع مباريات كرة القدم لحظة بلحظة. جداول المباريات، النتائج المباشرة، والإحصائيات الكاملة للدوريات العربية والأوروبية."
        keywords={["مباريات كرة القدم", "نتائج مباشرة", "جداول مباريات", "مواعيد المباريات", "دوري المحترفين", "الدوري الإنجليزي", "الدوري الإسباني"]}
        type="website"
      />
      <Header />
      <TeamsLogos />
      <div className="container mx-auto px-2 sm:px-3 py-2 sm:py-3 lg:py-4 max-w-[720px] sm:max-w-4xl">
        <div className="flex flex-col gap-6">
          <MatchHeader
            selectedDate={selectedDate}
            onDateChange={(date) => {
              setSelectedDate(date);
              setCurrentPage(1);
            }}
            selectedLeagues={selectedLeagues}
            onLeaguesChange={(leagues) => {
              setSelectedLeagues(leagues);
              setCurrentPage(1);
            }}
            onReset={() => {
              setSelectedDate(new Date().toLocaleDateString('en-CA'));
              setSelectedLeagues([]);
              setCurrentPage(1);
              setCurrentLivePage(1);
            }}
            onOpenFilter={() => setShowFilter(true)}
          />
          <MockAPIAlert onRetry={() => {
            liveMatches.refetch();
            selectedMatches.refetch();
          }} />
          {/* Affichage par ligue */}
          {leagues.map(league => {
            const matches = [
              ...(liveMatchesByLeague[league.id] || []),
              ...(scheduledMatchesByLeague[league.id] || [])
            ];
            if (matches.length === 0) return null;
            return (
              <div key={league.id} className="mb-6">
                <div className={`px-3 py-1.5 bg-[#eef2f7] dark:bg-[#1f2937] rounded-full border border-[#e5e9f0] dark:border-[#334155] ${isRTL ? 'flex-row-reverse' : ''} flex items-center justify-between` }>
                  <span className={`text-sm font-bold text-[#0f172a] dark:text-[#e2e8f0] ${isRTL ? 'order-2' : 'order-1'} flex items-center gap-2`}>
                    {isRTL ? (
                      <>
                        <img src={league.logo} alt={league.name} className="w-5 h-5" />
                        <span>{league.name}</span>
                      </>
                    ) : (
                      <>
                        <span>{league.name}</span>
                        <img src={league.logo} alt={league.name} className="w-5 h-5" />
                      </>
                    )}
                  </span>
                </div>
               <div>
{matches && matches.map((match, index) => (
<TranslatedMatchRow
key={`${match.id}-${match.date}-${index}`}
    match={match}
currentLanguage={currentLanguage}
/>
))}
</div>
</div>
);
})}
</div>
</div>
{/* Filter Dialog */}
<Dialog open={showFilter} onOpenChange={setShowFilter}>
<DialogContent className="max-w-md">
<DialogHeader>
<DialogTitle className="text-right">{currentLanguage === 'ar' ? 'الفلترة' : 'Filtrer'}</DialogTitle>
</DialogHeader>
<div className={`space-y-4 ${isRTL ? 'rtl text-right' : ''}`}>
<div>
<div className="text-sm mb-2 font-semibold">{currentLanguage === 'ar' ? 'الترتيب حسب' : 'Trier par'}</div>
<div className="flex gap-2">
<Button variant={sortBy==='league'?'default':'outline'} onClick={()=>setSortBy('league')} className="rounded-full px-4">{currentLanguage==='ar'?'البطولة':'Compétition'}</Button>
<Button variant={sortBy==='time'?'default':'outline'} onClick={()=>setSortBy('time')} className="rounded-full px-4">{currentLanguage==='ar'?'التوقيت':'Heure'}</Button>
</div>
</div>
<div>
<div className="text-sm mb-2 font-semibold">{currentLanguage === 'ar' ? 'حالة المباراة' : 'Statut'}</div>
<div className="flex flex-wrap gap-2">
{(['all','upcoming','live','finished'] as const).map(v=> (
<Button key={v} variant={statusFilter===v?'default':'outline'} onClick={()=>setStatusFilter(v)} className="rounded-full px-4">
{getFilterLabel(v, currentLanguage)}
</Button>
))}
</div>
</div>
<div>
<div className="text-sm mb-2 font-semibold">{currentLanguage === 'ar' ? 'الأهمية' : 'Importance'}</div>
<div className="flex gap-2">
<Button variant={importanceFilter==='all'?'default':'outline'} onClick={()=>setImportanceFilter('all')} className="rounded-full px-4">{currentLanguage==='ar'?'الكل':'Tous'}</Button>
<Button variant={importanceFilter==='important'?'default':'outline'} onClick={()=>setImportanceFilter('important')} className="rounded-full px-4">{currentLanguage==='ar'?'الهامة فقط':'Importants'}</Button>
<Button variant={importanceFilter==='most_important'?'default':'outline'} onClick={()=>setImportanceFilter('most_important')} className="rounded-full px-4">{currentLanguage==='ar'?'الأكثر أهمية':'Très importants'}</Button>
</div>
</div>
</div>
<DialogFooter>
<Button onClick={()=>setShowFilter(false)} className="rounded-full w-full bg-emerald-600 hover:bg-emerald-700">{currentLanguage==='ar'?'الفلترة':'Appliquer'}</Button>
</DialogFooter>
</DialogContent>
</Dialog>


{/* Global modal removed, using page navigation */}
<Footer />
</div>
);
};


export default Matches;