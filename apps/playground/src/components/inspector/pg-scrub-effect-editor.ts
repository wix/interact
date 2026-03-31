import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';
import type { Effect } from '@wix/interact';
import { updateEffect } from '../../store/actions';

type NamedEffectObj = { type: string } & Record<string, unknown>;

const RANGE_NAMES = ['entry', 'exit', 'contain', 'cover', 'entry-crossing', 'exit-crossing'];

function getNamedEffect(effect: Effect): NamedEffectObj | null {
  if ('namedEffect' in effect && effect.namedEffect) {
    return effect.namedEffect as NamedEffectObj;
  }
  return null;
}

export class PgScrubEffectEditor extends BaseComponent {
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
        min-width: 0;
      }

      .field-row > .field {
        flex: 1;
        min-width: 0;
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

      .range-section {
        padding: var(--pg-space-2);
        background: var(--pg-color-bg-tertiary);
        border-radius: var(--pg-radius-md);
        margin-bottom: var(--pg-space-3);
        overflow: hidden;
      }

      .range-label {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-color-text-secondary);
        margin-bottom: var(--pg-space-2);
      }

      .transition-section {
        padding: var(--pg-space-2);
        background: var(--pg-color-bg-tertiary);
        border-radius: var(--pg-radius-md);
        overflow: hidden;
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

    const e = effect as Record<string, unknown>;
    const easing = (e.easing as string) ?? '';
    const iterations = (e.iterations as number) ?? 1;
    const alternate = (e.alternate as boolean) ?? false;
    const fill = (e.fill as string) ?? 'both';
    const reversed = (e.reversed as boolean) ?? false;

    const rangeStart = (e.rangeStart as { name?: string; offset?: string }) ?? {};
    const rangeEnd = (e.rangeEnd as { name?: string; offset?: string }) ?? {};

    const transitionDuration = (e.transitionDuration as number) ?? 0;
    const transitionDelay = (e.transitionDelay as number) ?? 0;
    const transitionEasing = (e.transitionEasing as string) ?? '';
    const centeredToTarget = (e.centeredToTarget as boolean) ?? false;

    const named = getNamedEffect(effect);

    const interactionIdx = state.selectedInteractionIndex;
    const trigger =
      interactionIdx != null
        ? (state.config.interactions[interactionIdx]?.trigger ?? 'hover')
        : 'hover';
    const isPointerMove = trigger === 'pointerMove';

    const rangeNameOptions = (selected: string) =>
      RANGE_NAMES.map(
        (n) => `<option value="${n}" ${n === selected ? 'selected' : ''}>${n}</option>`,
      ).join('');

    this.shadowRoot!.innerHTML = `
      <div class="section-title">Animation</div>
      <pg-named-effect-picker id="named-picker"></pg-named-effect-picker>

      <div class="divider"></div>
      <div class="section-title">Scrub Options</div>

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

      ${
        !isPointerMove
          ? `
      <div class="divider"></div>
      <div class="section-title">Range</div>

      <div class="range-section">
        <div class="range-label">Range Start</div>
        <div class="field-row">
          <div class="field">
            <label>Name</label>
            <select class="pg-select" id="range-start-name">
              <option value="">default</option>
              ${rangeNameOptions(rangeStart.name ?? '')}
            </select>
          </div>
          <div class="field">
            <label>Offset</label>
            <input type="text" class="pg-input" id="range-start-offset"
              value="${rangeStart.offset ?? ''}" placeholder="e.g. 20%">
          </div>
        </div>
      </div>

      <div class="range-section" style="margin-top: var(--pg-space-2)">
        <div class="range-label">Range End</div>
        <div class="field-row">
          <div class="field">
            <label>Name</label>
            <select class="pg-select" id="range-end-name">
              <option value="">default</option>
              ${rangeNameOptions(rangeEnd.name ?? '')}
            </select>
          </div>
          <div class="field">
            <label>Offset</label>
            <input type="text" class="pg-input" id="range-end-offset"
              value="${rangeEnd.offset ?? ''}" placeholder="e.g. 80%">
          </div>
        </div>
      </div>
      `
          : ''
      }

      ${
        isPointerMove
          ? `
      <div class="divider"></div>
      <div class="section-title">Transition</div>

      <div class="transition-section">
        <div class="field-row">
          <div class="field">
            <label>Duration (ms)</label>
            <input type="number" class="pg-input" id="trans-duration" min="0" max="10000" step="50" value="${transitionDuration}">
          </div>
          <div class="field">
            <label>Delay (ms)</label>
            <input type="number" class="pg-input" id="trans-delay" min="0" max="10000" step="50" value="${transitionDelay}">
          </div>
        </div>
        <div class="field">
          <label>Easing</label>
          <select class="pg-select" id="trans-easing">
            <option value="" ${!transitionEasing ? 'selected' : ''}>None</option>
            <option value="linear" ${transitionEasing === 'linear' ? 'selected' : ''}>Linear</option>
            <option value="hardBackOut" ${transitionEasing === 'hardBackOut' ? 'selected' : ''}>Hard Back Out</option>
            <option value="easeOut" ${transitionEasing === 'easeOut' ? 'selected' : ''}>Ease Out</option>
            <option value="elastic" ${transitionEasing === 'elastic' ? 'selected' : ''}>Elastic</option>
            <option value="bounce" ${transitionEasing === 'bounce' ? 'selected' : ''}>Bounce</option>
          </select>
        </div>
        <div class="toggle-row">
          <input type="checkbox" id="centered" ${centeredToTarget ? 'checked' : ''}>
          <label for="centered">Centered to Target</label>
        </div>
      </div>
      `
          : ''
      }
    `;

    const picker = this.shadowRoot!.getElementById('named-picker') as HTMLElement & {
      setPreset: (n: string, o: Record<string, unknown>) => void;
      setAllowedCategories: (c: string[] | undefined) => void;
    };

    const allowedCategories = isPointerMove ? ['Mouse'] : ['Scroll'];
    picker?.setAllowedCategories(allowedCategories);

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

    const updateRange = (
      which: 'rangeStart' | 'rangeEnd',
      field: 'name' | 'offset',
      value: string,
    ) => {
      const current = ((effect as Record<string, unknown>)[which] as Record<string, unknown>) ?? {};
      const updated = { ...current, [field]: value || undefined };
      if (!updated.name && !updated.offset) {
        const { [which]: _removed, ...rest } = effect as Record<string, unknown>;
        void _removed;
        this.store.dispatch(updateEffect(effectId, rest as Effect));
      } else {
        update({ [which]: updated });
      }
    };

    shadow.getElementById('range-start-name')?.addEventListener('change', (e) => {
      updateRange('rangeStart', 'name', (e.target as HTMLSelectElement).value);
    });
    shadow.getElementById('range-start-offset')?.addEventListener('change', (e) => {
      updateRange('rangeStart', 'offset', (e.target as HTMLInputElement).value);
    });
    shadow.getElementById('range-end-name')?.addEventListener('change', (e) => {
      updateRange('rangeEnd', 'name', (e.target as HTMLSelectElement).value);
    });
    shadow.getElementById('range-end-offset')?.addEventListener('change', (e) => {
      updateRange('rangeEnd', 'offset', (e.target as HTMLInputElement).value);
    });

    shadow.getElementById('trans-duration')?.addEventListener('change', (e) => {
      update({ transitionDuration: parseInt((e.target as HTMLInputElement).value, 10) || 0 });
    });
    shadow.getElementById('trans-delay')?.addEventListener('change', (e) => {
      update({ transitionDelay: parseInt((e.target as HTMLInputElement).value, 10) || 0 });
    });
    shadow.getElementById('trans-easing')?.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value;
      update({ transitionEasing: val || undefined });
    });
    shadow.getElementById('centered')?.addEventListener('change', (e) => {
      update({ centeredToTarget: (e.target as HTMLInputElement).checked });
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

customElements.define('pg-scrub-effect-editor', PgScrubEffectEditor);
