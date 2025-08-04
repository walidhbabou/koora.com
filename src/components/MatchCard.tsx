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
    <Card className="relative p-4 hover:shadow-[var(--shadow-hover)] transition-all duration-300 bg-gradient-to-r from-card to-sport-light border-l-4 border-l-transparent hover:border-l-sport-green group overflow-hidden">
      {match.status === 'live' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-sport-green rounded-full animate-pulse shadow-[var(--live-pulse)]"></div>
      )}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-4 flex-1">
          {/* Home Team */}
          <div className="flex items-center space-x-2 flex-1">
            <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">L</span>
            </div>
            <span className="font-medium text-foreground">{match.homeTeam}</span>
          </div>

          {/* Score or Time */}
          <div className="flex items-center space-x-3">
            {match.status === 'finished' || match.status === 'live' ? (
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-sport-dark">{match.homeScore}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-2xl font-bold text-sport-dark">{match.awayScore}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className={`font-medium ${getStatusColor()}`}>{match.time}</span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            <span className="font-medium text-foreground">{match.awayTeam}</span>
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
        </div>

        {match.status === 'live' && (
          <Button variant="ghost" size="icon" className="ml-4">
            <Play className="w-4 h-4 text-sport-green" />
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