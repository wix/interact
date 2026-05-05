import { store, PlaygroundStore } from '../../store/PlaygroundStore';
import type { PlaygroundState, Action } from '../../types';
import themeCSS from '../../styles/theme.css?inline';
import controlsCSS from '../../styles/controls.css?inline';
import utilitiesCSS from '../../styles/utilities.css?inline';
import statesCSS from '../../styles/states.css?inline';

const sharedSheet = new CSSStyleSheet();
sharedSheet.replaceSync([themeCSS, controlsCSS, utilitiesCSS, statesCSS].join('\n'));

export abstract class BaseComponent extends HTMLElement {
  protected store: PlaygroundStore = store;
  private _stateHandler: ((e: Event) => void) | null = null;
  private _componentSheet: CSSStyleSheet | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  protected get componentStyles(): string {
    return '';
  }

  connectedCallback(): void {
    const sheets: CSSStyleSheet[] = [sharedSheet];
    const css = this.componentStyles;
    if (css) {
      this._componentSheet = new CSSStyleSheet();
      this._componentSheet.replaceSync(css);
      sheets.push(this._componentSheet);
    }
    this.shadowRoot!.adoptedStyleSheets = sheets;

    this._stateHandler = (e: Event) => {
      const { action } = (e as CustomEvent<{ action: Action }>).detail;
      this.onStateChange(this.store.getState(), action);
    };
    this.store.addEventListener('state-change', this._stateHandler);

    this.render(this.store.getState());
  }

  disconnectedCallback(): void {
    if (this._stateHandler) {
      this.store.removeEventListener('state-change', this._stateHandler);
      this._stateHandler = null;
    }
  }

  protected abstract render(state: PlaygroundState): void;

  protected onStateChange(state: PlaygroundState, _action: Action): void {
    this.render(state);
  }
}
