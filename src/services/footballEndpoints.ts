// footballEndpoints.ts
// Service pour gérer les endpoints API Football v3 selon la documentation officielle

export const FOOTBALL_ENDPOINTS = {
  // 1. Seasons, Leagues, Countries
  SEASONS: '/seasons',
  LEAGUES: '/leagues',
  COUNTRIES: '/countries',
  
  // 2. Standings (classement de la saison)
  STANDINGS: '/standings',
  
  // 3. Top Scorers (buteurs de la saison)
  TOP_SCORERS: '/players/topscorers',
  PLAYER_STATS: '/players',
  
  // 4. Fixtures (calendrier des matchs)
  FIXTURES: '/fixtures',
  FIXTURES_LIVE: '/fixtures/live',
  
  // 5. Match Details & Statistiques
  FIXTURE_STATISTICS: '/fixtures/statistics',
  FIXTURE_EVENTS: '/fixtures/events',
  FIXTURE_LINEUPS: '/fixtures/lineups',
  
  // 6. Transfers
  TRANSFERS: '/transfers',
  
  // 7. Teams
  TEAMS: '/teams',
  TEAM_STATISTICS: '/teams/statistics',
  
  // 8. Players
  PLAYERS: '/players',
  PLAYER_SEASONS: '/players/seasons',
  
  // 9. Coaches
  COACHES: '/coaches',
  
  // 10. Venues
  VENUES: '/venues',
} as const;

// Paramètres courants pour les requêtes
export const FOOTBALL_PARAMS = {
  // Paramètres de base
  SEASON: 'season',
  LEAGUE: 'league',
  TEAM: 'team',
  PLAYER: 'player',
  FIXTURE: 'fixture',
  DATE: 'date',
  FROM: 'from',
  TO: 'to',
  LIVE: 'live',
  
  // Paramètres de pagination
  PAGE: 'page',
  PER_PAGE: 'per_page',
  
  // Paramètres de filtrage
  SEARCH: 'search',
  ID: 'id',
  COUNTRY: 'country',
  
  // Paramètres spécifiques
  TYPE: 'type', // pour les transferts
  STAT_TYPE: 'statType', // pour les statistiques joueurs
} as const;

// Configuration des durées de cache par endpoint
export const ENDPOINT_CACHE_DURATIONS = {
  // Données très dynamiques
  [FOOTBALL_ENDPOINTS.FIXTURES_LIVE]: 30 * 1000, // 30 secondes
  [FOOTBALL_ENDPOINTS.FIXTURE_STATISTICS]: 60 * 1000, // 1 minute
  [FOOTBALL_ENDPOINTS.FIXTURE_EVENTS]: 60 * 1000, // 1 minute
  
  // Données modérément dynamiques
  [FOOTBALL_ENDPOINTS.FIXTURES]: 15 * 60 * 1000, // 15 minutes
  [FOOTBALL_ENDPOINTS.STANDINGS]: 2 * 60 * 60 * 1000, // 2 heures
  
  // Données relativement stables
  [FOOTBALL_ENDPOINTS.TOP_SCORERS]: 6 * 60 * 60 * 1000, // 6 heures
  [FOOTBALL_ENDPOINTS.PLAYER_STATS]: 6 * 60 * 60 * 1000, // 6 heures
  [FOOTBALL_ENDPOINTS.TEAM_STATISTICS]: 6 * 60 * 60 * 1000, // 6 heures
  
  // Données très stables
  [FOOTBALL_ENDPOINTS.LEAGUES]: 24 * 60 * 60 * 1000, // 24 heures
  [FOOTBALL_ENDPOINTS.COUNTRIES]: 24 * 60 * 60 * 1000, // 24 heures
  [FOOTBALL_ENDPOINTS.SEASONS]: 7 * 24 * 60 * 60 * 1000, // 7 jours
  [FOOTBALL_ENDPOINTS.TEAMS]: 24 * 60 * 60 * 1000, // 24 heures
  [FOOTBALL_ENDPOINTS.PLAYERS]: 24 * 60 * 60 * 1000, // 24 heures
  [FOOTBALL_ENDPOINTS.COACHES]: 24 * 60 * 60 * 1000, // 24 heures
  [FOOTBALL_ENDPOINTS.VENUES]: 24 * 60 * 60 * 1000, // 24 heures
  
  // Transferts (très stables)
  [FOOTBALL_ENDPOINTS.TRANSFERS]: 48 * 60 * 60 * 1000, // 48 heures
} as const;

// Classe pour construire les URLs d'API
export class FootballEndpointBuilder {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'https://v3.football.api-sports.io') {
    this.baseUrl = baseUrl;
  }
  
  // Construire une URL avec paramètres
  buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }
    
    return url;
  }
  
  // Méthodes spécialisées pour chaque type d'endpoint
  
  // Standings
  getStandingsUrl(leagueId: number, season: number = 2025): string {
    return this.buildUrl(FOOTBALL_ENDPOINTS.STANDINGS, {
      [FOOTBALL_PARAMS.LEAGUE]: leagueId,
      [FOOTBALL_PARAMS.SEASON]: season
    });
  }
  
  // Top Scorers
  getTopScorersUrl(leagueId: number, season: number = 2025): string {
    return this.buildUrl(FOOTBALL_ENDPOINTS.TOP_SCORERS, {
      [FOOTBALL_PARAMS.LEAGUE]: leagueId,
      [FOOTBALL_PARAMS.SEASON]: season
    });
  }
  
  // Fixtures par date
  getFixturesByDateUrl(date: string, leagueIds?: number[]): string {
    const params: Record<string, unknown> = {
      [FOOTBALL_PARAMS.DATE]: date
    };
    
    if (leagueIds && leagueIds.length > 0) {
      params[FOOTBALL_PARAMS.LEAGUE] = leagueIds.join(',');
    }
    
    return this.buildUrl(FOOTBALL_ENDPOINTS.FIXTURES, params);
  }
  
  // Fixtures par période
  getFixturesByPeriodUrl(from: string, to: string, leagueIds?: number[]): string {
    const params: Record<string, unknown> = {
      [FOOTBALL_PARAMS.FROM]: from,
      [FOOTBALL_PARAMS.TO]: to
    };
    
    if (leagueIds && leagueIds.length > 0) {
      params[FOOTBALL_PARAMS.LEAGUE] = leagueIds.join(',');
    }
    
    return this.buildUrl(FOOTBALL_ENDPOINTS.FIXTURES, params);
  }
  
  // Matchs en direct
  getLiveFixturesUrl(): string {
    return this.buildUrl(FOOTBALL_ENDPOINTS.FIXTURES_LIVE);
  }
  
  // Statistiques d'un match
  getFixtureStatisticsUrl(fixtureId: number): string {
    return this.buildUrl(FOOTBALL_ENDPOINTS.FIXTURE_STATISTICS, {
      [FOOTBALL_PARAMS.FIXTURE]: fixtureId
    });
  }
  
  // Événements d'un match
  getFixtureEventsUrl(fixtureId: number): string {
    return this.buildUrl(FOOTBALL_ENDPOINTS.FIXTURE_EVENTS, {
      [FOOTBALL_PARAMS.FIXTURE]: fixtureId
    });
  }
  
  // Compositions d'un match
  getFixtureLineupsUrl(fixtureId: number): string {
    return this.buildUrl(FOOTBALL_ENDPOINTS.FIXTURE_LINEUPS, {
      [FOOTBALL_PARAMS.FIXTURE]: fixtureId
    });
  }
  
  // Transferts
  getTransfersUrl(teamId?: number, season?: number): string {
    const params: Record<string, unknown> = {};
    if (teamId) params[FOOTBALL_PARAMS.TEAM] = teamId;
    if (season) params[FOOTBALL_PARAMS.SEASON] = season;
    
    return this.buildUrl(FOOTBALL_ENDPOINTS.TRANSFERS, params);
  }
  
  // Ligues disponibles
  getLeaguesUrl(country?: string): string {
    const params: Record<string, unknown> = {};
    if (country) params[FOOTBALL_PARAMS.COUNTRY] = country;
    
    return this.buildUrl(FOOTBALL_ENDPOINTS.LEAGUES, params);
  }
  
  // Statistiques d'une équipe
  getTeamStatisticsUrl(teamId: number, leagueId: number, season: number = 2025): string {
    return this.buildUrl(FOOTBALL_ENDPOINTS.TEAM_STATISTICS, {
      [FOOTBALL_PARAMS.TEAM]: teamId,
      [FOOTBALL_PARAMS.LEAGUE]: leagueId,
      [FOOTBALL_PARAMS.SEASON]: season
    });
  }
  
  // Informations d'un joueur
  getPlayerUrl(playerId: number, season?: number): string {
    const params: Record<string, unknown> = {
      [FOOTBALL_PARAMS.PLAYER]: playerId
    };
    if (season) params[FOOTBALL_PARAMS.SEASON] = season;
    
    return this.buildUrl(FOOTBALL_ENDPOINTS.PLAYERS, params);
  }
}

// Instance singleton
export const footballEndpointBuilder = new FootballEndpointBuilder();

// Types pour les réponses API
export interface FootballAPIResponse<T> {
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

// Types spécifiques pour chaque endpoint
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

export interface TopScorer {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
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
      number: number;
      position: string;
      rating: string;
      captain: boolean;
    };
    substitutes: {
      in: number;
      out: number;
      bench: number;
    };
    shots: {
      total: number;
      on: number;
    };
    goals: {
      total: number;
      conceded: number;
      assists: number;
      saves: number;
    };
    passes: {
      total: number;
      key: number;
      accuracy: number;
    };
    tackles: {
      total: number;
      blocks: number;
      interceptions: number;
    };
    duels: {
      total: number;
      won: number;
    };
    dribbles: {
      attempts: number;
      success: number;
      past: number;
    };
    fouls: {
      drawn: number;
      committed: number;
    };
    cards: {
      yellow: number;
      red: number;
    };
    penalty: {
      won: number;
      commited: number;
      scored: number;
      missed: number;
      saved: number;
    };
  }>;
}

export interface Fixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
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
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

export interface Transfer {
  player: {
    id: number;
    name: string;
    photo: string;
  };
  update: string;
  transfers: Array<{
    date: string;
    type: string;
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
  }>;
}
