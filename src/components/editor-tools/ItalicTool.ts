import { InlineTool, API } from '@editorjs/editorjs';

interface ItalicToolConfig {
  shortcut?: string;
}

class ItalicTool implements InlineTool {
  private api: API;
  private button: HTMLButtonElement | null = null;
  private tag: string = 'I';
  private iconSVG: string = '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M12.8 5.2 11.1 14.8H8.8L10.5 5.2Z" fill="currentColor"/></svg>';

  static get isInline(): boolean {
    return true;
  }

  constructor({ api }: { api: API; config?: ItalicToolConfig }) {
    this.api = api;
  }

  render(): HTMLElement {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.innerHTML = this.iconSVG;
    this.button.title = 'Italique (Ctrl+I)';
    
    return this.button;
  }

  surround(range: Range): void {
    if (!range) return;

    const termWrapper = this.api.selection.findParentTag(this.tag);

    if (termWrapper) {
      this.unwrap(termWrapper);
    } else {
      this.wrap(range);
    }
  }

  wrap(range: Range): void {
    const selectedText = range.extractContents();
    const italicElement = document.createElement(this.tag);
    
    italicElement.appendChild(selectedText);
    range.insertNode(italicElement);

    this.api.selection.expandToTag(italicElement);
  }

  unwrap(termWrapper: HTMLElement): void {
    this.api.selection.expandToTag(termWrapper);

    const sel = window.getSelection();
    if (!sel) return;

    const range = sel.getRangeAt(0);
    const unwrappedContent = range.extractContents();

    termWrapper.parentNode?.removeChild(termWrapper);
    range.insertNode(unwrappedContent);

    sel.removeAllRanges();
    sel.addRange(range);
  }

  checkState(): boolean {
    const termTag = this.api.selection.findParentTag(this.tag);
    
    if (this.button) {
      this.button.classList.toggle('ce-inline-tool--active', !!termTag);
    }

    return !!termTag;
  }

  get shortcut(): string {
    return 'CMD+I';
  }

  static get sanitize() {
    return {
      i: {}
    };
  }
}

export default ItalicTool;