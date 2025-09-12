import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { footballAPI, MAIN_LEAGUES } from "@/config/api";
import { getTeamTranslation } from "@/utils/teamNameMap";

interface Fixture {
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  fixture: { date: string; status: { short: string } };
  league: { id: number; name: string; logo: string; country: string };
}

// Traduction ligues
const dictionary: Record<string, string> = {
  "Morocco": "المغرب",
  "Botola Pro": "البطولة المغربية للمحترفين",
  "France": "فرنسا",
  "Ligue 1": "الدوري الفرنسي",
  "England": "إنجلترا",
  "Premier League": "الدوري الإنجليزي الممتاز",
  "Spain": "إسبانيا",
  "La Liga": "الدوري الإسباني",
  "Germany": "ألمانيا",
  "Bundesliga": "الدوري الألماني",
  "Italy": "إيطاليا",
  "Serie A": "الدوري الإيطالي",
  "UEFA Champions League": "دوري أبطال أوروبا",
  "Saudi Arabia": "السعودية",
  "Saudi Pro League": "الدوري السعودي للمحترفين",
  "Egypt": "مصر",
  "Egyptian Premier League": "الدوري المصري الممتاز",
};

function translateName(name: string): string {
  return dictionary[name] || name;
}

const Sidebar = () => {
  const [groupedMatches, setGroupedMatches] = useState<
    Record<
      string,
      {
        leagueLogo: string;
        matches: {
          homeTeam: string;
          awayTeam: string;
          homeLogo: string;
          awayLogo: string;
          homeScore: number | null;
          awayScore: number | null;
          time: string;
          status: string;
        }[];
      }
    >
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await footballAPI.getFixturesByDate(
          selectedDate.toISOString().slice(0, 10)
        );

        const filteredMatches = (res.response || [])
          .filter(
            (fixture: Fixture) =>
              Object.values(MAIN_LEAGUES).includes(fixture.league.id) &&
              fixture.league.name !== "Regionalliga - West" // 🚫 exclure cette ligue
          )
          .map((fixture: Fixture) => ({
            league: translateName(fixture.league.name),
            leagueLogo: fixture.league.logo,
            homeTeam: getTeamTranslation(fixture.teams.home.name),
            awayTeam: getTeamTranslation(fixture.teams.away.name),
            homeLogo: fixture.teams.home.logo,
            awayLogo: fixture.teams.away.logo,
            homeScore: fixture.goals.home,
            awayScore: fixture.goals.away,
            time: fixture.fixture.date,
            status: fixture.fixture.status.short,
          }));

        // Regroupement par ligue
        const grouped: Record<string, any> = {};
        filteredMatches.forEach((match) => {
          if (!grouped[match.league]) {
            grouped[match.league] = {
              leagueLogo: match.leagueLogo,
              matches: [],
            };
          }
          grouped[match.league].matches.push(match);
        });

        setGroupedMatches(grouped);
      } catch (err) {
        setError("خطأ في جلب المباريات");
      }
      setLoading(false);
    };
    fetchMatches();
  }, [selectedDate]);

  const handlePrevDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };
  const handleNextDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const formattedDate = `${selectedDate.toLocaleDateString("ar-EG", {
    weekday: "long",
  })} ${selectedDate.getDate()} ${selectedDate.toLocaleDateString("ar-EG", {
    month: "long",
  })} ${selectedDate.getFullYear()}`;

  return (
    <div className="w-full lg:w-80 max-w-sm space-y-6 lg:sticky lg:top-24">
      {/* Navigation date */}
      <Card className="p-5 bg-gradient-to-br from-card to-sport-light/30 border shadow-card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-xl text-foreground">{formattedDate}</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrevDay}>
              ←
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextDay}>
              →
            </Button>
          </div>
        </div>
      </Card>

      {/* Matches regroupés */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-4">مباريات اليوم</h3>

        {loading ? (
          <div className="text-center text-muted-foreground">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : Object.keys(groupedMatches).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedMatches).map(([league, data], idx) => (
              <div key={idx}>
                {/* Nom de la ligue */}
                <div className="flex items-center gap-2 mb-2 border-b pb-1">
                  <img
                    src={data.leagueLogo}
                    alt={league}
                    className="w-5 h-5 object-contain"
                  />
                  <span className="font-semibold text-sm">{league}</span>
                </div>

                {/* Matchs de la ligue */}
                {data.matches.map((match: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border rounded-lg p-2 mb-2 shadow"
                  >
                    <div className="flex items-center gap-2 w-1/3">
                      <img src={match.homeLogo} alt={match.homeTeam} className="w-6 h-6" />
                      <span className="text-xs truncate">{match.homeTeam}</span>
                    </div>
                    <div className="flex flex-col items-center w-1/3">
                      <span className="font-bold">
                        {match.homeScore ?? "-"} : {match.awayScore ?? "-"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(match.time).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-end w-1/3">
                      <span className="text-xs truncate">{match.awayTeam}</span>
                      <img src={match.awayLogo} alt={match.awayTeam} className="w-6 h-6" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">لا توجد مباريات اليوم</div>
        )}
      </Card>
    </div>
  );
};

export default Sidebar;
