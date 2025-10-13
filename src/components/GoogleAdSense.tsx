import React, { useEffect, useRef } from 'react';
import { loadAdSenseScript, initializeAdSense, pushAdSenseAd } from '../utils/adsenseLoader';

// Types pour les formats AdSense
export type AdFormat = 
  | 'rectangle' // 300x250
  | 'leaderboard' // 728x90
  | 'banner' // 320x50
  | 'large-rectangle' // 336x280
  | 'mobile-banner' // 320x100
  | 'responsive'
  | 'in-article'
  | 'multiplex';

interface GoogleAdSenseProps {
  client: string; // ca-pub-XXXXXXXXXXXXXXXX
  slot: string; // Slot ID de l'annonce
  format?: AdFormat;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  // Props pour les annonces in-article et multiplex
  layoutKey?: string;
  // Test mode pour le développement
  testMode?: boolean;
}

// Déclaration globale pour AdSense
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adsbygoogle: any[];
  }
}

const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
  client,
  slot,
  format = 'responsive',
  responsive = true,
  style,
  className = '',
  layoutKey,
  testMode = false
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  // Mapping des formats vers les dimensions
  const getAdDimensions = (format: AdFormat) => {
    const dimensions = {
      'rectangle': { width: 300, height: 250 },
      'leaderboard': { width: 728, height: 90 },
      'banner': { width: 320, height: 50 },
      'large-rectangle': { width: 336, height: 280 },
      'mobile-banner': { width: 320, height: 100 },
      'responsive': { width: 'auto', height: 'auto' },
      'in-article': { width: 'auto', height: 'auto' },
      'multiplex': { width: 'auto', height: 'auto' }
    };
    return dimensions[format];
  };

  // Vérifier si les publicités sont désactivées
  const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT;
  const adsenseTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';

  useEffect(() => {
    // Si pas de client ID dans l'env, ne pas charger
    if (!adsenseClient) {
      console.log('🚫 Pas de Client ID AdSense configuré');
      return;
    }

    // En mode test désactivé ET pas de test mode, on n'initialise pas AdSense
    if (!adsenseTestMode && testMode) {
      console.log('🚫 Mode test désactivé et composant en test mode');
      return;
    }
    // En mode test, on n'initialise pas AdSense
    if (testMode) {
      console.log('Mode test activé - Affichage du placeholder');
      return;
    }

    // Ne pas charger les pubs si pas de client ID ou slot
    if (!client || !slot) {
      console.warn('Client ID ou Slot manquant:', { client, slot });
      return;
    }

    // Charger le script AdSense et initialiser
    const loadAndInitialize = async () => {
      try {
        await loadAdSenseScript();
        initializeAdSense();
        
        // Petit délai pour s'assurer que tout est prêt
        setTimeout(() => {
          pushAdSenseAd();
        }, 100);
      } catch (error) {
        console.warn('Erreur lors du chargement de la publicité AdSense:', error);
      }
    };

    loadAndInitialize();
  }, [client, slot, testMode, adsenseClient, adsenseTestMode]);

  const dimensions = getAdDimensions(format);

  // Si pas de client ID dans l'env, ne pas afficher
  if (!adsenseClient) {
    console.log('🚫 Pas de Client ID AdSense configuré');
    return null;
  }

  // Afficher les publicités si le mode test est activé OU si on a un vrai client/slot
  const shouldShowAd = adsenseTestMode || (client && slot);
  
  if (!shouldShowAd) {
    console.log('🚫 Publicités non autorisées:', { adsenseTestMode, client: !!client, slot: !!slot });
    return null;
  }

  return (
    <div 
      ref={adRef}
      className={`adsense-container ${className}`}
      style={style}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: dimensions.width,
          height: dimensions.height,
          ...style
        }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={responsive ? 'auto' : format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        data-adtest={testMode ? 'on' : 'off'}
        {...(layoutKey && { 'data-ad-layout-key': layoutKey })}
        {...(format === 'in-article' && { 'data-ad-layout': 'in-article' })}
        {...(format === 'multiplex' && { 'data-ad-layout': 'multiplex' })}
      />
    </div>
  );
};

export default GoogleAdSense;