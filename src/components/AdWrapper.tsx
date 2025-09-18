import React from 'react';
import GoogleAdSense, { AdFormat } from './GoogleAdSense';
import LocalSponsors from './LocalSponsors';

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
  adClient = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || '',
  adSlot = '',
  adFormat = 'responsive',
  className = '',
  title,
  showTitle = true,
  sponsorLayout = 'horizontal',
  maxSponsors = 4,
  testMode = import.meta.env.MODE === 'development'
}) => {
  const renderContent = () => {
    switch (type) {
      case 'adsense':
        return (
          <GoogleAdSense
            client={adClient}
            slot={adSlot}
            format={adFormat}
            testMode={testMode}
            className="w-full"
          />
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
            <GoogleAdSense
              client={adClient}
              slot={adSlot}
              format={adFormat}
              testMode={testMode}
              className="w-full"
            />
            
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
  <AdWrapper
    type="adsense"
    adFormat="leaderboard"
    adSlot={import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_HEADER || ''}
    title="إعلان"
    className="mb-4"
    testMode={testMode}
  />
);

export const SidebarAd: React.FC<{ testMode?: boolean }> = ({ testMode }) => (
  <AdWrapper
    type="adsense"
    adFormat="rectangle"
    adSlot={import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_SIDEBAR || ''}
    title="إعلان"
    className="mb-4"
    testMode={testMode}
  />
);

export const MobileAd: React.FC<{ testMode?: boolean }> = ({ testMode }) => (
  <AdWrapper
    type="adsense"
    adFormat="mobile-banner"
    adSlot={import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_MOBILE || ''}
    title="إعلان"
    className="block lg:hidden mb-4"
    testMode={testMode}
  />
);

export const InArticleAd: React.FC<{ testMode?: boolean }> = ({ testMode }) => (
  <AdWrapper
    type="adsense"
    adFormat="in-article"
    adSlot={import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_IN_ARTICLE || ''}
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
    adSlot={import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_FOOTER || ''}
    title="إعلان"
    className="mt-4"
    testMode={testMode}
  />
);

export default AdWrapper;