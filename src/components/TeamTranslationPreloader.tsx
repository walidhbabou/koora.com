import { useEffect, useState } from 'react';
import { forceTranslateAllTeams } from '@/utils/teamNameMap';

// Déclaration TypeScript pour requestIdleCallback
declare global {
  interface Window {
    requestIdleCallback?: (callback: () => void) => void;
  }
}

interface TeamTranslationPreloaderProps {
  teamNames: string[];
  onTranslationComplete?: () => void;
  children: React.ReactNode;
}

const TeamTranslationPreloader = ({ 
  teamNames, 
  onTranslationComplete, 
  children 
}: TeamTranslationPreloaderProps) => {
  const [preloadComplete, setPreloadComplete] = useState(false);

  useEffect(() => {
    const preloadTranslations = async () => {
      if (teamNames.length === 0) {
        setPreloadComplete(true);
        onTranslationComplete?.();
        return;
      }

      try {
        // Forcer la traduction de toutes les équipes en arrière-plan
        // Utiliser requestIdleCallback pour ne pas bloquer l'interface
        const startTranslation = async () => {
          await forceTranslateAllTeams(teamNames);
          setPreloadComplete(true);
          onTranslationComplete?.();
        };

        // Utiliser requestIdleCallback si disponible, sinon setTimeout
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            startTranslation();
          });
        } else {
          setTimeout(() => {
            startTranslation();
          }, 200);
        }
      } catch (error) {
        console.error('Erreur lors du préchargement des traductions:', error);
        setPreloadComplete(true);
        onTranslationComplete?.();
      }
    };

    preloadTranslations();
  }, [teamNames, onTranslationComplete]);

  return (
    <>
      {children}
    </>
  );
};

export default TeamTranslationPreloader;
