// Configuration API Football pour le site Koora
import { apiCache } from '../services/apiCache';
import axios from 'axios';
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

// Configuration Google Translate API non officielle (gratuite)
export const GOOGLE_TRANSLATE_CONFIG = {
  BASE_URL: 'https://translate.googleapis.com/translate_a/single',
  DEFAULT_PARAMS: {
    client: 'gtx',
    dt: 't',
    ie: 'UTF-8',
    oe: 'UTF-8'
  },
  LANGUAGES: {
    ARABIC: 'ar',
    FRENCH: 'fr',
    ENGLISH: 'en',
    AUTO: 'auto'
  }
};

// Configuration LibreTranslate pour la traduction arabe/français (fallback)
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
  
  // Page classements - الترتيب
  STANDINGS: '/standings?league={leagueId}&season={season}',
  LEAGUES: '/leagues',
  
  // Page vidéos - الفيديوهات (si disponible via API)
  HIGHLIGHTS: '/fixtures/highlights?fixture={fixtureId}',
  
  // Page transferts - الانتقالات
  TRANSFERS: '/transfers?team={teamId}',
  TRANSFERS_TODAY: '/transfers?date={date}',
  PLAYER_TRANSFERS: '/transfers?player={playerId}',
  
  // Statistiques des joueurs
  PLAYER_STATS: '/players/{statType}?league={leagueId}&season={season}'
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
  private constructor() {}

  public static getInstance(): FootballAPI {
    if (!FootballAPI.instance) {
      FootballAPI.instance = new FootballAPI();
    }
    return FootballAPI.instance;
  }

  // Méthode générique pour les appels API - utilise toujours l'API réelle
  private async makeRequest(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        headers: API_CONFIG.HEADERS
      });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ API Request failed:', error);
      throw error;
    }
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
  async getRecentTransfers(teamId?: number, season?: number) {
    let url = '';
    if (teamId && season) {
      url = `/transfers?team=${teamId}&season=${season}`;
    } else if (teamId) {
      url = `/transfers?team=${teamId}`;
    } else if (season) {
      url = `/transfers?season=${season}`;
    } else {
      url = '/transfers';
    }
    const data = await this.makeRequest(url);
    // Retourne uniquement la liste des transferts
    return Array.isArray(data?.response) ? { response: data.response } : { response: [] };
  }

  // Nouveaux transferts par date
  async getTransfersByDate(date: string) {
    const endpoint = API_ENDPOINTS.TRANSFERS_TODAY.replace('{date}', date);
    return this.makeRequest(endpoint);
  }

  // Transferts d'un joueur spécifique
  async getPlayerTransfers(playerId: number) {
    const endpoint = API_ENDPOINTS.PLAYER_TRANSFERS.replace('{playerId}', playerId.toString());
    return this.makeRequest(endpoint);
  }

  // Transferts récents des principales équipes
  async getMainLeaguesTransfers() {
    const transfers = [];
    for (const leagueId of SELECTED_LEAGUES) {
      try {
        const response = await this.makeRequest(`/transfers?league=${leagueId}`) as { response: Transfer[] };
        if (response?.response) {
          transfers.push(...response.response);
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération des transferts pour la ligue ${leagueId}:`, error);
      }
    }
    return { response: transfers };
  }

  // Transferts récents globaux (toutes équipes)
  async getAllRecentTransfers(season?: number) {
    let url = season ? `/transfers?season=${season}` : '/transfers';
    const data = await this.makeRequest(url);
    return Array.isArray(data?.response) ? { response: data.response } : { response: [] };
  }
  
  // Obtenir les ligues disponibles
  async getAvailableLeagues() {
    return this.makeRequest(API_ENDPOINTS.LEAGUES);
  }
  
  // Page statistiques des joueurs - Statistiques par ligue
  async getPlayerStats(leagueId: number, season: number = new Date().getFullYear(), statType: string = 'topscorers') {
    const endpoint = API_ENDPOINTS.PLAYER_STATS
      .replace('{statType}', statType)
      .replace('{leagueId}', leagueId.toString())
      .replace('{season}', season.toString());
    return this.makeRequest(endpoint);
  }
  
}

// Classe pour l'API Google Translate non officielle (gratuite)
export class GoogleTranslateAPI {
  private static instance: GoogleTranslateAPI;
  private cache: Map<string, string> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures
  private cacheTimestamps: Map<string, number> = new Map();
  
  private constructor() {}
  
  public static getInstance(): GoogleTranslateAPI {
    if (!GoogleTranslateAPI.instance) {
      GoogleTranslateAPI.instance = new GoogleTranslateAPI();
    }
    return GoogleTranslateAPI.instance;
  }
  
  // Générer une clé de cache
  private getCacheKey(text: string, from: string, to: string): string {
    return `${from}-${to}-${btoa(text).substring(0, 50)}`;
  }
  
  // Vérifier si les données en cache sont encore valides
  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CACHE_DURATION;
  }
  
  // Méthode principale de traduction
  async translateText(text: string, from: string = 'auto', to: string = 'ar'): Promise<string> {
    if (!text || text.trim() === '') {
      return text;
    }
    
    const cacheKey = this.getCacheKey(text, from, to);
    
    // Vérifier le cache
    if (this.cache.has(cacheKey) && this.isCacheValid(cacheKey)) {
      console.log(`🎯 Translation from cache: ${text.substring(0, 30)}...`);
      return this.cache.get(cacheKey)!;
    }
    
    try {
      console.log(`🔄 Translating with Google API: "${text.substring(0, 50)}..." (${from} → ${to})`);
      
      const response = await axios.get(GOOGLE_TRANSLATE_CONFIG.BASE_URL, {
        params: {
          ...GOOGLE_TRANSLATE_CONFIG.DEFAULT_PARAMS,
          sl: from,
          tl: to,
          q: text
        },
        timeout: 10000 // 10 secondes de timeout
      });
      
      // La réponse de l'API Google Translate non officielle est un tableau complexe
      // Le texte traduit se trouve généralement à response.data[0][0][0]
      let translatedText = text; // Fallback au texte original
      
      if (response.data && Array.isArray(response.data) && response.data[0]) {
        if (Array.isArray(response.data[0]) && response.data[0][0]) {
          if (Array.isArray(response.data[0][0]) && response.data[0][0][0]) {
            translatedText = response.data[0][0][0];
          } else if (typeof response.data[0][0] === 'string') {
            translatedText = response.data[0][0];
          }
        }
      }
      
      // Mettre en cache le résultat
      this.cache.set(cacheKey, translatedText);
      this.cacheTimestamps.set(cacheKey, Date.now());
      
      console.log(`✅ Translation successful: "${translatedText.substring(0, 50)}..."`);
      return translatedText;
      
    } catch (error) {
      console.error('❌ Google Translate API error:', error);
      
      // En cas d'erreur, essayer de nettoyer le texte et retenter une fois
      if (!text.includes('retry')) {
        const cleanText = text.replace(/[^\w\s\u0600-\u06FF]/g, '').trim();
        if (cleanText && cleanText !== text) {
          return this.translateText(cleanText + ' retry', from, to);
        }
      }
      
      return text; // Retourner le texte original en cas d'erreur
    }
  }
  
  // Traduire vers l'arabe
  async translateToArabic(text: string, fromLang: string = 'auto'): Promise<string> {
    return this.translateText(text, fromLang, GOOGLE_TRANSLATE_CONFIG.LANGUAGES.ARABIC);
  }
  
  // Traduire vers le français
  async translateToFrench(text: string, fromLang: string = 'auto'): Promise<string> {
    return this.translateText(text, fromLang, GOOGLE_TRANSLATE_CONFIG.LANGUAGES.FRENCH);
  }
  
  // Traduire vers l'anglais
  async translateToEnglish(text: string, fromLang: string = 'auto'): Promise<string> {
    return this.translateText(text, fromLang, GOOGLE_TRANSLATE_CONFIG.LANGUAGES.ENGLISH);
  }
  
  // Traduire depuis l'arabe vers le français
  async translateArabicToFrench(text: string): Promise<string> {
    return this.translateText(text, GOOGLE_TRANSLATE_CONFIG.LANGUAGES.ARABIC, GOOGLE_TRANSLATE_CONFIG.LANGUAGES.FRENCH);
  }
  
  // Traduire depuis le français vers l'arabe
  async translateFrenchToArabic(text: string): Promise<string> {
    return this.translateText(text, GOOGLE_TRANSLATE_CONFIG.LANGUAGES.FRENCH, GOOGLE_TRANSLATE_CONFIG.LANGUAGES.ARABIC);
  }
  
  // Traduction en lot (batch) pour améliorer les performances
  async translateBatch(texts: string[], from: string = 'auto', to: string = 'ar'): Promise<string[]> {
    const results: string[] = [];
    
    // Traiter par petits groupes pour éviter de surcharger l'API
    const batchSize = 5;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => this.translateText(text, from, to));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Translation failed for text ${i + index}:`, result.reason);
          results.push(batch[index]); // Fallback au texte original
        }
      });
      
      // Petite pause entre les lots pour éviter la limitation de débit
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return results;
  }
  
  // Vider le cache
  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }
  
  // Obtenir les statistiques du cache
  getCacheStats() {
    return {
      size: this.cache.size,
      validEntries: Array.from(this.cacheTimestamps.keys()).filter(key => this.isCacheValid(key)).length,
      totalEntries: this.cacheTimestamps.size
    };
  }
  
  // Nettoyer les entrées expirées du cache
  cleanExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.cacheTimestamps.forEach((timestamp, key) => {
      if (now - timestamp >= this.CACHE_DURATION) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
    });
    
    console.log(`🧹 Cleaned ${expiredKeys.length} expired cache entries`);
  }
}

