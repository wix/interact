import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';
import type { Effect } from '@wix/interact';
import { updateEffect } from '../../store/actions';

type NamedEffectObj = { type: string } & Record<string, unknown>;

function getNamedEffect(effect: Effect): NamedEffectObj | null {
  if ('namedEffect' in effect && effect.namedEffect) {
    return effect.namedEffect as NamedEffectObj;
  }
  return null;
}

export class PgTimeEffectEditor extends BaseComponent {
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

      .field-row {
        display: flex;
        gap: var(--pg-space-2);
      }

      .field-row > .field {
        flex: 1;
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

      .divider {
        height: var(--pg-border-width);
        background: var(--pg-color-border);
        margin: var(--pg-space-3) 0;
      }

      .toggle-row {
        display: flex;
        align-items: center;
        gap: var(--pg-space-2);
        margin-bottom: var(--pg-space-2);
      }

      .toggle-row label {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-medium);
        color: var(--pg-color-text-secondary);
        cursor: pointer;
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
    if (!effect || !('duration' in effect)) {
      this.shadowRoot!.innerHTML = '';
      return;
    }

    const duration = ((effect as Record<string, unknown>).duration as number) ?? 500;
    const easing = ((effect as Record<string, unknown>).easing as string) ?? 'ease';
    const iterations = ((effect as Record<string, unknown>).iterations as number) ?? 1;
    const alternate = ((effect as Record<string, unknown>).alternate as boolean) ?? false;
    const fill = ((effect as Record<string, unknown>).fill as string) ?? 'both';
    const reversed = ((effect as Record<string, unknown>).reversed as boolean) ?? false;
    const delay = ((effect as Record<string, unknown>).delay as number) ?? 0;

    const named = getNamedEffect(effect);

    this.shadowRoot!.innerHTML = `
      <div class="section-title">Animation</div>
      <pg-named-effect-picker id="named-picker"></pg-named-effect-picker>

      <div class="divider"></div>
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

      <div class="field-row">
        <div class="field">
          <label>Iterations</label>
          <input type="number" class="pg-input" id="iterations" min="1" max="100" step="1" value="${iterations}">
        </div>
        <div class="field">
          <label>Fill</label>
          <select class="pg-select" id="fill">
            <option value="none" ${fill === 'none' ? 'selected' : ''}>None</option>
            <option value="forwards" ${fill === 'forwards' ? 'selected' : ''}>Forwards</option>
            <option value="backwards" ${fill === 'backwards' ? 'selected' : ''}>Backwards</option>
            <option value="both" ${fill === 'both' ? 'selected' : ''}>Both</option>
          </select>
        </div>
      </div>

      <div class="toggle-row">
        <input type="checkbox" id="alternate" ${alternate ? 'checked' : ''}>
        <label for="alternate">Alternate</label>
      </div>
      <div class="toggle-row">
        <input type="checkbox" id="reversed" ${reversed ? 'checked' : ''}>
        <label for="reversed">Reversed</label>
      </div>
    `;

    const picker = this.shadowRoot!.getElementById('named-picker') as HTMLElement & {
      setPreset: (n: string, o: Record<string, unknown>) => void;
      setAllowedCategories: (c: string[] | undefined) => void;
    };
    picker?.setAllowedCategories(['Entrance', 'Ongoing']);

    if (named) {
      const { type, ...rest } = named;
      picker?.setPreset(type, rest);
    }

    this._attachListeners(effectId, effect);
  }

  private _attachListeners(effectId: string, effect: Effect): void {
    const shadow = this.shadowRoot!;

    const update = (patch: Record<string, unknown>) => {
      this.store.dispatch(updateEffect(effectId, { ...effect, ...patch } as Effect));
    };

    shadow.getElementById('duration')?.addEventListener('change', (e) => {
      update({ duration: parseInt((e.target as HTMLInputElement).value, 10) || 0 });
    });

    shadow.getElementById('delay')?.addEventListener('change', (e) => {
      update({ delay: parseInt((e.target as HTMLInputElement).value, 10) || 0 });
    });

    shadow.getElementById('easing-picker')?.addEventListener('change', (e) => {
      update({ easing: (e as CustomEvent).detail });
    });

    shadow.getElementById('iterations')?.addEventListener('change', (e) => {
      update({ iterations: parseInt((e.target as HTMLInputElement).value, 10) || 1 });
    });

    shadow.getElementById('fill')?.addEventListener('change', (e) => {
      update({ fill: (e.target as HTMLSelectElement).value });
    });

    shadow.getElementById('alternate')?.addEventListener('change', (e) => {
      update({ alternate: (e.target as HTMLInputElement).checked });
    });

    shadow.getElementById('reversed')?.addEventListener('change', (e) => {
      update({ reversed: (e.target as HTMLInputElement).checked });
    });

    shadow.getElementById('named-picker')?.addEventListener('change', (e) => {
      const namedEffect = (e as CustomEvent).detail;
      if (namedEffect) {
        const {
          keyframeEffect: _kf,
          customEffect: _ce,
          namedEffect: _ne,
          ...rest
        } = effect as Record<string, unknown>;
        this.store.dispatch(updateEffect(effectId, { ...rest, namedEffect } as Effect));
      } else {
        const {
          namedEffect: _ne,
          keyframeEffect: _kf,
          customEffect: _ce,
          ...rest
        } = effect as Record<string, unknown>;
        this.store.dispatch(updateEffect(effectId, rest as Effect));
      }
    });
  }
}

customElements.define('pg-time-effect-editor', PgTimeEffectEditor);
