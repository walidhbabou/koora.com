import React from 'react';

interface LocalPromoBannerProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const LocalPromoBanner: React.FC<LocalPromoBannerProps> = ({ 
  className = '', 
  size = 'medium' 
}) => {
  const promos = [
    {
      title: "🏪 محل الرياضة الذهبي",
      subtitle: "أفضل المعدات الرياضية بأسعار مناسبة",
      offer: "خصم 30% على جميع الأحذية",
      phone: "📞 123-456-789",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      title: "⚽ أكاديمية النجوم",
      subtitle: "تدريب كرة القدم للأطفال والشباب",
      offer: "اشتراك مجاني لأول شهر",
      phone: "📞 987-654-321",
      gradient: "from-green-400 to-blue-500"
    },
    {
      title: "🥤 مطعم الهدف",
      subtitle: "أفضل المأكولات أثناء مشاهدة المباريات",
      offer: "وجبة مجانية عند طلب مشروبين",
      phone: "📞 555-123-456",
      gradient: "from-red-400 to-pink-500"
    },
    {
      title: "📱 تطبيق كورة بلس",
      subtitle: "تابع جميع المباريات مباشرة",
      offer: "تحميل مجاني من المتجر",
      phone: "📲 قريباً في المتاجر",
      gradient: "from-purple-400 to-indigo-500"
    }
  ];

  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: '250px', height: '150px' };
      case 'large':
        return { width: '100%', height: '200px' };
      default:
        return { width: '300px', height: '180px' };
    }
  };

  const promo = promos[Math.floor(Math.random() * promos.length)];
  const dimensions = getSize();

  return (
    <div 
      className={`relative overflow-hidden rounded-lg shadow-lg ${className}`}
      style={dimensions}
    >
      {/* Badge local */}
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
          🏪 إعلان محلي
        </div>
      </div>

      {/* Background avec gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${promo.gradient}`}>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Contenu */}
      <div className="relative h-full flex flex-col justify-center p-4 text-white">
        <h3 className="font-bold text-lg mb-1">{promo.title}</h3>
        <p className="text-sm opacity-90 mb-2">{promo.subtitle}</p>
        <div className="bg-white bg-opacity-20 rounded-lg p-2 mb-2">
          <p className="text-sm font-semibold">{promo.offer}</p>
        </div>
        <p className="text-xs opacity-80">{promo.phone}</p>
      </div>

      {/* Effet brillant */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
    </div>
  );
};

export default LocalPromoBanner;