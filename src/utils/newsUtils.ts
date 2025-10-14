
import DOMPurify from 'dompurify';

export function extractTweetId(url: string): string | null {
  const match = /(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/.exec(url);
  return match?.[1] ?? null;
}

export const extractTwitterUsername = (url: string): string | null => {
  const match = /(?:twitter\.com|x\.com)\/(\w+)\/status\/\d+/.exec(url);
  return match?.[1] ?? null;
};

export const extractYouTubeId = (url: string): string | null => {
  const match = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/.exec(url);
  return match?.[1] ?? null;
};

export const cleanJsonString = (jsonString: string): string => {
  try {
    const cleaned = jsonString
      .replace(/\\&quot;/g, '"')
      .replace(/&quot;/g, '"')
      .replace(/\\"/g, '"')
      .replace(/""/g, '"')
      .replace(/\\\\/g, '\\');
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    const alternativeCleaned = jsonString.replace(
      /"text":"([^"]*(?:\\.[^"]*)*)"/g,
      (match, content) => {
        const cleanContent = content
          .replace(/\\&quot;/g, '&quot;')
          .replace(/\\"/g, '&quot;')
          .replace(/"/g, '&quot;');
        return `"text":"${cleanContent}"`;
      }
    );
    try {
      JSON.parse(alternativeCleaned);
      return alternativeCleaned;
    } catch {
      return '';
    }
  }
};

export function normalizeTwitterUrl(url: string): string {
  return url.replace("https://x.com", "https://twitter.com");
}

export interface EditorJsBlockData {
  text?: string;
  items?: string[];
  level?: number;
  service?: string;
  source?: string;
  embed?: string;
  width?: number;
  height?: number;
  caption?: string;
  content?: string[][];
  withHeadings?: boolean;
  stretched?: boolean;
  file?: {
    url: string;
  };
  url?: string;
  link?: string;
  code?: string;
  language?: string;
  style?: string;
  alignment?: string;
  meta?: {
    title?: string;
    description?: string;
    image?: {
      url: string;
    };
  };
}

export interface EditorJsBlock {
  id: string;
  type: string;
  data: EditorJsBlockData;
}

export const parseOtherBlocksToHtml = (block: EditorJsBlock): string => {
  const data = block.data;
  switch (block.type) {
    case 'quote':
      return `<blockquote class="news-quote">${DOMPurify.sanitize(String(data.text || ''))}</blockquote>`;
    case 'code': {
      const code = String(data.code || '');
      const twitterMatch = /<blockquote class="twitter-tweet"[\s\S]*?<a href="(https:\/\/twitter.com\/[^"\s]+)"[^>]*>[^<]*<\/a><\/blockquote>/.exec(code);
      if (twitterMatch?.[1]) {
        return `__REACT_TWITTER_EMBED__${twitterMatch[1]}__`;
      }
      return `<pre class="news-code"><code>${DOMPurify.sanitize(code)}</code></pre>`;
    }
    case 'delimiter':
      return `<hr class="news-delimiter" />`;
    case 'table': {
      const tableRows = Array.isArray(data.content) ? data.content.map((row: string[], rowIndex: number) => {
        const cells = row.map((cell: string, cellIndex: number) => {
          const isHeader = rowIndex === 0 && data.withHeadings;
          const tag = isHeader ? 'th' : 'td';
          const className = isHeader ? 'news-table-header' : 'news-table-cell';
          return `<${tag} class="${className}">${DOMPurify.sanitize(cell)}</${tag}>`;
        }).join('');
        return `<tr class="news-table-row">${cells}</tr>`;
      }).join('') : '';
      return `<table class="news-table"><tbody>${tableRows}</tbody></table>`;
    }
    case 'image': {
  const imageUrl = data.file?.url ?? data.url ?? '';
      const caption = data.caption ? 
        `<div class="news-image-caption">${DOMPurify.sanitize(String(data.caption))}</div>` : '';
      return `<div class="news-image">
        <img src="${imageUrl}" alt="${data.caption || ''}" class="news-image-img" loading="lazy" />
        ${caption}
      </div>`;
    }
    case 'list': {
      const listItems = Array.isArray(data.items) ? data.items.map((item: string) => 
        `<li class="news-list-item">${DOMPurify.sanitize(item)}</li>`
      ).join('') : '';
      return `<ul class="news-list">${listItems}</ul>`;
    }
    default:
      return '';
  }
};

export const parseEditorJsBlocks = (content: string): EditorJsBlock[] => {
  try {
    const cleanedContent = cleanJsonString(content);
    const data = JSON.parse(cleanedContent);
    return data.blocks;
  } catch {
    return [];
  }
};// Fonctions utilitaires pour la gestion des news

export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&hellip;/gi, '...')
    .replace(/&quot;/gi, '"')
    .replace(/&#8217;/gi, "'")
    .replace(/&#8220;/gi, '"')
    .replace(/&#8221;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();


export interface EditorJsContent {
  blocks: EditorJsBlock[];
  version?: string;
  time?: number;
}

export const parseEditorJsContent = (content: string): string => {
  try {
    const parsed: EditorJsContent = JSON.parse(content);
    if (Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .map((block: EditorJsBlock) => {
          if ((block.type === 'paragraph' || block.type === 'header') && block.data?.text) {
            return block.data.text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          }
          if (block.type === 'list' && block.data?.items) {
            return block.data.items.join(' ');
          }
          return '';
        })
        .filter(Boolean)
        .join(' ');
    }
    return '';
  } catch {
    const textMatches = /"text":\s*"([^"]+)"/g.exec(content);
    if (textMatches) {
      return textMatches[1];
    }
    return '';
  }
};

import { WordPressNewsItem, NewsCardItem } from '../types/news';

// Mapping des catégories WordPress (basé sur votre liste)
export const WORDPRESS_CATEGORIES = {
  2: { id: 2, name: 'الانتقالات واخر الاخبار', name_en: 'Transfers and Latest News', slug: 'الانتقالات-واخر-الاخبار', slug_en: 'transfers-news' },
  3: { id: 3, name: 'اخر الاخبار', name_en: 'Latest News', slug: 'اخر-الاخبار', slug_en: 'latest-news' },
  4: { id: 4, name: 'الاصابات', name_en: 'Injuries', slug: 'الاصابات', slug_en: 'injuries' },
  5: { id: 5, name: 'سوق الانتقالات', name_en: 'Transfer Market', slug: 'سوق-الانتقالات', slug_en: 'transfer-market' },
  6: { id: 6, name: 'صفقات الخروج', name_en: 'Outgoing Deals', slug: 'صفقات-الخروج', slug_en: 'outgoing-deals' },
  7: { id: 7, name: 'التعاقدات الخارجية', name_en: 'External Contracts', slug: 'التعاقدات-الخارجية', slug_en: 'external-contracts' },
  8: { id: 8, name: 'كاب كت', name_en: 'Cap Cut', slug: 'كاب-كت', slug_en: 'cap-cut' },
  9: { id: 9, name: 'كل امريكا', name_en: 'All America', slug: 'كل-امريكا', slug_en: 'all-america' },
  10: { id: 10, name: 'كل اوروبا', name_en: 'All Europe', slug: 'كل-اوروبا', slug_en: 'all-europe' },
  11: { id: 11, name: 'كل العرب', name_en: 'All Arab', slug: 'كل-العرب', slug_en: 'all-arab' },
  12: { id: 12, name: 'غير مصنف', name_en: 'Uncategorized', slug: 'غير-مصنف', slug_en: 'uncategorized' },
  13: { id: 13, name: 'التعديلات المحليّة', name_en: 'Local Modifications', slug: 'التعديلات-المحلية', slug_en: 'local-modifications' },
  14: { id: 14, name: 'البرازيل ومقومي (مكسيكو)', name_en: 'Brazil and Mexico', slug: 'البرازيل-والمكسيك', slug_en: 'brazil-mexico' },
  15: { id: 15, name: 'الليجوز الاوربي (ولايم)', name_en: 'European Leagues', slug: 'الدوريات-الاوروبية', slug_en: 'european-leagues' },
  16: { id: 16, name: 'الدوري الالمان ومصر', name_en: 'German and Egyptian League', slug: 'الدوري-الالماني-والمصري', slug_en: 'german-egyptian-league' },
  17: { id: 17, name: 'الدوري الهولندي', name_en: 'Dutch League', slug: 'الدوري-الهولندي', slug_en: 'dutch-league' },
  18: { id: 18, name: 'الدوري العربي (ق ن)', name_en: 'Arab League', slug: 'الدوري-العربي', slug_en: 'arab-league' },
  19: { id: 19, name: 'التعديلات المثيرة', name_en: 'Exciting Modifications', slug: 'التعديلات-المثيرة', slug_en: 'exciting-modifications' },
  20: { id: 20, name: 'الدوري الاردني', name_en: 'Jordanian League', slug: 'الدوري-الاردني', slug_en: 'jordanian-league' },
  21: { id: 21, name: 'دوري جمل الجن', name_en: 'Camel League', slug: 'دوري-جمل-الجن', slug_en: 'camel-league' },
  22: { id: 22, name: 'دوري كورن ايفري', name_en: 'Corn Ivory League', slug: 'دوري-كورن-ايفري', slug_en: 'corn-ivory-league' },
  23: { id: 23, name: 'دوري كول ابفيد', name_en: 'Col Abfid League', slug: 'دوري-كول-ابفيد', slug_en: 'col-abfid-league' },
  24: { id: 24, name: 'كل لايفصنتيس', name_en: 'All Lifesantis', slug: 'كل-لايفصنتيس', slug_en: 'all-lifesantis' },
  25: { id: 25, name: 'التعديلات المحلية', name_en: 'Local Edits', slug: 'التعديلات-المحلية-2', slug_en: 'local-edits' },
} as const;

// Fonction pour obtenir les informations d'une catégorie par ID
export const getWordPressCategoryById = (id: number) => {
  return WORDPRESS_CATEGORIES[id as keyof typeof WORDPRESS_CATEGORIES] || null;
};

// Fonction pour obtenir une catégorie par slug (support des slugs arabes et anglais)
export const getWordPressCategoryBySlug = (slug: string) => {
  return Object.values(WORDPRESS_CATEGORIES).find(cat => 
    cat.slug === slug || cat.slug_en === slug
  ) || null;
};

// ==============================================
// FONCTIONS OPTIMISÉES AVEC CACHE GLOBAL
// ==============================================

import { globalCache, debounceCache } from './globalCache';

// Fonction pour récupérer les news WordPress avec pagination améliorée
export const fetchWordPressNews = async (options: {
  perPage?: number;
  page?: number;
  maxTotal?: number;
  categories?: number | number[];
} = {}): Promise<NewsCardItem[]> => {
  const { perPage = 100, page = 1, maxTotal = 300, categories } = options;
  
  try {
    // Construction de l'URL avec catégories si spécifiées
    const buildUrl = (pageNum: number, itemsPerPage: number) => {
      let url = `https://beta.koora.com/wp-json/wp/v2/posts?per_page=${itemsPerPage}&page=${pageNum}&_embed`;
      
      if (categories) {
        const categoryParam = Array.isArray(categories) ? categories.join(',') : categories.toString();
        url += `&categories=${categoryParam}`;
      }
      
      return url;
    };

    const urls = [
      buildUrl(page, perPage),
    ];

    // Si c'est la première page ET qu'on ne filtre pas par catégorie, récupérer plus de pages
    if (page === 1 && !categories) {
      // Ajouter les pages 2 à 8 pour avoir suffisamment d'articles
      for (let p = 2; p <= 8; p++) {
        urls.push(buildUrl(p, 100));
      }
      // Ajouter quelques pages avec per_page=50 pour plus de diversité
      urls.push(
        buildUrl(9, 50),
        buildUrl(10, 50)
      );
    }

    const categoriesText = categories ? ` with categories: ${categories}` : '';
    console.log(`Fetching WordPress news from ${urls.length} URLs${categoriesText}...`);

    const promises = urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`WordPress fetch failed for ${url}:`, response.status);
          return [];
        }
        const data: WordPressNewsItem[] = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error(`Error fetching WordPress news from ${url}:`, error);
        return [];
      }
    });

    const results = await Promise.all(promises);
    const allNews = results.flat();
    console.log(`Total articles fetched: ${allNews.length}`);

    // Supprimer les doublons basés sur l'ID
    const uniqueNews = allNews.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    console.log(`Unique articles after deduplication: ${uniqueNews.length}`);

    // Limiter le nombre total si spécifié
    const limitedNews = maxTotal ? uniqueNews.slice(0, maxTotal) : uniqueNews;

    console.log(`WordPress news loaded: ${limitedNews.length} unique articles from ${allNews.length} total fetched`);

    return transformWordPressNews(limitedNews);
  } catch (error) {
    console.error('Failed to fetch WordPress news:', error);
    return [];
  }
};

