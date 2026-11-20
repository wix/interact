import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { add, Interact, remove, type InteractConfig } from '../src/web';

function mountWrapper(key: string) {
  const wrapper = document.createElement('interact-element');
  const button = document.createElement('button');
  wrapper.dataset.interactKey = key;
  wrapper.append(button);
  document.body.append(wrapper);
  return { wrapper, button };
}

function clickConfig(key: string): InteractConfig {
  return {
    interactions: [
      {
        key,
        trigger: 'click',
        effects: [{ key, effectId: 'clicked', stateAction: 'add', transitionProperties: [] }],
      },
    ],
  };
}

function click(button: HTMLButtonElement) {
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
}

describe('pending controllers', () => {
  beforeEach(() => {
    document.adoptedStyleSheets = [];
    vi.stubGlobal(
      'CSSStyleSheet',
      class {
        cssRules = [];
        replaceSync() {}
      },
    );
  });

  afterEach(() => {
    Interact.destroy();
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it('evicts a pending wrapper upgraded after it was mounted', () => {
    const key = 'cold-pending';
    const { wrapper } = mountWrapper(key);

    expect(Interact.getController(key)).toBeUndefined();
    expect(Interact.defineInteractElement?.()).toBe(true);
    expect(Interact.getController(key)?.element).toBe(wrapper);
    expect(Interact.getInstance(key)).toBeUndefined();

    wrapper.remove();

    expect(Interact.getController(key)).toBeUndefined();
  });

  it('keeps a pending wrapper on ordinary disconnect and evicts it on physical detach', () => {
    const key = 'warm-pending';
    Interact.defineInteractElement?.();
    const { wrapper } = mountWrapper(key);
    const pending = Interact.getController(key);

    expect(pending?.element).toBe(wrapper);
    expect(pending?.connected).toBe(false);
    pending?.disconnect();
    expect(Interact.getController(key)).toBe(pending);

    wrapper.remove();

    expect(Interact.getController(key)).toBeUndefined();
  });

  it('evicts a live wrapper on detach after its configuration was destroyed', () => {
    const key = 'late-config';
    Interact.defineInteractElement?.();
    const { wrapper, button } = mountWrapper(key);
    const pending = Interact.getController(key);
    const instance = Interact.create(clickConfig(key));

    expect(Interact.getController(key)).toBe(pending);
    expect(Interact.getInstance(key)).toBe(instance);
    click(button);
    expect(pending?.getActiveEffects()).toEqual(['clicked']);

    instance.destroy();
    expect(Interact.getController(key)).toBe(pending);
    expect(pending?.connected).toBe(false);
    expect(Interact.getInstance(key)).toBeUndefined();

    wrapper.remove();

    expect(Interact.getController(key)).toBeUndefined();
  });

  it.each([false, true])(
    'keeps the replacement controller when its predecessor detaches (authored: %s)',
    (authored) => {
      const key = 'replacement';
      Interact.defineInteractElement?.();
      if (authored) {
        Interact.create(clickConfig(key));
      }
      const first = mountWrapper(key);
      const current = mountWrapper(key);
      const controller = Interact.getController(key);

      expect(controller?.element).toBe(current.wrapper);
      first.wrapper.remove();
      expect(Interact.getController(key)).toBe(controller);

      if (!authored) {
        Interact.create(clickConfig(key));
      }
      click(current.button);
      expect(controller?.getActiveEffects()).toEqual(['clicked']);
    },
  );

  it('evicts a pending element registered and removed through the DOM API', () => {
    const key = 'plain-pending';
    const button = document.createElement('button');
    document.body.append(button);
    add(button, key);

    expect(Interact.getController(key)?.element).toBe(button);
    expect(Interact.getInstance(key)).toBeUndefined();
    remove(key);

    expect(Interact.getController(key)).toBeUndefined();
  });
});
