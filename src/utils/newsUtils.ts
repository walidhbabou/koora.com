// Fonctions utilitaires pour la gestion des news

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

export const parseEditorJsContent = (content: string): string => {
  try {
    const parsed: EditorJsContent = JSON.parse(content);
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .map((block: EditorJsBlock) => {
          if ((block.type === 'paragraph' || block.type === 'header') && block.data && block.data.text) {
            return block.data.text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          }
          if (block.type === 'list' && block.data && block.data.items) {
            return block.data.items.join(' ');
          }
          return '';
        })
        .filter(Boolean)
        .join(' ');
    }
    return '';
  } catch (e) {
    const textMatches = content.match(/"text":\s*"([^"]+)"/g);
    if (textMatches && textMatches.length > 0) {
      return textMatches.map(match => match.replace(/"text":\s*"([^"]+)"/, '$1')).join(' ');
    }
    return '';
  }
};

import { WordPressNewsItem, NewsCardItem } from '../types/news';

export const transformWordPressNews = (wpNews: WordPressNewsItem[], currentLanguage: string): NewsCardItem[] => {
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
      category: currentLanguage === 'ar' ? 'كورة نيوز' : 'Koora News',
      source: 'wordpress'
    };
  });
};
