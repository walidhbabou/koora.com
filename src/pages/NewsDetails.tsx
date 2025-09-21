import React, { useEffect, useState, useCallback } from "react";
import SEO from "@/components/SEO";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, ArrowRight, Flag, ExternalLink, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CommentsSection from "@/components/CommentsSection";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';
import { useAuth } from "@/contexts/AuthContext";

// Interface pour les blocs Editor.js
interface EditorJsBlock {
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
}

interface RelatedNewsItem {
  id: number;
  title: string;
  image_url?: string | null;
  created_at: string;
}

// Fonction pour extraire l'ID du tweet depuis l'URL
const extractTweetId = (url: string): string | null => {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
};

// Fonction pour extraire le nom d'utilisateur depuis l'URL
const extractTwitterUsername = (url: string): string | null => {
  const match = url.match(/(?:twitter\.com|x\.com)\/(\w+)\/status\/\d+/);
  return match ? match[1] : null;
};

// Fonction pour extraire l'ID YouTube
const extractYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

// Fonction pour nettoyer et valider le JSON avant parsing
const cleanJsonString = (jsonString: string): string => {
  try {
    // Remplacer les échappements malformés
    let cleaned = jsonString
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
      let alternativeCleaned = jsonString.replace(
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

// Parser Editor.js amélioré avec nettoyage JSON
const parseEditorJsToHtml = (content: string): string => {
  try {
    // Nettoyer le JSON avant parsing
    const cleanedContent = cleanJsonString(content);
    const data: EditorJsData = JSON.parse(cleanedContent);
    
    return data.blocks.map((block) => {
      switch (block.type) {
        case 'paragraph':
          return `<div class="news-paragraph">${DOMPurify.sanitize(block.data.text || '')}</div>`;
          
        case 'header':
          const level = block.data.level || 1;
          return `<h${level} class="news-header news-header-${level}">${DOMPurify.sanitize(block.data.text || '')}</h${level}>`;
          
        case 'list':
          const listItems = block.data.items?.map(item => 
            `<li class="news-list-item">${DOMPurify.sanitize(item)}</li>`
          ).join('') || '';
          return `<ul class="news-list">${listItems}</ul>`;
          
        case 'quote':
          return `<blockquote class="news-quote">${DOMPurify.sanitize(block.data.text || '')}</blockquote>`;
          
        case 'table':
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
          
        case 'image':
          const imageUrl = block.data.file?.url || block.data.url || '';
          const caption = block.data.caption ? 
            `<div class="news-image-caption">${DOMPurify.sanitize(block.data.caption)}</div>` : '';
          return `<div class="news-image">
            <img src="${imageUrl}" alt="${block.data.caption || ''}" class="news-image-img" loading="lazy" />
            ${caption}
          </div>`;
          
        case 'delimiter':
          return `<hr class="news-delimiter" />`;
          
        case 'code':
          return `<pre class="news-code"><code>${DOMPurify.sanitize(block.data.code || '')}</code></pre>`;
          
        case 'embed':
          const service = block.data.service?.toLowerCase();
          const source = block.data.source || '';
          const embed = block.data.embed || '';
          const embedCaption = block.data.caption ? 
            `<div class="embed-caption">${DOMPurify.sanitize(block.data.caption)}</div>` : '';
            
          if (service === 'youtube' && source) {
            const videoId = extractYouTubeId(source);
            if (videoId) {
              return `<div class="embed-container">
                <div class="youtube-embed">
                  <iframe src="https://www.youtube.com/embed/${videoId}" 
                    class="youtube-iframe" 
                    frameborder="0" 
                    allowfullscreen
                    title="YouTube video">
                  </iframe>
                </div>
                ${embedCaption}
              </div>`;
            }
          } else if ((service === 'twitter' || service === 'x') && source) {
            const tweetId = extractTweetId(source);
            if (tweetId) {
              return `<div class="twitter-embed-placeholder" 
                data-tweet-id="${tweetId}" 
                data-source="${source}"
                data-embed="${embed}"
                data-caption="${block.data.caption || ''}">
                <div class="loading-placeholder">جاري تحميل التغريدة...</div>
              </div>`;
            }
          }
          
          // Generic embed fallback
          return `<div class="generic-embed">
            <a href="${source}" target="_blank" rel="noopener noreferrer" class="embed-link">
              <ExternalLink size={16} />
              عرض المحتوى المضمن
            </a>
            ${caption}
          </div>`;
          
        case 'linkTool':
          const meta = block.data.meta;
          const linkUrl = block.data.link || '';
          const linkImage = meta?.image?.url ? 
            `<img src="${meta.image.url}" alt="" class="link-image" />` : '';
          return `<div class="link-preview">
            ${linkImage}
            <div class="link-content">
              <div class="link-title">
                <a href="${linkUrl}" target="_blank" rel="noopener noreferrer">
                  ${DOMPurify.sanitize(meta?.title || linkUrl)}
                </a>
              </div>
              ${meta?.description ? `<div class="link-description">${DOMPurify.sanitize(meta.description)}</div>` : ''}
              <div class="link-url">${linkUrl}</div>
            </div>
          </div>`;
          
        default:
          console.warn(`Type de bloc non supporté: ${block.type}`);
          return `<div class="error">نوع المحتوى غير مدعوم: ${block.type}</div>`;
      }
    }).join('');
    
  } catch (error) {
    console.error('Erreur lors du parsing du contenu Editor.js:', error);
    return `<div class="error">خطأ في تحليل المحتوى</div>`;
  }
};

// Styles CSS complets pour le contenu
const newsContentStyles = `
  /* Styles généraux */
  .news-content {
    line-height: 1.8;
    font-size: 16px;
    color: #333;
    font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    direction: rtl;
    text-align: right;
  }
  
  /* Paragraphes */
  .news-paragraph {
    margin: 16px 0;
    text-align: justify;
    direction: rtl;
  }
  
  /* Titres */
  .news-header {
    font-weight: bold;
    margin: 24px 0 16px 0;
    color: #222;
    direction: rtl;
  }
  
  .news-header-1 { font-size: 2em; }
  .news-header-2 { font-size: 1.5em; }
  .news-header-3 { font-size: 1.3em; }
  .news-header-4 { font-size: 1.1em; }
  .news-header-5 { font-size: 1em; }
  .news-header-6 { font-size: 0.9em; }
  
  /* Listes */
  .news-list {
    margin: 16px 0;
    padding-right: 24px;
    direction: rtl;
  }
  
  .news-list-item {
    margin: 8px 0;
    line-height: 1.6;
  }
  
  /* Citations */
  .news-quote {
    border-right: 4px solid #0066cc;
    padding: 16px 20px;
    margin: 20px 0;
    background: #f8f9fa;
    font-style: italic;
    border-radius: 4px;
    direction: rtl;
  }
  
  /* Tables */
  .news-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    direction: rtl;
  }
  
  .news-table-header {
    background: #f5f5f5;
    font-weight: bold;
    padding: 12px 8px;
    text-align: center;
    border-bottom: 2px solid #ddd;
  }
  
  .news-table-cell {
    padding: 10px 8px;
    text-align: center;
    border-bottom: 1px solid #eee;
  }
  
  .news-table-row:nth-child(even) {
    background: #fafafa;
  }
  
  .news-table-row:hover {
    background: #f0f0f0;
    transition: background 0.2s ease;
  }
  
  /* Images */
  .news-image {
    margin: 20px 0;
    text-align: center;
  }
  
  .news-image-img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .news-image-caption {
    margin-top: 8px;
    font-size: 14px;
    color: #666;
    font-style: italic;
  }
  
  /* Séparateurs */
  .news-delimiter {
    margin: 30px 0;
    border: none;
    height: 2px;
    background: linear-gradient(to right, transparent, #ddd, transparent);
  }
  
  /* Code */
  .news-code {
    background: #f4f4f4;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 16px;
    margin: 16px 0;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    direction: ltr;
    text-align: left;
  }
  
  /* Embeds */
  .embed-container {
    margin: 20px 0;
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
    height: 315px;
    border-radius: 8px;
  }
  
  .embed-caption {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
    font-style: italic;
  }
  
  .generic-embed {
    margin: 20px 0;
    padding: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
    text-align: center;
  }
  
  .embed-link {
    color: #0066cc;
    text-decoration: none;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  .embed-link:hover {
    text-decoration: underline;
  }
  
  /* Twitter embeds */
  .twitter-embed-placeholder {
    margin: 20px 0;
    text-align: center;
    max-width: 100%;
  }
  
  .loading-placeholder {
    padding: 20px;
    text-align: center;
    color: #666;
    font-style: italic;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
  }
  
  /* Link previews */
  .link-preview {
    border: 1px solid #e1e8ed;
    border-radius: 12px;
    overflow: hidden;
    margin: 20px 0;
    max-width: 500px;
  }
  
  .link-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .link-content {
    padding: 16px;
  }
  
  .link-title a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
  }
  
  .link-title a:hover {
    color: #0066cc;
  }
  
  .link-description {
    margin: 8px 0;
    color: #666;
    font-size: 14px;
  }
  
  .link-url {
    color: #999;
    font-size: 12px;
    direction: ltr;
    text-align: left;
  }
  
  /* Liens */
  .news-content a {
    color: #0066cc;
    text-decoration: underline;
    font-weight: 500;
    transition: color 0.2s ease;
  }
  
  .news-content a:hover {
    color: #004499;
  }
  
  /* Styles d'erreur */
  .error {
    padding: 20px;
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 8px;
    color: #c33;
    margin: 20px 0;
    text-align: center;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .news-content {
      font-size: 15px;
    }
    
    .news-paragraph {
      margin: 12px 0;
    }
    
    .news-header {
      margin: 20px 0 12px 0;
    }
    
    .news-list {
      padding-right: 16px;
    }
    
    .news-table {
      font-size: 12px;
    }
    
    .news-table-header,
    .news-table-cell {
      padding: 8px 4px;
    }
    
    .youtube-iframe {
      height: 200px;
    }
  }
  
  @media (max-width: 480px) {
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
  }
`;

const NewsDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsRow | null>(null);
  const [relatedNews, setRelatedNews] = useState<RelatedNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [reporting, setReporting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportDesc, setReportDesc] = useState('');
  const [parsedContent, setParsedContent] = useState<string>('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, content, created_at, image_url, status, competition_internationale_id, competition_mondiale_id, competition_continentale_id, competition_locale_id')
        .eq('id', Number(id))
        .single();
        
      if (error) throw error;
      setNews(data as NewsRow);

      // Parse content
      if (data?.content) {
        const parsed = parseEditorJsToHtml(data.content);
        setParsedContent(parsed);
      }

      // Fetch related news
      if (data) {
        let relatedQuery = supabase
          .from('news')
          .select('id, title, image_url, created_at')
          .neq('id', Number(id))
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
            .neq('id', Number(id))
            .eq('status', 'published')
            .limit(5)
            .order('created_at', { ascending: false });
          setRelatedNews(generalRelated || []);
        } else {
          setRelatedNews(related || []);
        }
      }
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error?.message || 'فشل في تحميل الخبر');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Effect to handle Twitter embeds after content is rendered
  useEffect(() => {
    if (parsedContent) {
      setTimeout(() => {
        const twitterPlaceholders = document.querySelectorAll('.twitter-embed-placeholder');
        
        twitterPlaceholders.forEach((placeholder) => {
          const tweetId = placeholder.getAttribute('data-tweet-id');
          const source = placeholder.getAttribute('data-source');
          const embed = placeholder.getAttribute('data-embed');
          const twitterCaption = placeholder.getAttribute('data-caption');
          
          if (tweetId && source) {
            const container = document.createElement('div');
            container.style.margin = '20px 0';
            container.style.textAlign = 'center';
            container.style.maxWidth = '100%';
            
            const embedUrl = embed || `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=light&width=550&dnt=true&chrome=nofooter`;
            
            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.width = '100%';
            iframe.height = '400';
            iframe.frameBorder = '0';
            iframe.scrolling = 'no';
            iframe.allowFullscreen = true;
            iframe.title = `Tweet ${tweetId}`;
            iframe.style.maxWidth = '550px';
            iframe.style.border = '1px solid #e1e8ed';
            iframe.style.borderRadius = '12px';
            iframe.style.margin = '0 auto';
            iframe.style.display = 'block';
            
            // Error handling for iframe
            iframe.onerror = () => {
              const username = extractTwitterUsername(source);
              container.innerHTML = `
                <div style="padding: 20px; border: 1px solid #e1e8ed; border-radius: 12px; background: #f7f9fa; text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 15px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1da1f2">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span style="font-weight: bold; color: #333;">فشل تحميل التغريدة</span>
                  </div>
                  <p style="margin: 10px 0; color: #666;">عذراً، لا يمكن عرض التغريدة في الوقت الحالي</p>
                  <a href="${source}" target="_blank" rel="noopener noreferrer" 
                     style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #1da1f2; color: white; text-decoration: none; border-radius: 20px; font-size: 14px;">
                    عرض على ${username ? 'X/@' + username : 'X'}
                  </a>
                  ${twitterCaption ? `<div style="margin-top: 10px; font-size: 14px; color: #666; font-style: italic;">${twitterCaption}</div>` : ''}
                </div>`;
            };
            
            // Timeout for loading
            setTimeout(() => {
              if (iframe.contentDocument === null) {
                iframe.onerror?.(new Event('error'));
              }
            }, 10000);
            
            container.appendChild(iframe);
            
            if (twitterCaption) {
              const captionDiv = document.createElement('div');
              captionDiv.className = 'embed-caption';
              captionDiv.textContent = twitterCaption;
              container.appendChild(captionDiv);
            }
            
            placeholder.parentNode?.replaceChild(container, placeholder);
          }
        });
      }, 500);
    }
  }, [parsedContent]);

  const handleReport = async () => {
    if (!user || !reportDesc.trim()) return;
    
    setReporting(true);
    try {
      const { error } = await supabase
        .from('reports')
        .insert([
          {
            user_id: user.id,
            news_id: Number(id),
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

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
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
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">خطأ في تحميل الخبر</h1>
            <p className="text-gray-600 mb-4">{error || 'الخبر غير موجود'}</p>
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              العودة إلى الصفحة الرئيسية
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
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <article className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            {news.image_url && (
              <img 
                src={news.image_url} 
                alt={news.title}
                className="w-full h-64 object-cover"
              />
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <time dateTime={news.created_at}>
                    {new Date(news.created_at).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                </div>
                
                {isAuthenticated && (
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
              
              <h1 className="text-3xl font-bold mb-6 text-right" dir="rtl">
                {news.title}
              </h1>
              
              <div 
                className="news-content"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(parsedContent) 
                }}
              />
            </div>
          </article>

          {/* Related News */}
          {relatedNews.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-right" dir="rtl">
                أخبار ذات صلة
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {relatedNews.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <Link to={`/news/${item.id}`} className="block">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-right" dir="rtl">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <time dateTime={item.created_at}>
                            {new Date(item.created_at).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </time>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Comments Section */}
          <CommentsSection newsId={Number(id)} />
        </div>
      </main>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right" dir="rtl">
              إبلاغ عن المحتوى
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-right" dir="rtl">
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
      
      <Footer />
    </>
  );
};

export default NewsDetails;