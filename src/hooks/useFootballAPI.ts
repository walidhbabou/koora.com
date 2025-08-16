import { useEffect, useState, useCallback } from "react";
import { footballAPI, translateAPI, Fixture, Standing, Transfer } from "@/config/api";

// Extended types for translated content
interface TranslatedTeam {
  id: number;
  name: string;
  logo: string;
  nameTranslated?: { arabic: string };
}

interface TranslatedLeague {
  id: number;
  name: string;
  logo: string;
  nameTranslated?: { arabic: string };
}

interface ExtendedFixture extends Omit<Fixture, 'teams' | 'league'> {
  teams: {
    home: TranslatedTeam;
    away: TranslatedTeam;
  };
  league: TranslatedLeague;
}

interface MatchesData {
  response: ExtendedFixture[];
}

interface StandingsData {
  response: Array<{
    league: {
      id: number;
      name: string;
      standings: Array<Array<Standing & { team: TranslatedTeam }>>;
    };
  }>;
}

interface TransfersData {
  response: Array<Transfer & {
    player: Transfer['player'] & { nameTranslated?: { arabic: string } };
    teams: {
      in: TranslatedTeam;
      out: TranslatedTeam;
    };
  }>;
}

interface LeaguesData {
  response: Array<{
    league: {
      id: number;
      name: string;
      type: string;
      logo: string;
    };
    country: {
      name: string;
      code: string;
      flag: string;
    };
  }>;
}

// Hook pour les matchs en direct
export const useLiveMatches = ({ translateContent = false, refreshInterval = 0 }: {
  translateContent?: boolean;
  refreshInterval?: number;
}) => {
  const [data, setData] = useState<MatchesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await footballAPI.getLiveFixtures() as MatchesData;

      if (translateContent && result.response) {
        for (const match of result.response) {
          // Traduire noms d'équipes
          if (match.teams?.home?.name) {
            const translated = await translateAPI.translateToArabic(match.teams.home.name);
            (match.teams.home as TranslatedTeam).nameTranslated = { arabic: translated };
          }
          if (match.teams?.away?.name) {
            const translated = await translateAPI.translateToArabic(match.teams.away.name);
            (match.teams.away as TranslatedTeam).nameTranslated = { arabic: translated };
          }

          // Traduire nom de ligue
          if (match.league?.name) {
            const translated = await translateAPI.translateToArabic(match.league.name);
            (match.league as TranslatedLeague).nameTranslated = { arabic: translated };
          }
        }
      }

      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [translateContent]);

  useEffect(() => {
    fetchData();
    let interval: NodeJS.Timeout;
    if (refreshInterval > 0) {
      interval = setInterval(fetchData, refreshInterval);
    }
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    lastUpdated
  };
};

// Hook pour les matchs du jour
export const useTodayMatches = ({ translateContent = false, refreshInterval = 0 }: {
  translateContent?: boolean;
  refreshInterval?: number;
}) => {
  const [data, setData] = useState<MatchesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await footballAPI.getTodayFixtures() as MatchesData;

      if (translateContent && result.response) {
        for (const match of result.response) {
          // Traduire noms d'équipes
          if (match.teams?.home?.name) {
            const translated = await translateAPI.translateToArabic(match.teams.home.name);
            (match.teams.home as TranslatedTeam).nameTranslated = { arabic: translated };
          }
          if (match.teams?.away?.name) {
            const translated = await translateAPI.translateToArabic(match.teams.away.name);
            (match.teams.away as TranslatedTeam).nameTranslated = { arabic: translated };
          }

          // Traduire nom de ligue
          if (match.league?.name) {
            const translated = await translateAPI.translateToArabic(match.league.name);
            (match.league as TranslatedLeague).nameTranslated = { arabic: translated };
          }
        }
      }

      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [translateContent]);

  useEffect(() => {
    fetchData();
    let interval: NodeJS.Timeout;
    if (refreshInterval > 0) {
      interval = setInterval(fetchData, refreshInterval);
    }
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    lastUpdated
  };
};

// Hook pour les matchs par date et championnat
export const useMatchesByDateAndLeague = ({ 
  date, 
  leagueIds = [], 
  translateContent = false, 
  refreshInterval = 0 
}: {
  date?: string;
  leagueIds?: number[];
  translateContent?: boolean;
  refreshInterval?: number;
}) => {
  const [data, setData] = useState<MatchesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!date) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Si aucune ligue n'est sélectionnée, on utilise toutes les ligues par défaut
      const leagueIdsToUse = leagueIds.length > 0 ? leagueIds : [];
      const result = await footballAPI.getFixturesByDate(date, leagueIdsToUse) as MatchesData;

      if (translateContent && result.response) {
        for (const match of result.response) {
          // Traduire noms d'équipes
          if (match.teams?.home?.name) {
            const translated = await translateAPI.translateToArabic(match.teams.home.name);
            (match.teams.home as TranslatedTeam).nameTranslated = { arabic: translated };
          }
          if (match.teams?.away?.name) {
            const translated = await translateAPI.translateToArabic(match.teams.away.name);
            (match.teams.away as TranslatedTeam).nameTranslated = { arabic: translated };
          }

          // Traduire nom de ligue
          if (match.league?.name) {
            const translated = await translateAPI.translateToArabic(match.league.name);
            (match.league as TranslatedLeague).nameTranslated = { arabic: translated };
          }
        }
      }

      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching matches by date and league:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [date, leagueIds, translateContent]);

  useEffect(() => {
    fetchData();
    let interval: NodeJS.Timeout;
    if (refreshInterval > 0) {
      interval = setInterval(fetchData, refreshInterval);
    }
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    lastUpdated
  };
};

