import { Search, Home, Trophy, Newspaper, BarChart3, Video, ArrowLeftRight, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { UserSettings } from "./UserSettings";
import { useTranslation } from "../hooks/useTranslation";
import { NAV_ITEMS, LanguageCode } from "../config/constants";
import { useState } from "react";

const Header = () => {
  const location = useLocation();
  const { t, isRTL, direction, currentLanguage, setLanguage } = useTranslation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  
  const languages = [
    //{ code: 'fr' as LanguageCode, name: 'Français', flag: '🇫🇷' },
    { code: 'ar' as LanguageCode, name: 'العربية', flag: '🇲🇦' },
    //{ code: 'en' as LanguageCode, name: 'English', flag: '🇺🇸' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];
  
  const navItemsWithIcons = [
    { ...NAV_ITEMS.find(item => item.key === 'home')!, icon: Home },
    { ...NAV_ITEMS.find(item => item.key === 'matches')!, icon: Trophy },
    { ...NAV_ITEMS.find(item => item.key === 'news')!, icon: Newspaper },
    { ...NAV_ITEMS.find(item => item.key === 'standings')!, icon: BarChart3 },
    //{ ...NAV_ITEMS.find(item => item.key === 'videos')!, icon: Video },
    { ...NAV_ITEMS.find(item => item.key === 'transfers')!, icon: ArrowLeftRight }
  ];

  const ModernLanguageSwitcher = ({ mobile = false }) => (
    <div className="relative">
      <Button
        variant="ghost"
        size={mobile ? "sm" : "default"}
        onClick={() => setIsLanguageOpen(!isLanguageOpen)}
        className={`
          ${mobile ? 'h-8 px-2' : 'h-10 px-3'} 
          bg-gradient-to-r from-teal-50 to-teal-50 
          hover:from-teal-100 hover:to-teal-100 
          border border-teal-200 
          transition-all duration-300 
          hover:shadow-lg hover:scale-105
          text-foreground hover:text-teal-600
          backdrop-blur-sm
        `}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentLang.flag}</span>
          {!mobile && (
            <span className="font-medium text-sm">{currentLang.code.toUpperCase()}</span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`} />
        </div>
      </Button>

      {/* Dropdown Menu */}
      {isLanguageOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsLanguageOpen(false)}
          />
          
          {/* Menu */}
          <div className={`
            absolute ${mobile ? 'right-0' : isRTL ? 'left-0' : 'right-0'} 
            top-full mt-2 z-50
            bg-background/95 backdrop-blur-xl 
            border border-border/50 
            rounded-xl shadow-2xl 
            overflow-hidden
            min-w-[160px]
            animate-in fade-in-0 zoom-in-95 duration-200
          `}>
            <div className="p-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsLanguageOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 
                    rounded-lg transition-all duration-200
                    hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-100
                    hover:shadow-md
                    ${currentLanguage === lang.code 
                      ? 'bg-gradient-to-r from-teal-100 to-teal-100 text-teal-600' 
                      : 'text-foreground hover:text-teal-600'
                    }
                  `}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="font-medium text-sm">{lang.name}</span>
                    <span className="text-xs text-muted-foreground uppercase">
                      {lang.code}
                    </span>
                  </div>
                  {currentLanguage === lang.code && (
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-300 hidden lg:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <img 
                    src="/koora-logo/image.png" 
                    alt="Koora Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <img 
                  src="/public/koora-logo/black-logo.png" 
                  alt="Koora Logo" 
                  className="w-24 h-8 object-contain"
                />
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-8`}>
              {navItemsWithIcons.map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  className={`relative text-foreground hover:text-teal-600 transition-all duration-300 font-medium py-2 px-1 group ${
                    location.pathname === item.href ? 'text-teal-600' : ''
                  }`}
                >
                  {t(item.key)}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 transform transition-transform duration-300 ${
                    location.pathname === item.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </Link>
              ))}
              <button className="text-foreground hover:text-teal-600 transition-colors">
                <span className="text-2xl hover:scale-110 transition-transform duration-200">•••</span>
              </button>
            </nav>

            {/* Actions */}
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
              {/* Modern Language Switcher */}
              <ModernLanguageSwitcher />
              
              {/* Search */}
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`} />
                <Input
                  placeholder={t('search')}
                  className={`${isRTL ? 'pr-10' : 'pl-10'} w-48 lg:w-64 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background focus:border-teal-500 transition-all duration-300`}
                />
              </div>
              
              {/* Login Button */}
              <Button variant="default" className="bg-teal-600 hover:bg-teal-700 hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium px-4 lg:px-6 text-white">
                {t('login')}
              </Button>
              
              {/* User Settings */}
              <UserSettings />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-300 lg:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sport-green to-sport-blue flex items-center justify-center shadow-md">
                  <img 
                    src="/koora-logo/image.png" 
                    alt="Koora Logo" 
                    className="w-6 h-6 object-contain filter brightness-0 invert"
                  />
                </div>
                <img 
                  src="/public/koora-logo/black-logo.png" 
                  alt="Koora Logo" 
                  className="w-16 h-6 object-contain hidden sm:block"
                />
              </div>
            </div>

            {/* Mobile Actions */}
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
              {/* Modern Language Switcher - Mobile */}
              <ModernLanguageSwitcher mobile={true} />
              
              {/* Search Icon */}
              <Button variant="ghost" size="icon" className="hover:bg-teal-50 hover:text-teal-600 transition-all duration-300">
                <Search className="w-5 h-5" />
              </Button>
              
              {/* Login Button - Compact */}
              <Button variant="default" className="bg-teal-600 hover:bg-teal-700 hover:shadow-lg transition-all duration-300 font-medium px-3 py-1 text-sm text-white">
                {t('loginShort')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {navItemsWithIcons.slice(0, 6).map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.key}
                to={item.href}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-all duration-300 ${
                  isActive 
                    ? 'text-teal-600' 
                    : 'text-muted-foreground hover:text-teal-600'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                  isActive ? 'bg-teal-50' : 'hover:bg-teal-50'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1 font-medium truncate w-full text-center leading-tight">
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spacer for mobile bottom navigation */}
      <div className="lg:hidden h-16"></div>
    </>
  );
};

export default Header;