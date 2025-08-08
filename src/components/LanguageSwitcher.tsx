import React from 'react';
import { useLanguage } from '../hooks/useLanguageHooks';
import { LANGUAGES, LanguageCode } from '../config/constants';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  showIcon?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  showIcon = true 
}) => {
  const { currentLanguage, setLanguage, isRTL } = useLanguage();

  return (
    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} ${className}`}>
      {showIcon && <Globe className="w-4 h-4 text-muted-foreground" />}
      <div className="flex rounded-lg border bg-card p-1">
        {Object.entries(LANGUAGES).map(([code, language]) => (
          <button
            key={code}
            onClick={() => setLanguage(code as LanguageCode)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              currentLanguage === code
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {language.name}
          </button>
        ))}
      </div>
    </div>
  );
};
