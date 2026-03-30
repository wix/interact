import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';
import type { Effect, SequenceConfig } from '@wix/interact';
import { addEffect, addSequence, removeEffect, removeSequence, selectEffect, updateInteraction, updateSequence } from '../../store/actions';
import { generateId } from '../../utils/id';

const OFFSET_EASING_PRESETS = [
  { value: '', label: 'None' },
  { value: 'linear', label: 'Linear' },
  { value: 'quadIn', label: 'Quad In' },
  { value: 'quadOut', label: 'Quad Out' },
  { value: 'sineOut', label: 'Sine Out' },
  { value: 'cubicIn', label: 'Cubic In' },
  { value: 'cubicOut', label: 'Cubic Out' },
  { value: 'cubicInOut', label: 'Cubic In Out' },
];

function getEffectLabel(effect: Record<string, unknown>): string {
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

export class PgSequenceEditor extends BaseComponent {
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

      .sequence-item {
        padding: var(--pg-space-2);
        background: var(--pg-color-bg-tertiary);
        border-radius: var(--pg-radius-md);
        margin-bottom: var(--pg-space-2);
      }

      .sequence-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--pg-space-2);
      }

      .sequence-label {
        font-size: var(--pg-font-size-sm);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-color-text-primary);
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

      .effects-label {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-top: var(--pg-space-2);
        margin-bottom: var(--pg-space-1);
      }

      .effect-row {
        display: flex;
        align-items: center;
        gap: var(--pg-space-1);
        padding: var(--pg-space-1) var(--pg-space-2);
        background: var(--pg-color-bg-surface);
        border-radius: var(--pg-radius-sm);
        margin-bottom: 2px;
        font-size: var(--pg-font-size-sm);
        color: var(--pg-color-text-secondary);
        cursor: pointer;
        transition: background var(--pg-transition-fast);
      }

      .effect-row:hover {
        background: var(--pg-color-bg-hover);
      }

      .effect-row.selected {
        background: var(--pg-color-accent-muted);
        color: var(--pg-color-text-primary);
      }

      .effect-row .index {
        font-size: var(--pg-font-size-xs);
        color: var(--pg-color-text-muted);
        font-weight: var(--pg-font-weight-bold);
        width: 18px;
        text-align: center;
        flex-shrink: 0;
      }

      .effect-row .name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .effect-row .arrow-btn {
        background: none;
        border: none;
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-xs);
        cursor: pointer;
        padding: 0 2px;
        line-height: 1;
      }

      .effect-row .arrow-btn:hover {
        color: var(--pg-color-accent);
      }

      .effect-row .remove-effect-btn {
        background: none;
        border: none;
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-sm);
        cursor: pointer;
        padding: 0 2px;
        line-height: 1;
      }

      .effect-row .remove-effect-btn:hover {
        color: var(--pg-color-danger);
      }

      .add-effect-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 24px;
        background: var(--pg-color-bg-surface);
        border: var(--pg-border-width) dashed var(--pg-color-border);
        border-radius: var(--pg-radius-sm);
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-xs);
        cursor: pointer;
        transition: border-color var(--pg-transition-fast), color var(--pg-transition-fast);
        margin-top: var(--pg-space-1);
      }

      .add-effect-btn:hover {
        border-color: var(--pg-color-accent);
        color: var(--pg-color-accent);
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
        padding: var(--pg-space-2) 0;
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

    const sequenceRefs = (interaction.sequences ?? []) as { sequenceId?: string }[];
    const sequences = state.config.sequences ?? {};

    const sequenceItems = sequenceRefs.map((ref, seqIdx) => {
      if (!ref.sequenceId) return '';
      const seq = sequences[ref.sequenceId];
      if (!seq) return '';
      return this._renderSequenceItem(ref.sequenceId, seq, seqIdx, state);
    }).join('');

    this.shadowRoot!.innerHTML = `
      <div class="divider"></div>
      <div class="section-title">Sequences</div>
      ${sequenceItems || '<div class="empty">No sequences</div>'}
      <button class="add-btn" id="add-sequence">+ Add Sequence</button>
    `;

    this._attachListeners(state, idx);
  }

  private _renderSequenceItem(
    seqId: string,
    sequence: SequenceConfig,
    seqIdx: number,
    state: PlaygroundState,
  ): string {
    const delay = sequence.delay ?? 0;
    const offset = sequence.offset ?? 100;
    const offsetEasing = (sequence.offsetEasing as string) ?? '';

    const ctx = state.selectedEffectContext;
    const selectedEffectId = state.selectedEffectId;

    const effectRefs = sequence.effects as { effectId?: string }[];
    const effectRows = effectRefs.map((ref, effIdx) => {
      if (!ref.effectId) return '';
      const eff = state.config.effects[ref.effectId];
      if (!eff) return '';
      const label = getEffectLabel(eff as Record<string, unknown>);
      const isFirst = effIdx === 0;
      const isLast = effIdx === effectRefs.length - 1;

      const isSelected = selectedEffectId === ref.effectId
        && ctx?.source === 'sequence'
        && ctx.sequenceId === seqId
        && ctx.effectIndex === effIdx;

      return `
        <div class="effect-row ${isSelected ? 'selected' : ''}" data-seq-id="${seqId}" data-eff-idx="${effIdx}" data-eff-id="${ref.effectId}">
          <span class="index">${effIdx + 1}</span>
          <span class="name" title="${ref.effectId}">${label}</span>
          <button class="arrow-btn" data-move-up="${effIdx}" data-move-seq="${seqId}" ${isFirst ? 'disabled' : ''}>&#9650;</button>
          <button class="arrow-btn" data-move-down="${effIdx}" data-move-seq="${seqId}" ${isLast ? 'disabled' : ''}>&#9660;</button>
          <button class="remove-effect-btn" data-remove-eff-idx="${effIdx}" data-remove-eff-seq="${seqId}">&times;</button>
        </div>
      `;
    }).join('');

    const easingOptions = OFFSET_EASING_PRESETS.map((p) =>
      `<option value="${p.value}" ${p.value === offsetEasing ? 'selected' : ''}>${p.label}</option>`,
    ).join('');

    return `
      <div class="sequence-item" data-seq-id="${seqId}">
        <div class="sequence-header">
          <span class="sequence-label">Sequence #${seqIdx + 1}</span>
          <button class="remove-btn" data-remove-seq="${seqId}">&times;</button>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Delay (ms)</label>
            <input type="number" class="pg-input" data-seq-delay="${seqId}"
              min="0" max="30000" step="50" value="${delay}">
          </div>
          <div class="field">
            <label>Offset (ms)</label>
            <input type="number" class="pg-input" data-seq-offset="${seqId}"
              min="0" max="5000" step="10" value="${offset}">
          </div>
        </div>

        <div class="field">
          <label>Offset Easing</label>
          <select class="pg-select" data-seq-easing="${seqId}">
            ${easingOptions}
          </select>
        </div>

        <div class="effects-label">Effects</div>
        ${effectRows || '<div class="empty">No effects in sequence</div>'}
        <button class="add-effect-btn" data-add-eff-seq="${seqId}">+ Add Effect</button>
      </div>
    `;
  }

  private _attachListeners(state: PlaygroundState, interactionIdx: number): void {
    const shadow = this.shadowRoot!;
    const interaction = state.config.interactions[interactionIdx];
    const sequences = state.config.sequences ?? {};

    shadow.getElementById('add-sequence')?.addEventListener('click', () => {
      const seqId = generateId('seq');
      const newSeq: SequenceConfig = { effects: [], offset: 100 };
      this.store.dispatch(addSequence(seqId, newSeq));

      const currentSeqs = interaction.sequences ?? [];
      this.store.dispatch(updateInteraction(interactionIdx, {
        sequences: [...currentSeqs, { sequenceId: seqId }],
      }));
    });

    shadow.querySelectorAll<HTMLButtonElement>('[data-remove-seq]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const seqId = btn.dataset.removeSeq!;
        const seq = sequences[seqId];

        if (seq) {
          const effectRefs = seq.effects as { effectId?: string }[];
          for (const ref of effectRefs) {
            if (ref.effectId) {
              this.store.dispatch(removeEffect(ref.effectId));
            }
          }
        }

        this.store.dispatch(removeSequence(seqId));
      });
    });

    shadow.querySelectorAll<HTMLInputElement>('[data-seq-delay]').forEach((input) => {
      const seqId = input.dataset.seqDelay!;
      input.addEventListener('change', () => {
        const seq = sequences[seqId];
        if (!seq) return;
        this.store.dispatch(updateSequence(seqId, {
          ...seq,
          delay: parseInt(input.value, 10) || 0,
        }));
      });
    });

    shadow.querySelectorAll<HTMLInputElement>('[data-seq-offset]').forEach((input) => {
      const seqId = input.dataset.seqOffset!;
      input.addEventListener('change', () => {
        const seq = sequences[seqId];
        if (!seq) return;
        this.store.dispatch(updateSequence(seqId, {
          ...seq,
          offset: parseInt(input.value, 10) || 0,
        }));
      });
    });

    shadow.querySelectorAll<HTMLSelectElement>('[data-seq-easing]').forEach((select) => {
      const seqId = select.dataset.seqEasing!;
      select.addEventListener('change', () => {
        const seq = sequences[seqId];
        if (!seq) return;
        this.store.dispatch(updateSequence(seqId, {
          ...seq,
          offsetEasing: select.value || undefined,
        }));
      });
    });

    shadow.querySelectorAll<HTMLElement>('.effect-row[data-eff-id]').forEach((row) => {
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.arrow-btn, .remove-effect-btn')) return;
        const seqId = row.dataset.seqId!;
        const effIdx = parseInt(row.dataset.effIdx!, 10);
        const effId = row.dataset.effId!;
        this.store.dispatch(selectEffect(effId, {
          source: 'sequence',
          sequenceId: seqId,
          effectIndex: effIdx,
        }));
      });
    });

    shadow.querySelectorAll<HTMLButtonElement>('[data-add-eff-seq]').forEach((btn) => {
      const seqId = btn.dataset.addEffSeq!;
      btn.addEventListener('click', () => {
        const seq = sequences[seqId];
        if (!seq) return;

        const trigger = interaction.trigger ?? 'hover';
        const effectId = generateId('seff');
        const newEffect = this._createDefaultSequenceEffect(trigger);
        this.store.dispatch(addEffect(effectId, newEffect));

        this.store.dispatch(updateSequence(seqId, {
          ...seq,
          effects: [...seq.effects, { effectId } as SequenceConfig['effects'][number]],
        }));

        this.store.dispatch(selectEffect(effectId, {
          source: 'sequence',
          sequenceId: seqId,
          effectIndex: seq.effects.length,
        }));
      });
    });

    shadow.querySelectorAll<HTMLButtonElement>('[data-remove-eff-idx]').forEach((btn) => {
      const effIdx = parseInt(btn.dataset.removeEffIdx!, 10);
      const seqId = btn.dataset.removeEffSeq!;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const seq = sequences[seqId];
        if (!seq) return;

        const ref = seq.effects[effIdx] as { effectId?: string };
        if (ref.effectId) {
          this.store.dispatch(removeEffect(ref.effectId));
        }

        this.store.dispatch(updateSequence(seqId, {
          ...seq,
          effects: seq.effects.filter((_, i) => i !== effIdx),
        }));
      });
    });

    shadow.querySelectorAll<HTMLButtonElement>('[data-move-up]').forEach((btn) => {
      const effIdx = parseInt(btn.dataset.moveUp!, 10);
      const seqId = btn.dataset.moveSeq!;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (effIdx <= 0) return;
        const seq = sequences[seqId];
        if (!seq) return;
        const effects = [...seq.effects];
        [effects[effIdx - 1], effects[effIdx]] = [effects[effIdx], effects[effIdx - 1]];
        this.store.dispatch(updateSequence(seqId, { ...seq, effects }));
      });
    });

    shadow.querySelectorAll<HTMLButtonElement>('[data-move-down]').forEach((btn) => {
      const effIdx = parseInt(btn.dataset.moveDown!, 10);
      const seqId = btn.dataset.moveSeq!;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const seq = sequences[seqId];
        if (!seq) return;
        if (effIdx >= seq.effects.length - 1) return;
        const effects = [...seq.effects];
        [effects[effIdx], effects[effIdx + 1]] = [effects[effIdx + 1], effects[effIdx]];
        this.store.dispatch(updateSequence(seqId, { ...seq, effects }));
      });
    });
  }

  private _createDefaultSequenceEffect(trigger: string): Effect {
    if (trigger === 'viewProgress' || trigger === 'pointerMove') {
      return {
        easing: 'ease',
        fill: 'both',
        namedEffect: { type: 'FadeScroll' },
      } as Effect;
    }
    return {
      duration: 500,
      easing: 'ease',
      fill: 'both',
      namedEffect: { type: 'FadeIn' },
    } as Effect;
  }
}

customElements.define('pg-sequence-editor', PgSequenceEditor);
