import React, { useState } from "react";
import { getDisplayTeamName, formatDisplayDate, formatTimeLocalized, flattenMatch } from "@/utils/matchUtils";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import MockAPIAlert from "@/components/MockAPIAlert";
import { LEAGUES, getLeagueName } from "@/config/leagues";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useLiveMatches, useMatchesByDateAndLeague } from "@/hooks/useFootballAPI";
import { useTranslation } from "@/hooks/useTranslation";
import { getTeamTranslation } from "@/utils/teamNameMap.ts";
import MatchHeader from "@/components/MatchHeader";
import "../styles/rtl.css";
import "../styles/matches.css";
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

// Composant carte de match moderne inspiré des images
const MatchCard = ({ match, currentLanguage, leagueLogo, leagueName }: { 
  match: import("@/config/api").Fixture, 
  currentLanguage: string,
  leagueLogo?: string,
  leagueName?: string
}) => {
  const { isRTL, direction } = useTranslation();
  const navigate = useNavigate();
  const { timezone, hourFormat } = useSettings();
  
  const homeLogo = match.teams?.home?.logo;
  const awayLogo = match.teams?.away?.logo;
  const homeName = match.teams?.home?.name || "";
  const awayName = match.teams?.away?.name || "";
  const displayHomeName = getDisplayTeamName(homeName, getTeamTranslation);
  const displayAwayName = getDisplayTeamName(awayName, getTeamTranslation);
  const homeScore = (match.goals?.home ?? match.score?.fulltime?.home ?? 0);
  const awayScore = (match.goals?.away ?? match.score?.fulltime?.away ?? 0);
  
  // Statut du match - gérer les deux types possibles (string ou objet)
  const statusData = typeof match.status === 'string' 
    ? { short: match.status, elapsed: null, extra: null } 
    : match.status || {};
  const statusShort = statusData.short || '';
  const elapsed = statusData.elapsed || null;
  const isLive = ['LIVE', '1H', '2H', 'HT', 'ET'].includes(statusShort);
  const isFinished = ['FT', 'AET', 'PEN'].includes(statusShort);
  
  // Obtenir l'heure ou le statut
  const getMatchTimeDisplay = () => {
    if (isLive) {
      if (elapsed) return `${elapsed}'`;
      return currentLanguage === 'ar' ? 'مباشر' : 'LIVE';
    }
    if (isFinished) {
      return currentLanguage === 'ar' ? 'انتهت' : 'FT';
    }
    if (!match.date) return '--:--';
    return formatTimeLocalized(match.date, currentLanguage, timezone, hourFormat);
  };

  return (
    <div 
      dir={direction}
      className={`match-card-container bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-3 overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}
    >
      {/* En-tête avec ligue */}
      <div className={`flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {leagueLogo && (
            <img src={leagueLogo} alt="League" className="w-4 h-4 object-contain" />
          )}
          <span className={`text-xs font-medium text-slate-600 dark:text-slate-300 ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
            {leagueName || match.league?.name || ''}
          </span>
        </div>
        <button 
          className="text-blue-600 dark:text-blue-400 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            // Navigation vers la page de classement
            navigate(`/standings?league=${match.league?.id}`);
          }}
        >
          <span className={`text-xs ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
            {currentLanguage === 'ar' ? '< ترتيب' : 'Classement >'}
          </span>
        </button>
      </div>
      
      {/* Corps du match */}
      <div 
        className={`flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
        onClick={() => navigate(`/match/${match.id}`, { state: { match } })}
      >
        {/* Équipe à droite (away en mode normal, home en RTL) */}
        <div className={`flex flex-col items-center gap-2 flex-1 max-w-[120px] ${isRTL ? '' : 'order-3'}`}>
          <div className="w-12 h-12 flex items-center justify-center">
            {(isRTL ? homeLogo : awayLogo) ? (
              <img 
                src={isRTL ? homeLogo : awayLogo} 
                alt={isRTL ? displayHomeName : displayAwayName} 
                className="w-full h-full object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {(isRTL ? displayHomeName : displayAwayName).charAt(0)}
              </div>
            )}
          </div>
          <span className={`text-sm font-semibold text-slate-800 dark:text-slate-100 text-center line-clamp-2 ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
            {isRTL ? displayHomeName : displayAwayName}
          </span>
        </div>
        
        {/* Score / Heure au centre */}
        <div className={`flex flex-col items-center justify-center px-4 ${isRTL ? '' : 'order-2'}`}>
          {(isLive || isFinished) ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-900 dark:text-white match-score-number">
                  {isRTL ? homeScore : awayScore}
                </span>
                <span className="text-xl text-slate-400">-</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white match-score-number">
                  {isRTL ? awayScore : homeScore}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {statusShort === 'FT' 
                  ? (currentLanguage === 'ar' ? 'انتهت' : 'Terminé')
                  : getMatchTimeDisplay()
                }
              </span>
            </>
          ) : (
            <>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 match-time-display">
                {getMatchTimeDisplay()}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {currentLanguage === 'ar' ? 'م' : 'pm'}
              </span>
            </>
          )}
        </div>
        
        {/* Équipe à gauche (home en mode normal, away en RTL) */}
        <div className={`flex flex-col items-center gap-2 flex-1 max-w-[120px] ${isRTL ? '' : 'order-1'}`}>
          <div className="w-12 h-12 flex items-center justify-center">
            {(isRTL ? awayLogo : homeLogo) ? (
              <img 
                src={isRTL ? awayLogo : homeLogo} 
                alt={isRTL ? displayAwayName : displayHomeName} 
                className="w-full h-full object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                {(isRTL ? displayAwayName : displayHomeName).charAt(0)}
              </div>
            )}
          </div>
          <span className={`text-sm font-semibold text-slate-800 dark:text-slate-100 text-center line-clamp-2 ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
            {isRTL ? displayAwayName : displayHomeName}
          </span>
        </div>
      </div>
      
      {/* Pied de page avec lien vers le classement */}
      <div className={`px-4 py-2 border-t border-slate-200 dark:border-slate-600 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
        <button 
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/standings?league=${match.league?.id}`);
          }}
        >
          <span className={currentLanguage === 'ar' ? 'arabic-text' : ''}>
            {currentLanguage === 'ar' ? '< ترتيب الدوري الفرنسي - الدرجة الثانية' : '< Classement du championnat'}
          </span>
        </button>
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

    // Utiliser le statut si disponible - gérer les deux types
    const statusData = typeof match.status === 'string' 
      ? { short: match.status, elapsed: null } 
      : match.status || {};
    const statusShort = statusData.short || '';
    const isLive = ['LIVE', '1H', '2H', 'HT', 'ET'].includes(statusShort);
    const isFinished = ['FT', 'AET', 'PEN'].includes(statusShort);

    if (isLive) return currentLanguage === 'ar' ? 'مباشر' : 'En direct';
    if (isFinished) return currentLanguage === 'ar' ? 'انتهت' : 'Terminé';

    // Match à venir : utiliser le même format que TeamDetails, avec fuseau et format heure
    return formatTimeLocalized(match.date, currentLanguage, timezone, hourFormat);
  };
  const time = getMatchTime();
  
  // Status helpers for rendering - gérer les deux types
  const statusData = typeof match.status === 'string' 
    ? { short: match.status } 
    : match.status || {};
  const statusShort = statusData.short || '';
  const isLiveState = ['LIVE','1H','2H','HT','ET'].includes(statusShort);
  const isFinishedState = ['FT','AET','PEN'].includes(statusShort);
  const isUpcomingState = !(isLiveState || isFinishedState);
  
  let statusLabel = '';
  if (isLiveState) {
    statusLabel = currentLanguage === 'ar' ? 'مباشر' : 'En direct';
  } else if (isFinishedState) {
    statusLabel = currentLanguage === 'ar' ? 'انتهت المباراة' : 'Terminé';
  } else {
    statusLabel = currentLanguage === 'ar' ? 'موعد المباراة' : 'Heure du match';
  }
  
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
          {/* Affichage par ligue avec nouveau design */}
          {leagues.map(league => {
            const matches = [
              ...(liveMatchesByLeague[league.id] || []),
              ...(scheduledMatchesByLeague[league.id] || [])
            ];
            if (matches.length === 0) return null;
            return (
              <div key={league.id} className="mb-4">
                {/* Liste des matches sans en-tête de groupe */}
                <div className="space-y-2">
                  {matches.map((match, index) => (
                    <MatchCard
                      key={`${match.id}-${match.date}-${index}`}
                      match={match}
                      currentLanguage={currentLanguage}
                      leagueLogo={league.logo}
                      leagueName={league.name}
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