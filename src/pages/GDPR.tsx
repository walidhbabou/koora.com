import { useTranslation } from "@/hooks/useTranslation";
import SEO from "@/components/SEO";
import "../styles/rtl.css";

const GDPR = () => {
  const { currentLanguage, isRTL, direction } = useTranslation();

  return (
    <>
      <SEO
        title={currentLanguage === "ar" ? "اللائحة العامة لحماية البيانات" : "RGPD - Protection des données"}
        description={currentLanguage === "ar" ? "التزامنا بحماية خصوصيتك وبياناتك الشخصية" : "Notre engagement pour la protection de votre vie privée et de vos données personnelles"}
      />

      <div
        dir={direction}
        className={`container mx-auto px-4 py-8 max-w-4xl ${isRTL ? "rtl" : "ltr"}`}
      >
        <article className="prose dark:prose-invert max-w-none">
          {currentLanguage === "ar" ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 arabic-text text-right">
                اللائحة العامة لحماية البيانات
              </h1>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  التزامنا بحماية خصوصيتك
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
                  نحن في koora.com نولي أهمية قصوى لحماية بياناتك الشخصية وخصوصيتك. نلتزم بتطبيق المعايير القانونية والشفافية فيما يتعلق بجمع واستخدام وتخزين البيانات وفقًا للائحة العامة لحماية البيانات (GDPR).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  البيانات التي نقوم بجمعها
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
                  عند استخدامك موقعنا، قد نقوم بجمع البيانات التالية:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mr-4 arabic-text text-right">
                  <li className="text-right">
                    <strong>بيانات شخصية:</strong> مثل الاسم، البريد الإلكتروني، وبيانات تسجيل الدخول (إذا لزم الأمر).
                  </li>
                  <li className="text-right">
                    <strong>بيانات تصفح:</strong> كملفات تعريف الارتباط (Cookies) لتحسين تجربتك على الموقع.
                  </li>
                  <li className="text-right">
                    <strong>بيانات الجهاز:</strong> معلومات عن المتصفح، نوع الجهاز، وعنوان IP.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  كيفية استخدام البيانات
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
                  نستخدم البيانات التي نجمعها من أجل:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mr-4 arabic-text text-right">
                  <li className="text-right">تحسين أداء الموقع وتجربة المستخدم.</li>
                  <li className="text-right">تخصيص المحتوى وتقديم خدمات ذات صلة.</li>
                  <li className="text-right">الامتثال للالتزامات القانونية.</li>
                  <li className="text-right">عرض الإعلانات المستهدفة بناءً على اهتماماتك.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  مشاركة البيانات
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
                  نحن لا نشارك بياناتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mr-4 arabic-text text-right">
                  <li className="text-right">الامتثال للقوانين واللوائح.</li>
                  <li className="text-right">تقديم الخدمات من خلال شركاء موثوقين، مع الالتزام بالحفاظ على سرية بياناتك.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  حقوقك كزائر
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
                  وفقًا للائحة GDPR، لديك الحقوق التالية:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mr-4 arabic-text text-right">
                  <li className="text-right">
                    <strong>الحق في الوصول:</strong> يمكنك طلب نسخة من بياناتك الشخصية التي نحتفظ بها.
                  </li>
                  <li className="text-right">
                    <strong>الحق في التصحيح:</strong> تعديل أي بيانات غير دقيقة.
                  </li>
                  <li className="text-right">
                    <strong>الحق في الحذف:</strong> طلب حذف بياناتك عند عدم وجود حاجة قانونية للاحتفاظ بها.
                  </li>
                  <li className="text-right">
                    <strong>الحق في الاعتراض:</strong> على استخدام بياناتك في أغراض معينة.
                  </li>
                  <li className="text-right">
                    <strong>الحق في نقل البيانات:</strong> طلب نقل بياناتك إلى جهة أخرى.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  تأمين البيانات
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
                  نحن نتبع أفضل الممارسات لحماية بياناتك، بما في ذلك:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mr-4 arabic-text text-right">
                  <li className="text-right">تشفير البيانات.</li>
                  <li className="text-right">تقييد الوصول إلى البيانات الشخصية.</li>
                  <li className="text-right">مراجعات دورية للأنظمة الأمنية.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  سياسة ملفات تعريف الارتباط
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
                  لمعرفة المزيد حول ملفات تعريف الارتباط وكيفية استخدامها، يُرجى زيارة صفحة{" "}
                  <a
                    href="/cookies"
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    سياسة ملفات تعريف الارتباط
                  </a>
                  .
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 arabic-text text-right">
                  اتصل بنا
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 arabic-text text-right">
                  إذا كانت لديك أي استفسارات أو رغبة في ممارسة حقوقك، يمكنك التواصل معنا عبر البريد الإلكتروني:{" "}
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
                Règlement Général sur la Protection des Données (RGPD)
              </h1>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Notre engagement pour la protection de votre vie privée
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Chez koora.com, nous accordons la plus grande importance à la protection de vos données personnelles et de votre vie privée. Nous nous engageons à appliquer les normes juridiques et la transparence concernant la collecte, l'utilisation et le stockage des données conformément au Règlement Général sur la Protection des Données (RGPD).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Données que nous collectons
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Lors de votre utilisation de notre site, nous pouvons collecter les données suivantes :
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                  <li>
                    <strong>Données personnelles :</strong> telles que le nom, l'adresse e-mail et les données de connexion (si nécessaire).
                  </li>
                  <li>
                    <strong>Données de navigation :</strong> comme les cookies pour améliorer votre expérience sur le site.
                  </li>
                  <li>
                    <strong>Données de l'appareil :</strong> informations sur le navigateur, le type d'appareil et l'adresse IP.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Comment nous utilisons les données
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Nous utilisons les données que nous collectons pour :
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                  <li>Améliorer les performances du site et l'expérience utilisateur.</li>
                  <li>Personnaliser le contenu et fournir des services pertinents.</li>
                  <li>Se conformer aux obligations légales.</li>
                  <li>Afficher des publicités ciblées en fonction de vos intérêts.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Partage des données
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Nous ne partageons pas vos données personnelles avec des tiers, sauf dans les cas suivants :
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                  <li>Pour se conformer aux lois et réglementations.</li>
                  <li>Pour fournir des services par le biais de partenaires de confiance, tout en s'engageant à maintenir la confidentialité de vos données.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Vos droits en tant que visiteur
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                  <li>
                    <strong>Droit d'accès :</strong> vous pouvez demander une copie de vos données personnelles que nous conservons.
                  </li>
                  <li>
                    <strong>Droit de rectification :</strong> corriger toute donnée inexacte.
                  </li>
                  <li>
                    <strong>Droit à l'effacement :</strong> demander la suppression de vos données lorsqu'il n'y a pas de besoin légal de les conserver.
                  </li>
                  <li>
                    <strong>Droit d'opposition :</strong> à l'utilisation de vos données à certaines fins.
                  </li>
                  <li>
                    <strong>Droit à la portabilité des données :</strong> demander le transfert de vos données à une autre partie.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Sécurité des données
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Nous suivons les meilleures pratiques pour protéger vos données, notamment :
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                  <li>Chiffrement des données.</li>
                  <li>Restriction de l'accès aux données personnelles.</li>
                  <li>Révisions périodiques des systèmes de sécurité.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Politique de cookies
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Pour en savoir plus sur les cookies et leur utilisation, veuillez consulter notre{" "}
                  <a
                    href="/cookies"
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    politique de cookies
                  </a>
                  .
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Contactez-nous
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Si vous avez des questions ou souhaitez exercer vos droits, vous pouvez nous contacter par e-mail :{" "}
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

export default GDPR;
