// Configuration API Football pour le site Koora
import { apiCache } from '../services/apiCache';
import axios from 'axios';
import { LEAGUE_IDS } from './leagueIds';
// Documentation: https://www.api-football.com/documentation-v3

export const API_CONFIG = {
  BASE_URL: 'https://v3.football.api-sports.io',
  HEADERS: {
    // API-FOOTBALL v3 accepte 'x-apisports-key' pour le host direct, et 'x-rapidapi-key' s'il est utilisé via RapidAPI.
    // Fournir les deux pour maximiser la compatibilité.
    'x-apisports-key': import.meta.env.VITE_FOOTBALL_API_KEY,
    'X-RapidAPI-Key': import.meta.env.VITE_FOOTBALL_API_KEY,
    'X-RapidAPI-Host': 'v3.football.api-sports.io',
    'Content-Type': 'application/json'
  },
  // Forcer l'utilisation de l'API réelle au lieu des données mock
  DEV_MODE: false,
  // Désactiver les appels API problématiques en mode développement
  DISABLE_PROBLEMATIC_APIS: import.meta.env.VITE_DISABLE_PROBLEMATIC_APIS === 'true'
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

// Configuration LibreTranslate pour la traduction (fallback)
export const TRANSLATE_CONFIG = {
  BASE_URL: import.meta.env.VITE_LIBRETRANSLATE_API_URL || 'https://libretranslate.com/translate',
  API_KEY: import.meta.env.VITE_LIBRETRANSLATE_API_KEY,
  // Allow disabling LibreTranslate completely via env flag
  DISABLED: String(import.meta.env.VITE_DISABLE_LIBRETRANSLATE || '').toLowerCase() === 'true',
  HEADERS: {
    'Content-Type': 'application/json'
  },
  LANGUAGES: {
    ARABIC: 'ar',
    FRENCH: 'fr',
    ENGLISH: 'en'
  },
  // Default cooldown when a 403/429 is encountered
  DEFAULT_COOLDOWN_MS: 60 * 60 * 1000
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
  PLAYER_STATS: '/players/{statType}?league={leagueId}&season={season}',
  FIXTURE_EVENTS: '/fixtures/events',
  FIXTURE_STATISTICS: '/fixtures/statistics'
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
  WORLD_CUP: 1,           // FIFA World Cup

  // Compétitions africaines (IDs corrigés)
  AFRICA_CHAMPIONS_LEAGUE: 12,      // CAF Champions League (ID corrigé)
  AFRICA_CONFED_CUP: 20,            // CAF Confederation Cup (ID corrigé)

  // Egyptian Premier League
  EGYPTIAN_PREMIER_LEAGUE: 233,       // Egyptian Premier League (ID ajouté)

  // Ligues secondaires souvent disponibles
  EREDIVISIE: 88,         // Eredivisie (Pays-Bas)
  PRIMERA_DIVISION: 87,   // Primeira Liga (Portugal)

  // Botola Pro (Maroc)
  BOTOLA_MAROC: 200,      // Morocco Botola Pro
};

// Ligues à afficher (filtrage spécifique) - Utiliser seulement les ligues gratuites
export const SELECTED_LEAGUES = [
  LEAGUE_IDS.PREMIER_LEAGUE, // Premier League
  LEAGUE_IDS.LIGUE_1,        // Ligue 1 France
  LEAGUE_IDS.BUNDESLIGA,     // Bundesliga
  LEAGUE_IDS.LA_LIGA,        // La Liga
  LEAGUE_IDS.SERIE_A,        // Serie A
  LEAGUE_IDS.BOTOLA_MAROC,   // Botola Pro (Morocco)
  LEAGUE_IDS.CHAMPIONS_LEAGUE, // UEFA Champions League
  LEAGUE_IDS.EUROPA_LEAGUE,    // UEFA Europa League
  LEAGUE_IDS.CAF_CHAMPIONS_LEAGUE, // CAF Champions League
  LEAGUE_IDS.CAF_CONFEDERATION_CUP, // CAF Confederation Cup
  LEAGUE_IDS.EGYPTIAN_PREMIER_LEAGUE, // Egyptian Premier League
  LEAGUE_IDS.EREDIVISIE,       // Eredivisie (Pays-Bas)
  LEAGUE_IDS.PRIMEIRA_LIGA,    // Primeira Liga (Portugal)
  LEAGUE_IDS.ALGERIA_LIGUE_1,  // Algeria Ligue 1
  LEAGUE_IDS.SAUDI_PRO_LEAGUE, // Saudi Pro League
  LEAGUE_IDS.LIBYA_PREMIER_LEAGUE, // Libya Premier League
  LEAGUE_IDS.AFRICA_CUP_OF_NATIONS, // Africa Cup of Nations
  LEAGUE_IDS.WORLD_CUP_QUALIFICATION_AFRICA, // World Cup Qualification Africa
  LEAGUE_IDS.AFRICA_CUP_QUALIFICATION, // Africa Cup Qualification
];

// Configuration des appels API avec gestion d'erreurs et fallback mock
export class FootballAPI {
  // Indique si le mode mock est activé
  public static isUsingMockAPI(): boolean {
    return API_CONFIG.DEV_MODE === true;
  }

  // Force l'utilisation de l'API réelle
  public static forceRealAPI(): void {
    API_CONFIG.DEV_MODE = false;
  }
  private static instance: FootballAPI;
  private constructor() {}

  public static getInstance(): FootballAPI {
    if (!FootballAPI.instance) {
      FootballAPI.instance = new FootballAPI();
    }
    return FootballAPI.instance;
  }

  // Méthode générique pour les appels API avec cache intelligent
  private async makeRequest(endpoint: string, params?: Record<string, unknown>): Promise<any> {
    // Vérifier le cache d'abord
    const cachedData = apiCache.get(endpoint, params);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Construire l'URL avec les paramètres
      let url = `${API_CONFIG.BASE_URL}${endpoint}`;
      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        url += `?${searchParams.toString()}`;
      }

      console.log(`🌐 API Request: ${url}`);
      const response = await fetch(url, {
        headers: API_CONFIG.HEADERS
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Mettre en cache la réponse
      apiCache.set(endpoint, data, params);
      
      return data;
    } catch (error) {
      console.error('❌ API Request failed:', error);
      
      // Gestion spéciale pour les erreurs CORS
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('🚫 CORS Error detected. This might be due to API restrictions.');
        // Retourner des données vides au lieu de lancer une erreur
        return { response: [], results: 0 };
      }
      
      // Gestion des erreurs de réseau
      if (error instanceof TypeError && (error.message.includes('NetworkError') || error.message.includes('ERR_NETWORK'))) {
        console.warn('🌐 Network Error detected. Check your internet connection.');
        return { response: [], results: 0 };
      }
      
      throw error;
    }
  }
  
  // Page d'accueil - Récupérer les dernières actualités
  async getLatestNews(limit: number = 10) {
    return this.makeRequest(API_ENDPOINTS.NEWS, { limit });
  }
  
  // Page matchs - Matchs en direct (filtré par ligues sélectionnées)
  async getLiveFixtures() {
    const allFixtures = await this.makeRequest('/fixtures', { live: 'all' }) as { response: Fixture[] };
    return this.filterBySelectedLeagues(allFixtures);
  }
  
  // Page matchs - Matchs du jour (filtré par ligues sélectionnées)
  async getTodayFixtures() {
    const today = new Date().toISOString().split('T')[0];
    const allFixtures = await this.makeRequest('/fixtures', { date: today }) as { response: Fixture[] };
    return this.filterBySelectedLeagues(allFixtures);
  }

  // Méthode pour récupérer les matchs d'aujourd'hui
  async getTodayMatches(): Promise<ApiResponse<Fixture[]>> {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    const endpoint = API_ENDPOINTS.FIXTURES_TODAY.replace('{date}', today);
    return this.makeRequest(endpoint);
  }

  // Page matchs - Matchs par date et championnat spécifique
  async getFixturesByDate(date: string, leagueIds: number[] = []) {
    const params: Record<string, unknown> = { date };
    if (leagueIds.length > 0) {
      params.league = leagueIds.join(',');
    }
    
    const allFixtures = await this.makeRequest('/fixtures', params) as { response: Fixture[] };
    
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
    return this.makeRequest('/standings', { league: leagueId, season });
  }
  
  // Page transferts - Transferts récents
  async getRecentTransfers(teamId?: number, season?: number) {
    // Éviter les appels API problématiques en mode développement
    if (API_CONFIG.DISABLE_PROBLEMATIC_APIS) {
      console.warn('🚫 API calls disabled for problematic endpoints. Returning empty data.');
      return { response: [], results: 0 };
    }
    
    const params: Record<string, unknown> = {};
    if (teamId) params.team = teamId;
    if (season) params.season = season;
    
    const data = await this.makeRequest('/transfers', params);
    // Retourne uniquement la liste des transferts
    return Array.isArray(data?.response) ? { response: data.response } : { response: [] };
  }

  // Nouveaux transferts par date
  async getTransfersByDate(date: string) {
    return this.makeRequest('/transfers', { date });
  }

  // Transferts d'un joueur spécifique
  async getPlayerTransfers(playerId: number) {
    return this.makeRequest('/transfers', { player: playerId });
  }

  // Transferts récents des principales ligues (avec saison optionnelle)
  async getMainLeaguesTransfers(season?: number) {
    const transfers = [] as any[];
    for (const leagueId of SELECTED_LEAGUES) {
      try {
        const params: Record<string, unknown> = { league: leagueId };
        if (season) params.season = season;
        // Note: L'endpoint /transfers ne supporte pas toujours le paramètre league. Cette méthode peut retourner vide selon l'API/plan.
        const response = await this.makeRequest('/transfers', params) as { response: any[] };
        if (response?.response) {
          transfers.push(...response.response);
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération des transferts pour la ligue ${leagueId}:`, error);
      }
    }
    return { response: transfers };
  }

  // Récupérer les équipes par ligue et saison
  async getTeamsByLeague(leagueId: number, season: number) {
    return this.makeRequest('/teams', { league: leagueId, season });
  }

  // Obtenir les informations d'une équipe par ID
  async getTeamInfo(teamId: number) {
    return this.makeRequest('/teams', { id: teamId });
  }

  // Obtenir les statistiques d'une équipe pour une ligue et saison données
  async getTeamStatistics(leagueId: number, season: number, teamId: number) {
    return this.makeRequest('/teams/statistics', { league: leagueId, season, team: teamId });
  }

  // Tenter d'obtenir les statistiques d'une équipe en essayant les ligues sélectionnées
  async getTeamStatisticsAuto(teamId: number, season: number = new Date().getFullYear()) {
    for (const leagueId of SELECTED_LEAGUES) {
      try {
        const res = await this.getTeamStatistics(leagueId, season, teamId);
        if (res && res.response) {
          return res;
        }
      } catch (err) {
        console.debug(`Stats manquantes pour team ${teamId} dans ligue ${leagueId} saison ${season}`);
      }
    }
    return null;
  }

  // Matchs récents d'une équipe
  async getTeamLastFixtures(teamId: number, count: number = 5) {
    return this.makeRequest('/fixtures', { team: teamId, last: count });
  }

  // Prochains matchs d'une équipe
  async getTeamNextFixtures(teamId: number, count: number = 5) {
    return this.makeRequest('/fixtures', { team: teamId, next: count });
  }

  // Récupérer les transferts par équipes issues des ligues sélectionnées pour une saison donnée
  async getLeagueTeamsTransfers(season: number, maxTeamsPerLeague: number = 12) {
    const aggregated: any[] = [];
    for (const leagueId of SELECTED_LEAGUES) {
      try {
        const teamsRes = await this.getTeamsByLeague(leagueId, season);
        const teams: Array<{ team: { id: number } }> = Array.isArray(teamsRes?.response) ? teamsRes.response : [];
        const teamIds = teams.slice(0, maxTeamsPerLeague).map((t: any) => t?.team?.id).filter(Boolean);

        for (const teamId of teamIds) {
          try {
            const trRes = await this.getRecentTransfers(teamId, season);
            if (Array.isArray((trRes as any)?.response)) {
              aggregated.push(...(trRes as any).response);
            }
          } catch (teamErr) {
            console.error(`Erreur transferts pour l'équipe ${teamId} (league ${leagueId}):`, teamErr);
          }
        }
      } catch (err) {
        console.error(`Erreur équipes pour la ligue ${leagueId}:`, err);
      }
    }
    return { response: aggregated };
  }

  // Récupérer les transferts par équipes pour les ligues sélectionnées SANS filtrer par saison
  // Sert de filet de sécurité quand l'API renvoie peu/aucune donnée pour une saison précise
  async getLeagueTeamsTransfersAnySeason(maxTeamsPerLeague: number = 12) {
    const aggregated: any[] = [];
    const probeSeason = new Date().getFullYear(); // saison utilisée seulement pour lister les équipes
    for (const leagueId of SELECTED_LEAGUES) {
      try {
        const teamsRes = await this.getTeamsByLeague(leagueId, probeSeason);
        const teams: Array<{ team: { id: number } }> = Array.isArray(teamsRes?.response) ? teamsRes.response : [];
        const teamIds = teams.slice(0, maxTeamsPerLeague).map((t: any) => t?.team?.id).filter(Boolean);

        for (const teamId of teamIds) {
          try {
            // ne pas passer 'season' pour élargir le spectre
            const trRes = await this.getRecentTransfers(teamId, undefined);
            if (Array.isArray((trRes as any)?.response)) {
              aggregated.push(...(trRes as any).response);
            }
          } catch (teamErr) {
            // Gestion spécifique des erreurs CORS
            if (teamErr instanceof TypeError && teamErr.message.includes('Failed to fetch')) {
              console.warn(`🚫 CORS Error for team ${teamId} (league ${leagueId}). Skipping.`);
            } else {
              console.error(`Erreur transferts (toutes saisons) pour l'équipe ${teamId} (league ${leagueId}):`, teamErr);
            }
          }
        }
      } catch (err) {
        console.error(`Erreur équipes pour la ligue ${leagueId} (any season):`, err);
      }
    }
    return { response: aggregated };
  }

  // Transferts récents globaux (toutes équipes)
  async getAllRecentTransfers(season?: number) {
    const params: Record<string, unknown> = {};
    if (season) params.season = season;
    
    const data = await this.makeRequest('/transfers', params);
    return Array.isArray(data?.response) ? { response: data.response } : { response: [] };
  }
  
  // Obtenir les ligues disponibles
  async getAvailableLeagues() {
    return this.makeRequest('/leagues');
  }
  
  // Page statistiques des joueurs - Statistiques par ligue
  async getPlayerStats(leagueId: number, season: number = new Date().getFullYear(), statType: string = 'topscorers') {
    return this.makeRequest(`/players/${statType}`, { league: leagueId, season });
  }

  // Meilleurs buteurs d'une ligue
  async getTopScorers(leagueId: number, season: number = new Date().getFullYear()) {
    return this.makeRequest('/players/topscorers', { league: leagueId, season });
  }

  // Meilleurs passeurs d'une ligue
  async getTopAssists(leagueId: number, season: number = new Date().getFullYear()) {
    return this.makeRequest('/players/topassists', { league: leagueId, season });
  }
  
  // Fixtures: Events timeline
  async getFixtureEvents(fixtureId: number) {
    return this.makeRequest('/fixtures/events', { fixture: fixtureId });
  }

  // Fixtures: Statistics for both teams
  async getFixtureStatistics(fixtureId: number, homeTeamId: number, awayTeamId: number) {
    // API requires team param; fetch for both teams in parallel
    const [homeRes, awayRes] = await Promise.all([
      this.makeRequest('/fixtures/statistics', { fixture: fixtureId, team: homeTeamId }),
      this.makeRequest('/fixtures/statistics', { fixture: fixtureId, team: awayTeamId })
    ]);
    return { home: homeRes, away: awayRes };
  }

  // Fixtures: Lineups for a fixture
  async getFixtureLineups(fixtureId: number) {
    return this.makeRequest('/fixtures/lineups', { fixture: fixtureId });
  }
  
  // Transfers: by player or team
  async getTransfers(params: { player?: number; team?: number }) {
    const query: Record<string, number> = {};
    if (params.player) query.player = params.player;
    if (params.team) query.team = params.team;
    return this.makeRequest('/transfers', query);
  }
  
  // Nouvelle méthode ajoutée
  async getFixtures(params: {
    league: number;
    season: number;
    timezone: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/fixtures', params);
  }
  
}

