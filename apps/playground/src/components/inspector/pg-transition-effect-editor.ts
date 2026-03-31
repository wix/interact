import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';
import type { Effect, TransitionProperty } from '@wix/interact';
import { updateEffect } from '../../store/actions';

const COMMON_CSS_PROPERTIES = [
  'opacity',
  'transform',
  'background-color',
  'color',
  'border-color',
  'box-shadow',
  'filter',
  'clip-path',
  'width',
  'height',
  'padding',
  'margin',
  'border-radius',
  'font-size',
  'letter-spacing',
];

const DEFAULT_DURATION = 300;
const DEFAULT_DELAY = 0;
const DEFAULT_EASING = 'ease';

function getSharedTiming(properties: TransitionProperty[]): {
  duration: number;
  delay: number;
  easing: string;
} {
  const first = properties[0];
  return {
    duration: first?.duration ?? DEFAULT_DURATION,
    delay: first?.delay ?? DEFAULT_DELAY,
    easing: first?.easing ?? DEFAULT_EASING,
  };
}

export class PgTransitionEffectEditor extends BaseComponent {
  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: block;
      }

      .section-title {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: var(--pg-space-2);
        margin-top: var(--pg-space-3);
      }

      .section-title:first-child {
        margin-top: 0;
      }

      .divider {
        height: var(--pg-border-width);
        background: var(--pg-color-border);
        margin: var(--pg-space-3) 0;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: var(--pg-space-1);
        margin-bottom: var(--pg-space-3);
      }

      .field label {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-medium);
        color: var(--pg-color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .field-row {
        display: flex;
        gap: var(--pg-space-2);
      }

      .field-row > .field {
        flex: 1;
      }

      .property-row {
        padding: var(--pg-space-2);
        background: var(--pg-color-bg-tertiary);
        border-radius: var(--pg-radius-md);
        margin-bottom: var(--pg-space-2);
        position: relative;
      }

      .property-row .field {
        margin-bottom: var(--pg-space-2);
      }

      .property-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--pg-space-2);
      }

      .property-index {
        font-size: var(--pg-font-size-xs);
        color: var(--pg-color-text-muted);
        font-weight: var(--pg-font-weight-bold);
      }

      .remove-btn {
        background: none;
        border: none;
        color: var(--pg-color-danger);
        font-size: var(--pg-font-size-sm);
        cursor: pointer;
        padding: var(--pg-space-1);
      }

      .remove-btn:hover {
        opacity: 0.8;
      }

      .add-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 28px;
        background: var(--pg-color-bg-tertiary);
        border: var(--pg-border-width) dashed var(--pg-color-border);
        border-radius: var(--pg-radius-md);
        color: var(--pg-color-text-secondary);
        font-size: var(--pg-font-size-sm);
        cursor: pointer;
        transition: border-color var(--pg-transition-fast), color var(--pg-transition-fast);
      }

      .add-btn:hover {
        border-color: var(--pg-color-accent);
        color: var(--pg-color-accent);
      }

      .empty {
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-sm);
        font-style: italic;
        text-align: center;
        padding: var(--pg-space-3);
      }
    `;
  }

  protected render(state: PlaygroundState): void {
    const effectId = state.selectedEffectId;
    if (!effectId) {
      this.shadowRoot!.innerHTML = '';
      return;
    }

    const effect = state.config.effects[effectId];
    if (!effect) {
      this.shadowRoot!.innerHTML = '';
      return;
    }

    const properties: TransitionProperty[] =
      ((effect as Record<string, unknown>).transitionProperties as TransitionProperty[]) ?? [];

    const { duration, delay, easing } = getSharedTiming(properties);

    const propertyRows =
      properties.length > 0
        ? properties.map((prop, i) => this._renderPropertyRow(prop, i)).join('')
        : '<div class="empty">No properties added yet</div>';

    const propertyOptions = COMMON_CSS_PROPERTIES.map(
      (p) => `<option value="${p}">${p}</option>`,
    ).join('');

    this.shadowRoot!.innerHTML = `
      <div class="section-title">Timing</div>

      <div class="field-row">
        <div class="field">
          <label>Duration (ms)</label>
          <input type="number" class="pg-input" id="duration" min="0" max="30000" step="50" value="${duration}">
        </div>
        <div class="field">
          <label>Delay (ms)</label>
          <input type="number" class="pg-input" id="delay" min="0" max="30000" step="50" value="${delay}">
        </div>
      </div>

      <div class="field">
        <pg-easing-picker label="Easing" value="${easing}" id="easing-picker"></pg-easing-picker>
      </div>

      <div class="divider"></div>
      <div class="section-title">Properties</div>
      <div id="properties">${propertyRows}</div>
      <button class="add-btn" id="add-property">+ Add Property</button>
      <datalist id="css-props">${propertyOptions}</datalist>
    `;

    this._attachListeners(effectId, effect, properties);
  }

  private _renderPropertyRow(prop: TransitionProperty, index: number): string {
    return `
      <div class="property-row" data-index="${index}">
        <div class="property-header">
          <span class="property-index">#${index + 1}</span>
          <button class="remove-btn" data-remove="${index}">&times;</button>
        </div>
        <div class="field-row">
          <div class="field" style="flex: 1">
            <label>Property</label>
            <input type="text" class="pg-input" data-field="name" data-idx="${index}"
              list="css-props" value="${prop.name}" placeholder="e.g. transform">
          </div>
          <div class="field" style="flex: 2">
            <label>Value</label>
            <input type="text" class="pg-input" data-field="value" data-idx="${index}"
              value="${this._escapeAttr(prop.value)}" placeholder="e.g. scale(1.1)">
          </div>
        </div>
      </div>
    `;
  }

  private _escapeAttr(str: string): string {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  private _applyTimingToAll(
    properties: TransitionProperty[],
    patch: Partial<TransitionProperty>,
  ): TransitionProperty[] {
    return properties.map((p) => ({ ...p, ...patch }));
  }

  private _attachListeners(
    effectId: string,
    effect: Effect,
    properties: TransitionProperty[],
  ): void {
    const shadow = this.shadowRoot!;

    const dispatchProps = (updated: TransitionProperty[]) => {
      const { transition: _t, ...rest } = effect as Record<string, unknown>;
      void _t;
      this.store.dispatch(
        updateEffect(effectId, {
          ...rest,
          transitionProperties: updated,
        } as Effect),
      );
    };

    shadow.getElementById('duration')?.addEventListener('change', (ev) => {
      const val = parseInt((ev.target as HTMLInputElement).value, 10) || 0;
      dispatchProps(this._applyTimingToAll(properties, { duration: val }));
    });

    shadow.getElementById('delay')?.addEventListener('change', (ev) => {
      const val = parseInt((ev.target as HTMLInputElement).value, 10) || 0;
      dispatchProps(this._applyTimingToAll(properties, { delay: val }));
    });

    shadow.getElementById('easing-picker')?.addEventListener('change', (ev) => {
      const val = (ev as CustomEvent).detail as string;
      dispatchProps(this._applyTimingToAll(properties, { easing: val }));
    });

    shadow.getElementById('add-property')?.addEventListener('click', () => {
      const { duration, delay, easing } = getSharedTiming(properties);
      dispatchProps([
        ...properties,
        {
          name: 'transform',
          value: 'scale(1.05)',
          duration,
          delay,
          easing,
        },
      ]);
    });

    shadow.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt((btn as HTMLElement).dataset.remove!, 10);
        dispatchProps(properties.filter((_, i) => i !== idx));
      });
    });

    shadow.querySelectorAll<HTMLInputElement>('[data-field][data-idx]').forEach((input) => {
      const field = input.dataset.field!;
      const idx = parseInt(input.dataset.idx!, 10);

      input.addEventListener('change', () => {
        const updated = [...properties];
        const prop = { ...updated[idx] };
        if (field === 'name') {
          prop.name = input.value || 'transform';
        } else if (field === 'value') {
          prop.value = input.value;
        }
        updated[idx] = prop as TransitionProperty;
        dispatchProps(updated);
      });
    });
  }
}

customElements.define('pg-transition-effect-editor', PgTransitionEffectEditor);
