import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState, Action } from '../../types';
import type { Effect, TriggerType, SequenceConfig } from '@wix/interact';
import {
  addEffect,
  removeEffect,
  selectEffect,
  updateEffect,
  updateInteraction,
  updateSequence,
} from '../../store/actions';
import { generateId } from '../../utils/id';
import { hasFocusedEditableInside } from '../../utils/dom';
import { getComponent } from '../../library';
import type { ComponentKey } from '../../library/types';

type EffectType = 'time' | 'scrub' | 'transition';

const ALLOWED_EFFECT_TYPES: Record<string, EffectType[]> = {
  hover: ['time', 'transition'],
  click: ['time', 'transition'],
  activate: ['time', 'transition'],
  interest: ['time', 'transition'],
  viewProgress: ['scrub'],
  pointerMove: ['scrub'],
  viewEnter: ['time'],
  animationEnd: ['time'],
};

const DEFAULT_EFFECT_TYPE: Record<string, EffectType> = {
  hover: 'time',
  click: 'time',
  activate: 'time',
  interest: 'time',
  viewProgress: 'scrub',
  pointerMove: 'scrub',
  viewEnter: 'time',
  animationEnd: 'time',
};

function getAllowedEffectTypes(trigger: TriggerType | string): EffectType[] {
  return ALLOWED_EFFECT_TYPES[trigger] ?? ['time', 'scrub', 'transition'];
}

function getDefaultEffectType(trigger: TriggerType | string): EffectType {
  return DEFAULT_EFFECT_TYPE[trigger] ?? 'time';
}

function detectEffectType(effect: Effect): EffectType {
  const e = effect as Record<string, unknown>;
  if (e.transitionProperties || (e.transition && !e.namedEffect && !e.keyframeEffect)) {
    return 'transition';
  }
  if (typeof e.duration === 'number') {
    return 'time';
  }
  return 'scrub';
}

function createDefaultEffect(type: EffectType): Effect {
  switch (type) {
    case 'time':
      return {
        duration: 500,
        easing: 'ease',
        fill: 'both',
        triggerType: 'alternate',
        namedEffect: { type: 'FadeIn' },
      } as Effect;
    case 'scrub':
      return {
        easing: 'ease',
        fill: 'both',
        namedEffect: { type: 'FadeScroll' },
      } as Effect;
    case 'transition':
      return {
        stateAction: 'toggle',
        transitionProperties: [
          { name: 'transform', value: 'scale(1.05)', duration: 300, delay: 0, easing: 'ease' },
        ],
      } as Effect;
  }
}

export class PgEffectEditor extends BaseComponent {
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

      .section-title {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: var(--pg-space-2);
      }

      .effect-list {
        margin-bottom: var(--pg-space-2);
      }

      .effect-item {
        display: flex;
        align-items: center;
        gap: var(--pg-space-2);
        padding: var(--pg-space-1) var(--pg-space-2);
        border-radius: var(--pg-radius-sm);
        cursor: pointer;
        font-size: var(--pg-font-size-sm);
        color: var(--pg-color-text-secondary);
        transition: background var(--pg-transition-fast);
      }

      .effect-item:hover {
        background: var(--pg-color-bg-hover);
      }

      .effect-item.selected {
        background: var(--pg-color-accent-muted);
        color: var(--pg-color-text-primary);
      }

      .effect-badge {
        font-size: var(--pg-font-size-xs);
        padding: 1px 6px;
        border-radius: var(--pg-radius-sm);
        background: var(--pg-color-bg-surface);
        color: var(--pg-color-text-muted);
        font-weight: var(--pg-font-weight-medium);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        flex-shrink: 0;
      }

