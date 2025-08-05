// Configuration API Football pour le site Koora
// Documentation: https://www.api-football.com/documentation-v3

export const API_CONFIG = {
  BASE_URL: 'https://v3.football.api-sports.io',
  HEADERS: {
    'X-API-Key': process.env.VITE_FOOTBALL_API_KEY || '',
    'Content-Type': 'application/json'
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

// Ligues principales à afficher en priorité
export const MAIN_LEAGUES = {
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  BUNDESLIGA: 78,
  SERIE_A: 135,
  LIGUE_1: 61,
  CHAMPIONS_LEAGUE: 2,
  EUROPA_LEAGUE: 3,
  WORLD_CUP: 1
};

// Configuration des appels API avec gestion d'erreurs
export class FootballAPI {
  private static instance: FootballAPI;
  
  private constructor() {}
  
  public static getInstance(): FootballAPI {
    if (!FootballAPI.instance) {
      FootballAPI.instance = new FootballAPI();
    }
    return FootballAPI.instance;
  }
  
  // Méthode générique pour les appels API
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
      console.error('API Request failed:', error);
      throw error;
    }
  }
  
  // Page d'accueil - Récupérer les dernières actualités
  async getLatestNews(limit: number = 10) {
    return this.makeRequest(`${API_ENDPOINTS.NEWS}?limit=${limit}`);
  }
  
  // Page matchs - Matchs en direct
  async getLiveFixtures() {
    return this.makeRequest(API_ENDPOINTS.FIXTURES_LIVE);
  }
  
  // Page matchs - Matchs du jour
  async getTodayFixtures() {
    const today = new Date().toISOString().split('T')[0];
    return this.makeRequest(API_ENDPOINTS.FIXTURES_TODAY.replace('{date}', today));
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
}

// Instance singleton pour utilisation dans les composants
export const footballAPI = FootballAPI.getInstance();

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