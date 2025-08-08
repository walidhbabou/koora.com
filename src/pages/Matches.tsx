import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import DatePicker from "@/components/DatePicker";
import LeagueSelector from "@/components/LeagueSelector";
import MatchRow from "@/components/MatchRow";
import MockAPIAlert from "@/components/MockAPIAlert";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw } from "lucide-react";
import { useLiveMatches, useMatchesByDateAndLeague } from "@/hooks/useFootballAPI";
import { useTranslation } from "@/hooks/useTranslation";
import { MAIN_LEAGUES } from "@/config/api";
import { useState } from "react";

const Matches = () => {
  const { currentLanguage } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLeagues, setSelectedLeagues] = useState<number[]>([]);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 matchs par page
  const [currentLivePage, setCurrentLivePage] = useState(1);
  const [liveItemsPerPage] = useState(6); // 6 matchs en direct par page
  
  // Utilisation des hooks pour récupérer les données réelles
  const liveMatches = useLiveMatches({ 
    translateContent: false, // Désactiver la traduction temporairement
    refreshInterval: 30000 // Actualisation toutes les 30 secondes
  });
  
  // Hook pour les matchs par date et championnat sélectionnés
  const selectedMatches = useMatchesByDateAndLeague({ 
    date: selectedDate,
    leagueIds: selectedLeagues,
    translateContent: false, // Désactiver la traduction temporairement
    refreshInterval: 300000 // Actualisation toutes les 5 minutes
  });

  // Données statiques pour les ligues sélectionnées (plan gratuit API Football)
  const leagues = [
    { 
      name: currentLanguage === 'ar' ? "البريمير ليغ" : "Premier League", 
      id: MAIN_LEAGUES.PREMIER_LEAGUE,
      matches: 8, 
      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" 
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
      flag: "��" 
    },
    { 
      name: currentLanguage === 'ar' ? "الدوري الإيطالي" : "Serie A", 
      id: MAIN_LEAGUES.SERIE_A,
      matches: 7, 
      flag: "🇮�" 
    }
  ];

  // Fonction pour convertir les données de l'API au format attendu par MatchCard
  const convertAPIMatchToMatchCard = (apiMatch: unknown) => {
    const match = apiMatch as {
      teams?: {
        home?: { 
          name?: string; 
          nameTranslated?: { arabic?: string }; 
          logo?: string; 
        };
        away?: { 
          name?: string; 
          nameTranslated?: { arabic?: string }; 
          logo?: string; 
        };
      };
      goals?: { home?: number; away?: number };
      fixture?: { 
        status?: { elapsed?: number; short?: string }; 
        date?: string; 
      };
      league?: { name?: string };
    };
    
    const isArabic = currentLanguage === 'ar';
    
    // Gérer le temps d'affichage
    let displayTime = '';
    if (match.fixture?.status?.elapsed) {
      displayTime = `${match.fixture.status.elapsed}'`;
    } else if (match.fixture?.date) {
      displayTime = new Date(match.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    return {
      homeTeam: isArabic && match.teams?.home?.nameTranslated?.arabic 
        ? match.teams.home.nameTranslated.arabic 
        : match.teams?.home?.name || '',
      awayTeam: isArabic && match.teams?.away?.nameTranslated?.arabic 
        ? match.teams.away.nameTranslated.arabic 
        : match.teams?.away?.name || '',
      homeScore: match.goals?.home || 0,
      awayScore: match.goals?.away || 0,
      time: displayTime,
      status: getMatchStatus(match.fixture?.status?.short),
      competition: match.league?.name || '',
      homeLogo: match.teams?.home?.logo,
      awayLogo: match.teams?.away?.logo
    };
  };

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

  // Combiner les matchs en direct de l'API live et ceux trouvés dans les matchs sélectionnés
  const allLiveMatches = [
    ...(liveMatches.data?.response || []),
    ...liveMatchesFromSelected
  ];

  // Créer un objet similaire aux hooks pour les matchs en direct combinés
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

  // Fonction pour convertir le statut de l'API au format attendu
  const getMatchStatus = (apiStatus: string): 'live' | 'upcoming' | 'finished' => {
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
      
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 lg:py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-4 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Alerte API Mock */}
            <MockAPIAlert onRetry={() => {
              liveMatches.refetch();
              selectedMatches.refetch();
            }} />

            {/* Filtres de Date et Championnat - Interface Simple */}
            <div className="flex flex-col gap-3 items-stretch bg-white rounded-lg p-3 sm:p-4 border shadow-sm">
              {/* Navigation de Date */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {currentLanguage === 'ar' ? 'التاريخ' : 'Date'}
                </label>
                <div className="flex items-center gap-2 justify-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const prevDate = new Date(selectedDate);
                      prevDate.setDate(prevDate.getDate() - 1);
                      setSelectedDate(prevDate.toISOString().split('T')[0]);
                      setCurrentPage(1);
                    }}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    ←
                  </Button>
                  
                  <DatePicker
                    selectedDate={selectedDate}
                    onDateChange={(date) => {
                      setSelectedDate(date);
                      setCurrentPage(1);
                    }}
                    className="flex-1 min-w-0"
                  />
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const nextDate = new Date(selectedDate);
                      nextDate.setDate(nextDate.getDate() + 1);
                      setSelectedDate(nextDate.toISOString().split('T')[0]);
                      setCurrentPage(1);
                    }}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    →
                  </Button>
                </div>
              </div>

              {/* Sélecteur de Championnat */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {currentLanguage === 'ar' ? 'البطولات' : 'Championnats'}
                </label>
                <LeagueSelector
                  selectedLeagues={selectedLeagues}
                  onLeaguesChange={(leagues) => {
                    setSelectedLeagues(leagues);
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>

              {/* Bouton Reset */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                  setSelectedLeagues([]);
                  setCurrentPage(1);
                  setCurrentLivePage(1);
                }}
                className="text-xs h-8 w-full sm:w-auto sm:self-start"
              >
                {currentLanguage === 'ar' ? 'إعادة تعيين' : 'Reset'}
              </Button>
            </div>

            {/* Live Matches Section - Interface Simple */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-between bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <h2 className="text-base sm:text-lg font-bold text-sport-dark flex-1">
                    {currentLanguage === 'ar' ? 'المباريات المباشرة' : 'Matchs en direct'}
                  </h2>
                  <Badge variant="destructive" className="bg-red-500 text-xs px-2 py-1">LIVE</Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={liveMatches.refetch}
                  disabled={liveMatches.loading}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${liveMatches.loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              {combinedLiveMatches.loading && (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-sport-green mx-auto"></div>
                  <p className="mt-2 text-muted-foreground text-xs sm:text-sm">
                    {currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}
                  </p>
                </div>
              )}
              
              {combinedLiveMatches.error && (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-red-500 text-xs sm:text-sm">
                    {currentLanguage === 'ar' ? 'خطأ في تحميل المباريات المباشرة' : 'Erreur lors du chargement des matchs en direct'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      liveMatches.refetch();
                      selectedMatches.refetch();
                    }}
                    className="mt-2 text-xs px-2 py-1"
                  >
                    {currentLanguage === 'ar' ? 'إعادة المحاولة' : 'Réessayer'}
                  </Button>
                </div>
              )}
              
              {combinedLiveMatches.data?.response?.length > 0 ? (
                <div className="space-y-3">
                  {/* Matchs en direct avec pagination simple */}
                  {(() => {
                    const allMatches = combinedLiveMatches.data.response;
                    const startIndex = (currentLivePage - 1) * liveItemsPerPage;
                    const endIndex = startIndex + liveItemsPerPage;
                    const paginatedMatches = allMatches.slice(startIndex, endIndex);
                    const totalPages = Math.ceil(allMatches.length / liveItemsPerPage);

                    return (
                      <div className="space-y-3">
                        {/* Liste des matchs */}
                        <div className="space-y-2">
                          {paginatedMatches.map((match: unknown, index: number) => (
                            <MatchRow 
                              key={(match as {fixture?: {id?: number}}).fixture?.id || `live-${index}`} 
                              match={convertAPIMatchToMatchCard(match)} 
                            />
                          ))}
                        </div>

                        {/* Pagination simple */}
                        {totalPages > 1 && (
                          <div className="flex justify-center items-center gap-3 pt-4 px-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrentLivePage(Math.max(1, currentLivePage - 1))}
                              disabled={currentLivePage <= 1}
                              className="h-8 px-3 text-sm"
                            >
                              ← {currentLanguage === 'ar' ? 'السابق' : 'Précédent'}
                            </Button>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                              <span className="font-medium text-sport-dark">{currentLivePage}</span>
                              <span>/</span>
                              <span>{totalPages}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrentLivePage(Math.min(totalPages, currentLivePage + 1))}
                              disabled={currentLivePage >= totalPages}
                              className="h-8 px-3 text-sm"
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
                <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-400 rounded-full"></div>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {currentLanguage === 'ar' ? 'لا توجد مباريات مباشرة حالياً' : 'Aucun match en direct actuellement'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentLanguage === 'ar' ? 'سيتم تحديث هذا القسم تلقائياً كل 30 ثانية' : 'Cette section se met à jour automatiquement toutes les 30 secondes'}
                  </p>
                </div>
              )}
            </div>

            {/* Selected Matches - Interface Simple */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-between bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 flex-1">
                  <Clock className="w-4 h-4 text-sport-green flex-shrink-0" />
                  <h2 className="text-base sm:text-lg font-bold text-sport-dark flex-1">
                    {currentLanguage === 'ar' ? 'المباريات المختارة' : 'Matchs sélectionnés'}
                  </h2>
                  {selectedLeagues.length > 0 && (
                    <Badge variant="outline" className="text-xs bg-white border-green-300">
                      {selectedLeagues.length} {currentLanguage === 'ar' ? 'بطولة' : 'ligues'}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={selectedMatches.refetch}
                  disabled={selectedMatches.loading}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${selectedMatches.loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              {selectedMatches.loading && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sport-green mx-auto"></div>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}
                  </p>
                </div>
              )}
              
              {selectedMatches.error && (
                <div className="text-center py-6">
                  <p className="text-red-500 text-sm">
                    {currentLanguage === 'ar' ? 'خطأ في تحميل المباريات' : 'Erreur lors du chargement des matchs'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={selectedMatches.refetch}
                    className="mt-2"
                  >
                    {currentLanguage === 'ar' ? 'إعادة المحاولة' : 'Réessayer'}
                  </Button>
                </div>
              )}
              
              {selectedMatchesWithFilteredData.data?.response?.length > 0 ? (
                <div className="space-y-3">
                  {/* Matchs sélectionnés avec pagination simple */}
                  {(() => {
                    const allMatches = selectedMatchesWithFilteredData.data.response;
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedMatches = allMatches.slice(startIndex, endIndex);
                    const totalPages = Math.ceil(allMatches.length / itemsPerPage);

                    return (
                      <div className="space-y-3">
                        {/* Liste des matchs */}
                        <div className="space-y-2">
                          {paginatedMatches.map((match: unknown, index: number) => (
                            <MatchRow 
                              key={(match as {fixture?: {id?: number}}).fixture?.id || `match-${index}`} 
                              match={convertAPIMatchToMatchCard(match)} 
                            />
                          ))}
                        </div>

                        {/* Pagination simple */}
                        {totalPages > 1 && (
                          <div className="flex justify-center items-center gap-3 pt-4 px-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage <= 1}
                              className="h-8 px-3 text-sm"
                            >
                              ← {currentLanguage === 'ar' ? 'السابق' : 'Précédent'}
                            </Button>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                              <span className="font-medium text-sport-dark">{currentPage}</span>
                              <span>/</span>
                              <span>{totalPages}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage >= totalPages}
                              className="h-8 px-3 text-sm"
                            >
                              {currentLanguage === 'ar' ? 'التالي' : 'Suivant'} →
                            </Button>
                          </div>
                        )}
                        
                        {/* Info de pagination */}
                        <div className="text-center text-xs text-muted-foreground bg-gray-50 py-2 px-4 rounded-lg">
                          {currentLanguage === 'ar' ? 'عرض' : 'Affichage'} {startIndex + 1}-{Math.min(endIndex, allMatches.length)} {currentLanguage === 'ar' ? 'من' : 'sur'} {allMatches.length} {currentLanguage === 'ar' ? 'مباراة' : 'matchs'}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : !selectedMatches.loading && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">
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
    </div>
  );
};

export default Matches;
