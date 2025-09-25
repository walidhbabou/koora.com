import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TeamsLogos from "@/components/TeamsLogos";
import LeagueStandingTable from "@/components/LeagueStandingTable";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Search, Star, Medal, Award, Crown, RefreshCw, Filter, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useAllLeagueStandings, useMockStandings } from "@/hooks/useStandings";
import { useTranslation } from "@/hooks/useTranslation";
import { maybeTransliterateName } from "@/utils/transliterate";
import { useTopScorers, useTopAssists, useFixtures } from "@/hooks/useFootballAPI";
import { useState } from "react";
import { MAIN_LEAGUES } from "@/config/api";
import { getTeamTranslation } from "@/utils/teamNameMap";
import { useSingleTeamTranslation } from "@/hooks/useTeamTranslation";

const Standings = () => {
  const { currentLanguage, t, isRTL, direction } = useTranslation();

  // Fonction pour obtenir le nom de l'équipe dans la langue appropriée
  const getTeamName = (team: any) => {
    if (!team) return '';
    // Si c'est une chaîne, on la traite directement
    if (typeof team === 'string') {
      return currentLanguage === 'ar' ? getTeamTranslation(team) : team;
    }
    // Si c'est un objet avec une propriété name
    return currentLanguage === 'ar' ? getTeamTranslation(team.name) : team.name;
  };

  // Composant pour afficher un nom d'équipe avec traduction automatique
  const TeamNameWithTranslation = ({ team }: { team: any }) => {
    const teamName = typeof team === 'string' ? team : team?.name || '';
    const { translatedName, isInitialized } = useSingleTeamTranslation(teamName);
    
    // Toujours afficher en arabe si la langue est arabe
    if (currentLanguage === 'ar') {
      return <span>{isInitialized ? translatedName : teamName}</span>;
    }
    
    return <span>{teamName}</span>;
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [showLeagueDetail, setShowLeagueDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'teams' | 'players' | 'fixtures'>('teams');
  const [playersTab, setPlayersTab] = useState<'topscorers' | 'topassists'>('topscorers');
  
  // Récupérer les classements de toutes les ligues
  const { leagues, isLoading, hasError, refetchAll } = useAllLeagueStandings();
  
  // Determine current football season start year (e.g., 2025 for 2025/26 if month >= July)
  const seasonYear = (() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth(); // 0=Jan, 6=Jul
    return m >= 6 ? y : y - 1;
  })();

  // Hooks pour les statistiques des joueurs (conditionnels)
  const { data: topScorersData, loading: loadingScorers } = useTopScorers({
    leagueId: selectedLeague || 0,
    season: seasonYear,
    translateContent: true
  });
  
  const { data: topAssistsData, loading: loadingAssists } = useTopAssists({
    leagueId: selectedLeague || 0,
    season: seasonYear,
    translateContent: true
  });

  const { data: fixturesData, loading: loadingFixtures } = useFixtures({
    leagueId: selectedLeague || 0,
    season: seasonYear,
    translateContent: true
  });
  
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
    },
    {
      id: MAIN_LEAGUES.BOTOLA_MAROC,
      name: currentLanguage === 'ar' ? 'البطولة المغربية - البطولة برو' : 'Botola Pro',
      logo: 'https://media.api-sports.io/football/leagues/200.png',
      country: currentLanguage === 'ar' ? 'المغرب' : 'Morocco',
      flag: '🇲🇦'
    },
    // Saudi Pro League
    {
      id: 307,
      name: currentLanguage === 'ar' ? 'الدوري السعودي للمحترفين' : 'Saudi Pro League',
      logo: 'https://media.api-sports.io/football/leagues/307.png',
      country: currentLanguage === 'ar' ? 'السعودية' : 'Saudi Arabia',
      flag: '🇸🇦'
    },
    // Qatar QSL Cup
    {
      id: 677,
      name: currentLanguage === 'ar' ? 'كأس قطر QSL' : 'QSL Cup',
      logo: 'https://media.api-sports.io/football/leagues/677.png',
      country: currentLanguage === 'ar' ? 'قطر' : 'Qatar',
      flag: '🇶🇦'
    },
    // Algeria Ligue 1
    {
      id: 186,
      name: currentLanguage === 'ar' ? 'الدوري الجزائري - الرابطة المحترفة الأولى' : 'Algeria Ligue 1',
      logo: 'https://media.api-sports.io/football/leagues/186.png',
      country: currentLanguage === 'ar' ? 'الجزائر' : 'Algeria',
      flag: '🇩🇿'
    },
     {
          name: currentLanguage === 'ar' ? "الدوري الأوروبي" : "Europa League",
          id: MAIN_LEAGUES.EUROPA_LEAGUE,
          logo: "https://media.api-sports.io/football/leagues/3.png"
        },
        {
          name: currentLanguage === 'ar' ? "دوري أبطال أفريقيا" : "CAF Champions League",
          id: 12,
          logo: "https://media.api-sports.io/football/leagues/12.png"
        },
        {
          name: currentLanguage === 'ar' ? "كأس الكونفدرالية الأفريقية" : "CAF Confederation Cup",
          id: 20,
          logo: "https://media.api-sports.io/football/leagues/20.png"
        },
        {
          name: currentLanguage === 'ar' ? "الدوري المصري الممتاز" : "Egyptian Premier League",
          id: 233,
          logo: "https://media.api-sports.io/football/leagues/233.png"
        },
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

  // Fonction pour formater les dates en arabe
  const formatDateArabic = (dateString: string) => {
    const date = new Date(dateString);
    if (currentLanguage === 'ar') {
      // Utiliser le format arabe avec les noms de mois arabes
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      
      return `${day} ${arabicMonths[month]} ${year}`;
    }
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction pour traduire les mots français
  const translateText = (text: string) => {
    if (currentLanguage === 'ar') {
      const translations: { [key: string]: string } = {
        'Round': 'الجولة',
        'Regular Season': ' الجولة',
        'À venir': 'قريباً',
        'LIVE': 'مباشر',
        'Terminé': 'انتهى',
        'Aucun match disponible': 'لا توجد مباريات متاحة',
        'Classement': 'الترتيب',
        'Résultats': 'النتائج',
        'Joueurs': 'اللاعبون',
        'Statistiques': 'الإحصائيات',
        'Prochains matchs': 'المباريات القادمة',
        'Matchs précédents': 'المباريات السابقة',
        'Points': 'النقاط',
        'J': 'م',
        'V': 'ف',
        'N': 'ت',
        'D': 'خ',
        'BP': 'له',
        'BC': 'عليه',
        'Diff': 'فرق'
      };
      
      // Gérer les cas spéciaux comme "Regular Season - 24"
      if (text.includes('Regular Season')) {
        return text.replace('Regular Season', 'الجولة ');
      }
      
      return translations[text] || text;
    }
    return text;
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
    <div className={`min-h-screen bg-[#f6f7fa] dark:bg-[#0f1419] ${isRTL ? 'rtl' : 'ltr'}`} dir={direction}>
      <SEO 
        title="ترتيب الفرق | كورة - جداول ترتيب الدوريات العربية والعالمية"
        description="تابع ترتيب الفرق في جميع الدوريات العربية والعالمية، جداول النقاط المحدثة لحظة بلحظة، وإحصائيات الفرق والدوريات."
        keywords={["ترتيب الفرق", "جداول الدوريات", "ترتيب الدوري", "نقاط الفرق", "جدول الدوري الإنجليزي", "جدول الدوري الإسباني", "ترتيب دوري المحترفين"]}
        type="website"
      />
      <Header />
      <TeamsLogos />
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 max-w-7xl">
        
        {/* Vue liste des ligues */}
        {!showLeagueDetail && (
          <>
            {/* En-tête de la page */}
            <div className={`flex flex-col gap-4 mb-6 sm:mb-8 ${isRTL ? 'text-right' : 'text-left'}`} dir="rtl">
              <div dir="rtl"> 
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-green-500 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent mb-2 tracking-tight">
                  {currentLanguage === 'ar' ? 'كوورة - ترتيب البطولات' : 'koora - Classement des tournois'}
                </h1>
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg font-medium">
                  {currentLanguage === 'ar' ? 'اختر البطولة لعرض الترتيب' : 'Sélectionnez un tournoi pour voir le classement'}
                </p>
              </div>
              
              {/* Barre de recherche */}
              <div className="relative w-full sm:w-auto" dir="rtl">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${isRTL ? 'pr-10' : 'pl-10'} bg-white dark:bg-[#181a20] border-gray-200 dark:border-[#23262f] focus:border-blue-500 w-full sm:w-64`}
                />
              </div>
            </div>

            {/* Liste des ligues (style simple comme la maquette) */}
            <div className="w-full max-w-2xl mx-auto" dir="rtl">
              

              <ul className="space-y-2 sm:space-y-3" dir="rtl">
                {filteredLeagues.map((league) => (
                  <li key={league.id}>
                    <div
                      onClick={() => handleLeagueClick(league.id)}
                      className={`flex items-center justify-between rounded-xl sm:rounded-2xl bg-white dark:bg-[#181a20] border border-gray-100 dark:border-[#23262f] px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm hover:shadow-md cursor-pointer transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Chevron */}
                      <div className={`shrink-0 text-gray-400`}>
                        {isRTL ? (
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </div>
                      {/* League name and country */}
                      <div className={`flex-1 px-2 sm:px-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold text-xs sm:text-sm md:text-base block truncate">
                          {league.name}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">{league.country} {league.flag}</span>
                      </div>
                      {/* Logo */}
                      <div className="shrink-0">
                        <img
                          src={league.logo}
                          alt={league.name}
                          className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 object-contain bg-white rounded-lg sm:rounded-xl p-0.5 sm:p-1"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

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

        {/* Vue détail du classement */
        }
        {showLeagueDetail && selectedLeague && (
          <>
            {/* Header Card + Tabs (match mockup style) */}
            <Card className="mb-4 sm:mb-6 border-0 shadow-lg overflow-hidden">
              <div className={`flex items-center justify-between p-3 sm:p-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* League info */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {/* Logo */}
                  <img
                    src={getSelectedLeagueData()?.leagueLogo || 'https://via.placeholder.com/48'}
                    alt={getSelectedLeagueData()?.leagueName || 'League'}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg sm:rounded-xl bg-white flex-shrink-0"
                  />
                  <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="text-lg sm:text-xl font-extrabold text-gray-800 dark:text-gray-100 truncate">
                      {currentLanguage === 'ar' ? (getSelectedLeagueData()?.leagueName || 'البطولة') : (getSelectedLeagueData()?.leagueName || 'League')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentLanguage === 'ar' ? 'الفرق' : 'Équipes'} · {seasonYear}/{seasonYear + 1}
                    </div>
                  </div>
                </div>

                {/* Back button */}
                <Button 
                  onClick={handleBackToList}
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs sm:text-sm px-2 sm:px-3"
                >
                  {currentLanguage === 'ar' ? 'رجوع' : 'Retour'}
                </Button>
              </div>

              {/* Tabs */}
              <div className={`flex gap-3 sm:gap-6 px-3 sm:px-4 pb-2 border-t border-gray-100 dark:border-[#23262f] ${isRTL ? 'justify-start' : 'justify-end'}`}>
                <button
                  onClick={() => setActiveTab('teams')}
                  className={`py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'teams' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {currentLanguage === 'ar' ? 'الفرق' : 'Équipes'}
                </button>
                <button
                  onClick={() => setActiveTab('players')}
                  className={`py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'players' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {currentLanguage === 'ar' ? 'اللاعبون' : 'Joueurs'}
                </button>
                <button
                  onClick={() => setActiveTab('fixtures')}
                  className={`py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'fixtures' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {currentLanguage === 'ar' ? 'المباريات' : 'Calendrier'}
                </button>
              </div>
            </Card>

            {/* Tab Content */}
            <div className="max-w-5xl mx-auto">
              {activeTab === 'teams' && (() => {
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
              {/* Players Tab */}
              {activeTab === 'players' && (
                <Card className="p-3 sm:p-6 bg-white dark:bg-[#181a20] border-0 shadow-lg">
                  {/* Sub toggle */}
                  <div className={`mb-3 sm:mb-4 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#23262f] rounded-xl">
                      <button
                        onClick={() => setPlayersTab('topscorers')}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                          playersTab === 'topscorers' ? 'bg-white dark:bg-[#181a20] text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        الهدافون
                      </button>
                      <button
                        onClick={() => setPlayersTab('topassists')}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                          playersTab === 'topassists' ? 'bg-white dark:bg-[#181a20] text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        التمريرات
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  {playersTab === 'topscorers' ? (
                    <>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">الهدافون</h2>
                      </div>
                      {loadingScorers ? (
                        <div className="space-y-2 sm:space-y-3">
                          {[...Array(10)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 animate-pulse">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                              </div>
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                          ))}
                        </div>
                      ) : topScorersData?.response?.length > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                          {topScorersData.response.map((item: any, index: number) => (
                            <div key={item.player?.id} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#23262f] transition-colors">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="text-sm sm:text-lg font-bold text-gray-500 w-4 sm:w-6 text-center flex-shrink-0">{index + 1}</div>
                                <img 
                                  src={item.player?.photo || '/placeholder.svg'} 
                                  alt={item.player?.name}
                                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                                    {maybeTransliterateName(item.player?.name, currentLanguage)}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 sm:gap-2">
                                    <img 
                                      src={item.statistics?.[0]?.team?.logo} 
                                      alt={getTeamName(item.statistics?.[0]?.team)}
                                      className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                                    />
                                    <span className="truncate">
                                      <TeamNameWithTranslation team={item.statistics?.[0]?.team} />
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right min-w-[35px] sm:min-w-[40px] flex-shrink-0">
                                <div className="text-lg sm:text-xl font-bold text-green-600">
                                  {item.statistics?.[0]?.goals?.total || 0}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {currentLanguage === 'ar' ? 'هدف' : 'Buts'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">لا توجد بيانات هدافين متاحة</div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">أفضل الممررين</h2>
                      </div>
                      {loadingAssists ? (
                        <div className="space-y-2 sm:space-y-3">
                          {[...Array(10)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 animate-pulse">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                              </div>
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                          ))}
                        </div>
                      ) : topAssistsData?.response?.length > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                          {topAssistsData.response.map((item: any, index: number) => (
                            <div key={item.player?.id} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#23262f] transition-colors">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="text-sm sm:text-lg font-bold text-gray-500 w-4 sm:w-6 text-center flex-shrink-0">{index + 1}</div>
                                <img 
                                  src={item.player?.photo || '/placeholder.svg'} 
                                  alt={item.player?.name}
                                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                                    {maybeTransliterateName(item.player?.name, currentLanguage)}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 sm:gap-2">
                                    <img 
                                      src={item.statistics?.[0]?.team?.logo} 
                                      alt={getTeamName(item.statistics?.[0]?.team)}
                                      className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                                    />
                                    <span className="truncate">
                                      <TeamNameWithTranslation team={item.statistics?.[0]?.team} />
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right min-w-[35px] sm:min-w-[40px] flex-shrink-0">
                                <div className="text-lg sm:text-xl font-bold text-blue-600">{item.statistics?.[0]?.goals?.assists || 0}</div>
                                <div className="text-xs text-gray-500">تمريرة</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">لا توجد بيانات تمريرات متاحة</div>
                      )}
                    </>
                  )}
                </Card>
              )}
              {activeTab === 'fixtures' && (
                <Card className="p-3 sm:p-6 bg-white dark:bg-[#181a20] border-0 shadow-lg">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                      {currentLanguage === 'ar' ? 'جدول المباريات' : 'Calendrier des matchs'}
                    </h2>
                  </div>
                  
                  {loadingFixtures ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 animate-pulse">
                          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : fixturesData?.response?.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {(() => {
                        // Grouper les matchs par round
                        const groupedFixtures = fixturesData.response.reduce((acc: any, fixture: any) => {
                          const round = fixture.league?.round || 'Round';
                          if (!acc[round]) {
                            acc[round] = [];
                          }
                          acc[round].push(fixture);
                          return acc;
                        }, {});

                        return Object.entries(groupedFixtures).map(([round, fixtures]: [string, any]) => (
                          <div key={round}>
                            {/* En-tête du round */}
                            <div className="sticky top-0 bg-white dark:bg-[#0f172a] py-2 px-2 border-b-2 border-gray-200 dark:border-[#23262f] mb-2">
                              <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white uppercase">
                                {translateText(round)}
                              </h3>
                            </div>
                            
                            {/* Matchs du round */}
                            {fixtures.map((fixture: any) => {
                        const homeTeam = fixture.teams.home;
                        const awayTeam = fixture.teams.away;
                        const date = new Date(fixture.fixture.date);

                        return (
                          <div key={fixture.fixture.id} className="flex items-center justify-between py-3 px-2 border-b border-gray-100 dark:border-[#23262f] last:border-b-0">
                            {/* Date et heure */}
                            <div className="flex flex-col items-start min-w-[80px] sm:min-w-[100px]">
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                {formatDateArabic(fixture.fixture.date)}
                              </span>
                              <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                                {date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                              </span>
                            </div>
                            
                            {/* Équipes */}
                            <div className="flex-1 flex items-center justify-between mx-3 sm:mx-4">
                              {/* Équipe domicile */}
                              <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                                <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                  <TeamNameWithTranslation team={homeTeam} />
                                </span>
                                <img 
                                  src={homeTeam.logo} 
                                  alt={getTeamName(homeTeam)} 
                                  className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                                />
                              </div>
                              
                              {/* Score ou VS */}
                              <div className="px-2 sm:px-3 text-center min-w-[40px] sm:min-w-[50px]">
                                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {fixture.fixture.status.short === 'NS' ? '-' : `${fixture.goals.home} - ${fixture.goals.away}`}
                                </span>
                              </div>
                              
                              {/* Équipe extérieure */}
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <img 
                                  src={awayTeam.logo} 
                                  alt={getTeamName(awayTeam)} 
                                  className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                                />
                                <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                  <TeamNameWithTranslation team={awayTeam} />
                                </span>
                              </div>
                            </div>
                            
                            {/* Statut du match */}
                            <div className="flex flex-col items-end min-w-[60px] sm:min-w-[80px]">
                              {fixture.fixture.status.short === 'NS' ? (
                                <span className="text-xs text-gray-500">{translateText('À venir')}</span>
                              ) : fixture.fixture.status.short === 'LIVE' ? (
                                <span className="text-xs font-medium text-red-600">{translateText('LIVE')}</span>
                              ) : (
                                <span className="text-xs text-gray-500">{translateText('Terminé')}</span>
                              )}
                            </div>
                          </div>
                        );
                            })}
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                      {currentLanguage === 'ar' ? 'لا توجد مباريات متاحة' : 'Aucun match disponible'}
                    </div>
                  )}
                </Card>
              )}
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Standings;
