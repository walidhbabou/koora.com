import React, { useState } from 'react';
import { useLiveMatches, useTodayMatches, useLeagueStandings, useAPIStats } from '../hooks/useFootballAPI';
import { useFootballTranslation } from '../services/translationService';
import { useTranslation } from '../hooks/useTranslation';
import { MAIN_LEAGUES } from '../config/api';

const FootballAPITest: React.FC = () => {
  const { currentLanguage, setLanguage } = useTranslation();
  const [selectedLeague, setSelectedLeague] = useState(MAIN_LEAGUES.PREMIER_LEAGUE);
  
  // Utilisation des hooks
  const liveMatches = useLiveMatches({ translateContent: true });
  const todayMatches = useTodayMatches({ translateContent: true });
  const standings = useLeagueStandings(selectedLeague, undefined, { translateContent: true });
  const apiStats = useAPIStats();
  
  // Service de traduction
  const footballTranslation = useFootballTranslation();

  const [testTranslation, setTestTranslation] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  const handleTestTranslation = async () => {
    if (testTranslation.trim()) {
      try {
        if (currentLanguage === 'ar') {
          const result = await footballTranslation.translateTeam(testTranslation);
          setTranslatedText(result.arabic);
        } else {
          const result = await footballTranslation.translateTeam(testTranslation);
          setTranslatedText(result.french);
        }
      } catch (error) {
        console.error('Erreur de traduction:', error);
        setTranslatedText('Erreur de traduction');
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test API Football + LibreTranslate</h1>
      
      {/* Contrôles de langue */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Contrôles</h2>
        <div className="flex gap-4 items-center flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">Langue:</label>
            <select 
              value={currentLanguage} 
              onChange={(e) => setLanguage(e.target.value as 'fr' | 'ar')}
              className="border rounded px-3 py-1"
            >
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Ligue:</label>
            <select 
              value={selectedLeague} 
              onChange={(e) => setSelectedLeague(Number(e.target.value))}
              className="border rounded px-3 py-1"
            >
              <option value={MAIN_LEAGUES.PREMIER_LEAGUE}>Premier League</option>
              <option value={MAIN_LEAGUES.LA_LIGA}>La Liga</option>
              <option value={MAIN_LEAGUES.BUNDESLIGA}>Bundesliga</option>
              <option value={MAIN_LEAGUES.SERIE_A}>Serie A</option>
              <option value={MAIN_LEAGUES.LIGUE_1}>Ligue 1</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test de traduction */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Test de traduction</h2>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Texte à traduire:</label>
            <input
              type="text"
              value={testTranslation}
              onChange={(e) => setTestTranslation(e.target.value)}
              placeholder="Ex: Manchester United"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button
            onClick={handleTestTranslation}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Traduire
          </button>
        </div>
        {translatedText && (
          <div className="mt-2 p-2 bg-white rounded border">
            <strong>Résultat:</strong> {translatedText}
          </div>
        )}
      </div>

      {/* Statistiques API */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Statistiques API</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded">
            <div className="text-sm text-gray-600">Requêtes effectuées</div>
            <div className="text-2xl font-bold">{apiStats.requestCount}</div>
          </div>
          <div className="bg-white p-3 rounded">
            <div className="text-sm text-gray-600">Éléments en cache</div>
            <div className="text-2xl font-bold">{apiStats.cacheSize}</div>
          </div>
          <div className="bg-white p-3 rounded">
            <div className="text-sm text-gray-600">Dernière requête</div>
            <div className="text-sm">{apiStats.lastRequest.toLocaleTimeString()}</div>
          </div>
        </div>
        <button
          onClick={apiStats.clearCache}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Vider le cache
        </button>
      </div>

      {/* Matchs en direct */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Matchs en direct</h2>
        <div className="bg-white rounded-lg border p-4">
          {liveMatches.loading && <div>Chargement...</div>}
          {liveMatches.error && <div className="text-red-500">Erreur: {liveMatches.error}</div>}
          {liveMatches.data && (
            <div>
              <div className="text-sm text-gray-600 mb-2">
                {liveMatches.data.response?.length || 0} match(s) en direct
              </div>
              {liveMatches.data.response?.slice(0, 3).map((match: any, index: number) => (
                <div key={index} className="border-b py-2">
                  <div className="flex justify-between items-center">
                    <div>
                      {currentLanguage === 'ar' && match.teams?.home?.nameTranslated ? 
                        match.teams.home.nameTranslated.arabic : 
                        match.teams?.home?.name
                      } 
                      {' vs '}
                      {currentLanguage === 'ar' && match.teams?.away?.nameTranslated ? 
                        match.teams.away.nameTranslated.arabic : 
                        match.teams?.away?.name
                      }
                    </div>
                    <div className="text-sm">
                      {match.goals?.home || 0} - {match.goals?.away || 0}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Status: {currentLanguage === 'ar' && match.statusTranslated ? 
                      match.statusTranslated.arabic : 
                      match.fixture?.status?.long
                    }
                  </div>
                </div>
              ))}
              <button
                onClick={liveMatches.refetch}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Actualiser
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Matchs d'aujourd'hui */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Matchs d'aujourd'hui</h2>
        <div className="bg-white rounded-lg border p-4">
          {todayMatches.loading && <div>Chargement...</div>}
          {todayMatches.error && <div className="text-red-500">Erreur: {todayMatches.error}</div>}
          {todayMatches.data && (
            <div>
              <div className="text-sm text-gray-600 mb-2">
                {todayMatches.data.response?.length || 0} match(s) aujourd'hui
              </div>
              {todayMatches.data.response?.slice(0, 5).map((match: any, index: number) => (
                <div key={index} className="border-b py-2">
                  <div className="flex justify-between items-center">
                    <div>
                      {currentLanguage === 'ar' && match.teams?.home?.nameTranslated ? 
                        match.teams.home.nameTranslated.arabic : 
                        match.teams?.home?.name
                      } 
                      {' vs '}
                      {currentLanguage === 'ar' && match.teams?.away?.nameTranslated ? 
                        match.teams.away.nameTranslated.arabic : 
                        match.teams?.away?.name
                      }
                    </div>
                    <div className="text-sm">
                      {new Date(match.fixture?.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={todayMatches.refetch}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Actualiser
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Classements */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Classements</h2>
        <div className="bg-white rounded-lg border p-4">
          {standings.loading && <div>Chargement...</div>}
          {standings.error && <div className="text-red-500">Erreur: {standings.error}</div>}
          {standings.data && standings.data.response && standings.data.response[0] && (
            <div>
              <div className="text-sm text-gray-600 mb-2">
                {standings.data.response[0].league?.name}
              </div>
              {standings.data.response[0].league?.standings?.[0]?.slice(0, 5).map((team: any, index: number) => (
                <div key={index} className="flex justify-between items-center border-b py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">{team.rank}</span>
                    <span>
                      {currentLanguage === 'ar' && team.team?.nameTranslated ? 
                        team.team.nameTranslated.arabic : 
                        team.team?.name
                      }
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span>Pts: {team.points}</span>
                    <span>J: {team.all?.played}</span>
                  </div>
                </div>
              ))}
              <button
                onClick={standings.refetch}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Actualiser
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FootballAPITest;
