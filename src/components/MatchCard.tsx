import React, { useState } from "react";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import DatePicker from "@/components/DatePicker";
import LeagueSelector from "@/components/LeagueSelector";
import MockAPIAlert from "@/components/MockAPIAlert";

import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, PlayCircle } from "lucide-react";
import { useLiveMatches, useMatchesByDateAndLeague } from "@/hooks/useFootballAPI";
import { useTranslation } from "@/hooks/useTranslation";
import { MAIN_LEAGUES } from "@/config/api";
import { getTeamTranslation } from "@/utils/teamNameMap.ts";
import { useTeamListTranslation } from "@/hooks/useTeamTranslation";
import MatchHeader from "@/components/MatchHeader";
import "../styles/rtl.css";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from "@/contexts/SettingsContext";
import { useNavigate } from "react-router-dom";

// Shared formatters to match TeamDetails.tsx, extended with timezone
const formatDisplayDate = (dateString: string, currentLanguage: string, tz: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (currentLanguage === 'ar') {
    // Utiliser le format arabe avec les noms de mois arabes
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    return `${day} ${arabicMonths[month]} ${year}`;
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: tz });
};

const formatTimeLocalized = (dateString: string, currentLanguage: string, tz: string, hourFormat: '12'|'24') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (currentLanguage === 'ar') {
    const parts = new Intl.DateTimeFormat('ar', { hour: '2-digit', minute: '2-digit', hour12: hourFormat === '12', timeZone: tz }).formatToParts(date);
    const dayPeriod = parts.find(p => p.type === 'dayPeriod')?.value || '';
    const hour = parts.find(p => p.type === 'hour')?.value || '';
    const minute = parts.find(p => p.type === 'minute')?.value || '';
    return hourFormat === '12' ? `${dayPeriod} ${hour}:${minute}`.trim() : `${hour}:${minute}`;
  }
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: hourFormat === '12', timeZone: tz }).format(date);
};

// Ajoute un composant pour le chrono visuel
const LiveMinuteCircle = ({ elapsed, extra }: { elapsed: number, extra?: number | null }) => (
  <div className="relative w-8 h-8 flex items-center justify-center">
    <svg className="absolute top-0 left-0" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="15" fill="#fff" stroke="#eee" strokeWidth="2" />
      <circle
        cx="16" cy="16" r="15"
        fill="none"
        stroke="#ef4444"
        strokeWidth="3"
        strokeDasharray={2 * Math.PI * 15}
        strokeDashoffset={2 * Math.PI * 15 * (1 - Math.min((elapsed ?? 0) / 90, 1))}
        style={{ transition: 'stroke-dashoffset 0.3s' }}
      />
    </svg>
    <span className="text-red-600 font-bold text-xs z-10">
      {extra ? `${elapsed}+${extra}` : elapsed}
    </span>
  </div>
);

