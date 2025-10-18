import React, { useEffect, useState, useCallback } from "react";
import SEO from "@/components/SEO";
import { useParams, Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// Card is not used directly here
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Flag, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CommentsSection from "@/components/CommentsSection";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';
import { useAuth } from "@/contexts/AuthContext";
import { extractIdFromSlug, isWordPressSlug, generateUniqueSlug, generateWordPressSlug, generateSlug } from "@/utils/slugUtils";

// Instagram Embed using react-instagram-embed
// Custom Instagram Embed for React 18
const InstagramEmbed: React.FC<{ url: string }> = ({ url }) => {
  // Extract post shortcode from URL
  const shortcodeExec = /instagram\.com\/(?:p|tv|reel)\/([\w-]+)/.exec(url);
  const shortcode = shortcodeExec ? shortcodeExec[1] : null;
  if (!shortcode) {
    return (
      <div className="generic-embed error">
        <p>لا يمكن عرض منشور إنستغرام</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="embed-link">مشاهدة على إنستغرام</a>
      </div>
    );
  }
  // Official Instagram embed HTML
  return (
    <div className="embed-container" style={{ margin: '20px 0', textAlign: 'center' }}>
      <iframe
        src={`https://www.instagram.com/p/${shortcode}/embed`}
        width="400"
        height="480"
        allow="encrypted-media"
        style={{ borderRadius: 8, maxWidth: '100%', border: 0 }}
        title="Instagram Post"
      />
      <div className="embed-caption">
        <a href={url} target="_blank" rel="noopener noreferrer" className="embed-link">مشاهدة على إنستغرام</a>
      </div>
    </div>
  );
};

// Types pour WordPress
interface WordPressNewsItem {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  featured_media?: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
}

// Interface pour les blocs Editor.js
interface EditorJsBlock {
  id: string;
  type: string;
  data: {
    text?: string;
    // items may be strings or objects depending on the Editor.js output
    items?: Array<string | { content?: string }>;
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
  };
}

interface EditorJsData {
  time: number;
  blocks: EditorJsBlock[];
  version: string;
}

interface NewsRow {
  id: number;
  title: string;
  content: string;
  created_at: string;
  image_url?: string | null;
  status?: string | null;
  competition_internationale_id?: number;
  competition_mondiale_id?: number;
  competition_continentale_id?: number;
  competition_locale_id?: number;
  source?: 'wordpress' | 'supabase';
}

interface RelatedNewsItem {
  id: number;
  title: string;
  image_url?: string | null;
  created_at: string;
  source?: 'wordpress' | 'supabase';
}

function extractTweetId(url: string): string | null {
  // Gère les URLs de type x.com ou twitter.com
  const exec = /(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/.exec(url);
  return exec ? exec[1] : null;
}

// Fonction pour extraire le nom d'utilisateur depuis l'URL
const extractTwitterUsername = (url: string): string | null => {
  const exec = /(?:twitter\.com|x\.com)\/(\w+)\/status\/\d+/.exec(url);
  return exec ? exec[1] : null;
};

// Fonction pour extraire l'ID YouTube
const extractYouTubeId = (url: string): string | null => {
  const exec = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/.exec(url);
  return exec ? exec[1] : null;
};

// Fonction pour nettoyer et valider le JSON avant parsing
const cleanJsonString = (jsonString: string): string => {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error('JSON string is empty or invalid');
  }
  
  try {
    // Remplacer les échappements malformés
    const cleaned = jsonString
      .replace(/\\&quot;/g, '"')  // Remplacer \&quot; par "
      .replace(/&quot;/g, '"')   // Remplacer &quot; par "
      .replace(/\\"/g, '"')      // Remplacer \" par "
      .replace(/""/g, '"')       // Remplacer "" par "
      .replace(/\\\\/g, '\\');   // Nettoyer les double backslashes
    
    // Tenter de parser pour vérifier la validité
    JSON.parse(cleaned);
    return cleaned;
  } catch (error) {
    console.warn('Première tentative de nettoyage JSON échouée, tentative alternative...');
    
    try {
      // Méthode alternative : échapper correctement les guillemets dans les valeurs HTML
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
      
      // Vérifier la validité du JSON nettoyé
      JSON.parse(alternativeCleaned);
      return alternativeCleaned;
    } catch (secondError) {
      console.error('Impossible de nettoyer le JSON:', secondError);
      throw new Error('Format JSON invalide et non réparable');
    }
  }
};

function normalizeTwitterUrl(url: string): string {
  return url.replace("https://x.com", "https://twitter.com");
}

// Composant Twitter amélioré
export const XEmbed: React.FC<{ url: string; caption?: string }> = ({ url, caption }) => {
  const normalizedUrl = normalizeTwitterUrl(url);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("twitter-wjs")) {
      const script = document.createElement("script");
      script.id = "twitter-wjs";
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = () => {
        // @ts-expect-error - Twitter widgets API
        window.twttr?.widgets?.load();
      };
      document.body.appendChild(script);
    } else {
      // @ts-expect-error - Twitter widgets API
      window.twttr?.widgets?.load();
    }
  }, [normalizedUrl]);

  return (
    <div style={{ margin: "20px 0", maxWidth: "550px", marginLeft: "auto", marginRight: "auto" }}>
      <blockquote key={normalizedUrl} className="twitter-tweet" data-theme="light">
        <a href={normalizedUrl}></a>
      </blockquote>
      {caption && (
        <p style={{ textAlign: "center", fontSize: "14px", marginTop: "8px", color: "#666" }}>
          {caption}
        </p>
      )}
    </div>
  );
};

