import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Interact, type InteractConfig, type IInteractionController } from '../src/web';
import { InteractionController } from '../src/core/InteractionController';

function config(
  source: string,
  colors = ['red'],
  options: { plugin?: boolean; listContainer?: string } = {},
): InteractConfig {
  return {
    interactions: colors.map((color) => ({
      key: source,
      trigger: 'click',
      effects: [
        {
          key: 'target',
          selector: '.part',
          effectId: 'selected',
          listContainer: options.listContainer,
          reducedMotionPolicy: 'ignore',
          transitionProperties: [
            { name: 'color', value: color, duration: 60 },
            { name: 'opacity', value: '0.8', duration: 60 },
          ],
          ...(options.plugin ? { '$resume-style-scope': {} } : {}),
        },
      ],
    })),
  };
}

function mount(key: string, parent: HTMLElement | ShadowRoot = document.body, children?: string) {
  const owner = document.createElement('interact-element');
  owner.dataset.interactKey = key;
  owner.innerHTML = children ?? '<button class="part">Target</button>';
  parent.append(owner);
  return owner;
}

function sheetFor(key: string) {
  const sheet = Interact.getController(key)?.sheet;
  if (!sheet) throw new Error('Expected adopted stylesheet');
  return sheet;
}

function mountShadow() {
  const host = document.createElement('div');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const sentinel = new CSSStyleSheet();
  shadow.adoptedStyleSheets = [sentinel];
  return { shadow, sentinel };
}

function interceptNextRender(controller: IInteractionController, reenter: () => void) {
  const renderStyle = controller.renderStyle;
  const read = vi.fn(() => {
    if (read.mock.calls.length === 1) reenter();
    return renderStyle;
  });
  Object.defineProperty(controller, 'renderStyle', { configurable: true, get: read });
  return read;
}

