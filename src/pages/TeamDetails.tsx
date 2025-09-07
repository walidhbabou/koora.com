import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import { getTeamTranslation } from "@/utils/teamNameMap";

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
    address?: string;
    surface?: string;
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
  // La Liga
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
  },
  // Premier League
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
  "49": {
    id: 49,
    name: currentLanguage === 'ar' ? "تشيلسي" : "Chelsea",
    logo: "https://media.api-sports.io/football/teams/49.png",
    country: currentLanguage === 'ar' ? "إنجلترا" : "England",
    founded: 1905,
    venue: {
      name: "Stamford Bridge",
      capacity: 40341,
      city: currentLanguage === 'ar' ? "لندن" : "London"
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
  "42": {
    id: 42,
    name: currentLanguage === 'ar' ? "أرسنال" : "Arsenal",
    logo: "https://media.api-sports.io/football/teams/42.png",
    country: currentLanguage === 'ar' ? "إنجلترا" : "England",
    founded: 1886,
    venue: {
      name: "Emirates Stadium",
      capacity: 60260,
      city: currentLanguage === 'ar' ? "لندن" : "London"
    }
  },
  "50": {
    id: 50,
    name: currentLanguage === 'ar' ? "مانشستر سيتي" : "Manchester City",
    logo: "https://media.api-sports.io/football/teams/50.png",
    country: currentLanguage === 'ar' ? "إنجلترا" : "England",
    founded: 1880,
    venue: {
      name: "Etihad Stadium",
      capacity: 53400,
      city: currentLanguage === 'ar' ? "مانشستر" : "Manchester"
    }
  },
  // Bundesliga
  "157": {
    id: 157,
    name: currentLanguage === 'ar' ? "بايرن ميونخ" : "Bayern Munich",
    logo: "https://media.api-sports.io/football/teams/157.png",
    country: currentLanguage === 'ar' ? "ألمانيا" : "Germany",
    founded: 1900,
    venue: {
      name: "Allianz Arena",
      capacity: 75000,
      city: currentLanguage === 'ar' ? "ميونخ" : "Munich"
    }
  },
  // Ligue 1
  "85": {
    id: 85,
    name: currentLanguage === 'ar' ? "باريس سان جيرمان" : "Paris Saint-Germain",
    logo: "https://media.api-sports.io/football/teams/85.png",
    country: currentLanguage === 'ar' ? "فرنسا" : "France",
    founded: 1970,
    venue: {
      name: "Parc des Princes",
      capacity: 47929,
      city: currentLanguage === 'ar' ? "باريس" : "Paris"
    }
  },
  // Serie A
  "496": {
    id: 496,
    name: currentLanguage === 'ar' ? "يوفنتوس" : "Juventus",
    logo: "https://media.api-sports.io/football/teams/496.png",
    country: currentLanguage === 'ar' ? "إيطاليا" : "Italy",
    founded: 1897,
    venue: {
      name: "Allianz Stadium",
      capacity: 41507,
      city: currentLanguage === 'ar' ? "تورينو" : "Turin"
    }
  },
  "489": {
    id: 489,
    name: currentLanguage === 'ar' ? "إيه سي ميلان" : "AC Milan",
    logo: "https://media.api-sports.io/football/teams/489.png",
    country: currentLanguage === 'ar' ? "إيطاليا" : "Italy",
    founded: 1899,
    venue: {
      name: "San Siro",
      capacity: 75923,
      city: currentLanguage === 'ar' ? "ميلانو" : "Milan"
    }
  },
  "505": {
    id: 505,
    name: currentLanguage === 'ar' ? "إنتر ميلان" : "Inter Milan",
    logo: "https://media.api-sports.io/football/teams/505.png",
    country: currentLanguage === 'ar' ? "إيطاليا" : "Italy",
    founded: 1908,
    venue: {
      name: "San Siro",
      capacity: 75923,
      city: currentLanguage === 'ar' ? "ميلانو" : "Milan"
    }
  },
  // Équipes africaines
  "1023": {
    id: 1023,
    name: currentLanguage === 'ar' ? "الأهلي" : "Al Ahly",
    logo: "https://media.api-sports.io/football/teams/1023.png",
    country: currentLanguage === 'ar' ? "مصر" : "Egypt",
    founded: 1907,
    venue: {
      name: "Cairo International Stadium",
      capacity: 75000,
      city: currentLanguage === 'ar' ? "القاهرة" : "Cairo"
    }
  },
  "968": {
    id: 968,
    name: currentLanguage === 'ar' ? "الوداد الرياضي" : "Wydad Casablanca",
    logo: "https://media.api-sports.io/football/teams/968.png",
    country: currentLanguage === 'ar' ? "المغرب" : "Morocco",
    founded: 1937,
    venue: {
      name: "Stade Mohammed V",
      capacity: 45000,
      city: currentLanguage === 'ar' ? "الدار البيضاء" : "Casablanca"
    }
  },
  "976": {
    id: 976,
    name: currentLanguage === 'ar' ? "الرجاء الرياضي" : "Raja Casablanca",
    logo: "https://media.api-sports.io/football/teams/976.png",
    country: currentLanguage === 'ar' ? "المغرب" : "Morocco",
    founded: 1949,
    venue: {
      name: "Stade Mohammed V",
      capacity: 45000,
      city: currentLanguage === 'ar' ? "الدار البيضاء" : "Casablanca"
    }
  }
});