// Nouveau parser React-friendly
const parseEditorJsBlocks = (content: string): EditorJsBlock[] => {
  try {
    if (!content || typeof content !== 'string') {
      console.warn('Content is empty or not a string');
      return [];
    }
    
    const cleanedContent = cleanJsonString(content);
    const data: EditorJsData = JSON.parse(cleanedContent);
    
    if (!data || !Array.isArray(data.blocks)) {
      console.warn('Invalid Editor.js data structure');
      return [];
    }
    
    return data.blocks;
  } catch (error) {
    console.error('Erreur lors du parsing du contenu Editor.js:', error);
    return [];
  }
};

// Clean WordPress HTML artifacts (e.g. leftover oEmbed attributes like ref_src or rel/target fragments)
// Important: preserve anchor tags (so Twitter/X links remain detectable). Only strip problematic attributes.
const cleanWordPressHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return html;
  let s = html;
  // Remove ref_src attributes inside tags (but keep the tag)
  s = s.replace(/\sref_src=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  // Remove rel="nofollow noopener" attribute (keep the anchor)
  s = s.replace(/\srel=(?:"nofollow noopener"|'nofollow noopener')/gi, '');
  // Remove target attribute values that can produce leftover fragments
  s = s.replace(/\starget=(?:"_blank"|'_blank')/gi, '');
  // Remove empty attributes that might remain like dangling > fragments
  s = s.replace(/\s+>/g, '>');
  // Trim any accidental orphaned attribute fragments (defensive)
  s = s.replace(/ref_src=[^\s>]+/gi, '');
  return s;
}

// Utilitaire pour nettoyer le HTML
const stripHtml = (html: string) =>
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

// Utilitaire pour fallback HTML pour les blocs non gérés
const parseOtherBlocksToHtml = (block: EditorJsBlock): string => {
  switch (block.type) {
    case 'quote':
      return `<blockquote class="news-quote">${DOMPurify.sanitize(block.data.text || '')}</blockquote>`;
    case 'code': {
      const code = block.data.code || '';
      // Detect Twitter embed HTML
      const twitterMatch = /<blockquote class="twitter-tweet"[\s\S]*?<a href="(https:\/\/twitter.com\/[^"\s]+)"[^>]*>[^<]*<\/a><\/blockquote>/.exec(code);
      if (twitterMatch && twitterMatch[1]) {
        // Mark for React rendering
        return `__REACT_TWITTER_EMBED__${twitterMatch[1]}__`;
      }
      return `<pre class="news-code"><code>${DOMPurify.sanitize(code)}</code></pre>`;
    }
    case 'delimiter':
      return `<hr class="news-delimiter" />`;
    case 'table': {
      const tableRows = block.data.content?.map((row, rowIndex) => {
        const cells = row.map((cell, cellIndex) => {
          const isHeader = rowIndex === 0 && block.data.withHeadings;
          const tag = isHeader ? 'th' : 'td';
          const className = isHeader ? 'news-table-header' : 'news-table-cell';
          return `<${tag} class="${className}">${DOMPurify.sanitize(cell)}</${tag}>`;
        }).join('');
        return `<tr class="news-table-row">${cells}</tr>`;
      }).join('') || '';
      return `<table class="news-table"><tbody>${tableRows}</tbody></table>`;
    }
    case 'image': {
      const imageUrl = block.data.file?.url || block.data.url || '';
      const caption = block.data.caption ? 
        `<div class="news-image-caption">${DOMPurify.sanitize(block.data.caption)}</div>` : '';
      return `<div class="news-image">
        <img src="${imageUrl}" alt="${block.data.caption || ''}" class="news-image-img" loading="lazy" />
        ${caption}
      </div>`;
    }
    case 'list': {
      const listItems = block.data.items?.map(item => {
        const text = typeof item === 'string' ? item : (item?.content || '');
        return `<li class="news-list-item">${DOMPurify.sanitize(text)}</li>`;
      }).join('') || '';
      return `<ul class="news-list">${listItems}</ul>`;
    }
    default:
      return '';
  }
};

