import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { add, Interact, remove, type InteractConfig } from '../src';
import { InteractionController } from '../src/core/InteractionController';

const interactions: InteractConfig = {
  interactions: [
    {
      key: 'source',
      trigger: 'click',
      listContainer: 'ol',
      selector: 'button',
      effects: [
        { key: 'target', effectId: 'selected', stateAction: 'toggle', transitionProperties: [] },
      ],
    },
  ],
};

function makeList() {
  const root = document.createElement('div');
  const list = document.createElement('ol');
  root.append(list);
  return { root, list };
}

function appendRow(list: HTMLOListElement) {
  const row = document.createElement('li');
  const button = document.createElement('button');
  row.append(button);
  list.append(row);
  return button;
}

function appendTarget() {
  const target = document.createElement('div');
  add(target, 'target');
  return target;
}

function click(element: HTMLElement) {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
}

function flushMutations() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe('physical list observation', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'CSSStyleSheet',
      class {
        cssRules = [];
        replaceSync() {}
        insertRule() {}
      },
    );
    document.adoptedStyleSheets = [];
  });

  afterEach(() => {
    Interact.destroy();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('binds each appended row once after remounting the same controller', async () => {
    Interact.create(interactions);
    const { root, list } = makeList();
    const target = appendTarget();
    const controller = new InteractionController(root, 'source');
    controller.connect();
    controller.disconnect();
    controller.connect();

    const action = appendRow(list);
    await flushMutations();
    click(action);

    expect(target.dataset.interactEffect).toBe('selected');
  });

  it('stops delivering mutations when the observed list leaves its controller root', async () => {
    Interact.create(interactions);
    const target = appendTarget();
    const { root, list } = makeList();
    const controller = new InteractionController(root, 'source');
    const delivery = vi.spyOn(controller, '_childListChangeHandler');
    controller.connect();

    const first = appendRow(list);
    await flushMutations();
    click(first);
    expect(target.dataset.interactEffect).toBe('selected');

    const replacement = document.createElement('ol');
    list.replaceWith(replacement);
    const detached = appendRow(list);
    appendRow(replacement);
    await flushMutations();
    click(detached);

    expect(delivery).toHaveBeenCalledTimes(1);
    expect(target.dataset.interactEffect).toBe('selected');
    expect(Interact.getController('source')).toBe(controller);

    controller.watchChildList('ol');
    const next = appendRow(replacement);
    await flushMutations();
    click(next);
    expect(delivery).toHaveBeenCalledTimes(2);
    expect(target.dataset.interactEffect).toBe('');
  });

  it('stops delivering queued and subsequent list mutations after full teardown', async () => {
    Interact.create(interactions);
    appendTarget();
    const { root, list } = makeList();
    const controller = new InteractionController(root, 'source');
    const delivery = vi.spyOn(controller, '_childListChangeHandler');
    controller.connect();

    appendRow(list);
    Interact.destroy();
    appendRow(list);
    await flushMutations();

    expect(delivery).not.toHaveBeenCalled();
  });

  it('preserves the fresh watch installed by synchronous plugin cleanup resume', async () => {
    const { root, list } = makeList();
    const controller = new InteractionController(root, 'source');
    let resumed = false;
    Interact.use('resume-list', () => () => {
      if (!resumed) {
        resumed = true;
        controller.resume();
      }
    });
    Interact.create({
      interactions: interactions.interactions.map((interaction) => ({
        ...interaction,
        '$resume-list': {},
      })),
    });
    const target = appendTarget();
    controller.connect();
    controller.disconnect();

    const action = appendRow(list);
    await flushMutations();
    click(action);

    expect(Interact.getController('source')).toBe(controller);
    expect(target.dataset.interactEffect).toBe('selected');

    controller.watchChildList('ol');
    const next = appendRow(list);
    await flushMutations();
    click(next);
    expect(target.dataset.interactEffect).toBe('');
  });

  it('promotes an observed pending controller while keeping detached manual roots valid', async () => {
    const { root, list } = makeList();
    const controller = new InteractionController(root, 'source');
    const delivery = vi.spyOn(controller, '_childListChangeHandler');
    controller.connect();
    controller.watchChildList('ol');

    Interact.create(interactions);
    const target = appendTarget();
    const action = appendRow(list);
    await flushMutations();
    click(action);

    expect(delivery).toHaveBeenCalledTimes(1);
    expect(target.dataset.interactEffect).toBe('selected');
    remove('source');
    appendRow(list);
    await flushMutations();
    expect(delivery).toHaveBeenCalledTimes(1);
  });

  it('does not replay a row insertion from before its list started observation', async () => {
    Interact.use('late-list', () => {}, { defer: 'late-list' });
    const [interaction] = interactions.interactions;
    Interact.create({
      interactions: [
        { ...interaction, listContainer: '.first' },
        { ...interaction, listContainer: '.second', '$late-list': {} },
      ],
    });
    const { root, list: first } = makeList();
    first.className = 'first';
    const second = document.createElement('ol');
    second.className = 'second';
    root.append(second);
    const target = appendTarget();
    appendRow(first);
    add(root, 'source');

    const queued = appendRow(first);
    const action = appendRow(second);
    Interact.ready('late-list');
    await flushMutations();
    click(queued);
    expect(target.dataset.interactEffect).toBe('selected');
    click(action);
    expect(target.dataset.interactEffect).toBe('');
  });

  it('keeps the other registered list active when one container leaves the root', async () => {
    const [interaction] = interactions.interactions;
    Interact.create({
      interactions: ['.first', '.second'].map((listContainer) => ({
        ...interaction,
        listContainer,
      })),
    });
    const { root, list: first } = makeList();
    first.className = 'first';
    const second = document.createElement('ol');
    second.className = 'second';
    root.append(second);
    const target = appendTarget();
    const controller = new InteractionController(root, 'source');
    const delivery = vi.spyOn(controller, '_childListChangeHandler');
    controller.connect();

    first.remove();
    const detached = appendRow(first);
    const current = appendRow(second);
    await flushMutations();
    click(detached);
    expect(target.dataset.interactEffect).toBeUndefined();
    click(current);
    expect(target.dataset.interactEffect).toBe('selected');
    expect(delivery).toHaveBeenCalledTimes(1);
  });
});