// API types for events/statistics
export interface FixtureEventItem {
  time: { elapsed: number; extra?: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null } | null;
  type: string; // e.g., 'Goal', 'Card', 'subst', etc.
  detail: string; // e.g., 'Yellow Card', 'Red Card', 'Normal Goal', 'Penalty',
  comments?: string | null;
}

export interface FixtureStatisticItem {
  team: { id: number; name: string; logo: string };
  statistics: Array<{ type: string; value: number | string | null }>;
}

// API types for lineups
export interface FixtureLineupPlayerItem {
  player: {
    id: number | null;
    name: string | null;
    number: number | null;
    pos: string | null; // G, D, M, F
    grid: string | null; // e.g. "2:3"
  };
}

export interface FixtureLineupItem {
  team: {
    id: number;
    name: string;
    logo: string;
    colors?: {
      player?: { primary?: string; number?: string; border?: string };
      goalkeeper?: { primary?: string; number?: string; border?: string };
    };
  };
  formation: string;
  startXI: FixtureLineupPlayerItem[];
  substitutes: FixtureLineupPlayerItem[];
  coach?: { id?: number; name?: string; photo?: string } | null;
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
    try {
      // Utiliser encodeURIComponent pour éviter les erreurs avec les caractères non-Latin1
      const encodedText = encodeURIComponent(text).substring(0, 50);
      return `${from}-${to}-${encodedText}`;
    } catch (error) {
      // Fallback simple si l'encodage échoue
      return `${from}-${to}-${text.substring(0, 20)}`;
    }
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

