import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import Sidebar from "@/components/Sidebar";

import MatchRow from "@/components/MatchRow";
import MockAPIAlert from "@/components/MockAPIAlert";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Trophy, RefreshCw } from "lucide-react";
import { useLiveMatches, useTodayMatches } from "@/hooks/useFootballAPI";
import { useTranslation } from "@/hooks/useTranslation";

// Types
interface ApiMatch {
  fixture?: {
    id?: number;
    date: string;
    status?: {
      short: string;
      elapsed?: number;
    };
  };
  teams?: {
    home?: {
      name: string;
      nameTranslated?: {
        arabic?: string;
      };
      logo?: string;
    };
    away?: {
      name: string;
      nameTranslated?: {
        arabic?: string;
      };
      logo?: string;
    };
  };
  goals?: {
    home?: number;
    away?: number;
  };
  league?: {
    name: string;
  };
}

const Matches = () => {
  const { currentLanguage } = useTranslation();
  
  // Utilisation des hooks pour récupérer les données réelles
  const liveMatches = useLiveMatches({ 
    translateContent: true,
    refreshInterval: 30000 // Actualisation toutes les 30 secondes
  });
  
  const todayMatches = useTodayMatches({ 
    translateContent: true,
    refreshInterval: 300000 // Actualisation toutes les 5 minutes
  });

  // Fonction pour convertir les données de l'API au format attendu par MatchCard/MatchRow
  const convertAPIMatchToMatchCard = (apiMatch: ApiMatch) => {
    const isArabic = currentLanguage === 'ar';
    
    return {
      homeTeam: isArabic && apiMatch.teams?.home?.nameTranslated?.arabic 
        ? apiMatch.teams.home.nameTranslated.arabic 
        : apiMatch.teams?.home?.name || '',
      awayTeam: isArabic && apiMatch.teams?.away?.nameTranslated?.arabic 
        ? apiMatch.teams.away.nameTranslated.arabic 
        : apiMatch.teams?.away?.name || '',
      homeScore: apiMatch.goals?.home || 0,
      awayScore: apiMatch.goals?.away || 0,
      time: apiMatch.fixture?.status?.elapsed ? `${apiMatch.fixture.status.elapsed}'` : 
            new Date(apiMatch.fixture?.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      status: getMatchStatus(apiMatch.fixture?.status?.short),
      competition: apiMatch.league?.name || '',
      homeLogo: apiMatch.teams?.home?.logo,
      awayLogo: apiMatch.teams?.away?.logo,
      elapsed: apiMatch.fixture?.status?.elapsed
    };
  };

  // Fonction pour convertir le statut de l'API au format attendu
  const getMatchStatus = (apiStatus?: string): 'live' | 'upcoming' | 'finished' => {
    switch (apiStatus) {
      case 'LIVE':
      case '1H':
      case '2H':
      case 'HT':
      case 'ET':
        return 'live';
      case 'FT':
      case 'AET':
      case 'PEN':
        return 'finished';
      default:
        return 'upcoming';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
      <TeamsLogos />
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6 lg:space-y-8">
            {/* Alerte API Mock */}
            <MockAPIAlert onRetry={() => {
              liveMatches.refetch();
              todayMatches.refetch();
            }} />

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sport-dark to-sport-green bg-clip-text text-transparent">
                  {currentLanguage === 'ar' ? 'المباريات' : 'Matches'}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  {currentLanguage === 'ar' ? 'متابعة النتائج المباشرة وجدول المباريات' : 'Suivez les résultats en direct et le calendrier des matchs'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {currentLanguage === 'ar' ? 'اختر التاريخ' : 'Choisir la date'}
                </Button>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Trophy className="w-4 h-4 mr-2" />
                  {currentLanguage === 'ar' ? 'البطولات' : 'Championnats'}
                </Button>
              </div>
            </div>

            {/* Matches organized by leagues - Similar to the image */}
            <div className="space-y-6">
              {/* Date Navigation */}
              <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {currentLanguage === 'ar' ? '8 أغسطس 2025' : '8 Août 2025'}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">←</Button>
                    <Button variant="ghost" size="sm">→</Button>
                  </div>
                </div>
                <h1 className="text-xl font-bold text-sport-green">
                  {currentLanguage === 'ar' ? 'المباريات' : 'Matches'}
                </h1>
              </div>

              {/* Egyptian League */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                  <span className="text-sm">🏆</span>
                  <h3 className="font-semibold text-sport-dark">
                    {currentLanguage === 'ar' ? 'الدوري المصري' : 'Ligue Égyptienne'}
                  </h3>
                  <div className="flex gap-2 mr-auto">
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      {currentLanguage === 'ar' ? 'الأخبار' : 'Nouvelles'}
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      {currentLanguage === 'ar' ? 'الترتيب' : 'Classement'}
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      {currentLanguage === 'ar' ? 'الهدافون' : 'Buteurs'}
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">...</button>
                  </div>
                </div>
                
                <div className="divide-y">
                  {/* Sample matches for Egyptian League */}
                  <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs">🏟️</span>
                      </div>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 min-w-[120px] justify-end">
                          <span className="font-medium text-sm">وادي دجلة</span>
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">W</span>
                          </div>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <div className="text-sm text-gray-500">04:00 م</div>
                        </div>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">P</span>
                          </div>
                          <span className="font-medium text-sm">بيراميدز</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-400">
                      <button className="hover:text-gray-600">الأخبار</button>
                      <button className="hover:text-gray-600">الترتيب</button>
                      <button className="hover:text-gray-600">الهدافون</button>
                      <button className="hover:text-gray-600">...</button>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs">🏟️</span>
                      </div>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 min-w-[120px] justify-end">
                          <span className="font-medium text-sm">سيراميكا</span>
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">S</span>
                          </div>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <div className="text-sm text-gray-500">07:00 م</div>
                        </div>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">Z</span>
                          </div>
                          <span className="font-medium text-sm">الزمالك</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-400">
                      <button className="hover:text-gray-600">الأخبار</button>
                      <button className="hover:text-gray-600">الترتيب</button>
                      <button className="hover:text-gray-600">الهدافون</button>
                      <button className="hover:text-gray-600">...</button>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs">🏟️</span>
                      </div>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 min-w-[120px] justify-end">
                          <span className="font-medium text-sm">المصري</span>
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">M</span>
                          </div>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <div className="text-sm text-gray-500">07:00 م</div>
                        </div>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="w-6 h-6 bg-green-700 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">A</span>
                          </div>
                          <span className="font-medium text-sm">الاتحاد</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-400">
                      <button className="hover:text-gray-600">الأخبار</button>
                      <button className="hover:text-gray-600">الترتيب</button>
                      <button className="hover:text-gray-600">الهدافون</button>
                      <button className="hover:text-gray-600">...</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* French League */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                  <span className="text-sm">🇫🇷</span>
                  <h3 className="font-semibold text-sport-dark">
                    {currentLanguage === 'ar' ? 'الدوري الفرنسي الممتاز' : 'Ligue 1 Française'}
                  </h3>
                  <div className="flex gap-2 mr-auto">
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      {currentLanguage === 'ar' ? 'الأخبار' : 'Nouvelles'}
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      {currentLanguage === 'ar' ? 'الترتيب' : 'Classement'}
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      {currentLanguage === 'ar' ? 'الهدافون' : 'Buteurs'}
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">...</button>
                  </div>
                </div>
                
                <div className="divide-y">
                  <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs">🏟️</span>
                      </div>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 min-w-[120px] justify-end">
                          <span className="font-medium text-sm">غازي عنتاب</span>
                          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">G</span>
                          </div>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <div className="text-sm text-gray-500">07:30 م</div>
                        </div>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">G</span>
                          </div>
                          <span className="font-medium text-sm">غلطة سراي</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-400">
                      <button className="hover:text-gray-600">الأخبار</button>
                      <button className="hover:text-gray-600">الترتيب</button>
                      <button className="hover:text-gray-600">الهدافون</button>
                      <button className="hover:text-gray-600">...</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* English Premier League */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                  <span className="text-sm">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                  <h3 className="font-semibold text-sport-dark">
                    {currentLanguage === 'ar' ? 'دوري البطولة الإنجليزية' : 'Championship Anglais'}
                  </h3>
                  <div className="flex gap-2 mr-auto">
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      {currentLanguage === 'ar' ? 'الأخبار' : 'Nouvelles'}
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      {currentLanguage === 'ar' ? 'الترتيب' : 'Classement'}
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      {currentLanguage === 'ar' ? 'الهدافون' : 'Buteurs'}
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">...</button>
                  </div>
                </div>
                
                <div className="divide-y">
                  <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs">🏟️</span>
                      </div>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 min-w-[120px] justify-end">
                          <span className="font-medium text-sm">برمنغهام</span>
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">B</span>
                          </div>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <div className="text-sm text-gray-500">08:00 م</div>
                        </div>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="w-6 h-6 bg-blue-800 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">I</span>
                          </div>
                          <span className="font-medium text-sm">إبسويتش</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-400">
                      <button className="hover:text-gray-600">الأخبار</button>
                      <button className="hover:text-gray-600">الترتيب</button>
                      <button className="hover:text-gray-600">الهدافون</button>
                      <button className="hover:text-gray-600">...</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dutch League */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                  <span className="text-sm">🇳🇱</span>
                  <h3 className="font-semibold text-sport-dark">
                    {currentLanguage === 'ar' ? 'الدوري الهولندي الممتاز' : 'Eredivisie'}
                  </h3>
                  <div className="flex gap-2 mr-auto">
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      {currentLanguage === 'ar' ? 'الأخبار' : 'Nouvelles'}
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      {currentLanguage === 'ar' ? 'الترتيب' : 'Classement'}
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      {currentLanguage === 'ar' ? 'الهدافون' : 'Buteurs'}
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">...</button>
                  </div>
                </div>
                
                <div className="p-4 text-center text-gray-500">
                  {currentLanguage === 'ar' ? 'لا توجد مباريات مجدولة' : 'Aucun match programmé'}
                </div>
              </div>

              {/* Show real API data if available */}
              {liveMatches.data?.response?.length && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="bg-red-50 px-4 py-3 border-b flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <h3 className="font-semibold text-red-700">
                      {currentLanguage === 'ar' ? 'المباريات المباشرة' : 'Matchs en direct'}
                    </h3>
                    <Badge variant="destructive" className="bg-red-500 text-xs">LIVE</Badge>
                  </div>
                  
                  <div className="divide-y">
                    {liveMatches.data.response.slice(0, 5).map((match: ApiMatch, index: number) => (
                      <MatchRow key={match.fixture?.id || index} match={convertAPIMatchToMatchCard(match)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Show today's matches if available */}
              {todayMatches.data?.response?.length && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-blue-700">
                      {currentLanguage === 'ar' ? 'مباريات اليوم' : 'Matchs du jour'}
                    </h3>
                  </div>
                  
                  <div className="divide-y">
                    {todayMatches.data.response.slice(0, 5).map((match: ApiMatch, index: number) => (
                      <MatchRow key={match.fixture?.id || index} match={convertAPIMatchToMatchCard(match)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* API Statistics for debugging */}
            {liveMatches.lastUpdated && (
              <div className="text-xs text-muted-foreground text-center">
                {currentLanguage === 'ar' ? 'آخر تحديث:' : 'Dernière mise à jour:'} {liveMatches.lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default Matches;
