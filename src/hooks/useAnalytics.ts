import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/googleAnalytics';

// Hook pour suivre automatiquement les changements de route
export const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Suivre automatiquement les changements de page
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);
};

// Hook pour suivre des événements personnalisés
export const useAnalyticsEvents = () => {
  return {
    trackEvent: (eventName: string, parameters?: Record<string, unknown>) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, parameters);
      }
    }
  };
};