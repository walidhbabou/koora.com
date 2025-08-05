// Configuration et constantes de l'application

export const APP_CONFIG = {
  name: 'Koora',
  description: 'Plateforme sportive pour suivre les actualités et résultats',
  version: '1.0.0'
};

// Navigation items - à personnaliser selon vos besoins
export const NAV_ITEMS = [
  // Exemple : { label: 'Accueil', href: '/' },
  // Exemple : { label: 'Actualités', href: '/news' },
  // Exemple : { label: 'Classements', href: '/standings' },
];

// Types de données pour l'application
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  publishedAt: string;
  category: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  time: string;
  status: 'live' | 'upcoming' | 'finished';
  competition: string;
}

// API URLs (à configurer plus tard)
export const API_ENDPOINTS = {
  news: process.env.REACT_APP_NEWS_API || '/api/news',
  matches: process.env.REACT_APP_MATCHES_API || '/api/matches',
  standings: process.env.REACT_APP_STANDINGS_API || '/api/standings',
};

// Thème et couleurs
export const THEME_COLORS = {
  primary: 'var(--sport-green)',
  secondary: 'var(--sport-blue)',
  accent: 'var(--sport-light)',
};