// Configuration de LibreTranslate pour la traduction (fallback)
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

// Classe de traduction hybride (Google Translate + LibreTranslate fallback)
export class HybridTranslateAPI {
  private static instance: HybridTranslateAPI;
  private googleAPI: GoogleTranslateAPI;
  private libreAPI: LibreTranslateAPI;
  private useGoogleFirst: boolean = true;
  
  private constructor() {
    this.googleAPI = GoogleTranslateAPI.getInstance();
    this.libreAPI = LibreTranslateAPI.getInstance();
  }
  
  public static getInstance(): HybridTranslateAPI {
    if (!HybridTranslateAPI.instance) {
      HybridTranslateAPI.instance = new HybridTranslateAPI();
    }
    return HybridTranslateAPI.instance;
  }
  
  // Méthode principale de traduction avec fallback
  async translateText(text: string, from: string = 'auto', to: string = 'ar'): Promise<string> {
    if (!text || text.trim() === '') {
      return text;
    }
    
    // Essayer Google Translate d'abord
    if (this.useGoogleFirst) {
      try {
        const result = await this.googleAPI.translateText(text, from, to);
        // Vérifier si la traduction a réussi (le texte a changé ou est différent)
        if (result && result !== text) {
          return result;
        }
      } catch (error) {
        console.warn('Google Translate failed, trying LibreTranslate...', error);
      }
    }
    
    // Fallback vers LibreTranslate
    try {
      return await this.libreAPI.translateText(text, from, to);
    } catch (error) {
      console.error('All translation services failed:', error);
      
      // Si Google n'a pas été essayé en premier, l'essayer maintenant
      if (!this.useGoogleFirst) {
        try {
          return await this.googleAPI.translateText(text, from, to);
        } catch (googleError) {
          console.error('Google Translate also failed:', googleError);
        }
      }
      
      return text; // Retourner le texte original en dernier recours
    }
  }
  
