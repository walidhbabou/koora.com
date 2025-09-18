import React from "react";
import { Helmet } from "react-helmet-async";

type StructuredDataType = 
  | 'Article'
  | 'NewsArticle'
  | 'SportsEvent'
  | 'SportsTeam'
  | 'Organization'
  | 'WebPage'
  | 'WebSite'
  | 'FAQPage'
  | 'BreadcrumbList';

type BreadcrumbItem = {
  name: string;
  url: string;
};

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  url?: string;
  locale?: string;
  type?: string; // Open Graph type
  canonical?: string;
  siteName?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  twitterSite?: string;
  twitterCreator?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: Record<string, unknown>;
  structuredDataType?: StructuredDataType;
  breadcrumbs?: BreadcrumbItem[];
  alternateUrls?: { locale: string; url: string }[];
  robots?: string;
  children?: React.ReactNode;
};

const DEFAULTS = {
  title: "كورة | أخبار الرياضة، المباريات والنتائج لحظة بلحظة",
  description:
    "كورة: أحدث أخبار كرة القدم، نتائج المباريات المباشرة، الترتيب، والانتقالات. تابع أحدث الأخبار الرياضية والنتائج المباشرة لكرة القدم العربية والعالمية.",
  image: "/koora-logo/green-logo.png",
  imageAlt: "شعار كورة - موقع الأخبار الرياضية",
  imageWidth: 1200,
  imageHeight: 630,
  siteName: "Koora",
  type: "website",
  locale: "ar_AR",
  keywords: [
    "كرة القدم",
    "أخبار رياضية", 
    "نتائج مباريات",
    "ترتيب فرق",
    "انتقالات لاعبين",
    "كورة",
    "رياضة",
    "مباريات مباشرة"
  ],
  twitterSite: "@koora",
  author: "Koora Sports"
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  url,
  locale,
  type,
  canonical,
  siteName,
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
  twitterSite,
  twitterCreator,
  noindex = false,
  nofollow = false,
  structuredData,
  structuredDataType,
  breadcrumbs,
  alternateUrls = [],
  robots,
  children,
}) => {
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  
  const meta = {
    title: title || DEFAULTS.title,
    description: description || DEFAULTS.description,
    image: image || DEFAULTS.image,
    imageAlt: imageAlt || DEFAULTS.imageAlt,
    imageWidth: imageWidth || DEFAULTS.imageWidth,
    imageHeight: imageHeight || DEFAULTS.imageHeight,
    url: url || currentUrl,
    locale: locale || DEFAULTS.locale,
    type: type || DEFAULTS.type,
    siteName: siteName || DEFAULTS.siteName,
    keywords: [...DEFAULTS.keywords, ...keywords],
    author: author || DEFAULTS.author,
    twitterSite: twitterSite || DEFAULTS.twitterSite,
    canonical: canonical || url || currentUrl,
  };

  // Generate robots directive
  const robotsDirective = robots || 
    (noindex || nofollow ? 
      `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}` 
      : 'index, follow'
    );

  // Generate breadcrumb structured data
  const generateBreadcrumbStructuredData = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    };
  };

  // Generate organization structured data
  const generateOrganizationStructuredData = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: meta.siteName,
    url: meta.url,
    logo: {
      '@type': 'ImageObject',
      url: `${meta.url.split('/').slice(0, 3).join('/')}${meta.image}`
    },
    sameAs: [
      // Add social media URLs here if available
    ]
  });

  // Generate website structured data
  const generateWebsiteStructuredData = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: meta.siteName,
    url: meta.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${meta.url.split('/').slice(0, 3).join('/')}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  });

  return (
    <Helmet prioritizeSeoTags>
      {/* Basic Meta Tags */}
      <title>{meta.title}</title>
      {meta.description && (
        <meta name="description" content={meta.description} />
      )}
      <meta name="robots" content={robotsDirective} />
      <meta name="theme-color" content="#10b981" />
      <meta name="author" content={meta.author} />
      {meta.keywords.length > 0 && (
        <meta name="keywords" content={meta.keywords.join(', ')} />
      )}
      
      {/* Canonical URL */}
      {meta.canonical && <link rel="canonical" href={meta.canonical} />}
      
      {/* Alternate URLs for different locales */}
      {alternateUrls.map(alt => (
        <link key={alt.locale} rel="alternate" hrefLang={alt.locale} href={alt.url} />
      ))}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:site_name" content={meta.siteName} />
      <meta property="og:title" content={meta.title} />
      {meta.description && (
        <meta property="og:description" content={meta.description} />
      )}
      <meta property="og:type" content={meta.type} />
      {meta.url && <meta property="og:url" content={meta.url} />}
      {meta.image && (
        <>
          <meta property="og:image" content={meta.image} />
          <meta property="og:image:alt" content={meta.imageAlt} />
          <meta property="og:image:width" content={meta.imageWidth.toString()} />
          <meta property="og:image:height" content={meta.imageHeight.toString()} />
          <meta property="og:image:type" content="image/png" />
        </>
      )}
      {meta.locale && <meta property="og:locale" content={meta.locale} />}
      
      {/* Article specific meta tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      {meta.description && (
        <meta name="twitter:description" content={meta.description} />
      )}
      {meta.image && <meta name="twitter:image" content={meta.image} />}
      {meta.imageAlt && <meta name="twitter:image:alt" content={meta.imageAlt} />}
      {meta.twitterSite && <meta name="twitter:site" content={meta.twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Default structured data */}
      {!structuredData && (
        <>
          <script type="application/ld+json">
            {JSON.stringify(generateOrganizationStructuredData())}
          </script>
          {meta.type === 'website' && (
            <script type="application/ld+json">
              {JSON.stringify(generateWebsiteStructuredData())}
            </script>
          )}
        </>
      )}
      
      {/* Breadcrumb structured data */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbStructuredData())}
        </script>
      )}

      {children}
    </Helmet>
  );
};

export default SEO;


