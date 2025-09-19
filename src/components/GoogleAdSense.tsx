import React, { useEffect, useRef } from 'react';

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
    adsbygoogle: Record<string, unknown>[];
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
    // Ne pas charger les pubs en mode test ou si pas de client ID
    if (testMode || !client || !slot) {
      return;
    }

    try {
      // Initialiser adsbygoogle si pas encore fait
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.warn('Erreur lors du chargement de la publicité AdSense:', error);
    }
  }, [client, slot, testMode]);

  const dimensions = getAdDimensions(format);

  // Mode test - affiche un placeholder
  if (testMode || !client || !slot) {
    return (
      <div 
        className={`bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center ${className}`}
        style={{
          width: dimensions.width === 'auto' ? '100%' : dimensions.width,
          height: dimensions.height === 'auto' ? '120px' : Math.min(Number(dimensions.height) || 120, 120),
          minHeight: format === 'responsive' ? '80px' : 'auto',
          maxHeight: format === 'mobile-banner' ? '60px' : '120px',
          ...style
        }}
      >
        <div className="text-center p-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {testMode ? 'Mode Test - Publicité' : 'Espace Publicitaire'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Format: {format}
          </div>
        </div>
      </div>
    );
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
        {...(layoutKey && { 'data-ad-layout-key': layoutKey })}
        {...(format === 'in-article' && { 'data-ad-layout': 'in-article' })}
        {...(format === 'multiplex' && { 'data-ad-layout': 'multiplex' })}
      />
    </div>
  );
};

export default GoogleAdSense;