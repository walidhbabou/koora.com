import { Search, Home, Trophy, Newspaper, BarChart3, ArrowLeftRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserSettings } from "./UserSettings";
import ModernLanguageSwitcher from "./ModernLanguageSwitcher";
import DarkModeToggle from "./DarkModeToggle";
import { useTranslation } from "../hooks/useTranslation";
import { NAV_ITEMS } from "../config/constants";
import { useState } from "react";
import "../styles/rtl.css";
import AdminButton from "./AdminButton";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const { t, isRTL, direction, currentLanguage, setLanguage } = useTranslation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user } = useAuth();
  
  const navItemsWithIcons = [
    { ...NAV_ITEMS.find(item => item.key === 'home'), icon: Home },
    { ...NAV_ITEMS.find(item => item.key === 'matches'), icon: Trophy },
    { ...NAV_ITEMS.find(item => item.key === 'news'), icon: Newspaper },
    { ...NAV_ITEMS.find(item => item.key === 'standings'), icon: BarChart3 },
    { ...NAV_ITEMS.find(item => item.key === 'transfers'), icon: ArrowLeftRight }
  ].filter(item => item.key); // Filter out undefined items

  // Fonction pour rafraîchir la page lors du clic sur le logo
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.reload();
  };

  return (
    <div dir={direction} className={isRTL ? 'rtl' : 'ltr'}>
      {/* Desktop Header */}
      <header className="modern-header bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-all duration-300 hidden lg:block shadow-sm">
        <div className="container mx-auto px-6">
          <div className={`flex items-center justify-between h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Logo */}
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-3'}`}>
              <div 
                className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} group cursor-pointer`}
                onClick={handleLogoClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.reload();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Rafraîchir la page"
              >
                <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
                
                  <img 
                    src="/black koora.png" 
                    alt="Koora Logo" 
                    className="w-28 h-10 object-contain dark:hidden neon-glow hover:neon-glow"
                  />
                  <img 
                    src="/kooralogo.png" 
                    alt="Koora Logo" 
                    className="w-28 h-10 object-contain hidden dark:block neon-glow hover:neon-glow"
                  />
                </div>
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className={`header-nav flex ${isRTL ? 'space-x-reverse flex-row-reverse' : ''} space-x-1`}>
              {navItemsWithIcons.map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  className={`nav-link relative text-gray-700 dark:text-gray-200 hover:text-sport dark:hover:text-sport transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group ${
                    location.pathname === item.href ? 'text-sport bg-sport-10 dark:bg-sport-20' : ''
                  } ${isRTL && currentLanguage === 'ar' ? 'arabic-text' : ''}`}
                >
                  <span className={`${isRTL ? 'text-right' : 'text-left'} relative z-10 text-sm font-semibold`}>
                    {t(item.key)}
                  </span>
                  {location.pathname === item.href && (
                    <span className={`absolute bottom-1 ${isRTL ? 'right-4' : 'left-4'} right-4 w-1/2 h-0.5 bg-sport rounded-full`}></span>
                  )}
                </Link>
              ))}
              <button className="text-gray-700 dark:text-gray-200 hover:text-sport dark:hover:text-sport transition-colors p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <span className="text-lg hover:scale-110 transition-transform duration-200">•••</span>
              </button>
            </nav>

            {/* Actions */}
            <div className={`header-actions flex items-center ${isRTL ? 'space-x-reverse flex-row-reverse' : ''} space-x-4`}>
              {/* Modern Language Switcher */}
              <ModernLanguageSwitcher 
                isRTL={isRTL}
                direction={direction}
                currentLanguage={currentLanguage}
                isLanguageOpen={isLanguageOpen}
                setIsLanguageOpen={setIsLanguageOpen}
                setLanguage={setLanguage}
              />
              
              {/* Dark Mode Toggle */}
              <div className="flex items-center">
                <DarkModeToggle variant="header" size="default" />
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  placeholder={t('search')}
                  className={`search-input ${isRTL ? 'pr-12 text-right' : 'pl-12 text-left'} w-64 h-10 rounded-full bg-[hsl(var(--input))] border border-transparent text-sm placeholder:text-gray-400 focus:bg-[hsl(var(--input))] focus:border-transparent focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all duration-300 ${isRTL && currentLanguage === 'ar' ? 'arabic-text' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              
              {/* Admin Button */}
              <AdminButton isAdmin={isAdmin} />
              
              {/* Login/User Button */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-sport-10 dark:bg-sport-20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-sport" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {user?.name}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    Profil
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-sport hover:brightness-90"
                  onClick={() => navigate('/login')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Connexion
                </Button>
              )}
              
              {/* User Settings */}
              <UserSettings />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="modern-header bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-all duration-300 lg:hidden shadow-sm">
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Logo */}
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <div 
                className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} group cursor-pointer`}
                onClick={handleLogoClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.reload();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Rafraîchir la page"
              >
                  <img 
                    src="/koora-logo/image.png" 
                    alt="Koora Logo" 
                    className="w-10 h-10 sm:w-8 sm:h-8 object-contain neon-glow hover:neon-glow"
                    onError={(e) => {
                      console.log('Erreur de chargement du logo:', e);
                      // Fallback vers une icône Football si l'image ne charge pas
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = '⚽';
                      }
                    }}
                  />
               
                <div className="hidden sm:flex flex-col">
                  <img 
                    src="/koora-logo/black-logo.png" 
                    alt="Koora Logo" 
                    className="w-20 h-7 object-contain neon-glow hover:neon-glow"
                    onError={(e) => {
                      console.log('Erreur de chargement du logo texte:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className={`flex items-center ${isRTL ? 'space-x-reverse flex-row-reverse' : ''} space-x-2`}>
              {/* Modern Language Switcher - Mobile */}
              <ModernLanguageSwitcher 
                mobile={true}
                isRTL={isRTL}
                direction={direction}
                currentLanguage={currentLanguage}
                isLanguageOpen={isLanguageOpen}
                setIsLanguageOpen={setIsLanguageOpen}
                setLanguage={setLanguage}
              />
              
              {/* Dark Mode Toggle - Mobile */}
              <DarkModeToggle variant="header" size="sm" />
              
              {/* Search Icon */}
              <Button variant="ghost" size="icon" className="rounded-full bg-[hsl(var(--input))] hover:bg-sport-10 hover:text-sport transition-all duration-300">
                <Search className="w-5 h-5" />
              </Button>
              
              {/* Admin Button - Mobile */}
              <AdminButton isAdmin={isAdmin} className="hidden sm:flex" />
              
              {/* Login Button - Mobile */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/login')}
                className="rounded-full bg-[hsl(var(--input))] hover:bg-sport-10 hover:text-sport transition-all duration-300"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className={`mobile-nav flex items-center justify-around px-2 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {navItemsWithIcons.slice(0, 6).map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.key}
                to={item.href}
                className={`mobile-nav-item flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-all duration-300 rounded-lg ${
                  isActive 
                    ? 'text-sport bg-sport-10 dark:bg-sport-20 active' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-sport dark:hover:text-sport hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  isActive ? 'bg-sport-10 dark:bg-sport-20' : 'hover:bg-sport-10'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-1 font-medium truncate w-full text-center leading-tight ${isRTL ? 'text-right' : 'text-left'} ${isRTL && currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spacer for mobile bottom navigation */}
      <div className="lg:hidden h-16"></div>
      
      {/* Login Modal removed: navigation to /login now */}
    </div>
  );
};

export default Header;