import React, { useRef, useEffect } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Table from "@editorjs/table";
import ImageTool from "@editorjs/image";
import Code from "@editorjs/code";
import Embed from "@editorjs/embed";
// Nouveaux outils ajoutés
import AttachesTool from "@editorjs/attaches";
import SimpleImage from "@editorjs/simple-image";
import RawTool from "@editorjs/raw";
import Delimiter from "@editorjs/delimiter";
import Warning from "@editorjs/warning";
import LinkTool from "@editorjs/link";
// Outils de formatage inline
import Marker from "@editorjs/marker";
import Underline from "@editorjs/underline";
import InlineCode from "@editorjs/inline-code";

interface NewsEditorProps {
  initialData?: object;
  onSave?: (data: object) => void;
  placeholder?: string;
}

const NewsEditor: React.FC<NewsEditorProps> = ({ initialData, onSave, placeholder }) => {
  const editorRef = useRef<EditorJS | null>(null);
  const holderIdRef = useRef<string>(`editorjs-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!editorRef.current) {
      try {
        editorRef.current = new EditorJS({
          holder: holderIdRef.current,
          data: initialData || { blocks: [], time: Date.now(), version: "2.31.0" },
          defaultBlock: 'paragraph',
          autofocus: false, // Désactiver l'autofocus pour éviter les conflits de sélection
          minHeight: 300,
          placeholder: placeholder || 'Commencez à écrire votre article...',
          logLevel: 'WARN' as const, // Réduire les logs pour éviter le spam
          onReady: () => {
            console.log('Editor.js is ready to work!');
            
            // Améliorer le comportement de copier-coller
            const editorElement = document.getElementById(holderIdRef.current);
            if (editorElement) {
              // Permettre le copier-coller de texte brut
              editorElement.addEventListener('paste', (e) => {
                console.log('Événement paste détecté');
                const clipboardData = (e as ClipboardEvent).clipboardData;
                if (clipboardData) {
                  const pastedText = clipboardData.getData('text/plain');
                  const pastedHtml = clipboardData.getData('text/html');
                  console.log('Texte collé:', pastedText);
                  console.log('HTML collé:', pastedHtml);
                  
                  // Délai pour permettre à Editor.js de traiter le collage
                  setTimeout(() => {
                    if (editorRef.current) {
                      editorRef.current.save()
                        .then((data) => {
                          console.log('Données après collage:', data);
                        })
                        .catch((error) => {
                          console.error('Erreur lors de la sauvegarde après collage:', error);
                        });
                    }
                  }, 100);
                }
              });

              editorElement.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                // Seulement donner le focus si on clique dans une zone vide
                if (target && (target.classList.contains('codex-editor') || target.id === holderIdRef.current)) {
                  console.log('Clic dans zone vide, activation du focus');
                  // Petit délai pour éviter les conflits
                  setTimeout(() => {
                    if (editorRef.current) {
                      try {
                        editorRef.current.focus();
                      } catch (error) {
                        console.warn('Erreur focus retardé:', error);
                      }
                    }
                  }, 100);
                } else {
                  console.log('Clic sur élément de contenu, pas de focus forcé');
                }
              });

              // Gestion des raccourcis clavier personnalisés
              editorElement.addEventListener('keydown', (e) => {
                const event = e as KeyboardEvent;
                
                // Ctrl+S pour sauvegarder
                if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                  e.preventDefault();
                  handleSave();
                }
                
                // Ctrl+B pour gras (natif d'Editor.js mais on peut l'améliorer)
                if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
                  console.log('Raccourci gras détecté');
                }
              });
            }
          },
          onChange: (api, event) => {
            console.log('Content was changed', event);
            
            // Préserver la sélection après les changements
            setTimeout(() => {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                console.log('Sélection préservée après changement');
              }
            }, 10);
          },
          tools: {
            header: {
              class: Header,
              inlineToolbar: ['bold', 'italic', 'marker', 'inlineCode', 'link'],
              config: {
                placeholder: 'Entrez un titre...',
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2
              },
              shortcut: 'CMD+SHIFT+H'
            },
            paragraph: {
              class: Paragraph,
              inlineToolbar: ['bold', 'italic', 'marker', 'inlineCode', 'link'],
              config: {
                placeholder: placeholder || 'Écrivez votre texte ici... Utilisez Ctrl+B pour le gras, Ctrl+I pour l\'italique',
                preserveBlank: true,
                // Améliorer la sélection
                actionsClassNames: {
                  alignment: {
                    left: 'ce-paragraph--left',
                    center: 'ce-paragraph--center',
                    right: 'ce-paragraph--right',
                  },
                },
              }
            },
            list: {
              class: List,
              inlineToolbar: ['bold', 'italic', 'marker', 'inlineCode', 'link'],
              config: {
                defaultStyle: 'unordered'
              },
              shortcut: 'CMD+SHIFT+L'
            },
            quote: {
              class: Quote,
              inlineToolbar: ['bold', 'italic', 'marker', 'inlineCode', 'link'],
              config: {
                quotePlaceholder: 'Entrez une citation...',
                captionPlaceholder: 'Auteur de la citation'
              }
            },
            warning: {
              class: Warning,
              inlineToolbar: ['bold', 'italic', 'marker', 'inlineCode'],
              config: {
                titlePlaceholder: 'Titre de l\'avertissement...',
                messagePlaceholder: 'Message d\'avertissement...'
              }
            },
            code: {
              class: Code,
              config: {
                placeholder: 'Entrez votre code...'
              }
            },
            raw: {
              class: RawTool,
              config: {
                placeholder: 'Entrez du HTML brut...'
              }
            },
            delimiter: {
              class: Delimiter
            },
            table: {
              class: Table,
              inlineToolbar: ['bold', 'italic'],
              config: {
                rows: 2,
                cols: 3,
                withHeadings: true
              }
            },
            image: {
              class: ImageTool,
              config: {
                endpoints: {
                  byFile: "http://localhost:5000/uploadFile",
                  byUrl: "http://localhost:5000/fetchUrl",
                },
                field: 'image',
                types: 'image/*',
                captionPlaceholder: 'Légende de l\'image...',
                buttonContent: 'Sélectionner une image',
                additionalRequestHeaders: {
                  'Accept': 'application/json'
                },
                uploader: {
                  uploadByFile: async (file: File) => {
                    const formData = new FormData();
                    formData.append('image', file);
                    
                    try {
                      const response = await fetch('http://localhost:5000/uploadFile', {
                        method: 'POST',
                        body: formData,
                        headers: {
                          'Accept': 'application/json'
                        }
                      });
                      
                      if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                      }
                      
                      const result = await response.json();
                      
                      return {
                        success: 1,
                        file: {
                          url: result.url || result.file?.url,
                          caption: result.caption || '',
                          withBorder: false,
                          withBackground: false,
                          stretched: false
                        }
                      };
                    } catch (error) {
                      console.error('Upload error:', error);
                      return {
                        success: 0,
                        error: 'Erreur lors du téléchargement de l\'image'
                      };
                    }
                  },
                  uploadByUrl: async (url: string) => {
                    try {
                      const response = await fetch('http://localhost:5000/fetchUrl', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        },
                        body: JSON.stringify({ url })
                      });
                      
                      if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                      }
                      
                      const result = await response.json();
                      
                      return {
                        success: 1,
                        file: {
                          url: result.url || url,
                          caption: result.caption || '',
                          withBorder: false,
                          withBackground: false,
                          stretched: false
                        }
                      };
                    } catch (error) {
                      console.error('URL fetch error:', error);
                      return {
                        success: 0,
                        error: 'Erreur lors du chargement de l\'image par URL'
                      };
                    }
                  }
                }
              }
            },
            simpleImage: {
              class: SimpleImage,
              config: {
                placeholder: 'Collez l\'URL de l\'image...'
              }
            },
            embed: {
              class: Embed,
              config: {
                services: {
                  youtube: true,
                  coub: true,
                  twitter: true,
                  instagram: true,
                  facebook: true,
                  vimeo: true,
                  vine: true,
                  imgur: true,
                  giphy: true,
                  spotify: true,
                  soundcloud: true,
                  codepen: true,
                }
              }
            },
            attaches: {
              class: AttachesTool,
              config: {
                endpoint: 'http://localhost:5000/uploadFile',
                field: 'file',
                types: '*',
                buttonText: 'Sélectionner un fichier',
                errorMessage: 'Erreur lors du téléchargement du fichier',
                additionalRequestHeaders: {
                  'Accept': 'application/json'
                }
              }
            },
            marker: {
              class: Marker,
              shortcut: 'CMD+SHIFT+M'
            },
            inlineCode: {
              class: InlineCode,
              shortcut: 'CMD+SHIFT+C'
            },
            underline: {
              class: Underline,
              shortcut: 'CMD+U'
            },
            linkTool: {
              class: LinkTool,
              config: {
                endpoint: 'http://localhost:5000/fetchUrl',
                additionalRequestHeaders: {
                  'Accept': 'application/json'
                }
              }
            }
          },
          // Configuration de sanitization globale pour éviter les erreurs sanitizeConfig
          sanitizer: {
            // Balises de base
            b: true,
            strong: true,
            i: true,
            em: true,
            u: true,
            s: true,
            p: true,
            br: true,
            div: true,
            span: {
              class: true,
              style: true
            },
            
            // Liens
            a: {
              href: true,
              target: '_blank',
              rel: 'nofollow noopener',
              class: true
            },
            
            // Formatage spécial
            mark: {
              class: true,
              style: true
            },
            code: {
              class: true
            },
            pre: {
              class: true
            },
            
            // Titres
            h1: true,
            h2: true,
            h3: true,
            h4: true,
            h5: true,
            h6: true,
            
            // Listes
            ul: {
              class: true
            },
            ol: {
              class: true,
              start: true
            },
            li: {
              class: true
            },
            
            // Citations et blocs
            blockquote: {
              class: true
            },
            
            // Tableaux
            table: {
              class: true,
              border: true,
              cellpadding: true,
              cellspacing: true
            },
            thead: true,
            tbody: true,
            tr: {
              class: true
            },
            td: {
              class: true,
              colspan: true,
              rowspan: true,
              style: true
            },
            th: {
              class: true,
              colspan: true,
              rowspan: true,
              scope: true,
              style: true
            },
            
            // Images et médias
            img: {
              src: true,
              alt: true,
              width: true,
              height: true,
              class: true,
              style: true,
              title: true
            },
            figure: {
              class: true
            },
            figcaption: {
              class: true
            },
            
            // Embedded content
            iframe: {
              src: true,
              width: true,
              height: true,
              frameborder: true,
              allowfullscreen: true,
              class: true
            },
            
            // Autres balises utiles
            hr: true,
            small: true,
            sub: true,
            sup: true,
            del: true,
            ins: true,
            kbd: true,
            samp: true,
            var: true,
            
            // Balises de structure
            article: {
              class: true
            },
            section: {
              class: true
            },
            aside: {
              class: true
            },
            details: true,
            summary: true,
            
            // Balises de données
            time: {
              datetime: true,
              class: true
            },
            data: {
              value: true,
              class: true
            }
          }
        });
      } catch (error) {
        console.error('Erreur lors de l\'initialisation d\'Editor.js:', error);
        alert('Erreur lors de l\'initialisation de l\'éditeur. Vérifiez la console pour plus de détails.');
      }
    }

    // Cleanup function
    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        try {
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (error) {
          console.error('Erreur lors de la destruction d\'Editor.js:', error);
        }
      }
    };
  }, [initialData, placeholder]); // handleSave est défini dans le composant et ne change pas

  const handleSave = async () => {
    if (editorRef.current) {
      try {
        const data = await editorRef.current.save();
        console.log('Données sauvegardées:', data);
        
        // Validation des données avant sauvegarde
        if (data && data.blocks && Array.isArray(data.blocks)) {
          if (onSave) onSave(data);
          alert(`Contenu sauvegardé avec succès! (${data.blocks.length} bloc(s))`);
          return data;
        } else {
          throw new Error('Données invalides');
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde. Vérifiez la console pour plus de détails.');
      }
    } else {
      alert('L\'éditeur n\'est pas encore initialisé');
    }
  };

  const handlePasteText = async () => {
    try {
      // Vérifier si l'API clipboard est disponible
      if (!navigator.clipboard) {
        throw new Error('API clipboard non disponible');
      }

      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        console.log('Texte récupéré du clipboard:', text);
        
        // Diviser le texte en lignes et créer des paragraphes
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (editorRef.current && lines.length > 0) {
          try {
            // Utiliser l'API d'Editor.js pour insérer les blocs
            for (let i = 0; i < lines.length; i++) {
              await editorRef.current.blocks.insert('paragraph', {
                text: lines[i].trim()
              });
            }
            console.log(`${lines.length} paragraphe(s) ajouté(s) avec succès`);
            alert(`${lines.length} paragraphe(s) ajouté(s) avec succès!`);
          } catch (insertError) {
            console.warn('Erreur lors de l\'insertion des blocs:', insertError);
            alert('Erreur lors de l\'ajout du texte. Essayez de coller directement dans l\'éditeur avec Ctrl+V.');
          }
        } else {
          alert('Aucun contenu valide à ajouter');
        }
      } else {
        alert('Aucun texte trouvé dans le presse-papiers');
      }
    } catch (err) {
      console.error('Erreur clipboard API:', err);
      // Méthode de fallback avec instructions détaillées
      alert(`Pour coller du texte :

1. Copiez votre texte (Ctrl+C ou Cmd+C)
2. Cliquez dans l'éditeur ci-dessus  
3. Collez avec Ctrl+V (ou Cmd+V sur Mac)

Note: Le navigateur ne permet pas l'accès automatique au presse-papiers pour des raisons de sécurité.`);
    }
  };

  const handleClear = async () => {
    if (editorRef.current && window.confirm('Êtes-vous sûr de vouloir effacer tout le contenu ? Cette action est irréversible.')) {
      try {
        await editorRef.current.clear();
        console.log('Éditeur vidé');
        alert('Contenu effacé avec succès!');
      } catch (error) {
        console.error('Erreur lors du vidage:', error);
        alert('Erreur lors du vidage du contenu');
      }
    }
  };

  const handleFocus = () => {
    if (editorRef.current) {
      try {
        // Vérifier s'il y a déjà une sélection active
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          // Seulement donner le focus s'il n'y a pas de sélection active
          editorRef.current.focus();
          console.log('Focus appliqué - aucune sélection active');
        } else {
          console.log('Sélection détectée, focus non appliqué');
        }
      } catch (error) {
        console.error('Erreur lors du focus:', error);
      }
    }
  };

  const handleInsertBlock = async (blockType: string) => {
    if (editorRef.current) {
      try {
        let blockData = {};
        
        switch (blockType) {
          case 'header':
            blockData = { text: 'Nouveau titre', level: 2 };
            break;
          case 'list':
            blockData = { style: 'unordered', items: ['Nouvel élément'] };
            break;
          case 'quote':
            blockData = { text: 'Nouvelle citation', caption: 'Auteur' };
            break;
          case 'delimiter':
            blockData = {};
            break;
          case 'warning':
            blockData = { title: 'Attention', message: 'Message d\'avertissement' };
            break;
          default:
            blockData = { text: 'Nouveau paragraphe' };
        }
        
        await editorRef.current.blocks.insert(blockType, blockData);
        console.log(`Bloc ${blockType} inséré`);
      } catch (error) {
        console.error('Erreur lors de l\'insertion du bloc:', error);
        alert(`Erreur lors de l'insertion du bloc ${blockType}`);
      }
    }
  };

  // Fonction de débogage pour la sélection
  const debugSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      console.log('=== Debug Sélection ===');
      console.log('Nombre de ranges:', selection.rangeCount);
      console.log('Texte sélectionné:', selection.toString());
      console.log('Is collapsed:', selection.isCollapsed);
      
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        console.log('Start container:', range.startContainer);
        console.log('End container:', range.endContainer);
        console.log('Start offset:', range.startOffset);
        console.log('End offset:', range.endOffset);
      }
      console.log('======================');
    } else {
      console.log('Aucune sélection détectée');
    }
  };

  return (
    <div className="news-editor-container w-full">
      {/* Éditeur principal */}
      <div
        id={holderIdRef.current}
        className="border rounded-lg p-4 bg-white dark:bg-[#18181b] text-black dark:text-white border-slate-300 dark:border-slate-700 min-h-[400px] focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-900 transition-all duration-200"
        style={{
          background: 'var(--editor-bg, #fff)',
          color: 'var(--editor-text, #222)',
          borderColor: 'var(--editor-border, #ddd)',
        }}
        onMouseDown={(e) => {
          // Seulement appliquer le focus si on clique dans une zone vide
          const target = e.target as HTMLElement;
          if (target && target.id === holderIdRef.current) {
            // Délai pour permettre à la sélection de se faire naturellement
            setTimeout(() => handleFocus(), 50);
          }
        }}
      ></div>

      {/* Styles CSS personnalisés */}
  <style >{`
        .news-editor-container {
          --editor-bg: #fff;
          --editor-border: #ddd;
          --editor-text: #222;
          --editor-btn-bg: #7c3aed;
          --editor-btn-text: #fff;
          --editor-btn-hover: #6d28d9;
        }
        .dark .news-editor-container {
          --editor-bg: #18181b;
          --editor-border: #444;
          --editor-text: #eee;
          --editor-btn-bg: #a78bfa;
          --editor-btn-text: #18181b;
          --editor-btn-hover: #8b5cf6;
        }
        /* Inputs et selects en dark mode */
        .dark .news-editor-container input,
        .dark .news-editor-container textarea,
        .dark .news-editor-container select {
          background: #18181b !important;
          color: #fff !important;
          border-color: #444 !important;
        }
        .dark .news-editor-container input::placeholder,
        .dark .news-editor-container textarea::placeholder {
          color: #aaa !important;
        }
        }
        .news-editor-container #${holderIdRef.current} {
          background: var(--editor-bg) !important;
          color: var(--editor-text) !important;
          border-color: var(--editor-border) !important;
        }
        .dark .news-editor-container #${holderIdRef.current} .ce-paragraph,
        .dark .news-editor-container #${holderIdRef.current} .ce-header,
        .dark .news-editor-container #${holderIdRef.current} .ce-quote,
        .dark .news-editor-container #${holderIdRef.current} .ce-list {
          color: #fff !important;
        }
        .dark .news-editor-container #${holderIdRef.current} .ce-paragraph[data-placeholder]:empty:before,
        .dark .news-editor-container #${holderIdRef.current} .ce-header[data-placeholder]:empty:before {
          color: #aaa !important;
        }
        .news-editor-container .ce-toolbar__content,
        .news-editor-container .ce-inline-toolbar,
        .news-editor-container .ce-conversion-toolbar,
        .news-editor-container .ce-settings {
          background: var(--editor-bg) !important;
          border-color: var(--editor-border) !important;
          color: var(--editor-text) !important;
        }
        .dark .news-editor-container .ce-toolbar__content,
        .dark .news-editor-container .ce-inline-toolbar,
        .dark .news-editor-container .ce-conversion-toolbar,
        .dark .news-editor-container .ce-settings {
          background: #18181b !important;
          color: #eee !important;
          border-color: #444 !important;
        }
        .news-editor-container .ce-popover,
        .news-editor-container .ce-popover-item {
          background: var(--editor-bg) !important;
          border-color: var(--editor-border) !important;
          color: var(--editor-text) !important;
        }
        .dark .news-editor-container .ce-popover,
        .dark .news-editor-container .ce-popover-item {
          background: #18181b !important;
          color: #eee !important;
          border-color: #444 !important;
        }
        .news-editor-container .ce-inline-tool,
        .news-editor-container .ce-conversion-tool,
        .news-editor-container .ce-settings__button {
          color: var(--editor-text) !important;
        }
        .dark .news-editor-container .ce-inline-tool,
        .dark .news-editor-container .ce-conversion-tool,
        .dark .news-editor-container .ce-settings__button {
          color: #eee !important;
        }
        .news-editor-container .ce-inline-tool:hover,
        .news-editor-container .ce-conversion-tool:hover,
        .news-editor-container .ce-settings__button:hover {
          background: var(--editor-border) !important;
        }
        .dark .news-editor-container .ce-inline-tool:hover,
        .dark .news-editor-container .ce-conversion-tool:hover,
        .dark .news-editor-container .ce-settings__button:hover {
          background: #222 !important;
        }
        /* Amélioration du style des boutons */
        .editor-button {
          background: var(--editor-btn-bg);
          color: var(--editor-btn-text);
          transition: all 0.2s ease;
        }
        .editor-button:hover {
          background: var(--editor-btn-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .editor-button:active {
          transform: translateY(0);
        }
        /* Style pour les raccourcis clavier */
        .keyboard-shortcut {
          font-family: 'SFMono-Regular', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          border: 1px solid;
        }
        /* Améliorer la sélection de texte */
        .news-editor-container #${holderIdRef.current} .ce-block {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }
        .news-editor-container #${holderIdRef.current} .ce-paragraph,
        .news-editor-container #${holderIdRef.current} .ce-header {
          cursor: text !important;
          user-select: text !important;
          -webkit-user-select: text !important;
        }
        /* Améliorer la visibilité de la sélection */
        .news-editor-container #${holderIdRef.current} ::selection {
          background-color: rgba(59, 130, 246, 0.3) !important;
          color: inherit !important;
        }
        .news-editor-container #${holderIdRef.current} ::-moz-selection {
          background-color: rgba(59, 130, 246, 0.3) !important;
          color: inherit !important;
        }
        /* Empêcher la sélection des éléments de l'interface */
        .news-editor-container .ce-toolbar,
        .news-editor-container .ce-inline-toolbar {
          user-select: none !important;
          -webkit-user-select: none !important;
        }
      `}</style>
      
      {/* Barre d'outils principale */}
      <div className="flex flex-wrap gap-2 mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <button 
          type="button" 
          onClick={handleSave} 
          className="editor-button px-4 py-2 rounded-md font-medium flex items-center gap-2"
          title="Sauvegarder le contenu (Ctrl+S)"
        >
          💾 Sauvegarder
        </button>
        
        <button 
          type="button" 
          onClick={handlePasteText} 
          className="editor-button px-4 py-2 rounded-md font-medium flex items-center gap-2" 
          title="Ajouter du texte depuis le presse-papiers"
        >
          📋 Ajouter du texte
        </button>
        
        <button 
          type="button" 
          onClick={handleClear} 
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200 font-medium flex items-center gap-2" 
          title="Effacer tout le contenu"
        >
          🗑️ Effacer tout
        </button>
        
        <button 
          type="button" 
          onClick={handleFocus} 
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-200 font-medium" 
          title="Activer le focus sur l'éditeur"
        >
          🎯 Focus
        </button>

        <button 
          type="button" 
          onClick={debugSelection} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200 font-medium" 
          title="Déboguer la sélection (voir console)"
        >
          🔍 Debug
        </button>
      </div>

      {/* Barre d'outils pour insérer des blocs */}
      <div className="flex flex-wrap gap-2 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300 mr-2">Insérer :</span>
        
        <button 
          type="button" 
          onClick={() => handleInsertBlock('header')} 
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors" 
          title="Insérer un titre"
        >
          📝 Titre
        </button>
        
        <button 
          type="button" 
          onClick={() => handleInsertBlock('list')} 
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors" 
          title="Insérer une liste"
        >
          📋 Liste
        </button>
        
        <button 
          type="button" 
          onClick={() => handleInsertBlock('quote')} 
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors" 
          title="Insérer une citation"
        >
          💬 Citation
        </button>
        
        <button 
          type="button" 
          onClick={() => handleInsertBlock('delimiter')} 
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors" 
          title="Insérer un séparateur"
        >
          ➖ Séparateur
        </button>
        
        <button 
          type="button" 
          onClick={() => handleInsertBlock('warning')} 
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors" 
          title="Insérer un avertissement"
        >
          ⚠️ Alerte
        </button>
      </div>
      
      {/* Instructions détaillées */}
      <div className="mt-4 space-y-3">
        {/* Instructions pour le formatage gras */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
          <div className="flex items-start gap-3">
            <span className="text-xl">✏️</span>
            <div className="flex-1">
              <h4 className="font-bold text-base mb-2">Comment mettre du texte en gras :</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold mb-2">Méthodes rapides :</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Sélectionnez le texte → <kbd className="keyboard-shortcut bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600">Ctrl+B</kbd></li>
                    <li>Sélectionnez le texte → Cliquez <strong>B</strong> dans la barre</li>
                    <li><kbd className="keyboard-shortcut bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600">Ctrl+B</kbd> → Tapez → <kbd className="keyboard-shortcut bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600">Ctrl+B</kbd></li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Exemple :</p>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                    "Ceci est un <strong>mot en gras</strong> dans une phrase."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions pour le collage */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div className="flex-1">
              <h4 className="font-bold text-base mb-2">Comment coller du texte :</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Cliquez dans l'éditeur ci-dessus pour le sélectionner</li>
                <li>Utilisez <kbd className="keyboard-shortcut bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600">Ctrl+V</kbd> (ou <kbd className="keyboard-shortcut bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600">Cmd+V</kbd> sur Mac)</li>
                <li>Ou utilisez le bouton "📋 Ajouter du texte" ci-dessus</li>
                <li>Le texte sera automatiquement formaté en paragraphes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions pour les raccourcis clavier */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm text-purple-700 dark:text-purple-300">
          <div className="flex items-start gap-3">
            <span className="text-xl">⌨️</span>
            <div className="flex-1">
              <h4 className="font-bold text-base mb-2">Raccourcis clavier utiles :</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold mb-2">Formatage :</p>
                  <ul className="space-y-1">
                    <li><kbd className="keyboard-shortcut bg-purple-100 dark:bg-purple-800 border-purple-300 dark:border-purple-600">Ctrl+B</kbd> : Gras</li>
                    <li><kbd className="keyboard-shortcut bg-purple-100 dark:bg-purple-800 border-purple-300 dark:border-purple-600">Ctrl+I</kbd> : Italique</li>
                    <li><kbd className="keyboard-shortcut bg-purple-100 dark:bg-purple-800 border-purple-300 dark:border-purple-600">Ctrl+U</kbd> : Souligné</li>
                    <li><kbd className="keyboard-shortcut bg-purple-100 dark:bg-purple-800 border-purple-300 dark:border-purple-600">Ctrl+Shift+M</kbd> : Surligneur</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Actions :</p>
                  <ul className="space-y-1">
                    <li><kbd className="keyboard-shortcut bg-purple-100 dark:bg-purple-800 border-purple-300 dark:border-purple-600">Ctrl+S</kbd> : Sauvegarder</li>
                    <li><kbd className="keyboard-shortcut bg-purple-100 dark:bg-purple-800 border-purple-300 dark:border-purple-600">Ctrl+Shift+H</kbd> : Titre</li>
                    <li><kbd className="keyboard-shortcut bg-purple-100 dark:bg-purple-800 border-purple-300 dark:border-purple-600">Ctrl+Shift+L</kbd> : Liste</li>
                    <li><kbd className="keyboard-shortcut bg-purple-100 dark:bg-purple-800 border-purple-300 dark:border-purple-600">Tab</kbd> : Menu des blocs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note sur les erreurs */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <h4 className="font-bold text-base mb-2">Notes importantes :</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Les erreurs de <code>sanitizeConfig</code> ont été corrigées avec une configuration complète</li>
                <li>Assurez-vous que votre serveur backend (port 5000) fonctionne pour les uploads</li>
                <li>Tous les plugins Editor.js doivent être compatibles avec la version 2.31.0</li>
                <li>En cas de problème, vérifiez la console du navigateur (F12)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsEditor;