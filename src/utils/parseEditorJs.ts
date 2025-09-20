// Utility function to parse Editor.js content
interface EditorJsBlock {
  type: string;
  data: {
    text?: string;
    items?: string[];
    level?: number;
    source?: string;
    embed?: string;
    caption?: string;
    content?: string[][];
    [key: string]: unknown;
  };
}

interface EditorJsContent {
  blocks: EditorJsBlock[];
  version?: string;
  time?: number;
}

// Fonction pour nettoyer les URLs et liens échappés
const cleanUrl = (url: string): string => {
  if (!url) return '';
  
  // Nettoyer les échappements multiples et guillemets
  let cleanedUrl = url
    .replace(/^["\\&quot;]+|["\\&quot;]+$/g, '') // Supprimer les guillemets au début et à la fin
    .replace(/\\&quot;/g, '') // Supprimer \&quot;
    .replace(/&quot;/g, '') // Supprimer &quot;
    .replace(/\\"/g, '') // Supprimer \"
    .replace(/^"|"$/g, '') // Supprimer les guillemets simples
    .replace(/\\+$/g, '') // Supprimer les backslashes à la fin
    .replace(/\\\\/g, '/') // Remplacer les doubles backslash
    .replace(/^\/+|\/+$/g, '') // Supprimer les slashes au début/fin
    .trim();
  
  // Vérifier si l'URL est valide
  try {
    new URL(cleanedUrl);
    return cleanedUrl;
  } catch {
    // Si l'URL n'est pas valide, essayer de la réparer
    if (!cleanedUrl.startsWith('http') && cleanedUrl.includes('://')) {
      return cleanedUrl;
    }
    if (!cleanedUrl.startsWith('http')) {
      cleanedUrl = 'https://' + cleanedUrl;
    }
    return cleanedUrl;
  }
};

// Fonction pour nettoyer le texte HTML et corriger les liens
const cleanHtmlText = (htmlText: string): string => {
  if (!htmlText) return '';
  
  // Nettoyer le texte de base
  let cleaned = htmlText
    .replace(/&nbsp;/g, ' ') // Remplacer les espaces insécables
    .replace(/\\n/g, ' ') // Remplacer les sauts de ligne échappés
    .replace(/\\\\/g, '\\') // Corriger les doubles backslashes
    .replace(/\r\n|\r|\n/g, ' ') // Remplacer tous les types de sauts de ligne
    .replace(/\t/g, ' ') // Remplacer les tabulations
    .replace(/&lt;/g, '<') // Décoder les entités HTML
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  
  // Corriger les liens avec des href malformés - regex plus précise pour gérer tous les cas
  cleaned = cleaned.replace(/href=["']?\\?&quot;([^"&\\]+)\\?&quot;["']?/g, (match, url) => {
    const cleanedUrl = cleanUrl(url);
    return `href="${cleanedUrl}" target="_blank" rel="noopener noreferrer"`;
  });
  
  // Corriger les autres formats de liens échappés
  cleaned = cleaned.replace(/href=["']([^"']*\\&quot;[^"']*)["']/g, (match, url) => {
    const cleanedUrl = cleanUrl(url);
    return `href="${cleanedUrl}" target="_blank" rel="noopener noreferrer"`;
  });
  
  // Cas spéciaux pour les guillemets simples autour des URLs
  cleaned = cleaned.replace(/href=["']\\?"([^"]+)\\"?["']/g, (match, url) => {
    const cleanedUrl = cleanUrl(url);
    return `href="${cleanedUrl}" target="_blank" rel="noopener noreferrer"`;
  });
  
  // Ajouter target="_blank" aux liens qui n'en ont pas
  cleaned = cleaned.replace(/<a\s+([^>]*href="[^"]*"[^>]*)>/g, (match, attributes) => {
    if (!attributes.includes('target=')) {
      return `<a ${attributes} target="_blank" rel="noopener noreferrer">`;
    }
    return match;
  });
  
  // Nettoyer les espaces multiples et normaliser
  cleaned = cleaned
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
    .trim(); // Supprimer les espaces au début et à la fin
  
  return cleaned;
};

export const parseEditorJsToHtml = (content: string): string => {
  if (!content) return '';
  
  console.log('Parsing content:', content.substring(0, 200) + '...');

  try {
    let parsed: EditorJsContent;
    
    // Nettoyer le contenu avant le parsing
    let cleanContent = content.trim();
    
    // Détecter si c'est du JSON brut malformé avec des échappements
    if (cleanContent.includes('\\"') || cleanContent.includes('&quot;') || cleanContent.includes('&nbsp;')) {
      console.log('Détection de JSON malformé, nettoyage agressif...');
      
      cleanContent = cleanContent
        .replace(/\\&quot;/g, '"')
        .replace(/&quot;/g, '"')
        .replace(/\\&amp;/g, '&')
        .replace(/&amp;/g, '&')
        .replace(/\\&lt;/g, '<')
        .replace(/&lt;/g, '<')
        .replace(/\\&gt;/g, '>')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '')
        .replace(/\\\\/g, '\\')
        // Corrections supplémentaires pour JSON malformé
        .replace(/,\s*}/g, '}') // Enlever les virgules avant les }
        .replace(/,\s*]/g, ']') // Enlever les virgules avant les ]
        .replace(/"\s*,\s*,/g, '",'); // Corriger les doubles virgules
        
      console.log('Contenu nettoyé:', cleanContent.substring(0, 200) + '...');
    }
    
    // Tentative de parsing principal
    try {
      parsed = JSON.parse(cleanContent);
      console.log('Parse JSON réussi, blocks trouvés:', parsed.blocks?.length || 0);
    } catch (parseError) {
      console.warn('Tentative de parsing échouée, fallback vers extraction manuelle...', parseError);
      
      // Extraction manuelle robuste pour les cas les plus complexes
      const textBlocks: string[] = [];
      
      // Méthode 1: Rechercher tous les blocs de type "paragraph" avec leur contenu
      const blockPattern = /"type":\s*"paragraph"[^}]*"text":\s*"([^"]*(?:[^"\\]|\\.)*)"/g;
      let match;
      
      while ((match = blockPattern.exec(content)) !== null) {
        if (match[1]) {
          const text = cleanHtmlText(match[1]);
          
          if (text.length > 0) {
            textBlocks.push(text);
          }
        }
      }
      
      console.log('Blocs de texte extraits manuellement:', textBlocks.length);
      
      // Si on a trouvé du contenu, le retourner formaté
      if (textBlocks.length > 0) {
        return textBlocks
          .filter(text => text && text.trim().length > 2) // Filtrer les textes vides ou trop courts
          .map(text => 
            `<p style="margin-bottom: 18px; line-height: 1.8; text-align: justify; font-size: 16px; color: #333;">${text}</p>`
          ).join('');
      }
      
      return '<p>Contenu non disponible en raison d\'un problème de format.</p>';
    }
    
    // Si le parsing a réussi, traiter normalement
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      const htmlBlocks = parsed.blocks
        .map((block: EditorJsBlock) => {
          switch (block.type) {
            case 'paragraph': {
              const text = block.data?.text || '';
              if (!text) return '';
              
              // Nettoyer et simplifier le texte pour un affichage optimal
              let cleanedText = cleanHtmlText(text);
              
              // Supprimer les espaces multiples et normaliser
              cleanedText = cleanedText
                .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
                .replace(/^\s+|\s+$/g, '') // Supprimer les espaces au début et à la fin
                .replace(/\s*<\/?\s*br\s*\/?\s*>\s*/gi, ' ') // Remplacer les <br> par des espaces
                .trim();
              
              // Ne retourner le paragraphe que s'il contient du contenu valide
              if (!cleanedText || cleanedText.length < 2) return '';
              
              return `<p style="margin-bottom: 18px; line-height: 1.8; text-align: justify; font-size: 16px; color: #333;">${cleanedText}</p>`;
            }
            
            case 'header': {
              const level = block.data?.level || 2;
              const text = block.data?.text || '';
              if (!text) return '';
              const cleanedText = cleanHtmlText(text);
              return `<h${level} style="margin: 24px 0 16px 0; font-weight: bold;">${cleanedText}</h${level}>`;
            }
            
            case 'list': {
              if (Array.isArray(block.data?.items)) {
                const items = block.data.items.map(item => {
                  const cleanedItem = cleanHtmlText(String(item));
                  return `<li style="margin-bottom: 8px;">${cleanedItem}</li>`;
                }).join('');
                return `<ul style="margin: 16px 0; padding-right: 20px;">${items}</ul>`;
              }
              return '';
            }
            
            case 'quote': {
              const text = block.data?.text || '';
              if (!text) return '';
              const cleanedText = cleanHtmlText(text);
              return `<blockquote style="border-right: 4px solid #e9ecef; padding: 16px; margin: 16px 0; background-color: #f8f9fa; font-style: italic;"><p>${cleanedText}</p></blockquote>`;
            }
            
            case 'table': {
              if (Array.isArray(block.data?.content)) {
                let tableHTML = '<div style="overflow-x: auto; margin: 20px 0;"><table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; background: white; min-width: 500px;">';
                
                block.data.content.forEach((row: string[], index: number) => {
                  if (Array.isArray(row)) {
                    const isHeader = index === 0 && block.data?.withHeadings;
                    const cellTag = isHeader ? 'th' : 'td';
                    const cellStyle = isHeader 
                      ? 'background-color: #f8f9fa; font-weight: bold; padding: 12px; border: 1px solid #ddd; text-align: center; color: #333;'
                      : 'padding: 12px; border: 1px solid #ddd; text-align: center; color: #333;';
                    
                    tableHTML += '<tr>';
                    row.forEach(cell => {
                      const cleanCell = String(cell || '')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/&quot;/g, '"')
                        .replace(/&amp;/g, '&')
                        .replace(/<[^>]*>/g, '')
                        .trim();
                      tableHTML += `<${cellTag} style="${cellStyle}">${cleanCell}</${cellTag}>`;
                    });
                    tableHTML += '</tr>';
                  }
                });
                
                tableHTML += '</table></div>';
                return tableHTML;
              }
              return '';
            }
            
            default: {
              const text = block.data?.text;
              if (!text) return '';
              const cleanedText = cleanHtmlText(text);
              return `<p style="margin-bottom: 16px; line-height: 1.6;">${cleanedText}</p>`;
            }
          }
        })
        .filter(Boolean);
      
      const html = htmlBlocks.join('');
      return html || '<p>Aucun contenu disponible.</p>';
    }
    
    return '<p>Format de contenu non reconnu.</p>';
    
  } catch (error) {
    console.error('Erreur lors du parsing du contenu Editor.js:', error);
    return '<p>Erreur lors du chargement du contenu.</p>';
  }
};