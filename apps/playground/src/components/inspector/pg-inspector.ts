import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState, Action } from '../../types';

export class PgInspector extends BaseComponent {
  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: flex;
        flex-direction: column;
        background: var(--pg-color-bg-secondary);
        border-left: var(--pg-border-width) solid var(--pg-color-border);
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
        flex-shrink: 0;
      }

      .body {
        flex: 1;
        padding: var(--pg-panel-padding);
        overflow-y: auto;
      }

      .empty {
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-sm);
        text-align: center;
        padding-top: var(--pg-space-8);
      }
    `;
  }

  private _rendered = false;

  protected render(state: PlaygroundState): void {
    const hasSelection = state.selectedInteractionIndex != null;

    if (!this._rendered) {
      this.shadowRoot!.innerHTML = `
        <div class="header">Inspector</div>
        <div class="body">
          <div class="empty" id="empty-msg">Select an interaction to edit</div>
          <div id="editor-slot" style="display:none"><slot></slot></div>
        </div>
      `;
      this._rendered = true;
    }

    const emptyMsg = this.shadowRoot!.getElementById('empty-msg')!;
    const editorSlot = this.shadowRoot!.getElementById('editor-slot')!;
    emptyMsg.style.display = hasSelection ? 'none' : 'block';
    editorSlot.style.display = hasSelection ? 'block' : 'none';
  }

  protected onStateChange(state: PlaygroundState, _action: Action): void {
    this.render(state);
  }
}

customElements.define('pg-inspector', PgInspector);
