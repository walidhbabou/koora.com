import React from 'react';
import { HeaderAd, SidebarAd, MobileAd, InArticleAd, FooterAd, SponsorsSection } from './AdWrapper';
import GoogleAdSense from './GoogleAdSense';

const AdTestPage: React.FC = () => {
  const testMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';
  const client = import.meta.env.VITE_ADSENSE_CLIENT;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header avec info test */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            صفحة اختبار الإعلانات
          </h1>
          <div className="bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200 mb-2">
              <strong>وضع الاختبار:</strong> {testMode ? 'مُفعل ✅' : 'غير مُفعل ❌'}
            </p>
            <p className="text-blue-800 dark:text-blue-200 mb-2">
              <strong>معرف العميل:</strong> {client || 'غير محدد'}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              في وضع الاختبار، ستظهر مساحات إعلانية وهمية بدلاً من الإعلانات الحقيقية
            </p>
          </div>
        </div>

        {/* Header Ad */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            إعلان الهيدر (Leaderboard 728x90)
          </h2>
          <HeaderAd testMode={testMode} />
        </section>

        {/* Layout avec sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {/* Mobile Ad */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                إعلان الموبايل (Mobile Banner 320x100)
              </h2>
              <MobileAd testMode={testMode} />
            </section>

            {/* Article simulé avec In-Article Ad */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                مقال مع إعلان داخلي
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  عنوان المقال
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  هذا نص تجريبي لمحاكاة مقال. يظهر الإعلان الداخلي في وسط المحتوى...
                </p>
                
                {/* In-Article Ad */}
                <InArticleAd testMode={testMode} />
                
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  باقي نص المقال يأتي هنا بعد الإعلان الداخلي...
                </p>
              </div>
            </section>

            {/* Tests des formats individuels */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                اختبار أشكال الإعلانات المختلفة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rectangle */}
                <div>
                  <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                    Rectangle (300x250)
                  </h3>
                  <GoogleAdSense
                    client={client}
                    slot={import.meta.env.VITE_ADSENSE_SIDEBAR_SLOT}
                    format="rectangle"
                    testMode={testMode}
                  />
                </div>

                {/* Large Rectangle */}
                <div>
                  <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                    Large Rectangle (336x280)
                  </h3>
                  <GoogleAdSense
                    client={client}
                    slot={import.meta.env.VITE_ADSENSE_SIDEBAR_SLOT}
                    format="large-rectangle"
                    testMode={testMode}
                  />
                </div>

                {/* Banner */}
                <div>
                  <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                    Banner (320x50)
                  </h3>
                  <GoogleAdSense
                    client={client}
                    slot={import.meta.env.VITE_ADSENSE_MOBILE_SLOT}
                    format="banner"
                    testMode={testMode}
                  />
                </div>

                {/* Responsive */}
                <div>
                  <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                    Responsive
                  </h3>
                  <GoogleAdSense
                    client={client}
                    slot={import.meta.env.VITE_ADSENSE_HEADER_SLOT}
                    format="responsive"
                    testMode={testMode}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                إعلان الشريط الجانبي
              </h2>
              <SidebarAd testMode={testMode} />
            </section>

            {/* Sponsors Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                قسم الرعاة المحليين
              </h2>
              <SponsorsSection maxSponsors={4} title="شركاؤنا" />
            </section>
          </div>
        </div>

        {/* Footer Ad */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            إعلان الفوتر (Leaderboard 728x90)
          </h2>
          <FooterAd testMode={testMode} />
        </section>

        {/* Informations de configuration */}
        <section className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            معلومات التكوين
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Client ID:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded">
                {import.meta.env.VITE_ADSENSE_CLIENT || 'غير محدد'}
              </code>
            </div>
            <div>
              <strong>Header Slot:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded">
                {import.meta.env.VITE_ADSENSE_HEADER_SLOT || 'غير محدد'}
              </code>
            </div>
            <div>
              <strong>Sidebar Slot:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded">
                {import.meta.env.VITE_ADSENSE_SIDEBAR_SLOT || 'غير محدد'}
              </code>
            </div>
            <div>
              <strong>Mobile Slot:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded">
                {import.meta.env.VITE_ADSENSE_MOBILE_SLOT || 'غير محدد'}
              </code>
            </div>
            <div>
              <strong>Article Slot:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded">
                {import.meta.env.VITE_ADSENSE_ARTICLE_SLOT || 'غير محدد'}
              </code>
            </div>
            <div>
              <strong>Footer Slot:</strong><br />
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded">
                {import.meta.env.VITE_ADSENSE_FOOTER_SLOT || 'غير محدد'}
              </code>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdTestPage;