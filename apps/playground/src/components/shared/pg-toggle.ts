import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';

export class PgToggle extends BaseComponent {
  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: block;
      }

      .field {
        display: flex;
        align-items: center;
        gap: var(--pg-space-2);
        cursor: pointer;
      }

      label {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-medium);
        color: var(--pg-color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        user-select: none;
      }

      .track {
        position: relative;
        width: 32px;
        height: 18px;
        background: var(--pg-color-bg-tertiary);
        border: var(--pg-border-width) solid var(--pg-color-border);
        border-radius: 9px;
        transition: background var(--pg-transition-fast), border-color var(--pg-transition-fast);
        flex-shrink: 0;
      }

      .track.on {
        background: var(--pg-color-accent);
        border-color: var(--pg-color-accent);
      }

      .thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 12px;
        height: 12px;
        background: var(--pg-color-text-primary);
        border-radius: 50%;
        transition: transform var(--pg-transition-fast);
      }

      .track.on .thumb {
        transform: translateX(14px);
      }
    `;
  }

  static get observedAttributes(): string[] {
    return ['label', 'checked'];
  }

  protected render(_state: PlaygroundState): void {
    if (this.shadowRoot!.querySelector('.field')) return;

    const label = this.getAttribute('label') || '';
    const checked = this.hasAttribute('checked');

    this.shadowRoot!.innerHTML = `
      <div class="field">
        <div class="track ${checked ? 'on' : ''}" role="switch" aria-checked="${checked}" tabindex="0">
          <div class="thumb"></div>
        </div>
        ${label ? `<label>${label}</label>` : ''}
      </div>
    `;

    const track = this.shadowRoot!.querySelector('.track')!;
    const field = this.shadowRoot!.querySelector('.field')!;

    field.addEventListener('click', () => this._toggle());
    track.addEventListener('keydown', (e: Event) => {
      if ((e as KeyboardEvent).key === ' ' || (e as KeyboardEvent).key === 'Enter') {
        e.preventDefault();
        this._toggle();
      }
    });
  }

  private _toggle(): void {
    const checked = !this.checked;
    this.checked = checked;
    this.dispatchEvent(
      new CustomEvent('change', { detail: checked, bubbles: true, composed: true }),
    );
  }

  get checked(): boolean {
    return this.hasAttribute('checked');
  }

  set checked(v: boolean) {
    if (v) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
    const track = this.shadowRoot?.querySelector('.track');
    if (track) {
      track.classList.toggle('on', v);
      track.setAttribute('aria-checked', String(v));
    }
  }
}

customElements.define('pg-toggle', PgToggle);
