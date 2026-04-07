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
    this._autoSyncScrollEnabled(state);

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
        html += this._renderViewEnterParams(params, state);
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

  private _renderViewEnterParams(params: Record<string, unknown>, state: PlaygroundState): string {
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
      ${this._renderScrollPreviewControls(state)}
    `;
  }

  private _renderViewProgressParams(
    _params: Record<string, unknown>,
    state: PlaygroundState,
  ): string {
    return `
      <span class="empty">No trigger params for viewProgress.</span>
      ${this._renderScrollPreviewControls(state)}
    `;
  }

  private _renderScrollPreviewControls(state: PlaygroundState): string {
    const { scrollPreview } = state;
    const hasStickyTop = scrollPreview.stickyTop != null;
    const hasStickyBottom = scrollPreview.stickyBottom != null;
    const stickyEnabled = hasStickyTop || hasStickyBottom;

    return `
      <div class="sticky-section">
        <div class="sticky-title">Scroll Preview</div>
        <div class="field">
          <label>Stage Height (multiplier)</label>
          <input type="range" id="stage-height" min="2" max="10" step="0.5" value="${scrollPreview.stageHeight}">
        </div>
        <div class="field">
          <label>
            <input type="checkbox" id="sticky-enable" ${stickyEnabled ? 'checked' : ''}>
            Enable sticky mode
          </label>
        </div>
        <div class="field-row" ${!stickyEnabled ? 'style="display:none"' : ''} id="sticky-fields">
          <div class="field">
            <label>Sticky Top (px)</label>
            <input type="number" class="pg-input" id="sticky-top" value="${scrollPreview.stickyTop ?? ''}" placeholder="none">
          </div>
          <div class="field">
            <label>Sticky Bottom (px)</label>
            <input type="number" class="pg-input" id="sticky-bottom" value="${scrollPreview.stickyBottom ?? ''}" placeholder="none">
          </div>
        </div>
      </div>
    `;
  }

  private _renderPointerMoveParams(params: Record<string, unknown>): string {
    const hitArea = (params.hitArea as string) ?? 'self';
    const axis = (params.axis as string) || 'x';
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
      update({ axis: (e.target as HTMLSelectElement).value });
    });

    // Animation end
    shadow.getElementById('param-effectId')?.addEventListener('change', (e) => {
      update({ effectId: (e.target as HTMLSelectElement).value });
    });

    // Scroll preview controls (shown for both viewEnter and viewProgress)
    if (form === 'viewProgress' || form === 'viewEnter') {
      shadow.getElementById('stage-height')?.addEventListener('input', (e) => {
        const multiplier = parseFloat((e.target as HTMLInputElement).value);
        this.store.dispatch(setScrollPreview({ stageHeight: multiplier }));
      });

      shadow.getElementById('sticky-enable')?.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        if (checked) {
          this.store.dispatch(setScrollPreview({ stickyTop: 0 }));
        } else {
          this.store.dispatch(setScrollPreview({ stickyTop: undefined, stickyBottom: undefined }));
        }
      });

      shadow.getElementById('sticky-top')?.addEventListener('change', (e) => {
        const val = (e.target as HTMLInputElement).value;
        const top = val ? parseInt(val, 10) : undefined;
        this.store.dispatch(setScrollPreview({ stickyTop: top, stickyBottom: undefined }));
      });

      shadow.getElementById('sticky-bottom')?.addEventListener('change', (e) => {
        const val = (e.target as HTMLInputElement).value;
        const bottom = val ? parseInt(val, 10) : undefined;
        this.store.dispatch(setScrollPreview({ stickyBottom: bottom, stickyTop: undefined }));
      });
    }
  }

  private _autoSyncScrollEnabled(state: PlaygroundState): void {
    const idx = state.selectedInteractionIndex;
    if (idx == null) return;

    const interaction = state.config.interactions[idx];
    if (!interaction) return;

    const isScrollTrigger =
      interaction.trigger === 'viewProgress' || interaction.trigger === 'viewEnter';

    if (isScrollTrigger !== state.scrollPreview.enabled) {
      const preview: Parameters<typeof setScrollPreview>[0] = { enabled: isScrollTrigger };
      if (!isScrollTrigger) {
        preview.stickyTop = undefined;
        preview.stickyBottom = undefined;
      }
      this.store.dispatch(setScrollPreview(preview));
    }
  }
}

customElements.define('pg-trigger-editor', PgTriggerEditor);
