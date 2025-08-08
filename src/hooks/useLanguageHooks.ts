import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Hook personnalisé pour faciliter l'utilisation
export const useDirection = () => {
  const { isRTL, direction } = useLanguage();
  return { isRTL, direction };
};

// Hook pour les styles conditionnels RTL/LTR
export const useDirectionalStyle = () => {
  const { isRTL } = useLanguage();
  
  return {
    textAlign: isRTL ? ('right' as const) : ('left' as const),
    marginStart: (value: string) => isRTL ? { marginRight: value } : { marginLeft: value },
    marginEnd: (value: string) => isRTL ? { marginLeft: value } : { marginRight: value },
    paddingStart: (value: string) => isRTL ? { paddingRight: value } : { paddingLeft: value },
    paddingEnd: (value: string) => isRTL ? { paddingLeft: value } : { paddingRight: value },
    start: (value: string) => isRTL ? { right: value } : { left: value },
    end: (value: string) => isRTL ? { left: value } : { right: value },
  };
};
