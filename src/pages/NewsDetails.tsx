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
import { Clock, ArrowRight, Flag, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CommentsSection from "@/components/CommentsSection";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';
import { useAuth } from "@/contexts/AuthContext";

// Types for Editor.js content
interface EditorJsBlock {
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
    [key: string]: unknown;
  };
}

interface EditorJsContent {
  blocks: EditorJsBlock[];
  version?: string;
  time?: number;
}

// Fonction pour extraire l'ID du tweet depuis l'URL
const extractTweetId = (url: string): string | null => {
  // Formats possibles:
  // https://twitter.com/user/status/1234567890
  // https://x.com/user/status/1234567890
  // https://mobile.twitter.com/user/status/1234567890
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
};

// Fonction pour extraire le nom d'utilisateur depuis l'URL
const extractTwitterUsername = (url: string): string | null => {
  const match = url.match(/(?:twitter\.com|x\.com)\/(\w+)\/status\/\d+/);
  return match ? match[1] : null;
};

// Composant pour afficher un tweet avec iframe direct
const TwitterEmbedIframe: React.FC<{ 
  tweetId: string; 
  source: string; 
  embed?: string;
  caption?: string;
}> = ({ tweetId, source, embed, caption }) => {
  const [iframeError, setIframeError] = useState(false);
  
  // URL de l'iframe Twitter avec paramètres optimisés
  const embedUrl = embed || `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=light&width=550&dnt=true&chrome=nofooter`;
  
  return (
    <div className="twitter-embed-container" style={{ 
      margin: '20px 0', 
      textAlign: 'center' as const,
      maxWidth: '100%'
    }}>
      {!iframeError ? (
        <>
          <iframe
            src={embedUrl}
            width="100%"
            height="400"
            frameBorder="0"
            scrolling="no"
            allowFullScreen
            onError={() => setIframeError(true)}
            style={{
              maxWidth: '550px',
              border: '1px solid #e1e8ed',
              borderRadius: '12px',
              margin: '0 auto',
              display: 'block'
            }}
            title={`Tweet ${tweetId}`}
          />
          {caption && (
            <p style={{ 
              marginTop: '10px', 
              fontStyle: 'italic', 
              color: '#666',
              fontSize: '14px'
            }}>
              {caption}
            </p>
          )}
        </>
      ) : (
        <TwitterFallback source={source} caption={caption} />
      )}
    </div>
  );
};

// Composant de fallback pour Twitter
const TwitterFallback: React.FC<{ source: string; caption?: string }> = ({ source, caption }) => {
  const username = extractTwitterUsername(source);
  
  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #e1e8ed', 
      borderRadius: '12px', 
      background: '#f7f9fa',
      textAlign: 'center' as const,
      margin: '20px 0'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '8px', 
        marginBottom: '15px' 
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#1da1f2">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <span style={{ fontWeight: 'bold', color: '#1da1f2', fontSize: '16px' }}>
          منشور من X (تويتر)
        </span>
      </div>
      
      {username && (
        <p style={{ 
          margin: '10px 0', 
          color: '#666',
          fontSize: '14px'
        }}>
          @{username}
        </p>
      )}
      
      <p style={{ marginBottom: '15px', color: '#666' }}>
        اضغط للعرض على الموقع الأصلي:
      </p>
      
      <a 
        href={source} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '12px 24px', 
          background: '#1da1f2', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '25px',
          fontWeight: 'bold',
          fontSize: '14px',
          transition: 'background 0.2s ease'
        }}
        onMouseOver={(e) => {
          (e.target as HTMLElement).style.background = '#0d8bd9';
        }}
        onMouseOut={(e) => {
          (e.target as HTMLElement).style.background = '#1da1f2';
        }}
      >
        عرض المنشور
        <ExternalLink size={16} />
      </a>
      
      {caption && (
        <p style={{ 
          marginTop: '15px', 
          fontStyle: 'italic', 
          color: '#666',
          fontSize: '14px'
        }}>
          {caption}
        </p>
      )}
    </div>
  );
};

// Function to parse Editor.js content and convert to HTML/React
const parseEditorJsToHtml = (content: string): string => {
  try {
    const parsed: EditorJsContent = JSON.parse(content);
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .map((block: EditorJsBlock, index: number) => {
          switch (block.type) {
            case 'paragraph':
              return block.data.text ? `<p>${block.data.text}</p>` : '';
            
            case 'header': {
              const level = block.data.level || 2;
              return block.data.text ? `<h${level}>${block.data.text}</h${level}>` : '';
            }
            
            case 'list': {
              if (block.data.items && Array.isArray(block.data.items)) {
                const listItems = block.data.items.map(item => `<li>${item}</li>`).join('');
                return `<ul>${listItems}</ul>`;
              }
              return '';
            }
            
            case 'quote':
              return block.data.text ? `<blockquote>${block.data.text}</blockquote>` : '';
            
            case 'embed': {
              const service = block.data.service;
              const source = block.data.source;
              const embed = block.data.embed;
              const caption = block.data.caption;
              
              if (service === 'twitter' && source) {
                const tweetId = extractTweetId(source);
                
                if (tweetId) {
                  // Retourner un placeholder spécial pour Twitter qui sera traité côté React
                  return `<div class="twitter-embed-placeholder" data-tweet-id="${tweetId}" data-source="${source}" data-embed="${embed || ''}" data-caption="${caption || ''}" data-index="${index}"></div>`;
                } else {
                  // Fallback si on ne peut pas extraire l'ID
                  return `<div class="twitter-fallback-placeholder" data-source="${source}" data-caption="${caption || ''}"></div>`;
                }
              }
              
              if (service === 'youtube' && source) {
                const videoId = extractYouTubeId(source);
                return `
                  <div class="embed-container youtube-embed" style="margin: 20px 0; text-align: center;">
                    ${videoId ? 
                      `<iframe src="https://www.youtube.com/embed/${videoId}" 
                               width="100%" 
                               height="315" 
                               frameborder="0" 
                               allowfullscreen
                               style="max-width: 560px; border-radius: 8px;">
                       </iframe>` 
                      : 
                      `<a href="${source}" target="_blank" rel="noopener noreferrer" 
                          style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; background: #ff0000; color: white; text-decoration: none; border-radius: 8px;">
                         مشاهدة على YouTube
                       </a>`
                    }
                    ${caption ? `<p style="margin-top: 10px; font-style: italic; color: #666;">${caption}</p>` : ''}
                  </div>
                `;
              }
              
              // Pour les autres services
              if (source) {
                return `
                  <div class="embed-container generic-embed" style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <a href="${source}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: none; font-weight: bold;">
                        رابط خارجي - ${service || 'مصدر خارجي'}
                      </a>
                    </div>
                    ${caption ? `<p style="margin-top: 8px; color: #666;">${caption}</p>` : ''}
                  </div>
                `;
              }
              
              return '';
            }
            
            default:
              return block.data.text ? `<p>${block.data.text}</p>` : '';
          }
        })
        .filter(Boolean)
        .join('');
    }
  } catch (e) {
    return `<p>${content}</p>`;
  }
  return `<p>${content}</p>`;
};

// Helper function to extract YouTube video ID
const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface NewsRow {
  id: number;
  title: string;
  content: string;
  created_at: string;
  image_url?: string | null;
  status?: string | null;
}

