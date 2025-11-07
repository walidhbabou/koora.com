import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate, Link } from "react-router-dom";
import "../styles/rtl.css";

const Footer = () => {
  const { currentLanguage, isRTL, direction } = useTranslation();
  const navigate = useNavigate();

  // Équipes populaires
  const popularTeams = [
    { id: 541, name: currentLanguage === "ar" ? "ريال مدريد" : "Real Madrid", leagueId: 140 },
    { id: 529, name: currentLanguage === "ar" ? "برشلونة" : "Barcelona", leagueId: 140 },
    { id: 33, name: currentLanguage === "ar" ? "مانشستر يونايتد" : "Manchester United", leagueId: 39 },
    { id: 40, name: currentLanguage === "ar" ? "ليفربول" : "Liverpool", leagueId: 39 },
    { id: 968, name: currentLanguage === "ar" ? "الوداد الرياضي" : "Wydad Casablanca", leagueId: 564 },
    { id: 976, name: currentLanguage === "ar" ? "الرجاء الرياضي" : "Raja Casablanca", leagueId: 564 },
  ];

  const links = {
    liens: [
      { title: currentLanguage === "ar" ? "سياسة الخصوصية" : "Politique de confidentialité", path: "/privacy" },
      { title: currentLanguage === "ar" ? "اللائحة العامة لحماية البيانات" : "RGPD", path: "/gdpr" },
      { title: currentLanguage === "ar" ? "سياسة ملفات تعريف الارتباط" : "Politique de Cookies", path: "/cookies" },
      { title: currentLanguage === "ar" ? "من نحن" : "À propos de nous", path: "/about" },
      { title: currentLanguage === "ar" ? "اتصل بنا" : "Contactez-nous", path: "/contact" },
    ],
    clubs: popularTeams.slice(0, 4).map((team) => ({
      title: team.name,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(`/team/${team.id}`, { state: { leagueId: team.leagueId } });
      },
    })),
    championnats: [
      { id: 39, title: currentLanguage === "ar" ? "الدوري الإنجليزي" : "Premier League" },
      { id: 140, title: currentLanguage === "ar" ? "الليغا" : "LaLiga" },
      { id: 135, title: currentLanguage === "ar" ? "الدوري الإيطالي" : "Serie A" },
      { id: 78, title: currentLanguage === "ar" ? "البوندسليغا" : "Bundesliga" },
    ],
  };

  return (
    <footer
      dir={direction}
      className={`bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-8 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 ${isRTL ? "text-right" : "text-left"}`}>
          {/* Logo et description */}
          <div className="md:col-span-1">
            <div className={`flex items-center gap-2 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="w-8 h-8 bg-teal-600 dark:bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <h3
                className={`text-lg font-bold text-gray-800 dark:text-gray-100 ${
                  isRTL && currentLanguage === "ar" ? "arabic-text" : ""
                }`}
              >
                {currentLanguage === "ar" ? "كورة" : "Koora"}
              </h3>
            </div>
            <p
              className={`text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4 ${
                isRTL && currentLanguage === "ar" ? "arabic-text text-right" : "text-left"
              }`}
            >
              {currentLanguage === "ar"
                ? "منصتنا توفر تغطية في الوقت الفعلي ودقيقة للأحداث الرياضية، بما في ذلك تقاويم المباريات وترتيب الفرق والنتائج المباشرة. نحن نخدم ملايين المستخدمين حول العالم بتجربة استثنائية ومعلومات دقيقة."
                : "Notre plateforme fournit une couverture en temps réel et précise des événements sportifs, y compris les calendriers des matchs, les classements des équipes et les résultats en direct. Nous servons des millions d'utilisateurs dans le monde entier avec une expérience exceptionnelle et des informations précises."}
            </p>
          </div>

          {/* Liens */}
          <div>
            <h4
              className={`text-sm font-semibold text-teal-600 dark:text-teal-400 mb-3 ${
                isRTL && currentLanguage === "ar" ? "arabic-text text-right" : "text-left"
              }`}
            >
              {currentLanguage === "ar" ? "الروابط" : "Liens"}
            </h4>
            <ul className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
              {links.liens.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(link.path);
                    }}
                    className={`text-xs text-gray-600 dark:text-gray-300 hover:text-teal-600 
                      dark:hover:text-teal-400 transition-colors cursor-pointer 
                      ${isRTL && currentLanguage === "ar" ? "arabic-text" : ""}`}
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Clubs */}
          <div>
            <h4
              className={`text-sm font-semibold text-teal-600 dark:text-teal-400 mb-3 ${
                isRTL && currentLanguage === "ar" ? "arabic-text text-right" : "text-left"
              }`}
            >
              {currentLanguage === "ar" ? "الأندية" : "Clubs"}
            </h4>
            <ul className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
              {links.clubs.map((club, index) => (
                <li key={index}>
                  <a
                    href="#"
                    onClick={club.onClick}
                    className={`text-xs text-gray-600 dark:text-gray-300 hover:text-teal-600 
                      dark:hover:text-teal-400 transition-colors cursor-pointer 
                      ${isRTL && currentLanguage === "ar" ? "arabic-text" : ""}`}
                  >
                    {club.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Championnats */}
          <div>
            <h4
              className={`text-sm font-semibold text-teal-600 dark:text-teal-400 mb-3 ${
                isRTL && currentLanguage === "ar" ? "arabic-text text-right" : "text-left"
              }`}
            >
              {currentLanguage === "ar" ? "البطولات" : "Championnats"}
            </h4>
            <ul className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
              {links.championnats.map((championship, index) => (
                <li key={index}>
                  <Link
                    to={`/standings?league=${championship.id}`}
                    className={`text-xs text-gray-600 dark:text-gray-300 hover:text-teal-600 
                      dark:hover:text-teal-400 transition-colors cursor-pointer 
                      ${isRTL && currentLanguage === "ar" ? "arabic-text" : ""}`}
                  >
                    {championship.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
