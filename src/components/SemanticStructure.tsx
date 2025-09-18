import React from 'react';

// Composant pour les articles de news avec structure sémantique
interface ArticleStructureProps {
  headline: string;
  summary?: string;
  content: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  category?: string;
  imageUrl?: string;
  imageAlt?: string;
  children?: React.ReactNode;
}

export const ArticleStructure: React.FC<ArticleStructureProps> = ({
  headline,
  summary,
  content,
  publishedTime,
  modifiedTime,
  author,
  category,
  imageUrl,
  imageAlt,
  children
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString();
  };

  return (
    <article 
      itemScope 
      itemType="https://schema.org/NewsArticle"
      className="max-w-4xl mx-auto"
    >
      <header className="mb-6">
        {category && (
          <nav aria-label="Catégorie de l'article">
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              {category}
            </span>
          </nav>
        )}
        
        <h1 
          itemProp="headline" 
          className="text-3xl md:text-4xl font-bold mt-4 mb-4 text-gray-900 dark:text-white"
        >
          {headline}
        </h1>
        
        {summary && (
          <p 
            itemProp="description" 
            className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
          >
            {summary}
          </p>
        )}
        
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
          {author && (
            <span itemProp="author" itemScope itemType="https://schema.org/Person">
              بقلم: <span itemProp="name">{author}</span>
            </span>
          )}
          
          {publishedTime && (
            <time 
              itemProp="datePublished" 
              dateTime={formatDate(publishedTime)}
              className="flex items-center gap-1"
            >
              {new Date(publishedTime).toLocaleDateString('ar')}
            </time>
          )}
          
          {modifiedTime && (
            <time 
              itemProp="dateModified" 
              dateTime={formatDate(modifiedTime)}
              className="flex items-center gap-1"
            >
              محدث: {new Date(modifiedTime).toLocaleDateString('ar')}
            </time>
          )}
        </div>
      </header>

      {imageUrl && (
        <figure className="mb-6">
          <img 
            itemProp="image"
            src={imageUrl} 
            alt={imageAlt || headline}
            className="w-full h-auto rounded-lg shadow-lg"
          />
          {imageAlt && (
            <figcaption className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              {imageAlt}
            </figcaption>
          )}
        </figure>
      )}

      <div 
        itemProp="articleBody" 
        className="prose prose-lg max-w-none dark:prose-invert"
      >
        {children || (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>
    </article>
  );
};

// Composant pour les événements sportifs
interface SportsEventStructureProps {
  eventName: string;
  startDate: string;
  homeTeam: string;
  awayTeam: string;
  venue?: string;
  league?: string;
  status?: string;
  children?: React.ReactNode;
}

export const SportsEventStructure: React.FC<SportsEventStructureProps> = ({
  eventName,
  startDate,
  homeTeam,
  awayTeam,
  venue,
  league,
  status,
  children
}) => {
  return (
    <section 
      itemScope 
      itemType="https://schema.org/SportsEvent"
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
    >
      <header>
        <h2 
          itemProp="name" 
          className="text-2xl font-bold mb-4 text-center"
        >
          {eventName}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4">
          <div 
            itemProp="homeTeam" 
            itemScope 
            itemType="https://schema.org/SportsTeam"
            className="text-center"
          >
            <span itemProp="name" className="font-semibold text-lg">
              {homeTeam}
            </span>
          </div>
          
          <div className="text-center text-2xl font-bold text-gray-500">
            VS
          </div>
          
          <div 
            itemProp="awayTeam" 
            itemScope 
            itemType="https://schema.org/SportsTeam"
            className="text-center"
          >
            <span itemProp="name" className="font-semibold text-lg">
              {awayTeam}
            </span>
          </div>
        </div>
        
        <div className="text-center space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <time 
            itemProp="startDate" 
            dateTime={new Date(startDate).toISOString()}
          >
            {new Date(startDate).toLocaleDateString('ar')} - {new Date(startDate).toLocaleTimeString('ar')}
          </time>
          
          {venue && (
            <div 
              itemProp="location" 
              itemScope 
              itemType="https://schema.org/Place"
            >
              <span itemProp="name">{venue}</span>
            </div>
          )}
          
          {league && (
            <div 
              itemProp="sport" 
              className="text-green-600 font-medium"
            >
              {league}
            </div>
          )}
          
          {status && (
            <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {status}
            </div>
          )}
        </div>
      </header>
      
      {children}
    </section>
  );
};

// Composant pour les listes de navigation avec breadcrumbs
interface BreadcrumbProps {
  items: Array<{
    name: string;
    url?: string;
    current?: boolean;
  }>;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav 
      aria-label="مسار التنقل" 
      itemScope 
      itemType="https://schema.org/BreadcrumbList"
      className="mb-4"
    >
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li 
            key={index}
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem"
            className="flex items-center"
          >
            {item.url && !item.current ? (
              <a 
                href={item.url}
                itemProp="item"
                className="text-green-600 hover:text-green-700 hover:underline"
              >
                <span itemProp="name">{item.name}</span>
              </a>
            ) : (
              <span 
                itemProp="name" 
                className={item.current ? "text-gray-500 font-medium" : ""}
                aria-current={item.current ? "page" : undefined}
              >
                {item.name}
              </span>
            )}
            
            <meta itemProp="position" content={(index + 1).toString()} />
            
            {index < items.length - 1 && (
              <span className="mx-2 text-gray-400" aria-hidden="true">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Composant pour les sections avec heading appropriés
interface SectionProps {
  title: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ 
  title, 
  level = 2, 
  className = "",
  children 
}) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <section className={`mb-8 ${className}`}>
      <HeadingTag className={`
        font-bold mb-4 text-gray-900 dark:text-white
        ${level === 1 ? 'text-3xl md:text-4xl' : ''}
        ${level === 2 ? 'text-2xl md:text-3xl' : ''}
        ${level === 3 ? 'text-xl md:text-2xl' : ''}
        ${level === 4 ? 'text-lg md:text-xl' : ''}
        ${level === 5 ? 'text-base md:text-lg' : ''}
        ${level === 6 ? 'text-sm md:text-base' : ''}
      `}>
        {title}
      </HeadingTag>
      {children}
    </section>
  );
};