// Configuration API Football pour le site Koora
// Documentation: https://www.api-football.com/documentation-v3

export const API_CONFIG = {
  BASE_URL: 'https://v3.football.api-sports.io',
  HEADERS: {
    'X-RapidAPI-Key': import.meta.env.VITE_FOOTBALL_API_KEY || 'a3ef2267edc37dfe807c7c980dbac0c6',
    'X-RapidAPI-Host': 'v3.football.api-sports.io',
    'Content-Type': 'application/json'
  },
  // Forcer l'utilisation de l'API réelle au lieu des données mock
  DEV_MODE: false
};

// Configuration LibreTranslate pour la traduction arabe/français
export const TRANSLATE_CONFIG = {
  BASE_URL: import.meta.env.VITE_LIBRETRANSLATE_API_URL || 'https://libretranslate.com/translate',
  API_KEY: import.meta.env.VITE_LIBRETRANSLATE_API_KEY,
  HEADERS: {
    'Content-Type': 'application/json'
  },
  LANGUAGES: {
    ARABIC: 'ar',
    FRENCH: 'fr',
    ENGLISH: 'en'
  }
};

// Endpoints principaux pour chaque page du site
export const API_ENDPOINTS = {
  // Page d'accueil - الرئيسية
  NEWS: '/news',
  
  // Page matchs - المباريات  
  FIXTURES_LIVE: '/fixtures?live=all',
  FIXTURES_TODAY: '/fixtures?date={date}',
  FIXTURES_LEAGUE: '/fixtures?league={leagueId}&season={season}',
  
  // Page actualités - الأخبار
  NEWS_BY_TEAM: '/news?team={teamId}',
  NEWS_BY_LEAGUE: '/news?league={leagueId}',
  
  // Page classements - الترتيب
  STANDINGS: '/standings?league={leagueId}&season={season}',
  LEAGUES: '/leagues',
  
  // Page vidéos - الفيديوهات (si disponible via API)
  HIGHLIGHTS: '/fixtures/highlights?fixture={fixtureId}',
  
  // Page transferts - الانتقالات
  TRANSFERS: '/transfers?team={teamId}',
  TRANSFERS_TODAY: '/transfers?date={date}',
  PLAYER_TRANSFERS: '/transfers?player={playerId}'
};

// Ligues principales à afficher en priorité (plan gratuit de l'API Football)
export const MAIN_LEAGUES = {
  // Ligues européennes principales (généralement disponibles dans le plan gratuit)
  PREMIER_LEAGUE: 39,     // Premier League
  LA_LIGA: 140,           // La Liga
  BUNDESLIGA: 78,         // Bundesliga
  SERIE_A: 135,           // Serie A
  LIGUE_1: 61,            // Ligue 1
  
  // Compétitions internationales
  CHAMPIONS_LEAGUE: 2,    // UEFA Champions League
  EUROPA_LEAGUE: 3,       // UEFA Europa League
  WORLD_CUP: 1,          // FIFA World Cup
  
  // Ligues secondaires souvent disponibles
  EREDIVISIE: 88,         // Eredivisie (Pays-Bas)
  PRIMERA_DIVISION: 87,   // Primeira Liga (Portugal)
  
  // Note: La Botola du Maroc pourrait ne pas être disponible dans le plan gratuit
  // BOTOLA_MAROC: 200,   // Commenté temporairement
};

// Ligues à afficher (filtrage spécifique) - Utiliser seulement les ligues gratuites
export const SELECTED_LEAGUES = [
  MAIN_LEAGUES.PREMIER_LEAGUE, // Premier League
  MAIN_LEAGUES.LIGUE_1,       // Ligue 1 France
  MAIN_LEAGUES.BUNDESLIGA,    // Bundesliga
  MAIN_LEAGUES.LA_LIGA,       // La Liga
  MAIN_LEAGUES.SERIE_A,       // Serie A
];

// Configuration des appels API avec gestion d'erreurs et fallback mock
export class FootballAPI {
  private static instance: FootballAPI;
  private useMockAPI = false;
  
  private constructor() {}
  
  public static getInstance(): FootballAPI {
    if (!FootballAPI.instance) {
      FootballAPI.instance = new FootballAPI();
    }
    return FootballAPI.instance;
  }
  
