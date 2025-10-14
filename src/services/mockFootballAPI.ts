// Service mock pour simuler l'API Football pendant le développement
// Permet d'éviter les problèmes CORS et de tester l'interface

export const mockFootballData = {
  // Matchs en direct simulés - seulement les ligues sélectionnées
  liveFixtures: {
    response: [
      {
        fixture: {
          id: 1,
          date: new Date().toISOString(),
          status: {
            short: 'LIVE',
            long: 'Match en cours',
            elapsed: 67
          }
        },
        league: {
          id: 39,
          name: 'Premier League',
          logo: 'https://media-4.api-sports.io/football/leagues/39.png'
        },
        teams: {
          home: {
            id: 33,
            name: 'Manchester United',
            logo: 'https://media-4.api-sports.io/football/teams/33.png'
          },
          away: {
            id: 40,
            name: 'Liverpool',
            logo: 'https://media-4.api-sports.io/football/teams/40.png'
          }
        },
        goals: {
          home: 2,
          away: 1
        }
      },
      {
        fixture: {
          id: 2,
          date: new Date().toISOString(),
          status: {
            short: 'LIVE',
            long: 'Match en cours',
            elapsed: 45
          }
        },
        league: {
          id: 61,
          name: 'Ligue 1',
          logo: 'https://media-4.api-sports.io/football/leagues/61.png'
        },
        teams: {
          home: {
            id: 85,
            name: 'Paris Saint Germain',
            logo: 'https://media-4.api-sports.io/football/teams/85.png'
          },
          away: {
            id: 80,
            name: 'Lyon',
            logo: 'https://media-4.api-sports.io/football/teams/80.png'
          }
        },
        goals: {
          home: 1,
          away: 0
        }
      },
      {
        fixture: {
          id: 3,
          date: new Date().toISOString(),
          status: {
            short: 'LIVE',
            long: 'Match en cours',
            elapsed: 23
          }
        },
        league: {
          id: 200,
          name: 'Botola Pro',
          logo: 'https://media-4.api-sports.io/football/leagues/200.png'
        },
        teams: {
          home: {
            id: 964,
            name: 'Raja Casablanca',
            logo: 'https://media-4.api-sports.io/football/teams/964.png'
          },
          away: {
            id: 965,
            name: 'Wydad Casablanca',
            logo: 'https://media-4.api-sports.io/football/teams/965.png'
          }
        },
        goals: {
          home: 0,
          away: 1
        }
      }
    ]
  },

  // Matchs du jour simulés - seulement les ligues sélectionnées
  todayFixtures: {
    response: [
      {
        fixture: {
          id: 4,
          date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Dans 2 heures
          status: {
            short: 'NS',
            long: 'Non commencé'
          }
        },
        league: {
          id: 39,
          name: 'Premier League',
          logo: 'https://media-4.api-sports.io/football/leagues/39.png'
        },
        teams: {
          home: {
            id: 50,
            name: 'Manchester City',
            logo: 'https://media-4.api-sports.io/football/teams/50.png'
          },
          away: {
            id: 49,
            name: 'Chelsea',
            logo: 'https://media-4.api-sports.io/football/teams/49.png'
          }
        },
        goals: {
          home: null,
          away: null
        }
      },
      {
        fixture: {
          id: 5,
          date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Dans 4 heures
          status: {
            short: 'NS',
            long: 'Non commencé'
          }
        },
        league: {
          id: 78,
          name: 'Bundesliga',
          logo: 'https://media-4.api-sports.io/football/leagues/78.png'
        },
        teams: {
          home: {
            id: 157,
            name: 'Bayern Munich',
            logo: 'https://media-4.api-sports.io/football/teams/157.png'
          },
          away: {
            id: 165,
            name: 'Borussia Dortmund',
            logo: 'https://media-4.api-sports.io/football/teams/165.png'
          }
        },
        goals: {
          home: null,
          away: null
        }
      },
      {
        fixture: {
          id: 6,
          date: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // Dans 6 heures
          status: {
            short: 'NS',
            long: 'Non commencé'
          }
        },
        league: {
          id: 200,
          name: 'Botola Pro',
          logo: 'https://media-4.api-sports.io/football/leagues/200.png'
        },
        teams: {
          home: {
            id: 966,
            name: 'FAR Rabat',
            logo: 'https://media-4.api-sports.io/football/teams/966.png'
          },
          away: {
            id: 967,
            name: 'Renaissance Zemamra',
            logo: 'https://media-4.api-sports.io/football/teams/967.png'
          }
        },
        goals: {
          home: null,
          away: null
        }
      },
      {
        fixture: {
          id: 7,
          date: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // Dans 8 heures
          status: {
            short: 'NS',
            long: 'Non commencé'
          }
        },
        league: {
          id: 61,
          name: 'Ligue 1',
          logo: 'https://media-4.api-sports.io/football/leagues/61.png'
        },
        teams: {
          home: {
            id: 81,
            name: 'Marseille',
            logo: 'https://media-4.api-sports.io/football/teams/81.png'
          },
          away: {
            id: 85,
            name: 'Paris Saint Germain',
            logo: 'https://media-4.api-sports.io/football/teams/85.png'
          }
        },
        goals: {
          home: null,
          away: null
        }
      }
    ]
  },

  // Classements simulés
  standings: {
    response: [
      {
        league: {
          id: 39,
          name: 'Premier League',
          standings: [
            [
              {
                rank: 1,
                team: {
                  id: 50,
                  name: 'Manchester City',
                  logo: 'https://media-4.api-sports.io/football/teams/50.png'
                },
                points: 89,
                goalsDiff: 42,
                all: {
                  played: 38,
                  win: 28,
                  draw: 5,
                  lose: 5,
                  goals: {
                    for: 89,
                    against: 47
                  }
                }
              },
              {
                rank: 2,
                team: {
                  id: 33,
                  name: 'Manchester United',
                  logo: 'https://media-4.api-sports.io/football/teams/33.png'
                },
                points: 75,
                goalsDiff: 15,
                all: {
                  played: 38,
                  win: 23,
                  draw: 6,
                  lose: 9,
                  goals: {
                    for: 73,
                    against: 58
                  }
                }
              },
              {
                rank: 3,
                team: {
                  id: 40,
                  name: 'Liverpool',
                  logo: 'https://media-4.api-sports.io/football/teams/40.png'
                },
                points: 69,
                goalsDiff: 28,
                all: {
                  played: 38,
                  win: 20,
                  draw: 9,
                  lose: 9,
                  goals: {
                    for: 68,
                    against: 40
                  }
                }
              }
            ]
          ]
        }
      }
    ]
  },

  // Transferts simulés
  transfers: {
    response: [
      {
        player: {
          id: 276,
          name: 'Kylian Mbappé',
          photo: 'https://media-4.api-sports.io/football/players/276.png'
        },
        update: '2024-07-01T10:00:00Z',
        transfers: [
          {
            date: '2024-07-01',
            type: 'Free',
            teams: {
              in: {
                id: 541,
                name: 'Real Madrid',
                logo: 'https://media-4.api-sports.io/football/teams/541.png'
              },
              out: {
                id: 85,
                name: 'Paris Saint Germain',
                logo: 'https://media-4.api-sports.io/football/teams/85.png'
              }
            }
          }
        ]
      },
      {
        player: {
          id: 742,
          name: 'Jude Bellingham',
          photo: 'https://media-4.api-sports.io/football/players/742.png'
        },
        update: '2023-06-15T14:30:00Z',
        transfers: [
          {
            date: '2023-06-15',
            type: '€103M',
            teams: {
              in: {
                id: 541,
                name: 'Real Madrid',
                logo: 'https://media-4.api-sports.io/football/teams/541.png'
              },
              out: {
                id: 165,
                name: 'Borussia Dortmund',
                logo: 'https://media-4.api-sports.io/football/teams/165.png'
              }
            }
          }
        ]
      },
      {
        player: {
          id: 1100,
          name: 'Victor Osimhen',
          photo: 'https://media-4.api-sports.io/football/players/1100.png'
        },
        update: '2025-01-10T09:15:00Z',
        transfers: [
          {
            date: '2025-01-10',
            type: 'Loan',
            teams: {
              in: {
                id: 85,
                name: 'Paris Saint Germain',
                logo: 'https://media-4.api-sports.io/football/teams/85.png'
              },
              out: {
                id: 113,
                name: 'Napoli',
                logo: 'https://media-4.api-sports.io/football/teams/113.png'
              }
            }
          }
        ]
      },
      {
        player: {
          id: 154,
          name: 'Harry Kane',
          photo: 'https://media-4.api-sports.io/football/players/154.png'
        },
        update: '2023-08-12T16:45:00Z',
        transfers: [
          {
            date: '2023-08-12',
            type: '€100M',
            teams: {
              in: {
                id: 157,
                name: 'Bayern Munich',
                logo: 'https://media-4.api-sports.io/football/teams/157.png'
              },
              out: {
                id: 47,
                name: 'Tottenham',
                logo: 'https://media-4.api-sports.io/football/teams/47.png'
              }
            }
          }
        ]
      },
      {
        player: {
          id: 890,
          name: 'Pedri',
          photo: 'https://media-4.api-sports.io/football/players/890.png'
        },
        update: '2025-01-08T11:20:00Z',
        transfers: [
          {
            date: '2025-01-08',
            type: '€80M',
            teams: {
              in: {
                id: 50,
                name: 'Manchester City',
                logo: 'https://media-4.api-sports.io/football/teams/50.png'
              },
              out: {
                id: 529,
                name: 'Barcelona',
                logo: 'https://media-4.api-sports.io/football/teams/529.png'
              }
            }
          }
        ]
      },
      {
        player: {
          id: 1205,
          name: 'Achraf Hakimi',
          photo: 'https://media-4.api-sports.io/football/players/1205.png'
        },
        update: '2024-12-20T13:30:00Z',
        transfers: [
          {
            date: '2024-12-20',
            type: '€65M',
            teams: {
              in: {
                id: 541,
                name: 'Real Madrid',
                logo: 'https://media-4.api-sports.io/football/teams/541.png'
              },
              out: {
                id: 85,
                name: 'Paris Saint Germain',
                logo: 'https://media-4.api-sports.io/football/teams/85.png'
              }
            }
          }
        ]
      },
      {
        player: {
          id: 315,
          name: 'Gianluigi Donnarumma',
          photo: 'https://media-4.api-sports.io/football/players/315.png'
        },
        update: '2025-01-05T08:45:00Z',
        transfers: [
          {
            date: '2025-01-05',
            type: 'Loan',
            teams: {
              in: {
                id: 113,
                name: 'Napoli',
                logo: 'https://media-4.api-sports.io/football/teams/113.png'
              },
              out: {
                id: 85,
                name: 'Paris Saint Germain',
                logo: 'https://media-4.api-sports.io/football/teams/85.png'
              }
            }
          }
        ]
      },
      {
        player: {
          id: 2710,
          name: 'Brahim Díaz',
          photo: 'https://media-4.api-sports.io/football/players/2710.png'
        },
        update: '2024-11-15T15:10:00Z',
        transfers: [
          {
            date: '2024-11-15',
            type: '€25M',
            teams: {
              in: {
                id: 529,
                name: 'Barcelona',
                logo: 'https://media-4.api-sports.io/football/teams/529.png'
              },
              out: {
                id: 541,
                name: 'Real Madrid',
                logo: 'https://media-4.api-sports.io/football/teams/541.png'
              }
            }
          }
        ]
      },
      {
        player: {
          id: 1890,
          name: 'Sofyan Amrabat',
          photo: 'https://media-4.api-sports.io/football/players/1890.png'
        },
        update: '2025-01-12T12:00:00Z',
        transfers: [
          {
            date: '2025-01-12',
            type: 'Free',
            teams: {
              in: {
                id: 33,
                name: 'Manchester United',
                logo: 'https://media-4.api-sports.io/football/teams/33.png'
              },
              out: {
                id: 502,
                name: 'Fiorentina',
                logo: 'https://media-4.api-sports.io/football/teams/502.png'
              }
            }
          }
        ]
      },
      {
        player: {
          id: 1456,
          name: 'Youcef Belaïli',
          photo: 'https://media-4.api-sports.io/football/players/1456.png'
        },
        update: '2025-01-14T10:30:00Z',
        transfers: [
          {
            date: '2025-01-14',
            type: '€2M',
            teams: {
              in: {
                id: 964,
                name: 'Raja Casablanca',
                logo: 'https://media-4.api-sports.io/football/teams/964.png'
              },
              out: {
                id: 1563,
                name: 'ES Tunis',
                logo: 'https://media-4.api-sports.io/football/teams/1563.png'
              }
            }
          }
        ]
      },
      {
        player: {
          id: 2890,
          name: 'Neymar Jr',
          photo: 'https://media-4.api-sports.io/football/players/2890.png'
        },
        update: '2024-08-30T17:25:00Z',
        transfers: [
          {
            date: '2024-08-30',
            type: 'Loan',
            teams: {
              in: {
                id: 529,
                name: 'Barcelona',
                logo: 'https://media-4.api-sports.io/football/teams/529.png'
              },
              out: {
                id: 2939,
                name: 'Al Hilal',
                logo: 'https://media-4.api-sports.io/football/teams/2939.png'
              }
            }
          }
        ]
      },
      {
        player: {
          id: 890,
          name: 'Mohamed Salah',
          photo: 'https://media-4.api-sports.io/football/players/890.png'
        },
        update: '2025-01-03T14:15:00Z',
        transfers: [
          {
            date: '2025-01-03',
            type: '€200M',
            teams: {
              in: {
                id: 2939,
                name: 'Al Hilal',
                logo: 'https://media-4.api-sports.io/football/teams/2939.png'
              },
              out: {
                id: 40,
                name: 'Liverpool',
                logo: 'https://media-4.api-sports.io/football/teams/40.png'
              }
            }
          }
        ]
      }
    ]
  },

  // Ligues disponibles
  leagues: {
    response: [
      {
        league: {
          id: 39,
          name: 'Premier League',
          type: 'League',
          logo: 'https://media-4.api-sports.io/football/leagues/39.png'
        },
        country: {
          name: 'England',
          code: 'GB',
          flag: 'https://media-4.api-sports.io/flags/gb.svg'
        }
      },
      {
        league: {
          id: 140,
          name: 'La Liga',
          type: 'League',
          logo: 'https://media-4.api-sports.io/football/leagues/140.png'
        },
        country: {
          name: 'Spain',
          code: 'ES',
          flag: 'https://media-4.api-sports.io/flags/es.svg'
        }
      }
    ]
  }
};

