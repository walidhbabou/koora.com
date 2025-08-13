import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Trophy, Users, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { footballAPI } from "@/config/api";
import type { Fixture } from "@/config/api";

interface TeamInfo {
  id: number;
  name: string;
  logo: string;
  country: string;
  founded: number;
  venue: {
    name: string;
    capacity: number;
    city: string;
  };
}

interface TeamStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

// Données statiques pour les équipes principales (fallback)
const getStaticTeamData = (currentLanguage: string): { [key: string]: TeamInfo } => ({
  "33": {
    id: 33,
    name: currentLanguage === 'ar' ? "مانشستر يونايتد" : "Manchester United",
    logo: "https://media.api-sports.io/football/teams/33.png",
    country: currentLanguage === 'ar' ? "إنجلترا" : "England",
    founded: 1878,
    venue: {
      name: "Old Trafford",
      capacity: 74310,
      city: currentLanguage === 'ar' ? "مانشستر" : "Manchester"
    }
  },
  "40": {
    id: 40,
    name: currentLanguage === 'ar' ? "ليفربول" : "Liverpool",
    logo: "https://media.api-sports.io/football/teams/40.png",
    country: currentLanguage === 'ar' ? "إنجلترا" : "England",
    founded: 1892,
    venue: {
      name: "Anfield",
      capacity: 53394,
      city: currentLanguage === 'ar' ? "ليفربول" : "Liverpool"
    }
  },
  "541": {
    id: 541,
    name: currentLanguage === 'ar' ? "ريال مدريد" : "Real Madrid",
    logo: "https://media.api-sports.io/football/teams/541.png",
    country: currentLanguage === 'ar' ? "إسبانيا" : "Spain",
    founded: 1902,
    venue: {
      name: "Santiago Bernabéu",
      capacity: 81044,
      city: currentLanguage === 'ar' ? "مدريد" : "Madrid"
    }
  },
  "529": {
    id: 529,
    name: currentLanguage === 'ar' ? "برشلونة" : "Barcelona",
    logo: "https://media.api-sports.io/football/teams/529.png",
    country: currentLanguage === 'ar' ? "إسبانيا" : "Spain",
    founded: 1899,
    venue: {
      name: "Camp Nou",
      capacity: 99354,
      city: currentLanguage === 'ar' ? "برشلونة" : "Barcelona"
    }
  }
});

const TeamDetails = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { currentLanguage } = useTranslation();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [recentMatches, setRecentMatches] = useState<Fixture[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Fixture[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeamData = async () => {
      if (!teamId) return;

      setLoading(true);
      try {
        // Utiliser les données statiques comme fallback
        const staticTeamData = getStaticTeamData(currentLanguage);
        const staticTeam = staticTeamData[teamId];
        if (staticTeam) {
          setTeamInfo(staticTeam);
        }

        // Tenter de récupérer les matchs récents et à venir
        const today = new Date();

        // Simuler des matchs récents et à venir (en production, utiliser l'API)
        const mockRecentMatches: Fixture[] = [
          {
            id: 1,
            date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: "FT",
            league: { id: 39, name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png" },
            teams: {
              home: { id: parseInt(teamId), name: staticTeam?.name || "Team", logo: staticTeam?.logo || "" },
              away: { id: 2, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" }
            },
            goals: { home: 2, away: 1 },
            score: {
              halftime: { home: 1, away: 0 },
              fulltime: { home: 2, away: 1 }
            }
          }
        ];

        const mockUpcomingMatches: Fixture[] = [
          {
            id: 2,
            date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: "NS",
            league: { id: 39, name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png" },
            teams: {
              home: { id: 3, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
              away: { id: parseInt(teamId), name: staticTeam?.name || "Team", logo: staticTeam?.logo || "" }
            },
            goals: { home: null, away: null },
            score: {
              halftime: { home: null, away: null },
              fulltime: { home: null, away: null }
            }
          }
        ];

        setRecentMatches(mockRecentMatches);
        setUpcomingMatches(mockUpcomingMatches);

        // Statistiques simulées
        setTeamStats({
          played: 25,
          wins: 15,
          draws: 6,
          losses: 4,
          goalsFor: 48,
          goalsAgainst: 23
        });

      } catch (error) {
        console.error("Erreur lors du chargement des données de l'équipe:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [teamId, currentLanguage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fa] dark:bg-[#0f1419]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {currentLanguage === 'ar' ? 'تحميل بيانات الفريق...' : 'Chargement des données de l\'équipe...'}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!teamInfo) {
    return (
      <div className="min-h-screen bg-[#f6f7fa] dark:bg-[#0f1419]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {currentLanguage === 'ar' ? 'الفريق غير موجود' : 'Équipe non trouvée'}
            </h1>
            <Button onClick={() => navigate('/')} className="mt-4">
              {currentLanguage === 'ar' ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : 'fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f7fa] dark:bg-[#0f1419]">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header avec retour */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentLanguage === 'ar' ? 'رجوع' : 'Retour'}
          </Button>
        </div>

        {/* Informations principales de l'équipe */}
        <Card className="p-6 mb-8 bg-white dark:bg-[#181a20] border-0 shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-[#23262f] rounded-xl shadow-md flex items-center justify-center">
              <img 
                src={teamInfo.logo} 
                alt={teamInfo.name}
                className="w-20 h-20 md:w-28 md:h-28 object-contain"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {teamInfo.name}
              </h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{teamInfo.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{currentLanguage === 'ar' ? 'تأسس' : 'Fondé en'} {teamInfo.founded}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{teamInfo.venue.name} ({teamInfo.venue.capacity?.toLocaleString()})</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistiques de la saison */}
        {teamStats && (
          <Card className="p-6 mb-8 bg-white dark:bg-[#181a20] border-0 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {currentLanguage === 'ar' ? 'إحصائيات الموسم' : 'Statistiques de la saison'}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teamStats.played}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLanguage === 'ar' ? 'مباراة' : 'Matchs'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{teamStats.wins}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLanguage === 'ar' ? 'فوز' : 'Victoires'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{teamStats.draws}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLanguage === 'ar' ? 'تعادل' : 'Nuls'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{teamStats.losses}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLanguage === 'ar' ? 'هزيمة' : 'Défaites'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teamStats.goalsFor}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLanguage === 'ar' ? 'أهداف مسجلة' : 'Buts pour'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{teamStats.goalsAgainst}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLanguage === 'ar' ? 'أهداف مقبولة' : 'Buts contre'}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Matchs récents et à venir */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Matchs récents */}
          <Card className="p-6 bg-white dark:bg-[#181a20] border-0 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              {currentLanguage === 'ar' ? 'المباريات الأخيرة' : 'Matchs récents'}
            </h2>
            
            <div className="space-y-4">
              {recentMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#23262f] rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-8 h-8" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {match.teams.home.name}
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-800 dark:text-gray-200">
                      {match.goals.home} - {match.goals.away}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(match.date)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {match.teams.away.name}
                    </span>
                    <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-8 h-8" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Matchs à venir */}
          <Card className="p-6 bg-white dark:bg-[#181a20] border-0 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              {currentLanguage === 'ar' ? 'المباريات القادمة' : 'Prochains matchs'}
            </h2>
            
            <div className="space-y-4">
              {upcomingMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#23262f] rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-8 h-8" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {match.teams.home.name}
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <Badge variant="outline" className="mb-1">
                      {currentLanguage === 'ar' ? 'قادم' : 'À venir'}
                    </Badge>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(match.date)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {match.teams.away.name}
                    </span>
                    <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-8 h-8" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TeamDetails;
