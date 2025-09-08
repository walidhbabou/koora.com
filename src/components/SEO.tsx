import React from "react";
import { Helmet } from "react-helmet-async";

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  locale?: string;
  type?: string; // website, article, music.song, etc.
  canonical?: string;
  siteName?: string;
  children?: React.ReactNode;
};

const DEFAULTS = {
  title: "كورة | أخبار الرياضة، المباريات والنتائج لحظة بلحظة",
  description:
    "كورة: أحدث أخبار كرة القدم، نتائج المباريات المباشرة، الترتيب، والانتقالات.",
  image: "/koora-logo/green-logo.png",
  siteName: "Koora",
  type: "website",
  locale: "ar_AR",
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  url,
  locale,
  type,
  canonical,
  siteName,
  children,
}) => {
  const meta = {
    title: title || DEFAULTS.title,
    description: description || DEFAULTS.description,
    image: image || DEFAULTS.image,
    url: url || (typeof window !== "undefined" ? window.location.href : undefined),
    locale: locale || DEFAULTS.locale,
    type: type || DEFAULTS.type,
    siteName: siteName || DEFAULTS.siteName,
    canonical: canonical || undefined,
  };

  return (
    <Helmet prioritizeSeoTags>
      <title>{meta.title}</title>
      {meta.description && (
        <meta name="description" content={meta.description} />
      )}
      <meta name="theme-color" content="#10b981" />
      {meta.canonical && <link rel="canonical" href={meta.canonical} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={meta.siteName} />
      <meta property="og:title" content={meta.title} />
      {meta.description && (
        <meta property="og:description" content={meta.description} />
      )}
      <meta property="og:type" content={meta.type} />
      {meta.url && <meta property="og:url" content={meta.url} />} 
      {meta.image && <meta property="og:image" content={meta.image} />}
      {meta.locale && <meta property="og:locale" content={meta.locale} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      {meta.description && (
        <meta name="twitter:description" content={meta.description} />
      )}
      {meta.image && <meta name="twitter:image" content={meta.image} />}

      {children}
    </Helmet>
  );
};

export default SEO;


