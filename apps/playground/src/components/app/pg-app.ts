import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';

export class PgApp extends BaseComponent {
  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
      }

      .app-grid {
        display: grid;
        grid-template-columns: var(--pg-sidebar-width) 1fr var(--pg-inspector-width);
        grid-template-rows: var(--pg-toolbar-height) 1fr auto;
        grid-template-areas:
          'toolbar  toolbar   toolbar'
          'sidebar  stage     inspector'
          'json     json      json';
        height: 100%;
      }

      ::slotted(pg-toolbar) { grid-area: toolbar; }
      ::slotted(pg-sidebar) { grid-area: sidebar; }
      ::slotted(pg-stage) { grid-area: stage; }
      ::slotted(pg-inspector) { grid-area: inspector; }
      ::slotted(pg-json-panel) { grid-area: json; }
    `;
  }

  protected render(_state: PlaygroundState): void {
    if (this.shadowRoot!.querySelector('.app-grid')) return;
    this.shadowRoot!.innerHTML = `
      <div class="app-grid">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('pg-app', PgApp);
