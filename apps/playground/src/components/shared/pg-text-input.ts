import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';

export class PgTextInput extends BaseComponent {
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
    return ['label', 'value', 'placeholder'];
  }

  protected render(_state: PlaygroundState): void {
    if (this.shadowRoot!.querySelector('.field')) return;

    const label = this.getAttribute('label') || '';
    const value = this.getAttribute('value') || '';
    const placeholder = this.getAttribute('placeholder') || '';

    this.shadowRoot!.innerHTML = `
      <div class="field">
        ${label ? `<label>${label}</label>` : ''}
        <input type="text" class="pg-input" value="${value}" placeholder="${placeholder}">
      </div>
    `;

    const input = this.shadowRoot!.querySelector('input')!;
    input.addEventListener('input', () => {
      this.dispatchEvent(
        new CustomEvent('change', { detail: input.value, bubbles: true, composed: true }),
      );
    });
  }

  attributeChangedCallback(name: string, _old: string | null, newVal: string | null): void {
    if (name === 'value' && newVal != null) {
      const input = this.shadowRoot?.querySelector('input');
      if (input && input.value !== newVal) input.value = newVal;
    }
  }

  get value(): string {
    return this.shadowRoot?.querySelector('input')?.value ?? '';
  }

  set value(v: string) {
    const input = this.shadowRoot?.querySelector('input');
    if (input) input.value = v;
  }
}

customElements.define('pg-text-input', PgTextInput);
