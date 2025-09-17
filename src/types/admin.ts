// Centralized admin-related types to avoid duplication across pages/tabs

export interface CategoryRow {
  id: number;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  created_at?: string | null;
}

export interface ChampionRow {
  id: number;
  nom: string;
  nom_ar?: string | null;
}

export interface NewsItem {
  id: string; // keep as string for UI consistency even if DB is number
  title: string;
  content: string;
  category?: string;
  author?: string;
  date?: string;
  status?: 'published' | 'draft' | 'archived';
  imageUrl?: string;
  imageFile?: File;
}

// Backward-compat alias for components using `News`
export type News = NewsItem;

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author' | 'moderator';
  status: 'active' | 'inactive' | 'banned';
  joinDate?: string;
  lastLogin?: string;
  avatar?: string;
}

// General comment type used in comments listing
export interface CommentRow {
  id: number;
  content: string;
  user_id: string | null;
  news_id: string | null;
  created_at?: string | null;
}

// Variant used in News details (some places expect numeric news_id)
export interface NewsTabCommentRow {
  id: number;
  content: string;
  user_id: string | null;
  news_id: number | null;
  created_at?: string | null;
}
