
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { footballAPI, MAIN_LEAGUES } from "@/config/api";
import { transliterateTeamName } from "@/utils/transliterate";
import { useSettings } from "@/contexts/SettingsContext";
import { Fixture as APIFixture } from "@/config/api";
import { LEAGUES, getLeagueName } from "@/config/leagues";

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
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await footballAPI.getFixturesByDate(
          selectedDate.toISOString().slice(0, 10)
        );

        const filteredRawMatches = (res.response || [])
          .filter(
            (fixture: APIFixture) =>
              Object.values(MAIN_LEAGUES).includes(fixture.league.id) &&
              fixture.league.name !== "Regionalliga - West" &&
              fixture.league.name !== "Eredivisie"
          )
          .map((fixture: APIFixture) => ({
            league: translateName(fixture.league.name),
            leagueLogo: fixture.league.logo,
            homeTeam: fixture.teams.home.name,
            awayTeam: fixture.teams.away.name,
            homeLogo: fixture.teams.home.logo,
            awayLogo: fixture.teams.away.logo,
            homeScore: fixture.goals.home,
            awayScore: fixture.goals.away,
            // Compat: support both API nested shape and our local Fixture type
            time: (fixture as any).fixture?.date ?? (fixture as any).date,
            status: (fixture as any).fixture?.status?.short ?? (fixture as any).status,
          }));

        // Translittération phonétique: écrire les noms en lettres arabes sans traduire le sens
        const uniqueTeamNames = Array.from(new Set(filteredRawMatches.flatMap((m) => [m.homeTeam, m.awayTeam]).filter(Boolean)));
        const nameToArabic = new Map<string, string>(
          uniqueTeamNames.map((n) => [n, transliterateTeamName(n)])
        );

        const filteredMatches = filteredRawMatches.map((m) => ({
          ...m,
          homeTeam: nameToArabic.get(m.homeTeam) || m.homeTeam,
          awayTeam: nameToArabic.get(m.awayTeam) || m.awayTeam,
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
      return <div className="text-center text-muted-foreground dark:text-muted-foreground">جاري التحميل...</div>;
    }
    if (error) {
      return <div className="text-center text-red-500 dark:text-red-400">{error}</div>;
    }
    if (Object.keys(groupedMatches).length === 0) {
      return <div className="text-center text-muted-foreground dark:text-muted-foreground">لا توجد مباريات اليوم</div>;
    }

    // Filtrage par ligue sélectionnée
    let entries = Object.entries(groupedMatches);
    if (selectedLeagueId) {
      entries = entries.filter(([leagueName, data]) => {
        // Chercher la ligue par nom (arabe ou fr)
        const leagueObj = LEAGUES.find(l => l.name === leagueName || l.nameAr === leagueName);
        return leagueObj && leagueObj.id === selectedLeagueId;
      });
    }

    if (entries.length === 0) {
      return <div className="text-center text-muted-foreground dark:text-muted-foreground">لا توجد مباريات لهذه البطولة اليوم</div>;
    }

    return (
      <div className="space-y-6">
        {entries.map(([league, data]) => (
          <div key={league}>
            {/* Nom de la ligue */}
            <div className="flex items-center gap-2 mb-2 border-b pb-1 dark:border-gray-700">
              <img
                src={data.leagueLogo}
                alt={league}
                className="w-5 h-5 object-contain"
              />
              <span className="font-semibold text-sm dark:text-gray-300">{league}</span>
            </div>

            {/* Matchs de la ligue */}
            {data.matches.map((match, i) => (
              <div
                key={`${match.homeTeam}-${match.awayTeam}-${i}`}
                className="flex flex-col border rounded-lg p-4 mb-4 shadow bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={match.homeLogo} alt={match.homeTeam} className="w-6 h-6" />
                    <span className="text-sm font-medium dark:text-gray-300">{match.homeTeam}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium dark:text-gray-300">{match.awayTeam}</span>
                    <img src={match.awayLogo} alt={match.awayTeam} className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-center">
                  {match.status === "FT" ? (
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      {match.homeScore} - {match.awayScore}
                    </div>
                  ) : (
                    <>
                      <span className="text-xs text-gray-600 dark:text-gray-400">موعد المباراة</span>
                      <span className="block text-lg font-bold text-gray-800 dark:text-gray-200">
                        {formatTime(match.time)}
                      </span>
                    </>
                  )}
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
      <Card className="p-5 bg-gradient-to-br from-card to-sport-light/30 border shadow-card dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-xl text-foreground dark:text-gray-200">{formattedDate}</h2>
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

      {/* Sélecteur de ligue */}
      <Card className="p-4 dark:bg-gray-800 mb-2">
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedLeagueId === null ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
            onClick={() => setSelectedLeagueId(null)}
          >
            الكل
          </button>
          {LEAGUES.filter(l => l.logo).slice(0, 10).map(league => (
            <button
              key={league.id}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${selectedLeagueId === league.id ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
              onClick={() => setSelectedLeagueId(league.id)}
            >
              <img src={league.logo} alt={league.name} className="w-4 h-4 mr-1 inline-block" />
              {league.nameAr}
            </button>
          ))}
        </div>
        <h3 className="font-semibold text-foreground mb-4 dark:text-gray-200">مباريات اليوم</h3>
        {renderContent()}
      </Card>
    </div>
  );
};

export default Sidebar;
