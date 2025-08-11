import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import DatePicker from "@/components/DatePicker";
import LeagueSelector from "@/components/LeagueSelector";
import MatchRow from "@/components/MatchRow";
import MockAPIAlert from "@/components/MockAPIAlert";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw } from "lucide-react";
import { useLiveMatches, useMatchesByDateAndLeague } from "@/hooks/useFootballAPI";
import { useTranslation } from "@/hooks/useTranslation";
import { MAIN_LEAGUES } from "@/config/api";
import { useState, useEffect } from "react";
import { footballTranslationService } from '../services/translationService';
import MatchHeader from "@/components/MatchHeader";

// Composant pour gérer l'affichage asynchrone avec traduction
const AsyncMatchRow = ({ match }: { match: unknown }) => {
  const { currentLanguage } = useTranslation();
  const [translated, setTranslated] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const convertAPIMatchToMatchCard = async (apiMatch: unknown) => {
      const match = apiMatch as {
        teams?: {
          home?: { name?: string; logo?: string };
          away?: { name?: string; logo?: string };
        };
        goals?: { home?: number; away?: number };
        fixture?: { status?: { elapsed?: number; short?: string }; date?: string };
        league?: { name?: string };
      };

      // Traduire les noms d'équipe et compétition
      const homeTeamTrans = await footballTranslationService.translateTeamName(match.teams?.home?.name || '');
      const awayTeamTrans = await footballTranslationService.translateTeamName(match.teams?.away?.name || '');
      const leagueTrans = match.league?.name
        ? await footballTranslationService.translateTeamName(match.league.name)
        : { arabic: '', french: '', original: '' };

      // Gérer le temps d'affichage
      let displayTime = '';
      if (match.fixture?.status?.elapsed) {
        displayTime = `${match.fixture.status.elapsed}'`;
      } else if (match.fixture?.date) {
        displayTime = new Date(match.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      }

      // Choisir la langue
      let homeTeam = '';
      let awayTeam = '';
      let competition = '';
      if (currentLanguage === 'ar') {
        homeTeam = homeTeamTrans.arabic;
        awayTeam = awayTeamTrans.arabic;
        competition = leagueTrans.arabic;
      } else if (currentLanguage === 'fr') {
        homeTeam = homeTeamTrans.french;
        awayTeam = awayTeamTrans.french;
        competition = leagueTrans.french;
      } else {
        homeTeam = homeTeamTrans.original;
        awayTeam = awayTeamTrans.original;
        competition = leagueTrans.original;
      }

      return {
        homeTeam,
        awayTeam,
        homeScore: match.goals?.home || 0,
        awayScore: match.goals?.away || 0,
        time: displayTime,
        status: getMatchStatus(match.fixture?.status?.short),
        competition,
        homeLogo: match.teams?.home?.logo,
        awayLogo: match.teams?.away?.logo
      };
    };

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

    (async () => {
      const result = await convertAPIMatchToMatchCard(match);
      if (mounted) setTranslated(result);
    })();
    
    return () => { mounted = false; };
  }, [match, currentLanguage]);

  if (!translated) return <div className="py-4 text-center text-xs text-muted-foreground">Loading...</div>;
  return (
    <>
      <div onClick={() => setShowModal(true)} style={{cursor: 'pointer'}}>
        <MatchRow match={translated} />
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[300px] max-w-[90vw] shadow-lg">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowModal(false)}>
              ×
            </button>
            <div className="flex flex-col items-center gap-2">
              <span className="text-lg font-bold mb-2">تفاصيل المباراة</span>
              <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                <span>الهدافون</span>
                <span>الترتيب</span>
                <span>...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Matches = () => {
  const { currentLanguage } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLeagues, setSelectedLeagues] = useState<number[]>([]);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [currentLivePage, setCurrentLivePage] = useState(1);
  const [liveItemsPerPage] = useState(6);
  
  // Utilisation des hooks pour récupérer les données
  const liveMatches = useLiveMatches({ 
    translateContent: false,
    refreshInterval: 30000
  });
  
  const selectedMatches = useMatchesByDateAndLeague({ 
    date: selectedDate,
    leagueIds: selectedLeagues,
    translateContent: false,
    refreshInterval: 300000
  });

  // Données statiques pour les ligues
  const leagues = [
    { 
      name: currentLanguage === 'ar' ? "البريمير ليغ" : "Premier League", 
      id: MAIN_LEAGUES.PREMIER_LEAGUE,
      matches: 8, 
      flag: "🏴" 
    },
    { 
      name: currentLanguage === 'ar' ? "الليج 1" : "Ligue 1", 
      id: MAIN_LEAGUES.LIGUE_1,
      matches: 5, 
      flag: "🇫🇷" 
    },
    { 
      name: currentLanguage === 'ar' ? "البوندسليجا" : "Bundesliga", 
      id: MAIN_LEAGUES.BUNDESLIGA,
      matches: 4, 
      flag: "🇩🇪" 
    },
    { 
      name: currentLanguage === 'ar' ? "الليغا الإسبانية" : "La Liga", 
      id: MAIN_LEAGUES.LA_LIGA,
      matches: 6, 
      flag: "🇪🇸" 
    },
    { 
      name: currentLanguage === 'ar' ? "الدوري الإيطالي" : "Serie A", 
      id: MAIN_LEAGUES.SERIE_A,
      matches: 7, 
      flag: "🇮🇹" 
    }
  ];

  // Fonction pour vérifier si un match est en direct
  const isLiveMatch = (match: unknown): boolean => {
    const matchData = match as { fixture?: { status?: { short?: string } } };
    const status = matchData.fixture?.status?.short;
    return ['LIVE', '1H', '2H', 'HT', 'ET'].includes(status || '');
  };

  // Filtrer les matchs pour séparer en direct et programmés
  const liveMatchesFromSelected = selectedMatches.data?.response 
    ? selectedMatches.data.response.filter(match => isLiveMatch(match))
    : [];

  const scheduledMatchesFromSelected = selectedMatches.data?.response 
    ? selectedMatches.data.response.filter(match => !isLiveMatch(match))
    : [];

  // Combiner les matchs en direct
  const allLiveMatches = [
    ...(liveMatches.data?.response || []),
    ...liveMatchesFromSelected
  ];

  const combinedLiveMatches = {
    data: allLiveMatches.length > 0 ? { response: allLiveMatches } : null,
    loading: liveMatches.loading,
    error: liveMatches.error,
    lastUpdated: liveMatches.lastUpdated || selectedMatches.lastUpdated
  };

  const selectedMatchesWithFilteredData = {
    ...selectedMatches,
    data: selectedMatches.data ? {
      ...selectedMatches.data,
      response: scheduledMatchesFromSelected
    } : null
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
      <TeamsLogos />
      
      <div className="container mx-auto px-2 sm:px-3 py-2 sm:py-3 lg:py-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-3 lg:gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Match Header avec filtres */}
            <MatchHeader
              selectedDate={selectedDate}
              onDateChange={(date) => {
                setSelectedDate(date);
                setCurrentPage(1);
              }}
              selectedLeagues={selectedLeagues}
              onLeaguesChange={(leagues) => {
                setSelectedLeagues(leagues);
                setCurrentPage(1);
              }}
              onReset={() => {
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setSelectedLeagues([]);
                setCurrentPage(1);
                setCurrentLivePage(1);
              }}
            />
            
            {/* Alerte API Mock */}
            <MockAPIAlert onRetry={() => {
              liveMatches.refetch();
              selectedMatches.refetch();
            }} />

            {/* Live Matches Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-between bg-gradient-to-r from-red-50 to-red-100 p-2 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <h2 className="text-sm sm:text-base font-bold text-sport-dark flex-1">
                    {currentLanguage === 'ar' ? 'المباريات المباشرة' : 'Matchs en direct'}
                  </h2>
                  <Badge variant="destructive" className="bg-red-500 text-xs px-1 py-0.5">LIVE</Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={liveMatches.refetch}
                  disabled={liveMatches.loading}
                  className="h-7 w-7 p-0 flex-shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${liveMatches.loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              {combinedLiveMatches.loading && (
                <div className="text-center py-4 sm:py-6">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-sport-green mx-auto"></div>
                  <p className="mt-2 text-muted-foreground text-xs">
                    {currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}
                  </p>
                </div>
              )}
              
              {combinedLiveMatches.error && (
                <div className="text-center py-4 sm:py-6">
                  <p className="text-red-500 text-xs">
                    {currentLanguage === 'ar' ? 'خطأ في تحميل المباريات المباشرة' : 'Erreur lors du chargement des matchs en direct'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      liveMatches.refetch();
                      selectedMatches.refetch();
                    }}
                    className="mt-2 text-xs px-2 py-1 h-7"
                  >
                    {currentLanguage === 'ar' ? 'إعادة المحاولة' : 'Réessayer'}
                  </Button>
                </div>
              )}
              
              {combinedLiveMatches.data?.response?.length > 0 ? (
                <div className="space-y-2">
                  {(() => {
                    const allMatches = combinedLiveMatches.data.response;
                    const startIndex = (currentLivePage - 1) * liveItemsPerPage;
                    const endIndex = startIndex + liveItemsPerPage;
                    const paginatedMatches = allMatches.slice(startIndex, endIndex);
                    const totalPages = Math.ceil(allMatches.length / liveItemsPerPage);

                    return (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          {paginatedMatches.map((match: unknown, index: number) => (
                            <AsyncMatchRow 
                              key={(match as {fixture?: {id?: number}}).fixture?.id || `live-${index}`}
                              match={match}
                            />
                          ))}
                        </div>

                        {totalPages > 1 && (
                          <div className="flex justify-center items-center gap-2 pt-3 px-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrentLivePage(Math.max(1, currentLivePage - 1))}
                              disabled={currentLivePage <= 1}
                              className="h-7 px-2 text-xs"
                            >
                              ← {currentLanguage === 'ar' ? 'السابق' : 'Précédent'}
                            </Button>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                              <span className="font-medium text-sport-dark">{currentLivePage}</span>
                              <span>/</span>
                              <span>{totalPages}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrentLivePage(Math.min(totalPages, currentLivePage + 1))}
                              disabled={currentLivePage >= totalPages}
                              className="h-7 px-2 text-xs"
                            >
                              {currentLanguage === 'ar' ? 'التالي' : 'Suivant'} →
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : !combinedLiveMatches.loading && (
                <div className="text-center py-4 sm:py-6 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded-full"></div>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {currentLanguage === 'ar' ? 'لا توجد مباريات مباشرة حالياً' : 'Aucun match en direct actuellement'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentLanguage === 'ar' ? 'سيتم تحديث هذا القسم تلقائياً كل 30 ثانية' : 'Cette section se met à jour automatiquement toutes les 30 secondes'}
                  </p>
                </div>
              )}
            </div>

            {/* Selected Matches Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-between bg-gradient-to-r from-green-50 to-green-100 p-2 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 flex-1">
                  <Clock className="w-3 h-3 text-sport-green flex-shrink-0" />
                  <h2 className="text-sm sm:text-base font-bold text-sport-dark flex-1">
                    {currentLanguage === 'ar' ? 'المباريات المختارة' : 'Matchs sélectionnés'}
                  </h2>
                  {selectedLeagues.length > 0 && (
                    <Badge variant="outline" className="text-xs bg-white border-green-300 px-1 py-0.5">
                      {selectedLeagues.length} {currentLanguage === 'ar' ? 'بطولة' : 'ligues'}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={selectedMatches.refetch}
                  disabled={selectedMatches.loading}
                  className="h-7 w-7 p-0 flex-shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${selectedMatches.loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              {selectedMatches.loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sport-green mx-auto"></div>
                  <p className="mt-2 text-muted-foreground text-xs">
                    {currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}
                  </p>
                </div>
              )}
              
              {selectedMatches.error && (
                <div className="text-center py-4">
                  <p className="text-red-500 text-xs">
                    {currentLanguage === 'ar' ? 'خطأ في تحميل المباريات' : 'Erreur lors du chargement des matchs'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={selectedMatches.refetch}
                    className="mt-2 h-7 px-2 text-xs"
                  >
                    {currentLanguage === 'ar' ? 'إعادة المحاولة' : 'Réessayer'}
                  </Button>
                </div>
              )}
              
              {selectedMatchesWithFilteredData.data?.response?.length > 0 ? (
                <div className="space-y-2">
                  {(() => {
                    const allMatches = selectedMatchesWithFilteredData.data.response;
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedMatches = allMatches.slice(startIndex, endIndex);
                    const totalPages = Math.ceil(allMatches.length / itemsPerPage);

                    return (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          {paginatedMatches.map((match: unknown, index: number) => (
                            <AsyncMatchRow 
                              key={(match as {fixture?: {id?: number}}).fixture?.id || `match-${index}`}
                              match={match}
                            />
                          ))}
                        </div>

                        {totalPages > 1 && (
                          <div className="flex justify-center items-center gap-2 pt-3 px-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage <= 1}
                              className="h-7 px-2 text-xs"
                            >
                              ← {currentLanguage === 'ar' ? 'السابق' : 'Précédent'}
                            </Button>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                              <span className="font-medium text-sport-dark">{currentPage}</span>
                              <span>/</span>
                              <span>{totalPages}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage >= totalPages}
                              className="h-7 px-2 text-xs"
                            >
                              {currentLanguage === 'ar' ? 'التالي' : 'Suivant'} →
                            </Button>
                          </div>
                        )}
                        
                        <div className="text-center text-xs text-muted-foreground bg-gray-50 py-1 px-3 rounded-lg">
                          {currentLanguage === 'ar' ? 'عرض' : 'Affichage'} {startIndex + 1}-{Math.min(endIndex, allMatches.length)} {currentLanguage === 'ar' ? 'من' : 'sur'} {allMatches.length} {currentLanguage === 'ar' ? 'مباراة' : 'matchs'}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : !selectedMatches.loading && (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-muted-foreground text-xs mb-2">
                    {(() => {
                      if (selectedMatches.data?.response?.length === 0) {
                        return currentLanguage === 'ar' 
                          ? 'لا توجد مباريات للتاريخ والبطولات المختارة' 
                          : 'Aucun match trouvé pour la date et les championnats sélectionnés';
                      }
                      if (selectedMatches.data?.response && selectedMatches.data.response.length > 0 && scheduledMatchesFromSelected.length === 0) {
                        return currentLanguage === 'ar' 
                          ? 'جميع المباريات معروضة في قسم المباريات المباشرة أعلاه' 
                          : 'Tous les matchs sont affichés dans la section matchs en direct ci-dessus';
                      }
                      return currentLanguage === 'ar' 
                        ? 'يرجى اختيار تاريخ للبحث عن المباريات' 
                        : 'Veuillez sélectionner une date pour rechercher des matchs';
                    })()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentLanguage === 'ar' ? 'جرب تغيير التاريخ أو البطولة المختارة' : 'Essayez de changer la date ou la compétition sélectionnée'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Matches;