  // Méthode générique pour les appels API - utilise toujours l'API réelle
  private async makeRequest(endpoint: string): Promise<unknown> {
    // Vérifier le cache d'abord
    const cachedData = this.getCachedData(endpoint);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      this.requestCount++;
      console.log(`🔄 Calling API Football: ${API_CONFIG.BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        headers: API_CONFIG.HEADERS
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ API Response received:`, data);
      
      // Mettre en cache les données
      this.setCachedData(endpoint, data);
      
      return data;
    } catch (error) {
      console.error('❌ API Request failed:', error);
      
      // Rethrow l'erreur au lieu de basculer vers les données mock
      throw error;
    }
  }

  // Méthode pour récupérer les données mock selon l'endpoint
  private async getMockData(endpoint: string): Promise<unknown> {
    // Import dynamique pour éviter les problèmes de dépendances circulaires
    const { mockFootballAPI } = await import('../services/mockFootballAPI');
    
    if (endpoint.includes('live=all')) {
      return mockFootballAPI.getLiveFixtures();
    } else if (endpoint.includes('fixtures?date=')) {
      return mockFootballAPI.getTodayFixtures();
    } else if (endpoint.includes('standings')) {
      return mockFootballAPI.getLeagueStandings(0);
    } else if (endpoint.includes('transfers')) {
      return mockFootballAPI.getRecentTransfers();
    } else if (endpoint.includes('leagues')) {
      return mockFootballAPI.getAvailableLeagues();
    }
    
    // Fallback générique
    return { response: [] };
  }
  
  // Page d'accueil - Récupérer les dernières actualités
  async getLatestNews(limit: number = 10) {
    return this.makeRequest(`${API_ENDPOINTS.NEWS}?limit=${limit}`);
  }
  
  // Page matchs - Matchs en direct (filtré par ligues sélectionnées)
  async getLiveFixtures() {
    const allFixtures = await this.makeRequest(API_ENDPOINTS.FIXTURES_LIVE) as { response: Fixture[] };
    return this.filterBySelectedLeagues(allFixtures);
  }
  
  // Page matchs - Matchs du jour (filtré par ligues sélectionnées)
  async getTodayFixtures() {
    const today = new Date().toISOString().split('T')[0];
    const allFixtures = await this.makeRequest(API_ENDPOINTS.FIXTURES_TODAY.replace('{date}', today)) as { response: Fixture[] };
    return this.filterBySelectedLeagues(allFixtures);
  }

  // Page matchs - Matchs par date et championnat spécifique
  async getFixturesByDate(date: string, leagueIds: number[] = []) {
    const endpoint = API_ENDPOINTS.FIXTURES_TODAY.replace('{date}', date);
    const allFixtures = await this.makeRequest(endpoint) as { response: Fixture[] };
    
    console.log(`📊 API Response for date ${date}:`, allFixtures);
    
    // Si aucune ligue spécifiée, retourner tous les matchs sans filtrage
    if (leagueIds.length === 0) {
      return allFixtures;
    }
    
    // Filtrer par ligues spécifiques
    const filteredMatches = allFixtures.response?.filter((match: Fixture) => 
      leagueIds.includes(match.league?.id)
    ) || [];
    
    console.log(`🎯 Filtered matches for leagues ${leagueIds}:`, filteredMatches);
    
    return {
      ...allFixtures,
      response: filteredMatches
    };
  }

  // Méthode pour filtrer les matchs par ligues sélectionnées
  private filterBySelectedLeagues(apiResponse: { response: Fixture[] }): { response: Fixture[] } {
    if (!apiResponse || !apiResponse.response) {
      return apiResponse;
    }

    const filteredMatches = apiResponse.response.filter((match: Fixture) => 
      SELECTED_LEAGUES.includes(match.league?.id)
    );

    return {
      ...apiResponse,
      response: filteredMatches
    };
  }
  
  // Page classements - Classement d'une ligue
  async getLeagueStandings(leagueId: number, season: number = new Date().getFullYear()) {
    const endpoint = API_ENDPOINTS.STANDINGS
      .replace('{leagueId}', leagueId.toString())
      .replace('{season}', season.toString());
    return this.makeRequest(endpoint);
  }
  
  // Page transferts - Transferts récents
  async getRecentTransfers(teamId?: number) {
    if (teamId) {
      return this.makeRequest(API_ENDPOINTS.TRANSFERS.replace('{teamId}', teamId.toString()));
    }
    const today = new Date().toISOString().split('T')[0];
    return this.makeRequest(API_ENDPOINTS.TRANSFERS_TODAY.replace('{date}', today));
  }
  
  // Obtenir les ligues disponibles
  async getAvailableLeagues() {
    return this.makeRequest(API_ENDPOINTS.LEAGUES);
  }
  
  // Méthodes pour la gestion du cache et des statistiques
  private requestCount = 0;
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Vérifier si les données sont en cache et valides
  private getCachedData(endpoint: string): unknown | null {
    const cached = this.cache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }
  
  // Mettre en cache les données
  private setCachedData(endpoint: string, data: unknown): void {
    this.cache.set(endpoint, { data, timestamp: Date.now() });
  }
  
  // Obtenir les statistiques d'utilisation
  getUsageStats() {
    return {
      requestCount: this.requestCount,
      cacheSize: this.cache.size,
      lastRequest: new Date(),
      usingMockAPI: this.useMockAPI
    };
  }
  
  // Vérifier si on utilise l'API mock
  isUsingMockAPI(): boolean {
    return this.useMockAPI;
  }
  
  // Forcer l'utilisation de l'API réelle (pour les tests)
  forceRealAPI(): void {
    this.useMockAPI = false;
  }
  
  // Forcer l'utilisation de l'API mock
  forceMockAPI(): void {
    this.useMockAPI = true;
  }
  
  // Vider le cache
  clearCache(): void {
    this.cache.clear();
  }
  
  // Rafraîchir des données spécifiques
  refreshData(endpoint: string): void {
    this.cache.delete(endpoint);
  }
}

