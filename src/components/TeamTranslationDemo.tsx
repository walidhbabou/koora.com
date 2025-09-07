import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTeamTranslation, useSingleTeamTranslation } from '@/hooks/useTeamTranslation';
import { clearAutoTranslationCache, getAutoTranslationCacheSize } from '@/utils/teamNameMap';

const TeamTranslationDemo = () => {
  const [inputTeamName, setInputTeamName] = useState('');
  const [testTeams] = useState([
    'Manchester United',
    'Real Madrid',
    'Bayern Munich',
    'Paris Saint-Germain',
    'Juventus',
    'Barcelona',
    'Liverpool',
    'AC Milan',
    'Inter Milan',
    'Chelsea',
    'Arsenal',
    'Tottenham Hotspur',
    'Atlético de Madrid',
    'Borussia Dortmund',
    'Napoli',
    'Roma',
    'Lazio',
    'Fiorentina',
    'Sevilla',
    'Valencia'
  ]);

  const { translateTeam, translateTeamsBatch, clearCache, getCacheSize } = useTeamTranslation();
  const [batchResult, setBatchResult] = useState<string[]>([]);
  const [isTranslatingBatch, setIsTranslatingBatch] = useState(false);

  const handleSingleTranslation = async () => {
    if (inputTeamName.trim()) {
      const result = await translateTeam(inputTeamName.trim());
      console.log(`Traduction de "${inputTeamName}" : "${result}"`);
    }
  };

  const handleBatchTranslation = async () => {
    setIsTranslatingBatch(true);
    try {
      const results = await translateTeamsBatch(testTeams);
      setBatchResult(results);
    } catch (error) {
      console.error('Erreur lors de la traduction en lot:', error);
    } finally {
      setIsTranslatingBatch(false);
    }
  };

  const handleClearCache = () => {
    clearCache();
    clearAutoTranslationCache();
  };

  const cacheSize = getCacheSize();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Démonstration de la traduction automatique des équipes</h2>
        
        {/* Test de traduction unique */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Test de traduction unique</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Entrez le nom d'une équipe..."
              value={inputTeamName}
              onChange={(e) => setInputTeamName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSingleTranslation} disabled={!inputTeamName.trim()}>
              Traduire
            </Button>
          </div>
          {inputTeamName && (
            <SingleTeamTranslationTest teamName={inputTeamName} />
          )}
        </div>

        {/* Test de traduction en lot */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Test de traduction en lot</h3>
          <Button 
            onClick={handleBatchTranslation} 
            disabled={isTranslatingBatch}
            className="w-full"
          >
            {isTranslatingBatch ? 'Traduction en cours...' : 'Traduire toutes les équipes de test'}
          </Button>
          
          {batchResult.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testTeams.map((team, index) => (
                <div key={team} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{team}</span>
                  <Badge variant="secondary">{batchResult[index]}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gestion du cache */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Gestion du cache</h3>
          <div className="flex items-center gap-4">
            <Button onClick={handleClearCache} variant="outline">
              Vider le cache
            </Button>
            <div className="text-sm text-gray-600">
              Cache local: {cacheSize.local} | Cache global: {cacheSize.global}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Composant pour tester la traduction d'une seule équipe
const SingleTeamTranslationTest = ({ teamName }: { teamName: string }) => {
  const { translatedName, isTranslating, isInitialized } = useSingleTeamTranslation(teamName);

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">Nom original: {teamName}</div>
          <div className="text-sm text-gray-600">
            Nom traduit: {isInitialized ? translatedName : 'Chargement...'}
          </div>
        </div>
        {isTranslating && (
          <Badge variant="outline">Traduction en cours...</Badge>
        )}
      </div>
    </div>
  );
};

export default TeamTranslationDemo;
