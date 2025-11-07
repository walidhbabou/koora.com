import { useTranslation } from "@/hooks/useTranslation";
import SEO from "@/components/SEO";
import "../styles/rtl.css";

const CookiesPolicy = () => {
  const { currentLanguage, isRTL, direction } = useTranslation();

  return (
    <>
      <SEO
        title={currentLanguage === "ar" ? "سياسة ملفات تعريف الارتباط" : "Politique de Cookies"}
        description={currentLanguage === "ar" ? "معلومات حول استخدام ملفات تعريف الارتباط على موقعنا" : "Informations sur l'utilisation des cookies sur notre site"}
      />

      <div
        dir={direction}
        className={`container mx-auto px-4 py-8 max-w-4xl ${isRTL ? "rtl" : "ltr"}`}
      >
        <article className="prose dark:prose-invert max-w-none">
          {currentLanguage === "ar" ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 arabic-text text-right">
                سياسة ملفات تعريف الارتباط
              </h1>

              <section className="mb-8">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
                  يستخدم موقع koora.com ملفات تعريف الارتباط (Cookies) لتحسين تجربة التصفح وتقديم محتوى وإعلانات مخصصة. باستخدامك للموقع، فإنك توافق على استخدامنا للكوكيز كما هو موضح في هذه السياسة.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  ما هي ملفات تعريف الارتباط؟
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
                  ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارتك لموقع إلكتروني. وتُستخدم لتذكر تفضيلاتك وسلوك التصفح، مما يساعد في تحسين تجربتك.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  أنواع ملفات تعريف الارتباط التي نستخدمها
                </h2>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-3 mr-4 arabic-text text-right">
                  <li className="text-right">
                    <strong>كوكيز أساسية:</strong> ضرورية لتشغيل الموقع وتمكنك من استخدام ميزاته.
                  </li>
                  <li className="text-right">
                    <strong>كوكيز تحليلية:</strong> تساعدنا في فهم كيفية استخدام الزوار لموقعنا لتحسين الأداء.
                  </li>
                  <li className="text-right">
                    <strong>كوكيز الإعلانات:</strong> تُستخدم لعرض إعلانات مخصصة بناءً على اهتماماتك وسلوكك.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  ملفات تعريف الارتباط الخاصة بالأطراف الثالثة
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
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

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  كيفية إدارة ملفات تعريف الارتباط
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
                  يمكنك ضبط إعدادات متصفحك لرفض الكوكيز أو تنبيهك عند إرسالها. ومع ذلك، قد يؤثر ذلك على وظائف الموقع.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  موافقتك
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
                  عند زيارتك لموقعنا لأول مرة، نعرض إشعارًا يطلب موافقتك على استخدام الكوكيز. يمكنك تغيير تفضيلاتك في أي وقت من خلال إعدادات المتصفح أو من خلال رابط إعدادات الكوكيز (إذا توفر).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  حقوقك وخصوصيتك
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
                  لمزيد من المعلومات حول كيفية تعاملنا مع بياناتك الشخصية، وحقوقك بموجب اللائحة العامة لحماية البيانات (GDPR)، لمعرفة حقوقك وكيف نتعامل مع بياناتك الشخصية بالتفصيل، يُرجى زيارة صفحة{" "}
                  <a
                    href="/gdpr"
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    اللائحة العامة لحماية البيانات
                  </a>
                  .
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Politique de Cookies
              </h1>

              <section className="mb-8">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Le site koora.com utilise des cookies pour améliorer l'expérience de navigation et fournir du contenu et des publicités personnalisés. En utilisant le site, vous acceptez notre utilisation des cookies comme décrit dans cette politique.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Qu'est-ce qu'un cookie ?
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez un site web. Ils sont utilisés pour mémoriser vos préférences et votre comportement de navigation, ce qui aide à améliorer votre expérience.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Types de cookies que nous utilisons
                </h2>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-3 ml-4">
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
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Cookies tiers
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
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
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Comment gérer les cookies
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Vous pouvez configurer les paramètres de votre navigateur pour refuser les cookies ou vous alerter lorsqu'ils sont envoyés. Cependant, cela peut affecter les fonctionnalités du site.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Votre consentement
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Lors de votre première visite sur notre site, nous affichons une notification demandant votre consentement pour l'utilisation des cookies. Vous pouvez modifier vos préférences à tout moment via les paramètres de votre navigateur ou via le lien des paramètres des cookies (si disponible).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Vos droits et votre vie privée
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Pour plus d'informations sur la façon dont nous traitons vos données personnelles et vos droits en vertu du Règlement Général sur la Protection des Données (RGPD), veuillez consulter notre page{" "}
                  <a
                    href="/gdpr"
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    RGPD
                  </a>
                  .
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
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
        </article>
      </div>
    </>
  );
};

export default CookiesPolicy;
