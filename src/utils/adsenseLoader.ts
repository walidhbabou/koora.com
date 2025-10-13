// AdSense script loader utility with Ad Breaks support
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adsbygoogle: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adBreak?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adConfig?: any;
  }
}

export const loadAdSenseScript = (clientId?: string) => {
  // Utilise le Client ID fourni ou celui des variables d'environnement
  const client = clientId || import.meta.env.VITE_ADSENSE_CLIENT;
  
  // Vérifie si le script est déjà chargé
  if (document.querySelector('script[src*="adsbygoogle"]')) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = client 
      ? `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
      : 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log(`✅ AdSense script loaded successfully with client: ${client || 'default'}`);
      resolve();
    };
    
    script.onerror = () => {
      console.error('Failed to load AdSense script');
      reject(new Error('Failed to load AdSense script'));
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Charge le script AdSense avec support Ad Breaks (pour annonces interstitielles)
 * @param clientId - Client ID AdSense (ca-pub-XXXXXXXXXXXXXXXX)
 * @param testMode - Active le mode test avec data-adbreak-test="on"
 */
export const loadAdBreaksScript = (clientId: string, testMode = false) => {
  // Vérifie si le script est déjà chargé
  if (document.querySelector('script[src*="adsbygoogle"][data-adbreak-test]')) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    // ⚠️ CLEF DU MODE TEST: ajoute data-adbreak-test="on" pour tester
    if (testMode) {
      script.setAttribute('data-adbreak-test', 'on');
    }
    
    script.onload = () => {
      console.log(`🧪 AdSense Ad Breaks script loaded (test: ${testMode})`);
      initializeAdBreaks();
      resolve();
    };
    
    script.onerror = () => {
      console.error('Failed to load AdSense Ad Breaks script');
      reject(new Error('Failed to load AdSense Ad Breaks script'));
    };
    
    document.head.appendChild(script);
  });
};

export const initializeAdSense = () => {
  if (typeof window !== 'undefined') {
    window.adsbygoogle = window.adsbygoogle || [];
  }
};

/**
 * Initialise Ad Breaks (AdSense for Games)
 * Configure adBreak et adConfig globalement
 */
export const initializeAdBreaks = () => {
  if (typeof window !== 'undefined') {
    window.adsbygoogle = window.adsbygoogle || [];
    
    // Configuration Ad Breaks selon la documentation Google
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.adBreak = window.adConfig = function(o: any) {
      window.adsbygoogle.push(o);
    };
    
    console.log('🎮 Ad Breaks initialized');
  }
};

export const pushAdSenseAd = () => {
  if (typeof window !== 'undefined' && window.adsbygoogle) {
    try {
      window.adsbygoogle.push({});
    } catch (error) {
      console.error('Error pushing AdSense ad:', error);
    }
  }
};

/**
 * Déclenche un Ad Break (annonce interstitielle)
 * @param type - Type d'Ad Break ('start', 'pause', 'next', 'browse', etc.)
 * @param name - Nom personnalisé pour l'Ad Break
 * @param beforeAd - Callback avant l'annonce
 * @param afterAd - Callback après l'annonce
 * @param adDismissed - Callback si l'annonce est fermée
 * @param adViewed - Callback si l'annonce est vue complètement
 */
export const triggerAdBreak = (options: {
  type: 'start' | 'pause' | 'next' | 'browse' | 'reward';
  name?: string;
  beforeAd?: () => void;
  afterAd?: () => void;
  adDismissed?: () => void;
  adViewed?: () => void;
}) => {
  if (typeof window !== 'undefined' && window.adBreak) {
    const adBreakConfig = {
      type: options.type,
      name: options.name || `adBreak-${options.type}`,
      beforeAd: options.beforeAd || (() => console.log('🎬 Ad Break: Avant annonce')),
      afterAd: options.afterAd || (() => console.log('✅ Ad Break: Après annonce')),
      adDismissed: options.adDismissed || (() => console.log('❌ Ad Break: Annonce fermée')),
      adViewed: options.adViewed || (() => console.log('👁️ Ad Break: Annonce vue'))
    };
    
    console.log('🎮 Déclenchement Ad Break:', adBreakConfig);
    window.adBreak(adBreakConfig);
  } else {
    console.warn('⚠️ Ad Breaks non disponible - script non chargé ou non initialisé');
  }
};