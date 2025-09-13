import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { footballAPI, MAIN_LEAGUES } from "@/config/api";
import { getTeamTranslation } from "@/utils/teamNameMap";
import { useSettings } from "@/contexts/SettingsContext";
import { Fixture as APIFixture } from "@/config/api";

interface GroupedMatches {
  [league: string]: {
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
  };
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
  const { hourFormat } = useSettings();
  const [groupedMatches, setGroupedMatches] = useState<GroupedMatches>({});
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
            (fixture: APIFixture) =>
              Object.values(MAIN_LEAGUES).includes(fixture.league.id) &&
              fixture.league.name !== "Regionalliga - West" && // 🚫 exclure cette ligue
              fixture.league.name !== "Eredivisie" // 🚫 exclure Eredivisie
          )
          .map((fixture: APIFixture) => ({
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
        const grouped: GroupedMatches = {};
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
        console.error("Error fetching matches:", err);
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

  const formatTime = (time: string): string => {
    const date = new Date(time);
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Toujours en format 12 heures
    };

    // Format en français avec AM/PM remplacés par ص/م
    const formattedTime = date.toLocaleTimeString("fr-FR", options);
    return formattedTime.replace("AM", "ص").replace("PM", "م");
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center text-muted-foreground">جاري التحميل...</div>;
    }
    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }
    if (Object.keys(groupedMatches).length === 0) {
      return <div className="text-center text-muted-foreground">لا توجد مباريات اليوم</div>;
    }

    return (
      <div className="space-y-6">
        {Object.entries(groupedMatches).map(([league, data]) => (
          <div key={league}>
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
            {data.matches.map((match, i) => (
              <div
                key={`${match.homeTeam}-${match.awayTeam}-${i}`}
                className="flex flex-col border rounded-lg p-4 mb-4 shadow bg-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={match.homeLogo} alt={match.homeTeam} className="w-6 h-6" />
                    <span className="text-sm font-medium">{match.homeTeam}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{match.awayTeam}</span>
                    <img src={match.awayLogo} alt={match.awayTeam} className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-600">موعد المباراة</span>
                  <span className="block text-lg font-bold text-gray-800">
                    {formatTime(match.time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

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
        {renderContent()}
      </Card>
    </div>
  );
};

export default Sidebar;
