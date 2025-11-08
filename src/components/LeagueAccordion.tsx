import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface League {
  id: number;
  name: string;
  logo: string;
  matchCount: number;
}

interface LeagueAccordionProps {
  leagues: League[];
  onLeagueSelect?: (leagueId: number) => void;
}

const LeagueAccordion: React.FC<LeagueAccordionProps> = ({ leagues, onLeagueSelect }) => {
  const { currentLanguage, isRTL, direction } = useTranslation();
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

            {/* Contenu étendu (placeholder pour futures fonctionnalités) */}
            {expandedLeagues.has(league.id) && (
              <div className={`bg-slate-50 dark:bg-slate-700/30 px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className={`text-xs text-slate-500 dark:text-slate-400 ${currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
                  {currentLanguage === 'ar' 
                    ? `${league.matchCount} مباراة في ${league.name}`
                    : `${league.matchCount} match(es) en ${league.name}`
                  }
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeagueAccordion;