import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';
import { updateInteraction, setScrollPreview } from '../../store/actions';

type TriggerForm = 'event' | 'viewEnter' | 'viewProgress' | 'pointerMove' | 'animationEnd';

function hasTransitionEffect(state: PlaygroundState, interactionIdx: number): boolean {
  const interaction = state.config.interactions[interactionIdx];
  if (!interaction?.effects) return false;
  const effectRefs = interaction.effects as { effectId?: string }[];
  return effectRefs.some((ref) => {
    if (!ref.effectId) return false;
    const eff = state.config.effects[ref.effectId] as Record<string, unknown> | undefined;
    if (!eff) return false;
    return eff.transitionProperties || (eff.transition && !eff.namedEffect && !eff.keyframeEffect);
  });
}

function getTriggerForm(trigger: string): TriggerForm {
  switch (trigger) {
    case 'hover':
    case 'click':
    case 'activate':
    case 'interest':
      return 'event';
    case 'viewEnter':
    case 'pageVisible':
      return 'viewEnter';
    case 'viewProgress':
      return 'viewProgress';
    case 'pointerMove':
      return 'pointerMove';
    case 'animationEnd':
      return 'animationEnd';
    default:
      return 'event';
  }
}

export class PgTriggerEditor extends BaseComponent {
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

      .field-row .field {
        flex: 1;
      }

      .sticky-section {
        margin-top: var(--pg-space-3);
        padding: var(--pg-space-3);
        background: var(--pg-color-bg-tertiary);
        border-radius: var(--pg-radius-md);
      }

      .sticky-title {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: var(--pg-space-2);
      }

