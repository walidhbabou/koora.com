// utils/parseEditorJs.ts
import DOMPurify from 'dompurify';

export interface EditorJsBlock {
  id: string;
  type: string;
  data: {
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
    code?: string;
    language?: string;
    style?: string;
    alignment?: string;
    link?: string;
    meta?: {
      title?: string;
      description?: string;
      image?: {
        url: string;
      };
    };
    [key: string]: any;
  };
}

export interface EditorJsData {
  time: number;
  blocks: EditorJsBlock[];
  version: string;
}

// Fonction pour extraire l'ID du tweet depuis l'URL
export const extractTweetId = (url: string): string | null => {
  const patterns = [
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
    /(?:twitter\.com|x\.com)\/\w+\/statuses\/(\d+)/,
    /(?:mobile\.twitter\.com|m\.twitter\.com)\/\w+\/status\/(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

// Fonction pour extraire le nom d'utilisateur depuis l'URL Twitter
export const extractTwitterUsername = (url: string): string | null => {
  const patterns = [
    /(?:twitter\.com|x\.com)\/(\w+)\/status\/\d+/,
    /(?:twitter\.com|x\.com)\/(\w+)\/statuses\/\d+/,
    /(?:mobile\.twitter\.com|m\.twitter\.com)\/(\w+)\/status\/\d+/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

// Fonction pour extraire l'ID YouTube
export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

// Fonction pour extraire l'ID Vimeo
export const extractVimeoId = (url: string): string | null => {
  const match = url.match(/(?:vimeo\.com\/)(\d+)/);
  return match ? match[1] : null;
};

// Fonction pour extraire l'ID Instagram
export const extractInstagramId = (url: string): string | null => {
  const match = url.match(/(?:instagram\.com\/p\/)([^/?]+)/);
  return match ? match[1] : null;
};

// Fonction pour nettoyer et valider les URLs
export const sanitizeUrl = (url: string): string => {
  try {
    const validUrl = new URL(url);
    return validUrl.href;
  } catch {
    return '';
  }
};

// Fonction pour générer du HTML sécurisé pour un paragraphe
const renderParagraph = (block: EditorJsBlock): string => {
  const text = block.data.text || '';
  return `<div class="news-paragraph">${DOMPurify.sanitize(text)}</div>`;
};

// Fonction pour générer du HTML pour un titre
const renderHeader = (block: EditorJsBlock): string => {
  const level = Math.min(Math.max(block.data.level || 1, 1), 6);
  const text = block.data.text || '';
  return `<h${level} class="news-header news-header-${level}">${DOMPurify.sanitize(text)}</h${level}>`;
};

// Fonction pour générer du HTML pour une liste
const renderList = (block: EditorJsBlock): string => {
  const items = block.data.items || [];
  const style = block.data.style || 'unordered';
  const tag = style === 'ordered' ? 'ol' : 'ul';
  
  const listItems = items.map(item => 
    `<li class="news-list-item">${DOMPurify.sanitize(item)}</li>`
  ).join('');
  
  return `<${tag} class="news-list ${style === 'ordered' ? 'news-list-ordered' : ''}">${listItems}</${tag}>`;
};

// Fonction pour générer du HTML pour une citation
const renderQuote = (block: EditorJsBlock): string => {
  const text = block.data.text || '';
  const caption = block.data.caption || '';
  const alignment = block.data.alignment || 'left';
  
  return `<blockquote class="news-quote news-quote-${alignment}">
    ${DOMPurify.sanitize(text)}
    ${caption ? `<cite class="news-quote-caption">${DOMPurify.sanitize(caption)}</cite>` : ''}
  </blockquote>`;
};

// Fonction pour générer du HTML pour un tableau
const renderTable = (block: EditorJsBlock): string => {
  const content = block.data.content || [];
  if (content.length === 0) return '';
  
  const withHeadings = block.data.withHeadings || false;
  
  const tableRows = content.map((row, rowIndex) => {
    const cells = row.map((cell, cellIndex) => {
      const isHeader = rowIndex === 0 && withHeadings;
      const tag = isHeader ? 'th' : 'td';
      const className = isHeader ? 'news-table-header' : 'news-table-cell';
      return `<${tag} class="${className}">${DOMPurify.sanitize(cell)}</${tag}>`;
    }).join('');
    return `<tr class="news-table-row">${cells}</tr>`;
  }).join('');
  
  return `<table class="news-table">
    <tbody>${tableRows}</tbody>
  </table>`;
};

// Fonction pour générer du HTML pour une image
const renderImage = (block: EditorJsBlock): string => {
  const imageUrl = block.data.file?.url || block.data.url || '';
  const caption = block.data.caption || '';
  const stretched = block.data.stretched || false;
  
  if (!imageUrl) return '';
  
  return `<div class="news-image ${stretched ? 'news-image-stretched' : ''}">
    <img src="${sanitizeUrl(imageUrl)}" 
         alt="${DOMPurify.sanitize(caption)}" 
         class="news-image-img" 
         loading="lazy" />
    ${caption ? `<div class="news-image-caption">${DOMPurify.sanitize(caption)}</div>` : ''}
  </div>`;
};

// Fonction pour générer du HTML pour le code
const renderCode = (block: EditorJsBlock): string => {
  const code = block.data.code || '';
  const language = block.data.language || '';
  
  return `<pre class="news-code ${language ? `language-${language}` : ''}">
    <code>${DOMPurify.sanitize(code)}</code>
  </pre>`;
};

// Fonction pour générer du HTML pour les embeds
const renderEmbed = (block: EditorJsBlock): string => {
  const service = (block.data.service || '').toLowerCase();
  const source = block.data.source || '';
  const embed = block.data.embed || '';
  const caption = block.data.caption || '';
  const width = block.data.width;
  const height = block.data.height;
  
  const captionHtml = caption ? 
    `<div class="embed-caption">${DOMPurify.sanitize(caption)}</div>` : '';
    
  // YouTube
  if (service === 'youtube' && source) {
    const videoId = extractYouTubeId(source);
    if (videoId) {
      return `<div class="embed-container">
        <div class="youtube-embed">
          <iframe src="https://www.youtube.com/embed/${videoId}" 
            class="youtube-iframe" 
            frameborder="0" 
            allowfullscreen
            loading="lazy"
            title="YouTube video">
          </iframe>
        </div>
        ${captionHtml}
      </div>`;
    }
  }
  
  // Vimeo
  if (service === 'vimeo' && source) {
    const videoId = extractVimeoId(source);
    if (videoId) {
      return `<div class="embed-container">
        <div class="vimeo-embed">
          <iframe src="https://player.vimeo.com/video/${videoId}" 
            class="vimeo-iframe" 
            frameborder="0" 
            allowfullscreen
            loading="lazy"
            title="Vimeo video">
          </iframe>
        </div>
        ${captionHtml}
      </div>`;
    }
  }
  
  // Twitter/X
  if ((service === 'twitter' || service === 'x') && source) {
    const tweetId = extractTweetId(source);
    if (tweetId) {
      return `<div class="twitter-embed-placeholder" 
        data-tweet-id="${tweetId}" 
        data-source="${sanitizeUrl(source)}"
        data-embed="${sanitizeUrl(embed)}"
        data-caption="${DOMPurify.sanitize(caption)}">
        <div class="loading-placeholder">جاري تحميل التغريدة...</div>
      </div>`;
    }
  }
  
  // Instagram
  if (service === 'instagram' && source) {
    const postId = extractInstagramId(source);
    if (postId) {
      return `<div class="embed-container">
        <div class="instagram-embed">
          <blockquote class="instagram-media" data-instgrm-permalink="${sanitizeUrl(source)}" data-instgrm-version="14">
            <a href="${sanitizeUrl(source)}" target="_blank" rel="noopener noreferrer">عرض على Instagram</a>
          </blockquote>
        </div>
        ${captionHtml}
      </div>`;
    }
  }
  
  // Generic iframe embed
  if (embed && embed.startsWith('<iframe')) {
    return `<div class="embed-container">
      <div class="generic-iframe">
        ${DOMPurify.sanitize(embed, { 
          ALLOWED_TAGS: ['iframe'], 
          ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'title', 'loading']
        })}
      </div>
      ${captionHtml}
    </div>`;
  }
  
  // Generic embed fallback
  return `<div class="generic-embed">
    <div class="embed-content">
      <div class="embed-icon">🔗</div>
      <a href="${sanitizeUrl(source)}" target="_blank" rel="noopener noreferrer" class="embed-link">
        عرض المحتوى المضمن
      </a>
      <div class="embed-service">${service || 'رابط خارجي'}</div>
    </div>
    ${captionHtml}
  </div>`;
};

// Fonction pour générer du HTML pour linkTool
const renderLinkTool = (block: EditorJsBlock): string => {
  const linkUrl = block.data.link || '';
  const meta = block.data.meta || {};
  const title = meta.title || linkUrl;
  const description = meta.description || '';
  const imageUrl = meta.image?.url || '';
  
  if (!linkUrl) return '';
  
  const linkImage = imageUrl ? 
    `<img src="${sanitizeUrl(imageUrl)}" alt="" class="link-image" loading="lazy" />` : '';
    
  return `<div class="link-preview">
    ${linkImage}
    <div class="link-content">
      <div class="link-title">
        <a href="${sanitizeUrl(linkUrl)}" target="_blank" rel="noopener noreferrer">
          ${DOMPurify.sanitize(title)}
        </a>
      </div>
      ${description ? `<div class="link-description">${DOMPurify.sanitize(description)}</div>` : ''}
      <div class="link-url">${DOMPurify.sanitize(linkUrl)}</div>
    </div>
  </div>`;
};

// Fonction pour générer du HTML pour un séparateur
const renderDelimiter = (block: EditorJsBlock): string => {
  return `<hr class="news-delimiter" />`;
};

// Fonction pour générer du HTML pour du texte brut
const renderRaw = (block: EditorJsBlock): string => {
  const html = block.data.html || '';
  return `<div class="news-raw">${DOMPurify.sanitize(html)}</div>`;
};

// Fonction pour générer du HTML pour un avertissement
const renderWarning = (block: EditorJsBlock): string => {
  const title = block.data.title || '';
  const message = block.data.message || '';
  
  return `<div class="news-warning">
    ${title ? `<div class="news-warning-title">${DOMPurify.sanitize(title)}</div>` : ''}
    ${message ? `<div class="news-warning-message">${DOMPurify.sanitize(message)}</div>` : ''}
  </div>`;
};

// Fonction principale pour parser le contenu Editor.js
export const parseEditorJsToHtml = (content: string): string => {
  try {
    const data: EditorJsData = JSON.parse(content);
    
    if (!data.blocks || !Array.isArray(data.blocks)) {
      return '<div class="error">تنسيق المحتوى غير صحيح</div>';
    }
    
    return data.blocks.map((block) => {
      try {
        switch (block.type) {
          case 'paragraph':
            return renderParagraph(block);
            
          case 'header':
            return renderHeader(block);
            
          case 'list':
            return renderList(block);
            
          case 'quote':
            return renderQuote(block);
            
          case 'table':
            return renderTable(block);
            
          case 'image':
            return renderImage(block);
            
          case 'delimiter':
            return renderDelimiter(block);
            
          case 'code':
            return renderCode(block);
            
          case 'embed':
            return renderEmbed(block);
            
          case 'linkTool':
          case 'link':
            return renderLinkTool(block);
            
          case 'raw':
            return renderRaw(block);
            
          case 'warning':
            return renderWarning(block);
            
          default:
            console.warn(`Type de bloc non supporté: ${block.type}`);
            return `<div class="unsupported-block">
              <div class="unsupported-block-icon">⚠️</div>
              <div class="unsupported-block-text">نوع المحتوى غير مدعوم: ${block.type}</div>
            </div>`;
        }
      } catch (blockError) {
        console.error(`Erreur lors du rendu du bloc ${block.id}:`, blockError);
        return `<div class="error">خطأ في عرض المحتوى</div>`;
      }
    }).join('');
    
  } catch (error) {
    console.error('Erreur lors du parsing du contenu Editor.js:', error);
    return '<div class="error">خطأ في تحليل المحتوى</div>';
  }
};

// Fonction pour extraire le texte pur du contenu Editor.js
export const extractPlainText = (content: string): string => {
  try {
    const data: EditorJsData = JSON.parse(content);
    
    return data.blocks.map((block) => {
      switch (block.type) {
        case 'paragraph':
        case 'header':
        case 'quote':
          return block.data.text || '';
        case 'list':
          return (block.data.items || []).join(' ');
        case 'table':
          return (block.data.content || []).flat().join(' ');
        default:
          return '';
      }
    }).join(' ').replace(/\s+/g, ' ').trim();
    
  } catch (error) {
    console.error('Erreur lors de l\'extraction du texte:', error);
    return '';
  }
};

// Fonction pour compter les mots dans le contenu Editor.js
export const countWords = (content: string): number => {
  const plainText = extractPlainText(content);
  return plainText.split(/\s+/).filter(word => word.length > 0).length;
};

// Fonction pour estimer le temps de lecture
export const estimateReadingTime = (content: string): number => {
  const wordCount = countWords(content);
  const wordsPerMinute = 200; // Moyenne pour l'arabe
  return Math.ceil(wordCount / wordsPerMinute);
};