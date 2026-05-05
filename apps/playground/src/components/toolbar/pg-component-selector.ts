import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';
import { components } from '../../library';
import { selectComponent } from '../../store/actions';

export class PgComponentSelector extends BaseComponent {
  private _select: HTMLSelectElement | null = null;

  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: inline-flex;
        align-items: center;
        gap: var(--pg-space-2);
      }

      label {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-medium);
        color: var(--pg-color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }

      select {
        height: 30px;
        min-width: 200px;
        padding: 0 var(--pg-space-6) 0 var(--pg-space-2);
        background: var(--pg-color-bg-tertiary);
        border: var(--pg-border-width) solid var(--pg-color-border);
        border-radius: var(--pg-radius-sm);
        color: var(--pg-color-text-primary);
        font-family: var(--pg-font-family);
        font-size: var(--pg-font-size-sm);
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%23a0a0aa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        transition: border-color var(--pg-transition-fast);
      }

      select:focus-visible {
        outline: none;
        border-color: var(--pg-color-border-focus);
        box-shadow: 0 0 0 2px var(--pg-color-accent-muted);
      }
    `;
  }

  protected render(state: PlaygroundState): void {
    if (this._select) {
      this._select.value = state.activeComponentId;
      return;
    }

    this.shadowRoot!.innerHTML = `
      <label for="comp-select">Component</label>
      <select id="comp-select">
        ${components
          .map((c) => `<option value="${c.id}">${c.name} \u2014 ${c.description}</option>`)
          .join('')}
      </select>
    `;

    this._select = this.shadowRoot!.querySelector('select');
    this._select!.value = state.activeComponentId;

    this._select!.addEventListener('change', () => {
      this.store.dispatch(selectComponent(this._select!.value));
    });
  }
}

customElements.define('pg-component-selector', PgComponentSelector);
