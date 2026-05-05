import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';

export class PgNumberInput extends BaseComponent {
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

      .input-row {
        display: flex;
        gap: var(--pg-space-2);
        align-items: center;
      }

      input[type="number"] {
        flex: 1;
      }

      input[type="range"] {
        flex: 2;
        accent-color: var(--pg-color-accent);
      }

      .unit {
        font-size: var(--pg-font-size-xs);
        color: var(--pg-color-text-muted);
        min-width: 20px;
      }
    `;
  }

  static get observedAttributes(): string[] {
    return ['label', 'value', 'min', 'max', 'step', 'unit', 'show-range'];
  }

  protected render(_state: PlaygroundState): void {
    if (this.shadowRoot!.querySelector('.field')) return;

    const label = this.getAttribute('label') || '';
    const min = this.getAttribute('min') ?? '0';
    const max = this.getAttribute('max') ?? '10000';
    const step = this.getAttribute('step') ?? '1';
    const value = this.getAttribute('value') ?? '0';
    const unit = this.getAttribute('unit') ?? '';
    const showRange = this.hasAttribute('show-range');

    this.shadowRoot!.innerHTML = `
      <div class="field">
        ${label ? `<label>${label}</label>` : ''}
        <div class="input-row">
          ${showRange ? `<input type="range" min="${min}" max="${max}" step="${step}" value="${value}">` : ''}
          <input type="number" class="pg-input" min="${min}" max="${max}" step="${step}" value="${value}">
          ${unit ? `<span class="unit">${unit}</span>` : ''}
        </div>
      </div>
    `;

    const numberInput = this.shadowRoot!.querySelector('input[type="number"]') as HTMLInputElement;
    const rangeInput = this.shadowRoot!.querySelector(
      'input[type="range"]',
    ) as HTMLInputElement | null;

    numberInput.addEventListener('input', () => {
      if (rangeInput) rangeInput.value = numberInput.value;
      this._emitChange(numberInput.value);
    });

    rangeInput?.addEventListener('input', () => {
      numberInput.value = rangeInput.value;
      this._emitChange(rangeInput.value);
    });
  }

  private _emitChange(value: string): void {
    this.dispatchEvent(
      new CustomEvent('change', { detail: parseFloat(value), bubbles: true, composed: true }),
    );
  }

  attributeChangedCallback(name: string, _old: string | null, newVal: string | null): void {
    if (name === 'value' && newVal != null) {
      const numberInput = this.shadowRoot?.querySelector(
        'input[type="number"]',
      ) as HTMLInputElement | null;
      const rangeInput = this.shadowRoot?.querySelector(
        'input[type="range"]',
      ) as HTMLInputElement | null;
      if (numberInput && numberInput.value !== newVal) numberInput.value = newVal;
      if (rangeInput && rangeInput.value !== newVal) rangeInput.value = newVal;
    }
  }

  get value(): number {
    const input = this.shadowRoot?.querySelector('input[type="number"]') as HTMLInputElement | null;
    return input ? parseFloat(input.value) : 0;
  }

  set value(v: number) {
    this.setAttribute('value', String(v));
  }
}

customElements.define('pg-number-input', PgNumberInput);