// Hook pour les classements
export const useStandings = ({ leagueId, season, translateContent = false }: { 
  leagueId: number; 
  season?: number; 
  translateContent?: boolean;
}) => {
  const [data, setData] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await footballAPI.getLeagueStandings(leagueId, season) as StandingsData;

      if (translateContent && result.response) {
        for (const leagueData of result.response) {
          if (leagueData.league?.standings?.[0]) {
            for (const standing of leagueData.league.standings[0]) {
              if (standing.team?.name) {
                const translated = await translateAPI.translateToArabic(standing.team.name);
                (standing.team as TranslatedTeam).nameTranslated = { arabic: translated };
              }
            }
          }
        }
      }

      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [leagueId, season, translateContent]);

  useEffect(() => {
    if (leagueId) {
      fetchData();
    }
  }, [leagueId, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    lastUpdated
  };
};

// Hook pour les transferts
export const useTransfers = ({ teamId, translateContent = false }: { 
  teamId?: number; 
  translateContent?: boolean;
}) => {
  const [data, setData] = useState<TransfersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await footballAPI.getRecentTransfers(teamId) as TransfersData;

      if (translateContent && result.response) {
        for (const transfer of result.response) {
          // Traduire nom du joueur
          if (transfer.player?.name) {
            const translated = await translateAPI.translateToArabic(transfer.player.name);
            transfer.player.nameTranslated = { arabic: translated };
          }

          // Traduire noms des équipes
          if (transfer.teams?.in?.name) {
            const translated = await translateAPI.translateToArabic(transfer.teams.in.name);
            (transfer.teams.in as TranslatedTeam).nameTranslated = { arabic: translated };
          }
          if (transfer.teams?.out?.name) {
            const translated = await translateAPI.translateToArabic(transfer.teams.out.name);
            (transfer.teams.out as TranslatedTeam).nameTranslated = { arabic: translated };
          }
        }
      }

      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [teamId, translateContent]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    lastUpdated
  };
};

// Hook générique pour l'API Football
export const useFootballAPI = ({ 
  endpoint, 
  params, 
  translateContent = false, 
  refreshInterval = 0 
}: {
  endpoint: string;
  params?: Record<string, unknown>;
  translateContent?: boolean;
  refreshInterval?: number;
}) => {
  const [data, setData] = useState<MatchesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (endpoint === 'fixtures' && params?.date) {
        result = await footballAPI.getFixturesByDate(params.date as string, params.leagueIds || []);
      } else if (endpoint === 'fixtures/live') {
        result = await footballAPI.getLiveFixtures();
      } else if (endpoint === 'fixtures') {
        // Always provide a date parameter to avoid API errors
        const today = new Date().toISOString().split('T')[0];
        result = await footballAPI.getFixturesByDate(today, params?.leagueIds || []);
      } else {
        throw new Error(`Endpoint not supported: ${endpoint}`);
      }

      if (translateContent && result.response) {
        for (const match of result.response) {
          // Traduire noms d'équipes
          if (match.teams?.home?.name) {
            const translated = await translateAPI.translateToArabic(match.teams.home.name);
            (match.teams.home as TranslatedTeam).nameTranslated = { arabic: translated };
          }
          if (match.teams?.away?.name) {
            const translated = await translateAPI.translateToArabic(match.teams.away.name);
            (match.teams.away as TranslatedTeam).nameTranslated = { arabic: translated };
          }

          // Traduire nom de ligue
          if (match.league?.name) {
            const translated = await translateAPI.translateToArabic(match.league.name);
            (match.league as TranslatedLeague).nameTranslated = { arabic: translated };
          }
        }
      }

      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, translateContent]);

  useEffect(() => {
    fetchData();
    let interval: NodeJS.Timeout;
    if (refreshInterval > 0) {
      interval = setInterval(fetchData, refreshInterval);
    }
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    lastUpdated
  };
};

// Hook générique pour les ligues disponibles
export const useLeagues = () => {
  const [data, setData] = useState<LeaguesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await footballAPI.getAvailableLeagues() as LeaguesData;
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    lastUpdated
  };
};
