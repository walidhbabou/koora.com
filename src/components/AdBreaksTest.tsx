import React, { useEffect, useState } from 'react';
import { loadAdBreaksScript, triggerAdBreak } from '@/utils/adsenseLoader';

interface AdBreaksTestProps {
  client: string; // ca-pub-XXXXXXXXXXXXXXXX
  testMode?: boolean;
  className?: string;
}

/**
 * Composant pour tester Ad Breaks (AdSense for Games) 
 * avec de vraies annonces interstitielles en mode sécurisé
 * 
 * ⚠️ IMPORTANT: Utilise data-adbreak-test="on" pour des tests sécurisés
 */
const AdBreaksTest: React.FC<AdBreaksTestProps> = ({
  client,
  testMode = true,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAdBreakResult, setLastAdBreakResult] = useState<string | null>(null);

  useEffect(() => {
    if (!client) {
      setError('Client ID manquant');
      return;
    }

    const loadScript = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await loadAdBreaksScript(client, testMode);
        setIsLoaded(true);
        console.log('🎮 Ad Breaks prêt pour les tests');
      } catch (err) {
        setError('Erreur lors du chargement du script Ad Breaks');
        console.error('❌ Erreur Ad Breaks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadScript();
  }, [client, testMode]);

  const handleAdBreak = (type: 'start' | 'pause' | 'next' | 'browse' | 'reward', name?: string) => {
    setLastAdBreakResult(null);
    
    triggerAdBreak({
      type,
      name: name || `test-${type}-${Date.now()}`,
      beforeAd: () => {
        console.log(`🎬 Ad Break ${type}: Début`);
        setLastAdBreakResult(`🎬 Ad Break ${type} démarré`);
      },
      afterAd: () => {
        console.log(`✅ Ad Break ${type}: Terminé`);
        setLastAdBreakResult(`✅ Ad Break ${type} terminé avec succès`);
      },
      adDismissed: () => {
        console.log(`❌ Ad Break ${type}: Fermé par l'utilisateur`);
        setLastAdBreakResult(`❌ Ad Break ${type} fermé par l'utilisateur`);
      },
      adViewed: () => {
        console.log(`👁️ Ad Break ${type}: Vu complètement`);
        setLastAdBreakResult(`👁️ Ad Break ${type} vu complètement`);
      }
    });
  };

  if (!client) {
    return (
      <div className={`border-2 border-dashed border-red-300 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          <h3 className="font-semibold text-lg mb-2">❌ Configuration manquante</h3>
          <p>Client ID AdSense requis pour tester Ad Breaks</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border ${className}`}>
      {/* Header avec statut */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            🎮 Test Ad Breaks (Interstitiel)
            {testMode && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                🧪 MODE TEST
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {testMode 
              ? 'Mode sécurisé activé (data-adbreak-test="on")' 
              : '⚠️ Mode production - attention aux clics'
            }
          </p>
        </div>
        
        <div className="text-right">
          <div className={`w-3 h-3 rounded-full ${
            isLoaded ? 'bg-green-500' : isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          <p className="text-xs text-gray-500 mt-1">
            {isLoaded ? 'Prêt' : isLoading ? 'Chargement...' : 'Non chargé'}
          </p>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-800 dark:text-red-200 font-medium">❌ {error}</p>
        </div>
      )}

      {/* Information sur le mode test */}
      {testMode && isLoaded && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
            ✅ Mode Test Sécurisé Activé
          </h3>
          <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
            <li>• Script chargé avec <code className="bg-green-200 dark:bg-green-800 px-1 rounded">data-adbreak-test="on"</code></li>
            <li>• Les annonces affichées sont réelles mais en mode test</li>
            <li>• Aucun impact sur les statistiques ou revenus</li>
            <li>• Clics et impressions ne sont pas comptabilisés</li>
          </ul>
        </div>
      )}

      {/* Boutons de test */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => handleAdBreak('start')}
          disabled={!isLoaded}
          className={`p-4 rounded-lg text-white font-medium transition-colors ${
            isLoaded 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="text-2xl mb-2">🚀</div>
          <div>Start Ad Break</div>
          <div className="text-xs opacity-80">Début de session</div>
        </button>

        <button
          onClick={() => handleAdBreak('pause')}
          disabled={!isLoaded}
          className={`p-4 rounded-lg text-white font-medium transition-colors ${
            isLoaded 
              ? 'bg-yellow-600 hover:bg-yellow-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="text-2xl mb-2">⏸️</div>
          <div>Pause Ad Break</div>
          <div className="text-xs opacity-80">Pause naturelle</div>
        </button>

        <button
          onClick={() => handleAdBreak('next')}
          disabled={!isLoaded}
          className={`p-4 rounded-lg text-white font-medium transition-colors ${
            isLoaded 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="text-2xl mb-2">⏭️</div>
          <div>Next Ad Break</div>
          <div className="text-xs opacity-80">Passage niveau</div>
        </button>

        <button
          onClick={() => handleAdBreak('browse')}
          disabled={!isLoaded}
          className={`p-4 rounded-lg text-white font-medium transition-colors ${
            isLoaded 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="text-2xl mb-2">🌐</div>
          <div>Browse Ad Break</div>
          <div className="text-xs opacity-80">Navigation menu</div>
        </button>

        <button
          onClick={() => handleAdBreak('reward')}
          disabled={!isLoaded}
          className={`p-4 rounded-lg text-white font-medium transition-colors ${
            isLoaded 
              ? 'bg-orange-600 hover:bg-orange-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="text-2xl mb-2">🎁</div>
          <div>Reward Ad Break</div>
          <div className="text-xs opacity-80">Récompense volontaire</div>
        </button>

        <button
          onClick={() => handleAdBreak('start', 'custom-test-' + Date.now())}
          disabled={!isLoaded}
          className={`p-4 rounded-lg text-white font-medium transition-colors ${
            isLoaded 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="text-2xl mb-2">🧪</div>
          <div>Test Personnalisé</div>
          <div className="text-xs opacity-80">Ad Break custom</div>
        </button>
      </div>

      {/* Résultat du dernier test */}
      {lastAdBreakResult && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            📊 Résultat du dernier test:
          </h4>
          <p className="text-blue-700 dark:text-blue-300">{lastAdBreakResult}</p>
        </div>
      )}

      {/* Informations techniques */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          🔧 Informations Techniques
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Client ID:</strong><br />
            <code className="bg-gray-200 dark:bg-gray-600 p-1 rounded text-xs break-all">
              {client}
            </code>
          </div>
          <div>
            <strong>Script Status:</strong><br />
            <span className={`px-2 py-1 rounded text-xs ${
              isLoaded 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {isLoaded ? '✅ Chargé' : '❌ Non chargé'}
            </span>
          </div>
          <div>
            <strong>Mode Test:</strong><br />
            <span className={`px-2 py-1 rounded text-xs ${
              testMode 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {testMode ? '🧪 Activé' : '🚨 Désactivé'}
            </span>
          </div>
          <div>
            <strong>Script URL:</strong><br />
            <code className="bg-gray-200 dark:bg-gray-600 p-1 rounded text-xs break-all">
              {`...adsbygoogle.js?client=${client}`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBreaksTest;