import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { add, Interact, remove, type InteractConfig } from '../src/web';

const targetTemplate = 'catalog/[]/cards/[]/target';
const sourceTemplate = 'catalog/[]/controls/[]/source';
const sourceKey = 'catalog/[local]/controls/[button]/source';
const oldKey = 'catalog/[local]/cards/[old]/target';
const newKey = 'catalog/[local]/cards/[new]/target';
const unrelatedKey = 'catalog/[remote]/cards/[old]/target';

function config(source: string): InteractConfig {
  return {
    interactions: [
      {
        key: source,
        trigger: 'click',
        effects: [
          {
            key: targetTemplate,
            effectId: 'active',
            stateAction: 'toggle',
            transitionProperties: [],
          },
        ],
      },
    ],
  };
}

function mount(key: string, web: boolean) {
  const button = document.createElement('button');
  if (!web) {
    add(button, key);
    return { root: button, button, remove: () => remove(key) };
  }
  const root = document.createElement('interact-element');
  root.dataset.interactKey = key;
  root.append(button);
  document.body.append(root);
  return { root, button, remove: () => root.remove() };
}

function click(button: HTMLButtonElement) {
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
}

describe('physical controller matching', () => {
  beforeEach(() => {
    document.adoptedStyleSheets = [];
    vi.stubGlobal(
      'CSSStyleSheet',
      class {
        cssRules = [];
        insertRule() {}
        replaceSync() {}
      },
    );
  });

  afterEach(() => {
    Interact.destroy();
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it.each([true, false])(
    'matches mounted siblings across configuration owners (web: %s)',
    (web) => {
      const options = { useCustomElement: web };
      const first = Interact.create(config('unused'), options);
      const older = mount(oldKey, web);
      const olderController = Interact.getController(oldKey);
      expect(olderController?.connected).toBe(true);

      first.init({ interactions: [] }, options);
      Interact.create(config(sourceTemplate), options);
      const newer = mount(newKey, web);
      const unrelated = mount(unrelatedKey, web);
      const source = mount(sourceKey, web);
      click(source.button);

      expect(older.root.dataset.interactEffect).toBe('active');
      expect(newer.root.dataset.interactEffect).toBe('active');
      expect(unrelated.root.dataset.interactEffect).toBeUndefined();
      expect(Interact.getController(oldKey)).toBe(olderController);

      older.remove();
      older.root.dataset.interactEffect = '';
      click(source.button);

      expect(Interact.getController(oldKey)).toBeUndefined();
      expect(older.root.dataset.interactEffect).toBe('');
      expect(newer.root.dataset.interactEffect).toBe('');
      expect(
        [...Interact.getMatchingControllers(sourceKey, targetTemplate)].map(([key]) => key),
      ).toEqual([newKey]);
    },
  );

  it('preserves the controller mounted by a predecessor cleanup', () => {
    let originalRoot: HTMLElement | undefined;
    let latest: ReturnType<typeof mount> | undefined;
    Interact.use('physical-index-replacement', (_value, { root }) => {
      if (root === originalRoot) {
        return () => {
          latest = mount(oldKey, true);
        };
      }
    });
    const authored = config(sourceTemplate);
    const effect = authored.interactions[0].effects?.[0];
    if (!effect) throw new Error('Missing replacement effect');
    effect['$physical-index-replacement'] = {};
    Interact.create(authored);
    const original = document.createElement('interact-element');
    original.dataset.interactKey = oldKey;
    original.append(document.createElement('button'));
    originalRoot = original;
    document.body.append(original);
    const source = mount(sourceKey, true);

    const contender = mount(oldKey, true);
    click(source.button);

    expect(latest?.root.dataset.interactEffect).toBe('active');
    expect(Interact.getController(oldKey)?.element).toBe(latest?.root);
    expect(contender.root.dataset.interactEffect).toBeUndefined();
    contender.remove();
    original.remove();
    click(source.button);

    expect(latest?.root.dataset.interactEffect).toBe('');
    expect(Interact.getController(oldKey)?.element).toBe(latest?.root);
  });

  it('drops the mounted records on global teardown and binds only current targets on restart', () => {
    Interact.create(config(sourceTemplate));
    const source = mount(sourceKey, true);
    const old = mount(oldKey, true);
    click(source.button);
    Interact.destroy();
    old.remove();

    Interact.create(config(sourceTemplate));
    const target = mount(newKey, true);
    click(source.button);

    expect(Interact.getController(oldKey)).toBeUndefined();
    expect(old.root.dataset.interactEffect).toBe('active');
    expect(target.root.dataset.interactEffect).toBe('active');
    expect(
      [...Interact.getMatchingControllers(sourceKey, targetTemplate)].map(([key]) => key),
    ).toEqual([newKey]);
  });
});
