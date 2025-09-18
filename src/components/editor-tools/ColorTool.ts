import { InlineTool, API } from '@editorjs/editorjs';

interface ColorToolConfig {
  colors?: string[];
  defaultColor?: string;
}

class ColorTool implements InlineTool {
  private api: API;
  private button: HTMLButtonElement | null = null;
  private config: ColorToolConfig;
  private colors: string[];
  private currentColor: string = '#ff0000';
  private iconSVG: string = '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="4" fill="currentColor"/></svg>';

  static get isInline(): boolean {
    return true;
  }

  constructor({ api, config }: { api: API; config?: ColorToolConfig }) {
    this.api = api;
    this.config = config || {};
    this.colors = this.config.colors || [
      '#ff0000', // Rouge
      '#00ff00', // Vert
      '#0000ff', // Bleu
      '#ffff00', // Jaune
      '#ff00ff', // Magenta
      '#00ffff', // Cyan
      '#ffa500', // Orange
      '#800080', // Violet
      '#008000', // Vert foncé
      '#000000', // Noir
    ];
    this.currentColor = this.config.defaultColor || this.colors[0];
  }

  render(): HTMLElement {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.innerHTML = this.iconSVG;
    this.button.title = 'Couleur du texte';
    this.button.style.color = this.currentColor;
    
    // Créer le menu des couleurs
    const colorMenu = this.createColorMenu();
    this.button.appendChild(colorMenu);
    
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      colorMenu.style.display = colorMenu.style.display === 'block' ? 'none' : 'block';
    });
    
    return this.button;
  }

  private createColorMenu(): HTMLElement {
    const menu = document.createElement('div');
    menu.style.cssText = `
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1000;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
      width: 120px;
    `;
    menu.style.display = 'grid';
    menu.style.display = 'none';

    this.colors.forEach(color => {
      const colorButton = document.createElement('button');
      colorButton.type = 'button';
      colorButton.style.cssText = `
        width: 20px;
        height: 20px;
        background-color: ${color};
        border: 1px solid #ccc;
        border-radius: 2px;
        cursor: pointer;
        margin: 0;
        padding: 0;
      `;
      
      colorButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.currentColor = color;
        if (this.button) {
          this.button.style.color = color;
        }
        menu.style.display = 'none';
        this.applyColor();
      });
      
      menu.appendChild(colorButton);
    });

    return menu;
  }

  surround(range: Range): void {
    if (!range) return;
    this.applyColor();
  }

  private applyColor(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    // Vérifier s'il y a déjà un span de couleur
    const existingSpan = this.api.selection.findParentTag('SPAN');

    if (existingSpan && (existingSpan as HTMLElement).style.color) {
      // Modifier la couleur existante
      (existingSpan as HTMLElement).style.color = this.currentColor;
    } else {
      // Créer un nouveau span avec la couleur
      const selectedText = range.extractContents();
      const colorSpan = document.createElement('span');
      colorSpan.style.color = this.currentColor;
      colorSpan.appendChild(selectedText);
      range.insertNode(colorSpan);
    }

    // Restaurer la sélection
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(range.commonAncestorContainer);
    selection.addRange(newRange);
  }

  checkState(): boolean {
    const colorSpan = this.api.selection.findParentTag('SPAN');
    const hasColor = colorSpan && (colorSpan as HTMLElement).style.color;
    
    if (this.button) {
      this.button.classList.toggle('ce-inline-tool--active', !!hasColor);
      if (hasColor) {
        const color = (colorSpan as HTMLElement).style.color;
        if (color) {
          this.button.style.color = color;
        }
      }
    }

    return !!hasColor;
  }

  static get sanitize() {
    return {
      span: {
        style: true
      }
    };
  }
}

export default ColorTool;