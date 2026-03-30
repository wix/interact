import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState, Action } from '../../types';
import { setConfig } from '../../store/actions';

export class PgJsonPanel extends BaseComponent {
  private _textarea: HTMLTextAreaElement | null = null;

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

      textarea {
        flex: 1;
        background: var(--pg-color-bg-primary);
        color: var(--pg-color-text-primary);
        font-family: var(--pg-font-mono);
        font-size: var(--pg-font-size-sm);
        padding: var(--pg-space-3);
        border: none;
        outline: none;
        resize: none;
        tab-size: 2;
      }
    `;
  }

  protected render(state: PlaygroundState): void {
    this.classList.toggle('open', state.jsonPanelOpen);

    if (!this.shadowRoot!.querySelector('.json-panel')) {
      this.shadowRoot!.innerHTML = `
        <div class="json-panel" style="display:contents">
          <div class="header">InteractConfig JSON</div>
          <textarea spellcheck="false"></textarea>
        </div>
      `;
      this._textarea = this.shadowRoot!.querySelector('textarea');
      this._textarea!.addEventListener('blur', () => this._handleBlur());
    }

    if (this._textarea && document.activeElement !== this._textarea) {
      this._textarea.value = JSON.stringify(state.config, null, 2);
    }
  }

  protected onStateChange(state: PlaygroundState, _action: Action): void {
    this.classList.toggle('open', state.jsonPanelOpen);
    if (this._textarea && this.shadowRoot!.activeElement !== this._textarea) {
      this._textarea.value = JSON.stringify(state.config, null, 2);
    }
  }

  private _handleBlur(): void {
    if (!this._textarea) return;
    try {
      const config = JSON.parse(this._textarea.value);
      this.store.dispatch(setConfig(config));
    } catch {
      // Invalid JSON, revert to current state
      this._textarea.value = JSON.stringify(this.store.getState().config, null, 2);
    }
  }
}

customElements.define('pg-json-panel', PgJsonPanel);
