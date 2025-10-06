import { useState, useEffect } from 'react';
import { footballAPI } from '@/config/api';

interface GroupStanding {
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
}

interface UseGroupStandingsReturn {
  standings: GroupStanding[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useGroupStandings = (leagueId: number, season: number = new Date().getFullYear()): UseGroupStandingsReturn => {
  const [standings, setStandings] = useState<GroupStanding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = async () => {
    if (!leagueId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await footballAPI.getLeagueStandings(leagueId, season);
      
      if (response?.response && response.response.length > 0) {
        // Transformer les données API en format de groupe
        const transformedStandings: GroupStanding[] = [];
        
        response.response.forEach((leagueStanding: any) => {
          if (leagueStanding.league.standings && leagueStanding.league.standings.length > 0) {
            leagueStanding.league.standings.forEach((group: any[], groupIndex: number) => {
              const groupName = `Group ${String.fromCharCode(65 + groupIndex)}`; // A, B, C, etc.
              
              group.forEach((team: any) => {
                transformedStandings.push({
                  rank: team.rank,
                  team: {
                    id: team.team.id,
                    name: team.team.name,
                    logo: team.team.logo
                  },
                  points: team.points,
                  goalsDiff: team.goalsDiff,
                  group: groupName,
                  form: team.form || '',
                  status: team.status || '',
                  description: team.description || '',
                  all: {
                    played: team.all.played,
                    win: team.all.win,
                    draw: team.all.draw,
                    lose: team.all.lose,
                    goals: {
                      for: team.all.goals.for,
                      against: team.all.goals.against
                    }
                  }
                });
              });
            });
          }
        });
        
        setStandings(transformedStandings);
      } else {
        setStandings([]);
      }
    } catch (err) {
      console.error('Error fetching group standings:', err);
      setError('Failed to fetch group standings');
      setStandings([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchStandings();
  };

  useEffect(() => {
    fetchStandings();
  }, [leagueId, season]);

  return {
    standings,
    loading,
    error,
    refetch
  };
};