  // Traduire vers l'arabe
  async translateToArabic(text: string, fromLang: string = 'auto'): Promise<string> {
    return this.translateText(text, fromLang, 'ar');
  }
  
  // Traduire vers le français
  async translateToFrench(text: string, fromLang: string = 'auto'): Promise<string> {
    return this.translateText(text, fromLang, 'fr');
  }
  
  // Traduire depuis l'arabe vers le français
  async translateArabicToFrench(text: string): Promise<string> {
    return this.translateText(text, 'ar', 'fr');
  }
  
  // Traduire depuis le français vers l'arabe
  async translateFrenchToArabic(text: string): Promise<string> {
    return this.translateText(text, 'fr', 'ar');
  }
  
  // Détecter la langue automatiquement et traduire
  async autoTranslate(text: string, targetLang: string): Promise<string> {
    return this.translateText(text, 'auto', targetLang);
  }
  
  // Traduction en lot
  async translateBatch(texts: string[], from: string = 'auto', to: string = 'ar'): Promise<string[]> {
    // Utiliser Google Translate pour les lots (plus rapide)
    try {
      return await this.googleAPI.translateBatch(texts, from, to);
    } catch (error) {
      console.warn('Google Translate batch failed, using individual translations...', error);
      // Fallback: traductions individuelles
      const results: string[] = [];
      for (const text of texts) {
        results.push(await this.translateText(text, from, to));
      }
      return results;
    }
  }
  
  // Configurer l'ordre de préférence des APIs
  setGoogleFirst(useGoogle: boolean): void {
    this.useGoogleFirst = useGoogle;
  }
  
  // Obtenir les statistiques des deux services
  getStats() {
    return {
      google: this.googleAPI.getCacheStats(),
      libre: 'LibreTranslate stats not available',
      preferredService: this.useGoogleFirst ? 'Google Translate' : 'LibreTranslate'
    };
  }
  
  // Vider tous les caches
  clearAllCaches(): void {
    this.googleAPI.clearCache();
    // this.libreAPI n'a pas de méthode clearCache publique
  }
  
  // Nettoyer les caches expirés
  cleanExpiredCaches(): void {
    this.googleAPI.cleanExpiredCache();
  }
}

// Instance singleton pour utilisation dans les composants
export const footballAPI = FootballAPI.getInstance();
export const googleTranslateAPI = GoogleTranslateAPI.getInstance();
export const translateAPI = HybridTranslateAPI.getInstance(); // Utiliser l'API hybride par défaut
export const libreTranslateAPI = LibreTranslateAPI.getInstance();

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