describe('runtime style ownership', () => {
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
    document.adoptedStyleSheets = [];
  });

  afterEach(() => {
    Interact.destroy();
    document.body.replaceChildren();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('retires both parsed generations while preserving identical peer rules', () => {
    Interact.create(config('peer'));
    const target = mount('target');
    mount('peer');
    const sheet = sheetFor('target');
    const peer = Array.from(sheet.cssRules);
    const author = Interact.create(config('old'));
    const old = mount('old');
    const duplicate = Array.from(sheet.cssRules).slice(2);
    expect(duplicate.map((rule) => rule.cssText)).toEqual(peer.map((rule) => rule.cssText));
    expect(duplicate[0]).not.toBe(peer[0]);

    author.init(config('new', ['blue']));
    old.remove();
    const newer = mount('new');
    newer.remove();
    expect(sheet.cssRules).toHaveLength(6);

    author.destroy();

    expect(Interact.getController('target')?.element).toBe(target);
    expect(sheetFor('target')).toBe(sheet);
    expect(document.adoptedStyleSheets).toContain(sheet);
    expect(sheet.cssRules).toHaveLength(2);
    expect(sheet.cssRules[0]).toBe(peer[0]);
    expect(sheet.cssRules[1]).toBe(peer[1]);
  });

  it('cleans the original shadow adoption after the current config stops referring to the target', () => {
    const { shadow, sentinel } = mountShadow();
    const author = Interact.create(config('source'));
    const target = mount('target', shadow);
    mount('source');
    const sheet = sheetFor('target');
    expect(shadow.adoptedStyleSheets).toEqual([sentinel, sheet]);

    author.init({ interactions: [] });
    target.remove();

    expect(shadow.adoptedStyleSheets).toEqual([sentinel]);
    expect(sheet.cssRules).toHaveLength(0);
    expect(Interact.getController('target')).toBeUndefined();
  });

  it('preserves a fresh stylesheet when cleanup resumes the same controller', () => {
    const { shadow, sentinel } = mountShadow();
    let resumed: CSSStyleSheet | undefined;
    Interact.use('resume-style-scope', () => () => {
      Interact.getController('target')?.resume();
      resumed = sheetFor('target');
    });
    Interact.create(config('source', ['red'], { plugin: true }));
    const target = mount('target', shadow);
    mount('source');
    const controller = Interact.getController('target');
    const before = sheetFor('target');

    controller?.disconnect();

    expect(Interact.getController('target')).toBe(controller);
    expect(resumed).not.toBe(before);
    expect(sheetFor('target')).toBe(resumed);
    expect(resumed?.cssRules).toHaveLength(2);
    expect(shadow.adoptedStyleSheets).toEqual([sentinel, resumed]);
    target.remove();
    expect(shadow.adoptedStyleSheets).toEqual([sentinel]);
  });

  it('calls a prototype renderer override and leaves opaque rules to that renderer', () => {
    const renderStyle = vi.spyOn(InteractionController.prototype, 'renderStyle');
    Interact.create(config('peer'));
    const target = mount('target');
    mount('peer');
    const author = Interact.create(config('other'));
    mount('other');
    const sheet = sheetFor('target');
    expect(renderStyle).toHaveBeenCalledTimes(2);
    expect(renderStyle.mock.results.every(({ value }) => value === undefined)).toBe(true);

    author.destroy();

    expect(sheet.cssRules).toHaveLength(4);
    target.remove();
    expect(document.adoptedStyleSheets).not.toContain(sheet);
  });

  it.each(['destroy', 'init'])(
    'rejects a publication when the getter calls author.%s',
    (action) => {
      Interact.create(config('peer'));
      mount('target');
      mount('peer');
      const controller = Interact.getController('target');
      if (!controller) throw new Error('Expected target controller');
      const sheet = sheetFor('target');
      const peerRules = Array.from(sheet.cssRules);
      const author = Interact.create(config('publishing', ['blue']));
      const read = interceptNextRender(controller, () => {
        if (action === 'destroy') author.destroy();
        else author.init({ interactions: [] });
      });

      mount('publishing');

      expect(read).toHaveBeenCalledTimes(1);
      expect(document.adoptedStyleSheets).toEqual([sheet]);
      expect(sheet.cssRules).toHaveLength(2);
      for (const [index, rule] of peerRules.entries()) {
        expect(sheet.cssRules[index]).toBe(rule);
      }
    },
  );

  it.each(['disconnect', 'remove', 'replace'])(
    'does not adopt an obsolete target stylesheet when the getter triggers %s',
    (action) => {
      const { shadow, sentinel } = mountShadow();
      Interact.create(config('peer'));
      const target = mount('target', shadow);
      mount('peer');
      const controller = Interact.getController('target');
      if (!controller) throw new Error('Expected target controller');
      const oldSheet = sheetFor('target');
      const author = Interact.create(config('publishing', ['blue']));
      const read = interceptNextRender(controller, () => {
        if (action === 'disconnect') controller.disconnect();
        else target.remove();
        if (action === 'replace') mount('target', shadow);
      });

      mount('publishing');

      expect(read).toHaveBeenCalledTimes(1);
      expect(controller.sheet).toBeNull();
      expect(oldSheet.cssRules).toHaveLength(0);
      expect(shadow.adoptedStyleSheets).toEqual(
        action === 'replace' ? [sentinel, sheetFor('target')] : [sentinel],
      );
      author.destroy();
      Interact.destroy();
      expect(shadow.adoptedStyleSheets).toEqual([sentinel]);
    },
  );

  it.each(['reconnect', 'remount'])(
    'preserves the reentrant publication when the getter triggers same-controller %s',
    (action) => {
      const { shadow, sentinel } = mountShadow();
      Interact.create(config('peer'));
      const target = mount('target', shadow);
      mount('peer');
      const controller = Interact.getController('target');
      if (!controller) throw new Error('Expected target controller');
      const oldSheet = sheetFor('target');
      Interact.create(config('publishing', ['blue']));
      let freshSheet: CSSStyleSheet | undefined;
      let freshRules: CSSRule[] = [];
      interceptNextRender(controller, () => {
        if (action === 'reconnect') {
          controller.disconnect();
          controller.connect();
        } else {
          target.remove();
          shadow.append(target);
        }
        freshSheet = sheetFor('target');
        freshRules = Array.from(freshSheet.cssRules);
      });

      mount('publishing');

      const sheet = sheetFor('target');
      expect(Interact.getController('target')).toBe(controller);
      expect(sheet).toBe(freshSheet);
      expect(sheet).not.toBe(oldSheet);
      expect(shadow.adoptedStyleSheets).toEqual([sentinel, sheet]);
      expect(freshRules).toHaveLength(4);
      expect(sheet.cssRules).toHaveLength(4);
      for (const [index, rule] of freshRules.entries()) {
        expect(sheet.cssRules[index]).toBe(rule);
      }
      Interact.destroy();
      expect(shadow.adoptedStyleSheets).toEqual([sentinel]);
    },
  );

  it('publishes target CSS when only the source is removed by the getter', () => {
    Interact.create(config('peer'));
    mount('target');
    mount('peer');
    const controller = Interact.getController('target');
    if (!controller) throw new Error('Expected target controller');
    const sheet = sheetFor('target');
    const author = Interact.create(config('publishing', ['blue']));
    const source = document.createElement('interact-element');
    source.dataset.interactKey = 'publishing';
    source.append(document.createElement('button'));
    const read = interceptNextRender(controller, () => source.remove());

    document.body.append(source);

    expect(read).toHaveBeenCalledTimes(1);
    expect(source.isConnected).toBe(false);
    expect(document.adoptedStyleSheets).toEqual([sheet]);
    expect(sheet.cssRules).toHaveLength(4);
    author.destroy();
    expect(sheet.cssRules).toHaveLength(2);
  });

  it('retains distinct authored slots while refreshing the same list sites', async () => {
    Interact.create(config('source', ['red', 'blue', 'red'], { listContainer: 'ol' }));
    const target = mount(
      'target',
      document.body,
      '<ol><li><button class="part">Part</button></li></ol>',
    );
    mount('source');
    const sheet = sheetFor('target');
    const readColors = () =>
      Array.from(sheet.cssRules)
        .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
        .map((rule) => rule.style.getPropertyValue('color'))
        .filter(Boolean);
    expect(readColors()).toEqual(['red', 'blue', 'red']);
    const firstRule = sheet.cssRules[0];
    const list = target.querySelector('ol');
    if (!list) throw new Error('Expected list');
    const row = document.createElement('li');
    row.innerHTML = '<button class="part">Another part</button>';

    list.append(row);
    await vi.waitFor(() => expect(sheet.cssRules[0]).not.toBe(firstRule));
    row.remove();

    expect(readColors()).toEqual(['red', 'blue', 'red']);
    expect(sheet.cssRules).toHaveLength(6);
  });
});
