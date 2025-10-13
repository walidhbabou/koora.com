import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HeaderAd, SidebarAd, MobileAd, InArticleAd, FooterAd } from '@/components/AdWrapper';
import AdBreaksTest from '@/components/AdBreaksTest';

const RealAdsTestPage: React.FC = () => {
  const [testModeEnabled, setTestModeEnabled] = useState(true);
  
  const client = import.meta.env.VITE_ADSENSE_CLIENT;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header de contrôle */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🧪 Test Annonces Réelles - Pages Principales
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Teste tes vraies annonces AdSense sur les composants de Index.tsx et News.tsx
          </p>
          
          <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  ✅ Mode Test Sécurisé avec Client ID Réel
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Client ID: <code className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded">{client}</code>
                </p>
              </div>
              <Button
                onClick={() => setTestModeEnabled(!testModeEnabled)}
                className={`${
                  testModeEnabled 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {testModeEnabled ? '🧪 Test Mode ON' : '🚨 Test Mode OFF'}
              </Button>
            </div>
          </div>
        </div>

        {/* Section Ad Breaks Test */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            🎮 Test Ad Breaks (Annonces Interstitielles)
          </h2>
          <AdBreaksTest 
            client={client} 
            testMode={testModeEnabled}
          />
        </section>

        {/* Section Annonces Display */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            📱 Test Annonces Display (comme sur Index.tsx/News.tsx)
          </h2>
          
          {/* Simulation de layout Index.tsx */}
          <div className="space-y-8">
            
            {/* Header Ad Test */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                Header Ad (728x90) - Comme sur Index.tsx
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <HeaderAd testMode={testModeEnabled} />
              </div>
            </div>

            {/* Layout principal avec sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Contenu principal simulé */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Mobile Ad Test */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                    Mobile Ad (320x100) - Responsive
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <MobileAd testMode={testModeEnabled} />
                  </div>
                </div>

                {/* Article simulé avec In-Article Ad */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                    In-Article Ad - Dans le contenu
                  </h3>
                  <Card className="p-6">
                    <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                      Article de Test - أخبار كرة القدم
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                      هذا نص تجريبي لمحاكاة مقال رياضي طويل. في عالم كرة القدم، تحدث المفاجآت كل يوم. 
                      من الانتقالات المثيرة إلى النتائج غير المتوقعة، رياضة كرة القدم لا تتوقف عن إبهارنا.
                      اللاعبون والأندية تسعى دائماً لتحقيق أفضل النتائج في المنافسات المحلية والدولية...
                    </p>
                    
                    {/* In-Article Ad */}
                    <InArticleAd testMode={testModeEnabled} />
                    
                    <p className="text-gray-700 dark:text-gray-300 mt-6 leading-relaxed">
                      يمكن للاعبين والأندية أن تغير وجهة المنافسة بقرار واحد. التكتيكات الجديدة، 
                      الإصابات، والعوامل النفسية كلها تلعب دوراً مهماً في تحديد نتائج المباريات.
                      المدربون يعملون بجهد لإعداد فرقهم للمواجهات القادمة...
                    </p>
                  </Card>
                </div>

                {/* Grid d'articles simulé */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                    Grid Articles avec Ads Intégrées
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Articles simulés */}
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <Card key={num} className="p-4">
                        <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                        <h4 className="font-semibold text-sm mb-2">
                          خبر رقم {num} - اختبار التخطيط
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          نص تجريبي للخبر رقم {num}...
                        </p>
                      </Card>
                    ))}
                    
                    {/* Ad intégrée après 6 articles (comme dans Index.tsx) */}
                    <div className="md:col-span-2 lg:col-span-3">
                      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">
                          📍 Annonce intégrée après 6 articles (comme Index.tsx)
                        </p>
                        <SidebarAd testMode={testModeEnabled} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar simulée */}
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                    Sidebar Ad (300x250)
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <SidebarAd testMode={testModeEnabled} />
                  </div>
                </div>
                
                {/* Contenu sidebar simulé */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">أخبار سريعة</h4>
                  <div className="space-y-2">
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="flex gap-2">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="flex-1">
                          <p className="text-xs">خبر سريع رقم {num}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Footer Ad Test */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                Footer Ad (728x90) - Fin de page
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <FooterAd testMode={testModeEnabled} />
              </div>
            </div>
          </div>
        </section>

        {/* Résumé technique */}
        <section className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🔧 Résumé Technique
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Client ID:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded break-all">
                {client}
              </code>
            </div>
            <div>
              <strong>Mode Test:</strong><br />
              <span className={`px-2 py-1 rounded ${
                testModeEnabled 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {testModeEnabled ? '🧪 Activé (data-adtest=on)' : '🚨 Désactivé (production)'}
              </span>
            </div>
            <div>
              <strong>Types d'Annonces:</strong><br />
              <span className="text-gray-600 dark:text-gray-400">
                Display + Ad Breaks
              </span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              📋 Tests à Effectuer:
            </h3>
            <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
              <li>• ✅ Vérifier que les annonces s'affichent correctement</li>
              <li>• ✅ Tester sur différentes tailles d'écran</li>
              <li>• ✅ Contrôler que le mode test est actif (badge vert)</li>
              <li>• ✅ Tester les Ad Breaks interstitielles</li>
              <li>• ⚠️ Passer en mode production quand satisfait</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RealAdsTestPage;