/**
 * Outil Bold pour Editor.js
 * Permet de mettre du texte en gras avec un bouton dans la toolbar inline
 */

interface EditorAPI {
  selection: {
    expandToTag: (tag: HTMLElement) => void;
    findParentTag: (tagName: string, className?: string) => HTMLElement | null;
  };
}

class BoldTool {
  private api: EditorAPI;
  private button: HTMLButtonElement | null = null;
  private _state: boolean = false;
  private tag: string = 'B';
  private class: string = 'cdx-bold';

  static get isInline() {
    return true;
  }

  static get title() {
    return 'Gras';
  }

  get state() {
    return this._state;
  }

  set state(state: boolean) {
    this._state = state;

    if (this.button) {
      if (state) {
        this.button.classList.add('ce-inline-tool--active');
      } else {
        this.button.classList.remove('ce-inline-tool--active');
      }
    }
  }

  constructor({ api }: { api: EditorAPI }) {
    this.api = api;
  }

  render(): HTMLButtonElement {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.innerHTML = `
      <svg width="12" height="14">
        <path d="M2.3 0c.1 0 .1 0 .2.1l.2.1c0 .1.1.1.1.2v1.3c0 .1 0 .1-.1.2 0 0-.1.1-.2.1-.1 0-.1 0-.2-.1l-.2-.1c0-.1-.1-.1-.1-.2V.4c0-.1 0-.1.1-.2 0 0 .1-.1.2-.1zm-.1 11.1c-.1 0-.1 0-.2.1l-.2.1c0 .1-.1.1-.1.2v1.3c0 .1 0 .1.1.2 0 0 .1.1.2.1.1 0 .1 0 .2-.1l.2-.1c0-.1.1-.1.1-.2v-1.3c0-.1 0-.1-.1-.2 0 0-.1-.1-.2-.1zM8.3 6c1.4 0 2.5 1.1 2.5 2.5S9.7 11 8.3 11H2.5c-.1 0-.2 0-.2-.1-.1-.1-.1-.1-.1-.2V3.2c0-.1 0-.2.1-.2.1-.1.1-.1.2-.1h5.4c1.4 0 2.5 1.1 2.5 2.5S9.3 8 8.8 8c.2.5.5 1.2-.5 1.2 0 0 0 0 0 0zm-3.1 1.8h3.1c.7 0 1.3-.6 1.3-1.3S8.9 5.2 8.3 5.2H5.2v2.6zm0 1.2v2.6h3.1c.7 0 1.3-.6 1.3-1.3s-.6-1.3-1.3-1.3H5.2z"/>
      </svg>
    `;
    this.button.classList.add('ce-inline-tool');
    this.button.classList.add('ce-inline-tool--bold');

    return this.button;
  }

  surround(range: Range): void {
    if (this.state) {
      this.unwrap(range);
    } else {
      this.wrap(range);
    }
  }

  wrap(range: Range): void {
    const selectedText = range.extractContents();
    const boldElement = document.createElement(this.tag);

    if (this.class) {
      boldElement.classList.add(this.class);
    }

    boldElement.appendChild(selectedText);
    range.insertNode(boldElement);

    this.api.selection.expandToTag(boldElement);
  }

  unwrap(range: Range): void {
    const boldElement = this.api.selection.findParentTag(this.tag, this.class);
    if (boldElement) {
      const text = range.extractContents();
      boldElement.remove();
      range.insertNode(text);
    }
  }

  checkState(): void {
    const boldElement = this.api.selection.findParentTag(this.tag, this.class);
    this.state = !!boldElement;
  }

  static get sanitize() {
    return {
      b: {},
      strong: {},
    };
  }
}

export default BoldTool;