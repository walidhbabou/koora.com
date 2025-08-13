import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, TrendingDown, Minus, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import PlayerStats from "./PlayerStats";
import type { Standing } from "@/config/api";

// Helper function to get Arabic league names
function getArabicLeagueName(leagueName: string): string {
  switch (leagueName) {
    case 'Premier League':
      return 'الدوري الإنجليزي الممتاز';
    case 'La Liga':
      return 'الدوري الإسباني الممتاز';
    case 'Serie A':
      return 'الدوري الإيطالي الممتاز';
    case 'Bundesliga':
      return 'الدوري الألماني الممتاز';
    case 'Ligue 1':
      return 'الدوري الفرنسي الممتاز';
    case 'Champions League':
      return 'دوري أبطال أوروبا';
    default:
      return leagueName;
  }
}

// Helper function to get Arabic team names
function getArabicTeamName(teamName: string): string {
  const teamTranslations: { [key: string]: string } = {
    // Premier League Teams
    'Manchester City': 'مانشستر سيتي',
    'Arsenal': 'أرسنال',
    'Liverpool': 'ليفربول',
    'Chelsea': 'تشيلسي',
    'Manchester United': 'مانشستر يونايتد',
    'Tottenham': 'توتنهام',
    'Newcastle': 'نيوكاسل',
    'Brighton': 'برايتون',
    'West Ham': 'وست هام',
    'Aston Villa': 'أستون فيلا',
    'Crystal Palace': 'كريستال بالاس',
    'Fulham': 'فولهام',
    'Brentford': 'برينتفورد',
    'Wolves': 'وولفرهامبتون',
    'Everton': 'إيفرتون',
    'Leicester': 'ليستر سيتي',
    'Leeds United': 'ليدز يونايتد',
    'Burnley': 'بيرنلي',
    'Southampton': 'ساوثهامبتون',
    'Watford': 'واتفورد',
    'Norwich': 'نورويتش سيتي',
    'Sheffield United': 'شيفيلد يونايتد',
    'Bournemouth': 'بورنموث',
    'Nottingham Forest': 'نوتينغهام فوريست',
    
    // La Liga Teams
    'Real Madrid': 'ريال مدريد',
    'Barcelona': 'برشلونة',
    'Atletico Madrid': 'أتلتيكو مدريد',
    'Real Sociedad': 'ريال سوسيداد',
    'Villarreal': 'فياريال',
    'Sevilla': 'إشبيلية',
    'Real Betis': 'ريال بيتيس',
    'Valencia': 'فالنسيا',
    'Athletic Bilbao': 'أتلتيك بيلباو',
    'Celta Vigo': 'سيلتا فيغو',
    'Espanyol': 'إسبانيول',
    'Getafe': 'خيتافي',
    'Granada': 'غرناطة',
    'Levante': 'ليفانتي',
    'Mallorca': 'مايوركا',
    'Osasuna': 'أوساسونا',
    'Rayo Vallecano': 'رايو فاليكانو',
    'Real Valladolid': 'ريال بايادوليد',
    'Alaves': 'ألافيس',
    'Cadiz': 'قادش',
    'Elche': 'إلتشي',
    
    // Serie A Teams
    'Juventus': 'يوفنتوس',
    'Inter Milan': 'إنتر ميلان',
    'AC Milan': 'ميلان',
    'Napoli': 'نابولي',
    'Roma': 'روما',
    'Lazio': 'لاتسيو',
    'Atalanta': 'أتالانتا',
    'Fiorentina': 'فيورنتينا',
    'Torino': 'تورينو',
    'Sassuolo': 'ساسولو',
    'Udinese': 'أودينيزي',
    'Bologna': 'بولونيا',
    'Sampdoria': 'سامبدوريا',
    'Hellas Verona': 'هيلاس فيرونا',
    'Spezia': 'سبيتزيا',
    'Cagliari': 'كالياري',
    'Genoa': 'جنوة',
    'Empoli': 'إمبولي',
    'Venezia': 'فينيسيا',
    'Salernitana': 'ساليرنيتانا',
    'Monza': 'مونزا',
    'Cremonese': 'كريمونيزي',
    'Lecce': 'ليتشي',
    
    // Bundesliga Teams
    'Bayern Munich': 'بايرن ميونخ',
    'Borussia Dortmund': 'بوروسيا دورتموند',
    'RB Leipzig': 'آر بي لايبزيغ',
    'Bayer Leverkusen': 'باير ليفركوزن',
    'Eintracht Frankfurt': 'آينتراخت فرانكفورت',
    'Borussia Monchengladbach': 'بوروسيا مونشنغلادباخ',
    'Union Berlin': 'يونيون برلين',
    'SC Freiburg': 'فرايبورغ',
    'FC Koln': 'كولن',
    'Mainz': 'ماينز',
    'Hoffenheim': 'هوفنهايم',
    'VfL Wolfsburg': 'فولفسبورغ',
    'Hertha Berlin': 'هيرتا برلين',
    'VfB Stuttgart': 'شتوتغارت',
    'Augsburg': 'أوغسبورغ',
    'Arminia Bielefeld': 'أرمينيا بيليفيلد',
    'Greuther Furth': 'غرويتر فورت',
    'Werder Bremen': 'فيردر بريمن',
    
    // Ligue 1 Teams
    'Paris Saint-Germain': 'باريس سان جيرمان',
    'Marseille': 'مارسيليا',
    'Lyon': 'ليون',
    'Monaco': 'موناكو',
    'Lille': 'ليل',
    'Nice': 'نيس',
    'Rennes': 'رين',
    'Strasbourg': 'ستراسبورغ',
    'Montpellier': 'مونبلييه',
    'Nantes': 'نانت',
    'Reims': 'ريمس',
    'Lens': 'لانس',
    'Brest': 'بريست',
    'Angers': 'أنجيه',
    'Clermont': 'كليرمون',
    'Lorient': 'لوريان',
    'Troyes': 'تروا',
    'Saint-Etienne': 'سان إتيان',
    'Bordeaux': 'بوردو',
    'Metz': 'ميتز',
    
    // Champions League Teams (additional)
    'Manchester City FC': 'مانشستر سيتي',
    'Real Madrid CF': 'ريال مدريد',
    'FC Barcelona': 'برشلونة',
    'Liverpool FC': 'ليفربول',
    'Chelsea FC': 'تشيلسي',
    'Bayern München': 'بايرن ميونخ',
    'Paris Saint Germain': 'باريس سان جيرمان',
    'Juventus FC': 'يوفنتوس',
    'Inter': 'إنتر ميلان',
    'Milan': 'ميلان',
    'Atletico de Madrid': 'أتلتيكو مدريد'
  };
  
  return teamTranslations[teamName] || teamName;
}

