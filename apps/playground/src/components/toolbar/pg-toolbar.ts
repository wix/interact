import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';
import { toggleJsonPanel, resetConfig } from '../../store/actions';

export class PgToolbar extends BaseComponent {
  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: flex;
        align-items: center;
        gap: var(--pg-space-3);
        padding: 0 var(--pg-panel-padding);
        background: var(--pg-color-bg-secondary);
        border-bottom: var(--pg-border-width) solid var(--pg-color-border);
      }

      .title {
        font-size: var(--pg-font-size-lg);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-color-text-primary);
        margin-right: auto;
      }

      .title span {
        color: var(--pg-color-accent);
      }

      .component-slot {
        flex: 0 0 auto;
      }

      .actions {
        display: flex;
        gap: var(--pg-space-2);
        margin-left: auto;
      }
    `;
  }

  protected render(_state: PlaygroundState): void {
    if (this.shadowRoot!.querySelector('.toolbar')) return;
    this.shadowRoot!.innerHTML = `
      <div class="toolbar" style="display:contents">
        <div class="title"><span>Interact</span> Playground</div>
        <slot name="component-selector"></slot>
        <div class="actions">
          <button class="pg-button pg-button--secondary" id="json-toggle">JSON</button>
          <button class="pg-button pg-button--secondary" id="clear-btn">Clear</button>
        </div>
      </div>
    `;

    this.shadowRoot!.getElementById('json-toggle')!.addEventListener('click', () => {
      this.store.dispatch(toggleJsonPanel());
    });

    this.shadowRoot!.getElementById('clear-btn')!.addEventListener('click', () => {
      this.store.dispatch(resetConfig());
    });
  }
}

customElements.define('pg-toolbar', PgToolbar);
