import React from 'react';
import { cleanupFailedAds, resetAllAds } from '../utils/adsenseLoader';

/**
 * Composant de débogage pour AdSense - À utiliser en développement uniquement
 */
const AdSenseDebugger: React.FC = () => {
  const [adElements, setAdElements] = React.useState<Element[]>([]);
  const [debugInfo, setDebugInfo] = React.useState<string>('');

  const scanAdElements = () => {
    const ads = Array.from(document.querySelectorAll('.adsbygoogle'));
    setAdElements(ads);
    
    const info = ads.map((ad, index) => {
      const element = ad as HTMLElement;
      const rect = ad.getBoundingClientRect();
      return `Ad ${index + 1}:
  - Status: ${element.dataset.adsbygoogleStatus || 'none'}
  - Slot: ${element.dataset.adSlot || 'unknown'}
  - Size: ${rect.width}x${rect.height}
  - Client: ${element.dataset.adClient || 'unknown'}`;
    }).join('\n\n');
    
    setDebugInfo(info || 'Aucune publicité trouvée');
  };

  const handleCleanupFailed = () => {
    cleanupFailedAds();
    scanAdElements();
  };

  const handleResetAll = () => {
    resetAllAds();
    scanAdElements();
  };

  React.useEffect(() => {
    scanAdElements();
    const interval = setInterval(scanAdElements, 2000);
    return () => clearInterval(interval);
  }, []);

  // Ne pas afficher en production
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#1a1a1a',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      zIndex: 9999,
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      fontSize: '12px',
      fontFamily: 'monospace',
      border: '1px solid #333'
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#ffd700' }}>
        🐛 AdSense Debugger
      </h4>
      
      <div style={{ marginBottom: '12px' }}>
        <button 
          onClick={scanAdElements}
          style={{
            marginRight: '8px',
            padding: '4px 8px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔍 Scan
        </button>
        <button 
          onClick={handleCleanupFailed}
          style={{
            marginRight: '8px',
            padding: '4px 8px',
            background: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🧹 Clean Failed
        </button>
        <button 
          onClick={handleResetAll}
          style={{
            padding: '4px 8px',
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Reset All
        </button>
      </div>
      
      <div>
        <strong>Publicités trouvées: {adElements.length}</strong>
      </div>
      
      <pre style={{
        background: '#2a2a2a',
        padding: '8px',
        borderRadius: '4px',
        margin: '8px 0 0 0',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {debugInfo}
      </pre>
    </div>
  );
};

export default AdSenseDebugger;