// Service mock qui simule les appels API
export class MockFootballAPI {
  private static instance: MockFootballAPI;
  
  private constructor() {}
  
  public static getInstance(): MockFootballAPI {
    if (!MockFootballAPI.instance) {
      MockFootballAPI.instance = new MockFootballAPI();
    }
    return MockFootballAPI.instance;
  }

  // Simuler un délai de réseau
  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getLiveFixtures() {
    await this.delay();
    return mockFootballData.liveFixtures;
  }

  async getTodayFixtures() {
    await this.delay();
    return mockFootballData.todayFixtures;
  }

  async getLeagueStandings(leagueId: number, season?: number) {
    await this.delay();
    return mockFootballData.standings;
  }

  async getRecentTransfers(teamId?: number) {
    await this.delay();
    return mockFootballData.transfers;
  }

  async getAvailableLeagues() {
    await this.delay();
    return mockFootballData.leagues;
  }

  // Méthodes pour la compatibilité avec l'API réelle
  getUsageStats() {
    return {
      requestCount: 0,
      cacheSize: 0,
      lastRequest: new Date()
    };
  }

  clearCache() {
    // Mock: ne fait rien
  }

  refreshData(endpoint: string) {
    // Mock: ne fait rien
  }
}

export const mockFootballAPI = MockFootballAPI.getInstance();