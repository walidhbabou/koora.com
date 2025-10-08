
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
import { SUPABASE_TO_WORDPRESS_MAPPING } from '../config/wordpressCategories';

// Mapping between Supabase categories and WordPress categories
export const getWordPressCategoriesForFilter = (
  selectedHeaderCategory: number | null,
  selectedSubCategory: number | null
): number[] => {
  // If no filter is selected, return empty array (fetch all)
  if (!selectedHeaderCategory) {
    return [];
  }

  const categoryMapping = SUPABASE_TO_WORDPRESS_MAPPING[selectedHeaderCategory as keyof typeof SUPABASE_TO_WORDPRESS_MAPPING];
  
  if (!categoryMapping) {
    console.warn(`No WordPress category mapping found for Supabase category ${selectedHeaderCategory}`);
    return [];
  }

  // If a specific subcategory is selected
  if (selectedSubCategory && categoryMapping.subCategories[selectedSubCategory]) {
    const categories = categoryMapping.subCategories[selectedSubCategory];
    console.log(`Mapping Supabase category ${selectedHeaderCategory}.${selectedSubCategory} to WordPress categories: ${categories.join(', ')}`);
    return categories;
  }

  // Return all categories for this header category
  const categories = categoryMapping.all;
  console.log(`Mapping Supabase category ${selectedHeaderCategory} (all) to WordPress categories: ${categories.join(', ')}`);
  return categories;
};

// Fonction pour récupérer les news WordPress avec pagination améliorée
export const fetchWordPressNews = async (options: {
  perPage?: number;
  page?: number;
  maxTotal?: number;
} = {}): Promise<NewsCardItem[]> => {
  const { perPage = 100, page = 1, maxTotal = 300 } = options;
  
  try {
    const urls = [
      `https://koora.com/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_embed`,
    ];

    // Si c'est la première page, récupérer beaucoup plus de pages pour avoir 300+ articles
    if (page === 1) {
      // Ajouter les pages 2 à 8 pour avoir suffisamment d'articles
      for (let p = 2; p <= 8; p++) {
        urls.push(`https://koora.com/wp-json/wp/v2/posts?per_page=100&page=${p}&_embed`);
      }
      // Ajouter quelques pages avec per_page=50 pour plus de diversité
      urls.push(
        `https://koora.com/wp-json/wp/v2/posts?per_page=50&page=9&_embed`,
        `https://koora.com/wp-json/wp/v2/posts?per_page=50&page=10&_embed`
      );
    }

    console.log(`Fetching WordPress news from ${urls.length} URLs...`);

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
      "https://koora.com/wp-json/wp/v2/posts?_embed"
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