const TeamDetails = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLanguage } = useTranslation();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [recentMatches, setRecentMatches] = useState<Fixture[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Fixture[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [teamStatsFull, setTeamStatsFull] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [selectedSeason, setSelectedSeason] = useState<number>(currentYear);
  const leagueIdFromState = (location as any)?.state?.leagueId as number | undefined;

  useEffect(() => {
    const loadTeamData = async () => {
      if (!teamId) return;

      setLoading(true);
      try {
        // 1) Fallback statique immédiat (au cas où l'API ne renvoie rien)
        const staticTeamData = getStaticTeamData(currentLanguage);
        const staticTeam = staticTeamData[teamId];
        if (staticTeam) setTeamInfo(staticTeam);

        // 2) Charger les infos d'équipe via API avec gestion CORS
        const [infoRes, statsRes, lastRes, nextRes] = await Promise.allSettled([
          footballAPI.getTeamInfo(parseInt(teamId)).catch(error => {
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
              console.warn('🚫 CORS Error for team info. Using static data.');
              return { response: [] };
            }
            throw error;
          }),
          (leagueIdFromState
            ? footballAPI.getTeamStatistics(leagueIdFromState, selectedSeason, parseInt(teamId))
            : footballAPI.getTeamStatisticsAuto(parseInt(teamId), selectedSeason)
          ).catch(error => {
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
              console.warn('🚫 CORS Error for team statistics. Using fallback.');
              return { response: null };
            }
            throw error;
          }),
          footballAPI.getTeamLastFixtures(parseInt(teamId), 5).catch(error => {
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
              console.warn('🚫 CORS Error for last fixtures. Using empty data.');
              return { response: [] };
            }
            throw error;
          }),
          footballAPI.getTeamNextFixtures(parseInt(teamId), 5).catch(error => {
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
              console.warn('🚫 CORS Error for next fixtures. Using empty data.');
              return { response: [] };
            }
            throw error;
          })
        ]);

        // Team info
        if (infoRes.status === 'fulfilled' && Array.isArray(infoRes.value?.response) && infoRes.value.response[0]) {
          const r = infoRes.value.response[0];
          const mapped: TeamInfo = {
            id: r.team?.id,
            name: r.team?.name,
            logo: r.team?.logo,
            country: r.team?.country || '',
            founded: r.team?.founded,
            venue: {
              name: r.venue?.name || '',
              capacity: r.venue?.capacity || 0,
              city: r.venue?.city || '',
              address: r.venue?.address || undefined,
              surface: r.venue?.surface || undefined
            }
          };
          setTeamInfo(mapped);
        }

        // Team stats (auto over selected leagues, current season)
        if (statsRes.status === 'fulfilled' && statsRes.value?.response) {
          const s = statsRes.value.response;
          setTeamStatsFull(s);
          const played = s.fixtures?.played?.total ?? 0;
          const wins = s.fixtures?.wins?.total ?? 0;
          const draws = s.fixtures?.draws?.total ?? 0;
          const losses = s.fixtures?.loses?.total ?? 0;
          const goalsFor = s.goals?.for?.total?.total ?? 0;
          const goalsAgainst = s.goals?.against?.total?.total ?? 0;
          setTeamStats({ played, wins, draws, losses, goalsFor, goalsAgainst });
        } else {
          // Fallback statiques si pas de stats API
          setTeamStats(prev => prev ?? {
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0
          });
        }

        // Recent fixtures
        if (lastRes.status === 'fulfilled' && Array.isArray(lastRes.value?.response)) {
          const mapped: Fixture[] = lastRes.value.response.map((f: any) => ({
            id: f.fixture?.id,
            date: f.fixture?.date,
            status: f.fixture?.status?.short,
            league: {
              id: f.league?.id,
              name: f.league?.name,
              logo: f.league?.logo
            },
            teams: {
              home: { id: f.teams?.home?.id, name: f.teams?.home?.name, logo: f.teams?.home?.logo },
              away: { id: f.teams?.away?.id, name: f.teams?.away?.name, logo: f.teams?.away?.logo }
            },
            goals: { home: f.goals?.home, away: f.goals?.away },
            score: {
              halftime: { home: f.score?.halftime?.home, away: f.score?.halftime?.away },
              fulltime: { home: f.score?.fulltime?.home, away: f.score?.fulltime?.away }
            }
          }));
          setRecentMatches(mapped);
        }

        // Upcoming fixtures
        if (nextRes.status === 'fulfilled' && Array.isArray(nextRes.value?.response)) {
          const mapped: Fixture[] = nextRes.value.response.map((f: any) => ({
            id: f.fixture?.id,
            date: f.fixture?.date,
            status: f.fixture?.status?.short,
            league: {
              id: f.league?.id,
              name: f.league?.name,
              logo: f.league?.logo
            },
            teams: {
              home: { id: f.teams?.home?.id, name: f.teams?.home?.name, logo: f.teams?.home?.logo },
              away: { id: f.teams?.away?.id, name: f.teams?.away?.name, logo: f.teams?.away?.logo }
            },
            goals: { home: f.goals?.home, away: f.goals?.away },
            score: {
              halftime: { home: f.score?.halftime?.home, away: f.score?.halftime?.away },
              fulltime: { home: f.score?.fulltime?.home, away: f.score?.fulltime?.away }
            }
          }));
          setUpcomingMatches(mapped);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données de l'équipe:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [teamId, currentLanguage, selectedSeason, leagueIdFromState]);

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (currentLanguage === 'ar') {
      const parts = new Intl.DateTimeFormat('ar', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).formatToParts(date);
      const dayPeriod = parts.find(p => p.type === 'dayPeriod')?.value || '';
      const hour = parts.find(p => p.type === 'hour')?.value || '';
      const minute = parts.find(p => p.type === 'minute')?.value || '';
      return `${dayPeriod} ${hour}:${minute}`.trim(); // e.g., "م 02:00"
    }
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDisplayDate = (dateString: string) => {
    if (currentLanguage === 'ar') {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar', { day: 'numeric', month: 'long', year: 'numeric' }); // e.g., 6 سبتمبر 2025
    }
    return formatDate(dateString);
  };

  const teamLabel = (name?: string) => {
    if (!name) return '-';
    return currentLanguage === 'ar' ? getTeamTranslation(name) : name;
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
                {teamLabel(teamInfo.name)}
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

        {/* Détails du club */}
        <Card className="p-6 mb-8 bg-white dark:bg-[#181a20] border-0 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            {currentLanguage === 'ar' ? 'تفاصيل النادي' : 'Détails du club'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
              <div className="text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'الدوري' : 'Ligue'}</div>
              <div className="flex items-center gap-2 mt-1">
                {teamStatsFull?.league?.logo && <img src={teamStatsFull.league.logo} className="w-5 h-5" />}
                <span className="font-semibold">{teamStatsFull?.league?.name ?? '-'}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
              <div className="text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'الموسم' : 'Saison'}</div>
              <div className="mt-1 font-semibold">{teamStatsFull?.league?.season ?? selectedSeason}</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
              <div className="text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'الدولة' : 'Pays'}</div>
              <div className="mt-1 font-semibold">{teamInfo.country || '-'}</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
              <div className="text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'تاريخ التأسيس' : 'Année de fondation'}</div>
              <div className="mt-1 font-semibold">{teamInfo.founded || '-'}</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
              <div className="text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'الملعب' : 'Stade'}</div>
              <div className="mt-1 font-semibold">{teamInfo.venue.name || '-'}</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
              <div className="text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'المدينة' : 'Ville'}</div>
              <div className="mt-1 font-semibold">{teamInfo.venue.city || '-'}</div>
            </div>
            {teamInfo.venue.address && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
                <div className="text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'العنوان' : 'Adresse'}</div>
                <div className="mt-1 font-semibold">{teamInfo.venue.address}</div>
              </div>
            )}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
              <div className="text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'السعة' : 'Capacité'}</div>
              <div className="mt-1 font-semibold">{teamInfo.venue.capacity?.toLocaleString() ?? '-'}</div>
            </div>
            {teamInfo.venue.surface && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
                <div className="text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'أرضية الملعب' : 'Surface'}</div>
                <div className="mt-1 font-semibold">{teamInfo.venue.surface}</div>
              </div>
            )}
          </div>
        </Card>

        {/* Statistiques de la saison - résumé + sections détaillées */}
        {teamStats && (
          <Card className="p-6 mb-8 bg-white dark:bg-[#181a20] border-0 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {currentLanguage === 'ar' ? 'إحصائيات الموسم' : 'Statistiques de la saison'}
              </h2>
              {/* Season selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">{currentLanguage === 'ar' ? 'الموسم' : 'Saison'}</label>
                <select
                  className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f1419] text-sm"
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                >
                  {[0,1,2,3,4,5].map(off => currentYear - off).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* League header */}
            {teamStatsFull?.league && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#23262f] mb-4">
                {teamStatsFull.league.logo && (
                  <img src={teamStatsFull.league.logo} alt="league" className="w-6 h-6" />
                )}
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{teamStatsFull.league.name}</span>
                  <span className="mx-2">•</span>
                  <span>{teamStatsFull.league.country}</span>
                  <span className="mx-2">•</span>
                  <span>{teamStatsFull.league.season}</span>
                </div>
              </div>
            )}

            {/* Résumé */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teamStats.played}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{currentLanguage === 'ar' ? 'مباراة' : 'Matchs'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{teamStats.wins}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{currentLanguage === 'ar' ? 'فوز' : 'Victoires'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{teamStats.draws}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{currentLanguage === 'ar' ? 'تعادل' : 'Nuls'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{teamStats.losses}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{currentLanguage === 'ar' ? 'هزيمة' : 'Défaites'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teamStats.goalsFor}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{currentLanguage === 'ar' ? 'أهداف مسجلة' : 'Buts pour'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{teamStats.goalsAgainst}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{currentLanguage === 'ar' ? 'أهداف مقبولة' : 'Buts contre'}</div>
              </div>
            </div>

            {/* Détails avancés si disponibles */}
            {teamStatsFull && (
              <div className="mt-6 space-y-6">
                {/* Form */}
                {teamStatsFull.form && (
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{currentLanguage === 'ar' ? 'السلسلة' : 'Forme'}</h3>
                    <div className="flex flex-wrap gap-1">
                      {String(teamStatsFull.form).split('').slice(-10).map((c: string, idx: number) => (
                        <span key={idx} className={`px-2 py-0.5 rounded text-xs font-semibold ${c==='W' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : c==='D' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Répartition domicile/extérieur */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'لعب (منزل)' : 'Joués (dom.)'}</div>
                    <div className="text-lg font-bold">{teamStatsFull.fixtures?.played?.home ?? 0}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'لعب (خارج)' : 'Joués (ext.)'}</div>
                    <div className="text-lg font-bold">{teamStatsFull.fixtures?.played?.away ?? 0}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'أهداف/مباراة' : 'Buts/match'}</div>
                    <div className="text-lg font-bold">{teamStatsFull.goals?.for?.average?.total ?? '-'}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'ضد/مباراة' : 'Contre/match'}</div>
                    <div className="text-lg font-bold">{teamStatsFull.goals?.against?.average?.total ?? '-'}</div>
                  </div>
                </div>

                {/* Buts par minute (barres simples) */}
                {teamStatsFull.goals?.for?.minute && (
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{currentLanguage === 'ar' ? 'الأهداف حسب الدقائق' : 'Buts par minute'}</h3>
                    <div className="space-y-2">
                      {Object.entries(teamStatsFull.goals.for.minute).map(([interval, val]: any) => (
                        <div key={interval} className="flex items-center gap-3">
                          <div className="w-20 shrink-0 text-xs text-gray-600 dark:text-gray-400">{interval}</div>
                          <div className="flex-1 h-2 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div className="h-2 bg-green-500" style={{ width: `${Math.min(100, (val?.total || 0) * 8)}%` }} />
                          </div>
                          <div className="w-10 text-right text-xs text-gray-700 dark:text-gray-300">{val?.total ?? 0}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buts encaissés par minute */}
                {teamStatsFull.goals?.against?.minute && (
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{currentLanguage === 'ar' ? 'الأهداف المستقبلة حسب الدقائق' : 'Buts encaissés par minute'}</h3>
                    <div className="space-y-2">
                      {Object.entries(teamStatsFull.goals.against.minute).map(([interval, val]: any) => (
                        <div key={interval} className="flex items-center gap-3">
                          <div className="w-20 shrink-0 text-xs text-gray-600 dark:text-gray-400">{interval}</div>
                          <div className="flex-1 h-2 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div className="h-2 bg-rose-500" style={{ width: `${Math.min(100, (val?.total || 0) * 8)}%` }} />
                          </div>
                          <div className="w-10 text-right text-xs text-gray-700 dark:text-gray-300">{val?.total ?? 0}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clean sheets / Failed to score / Penalties */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#23262f] text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{teamStatsFull.clean_sheet?.total ?? 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{currentLanguage === 'ar' ? 'شباك نظيفة' : 'Clean sheets'}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#23262f] text-center">
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{teamStatsFull.failed_to_score?.total ?? 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{currentLanguage === 'ar' ? 'فشل في التسجيل' : 'Failed to score'}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#23262f] text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teamStatsFull.penalty?.total ?? 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{currentLanguage === 'ar' ? 'ركلات جزاء' : 'Penalties'}</div>
                  </div>
                </div>

                {/* Under/Over buts marqués et encaissés */}
                {(teamStatsFull.goals?.for?.under_over || teamStatsFull.goals?.against?.under_over) && (
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{currentLanguage === 'ar' ? 'أوفر/أندر الأهداف' : 'Under/Over buts'}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {teamStatsFull.goals?.for?.under_over && (
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
                          <div className="font-semibold mb-2">{currentLanguage === 'ar' ? 'أهداف مسجلة' : 'Buts pour'}</div>
                          <div className="space-y-1 text-sm">
                            {Object.entries(teamStatsFull.goals.for.under_over).map(([k, v]: any) => (
                              <div key={`gf-${k}`} className="flex justify-between">
                                <span>{k}</span>
                                <span className="text-gray-700 dark:text-gray-300">{currentLanguage === 'ar' ? 'أوفر' : 'Over'} {v?.over ?? 0} · {currentLanguage === 'ar' ? 'أندر' : 'Under'} {v?.under ?? 0}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {teamStatsFull.goals?.against?.under_over && (
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#23262f]">
                          <div className="font-semibold mb-2">{currentLanguage === 'ar' ? 'أهداف مستقبلة' : 'Buts contre'}</div>
                          <div className="space-y-1 text-sm">
                            {Object.entries(teamStatsFull.goals.against.under_over).map(([k, v]: any) => (
                              <div key={`ga-${k}`} className="flex justify-between">
                                <span>{k}</span>
                                <span className="text-gray-700 dark:text-gray-300">{currentLanguage === 'ar' ? 'أوفر' : 'Over'} {v?.over ?? 0} · {currentLanguage === 'ar' ? 'أندر' : 'Under'} {v?.under ?? 0}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Plus gros résultats */}
                {teamStatsFull.biggest && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#23262f]">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'سلسلة' : 'Série'}</div>
                      <div className="text-sm">{currentLanguage === 'ar' ? 'فوز' : 'Victoires'}: <span className="font-semibold">{teamStatsFull.biggest?.streak?.wins ?? 0}</span></div>
                      <div className="text-sm">{currentLanguage === 'ar' ? 'تعادل' : 'Nuls'}: <span className="font-semibold">{teamStatsFull.biggest?.streak?.draws ?? 0}</span></div>
                      <div className="text-sm">{currentLanguage === 'ar' ? 'هزائم' : 'Défaites'}: <span className="font-semibold">{teamStatsFull.biggest?.streak?.loses ?? 0}</span></div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#23262f]">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'أكبر فوز' : 'Plus grosse victoire'}</div>
                      <div className="text-sm">{currentLanguage === 'ar' ? 'منزل' : 'Domicile'}: <span className="font-semibold">{teamStatsFull.biggest?.wins?.home ?? '-'}</span></div>
                      <div className="text-sm">{currentLanguage === 'ar' ? 'خارج' : 'Extérieur'}: <span className="font-semibold">{teamStatsFull.biggest?.wins?.away ?? '-'}</span></div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#23262f]">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{currentLanguage === 'ar' ? 'أكبر خسارة' : 'Plus grosse défaite'}</div>
                      <div className="text-sm">{currentLanguage === 'ar' ? 'منزل' : 'Domicile'}: <span className="font-semibold">{teamStatsFull.biggest?.loses?.home ?? '-'}</span></div>
                      <div className="text-sm">{currentLanguage === 'ar' ? 'خارج' : 'Extérieur'}: <span className="font-semibold">{teamStatsFull.biggest?.loses?.away ?? '-'}</span></div>
                    </div>
                  </div>
                )}

                {/* Formations */}
                {Array.isArray(teamStatsFull.lineups) && teamStatsFull.lineups.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{currentLanguage === 'ar' ? 'التشكيلات' : 'Formations'}</h3>
                    <div className="flex flex-wrap gap-2">
                      {teamStatsFull.lineups.map((l: any, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-[#23262f] text-sm">
                          {l.formation} · {l.played}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cartons (jaunes uniquement si présents) */}
                {teamStatsFull.cards?.yellow && (
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{currentLanguage === 'ar' ? 'البطاقات الصفراء حسب الدقائق' : 'Cartons jaunes par minute'}</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {Object.entries(teamStatsFull.cards.yellow).map(([interval, val]: any) => (
                        <div key={interval} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-[#23262f]">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{interval}</span>
                          <span className="text-sm font-semibold">{val?.total ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {teamStatsFull.cards?.red && (
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{currentLanguage === 'ar' ? 'البطاقات الحمراء حسب الدقائق' : 'Cartons rouges par minute'}</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {Object.entries(teamStatsFull.cards.red).map(([interval, val]: any) => (
                        <div key={interval} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-[#23262f]">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{interval}</span>
                          <span className="text-sm font-semibold">{val?.total ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Matchs récents et à venir */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Matchs récents */}
          <Card className="p-4 sm:p-6 bg-white dark:bg-[#181a20] border-0 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {currentLanguage === 'ar' ? 'المباريات الأخيرة' : 'Matchs récents'}
            </h2>
            
            <div className="space-y-3">
              {recentMatches.length > 0 ? recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-[#23262f] dark:to-[#1a1d24] rounded-xl p-4 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-[#2a2d35]"
                >
                  {/* League info */}
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#181a20] rounded-full shadow-sm">
                      {match.league.logo && (
                        <img src={match.league.logo} alt={match.league.name} className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {match.league.name}
                    </span>
                    </div>
                  </div>

                  {/* Match content */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    {/* Home team */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white dark:bg-[#181a20] rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-[#2a2d35] flex-shrink-0">
                        <img 
                          src={match.teams.home.logo} 
                          alt={match.teams.home.name} 
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {teamLabel(match.teams.home.name)}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {currentLanguage === 'ar' ? 'منزل' : 'Domicile'}
                        </p>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center mx-2 sm:mx-4 flex-shrink-0">
                      <div className="bg-white dark:bg-[#181a20] rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm border border-gray-200 dark:border-[#2a2d35]">
                        <div className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                      {match.goals.home} - {match.goals.away}
                    </div>
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                      {formatDisplayDate(match.date)}
                    </div>
                      {match.status && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs mt-1">
                          {match.status}
                        </Badge>
                      )}
                  </div>

                    {/* Away team */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
                      <div className="min-w-0 flex-1 text-right">
                        <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {teamLabel(match.teams.away.name)}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {currentLanguage === 'ar' ? 'خارج' : 'Extérieur'}
                        </p>
                  </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white dark:bg-[#181a20] rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-[#2a2d35] flex-shrink-0">
                        <img 
                          src={match.teams.away.logo} 
                          alt={match.teams.away.name} 
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>{currentLanguage === 'ar' ? 'لا توجد مباريات حديثة' : 'Aucun match récent'}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Matchs à venir */}
          <Card className="p-4 sm:p-6 bg-white dark:bg-[#181a20] border-0 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              {currentLanguage === 'ar' ? 'المباريات القادمة' : 'Prochains matchs'}
            </h2>
            
            <div className="space-y-3">
              {upcomingMatches.length > 0 ? upcomingMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#1e3a5f] dark:to-[#1a2d4a] rounded-xl p-4 hover:shadow-md transition-all duration-300 border border-blue-200 dark:border-[#2a4a6b]"
                >
                  {/* League info */}
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#181a20] rounded-full shadow-sm">
                      {match.league.logo && (
                        <img src={match.league.logo} alt={match.league.name} className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {match.league.name}
                    </span>
                    </div>
                  </div>

                  {/* Match content */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    {/* Home team */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white dark:bg-[#181a20] rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-[#2a2d35] flex-shrink-0">
                        <img 
                          src={match.teams.home.logo} 
                          alt={match.teams.home.name} 
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {teamLabel(match.teams.home.name)}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {currentLanguage === 'ar' ? 'منزل' : 'Domicile'}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex flex-col items-center mx-2 sm:mx-4 flex-shrink-0">
                      <div className="bg-white dark:bg-[#181a20] rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm border border-gray-200 dark:border-[#2a2d35]">
                        <div className="text-sm sm:text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatTime(match.date)}
                    </div>
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                      {formatDisplayDate(match.date)}
                    </div>
                      {match.status && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs mt-1 border-blue-300 text-blue-600">
                          {match.status}
                        </Badge>
                      )}
                  </div>

                    {/* Away team */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
                      <div className="min-w-0 flex-1 text-right">
                        <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {teamLabel(match.teams.away.name)}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {currentLanguage === 'ar' ? 'خارج' : 'Extérieur'}
                        </p>
                  </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white dark:bg-[#181a20] rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-[#2a2d35] flex-shrink-0">
                        <img 
                          src={match.teams.away.logo} 
                          alt={match.teams.away.name} 
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>{currentLanguage === 'ar' ? 'لا توجد مباريات قادمة' : 'Aucun match à venir'}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TeamDetails;
