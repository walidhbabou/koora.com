import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Users, Clock, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { maybeTransliterateName } from "@/utils/transliterate";
import { getTeamTranslation } from "@/utils/teamNameMap";

interface PlayerStatsProps {
  leagueName: string;
  leagueId: number;
  loading?: boolean;
}



const PlayerStats = ({ leagueName, leagueId, loading = false }: PlayerStatsProps) => {
  const { currentLanguage } = useTranslation();

  // Utiliser les hooks pour récupérer les données réelles de l'API
  const topScorers = usePlayerStats(leagueId, new Date().getFullYear(), 'topscorers');
  const topAssists = usePlayerStats(leagueId, new Date().getFullYear(), 'topassists');
  const topYellowCards = usePlayerStats(leagueId, new Date().getFullYear(), 'topyellowcards');
  const topRedCards = usePlayerStats(leagueId, new Date().getFullYear(), 'topredcards');

  // Loading state - utiliser les données des hooks
  const totalLoading = loading || topScorers.isLoading || topAssists.isLoading || topYellowCards.isLoading || topRedCards.isLoading;

  // Fonction pour transformer les données de l'API en format uniforme
  const transformApiData = (apiData: unknown, statType: 'goals' | 'assists' | 'yellowCards' | 'redCards') => {
    const data = apiData as { data?: { response?: unknown[] } };
    if (!data?.data?.response) return [];

    return data.data.response.slice(0, 10).map((playerData: unknown) => {
      const pData = playerData as {
        player: {
          id: number;
          name: string;
          photo: string;
        };
        statistics?: Array<{
          team?: {
            id: number;
            name: string;
            logo: string;
          };
          goals?: {
            total: number;
            assists: number;
          };
          cards?: {
            yellow: number;
            red: number;
          };
          games?: {
            appearences: number;
            minutes: number;
          };
        }>;
      };

      const player = pData.player;
      const stats = pData.statistics?.[0];

      return {
        id: player.id,
        name: player.name,
        photo: player.photo,
        team: {
          id: stats?.team?.id || 0,
          name: stats?.team?.name || 'Unknown',
          logo: stats?.team?.logo || ''
        },
        statistics: {
          goals: stats?.goals?.total || 0,
          assists: stats?.goals?.assists || 0,
          yellowCards: stats?.cards?.yellow || 0,
          redCards: stats?.cards?.red || 0,
          appearances: stats?.games?.appearences || 0,
          minutes: stats?.games?.minutes || 0
        }
      };
    });
  };

  const renderPlayerList = (playersData: unknown[], statType: 'goals' | 'assists' | 'yellowCards' | 'redCards') => {
    const players = transformApiData({ data: { response: playersData } }, statType);
    const getStatValue = (player: ReturnType<typeof transformApiData>[0]) => {
      switch (statType) {
        case 'goals': return player.statistics.goals;
        case 'assists': return player.statistics.assists;
        case 'yellowCards': return player.statistics.yellowCards;
        case 'redCards': return player.statistics.redCards;
        default: return 0;
      }
    };

    const getStatLabel = () => {
      switch (statType) {
        case 'goals': return currentLanguage === 'ar' ? 'أهداف' : 'Buts';
        case 'assists': return currentLanguage === 'ar' ? 'تمريرات حاسمة' : 'Passes D.';
        case 'yellowCards': return currentLanguage === 'ar' ? 'بطاقات صفراء' : 'Cartons J.';
        case 'redCards': return currentLanguage === 'ar' ? 'بطاقات حمراء' : 'Cartons R.';
        default: return '';
      }
    };

    return (
      <div className="space-y-3">
        {players.map((player, index) => (
          <div key={player.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#23262f] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2d36] transition-colors">
            {/* Rang */}
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>

            {/* Photo du joueur */}
            <img 
              src={player.photo} 
              alt={player.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/40x40/e2e8f0/64748b?text=?';
              }}
            />

            {/* Informations du joueur */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                {maybeTransliterateName(player.name, currentLanguage)}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <img 
                  src={player.team.logo} 
                  alt={player.team.name}
                  className="w-4 h-4"
                />
                <span className="truncate">
                  {currentLanguage === 'ar' 
                    ? getTeamTranslation(player.team.name)
                    : player.team.name
                  }
                </span>
              </div>
            </div>

            {/* Statistique */}
            <div className="text-right">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {getStatValue(player)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {getStatLabel()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (totalLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={`main-skeleton-item-${i}`} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white dark:bg-[#181a20] border-0 shadow-xl">
      <div className="bg-gradient-to-r from-green-600 to-blue-700 dark:from-green-800 dark:to-blue-900 p-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          {currentLanguage === 'ar' 
            ? `إحصائيات اللاعبين - ${leagueName}`
            : `Statistiques des Joueurs - ${leagueName}`
          }
        </h3>
      </div>

      <div className="p-4">
        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">
                {currentLanguage === 'ar' ? 'أهداف' : 'Buts'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="assists" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">
                {currentLanguage === 'ar' ? 'تمريرات' : 'Passes D.'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">
                {currentLanguage === 'ar' ? 'بطاقات صفراء' : 'C. Jaunes'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="redcards" className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">
                {currentLanguage === 'ar' ? 'بطاقات حمراء' : 'C. Rouges'}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals">
            {topScorers.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={`goals-skeleton-loader-${i}`} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              renderPlayerList(
                transformApiData(topScorers.data, 'goals'), 
                'goals'
              )
            )}
          </TabsContent>

          <TabsContent value="assists">
            {topAssists.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={`assists-skeleton-loader-${i}`} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              renderPlayerList(
                transformApiData(topAssists.data, 'assists'), 
                'assists'
              )
            )}
          </TabsContent>

          <TabsContent value="cards">
            {topYellowCards.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={`yellow-cards-skeleton-loader-${i}`} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              renderPlayerList(
                transformApiData(topYellowCards.data, 'yellowCards'), 
                'yellowCards'
              )
            )}
          </TabsContent>

          <TabsContent value="redcards">
            {topRedCards.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={`red-cards-skeleton-loader-${i}`} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              renderPlayerList(
                transformApiData(topRedCards.data, 'redCards'), 
                'redCards'
              )
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default PlayerStats;