  // Méthode mock pour récupérer des données simulées (utilisée en DEV_MODE)
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
  // Circuit breaker state to avoid hammering the API when returning 403/429
  private static circuitOpenUntil: number | null = null;
  private static failureCount = 0;
  private static readonly FAILURE_THRESHOLD = 3;
  private static lastWarnAt: number = 0;
  
  private constructor() {}
  
  public static getInstance(): LibreTranslateAPI {
    if (!LibreTranslateAPI.instance) {
      LibreTranslateAPI.instance = new LibreTranslateAPI();
    }
    return LibreTranslateAPI.instance;
  }
  
  // Whether LibreTranslate should be attempted
  public static isAvailable(): boolean {
    if (TRANSLATE_CONFIG.DISABLED) return false;
    if (this.circuitOpenUntil && Date.now() < this.circuitOpenUntil) return false;
    return true;
  }
  
  private static openCircuit(ms: number, reason?: string) {
    this.circuitOpenUntil = Date.now() + ms;
    const now = Date.now();
    // Warn at most once every 5 minutes
    if (now - this.lastWarnAt > 5 * 60 * 1000) {
      console.warn(`LibreTranslate disabled for ${Math.round(ms/60000)}m${reason ? ` (${reason})` : ''}`);
      this.lastWarnAt = now;
    }
  }
  
