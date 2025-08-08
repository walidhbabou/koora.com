import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Header from '../components/Header';

const LanguageTest: React.FC = () => {
  const { t, currentLanguage, isRTL, direction } = useTranslation();

  return (
    <div className={`min-h-screen bg-background text-foreground`} dir={direction}>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-3xl font-bold mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('home')} - Test de Langue
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Navigation Card */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">{t('home')}</h2>
              <ul className="space-y-2">
                <li>{t('home')}</li>
                <li>{t('matches')}</li>
                <li>{t('news')}</li>
                <li>{t('standings')}</li>
                <li>{t('videos')}</li>
                <li>{t('transfers')}</li>
              </ul>
            </div>

            {/* Match Status Card */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Match Status</h2>
              <ul className="space-y-2">
                <li><span className="text-sport-green">●</span> {t('live')}</li>
                <li><span className="text-blue-500">●</span> {t('upcoming')}</li>
                <li><span className="text-gray-500">●</span> {t('finished')}</li>
                <li><span className="text-yellow-500">●</span> {t('halftime')}</li>
                <li><span className="text-red-500">●</span> {t('postponed')}</li>
              </ul>
            </div>

            {/* General Interface Card */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Interface</h2>
              <ul className="space-y-2">
                <li>{t('search')}</li>
                <li>{t('loading')}</li>
                <li>{t('error')}</li>
                <li>{t('retry')}</li>
                <li>{t('login')}</li>
                <li>{t('loginShort')}</li>
              </ul>
            </div>

            {/* Time Card */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Time</h2>
              <ul className="space-y-2">
                <li>{t('today')}</li>
                <li>{t('yesterday')}</li>
                <li>{t('tomorrow')}</li>
                <li>{t('justNow')}</li>
                <li>{t('minutesAgo', { minutes: 5 })}</li>
                <li>{t('hoursAgo', { hours: 2 })}</li>
              </ul>
            </div>

            {/* Leagues Card */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Leagues</h2>
              <ul className="space-y-2">
                <li>{t('premierLeague')}</li>
                <li>{t('laLiga')}</li>
                <li>{t('bundesliga')}</li>
                <li>{t('serieA')}</li>
                <li>{t('ligue1')}</li>
                <li>{t('championsLeague')}</li>
              </ul>
            </div>

            {/* Settings Info Card */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Paramètres</h2>
              <div className="space-y-2">
                <p><strong>Langue actuelle:</strong> {currentLanguage.toUpperCase()}</p>
                <p><strong>Direction:</strong> {direction}</p>
                <p><strong>RTL:</strong> {isRTL ? 'Oui' : 'Non'}</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Utilisez le sélecteur de langue dans l'en-tête pour tester le changement de langue.
                </p>
              </div>
            </div>
          </div>

          {/* RTL Demo */}
          <div className="mt-8 bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4">Test RTL/LTR</h2>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="bg-sport-green text-white px-4 py-2 rounded">Élément 1</div>
              <div className="bg-sport-blue text-white px-4 py-2 rounded">Élément 2</div>
              <div className="bg-purple-500 text-white px-4 py-2 rounded">Élément 3</div>
            </div>
            <p className={`mt-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              Cette ligne devrait s'aligner à {isRTL ? 'droite' : 'gauche'} selon la langue sélectionnée.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageTest;
