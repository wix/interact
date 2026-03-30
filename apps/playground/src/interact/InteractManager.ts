import { Interact } from '@wix/interact/web';
import type { InteractConfig } from '@wix/interact';
import { store } from '../store/PlaygroundStore';
import { getAllPresets } from './preset-registry';

interface IInteractElement extends HTMLElement {
  connect(): void;
}

let presetsRegistered = false;

function ensurePresets(): void {
  if (presetsRegistered) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Interact.registerEffects(getAllPresets() as any);
  presetsRegistered = true;
}

let currentInstance: Interact | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let stageElement: HTMLElement | null = null;

export function setStageElement(el: HTMLElement): void {
  stageElement = el;
}

function reconnectShadowElements(): void {
  if (!stageElement?.shadowRoot) return;
  stageElement.shadowRoot.querySelectorAll('interact-element').forEach((el) => {
    (el as IInteractElement).connect();
  });
}

function apply(config: InteractConfig): void {
  // Destroy previous instance
  if (currentInstance) {
    currentInstance.destroy();
    currentInstance = null;
  }

  // Don't create if no interactions
  if (config.interactions.length === 0) return;

  ensurePresets();

  // Filter out incomplete interactions (no key set)
  const validConfig: InteractConfig = {
    ...config,
    interactions: config.interactions.filter((i) => i.key),
  };

  if (validConfig.interactions.length === 0) return;

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

  // Apply initial state
  debouncedApply(store.getState().config);
}

export function destroyInteractManager(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (currentInstance) {
    currentInstance.destroy();
    currentInstance = null;
  }
}
