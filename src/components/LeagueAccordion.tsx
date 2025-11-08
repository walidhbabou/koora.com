import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { getDisplayTeamName, formatTimeLocalized } from "@/utils/matchUtils";
import { getTeamTranslation } from "@/utils/teamNameMap";
import { useSettings } from "@/contexts/SettingsContext";

interface Match {
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
}

interface League {
  id: number;
  name: string;
  logo: string;
  matchCount: number;
}

interface LeagueAccordionProps {
  leagues: League[];
  matchesByLeague: { [key: number]: Match[] };
  onLeagueSelect?: (leagueId: number) => void;
}

const LeagueAccordion: React.FC<LeagueAccordionProps> = ({ leagues, matchesByLeague, onLeagueSelect }) => {
  const { currentLanguage, isRTL, direction } = useTranslation();
  const { timezone, hourFormat } = useSettings();
  const navigate = useNavigate();
  const [expandedLeagues, setExpandedLeagues] = useState<Set<number>>(new Set());

  const toggleLeague = (leagueId: number) => {
    const newExpanded = new Set(expandedLeagues);
    if (newExpanded.has(leagueId)) {
      newExpanded.delete(leagueId);
    } else {
      newExpanded.add(leagueId);
    }
    setExpandedLeagues(newExpanded);
    
    if (onLeagueSelect) {
      onLeagueSelect(leagueId);
    }
  };

  // Composant pour afficher un match individuel
  const MatchItem = ({ match }: { match: Match }) => {
    const homeLogo = match.teams?.home?.logo;
    const awayLogo = match.teams?.away?.logo;
    const homeName = match.teams?.home?.name || "";
    const awayName = match.teams?.away?.name || "";
    const displayHomeName = getDisplayTeamName(homeName, getTeamTranslation);
    const displayAwayName = getDisplayTeamName(awayName, getTeamTranslation);
    const homeScore = (match.goals?.home ?? match.score?.fulltime?.home ?? 0);
    const awayScore = (match.goals?.away ?? match.score?.fulltime?.away ?? 0);
    
    // Statut du match
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
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-2 overflow-hidden cursor-pointer hover:shadow-md transition-all ${isRTL ? 'rtl' : 'ltr'}`}
        onClick={() => navigate(`/match/${match.id}`, { state: { match } })}
      >
        {/* Corps du match - Design horizontal */}
        <div className={`flex items-center justify-center px-4 py-4 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Nom équipe 1 - plus proche du centre */}
          <div className="text-right">
            <span className={`text-sm font-medium text-slate-800 dark:text-slate-100 ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
              {isRTL ? displayAwayName : displayHomeName}
            </span>
          </div>
          
          {/* Section centrale: Logo1 + Score + Logo2 collés */}
          <div className="flex items-center justify-center">
            {/* Logo équipe 1 */}
            <img 
              src={isRTL ? awayLogo : homeLogo} 
              alt={isRTL ? displayAwayName : displayHomeName} 
              className="w-6 h-6 object-contain flex-shrink-0"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            
            {/* Score collé aux logos */}
            {(isLive || isFinished) ? (
              <div className="flex items-center px-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {isRTL ? awayScore : homeScore}
                </span>
                <span className="text-slate-400 text-sm mx-1">-</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {isRTL ? homeScore : awayScore}
                </span>
              </div>
            ) : (
              <div className="px-2">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {getMatchTimeDisplay()}
                </span>
              </div>
            )}
            
            {/* Logo équipe 2 */}
            <img 
              src={isRTL ? homeLogo : awayLogo} 
              alt={isRTL ? displayHomeName : displayAwayName} 
              className="w-6 h-6 object-contain flex-shrink-0"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          
          {/* Nom équipe 2 - plus proche du centre */}
          <div className="text-left">
            <span className={`text-sm font-medium text-slate-800 dark:text-slate-100 ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
              {isRTL ? displayHomeName : displayAwayName}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div dir={direction} className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className={`bg-slate-50 dark:bg-slate-700/50 px-4 py-3 border-b border-slate-200 dark:border-slate-600 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h3 className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
          {currentLanguage === 'ar' ? 'مباريات اليوم في كرة القدم حسب الدوري' : 'Matches du jour par championnat'}
        </h3>
      </div>

      {/* Liste des ligues */}
      <div className="divide-y divide-slate-100 dark:divide-slate-600">
        {leagues.map((league) => (
          <div key={league.id}>
            {/* Ligne de la ligue */}
            <div 
              className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
              onClick={() => toggleLeague(league.id)}
            >
              {/* Icône d'expansion */}
              <div className="flex items-center">
                {expandedLeagues.has(league.id) ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {/* Contenu principal */}
              <div className={`flex items-center gap-3 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* Logo de la ligue */}
                <img 
                  src={league.logo} 
                  alt={league.name}
                  className="w-6 h-6 object-contain flex-shrink-0"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                
                {/* Nom de la ligue */}
                <span className={`text-sm font-medium text-slate-800 dark:text-slate-100 flex-1 ${currentLanguage === 'ar' ? 'arabic-text' : ''} ${isRTL ? 'text-right' : 'text-left'}`}>
                  {league.name}
                </span>
                
                {/* Nombre de matches */}
                <span className="bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium px-2 py-1 rounded-full min-w-[24px] text-center">
                  ({league.matchCount})
                </span>
              </div>
            </div>

            {/* Contenu étendu - Liste des matches */}
            {expandedLeagues.has(league.id) && (
              <div className={`bg-slate-50 dark:bg-slate-700/30 px-4 py-3 space-y-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                {/* Matches de cette ligue */}
                {(matchesByLeague[league.id] || []).map((match, index) => (
                  <MatchItem 
                    key={`${league.id}-${match.id}-${match.date}-${index}`} 
                    match={match} 
                  />
                ))}
                
                {/* Lien vers le classement */}
                <div className={`pt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <button 
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/standings?league=${league.id}`);
                    }}
                  >
                    {currentLanguage === 'ar' 
                      ? `< ترتيب ${league.name} الممتاز` 
                      : `< Classement ${league.name}`
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeagueAccordion;