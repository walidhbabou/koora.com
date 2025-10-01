// Types et interfaces pour la gestion des matchs

export interface Team {
  id: number;
  name: string;
  logo: string;
}

export interface League {
  id: number;
  name: string;
  logo: string;
}

export interface MatchStatus {
  short?: string;
  elapsed?: number;
  extra?: number;
}

export interface Fixture {
  id: number;
  date: string;
  status?: MatchStatus | string;
  league?: League;
  teams?: {
    home: Team;
    away: Team;
  };
  goals?: {
    home: number;
    away: number;
  };
  score?: {
    halftime?: {
      home: number;
      away: number;
    };
    fulltime?: {
      home: number;
      away: number;
    };
    extratime?: {
      home: number;
      away: number;
    };
    penalty?: {
      home: number;
      away: number;
    };
  };
}
