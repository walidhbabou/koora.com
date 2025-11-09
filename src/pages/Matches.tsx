import React, { useState } from "react";
import { getDisplayTeamName, formatDisplayDate, formatTimeLocalized, flattenMatch } from "@/utils/matchUtils";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import MockAPIAlert from "@/components/MockAPIAlert";
import MatchesList from "@/components/MatchesList";
import LeagueAccordion from "@/components/LeagueAccordion";
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

  // Préparer les données pour LeagueAccordion - APRÈS la définition des autres variables
  const leaguesWithCounts = leagues.map(league => {
    const liveCount = (liveMatchesByLeague[league.id] || []).length;
    const scheduledCount = (scheduledMatchesByLeague[league.id] || []).length;
    return {
      id: league.id,
      name: league.name,
      logo: league.logo,
      matchCount: liveCount + scheduledCount
    };
  }).filter(league => league.matchCount > 0);

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
      <div className="container mx-auto px-2 sm:px-3 py-2 sm:py-3 lg:py-4 max-w-[720px] sm:max-w-5xl">
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
          
         
          
          {/* Utilisation du composant MatchesList */}
          <MatchesList 
            matchesByLeague={{
              ...Object.fromEntries(
                leagues.map(league => [
                  league.id, 
                  [
                    ...(liveMatchesByLeague[league.id] || []),
                    ...(scheduledMatchesByLeague[league.id] || [])
                  ]
                ])
              )
            }}
            leagues={leagues}
            currentLanguage={currentLanguage}
          />
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
 {/* Accordéon des ligues */}
          <LeagueAccordion 
            leagues={leaguesWithCounts}
            matchesByLeague={{
              ...Object.fromEntries(
                leagues.map(league => [
                  league.id, 
                  [
                    ...(liveMatchesByLeague[league.id] || []),
                    ...(scheduledMatchesByLeague[league.id] || [])
                  ]
                ])
              )
            }}
            onLeagueSelect={(leagueId) => {
              // Navigation vers les matches d'une ligue spécifique ou autre action
              console.log('Ligue sélectionnée:', leagueId);
            }}
          />

{/* Global modal removed, using page navigation */}
<Footer />
</div>
);
};


export default Matches;