// Styles CSS complets pour le contenu
const newsContentStyles = `
  /* Modern, clean, and readable styles for news content */
  .news-content {
    line-height: 1.9;
    font-size: 17px;
    color: #222;
    font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    direction: rtl;
    text-align: right;
    background: transparent;
    word-break: break-word;
    transition: color 0.2s;
  }

  .dark .news-content, [data-theme="dark"] .news-content {
    color: #f3f4f6 !important;
    background: transparent;
  }
  @media (prefers-color-scheme: dark) {
    .news-content { color: #f3f4f6 !important; }
  }

  .news-paragraph {
    margin: 18px 0;
    text-align: justify;
    direction: rtl;
    color: #222;
    font-size: 17px;
  }
  .dark .news-paragraph, [data-theme="dark"] .news-paragraph {
    color: #f3f4f6 !important;
  }

  .news-header {
    font-weight: bold;
    margin: 28px 0 18px 0;
    color: #222;
    direction: rtl;
    letter-spacing: -0.5px;
  }
  .dark .news-header, [data-theme="dark"] .news-header {
    color: #f3f4f6 !important;
  }
  .news-header-1 { font-size: 2.2em; }
  .news-header-2 { font-size: 1.7em; }
  .news-header-3 { font-size: 1.4em; }
  .news-header-4 { font-size: 1.15em; }
  .news-header-5 { font-size: 1em; }
  .news-header-6 { font-size: 0.95em; }

  .news-list {
    margin: 20px 0;
    padding-right: 28px;
    direction: rtl;
  }
  .news-list-item {
    margin: 12px 0;
    line-height: 1.8;
    color: #222;
    font-size: 16px;
  }
  .dark .news-list-item, [data-theme="dark"] .news-list-item {
    color: #f3f4f6 !important;
  }

  .news-quote {
    border-right: 4px solid #0066cc;
    padding: 18px 22px;
    margin: 24px 0;
    background: #f8f9fa;
    font-style: italic;
    border-radius: 6px;
    direction: rtl;
    color: #222;
  }
  .dark .news-quote, [data-theme="dark"] .news-quote {
    background: #18181b;
    border-right-color: #3b82f6;
    color: #e5e7eb;
  }

  .news-table {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
    font-size: 15px;
    border: 1px solid #ddd;
    border-radius: 10px;
    overflow: hidden;
    direction: rtl;
    background: #fff;
  }
  .dark .news-table, [data-theme="dark"] .news-table {
    border-color: #374151;
    background: #18181b;
  }
  .news-table-header {
    background: #f5f5f5;
    font-weight: bold;
    padding: 14px 10px;
    text-align: center;
    border-bottom: 2px solid #ddd;
    color: #222;
  }
  .dark .news-table-header, [data-theme="dark"] .news-table-header {
    background: #23272f;
    color: #e5e7eb;
    border-bottom-color: #374151;
  }
  .news-table-cell {
    padding: 12px 10px;
    text-align: center;
    border-bottom: 1px solid #eee;
    color: #222;
  }
  .dark .news-table-cell, [data-theme="dark"] .news-table-cell {
    border-bottom-color: #374151;
    color: #e5e7eb;
  }
  .news-table-row:nth-child(even) {
    background: #fafafa;
  }
  .dark .news-table-row:nth-child(even) {
    background: #23272f;
  }
  .news-table-row:hover {
    background: #f0f0f0;
    transition: background 0.2s ease;
  }
  .dark .news-table-row:hover {
    background: #23272f;
  }

  .news-image {
    margin: 24px 0;
    text-align: center;
  }
  .news-image-img {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.10);
    background: #fff;
  }
  .news-image-caption {
    margin-top: 10px;
    font-size: 15px;
    color: #666;
    font-style: italic;
  }
  .dark .news-image-caption, [data-theme="dark"] .news-image-caption {
    color: #9ca3af;
  }

  .news-delimiter {
    margin: 36px 0;
    border: none;
    height: 2px;
    background: linear-gradient(to right, transparent, #ddd, transparent);
  }
  .dark .news-delimiter, [data-theme="dark"] .news-delimiter {
    background: linear-gradient(to right, transparent, #374151, transparent);
  }

  .news-code {
    background: #f4f4f4;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 18px;
    margin: 18px 0;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 15px;
    direction: ltr;
    text-align: left;
    color: #222;
  }
  .dark .news-code, [data-theme="dark"] .news-code {
    background: #23272f;
    border-color: #374151;
    color: #e5e7eb;
  }

  .embed-container {
    margin: 24px 0;
    text-align: center;
  }
  .youtube-embed {
    position: relative;
    width: 100%;
    max-width: 560px;
    margin: 0 auto;
  }
  .youtube-iframe {
    width: 100%;
    height: 320px;
    border-radius: 10px;
  }
  .embed-caption {
    margin-top: 12px;
    font-size: 15px;
    color: #666;
    font-style: italic;
  }
  .dark .embed-caption, [data-theme="dark"] .embed-caption {
    color: #9ca3af;
  }

  .generic-embed {
    margin: 24px 0;
    padding: 18px;
    border: 1px solid #ddd;
    border-radius: 10px;
    background: #f9f9f9;
    text-align: center;
    color: #222;
  }
  .dark .generic-embed, [data-theme="dark"] .generic-embed {
    background: #18181b;
    border-color: #374151;
    color: #e5e7eb;
  }

  .embed-link {
    color: #0066cc;
    text-decoration: none;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: color 0.2s;
  }
  .embed-link:hover {
    text-decoration: underline;
    color: #004499;
  }

  .link-preview {
    border: 1px solid #e1e8ed;
    border-radius: 14px;
    overflow: hidden;
    margin: 24px 0;
    max-width: 520px;
    background: #fff;
  }
  .dark .link-preview, [data-theme="dark"] .link-preview {
    background: #18181b;
    border-color: #374151;
  }
  .link-image {
    width: 100%;
    height: 210px;
    object-fit: cover;
    border-radius: 0;
  }
  .link-content {
    padding: 18px;
  }
  .link-title a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
    font-size: 1.1em;
    transition: color 0.2s;
  }
  .link-title a:hover {
    color: #0066cc;
  }
  .dark .link-title a, [data-theme="dark"] .link-title a {
    color: #e5e7eb;
  }
  .dark .link-title a:hover, [data-theme="dark"] .link-title a:hover {
    color: #93c5fd;
  }
  .link-description {
    margin: 10px 0;
    color: #666;
    font-size: 15px;
  }
  .dark .link-description, [data-theme="dark"] .link-description {
    color: #9ca3af;
  }
  .link-url {
    color: #999;
    font-size: 13px;
    direction: ltr;
    text-align: left;
  }

  .news-content a {
    color: #0066cc;
    text-decoration: underline;
    font-weight: 500;
    transition: color 0.2s;
  }
  .news-content a:hover {
    color: #004499;
  }
  .dark .news-content a, [data-theme="dark"] .news-content a {
    color: #93c5fd;
  }
  .dark .news-content a:hover, [data-theme="dark"] .news-content a:hover {
    color: #60a5fa;
  }

  .error {
    padding: 22px;
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 10px;
    color: #c33;
    margin: 24px 0;
    text-align: center;
    font-size: 16px;
  }
  .dark .error, [data-theme="dark"] .error {
    background: #2d2323;
    border-color: #c33;
    color: #fcc;
  }

  .wordpress-content {
    line-height: 1.8;
    font-size: 16px;
    color: #333;
    direction: rtl;
    text-align: right;
  }
  .dark .wordpress-content {
    color: #e5e7eb;
  }
  .wordpress-content h1, .wordpress-content h2, .wordpress-content h3, .wordpress-content h4, .wordpress-content h5, .wordpress-content h6 {
    font-weight: bold;
    margin: 20px 0 12px 0;
    color: #222;
  }
  .dark .wordpress-content h1, .dark .wordpress-content h2, .dark .wordpress-content h3, 
  .dark .wordpress-content h4, .dark .wordpress-content h5, .dark .wordpress-content h6 {
    color: #f3f4f6;
  }
  .wordpress-content p {
    margin: 16px 0;
    text-align: justify;
  }
  .wordpress-content ul, .wordpress-content ol {
    margin: 16px 0;
    padding-right: 24px;
  }
  .wordpress-content li {
    margin: 8px 0;
  }
  .wordpress-content img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 16px auto;
    display: block;
  }
  .wordpress-content blockquote {
    border-right: 4px solid #0066cc;
    padding: 16px 20px;
    margin: 20px 0;
    background: #f8f9fa;
    border-radius: 6px;
  }
  .dark .wordpress-content blockquote {
    background: #18181b;
    border-right-color: #3b82f6;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .news-content {
      font-size: 16px;
    }
    .news-header {
      font-size: 1.1em;
    }
    .news-image-img {
      border-radius: 8px;
    }
    .news-table {
      font-size: 13px;
    }
    .youtube-iframe {
      height: 220px;
    }
    .link-image {
      height: 140px;
    }
  }
  @media (max-width: 600px) {
    .news-content {
      font-size: 15px;
    }
    .news-header {
      font-size: 1em;
    }
    .news-image-img {
      border-radius: 6px;
    }
    .news-table {
      font-size: 12px;
    }
    .news-table-header,
    .news-table-cell {
      padding: 8px 4px;
    }
    .youtube-iframe {
      height: 160px;
    }
    .link-image {
      height: 90px;
    }
  }
  @media (max-width: 400px) {
    .news-content {
      font-size: 14px;
    }
    .news-table {
      font-size: 11px;
    }
    .news-table-header,
    .news-table-cell {
      padding: 6px 3px;
    }
    .news-image-img {
      border-radius: 4px;
    }
    .link-image {
      height: 60px;
    }
    .twitter-embed-content .twitter-tweet-rendered img,
    .twitter-embed-content .twitter-tweet-rendered video {
      width: 100% !important;
      height: 180px !important;
      object-fit: cover !important;
      object-position: center top !important;
      border-radius: 8px;
      display: block;
    }
  }

  .news-full-image {
    width: 100%;
    max-width: 100%;
    height: 420px;
    max-height: 60vh;
    object-fit: cover;
    object-position: center top;
    border-radius: 0;
    box-shadow: 0 2px 16px rgba(0,0,0,0.10);
    display: block;
    margin: 0 auto 18px auto;
  }
  @media (max-width: 768px) {
    .news-full-image {
      height: 220px;
      max-height: 40vh;
    }
  }
  @media (max-width: 480px) {
    .news-full-image {
      height: 140px;
      max-height: 28vh;
    }
  }
  .news-big-title {
    font-size: 2em !important;
    font-weight: bold !important;
    text-align: right !important;
    margin-bottom: 18px !important;
    margin-top: 0 !important;
    color: #222 !important;
    font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
    letter-spacing: 0;
  }
  .dark .news-big-title { color: #f3f4f6 !important; }
`

const NewsDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [news, setNews] = useState<NewsRow | null>(null);
  const [relatedNews, setRelatedNews] = useState<RelatedNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [reporting, setReporting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportDesc, setReportDesc] = useState('');
  const [parsedBlocks, setParsedBlocks] = useState<EditorJsBlock[]>([]);
  const [isWordPressNews, setIsWordPressNews] = useState(false);
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);

  const loadWordPressNews = useCallback(async (newsSlug: string) => {
    try {
      console.log('Loading WordPress news with slug:', newsSlug);
      
      // Extraire l'ID WordPress du slug
      let wpId: string;
      if (newsSlug.startsWith('wp_')) {
        // Format: wp_12345
        wpId = newsSlug.replace('wp_', '');
      } else if (newsSlug.includes('wp_')) {
        // Format: titre-article-wp_12345
  const m = /wp_(\d+)$/.exec(newsSlug);
  wpId = m ? m[1] : '';
      } else {
        // Fallback : essayer d'extraire un ID numérique à la fin
  const m2 = /-(\d+)$/.exec(newsSlug);
  wpId = m2 ? m2[1] : '';
      }
      
      console.log('Extracted WordPress ID:', wpId);
      
      if (!wpId) {
        throw new Error('Could not extract WordPress ID from slug');
      }
      
      const url = `https://beta.koora.com/wp-json/wp/v2/posts/${wpId}?_embed`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('WordPress API response not ok:', response.status, response.statusText);
        throw new Error('WordPress news not found');
      }
      
      const wpNews: WordPressNewsItem = await response.json();
      console.log('WordPress news loaded successfully:', wpNews.title.rendered);
      
      // Chercher l'image principale :
      let imageUrl = wpNews._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
      // Si pas d'image, chercher la première image dans le contenu HTML
      if (!imageUrl && wpNews.content?.rendered) {
        const imgMatchExec = /<img[^>]+src=["']([^"'>]+)["']/i.exec(wpNews.content.rendered);
        if (imgMatchExec && imgMatchExec[1]) {
          imageUrl = imgMatchExec[1];
        }
      }
      // Si toujours pas d'image, chercher un lien Twitter/X et utiliser l'image d'aperçu
      if (!imageUrl && wpNews.content?.rendered) {
  const twitterMatchExec = /https?:\/\/(?:twitter|x)\.com\/[^"\s]+/i.exec(wpNews.content.rendered);
        if (twitterMatchExec && twitterMatchExec[0]) {
          // Utiliser l'API oEmbed Twitter pour récupérer l'image d'aperçu
          try {
            const oembedRes = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(twitterMatchExec[0])}`);
            if (oembedRes.ok) {
              const oembedData = await oembedRes.json();
              // Chercher une image dans le HTML retourné
              const thumbMatchExec = /<img[^>]+src=["']([^"'>]+)["']/i.exec(oembedData.html);
              if (thumbMatchExec && thumbMatchExec[1]) {
                imageUrl = thumbMatchExec[1];
              }
            }
          } catch (e) { /* ignorer */ }
        }
      }
      const transformedNews: NewsRow = {
        id: wpNews.id,
        title: stripHtml(wpNews.title.rendered),
        content: cleanWordPressHtml(wpNews.content.rendered || ''), // Garder le HTML pour WordPress, nettoyé
        created_at: wpNews.date,
        image_url: imageUrl,
        source: 'wordpress'
      };

      setNews(transformedNews);
      setIsWordPressNews(true);
      
      // Pour WordPress: récupérer les catégories du post puis charger les posts WP
      try {
        // Récupérer les catégories via le endpoint _embedded si présent
        const categoryIds: number[] = [];
        if (wpNews._embedded && wpNews._embedded['wp:term']) {
          // wp:term est un tableau d'arrays: [[cats], [tags]]
          const terms = wpNews._embedded['wp:term'];
          for (const termGroup of terms) {
            if (Array.isArray(termGroup)) {
              termGroup.forEach((t: { taxonomy?: string; id?: number }) => {
                if (t.taxonomy === 'category' && t.id) categoryIds.push(t.id);
              });
            }
          }
        }

        // Si pas d'_embedded categories, demander l'endpoint categories pour ce post
        if (categoryIds.length === 0) {
          const wpCats = ((wpNews as unknown) as { categories?: number[] }).categories;
          if (Array.isArray(wpCats)) {
            wpCats.forEach((c) => categoryIds.push(c));
          }
        }

        // Si on a au moins une catégorie, charger les posts de la première catégorie
        if (categoryIds.length > 0) {
          const catId = categoryIds[0];
          const relatedUrl = `https://beta.koora.com/wp-json/wp/v2/posts?categories=${catId}&per_page=6&_embed`;
          const relRes = await fetch(relatedUrl);
          if (relRes.ok) {
            const relPosts: WordPressNewsItem[] = await relRes.json();
            // Filtrer le post courant et mapper au format RelatedNewsItem
            const mapped = relPosts
              .filter(p => p.id !== wpNews.id)
              .slice(0, 5)
              .map((p) => {
                const img = p._embedded?.['wp:featuredmedia']?.[0]?.source_url || (() => {
                  const rendered = (p as unknown as WordPressNewsItem).content?.rendered;
                  const m = rendered ? /<img[^>]+src=["']([^"']+)["']/i.exec(rendered) : null;
                  return m ? m[1] : null;
                })();
                return {
                  id: p.id,
                  title: stripHtml(p.title.rendered),
                  image_url: img,
                  created_at: p.date
                } as RelatedNewsItem;
              });
            // mark source as wordpress
            mapped.forEach(m => (m.source = 'wordpress'));
            if (mapped.length > 0) {
              setRelatedNews(mapped);
            } else {
              // fallback: recent supabase
              const { data: generalRelated } = await supabase
                .from('news')
                .select('id, title, image_url, created_at')
                .eq('status', 'published')
                .limit(5)
                .order('created_at', { ascending: false });
              // ensure supabase items have source
              const supMapped = (generalRelated || []).map((r: unknown) => ({ ...(r as RelatedNewsItem), source: 'supabase' } as RelatedNewsItem));
              setRelatedNews(supMapped);
            }
          } else {
            // fallback to recent supabase
            const { data: generalRelated } = await supabase
              .from('news')
              .select('id, title, image_url, created_at')
              .eq('status', 'published')
              .limit(5)
              .order('created_at', { ascending: false });
            const supMapped2 = (generalRelated || []).map((r: unknown) => ({ ...(r as RelatedNewsItem), source: 'supabase' } as RelatedNewsItem));
            setRelatedNews(supMapped2);
          }
        } else {
          // Pas de catégorie trouvée, fallback
          const { data: generalRelated } = await supabase
            .from('news')
            .select('id, title, image_url, created_at')
            .eq('status', 'published')
            .limit(5)
            .order('created_at', { ascending: false });
          setRelatedNews(generalRelated || []);
        }
      } catch (relatedErr) {
        console.error('Error fetching related WP posts:', relatedErr);
        const { data: generalRelated } = await supabase
          .from('news')
          .select('id, title, image_url, created_at')
          .eq('status', 'published')
          .limit(5)
          .order('created_at', { ascending: false });
        setRelatedNews(generalRelated || []);
      }
      
    } catch (error) {
      console.error('Error loading WordPress news:', error);
      throw error;
    }
  }, []);

  const loadSupabaseNews = useCallback(async (newsId: string) => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, content, created_at, image_url, status, competition_internationale_id, competition_mondiale_id, competition_continentale_id, competition_locale_id')
        .eq('id', Number(newsId))
        .single();
        
      if (error) throw error;
      
      const newsWithSource: NewsRow = {
        ...data,
        source: 'supabase'
      };
      
      setNews(newsWithSource);
      setIsWordPressNews(false);

      // Parse content pour Supabase (Editor.js)
      if (data?.content) {
        const blocks = parseEditorJsBlocks(data.content);
        setParsedBlocks(blocks);
      }

      // Fetch related news pour Supabase
      let relatedQuery = supabase
        .from('news')
        .select('id, title, image_url, created_at')
        .neq('id', Number(newsId))
        .eq('status', 'published')
        .limit(5);

      // Priority order for related news
      if (data.competition_internationale_id) {
        relatedQuery = relatedQuery.eq('competition_internationale_id', data.competition_internationale_id);
      } else if (data.competition_mondiale_id) {
        relatedQuery = relatedQuery.eq('competition_mondiale_id', data.competition_mondiale_id);
      } else if (data.competition_continentale_id) {
        relatedQuery = relatedQuery.eq('competition_continentale_id', data.competition_continentale_id);
      } else if (data.competition_locale_id) {
        relatedQuery = relatedQuery.eq('competition_locale_id', data.competition_locale_id);
      }

      const { data: related, error: relatedError } = await relatedQuery;
      
      if (relatedError) {
        console.error('Error fetching related news:', relatedError);
        // Fallback to general recent news
        const { data: generalRelated } = await supabase
          .from('news')
          .select('id, title, image_url, created_at')
          .neq('id', Number(newsId))
          .eq('status', 'published')
          .limit(5)
          .order('created_at', { ascending: false });
        setRelatedNews(generalRelated || []);
      } else {
        setRelatedNews(related || []);
      }
    } catch (error) {
      console.error('Error loading Supabase news:', error);
      throw error;
    }
  }, []);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setParsedBlocks([]);
    setIsWordPressNews(false);
    
    try {
      // Déterminer si c'est une news WordPress ou Supabase par le slug
      if (isWordPressSlug(slug)) {
        // C'est une news WordPress
        await loadWordPressNews(slug);
      } else {
        // Extraire l'ID du slug et charger depuis Supabase
        const newsId = extractIdFromSlug(slug);
        if (newsId) {
          await loadSupabaseNews(newsId);
        } else {
          // Fallback: attempt to resolve title-only slug by fetching recent published news
          try {
            type Candidate = { id: number; title: string };
            const { data: candidates } = await supabase
              .from('news')
              .select('id, title')
              .eq('status', 'published')
              .order('created_at', { ascending: false })
              .limit(500);

            const list: Candidate[] = (candidates as Candidate[]) || [];
            const found = list.find((c) => generateSlug(c.title || '') === slug);
            if (found) {
              await loadSupabaseNews(String(found.id));
            } else {
              throw new Error('ID invalide dans le slug');
            }
          } catch (lookupError) {
            console.error('Error resolving slug to id:', lookupError);
            throw new Error('ID invalide dans le slug');
          }
        }
      }
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error?.message || 'فشل في تحميل الخبر');
    } finally {
      setLoading(false);
    }
  }, [slug, loadWordPressNews, loadSupabaseNews]);

  const location = useLocation();
  const previewMode = new URLSearchParams(location.search).get('preview') === '1';

  const handleReport = async () => {
    if (!user || !reportDesc.trim()) return;
    
    // Ne pas permettre le rapport pour les news WordPress
    if (isWordPressNews) {
      toast({
        title: "غير متاح",
        description: "لا يمكن الإبلاغ عن المحتوى الخارجي",
        variant: "destructive",
      });
      return;
    }
    
    setReporting(true);
    try {
      const { error } = await supabase
        .from('reports')
        .insert([
          {
            user_id: user.id,
            news_id: Number(extractIdFromSlug(slug!)),
            description: reportDesc.trim(),
          },
        ]);

      if (error) throw error;

      toast({
        title: "تم الإبلاغ بنجاح",
        description: "شكراً لك، سيتم مراجعة البلاغ من قبل فريق الإدارة",
      });

      setReportOpen(false);
      setReportDesc('');
    } catch (error) {
      console.error('Error reporting news:', error);
      toast({
        title: "خطأ في الإبلاغ",
        description: "حدث خطأ أثناء إرسال البلاغ، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setReporting(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  // Scroll to top and focus title when a news is loaded or when preview mode is active
  useEffect(() => {
    if (!news) return;
    if (typeof window !== 'undefined') {
      try {
        // Smooth scroll for preview mode, instant for full view
        if (previewMode) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo(0, 0);
        }
      } catch (err) {
        // ignore
      }
    }

    // Focus the title for accessibility so the user lands at the top
    try {
      if (titleRef.current) {
        // tabIndex -1 is set on the heading so it can receive programmatic focus
        titleRef.current.focus();
      }
    } catch (err) {
      // ignore
    }
  }, [news, previewMode]);

  // If preview mode is requested, show only title + main image (no content)
  if (!loading && news && previewMode) {
    return (
      <>
        <SEO title={news.title} description={news.title} image={news.image_url || undefined} />
        <style dangerouslySetInnerHTML={{ __html: newsContentStyles }} />
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
              {news.image_url && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <img src={news.image_url} alt={news.title} className="news-full-image" />
                </div>
              )}
                <div className="p-6 text-center">
                <h1 ref={titleRef} tabIndex={-1} className="news-big-title">{news.title}</h1>
                <div className="mt-4">
                  <Link to={location.pathname} className="text-blue-600 hover:underline">عرض المقال الكامل</Link>
                </div>
              </div>
            </article>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !news) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">خطأ في تحميل الخبر</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'الخبر غير موجود'}</p>
            <Link to="/news" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
              العودة إلى الأخبار
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO 
        title={news.title}
        description={news.title}
        image={news.image_url || undefined}
      />
      
      <style dangerouslySetInnerHTML={{ __html: newsContentStyles }} />
      
      <Header />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side - Article content */}
            <div className="lg:col-span-2">
              <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
                {news.image_url && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <img 
                      src={news.image_url} 
                      alt={news.title}
                      className="news-full-image"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h1 ref={titleRef} tabIndex={-1} className="news-big-title">{news.title}</h1>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4"  />
                        <time dateTime={news.created_at} dir="rtl">
                          {(() => {
                            const date = new Date(news.created_at);
                            const months = [
                              'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                              'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
                            ];
                            const day = date.getDate();
                            const month = months[date.getMonth()];
                            const year = date.getFullYear();
                            return `${day} ${month}, ${year}`;
                          })()}
                        </time>
                      </div>
                      
                      {/* Badge pour source WordPress */}
                      {isWordPressNews && (
                        <Badge variant="secondary" className="bg-blue-600 text-white">
                          كورة نيوز
                        </Badge>
                      )}
                    </div>
                    
                    {isAuthenticated && !isWordPressNews && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReportOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Flag className="h-4 w-4" />
                        إبلاغ
                      </Button>
                    )}
                  </div>
                  
                  {!previewMode && (
                  <div className={isWordPressNews ? "wordpress-content" : "news-content"}>
                    {isWordPressNews ? (
                      // Contenu WordPress - rendu avec détection des liens Twitter/X
                      <>
                        {(() => {
                          // Split le contenu sur les liens Twitter/X de type /status/ uniquement
                          const parts: React.ReactNode[] = [];
                          const regex = /(https?:\/\/(?:twitter|x)\.com\/[\w\-@.]+\/status\/[0-9]+)/gi;
                          let lastIndex = 0;
                          let match;
                          const raw = news.content || '';
                          while ((match = regex.exec(raw)) !== null) {
                            // Ajouter le HTML avant le lien
                            if (match.index > lastIndex) {
                              let before = raw.slice(lastIndex, match.index);
                              // Use central sanitizer to remove WordPress embed artifacts
                              before = cleanWordPressHtml(before);
                              parts.push(<span key={lastIndex} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(before) }} />);
                            }
                            // Ajouter l'embed
                            parts.push(
                              <div key={match[0]} style={{margin: '18px 0'}}>
                                <XEmbed url={match[0]} />
                              </div>
                            );
                            lastIndex = match.index + match[0].length;
                          }
                          // Ajouter le reste du HTML
                          if (lastIndex < raw.length) {
                            let after = raw.slice(lastIndex);
                            after = cleanWordPressHtml(after);
                            parts.push(<span key={lastIndex} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(after) }} />);
                          }
                          return parts;
                        })()}
                      </>
                    ) : (
                      // Contenu Supabase - rendu Editor.js
                      parsedBlocks.map((block, index) => {
                        try {
                          // Special handling for code blocks with Twitter embed marker or HTML
                          if (block.type === 'code') {
                            const code = block.data.code || '';
                            // 1. Detect marker
                            const reactTwitterMarkerExec = /^__REACT_TWITTER_EMBED__(https:\/\/twitter.com\/[^_]+)__$/.exec(code);
                            if (reactTwitterMarkerExec) {
                              return <XEmbed key={index} url={reactTwitterMarkerExec[1]} />;
                            }
                            // 2. Detect Twitter embed HTML directly
                            const twitterHtmlMatchExec = /<blockquote class="twitter-tweet"[\s\S]*?<a href="(https:\/\/twitter.com\/[^"\s]+)"[^>]*>[^<]*<\/a><\/blockquote>/.exec(code);
                            if (twitterHtmlMatchExec && twitterHtmlMatchExec[1]) {
                              return <XEmbed key={index} url={twitterHtmlMatchExec[1]} />;
                            }
                            // 3. Otherwise, render as code
                            return <pre key={index} className="news-code"><code>{code}</code></pre>;
                          }
                          switch (block.type) {
                            case 'paragraph':
                              return <div key={index} className="news-paragraph" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.data.text || '') }} />;
                            case 'header': {
                              const level = block.data.level || 1;
                              const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;
                              return <HeaderTag key={index} className={`news-header news-header-${level}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.data.text || '') }} />;
                            }
                            case 'list': {
                              const isOrdered = block.data.style === 'ordered';
                              const ListTag = isOrdered ? 'ol' : 'ul';
                              const items = Array.isArray(block.data.items) ? block.data.items : [];
                              const listStyle = isOrdered ? { listStyleType: 'decimal', paddingRight: 0 } : { listStyleType: 'disc', paddingRight: 0 };
                              return (
                                <ListTag key={index} className="news-list" style={listStyle}>
                                  {items.map((item, i) => {
                                    if (typeof item === 'string') {
                                      return <li key={i} className="news-list-item">{item}</li>;
                                    }
                                    if (item && typeof item === 'object' && 'content' in item && typeof item.content === 'string') {
                                      return <li key={i} className="news-list-item">{item.content}</li>;
                                    }
                                    return null;
                                  })}
                                </ListTag>
                              );
                            }
                            case 'image': {
                              const imageUrl = block.data.file?.url || block.data.url || '';
                              return (
                                <div key={index} className="news-image">
                                  <img src={imageUrl} alt={block.data.caption || ''} className="news-image-img" loading="lazy" />
                                  {block.data.caption && <div className="news-image-caption">{block.data.caption}</div>}
                                </div>
                              );
                            }
                            case 'embed': {
                              const linkUrl = block.data.source || block.data.embed || '';
                              if (/(?:twitter\.com|x\.com)/.test(linkUrl)) {
                                const tweetId = extractTweetId(linkUrl);
                                const caption = block.data.caption;
                                if (tweetId) {
                                  return <XEmbed key={index} url={linkUrl} caption={caption} />;
                                }
                              }
                              if (/instagram\.com/.test(linkUrl)) {
                                return <InstagramEmbed key={index} url={linkUrl} />;
                              }
                              return <div key={index} dangerouslySetInnerHTML={{ __html: parseOtherBlocksToHtml(block) }} />;
                            }
                            case 'linkTool': {
                              const linkUrl = block.data.link || block.data.url || block.data.source || '';
                              if (/(?:twitter\.com|x\.com)/.test(linkUrl)) {
                                const tweetId = extractTweetId(linkUrl);
                                const caption = block.data.caption;
                                if (tweetId) {
                                  return <XEmbed key={index} url={linkUrl} caption={caption} />;
                                }
                              }
                              if (/instagram\.com/.test(linkUrl)) {
                                return <InstagramEmbed key={index} url={linkUrl} />;
                              }
                              return <div key={index} dangerouslySetInnerHTML={{ __html: parseOtherBlocksToHtml(block) }} />;
                            }
                            default:
                              return <div key={index} dangerouslySetInnerHTML={{ __html: parseOtherBlocksToHtml(block) }} />;
                          }
                        } catch (renderError) {
                          console.error('Error rendering block:', renderError, block);
                          return (
                            <div key={index} className="error">
                              <p>خطأ في عرض المحتوى</p>
                            </div>
                          );
                        }
                      })
                    )}
                  </div>
                  )}
                </div>
              </article>

              {/* preview mode handled earlier */}

              {/* Comments Section - Only for Supabase news */}
              {!isWordPressNews && slug && extractIdFromSlug(slug) && (
                <CommentsSection newsId={Number(extractIdFromSlug(slug))} />
              )}
              
              
            </div>

            {/* Right side - Related News */}
            <div className="lg:col-span-1">
              {relatedNews.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-6 text-right text-gray-900 dark:text-gray-100" dir="rtl">
                    أخبار ذات صلة
                  </h2>
                  
                  <div className="space-y-3">
                    {relatedNews.map((item, idx) => (
                                  <Link
                                    key={item.id}
                                    to={`/news/${item.source === 'wordpress' ? `${generateSlug(item.title)}-wp_${item.id}` : `${generateSlug(item.title)}`}`}
                        className="block"
                        aria-label={item.title}
                      >
                        <div className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-gray-800 rounded-md hover:shadow-md transition-shadow">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-right text-gray-900 dark:text-gray-100" dir="rtl">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 justify-start">
                              <Clock className="h-3 w-3" dir="rtl" />
                              <time dateTime={item.created_at} className="text-right" dir="rtl">
                                {(() => {
                                  const date = new Date(item.created_at);
                                  const months = [
                                    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                                    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
                                  ];
                                  const day = date.getDate();
                                  const month = months[date.getMonth()];
                                  const year = date.getFullYear();
                                  return `${day} ${month}, ${year}`;
                                })()}
                              </time>
                            </div>
                          </div>

                          {/* Thumbnail on the right */}
                          <div className="flex-shrink-0 w-20 h-14 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">صورة</div>
                            )}
                          </div>

                          {/* Blue numbered badge on the far right */}
                          <div className="flex-shrink-0 ml-2">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                              {idx + 1}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Report Dialog - Only show for Supabase news */}
      {!isWordPressNews && (
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right" dir="rtl">
                إبلاغ عن المحتوى
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-right" dir="rtl">
                يرجى وصف سبب الإبلاغ عن هذا المحتوى:
              </p>
              
              <Textarea
                placeholder="اكتب سبب الإبلاغ هنا..."
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                className="min-h-20 text-right"
                dir="rtl"
              />
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setReportOpen(false)}
                disabled={reporting}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleReport}
                disabled={reporting || !reportDesc.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {reporting ? "جاري الإرسال..." : "إرسال البلاغ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <Footer />
    </>
  );
};

export default NewsDetails;