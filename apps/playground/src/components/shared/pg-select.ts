import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';

export class PgSelect extends BaseComponent {
  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: block;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: var(--pg-space-1);
      }

      label {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-medium);
        color: var(--pg-color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    `;
  }

  static get observedAttributes(): string[] {
    return ['label', 'value'];
  }

  protected render(_state: PlaygroundState): void {
    // Only render once; updates via attribute changes
    if (this.shadowRoot!.querySelector('.field')) return;

    const label = this.getAttribute('label') || '';
    this.shadowRoot!.innerHTML = `
      <div class="field">
        ${label ? `<label>${label}</label>` : ''}
        <select class="pg-select">
          <slot></slot>
        </select>
      </div>
    `;

    const select = this.shadowRoot!.querySelector('select')!;

    // Move slotted options into select
    this._syncOptions();

    const slot = this.shadowRoot!.querySelector('slot');
    slot?.addEventListener('slotchange', () => this._syncOptions());

    select.addEventListener('change', () => {
      this.setAttribute('value', select.value);
      this.dispatchEvent(new CustomEvent('change', { detail: select.value, bubbles: true, composed: true }));
    });
  }

  private _syncOptions(): void {
    const select = this.shadowRoot!.querySelector('select');
    if (!select) return;

    const slot = this.shadowRoot!.querySelector('slot');
    if (!slot) return;

    const assigned = (slot as HTMLSlotElement).assignedElements();
    // Clear existing options (except slot)
    while (select.firstChild && select.firstChild !== slot) {
      select.removeChild(select.firstChild);
    }

    // Clone options from light DOM into shadow select
    for (const el of assigned) {
      if (el instanceof HTMLOptionElement || el instanceof HTMLOptGroupElement) {
        select.appendChild(el.cloneNode(true));
      }
    }

    // Set current value
    const val = this.getAttribute('value');
    if (val != null) {
      select.value = val;
    }
  }

  attributeChangedCallback(name: string, _old: string | null, newVal: string | null): void {
    if (name === 'value' && newVal != null) {
      const select = this.shadowRoot?.querySelector('select');
      if (select && select.value !== newVal) {
        select.value = newVal;
      }
    }
  }

  get value(): string {
    return this.shadowRoot?.querySelector('select')?.value ?? '';
  }

  set value(v: string) {
    const select = this.shadowRoot?.querySelector('select');
    if (select) select.value = v;
    this.setAttribute('value', v);
  }

  setOptions(options: { value: string; label: string; group?: string }[]): void {
    const select = this.shadowRoot?.querySelector('select');
    if (!select) return;

    // Remove slot if present
    const slot = select.querySelector('slot');
    select.innerHTML = '';

    const groups = new Map<string, HTMLOptGroupElement>();
    for (const opt of options) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;

      if (opt.group) {
        let group = groups.get(opt.group);
        if (!group) {
          group = document.createElement('optgroup');
          group.label = opt.group;
          select.appendChild(group);
          groups.set(opt.group, group);
        }
        group.appendChild(option);
      } else {
        select.appendChild(option);
      }
    }

    // Restore slot
    if (slot) select.appendChild(slot);
  }
}

customElements.define('pg-select', PgSelect);
