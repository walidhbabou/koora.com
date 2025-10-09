// AdSense script loader utility
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const loadAdSenseScript = () => {
  // Vérifie si le script est déjà chargé
  if (document.querySelector('script[src*="adsbygoogle"]')) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('AdSense script loaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      console.error('Failed to load AdSense script');
      reject(new Error('Failed to load AdSense script'));
    };
    
    document.head.appendChild(script);
  });
};

export const initializeAdSense = () => {
  if (typeof window !== 'undefined') {
    window.adsbygoogle = window.adsbygoogle || [];
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