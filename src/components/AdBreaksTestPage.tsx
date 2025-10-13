import React from 'react';
import AdBreaksTest from './AdBreaksTest';

const AdBreaksTestPage: React.FC = () => {
  const client = import.meta.env.VITE_ADSENSE_CLIENT;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎮 Test Ad Breaks - Annonces Interstitielles
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Teste des vraies annonces Google AdSense en mode sécurisé avec <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">data-adbreak-test="on"</code>
          </p>
        </div>

        {/* Explication Ad Breaks */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            📚 Qu'est-ce que Ad Breaks ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">🎯 Concept</h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-2 text-sm">
                <li>• Annonces interstitielles plein écran</li>
                <li>• Conçues pour les jeux et applications interactives</li>
                <li>• Déclenchées à des moments naturels</li>
                <li>• Optimisées pour l'engagement utilisateur</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">⚡ Types d'Ad Breaks</h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-2 text-sm">
                <li>• <strong>Start:</strong> Début de session/jeu</li>
                <li>• <strong>Pause:</strong> Pause naturelle</li>
                <li>• <strong>Next:</strong> Passage de niveau</li>
                <li>• <strong>Browse:</strong> Navigation dans les menus</li>
                <li>• <strong>Reward:</strong> Récompense volontaire</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Code d'implémentation */}
        <div className="mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            💻 Implémentation HTML/JavaScript
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Voici le code exact que tu mentionnais, intégré dans notre système React :
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`<!-- Script avec mode test activé -->
<script async
    data-adbreak-test="on"
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client || 'ca-pub-XXXXXXXXXXXXXXXX'}"
    crossorigin="anonymous">
</script>

<script>
   window.adsbygoogle = window.adsbygoogle || [];
   var adBreak = adConfig = function(o) {adsbygoogle.push(o);}
   
   // Exemple d'utilisation
   adBreak({
     type: 'start',
     name: 'my-start-ad-break',
     beforeAd: () => console.log('Avant annonce'),
     afterAd: () => console.log('Après annonce'),
     adDismissed: () => console.log('Annonce fermée'),
     adViewed: () => console.log('Annonce vue')
   });
</script>`}
            </pre>
          </div>
        </div>

        {/* Composant de test */}
        <div className="mb-8">
          <AdBreaksTest 
            client={client} 
            testMode={true}
          />
        </div>

        {/* Avantages du mode test */}
        <div className="mb-8 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4">
            ✅ Avantages du Mode Test (data-adbreak-test="on")
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-green-700 dark:text-green-300 mb-2">🔒 Sécurité</h3>
              <ul className="text-green-600 dark:text-green-400 text-sm space-y-1">
                <li>• Aucun risque de pénalité AdSense</li>
                <li>• Clics accidentels non comptabilisés</li>
                <li>• Statistiques non impactées</li>
                <li>• Test sans conséquences financières</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-700 dark:text-green-300 mb-2">🧪 Test Réaliste</h3>
              <ul className="text-green-600 dark:text-green-400 text-sm space-y-1">
                <li>• Vraies annonces Google</li>
                <li>• Comportement authentique</li>
                <li>• Design et timing réels</li>
                <li>• Performance mesurable</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Différences avec annonces display */}
        <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
            🔄 Ad Breaks vs Annonces Display Classiques
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-yellow-200 dark:border-yellow-700">
                  <th className="text-left p-3 font-semibold text-yellow-800 dark:text-yellow-200">Aspect</th>
                  <th className="text-left p-3 font-semibold text-yellow-800 dark:text-yellow-200">Ad Breaks</th>
                  <th className="text-left p-3 font-semibold text-yellow-800 dark:text-yellow-200">Display Classique</th>
                </tr>
              </thead>
              <tbody className="text-yellow-700 dark:text-yellow-300">
                <tr className="border-b border-yellow-100 dark:border-yellow-800">
                  <td className="p-3 font-medium">Format</td>
                  <td className="p-3">Interstitiel plein écran</td>
                  <td className="p-3">Bannière, rectangle, etc.</td>
                </tr>
                <tr className="border-b border-yellow-100 dark:border-yellow-800">
                  <td className="p-3 font-medium">Déclenchement</td>
                  <td className="p-3">Programmé par l'app</td>
                  <td className="p-3">Automatique au chargement</td>
                </tr>
                <tr className="border-b border-yellow-100 dark:border-yellow-800">
                  <td className="p-3 font-medium">Usage optimal</td>
                  <td className="p-3">Jeux, apps interactives</td>
                  <td className="p-3">Sites web, blogs</td>
                </tr>
                <tr className="border-b border-yellow-100 dark:border-yellow-800">
                  <td className="p-3 font-medium">Mode test</td>
                  <td className="p-3"><code>data-adbreak-test="on"</code></td>
                  <td className="p-3"><code>data-adtest="on"</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cas d'usage pour koora.com */}
        <div className="mb-8 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-4">
            ⚽ Cas d'Usage pour Koora.com
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-purple-700 dark:text-purple-300 mb-2">🎮 Moments Appropriés</h3>
              <ul className="text-purple-600 dark:text-purple-400 text-sm space-y-1">
                <li>• Fin de lecture d'un article</li>
                <li>• Changement de page/section</li>
                <li>• Avant affichage des résultats</li>
                <li>• Transition entre matchs en direct</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-purple-700 dark:text-purple-300 mb-2">💡 Idées d'Implémentation</h3>
              <ul className="text-purple-600 dark:text-purple-400 text-sm space-y-1">
                <li>• Ad Break après 3 articles lus</li>
                <li>• Récompense pour quiz sur le foot</li>
                <li>• Pause entre mi-temps du match</li>
                <li>• Navigation vers page classement</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Configuration requise */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            ⚙️ Configuration Requise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-gray-900 dark:text-white">Client ID AdSense:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-xs break-all">
                {client || '❌ Non configuré dans .env'}
              </code>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Variables d'environnement:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-xs">
                VITE_ADSENSE_CLIENT=ca-pub-XXXXX
              </code>
            </div>
          </div>
          
          {!client && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded">
              <p className="text-red-800 dark:text-red-200 font-medium">
                ⚠️ Client ID manquant - Ajoutez VITE_ADSENSE_CLIENT dans votre fichier .env
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdBreaksTestPage;