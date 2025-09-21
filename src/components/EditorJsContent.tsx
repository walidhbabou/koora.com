import React, { useEffect, useState } from 'react';
import { parseAndSanitizeContent } from '@/utils/contentUtils';

interface EditorJsContentProps {
  content: string;
  className?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  onContentReady?: (htmlContent: string) => void;
}

const EditorJsContent: React.FC<EditorJsContentProps> = ({
  content,
  className = '',
  dir = 'auto',
  onContentReady
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processContent = async () => {
      if (!content) {
        setHtmlContent('');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const parsed = parseAndSanitizeContent(content);
        setHtmlContent(parsed);
        
        if (onContentReady) {
          onContentReady(parsed);
        }
      } catch (err) {
        console.error('Error processing Editor.js content:', err);
        setError('خطأ في تحميل المحتوى');
        setHtmlContent('<p>خطأ في تحميل المحتوى</p>');
      } finally {
        setLoading(false);
      }
    };

    processContent();
  }, [content, onContentReady]);

  // Effect pour traiter les embeds Twitter après le rendu
  useEffect(() => {
    if (htmlContent && !loading) {
      const timer = setTimeout(() => {
        // Traitement des embeds Twitter
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
            iframe.title = `Tweet ${tweetId}`;
            iframe.style.maxWidth = '550px';
            iframe.style.border = '1px solid #e1e8ed';
            iframe.style.borderRadius = '12px';
            iframe.style.margin = '0 auto';
            iframe.style.display = 'block';
            
            // Gestion d'erreur pour l'iframe
            iframe.onerror = () => {
              const username = source.match(/(?:twitter\.com|x\.com)\/(\w+)\/status\/\d+/)?.[1];
              container.innerHTML = `
                <div style="padding: 20px; border: 1px solid #e1e8ed; border-radius: 12px; background: #f7f9fa; text-align: center;">
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
            const username = source.match(/(?:twitter\.com|x\.com)\/(\w+)\/status\/\d+/)?.[1];
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

      return () => clearTimeout(timer);
    }
  }, [htmlContent, loading]);

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-2 text-sm text-muted-foreground">جاري التحميل...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (!htmlContent) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-muted-foreground text-sm">لا يوجد محتوى متاح</div>
      </div>
    );
  }

  return (
    <div
      className={`news-content prose prose-slate dark:prose-invert max-w-none leading-relaxed ${className}`}
      dir={dir}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default EditorJsContent;