interface RelatedNewsItem {
  id: number;
  title: string;
  image_url?: string | null;
  created_at: string;
}

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

      // Parse content immediately
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
      setError(error?.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Effect pour remplacer les placeholders Twitter après le rendu
  useEffect(() => {
    if (parsedContent) {
      setTimeout(() => {
        // Remplacer les placeholders Twitter par les composants React
        const twitterPlaceholders = document.querySelectorAll('.twitter-embed-placeholder');
        
        twitterPlaceholders.forEach((placeholder) => {
          const tweetId = placeholder.getAttribute('data-tweet-id');
          const source = placeholder.getAttribute('data-source');
          const embed = placeholder.getAttribute('data-embed');
          const caption = placeholder.getAttribute('data-caption');
          
          if (tweetId && source) {
            // Créer le conteneur pour l'iframe
            const container = document.createElement('div');
            container.style.margin = '20px 0';
            container.style.textAlign = 'center';
            container.style.maxWidth = '100%';
            
            // URL de l'iframe avec paramètres optimisés
            const embedUrl = embed || `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=light&width=550&dnt=true&chrome=nofooter`;
            
            // Créer l'iframe
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
            
            // Gestion d'erreur pour l'iframe
            iframe.onerror = () => {
              container.innerHTML = `
                <div style="padding: 20px; border: 1px solid #e1e8ed; border-radius: 12px; background: #f7f9fa; text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 15px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1da1f2">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span style="font-weight: bold; color: #1da1f2;">منشور من X (تويتر)</span>
                  </div>
                  <p style="margin-bottom: 15px; color: #666;">اضغط للعرض على الموقع الأصلي:</p>
                  <a href="${source}" target="_blank" rel="noopener noreferrer" 
                     style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #1da1f2; color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    عرض المنشور
                  </a>
                  ${caption ? `<p style="margin-top: 15px; font-style: italic; color: #666;">${caption}</p>` : ''}
                </div>
              `;
            };
            
            container.appendChild(iframe);
            
            // Ajouter la caption si elle existe
            if (caption) {
              const captionEl = document.createElement('p');
              captionEl.style.marginTop = '10px';
              captionEl.style.fontStyle = 'italic';
              captionEl.style.color = '#666';
              captionEl.style.fontSize = '14px';
              captionEl.textContent = caption;
              container.appendChild(captionEl);
            }
            
            // Remplacer le placeholder
            placeholder.parentNode?.replaceChild(container, placeholder);
          }
        });

        // Traiter les fallbacks Twitter
        const fallbackPlaceholders = document.querySelectorAll('.twitter-fallback-placeholder');
        fallbackPlaceholders.forEach((placeholder) => {
          const source = placeholder.getAttribute('data-source');
          const caption = placeholder.getAttribute('data-caption');
          
          if (source) {
            const username = extractTwitterUsername(source);
            placeholder.innerHTML = `
              <div style="padding: 20px; border: 1px solid #e1e8ed; border-radius: 12px; background: #f7f9fa; text-align: center; margin: 20px 0;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 15px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#1da1f2">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span style="font-weight: bold; color: #1da1f2;">منشور من X (تويتر)</span>
                </div>
                ${username ? `<p style="margin: 10px 0; color: #666;">@${username}</p>` : ''}
                <p style="margin-bottom: 15px; color: #666;">اضغط للعرض على الموقع الأصلي:</p>
                <a href="${source}" target="_blank" rel="noopener noreferrer" 
                   style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #1da1f2; color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                  عرض المنشور
                </a>
                ${caption ? `<p style="margin-top: 15px; font-style: italic; color: #666;">${caption}</p>` : ''}
              </div>
            `;
          }
        });
      }, 100);
    }
  }, [parsedContent]);

  useEffect(() => { 
    load(); 
  }, [id, load]);

  const reportThisNews = async (description: string) => {
    if (!id) return;
    if (reporting) return;
    if (!isAuthenticated || !user?.id) {
      toast({ title: 'يرجى تسجيل الدخول', description: 'يجب تسجيل الدخول لإرسال البلاغ', variant: 'destructive' });
      return;
    }
    setReporting(true);
    try {
      try {
        const { error } = await supabase.rpc('create_report', {
          p_type: 'content',
          p_target: `news:${id}`,
          p_reason: 'inappropriate',
          p_description: description,
          p_reported_by: user.id
        });
        if (error) throw error;
      } catch (rpcErr: unknown) {
        const err = rpcErr as { message?: string; code?: string };
        const msg: string = err?.message || '';
        const code: string | undefined = err?.code;
        const fnMissing = (code === '42883') || /function\s+create_report\s*\(.*\)\s+does not exist/i.test(msg) || /does not exist/i.test(msg);
        if (!fnMissing) throw rpcErr;
        const { error: insErr } = await supabase.from('reports').insert({
          type: 'content',
          target: `news:${id}`,
          reason: 'inappropriate',
          description,
          reported_by: user.id
        });
        if (insErr) throw insErr;
      }
      toast({ description: 'تم إرسال البلاغ بنجاح' });
      setReportOpen(false);
      setReportDesc('');
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast({ title: 'Erreur', description: err?.message || 'تعذر إرسال البلاغ', variant: 'destructive' });
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <SEO
        title={news?.title ? `${news.title} | كورة` : 'خبر | كورة'}
        description={news?.content ? String(news.content).replace(/<[^>]*>/g, '').slice(0, 150) : 'تفاصيل الخبر'}
        image={news?.image_url || undefined}
        type="article"
      >
        {news?.created_at && (
          <meta property="article:published_time" content={new Date(news.created_at).toISOString()} />
        )}
        {news && (
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: news.title,
              datePublished: new Date(news.created_at).toISOString(),
              image: news.image_url || undefined,
              author: { '@type': 'Organization', name: 'Koora' },
              publisher: { '@type': 'Organization', name: 'Koora' }
            })}
          </script>
        )}
      </SEO>
      
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sport-green">
            <ArrowRight className="w-4 h-4" />
            <Link to="/news" className="text-sm hover:underline">العودة إلى الأخبار</Link>
          </div>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setReportOpen(true)} disabled={reporting}>
            <Flag className="w-4 h-4" />
            {reporting ? '...' : 'تبليغ عن الخبر'}
          </Button>
        </div>

        {loading && (
          <div className="text-sm text-muted-foreground">جار التحميل…</div>
        )}
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        {news && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden p-0">
                {news.image_url && (
                  <div className="w-full h-64 md:h-96 overflow-hidden rounded-md">
                    <img
                      src={news.image_url}
                      alt={news.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{news.created_at ? new Date(news.created_at).toISOString().slice(0,10) : ''}</span>
                    <Badge variant="secondary">أخبار</Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-4">{news.title}</h1>
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none leading-relaxed"
                    dir="auto"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(parsedContent) }}
                  />
                </div>
              </Card>

              <CommentsSection newsId={Number(id)} />
            </div>

            <div className="space-y-6">
              <Card className="p-5">
                <h3 className="font-bold mb-3">قد يهمك</h3>
                {relatedNews.length > 0 ? (
                  <ul className="space-y-4">
                    {relatedNews.map((item) => (
                      <li key={item.id}>
                        <Link to={`/news/${item.id}`} className="flex items-center gap-4">
                          {item.image_url && (
                            <div className="w-20 h-20 overflow-hidden rounded-md">
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-bold">{item.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {item.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : ''}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">لا توجد أخبار ذات صلة.</p>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
      <Footer />

      <Dialog open={reportOpen} onOpenChange={(o) => { setReportOpen(o); if (!o) setReportDesc(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>سبب التبليغ</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="اكتب سبب التبليغ بإيجاز"
            value={reportDesc}
            onChange={(e) => setReportDesc(e.target.value)}
            className="min-h-[120px]"
            dir="auto"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)} disabled={reporting}>إلغاء</Button>
            <Button
              onClick={() => {
                const d = reportDesc.trim();
                if (!d) {
                  toast({ title: 'مطلوب وصف', description: 'يرجى كتابة سبب التبليغ', variant: 'destructive' });
                  return;
                }
                reportThisNews(d);
              }}
              disabled={reporting}
            >
              {reporting ? '...' : 'إرسال البلاغ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Styles pour les embeds */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .embed-container {
            margin: 20px 0;
          }
          
          .youtube-embed iframe {
            max-width: 100% !important;
            width: 100% !important;
          }
          
          @media (max-width: 768px) {
            .embed-container iframe {
              height: 300px !important;
            }
            
            .youtube-embed iframe {
              height: 200px !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default NewsDetails;