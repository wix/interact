import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Interact, type IInteractionController, type InteractConfig } from '../src/web';

const targetKey = 'target';

function makeTarget() {
  const target = document.createElement('interact-element');
  target.dataset.interactKey = targetKey;
  target.append(document.createElement('button'));
  return target;
}

function getController(key = targetKey) {
  const controller = Interact.getController(key);
  if (!controller) throw new Error('Expected controller');
  return controller;
}

function setupResources() {
  const cleanup = vi.fn<(root: HTMLElement) => void>();
  Interact.use('mounted-predecessor', (_, { root }) => {
    const part = document.createElement('span');
    part.className = 'part';
    root.append(part);
    return () => {
      part.remove();
      cleanup(root);
    };
  });
  const config: InteractConfig = {
    interactions: [
      {
        key: 'source',
        trigger: 'click',
        effects: [
          {
            key: targetKey,
            selector: 'button',
            effectId: 'selected',
            stateAction: 'add',
            transitionProperties: [{ name: 'opacity', value: '0.6', duration: 0 }],
            '$mounted-predecessor': {},
          },
        ],
      },
    ],
  };
  const author = Interact.create(config);
  const host = document.createElement('div');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const sentinel = new CSSStyleSheet();
  shadow.adoptedStyleSheets = [sentinel];
  const target = makeTarget();
  shadow.append(target);
  const source = document.createElement('interact-element');
  source.dataset.interactKey = 'source';
  const button = document.createElement('button');
  source.append(button);
  document.body.append(source);
  const controller = getController();
  const sheet = controller.sheet;
  const part = target.querySelector('.part');
  if (!sheet || !part || sheet.cssRules.length === 0) {
    throw new Error('Expected mounted resources');
  }
  expect(shadow.adoptedStyleSheets).toEqual([sentinel, sheet]);
  return { author, cleanup, controller, shadow, sentinel, target, button, sheet, part };
}

function structuralController(disconnect: () => void): IInteractionController {
  return {
    element: document.createElement('div'),
    key: targetKey,
    connected: false,
    sheet: null,
    useFirstChild: false,
    _observers: new WeakMap(),
    _appliedPlugins: new WeakSet(),
    _pluginCleanups: [],
    connect() {},
    disconnect,
    update() {},
    resume() {},
    applyState() {},
    toggleEffect() {},
    getActiveEffects: () => [],
    renderStyle() {},
    watchChildList() {},
    _childListChangeHandler() {},
  };
}

