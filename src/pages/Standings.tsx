import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

const Standings = () => {
  const premierLeagueStandings = [
    {
      position: 1,
      team: "مانشستر سيتي",
      logo: "/placeholder.svg",
      played: 38,
      won: 28,
      drawn: 7,
      lost: 3,
      goalsFor: 89,
      goalsAgainst: 31,
      goalDifference: 58,
      points: 91,
      form: ["W", "W", "W", "D", "W"],
      trend: "same"
    },
    {
      position: 2,
      team: "آرسنال",
      logo: "/placeholder.svg",
      played: 38,
      won: 26,
      drawn: 6,
      lost: 6,
      goalsFor: 91,
      goalsAgainst: 29,
      goalDifference: 62,
      points: 84,
      form: ["W", "L", "W", "W", "D"],
      trend: "up"
    },
    {
      position: 3,
      team: "ليفربول",
      logo: "/placeholder.svg",
      played: 38,
      won: 24,
      drawn: 10,
      lost: 4,
      goalsFor: 86,
      goalsAgainst: 41,
      goalDifference: 45,
      points: 82,
      form: ["D", "W", "W", "W", "L"],
      trend: "down"
    },
    {
      position: 4,
      team: "تشيلسي",
      logo: "/placeholder.svg",
      played: 38,
      won: 21,
      drawn: 9,
      lost: 8,
      goalsFor: 68,
      goalsAgainst: 47,
      goalDifference: 21,
      points: 72,
      form: ["W", "D", "W", "L", "W"],
      trend: "up"
    },
    {
      position: 5,
      team: "نيوكاسل يونايتد",
      logo: "/placeholder.svg",
      played: 38,
      won: 19,
      drawn: 14,
      lost: 5,
      goalsFor: 68,
      goalsAgainst: 33,
      goalDifference: 35,
      points: 71,
      form: ["D", "D", "W", "W", "D"],
      trend: "same"
    }
  ];

  const leagues = [
    { 
      name: "البريمير ليج", 
      country: "إنجلترا", 
      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 
      active: true,
      teams: 20,
      matchday: 38
    },
    { 
      name: "الليجا", 
      country: "إسبانيا", 
      flag: "🇪🇸", 
      active: false,
      teams: 20,
      matchday: 38
    },
    { 
      name: "البوندسليجا", 
      country: "ألمانيا", 
      flag: "🇩🇪", 
      active: false,
      teams: 18,
      matchday: 34
    },
    { 
      name: "السيريا أ", 
      country: "إيطاليا", 
      flag: "🇮🇹", 
      active: false,
      teams: 20,
      matchday: 38
    },
    { 
      name: "الليج 1", 
      country: "فرنسا", 
      flag: "🇫🇷", 
      active: false,
      teams: 20,
      matchday: 38
    }
  ];

  const getPositionColor = (position: number) => {
    if (position <= 4) return "bg-green-100 border-green-300";
    if (position <= 6) return "bg-blue-100 border-blue-300";
    if (position >= 18) return "bg-red-100 border-red-300";
    return "";
  };

  const getFormResultColor = (result: string) => {
    switch (result) {
      case "W": return "bg-green-500 text-white";
      case "D": return "bg-yellow-500 text-white";
      case "L": return "bg-red-500 text-white";
      default: return "bg-gray-300";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sport-dark to-sport-green bg-clip-text text-transparent">
                  الترتيب
                </h1>
                <p className="text-muted-foreground mt-1">جداول ترتيب البطولات الأوروبية والعربية</p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Trophy className="w-4 h-4 mr-2" />
                  جميع البطولات
                </Button>
              </div>
            </div>

            {/* League Tabs */}
            <div className="flex flex-wrap gap-2">
              {leagues.map((league, index) => (
                <Button
                  key={index}
                  variant={league.active ? "default" : "outline"}
                  className={`${
                    league.active 
                      ? "bg-sport-green text-white" 
                      : "hover:bg-sport-green/10"
                  }`}
                >
                  <span className="mr-2">{league.flag}</span>
                  {league.name}
                </Button>
              ))}
            </div>

            {/* Current League Info */}
            <Card className="p-6 border-l-4 border-l-sport-green">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                  <div>
                    <h2 className="text-xl font-bold text-sport-dark">البريمير ليج الإنجليزي</h2>
                    <p className="text-muted-foreground">الموسم 2024/2025 - الجولة 38</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">عدد الفرق</p>
                  <p className="text-2xl font-bold text-sport-green">20</p>
                </div>
              </div>
            </Card>

            {/* Standings Table */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold text-sport-dark">ترتيب البريمير ليج</h3>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow className="bg-sport-light/10">
                    <TableHead className="text-center w-12">#</TableHead>
                    <TableHead className="text-right">الفريق</TableHead>
                    <TableHead className="text-center w-16">لعب</TableHead>
                    <TableHead className="text-center w-16">فوز</TableHead>
                    <TableHead className="text-center w-16">تعادل</TableHead>
                    <TableHead className="text-center w-16">خسارة</TableHead>
                    <TableHead className="text-center w-20">فارق الأهداف</TableHead>
                    <TableHead className="text-center w-20">النقاط</TableHead>
                    <TableHead className="text-center w-24">الشكل</TableHead>
                    <TableHead className="text-center w-16">الاتجاه</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {premierLeagueStandings.map((team) => (
                    <TableRow 
                      key={team.position}
                      className={`hover:bg-sport-light/10 ${getPositionColor(team.position)}`}
                    >
                      <TableCell className="text-center font-bold">
                        {team.position}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={team.logo} 
                            alt={team.team}
                            className="w-6 h-6"
                          />
                          <span className="font-medium">{team.team}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{team.played}</TableCell>
                      <TableCell className="text-center">{team.won}</TableCell>
                      <TableCell className="text-center">{team.drawn}</TableCell>
                      <TableCell className="text-center">{team.lost}</TableCell>
                      <TableCell className="text-center">
                        <span className={team.goalDifference > 0 ? "text-green-600" : team.goalDifference < 0 ? "text-red-600" : ""}>
                          {team.goalDifference > 0 ? "+" : ""}{team.goalDifference}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-sport-green">
                          {team.points}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          {team.form.map((result, index) => (
                            <span
                              key={index}
                              className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${getFormResultColor(result)}`}
                            >
                              {result}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getTrendIcon(team.trend)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Legend */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-sport-dark mb-4">مفتاح الألوان</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                  <span className="text-sm">دوري الأبطال (1-4)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-200 border border-blue-300 rounded"></div>
                  <span className="text-sm">الدوري الأوروبي (5-6)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
                  <span className="text-sm">الهبوط (18-20)</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Standings;
