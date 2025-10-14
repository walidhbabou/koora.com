import React, { useEffect, useRef, useCallback } from 'react';
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
  const [isInitialized, setIsInitialized] = React.useState(false);
  // Générer un ID unique pour chaque instance
  const adId = React.useMemo(() => `adsense-${slot}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, [slot]);

  // Mapping des formats vers les dimensions avec des valeurs minimales
  const getAdDimensions = (format: AdFormat) => {
    const dimensions = {
      'rectangle': { width: '300px', height: '250px', minWidth: '300px', minHeight: '250px' },
      'leaderboard': { width: '728px', height: '90px', minWidth: '728px', minHeight: '90px' },
      'banner': { width: '320px', height: '50px', minWidth: '320px', minHeight: '50px' },
      'large-rectangle': { width: '336px', height: '280px', minWidth: '336px', minHeight: '280px' },
      'mobile-banner': { width: '320px', height: '100px', minWidth: '320px', minHeight: '100px' },
      'responsive': { width: '100%', height: 'auto', minWidth: '300px', minHeight: '250px' },
      'in-article': { width: '100%', height: 'auto', minWidth: '300px', minHeight: '250px' },
      'multiplex': { width: '100%', height: 'auto', minWidth: '300px', minHeight: '280px' }
    };
    return dimensions[format];
  };

  // Vérifier si les publicités sont désactivées
  const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT;
  const adsenseTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';

  // Fonction pour charger et initialiser AdSense une seule fois
  const loadAndInitializeAd = useCallback(async () => {
    if (isInitialized) {
      console.log('🔄 AdSense déjà initialisé pour ce composant');
      return;
    }

    // Vérifier que l'élément ins n'a pas déjà été traité
    const insElement = adRef.current?.querySelector('.adsbygoogle');
    if (insElement && (
        (insElement as HTMLElement).dataset?.adsbygoogleStatus === 'done' || 
        (insElement as HTMLElement).dataset?.adsbygoogleStatus === 'filled' ||
        (insElement as HTMLElement).dataset?.adsbygoogleStatus === 'pending')) {
      console.log('🔄 Élément AdSense déjà traité');
      setIsInitialized(true);
      return;
    }

    try {
      await loadAdSenseScript();
      initializeAdSense();
      
      // Marquer comme en cours de traitement
      if (insElement) {
        (insElement as HTMLElement).dataset.adsbygoogleStatus = 'requested';
      }
      
      // Délai pour s'assurer que tout est prêt
      setTimeout(() => {
        if (!isInitialized) {
          pushAdSenseAd();
          setIsInitialized(true);
        }
      }, 300);
    } catch (error) {
      console.warn('Erreur lors du chargement de la publicité AdSense:', error);
    }
  }, [isInitialized]);

  // Fonction pour vérifier et initialiser l'annonce
  const checkAndInitialize = useCallback(() => {
    if (!adRef.current || isInitialized) return;

    const rect = adRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      loadAndInitializeAd();
    } else {
      // Réessayer après un petit délai si pas de largeur
      setTimeout(checkAndInitialize, 100);
    }
  }, [loadAndInitializeAd, isInitialized]);

  useEffect(() => {
    // Si pas de client ID dans l'env, ne pas charger
    if (!adsenseClient) {
      console.log('🚫 Pas de Client ID AdSense configuré');
      return;
    }

    // Ne pas charger en mode test
    if (testMode || !adsenseTestMode) {
      console.log('🚫 Mode test ou AdSense désactivé');
      return;
    }

    // Ne pas charger les pubs si pas de client ID ou slot
    if (!client || !slot) {
      console.warn('Client ID ou Slot manquant:', { client, slot });
      return;
    }

    // Observer les changements de taille
    let resizeObserver: ResizeObserver | null = null;
    
    const initObserver = () => {
      if (adRef.current && 'ResizeObserver' in window) {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.contentRect.width > 0) {
              checkAndInitialize();
              break;
            }
          }
        });
        resizeObserver.observe(adRef.current);
      } else {
        // Fallback si ResizeObserver n'est pas disponible
        checkAndInitialize();
      }
    };

    // Délai initial pour s'assurer que le DOM est prêt
    const timer = setTimeout(initObserver, 100);

    return () => {
      clearTimeout(timer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [client, slot, testMode, adsenseClient, adsenseTestMode, checkAndInitialize]);

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
      id={adId}
      className={`adsense-container ${className}`}
      style={{
        ...dimensions,
        display: 'block',
        overflow: 'hidden',
        ...style
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: dimensions.width,
          height: dimensions.height,
          minWidth: dimensions.minWidth,
          minHeight: dimensions.minHeight
        }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={responsive ? 'auto' : format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        data-adtest={testMode ? 'on' : 'off'}
        data-ad-instance-id={adId}
        {...(layoutKey && { 'data-ad-layout-key': layoutKey })}
        {...(format === 'in-article' && { 'data-ad-layout': 'in-article' })}
        {...(format === 'multiplex' && { 'data-ad-layout': 'multiplex' })}
      />
    </div>
  );
};

export default GoogleAdSense;