// Fonction de transformation améliorée
export const transformWordPressNews = (wpNews: WordPressNewsItem[]): NewsCardItem[] => {
  return wpNews.map((item) => {
    const plainExcerpt = stripHtml(item.excerpt?.rendered || '');
    const plainTitle = stripHtml(item.title?.rendered || '');
    const imageUrl = item._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/placeholder.svg';
    
    return {
      id: `wp_${item.id}`,
      title: plainTitle,
      summary: plainExcerpt.slice(0, 160) + (plainExcerpt.length > 160 ? '…' : ''),
      imageUrl: imageUrl,
      publishedAt: item.date ? new Date(item.date).toISOString().slice(0, 10) : '',
      category: 'كورة نيوز',
      source: 'wordpress'
    };
  });
};

// Fonction pour récupérer les news WordPress (version simple, pour rétrocompatibilité)
export const fetchSimpleWordPressNews = async (): Promise<NewsCardItem[]> => {
  try {
    const response = await fetch(
      "https://beta.koora.com/wp-json/wp/v2/posts?_embed"
    );
    if (!response.ok) throw new Error("WordPress fetch failed");

    const wpNews: WordPressNewsItem[] = await response.json();
    console.log("WordPress news loaded:", wpNews.length, "articles");

    return transformWordPressNews(wpNews);
  } catch (error) {
    console.error("WordPress news fetch failed:", error);
    return [];
  }
};

