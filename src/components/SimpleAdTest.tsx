import React from 'react';
import GoogleAdSense from './GoogleAdSense';

const SimpleAdTest: React.FC = () => {
  // Variables d'environnement
  const client = import.meta.env.VITE_ADSENSE_CLIENT;
  const slot = import.meta.env.VITE_ADSENSE_HEADER_SLOT;
  const testMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';

  console.log('Variables d\'environnement:', {
    client,
    slot,
    testMode,
    rawTestMode: import.meta.env.VITE_ADSENSE_TEST_MODE
  });

  return (
    <div className="p-8 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Test Simple des Annonces
      </h1>
      
      {/* Informations de débogage */}
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Informations de débogage:</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Client:</strong> {client || 'Non défini'}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Slot:</strong> {slot || 'Non défini'}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Test Mode:</strong> {testMode ? 'Activé' : 'Désactivé'}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Raw Test Mode:</strong> {import.meta.env.VITE_ADSENSE_TEST_MODE}
        </p>
      </div>

      {/* Test 1: Mode test forcé */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Test 1: Mode test forcé (testMode=true)
        </h2>
        <GoogleAdSense
          client={client}
          slot={slot}
          format="rectangle"
          testMode={true}
          className="border border-red-300"
        />
      </div>

      {/* Test 2: Mode automatique */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Test 2: Mode automatique (depuis env)
        </h2>
        <GoogleAdSense
          client={client}
          slot={slot}
          format="rectangle"
          testMode={testMode}
          className="border border-blue-300"
        />
      </div>

      {/* Test 3: Sans client (doit montrer placeholder) */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Test 3: Sans client (doit montrer placeholder)
        </h2>
        <GoogleAdSense
          client=""
          slot={slot}
          format="rectangle"
          testMode={false}
          className="border border-green-300"
        />
      </div>

      {/* Test 4: Format leaderboard */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Test 4: Format leaderboard
        </h2>
        <GoogleAdSense
          client={client}
          slot={slot}
          format="leaderboard"
          testMode={true}
          className="border border-purple-300"
        />
      </div>
    </div>
  );
};

export default SimpleAdTest;