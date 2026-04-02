import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState, Action } from '../../types';
import { setBottomPanel, resetConfig, setConfig } from '../../store/actions';

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

      .pg-button--active {
        background: var(--pg-color-accent-muted);
        border-color: var(--pg-color-accent);
      }
    `;
  }

  protected render(state: PlaygroundState): void {
    if (this.shadowRoot!.querySelector('.toolbar')) return;
    this.shadowRoot!.innerHTML = `
      <div class="toolbar" style="display:contents">
        <div class="title"><span>Interact</span> Playground</div>
        <slot name="component-selector"></slot>
        <div class="actions">
          <button class="pg-button pg-button--secondary" id="import-btn">Import</button>
          <button class="pg-button pg-button--secondary" id="export-btn">Export</button>
          <button class="pg-button pg-button--secondary" id="json-toggle">JSON</button>
          <button class="pg-button pg-button--secondary" id="timeline-toggle">Timeline</button>
          <button class="pg-button pg-button--secondary" id="clear-btn">Clear</button>
        </div>
      </div>
    `;

    this.shadowRoot!.getElementById('json-toggle')!.addEventListener('click', () => {
      const current = this.store.getState().bottomPanel;
      this.store.dispatch(setBottomPanel(current === 'json' ? 'none' : 'json'));
    });

    this.shadowRoot!.getElementById('timeline-toggle')!.addEventListener('click', () => {
      const current = this.store.getState().bottomPanel;
      this.store.dispatch(setBottomPanel(current === 'timeline' ? 'none' : 'timeline'));
    });

    this.shadowRoot!.getElementById('clear-btn')!.addEventListener('click', () => {
      this.store.dispatch(resetConfig());
    });

    this.shadowRoot!.getElementById('export-btn')!.addEventListener('click', () => {
      this._exportConfig();
    });

    this.shadowRoot!.getElementById('import-btn')!.addEventListener('click', () => {
      this._importConfig();
    });

    this._syncButtonStates(state.bottomPanel);
  }

  protected onStateChange(state: PlaygroundState, action: Action): void {
    if (action.type === 'SET_BOTTOM_PANEL' || action.type === 'UNDO') {
      this._syncButtonStates(state.bottomPanel);
    }
  }

  private _syncButtonStates(panel: string): void {
    const jsonBtn = this.shadowRoot?.getElementById('json-toggle');
    const timelineBtn = this.shadowRoot?.getElementById('timeline-toggle');
    jsonBtn?.classList.toggle('pg-button--active', panel === 'json');
    timelineBtn?.classList.toggle('pg-button--active', panel === 'timeline');
  }

  private _exportConfig(): void {
    const config = this.store.getState().config;
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interact-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  private _importConfig(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      file.text().then((text) => {
        try {
          const config = JSON.parse(text);
          if (config && typeof config === 'object' && config.interactions && config.effects) {
            this.store.dispatch(setConfig(config));
          }
        } catch {
          // Invalid JSON — ignore
        }
      });
    });
    input.click();
  }
}

customElements.define('pg-toolbar', PgToolbar);
