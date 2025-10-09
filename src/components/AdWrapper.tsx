import React from 'react';
import GoogleAdSense, { AdFormat } from './GoogleAdSense';
import LocalSponsors from './LocalSponsors';
import AdTestIndicator from './AdTestIndicator';

interface AdWrapperProps {
  type: 'adsense' | 'sponsors' | 'mixed';
  // Props pour AdSense
  adClient?: string;
  adSlot?: string;
  adFormat?: AdFormat;
  // Props généraux
  className?: string;
  title?: string;
  showTitle?: boolean;
  // Props pour sponsors locaux
  sponsorLayout?: 'horizontal' | 'vertical' | 'grid';
  maxSponsors?: number;
  // Configuration
  testMode?: boolean;
}

const AdWrapper: React.FC<AdWrapperProps> = ({
  type,
  adClient = import.meta.env.VITE_ADSENSE_CLIENT || '',
  adSlot = '',
  adFormat = 'responsive',
  className = '',
  title,
  showTitle = true,
  sponsorLayout = 'horizontal',
  maxSponsors = 4,
  testMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true'
}) => {
  console.log('AdWrapper props:', { 
    type, 
    adClient, 
    adSlot, 
    testMode, 
    envTestMode: import.meta.env.VITE_ADSENSE_TEST_MODE 
  });

  const renderContent = () => {
    switch (type) {
      case 'adsense':
        return (
          <div className="relative">
            <GoogleAdSense
              client={adClient}
              slot={adSlot}
              format={adFormat}
              testMode={testMode}
              className="w-full"
            />
            <AdTestIndicator show={testMode} />
          </div>
        );

      case 'sponsors':
        return (
          <LocalSponsors
            maxCount={maxSponsors}
            showDescription={false}
            title={showTitle ? (title || 'شركاؤنا') : ''}
            className="w-full"
          />
        );

      case 'mixed':
        return (
          <div className="space-y-6">
            {/* AdSense en premier */}
            <div className="relative">
              <GoogleAdSense
                client={adClient}
                slot={adSlot}
                format={adFormat}
                testMode={testMode}
                className="w-full"
              />
              <AdTestIndicator show={testMode} />
            </div>
            
            {/* Puis sponsors locaux */}
            <LocalSponsors
              maxCount={maxSponsors}
              showDescription={false}
              title={showTitle ? (title || 'شركاؤنا') : ''}
              className="w-full"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`ad-wrapper ${className}`}>
      {title && showTitle && type !== 'sponsors' && (
        <div className="text-center mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {title}
          </span>
        </div>
      )}
      {renderContent()}
    </div>
  );
};

// Composants prédéfinis pour différents emplacements
export const HeaderAd: React.FC<{ testMode?: boolean }> = ({ testMode }) => (
  <div className="hidden md:block">
    <AdWrapper
      type="adsense"
      adFormat="leaderboard"
      adSlot={import.meta.env.VITE_ADSENSE_HEADER_SLOT || ''}
      title="إعلان"
      className="mb-2 sm:mb-4"
      testMode={testMode}
    />
  </div>
);

export const SidebarAd: React.FC<{ testMode?: boolean }> = ({ testMode }) => (
  <AdWrapper
    type="adsense"
    adFormat="rectangle"
    adSlot={import.meta.env.VITE_ADSENSE_SIDEBAR_SLOT || ''}
    title="إعلان"
    className="mb-4"
    testMode={testMode}
  />
);

export const MobileAd: React.FC<{ testMode?: boolean }> = ({ testMode }) => (
  <div className="block md:hidden mb-2">
    <AdWrapper
      type="adsense"
      adFormat="mobile-banner"
      adSlot={import.meta.env.VITE_ADSENSE_MOBILE_SLOT || ''}
      title="إعلان"
      className="w-full"
      testMode={testMode}
    />
  </div>
);

export const InArticleAd: React.FC<{ testMode?: boolean }> = ({ testMode }) => (
  <AdWrapper
    type="adsense"
    adFormat="in-article"
    adSlot={import.meta.env.VITE_ADSENSE_ARTICLE_SLOT || ''}
    title="إعلان"
    className="my-6"
    testMode={testMode}
  />
);

export const SponsorsSection: React.FC<{ maxSponsors?: number; title?: string }> = ({ 
  maxSponsors = 6, 
  title = 'شركاؤنا' 
}) => (
  <AdWrapper
    type="sponsors"
    maxSponsors={maxSponsors}
    title={title}
    className="my-6"
  />
);

export const FooterAd: React.FC<{ testMode?: boolean }> = ({ testMode }) => (
  <AdWrapper
    type="adsense"
    adFormat="leaderboard"
    adSlot={import.meta.env.VITE_ADSENSE_FOOTER_SLOT || ''}
    title="إعلان"
    className="mt-4"
    testMode={testMode}
  />
);

export default AdWrapper;