import { useQuery } from '@tanstack/react-query';
import { footballAPI, MAIN_LEAGUES } from '@/config/api';
import type { Standing } from '@/config/api';

interface StandingsResponse {
  response: Array<{
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      flag: string;
      season: number;
      standings: Standing[][];
    };
  }>;
}

export interface LeagueStanding {
  leagueId: number;
  leagueName: string;
  leagueLogo: string;
  country: string;
  flag: string;
  season: number;
  standings: Standing[];
  loading: boolean;
  error: string | null;
}

// Hook pour récupérer le classement d'une ligue spécifique
export const useLeagueStandings = (leagueId: number, season: number = new Date().getFullYear()) => {
  return useQuery({
    queryKey: ['standings', leagueId, season],
    queryFn: async () => {
      try {
        const data = await footballAPI.getLeagueStandings(leagueId, season) as StandingsResponse;
        return data;
      } catch (error) {
        console.error(`Erreur lors de la récupération du classement pour la ligue ${leagueId}:`, error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });
};

// Hook pour récupérer les classements de toutes les ligues principales

export const useAllLeagueStandings = (season: number = new Date().getFullYear()) => {
  // Ajouter ici toutes les ligues à afficher avec leur logo correct
  const leagueConfigs = [
    {
      id: MAIN_LEAGUES.PREMIER_LEAGUE,
      name: 'Premier League',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      country: 'England',
      flag: '🏴',
    },
    {
      id: MAIN_LEAGUES.LA_LIGA,
      name: 'La Liga',
      logo: 'https://media.api-sports.io/football/leagues/140.png',
      country: 'Spain',
      flag: '🇪🇸',
    },
    {
      id: MAIN_LEAGUES.SERIE_A,
      name: 'Serie A',
      logo: 'https://media.api-sports.io/football/leagues/135.png',
      country: 'Italy',
      flag: '🇮🇹',
    },
    {
      id: MAIN_LEAGUES.BUNDESLIGA,
      name: 'Bundesliga',
      logo: 'https://media.api-sports.io/football/leagues/78.png',
      country: 'Germany',
      flag: '🇩🇪',
    },
    {
      id: MAIN_LEAGUES.LIGUE_1,
      name: 'Ligue 1',
      logo: 'https://media.api-sports.io/football/leagues/61.png',
      country: 'France',
      flag: '🇫🇷',
    },
    {
      id: MAIN_LEAGUES.BOTOLA_MAROC,
      name: 'Botola Pro',
      logo: 'https://media.api-sports.io/football/leagues/200.png',
      country: 'Morocco',
      flag: '🇲🇦',
    },
    {
      id: 307,
      name: 'Saudi Pro League',
      logo: 'https://media.api-sports.io/football/leagues/307.png',
      country: 'Saudi Arabia',
      flag: '🇸🇦',
    },
    {
      id: 677,
      name: 'QSL Cup',
      logo: 'https://media.api-sports.io/football/leagues/677.png',
      country: 'Qatar',
      flag: '🇶🇦',
    },
    {
      id: 186,
      name: 'Algeria Ligue 1',
      logo: 'https://media.api-sports.io/football/leagues/186.png',
      country: 'Algeria',
      flag: '🇩�',
    },
    {
      id: MAIN_LEAGUES.EUROPA_LEAGUE,
      name: 'Europa League',
      logo: 'https://media.api-sports.io/football/leagues/3.png',
      country: 'Europe',
      flag: '🇪�',
    },
    {
      id: 12,
      name: 'CAF Champions League',
      logo: 'https://media.api-sports.io/football/leagues/12.png',
      country: 'Africa',
      flag: '�',
    },
    {
      id: 20,
      name: 'CAF Confederation Cup',
      logo: 'https://media.api-sports.io/football/leagues/20.png',
      country: 'Africa',
      flag: '�',
    },
    {
      id: 233,
      name: 'Egyptian Premier League',
      logo: 'https://media.api-sports.io/football/leagues/233.png',
      country: 'Egypt',
      flag: '��',
    },
    {
      id: MAIN_LEAGUES.CHAMPIONS_LEAGUE,
      name: 'Champions League',
      logo: 'https://media.api-sports.io/football/leagues/2.png',
      country: 'Europe',
      flag: '🇪🇺',
    },
  ];

  const queries = leagueConfigs.map(l => useLeagueStandings(l.id, season));


  // Combiner tous les résultats avec les configs
  const standingsData: LeagueStanding[] = queries.map((query, index) => {
    const config = leagueConfigs[index];
    let standings: Standing[] = [];
    const responseData = query.data as StandingsResponse | undefined;
    if (responseData?.response?.[0]?.league?.standings?.[0]) {
      standings = responseData.response[0].league.standings[0];
    }
    return {
      leagueId: config.id,
      leagueName: config.name,
      leagueLogo: config.logo,
      country: config.country,
      flag: config.flag,
      season,
      standings,
      loading: query.isLoading,
      error: query.error ? (query.error as Error).message : null
    };
  });

  return {
    leagues: standingsData,
    isLoading: queries.some(q => q.isLoading),
    hasError: queries.some(q => q.error),
    refetchAll: () => queries.forEach(q => q.refetch())
  };
};

// Hook pour obtenir des données mock de classement en cas d'erreur API
export const useMockStandings = (leagueId: number) => {
  const generateMockStandings = (): Standing[] => {
    const teams = {
      [MAIN_LEAGUES.PREMIER_LEAGUE]: [
        { name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' },
        { name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
        { name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' },
        { name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' },
        { name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' },
        { name: 'Tottenham', logo: 'https://media.api-sports.io/football/teams/47.png' },
        { name: 'Newcastle', logo: 'https://media.api-sports.io/football/teams/34.png' },
        { name: 'Brighton', logo: 'https://media.api-sports.io/football/teams/51.png' },
        { name: 'West Ham', logo: 'https://media.api-sports.io/football/teams/48.png' },
        { name: 'Aston Villa', logo: 'https://media.api-sports.io/football/teams/66.png' }
      ],
      [MAIN_LEAGUES.LA_LIGA]: [
        { name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png' },
        { name: 'Barcelona', logo: 'https://media.api-sports.io/football/teams/529.png' },
        { name: 'Atletico Madrid', logo: 'https://media.api-sports.io/football/teams/530.png' },
        { name: 'Real Sociedad', logo: 'https://media.api-sports.io/football/teams/548.png' },
        { name: 'Villarreal', logo: 'https://media.api-sports.io/football/teams/533.png' },
        { name: 'Sevilla', logo: 'https://media.api-sports.io/football/teams/536.png' },
        { name: 'Real Betis', logo: 'https://media.api-sports.io/football/teams/543.png' },
        { name: 'Valencia', logo: 'https://media.api-sports.io/football/teams/532.png' }
      ],
      [MAIN_LEAGUES.SERIE_A]: [
        { name: 'Juventus', logo: 'https://media.api-sports.io/football/teams/496.png' },
        { name: 'Inter Milan', logo: 'https://media.api-sports.io/football/teams/505.png' },
        { name: 'AC Milan', logo: 'https://media.api-sports.io/football/teams/489.png' },
        { name: 'Napoli', logo: 'https://media.api-sports.io/football/teams/492.png' },
        { name: 'Roma', logo: 'https://media.api-sports.io/football/teams/497.png' },
        { name: 'Lazio', logo: 'https://media.api-sports.io/football/teams/487.png' },
        { name: 'Atalanta', logo: 'https://media.api-sports.io/football/teams/499.png' },
        { name: 'Fiorentina', logo: 'https://media.api-sports.io/football/teams/502.png' }
      ],
      [MAIN_LEAGUES.BUNDESLIGA]: [
        { name: 'Bayern Munich', logo: 'https://media.api-sports.io/football/teams/157.png' },
        { name: 'Borussia Dortmund', logo: 'https://media.api-sports.io/football/teams/165.png' },
        { name: 'RB Leipzig', logo: 'https://media.api-sports.io/football/teams/173.png' },
        { name: 'Bayer Leverkusen', logo: 'https://media.api-sports.io/football/teams/168.png' },
        { name: 'Eintracht Frankfurt', logo: 'https://media.api-sports.io/football/teams/169.png' },
        { name: 'Borussia Monchengladbach', logo: 'https://media.api-sports.io/football/teams/163.png' }
      ],
      [MAIN_LEAGUES.LIGUE_1]: [
        { name: 'Paris Saint-Germain', logo: 'https://media.api-sports.io/football/teams/85.png' },
        { name: 'Marseille', logo: 'https://media.api-sports.io/football/teams/79.png' },
        { name: 'Lyon', logo: 'https://media.api-sports.io/football/teams/80.png' },
        { name: 'Monaco', logo: 'https://media.api-sports.io/football/teams/91.png' },
        { name: 'Lille', logo: 'https://media.api-sports.io/football/teams/94.png' },
        { name: 'Nice', logo: 'https://media.api-sports.io/football/teams/81.png' },
        { name: 'Rennes', logo: 'https://media.api-sports.io/football/teams/84.png' }
      ]
    };

    const leagueTeams = teams[leagueId as keyof typeof teams] || teams[MAIN_LEAGUES.PREMIER_LEAGUE];
    
    return leagueTeams.map((team, index) => {
      let status = 'Same';
      if (index < 4) {
        status = 'Champions League';
      } else if (index < 6) {
        status = 'Europa League';
      }

      return {
        rank: index + 1,
        team: {
          id: index + 1,
          name: team.name,
          logo: team.logo
        },
        points: Math.max(10, 80 - (index * 5) + Math.floor(Math.random() * 10)),
        goalsDiff: Math.max(-10, 25 - (index * 3) + Math.floor(Math.random() * 10)),
        group: 'Regular Season',
        form: 'WWDLW',
        status,
        description: index < 4 ? 'Promotion - Champions League (Group Stage)' : '',
        all: {
          played: 20 + Math.floor(Math.random() * 5),
          win: Math.max(0, 15 - index + Math.floor(Math.random() * 3)),
          draw: Math.floor(Math.random() * 5),
          lose: Math.max(0, index + Math.floor(Math.random() * 3)),
          goals: {
            for: Math.max(10, 50 - (index * 3) + Math.floor(Math.random() * 15)),
            against: Math.max(5, 20 + (index * 2) + Math.floor(Math.random() * 10))
          }
        },
        home: {
          played: 10 + Math.floor(Math.random() * 3),
          win: Math.max(0, 8 - Math.floor(index / 2)),
          draw: Math.floor(Math.random() * 3),
          lose: Math.max(0, Math.floor(index / 2)),
          goals: {
            for: Math.max(5, 25 - index + Math.floor(Math.random() * 8)),
            against: Math.max(2, 10 + index + Math.floor(Math.random() * 5))
          }
        },
        away: {
          played: 10 + Math.floor(Math.random() * 3),
          win: Math.max(0, 7 - Math.floor(index / 2)),
          draw: Math.floor(Math.random() * 3),
          lose: Math.max(0, Math.floor(index / 2)),
          goals: {
            for: Math.max(5, 25 - index + Math.floor(Math.random() * 8)),
            against: Math.max(2, 10 + index + Math.floor(Math.random() * 5))
          }
        }
      };
    });
  };

  return {
    standings: generateMockStandings(),
    isLoading: false,
    error: null
  };
};
