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
import { Clock, ArrowRight, Flag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CommentsSection from "@/components/CommentsSection";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';
import { useAuth } from "@/contexts/AuthContext";

// Fonction de parsing robuste et simplifiée
const parseEditorJsToHtml = (content: string): string => {
  console.log('🔍 Parsing content, length:', content?.length);
  
  if (!content || typeof content !== 'string') {
    return '<p class="error">Aucun contenu à afficher</p>';
  }

  // Fonction pour nettoyer et réparer le JSON
  const cleanJson = (jsonStr: string): string => {
    return jsonStr
      // Nettoyer les échappements de base
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"')
      
      // Corriger les entités HTML
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      
      // Corriger les échappements d'entités
      .replace(/\\&quot;/g, '"')
      .replace(/\\&amp;/g, '&')
      
      // Réparer les URLs dans les attributs
      .replace(/href=\\"([^"]+)\\"/g, 'href="$1"')
      .replace(/src=\\"([^"]+)\\"/g, 'src="$1"')
      
      // Corriger les guillemets orphelins
      .replace(/([^\\])\\"/g, '$1"')
      .replace(/^\\"/g, '"');
  };

  // Fonction pour parser un bloc Editor.js
  const parseBlock = (block: any): string => {
    if (!block || !block.type) return '';

    try {
      switch (block.type) {
        case 'paragraph':
          const text = block.data?.text || '';
          if (!text) return '';
          return `<p style="margin: 16px 0; direction: rtl; text-align: justify; line-height: 1.8;">${text}</p>`;

        case 'header':
          const headerText = block.data?.text || '';
          if (!headerText) return '';
          const level = Math.min(Math.max(block.data?.level || 1, 1), 6);
          const fontSize = level === 1 ? '2em' : level === 2 ? '1.5em' : level === 3 ? '1.3em' : '1.1em';
          return `<h${level} style="font-weight: bold; margin: 24px 0 16px 0; direction: rtl; font-size: ${fontSize}; color: #222;">${headerText}</h${level}>`;

        case 'list':
          const items = block.data?.items || [];
          if (!Array.isArray(items) || items.length === 0) return '';
          const listTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
          const itemsHtml = items.map(item => `<li style="margin: 8px 0; line-height: 1.6;">${item}</li>`).join('');
          return `<${listTag} style="margin: 16px 0; padding-right: 24px; direction: rtl;">${itemsHtml}</${listTag}>`;

        case 'quote':
          const quoteText = block.data?.text || '';
          if (!quoteText) return '';
          const caption = block.data?.caption ? `<cite>${block.data.caption}</cite>` : '';
          return `<blockquote style="border-right: 4px solid #0066cc; padding: 16px 20px; margin: 20px 0; background: #f8f9fa; font-style: italic; border-radius: 4px; direction: rtl;">${quoteText}${caption}</blockquote>`;

        case 'code':
          const code = block.data?.code || '';
          if (!code) return '';
          
          // Vérifier si c'est un embed Twitter
          if (code.includes('twitter-tweet') || code.includes('platform.twitter.com')) {
            const urlMatch = code.match(/href="([^"]*(?:twitter|x)\.com[^"]*)"/);
            if (urlMatch) {
              const tweetUrl = urlMatch[1];
              return `
                <div style="margin: 20px 0; padding: 20px; border: 1px solid #e1e8ed; border-radius: 12px; background: #f7f9fa; text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 15px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1da1f2">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span style="font-weight: bold; color: #1da1f2;">منشور من X (تويتر)</span>
                  </div>
                  <p style="margin-bottom: 15px; color: #666;">اضغط للعرض على الموقع الأصلي:</p>
                  <a href="${tweetUrl}" target="_blank" rel="noopener noreferrer" 
                     style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #1da1f2; color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    عرض المنشور
                  </a>
                </div>`;
            }
          }
          
          return `<pre style="background: #f4f4f4; border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: monospace; font-size: 14px;"><code>${code}</code></pre>`;

        case 'image':
          const imageUrl = block.data?.file?.url || block.data?.url || '';
          if (!imageUrl) return '';
          const imageCaption = block.data?.caption || '';
          return `
            <div style="margin: 20px 0; text-align: center;">
              <img src="${imageUrl}" alt="${imageCaption}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
              ${imageCaption ? `<p style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">${imageCaption}</p>` : ''}
            </div>`;

        case 'delimiter':
          return '<hr style="margin: 30px 0; border: none; height: 2px; background: linear-gradient(to right, transparent, #ddd, transparent);" />';

        case 'embed':
          const source = block.data?.source || '';
          if (!source) return '';
          
          // Gestion des embeds YouTube
          if (source.includes('youtube.com') || source.includes('youtu.be')) {
            const videoIdMatch = source.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
            if (videoIdMatch) {
              const videoId = videoIdMatch[1];
              const embedCaption = block.data?.caption || '';
              return `
                <div style="margin: 20px 0; text-align: center;">
                  <div style="position: relative; width: 100%; max-width: 560px; margin: 0 auto;">
                    <iframe 
                      src="https://www.youtube.com/embed/${videoId}" 
                      width="100%" 
                      height="315" 
                      frameborder="0" 
                      allowfullscreen
                      style="border-radius: 8px;"
                      title="YouTube video">
                    </iframe>
                  </div>
                  ${embedCaption ? `<p style="margin-top: 10px; font-size: 14px; color: #666; font-style: italic;">${embedCaption}</p>` : ''}
                </div>`;
            }
          }
          
          return `
            <div style="margin: 20px 0; padding: 16px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; text-align: center;">
              <a href="${source}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: none; font-weight: 500;">
                ${block.data?.caption || 'رابط خارجي'}
              </a>
            </div>`;

        default:
          console.log(`Type de bloc non supporté: ${block.type}`);
          return `<p style="color: #999; font-style: italic; margin: 10px 0;">[Contenu de type "${block.type}"]</p>`;
      }
    } catch (error) {
      console.error('Erreur parsing bloc:', error, block);
      return '';
    }
  };

  try {
    // Essayer d'abord de parser comme un seul JSON
    let cleanContent = cleanJson(content.trim());
    
    try {
      const singleJson = JSON.parse(cleanContent);
      if (singleJson.blocks && Array.isArray(singleJson.blocks)) {
        console.log('✅ JSON unique parsé, blocs:', singleJson.blocks.length);
        const html = singleJson.blocks.map(parseBlock).filter(Boolean).join('');
        return html || '<p>Contenu vide</p>';
      }
    } catch (singleError) {
      console.log('❌ Échec parsing JSON unique, tentative de séparation...');
    }

    // Si ça échoue, essayer de séparer les objets multiples
    const jsonObjects: string[] = [];
    let braceCount = 0;
    let currentObject = '';
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < cleanContent.length; i++) {
      const char = cleanContent[i];
      
      if (escapeNext) {
        escapeNext = false;
        currentObject += char;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        currentObject += char;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
      }
      
      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
        }
      }
      
      currentObject += char;
      
      if (braceCount === 0 && currentObject.trim() && currentObject.includes('{')) {
        jsonObjects.push(currentObject.trim());
        currentObject = '';
      }
    }
    
    if (currentObject.trim()) {
      jsonObjects.push(currentObject.trim());
    }

    console.log(`📦 ${jsonObjects.length} objets JSON détectés`);

    // Parser chaque objet JSON
    const results: string[] = [];
    
    for (let i = 0; i < jsonObjects.length; i++) {
      const jsonStr = jsonObjects[i];
      try {
        const cleanedJsonStr = cleanJson(jsonStr);
        const parsed = JSON.parse(cleanedJsonStr);
        
        if (parsed.blocks && Array.isArray(parsed.blocks)) {
          console.log(`✅ Objet ${i + 1} parsé: ${parsed.blocks.length} blocs`);
          const html = parsed.blocks.map(parseBlock).filter(Boolean).join('');
          if (html) {
            results.push(html);
          }
        }
      } catch (parseError) {
        console.error(`❌ Erreur objet ${i + 1}:`, parseError);
        // Essayer d'extraire du texte brut
        const textMatch = jsonStr.match(/"text":\s*"([^"]+)"/g);
        if (textMatch) {
          textMatch.forEach(match => {
            const text = match.replace(/"text":\s*"([^"]+)"/, '$1');
            if (text && text.length > 5) {
              results.push(`<p style="margin: 16px 0; direction: rtl;">${text}</p>`);
            }
          });
        }
      }
    }
    
    const finalHtml = results.join('\n');
    console.log('🎯 HTML final généré, length:', finalHtml.length);
    
    return finalHtml || '<p style="color: #999;">Impossible de parser le contenu</p>';
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
    
    // Fallback ultime: extraire tout texte visible
    const textMatches = content.match(/"text":\s*"([^"]+)"/g);
    if (textMatches && textMatches.length > 0) {
      const texts = textMatches.map(match => {
        return match.replace(/"text":\s*"([^"]+)"/, '$1');
      }).filter(text => text && text.length > 5);
      
      if (texts.length > 0) {
        return texts.map(text => `<p style="margin: 16px 0; direction: rtl;">${text}</p>`).join('');
      }
    }
    
    return '<p style="color: #c33; background: #fee; padding: 10px; border-radius: 4px;">خطأ في تحميل المحتوى</p>';
  }
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
    
    console.log('🚀 Chargement des nouvelles pour ID:', id);
    
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, content, created_at, image_url, status, competition_internationale_id, competition_mondiale_id, competition_continentale_id, competition_locale_id')
        .eq('id', Number(id))
        .single();
        
      if (error) throw error;
      
      console.log('📰 Données récupérées:', data);
      setNews(data as NewsRow);

      // Parse content immediately
      if (data?.content) {
        console.log('🔄 Début du parsing du contenu...');
        const parsed = parseEditorJsToHtml(data.content);
        console.log('✅ Contenu parsé:', parsed);
        setParsedContent(parsed);
      } else {
        console.log('⚠️ Aucun contenu trouvé');
        setParsedContent('<p>Aucun contenu disponible</p>');
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
      console.error('❌ Erreur chargement:', error);
      setError(error?.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { 
    load(); 
  }, [id, load]);

  const reportThisNews = async (description: string) => {
    if (!id || reporting || !isAuthenticated || !user?.id) {
      toast({ 
        title: 'يرجى تسجيل الدخول', 
        description: 'يجب تسجيل الدخول لإرسال البلاغ', 
        variant: 'destructive' 
      });
      return;
    }
    
    setReporting(true);
    try {
      const { error } = await supabase.from('reports').insert({
        type: 'content',
        target: `news:${id}`,
        reason: 'inappropriate',
        description,
        reported_by: user.id
      });
      
      if (error) throw error;
      
      toast({ description: 'تم إرسال البلاغ بنجاح' });
      setReportOpen(false);
      setReportDesc('');
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast({ 
        title: 'خطأ', 
        description: err?.message || 'تعذر إرسال البلاغ', 
        variant: 'destructive' 
      });
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
                    <span className="text-xs text-muted-foreground">
                      {news.created_at ? new Date(news.created_at).toISOString().slice(0,10) : ''}
                    </span>
                    <Badge variant="secondary">أخبار</Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-4">{news.title}</h1>
                  
                  {/* Contenu principal */}
                  <div
                    className="news-content prose prose-slate dark:prose-invert max-w-none leading-relaxed"
                    style={{ 
                      fontFamily: 'Cairo, Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                    }}
                    dir="auto"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(parsedContent || '<p>Aucun contenu disponible</p>') 
                    }}
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
    </div>
  );
};

export default NewsDetails;