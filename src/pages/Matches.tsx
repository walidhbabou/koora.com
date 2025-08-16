import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import DatePicker from "@/components/DatePicker";
import LeagueSelector from "@/components/LeagueSelector";
import MockAPIAlert from "@/components/MockAPIAlert";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw } from "lucide-react";
import { useLiveMatches, useMatchesByDateAndLeague } from "@/hooks/useFootballAPI";
import { useTranslation } from "@/hooks/useTranslation";
import { MAIN_LEAGUES } from "@/config/api";
import { footballTranslationService } from '../services/translationService';
import MatchHeader from "@/components/MatchHeader";
import MatchDetails from "@/components/MatchDetails";
import "../styles/rtl.css";

// Composant pour afficher une ligne de match avec noms traduits
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
    const now = new Date();
    const timeDiff = matchDate.getTime() - now.getTime();
    
    if (timeDiff < 0) {
      // Match terminé ou en cours
      if (match.status === 'FT' || match.status === 'AET' || match.status === 'PEN') {
        return 'Terminé';
      } else if (['LIVE', '1H', '2H', 'HT', 'ET'].includes(match.status)) {
        return 'En cours';
      } else {
        return 'Terminé';
      }
    } else {
      // Match à venir
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `Commence dans ${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `Commence dans ${minutes}m`;
      } else {
        return 'Commence bientôt';
      }
    }
  };
  
  const time = getMatchTime();
  const homeScore = match.goals?.home ?? 0;
  const awayScore = match.goals?.away ?? 0;
  const [showMatchDetails, setShowMatchDetails] = useState(false);

  const [homeNameAr, setHomeNameAr] = useState(homeName);
  const [awayNameAr, setAwayNameAr] = useState(awayName);
  useEffect(() => {
    let mounted = true;
    if (currentLanguage === 'ar') {
      import("@/services/translationService").then(({ footballTranslationService }) => {
        footballTranslationService.translateTeamName(homeName).then(res => {
          if (mounted) setHomeNameAr(res.arabic);
        });
        footballTranslationService.translateTeamName(awayName).then(res => {
          if (mounted) setAwayNameAr(res.arabic);
        });
      });
    } else {
      setHomeNameAr(homeName);
      setAwayNameAr(awayName);
    }
    return () => { mounted = false; };
  }, [homeName, awayName, currentLanguage]);

  return (
    <>
      <div 
        dir={direction} 
        className={`flex items-center justify-between px-4 py-3 border-b border-[#f2f2f2] dark:border-[#334155] last:border-b-0 bg-white dark:bg-[#0f172a] ${isRTL ? 'flex-row-reverse rtl' : 'ltr'} cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors`}
        onClick={() => setShowMatchDetails(true)}
      >
        {/* Away team (right) */}
        <div className={`flex items-center gap-2 min-w-[120px] ${isRTL ? 'justify-start' : 'justify-end'}`}>
          {isRTL ? (
            <>
              <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-base ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{awayNameAr}</span>
              {awayLogo && <img src={awayLogo} alt={awayNameAr} className="w-7 h-7" />}
            </>
          ) : (
            <>
              {awayLogo && <img src={awayLogo} alt={awayNameAr} className="w-7 h-7" />}
              <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-base ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{awayNameAr}</span>
            </>
          )}
        </div>
        {/* Score */}
        <div className="flex flex-col items-center min-w-[70px]">
          <span className="font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-base">{isRTL ? `${awayScore} - ${homeScore}` : `${homeScore} - ${awayScore}`}</span>
          <span className="bg-blue-500 text-white dark:bg-blue-600 dark:text-white rounded-full px-3 py-0.5 text-xs mt-1 text-center">
            {time}
          </span>
        </div>
        {/* Home team (left) */}
        <div className={`flex items-center gap-2 min-w-[120px] ${isRTL ? 'justify-end' : 'justify-start'}`}>
          {isRTL ? (
            <>
              {homeLogo && <img src={homeLogo} alt={homeNameAr} className="w-7 h-7" />}
              <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-base ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{homeNameAr}</span>
            </>
          ) : (
            <>
              <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-base ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{homeNameAr}</span>
              {homeLogo && <img src={homeLogo} alt={homeNameAr} className="w-7 h-7" />}
            </>
          )}
        </div>
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
    </>
  );
};

const Matches = () => {
  const { currentLanguage, isRTL, direction } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLeagues, setSelectedLeagues] = useState<number[]>([]);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [currentLivePage, setCurrentLivePage] = useState(1);
  const [liveItemsPerPage] = useState(6);
  
  // Utilisation des hooks pour récupérer les données
  const liveMatches = useLiveMatches({ 
    translateContent: false,
    refreshInterval: 30000
  });
  
  const selectedMatches = useMatchesByDateAndLeague({ 
    date: selectedDate,
    leagueIds: selectedLeagues,
    translateContent: false,
    refreshInterval: 300000
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

  // Regrouper les matchs programmés par ligue
  const scheduledMatchesByLeague: { [key: number]: unknown[] } = {};
  if (selectedMatches.data?.response) {
    leagues.forEach(league => {
      scheduledMatchesByLeague[league.id] = selectedMatches.data.response.filter(
        (match: any) => match.league?.id === league.id && !isLiveMatch(match)
      );
    });
  }

  // Regrouper les matchs en direct par ligue
  const liveMatchesByLeague: { [key: number]: unknown[] } = {};
  const allLiveMatches = [
    ...(liveMatches.data?.response || []),
    ...(selectedMatches.data?.response || []).filter((match: any) => isLiveMatch(match))
  ];
  leagues.forEach(league => {
    liveMatchesByLeague[league.id] = allLiveMatches.filter(
      (match: any) => match.league?.id === league.id
    );
  });

  return (
    <div dir={direction} className={`min-h-screen bg-[#f6f7fa] dark:bg-[#020617] ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      <TeamsLogos />
      <div className="container mx-auto px-2 sm:px-3 py-2 sm:py-3 lg:py-4 max-w-4xl">
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
              <div key={league.id} className="mb-8">
                <div className={`flex items-center justify-between px-4 py-2 bg-[#eef0f4] dark:bg-[#1e293b] rounded-t-xl border-b border-[#e3e6ea] dark:border-[#334155] ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {league.logo && (
                      <img src={league.logo} alt={league.name} className="w-6 h-6" />
                    )}
                    <span className={`font-bold text-lg text-[#1a2a3a] dark:text-[#f1f5f9] ${isRTL && currentLanguage === 'ar' ? 'arabic-text text-right' : 'text-left'}`}>
                      {league.name}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 bg-white dark:bg-[#0f172a] rounded-b-xl pb-2">
                  {matches.map((match, idx) => (
                    <TranslatedMatchRow key={idx} match={match as import("@/config/api").Fixture} currentLanguage={currentLanguage} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Matches;