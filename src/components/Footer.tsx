import { useTranslation } from "@/hooks/useTranslation";

const Footer = () => {
  const { currentLanguage } = useTranslation();

  const links = {
    liens: [
      {
        title: currentLanguage === 'ar' ? 'تحميل التطبيق' : 'Télécharger l\'application',
        href: '#'
      },
      {
        title: currentLanguage === 'ar' ? 'كورة' : 'Kora',
        href: '#'
      },
      {
        title: currentLanguage === 'ar' ? 'سياسة الخصوصية' : 'Politique de confidentialité',
        href: '#'
      },
      {
        title: currentLanguage === 'ar' ? 'من نحن' : 'À propos de nous',
        href: '#'
      },
      {
        title: currentLanguage === 'ar' ? 'اتصل بنا' : 'Contactez-nous',
        href: '#'
      }
    ],
    clubs: [
      {
        title: currentLanguage === 'ar' ? 'ريال مدريد' : 'Real Madrid',
        href: '#'
      },
      {
        title: currentLanguage === 'ar' ? 'برشلونة' : 'Barcelone',
        href: '#'
      },
      {
        title: currentLanguage === 'ar' ? 'ليفربول' : 'Liverpool',
        href: '#'
      },
      {
        title: currentLanguage === 'ar' ? 'مانشستر سيتي' : 'Manchester City',
        href: '#'
      }
    ],
    championnats: [
      {
        title: currentLanguage === 'ar' ? 'الدوري الإنجليزي' : 'Premier League',
        href: '#'
      },
      {
        title: currentLanguage === 'ar' ? 'الليغا' : 'LaLiga',
        href: '#'
      },
      {
        title: currentLanguage === 'ar' ? 'الدوري الإيطالي' : 'Serie A',
        href: '#'
      },
      {
        title: currentLanguage === 'ar' ? 'البوندسليغا' : 'Bundesliga',
        href: '#'
      }
    ]
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-8">
      {/* Section principale */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Section Logo et Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {currentLanguage === 'ar' ? 'كورة' : 'Koora'}
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              {currentLanguage === 'ar' 
                ? 'منصتنا توفر تغطية في الوقت الفعلي ودقيقة للأحداث الرياضية، بما في ذلك تقاويم المباريات وترتيب الفرق والنتائج المباشرة. نحن نخدم ملايين المستخدمين حول العالم بتجربة استثنائية ومعلومات دقيقة.'
                : 'Notre plateforme fournit une couverture en temps réel et précise des événements sportifs, y compris les calendriers des matchs, les classements des équipes et les résultats en direct. Nous servons des millions d\'utilisateurs dans le monde entier avec une expérience exceptionnelle et des informations précises.'
              }
            </p>
            
            {/* Boutons d'application */}
            <div className="flex flex-col sm:flex-row gap-2">
              <a href="#" className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg text-xs hover:bg-gray-800 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 15.3414c-.5511 0-.8206-.3077-.8206-.9231V9.6923c0-.6154.2695-.9231.8206-.9231s.8206.3077.8206.9231v4.7260c0 .6154-.2695.9231-.8206.9231z"/>
                </svg>
                <div>
                  <div className="text-xs opacity-75">
                    {currentLanguage === 'ar' ? 'احصل عليه من' : 'Télécharger sur'}
                  </div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
              
              <a href="#" className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg text-xs hover:bg-gray-800 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <div className="text-xs opacity-75">
                    {currentLanguage === 'ar' ? 'احصل عليه من' : 'Télécharger sur'}
                  </div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>
            </div>
          </div>

          {/* Section Liens */}
          <div>
            <h4 className="text-sm font-semibold text-teal-600 mb-3">
              {currentLanguage === 'ar' ? 'الروابط' : 'Liens'}
            </h4>
            <ul className="space-y-2">
              {links.liens.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-xs text-gray-600 hover:text-teal-600 transition-colors">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Section Clubs */}
          <div>
            <h4 className="text-sm font-semibold text-teal-600 mb-3">
              {currentLanguage === 'ar' ? 'الأندية' : 'Clubs'}
            </h4>
            <ul className="space-y-2">
              {links.clubs.map((club, index) => (
                <li key={index}>
                  <a href={club.href} className="text-xs text-gray-600 hover:text-teal-600 transition-colors">
                    {club.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Section Championnats */}
          <div>
            <h4 className="text-sm font-semibold text-teal-600 mb-3">
              {currentLanguage === 'ar' ? 'البطولات' : 'Championnats'}
            </h4>
            <ul className="space-y-2">
              {links.championnats.map((championship, index) => (
                <li key={index}>
                  <a href={championship.href} className="text-xs text-gray-600 hover:text-teal-600 transition-colors">
                    {championship.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Section copyright et réseaux sociaux */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-xs text-teal-600 font-medium">
              © 2025 {currentLanguage === 'ar' ? 'كورة' : 'kora'}. {currentLanguage === 'ar' ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}.
            </div>

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors group">
                <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              
              <a href="#" className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors group">
                <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              <a href="#" className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors group">
                <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              
              <a href="#" className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors group">
                <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
