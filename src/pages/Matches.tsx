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

// Composant carte de match stylée avec bouton détails
const MatchCard = ({ match, currentLanguage, onDetails }: { match: import("@/config/api").Fixture, currentLanguage: string, onDetails: (match: any) => void }) => {
  const { isRTL, direction } = useTranslation();
  const homeLogo = match.teams?.home?.logo;
  const awayLogo = match.teams?.away?.logo;
  const homeName = match.teams?.home?.name || "";
  const awayName = match.teams?.away?.name || "";

  // Formatage date/heure
  const getFormattedMatchDateTime = () => {
    if (!match.date) return '';
    const matchDate = new Date(match.date);
    return matchDate.toLocaleString(currentLanguage === 'ar' ? 'ar-SA' : 'fr-FR', {
      day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
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
    return matchDate.toLocaleString(currentLanguage === 'ar' ? 'ar-SA' : 'fr-FR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          {awayLogo ? (
            <img
              src={awayLogo}
              alt={awayNameAr}
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
          <div className={`w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold ${awayLogo ? 'hidden' : ''}`}>A</div>
        </>
      ) : (
        <>
          {awayLogo ? (
            <img
              src={awayLogo}
              alt={awayNameAr}
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
          <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-base ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{awayNameAr}</span>
        </>
      )}
    </div>
    
    {/* Centre: score pour live/terminé, sinon heure au style demandé */}
    <div className="flex flex-col items-center min-w-[100px] w-[100px] text-center">
      {(isLiveState || isFinishedState)
        ? (
          <span className="font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-base">
            {isRTL ? `${awayScore} - ${homeScore}` : `${homeScore} - ${awayScore}`}
          </span>
        ) : (
          currentLanguage === 'ar' && upcomingArabicParts ? (
            <span className="flex items-center justify-center gap-1">
              <span className="font-extrabold text-[#1a2a3a] dark:text-[#f1f5f9] text-base sm:text-lg">{upcomingArabicParts.hhmm}</span>
              <span className="text-sm text-[#1a2a3a] dark:text-[#f1f5f9]">{upcomingArabicParts.mer}</span>
            </span>
          ) : (
            <span className="font-extrabold text-[#1a2a3a] dark:text-[#f1f5f9] text-base sm:text-lg">{time}</span>
          )
        )
      }
    </div>
    
    {/* Home team (left) */}
    <div className={`flex items-center gap-2 min-w-[120px] ${isRTL ? 'justify-end' : 'justify-start'}`}>
      {isRTL ? (
        <>
          {homeLogo ? (
            <img
              src={homeLogo}
              alt={homeNameAr}
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
          <div className={`w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold ${homeLogo ? 'hidden' : ''}`}>H</div>
          <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-base ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{homeNameAr}</span>
        </>
      ) : (
        <>
          <span className={`font-bold text-[#1a2a3a] dark:text-[#f1f5f9] text-base ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>{homeNameAr}</span>
          {homeLogo ? (
            <img
              src={homeLogo}
              alt={homeNameAr}
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
                  <span className="font-bold text-lg flex items-center gap-2">
                    <img src={league.logo} alt={league.name} className="w-6 h-6" />
                    {league.name}
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
                              ? { home: '', away: '', displayDate: new Date(match.date).toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : 'fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' }) }
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