  private static noteFailure(status?: number) {
    this.failureCount += 1;
    // On 403/429, open circuit immediately for a longer period
    if (status === 403 || status === 429) {
      this.openCircuit(TRANSLATE_CONFIG.DEFAULT_COOLDOWN_MS, `status ${status}`);
      return;
    }
    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      this.openCircuit(10 * 60 * 1000, 'multiple failures');
      this.failureCount = 0;
    }
  }
  
  // Traduire un texte
  async translateText(text: string, from: string, to: string): Promise<string> {
    try {
      // Short-circuit if disabled or currently unavailable
      if (!LibreTranslateAPI.isAvailable()) {
        return text;
      }
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
        // Note failure and open circuit when relevant; avoid throwing to prevent noisy console errors
        LibreTranslateAPI.noteFailure(response.status);
        return text;
      }
      
      const data = await response.json();
      // Reset failure count and circuit on success
      LibreTranslateAPI.failureCount = 0;
      LibreTranslateAPI.circuitOpenUntil = null;
      return data.translatedText || text;
    } catch (error) {
      // Use debug level to avoid noisy errors
      console.debug('LibreTranslate error (suppressed):', error);
      LibreTranslateAPI.noteFailure();
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
      // Only use LibreTranslate if available (not disabled and circuit not open)
      if (TRANSLATE_CONFIG.DISABLED || !LibreTranslateAPI.isAvailable()) {
        return text;
      }
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

export interface PlayerStatistic {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    birth: {
      date: string;
      place: string;
      country: string;
    };
    nationality: string;
    height: string;
    weight: string;
    injured: boolean;
    photo: string;
  };
  statistics: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      flag: string;
      season: number;
    };
    games: {
      appearences: number;
      lineups: number;
      minutes: number;
      number: number | null;
      position: string;
      rating: string;
      captain: boolean;
    };
    goals: {
      total: number | null;
      conceded: number | null;
      assists: number | null;
      saves: number | null;
    };
    passes: {
      total: number;
      key: number;
      accuracy: number;
    };
    shots: {
      total: number;
      on: number;
    };
    cards: {
      yellow: number;
      yellowred: number;
      red: number;
    };
  }>;
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

// API types for transfers (détail brut de l'endpoint /transfers)
export interface TransferTeamRef {
  id: number;
  name: string;
  logo: string;
}

export interface TransferRecord {
  date: string; // YYYY-MM-DD
  type: string | null; // e.g., Loan, Free, N/A
  teams: { in: TransferTeamRef; out: TransferTeamRef };
}

export interface TransferResponseItem {
  player?: { id: number; name: string };
  team?: { id: number; name: string };
  update?: string;
  transfers: TransferRecord[];
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

export interface ApiResponse<T> {
  get: string;
  parameters: Record<string, unknown>;
  errors: string[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T;
}