import React from 'react';

interface FakeAdProps {
  format: 'rectangle' | 'leaderboard' | 'mobile-banner' | 'in-article' | 'responsive';
  className?: string;
}

const FakeAd: React.FC<FakeAdProps> = ({ format, className = '' }) => {
  const getDimensions = () => {
    switch (format) {
      case 'rectangle':
        return { width: 300, height: 250 };
      case 'leaderboard':
        return { width: 728, height: 90 };
      case 'mobile-banner':
        return { width: 320, height: 100 };
      case 'in-article':
        return { width: '100%', height: 120 };
      default:
        return { width: '100%', height: 200 };
    }
  };

  const getFakeAdContent = () => {
    const ads = [
      {
        title: "أحدث الأحذية الرياضية",
        description: "خصم 50% على جميع الأحذية الرياضية",
        brand: "SportWear",
        image: "👟",
        color: "bg-blue-500"
      },
      {
        title: "تطبيق كرة القدم الجديد",
        description: "تابع مباراياتك المفضلة مباشرة",
        brand: "FootballApp",
        image: "⚽",
        color: "bg-green-500"
      },
      {
        title: "أكاديمية كرة القدم",
        description: "انضم لأفضل أكاديمية في المنطقة",
        brand: "FootyAcademy",
        image: "🏆",
        color: "bg-orange-500"
      },
      {
        title: "ملابس رياضية مريحة",
        description: "جودة عالية وأسعار مناسبة",
        brand: "ActiveWear",
        image: "👕",
        color: "bg-purple-500"
      }
    ];
    
    return ads[Math.floor(Math.random() * ads.length)];
  };

  const dimensions = getDimensions();
  const ad = getFakeAdContent();

  return (
    <div 
      className={`relative overflow-hidden rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        minHeight: typeof dimensions.height === 'string' ? '120px' : dimensions.height
      }}
    >
      {/* Badge de test */}
      <div className="absolute top-1 left-1 z-10">
        <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg flex items-center gap-1">
          <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
          <span>إعلان تجريبي</span>
        </div>
      </div>

      {/* Contenu de l'annonce factice */}
      <div className={`${ad.color} h-full flex items-center justify-center p-4 relative`}>
        <div className="text-center text-white">
          <div className="text-2xl mb-2">{ad.image}</div>
          <div className="font-bold text-sm mb-1">{ad.title}</div>
          <div className="text-xs opacity-90 mb-2">{ad.description}</div>
          <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
            {ad.brand}
          </div>
        </div>
        
        {/* Effet de dégradé */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>

      {/* Texte disclamer */}
      <div className="absolute bottom-1 right-1">
        <div className="bg-black bg-opacity-50 text-white text-xs px-1 rounded">
          إعلان
        </div>
      </div>
    </div>
  );
};

export default FakeAd;