import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LANGUAGES, TRANSLATIONS, LanguageCode } from '../config/constants';

interface TranslationParams {
  [key: string]: string | number;
}

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, params?: TranslationParams) => string;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export { LanguageContext };

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage doit être utilisé dans un LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Récupération de la langue sauvegardée ou français par défaut
  const getSavedLanguage = (): LanguageCode => {
    try {
      const saved = localStorage.getItem('koora-language');
      if (saved && (saved === 'fr' || saved === 'ar' || saved === 'en')) {
        return saved as LanguageCode;
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération de la langue:', error);
    }
    
    // Détection automatique de la langue du navigateur
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'ar') {
      return 'ar';
    } else if (browserLang === 'en') {
      return 'en';
    }
    return 'fr'; // Français par défaut
  };

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(getSavedLanguage);

  // Fonction pour changer de langue
  const setLanguage = (language: LanguageCode) => {
    if (LANGUAGES[language]) {
      setCurrentLanguage(language);
      try {
        localStorage.setItem('koora-language', language);
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde de la langue:', error);
      }
    }
  };

  // Fonction de traduction avec support des paramètres
  const t = (key: string, params?: TranslationParams): string => {
    try {
      let translation = TRANSLATIONS[currentLanguage][key as keyof typeof TRANSLATIONS[typeof currentLanguage]];
      
      // Si la traduction n'existe pas, essayer en anglais puis en français
      if (!translation && currentLanguage !== 'en') {
        translation = TRANSLATIONS['en'][key as keyof typeof TRANSLATIONS['en']];
      }
      if (!translation && currentLanguage !== 'fr') {
        translation = TRANSLATIONS['fr'][key as keyof typeof TRANSLATIONS['fr']];
      }
      
      // Si toujours pas de traduction, retourner la clé
      if (!translation) {
        console.warn(`Traduction manquante pour la clé "${key}" en langue "${currentLanguage}"`);
        return key;
      }

      // Remplacer les paramètres dans la traduction
      if (params && typeof translation === 'string') {
        return Object.entries(params).reduce((str, [paramKey, value]) => {
          return str.replace(new RegExp(`{${paramKey}}`, 'g'), String(value));
        }, translation);
      }

      return translation as string;
    } catch (error) {
      console.warn(`Erreur de traduction pour la clé "${key}":`, error);
      return key;
    }
  };

  // Propriétés dérivées de la langue actuelle
  const isRTL = LANGUAGES[currentLanguage].direction === 'rtl';
  const direction = LANGUAGES[currentLanguage].direction;

  // Effet pour mettre à jour la direction du document
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLanguage;
    
    // Ajouter une classe CSS pour le RTL
    if (isRTL) {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [currentLanguage, direction, isRTL]);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    isRTL,
    direction,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
