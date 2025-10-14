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

// Types for WordPress news
export interface NewsCardItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  publishedAt: string;
  featuredImage: string | null;
  category: string;
  categorySlug: string;
  authorName: string;
  authorAvatar?: string;
  originalUrl?: string;
  isFromWordPress: boolean;
}

interface WordPressNewsItem {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  featured_media: number;
  categories: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'wp:term'?: Array<Array<{ name: string; slug: string }>>;
    author?: Array<{ name: string; avatar_urls?: { '96': string } }>;
  };
}

const WORDPRESS_CATEGORIES = {
  1: { id: 1, name: 'عام', name_en: 'General', slug: 'general', slug_en: 'general' },
  2: { id: 2, name: 'كرة القدم المصرية', name_en: 'Egyptian Football', slug: 'egyptian-football', slug_en: 'egyptian-football' },
  3: { id: 3, name: 'كرة القدم العربية', name_en: 'Arab Football', slug: 'arab-football', slug_en: 'arab-football' },
  4: { id: 4, name: 'كرة القدم العالمية', name_en: 'International Football', slug: 'international-football', slug_en: 'international-football' },
  5: { id: 5, name: 'دوري أبطال أوروبا', name_en: 'Champions League', slug: 'champions-league', slug_en: 'champions-league' },
  6: { id: 6, name: 'الدوري الإنجليزي', name_en: 'Premier League', slug: 'premier-league', slug_en: 'premier-league' },
  7: { id: 7, name: 'الدوري الإسباني', name_en: 'La Liga', slug: 'la-liga', slug_en: 'la-liga' },
  8: { id: 8, name: 'الدوري الإيطالي', name_en: 'Serie A', slug: 'serie-a', slug_en: 'serie-a' },
  9: { id: 9, name: 'الدوري الألماني', name_en: 'Bundesliga', slug: 'bundesliga', slug_en: 'bundesliga' },
  10: { id: 10, name: 'الدوري الفرنسي', name_en: 'Ligue 1', slug: 'ligue-1', slug_en: 'ligue-1' },
  11: { id: 11, name: 'انتقالات', name_en: 'Transfers', slug: 'transfers', slug_en: 'transfers' },
  12: { id: 12, name: 'منتخبات', name_en: 'National Teams', slug: 'national-teams', slug_en: 'national-teams' },
  13: { id: 13, name: 'كأس العالم', name_en: 'World Cup', slug: 'world-cup', slug_en: 'world-cup' },
  14: { id: 14, name: 'كأس أمم أفريقيا', name_en: 'AFCON', slug: 'afcon', slug_en: 'afcon' },
  15: { id: 15, name: 'تحليلات', name_en: 'Analysis', slug: 'analysis', slug_en: 'analysis' },
  16: { id: 16, name: 'مقابلات', name_en: 'Interviews', slug: 'interviews', slug_en: 'interviews' }
};

// Helper function to clean and format HTML content
export const cleanHtmlContent = (htmlContent: string): string => {
  if (!htmlContent) return '';
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = DOMPurify.sanitize(htmlContent);
  
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  return textContent.trim().substring(0, 150) + (textContent.length > 150 ? '...' : '');
};

// Function to get category name by ID
const getCategoryName = (categoryId: number): { name: string; slug: string } => {
  const category = WORDPRESS_CATEGORIES[categoryId as keyof typeof WORDPRESS_CATEGORIES];
  return category ? { name: category.name, slug: category.slug } : { name: 'عام', slug: 'general' };
};

// Main transformation function for WordPress news
export const transformWordPressNews = (wpNews: WordPressNewsItem[]): NewsCardItem[] => {
  return wpNews.map((item) => {
    const categoryInfo = item.categories?.[0] 
      ? getCategoryName(item.categories[0])
      : { name: 'عام', slug: 'general' };

    const featuredImage = item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
    const authorInfo = item._embedded?.author?.[0];

    return {
      id: item.id,
      title: item.title?.rendered || 'عنوان غير متوفر',
      excerpt: cleanHtmlContent(item.excerpt?.rendered || ''),
      content: item.content?.rendered || '',
      slug: item.slug,
      publishedAt: item.date,
      featuredImage,
      category: categoryInfo.name,
      categorySlug: categoryInfo.slug,
      authorName: authorInfo?.name || 'غير معروف',
      authorAvatar: authorInfo?.avatar_urls?.['96'],
      originalUrl: `https://beta.koora.com/${item.slug}`,
      isFromWordPress: true,
    };
  });
};

// Function to get category by slug
export const getWordPressCategoryBySlug = (slug: string) => {
  return Object.values(WORDPRESS_CATEGORIES).find(cat => 
    cat.slug === slug || cat.slug_en === slug
  ) || null;
};

// Basic WordPress news fetch function (non-optimized, for compatibility)
export const fetchWordPressNews = async (options: {
  perPage?: number;
  page?: number;
  maxTotal?: number;
  categories?: number | number[];
} = {}): Promise<NewsCardItem[]> => {
  const { perPage = 30, page = 1, categories } = options;
  
  try {
    let url = `https://beta.koora.com/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_embed`;
    
    if (categories) {
      const categoryParam = Array.isArray(categories) ? categories.join(',') : categories.toString();
      url += `&categories=${categoryParam}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`WordPress fetch failed:`, response.status);
      return [];
    }

    const data: WordPressNewsItem[] = await response.json();
    return transformWordPressNews(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Failed to fetch WordPress news:', error);
    return [];
  }
};

// Legacy functions for compatibility
export const fetchWordPressNewsFirstPage = async (options: {
  categories?: number | number[];
} = {}): Promise<NewsCardItem[]> => {
  return fetchWordPressNews({ ...options, perPage: 30, page: 1 });
};

export const fetchWordPressNewsBackground = async (options: {
  excludeFirstPage?: boolean;
  categories?: number | number[];
} = {}): Promise<NewsCardItem[]> => {
  const { categories } = options;
  
  try {
    const pages = [2, 3, 4]; // Pages 2-4 for background loading
    const promises = pages.map(page => 
      fetchWordPressNews({ perPage: 20, page, categories })
    );
    
    const results = await Promise.all(promises);
    const allNews = results.flat();
    
    // Remove duplicates based on ID
    const uniqueNews = allNews.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    
    return uniqueNews;
  } catch (error) {
    console.error('Failed to fetch WordPress background news:', error);
    return [];
  }
};