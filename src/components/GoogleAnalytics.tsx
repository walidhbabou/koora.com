import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/googleAnalytics';

// Composant principal Google Analytics
const GoogleAnalytics: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Suivre automatiquement les changements de page
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);
  
  return null; // Ce composant n'a pas de rendu visuel
};

export default GoogleAnalytics;