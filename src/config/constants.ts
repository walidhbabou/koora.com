// Configuration et constantes de l'application

export const APP_CONFIG = {
  name: 'Koora',
  description: 'Plateforme sportive pour suivre les actualités et résultats',
  version: '1.0.0'
};

// Configuration des langues
export const LANGUAGES = {
  ar: {
    code: 'ar',
    name: 'العربية',
    direction: 'rtl'
  },
  fr: {
    code: 'fr', 
    name: 'Français',
    direction: 'ltr'
  },
  en: {
    code: 'en',
    name: 'English', 
    direction: 'ltr'
  }
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

// Traductions complètes
export const TRANSLATIONS = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    matches: 'المباريات',
    news: 'الأخبار',
    standings: 'الترتيب',
    videos: 'الفيديوهات',
    transfers: 'الانتقالات',
    
    // Tournaments and Championships page
    tournaments: 'البطولات',
    standingsDescription: 'جداول ترتيب البطولات الأوروبية والعربية - الموسم {version}',
    searchTournament: 'ابحث عن بطولة...',
    active: 'نشط',
    teams: 'الفرق',
    season: 'الموسم',
    matchday: 'الجولة',
    viewStandings: 'عرض الترتيب',
    viewResults: 'عرض النتائج',
    featuredTournaments: 'البطولات المميزة',
    countries: 'الدول',
    
    // Statuts des matchs
    live: 'مباشر',
    upcoming: 'قادم',
    finished: 'انتهى',
    halftime: 'الشوط الأول',
    fulltime: 'الوقت الكامل',
    postponed: 'مؤجل',
    cancelled: 'ملغي',
    
    // Temps
    today: 'اليوم',
    yesterday: 'أمس',
    tomorrow: 'غداً',
    thisWeek: 'هذا الأسبوع',
    minute: 'دقيقة',
    minutes: 'دقائق',
    hour: 'ساعة',
    hours: 'ساعات',
    day: 'يوم',
    days: 'أيام',
    
    // Classements
    position: 'المركز',
    team: 'الفريق',
    played: 'لعب',
    won: 'فوز',
    drawn: 'تعادل',
    lost: 'خسارة',
    points: 'النقاط',
    goalDifference: 'فرق الأهداف',
    goalsFor: 'الأهداف المسجلة',
    goalsAgainst: 'الأهداف المستقبلة',
    form: 'الشكل',
    
    // Actualités
    latestNews: 'آخر الأخبار',
    breakingNews: 'عاجل',
    readMore: 'اقرأ المزيد',
    category: 'التصنيف',
    publishedAt: 'نُشر في',
    by: 'بواسطة',
    
    // Vidéos
    highlights: 'أهم اللقطات',
    interviews: 'المقابلات',
    analysis: 'التحليل',
    watchNow: 'شاهد الآن',
    duration: 'المدة',
    
    // Transferts
    recentTransfers: 'الانتقالات الأخيرة',
    rumors: 'الشائعات',
    confirmed: 'مؤكد',
    loan: 'إعارة',
    free: 'مجاني',
    fee: 'الرسوم',
    from: 'من',
    to: 'إلى',
    
    // Interface générale
    loading: 'جارٍ التحميل...',
    error: 'حدث خطأ',
    retry: 'حاول مرة أخرى',
    noData: 'لا توجد بيانات',
    noResults: 'لا توجد نتائج',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    showMore: 'عرض المزيد',
    showLess: 'عرض أقل',
    
    // Ligues
    premierLeague: 'الدوري الإنجليزي الممتاز',
    laLiga: 'الليغا الإسبانية',
    bundesliga: 'البوندسليغا الألمانية',
    serieA: 'الدوري الإيطالي',
    ligue1: 'الدوري الفرنسي',
    championsLeague: 'دوري أبطال أوروبا',
    europaLeague: 'الدوري الأوروبي',
    worldCup: 'كأس العالم',
    
    // Messages temporels
    daysAgo: 'منذ {days} أيام',
    hoursAgo: 'منذ {hours} ساعات',
    minutesAgo: 'منذ {minutes} دقائق',
    justNow: 'الآن',
    
    // Interface de connexion
    login: 'تسجيل الدخول',
    loginShort: 'دخول'
  },
  fr: {
    // Navigation
    home: 'Accueil',
    matches: 'Matchs',
    news: 'Actualités',
    standings: 'Classements',
    videos: 'Vidéos',
    transfers: 'Transferts',
    
    // Tournaments and Championships page
    tournaments: 'Tournois',
    standingsDescription: 'Classements des championnats européens et arabes - Saison {version}',
    searchTournament: 'Rechercher un tournoi...',
    active: 'Actif',
    teams: 'Équipes',
    season: 'Saison',
    matchday: 'Journée',
    viewStandings: 'Voir le classement',
    viewResults: 'Voir les résultats',
    featuredTournaments: 'Tournois en vedette',
    countries: 'Pays',
    
    // Statuts des matchs
    live: 'En direct',
    upcoming: 'À venir',
    finished: 'Terminé',
    halftime: 'Mi-temps',
    fulltime: 'Temps plein',
    postponed: 'Reporté',
    cancelled: 'Annulé',
    
    // Temps
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    tomorrow: 'Demain',
    thisWeek: 'Cette semaine',
    minute: 'minute',
    minutes: 'minutes',
    hour: 'heure',
    hours: 'heures',
    day: 'jour',
    days: 'jours',
    
    // Classements
    position: 'Position',
    team: 'Équipe',
    played: 'Joués',
    won: 'Gagnés',
    drawn: 'Nuls',
    lost: 'Perdus',
    points: 'Points',
    goalDifference: 'Diff. buts',
    goalsFor: 'Buts pour',
    goalsAgainst: 'Buts contre',
    form: 'Forme',
    
    // Actualités
    latestNews: 'Dernières actualités',
    breakingNews: 'Breaking News',
    readMore: 'Lire la suite',
    category: 'Catégorie',
    publishedAt: 'Publié le',
    by: 'Par',
    
    // Vidéos
    highlights: 'Résumés',
    interviews: 'Interviews',
    analysis: 'Analyse',
    watchNow: 'Regarder maintenant',
    duration: 'Durée',
    
    // Transferts
    recentTransfers: 'Transferts récents',
    rumors: 'Rumeurs',
    confirmed: 'Confirmé',
    loan: 'Prêt',
    free: 'Libre',
    fee: 'Montant',
    from: 'De',
    to: 'Vers',
    
    // Interface générale
    loading: 'Chargement...',
    error: 'Une erreur s\'est produite',
    retry: 'Réessayer',
    noData: 'Aucune donnée',
    noResults: 'Aucun résultat',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    showMore: 'Voir plus',
    showLess: 'Voir moins',
    
    // Ligues
    premierLeague: 'Premier League',
    laLiga: 'La Liga',
    bundesliga: 'Bundesliga',
    serieA: 'Serie A',
    ligue1: 'Ligue 1',
    championsLeague: 'Ligue des Champions',
    europaLeague: 'Ligue Europa',
    worldCup: 'Coupe du Monde',
    
    // Messages temporels
    daysAgo: 'il y a {days} jours',
    hoursAgo: 'il y a {hours} heures',
    minutesAgo: 'il y a {minutes} minutes',
    justNow: 'À l\'instant',
    
    // Interface de connexion
    login: 'Connexion',
    loginShort: 'Connexion'
  },
  en: {
    // Navigation
    home: 'Home',
    matches: 'Matches',
    news: 'News',
    standings: 'Standings',
    videos: 'Videos',
    transfers: 'Transfers',
    
    // Tournaments and Championships page
    tournaments: 'Tournaments',
    standingsDescription: 'European and Arab championship standings - Season {version}',
    searchTournament: 'Search for a tournament...',
    active: 'Active',
    teams: 'Teams',
    season: 'Season',
    matchday: 'Matchday',
    viewStandings: 'View Standings',
    viewResults: 'View Results',
    featuredTournaments: 'Featured Tournaments',
    countries: 'Countries',
    
    // Match statuses
    live: 'Live',
    upcoming: 'Upcoming',
    finished: 'Finished',
    halftime: 'Half Time',
    fulltime: 'Full Time',
    postponed: 'Postponed',
    cancelled: 'Cancelled',
    
    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    minute: 'minute',
    minutes: 'minutes',
    hour: 'hour',
    hours: 'hours',
    day: 'day',
    days: 'days',
    
    // Standings
    position: 'Position',
    team: 'Team',
    played: 'Played',
    won: 'Won',
    drawn: 'Drawn',
    lost: 'Lost',
    points: 'Points',
    goalDifference: 'Goal Diff.',
    goalsFor: 'Goals For',
    goalsAgainst: 'Goals Against',
    form: 'Form',
    
    // News
    latestNews: 'Latest News',
    breakingNews: 'Breaking News',
    readMore: 'Read More',
    category: 'Category',
    publishedAt: 'Published on',
    by: 'By',
    
    // Videos
    highlights: 'Highlights',
    interviews: 'Interviews',
    analysis: 'Analysis',
    watchNow: 'Watch Now',
    duration: 'Duration',
    
    // Transfers
    recentTransfers: 'Recent Transfers',
    rumors: 'Rumors',
    confirmed: 'Confirmed',
    loan: 'Loan',
    free: 'Free',
    fee: 'Fee',
    from: 'From',
    to: 'To',
    
    // General interface
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    noData: 'No data',
    noResults: 'No results',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    showMore: 'Show More',
    showLess: 'Show Less',
    
    // Leagues
    premierLeague: 'Premier League',
    laLiga: 'La Liga',
    bundesliga: 'Bundesliga',
    serieA: 'Serie A',
    ligue1: 'Ligue 1',
    championsLeague: 'Champions League',
    europaLeague: 'Europa League',
    worldCup: 'World Cup',
    
    // Time messages
    daysAgo: '{days} days ago',
    hoursAgo: '{hours} hours ago',
    minutesAgo: '{minutes} minutes ago',
    justNow: 'Just now',
    
    // Login interface
    login: 'Login',
    loginShort: 'Login'
  }
};

// Navigation items avec traductions
export const NAV_ITEMS = [
  { key: 'home', href: '/' },
  { key: 'matches', href: '/matches' },
  { key: 'news', href: '/news' },
  { key: 'standings', href: '/standings' },
  { key: 'videos', href: '/videos' },
  { key: 'transfers', href: '/transfers' }
];

// Types de données pour l'application
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  publishedAt: string;
  category: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  time: string;
  status: 'live' | 'upcoming' | 'finished';
  competition: string;
}

// API URLs (à configurer plus tard)
export const API_ENDPOINTS = {
  news: import.meta.env.VITE_NEWS_API || '/api/news',
  matches: import.meta.env.VITE_MATCHES_API || '/api/matches',
  standings: import.meta.env.VITE_STANDINGS_API || '/api/standings',
};

// Thème et couleurs
export const THEME_COLORS = {
  primary: 'var(--sport-green)',
  secondary: 'var(--sport-blue)',
  accent: 'var(--sport-light)',
};
