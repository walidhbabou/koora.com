import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

interface MatchRowProps {
  match: {
    homeTeam: string;
    awayTeam: string;
    homeScore?: number | null;
    awayScore?: number | null;
    time: string;
    status: 'live' | 'upcoming' | 'finished' | 'halftime';
    competition: string;
    homeLogo?: string;
    awayLogo?: string;
    elapsed?: number;
  };
}

const MatchRow: React.FC<MatchRowProps> = ({ match }) => {
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500 text-white';
      case 'halftime':
        return 'bg-yellow-500 text-white';
      case 'finished':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getStatusText = (status: string, elapsed?: number) => {
    if (status === 'live' && elapsed) {
      return `${elapsed}'`;
    }
    switch (status) {
      case 'live':
        return currentLanguage === 'ar' ? 'مباشر' : 'LIVE';
      case 'halftime':
        return currentLanguage === 'ar' ? 'نهاية الشوط الأول' : 'MI-TEMPS';
      case 'finished':
        return currentLanguage === 'ar' ? 'انتهت' : 'FINI';
      default:
        return match.time;
    }
  };

  const formatScore = (home?: number | null, away?: number | null) => {
    if (home !== null && away !== null && home !== undefined && away !== undefined) {
      return `${home} - ${away}`;
    }
    return 'vs';
  };

  return (
    <div className={`flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-sport-green/30 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Match Details */}
      <div className={`flex-1 flex items-center justify-between gap-2 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Home Team */}
        <div className={`flex items-center gap-1 sm:gap-2 flex-1 min-w-0 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
          <span className="font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">
            {match.homeTeam}
          </span>
          {match.homeLogo && (
            <img 
              src={match.homeLogo} 
              alt={match.homeTeam}
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>

        {/* Score/Time */}
        <div className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] px-2">
          <div className="text-sm sm:text-lg font-bold text-center leading-tight">
            {formatScore(match.homeScore, match.awayScore)}
          </div>
          <Badge 
            className={`text-xs mt-1 px-1.5 sm:px-2 py-0.5 ${getStatusColor(match.status)} min-w-0`}
          >
            <span className="truncate text-xs">
              {getStatusText(match.status, match.elapsed)}
            </span>
          </Badge>
        </div>

        {/* Away Team */}
        <div className={`flex items-center gap-1 sm:gap-2 flex-1 min-w-0 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
          {match.awayLogo && (
            <img 
              src={match.awayLogo} 
              alt={match.awayTeam}
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <span className="font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">
            {match.awayTeam}
          </span>
        </div>
      </div>

      {/* Competition Info - Mobile optimized */}
      <div className="flex-shrink-0 ml-2 sm:ml-4">
        <div className="text-xs text-gray-500 text-right max-w-[60px] sm:max-w-none truncate">
          {match.competition}
        </div>
      </div>

      {/* Actions - Hidden on mobile, visible on larger screens */}
      <div className="flex-shrink-0 hidden lg:flex">
        <div className="flex gap-1 text-gray-400">
          <button className="hover:text-gray-600 text-xs px-2 py-1 transition-colors">
            {currentLanguage === 'ar' ? 'الهدافون' : 'Buteurs'}
          </button>
          <button className="hover:text-gray-600 text-xs px-2 py-1 transition-colors">
            {currentLanguage === 'ar' ? 'الترتيب' : 'Classement'}
          </button>
          <button className="hover:text-gray-600 text-xs px-2 py-1 transition-colors">...</button>
        </div>
      </div>
    </div>
  );
};

export default MatchRow;
