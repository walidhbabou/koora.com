import { useTranslation } from "@/hooks/useTranslation";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../styles/rtl.css";

const CookiesPolicy = () => {
  const { currentLanguage, isRTL, direction } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f8fa] dark:bg-[#181a1b]" dir={direction}>
      <SEO
        title={currentLanguage === "ar" ? "سياسة ملفات تعريف الارتباط | كورة" : "Politique de Cookies | Koora"}
        description={currentLanguage === "ar" ? "معلومات حول استخدام ملفات تعريف الارتباط على موقعنا" : "Informations sur l'utilisation des cookies sur notre site"}
      />
      <Header />
      <main className="container mx-auto flex-grow py-8 px-4">
        <div className={`bg-white dark:bg-[#23272a] rounded-lg shadow p-8 ${currentLanguage === "ar" ? "text-right" : "text-left"}`} dir={direction}>
          {currentLanguage === "ar" ? (
            <>
              <h1 className="text-2xl font-bold mb-6 text-[#1dbf73] dark:text-[#1dbf73] arabic-text" dir="rtl">
                سياسة ملفات تعريف الارتباط
              </h1>

              <section className="mb-8" dir="rtl">
                <p className="mb-4 dark:text-gray-200 arabic-text">
                  يستخدم موقع koora.com ملفات تعريف الارتباط (Cookies) لتحسين تجربة التصفح وتقديم محتوى وإعلانات مخصصة. باستخدامك للموقع، فإنك توافق على استخدامنا للكوكيز كما هو موضح في هذه السياسة.
                </p>
              </section>

              <section className="mb-8" dir="rtl">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  ما هي ملفات تعريف الارتباط؟
                </h2>
                <p className="mb-4 dark:text-gray-200 arabic-text">
                  ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارتك لموقع إلكتروني. وتُستخدم لتذكر تفضيلاتك وسلوك التصفح، مما يساعد في تحسين تجربتك.
                </p>
              </section>

              <section className="mb-8" dir="rtl">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  أنواع ملفات تعريف الارتباط التي نستخدمها
                </h2>
                <ul className="list-disc pr-6 space-y-2 dark:text-gray-200 arabic-text">
                  <li>
                    <strong>كوكيز أساسية:</strong> ضرورية لتشغيل الموقع وتمكنك من استخدام ميزاته.
                  </li>
                  <li>
                    <strong>كوكيز تحليلية:</strong> تساعدنا في فهم كيفية استخدام الزوار لموقعنا لتحسين الأداء.
                  </li>
                  <li>
                    <strong>كوكيز الإعلانات:</strong> تُستخدم لعرض إعلانات مخصصة بناءً على اهتماماتك وسلوكك.
                  </li>
                </ul>
              </section>

              <section className="mb-8" dir="rtl">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  ملفات تعريف الارتباط الخاصة بالأطراف الثالثة
                </h2>
                <p className="mb-4 dark:text-gray-200 arabic-text">
                  نستخدم خدمات إعلانية مثل Google AdMob، والتي قد تقوم بجمع معلومات باستخدام الكوكيز لعرض إعلانات مستهدفة. لمزيد من التفاصيل حول كيفية استخدام Google للبيانات، يمكنك زيارة{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    سياسة خصوصية Google
                  </a>
                  .
                </p>
              </section>

              <section className="mb-8" dir="rtl">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  كيفية إدارة ملفات تعريف الارتباط
                </h2>
                <p className="mb-4 dark:text-gray-200 arabic-text">
                  يمكنك ضبط إعدادات متصفحك لرفض الكوكيز أو تنبيهك عند إرسالها. ومع ذلك، قد يؤثر ذلك على وظائف الموقع.
                </p>
              </section>

              <section className="mb-8" dir="rtl">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  موافقتك
                </h2>
                <p className="mb-4 dark:text-gray-200 arabic-text">
                  عند زيارتك لموقعنا لأول مرة، نعرض إشعارًا يطلب موافقتك على استخدام الكوكيز. يمكنك تغيير تفضيلاتك في أي وقت من خلال إعدادات المتصفح أو من خلال رابط إعدادات الكوكيز (إذا توفر).
                </p>
              </section>

              <section className="mb-8" dir="rtl">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  حقوقك وخصوصيتك
                </h2>
                <p className="mb-4 dark:text-gray-200 arabic-text">
                  لمزيد من المعلومات حول كيفية تعاملنا مع بياناتك الشخصية، وحقوقك بموجب اللائحة العامة لحماية البيانات (GDPR)، لمعرفة حقوقك وكيف نتعامل مع بياناتك الشخصية بالتفصيل، يُرجى زيارة صفحة{" "}
                  <a
                    href="/gdpr"
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    اللائحة العامة لحماية البيانات
                  </a>
                  .
                </p>
                <p className="mb-4 dark:text-gray-200 arabic-text">
                  للمزيد من المعلومات، يُرجى التواصل معنا عبر{" "}
                  <a
                    href="mailto:privacy@koora.com"
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    privacy@koora.com
                  </a>
                </p>
              </section>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-6 text-[#1dbf73] dark:text-[#1dbf73]">
                Politique de Cookies
              </h1>

              <section className="mb-8">
                <p className="mb-4 dark:text-gray-200">
                  Le site koora.com utilise des cookies pour améliorer l'expérience de navigation et fournir du contenu et des publicités personnalisés. En utilisant le site, vous acceptez notre utilisation des cookies comme décrit dans cette politique.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Qu'est-ce qu'un cookie ?
                </h2>
                <p className="mb-4 dark:text-gray-200">
                  Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez un site web. Ils sont utilisés pour mémoriser vos préférences et votre comportement de navigation, ce qui aide à améliorer votre expérience.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Types de cookies que nous utilisons
                </h2>
                <ul className="list-disc pl-6 space-y-2 dark:text-gray-200">
                  <li>
                    <strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site et vous permettent d'utiliser ses fonctionnalités.
                  </li>
                  <li>
                    <strong>Cookies analytiques :</strong> nous aident à comprendre comment les visiteurs utilisent notre site pour améliorer les performances.
                  </li>
                  <li>
                    <strong>Cookies publicitaires :</strong> utilisés pour afficher des publicités personnalisées en fonction de vos intérêts et de votre comportement.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Cookies tiers
                </h2>
                <p className="mb-4 dark:text-gray-200">
                  Nous utilisons des services publicitaires tels que Google AdMob, qui peuvent collecter des informations à l'aide de cookies pour afficher des publicités ciblées. Pour plus de détails sur la façon dont Google utilise les données, vous pouvez consulter la{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    politique de confidentialité de Google
                  </a>
                  .
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Comment gérer les cookies
                </h2>
                <p className="mb-4 dark:text-gray-200">
                  Vous pouvez configurer les paramètres de votre navigateur pour refuser les cookies ou vous alerter lorsqu'ils sont envoyés. Cependant, cela peut affecter les fonctionnalités du site.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Votre consentement
                </h2>
                <p className="mb-4 dark:text-gray-200">
                  Lors de votre première visite sur notre site, nous affichons une notification demandant votre consentement pour l'utilisation des cookies. Vous pouvez modifier vos préférences à tout moment via les paramètres de votre navigateur ou via le lien des paramètres des cookies (si disponible).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Vos droits et votre vie privée
                </h2>
                <p className="mb-4 dark:text-gray-200">
                  Pour plus d'informations sur la façon dont nous traitons vos données personnelles et vos droits en vertu du Règlement Général sur la Protection des Données (RGPD), veuillez consulter notre page{" "}
                  <a
                    href="/gdpr"
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    RGPD
                  </a>
                  .
                </p>
                <p className="mb-4 dark:text-gray-200">
                  Pour plus d'informations, veuillez nous contacter à{" "}
                  <a
                    href="mailto:privacy@koora.com"
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    privacy@koora.com
                  </a>
                </p>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiesPolicy;
