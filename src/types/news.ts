// Types et interfaces pour la gestion des news

export interface EditorJsBlock {
  type: string;
  data: {
    text?: string;
    items?: string[];
    [key: string]: unknown;
  };
}

export interface EditorJsContent {
  blocks: EditorJsBlock[];
  version?: string;
  time?: number;
}

export type WordPressNewsItem = {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  featured_media?: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
};

export type NewsCardItem = {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  publishedAt: string;
  category: string;
  source?: 'wordpress' | 'supabase' | 'mysql';
};

export interface Category {
  id: string;
  name: string;
  name_ar: string;
}

export interface DisplayCategory {
  id: string | null;
  name: string;
  count: number;
  active: boolean;
}

export interface NewsDBRow {
  id: number;
  title: string;
  content: string;
  created_at: string;
  image_url?: string;
  status: string;
  competition_internationale_id?: number;
  competition_mondiale_id?: number;
  competition_continentale_id?: number;
  competition_locale_id?: number;
}
