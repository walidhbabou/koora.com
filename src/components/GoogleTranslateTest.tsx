import React, { useState } from 'react';
import { googleTranslateAPI } from '../config/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Languages, CheckCircle, XCircle } from 'lucide-react';

export const GoogleTranslateTest: React.FC = () => {
  const [inputText, setInputText] = useState('Premier League');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);

  const testTranslation = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError('');
    setTranslatedText('');

    try {
      const result = await googleTranslateAPI.translateToArabic(inputText);
      setTranslatedText(result);
      
      // Obtenir les statistiques
      const cacheStats = googleTranslateAPI.getCacheStats();
      setStats(cacheStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de traduction');
    } finally {
      setIsLoading(false);
    }
  };

  const testBatchTranslation = async () => {
    setIsLoading(true);
    setError('');

    try {
      const footballTerms = [
        'Premier League',
        'Champions League', 
        'Real Madrid',
        'Barcelona',
        'Manchester United',
        'Goal',
        'Red Card',
        'Penalty'
      ];

      const results = await googleTranslateAPI.translateBatch(footballTerms, 'en', 'ar');
      setTranslatedText(results.join('\n'));
      
      const cacheStats = googleTranslateAPI.getCacheStats();
      setStats(cacheStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de traduction en lot');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    googleTranslateAPI.clearCache();
    setStats(googleTranslateAPI.getCacheStats());
  };

  const cleanExpiredCache = () => {
    googleTranslateAPI.cleanExpiredCache();
    setStats(googleTranslateAPI.getCacheStats());
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Test Google Translate API (Non Officielle)
          </CardTitle>
          <CardDescription>
            Testez l'API Google Translate gratuite non officielle pour la traduction français/arabe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test de traduction simple */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Texte à traduire :</label>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Entrez le texte à traduire..."
              onKeyPress={(e) => e.key === 'Enter' && testTranslation()}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={testTranslation} disabled={isLoading || !inputText.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Languages className="h-4 w-4 mr-2" />
              )}
              Traduire vers l'arabe
            </Button>
            
            <Button onClick={testBatchTranslation} disabled={isLoading} variant="outline">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Languages className="h-4 w-4 mr-2" />
              )}
              Test en lot (Football)
            </Button>
          </div>

          {/* Résultat de traduction */}
          {translatedText && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-600">Résultat :</label>
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="font-mono text-right" dir="rtl">
                  {translatedText.split('\n').map((line, index) => (
                    <div key={index} className="py-1">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Statistiques du cache */}
          {stats && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Statistiques du cache :</label>
              <div className="flex gap-2">
                <Badge variant="outline">
                  Total : {stats.totalEntries}
                </Badge>
                <Badge variant="outline">
                  Valides : {stats.validEntries}
                </Badge>
                <Badge variant="outline">
                  Taille : {stats.size}
                </Badge>
              </div>
            </div>
          )}

          {/* Gestion du cache */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={clearCache} variant="outline" size="sm">
              Vider le cache
            </Button>
            <Button onClick={cleanExpiredCache} variant="outline" size="sm">
              Nettoyer expired
            </Button>
            <Button 
              onClick={() => setStats(googleTranslateAPI.getCacheStats())} 
              variant="outline" 
              size="sm"
            >
              Actualiser stats
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informations sur l'API */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations sur l'API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span><strong>Avantages :</strong> Gratuite, rapide, bonne qualité de traduction</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-yellow-500" />
            <span><strong>Limites :</strong> API non officielle, risque de blocage en cas d'usage intensif</span>
          </div>
          <div className="text-gray-600">
            <strong>Endpoint :</strong> https://translate.googleapis.com/translate_a/single
          </div>
          <div className="text-gray-600">
            <strong>Cache :</strong> Les traductions sont mises en cache pendant 24h pour améliorer les performances
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleTranslateTest;
