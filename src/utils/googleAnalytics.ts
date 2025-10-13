// Configuration Google Analytics
export const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Types pour Google Analytics
interface GtagConfig {
  page_path?: string;
  page_title?: string;
  send_page_view?: boolean;
  [key: string]: unknown;
}

interface EventParameters {
  category?: string;
  label?: string;
  value?: number;
  article_id?: string;
  search_term?: string;
  match_id?: string;
  [key: string]: unknown;
}

// Déclaration des types pour gtag
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: GtagConfig | EventParameters) => void;
    dataLayer: unknown[];
  }
}

// Fonction pour envoyer des événements personnalisés
export const trackEvent = (eventName: string, parameters?: EventParameters): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: parameters?.category || 'engagement',
      event_label: parameters?.label,
      value: parameters?.value,
      ...parameters
    });
  }
};

// Fonction pour suivre les pages vues
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
};

// Fonction pour suivre les clics sur les articles
export const trackArticleClick = (articleId: string, articleTitle: string): void => {
  trackEvent('article_click', {
    category: 'engagement',
    label: articleTitle,
    article_id: articleId
  });
};

// Fonction pour suivre les recherches
export const trackSearch = (searchTerm: string): void => {
  trackEvent('search', {
    category: 'engagement',
    label: searchTerm,
    search_term: searchTerm
  });
};

// Fonction pour suivre les clics sur les matchs
export const trackMatchClick = (matchId: string, teams: string): void => {
  trackEvent('match_click', {
    category: 'sports_engagement',
    label: teams,
    match_id: matchId
  });
};

// Fonction pour suivre les interactions avec la navigation
export const trackNavigation = (sectionName: string): void => {
  trackEvent('navigation_click', {
    category: 'navigation',
    label: sectionName
  });
};