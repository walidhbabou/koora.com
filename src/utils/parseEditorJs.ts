// Fonction de parsing robuste et simplifiée
export const parseEditorJsToHtml = (content: string): string => {
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
          return `<p style="margin: 16px 0; direction: rtl; text-align: justify;">${text}</p>`;

        case 'header':
          const headerText = block.data?.text || '';
          if (!headerText) return '';
          const level = Math.min(Math.max(block.data?.level || 1, 1), 6);
          const fontSize = level === 1 ? '2em' : level === 2 ? '1.5em' : level === 3 ? '1.3em' : '1.1em';
          return `<h${level} style="font-weight: bold; margin: 24px 0 16px 0; direction: rtl; font-size: ${fontSize};">${headerText}</h${level}>`;

        case 'list':
          const items = block.data?.items || [];
          if (!Array.isArray(items) || items.length === 0) return '';
          const listTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
          const itemsHtml = items.map(item => `<li style="margin: 8px 0;">${item}</li>`).join('');
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
          
          return `<pre style="background: #f4f4f4; border: 1px solid #ddd; border-radius: 4px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: monospace;"><code>${code}</code></pre>`;

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