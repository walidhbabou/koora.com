import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Languages, Zap, Clock, Globe, CheckCircle } from 'lucide-react';
import GoogleTranslateTest from '../components/GoogleTranslateTest';
import TranslatedMatchCard from '../components/TranslatedMatchCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useFootballTranslation } from '../services/translationService';

const TranslationDemo: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const { getStats } = useFootballTranslation();
  
  const [stats, setStats] = useState<any>(null);

  // Données de test pour les matchs
  const sampleMatches = [
    {
      homeTeam: 'Manchester United',
      awayTeam: 'Liverpool',
      homeScore: 2,
      awayScore: 1,
      time: '89\'',
      status: 'live' as const,
      competition: 'Premier League',
      homeLogo: '',
      awayLogo: ''
    },
    {
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      homeScore: undefined,
      awayScore: undefined,
      time: '20:00',
      status: 'upcoming' as const,
      competition: 'La Liga',
      homeLogo: '',
      awayLogo: ''
    },
    {
      homeTeam: 'Paris Saint-Germain',
      awayTeam: 'Bayern Munich',
      homeScore: 1,
      awayScore: 3,
      time: 'FT',
      status: 'finished' as const,
      competition: 'Champions League',
      homeLogo: '',
      awayLogo: ''
    }
  ];

  const loadStats = async () => {
    try {
      const translationStats = await getStats();
      setStats(translationStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'ar': return 'العربية';
      case 'fr': return 'Français';
      case 'en': return 'English';
      default: return language;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Globe className="h-8 w-8 text-blue-600" />
            Démo API Google Translate
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Démonstration de l'intégration de l'API Google Translate non officielle 
            pour la traduction en temps réel du contenu football
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="text-sm">
              Langue actuelle : {getLanguageLabel()}
            </Badge>
            <Button onClick={toggleLanguage} size="sm">
              <Languages className="h-4 w-4 mr-2" />
              Changer la langue
            </Button>
            <Button onClick={loadStats} variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Charger stats
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Statistiques de traduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.cacheSize}</div>
                  <div className="text-sm text-gray-600">Traductions en cache</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.googleStats?.validEntries || 0}</div>
                  <div className="text-sm text-gray-600">Entrées valides</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.googleStats?.totalEntries || 0}</div>
                  <div className="text-sm text-gray-600">Total entrées</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Démonstration des cartes de match traduites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Cartes de match avec traduction automatique
            </CardTitle>
            <CardDescription>
              Les noms d'équipes et les compétitions sont traduits automatiquement selon la langue sélectionnée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleMatches.map((match, index) => (
                <TranslatedMatchCard 
                  key={index} 
                  match={match} 
                  showTranslation={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Composant de test Google Translate */}
        <GoogleTranslateTest />

        {/* Informations techniques */}
        <Card>
          <CardHeader>
            <CardTitle>Implémentation technique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Fonctionnalités ✨</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    API Google Translate gratuite et rapide
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Cache intelligent (24h)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Traduction en lot pour les performances
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Fallback vers LibreTranslate
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Support RTL pour l'arabe
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3">Configuration 🔧</h3>
                <div className="bg-gray-100 p-3 rounded-md text-sm font-mono">
                  <div>Endpoint: translate.googleapis.com</div>
                  <div>Client: gtx</div>
                  <div>Cache: 24h</div>
                  <div>Timeout: 10s</div>
                  <div>Batch size: 5</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">Utilisation dans le code 💻</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                <pre>{`// Import
import { useFootballTranslation } from '@/services/translationService';

// Hook
const { quickTranslateToArabic, translateBatchToArabic } = useFootballTranslation();

// Traduction simple
const arabicText = await quickTranslateToArabic('Premier League');

// Traduction en lot
const teamNames = ['Manchester United', 'Liverpool', 'Arsenal'];
const translatedNames = await translateBatchToArabic(teamNames);`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TranslationDemo;
