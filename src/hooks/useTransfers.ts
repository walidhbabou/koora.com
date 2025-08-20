// IDs des grandes équipes (exemple, à adapter selon la base API)
const MAIN_TEAMS_IDS = [33, 34, 50, 40, 42, 85, 86, 65, 66, 529]; // Real, Barca, PSG, Bayern, etc.

export interface TransferEnriched extends Transfer {
  update?: string;
}

export const useMainTeamsTransfers = (season?: number): UseTransfersResult => {
  const [data, setData] = useState<{ response: TransferEnriched[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransfers = useCallback(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        let allTransfers: TransferEnriched[] = [];
        for (const teamId of MAIN_TEAMS_IDS) {
          const apiResult = await footballAPI.getRecentTransfers(teamId, season);
          if (Array.isArray(apiResult?.response)) {
            const teamTransfers = (apiResult.response as Array<{ player: Transfer['player']; update?: string; transfers: Transfer[] }>)
              .flatMap(playerObj =>
                Array.isArray(playerObj.transfers)
                  ? playerObj.transfers.map(tr => ({
                      ...tr,
                      player: playerObj.player,
                      update: playerObj.update,
                    }))
                  : []
              );
            allTransfers = allTransfers.concat(teamTransfers);
          }
        }
        setData({ response: allTransfers });
      } catch (err) {
        console.error('Erreur lors de la récupération des transferts des grandes équipes:', err);
        setError('Erreur lors du chargement des transferts');
        setData({ response: [] });
      } finally {
        setLoading(false);
      }
    })();
  }, [season]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchTransfers(),
  };
};
import { useState, useEffect, useCallback } from 'react';
import { footballAPI, Transfer } from '@/config/api';

interface UseTransfersOptions {
  teamId?: number;
  season?: number;
  refreshInterval?: number;
  translateContent?: boolean;
}

interface UseTransfersResult {
  data: { response: Transfer[] } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTransfers = (options: UseTransfersOptions = {}): UseTransfersResult => {
  const { teamId, season, refreshInterval = 0, translateContent = false } = options;
  const [data, setData] = useState<{ response: Transfer[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let apiResult;
      if (teamId) {
        apiResult = await footballAPI.getRecentTransfers(teamId, season);
      } else {
        apiResult = await footballAPI.getAllRecentTransfers(season);
      }
      // Parser la réponse API pour extraire tous les transferts
      let flattened: Transfer[] = [];
      if (Array.isArray(apiResult?.response)) {
        (apiResult.response as any[]).forEach((playerObj: any) => {
          if (Array.isArray(playerObj?.transfers)) {
            playerObj.transfers.forEach((transfer: any) => {
              flattened.push({
                ...transfer,
                player: playerObj.player,
              });
            });
          }
        });
      }
      setData({ response: flattened });
    } catch (err) {
      console.error('Erreur lors de la récupération des transferts:', err);
      setError('Erreur lors du chargement des transferts');
      setData({ response: [] });
    } finally {
      setLoading(false);
    }
  }, [teamId, season]);

  useEffect(() => {
    fetchTransfers();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchTransfers, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchTransfers, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchTransfers
  };
};

export const useMainLeaguesTransfers = (season?: number): UseTransfersResult => {
  const [data, setData] = useState<{ response: TransferEnriched[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try direct league-based transfers first (may be unsupported on some plans)
      let result: any = await footballAPI.getMainLeaguesTransfers(season);
      // Fallback: aggregate per-team transfers for selected leagues
      if (!result || !Array.isArray(result.response) || result.response.length === 0) {
        result = await footballAPI.getLeagueTeamsTransfers(season ?? new Date().getFullYear());
      }
      // result.response is an array of player objects with transfers arrays
      let allTransfers: TransferEnriched[] = [];
      if (Array.isArray((result as any)?.response)) {
        (result as any).response.forEach((playerObj: any) => {
          if (Array.isArray(playerObj?.transfers)) {
            playerObj.transfers.forEach((transfer: any) => {
              const enriched: TransferEnriched = {
                ...transfer,
                player: playerObj.player,
                update: playerObj.update,
              };
              allTransfers.push(enriched);
            });
          }
        });
      }

      setData({ response: allTransfers });
    } catch (err) {
      console.error('Erreur lors de la récupération des transferts des principales ligues:', err);
      setError('Erreur lors du chargement des transferts');
      setData({ response: [] });
    } finally {
      setLoading(false);
    }
  }, [season]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  return {
    data,
    loading,
    error,
    refetch: fetchTransfers
  };
};

export const useTransfersByDate = (date: string): UseTransfersResult => {
  const [data, setData] = useState<{ response: Transfer[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await footballAPI.getTransfersByDate(date);
      setData(result as { response: Transfer[] });
    } catch (err) {
      console.error('Erreur lors de la récupération des transferts par date:', err);
      setError('Erreur lors du chargement des transferts');
      setData({ response: [] });
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (date) {
      fetchTransfers();
    }
  }, [date, fetchTransfers]);

  return {
    data,
    loading,
    error,
    refetch: fetchTransfers
  };
};
