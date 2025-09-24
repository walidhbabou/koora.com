// Instagram Embed using react-instagram-embed
// Custom Instagram Embed for React 18
const InstagramEmbed: React.FC<{ url: string }> = ({ url }) => {
  // Extract post shortcode from URL
  const match = url.match(/instagram\.com\/(?:p|tv|reel)\/([\w-]+)/);
  const shortcode = match ? match[1] : null;
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
        frameBorder="0"
        scrolling="no"
        allowTransparency={true}
        allow="encrypted-media"
        style={{ borderRadius: 8, maxWidth: '100%' }}
        title="Instagram Post"
      ></iframe>
      <div className="embed-caption">
        <a href={url} target="_blank" rel="noopener noreferrer" className="embed-link">مشاهدة على إنستغرام</a>
      </div>
    </div>
  );
};
import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { createRoot, Root } from "react-dom/client";
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
import { TwitterTweetEmbed } from "react-twitter-embed";

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
}

interface RelatedNewsItem {
  id: number;
  title: string;
  image_url?: string | null;
  created_at: string;
}

function extractTweetId(url: string): string | null {
  // Gère les URLs de type x.com ou twitter.com
  const match = url.match(/(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/);
  return match ? match[1] : null;
}

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

// Composant Twitter amélioré
export const XEmbed: React.FC<{ url: string; caption?: string }> = ({ url, caption }) => {
  const tweetId = extractTweetId(url);
  const username = extractTwitterUsername(url);
  const [isDark, setIsDark] = React.useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return hasDarkClass || prefersDark;
    }
    return false;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(hasDarkClass || mql.matches);
    };
    mql.addEventListener?.('change', handleChange);
    const observer = new MutationObserver(handleChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      mql.removeEventListener?.('change', handleChange);
      observer.disconnect();
    };
  }, []);
  
  if (!tweetId) {
    return (
      <div className="twitter-error-card" style={{
        padding: '20px',
        textAlign: 'center',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        background: '#fef2f2',
        color: '#dc2626',
        margin: '20px 0',
        direction: 'rtl'
      }}>
        <p>لا يمكن تحميل التغريدة</p>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{
          textDecoration: 'none',
          display: 'inline-block',
          padding: '8px 16px',
          background: '#1d9bf0',
          color: 'white',
          borderRadius: '20px',
          fontSize: '14px',
          marginTop: '10px'
        }}>
          عرض على X
        </a>
      </div>
    );
  }

  return (
    <div className="twitter-embed-content" style={{
      margin: '20px 0',
      maxWidth: '550px',
      marginLeft: 'auto',
      marginRight: 'auto',
      overflow: 'hidden',
      backgroundColor: 'transparent'
    }}>
      <TwitterTweetEmbed 
        tweetId={tweetId} 
        options={{
          theme: isDark ? 'dark' : 'light',
          conversation: 'none',
          cards: 'visible',
          align: 'center',
          dnt: true,
          width: 500
        }}
      />
    </div>
  );
};


// Nouveau parser React-friendly
const parseEditorJsBlocks = (content: string): EditorJsBlock[] => {
  try {
    const cleanedContent = cleanJsonString(content);
    const data: EditorJsData = JSON.parse(cleanedContent);
    return data.blocks;
  } catch (error) {
    console.error('Erreur lors du parsing du contenu Editor.js:', error);
    return [];
  }
};

// Utilitaire pour fallback HTML pour les blocs non gérés
const parseOtherBlocksToHtml = (block: EditorJsBlock): string => {
  switch (block.type) {
    case 'quote':
      return `<blockquote class="news-quote">${DOMPurify.sanitize(block.data.text || '')}</blockquote>`;
    case 'code':
      return `<pre class="news-code"><code>${DOMPurify.sanitize(block.data.code || '')}</code></pre>`;
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
      const listItems = block.data.items?.map(item => 
        `<li class="news-list-item">${DOMPurify.sanitize(item)}</li>`
      ).join('') || '';
      return `<ul class="news-list">${listItems}</ul>`;
    }
    default:
      return '';
  }
};



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
  const [parsedBlocks, setParsedBlocks] = useState<EditorJsBlock[]>([]);

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
        const blocks = parseEditorJsBlocks(data.content);
        setParsedBlocks(blocks);
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

  // Plus besoin de l'effet pour monter les XEmbed, tout est rendu en React

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
      
        <style dangerouslySetInnerHTML={{ __html: newsContentStyles + `
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
            font-size: 2.8em !important;
            font-weight: 900 !important;
            text-align: center !important;
            margin-bottom: 18px !important;
            margin-top: 0 !important;
            color: #222 !important;
            letter-spacing: -1px;
          }
          .dark .news-big-title { color: #f3f4f6 !important; }
        ` }} />
      
      <Header />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side - Article content */}
            <div className="lg:col-span-2">
              <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
                <h1 className="news-big-title" dir="rtl">{news.title}</h1>
                {news.image_url && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <img 
                      src={news.image_url} 
                      alt={news.title}
                      className="news-full-image"
                      style={{ maxWidth: '100%', width: '100%', height: '420px', objectFit: 'cover', objectPosition: 'center top', borderRadius: 0, boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}
                    />
                  </div>
                )}
              
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <time dateTime={news.created_at}>
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
                  
                  <div className="news-content">
                {parsedBlocks.map((block, index) => {
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
                      // For Editor.js v2+ with items as objects with 'content' property
                      const items = Array.isArray(block.data.items) ? block.data.items : [];
                      // Add default browser list style for bullets/numbers
                      const listStyle = isOrdered ? { listStyleType: 'decimal', paddingRight: 0 } : { listStyleType: 'disc', paddingRight: 0 };
                      return (
                        <ListTag key={index} className="news-list" style={listStyle}>
                          {items.map((item, i) => {
                            // If item is a string, display it
                            if (typeof item === 'string') {
                               
                              return <li key={i} className="news-list-item">   <br />{item}</li>;
                            }
                            // If item is object with 'content', display content
                            if (item && typeof item === 'object' && 'content' in item && typeof item.content === 'string') {
                              return <li key={i} className="news-list-item"> {item.content}</li>;
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
                      // Fallback pour les autres embeds
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
                      // Fallback pour les autres links
                      return <div key={index} dangerouslySetInnerHTML={{ __html: parseOtherBlocksToHtml(block) }} />;
                    }
                    default:
                      return <div key={index} dangerouslySetInnerHTML={{ __html: parseOtherBlocksToHtml(block) }} />;
                  }
                })}
                  </div>
                </div>
              </article>

              {/* Comments Section */}
              <CommentsSection newsId={Number(id)} />
            </div>

            {/* Right side - Related News */}
            <div className="lg:col-span-1">
              {relatedNews.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-6 text-right text-gray-900 dark:text-gray-100" dir="rtl">
                    أخبار ذات صلة
                  </h2>
                  
                  <div className="space-y-4">
                    {relatedNews.map((item) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow dark:bg-gray-800">
                        <Link to={`/news/${item.id}`} className="block">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-32 object-cover rounded-t-lg"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-right text-gray-900 dark:text-gray-100" dir="rtl">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              <time dateTime={item.created_at}>
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
                        </Link>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
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