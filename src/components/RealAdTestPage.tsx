import React, { useState } from 'react';
import GoogleAdSenseTestMode from './GoogleAdSenseTestMode';
import AdTestIndicator from './AdTestIndicator';

const RealAdTestPage: React.FC = () => {
  const [testModeEnabled, setTestModeEnabled] = useState(true);
  
  // Configuration AdSense depuis les variables d'environnement
  const client = import.meta.env.VITE_ADSENSE_CLIENT;
  const headerSlot = import.meta.env.VITE_ADSENSE_HEADER_SLOT;
  const sidebarSlot = import.meta.env.VITE_ADSENSE_SIDEBAR_SLOT;
  const mobileSlot = import.meta.env.VITE_ADSENSE_MOBILE_SLOT;
  const articleSlot = import.meta.env.VITE_ADSENSE_ARTICLE_SLOT;
  const footerSlot = import.meta.env.VITE_ADSENSE_FOOTER_SLOT;

  // Vérifier si la configuration est complète
  const configComplete = client && headerSlot && sidebarSlot && mobileSlot;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header avec info et contrôles */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🧪 اختبار الإعلانات الحقيقية
          </h1>
          
          {/* Indicateur de mode test */}
          <AdTestIndicator 
            show={testModeEnabled} 
            position="static" 
            testMode="safe"
            className="mb-4"
          />
          
          <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  ✅ Mode Test Sécurisé Activé
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Les annonces affichées sont réelles mais en mode test (data-adtest="on")
                </p>
              </div>
              <button
                onClick={() => setTestModeEnabled(!testModeEnabled)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  testModeEnabled 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {testModeEnabled ? '🧪 Test Mode ON' : '🚨 Test Mode OFF'}
              </button>
            </div>
            
            {!configComplete && (
              <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 rounded p-4 mt-4">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  ⚠️ Configuration incomplète
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Certaines variables d'environnement AdSense sont manquantes
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section d'explication */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            📋 كيف يعمل وضع الاختبار الآمن
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">✅ ما يحدث:</h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                <li>• عرض إعلانات Google حقيقية</li>
                <li>• الإعلانات تأتي من خوادم Google</li>
                <li>• تصميم وأشكال حقيقية</li>
                <li>• اختبار التوافق والأداء</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🔒 ما لا يحدث:</h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                <li>• عدم احتساب المشاهدات</li>
                <li>• عدم احتساب النقرات</li>
                <li>• عدم التأثير على الإحصائيات</li>
                <li>• عدم إنتاج أرباح وهمية</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Header Ad Test */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded mr-3">HEADER</span>
            {' '}إعلان الهيدر (Leaderboard 728x90)
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <GoogleAdSenseTestMode
              client={client}
              slot={headerSlot}
              format="leaderboard"
              enableTestMode={testModeEnabled}
              className="w-full"
            />
          </div>
        </section>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Contenu principal */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Mobile Ad Test */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded mr-3">MOBILE</span>
                {' '}إعلان الموبايل (320x100)
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <GoogleAdSenseTestMode
                  client={client}
                  slot={mobileSlot}
                  format="mobile-banner"
                  enableTestMode={testModeEnabled}
                  className="w-full"
                />
              </div>
            </section>

            {/* Article avec In-Article Ad */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded mr-3">ARTICLE</span>
                {' '}إعلان داخل المقال
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  أخبار كرة القدم - مقال تجريبي
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  هذا نص تجريبي لمحاكاة مقال رياضي. في عالم كرة القدم، تحدث المفاجآت كل يوم. 
                  من الانتقالات المثيرة إلى النتائج غير المتوقعة، رياضة كرة القدم لا تتوقف عن إبهارنا...
                </p>
                
                {/* In-Article Ad */}
                <div className="my-8">
                  <GoogleAdSenseTestMode
                    client={client}
                    slot={articleSlot}
                    format="in-article"
                    enableTestMode={testModeEnabled}
                    className="w-full"
                  />
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  يمكن للاعبين والأندية أن تغير وجهة المنافسة بقرار واحد. التكتيكات الجديدة، 
                  الإصابات، والعوامل النفسية كلها تلعب دوراً مهماً في تحديد نتائج المباريات...
                </p>
              </div>
            </section>

            {/* Tests formats différents */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded mr-3">FORMATS</span>
                {' '}اختبار أشكال مختلفة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Rectangle */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium mb-3 text-gray-900 dark:text-white">
                    Rectangle (300x250)
                  </h3>
                  <GoogleAdSenseTestMode
                    client={client}
                    slot={sidebarSlot}
                    format="rectangle"
                    enableTestMode={testModeEnabled}
                  />
                </div>

                {/* Large Rectangle */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium mb-3 text-gray-900 dark:text-white">
                    Large Rectangle (336x280)
                  </h3>
                  <GoogleAdSenseTestMode
                    client={client}
                    slot={sidebarSlot}
                    format="large-rectangle"
                    enableTestMode={testModeEnabled}
                  />
                </div>

                {/* Banner */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium mb-3 text-gray-900 dark:text-white">
                    Banner (320x50)
                  </h3>
                  <GoogleAdSenseTestMode
                    client={client}
                    slot={mobileSlot}
                    format="banner"
                    enableTestMode={testModeEnabled}
                  />
                </div>

                {/* Responsive */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium mb-3 text-gray-900 dark:text-white">
                    Responsive
                  </h3>
                  <GoogleAdSenseTestMode
                    client={client}
                    slot={headerSlot}
                    format="responsive"
                    enableTestMode={testModeEnabled}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded mr-3">SIDEBAR</span>
                {' '}الشريط الجانبي
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <GoogleAdSenseTestMode
                  client={client}
                  slot={sidebarSlot}
                  format="rectangle"
                  enableTestMode={testModeEnabled}
                  className="w-full"
                />
              </div>
            </section>
          </div>
        </div>

        {/* Footer Ad */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded mr-3">FOOTER</span>
            {' '}إعلان الفوتر (728x90)
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <GoogleAdSenseTestMode
              client={client}
              slot={footerSlot}
              format="leaderboard"
              enableTestMode={testModeEnabled}
              className="w-full"
            />
          </div>
        </section>

        {/* Informations techniques */}
        <section className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            🔧 معلومات تقنية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <strong className="text-gray-900 dark:text-white">Client ID:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-xs break-all">
                {client || '❌ غير محدد'}
              </code>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Header Slot:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-xs">
                {headerSlot || '❌ غير محدد'}
              </code>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Sidebar Slot:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-xs">
                {sidebarSlot || '❌ غير محدد'}
              </code>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Mobile Slot:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-xs">
                {mobileSlot || '❌ غير محدد'}
              </code>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Article Slot:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-xs">
                {articleSlot || '❌ غير محدد'}
              </code>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Footer Slot:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-xs">
                {footerSlot || '❌ غير محدد'}
              </code>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              📊 Paramètres de Test Détectés:
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded text-xs ${testModeEnabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                data-adtest: {testModeEnabled ? 'on' : 'off'}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${configComplete ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'}`}>
                Configuration: {configComplete ? 'Complète' : 'Incomplète'}
              </span>
              <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Mode: {import.meta.env.DEV ? 'Development' : 'Production'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RealAdTestPage;