// Helper function to get goal difference color
function getGoalDiffColorClass(goalsDiff: number): string {
  if (goalsDiff > 0) {
    return 'text-green-600 dark:text-green-400';
  }
  if (goalsDiff < 0) {
    return 'text-red-600 dark:text-red-400';
  }
  return 'text-gray-600 dark:text-gray-400';
}

interface LeagueStandingTableProps {
  leagueId: number;
  leagueName: string;
  leagueLogo: string;
  country: string;
  flag: string;
  standings: Standing[];
  loading?: boolean;
  compact?: boolean;
}

const LeagueStandingTable = ({ 
  leagueId,
  leagueName, 
  leagueLogo, 
  country, 
  flag, 
  standings, 
  loading = false,
  compact = false 
}: LeagueStandingTableProps) => {
  const { currentLanguage } = useTranslation();

  const getPositionColor = (rank: number, status?: string) => {
    if (status?.includes('Champions League') || rank <= 4) {
      return 'bg-green-500';
    }
    if (status?.includes('Europa League') || (rank >= 5 && rank <= 7)) {
      return 'bg-blue-500';
    }
    if (rank >= standings.length - 2) {
      return 'bg-red-500';
    }
    return 'bg-gray-400';
  };

  const getPositionIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (rank <= 4) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (rank >= standings.length - 2) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const formatForm = (form: string | null | undefined) => {
    if (!form) {
      form = 'WDLWW';
    }
    return form.split('').map((result, index) => {
      let bgColor = 'bg-red-500';
      if (result === 'W') {
        bgColor = 'bg-green-500';
      } else if (result === 'D') {
        bgColor = 'bg-yellow-500';
      }

      return (
        <span
          key={`form-${index}-${result}`}
          className={`inline-block w-6 h-6 text-xs font-bold rounded-full text-white leading-6 text-center mr-1 ${bgColor}`}
        >
          {result}
        </span>
      );
    });
  };

  const displayStandings = compact ? standings.slice(0, 8) : standings;

  return (
    <div className="space-y-4">
      {/* En-tête de la ligue */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={leagueLogo} alt={leagueName} className="w-12 h-12 sm:w-10 sm:h-10 bg-white rounded-full p-1 flex-shrink-0" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {currentLanguage === 'ar' 
                  ? getArabicLeagueName(leagueName)
                  : leagueName
                }
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm">{flag} {country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu avec onglets */}
      <Tabs defaultValue="standings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="standings" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>{currentLanguage === 'ar' ? 'الترتيب' : 'Classement'}</span>
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{currentLanguage === 'ar' ? 'إحصائيات اللاعبين' : 'Statistiques Joueurs'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standings">
          <Card className="overflow-hidden bg-white dark:bg-[#181a20] border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* En-tête du tableau */}
                <div className="bg-gray-100 dark:bg-[#23262f] p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-6 sm:col-span-5">{currentLanguage === 'ar' ? 'الفريق' : 'Équipe'}</div>
                    <div className="col-span-1 text-center hidden sm:block">{currentLanguage === 'ar' ? 'ل' : 'J'}</div>
                    <div className="col-span-2 sm:col-span-1 text-center">{currentLanguage === 'ar' ? 'نقاط' : 'Pts'}</div>
                    <div className="col-span-1 text-center hidden md:block">{currentLanguage === 'ar' ? 'الفارق' : '+/-'}</div>
                    <div className="col-span-3 text-center hidden lg:block">{currentLanguage === 'ar' ? 'الشكل' : 'Forme'}</div>
                  </div>
                </div>

                {/* Tableau des classements */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {displayStandings.map((team, index) => (
                    <div 
                      key={team.team.id} 
                      className="grid grid-cols-12 gap-2 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-[#23262f] transition-colors"
                    >
                      {/* Position avec indicateur */}
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="relative">
                          <div 
                            className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full ${getPositionColor(team.rank, team.status)} flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {team.rank}
                          </div>
                          <div className="absolute -top-1 -right-1">
                            {getPositionIcon(team.rank)}
                          </div>
                        </div>
                      </div>

                      {/* Équipe */}
                      <div className="col-span-6 sm:col-span-5 flex items-center gap-2 sm:gap-3">
                        <img 
                          src={team.team.logo} 
                          alt={team.team.name}
                          className="w-10 h-10 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                        />
                        <span className="font-semibold text-gray-800 dark:text-gray-200 truncate text-sm sm:text-base">
                          {currentLanguage === 'ar' 
                            ? getArabicTeamName(team.team.name)
                            : team.team.name
                          }
                        </span>
                      </div>

                      {/* Matchs joués */}
                      <div className="col-span-1 text-center text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                        {team.all.played}
                      </div>

                      {/* Points */}
                      <div className="col-span-2 sm:col-span-1 text-center">
                        <span className="font-bold text-lg sm:text-lg text-gray-800 dark:text-gray-200">
                          {team.points}
                        </span>
                      </div>

                      {/* Différence de buts */}
                      <div className="col-span-1 text-center text-sm hidden md:block">
                        <span className={`font-semibold ${getGoalDiffColorClass(team.goalsDiff)}`}>
                          {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                        </span>
                      </div>

                      {/* Forme */}
                      <div className="col-span-3 flex justify-center hidden lg:flex">
                        {formatForm(team.form)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Légende */}
                <div className="bg-gray-50 dark:bg-[#23262f] p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {currentLanguage === 'ar' ? 'دوري الأبطال' : 'Champions League'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {currentLanguage === 'ar' ? 'الدوري الأوروبي' : 'Europa League'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {currentLanguage === 'ar' ? 'الهبوط' : 'Relégation'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <PlayerStats 
            leagueName={leagueName}
            leagueId={leagueId}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeagueStandingTable;
