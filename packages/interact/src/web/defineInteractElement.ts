import { getInteractElement } from './InteractElement';

export const INTERACT_ELEMENT_STYLE_ID = 'wix-interact-element-default-style';

function ensureInteractElementStyle() {
  if (typeof document === 'undefined' || document.getElementById(INTERACT_ELEMENT_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = INTERACT_ELEMENT_STYLE_ID;
  style.textContent = 'interact-element { display: contents; }';

  (document.head ?? document.documentElement).append(style);
}

export function defineInteractElement() {
  ensureInteractElementStyle();

  if (!customElements.get('interact-element')) {
    const interactElement = getInteractElement();
    customElements.define('interact-element', interactElement);

    return true;
  }

  return false;
}
