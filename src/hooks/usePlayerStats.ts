import { useQuery } from '@tanstack/react-query';
import { footballAPI, MAIN_LEAGUES } from '@/config/api';

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
      yellowred: number;
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

interface PlayersResponse {
  response: PlayerStatistic[];
}

// Hook pour récupérer les statistiques des joueurs d'une ligue
export const usePlayerStats = (
  leagueId: number, 
  season: number = new Date().getFullYear(),
  statType: 'topscorers' | 'topassists' | 'topyellowcards' | 'topredcards' = 'topscorers'
) => {
  return useQuery({
    queryKey: ['playerStats', leagueId, season, statType],
    queryFn: async () => {
      try {
        const data = await footballAPI.getPlayerStats(leagueId, season, statType) as PlayersResponse;
        return data;
      } catch (error) {
        console.error(`Erreur lors de la récupération des stats des joueurs pour la ligue ${leagueId}:`, error);
        // Retourner des données mock en cas d'erreur
        return generateMockPlayerStats(leagueId, statType);
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });
};

// Hook pour récupérer toutes les statistiques des joueurs pour toutes les ligues principales
export const useAllLeaguePlayerStats = (season: number = new Date().getFullYear()) => {
  const premierLeagueGoals = usePlayerStats(MAIN_LEAGUES.PREMIER_LEAGUE, season, 'topscorers');
  const premierLeagueAssists = usePlayerStats(MAIN_LEAGUES.PREMIER_LEAGUE, season, 'topassists');
  const laLigaGoals = usePlayerStats(MAIN_LEAGUES.LA_LIGA, season, 'topscorers');
  const laLigaAssists = usePlayerStats(MAIN_LEAGUES.LA_LIGA, season, 'topassists');
  const serieAGoals = usePlayerStats(MAIN_LEAGUES.SERIE_A, season, 'topscorers');
  const serieAAssists = usePlayerStats(MAIN_LEAGUES.SERIE_A, season, 'topassists');

  return {
    premierLeague: {
      goals: premierLeagueGoals,
      assists: premierLeagueAssists
    },
    laLiga: {
      goals: laLigaGoals,
      assists: laLigaAssists
    },
    serieA: {
      goals: serieAGoals,
      assists: serieAAssists
    },
    isLoading: premierLeagueGoals.isLoading || premierLeagueAssists.isLoading || 
               laLigaGoals.isLoading || laLigaAssists.isLoading ||
               serieAGoals.isLoading || serieAAssists.isLoading,
    hasError: premierLeagueGoals.error || premierLeagueAssists.error ||
              laLigaGoals.error || laLigaAssists.error ||
              serieAGoals.error || serieAAssists.error
  };
};

// Fonction pour générer des données mock de statistiques des joueurs
function generateMockPlayerStats(leagueId: number, statType: string): PlayersResponse {
  const mockPlayers = {
    [MAIN_LEAGUES.PREMIER_LEAGUE]: [
      {
        name: 'Erling Haaland',
        team: 'Manchester City',
        photo: 'https://media.api-sports.io/football/players/1100.png',
        teamLogo: 'https://media.api-sports.io/football/teams/50.png'
      },
      {
        name: 'Harry Kane',
        team: 'Tottenham',
        photo: 'https://media.api-sports.io/football/players/184.png',
        teamLogo: 'https://media.api-sports.io/football/teams/47.png'
      },
      {
        name: 'Mohamed Salah',
        team: 'Liverpool',
        photo: 'https://media.api-sports.io/football/players/306.png',
        teamLogo: 'https://media.api-sports.io/football/teams/40.png'
      },
      {
        name: 'Kevin De Bruyne',
        team: 'Manchester City',
        photo: 'https://media.api-sports.io/football/players/629.png',
        teamLogo: 'https://media.api-sports.io/football/teams/50.png'
      },
      {
        name: 'Bruno Fernandes',
        team: 'Manchester United',
        photo: 'https://media.api-sports.io/football/players/881.png',
        teamLogo: 'https://media.api-sports.io/football/teams/33.png'
      },
      {
        name: 'Son Heung-min',
        team: 'Tottenham',
        photo: 'https://media.api-sports.io/football/players/832.png',
        teamLogo: 'https://media.api-sports.io/football/teams/47.png'
      }
    ],
    [MAIN_LEAGUES.LA_LIGA]: [
      {
        name: 'Robert Lewandowski',
        team: 'Barcelona',
        photo: 'https://media.api-sports.io/football/players/9498.png',
        teamLogo: 'https://media.api-sports.io/football/teams/529.png'
      },
      {
        name: 'Karim Benzema',
        team: 'Real Madrid',
        photo: 'https://media.api-sports.io/football/players/650.png',
        teamLogo: 'https://media.api-sports.io/football/teams/541.png'
      },
      {
        name: 'Antoine Griezmann',
        team: 'Atletico Madrid',
        photo: 'https://media.api-sports.io/football/players/748.png',
        teamLogo: 'https://media.api-sports.io/football/teams/530.png'
      }
    ],
    [MAIN_LEAGUES.SERIE_A]: [
      {
        name: 'Ciro Immobile',
        team: 'Lazio',
        photo: 'https://media.api-sports.io/football/players/738.png',
        teamLogo: 'https://media.api-sports.io/football/teams/487.png'
      },
      {
        name: 'Dusan Vlahovic',
        team: 'Juventus',
        photo: 'https://media.api-sports.io/football/players/1486.png',
        teamLogo: 'https://media.api-sports.io/football/teams/496.png'
      }
    ]
  };

  const leaguePlayers = mockPlayers[leagueId as keyof typeof mockPlayers] || mockPlayers[MAIN_LEAGUES.PREMIER_LEAGUE];

  const response: PlayerStatistic[] = leaguePlayers.map((player, index) => {
    let goals, assists, yellowCards, redCards;

    switch (statType) {
      case 'topscorers':
        goals = Math.max(1, 25 - (index * 3) + Math.floor(Math.random() * 5));
        assists = Math.floor(Math.random() * 10);
        yellowCards = Math.floor(Math.random() * 5);
        redCards = Math.floor(Math.random() * 2);
        break;
      case 'topassists':
        goals = Math.floor(Math.random() * 15);
        assists = Math.max(1, 15 - (index * 2) + Math.floor(Math.random() * 3));
        yellowCards = Math.floor(Math.random() * 5);
        redCards = Math.floor(Math.random() * 2);
        break;
      case 'topyellowcards':
        goals = Math.floor(Math.random() * 10);
        assists = Math.floor(Math.random() * 8);
        yellowCards = Math.max(1, 12 - index + Math.floor(Math.random() * 3));
        redCards = Math.floor(Math.random() * 3);
        break;
      default:
        goals = Math.floor(Math.random() * 20);
        assists = Math.floor(Math.random() * 12);
        yellowCards = Math.floor(Math.random() * 8);
        redCards = Math.floor(Math.random() * 2);
    }

    const appearances = 20 + Math.floor(Math.random() * 10);
    const minutes = appearances * 90;

    return {
      player: {
        id: index + 1,
        name: player.name,
        firstname: player.name.split(' ')[0],
        lastname: player.name.split(' ').slice(1).join(' '),
        age: 20 + Math.floor(Math.random() * 15),
        birth: {
          date: '1990-01-01',
          place: 'Unknown',
          country: 'Unknown'
        },
        nationality: 'Unknown',
        height: '180 cm',
        weight: '75 kg',
        injured: false,
        photo: player.photo
      },
      statistics: [{
        team: {
          id: index + 1,
          name: player.team,
          logo: player.teamLogo
        },
        league: {
          id: leagueId,
          name: 'League Name',
          country: 'Country',
          logo: 'https://example.com/league.png',
          flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
          season: new Date().getFullYear()
        },
        games: {
          appearences: appearances,
          lineups: appearances - 2,
          minutes: minutes,
          number: null,
          position: 'Forward',
          rating: '7.5',
          captain: false
        },
        substitutes: {
          in: 2,
          out: 1,
          bench: 5
        },
        shots: {
          total: goals * 4,
          on: goals * 2
        },
        goals: {
          total: goals,
          conceded: 0,
          assists: assists,
          saves: 0
        },
        passes: {
          total: minutes * 2,
          key: assists * 3,
          accuracy: 85
        },
        tackles: {
          total: 50,
          blocks: 10,
          interceptions: 15
        },
        duels: {
          total: 100,
          won: 60
        },
        dribbles: {
          attempts: 50,
          success: 30,
          past: 0
        },
        fouls: {
          drawn: 20,
          committed: 15
        },
        cards: {
          yellow: yellowCards,
          yellowred: 0,
          red: redCards
        },
        penalty: {
          won: 2,
          commited: 1,
          scored: 2,
          missed: 0,
          saved: 0
        }
      }]
    };
  });

  return { response };
}

export { generateMockPlayerStats };
