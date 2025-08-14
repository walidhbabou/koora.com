import { Calendar, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MatchCard from "./MatchCard";
import { useEffect, useState } from "react";
import { footballAPI } from "@/config/api";

const Sidebar = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        // You can use getLiveFixtures() or getTodayFixtures() depending on your needs
        const res = await footballAPI.getTodayFixtures();
        // Map API response to MatchCard format
        const mapped = (res.response || []).map((fixture: any) => ({
          homeTeam: fixture.teams.home.name,
          awayTeam: fixture.teams.away.name,
          homeScore: fixture.goals.home,
          awayScore: fixture.goals.away,
          time: fixture.status === "FT" ? "انتهت" : fixture.status === "LIVE" ? fixture.score.halftime.home + ":" + fixture.score.halftime.away : fixture.time || fixture.date,
          status: fixture.status === "LIVE" ? "live" : fixture.status === "FT" ? "finished" : "upcoming",
          competition: fixture.league?.name || "-"
        }));
        setMatches(mapped);
      } catch (err: any) {
        setError("خطأ في جلب المباريات");
      }
      setLoading(false);
    };
    fetchMatches();
  }, []);

  // Dynamic date navigation with day selection
  const daysAr = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const monthsAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dayName = daysAr[selectedDate.getDay()];
  const dayNum = selectedDate.getDate();
  const monthName = monthsAr[selectedDate.getMonth()];
  const yearNum = selectedDate.getFullYear();
  const formattedDate = `${dayNum} ${monthName} ${yearNum}`;

  // Handlers for previous/next day
  const handlePrevDay = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };
  const handleNextDay = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  return (
    <div className="w-80 space-y-6 sticky top-24">
      {/* Date Navigation */}
      <Card className="p-5 bg-gradient-to-br from-card to-sport-light/30 border shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl text-foreground">{dayName}</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hover:bg-sport-green/10 hover:text-sport-green transition-all duration-300">
              <Calendar className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-sport-blue/10 hover:text-sport-blue transition-all duration-300" onClick={() => alert('Filtrer à implémenter!')}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-3 text-sm">
          <button className="hover:text-sport-green transition-colors duration-300 p-1 rounded hover:bg-sport-green/10" onClick={handlePrevDay}>
            ←
          </button>
          <span className="font-medium bg-gradient-to-r from-sport-green to-sport-blue bg-clip-text text-transparent">
            {formattedDate}
          </span>
          <button className="hover:text-sport-green transition-colors duration-300 p-1 rounded hover:bg-sport-green/10" onClick={handleNextDay}>
            →
          </button>
        </div>
      </Card>

      {/* Club Friendlies (now dynamic) */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">CF</span>
            </div>
            <h3 className="font-semibold text-foreground">المباريات اليوم</h3>
          </div>
          <Button variant="ghost" className="text-xs text-sport-blue">
            الأخبار
          </Button>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-muted-foreground">جاري التحميل...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : matches.length > 0 ? (
            matches.map((match, index) => (
              <MatchCard key={index} match={match} />
            ))
          ) : (
            <div className="text-center text-muted-foreground">لا توجد مباريات اليوم</div>
          )}
        </div>
      </Card>

      {/* Scottish Premiership */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">SP</span>
          </div>
          <h3 className="font-semibold text-foreground">الدوري الاسكتلندي الممتاز</h3>
        </div>
        
        <div className="flex space-x-4 text-sm">
          <button className="text-sport-blue font-medium border-b-2 border-sport-blue pb-1">
            الأهداف
          </button>
          <button className="text-muted-foreground hover:text-sport-blue">
            الترتيب
          </button>
          <button className="text-muted-foreground hover:text-sport-blue">
            الأخبار
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Sidebar;