// ==============================================
// FONCTIONS OPTIMISÉES AVEC CACHE GLOBAL
// ==============================================

// Fonction optimisée pour première page avec cache global
export const fetchWordPressNewsFirstPage = debounceCache(async (params: {
  categories?: number[];
  per_page?: number;
}): Promise<NewsCardItem[]> => {
  const { categories, per_page = 30 } = params;
  const cacheKey = `wordpress_first_page_${categories?.join(',') || 'all'}_${per_page}`;
  
  // Vérifier le cache global
  const cached = globalCache.get<NewsCardItem[]>(cacheKey);
  if (cached) {
    console.log(`🎯 Cache HIT pour première page: ${cacheKey}`);
    return cached;
  }
  
  console.log(`🔄 Cache MISS pour première page: ${cacheKey}`);
  
  try {
    const baseUrl = "https://beta.koora.com/wp-json/wp/v2/posts";
    const params_obj = new URLSearchParams({
      per_page: per_page.toString(),
      page: "1",
      _embed: "true",
      orderby: "date",
      order: "desc",
    });

    if (categories && categories.length > 0) {
      params_obj.append("categories", categories.join(","));
    }

    const response = await fetch(`${baseUrl}?${params_obj}`);
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const posts = await response.json();
    const newsItems = transformWordPressNews(posts);
    
    // Mettre en cache avec TTL de 2 minutes pour première page
    globalCache.set(cacheKey, newsItems, 2 * 60 * 1000);
    
    return newsItems;
  } catch (error) {
    console.error("Error fetching WordPress first page:", error);
    return [];
  }
}, 1000); // Debounce de 1 seconde

