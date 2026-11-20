import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { add, Interact, remove, type StateAction } from '../src';
import { createMediaQueryList } from './matchMedia';

function state(key: string, effectId = 'active', stateAction: StateAction = 'toggle') {
  return { key, effectId, stateAction, transitionProperties: [] };
}

function mount(key: string): HTMLButtonElement {
  const element = document.createElement('button');
  document.body.append(element);
  add(element, key);
  return element;
}

function click(element: HTMLElement) {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
}

describe('displayed target pairing', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'CSSStyleSheet',
      class {
        replaceSync() {}
        insertRule() {}
        cssRules = [];
      },
    );
    document.adoptedStyleSheets = [];
  });

  afterEach(() => {
    Interact.destroy();
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it.each([true, false])(
    'a singleton source reaches every repeated target (source first: %s)',
    (sourceFirst) => {
      Interact.create({
        interactions: [
          {
            key: 'source',
            trigger: 'click',
            effects: [
              {
                key: 'items/[]/target',
                stateAction: 'add',
                effectId: 'active',
                transitionProperties: [],
              },
            ],
          },
        ],
      });

      let source = sourceFirst ? mount('source') : undefined;
      const first = mount('items/[first]/target');
      const second = mount('items/[second]/target');
      source ??= mount('source');
      click(source);

      expect([first.dataset.interactEffect, second.dataset.interactEffect]).toEqual([
        'active',
        'active',
      ]);
    },
  );

  it.each([
    {
      name: 'same owner and item',
      sourceTemplate: 'items/[]/button',
      targetTemplate: 'items/[]/target',
      sourceKey: 'items/[one]/button',
      targetKeys: ['items/[one]/target', 'items/[two]/target'],
      expected: ['active', undefined],
    },
    {
      name: 'unrelated owners with reused and different IDs',
      sourceTemplate: 'sources/[]/button',
      targetTemplate: 'targets/[]/target',
      sourceKey: 'sources/[one]/button',
      targetKeys: ['targets/[one]/target', 'targets/[different]/target'],
      expected: ['active', 'active'],
    },
    {
      name: 'nested branches that share only their outer owner',
      sourceTemplate: 'outer/[]/inner-a/[]/button',
      targetTemplate: 'outer/[]/inner-b/[]/target',
      sourceKey: 'outer/[one]/inner-a/[common]/button',
      targetKeys: [
        'outer/[one]/inner-b/[common]/target',
        'outer/[one]/inner-b/[different]/target',
        'outer/[two]/inner-b/[common]/target',
      ],
      expected: ['active', 'active', undefined],
    },
    {
      name: 'nested peers that share both owners',
      sourceTemplate: 'outer/[]/inner/[]/button',
      targetTemplate: 'outer/[]/inner/[]/target',
      sourceKey: 'outer/[one]/inner/[common]/button',
      targetKeys: [
        'outer/[one]/inner/[common]/target',
        'outer/[one]/inner/[different]/target',
        'outer/[two]/inner/[common]/target',
      ],
      expected: ['active', undefined, undefined],
    },
  ])('pairs by $name', ({ sourceTemplate, targetTemplate, sourceKey, targetKeys, expected }) => {
    Interact.create({
      interactions: [{ key: sourceTemplate, trigger: 'click', effects: [state(targetTemplate)] }],
    });

    const first = mount(targetKeys[0]);
    const source = mount(sourceKey);
    const rest = targetKeys.slice(1).map(mount);
    click(source);

    expect([first, ...rest].map((target) => target.dataset.interactEffect)).toEqual(expected);
  });

  it.each([true, false])(
    'all repeated sources reach a singleton (source first: %s)',
    (sourceFirst) => {
      Interact.create({
        interactions: [{ key: 'sources/[]/button', trigger: 'click', effects: [state('target')] }],
      });

      let target = sourceFirst ? undefined : mount('target');
      const first = mount('sources/[one]/button');
      const second = mount('sources/[two]/button');
      target ??= mount('target');

      click(first);
      expect(target.dataset.interactEffect).toBe('active');
      click(second);
      expect(target.dataset.interactEffect).toBe('');
    },
  );

  it.each([true, false])(
    'preserves authored order for a pair (source first: %s)',
    (sourceFirst) => {
      Interact.create({
        interactions: [
          { key: 'source', trigger: 'click', effects: [state('target', 'active', 'clear')] },
          { key: 'source', trigger: 'click', effects: [state('target', 'second', 'add')] },
        ],
      });

      const first = mount(sourceFirst ? 'source' : 'target');
      const second = mount(sourceFirst ? 'target' : 'source');
      const [source, target] = sourceFirst ? [first, second] : [second, first];
      target.dataset.interactEffect = 'seed';
      const changes: (readonly string[])[] = [];
      target.addEventListener('interact-state-change', (event) =>
        changes.push(event.detail.activeEffectIds),
      );

      click(source);

      expect(changes).toEqual([[], ['second']]);
    },
  );

  it('allows a later config source to bind to an earlier mounted shared target', () => {
    Interact.create({
      interactions: [{ key: 'menu', trigger: 'click', effects: [state('panel', 'a')] }],
    });
    const target = mount('panel');
    Interact.create({
      interactions: [{ key: 'dismiss', trigger: 'click', effects: [state('panel', 'b')] }],
    });

    click(mount('dismiss'));

    expect(target.dataset.interactEffect).toBe('b');
  });

  it('rebinds a shared target in both configs without invalidating the first config on teardown', () => {
    const targetTemplate = 'panels/[]/content';
    const targetKey = 'panels/[one]/content';
    Interact.create({
      interactions: [{ key: 'menu', trigger: 'click', effects: [state(targetTemplate, 'a')] }],
    });
    const later = Interact.create({
      interactions: [{ key: 'dismiss', trigger: 'click', effects: [state(targetTemplate, 'b')] }],
    });
    const menu = mount('menu');
    const dismiss = mount('dismiss');
    const target = mount(targetKey);

    click(menu);
    click(dismiss);
    expect(target.dataset.interactEffect).toBe('a b');

    remove(targetKey);
    target.remove();
    click(dismiss);
    expect(target.dataset.interactEffect).toBe('a b');

    const replacement = mount(targetKey);
    click(dismiss);
    expect(replacement.dataset.interactEffect).toBe('b');

    later.destroy({ clearCache: true });
    click(dismiss);
    click(menu);
    expect(replacement.dataset.interactEffect).toBe('b a');
  });

  it.each([
    [['first', 'source', 'second']],
    [['second', 'source', 'first']],
    [['source', 'first', 'second']],
    [['source', 'second', 'first']],
    [['first', 'second', 'source']],
    [['second', 'first', 'source']],
  ])('binds both configurations on a shared source with mount order %j', (order) => {
    Interact.create({
      interactions: [{ key: 'source', trigger: 'click', effects: [state('first', 'a')] }],
    });
    Interact.create({
      interactions: [{ key: 'source', trigger: 'click', effects: [state('second', 'b')] }],
    });
    const mounted = new Map(order.map((key) => [key, mount(key)]));
    const source = mounted.get('source');
    expect(source).toBeDefined();
    if (source) {
      click(source);
    }

    expect(mounted.get('first')?.dataset.interactEffect).toBe('a');
    expect(mounted.get('second')?.dataset.interactEffect).toBe('b');
  });

  it.each([true, false])(
    'cleans up only its own binding when both endpoints are shared (source first: %s)',
    (sourceFirst) => {
      Interact.create({
        interactions: [{ key: 'source', trigger: 'click', effects: [state('target', 'a')] }],
      });
      const later = Interact.create({
        interactions: [{ key: 'source', trigger: 'click', effects: [state('target', 'b')] }],
      });
      const first = mount(sourceFirst ? 'source' : 'target');
      const second = mount(sourceFirst ? 'target' : 'source');
      const [source, target] = sourceFirst ? [first, second] : [second, first];

      click(source);
      expect(target.dataset.interactEffect).toBe('a b');

      later.destroy({ clearCache: true });
      click(source);
      expect(target.dataset.interactEffect).toBe('b');
      click(source);
      expect(target.dataset.interactEffect).toBe('b a');
    },
  );

  it('releases media listeners when a config sharing both physical endpoints is destroyed', () => {
    const events = new EventTarget();
    const media = createMediaQueryList('(min-width: 600px)', true);
    media.addEventListener = vi.fn(events.addEventListener.bind(events));
    media.removeEventListener = vi.fn(events.removeEventListener.bind(events));
    vi.stubGlobal('matchMedia', (query: string) =>
      query === media.media ? media : createMediaQueryList(query, true),
    );
    Interact.create({
      interactions: [{ key: 'source', trigger: 'click', effects: [state('target', 'a')] }],
    });
    const later = Interact.create({
      conditions: { wide: { type: 'media', predicate: 'min-width: 600px' } },
      interactions: [
        {
          key: 'source',
          trigger: 'click',
          reducedMotionPolicy: 'ignore',
          conditions: ['wide'],
          effects: [{ ...state('target', 'b'), conditions: ['wide'] }],
        },
      ],
    });
    const target = mount('target');
    const source = mount('source');
    click(source);
    expect(target.dataset.interactEffect).toBe('a b');
    expect(media.addEventListener).toHaveBeenCalledTimes(2);

    later.destroy({ clearCache: true });
    expect(media.removeEventListener).toHaveBeenCalledTimes(2);
    events.dispatchEvent(new Event('change'));
    click(source);
    expect(target.dataset.interactEffect).toBe('b');
  });

  it('distinguishes authored positions when interactions reuse an effect object', () => {
    const effect = state('target');
    Interact.create({
      interactions: [
        { key: 'source', trigger: 'click', effects: [effect] },
        { key: 'source', trigger: 'click', effects: [effect] },
      ],
    });

    const source = mount('source');
    const target = mount('target');
    const changes: (readonly string[])[] = [];
    target.addEventListener('interact-state-change', (event) =>
      changes.push(event.detail.activeEffectIds),
    );

    click(source);

    expect(changes).toEqual([['active'], []]);
  });

  it('retires the old controller when a new element registers the same key', () => {
    Interact.create({
      interactions: [{ key: 'source', trigger: 'click', effects: [state('target')] }],
    });
    const first = mount('source');
    const oldController = Interact.getController('source');
    const target = mount('target');
    const replacement = mount('source');

    click(first);
    expect(target.dataset.interactEffect).toBeUndefined();

    oldController?.disconnect({ removeFromCache: true });
    click(replacement);
    expect(target.dataset.interactEffect).toBe('active');
  });

  it('cleans up only the detached endpoint pairs and binds new identities once', () => {
    Interact.create({
      interactions: [
        { key: 'sources/[]/button', trigger: 'click', effects: [state('targets/[]/element')] },
      ],
    });
    const firstSourceKey = 'sources/[one]/button';
    const firstTargetKey = 'targets/[one]/element';
    const firstSource = mount(firstSourceKey);
    const secondSource = mount('sources/[two]/button');
    const firstTarget = mount(firstTargetKey);
    const secondTarget = mount('targets/[two]/element');

    click(firstSource);
    expect([firstTarget.dataset.interactEffect, secondTarget.dataset.interactEffect]).toEqual([
      'active',
      'active',
    ]);

    remove(firstSourceKey);
    firstSource.remove();
    click(firstSource);
    expect([firstTarget.dataset.interactEffect, secondTarget.dataset.interactEffect]).toEqual([
      'active',
      'active',
    ]);

    click(secondSource);
    expect([firstTarget.dataset.interactEffect, secondTarget.dataset.interactEffect]).toEqual([
      '',
      '',
    ]);

    const sourceReplacement = mount(firstSourceKey);
    add(sourceReplacement, firstSourceKey);
    click(sourceReplacement);
    expect([firstTarget.dataset.interactEffect, secondTarget.dataset.interactEffect]).toEqual([
      'active',
      'active',
    ]);

    remove(firstTargetKey);
    firstTarget.remove();
    click(secondSource);
    expect([firstTarget.dataset.interactEffect, secondTarget.dataset.interactEffect]).toEqual([
      'active',
      '',
    ]);

    const targetReplacement = mount(firstTargetKey);
    click(sourceReplacement);
    expect([
      firstTarget.dataset.interactEffect,
      targetReplacement.dataset.interactEffect,
      secondTarget.dataset.interactEffect,
    ]).toEqual(['active', 'active', 'active']);
  });

  it('keeps an independent controller active inside a reordered row and rebinds the list once', async () => {
    Interact.create({
      interactions: [
        {
          key: 'host',
          listContainer: 'ol',
          selector: '.row-action',
          trigger: 'click',
          effects: [state('outer-target', 'outer')],
        },
      ],
    });
    Interact.create({
      interactions: [
        { key: 'nested', trigger: 'click', effects: [state('nested-target', 'nested')] },
      ],
    });

    const host = document.createElement('div');
    const list = document.createElement('ol');
    const row = document.createElement('li');
    const rowAction = document.createElement('button');
    const nested = document.createElement('button');
    rowAction.className = 'row-action';
    row.append(rowAction, nested);
    list.append(row, document.createElement('li'));
    host.append(list);
    document.body.append(host);
    add(host, 'host');
    const outerTarget = mount('outer-target');
    const nestedTarget = mount('nested-target');
    add(nested, 'nested');

    click(rowAction);
    click(nested);
    expect(outerTarget.dataset.interactEffect).toBe('outer');
    expect(nestedTarget.dataset.interactEffect).toBe('nested');

    list.append(row);
    await new Promise((resolve) => setTimeout(resolve, 0));
    click(rowAction);
    click(nested);

    expect(outerTarget.dataset.interactEffect).toBe('');
    expect(nestedTarget.dataset.interactEffect).toBe('');
  });

  it('rebinds both authored aliases of a single physical list after a reorder', async () => {
    Interact.create({
      interactions: ['ol', '.items'].map((listContainer, index) => ({
        key: 'host',
        listContainer,
        selector: 'button',
        trigger: 'click' as const,
        effects: [state('target', index === 0 ? 'tag' : 'class')],
      })),
    });
    const host = document.createElement('div');
    const list = document.createElement('ol');
    list.className = 'items';
    const row = document.createElement('li');
    const action = document.createElement('button');
    row.append(action);
    list.append(row, document.createElement('li'));
    host.append(list);
    document.body.append(host);
    add(host, 'host');
    const target = mount('target');

    click(action);
    expect(target.dataset.interactEffect).toBe('tag class');

    list.append(row);
    await new Promise((resolve) => setTimeout(resolve, 0));
    click(action);

    expect(target.dataset.interactEffect).toBe('');
  });

  it.each([false, true])(
    'keeps the destination handler when the destination list observer runs first (nested selector: %s)',
    async (selectDescendant) => {
      Interact.create({
        interactions: ['to', 'from'].map((list) => ({
          key: 'host',
          listContainer: `.${list}`,
          ...(selectDescendant && { selector: 'button' }),
          trigger: 'click' as const,
          effects: [state('target', list)],
        })),
      });
      const host = document.createElement('div');
      const from = document.createElement('ol');
      from.className = 'from';
      const to = document.createElement('ol');
      to.className = 'to';
      const row = document.createElement('li');
      const button = document.createElement('button');
      row.append(button);
      from.append(row);
      host.append(to, from);
      document.body.append(host);
      add(host, 'host');
      const target = mount('target');
      const action = selectDescendant ? button : row;

      click(action);
      expect(target.dataset.interactEffect).toBe('from');

      to.append(document.createElement('li'), row);
      await new Promise((resolve) => setTimeout(resolve, 0));
      click(action);
      expect(target.dataset.interactEffect).toBe('from to');

      from.append(document.createElement('li'), row);
      await new Promise((resolve) => setTimeout(resolve, 0));
      click(action);
      expect(target.dataset.interactEffect).toBe('to');
    },
  );

  it.each([true, false])(
    'skips replaced selections and binds the plugin-generated button (root in document: %s)',
    (connected) => {
      const host = document.createElement('div');
      const former = document.createElement('button');
      const replacement = document.createElement('button');
      replacement.className = 'survivor';
      host.append(former);
      if (connected) {
        document.body.append(host);
      }
      Interact.use('replace-selected', (_value, { root }) => root.replaceChildren(replacement));
      Interact.create({
        interactions: [
          {
            key: 'host',
            selector: 'button',
            trigger: 'click',
            effects: [
              { ...state('host', 'replacement'), selector: '.survivor', '$replace-selected': {} },
              { ...state('host', 'former'), selector: 'button' },
            ],
          },
        ],
      });

      add(host, 'host');
      expect(replacement.parentElement).toBe(host);
      expect(replacement.isConnected).toBe(connected);

      click(former);
      expect(host.dataset.interactEffect).toBeUndefined();
      click(replacement);
      expect(host.dataset.interactEffect).toBe('replacement');
    },
  );

  it('does not bind prepared effects after their plugin destroys the author configuration', () => {
    Interact.create({
      interactions: [{ key: 'host', trigger: 'click', effects: [state('host', 'first')] }],
    });
    const destroyConfig = vi.fn(() => later.destroy({ clearCache: true }));
    Interact.use('destroy-author', destroyConfig);
    const later = Interact.create({
      interactions: [
        {
          key: 'host',
          selector: 'button',
          trigger: 'click',
          effects: [
            { ...state('host', 'destroying'), selector: '.destroying', '$destroy-author': {} },
            { ...state('host', 'queued'), selector: 'button' },
          ],
        },
        { key: 'host', trigger: 'click', effects: [state('host', 'later')] },
      ],
    });
    const host = document.createElement('div');
    const child = document.createElement('button');
    child.className = 'destroying';
    host.append(child);

    add(host, 'host');
    expect(destroyConfig).toHaveBeenCalledOnce();
    expect(Interact.getController('host')?.element).toBe(host);

    click(child);
    expect(host.dataset.interactEffect).toBe('first');
  });

  it.each([false, true])(
    'releases bindings in a replaced subtree while the controller stays mounted (list: %s)',
    async (isList) => {
      const observe = vi.spyOn(MutationObserver.prototype, 'observe');
      const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
      try {
        const list = isList ? { listContainer: 'ol' } : {};
        const instance = Interact.create({
          interactions: [
            {
              key: 'host',
              selector: 'button',
              ...list,
              trigger: 'click',
              effects: [{ ...state('host'), selector: 'button', ...list }],
            },
          ],
        });
        const pairs = vi.spyOn(instance, 'markEffectPair');
        const host = document.createElement('div');
        const part = document.createElement(isList ? 'ol' : 'section');
        part.innerHTML = '<div><button>First</button></div><div><button>Second</button></div>';
        host.append(part, document.createElement('div'));
        document.body.append(host);
        add(host, 'host');

        const bindings = pairs.mock.results[0].value;
        const observedRoots = observe.mock.calls.flatMap(([target, options], index) =>
          target === host && options?.subtree ? [observe.mock.contexts[index]] : [],
        );
        expect(observedRoots.length).toBeGreaterThan(0);
        expect(bindings.size).toBe(2);

        host.append(part);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(bindings.size).toBe(2);

        part.replaceWith(document.createElement(isList ? 'ol' : 'section'));
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(Interact.getController('host')?.element).toBe(host);
        expect(bindings.size).toBe(0);
        for (const observer of observedRoots) {
          expect(disconnect.mock.contexts.filter((entry) => entry === observer)).toHaveLength(1);
        }
      } finally {
        observe.mockRestore();
        disconnect.mockRestore();
      }
    },
  );

  it('disconnects the root observer on teardown and ignores an old queued callback', () => {
    const NativeObserver = MutationObserver;
    const scheduled: { observer: MutationObserver; callback: MutationCallback }[] = [];
    vi.stubGlobal(
      'MutationObserver',
      class extends NativeObserver {
        constructor(callback: MutationCallback) {
          super(callback);
          scheduled.push({ observer: this, callback });
        }
      },
    );
    const disconnect = vi.spyOn(NativeObserver.prototype, 'disconnect');
    try {
      const config = () => ({
        interactions: [
          {
            key: 'host',
            selector: 'button',
            trigger: 'click' as const,
            effects: [state('target')],
          },
        ],
      });
      const first = Interact.create(config());
      const host = document.createElement('div');
      const child = document.createElement('button');
      host.append(child);
      document.body.append(host);
      add(host, 'host');
      const target = mount('target');

      expect(scheduled).toHaveLength(1);
      const queued = scheduled[0];
      child.remove();
      const records = queued.observer.takeRecords();
      expect(records).toHaveLength(1);
      first.destroy({ clearCache: true });
      expect(disconnect.mock.contexts).toEqual([queued.observer]);

      const second = Interact.create(config());
      const replacement = document.createElement('button');
      host.append(replacement);
      add(host, 'host');
      add(target, 'target');
      expect(scheduled).toHaveLength(2);

      queued.callback(records, queued.observer);
      click(child);
      expect(target.dataset.interactEffect).toBeUndefined();
      click(replacement);
      expect(target.dataset.interactEffect).toBe('active');

      second.destroy({ clearCache: true });
      expect(disconnect.mock.contexts).toEqual(scheduled.map(({ observer }) => observer));
    } finally {
      disconnect.mockRestore();
    }
  });

  it('reconciles each affected pair once when the winning media variant changes', () => {
    const media = createMediaQueryList('(min-width: 600px)', false);
    const events = new EventTarget();
    media.addEventListener = events.addEventListener.bind(events);
    media.removeEventListener = events.removeEventListener.bind(events);
    const setWide = (wide: boolean) => {
      Object.defineProperty(media, 'matches', { value: wide, configurable: true });
      events.dispatchEvent(new Event('change'));
    };
    const matchMedia = window.matchMedia;
    vi.stubGlobal('matchMedia', (query: string) =>
      query === media.media ? media : matchMedia(query),
    );
    const template = 'targets/[]/element';
    Interact.create({
      conditions: { wide: { type: 'media', predicate: 'min-width: 600px' } },
      interactions: [
        {
          key: 'source',
          trigger: 'click',
          reducedMotionPolicy: 'ignore',
          effects: [
            state(template, 'narrow'),
            { ...state(template, 'wide'), conditions: ['wide'] },
          ],
        },
      ],
    });

    const first = mount('targets/[one]/element');
    const source = mount('source');
    const second = mount('targets/[two]/element');
    const read = () => [first.dataset.interactEffect, second.dataset.interactEffect];

    click(source);
    expect(read()).toEqual(['narrow', 'narrow']);
    setWide(true);
    click(source);
    expect(read()).toEqual(['narrow wide', 'narrow wide']);
    setWide(false);
    click(source);
    expect(read()).toEqual(['wide', 'wide']);
  });
});
