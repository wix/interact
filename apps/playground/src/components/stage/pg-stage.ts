import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState, Action } from '../../types';
import { getComponent } from '../../library';

export class PgStage extends BaseComponent {
  private _activeComponentId: string | null = null;
  private _librarySheet: CSSStyleSheet | null = null;

  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: block;
        overflow: hidden;
        background: var(--pg-color-bg-primary);
        position: relative;
      }

      :host(.scroll-mode) {
        overflow-y: auto;
      }

      .stage-canvas {
        min-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--pg-space-8);
      }

      :host(.scroll-mode) .stage-canvas {
        min-height: calc(var(--stage-height-multiplier, 3) * 100%);
        align-items: flex-start;
        padding-top: 50%;
      }

      .stage-content {
        width: 100%;
        max-width: 800px;
      }

      interact-element {
        display: contents;
      }

      .stage-content.sticky {
        position: sticky;
      }

      .empty-state {
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-lg);
        text-align: center;
      }

      .empty-state p {
        margin-top: var(--pg-space-2);
        font-size: var(--pg-font-size-sm);
      }
    `;
  }

  protected render(state: PlaygroundState): void {
    if (!this.shadowRoot!.querySelector('.stage-canvas')) {
      this.shadowRoot!.innerHTML = `
        <div class="stage-canvas">
          <div class="stage-content"></div>
        </div>
      `;
    }

    this._renderComponent(state.activeComponentId);
  }

  protected onStateChange(state: PlaygroundState, action: Action): void {
    if (action.type === 'SELECT_COMPONENT') {
      this._renderComponent(state.activeComponentId);
    }
  }

  private _renderComponent(componentId: string): void {
    if (this._activeComponentId === componentId) return;
    this._activeComponentId = componentId;

    const content = this.shadowRoot!.querySelector('.stage-content') as HTMLElement;
    if (!content) return;

    const definition = getComponent(componentId);
    if (!definition) {
      content.innerHTML = `
        <div class="empty-state">
          Select a component to start
          <p>Use the dropdown in the toolbar</p>
        </div>
      `;
      this._removeComponentStyles();
      return;
    }

    content.innerHTML = definition.html;
    this._applyComponentStyles(definition.css);
  }

  private _applyComponentStyles(css: string): void {
    this._removeComponentStyles();
    if (css) {
      this._librarySheet = new CSSStyleSheet();
      this._librarySheet.replaceSync(css);
      this.shadowRoot!.adoptedStyleSheets = [
        ...this.shadowRoot!.adoptedStyleSheets,
        this._librarySheet,
      ];
    }
  }

  private _removeComponentStyles(): void {
    if (this._librarySheet) {
      this.shadowRoot!.adoptedStyleSheets = this.shadowRoot!.adoptedStyleSheets.filter(
        (s) => s !== this._librarySheet,
      );
      this._librarySheet = null;
    }
  }

  setScrollMode(enabled: boolean, heightMultiplier = 3): void {
    this.classList.toggle('scroll-mode', enabled);
    this.style.setProperty('--stage-height-multiplier', String(heightMultiplier));
  }

  setStickyPosition(top?: number, bottom?: number): void {
    const content = this.shadowRoot!.querySelector('.stage-content') as HTMLElement;
    if (!content) return;

    if (top != null) {
      content.classList.add('sticky');
      content.style.top = `${top}px`;
      content.style.bottom = '';
    } else if (bottom != null) {
      content.classList.add('sticky');
      content.style.top = '';
      content.style.bottom = `${bottom}px`;
    } else {
      content.classList.remove('sticky');
      content.style.top = '';
      content.style.bottom = '';
    }
  }
}

customElements.define('pg-stage', PgStage);
