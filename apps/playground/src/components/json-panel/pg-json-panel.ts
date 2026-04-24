import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState, Action } from '../../types';
import { setConfig } from '../../store/actions';
import { JSON_HIGHLIGHT_NAMES, tokenizeJson, type JsonHighlightKind } from './json-highlighter';

interface TextSegment {
  node: Text;
  start: number;
  end: number;
}

export class PgJsonPanel extends BaseComponent {
  private _editor: HTMLDivElement | null = null;
  private _draft = '';
  private _lastValidText = '';

  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: none;
        background: var(--pg-color-bg-secondary);
        border-top: var(--pg-border-width) solid var(--pg-color-border);
        flex-direction: column;
        height: var(--pg-json-panel-height);
      }

      :host(.open) {
        display: flex;
      }

      .header {
        padding: var(--pg-space-1) var(--pg-panel-padding);
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border-bottom: var(--pg-border-width) solid var(--pg-color-border);
        flex-shrink: 0;
      }

      .editor {
        flex: 1;
        min-height: 0;
        overflow: auto;
        background: var(--pg-color-bg-primary);
        color: var(--pg-color-text-primary);
        font-family: var(--pg-font-mono);
        font-size: var(--pg-font-size-sm);
        line-height: var(--pg-line-height);
        padding: var(--pg-space-3);
        border: none;
        outline: none;
        white-space: pre;
        tab-size: 2;
        caret-color: var(--pg-color-text-primary);
      }

      .editor:focus {
        outline: none;
      }

      ::highlight(${JSON_HIGHLIGHT_NAMES.key}) {
        color: var(--pg-color-accent-hover);
      }

      ::highlight(${JSON_HIGHLIGHT_NAMES.string}) {
        color: var(--pg-color-success);
      }

      ::highlight(${JSON_HIGHLIGHT_NAMES.number}) {
        color: var(--pg-color-accent);
      }

      ::highlight(${JSON_HIGHLIGHT_NAMES.literal}) {
        color: var(--pg-color-text-secondary);
      }

      ::highlight(${JSON_HIGHLIGHT_NAMES.punctuation}) {
        color: var(--pg-color-text-muted);
      }
    `;
  }

  protected render(state: PlaygroundState): void {
    this.classList.toggle('open', state.bottomPanel === 'json');

    if (!this.shadowRoot!.querySelector('.json-panel')) {
      this.shadowRoot!.innerHTML = `
        <div class="json-panel" style="display:contents">
          <div class="header">InteractConfig JSON</div>
          <div
            class="editor"
            contenteditable="plaintext-only"
            role="textbox"
            aria-multiline="true"
            spellcheck="false"
          ></div>
        </div>
      `;
      this._editor = this.shadowRoot!.querySelector('.editor');
      this._editor!.addEventListener('input', () => this._handleInput());
      this._editor!.addEventListener('blur', () => this._handleBlur());
    }

    this._syncFromState(state);
  }

  protected onStateChange(state: PlaygroundState, _action: Action): void {
    this.classList.toggle('open', state.bottomPanel === 'json');
    this._syncFromState(state);
  }

  disconnectedCallback(): void {
    this._clearHighlights();
    super.disconnectedCallback();
  }

  private _syncFromState(state: PlaygroundState): void {
    const formatted = JSON.stringify(state.config, null, 2);
    this._lastValidText = formatted;

    if (this._editor && this.shadowRoot!.activeElement !== this._editor) {
      this._setEditorText(formatted);
    }
  }

  private _setEditorText(text: string): void {
    if (!this._editor) return;
    this._draft = text;
    if (this._editor.textContent !== text) {
      this._editor.textContent = text;
    }
    this._refreshHighlights();
  }

  private _handleInput(): void {
    if (!this._editor) return;
    this._draft = this._editor.textContent ?? '';
    this._refreshHighlights();
  }

  private _handleBlur(): void {
    if (!this._editor) return;

    const text = this._draft;

    try {
      const config = JSON.parse(text);
      this.store.dispatch(setConfig(config));
    } catch {
      // Invalid JSON, revert to current state
      this._setEditorText(
        this._lastValidText || JSON.stringify(this.store.getState().config, null, 2),
      );
    }
  }

  private _refreshHighlights(): void {
    if (!this._editor || !this._supportsCustomHighlights()) return;

    this._clearHighlights();

    const text = this._draft;
    if (!text) return;

    const segments = this._collectTextSegments();
    if (!segments.length) return;

    const rangesByKind: Record<JsonHighlightKind, Range[]> = {
      key: [],
      string: [],
      number: [],
      literal: [],
      punctuation: [],
    };

    for (const token of tokenizeJson(text)) {
      const range = this._createRange(segments, token.start, token.end);
      if (range) {
        rangesByKind[token.kind].push(range);
      }
    }

    for (const kind of Object.keys(rangesByKind) as JsonHighlightKind[]) {
      const ranges = rangesByKind[kind];
      if (ranges.length > 0) {
        CSS.highlights.set(JSON_HIGHLIGHT_NAMES[kind], new Highlight(...ranges));
      }
    }
  }

  private _clearHighlights(): void {
    if (!this._supportsCustomHighlights()) return;

    for (const name of Object.values(JSON_HIGHLIGHT_NAMES)) {
      CSS.highlights.delete(name);
    }
  }

  private _supportsCustomHighlights(): boolean {
    return typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined';
  }

  private _collectTextSegments(): TextSegment[] {
    if (!this._editor) return [];

    const walker = this.ownerDocument.createTreeWalker(this._editor, NodeFilter.SHOW_TEXT);
    const segments: TextSegment[] = [];
    let offset = 0;

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!(node instanceof Text) || node.data.length === 0) {
        continue;
      }

      segments.push({
        node,
        start: offset,
        end: offset + node.data.length,
      });
      offset += node.data.length;
    }

    return segments;
  }

  private _createRange(segments: TextSegment[], start: number, end: number): Range | null {
    if (end <= start) return null;

    const startPosition = this._resolvePosition(segments, start);
    const endPosition = this._resolvePosition(segments, end);
    if (!startPosition || !endPosition) return null;

    const range = new Range();
    range.setStart(startPosition.node, startPosition.offset);
    range.setEnd(endPosition.node, endPosition.offset);
    return range;
  }

  private _resolvePosition(
    segments: TextSegment[],
    index: number,
  ): { node: Text; offset: number } | null {
    for (const segment of segments) {
      if (index <= segment.end) {
        return {
          node: segment.node,
          offset: Math.min(index - segment.start, segment.node.data.length),
        };
      }
    }

    const last = segments[segments.length - 1];
    if (!last) return null;

    return {
      node: last.node,
      offset: last.node.data.length,
    };
  }
}

customElements.define('pg-json-panel', PgJsonPanel);
