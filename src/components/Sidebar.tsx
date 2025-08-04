import { Calendar, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MatchCard from "./MatchCard";

const Sidebar = () => {
  const matches = [
    {
      homeTeam: "Liverpool",
      awayTeam: "A.Bilbao", 
      homeScore: 3,
      awayScore: 0,
      time: "45:00",
      status: 'live' as const,
      competition: "Première mi-temps"
    },
    {
      homeTeam: "Liverpool",
      awayTeam: "A.Bilbao",
      time: "08:00 pm",
      status: 'upcoming' as const,
      competition: "Club Friendlies"
    },
    {
      homeTeam: "Sevilla",
      awayTeam: "Al-Qadsiah",
      time: "08:00 pm", 
      status: 'upcoming' as const,
      competition: "Club Friendlies"
    },
    {
      homeTeam: "Al Ittihad",
      awayTeam: "Uniao de Leiria",
      time: "08:00 pm",
      status: 'upcoming' as const,
      competition: "Club Friendlies"
    },
    {
      homeTeam: "Daegu FC",
      awayTeam: "Barcelona",
      homeScore: 0,
      awayScore: 5,
      time: "Terminé",
      status: 'finished' as const,
      competition: "Club Friendlies"
    }
  ];

  return (
    <div className="w-80 space-y-6">
      {/* Date Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-foreground">Lundi</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Calendar className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <button>←</button>
          <span>4 août 2025</span>
          <button>→</button>
        </div>
      </Card>

      {/* Club Friendlies */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">CF</span>
            </div>
            <h3 className="font-semibold text-foreground">Club Friendlies</h3>
          </div>
          <Button variant="ghost" className="text-xs text-sport-blue">
            Actualités
          </Button>
        </div>
        
        <div className="space-y-3">
          {matches.map((match, index) => (
            <MatchCard key={index} match={match} />
          ))}
        </div>
      </Card>

      {/* Scottish Premiership */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">SP</span>
          </div>
          <h3 className="font-semibold text-foreground">Scottish Premiership</h3>
        </div>
        
        <div className="flex space-x-4 text-sm">
          <button className="text-sport-blue font-medium border-b-2 border-sport-blue pb-1">
            Buts
          </button>
          <button className="text-muted-foreground hover:text-sport-blue">
            Classements
          </button>
          <button className="text-muted-foreground hover:text-sport-blue">
            Actualités
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Sidebar;