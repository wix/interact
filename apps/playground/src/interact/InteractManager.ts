import { Interact } from '@wix/interact/web';
import { generate } from '@wix/interact';
import type { InteractConfig } from '@wix/interact';
import { store } from '../store/PlaygroundStore';
import { getAllPresets } from './preset-registry';

interface IInteractElement extends HTMLElement {
  connect(): void;
}

let generatedSheet: CSSStyleSheet | null = null;

let presetsRegistered = false;

function ensurePresets(): void {
  if (presetsRegistered) return;
  Interact.registerEffects(getAllPresets() as any);
  presetsRegistered = true;
}

let currentInstance: Interact | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let stageElement: HTMLElement | null = null;
let paused = false;

export function setStageElement(el: HTMLElement): void {
  stageElement = el;
}

export function getStageElement(): HTMLElement | null {
  return stageElement;
}

export function pauseInteract(): void {
  paused = true;
  if (debounceTimer) clearTimeout(debounceTimer);
  if (currentInstance) {
    currentInstance.destroy();
    currentInstance = null;
    cancelStaleAnimations();
  }
  removeGeneratedCSS();
}

export function resumeInteract(): void {
  paused = false;
  debouncedApply(store.getState().config);
}

function reconnectShadowElements(): void {
  if (!stageElement?.shadowRoot) return;
  stageElement.shadowRoot.querySelectorAll('interact-element').forEach((el) => {
    (el as IInteractElement).connect();
  });
}

function cancelStaleAnimations(): void {
  if (!stageElement?.shadowRoot) return;
  stageElement.shadowRoot.querySelectorAll('interact-element').forEach((el) => {
    el.getAnimations({ subtree: true }).forEach((anim) => anim.cancel());
  });
}

function removeGeneratedCSS(): void {
  const root = stageElement?.shadowRoot;
  if (!root || !generatedSheet) return;
  root.adoptedStyleSheets = root.adoptedStyleSheets.filter((s) => s !== generatedSheet);
  generatedSheet = null;
}

function injectGeneratedCSS(css: string): void {
  const root = stageElement?.shadowRoot;
  if (!root) return;

  if (!css) {
    removeGeneratedCSS();
    return;
  }

  if (generatedSheet) {
    generatedSheet.replaceSync(css);
  } else {
    generatedSheet = new CSSStyleSheet();
    generatedSheet.replaceSync(css);
    root.adoptedStyleSheets = [generatedSheet, ...root.adoptedStyleSheets];
  }
}

function apply(config: InteractConfig): void {
  if (paused) return;

  if (currentInstance) {
    currentInstance.destroy();
    currentInstance = null;
    cancelStaleAnimations();
  }

  if (config.interactions.length === 0) return;

  ensurePresets();

  const validConfig: InteractConfig = {
    ...config,
    interactions: config.interactions.filter((i) => i.key),
  };

  if (validConfig.interactions.length === 0) return;

  injectGeneratedCSS(generate(validConfig));

  currentInstance = Interact.create(validConfig);

  reconnectShadowElements();
}

function debouncedApply(config: InteractConfig): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => apply(config), 100);
}

export function initInteractManager(): void {
  store.addEventListener('state-change', () => {
    const state = store.getState();
    debouncedApply(state.config);
  });

  debouncedApply(store.getState().config);
}

export function destroyInteractManager(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (currentInstance) {
    currentInstance.destroy();
    currentInstance = null;
  }
}
