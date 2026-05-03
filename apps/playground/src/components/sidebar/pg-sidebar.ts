import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';

export class PgSidebar extends BaseComponent {
  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: flex;
        flex-direction: column;
        background: var(--pg-color-bg-secondary);
        border-right: var(--pg-border-width) solid var(--pg-color-border);
        overflow-y: auto;
      }

      .header {
        padding: var(--pg-space-2) var(--pg-panel-padding);
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border-bottom: var(--pg-border-width) solid var(--pg-color-border);
      }

      .body {
        flex: 1;
        overflow-y: auto;
      }
    `;
  }

  protected render(_state: PlaygroundState): void {
    if (this.shadowRoot!.querySelector('.sidebar')) return;
    this.shadowRoot!.innerHTML = `
      <div class="sidebar" style="display:contents">
        <div class="header">Interactions</div>
        <div class="body">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('pg-sidebar', PgSidebar);
