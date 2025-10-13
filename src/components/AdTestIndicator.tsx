import React from 'react';

interface AdTestIndicatorProps {
  show: boolean;
  className?: string;
  position?: 'fixed' | 'absolute' | 'static';
  testMode?: 'safe' | 'development' | 'production';
}

const AdTestIndicator: React.FC<AdTestIndicatorProps> = ({ 
  show, 
  className = '',
  position = 'absolute',
  testMode = 'safe'
}) => {
  if (!show) return null;

  const getIndicatorStyle = () => {
    switch (testMode) {
      case 'safe':
        return 'bg-green-600 text-white border-green-500';
      case 'development':
        return 'bg-blue-600 text-white border-blue-500';
      case 'production':
        return 'bg-red-600 text-white border-red-500';
      default:
        return 'bg-green-600 text-white border-green-500';
    }
  };

  const getIconAndText = () => {
    switch (testMode) {
      case 'safe':
        return { icon: '🧪', text: 'MODE TEST SÉCURISÉ' };
      case 'development':
        return { icon: '🔧', text: 'DEV MODE' };
      case 'production':
        return { icon: '🚨', text: 'PROD MODE' };
      default:
        return { icon: '🧪', text: 'TEST MODE' };
    }
  };

  const { icon, text } = getIconAndText();
  const baseClasses = position === 'fixed' ? 'fixed top-4 right-4 z-50' : position === 'absolute' ? 'absolute top-1 left-1 z-10' : '';

  return (
    <div className={`${baseClasses} ${className}`}>
      <div className={`${getIndicatorStyle()} text-sm px-3 py-2 rounded-lg font-medium shadow-lg flex items-center gap-2 border-2 backdrop-blur-sm`}>
        <div className="flex items-center gap-1">
          <span className="text-base">{icon}</span>
          <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse"></div>
        </div>
        <span className="font-semibold tracking-wide">{text}</span>
      </div>
      
      {testMode === 'safe' && (
        <div className="mt-1 text-xs text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded border border-green-200 dark:border-green-800">
          data-adtest="on" • Pas de facturation
        </div>
      )}
    </div>
  );
};

export default AdTestIndicator;