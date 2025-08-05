import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MatchCard from "@/components/MatchCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Trophy } from "lucide-react";

const Matches = () => {
  const liveMatches = [
    {
      homeTeam: "ريال مدريد",
      awayTeam: "برشلونة",
      homeScore: 2,
      awayScore: 1,
      time: "78:45",
      status: 'live' as const,
      competition: "الكلاسيكو - الليجا"
    },
    {
      homeTeam: "مانشستر سيتي",
      awayTeam: "ليفربول",
      homeScore: 1,
      awayScore: 1,
      time: "65:12",
      status: 'live' as const,
      competition: "البريمير ليج"
    }
  ];

  const todayMatches = [
    {
      homeTeam: "الأهلي",
      awayTeam: "الزمالك",
      time: "19:00",
      status: 'upcoming' as const,
      competition: "الدوري المصري"
    },
    {
      homeTeam: "الهلال",
      awayTeam: "النصر",
      time: "20:30",
      status: 'upcoming' as const,
      competition: "دوري روشن السعودي"
    },
    {
      homeTeam: "الوداد",
      awayTeam: "الرجاء",
      time: "21:00",
      status: 'upcoming' as const,
      competition: "البطولة الاحترافية المغربية"
    }
  ];

  const finishedMatches = [
    {
      homeTeam: "باريس سان جيرمان",
      awayTeam: "مارسيليا",
      homeScore: 3,
      awayScore: 1,
      time: "انتهت",
      status: 'finished' as const,
      competition: "الليج 1"
    },
    {
      homeTeam: "يوفنتوس",
      awayTeam: "ميلان",
      homeScore: 2,
      awayScore: 0,
      time: "انتهت",
      status: 'finished' as const,
      competition: "السيريا أ"
    }
  ];

  const leagues = [
    { name: "البريمير ليج", matches: 8, flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "الليجا", matches: 6, flag: "🇪🇸" },
    { name: "البوندسليجا", matches: 4, flag: "🇩🇪" },
    { name: "السيريا أ", matches: 7, flag: "🇮🇹" },
    { name: "الليج 1", matches: 5, flag: "🇫🇷" },
    { name: "دوري الأبطال", matches: 12, flag: "🏆" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6 lg:space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sport-dark to-sport-green bg-clip-text text-transparent">
                  المباريات
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">متابعة النتائج المباشرة وجدول المباريات</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  اختر التاريخ
                </Button>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Trophy className="w-4 h-4 mr-2" />
                  البطولات
                </Button>
              </div>
            </div>

            {/* Live Matches Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h2 className="text-lg sm:text-xl font-bold text-sport-dark">المباريات المباشرة</h2>
                <Badge variant="destructive" className="bg-red-500 text-xs">
                  LIVE
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {liveMatches.map((match, index) => (
                  <MatchCard key={index} match={match} />
                ))}
              </div>
            </div>

            {/* Today's Matches */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-sport-green" />
                <h2 className="text-lg sm:text-xl font-bold text-sport-dark">مباريات اليوم</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {todayMatches.map((match, index) => (
                  <MatchCard key={index} match={match} />
                ))}
              </div>
            </div>

            {/* Finished Matches */}
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-bold text-sport-dark">المباريات المنتهية</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {finishedMatches.map((match, index) => (
                  <MatchCard key={index} match={match} />
                ))}
              </div>
            </div>

            {/* Leagues Quick Access */}
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-bold text-sport-dark">البطولات</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {leagues.map((league, index) => (
                  <Card key={index} className="p-3 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-sport-green">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl">{league.flag}</span>
                        <div>
                          <h3 className="font-semibold text-sport-dark text-sm sm:text-base">{league.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{league.matches} مباراة</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">{league.matches}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Hidden on mobile and tablet */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matches;
