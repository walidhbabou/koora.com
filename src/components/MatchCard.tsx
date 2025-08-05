import { Clock, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Match {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  time: string;
  status: 'live' | 'upcoming' | 'finished';
  competition: string;
}

interface MatchCardProps {
  match: Match;
}

const MatchCard = ({ match }: MatchCardProps) => {
  const getStatusColor = () => {
    switch (match.status) {
      case 'live':
        return 'text-sport-green';
      case 'upcoming':
        return 'text-muted-foreground';
      case 'finished':
        return 'text-sport-dark';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="relative p-3 sm:p-4 hover:shadow-[var(--shadow-hover)] transition-all duration-300 bg-gradient-to-r from-card to-sport-light border-l-4 border-l-transparent hover:border-l-sport-green group overflow-hidden">
      {match.status === 'live' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-sport-green rounded-full animate-pulse shadow-[var(--live-pulse)]"></div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between relative z-10 space-y-3 sm:space-y-0">
        <div className="flex items-center justify-between flex-1">
          {/* Home Team */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">L</span>
            </div>
            <span className="font-medium text-foreground text-sm sm:text-base truncate">{match.homeTeam}</span>
          </div>

          {/* Score or Time */}
          <div className="flex items-center justify-center px-2 sm:px-4">
            {match.status === 'finished' || match.status === 'live' ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-lg sm:text-2xl font-bold text-sport-dark">{match.homeScore}</span>
                <span className="text-muted-foreground text-sm sm:text-base">-</span>
                <span className="text-lg sm:text-2xl font-bold text-sport-dark">{match.awayScore}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className={`font-medium text-xs sm:text-sm ${getStatusColor()}`}>{match.time}</span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center space-x-2 flex-1 justify-end min-w-0">
            <span className="font-medium text-foreground text-sm sm:text-base truncate">{match.awayTeam}</span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
        </div>

        {match.status === 'live' && (
          <Button variant="ghost" size="icon" className="ml-0 sm:ml-4 self-center">
            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-sport-green" />
          </Button>
        )}
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground text-center">
        {match.competition}
      </div>
    </Card>
  );
};

export default MatchCard;