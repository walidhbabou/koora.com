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

  useEffect(() => {
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
  }, [client, slot, testMode]);

  const dimensions = getAdDimensions(format);

  // Mode test ou configuration incomplète - ne rien afficher
  if (testMode === true || !client || !slot) {
    console.log('AdSense désactivé:', { testMode, client: !!client, slot: !!slot });
    return null; // Ne pas afficher d'annonce en mode test
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