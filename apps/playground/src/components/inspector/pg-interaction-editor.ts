import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';
import type { Effect, TriggerType } from '@wix/interact';
import { updateEffect, updateInteraction } from '../../store/actions';
import { getComponent } from '../../library';

type EffectType = 'time' | 'scrub' | 'transition';

const ALLOWED_EFFECT_TYPES: Record<string, EffectType[]> = {
  hover: ['time', 'transition'],
  click: ['time', 'transition'],
  activate: ['time', 'transition'],
  interest: ['time', 'transition'],
  viewProgress: ['scrub'],
  pointerMove: ['scrub'],
  viewEnter: ['time'],
};

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
      return { duration: 500, easing: 'ease', fill: 'both', namedEffect: { type: 'FadeIn' } } as Effect;
    case 'scrub':
      return { easing: 'ease', fill: 'both', namedEffect: { type: 'FadeScroll' } } as Effect;
    case 'transition':
      return { transitionProperties: [{ name: 'transform', value: 'scale(1.05)' }] } as Effect;
  }
}

function getAllowedEffectTypes(trigger: string): EffectType[] {
  return ALLOWED_EFFECT_TYPES[trigger] ?? ['time', 'scrub', 'transition'];
}

const TRIGGER_TYPES: { value: TriggerType; label: string }[] = [
  { value: 'hover', label: 'Hover' },
  { value: 'click', label: 'Click' },
  { value: 'viewEnter', label: 'View Enter' },
  { value: 'viewProgress', label: 'View Progress (Scroll)' },
  { value: 'pointerMove', label: 'Pointer Move' },
  { value: 'activate', label: 'Activate (a11y click)' },
  { value: 'interest', label: 'Interest (a11y hover)' },
  { value: 'pageVisible', label: 'Page Visible' },
  { value: 'animationEnd', label: 'Animation End' },
];

export class PgInteractionEditor extends BaseComponent {
  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: block;
      }

      .section {
        margin-bottom: var(--pg-space-4);
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

      .divider {
        height: var(--pg-border-width);
        background: var(--pg-color-border);
        margin: var(--pg-space-3) 0;
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

    const component = getComponent(state.activeComponentId);
    const keys = component?.keys ?? [];

    const interactionRecord = interaction as Record<string, unknown>;
    const keyOptions = keys.map((k) => {
      let isSelected: boolean;
      if (k.isList && k.parentKey) {
        isSelected = interaction.key === k.parentKey
          && interactionRecord.listContainer === k.listContainer;
      } else {
        isSelected = k.key === interaction.key && !interactionRecord.listContainer;
      }
      return `<option value="${k.key}" ${isSelected ? 'selected' : ''}>${k.label}</option>`;
    }).join('');

    const triggerOptions = TRIGGER_TYPES.map((t) =>
      `<option value="${t.value}" ${t.value === interaction.trigger ? 'selected' : ''}>${t.label}</option>`,
    ).join('');

    this.shadowRoot!.innerHTML = `
      <div class="section">
        <div class="section-title">Interaction</div>

        <div class="field">
          <label>Source Element</label>
          <select class="pg-select" id="key-select">
            <option value="">-- select element --</option>
            ${keyOptions}
          </select>
        </div>

        <div class="field">
          <label>Trigger</label>
          <select class="pg-select" id="trigger-select">
            ${triggerOptions}
          </select>
        </div>
      </div>

      <div class="divider"></div>

      <pg-trigger-editor></pg-trigger-editor>

      <div class="divider"></div>

      <slot></slot>
    `;

    const keySelect = this.shadowRoot!.getElementById('key-select') as HTMLSelectElement;
    const triggerSelect = this.shadowRoot!.getElementById('trigger-select') as HTMLSelectElement;

    keySelect.addEventListener('change', () => {
      const selectedKey = keySelect.value;
      const keyDef = keys.find((k) => k.key === selectedKey);
      const data: Record<string, unknown> = {};
      if (keyDef?.isList && keyDef.parentKey) {
        data.key = keyDef.parentKey;
        data.listContainer = keyDef.listContainer;
        data.listItemSelector = keyDef.listItemSelector;
      } else {
        data.key = selectedKey;
        data.listContainer = undefined;
        data.listItemSelector = undefined;
      }
      this.store.dispatch(updateInteraction(idx, data));
    });

    triggerSelect.addEventListener('change', () => {
      const newTrigger = triggerSelect.value as TriggerType;
      this.store.dispatch(updateInteraction(idx, {
        trigger: newTrigger,
        params: undefined,
      }));

      const allowed = getAllowedEffectTypes(newTrigger);
      const effectRefs = (interaction.effects ?? []) as { effectId?: string }[];
      for (const ref of effectRefs) {
        if (!ref.effectId) continue;
        const eff = state.config.effects[ref.effectId];
        if (!eff) continue;
        const currentType = detectEffectType(eff);
        if (!allowed.includes(currentType)) {
          const newEffect = createDefaultEffect(allowed[0]);
          const base: Record<string, unknown> = {};
          if (eff.conditions) base.conditions = eff.conditions;
          this.store.dispatch(updateEffect(ref.effectId, { ...newEffect, ...base } as Effect));
        }
      }
    });
  }
}

customElements.define('pg-interaction-editor', PgInteractionEditor);
