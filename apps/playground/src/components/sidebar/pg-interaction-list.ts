import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';
import { addInteraction, removeInteraction, selectInteraction } from '../../store/actions';

const TRIGGER_LABELS: Record<string, string> = {
  hover: 'Hover',
  click: 'Click',
  viewEnter: 'View Enter',
  pageVisible: 'Page Visible',
  animationEnd: 'Anim End',
  viewProgress: 'Scroll',
  pointerMove: 'Pointer',
  activate: 'Activate',
  interest: 'Interest',
};

export class PgInteractionList extends BaseComponent {
  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: block;
      }

      .list {
        display: flex;
        flex-direction: column;
      }

      .item {
        display: flex;
        align-items: center;
        gap: var(--pg-space-2);
        padding: var(--pg-space-2) var(--pg-panel-padding);
        cursor: pointer;
        transition: background var(--pg-transition-fast);
        border-bottom: var(--pg-border-width) solid var(--pg-color-border);
      }

      .item:hover {
        background: var(--pg-color-bg-hover);
      }

      .item[aria-selected="true"] {
        background: var(--pg-color-accent-muted);
      }

      .badge {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-bold);
        padding: 1px 6px;
        border-radius: var(--pg-radius-sm);
        background: var(--pg-color-bg-tertiary);
        color: var(--pg-color-accent);
        white-space: nowrap;
      }

      .key {
        flex: 1;
        font-size: var(--pg-font-size-sm);
        color: var(--pg-color-text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .key.empty {
        font-style: italic;
        color: var(--pg-color-text-muted);
      }

      .delete-btn {
        background: none;
        border: none;
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-sm);
        padding: 2px 4px;
        border-radius: var(--pg-radius-sm);
        cursor: pointer;
        line-height: 1;
        transition: color var(--pg-transition-fast);
      }

      .delete-btn:hover {
        color: var(--pg-color-danger);
      }

      .add-btn {
        margin: var(--pg-space-2) var(--pg-panel-padding);
      }

      .empty-msg {
        padding: var(--pg-space-4) var(--pg-panel-padding);
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-sm);
        text-align: center;
      }
    `;
  }

  protected render(state: PlaygroundState): void {
    const { interactions } = state.config;
    const selected = state.selectedInteractionIndex;

    const items = interactions.map((interaction, i) => {
      const triggerLabel = TRIGGER_LABELS[interaction.trigger] || interaction.trigger;
      const keyLabel = interaction.key || 'no key';
      const keyClass = interaction.key ? 'key' : 'key empty';
      return `
        <div class="item" aria-selected="${i === selected}" data-index="${i}">
          <span class="badge">${triggerLabel}</span>
          <span class="${keyClass}">${keyLabel}</span>
          <button class="delete-btn" data-delete="${i}">&times;</button>
        </div>
      `;
    }).join('');

    this.shadowRoot!.innerHTML = `
      <div class="list">
        ${items || '<div class="empty-msg">No interactions yet</div>'}
      </div>
      <button class="pg-button pg-button--small pg-button--secondary add-btn">+ Add Interaction</button>
    `;

    this.shadowRoot!.querySelector('.add-btn')!.addEventListener('click', () => {
      this.store.dispatch(addInteraction());
    });

    this.shadowRoot!.querySelectorAll('.item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.delete-btn')) return;
        const index = parseInt((item as HTMLElement).dataset.index!, 10);
        this.store.dispatch(selectInteraction(index));
      });
    });

    this.shadowRoot!.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt((btn as HTMLElement).dataset.delete!, 10);
        this.store.dispatch(removeInteraction(index));
      });
    });
  }
}

customElements.define('pg-interaction-list', PgInteractionList);
