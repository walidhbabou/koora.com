import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { LanguageCode } from "../config/constants";

interface ModernLanguageSwitcherProps {
  mobile?: boolean;
  isRTL: boolean;
  direction: string;
  currentLanguage: LanguageCode;
  isLanguageOpen: boolean;
  setIsLanguageOpen: (open: boolean) => void;
  setLanguage: (lang: LanguageCode) => void;
}

const ModernLanguageSwitcher = ({
  mobile = false,
  isRTL,
  direction,
  currentLanguage,
  isLanguageOpen,
  setIsLanguageOpen,
  setLanguage
}: ModernLanguageSwitcherProps) => {
  const languages = [
    { code: 'ar' as LanguageCode, name: 'العربية', flag: '🇲🇦' },
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];
  
  // Simplify the positioning logic
  const getDropdownPosition = () => {
    if (mobile) {
      return isRTL ? 'left-0' : 'right-0';
    }
    return isRTL ? 'left-0' : 'right-0';
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size={mobile ? "sm" : "default"}
        onClick={() => setIsLanguageOpen(!isLanguageOpen)}
        className={`
          ${mobile ? 'h-8 px-2' : 'h-10 px-3'} 
          language-switcher
          bg-gradient-to-r from-teal-50 to-teal-50 
          hover:from-teal-100 hover:to-teal-100 
          border border-teal-200 
          transition-all duration-300 
          hover:shadow-lg hover:scale-105
          text-foreground hover:text-teal-600
          backdrop-blur-sm
        `}
      >
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-lg">{currentLang.flag}</span>
          {!mobile && (
            <span className={`font-medium text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              {currentLang.code.toUpperCase()}
            </span>
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
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsLanguageOpen(false);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close language selector"
          />
          
          {/* Menu */}
          <div className={`
            absolute ${getDropdownPosition()} 
            top-full mt-2 z-50
            language-dropdown
            bg-background/95 backdrop-blur-xl 
            border border-border/50 
            rounded-xl shadow-2xl 
            overflow-hidden
            min-w-[160px]
            animate-in fade-in-0 zoom-in-95 duration-200
          `} dir={direction}>
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
                    ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}
                    ${currentLanguage === lang.code 
                      ? 'bg-gradient-to-r from-teal-100 to-teal-100 text-teal-600' 
                      : 'text-foreground hover:text-teal-600'
                    }
                  `}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className={`flex flex-col flex-1 min-w-0 ${isRTL ? 'items-end text-right' : 'items-start text-left'}`}>
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
};

export default ModernLanguageSwitcher;