// Configuration de LibreTranslate pour la traduction
export class LibreTranslateAPI {
  private static instance: LibreTranslateAPI;
  
  private constructor() {}
  
  public static getInstance(): LibreTranslateAPI {
    if (!LibreTranslateAPI.instance) {
      LibreTranslateAPI.instance = new LibreTranslateAPI();
    }
    return LibreTranslateAPI.instance;
  }
  
  // Traduire un texte
  async translateText(text: string, from: string, to: string): Promise<string> {
    try {
      const requestBody: TranslationRequest & { api_key?: string } = {
        q: text,
        source: from,
        target: to,
        format: 'text'
      };

      // Ajouter la clé API si disponible
      if (TRANSLATE_CONFIG.API_KEY) {
        requestBody.api_key = TRANSLATE_CONFIG.API_KEY;
      }

      const response = await fetch(TRANSLATE_CONFIG.BASE_URL, {
        method: 'POST',
        headers: TRANSLATE_CONFIG.HEADERS,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`Translation Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Retourner le texte original en cas d'erreur
    }
  }
  
  // Traduire vers l'arabe
  async translateToArabic(text: string, fromLang: string = TRANSLATE_CONFIG.LANGUAGES.ENGLISH): Promise<string> {
    return this.translateText(text, fromLang, TRANSLATE_CONFIG.LANGUAGES.ARABIC);
  }
  
  // Traduire vers le français
  async translateToFrench(text: string, fromLang: string = TRANSLATE_CONFIG.LANGUAGES.ENGLISH): Promise<string> {
    return this.translateText(text, fromLang, TRANSLATE_CONFIG.LANGUAGES.FRENCH);
  }
  
  // Traduire depuis l'arabe vers le français
  async translateArabicToFrench(text: string): Promise<string> {
    return this.translateText(text, TRANSLATE_CONFIG.LANGUAGES.ARABIC, TRANSLATE_CONFIG.LANGUAGES.FRENCH);
  }
  
  // Traduire depuis le français vers l'arabe
  async translateFrenchToArabic(text: string): Promise<string> {
    return this.translateText(text, TRANSLATE_CONFIG.LANGUAGES.FRENCH, TRANSLATE_CONFIG.LANGUAGES.ARABIC);
  }
  
  // Détecter la langue automatiquement et traduire
  async autoTranslate(text: string, targetLang: string): Promise<string> {
    return this.translateText(text, 'auto', targetLang);
  }
}

// Instance singleton pour utilisation dans les composants
export const footballAPI = FootballAPI.getInstance();
export const translateAPI = LibreTranslateAPI.getInstance();

// Types TypeScript pour les réponses API
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  category: string;
  source: string;
}

export interface Fixture {
  id: number;
  date: string;
  status: string;
  league: {
    id: number;
    name: string;
    logo: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
}

export interface Standing {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

export interface Transfer {
  player: {
    id: number;
    name: string;
    photo: string;
  };
  teams: {
    in: {
      id: number;
      name: string;
      logo: string;
    };
    out: {
      id: number;
      name: string;
      logo: string;
    };
  };
  type: string;
  date: string;
}

// Types pour LibreTranslate
export interface TranslationRequest {
  q: string; // Texte à traduire
  source: string; // Langue source
  target: string; // Langue cible
  format: 'text' | 'html';
}

export interface TranslationResponse {
  translatedText: string;
}

export interface LanguageDetection {
  confidence: number;
  language: string;
}

// Interface pour les contenus multilingues
export interface MultilingualContent {
  french: string;
  arabic: string;
  original?: string;
}