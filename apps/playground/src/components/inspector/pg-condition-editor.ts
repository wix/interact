import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';
import type { Condition } from '@wix/interact';
import {
  addCondition,
  updateCondition,
  removeCondition,
  updateInteraction,
  updateEffect,
} from '../../store/actions';
import { generateId } from '../../utils/id';

const CONDITION_TYPES: { value: Condition['type']; label: string }[] = [
  { value: 'media', label: 'Media Query' },
  { value: 'container', label: 'Container' },
  { value: 'selector', label: 'Selector' },
];

const PREDICATE_PLACEHOLDERS: Record<string, string> = {
  media: '(min-width: 768px)',
  container: '(min-width: 400px)',
  selector: ':nth-of-type(odd)',
};

export class PgConditionEditor extends BaseComponent {
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

      .divider {
        height: var(--pg-border-width);
        background: var(--pg-color-border);
        margin: var(--pg-space-3) 0;
      }

      .condition-item {
        padding: var(--pg-space-2);
        background: var(--pg-color-bg-tertiary);
        border-radius: var(--pg-radius-md);
        margin-bottom: var(--pg-space-2);
      }

      .condition-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--pg-space-2);
      }

      .condition-id {
        font-size: var(--pg-font-size-xs);
        font-family: var(--pg-font-mono);
        color: var(--pg-color-accent);
        font-weight: var(--pg-font-weight-medium);
      }

      .remove-btn {
        background: none;
        border: none;
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-md);
        cursor: pointer;
        padding: 0 var(--pg-space-1);
        line-height: 1;
      }

      .remove-btn:hover {
        color: var(--pg-color-danger);
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: var(--pg-space-1);
        margin-bottom: var(--pg-space-2);
      }

      .field:last-child {
        margin-bottom: 0;
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

      .assign-title {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: var(--pg-space-2);
        margin-top: var(--pg-space-2);
      }

      .assign-row {
        display: flex;
        align-items: center;
        gap: var(--pg-space-2);
        padding: var(--pg-space-1) 0;
      }

      .assign-row input[type="checkbox"] {
        accent-color: var(--pg-color-accent);
      }

      .assign-row label {
        font-size: var(--pg-font-size-sm);
        color: var(--pg-color-text-secondary);
        cursor: pointer;
      }

      .assign-target {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-medium);
        color: var(--pg-color-text-muted);
        margin-top: var(--pg-space-2);
        margin-bottom: var(--pg-space-1);
      }

      .empty {
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-sm);
        font-style: italic;
        text-align: center;
        padding: var(--pg-space-3) 0;
      }
    `;
  }

  protected render(state: PlaygroundState): void {
    const conditions = state.config.conditions ?? {};
    const conditionEntries = Object.entries(conditions);

    const idx = state.selectedInteractionIndex;
    const interaction = idx != null ? state.config.interactions[idx] : null;
    const interactionConditions = interaction?.conditions ?? [];

    const effectRefs = (interaction?.effects ?? []) as { effectId?: string }[];
    const effectEntries = effectRefs
      .map((ref) => {
        if (!ref.effectId) return null;
        const eff = state.config.effects[ref.effectId];
        if (!eff) return null;
        return { id: ref.effectId, effect: eff };
      })
      .filter(Boolean) as { id: string; effect: Record<string, unknown> }[];

    const conditionItemsHtml =
      conditionEntries.length > 0
        ? conditionEntries.map(([id, cond]) => this._renderConditionItem(id, cond)).join('')
        : '<div class="empty">No conditions defined</div>';

    const assignmentHtml =
      conditionEntries.length > 0 && interaction
        ? this._renderAssignment(conditionEntries, interactionConditions, effectEntries, state)
        : '';

    this.shadowRoot!.innerHTML = `
      <div class="divider"></div>
      <div class="section-title">Conditions</div>
      ${conditionItemsHtml}
      <button class="add-btn" id="add-condition">+ Add Condition</button>
      ${assignmentHtml}
    `;

    this._attachListeners(state);
  }

  private _renderConditionItem(id: string, condition: Condition): string {
    const typeOptions = CONDITION_TYPES.map(
      (t) =>
        `<option value="${t.value}" ${t.value === condition.type ? 'selected' : ''}>${t.label}</option>`,
    ).join('');

    const placeholder = PREDICATE_PLACEHOLDERS[condition.type] ?? '';

    return `
      <div class="condition-item" data-cond-id="${id}">
        <div class="condition-header">
          <span class="condition-id">${id}</span>
          <button class="remove-btn" data-remove-cond="${id}">&times;</button>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Type</label>
            <select class="pg-select" data-cond-type="${id}">
              ${typeOptions}
            </select>
          </div>
          <div class="field" style="flex: 2">
            <label>Predicate</label>
            <input type="text" class="pg-input" data-cond-predicate="${id}"
              value="${this._escapeAttr(condition.predicate)}"
              placeholder="${placeholder}">
          </div>
        </div>
      </div>
    `;
  }

  private _renderAssignment(
    conditionEntries: [string, Condition][],
    interactionConditions: string[],
    effectEntries: { id: string; effect: Record<string, unknown> }[],
    _state: PlaygroundState,
  ): string {
    const interactionChecks = conditionEntries
      .map(([id]) => {
        const checked = interactionConditions.includes(id);
        return `
        <div class="assign-row">
          <input type="checkbox" id="assign-int-${id}" data-assign-interaction="${id}" ${checked ? 'checked' : ''}>
          <label for="assign-int-${id}">${id}</label>
        </div>
      `;
      })
      .join('');

    const effectChecks = effectEntries
      .map(({ id: eid, effect }) => {
        const effConditions = (effect.conditions as string[]) ?? [];
        const label = this._getEffectLabel(effect);
        const rows = conditionEntries
          .map(([cid]) => {
            const checked = effConditions.includes(cid);
            return `
          <div class="assign-row">
            <input type="checkbox" id="assign-eff-${eid}-${cid}"
              data-assign-effect="${eid}" data-assign-cond="${cid}" ${checked ? 'checked' : ''}>
            <label for="assign-eff-${eid}-${cid}">${cid}</label>
          </div>
        `;
          })
          .join('');

        return `
        <div class="assign-target">Effect: ${label} (${eid})</div>
        ${rows}
      `;
      })
      .join('');

    return `
      <div class="assign-title">Apply to Interaction</div>
      ${interactionChecks}
      ${effectEntries.length > 0 ? `<div class="assign-title">Apply to Effects</div>${effectChecks}` : ''}
    `;
  }

  private _getEffectLabel(effect: Record<string, unknown>): string {
    if (effect.namedEffect) {
      return ((effect.namedEffect as Record<string, unknown>).type as string) ?? 'effect';
    }
    if (effect.keyframeEffect) {
      return ((effect.keyframeEffect as Record<string, unknown>).name as string) ?? 'keyframes';
    }
    if (effect.transitionProperties) {
      const props = effect.transitionProperties as { name: string }[];
      return props.map((p) => p.name).join(', ') || 'transition';
    }
    return 'effect';
  }

  private _escapeAttr(str: string): string {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  private _attachListeners(state: PlaygroundState): void {
    const shadow = this.shadowRoot!;
    const idx = state.selectedInteractionIndex;
    const interaction = idx != null ? state.config.interactions[idx] : null;

    shadow.getElementById('add-condition')?.addEventListener('click', () => {
      const id = generateId('cond');
      this.store.dispatch(addCondition(id, { type: 'media', predicate: '' }));
    });

    shadow.querySelectorAll<HTMLButtonElement>('[data-remove-cond]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.store.dispatch(removeCondition(btn.dataset.removeCond!));
      });
    });

    shadow.querySelectorAll<HTMLSelectElement>('[data-cond-type]').forEach((select) => {
      const condId = select.dataset.condType!;
      select.addEventListener('change', () => {
        const current = (state.config.conditions ?? {})[condId];
        if (current) {
          this.store.dispatch(
            updateCondition(condId, {
              ...current,
              type: select.value as Condition['type'],
            }),
          );
        }
      });
    });

    shadow.querySelectorAll<HTMLInputElement>('[data-cond-predicate]').forEach((input) => {
      const condId = input.dataset.condPredicate!;
      input.addEventListener('change', () => {
        const current = (state.config.conditions ?? {})[condId];
        if (current) {
          this.store.dispatch(
            updateCondition(condId, {
              ...current,
              predicate: input.value || '',
            }),
          );
        }
      });
    });

    if (interaction && idx != null) {
      shadow.querySelectorAll<HTMLInputElement>('[data-assign-interaction]').forEach((checkbox) => {
        const condId = checkbox.dataset.assignInteraction!;
        checkbox.addEventListener('change', () => {
          const current = interaction.conditions ?? [];
          const updated = checkbox.checked
            ? [...current, condId]
            : current.filter((c) => c !== condId);
          this.store.dispatch(
            updateInteraction(idx, {
              conditions: updated.length > 0 ? updated : undefined,
            }),
          );
        });
      });

      shadow.querySelectorAll<HTMLInputElement>('[data-assign-effect]').forEach((checkbox) => {
        const effectId = checkbox.dataset.assignEffect!;
        const condId = checkbox.dataset.assignCond!;
        checkbox.addEventListener('change', () => {
          const effect = state.config.effects[effectId];
          if (!effect) return;
          const current = effect.conditions ?? [];
          const updated = checkbox.checked
            ? [...current, condId]
            : current.filter((c) => c !== condId);
          this.store.dispatch(
            updateEffect(effectId, {
              ...effect,
              conditions: updated.length > 0 ? updated : undefined,
            }),
          );
        });
      });
    }
  }
}

customElements.define('pg-condition-editor', PgConditionEditor);
