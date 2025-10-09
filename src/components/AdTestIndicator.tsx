import React from 'react';

interface AdTestIndicatorProps {
  show: boolean;
  className?: string;
}

const AdTestIndicator: React.FC<AdTestIndicatorProps> = ({ show, className = '' }) => {
  if (!show) return null;

  return (
    <div className={`absolute top-1 left-1 z-10 ${className}`}>
      <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg flex items-center gap-1">
        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
        <span>TEST</span>
      </div>
    </div>
  );
};

export default AdTestIndicator;