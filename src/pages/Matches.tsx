import React, { useState } from "react";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import DatePicker from "@/components/DatePicker";
import LeagueSelector from "@/components/LeagueSelector";
import MockAPIAlert from "@/components/MockAPIAlert";

import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, QrCode } from "lucide-react";
import { useLiveMatches, useMatchesByDateAndLeague } from "@/hooks/useFootballAPI";
import { useTranslation } from "@/hooks/useTranslation";
import { MAIN_LEAGUES } from "@/config/api";
import { getArabicTeamName } from '@/utils/teamNameMap';
import MatchHeader from "@/components/MatchHeader";
import MatchDetails from "@/components/MatchDetails";
import "../styles/rtl.css";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Composant carte de match stylée avec bouton détails
const MatchCard = ({ match, currentLanguage, onDetails }: { match: import("@/config/api").Fixture, currentLanguage: string, onDetails: (match: any) => void }) => {
  const { isRTL, direction } = useTranslation();
  const homeLogo = match.teams?.home?.logo;
  const awayLogo = match.teams?.away?.logo;
  const homeName = match.teams?.home?.name || "";
  const awayName = match.teams?.away?.name || "";

  // Formatage date/heure (forcer FR pour la date lisible)
  const getFormattedMatchDateTime = () => {
    if (!match.date) return '';
    const matchDate = new Date(match.date);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(matchDate);
  };

  // Statut/heure
  const getMatchTime = () => {
    if (!match.date) return '';
    const matchDate = new Date(match.date);
    const locale = currentLanguage === 'ar' ? 'ar-SA' : 'fr-FR';

    // Prioritize status when available (live/finished)
    const status = match.status || '';
    const isLive = ["LIVE", "1H", "2H", "HT", "ET"].includes(status);
    const isFinished = ["FT", "AET", "PEN"].includes(status);

    if (isLive) return currentLanguage === 'ar' ? 'مباشر' : 'En direct';
    if (isFinished) return currentLanguage === 'ar' ? 'انتهت' : 'Terminé';

    // Upcoming or scheduled: show time only
    if (currentLanguage === 'ar') {
      // Arabic UI: use 24h format without meridiem and with Latin digits (HH:mm)
      const hours = matchDate.getHours();
      const minutes = matchDate.getMinutes();
      const displayHour = hours.toString().padStart(2, '0');
      const displayMin = minutes.toString().padStart(2, '0');
      return `${displayHour}:${displayMin}`;
    }
    // Non-Arabic: 24h format
    return matchDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center p-4 gap-4">
        {/* Heure uniquement */}
        <div className="flex flex-col items-center min-w-[90px]">
          <span className="bg-blue-500 text-white rounded-full px-3 py-0.5 text-xs text-center">{getMatchTime()}</span>
        </div>
        {/* Equipes */}
        <div className={`flex-1 flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}> 
          <div className="flex items-center gap-2">
            {homeLogo ? (
              <img
                src={homeLogo}
                alt={homeName}
                className="w-9 h-9 rounded-full border object-contain"
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
            <div className={`w-9 h-9 rounded-full border bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-sm font-bold ${homeLogo ? 'hidden' : ''}`}>
              H
            </div>
            <span className="font-bold text-md">{homeName}</span>
          </div>
          <div className="text-gray-500 dark:text-gray-300 font-bold text-lg">vs</div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-md">{awayName}</span>
            {awayLogo ? (
              <img
                src={awayLogo}
                alt={awayName}
                className="w-9 h-9 rounded-full border object-contain"
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
            <div className={`w-9 h-9 rounded-full border bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-sm font-bold ${awayLogo ? 'hidden' : ''}`}>
              A
            </div>
          </div>
        </div>
        {/* Bouton détails */}
        <div>
          <Button variant="outline" size="sm" onClick={() => onDetails(match)}>
            {currentLanguage === 'ar' ? 'تفاصيل' : 'Détails'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Ancien composant (gardé pour référence)
const TranslatedMatchRow = ({ match, currentLanguage }: { match: import("@/config/api").Fixture, currentLanguage: string }) => {
  const { isRTL, direction } = useTranslation();
  const homeLogo = match.teams?.home?.logo;
  const awayLogo = match.teams?.away?.logo;
  const homeName = match.teams?.home?.name || "";
  const awayName = match.teams?.away?.name || "";
  // Formatage du temps de début du match
  const getMatchTime = () => {
    if (!match.date) return '';
    const matchDate = new Date(match.date);
    const locale = currentLanguage === 'ar' ? 'ar-SA' : 'fr-FR';

    // Utiliser le statut si disponible
    const status = match.status || '';
    const isLive = ['LIVE', '1H', '2H', 'HT', 'ET'].includes(status);
    const isFinished = ['FT', 'AET', 'PEN'].includes(status);

    if (isLive) return currentLanguage === 'ar' ? 'مباشر' : 'En direct';
    if (isFinished) return currentLanguage === 'ar' ? 'انتهت' : 'Terminé';

    // Match à venir : afficher l'heure
    if (currentLanguage === 'ar') {
      // Arabic UI example style: HH:mm with meridiem AFTER time (e.g., "08:00 م")
      const hours = matchDate.getHours();
      const minutes = matchDate.getMinutes();
      const displayHour = ((hours % 12) || 12).toString().padStart(2, '0');
      const displayMin = minutes.toString().padStart(2, '0');
      const meridiem = hours >= 12 ? 'م' : 'ص';
      return `${displayHour}:${displayMin} ${meridiem}`;
    }
    return matchDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
   const getFormattedMatchDateTime = () => {
    if (!match.date) return '';
    const matchDate = new Date(match.date);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(matchDate);
  };
  const time = getMatchTime();
  // Status helpers for rendering
  const statusShort = match.status || '';
  const isLiveState = ['LIVE','1H','2H','HT','ET'].includes(statusShort);
  const isFinishedState = ['FT','AET','PEN'].includes(statusShort);
  const isUpcomingState = !(isLiveState || isFinishedState);
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
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  // Use static mapping for Arabic UI; keep original for other languages
  const displayHomeName = currentLanguage === 'ar' ? getArabicTeamName(homeName) : homeName;
  const displayAwayName = currentLanguage === 'ar' ? getArabicTeamName(awayName) : awayName;

return (
  <div 
    dir={direction} 
    className={`flex items-center justify-between my-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-[#0f172a] rounded-2xl shadow-sm border border-[#eef0f4] dark:border-[#334155] ${isRTL ? 'rtl' : 'ltr'} hover:shadow-md transition-shadow`}
    onClick={() => setShowMatchDetails(true)}
  >
    {/* Small left image card */}
    <div className={`shrink-0 me-2`}>
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#eef2f7] dark:bg-[#1f2937] border border-[#e5e9f0] dark:border-[#334155] flex items-center justify-center">
        <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
      </div>
    </div>
    {/* Away team (right) - left side of row, take equal space */}
    <div className={`flex items-center gap-2 flex-1 justify-end min-w-[120px] sm:min-w-[160px]`}>
      {isRTL ? (
        <>
          <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-sm sm:text-base ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{displayAwayName}</span>
          {awayLogo ? (
            <img
              src={awayLogo}
              alt={displayAwayName}
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const sib = target.nextElementSibling as HTMLElement | null;
                if (sib) sib.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold ${awayLogo ? 'hidden' : ''}`}>A</div>
          <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-base ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{displayAwayName}</span>
        </>
      )}
    </div>
    
    {/* Centre: score/time only, exactly centered */}
    <div className="flex items-center justify-center w-[120px] min-w-[120px]">
      {(isLiveState || isFinishedState)
        ? (
          <span className="font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-sm sm:text-base">
            {isRTL ? `${awayScore} - ${homeScore}` : `${homeScore} - ${awayScore}`}
          </span>
        ) : (
          <span className="font-extrabold text-[#0f172a] dark:text-[#f1f5f9] text-base sm:text-lg">{currentLanguage==='ar' && upcomingArabicParts ? upcomingArabicParts.hhmm : time}</span>
        )
      }
    </div>
    
    {/* Home team (left) - right side of row, take equal space */}
    <div className={`flex items-center gap-2 flex-1 justify-start min-w-[120px] sm:min-w-[160px]`}>
      {isRTL ? (
        <>
          {homeLogo ? (
            <img
              src={homeLogo}
              alt={displayHomeName}
              className="w-7 h-7 object-contain"
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
          <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-base ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{displayHomeName}</span>
        </>
      ) : (
        <>
          <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-base ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{displayHomeName}</span>
          {homeLogo ? (
            <img
              src={homeLogo}
              alt={displayHomeName}
              className="w-7 h-7 object-contain"
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
    {/* Modal pour les détails du match */}
    {showMatchDetails && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-[#0f172a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentLanguage === 'ar' ? 'تفاصيل المباراة' : 'Détails du match'}
            </h2>
            <button 
              onClick={() => setShowMatchDetails(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="p-4">
            {(() => {
              console.log('Match data being passed to MatchDetails:', match);
              console.log('Match status:', match.status);
              return null;
            })()}
            <MatchDetails 
              match={{
                id: match.id,
                date: match.date,
                time: new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                status: match.status || 'scheduled', // Provide default status if undefined
                venue: undefined,
                referee: undefined,
                league: {
                  id: match.league.id,
                  name: match.league.name,
                  logo: match.league.logo,
                  country: ''
                },
                teams: {
                  home: {
                    id: match.teams.home.id,
                    name: match.teams.home.name,
                    logo: match.teams.home.logo,
                    score: match.goals?.home || undefined
                  },
                  away: {
                    id: match.teams.away.id,
                    name: match.teams.away.name,
                    logo: match.teams.away.logo,
                    score: match.goals?.away || undefined
                  }
                },
                goals: [],
                cards: [],
                substitutions: []
              }}
              onClose={() => setShowMatchDetails(false)}
            />
          </div>
        </div>
      </div>
    )}
  </div>
);
};

const Matches = () => {
  const { currentLanguage, isRTL, direction } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLeagues, setSelectedLeagues] = useState<number[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
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
  const leagues = [
    {
      name: currentLanguage === 'ar' ? "البريمير ليغ" : "Premier League",
      id: MAIN_LEAGUES.PREMIER_LEAGUE,
      logo: "https://media.api-sports.io/football/leagues/39.png"
    },
    {
      name: currentLanguage === 'ar' ? "الليج 1" : "Ligue 1",
      id: MAIN_LEAGUES.LIGUE_1,
      logo: "https://media.api-sports.io/football/leagues/61.png"
    },
    {
      name: currentLanguage === 'ar' ? "دوري أبطال أوروبا" : "Champions League",
      id: MAIN_LEAGUES.CHAMPIONS_LEAGUE,
      logo: "https://media.api-sports.io/football/leagues/2.png"
    },
    {
      name: currentLanguage === 'ar' ? "الليغا الإسبانية" : "La Liga",
      id: MAIN_LEAGUES.LA_LIGA,
      logo: "https://media.api-sports.io/football/leagues/140.png"
    },
    {
      name: currentLanguage === 'ar' ? "البطولة المغربية" : "Botola Maroc",
      id: 200, // Ajout Botola Maroc
      logo: "https://media.api-sports.io/football/leagues/200.png"
    },
    {
      name: currentLanguage === 'ar' ? "البوندسليجا" : "Bundesliga",
      id: MAIN_LEAGUES.BUNDESLIGA,
      logo: "https://media.api-sports.io/football/leagues/78.png"
    }
  ];

  // Fonction pour vérifier si un match est en direct
  const isLiveMatch = (match: unknown): boolean => {
    const matchData = match as { status?: string };
    const status = matchData.status;
    return ['LIVE', '1H', '2H', 'HT', 'ET'].includes(status || '');
  };

  // Helpers status
  const isLiveShort = (s?: string) => ['LIVE','1H','2H','HT','ET'].includes((s||''));
  const isFinishedShort = (s?: string) => ['FT','AET','PEN'].includes((s||''));

  // Regrouper les matchs programmés par ligue
  const scheduledMatchesByLeague: { [key: number]: unknown[] } = {};
  if (selectedMatches.data?.response) {
    leagues.forEach(league => {
      let list = selectedMatches.data.response.filter((match: any) => match.league?.id === league.id && !isLiveMatch(match));
      // apply status filter
      if (statusFilter !== 'all') {
        list = list.filter((m: any) => {
          const s = m.fixture?.status?.short || m.status || '';
          if (statusFilter === 'upcoming') return !(isLiveShort(s) || isFinishedShort(s));
          if (statusFilter === 'live') return isLiveShort(s);
          if (statusFilter === 'finished') return isFinishedShort(s);
          return true;
        });
      }
      // sort by time if requested
      if (sortBy === 'time') {
        list = list.slice().sort((a: any, b: any) => new Date(a.fixture?.date).getTime() - new Date(b.fixture?.date).getTime());
      }
      scheduledMatchesByLeague[league.id] = list;
    });
  }

  // Regrouper les matchs en direct par ligue
  const liveMatchesByLeague: { [key: number]: unknown[] } = {};
  const allLiveMatches = [
    ...(liveMatches.data?.response || []),
    ...(selectedMatches.data?.response || []).filter((match: any) => isLiveMatch(match))
  ];
  leagues.forEach(league => {
    let list = allLiveMatches.filter((match: any) => match.league?.id === league.id);
    if (statusFilter !== 'all') {
      list = list.filter((m: any) => {
        const s = m.fixture?.status?.short || m.status || '';
        if (statusFilter === 'upcoming') return !(isLiveShort(s) || isFinishedShort(s));
        if (statusFilter === 'live') return isLiveShort(s);
        if (statusFilter === 'finished') return isFinishedShort(s);
        return true;
      });
    }
    if (sortBy === 'time') {
      list = list.slice().sort((a: any, b: any) => new Date(a.fixture?.date).getTime() - new Date(b.fixture?.date).getTime());
    }
    liveMatchesByLeague[league.id] = list;
  });

  return (
    <div dir={direction} className={`min-h-screen bg-[#f6f7fa] dark:bg-[#020617] ${isRTL ? 'rtl' : 'ltr'}`}>
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
              setSelectedDate(new Date().toISOString().split('T')[0]);
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
                {/* Affichage des matchs sous forme de cartes */}
                <div>
                  {matches.map((item: any) => {
  // Correction du mapping : extraire les champs depuis item.fixture et autres objets
  const match = {
    id: item.fixture?.id,
    date: item.fixture?.date,
    status: item.fixture?.status?.short || item.status || '',
    league: item.league,
    teams: item.teams,
    goals: item.goals,
    score: item.score,
    // Ajoute d'autres champs utiles si besoin
  };

                    // Check if match is live
                    const isLive = ['LIVE', '1H', '2H', 'HT', 'ET'].includes(match.status || match.status?.short || '');
                    // Check if both scores are 0
                    const bothScoresZero = (match.goals?.home === 0 && match.goals?.away === 0);
                    // If scheduled (not live), use TranslatedMatchRow, else use MatchCard
                    if (!isLive) {
                      return (
                        <TranslatedMatchRow
                          key={match.id}
                          match={{
                            ...match,
                            // If 0-0, override goals for display
                            goals: bothScoresZero
                              ? { 
                                  home: '', 
                                  away: '', 
                                  displayDate: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(match.date)) 
                                }
                              : match.goals
                          }}
                          currentLanguage={currentLanguage}
                        />
                      );
                    }
                    // Default: live match as card
                    return (
                      <MatchCard
                        key={match.id || match.fixture?.id}
                        match={match}
                        currentLanguage={currentLanguage}
                        onDetails={(selected) => setSelectedMatch(selected)}
                      />
                    );
                  })}
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
                    {currentLanguage==='ar' ? (v==='all'?'الكل': v==='upcoming'?'قادمة': v==='live'?'جارية':'انتهت') : (v==='all'?'Tous': v==='upcoming'?'À venir': v==='live'?'En direct':'Terminé')}
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

      {/* Global Match Details Modal */}
      {selectedMatch && (
        <MatchDetails
          match={{
            id: selectedMatch.id,
            date: selectedMatch.date,
            time: new Date(selectedMatch.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: selectedMatch.status || 'scheduled',
            venue: undefined,
            referee: undefined,
            league: {
              id: selectedMatch.league.id,
              name: selectedMatch.league.name,
              logo: selectedMatch.league.logo,
              country: ''
            },
            teams: {
              home: {
                id: selectedMatch.teams.home.id,
                name: selectedMatch.teams.home.name,
                logo: selectedMatch.teams.home.logo,
                score: selectedMatch.goals?.home || undefined
              },
              away: {
                id: selectedMatch.teams.away.id,
                name: selectedMatch.teams.away.name,
                logo: selectedMatch.teams.away.logo,
                score: selectedMatch.goals?.away || undefined
              }
            },
            goals: [],
            cards: [],
            substitutions: []
          }}
          onClose={() => setSelectedMatch(null)}
        />
      )}
      <Footer />
    </div>
  );
};

export default Matches;