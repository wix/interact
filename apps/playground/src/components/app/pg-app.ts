import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState, Action } from '../../types';
import { removeInteraction, undo } from '../../store/actions';

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 400;
const INSPECTOR_MIN = 240;
const INSPECTOR_MAX = 500;
const JSON_PANEL_MIN = 80;
const JSON_PANEL_MAX = 500;

export class PgApp extends BaseComponent {
  private _keyHandler: ((e: KeyboardEvent) => void) | null = null;

  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
      }

      .app-grid {
        display: grid;
        grid-template-columns: var(--pg-sidebar-width) 1fr var(--pg-inspector-width);
        grid-template-rows: var(--pg-toolbar-height) 1fr auto;
        grid-template-areas:
          'toolbar  toolbar   toolbar'
          'sidebar  stage     inspector'
          'json     json      json';
        height: 100%;
        position: relative;
      }

      ::slotted(pg-toolbar) { grid-area: toolbar; }
      ::slotted(pg-sidebar) { grid-area: sidebar; }
      ::slotted(pg-stage) { grid-area: stage; }
      ::slotted(pg-inspector) { grid-area: inspector; }
      ::slotted(pg-json-panel) { grid-area: json; }
      ::slotted(pg-timeline-panel) { grid-area: json; }

      .resize-handle {
        position: absolute;
        z-index: var(--pg-z-panel);
        background: transparent;
        transition: background var(--pg-transition-fast);
      }

      .resize-handle:hover,
      .resize-handle.active {
        background: var(--pg-color-accent-muted);
      }

      .resize-handle--col {
        top: var(--pg-toolbar-height);
        bottom: 0;
        width: 6px;
        cursor: col-resize;
      }

      .resize-handle--left {
        left: calc(var(--pg-sidebar-width) - 3px);
      }

      .resize-handle--right {
        right: calc(var(--pg-inspector-width) - 3px);
      }

      .resize-handle--row {
        left: 0;
        right: 0;
        height: 6px;
        cursor: row-resize;
      }

      .resize-handle--bottom {
        bottom: calc(var(--pg-json-panel-height) - 3px);
        display: none;
      }

      .resize-handle--bottom.visible {
        display: block;
      }
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._keyHandler = (e: KeyboardEvent) => this._handleKeydown(e);
    document.addEventListener('keydown', this._keyHandler);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
  }

  protected render(state: PlaygroundState): void {
    if (this.shadowRoot!.querySelector('.app-grid')) return;
    this.shadowRoot!.innerHTML = `
      <div class="app-grid">
        <slot></slot>
        <div class="resize-handle resize-handle--col resize-handle--left" id="resize-left"></div>
        <div class="resize-handle resize-handle--col resize-handle--right" id="resize-right"></div>
        <div class="resize-handle resize-handle--row resize-handle--bottom" id="resize-bottom"></div>
      </div>
    `;

    this._initColResize('resize-left', '--pg-sidebar-width', SIDEBAR_MIN, SIDEBAR_MAX, false);
    this._initColResize('resize-right', '--pg-inspector-width', INSPECTOR_MIN, INSPECTOR_MAX, true);
    this._initRowResize('resize-bottom', '--pg-json-panel-height', JSON_PANEL_MIN, JSON_PANEL_MAX);

    this._updateBottomHandle(state.bottomPanel);
  }

  protected onStateChange(state: PlaygroundState, action: Action): void {
    if (action.type === 'SET_BOTTOM_PANEL' || action.type === 'UNDO') {
      this._updateBottomHandle(state.bottomPanel);
    }
  }

  private _updateBottomHandle(panel: string): void {
    const handle = this.shadowRoot?.getElementById('resize-bottom');
    if (handle) {
      handle.classList.toggle('visible', panel !== 'none');
    }
  }

  private _initColResize(
    handleId: string,
    cssVar: string,
    min: number,
    max: number,
    invert: boolean,
  ): void {
    const handle = this.shadowRoot!.getElementById(handleId)!;

    handle.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      handle.classList.add('active');

      const startX = e.clientX;
      const startWidth = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(cssVar),
        10,
      );

      const onMove = (me: PointerEvent) => {
        const delta = me.clientX - startX;
        const newWidth = Math.max(min, Math.min(max, startWidth + (invert ? -delta : delta)));
        document.documentElement.style.setProperty(cssVar, `${newWidth}px`);
      };

      const onUp = () => {
        handle.classList.remove('active');
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
      };

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    });
  }

  private _initRowResize(handleId: string, cssVar: string, min: number, max: number): void {
    const handle = this.shadowRoot!.getElementById(handleId)!;

    handle.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      handle.classList.add('active');

      const startY = e.clientY;
      const startHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(cssVar),
        10,
      );

      const onMove = (me: PointerEvent) => {
        const delta = startY - me.clientY; // dragging up = taller
        const newHeight = Math.max(min, Math.min(max, startHeight + delta));
        document.documentElement.style.setProperty(cssVar, `${newHeight}px`);
      };

      const onUp = () => {
        handle.classList.remove('active');
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
      };

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    });
  }

  private _isInputElement(el: HTMLElement): boolean {
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
  }

  private _handleKeydown(e: KeyboardEvent): void {
    // Walk composedPath to detect inputs inside nested shadow DOMs
    for (const node of e.composedPath()) {
      if (node instanceof HTMLElement && this._isInputElement(node)) {
        return;
      }
    }

    // Ctrl+Z / Cmd+Z → Undo
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.store.dispatch(undo());
      return;
    }

    // Delete / Backspace → Remove selected interaction
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const state = this.store.getState();
      if (state.selectedInteractionIndex != null) {
        e.preventDefault();
        this.store.dispatch(removeInteraction(state.selectedInteractionIndex));
      }
    }
  }
}

customElements.define('pg-app', PgApp);