describe('mounted controller displacement', () => {
  beforeEach(() => {
    const Sheet = CSSStyleSheet;
    vi.stubGlobal(
      'CSSStyleSheet',
      class extends Sheet {
        replaceSync(css: string) {
          const style = document.createElement('style');
          style.textContent = css;
          document.head.append(style);
          for (const rule of Array.from(style.sheet?.cssRules ?? [])) {
            this.insertRule(rule.cssText, this.cssRules.length);
          }
          style.remove();
        }
      },
    );
  });

  afterEach(() => {
    Interact.destroy();
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it.each(['configured replacement', 'unowned replacement', 'direct deletion', 'physical detach'])(
    'releases the old plugin and original shadow adoption on %s',
    (action) => {
      const { author, cleanup, controller, shadow, sentinel, target, sheet, part } =
        setupResources();
      const replacement = makeTarget();
      if (action === 'configured replacement') {
        shadow.append(replacement);
      } else if (action === 'unowned replacement') {
        author.init({ interactions: [] });
        shadow.append(replacement);
      } else if (action === 'direct deletion') {
        Interact.deleteController(targetKey);
        Interact.deleteController(targetKey);
      } else {
        target.remove();
      }

      expect(part.isConnected).toBe(false);
      expect(cleanup.mock.calls.filter(([root]) => root === target)).toHaveLength(1);
      expect(sheet.cssRules).toHaveLength(0);
      expect(shadow.adoptedStyleSheets).not.toContain(sheet);
      expect(controller.connected).toBe(false);
      expect(Interact.getController(targetKey)?.element).toBe(
        replacement.isConnected ? replacement : undefined,
      );
      if (action === 'unowned replacement') expect(getController().connected).toBe(false);

      author.destroy();
      Interact.destroy();
      expect(shadow.adoptedStyleSheets).toEqual([sentinel]);
      expect(cleanup.mock.calls.filter(([root]) => root === target)).toHaveLength(1);
    },
  );

  it('does not release a live controller when the same identity is cached again', () => {
    const { cleanup, controller, shadow, sentinel, sheet, part } = setupResources();
    const rule = sheet.cssRules[0];

    Interact.setController(targetKey, controller);

    expect(getController()).toBe(controller);
    expect(part.isConnected).toBe(true);
    expect(cleanup).not.toHaveBeenCalled();
    expect(shadow.adoptedStyleSheets).toEqual([sentinel, sheet]);
    expect(sheet.cssRules[0]).toBe(rule);
  });

  it('replaces and deletes pending controllers without calling their disconnect method', () => {
    const close = vi.fn();
    const first = structuralController(close);
    const next = structuralController(close);
    Interact.setController(targetKey, first);
    Interact.setController(targetKey, next);
    expect(getController()).toBe(next);

    Interact.deleteController(targetKey);
    Interact.deleteController(targetKey);

    expect(close).not.toHaveBeenCalled();
    expect(Interact.getController(targetKey)).toBeUndefined();
  });

  it.each([
    ['set', 'different controller'],
    ['set', 'same controller'],
    ['set', 'pending controller'],
    ['delete', 'different controller'],
    ['delete', 'same controller'],
    ['delete', 'pending controller'],
  ])('preserves the %s cleanup successor on a %s', (operation, replacement) => {
    const { cleanup, controller, shadow, sentinel, sheet, button } = setupResources();
    const pending = structuralController(vi.fn());
    const contender = structuralController(vi.fn());
    let successor: IInteractionController | undefined;
    let freshRule: CSSRule | undefined;
    cleanup.mockImplementationOnce(() => {
      if (replacement === 'same controller') controller.resume();
      else if (replacement === 'different controller') shadow.append(makeTarget());
      else Interact.setController(targetKey, pending);
      successor = getController();
      freshRule = successor.sheet?.cssRules[0];
    });

    if (operation === 'set') Interact.setController(targetKey, contender);
    else Interact.deleteController(targetKey);

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(getController()).toBe(successor);
    expect(shadow.adoptedStyleSheets).not.toContain(sheet);
    if (replacement === 'pending controller') {
      expect(getController()).toBe(pending);
      expect(shadow.adoptedStyleSheets).toEqual([sentinel]);
    } else {
      expect(getController().sheet?.cssRules[0]).toBe(freshRule);
      expect(freshRule).toBeDefined();
      expect(shadow.adoptedStyleSheets).toEqual([sentinel, getController().sheet]);
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      expect(getController().getActiveEffects()).toEqual(['selected']);
    }
  });

  it.each(['set', 'delete', 'configured set'])(
    'does not recursively close a structural controller that reenters during %s',
    (operation) => {
      const owner = Interact.create({ interactions: [] });
      const latest = structuralController(vi.fn());
      const contender = structuralController(vi.fn());
      const part = document.createElement('span');
      const disconnect = vi.fn(() => {
        if (disconnect.mock.calls.length > 1) throw new Error('Recursive disconnect');
        part.remove();
        if (operation === 'set') Interact.setController(targetKey, latest);
        else Interact.deleteController(targetKey);
      });
      const previous = structuralController(disconnect);
      previous.element.append(part);
      owner.setController(targetKey, previous);

      if (operation === 'set') Interact.setController(targetKey, contender);
      else if (operation === 'configured set') owner.setController(targetKey, contender);
      else Interact.deleteController(targetKey);

      expect(disconnect).toHaveBeenCalledTimes(1);
      expect(part.parentElement).toBeNull();
      expect(Interact.getController(targetKey)).toBe(
        operation === 'set' ? latest : operation === 'configured set' ? contender : undefined,
      );
    },
  );

  it('propagates a structural disconnect error and allows a later close of the same record', () => {
    const author = Interact.create({ interactions: [] });
    const failure = new Error('Cannot close yet');
    const disconnect = vi
      .fn()
      .mockImplementationOnce(() => {
        throw failure;
      })
      .mockImplementationOnce(() => Interact.deleteController(targetKey));
    const controller = structuralController(disconnect);
    author.setController(targetKey, controller);

    let observed: unknown;
    try {
      Interact.deleteController(targetKey);
    } catch (error) {
      observed = error;
    }
    expect(observed).toBe(failure);
    expect(getController()).toBe(controller);

    Interact.deleteController(targetKey);

    expect(disconnect).toHaveBeenCalledTimes(2);
    expect(Interact.getController(targetKey)).toBeUndefined();
  });
});
