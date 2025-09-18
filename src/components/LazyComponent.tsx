import React, { Suspense, lazy } from 'react';

// Interface pour les composants avec lazy loading
interface LazyComponentProps {
  component: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: Record<string, unknown>;
}

// Composant générique pour le lazy loading
const LazyComponent: React.FC<LazyComponentProps> = ({ 
  component, 
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded"></div>,
  props = {}
}) => {
  const Component = lazy(component);
  
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

// Composants de fallback optimisés
export const PageLoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-300">جاري التحميل...</p>
    </div>
  </div>
);

export const CardLoadingFallback = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
);

export const ImageLoadingFallback = () => (
  <div className="bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
  </div>
);

// Hook pour la détection de la performance du réseau
export const useNetworkSpeed = () => {
  const [networkSpeed, setNetworkSpeed] = React.useState<'slow' | 'fast' | 'unknown'>('unknown');

  React.useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const updateNetworkInfo = () => {
          const effectiveType = connection.effectiveType;
          if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            setNetworkSpeed('slow');
          } else {
            setNetworkSpeed('fast');
          }
        };

        updateNetworkInfo();
        connection.addEventListener('change', updateNetworkInfo);

        return () => {
          connection.removeEventListener('change', updateNetworkInfo);
        };
      }
    }
  }, []);

  return networkSpeed;
};

export default LazyComponent;