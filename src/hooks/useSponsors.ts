import { useState, useEffect } from 'react';

export interface SponsorData {
  id: string;
  name: string;
  logo: string;
  url: string;
  description?: string;
  category: 'main' | 'secondary' | 'partner';
  active: boolean;
  startDate?: string;
  endDate?: string;
  priority: number;
  clicks: number;
  impressions: number;
}

export const useSponsors = () => {
  const [sponsors, setSponsors] = useState<SponsorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // En production, ces données viendraient de votre API/base de données
    const initialSponsors: SponsorData[] = [
      {
        id: '1',
        name: 'شركة الاتصالات المحلية',
        logo: '/sponsors/telecom-logo.png',
        url: 'https://example-telecom.com',
        description: 'شريكنا في تقنيات الاتصالات',
        category: 'main',
        active: true,
        priority: 1,
        clicks: 0,
        impressions: 0
      },
      {
        id: '2', 
        name: 'بنك الأهلي الرياضي',
        logo: '/sponsors/bank-logo.png',
        url: 'https://example-bank.com',
        description: 'الشريك المصرفي الرسمي',
        category: 'main',
        active: true,
        priority: 2,
        clicks: 0,
        impressions: 0
      },
      {
        id: '3',
        name: 'متجر الأدوات الرياضية',
        logo: '/sponsors/sports-store.png', 
        url: 'https://example-sports.com',
        description: 'كل ما تحتاجه للرياضة',
        category: 'secondary',
        active: true,
        priority: 3,
        clicks: 0,
        impressions: 0
      },
      {
        id: '4',
        name: 'مطعم الكرة الذهبية',
        logo: '/sponsors/restaurant-logo.png',
        url: 'https://example-restaurant.com',
        description: 'المطعم الرسمي للرياضيين',
        category: 'partner',
        active: true,
        priority: 4,
        clicks: 0,
        impressions: 0
      }
    ];

    // Simuler un appel API
    const fetchSponsors = async () => {
      setLoading(true);
      try {
        // En production, remplacer par un vrai appel API
        setTimeout(() => {
          setSponsors(initialSponsors);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Erreur lors du chargement des sponsors:', error);
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  const addSponsor = async (sponsor: Omit<SponsorData, 'id' | 'clicks' | 'impressions'>) => {
    try {
      // En production, faire un appel API POST
      const newSponsor: SponsorData = {
        ...sponsor,
        id: Date.now().toString(),
        clicks: 0,
        impressions: 0
      };
      
      setSponsors(prev => [...prev, newSponsor]);
      return { success: true, data: newSponsor };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du sponsor:', error);
      return { success: false, error: 'Erreur lors de l\'ajout' };
    }
  };

  const updateSponsor = async (id: string, updates: Partial<SponsorData>) => {
    try {
      // En production, faire un appel API PUT
      setSponsors(prev => 
        prev.map(sponsor => 
          sponsor.id === id ? { ...sponsor, ...updates } : sponsor
        )
      );
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du sponsor:', error);
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  };

  const removeSponsor = async (id: string) => {
    try {
      // En production, faire un appel API DELETE
      setSponsors(prev => prev.filter(sponsor => sponsor.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression du sponsor:', error);
      return { success: false, error: 'Erreur lors de la suppression' };
    }
  };

  const trackSponsorClick = async (id: string) => {
    try {
      // En production, faire un appel API pour tracker les clics
      setSponsors(prev =>
        prev.map(sponsor =>
          sponsor.id === id 
            ? { ...sponsor, clicks: sponsor.clicks + 1 }
            : sponsor
        )
      );
    } catch (error) {
      console.error('Erreur lors du tracking du clic:', error);
    }
  };

  const trackSponsorImpression = async (id: string) => {
    try {
      // En production, faire un appel API pour tracker les impressions
      setSponsors(prev =>
        prev.map(sponsor =>
          sponsor.id === id 
            ? { ...sponsor, impressions: sponsor.impressions + 1 }
            : sponsor
        )
      );
    } catch (error) {
      console.error('Erreur lors du tracking de l\'impression:', error);
    }
  };

  // Filtres utiles
  const activeSponsors = sponsors.filter(sponsor => sponsor.active);
  const sponsorsByCategory = (category: SponsorData['category']) => 
    activeSponsors.filter(sponsor => sponsor.category === category);
  
  const topSponsors = activeSponsors
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);

  return {
    sponsors,
    loading,
    activeSponsors,
    topSponsors,
    sponsorsByCategory,
    addSponsor,
    updateSponsor,
    removeSponsor,
    trackSponsorClick,
    trackSponsorImpression
  };
};