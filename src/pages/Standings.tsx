import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TeamsLogos from "@/components/TeamsLogos";
import LeagueStandingTable from "@/components/LeagueStandingTable";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Search, Star, Medal, Award, Crown, RefreshCw, Filter } from "lucide-react";
import { useAllLeagueStandings, useMockStandings } from "@/hooks/useStandings";
import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import { MAIN_LEAGUES } from "@/config/api";

const Standings = () => {
  const { currentLanguage, t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [showLeagueDetail, setShowLeagueDetail] = useState(false);
  
  // Récupérer les classements de toutes les ligues
  const { leagues, isLoading, hasError, refetchAll } = useAllLeagueStandings();
  
  // Données mock en cas d'erreur API
  const mockPremierLeague = useMockStandings(MAIN_LEAGUES.PREMIER_LEAGUE);
  const mockLaLiga = useMockStandings(MAIN_LEAGUES.LA_LIGA);

  // Données des ligues pour l'affichage en liste
  const leaguesList = [
    {
      id: MAIN_LEAGUES.CHAMPIONS_LEAGUE,
      name: currentLanguage === 'ar' ? 'دوري أبطال أوروبا' : 'Champions League',
      logo: 'https://media.api-sports.io/football/leagues/2.png',
      country: currentLanguage === 'ar' ? 'أوروبا' : 'Europe',
      flag: '🇪🇺'
    },
    {
      id: MAIN_LEAGUES.PREMIER_LEAGUE,
      name: currentLanguage === 'ar' ? 'الدوري الإنجليزي الممتاز' : 'Premier League',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      country: currentLanguage === 'ar' ? 'إنجلترا' : 'England',
      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    },
    {
      id: MAIN_LEAGUES.LA_LIGA,
      name: currentLanguage === 'ar' ? 'الدوري الإسباني الممتاز' : 'La Liga',
      logo: 'https://media.api-sports.io/football/leagues/140.png',
      country: currentLanguage === 'ar' ? 'إسبانيا' : 'Spain',
      flag: '🇪🇸'
    },
    {
      id: MAIN_LEAGUES.SERIE_A,
      name: currentLanguage === 'ar' ? 'الدوري الإيطالي الممتاز' : 'Serie A',
      logo: 'https://media.api-sports.io/football/leagues/135.png',
      country: currentLanguage === 'ar' ? 'إيطاليا' : 'Italy',
      flag: '🇮🇹'
    },
    {
      id: MAIN_LEAGUES.BUNDESLIGA,
      name: currentLanguage === 'ar' ? 'الدوري الألماني الممتاز' : 'Bundesliga',
      logo: 'https://media.api-sports.io/football/leagues/78.png',
      country: currentLanguage === 'ar' ? 'ألمانيا' : 'Germany',
      flag: '🇩🇪'
    },
    {
      id: MAIN_LEAGUES.LIGUE_1,
      name: currentLanguage === 'ar' ? 'الدوري الفرنسي الممتاز' : 'Ligue 1',
      logo: 'https://media.api-sports.io/football/leagues/61.png',
      country: currentLanguage === 'ar' ? 'فرنسا' : 'France',
      flag: '🇫🇷'
    }
  ];

  // Filtrer les ligues selon la recherche
  const filteredLeagues = leaguesList.filter(league => 
    league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    league.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour gérer le clic sur une ligue
  const handleLeagueClick = (leagueId: number) => {
    setSelectedLeague(leagueId);
    setShowLeagueDetail(true);
  };

  // Fonction pour revenir à la liste des ligues
  const handleBackToList = () => {
    setShowLeagueDetail(false);
    setSelectedLeague(null);
  };

  // Obtenir les données de classement pour la ligue sélectionnée
  const getSelectedLeagueData = () => {
    if (!selectedLeague) return null;
    
    const leagueData = leagues.find(l => l.leagueId === selectedLeague);
    if (leagueData && leagueData.standings.length > 0) {
      return leagueData;
    }
    
    // Fallback vers les données mock
    if (selectedLeague === MAIN_LEAGUES.PREMIER_LEAGUE) {
      return {
        leagueId: MAIN_LEAGUES.PREMIER_LEAGUE,
        leagueName: 'Premier League',
        leagueLogo: 'https://media.api-sports.io/football/leagues/39.png',
        country: 'England',
        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        season: 2025,
        standings: mockPremierLeague.standings,
        loading: false,
        error: null
      };
    } else if (selectedLeague === MAIN_LEAGUES.LA_LIGA) {
      return {
        leagueId: MAIN_LEAGUES.LA_LIGA,
        leagueName: 'La Liga',
        leagueLogo: 'https://media.api-sports.io/football/leagues/140.png',
        country: 'Spain',
        flag: '🇪🇸',
        season: 2025,
        standings: mockLaLiga.standings,
        loading: false,
        error: null
      };
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-[#f6f7fa] dark:bg-[#0f1419]">
      <Header />
      <TeamsLogos />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Vue liste des ligues */}
        {!showLeagueDetail && (
          <>
            {/* En-tête de la page */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                  {t('standings')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  {currentLanguage === 'ar' ? 'اختر البطولة لعرض الترتيب' : 'Sélectionnez un tournoi pour voir le classement'}
                </p>
              </div>
              
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t('searchTournament')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-[#181a20] border-gray-200 dark:border-[#23262f] focus:border-blue-500 w-64"
                />
              </div>
            </div>

            {/* Liste des ligues */}
            <div className="max-w-2xl mx-auto">
              <Card className="bg-white dark:bg-[#181a20] border-0 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 p-4">
                  <h2 className="text-xl font-bold text-white text-center">
                    {currentLanguage === 'ar' ? 'البطولات' : 'Tournois'}
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredLeagues.map((league) => (
                    <div 
                      key={league.id}
                      onClick={() => handleLeagueClick(league.id)}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#23262f] cursor-pointer transition-colors duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <img 
                          src={league.logo} 
                          alt={league.name}
                          className="w-12 h-12 object-contain bg-white rounded-lg p-1 shadow-sm"
                        />
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {league.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <span className="text-lg">{league.flag}</span>
                            {league.country}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {currentLanguage === 'ar' ? 'الموسم 24/25' : 'Season 24/25'}
                        </Badge>
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm group-hover:bg-blue-700 transition-colors">
                          →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              {/* Message si aucun résultat */}
              {filteredLeagues.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {currentLanguage === 'ar' ? 'لم يتم العثور على نتائج' : 'Aucun résultat trouvé'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {currentLanguage === 'ar' 
                      ? 'جرب البحث بكلمات مختلفة' 
                      : 'Essayez avec des mots-clés différents'
                    }
                  </p>
                  <Button onClick={() => setSearchTerm("")} variant="outline">
                    {currentLanguage === 'ar' ? 'مسح البحث' : 'Effacer la recherche'}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Vue détail du classement */}
        {showLeagueDetail && selectedLeague && (
          <>
            {/* En-tête avec bouton retour */}
            <div className="flex items-center gap-4 mb-8">
              <Button 
                onClick={handleBackToList}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                ← {currentLanguage === 'ar' ? 'رجوع' : 'Retour'}
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {currentLanguage === 'ar' ? 'ترتيب البطولة' : 'Classement du tournoi'}
                </h1>
              </div>
            </div>

            {/* Affichage du classement */}
            <div className="max-w-5xl mx-auto">
              {(() => {
                const leagueData = getSelectedLeagueData();
                if (!leagueData) {
                  return (
                    <Card className="p-8 text-center bg-white dark:bg-[#181a20] border-0 shadow-lg">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {currentLanguage === 'ar' ? 'البيانات غير متوفرة' : 'Données non disponibles'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {currentLanguage === 'ar' 
                          ? 'عذراً، لا يمكن تحميل بيانات هذه البطولة حالياً' 
                          : 'Désolé, impossible de charger les données de ce tournoi actuellement'
                        }
                      </p>
                    </Card>
                  );
                }

                return (
                  <LeagueStandingTable
                    leagueId={selectedLeague}
                    leagueName={leagueData.leagueName}
                    leagueLogo={leagueData.leagueLogo}
                    country={leagueData.country}
                    flag={leagueData.flag}
                    standings={leagueData.standings}
                    loading={leagueData.loading}
                    compact={false}
                  />
                );
              })()}
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Standings;
