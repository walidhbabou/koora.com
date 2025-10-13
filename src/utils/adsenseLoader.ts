/**
 * Utilitaires pour charger et initialiser Google AdSense
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adsbygoogle: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adBreak: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adConfig: any;
  }
}

/**
 * Charge le script AdSense de Google
 * @param clientId - ID client AdSense (ca-pub-XXXXXXXXXXXXXXXX)
 */
export const loadAdSenseScript = (clientId?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Vérifier si le script est déjà chargé
    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = clientId 
      ? `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`
      : 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      console.log('✅ AdSense script loaded successfully');
      resolve();
    };

    script.onerror = () => {
      console.error('❌ Failed to load AdSense script');
      reject(new Error('Failed to load AdSense script'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Initialise le tableau adsbygoogle si nécessaire
 */
export const initializeAdSense = (): void => {
  if (typeof window !== 'undefined') {
    window.adsbygoogle = window.adsbygoogle || [];
  }
};

/**
 * Pousse une nouvelle annonce dans la queue AdSense
 * @param config - Configuration de l'annonce (optionnel)
 */
export const pushAdSenseAd = (config?: Record<string, unknown>): void => {
  if (typeof window !== 'undefined' && window.adsbygoogle) {
    try {
      window.adsbygoogle.push(config || {});
      console.log('📢 AdSense ad pushed to queue');
    } catch (error) {
      console.error('❌ Error pushing AdSense ad:', error);
    }
  }
};

/**
 * Charge le script Ad Breaks pour les annonces interstitielles
 * @param clientId - ID client AdSense
 * @param testMode - Active le mode test avec data-adbreak-test="on"
 */
export const loadAdBreaksScript = (clientId: string, testMode = false): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Vérifier si le script est déjà chargé
    if (document.querySelector('script[data-adbreak-test]') || 
        document.querySelector(`script[src*="${clientId}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    if (testMode) {
      script.setAttribute('data-adbreak-test', 'on');
    }

    script.onload = () => {
      console.log(`🧪 AdSense Ad Breaks script loaded (test: ${testMode})`);
      
      // Initialiser adBreak et adConfig
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adBreak = window.adConfig = function(o: unknown) {
          window.adsbygoogle.push(o);
        };
      }
      
      resolve();
    };

    script.onerror = () => {
      console.error('❌ Failed to load Ad Breaks script');
      reject(new Error('Failed to load Ad Breaks script'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Déclenche une Ad Break (annonce interstitielle)
 * @param config - Configuration de l'Ad Break
 */
export const triggerAdBreak = (config: {
  type: 'start' | 'pause' | 'next' | 'browse' | 'reward';
  name?: string;
  beforeAd?: () => void;
  afterAd?: () => void;
  adBreakDone?: (placementInfo: unknown) => void;
}): void => {
  if (typeof window !== 'undefined' && window.adBreak) {
    try {
      window.adBreak(config);
      console.log('🎮 Ad Break triggered:', config.type);
    } catch (error) {
      console.error('❌ Error triggering Ad Break:', error);
    }
  } else {
    console.warn('⚠️ Ad Break not available - script not loaded');
  }
};

/**
 * Nettoie les scripts AdSense (utile pour les tests)
 */
export const cleanupAdSenseScripts = (): void => {
  const scripts = document.querySelectorAll('script[src*="adsbygoogle.js"]');
  scripts.forEach(script => script.remove());
  
  if (typeof window !== 'undefined') {
    delete window.adsbygoogle;
    delete window.adBreak;
    delete window.adConfig;
  }
  
  console.log('🧹 AdSense scripts cleaned up');
};