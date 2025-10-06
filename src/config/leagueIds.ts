// IDs des ligues pour l'application Koora
// Ces IDs correspondent aux IDs de l'API Football

// Ligues européennes principales
export const EUROPEAN_LEAGUES = {
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  BUNDESLIGA: 78,
  SERIE_A: 135,
  LIGUE_1: 61,
  EREDIVISIE: 88,
  PRIMEIRA_LIGA: 94
} as const;

// Compétitions européennes
export const EUROPEAN_COMPETITIONS = {
  CHAMPIONS_LEAGUE: 2,
  EUROPA_LEAGUE: 3,
  CONFERENCE_LEAGUE: 848
} as const;

// Compétitions africaines
export const AFRICAN_COMPETITIONS = {
  CAF_CHAMPIONS_LEAGUE: 12,
  CAF_CONFEDERATION_CUP: 20
} as const;

// Ligues africaines et arabes
export const AFRICAN_ARAB_LEAGUES = {
  EGYPTIAN_PREMIER_LEAGUE: 233,
  BOTOLA_MAROC: 200,
  BOTOLA_2: 201,
  ALGERIA_LIGUE_1: 186,
  SAUDI_PRO_LEAGUE: 307,
  EGYPTIAN_SECOND_LEAGUE: 887
} as const;

// Coupes nationales - Maroc
export const MOROCCO_CUPS = {
  MOROCCO_CUP: 822
} as const;

// Coupes nationales - Égypte
export const EGYPT_CUPS = {
  EGYPT_SUPER_CUP: 539,
  EGYPT_CUP: 714,
  EGYPT_LEAGUE_CUP: 895
} as const;

// Coupes nationales - Arabie Saoudite
export const SAUDI_CUPS = {
  KINGS_CUP: 504,
  SUPER_CUP: 826
} as const;

// Ligues et coupes - Qatar
export const QATAR_COMPETITIONS = {
  QSL_CUP: 677,
  DIVISION_1: 308,
  EMIR_CUP: 824
} as const;

// Autres ligues africaines
export const OTHER_AFRICAN_LEAGUES = {
  LIBYA_PREMIER_LEAGUE: 584
} as const;

// Compétitions internationales - Qualifications
export const INTERNATIONAL_QUALIFICATIONS = {
  WORLD_CUP_QUALIFICATION_EUROPE: 32,
  WORLD_CUP_QUALIFICATION_AFRICA: 29,
  AFRICA_CUP_QUALIFICATION: 36
} as const;

// Compétitions internationales - Tournois
export const INTERNATIONAL_TOURNAMENTS = {
  AFRICA_CUP_OF_NATIONS: 6,
  FRIENDLIES: 10
} as const;

// Export de tous les IDs organisés par catégorie
export const LEAGUE_IDS = {
  ...EUROPEAN_LEAGUES,
  ...EUROPEAN_COMPETITIONS,
  ...AFRICAN_COMPETITIONS,
  ...AFRICAN_ARAB_LEAGUES,
  ...OTHER_AFRICAN_LEAGUES,
  ...MOROCCO_CUPS,
  ...EGYPT_CUPS,
  ...SAUDI_CUPS,
  ...QATAR_COMPETITIONS,
  ...INTERNATIONAL_QUALIFICATIONS,
  ...INTERNATIONAL_TOURNAMENTS
} as const;

// Type pour les IDs de ligues
export type LeagueId = typeof LEAGUE_IDS[keyof typeof LEAGUE_IDS];

// Fonction utilitaire pour vérifier si un ID est valide
export const isValidLeagueId = (id: number): id is LeagueId => {
  return Object.values(LEAGUE_IDS).includes(id as LeagueId);
};

// Groupes de ligues pour différents usages
export const LEAGUE_GROUPS = {
  // Ligues avec classements réguliers
  STANDINGS_AVAILABLE: [
    LEAGUE_IDS.PREMIER_LEAGUE,
    LEAGUE_IDS.LA_LIGA,
    LEAGUE_IDS.BUNDESLIGA,
    LEAGUE_IDS.SERIE_A,
    LEAGUE_IDS.LIGUE_1,
    LEAGUE_IDS.EREDIVISIE,
    LEAGUE_IDS.PRIMEIRA_LIGA,
    LEAGUE_IDS.EGYPTIAN_PREMIER_LEAGUE,
    LEAGUE_IDS.BOTOLA_MAROC,
    LEAGUE_IDS.ALGERIA_LIGUE_1,
    LEAGUE_IDS.SAUDI_PRO_LEAGUE,
    LEAGUE_IDS.LIBYA_PREMIER_LEAGUE
  ],
  
  // Compétitions à élimination directe (pas de classements)
  CUP_COMPETITIONS: [
    LEAGUE_IDS.CHAMPIONS_LEAGUE,
    LEAGUE_IDS.EUROPA_LEAGUE,
    LEAGUE_IDS.CONFERENCE_LEAGUE,
    LEAGUE_IDS.CAF_CHAMPIONS_LEAGUE,
    LEAGUE_IDS.CAF_CONFEDERATION_CUP,
    LEAGUE_IDS.MOROCCO_CUP,
    LEAGUE_IDS.EGYPT_CUP,
    LEAGUE_IDS.EGYPT_LEAGUE_CUP,
    LEAGUE_IDS.KINGS_CUP,
    LEAGUE_IDS.QSL_CUP,
    LEAGUE_IDS.EMIR_CUP,
    LEAGUE_IDS.AFRICA_CUP_OF_NATIONS
  ],
  
  // Qualifications (pas de classements traditionnels)
  QUALIFICATION_COMPETITIONS: [
    LEAGUE_IDS.WORLD_CUP_QUALIFICATION_EUROPE,
    LEAGUE_IDS.WORLD_CUP_QUALIFICATION_AFRICA,
    LEAGUE_IDS.AFRICA_CUP_QUALIFICATION
  ],
  
  // Matchs amicaux et autres
  FRIENDLY_COMPETITIONS: [
    LEAGUE_IDS.FRIENDLIES
  ],
  
  // Ligues principales pour la page d'accueil
  FEATURED_LEAGUES: [
    LEAGUE_IDS.PREMIER_LEAGUE,
    LEAGUE_IDS.LA_LIGA,
    LEAGUE_IDS.CHAMPIONS_LEAGUE,
    LEAGUE_IDS.BOTOLA_MAROC,
    LEAGUE_IDS.EGYPTIAN_PREMIER_LEAGUE,
    LEAGUE_IDS.SAUDI_PRO_LEAGUE
  ]
} as const;