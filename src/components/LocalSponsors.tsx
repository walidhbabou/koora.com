import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useSponsors, SponsorData } from '../hooks/useSponsors';

interface LocalSponsorsProps {
  /** Nombre maximum de sponsors à afficher */
  maxCount?: number;
  /** Catégorie spécifique de sponsors à afficher */
  category?: 'main' | 'secondary' | 'partner';
  /** Afficher ou masquer les descriptions */
  showDescription?: boolean;
  /** Titre de la section */
  title?: string;
  /** Classes CSS personnalisées */
  className?: string;
}

export const LocalSponsors: React.FC<LocalSponsorsProps> = ({
  maxCount = 6,
  category,
  showDescription = false,
  title = "شركاؤنا",
  className = ""
}) => {
  const { sponsors, loading, trackSponsorClick, trackSponsorImpression } = useSponsors();

  // Filtrer les sponsors par catégorie si spécifiée
  const filteredSponsors = React.useMemo(() => {
    let result = sponsors.filter(sponsor => sponsor.active);
    
    if (category) {
      result = result.filter(sponsor => sponsor.category === category);
    }
    
    // Trier par ordre de priorité
    result.sort((a, b) => a.priority - b.priority);
    
    return result.slice(0, maxCount);
  }, [sponsors, category, maxCount]);

  // Memoize sponsor IDs to avoid complex dependency
  const sponsorIds = React.useMemo(() => 
    filteredSponsors.map(s => s.id).sort().join(','), 
    [filteredSponsors]
  );

  // Track impressions when sponsors are displayed (only track once per sponsor ID)
  const trackedImpressionsRef = React.useRef<Set<string>>(new Set());
  
  React.useEffect(() => {
    if (!loading && filteredSponsors.length > 0) {
      filteredSponsors.forEach(sponsor => {
        if (!trackedImpressionsRef.current.has(sponsor.id)) {
          trackedImpressionsRef.current.add(sponsor.id);
          trackSponsorImpression(sponsor.id);
        }
      });
    }
  }, [loading, sponsorIds, trackSponsorImpression, filteredSponsors]);

  const handleSponsorClick = (sponsor: SponsorData) => {
    trackSponsorClick(sponsor.id);
    
    // Ouvrir le lien dans un nouvel onglet
    if (sponsor.url) {
      window.open(sponsor.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: maxCount }, (_, index) => (
            <div key={`skeleton-${index}`} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredSponsors.length === 0) {
    return null;
  }

  const renderSponsor = (sponsor: SponsorData) => {
    const getCategoryText = (category: string) => {
      switch (category) {
        case 'main': return 'رئيسي';
        case 'secondary': return 'ثانوي';
        case 'partner': return 'شريك';
        default: return 'شريك';
      }
    };

    return (
      <button 
        key={sponsor.id}
        className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer p-4 w-full text-left border-0"
        onClick={() => handleSponsorClick(sponsor)}
        aria-label={`زيارة ${sponsor.name}`}
      >
        {/* Logo du sponsor */}
        <div className="flex items-center justify-center mb-3">
          <img
            src={sponsor.logo}
            alt={`شعار ${sponsor.name}`}
            className="max-h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Nom du sponsor */}
        <h3 className="text-center text-sm font-medium text-gray-900 dark:text-white mb-2">
          {sponsor.name}
        </h3>

        {/* Description optionnelle */}
        {showDescription && sponsor.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center line-clamp-2">
            {sponsor.description}
          </p>
        )}

        {/* Badge catégorie */}
        <div className="absolute top-2 right-2">
          <span className={`
            inline-block px-2 py-1 text-xs rounded-full font-medium
            ${sponsor.category === 'main' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
            ${sponsor.category === 'secondary' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : ''}
            ${sponsor.category === 'partner' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
          `}>
            {getCategoryText(sponsor.category)}
          </span>
        </div>

        {/* Icône lien externe */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </div>
      </button>
    );
  };

  return (
    <section className={`sponsors-section ${className}`} aria-label="قسم الشركاء والرعاة">
      {/* Titre de la section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
          {title}
        </h2>
        <div className="w-16 h-1 bg-green-500 mx-auto rounded-full"></div>
      </div>

      {/* Grille des sponsors */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {filteredSponsors.map(renderSponsor)}
      </div>

      {/* Lien vers tous les sponsors si on en affiche qu'une partie */}
      {sponsors.length > maxCount && (
        <div className="text-center mt-6">
          <button
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium text-sm transition-colors duration-200"
            onClick={() => {
              // Navigation vers la page sponsors - à personnaliser selon votre router
              console.log('Navigation vers page sponsors complète');
            }}
          >
            عرض جميع الشركاء ←
          </button>
        </div>
      )}
    </section>
  );
};

export default LocalSponsors;