import React from "react";
import { useNavigate } from "react-router-dom";
import { getDisplayTeamName, formatTimeLocalized } from "@/utils/matchUtils";
import { useTranslation } from "@/hooks/useTranslation";
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
  logo?: string;
}

interface MatchesListProps {
  matchesByLeague: { [key: number]: Match[] };
  leagues: League[];
  currentLanguage: string;
}

const MatchCard = ({ match, currentLanguage, leagueName }: { 
  match: Match, 
  currentLanguage: string,
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
      dir={direction}
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-2 overflow-hidden cursor-pointer hover:shadow-md transition-all ${isRTL ? 'rtl' : 'ltr'}`}
      onClick={() => navigate(`/match/${match.id}`, { state: { match } })}
    >
      {/* Corps du match - Design horizontal avec logos au centre */}
      <div className={`flex items-center justify-between px-4 py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Équipe 1 avec nom seulement */}
        <div className={`flex items-center flex-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-sm font-medium text-slate-800 dark:text-slate-100 ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
            {isRTL ? displayAwayName : displayHomeName}
          </span>
        </div>
        
        {/* Section centrale avec logos et score */}
        <div className="flex items-center justify-center gap-3 min-w-[140px]">
          {/* Logo équipe 1 */}
          <img 
            src={isRTL ? awayLogo : homeLogo} 
            alt={isRTL ? displayAwayName : displayHomeName} 
            className="w-7 h-7 object-contain flex-shrink-0"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          
          {/* Score */}
          {(isLive || isFinished) ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {isRTL ? awayScore : homeScore}
              </span>
              <span className="text-slate-400 text-sm">-</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {isRTL ? homeScore : awayScore}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {getMatchTimeDisplay()}
            </span>
          )}
          
          {/* Logo équipe 2 */}
          <img 
            src={isRTL ? homeLogo : awayLogo} 
            alt={isRTL ? displayHomeName : displayAwayName} 
            className="w-7 h-7 object-contain flex-shrink-0"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        
        {/* Équipe 2 avec nom seulement */}
        <div className={`flex items-center flex-1 ${isRTL ? 'justify-start' : 'justify-end'}`}>
          <span className={`text-sm font-medium text-slate-800 dark:text-slate-100 ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
            {isRTL ? displayHomeName : displayAwayName}
          </span>
        </div>
      </div>
      
      {/* Footer avec lien vers le classement */}
      <div className={`px-4 py-2 border-t border-slate-100 dark:border-slate-600 ${isRTL ? 'text-right' : 'text-left'}`}>
        <button 
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/standings?league=${match.league?.id}`);
          }}
        >
          {currentLanguage === 'ar' 
            ? `< ترتيب ${leagueName || match.league?.name || 'الدوري'} الممتاز` 
            : `< Classement ${leagueName || match.league?.name || ''}`
          }
        </button>
      </div>
    </div>
  );
};

const MatchesList: React.FC<MatchesListProps> = ({ matchesByLeague, leagues, currentLanguage }) => {
  const { isRTL, direction } = useTranslation();

  return (
    <div dir={direction} className={`${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Affichage des matches par ligue avec header */}
      {leagues.map(league => {
        const matches = matchesByLeague[league.id] || [];
        if (matches.length === 0) return null;
        
        return (
          <div key={league.id} className="space-y-2 mb-6">
            {/* Header de la ligue */}
            <div className={`flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700/30 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
              {league.logo && (
                <img src={league.logo} alt={league.name} className="w-5 h-5 object-contain" />
              )}
              <span className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
                {league.name}
              </span>
            </div>
            
            {/* Liste des matches de cette ligue */}
            {matches.map((match, index) => (
              <MatchCard
                key={`${league.id}-${match.id}-${match.date}-${index}`}
                match={match}
                currentLanguage={currentLanguage}
                leagueName={league.name}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default MatchesList;