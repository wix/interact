import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';

const CSS_PROPERTIES = [
  'opacity',
  'transform',
  'background-color',
  'color',
  'clip-path',
  'filter',
  'border-radius',
  'box-shadow',
  'width',
  'height',
  'padding',
  'margin',
  'font-size',
  'letter-spacing',
  'top',
  'left',
  'right',
  'bottom',
  'scale',
  'rotate',
  'translate',
];

interface KeyframeEntry {
  offset?: number;
  properties: { name: string; value: string }[];
}

function kebabToCamel(s: string): string {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToKebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function toEntries(keyframes: Record<string, unknown>[]): KeyframeEntry[] {
  return keyframes.map((kf) => {
    const offset = typeof kf.offset === 'number' ? kf.offset : undefined;
    const properties: { name: string; value: string }[] = [];
    for (const [key, val] of Object.entries(kf)) {
      if (key === 'offset' || key === 'composite' || key === 'easing') continue;
      properties.push({ name: key, value: String(val ?? '') });
    }
    if (properties.length === 0) {
      properties.push({ name: '', value: '' });
    }
    return { offset, properties };
  });
}

function fromEntries(entries: KeyframeEntry[]): Record<string, unknown>[] {
  return entries.map((entry) => {
    const kf: Record<string, unknown> = {};
    if (entry.offset != null) kf.offset = entry.offset;
    for (const prop of entry.properties) {
      const name = prop.name.trim();
      if (!name) continue;
      kf[kebabToCamel(name)] = prop.value;
    }
    return kf;
  });
}

export class PgKeyframeEditor extends BaseComponent {
  private _name = 'custom';
  private _entries: KeyframeEntry[] = [
    { offset: 0, properties: [{ name: 'opacity', value: '0' }] },
  ];

  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: block;
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

      .keyframe-card {
        padding: var(--pg-space-2);
        background: var(--pg-color-bg-tertiary);
        border-radius: var(--pg-radius-md);
        margin-bottom: var(--pg-space-2);
        overflow: hidden;
      }

      .keyframe-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--pg-space-2);
      }

      .keyframe-label {
        font-size: var(--pg-font-size-sm);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-color-text-primary);
      }

      .remove-keyframe-btn {
        background: none;
        border: none;
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-md);
        cursor: pointer;
        padding: 0 var(--pg-space-1);
        line-height: 1;
      }

      .remove-keyframe-btn:hover {
        color: var(--pg-color-danger);
      }

      .offset-field {
        margin-bottom: var(--pg-space-2);
      }

      .property-row {
        display: flex;
        align-items: center;
        gap: var(--pg-space-1);
        margin-bottom: 4px;
      }

      .property-row input {
        flex: 1;
        min-width: 0;
      }

      .property-row .prop-name {
        flex: 0.8;
      }

      .property-row .prop-value {
        flex: 1;
      }

      .remove-prop-btn {
        background: none;
        border: none;
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-sm);
        cursor: pointer;
        padding: 0 2px;
        line-height: 1;
        flex-shrink: 0;
      }

      .remove-prop-btn:hover {
        color: var(--pg-color-danger);
      }

      .add-prop-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 22px;
        background: var(--pg-color-bg-surface);
        border: var(--pg-border-width) dashed var(--pg-color-border);
        border-radius: var(--pg-radius-sm);
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-xs);
        cursor: pointer;
        transition: border-color var(--pg-transition-fast), color var(--pg-transition-fast);
        margin-top: var(--pg-space-1);
      }

      .add-prop-btn:hover {
        border-color: var(--pg-color-accent);
        color: var(--pg-color-accent);
      }

      .add-keyframe-btn {
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

      .add-keyframe-btn:hover {
        border-color: var(--pg-color-accent);
        color: var(--pg-color-accent);
      }
    `;
  }

  setKeyframeEffect(effect: { name: string; keyframes: Record<string, unknown>[] } | null): void {
    if (effect) {
      this._name = effect.name || 'custom';
      this._entries = toEntries(effect.keyframes);
    } else {
      this._name = 'custom';
      this._entries = [{ offset: 0, properties: [{ name: 'opacity', value: '0' }] }];
    }
    this._renderInternals();
  }

  protected render(_state: PlaygroundState): void {
    this._renderInternals();
  }

  protected onStateChange(): void {
    /* Externally driven via setKeyframeEffect — no re-render on state change */
  }

  private _emitChange(): void {
    const keyframes = fromEntries(this._entries);
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { name: this._name, keyframes },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _renderInternals(): void {
    const shadow = this.shadowRoot!;

    const datalistOptions = CSS_PROPERTIES.map((p) => `<option value="${camelToKebab(p)}">`).join(
      '',
    );

    const canRemoveKeyframes = this._entries.length > 1;

    const keyframeCards = this._entries
      .map((entry, kfIdx) => {
        const showOffset = this._entries.length !== 2 || entry.offset != null;
        const offsetHtml = showOffset
          ? `
          <div class="offset-field">
            <label style="font-size:var(--pg-font-size-xs);color:var(--pg-color-text-secondary)">Offset</label>
            <input type="number" class="pg-input" data-kf-offset="${kfIdx}"
              min="0" max="1" step="0.01" value="${entry.offset ?? ''}" placeholder="auto"
              style="width:80px">
          </div>`
          : '';

        const canRemoveProp = entry.properties.length > 1;
        const propRows = entry.properties
          .map(
            (prop, pIdx) => `
          <div class="property-row">
            <input type="text" class="pg-input prop-name" data-kf="${kfIdx}" data-prop="${pIdx}" data-field="name"
              list="css-props-list" value="${this._escapeAttr(prop.name)}" placeholder="property">
            <input type="text" class="pg-input prop-value" data-kf="${kfIdx}" data-prop="${pIdx}" data-field="value"
              value="${this._escapeAttr(prop.value)}" placeholder="value">
            ${canRemoveProp ? `<button class="remove-prop-btn" data-kf="${kfIdx}" data-remove-prop="${pIdx}">&times;</button>` : ''}
          </div>`,
          )
          .join('');

        return `
        <div class="keyframe-card">
          <div class="keyframe-header">
            <span class="keyframe-label">Keyframe ${kfIdx + 1}</span>
            ${canRemoveKeyframes ? `<button class="remove-keyframe-btn" data-remove-kf="${kfIdx}">&times;</button>` : ''}
          </div>
          ${offsetHtml}
          ${propRows}
          <button class="add-prop-btn" data-add-prop="${kfIdx}">+ add property</button>
        </div>`;
      })
      .join('');

    shadow.innerHTML = `
      <datalist id="css-props-list">${datalistOptions}</datalist>

      <div class="field">
        <label>Effect Name</label>
        <input type="text" class="pg-input" id="effect-name" value="${this._escapeAttr(this._name)}">
      </div>

      ${keyframeCards}
      <button class="add-keyframe-btn" id="add-keyframe">+ Add Keyframe</button>
    `;

    this._attachListeners();
  }

  private _escapeAttr(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  private _attachListeners(): void {
    const shadow = this.shadowRoot!;

    shadow.getElementById('effect-name')?.addEventListener('change', (e) => {
      this._name = (e.target as HTMLInputElement).value || 'custom';
      this._emitChange();
    });

    shadow.querySelectorAll<HTMLInputElement>('[data-kf-offset]').forEach((input) => {
      const kfIdx = parseInt(input.dataset.kfOffset!, 10);
      input.addEventListener('change', () => {
        const val = input.value.trim();
        this._entries[kfIdx].offset = val ? parseFloat(val) : undefined;
        this._emitChange();
      });
    });

    shadow.querySelectorAll<HTMLInputElement>('[data-field="name"]').forEach((input) => {
      const kfIdx = parseInt(input.dataset.kf!, 10);
      const pIdx = parseInt(input.dataset.prop!, 10);
      input.addEventListener('change', () => {
        const raw = input.value.trim();
        this._entries[kfIdx].properties[pIdx].name = raw.includes('-') ? kebabToCamel(raw) : raw;
        this._emitChange();
      });
    });

    shadow.querySelectorAll<HTMLInputElement>('[data-field="value"]').forEach((input) => {
      const kfIdx = parseInt(input.dataset.kf!, 10);
      const pIdx = parseInt(input.dataset.prop!, 10);
      input.addEventListener('change', () => {
        this._entries[kfIdx].properties[pIdx].value = input.value;
        this._emitChange();
      });
    });

    shadow.querySelectorAll<HTMLButtonElement>('[data-remove-prop]').forEach((btn) => {
      const kfIdx = parseInt(btn.dataset.kf!, 10);
      const pIdx = parseInt(btn.dataset.removeProp!, 10);
      btn.addEventListener('click', () => {
        this._entries[kfIdx].properties.splice(pIdx, 1);
        this._renderInternals();
        this._emitChange();
      });
    });

    shadow.querySelectorAll<HTMLButtonElement>('[data-add-prop]').forEach((btn) => {
      const kfIdx = parseInt(btn.dataset.addProp!, 10);
      btn.addEventListener('click', () => {
        this._entries[kfIdx].properties.push({ name: '', value: '' });
        this._renderInternals();
      });
    });

    shadow.querySelectorAll<HTMLButtonElement>('[data-remove-kf]').forEach((btn) => {
      const kfIdx = parseInt(btn.dataset.removeKf!, 10);
      btn.addEventListener('click', () => {
        if (this._entries.length <= 1) return;
        this._entries.splice(kfIdx, 1);
        this._renderInternals();
        this._emitChange();
      });
    });

    shadow.getElementById('add-keyframe')?.addEventListener('click', () => {
      this._entries.push({ properties: [{ name: '', value: '' }] });
      this._renderInternals();
      this._emitChange();
    });
  }
}

customElements.define('pg-keyframe-editor', PgKeyframeEditor);
