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
              const normalizedDate = transfer?.date || transfer?.update || playerObj.update || null;
              const yearMatch = normalizedDate ? String(normalizedDate).match(/(\d{4})/) : null;
              const year = yearMatch ? parseInt(yearMatch[1], 10) : null;
              flattened.push({
                ...transfer,
                player: playerObj.player,
                normalizedDate,
                year,
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

      // Helper to flatten API response (player-grouped) into enriched transfers
      const flattenResponse = (resp: any): TransferEnriched[] => {
        const out: TransferEnriched[] = [];
        if (Array.isArray(resp?.response)) {
          resp.response.forEach((playerObj: any) => {
            if (Array.isArray(playerObj?.transfers)) {
              playerObj.transfers.forEach((transfer: any) => {
                const normalizedDate = transfer?.date || transfer?.update || playerObj.update || null;
                const yearMatch = normalizedDate ? String(normalizedDate).match(/(\d{4})/) : null;
                const year = yearMatch ? parseInt(yearMatch[1], 10) : null;
                out.push({
                  ...transfer,
                  player: playerObj.player,
                  update: playerObj.update,
                  normalizedDate,
                  year,
                });
              });
            }
          });
        }
        return out;
      };

      const currentYear = new Date().getFullYear();
      const seasonCandidates = Array.from(new Set([
        season,
        season ? season - 1 : undefined,
        season ? season - 2 : undefined,
        currentYear,
        currentYear - 1,
        undefined,
      ])).filter((s) => s === undefined || (typeof s === 'number' && s > 2000));

      let allTransfers: TransferEnriched[] = [];

      // Try multiple approaches over season candidates until we get data
      for (const s of seasonCandidates) {
        // 1) Direct league-based (may be unsupported depending on plan)
        try {
          const resLeague = await footballAPI.getMainLeaguesTransfers(s as number | undefined);
          allTransfers = flattenResponse(resLeague);
        } catch {}
        if (allTransfers.length > 0) break;

        // 2) Aggregate per-team for selected leagues
        try {
          const resTeams = await footballAPI.getLeagueTeamsTransfers(
            (s as number | undefined) ?? currentYear
          );
          allTransfers = flattenResponse(resTeams);
        } catch {}
        if (allTransfers.length > 0) break;

        // 3) Global recent transfers with season
        try {
          const resAll = await footballAPI.getAllRecentTransfers(s as number | undefined);
          allTransfers = flattenResponse(resAll);
        } catch {}
        if (allTransfers.length > 0) break;
      }

      // 4) Last-resort: per-team aggregation without season (broadest)
      if (allTransfers.length === 0) {
        try {
          const resAny = await footballAPI.getLeagueTeamsTransfersAnySeason();
          allTransfers = flattenResponse(resAny);
        } catch (error) {
          // Gestion spécifique des erreurs CORS
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.warn('🚫 CORS Error in transfers API. Using fallback data.');
            // Utiliser des données de fallback ou vides
            allTransfers = [];
          } else {
            console.error('Erreur lors de la récupération des transferts:', error);
          }
        }
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
