import { useState, useEffect, useCallback } from 'react';
import { 
  getTeamTranslation, 
  translateTeamNameAsync, 
  translateTeamNamesBatch,
  clearAutoTranslationCache,
  getAutoTranslationCacheSize,
  addTeamTranslation,
  forceTranslateAllTeams,
  getTeamTranslationWithAutoUpdate
} from '@/utils/teamNameMap';

// Déclaration TypeScript pour requestIdleCallback
declare global {
  interface Window {
    requestIdleCallback?: (callback: () => void) => void;
  }
}

// Hook pour la traduction des noms d'équipes
export const useTeamTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<Map<string, string>>(new Map());

  // Fonction pour traduire un nom d'équipe avec mise à jour automatique
  const translateTeam = useCallback(async (teamName: string): Promise<string> => {
    if (!teamName || teamName.trim() === '') {
      return teamName;
    }

    // Vérifier d'abord dans le cache local
    if (translationCache.has(teamName)) {
      return translationCache.get(teamName)!;
    }

    // Utiliser la fonction avec mise à jour automatique
    setIsTranslating(true);
    try {
      const translation = await getTeamTranslationWithAutoUpdate(teamName);
      translationCache.set(teamName, translation);
      return translation;
    } catch (error) {
      console.error(`Erreur lors de la traduction de "${teamName}":`, error);
      return teamName;
    } finally {
      setIsTranslating(false);
    }
  }, [translationCache]);

  // Fonction pour traduire plusieurs noms d'équipes en lot avec traduction forcée
  const translateTeamsBatch = useCallback(async (teamNames: string[]): Promise<string[]> => {
    if (teamNames.length === 0) return [];

    setIsTranslating(true);
    try {
      // Forcer la traduction de toutes les équipes
      await forceTranslateAllTeams(teamNames);
      
      // Récupérer les traductions depuis le cache
      const translations = teamNames.map(name => {
        const cached = translationCache.get(name);
        if (cached) return cached;
        
        const globalCached = getTeamTranslation(name);
        if (globalCached !== name) {
          translationCache.set(name, globalCached);
          return globalCached;
        }
        
        return name;
      });
      
      return translations;
    } catch (error) {
      console.error('Erreur lors de la traduction en lot:', error);
      return teamNames; // Retourner les noms originaux en cas d'erreur
    } finally {
      setIsTranslating(false);
    }
  }, [translationCache]);

  // Fonction pour obtenir la traduction synchrone (depuis le cache ou le mapping statique)
  const getTeamTranslationSync = useCallback((teamName: string): string => {
    if (!teamName || teamName.trim() === '') {
      return teamName;
    }

    // Vérifier d'abord dans le cache local
    if (translationCache.has(teamName)) {
      return translationCache.get(teamName)!;
    }

    // Utiliser la fonction synchrone
    const translation = getTeamTranslation(teamName);
    if (translation !== teamName) {
      translationCache.set(teamName, translation);
    }
    
    return translation;
  }, [translationCache]);

  // Fonction pour vider le cache local
  const clearCache = useCallback(() => {
    translationCache.clear();
    clearAutoTranslationCache();
  }, [translationCache]);

  // Fonction pour ajouter manuellement une traduction
  const addTranslation = useCallback((originalName: string, arabicName: string) => {
    translationCache.set(originalName, arabicName);
    addTeamTranslation(originalName, arabicName);
  }, [translationCache]);

  // Fonction pour obtenir la taille du cache
  const getCacheSize = useCallback(() => {
    return {
      local: translationCache.size,
      global: getAutoTranslationCacheSize()
    };
  }, [translationCache]);

  return {
    // Fonctions principales
    translateTeam,
    translateTeamsBatch,
    getTeamTranslationSync,
    
    // Gestion du cache
    clearCache,
    addTranslation,
    getCacheSize,
    
    // État
    isTranslating,
    cacheSize: translationCache.size
  };
};

// Hook spécialisé pour les composants qui affichent des listes d'équipes
export const useTeamListTranslation = (teamNames: string[]) => {
  const { translateTeamsBatch, getTeamTranslationSync, isTranslating } = useTeamTranslation();
  const [translatedNames, setTranslatedNames] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Traduire les noms d'équipes au montage du composant
  useEffect(() => {
    if (teamNames.length === 0) {
      setTranslatedNames([]);
      setIsInitialized(true);
      return;
    }

    const initializeTranslations = async () => {
      // D'abord, utiliser les traductions synchrones disponibles
      const syncTranslations = teamNames.map(name => getTeamTranslationSync(name));
      setTranslatedNames(syncTranslations);
      setIsInitialized(true);

      // Ensuite, traduire automatiquement les noms manquants en arrière-plan
      const needsTranslation = teamNames.filter((name, index) => 
        syncTranslations[index] === name && name.trim() !== ''
      );

      if (needsTranslation.length > 0) {
        // Utiliser requestIdleCallback pour ne pas bloquer l'interface
        const translateInBackground = async () => {
          try {
            const autoTranslations = await translateTeamsBatch(needsTranslation);
            
            // Mettre à jour les traductions
            const updatedTranslations = [...syncTranslations];
            let autoIndex = 0;
            
            teamNames.forEach((name, index) => {
              if (syncTranslations[index] === name && name.trim() !== '') {
                updatedTranslations[index] = autoTranslations[autoIndex];
                autoIndex++;
              }
            });
            
            setTranslatedNames(updatedTranslations);
          } catch (error) {
            console.error('Erreur lors de la traduction automatique:', error);
          }
        };

        // Utiliser requestIdleCallback si disponible, sinon setTimeout
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            translateInBackground();
          });
        } else {
          setTimeout(() => {
            translateInBackground();
          }, 300);
        }
      }
    };

    initializeTranslations();
  }, [teamNames, translateTeamsBatch, getTeamTranslationSync]);

  return {
    translatedNames,
    isTranslating,
    isInitialized
  };
};

// Hook pour la traduction d'une seule équipe avec état de chargement
export const useSingleTeamTranslation = (teamName: string) => {
  const { translateTeam, getTeamTranslationSync, isTranslating } = useTeamTranslation();
  const [translatedName, setTranslatedName] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!teamName || teamName.trim() === '') {
      setTranslatedName('');
      setIsInitialized(true);
      return;
    }

    const initializeTranslation = async () => {
      // D'abord, utiliser la traduction synchrone
      const syncTranslation = getTeamTranslationSync(teamName);
      setTranslatedName(syncTranslation);

      // Si la traduction synchrone n'a pas changé le nom, essayer la traduction automatique
      if (syncTranslation === teamName) {
        try {
          const autoTranslation = await translateTeam(teamName);
          setTranslatedName(autoTranslation);
        } catch (error) {
          console.error('Erreur lors de la traduction automatique:', error);
        }
      }
      
      setIsInitialized(true);
    };

    initializeTranslation();
  }, [teamName, translateTeam, getTeamTranslationSync]);

  return {
    translatedName,
    isTranslating,
    isInitialized
  };
};
