import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';
import { cssEasings } from '@wix/motion';

type EasingKey = keyof typeof cssEasings;

const GROUPS: { label: string; keys: EasingKey[] }[] = [
  { label: 'Standard', keys: ['linear', 'ease', 'easeIn', 'easeOut', 'easeInOut'] },
  { label: 'Sine', keys: ['sineIn', 'sineOut', 'sineInOut'] },
  { label: 'Quad', keys: ['quadIn', 'quadOut', 'quadInOut'] },
  { label: 'Cubic', keys: ['cubicIn', 'cubicOut', 'cubicInOut'] },
  { label: 'Quart', keys: ['quartIn', 'quartOut', 'quartInOut'] },
  { label: 'Quint', keys: ['quintIn', 'quintOut', 'quintInOut'] },
  { label: 'Expo', keys: ['expoIn', 'expoOut', 'expoInOut'] },
  { label: 'Circ', keys: ['circIn', 'circOut', 'circInOut'] },
  { label: 'Back', keys: ['backIn', 'backOut', 'backInOut'] },
];

const easingsByValue = new Map<string, string>();
for (const [key, value] of Object.entries(cssEasings)) {
  easingsByValue.set(value, key);
}

function findPresetKey(value: string): string {
  return easingsByValue.get(value) ?? 'custom';
}

export class PgEasingPicker extends BaseComponent {
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

      .value-display {
        font-size: var(--pg-font-size-xs);
        color: var(--pg-color-text-muted);
        font-family: var(--pg-font-mono);
        margin-top: var(--pg-space-1);
        word-break: break-all;
      }
    `;
  }

  static get observedAttributes(): string[] {
    return ['label', 'value'];
  }

  protected render(_state: PlaygroundState): void {
    if (this.shadowRoot!.querySelector('.field')) return;

    const label = this.getAttribute('label') || 'Easing';
    const value = this.getAttribute('value') || 'ease';
    const presetKey = findPresetKey(value);

    const optgroups = GROUPS.map((g) => {
      const opts = g.keys.map((k) =>
        `<option value="${k}" ${k === presetKey ? 'selected' : ''}>${k}</option>`,
      ).join('');
      return `<optgroup label="${g.label}">${opts}</optgroup>`;
    }).join('');

    this.shadowRoot!.innerHTML = `
      <div class="field">
        ${label ? `<label>${label}</label>` : ''}
        <select class="pg-select" id="easing-select">
          ${optgroups}
        </select>
        <div class="value-display" id="value-display">${value}</div>
      </div>
    `;

    const select = this.shadowRoot!.getElementById('easing-select') as HTMLSelectElement;
    const display = this.shadowRoot!.getElementById('value-display')!;

    select.addEventListener('change', () => {
      const key = select.value as EasingKey;
      const cssValue = cssEasings[key] ?? key;
      display.textContent = cssValue;
      this.dispatchEvent(
        new CustomEvent('change', { detail: cssValue, bubbles: true, composed: true }),
      );
    });
  }

  attributeChangedCallback(name: string, _old: string | null, newVal: string | null): void {
    if (name === 'value' && newVal != null) {
      const select = this.shadowRoot?.getElementById('easing-select') as HTMLSelectElement | null;
      const display = this.shadowRoot?.getElementById('value-display');
      if (select) {
        const key = findPresetKey(newVal);
        if (key !== 'custom') select.value = key;
      }
      if (display) display.textContent = newVal;
    }
  }

  get value(): string {
    const select = this.shadowRoot?.getElementById('easing-select') as HTMLSelectElement | null;
    if (!select) return 'ease';
    const key = select.value as EasingKey;
    return cssEasings[key] ?? key;
  }

  set value(v: string) {
    this.setAttribute('value', v);
  }
}

customElements.define('pg-easing-picker', PgEasingPicker);