// Fonction optimisée pour arrière-plan avec cache global
export const fetchWordPressNewsBackground = debounceCache(async (params: {
  categories?: number[];
  excludeFirstPage?: boolean;
  per_page?: number;
}): Promise<NewsCardItem[]> => {
  const { categories, excludeFirstPage = true, per_page = 30 } = params;
  const cacheKey = `wordpress_background_${categories?.join(',') || 'all'}_${per_page}`;
  
  // Vérifier le cache global
  const cached = globalCache.get<NewsCardItem[]>(cacheKey);
  if (cached) {
    console.log(`🎯 Cache HIT pour arrière-plan: ${cacheKey}`);
    return cached;
  }
  
  console.log(`🔄 Cache MISS pour arrière-plan: ${cacheKey}`);
  
  try {
    const allNews: NewsCardItem[] = [];
    const startPage = excludeFirstPage ? 2 : 1;
    const maxPages = 3; // Limiter à 3 pages pour éviter trop de requêtes
    
    // Paralléliser les requêtes mais limiter le nombre
    const promises = [];
    for (let page = startPage; page <= startPage + maxPages - 1; page++) {
      promises.push(fetchWordPressPageOptimized(page, categories, per_page));
    }
    
    const results = await Promise.allSettled(promises);
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    });
    
    // Mettre en cache avec TTL de 10 minutes pour arrière-plan
    globalCache.set(cacheKey, allNews, 10 * 60 * 1000);
    
    return allNews;
  } catch (error) {
    console.error("Error fetching WordPress background:", error);
    return [];
  }
}, 2000); // Debounce de 2 secondes pour arrière-plan

// Fonction helper optimisée pour une page spécifique
const fetchWordPressPageOptimized = async (
  page: number, 
  categories?: number[], 
  per_page: number = 30
): Promise<NewsCardItem[]> => {
  const cacheKey = `wordpress_page_${page}_${categories?.join(',') || 'all'}_${per_page}`;
  
  // Vérifier le cache pour cette page spécifique
  const cached = globalCache.get<NewsCardItem[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  const baseUrl = "https://beta.koora.com/wp-json/wp/v2/posts";
  const params = new URLSearchParams({
    per_page: per_page.toString(),
    page: page.toString(),
    _embed: "true",
    orderby: "date", 
    order: "desc",
  });

  if (categories && categories.length > 0) {
    params.append("categories", categories.join(","));
  }

  const response = await fetch(`${baseUrl}?${params}`);
  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status}`);
  }

  const posts = await response.json();
  const newsItems = transformWordPressNews(posts);
  
  // Mettre en cache cette page avec TTL de 5 minutes
  globalCache.set(cacheKey, newsItems, 5 * 60 * 1000);
  
  return newsItems;
};
