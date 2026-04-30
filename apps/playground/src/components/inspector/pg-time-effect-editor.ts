import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState, Action } from '../../types';
import type { Effect } from '@wix/interact';
import { updateEffect } from '../../store/actions';
import { hasFocusedEditableInside } from '../../utils/dom';

type NamedEffectObj = { type: string } & Record<string, unknown>;
type KeyframeEffectObj = { name: string; keyframes: Record<string, unknown>[] };
type AnimationSource = 'named' | 'keyframes';

function getNamedEffect(effect: Effect): NamedEffectObj | null {
  if ('namedEffect' in effect && effect.namedEffect) {
    return effect.namedEffect as NamedEffectObj;
  }
  return null;
}

function getKeyframeEffect(effect: Effect): KeyframeEffectObj | null {
  if ('keyframeEffect' in effect && effect.keyframeEffect) {
    return effect.keyframeEffect as KeyframeEffectObj;
  }
  return null;
}

function detectSource(effect: Effect): AnimationSource {
  if ('keyframeEffect' in effect && (effect as Record<string, unknown>).keyframeEffect) {
    return 'keyframes';
  }
  return 'named';
}

export class PgTimeEffectEditor extends BaseComponent {
  private _currentEffectId: string | null = null;

  protected onStateChange(state: PlaygroundState, action: Action): void {
    if (
      action.type === 'UPDATE_EFFECT' &&
      action.payload.id === this._currentEffectId &&
      hasFocusedEditableInside(this.shadowRoot)
    ) {
      return;
    }
    this.render(state);
  }

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

      .source-toggle {
        display: flex;
        gap: 0;
        margin-bottom: var(--pg-space-3);
        border-radius: var(--pg-radius-md);
        overflow: hidden;
        border: var(--pg-border-width) solid var(--pg-color-border);
      }

      .source-option {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 28px;
        background: var(--pg-color-bg-tertiary);
        border: none;
        color: var(--pg-color-text-secondary);
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-medium);
        cursor: pointer;
        transition: background var(--pg-transition-fast), color var(--pg-transition-fast);
      }

      .source-option:first-child {
        border-right: var(--pg-border-width) solid var(--pg-color-border);
      }

      .source-option:hover {
        background: var(--pg-color-bg-hover);
      }

      .source-option.active {
        background: var(--pg-color-accent);
        color: var(--pg-color-text-primary);
      }
    `;
  }

  protected render(state: PlaygroundState): void {
    const effectId = state.selectedEffectId;
    if (!effectId) {
      this._currentEffectId = null;
      this.shadowRoot!.innerHTML = '';
      return;
    }

    const effect = state.config.effects[effectId];
    if (!effect || !('duration' in effect)) {
      this._currentEffectId = null;
      this.shadowRoot!.innerHTML = '';
      return;
    }

    this._currentEffectId = effectId;

    const e = effect as Record<string, unknown>;
    const duration = (e.duration as number) ?? 500;
    const easing = (e.easing as string) ?? 'ease';
    const iterations = (e.iterations as number) ?? 1;
    const alternate = (e.alternate as boolean) ?? false;
    const fill = (e.fill as string) ?? 'both';
    const reversed = (e.reversed as boolean) ?? false;
    const delay = (e.delay as number) ?? 0;
    const triggerType = (e.triggerType as string) ?? 'alternate';
    const isSequenceCtx = state.selectedEffectContext?.source === 'sequence';

    const source = detectSource(effect);

    const triggerBehaviorHtml = isSequenceCtx
      ? ''
      : `<div class="field">
        <label>Trigger Behavior</label>
        <select class="pg-select" id="trigger-type">
          <option value="alternate" ${triggerType === 'alternate' ? 'selected' : ''}>Alternate</option>
          <option value="once" ${triggerType === 'once' ? 'selected' : ''}>Once</option>
          <option value="repeat" ${triggerType === 'repeat' ? 'selected' : ''}>Repeat</option>
          <option value="state" ${triggerType === 'state' ? 'selected' : ''}>State</option>
        </select>
      </div>`;

    this.shadowRoot!.innerHTML = `
      <div class="section-title">Animation Source</div>
      <div class="source-toggle">
        <button class="source-option ${source === 'named' ? 'active' : ''}" data-source="named">Named Effect</button>
        <button class="source-option ${source === 'keyframes' ? 'active' : ''}" data-source="keyframes">Keyframes</button>
      </div>

      <div id="animation-source">
        ${source === 'named' ? '<pg-named-effect-picker id="named-picker"></pg-named-effect-picker>' : '<pg-keyframe-editor id="keyframe-editor"></pg-keyframe-editor>'}
      </div>

      <div class="divider"></div>
      <div class="section-title">Timing</div>

      ${triggerBehaviorHtml}

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

    if (source === 'named') {
      const picker = this.shadowRoot!.getElementById('named-picker') as HTMLElement & {
        setPreset: (n: string, o: Record<string, unknown>) => void;
        setAllowedCategories: (c: string[] | undefined) => void;
      };
      picker?.setAllowedCategories(['Entrance', 'Ongoing']);

      const named = getNamedEffect(effect);
      if (named) {
        const { type, ...rest } = named;
        picker?.setPreset(type, rest);
      }
    } else {
      const editor = this.shadowRoot!.getElementById('keyframe-editor') as HTMLElement & {
        setKeyframeEffect: (e: KeyframeEffectObj | null) => void;
      };
      editor?.setKeyframeEffect(getKeyframeEffect(effect));
    }

    this._attachListeners(effectId, effect);
  }

  private _attachListeners(effectId: string, effect: Effect): void {
    const shadow = this.shadowRoot!;

    const update = (patch: Record<string, unknown>) => {
      this.store.dispatch(updateEffect(effectId, { ...effect, ...patch } as Effect));
    };

    shadow.querySelectorAll<HTMLButtonElement>('[data-source]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.source as AnimationSource;
        const current = detectSource(effect);
        if (target === current) return;

        const {
          namedEffect: _ne,
          keyframeEffect: _kf,
          customEffect: _ce,
          ...rest
        } = effect as Record<string, unknown>;

        if (target === 'keyframes') {
          this.store.dispatch(
            updateEffect(effectId, {
              ...rest,
              keyframeEffect: { name: 'custom', keyframes: [{ opacity: 0, offset: 0 }] },
            } as Effect),
          );
        } else {
          this.store.dispatch(
            updateEffect(effectId, {
              ...rest,
              namedEffect: { type: 'FadeIn' },
            } as Effect),
          );
        }
      });
    });

    shadow.getElementById('trigger-type')?.addEventListener('change', (e) => {
      update({ triggerType: (e.target as HTMLSelectElement).value });
    });

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

    shadow.getElementById('keyframe-editor')?.addEventListener('change', (e) => {
      const keyframeEffect = (e as CustomEvent).detail;
      if (keyframeEffect) {
        const {
          namedEffect: _ne,
          keyframeEffect: _kf,
          customEffect: _ce,
          ...rest
        } = effect as Record<string, unknown>;
        this.store.dispatch(updateEffect(effectId, { ...rest, keyframeEffect } as Effect));
      }
    });
  }
}

customElements.define('pg-time-effect-editor', PgTimeEffectEditor);
