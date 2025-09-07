import { Search, Home, Trophy, Newspaper, BarChart3, ArrowLeftRight } from "lucide-react";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { UserSettings } from "./UserSettings";
// Language switcher and dark mode moved into UserSettings
import { useTranslation } from "../hooks/useTranslation";
import { NAV_ITEMS } from "../config/constants";
import "../styles/rtl.css";
import AdminButton from "./AdminButton";
import { useAuth } from "../contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Header = () => {
  const location = useLocation();
  const { t, isRTL, direction, currentLanguage } = useTranslation();
  const { isAdmin } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
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

  // Scroll to top when clicking any nav link (desktop or mobile)
  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div dir={direction} className={isRTL ? 'rtl' : 'ltr'}>
      {/* Desktop Header */}
      <header className="modern-header sticky top-0 z-50 hidden lg:block backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:border-slate-700/70 bg-white/85 dark:bg-slate-900/80">
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
                <div className="flex items-center space-x-2 transition-all duration-300 group-hover:opacity-90 group-hover:scale-[1.01]">
                
                  <img 
                    src="/black koora.png" 
                    alt="Koora Logo" 
                    className="w-36 h-12 sm:w-28 sm:h-10 object-contain dark:hidden neon-glow group-hover:drop-shadow-[0_4px_12px_rgba(16,185,129,0.35)]"
                  />
                  <img 
                    src="/kooralogo.png" 
                    alt="Koora Logo" 
                    className="w-36 h-12 sm:w-28 sm:h-10 object-contain hidden dark:block neon-glow group-hover:drop-shadow-[0_4px_12px_rgba(16,185,129,0.35)]"
                  />
                </div>
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className={`header-nav flex ${isRTL ? 'space-x-reverse flex-row-reverse' : ''} space-x-1 overflow-x-auto no-scrollbar px-1`}>
              {navItemsWithIcons.map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  onClick={scrollToTop}
                  className={`nav-link relative text-slate-700 dark:text-gray-200 transition-all duration-300 font-semibold py-2.5 px-3 lg:px-4 rounded-xl group ${
                    location.pathname === item.href 
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/20 shadow-[inset_0_-2px_0_0_rgba(16,185,129,0.6)]' 
                      : 'hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-gray-800'
                  } ${isRTL && currentLanguage === 'ar' ? 'arabic-text' : ''}`}
                >
                  <span className={`${isRTL ? 'text-right' : 'text-left'} relative z-10 text-sm font-semibold whitespace-nowrap`}>
                    {t(item.key)}
                  </span>
                  <span className={`pointer-events-none absolute ${isRTL ? 'right-3' : 'left-3'} bottom-1 h-0.5 rounded-full transition-all duration-300 ${
                    location.pathname === item.href ? 'w-8 bg-emerald-500' : 'w-0 bg-transparent group-hover:w-6 group-hover:bg-emerald-400'
                  }`}></span>
                </Link>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-emerald-600 dark:text-emerald-400 transition-all p-3 rounded-lg hover:bg-slate-100/70 dark:hover:bg-gray-800 hover:scale-105">
                    <span className="text-lg">•••</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isRTL ? "end" : "start"}
                  className={`rounded-xl border-slate-200 shadow-lg p-1 ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <Link to="/about">
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2 px-3 text-[15px] font-semibold hover:bg-slate-100">
                      من نحن
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/contact">
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2 px-3 text-[15px] font-semibold hover:bg-slate-100">
                      اتصل بنا
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/privacy">
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2 px-3 text-[15px] font-semibold hover:bg-slate-100">
                      سياسة الخصوصية
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Actions */}
            <div className={`header-actions flex items-center ${isRTL ? 'space-x-reverse flex-row-reverse' : ''} space-x-2 lg:space-x-4`}>            
              {/* Search */}
              <div className="relative hidden xl:block">
                <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  placeholder={t('search')}
                  className={`search-input ${isRTL ? 'pr-12 text-right' : 'pl-12 text-left'} w-48 xl:w-64 h-10 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-700 focus:border-emerald-300 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-300 ${isRTL && currentLanguage === 'ar' ? 'arabic-text' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              
              {/* Search Button for smaller screens */}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                className="xl:hidden w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300"
              >
                <Search className="w-4 h-4" />
              </Button>
              
              {/* Admin Button */}
              <AdminButton isAdmin={isAdmin} />
              
              {/* User Settings */}
              <UserSettings />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="modern-header lg:hidden sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-700/60 shadow-sm">
        <div className="container mx-auto px-2 sm:px-3">
          <div className={`flex items-center justify-between h-16 sm:h-18 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Logo */}
            <div className={`flex items-center flex-shrink-0 ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
              <div 
                className={`flex items-center flex-shrink-0 group cursor-pointer`}
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
                {/* Logo principal - visible sur tous les écrans */}
                <div className="flex items-center">
                  <img 
                    src="/black koora.png" 
                    alt="Koora Logo" 
                    className="h-13 sm:h-10 w-auto object-contain dark:hidden neon-glow group-hover:drop-shadow-[0_4px_12px_rgba(16,185,129,0.35)]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <img 
                    src="/kooralogo.png" 
                    alt="Koora Logo" 
                    className="h-13 sm:h-10 w-auto object-contain hidden dark:block neon-glow group-hover:drop-shadow-[0_4px_12px_rgba(16,185,129,0.35)]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Texte du logo - visible sur écrans plus grands */}
                <div className="hidden sm:flex items-center ml-2">
                  <span className={`text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 ${isRTL && currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
                    {currentLanguage === 'ar' ? 'كورة' : 'KOORA'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className={`flex items-center gap-1 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Search Icon */}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                onClick={() => setMobileSearchOpen(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              
              {/* Admin Button - Mobile (show only from sm+) */}
              <AdminButton isAdmin={isAdmin} className="hidden sm:flex" />
              
              {/* User Settings */}
              <UserSettings />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSearchOpen(false)}>
          <div className="w-full max-w-sm sm:max-w-md mt-16 sm:mt-20" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 shadow-xl border border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  autoFocus
                  placeholder={t('search')}
                  className={`${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3 text-left'} w-full h-10 sm:h-11 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-600 focus:border-emerald-300 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 ${isRTL && currentLanguage === 'ar' ? 'arabic-text' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              {/* Suggestions ou résultats de recherche pourraient être ajoutés ici */}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className={`mobile-nav flex items-center justify-around px-1 sm:px-2 py-2 sm:py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {navItemsWithIcons.slice(0, 5).map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.key}
                to={item.href}
                onClick={scrollToTop}
                className={`mobile-nav-item flex flex-col items-center justify-center min-w-0 flex-1 py-1 sm:py-2 px-1 transition-all duration-300 rounded-lg ${
                  isActive 
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-[inset_0_-2px_0_0_rgba(16,185,129,0.6)] scale-[1.02]' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-gray-800'
                }`}
              >
                <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                  isActive ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                }`}>
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium truncate w-full text-center leading-tight ${isRTL && currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Login Modal removed: navigation to /login now */}
    </div>
  );
};

export default Header;