      .empty {
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-sm);
        font-style: italic;
      }
    `;
  }

  protected render(state: PlaygroundState): void {
    const idx = state.selectedInteractionIndex;
    if (idx == null) {
      this.shadowRoot!.innerHTML = '';
      return;
    }

    const interaction = state.config.interactions[idx];
    if (!interaction) {
      this.shadowRoot!.innerHTML = '';
      return;
    }

    const form = getTriggerForm(interaction.trigger);
    const params = (interaction.params as Record<string, unknown>) ?? {};

    let html = '<div class="section-title">Trigger Params</div>';

    const isTransition = hasTransitionEffect(state, idx);

    switch (form) {
      case 'event':
        html += this._renderEventParams(params, isTransition);
        break;
      case 'viewEnter':
        html += this._renderViewEnterParams(params);
        break;
      case 'viewProgress':
        html += this._renderViewProgressParams(params, state);
        break;
      case 'pointerMove':
        html += this._renderPointerMoveParams(params);
        break;
      case 'animationEnd':
        html += this._renderAnimationEndParams(params, state);
        break;
    }

    this.shadowRoot!.innerHTML = html;
    this._attachListeners(form, idx, state);
  }

  private _renderEventParams(params: Record<string, unknown>, isTransition: boolean): string {
    if (isTransition) {
      const method = (params.method as string) ?? 'toggle';
      return `
        <div class="field">
          <label>Behavior</label>
          <select class="pg-select" id="param-method">
            <option value="add" ${method === 'add' ? 'selected' : ''}>Add</option>
            <option value="remove" ${method === 'remove' ? 'selected' : ''}>Remove</option>
            <option value="toggle" ${method === 'toggle' ? 'selected' : ''}>Toggle</option>
            <option value="clear" ${method === 'clear' ? 'selected' : ''}>Clear</option>
          </select>
        </div>
      `;
    }

    const type = (params.type as string) ?? 'alternate';
    return `
      <div class="field">
        <label>Behavior</label>
        <select class="pg-select" id="param-type">
          <option value="once" ${type === 'once' ? 'selected' : ''}>Once</option>
          <option value="repeat" ${type === 'repeat' ? 'selected' : ''}>Repeat</option>
          <option value="alternate" ${type === 'alternate' ? 'selected' : ''}>Alternate</option>
          <option value="state" ${type === 'state' ? 'selected' : ''}>State</option>
        </select>
      </div>
    `;
  }

  private _renderViewEnterParams(params: Record<string, unknown>): string {
    const type = (params.type as string) ?? 'once';
    const threshold = (params.threshold as number) ?? 0.2;
    const inset = (params.inset as string) ?? '';
    return `
      <div class="field">
        <label>Behavior</label>
        <select class="pg-select" id="param-type">
          <option value="once" ${type === 'once' ? 'selected' : ''}>Once</option>
          <option value="repeat" ${type === 'repeat' ? 'selected' : ''}>Repeat</option>
          <option value="alternate" ${type === 'alternate' ? 'selected' : ''}>Alternate</option>
          <option value="state" ${type === 'state' ? 'selected' : ''}>State</option>
        </select>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Threshold</label>
          <input type="range" id="param-threshold" min="0" max="1" step="0.05" value="${threshold}">
        </div>
        <div class="field" style="flex:0 0 50px">
          <label>&nbsp;</label>
          <input type="number" class="pg-input" id="param-threshold-num" min="0" max="1" step="0.05" value="${threshold}">
        </div>
      </div>
      <div class="field">
        <label>Inset</label>
        <input type="text" class="pg-input" id="param-inset" value="${inset}" placeholder="e.g. 20% 10%">
      </div>
    `;
  }

  private _renderViewProgressParams(
    _params: Record<string, unknown>,
    state: PlaygroundState,
  ): string {
    const { scrollPreview } = state;

    return `
      <span class="empty">No trigger params for viewProgress.</span>
      <div class="sticky-section">
        <div class="sticky-title">Stage Scroll Preview</div>
        <div class="field">
          <label>
            <input type="checkbox" id="scroll-enable" ${scrollPreview.enabled ? 'checked' : ''}>
            Enable scroll mode
          </label>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Sticky Top (px)</label>
            <input type="number" class="pg-input" id="sticky-top" value="${scrollPreview.stickyTop ?? ''}" placeholder="none">
          </div>
          <div class="field">
            <label>Sticky Bottom (px)</label>
            <input type="number" class="pg-input" id="sticky-bottom" value="${scrollPreview.stickyBottom ?? ''}" placeholder="none">
          </div>
        </div>
        <div class="field">
          <label>Stage Height (multiplier)</label>
          <input type="range" id="stage-height" min="2" max="10" step="0.5" value="${scrollPreview.stageHeight}">
        </div>
      </div>
    `;
  }

  private _renderPointerMoveParams(params: Record<string, unknown>): string {
    const hitArea = (params.hitArea as string) ?? 'self';
    const axis = (params.axis as string) ?? '';
    return `
      <div class="field">
        <label>Hit Area</label>
        <select class="pg-select" id="param-hitArea">
          <option value="self" ${hitArea === 'self' ? 'selected' : ''}>Self</option>
          <option value="root" ${hitArea === 'root' ? 'selected' : ''}>Root (document)</option>
        </select>
      </div>
      <div class="field">
        <label>Axis</label>
        <select class="pg-select" id="param-axis">
          <option value="" ${!axis ? 'selected' : ''}>Both</option>
          <option value="x" ${axis === 'x' ? 'selected' : ''}>X</option>
          <option value="y" ${axis === 'y' ? 'selected' : ''}>Y</option>
        </select>
      </div>
    `;
  }

  private _renderAnimationEndParams(
    params: Record<string, unknown>,
    state: PlaygroundState,
  ): string {
    const effectId = (params.effectId as string) ?? '';
    const effectIds = Object.keys(state.config.effects);
    const options = effectIds
      .map((id) => `<option value="${id}" ${id === effectId ? 'selected' : ''}>${id}</option>`)
      .join('');

    return `
      <div class="field">
        <label>After Effect</label>
        <select class="pg-select" id="param-effectId">
          <option value="">-- select effect --</option>
          ${options}
        </select>
      </div>
    `;
  }

  private _attachListeners(form: TriggerForm, idx: number, state: PlaygroundState): void {
    const shadow = this.shadowRoot!;

    const update = (params: Record<string, unknown>) => {
      const current = (state.config.interactions[idx]?.params as Record<string, unknown>) ?? {};
      this.store.dispatch(updateInteraction(idx, { params: { ...current, ...params } }));
    };

    // Event params: PointerTriggerParams (time effects)
    shadow.getElementById('param-type')?.addEventListener('change', (e) => {
      update({ type: (e.target as HTMLSelectElement).value });
    });

    // Event params: StateParams (transition effects)
    shadow.getElementById('param-method')?.addEventListener('change', (e) => {
      update({ method: (e.target as HTMLSelectElement).value });
    });

    // Threshold range + number sync
    const thresholdRange = shadow.getElementById('param-threshold') as HTMLInputElement | null;
    const thresholdNum = shadow.getElementById('param-threshold-num') as HTMLInputElement | null;
    thresholdRange?.addEventListener('input', () => {
      if (thresholdNum) thresholdNum.value = thresholdRange.value;
      update({ threshold: parseFloat(thresholdRange.value) });
    });
    thresholdNum?.addEventListener('change', () => {
      if (thresholdRange) thresholdRange.value = thresholdNum.value;
      update({ threshold: parseFloat(thresholdNum.value) });
    });

    // Inset
    shadow.getElementById('param-inset')?.addEventListener('change', (e) => {
      update({ inset: (e.target as HTMLInputElement).value || undefined });
    });

    // Pointer move
    shadow.getElementById('param-hitArea')?.addEventListener('change', (e) => {
      update({ hitArea: (e.target as HTMLSelectElement).value });
    });
    shadow.getElementById('param-axis')?.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value;
      update({ axis: val || undefined });
    });

    // Animation end
    shadow.getElementById('param-effectId')?.addEventListener('change', (e) => {
      update({ effectId: (e.target as HTMLSelectElement).value });
    });

    // Scroll preview controls
    if (form === 'viewProgress') {
      shadow.getElementById('scroll-enable')?.addEventListener('change', (e) => {
        const enabled = (e.target as HTMLInputElement).checked;
        this.store.dispatch(setScrollPreview({ enabled }));
        const stage = document.querySelector('pg-stage') as
          | (HTMLElement & { setScrollMode: (e: boolean, h?: number) => void })
          | null;
        stage?.setScrollMode(enabled, state.scrollPreview.stageHeight);
      });

      shadow.getElementById('sticky-top')?.addEventListener('change', (e) => {
        const val = (e.target as HTMLInputElement).value;
        const top = val ? parseInt(val, 10) : undefined;
        this.store.dispatch(setScrollPreview({ stickyTop: top, stickyBottom: undefined }));
        const stage = document.querySelector('pg-stage') as
          | (HTMLElement & { setStickyPosition: (t?: number, b?: number) => void })
          | null;
        stage?.setStickyPosition(top, undefined);
      });

      shadow.getElementById('sticky-bottom')?.addEventListener('change', (e) => {
        const val = (e.target as HTMLInputElement).value;
        const bottom = val ? parseInt(val, 10) : undefined;
        this.store.dispatch(setScrollPreview({ stickyBottom: bottom, stickyTop: undefined }));
        const stage = document.querySelector('pg-stage') as
          | (HTMLElement & { setStickyPosition: (t?: number, b?: number) => void })
          | null;
        stage?.setStickyPosition(undefined, bottom);
      });

      shadow.getElementById('stage-height')?.addEventListener('input', (e) => {
        const multiplier = parseFloat((e.target as HTMLInputElement).value);
        this.store.dispatch(setScrollPreview({ stageHeight: multiplier }));
        const stage = document.querySelector('pg-stage') as
          | (HTMLElement & { setScrollMode: (e: boolean, h?: number) => void })
          | null;
        if (state.scrollPreview.enabled) {
          stage?.setScrollMode(true, multiplier);
        }
      });
    }
  }

  protected onStateChange(state: PlaygroundState): void {
    // Check if we need to auto-enable/disable scroll mode based on trigger
    const idx = state.selectedInteractionIndex;
    if (idx != null) {
      const interaction = state.config.interactions[idx];
      const isScroll = interaction?.trigger === 'viewProgress';
      const stage = document.querySelector('pg-stage') as
        | (HTMLElement & { setScrollMode: (e: boolean, h?: number) => void })
        | null;
      if (!isScroll && state.scrollPreview.enabled) {
        this.store.dispatch(setScrollPreview({ enabled: false }));
        stage?.setScrollMode(false);
      }
    }

    this.render(state);
  }
}

customElements.define('pg-trigger-editor', PgTriggerEditor);