      .effect-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .remove-effect {
        background: none;
        border: none;
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-md);
        cursor: pointer;
        padding: 0 var(--pg-space-1);
        flex-shrink: 0;
        opacity: 0;
        transition: opacity var(--pg-transition-fast);
      }

      .effect-item:hover .remove-effect {
        opacity: 1;
      }

      .remove-effect:hover {
        color: var(--pg-color-danger);
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
        margin-bottom: var(--pg-space-3);
      }

      .add-btn:hover {
        border-color: var(--pg-color-accent);
        color: var(--pg-color-accent);
      }

      .divider {
        height: var(--pg-border-width);
        background: var(--pg-color-border);
        margin: var(--pg-space-3) 0;
      }

      .tabs {
        display: flex;
        gap: 0;
        margin-bottom: var(--pg-space-3);
        border-radius: var(--pg-radius-md);
        overflow: hidden;
        border: var(--pg-border-width) solid var(--pg-color-border);
      }

      .tab {
        flex: 1;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--pg-color-bg-tertiary);
        border: none;
        color: var(--pg-color-text-secondary);
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-medium);
        cursor: pointer;
        transition: background var(--pg-transition-fast), color var(--pg-transition-fast);
        border-right: var(--pg-border-width) solid var(--pg-color-border);
      }

      .tab:last-child {
        border-right: none;
      }

      .tab:hover {
        background: var(--pg-color-bg-hover);
      }

      .tab.active {
        background: var(--pg-color-accent);
        color: var(--pg-color-text-primary);
      }

      .empty {
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-sm);
        font-style: italic;
        text-align: center;
        padding: var(--pg-space-3) 0;
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
    `;
  }

  private _resolveInlineRef(
    state: PlaygroundState,
    interaction: { effects?: unknown[]; sequences?: unknown[] },
  ): Record<string, unknown> | undefined {
    const selectedEffectId = state.selectedEffectId;
    if (!selectedEffectId) return undefined;

    const ctx = state.selectedEffectContext;
    if (ctx?.source === 'sequence') {
      const seq = (state.config.sequences ?? {})[ctx.sequenceId];
      if (!seq) return undefined;
      const ref = seq.effects[ctx.effectIndex] as { effectId?: string } | undefined;
      if (ref?.effectId === selectedEffectId) return ref as Record<string, unknown>;
      return undefined;
    }

    const effectRefs = (interaction.effects ?? []) as { effectId?: string }[];
    return effectRefs.find((r) => r.effectId === selectedEffectId) as
      | Record<string, unknown>
      | undefined;
  }

  protected render(state: PlaygroundState): void {
    const idx = state.selectedInteractionIndex;
    if (idx == null) {
      this._currentEffectId = null;
      this.shadowRoot!.innerHTML = '';
      return;
    }

    const interaction = state.config.interactions[idx];
    if (!interaction) {
      this._currentEffectId = null;
      this.shadowRoot!.innerHTML = '';
      return;
    }

    this._currentEffectId = state.selectedEffectId;

    const trigger = interaction.trigger ?? 'hover';
    const allowed = getAllowedEffectTypes(trigger);

    const effectRefs = (interaction.effects ?? []) as { effectId?: string }[];
    const selectedEffectId = state.selectedEffectId;
    const selectedEffect = selectedEffectId ? state.config.effects[selectedEffectId] : null;
    const ctx = state.selectedEffectContext;
    const isInteractionCtx = !ctx || ctx.source === 'interaction';
    let effectType = selectedEffect ? detectEffectType(selectedEffect) : null;

    if (effectType && !allowed.includes(effectType)) {
      effectType = allowed[0];
    }

    const effectItems = effectRefs
      .map((ref) => {
        const eid = ref.effectId;
        if (!eid) return '';
        const eff = state.config.effects[eid];
        if (!eff) return '';
        const type = detectEffectType(eff);
        const label = this._getEffectLabel(eff, type);
        const selected = eid === selectedEffectId && isInteractionCtx;
        return `
        <div class="effect-item ${selected ? 'selected' : ''}" data-effect-id="${eid}">
          <span class="effect-badge">${type}</span>
          <span class="effect-name">${label}</span>
          <button class="remove-effect" data-remove-id="${eid}">&times;</button>
        </div>
      `;
      })
      .join('');

    const component = getComponent(state.activeComponentId);
    const keys: ComponentKey[] = component?.keys ?? [];

    const selectedInlineRef = this._resolveInlineRef(state, interaction);

    let editorHtml = '';
    if (selectedEffect && effectType) {
      const isSequenceCtx = ctx?.source === 'sequence';
      const tabsHtml =
        allowed.length > 1 && !isSequenceCtx
          ? `<div class="tabs">
            ${allowed
              .map(
                (t) =>
                  `<button class="tab ${effectType === t ? 'active' : ''}" data-tab="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`,
              )
              .join('')}
          </div>`
          : '';

      const inlineKey = selectedInlineRef?.key as string | undefined;
      const inlineListContainer = selectedInlineRef?.listContainer as string | undefined;

      const targetKeyOptions = keys
        .map((k) => {
          let isSelected: boolean;
          if (k.isList && k.parentKey) {
            isSelected = inlineKey === k.parentKey && inlineListContainer === k.listContainer;
          } else {
            isSelected = k.key === inlineKey && !inlineListContainer;
          }
          return `<option value="${k.key}" ${isSelected ? 'selected' : ''}>${k.label}</option>`;
        })
        .join('');

      const targetFieldHtml = `
        <div class="field">
          <label>Target Element</label>
          <select class="pg-select" id="target-key-select">
            <option value="" ${!inlineKey ? 'selected' : ''}>Same as source</option>
            ${targetKeyOptions}
          </select>
        </div>
      `;

      editorHtml = `
        <div class="divider"></div>
        ${targetFieldHtml}
        ${tabsHtml}
        <div id="sub-editor">
          ${effectType === 'time' ? '<pg-time-effect-editor></pg-time-effect-editor>' : ''}
          ${effectType === 'scrub' ? '<pg-scrub-effect-editor></pg-scrub-effect-editor>' : ''}
          ${effectType === 'transition' ? '<pg-transition-effect-editor></pg-transition-effect-editor>' : ''}
        </div>
      `;
    }

    this.shadowRoot!.innerHTML = `
      <div class="section-title">Effects</div>
      <div class="effect-list">
        ${effectItems || '<div class="empty">No effects</div>'}
      </div>
      <button class="add-btn" id="add-effect">+ Add Effect</button>
      ${editorHtml}
    `;

    this._attachListeners(state, idx);
  }

  private _getEffectLabel(effect: Effect, type: EffectType): string {
    const e = effect as Record<string, unknown>;
    if (e.namedEffect) {
      return ((e.namedEffect as Record<string, unknown>).type as string) ?? type;
    }
    if (e.keyframeEffect) {
      return ((e.keyframeEffect as Record<string, unknown>).name as string) ?? 'keyframes';
    }
    if (type === 'transition') {
      const props = e.transitionProperties as { name: string }[] | undefined;
      if (props && props.length > 0) {
        return (
          props
            .map((p) => p.name)
            .filter(Boolean)
            .join(', ') || 'transition'
        );
      }
    }
    return type;
  }

  private _applyTargetToRef(
    ref: Record<string, unknown>,
    selectedKey: string,
    componentKeys: ComponentKey[],
  ): Record<string, unknown> {
    const updated = { ...ref };
    if (selectedKey) {
      const keyDef = componentKeys.find((k) => k.key === selectedKey);
      if (keyDef?.isList && keyDef.parentKey) {
        updated.key = keyDef.parentKey;
        updated.listContainer = keyDef.listContainer;
        updated.listItemSelector = keyDef.listItemSelector;
      } else {
        updated.key = selectedKey;
        delete updated.listContainer;
        delete updated.listItemSelector;
      }
    } else {
      delete updated.key;
      delete updated.listContainer;
      delete updated.listItemSelector;
    }
    delete updated.selector;
    return updated;
  }

  private _attachListeners(state: PlaygroundState, interactionIdx: number): void {
    const shadow = this.shadowRoot!;
    const interaction = state.config.interactions[interactionIdx];
    const component = getComponent(state.activeComponentId);
    const componentKeys: ComponentKey[] = component?.keys ?? [];

    const trigger = interaction.trigger ?? 'hover';
    const ctx = state.selectedEffectContext;

    const targetKeySelect = shadow.getElementById('target-key-select') as HTMLSelectElement | null;
    if (targetKeySelect && state.selectedEffectId) {
      const effectId = state.selectedEffectId;
      targetKeySelect.addEventListener('change', () => {
        const selectedKey = targetKeySelect.value;

        if (ctx?.source === 'sequence') {
          const seq = (state.config.sequences ?? {})[ctx.sequenceId];
          if (!seq) return;
          const updatedEffects = seq.effects.map((ref, i) => {
            if (i !== ctx.effectIndex) return ref;
            return this._applyTargetToRef(
              ref as Record<string, unknown>,
              selectedKey,
              componentKeys,
            );
          });
          this.store.dispatch(
            updateSequence(ctx.sequenceId, {
              ...seq,
              effects: updatedEffects as SequenceConfig['effects'],
            }),
          );
        } else {
          const currentEffects = (interaction.effects ?? []) as Record<string, unknown>[];
          const updatedEffects = currentEffects.map((ref) => {
            if (ref.effectId !== effectId) return ref;
            return this._applyTargetToRef(ref, selectedKey, componentKeys);
          });
          this.store.dispatch(
            updateInteraction(interactionIdx, { effects: updatedEffects } as never),
          );
        }
      });
    }

    shadow.getElementById('add-effect')?.addEventListener('click', () => {
      const effectId = generateId('effect');
      const defaultType = getDefaultEffectType(trigger);
      const effect = createDefaultEffect(defaultType);
      const currentEffects = interaction.effects ?? [];

      this.store.dispatch(addEffect(effectId, effect));
      this.store.dispatch(
        updateInteraction(interactionIdx, {
          effects: [...currentEffects, { effectId }],
        }),
      );
    });

    shadow.querySelectorAll('.effect-item').forEach((item) => {
      const eid = (item as HTMLElement).dataset.effectId!;

      item.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).classList.contains('remove-effect')) return;
        this.store.dispatch(selectEffect(eid, { source: 'interaction' }));
      });
    });

    shadow.querySelectorAll('.remove-effect').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eid = (btn as HTMLElement).dataset.removeId!;
        const currentEffects = (interaction.effects ?? []) as { effectId?: string }[];
        this.store.dispatch(removeEffect(eid));
        this.store.dispatch(
          updateInteraction(interactionIdx, {
            effects: currentEffects.filter((ref) => ref.effectId !== eid),
          }),
        );
      });
    });

    const allowed = getAllowedEffectTypes(trigger);
    shadow.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetType = (tab as HTMLElement).dataset.tab as EffectType;
        if (!allowed.includes(targetType)) return;
        const selectedId = state.selectedEffectId;
        if (!selectedId) return;

        const currentEffect = state.config.effects[selectedId];
        const newEffect = createDefaultEffect(targetType);
        if (currentEffect) {
          const base: Record<string, unknown> = {};
          if (currentEffect.conditions) base.conditions = currentEffect.conditions;
          this.store.dispatch(updateEffect(selectedId, { ...newEffect, ...base } as Effect));
        }
      });
    });
  }
}

customElements.define('pg-effect-editor', PgEffectEditor);