// Composant carte de match stylée avec bouton détails
const MatchCard = ({ match, currentLanguage, onDetails }: { match: import("@/config/api").Fixture, currentLanguage: string, onDetails: (match: any) => void }) => {
  const { isRTL, direction } = useTranslation();
  const homeLogo = match.teams?.home?.logo;
  const awayLogo = match.teams?.away?.logo;
  const homeName = match.teams?.home?.name || "";
  const awayName = match.teams?.away?.name || "";

  const displayHomeName = currentLanguage === 'ar' ? getTeamTranslation(homeName) : homeName;
  const displayAwayName = currentLanguage === 'ar' ? getTeamTranslation(awayName) : awayName;
  const homeScore = match.goals?.home ?? match.score?.fulltime?.home ?? 0;
  const awayScore = match.goals?.away ?? match.score?.fulltime?.away ?? 0;

  const { timezone, hourFormat } = useSettings();

  // Test avec des valeurs statiques pour le minuteur
  const elapsed = 45; // Valeur statique pour tester
  const extra = 2; // Valeur statique pour tester
  console.log('Elapsed:', elapsed, 'Extra:', extra);

  return (
    <div className="w-full mx-auto mb-2 sm:mb-3">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-row items-center p-2.5 sm:p-3 gap-2.5 sm:gap-3 overflow-hidden">
        {/* Minute Circle */}
        {elapsed !== undefined && (
          <div className="flex items-center">
            <LiveMinuteCircle elapsed={elapsed} extra={extra} />
            <span className="ml-2 text-gray-700">Test Rendering</span>
          </div>
        )}

        {/* Equipes */}
        <div className={`flex-1 basis-0 min-w-0 w-full flex items-center justify-between gap-3 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}> 
          <div className="flex items-center gap-2 min-w-0">
            {homeLogo ? (
              <img
                src={homeLogo}
                alt={homeName}
                className="w-8 h-8 rounded-full border object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            ) : null}
            <span className={`font-bold text-sm sm:text-base truncate max-w-[100px] sm:max-w-[180px] ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{displayHomeName}</span>
          </div>
          <div className="text-gray-700 dark:text-gray-200 font-extrabold text-base sm:text-lg min-w-[56px] w-[64px] text-center shrink-0">
            {(elapsed || extra)
              ? (isRTL ? `${awayScore} - ${homeScore}` : `${homeScore} - ${awayScore}`)
              : 'vs'}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`font-bold text-sm sm:text-base truncate max-w-[100px] sm:max-w-[180px] ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{displayAwayName}</span>
            {awayLogo ? (
              <img
                src={awayLogo}
                alt={awayName}
                className="w-8 h-8 rounded-full border object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            ) : null}
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
  
  // Utiliser la traduction automatique pour les noms d'équ teams
  const teamNames = [homeName, awayName].filter(name => name.trim() !== '');
  const { translatedNames, isInitialized } = useTeamListTranslation(teamNames);
  // Formatage du temps de début du match
  const elapsed = match.statusObj?.elapsed ?? match.status?.elapsed ?? null;
  const extra = match.statusObj?.extra ?? match.status?.extra ?? null;
  const getMatchTime = () => {
    if (!match.date) return '';
    const matchDate = new Date(match.date);

    // Utiliser le statut si disponible
    const status = match.status || '';
    const isLive = ['LIVE', '1H', '2H', 'HT', 'ET'].includes(status);
    const isFinished = ['FT', 'AET', 'PEN'].includes(status);

    if (isLive && elapsed) {
      return <LiveMinuteCircle elapsed={elapsed} extra={extra} />;
    }
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
  // Use automatic translation for Arabic UI; keep original for other languages
  const displayHomeName = currentLanguage === 'ar' 
    ? (isInitialized ? (translatedNames[0] || homeName) : homeName)
    : homeName;
  const displayAwayName = currentLanguage === 'ar' 
    ? (isInitialized ? (translatedNames[1] || awayName) : awayName)
    : awayName;

  const navigate = useNavigate();
  return (
    <div
      dir={direction}
      className={`flex flex-row items-center justify-between py-3 px-2 border-b border-gray-100 dark:border-[#23262f] last:border-b-0 bg-white dark:bg-[#0f172a] ${isRTL ? 'rtl' : 'ltr'} hover:bg-gray-50 dark:hover:bg-[#1f2937] transition-colors cursor-pointer`}
      onClick={() => navigate(`/match/${match.id}`, { state: { match } })}
    >
      {/* Date et heure */}
      <div className="flex flex-col items-start min-w-[80px] sm:min-w-[100px]">
        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {getFormattedMatchDateTime()}
        </span>
        <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
          {getMatchTime()}
        </span>
      </div>
      
      {/* Équipes */}
      <div className="flex-1 flex items-center justify-between mx-3 sm:mx-4">
        {/* Équipe domicile */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
            {displayHomeName}
          </span>
          {homeLogo ? (
            <img
              src={homeLogo}
              alt={displayHomeName}
              className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">H</div>
          )}
        </div>
        
        {/* Score ou VS */}
        <div className="px-2 sm:px-3 text-center min-w-[40px] sm:min-w-[50px]">
          <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            {(isLiveState || isFinishedState)
              ? (isRTL ? `${awayScore} - ${homeScore}` : `${homeScore} - ${awayScore}`)
              : '-'}
          </span>
        </div>
        
        {/* Équipe extérieure */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {awayLogo ? (
            <img
              src={awayLogo}
              alt={displayAwayName}
              className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
          )}
          <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
            {displayAwayName}
          </span>
        </div>
      </div>
      
      {/* Statut du match */}
      <div className="flex flex-col items-end min-w-[60px] sm:min-w-[80px]">
        {isLiveState ? (
          <span className="text-xs font-medium text-red-600">LIVE</span>
        ) : isFinishedState ? (
          <span className="text-xs text-gray-500">Terminé</span>
        ) : (
          <span className="text-xs text-gray-500">À venir</span>
        )}
      </div>
  </div>
);
};

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
      let list = selectedMatches.data.response.filter((match: { league?: { id?: number } }) => match.league?.id === league.id && !isLiveMatch(match));
      // apply status filter
      if (statusFilter !== 'all') {
        list = list.filter((m: { fixture?: { date?: string } }) => {
          const s = m.fixture?.date || '';
          return true;
        });
      }
      // sort by time if requested
      if (sortBy === 'time') {
        list = list.slice().sort((a: { fixture?: { date?: string } }, b: { fixture?: { date?: string } }) => new Date(a.fixture?.date || '').getTime() - new Date(b.fixture?.date || '').getTime());
      }
      scheduledMatchesByLeague[league.id] = list;
    });
  }

  // Regrouper les matchs en direct par ligue
  const liveMatchesByLeague: { [key: number]: unknown[] } = {};
  const allLiveMatches = [
    ...(liveMatches.data?.response || []),
    ...(selectedMatches.data?.response || []).filter((match: { status?: string }) => isLiveMatch(match))
  ];
  leagues.forEach(league => {
    let list = allLiveMatches.filter((match: { league?: { id?: number } }) => match.league?.id === league.id);
    if (statusFilter !== 'all') {
      list = list.filter((m: { fixture?: { date?: string } }) => {
        const s = m.fixture?.date || '';
        return true;
      });
    }
    if (sortBy === 'time') {
      list = list.slice().sort((a: { fixture?: { date?: string } }, b: { fixture?: { date?: string } }) => new Date(a.fixture?.date || '').getTime() - new Date(b.fixture?.date || '').getTime());
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
                {/* Affichage des matchs sous forme de cartes */}
                <div>
                  {matches.map((item: { fixture?: { date?: string } }) => {
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

                    // Always render compact row style like the screenshot
                    const bothScoresZero = (match.goals?.home === 0 && match.goals?.away === 0);
                    return (
                      <TranslatedMatchRow
                        key={match.id}
                        match={{
                          ...match,
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

      {/* Global modal removed, using page navigation */}
      <Footer />
    </div>
  );
};

export default Matches;