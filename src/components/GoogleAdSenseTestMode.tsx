import React, { useEffect, useRef } from 'react';
import { loadAdSenseScript, initializeAdSense, pushAdSenseAd } from '@/utils/adsenseLoader';

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

interface GoogleAdSenseTestModeProps {
  client: string; // ca-pub-XXXXXXXXXXXXXXXX
  slot: string; // Slot ID de l'annonce
  format?: AdFormat;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  layoutKey?: string;
  // Force le mode test avec des vraies annonces
  enableTestMode?: boolean;
}

// Déclaration globale pour AdSense
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adsbygoogle: any[];
  }
}

/**
 * Composant GoogleAdSense spécialement conçu pour tester des VRAIES annonces
 * en mode sécurisé avec data-adtest="on"
 * 
 * ⚠️ IMPORTANT: Ce mode affiche de vraies annonces Google mais en mode test.
 * Les impressions et clics ne sont PAS comptabilisés.
 */
const GoogleAdSenseTestMode: React.FC<GoogleAdSenseTestModeProps> = ({
  client,
  slot,
  format = 'responsive',
  responsive = true,
  style,
  className = '',
  layoutKey,
  enableTestMode = true
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
    // Ne pas charger les pubs si pas de client ID ou slot
    if (!client || !slot) {
      console.warn('Client ID ou Slot manquant pour le test:', { client, slot });
      return;
    }

    console.log('🧪 Chargement AdSense en mode TEST avec vraies annonces', {
      client,
      slot,
      format,
      testMode: enableTestMode
    });

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
        console.error('❌ Erreur lors du chargement de la publicité AdSense en mode test:', error);
      }
    };

    loadAndInitialize();
  }, [client, slot, format, enableTestMode]);

  const dimensions = getAdDimensions(format);

  // Si pas de configuration, on ne peut pas afficher d'annonces
  if (!client || !slot) {
    return (
      <div 
        className={`border-2 border-dashed border-red-300 bg-red-50 dark:bg-red-900/20 p-4 rounded ${className}`}
        style={style}
      >
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="font-semibold">❌ Configuration manquante</p>
          <p className="text-sm">Client ID ou Slot ID manquant</p>
          <p className="text-xs mt-1">Client: {client || 'NON DÉFINI'}</p>
          <p className="text-xs">Slot: {slot || 'NON DÉFINI'}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={adRef}
      className={`adsense-test-container relative ${className}`}
      style={style}
    >
      {/* Indicateur visuel du mode test */}
      {enableTestMode && (
        <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-2 py-1 z-10 rounded-br">
          🧪 TEST MODE
        </div>
      )}
      
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
        // ⚠️ CLEF DU MODE TEST: cette prop dit à Google que c'est un test
        data-adtest={enableTestMode ? 'on' : 'off'}
        {...(layoutKey && { 'data-ad-layout-key': layoutKey })}
        {...(format === 'in-article' && { 'data-ad-layout': 'in-article' })}
        {...(format === 'multiplex' && { 'data-ad-layout': 'multiplex' })}
      />
      
      {/* Debug info en développement */}
      {import.meta.env.DEV && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 border rounded p-2 bg-gray-50 dark:bg-gray-800">
          <p><strong>Format:</strong> {format} ({dimensions.width}x{dimensions.height})</p>
          <p><strong>Slot:</strong> {slot}</p>
          <p><strong>Mode Test:</strong> {enableTestMode ? '✅ Activé (data-adtest=on)' : '❌ Désactivé'}</p>
          <p><strong>Responsive:</strong> {responsive ? 'Oui' : 'Non'}</p>
        </div>
      )}
    </div>
  );
};

export default GoogleAdSenseTestMode;