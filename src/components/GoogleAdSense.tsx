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
  const [showFallback, setShowFallback] = React.useState(false);
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
      await loadAdSenseScript(client);
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
      
      // Timeout pour afficher un fallback si AdSense ne se charge pas
      setTimeout(() => {
        const insElement = adRef.current?.querySelector('.adsbygoogle');
        if (insElement && !(insElement as HTMLElement).dataset?.adsbygoogleStatus) {
          console.log('⚠️ AdSense timeout - affichage du fallback');
          setShowFallback(true);
        }
      }, 3000);
    } catch (error) {
      console.warn('Erreur lors du chargement de la publicité AdSense:', error);
      setShowFallback(true);
    }
  }, [isInitialized, client]);

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

    // Ne pas charger si AdSense est complètement désactivé
    if (!adsenseTestMode && testMode) {
      console.log('🚫 Mode test désactivé');
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
  
  console.log('🔍 AdSense Debug Info:', {
    adsenseClient,
    adsenseTestMode,
    client,
    slot,
    shouldShowAd,
    testMode,
    format
  });
  
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
      {/* Affichage de debug en mode test avec style publicitaire */}
      {adsenseTestMode && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-blue-300 dark:border-blue-600 rounded-lg p-4 text-center shadow-sm">
          <div className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">
            📺 إعلان تجريبي
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300 mb-2">
            هذا مكان الإعلان • {format}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-200/50 dark:bg-blue-800/50 rounded px-2 py-1 inline-block">
            Slot: {slot}
          </div>
          {/* Contenu publicitaire fictif */}
          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              🏆 كورة - أفضل موقع رياضي
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              تابع آخر الأخبار والنتائج الرياضية
            </div>
          </div>
        </div>
      )}
      
      {/* Fallback si AdSense ne se charge pas */}
      {showFallback && !adsenseTestMode && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">
            🌟 إعلان محلي
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
            <div className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
              كورة - موقعك الرياضي الأول
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              آخر الأخبار • النتائج المباشرة • التحليلات
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/30 px-2 py-1 rounded">
              انضم إلى أكثر من 100,000 متابع
            </div>
          </div>
        </div>
      )}
      
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