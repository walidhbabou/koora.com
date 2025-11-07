import { useTranslation } from "@/hooks/useTranslation";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../styles/rtl.css";

const GDPR = () => {
  const { currentLanguage, isRTL, direction } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f8fa] dark:bg-[#181a1b]" dir={direction}>
      <SEO
        title={currentLanguage === "ar" ? "اللائحة العامة لحماية البيانات | كورة" : "RGPD - Protection des données | Koora"}
        description={currentLanguage === "ar" ? "التزامنا بحماية خصوصيتك وبياناتك الشخصية" : "Notre engagement pour la protection de votre vie privée et de vos données personnelles"}
      />
      <Header />
      <main className="container mx-auto flex-grow py-8 px-4">
        <div className={`bg-white dark:bg-[#23272a] rounded-lg shadow p-8 ${isRTL && currentLanguage === "ar" ? "text-right" : "text-left"}`} dir={direction}>
          {currentLanguage === "ar" ? (
            <>
              <h1 className="text-2xl font-bold mb-6 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                اللائحة العامة لحماية البيانات
              </h1>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  التزامنا بحماية خصوصيتك
                </h2>
                <p className="mb-4 dark:text-gray-200 arabic-text">
                  نحن في koora.com نولي أهمية قصوى لحماية بياناتك الشخصية وخصوصيتك. نلتزم بتطبيق المعايير القانونية والشفافية فيما يتعلق بجمع واستخدام وتخزين البيانات وفقًا للائحة العامة لحماية البيانات (GDPR).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  البيانات التي نقوم بجمعها
                </h2>
                <p className="mb-4 dark:text-gray-200 arabic-text">
                  عند استخدامك موقعنا، قد نقوم بجمع البيانات التالية:
                </p>
                <ul className="list-disc pr-6 space-y-2 dark:text-gray-200 arabic-text">
                  <li>
                    <strong>بيانات شخصية:</strong> مثل الاسم، البريد الإلكتروني، وبيانات تسجيل الدخول (إذا لزم الأمر).
                  </li>
                  <li>
                    <strong>بيانات تصفح:</strong> كملفات تعريف الارتباط (Cookies) لتحسين تجربتك على الموقع.
                  </li>
                  <li>
                    <strong>بيانات الجهاز:</strong> معلومات عن المتصفح، نوع الجهاز، وعنوان IP.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  كيفية استخدام البيانات
                </h2>
                <p className="mb-4 dark:text-gray-200 arabic-text">
                  نستخدم البيانات التي نجمعها من أجل:
                </p>
                <ul className="list-disc pr-6 space-y-2 dark:text-gray-200 arabic-text">
                  <li>تحسين أداء الموقع وتجربة المستخدم.</li>
                  <li>تخصيص المحتوى وتقديم خدمات ذات صلة.</li>
                  <li>الامتثال للالتزامات القانونية.</li>
                  <li>عرض الإعلانات المستهدفة بناءً على اهتماماتك.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  مشاركة البيانات
                </h2>
                <p className="mb-4 dark:text-gray-200 arabic-text">
                  نحن لا نشارك بياناتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
                </p>
                <ul className="list-disc pr-6 space-y-2 dark:text-gray-200 arabic-text">
                  <li>الامتثال للقوانين واللوائح.</li>
                  <li>تقديم الخدمات من خلال شركاء موثوقين، مع الالتزام بالحفاظ على سرية بياناتك.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  حقوقك كزائر
                </h2>
                <p className="mb-4 dark:text-gray-200 arabic-text">
                  وفقًا للائحة GDPR، لديك الحقوق التالية:
                </p>
                <ul className="list-disc pr-6 space-y-2 dark:text-gray-200 arabic-text">
                  <li>
                    <strong>الحق في الوصول:</strong> يمكنك طلب نسخة من بياناتك الشخصية التي نحتفظ بها.
                  </li>
                  <li>
                    <strong>الحق في التصحيح:</strong> تعديل أي بيانات غير دقيقة.
                  </li>
                  <li>
                    <strong>الحق في الحذف:</strong> طلب حذف بياناتك عند عدم وجود حاجة قانونية للاحتفاظ بها.
                  </li>
                  <li>
                    <strong>الحق في الاعتراض:</strong> على استخدام بياناتك في أغراض معينة.
                  </li>
                  <li>
                    <strong>الحق في نقل البيانات:</strong> طلب نقل بياناتك إلى جهة أخرى.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  تأمين البيانات
                </h2>
                <p className="mb-4 dark:text-gray-200 arabic-text">
                  نحن نتبع أفضل الممارسات لحماية بياناتك، بما في ذلك:
                </p>
                <ul className="list-disc pr-6 space-y-2 dark:text-gray-200 arabic-text">
                  <li>تشفير البيانات.</li>
                  <li>تقييد الوصول إلى البيانات الشخصية.</li>
                  <li>مراجعات دورية للأنظمة الأمنية.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  سياسة ملفات تعريف الارتباط
                </h2>
                <p className="mb-4 dark:text-gray-200 arabic-text">
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
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73] arabic-text">
                  اتصل بنا
                </h2>
                <p className="mb-4 dark:text-gray-200 arabic-text">
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
              <h1 className="text-2xl font-bold mb-6 text-[#1dbf73] dark:text-[#1dbf73]">
                Règlement Général sur la Protection des Données (RGPD)
              </h1>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Notre engagement pour la protection de votre vie privée
                </h2>
                <p className="mb-4 dark:text-gray-200">
                  Chez koora.com, nous accordons la plus grande importance à la protection de vos données personnelles et de votre vie privée. Nous nous engageons à appliquer les normes juridiques et la transparence concernant la collecte, l'utilisation et le stockage des données conformément au Règlement Général sur la Protection des Données (RGPD).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Données que nous collectons
                </h2>
                <p className="mb-4 dark:text-gray-200">
                  Lors de votre utilisation de notre site, nous pouvons collecter les données suivantes :
                </p>
                <ul className="list-disc pl-6 space-y-2 dark:text-gray-200">
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
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Comment nous utilisons les données
                </h2>
                <p className="mb-4 dark:text-gray-200">
                  Nous utilisons les données que nous collectons pour :
                </p>
                <ul className="list-disc pl-6 space-y-2 dark:text-gray-200">
                  <li>Améliorer les performances du site et l'expérience utilisateur.</li>
                  <li>Personnaliser le contenu et fournir des services pertinents.</li>
                  <li>Se conformer aux obligations légales.</li>
                  <li>Afficher des publicités ciblées en fonction de vos intérêts.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Partage des données
                </h2>
                <p className="mb-4 dark:text-gray-200">
                  Nous ne partageons pas vos données personnelles avec des tiers, sauf dans les cas suivants :
                </p>
                <ul className="list-disc pl-6 space-y-2 dark:text-gray-200">
                  <li>Pour se conformer aux lois et réglementations.</li>
                  <li>Pour fournir des services par le biais de partenaires de confiance, tout en s'engageant à maintenir la confidentialité de vos données.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Vos droits en tant que visiteur
                </h2>
                <p className="mb-4 dark:text-gray-200">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc pl-6 space-y-2 dark:text-gray-200">
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
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Sécurité des données
                </h2>
                <p className="mb-4 dark:text-gray-200">
                  Nous suivons les meilleures pratiques pour protéger vos données, notamment :
                </p>
                <ul className="list-disc pl-6 space-y-2 dark:text-gray-200">
                  <li>Chiffrement des données.</li>
                  <li>Restriction de l'accès aux données personnelles.</li>
                  <li>Révisions périodiques des systèmes de sécurité.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Politique de cookies
                </h2>
                <p className="mb-4 dark:text-gray-200">
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
                <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]">
                  Contactez-nous
                </h2>
                <p className="mb-4 dark:text-gray-200">
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GDPR;
