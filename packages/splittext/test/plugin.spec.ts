import { afterEach, describe, expect, it, vi } from 'vitest';
import { splitTextPlugin } from '../src/plugin';

// MutationObserver callbacks run after the task that made the mutations.
const flushMutations = () => new Promise((resolve) => setTimeout(resolve));

const aRoot = () => {
  const root = document.createElement('section');
  root.innerHTML = '<div class="host"><h2 class="title">Hi there</h2></div>';
  document.body.appendChild(root);
  return root;
};

describe('splitTextPlugin refresh', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('asks for a refresh once a re-render replaces a split container', async () => {
    const root = aRoot();
    const refresh = vi.fn();
    splitTextPlugin({ container: '.title', type: 'chars' }, { root, refresh });

    // As a hydration that doesn't match the split DOM: the whole component is rendered again
    const host = root.querySelector('.host')!;
    const rendered = document.createElement('div');
    rendered.className = 'host';
    rendered.innerHTML = '<h2 class="title">Hi there</h2>';
    host.replaceWith(rendered);
    await flushMutations();

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("doesn't ask for one for its own split or for other changes in the root", async () => {
    const root = aRoot();
    const refresh = vi.fn();
    splitTextPlugin({ container: '.title', type: ['words', 'chars'] }, { root, refresh });
    root.appendChild(document.createElement('p'));
    root.querySelector('.title')!.setAttribute('data-other', '');
    await flushMutations();

    expect(root.querySelectorAll('.split-c').length).toBeGreaterThan(0);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("doesn't ask for one after its cleanup", async () => {
    const root = aRoot();
    const refresh = vi.fn();
    const cleanup = splitTextPlugin({ container: '.title', type: 'chars' }, { root, refresh });

    cleanup?.();
    root.querySelector('.host')!.remove();
    await flushMutations();

    expect(refresh).not.toHaveBeenCalled();
  });

  it('asks for a refresh when an ancestor between the root and the container is replaced', async () => {
    const root = document.createElement('section');
    root.innerHTML =
      '<div class="host"><div class="inner"><h2 class="title">Hi there</h2></div></div>';
    document.body.appendChild(root);
    const refresh = vi.fn();
    splitTextPlugin({ container: '.title', type: 'chars' }, { root, refresh });

    const rendered = document.createElement('div');
    rendered.className = 'inner';
    rendered.innerHTML = '<h2 class="title">Hi there</h2>';
    root.querySelector('.inner')!.replaceWith(rendered);
    await flushMutations();

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('asks for one refresh when a re-render replaces several split containers', async () => {
    const root = document.createElement('section');
    root.innerHTML = [1, 2, 3]
      .map((i) => `<div class="host"><h2 class="title">Title ${i}</h2></div>`)
      .join('');
    document.body.appendChild(root);
    const refresh = vi.fn();
    splitTextPlugin({ container: '.title', type: 'chars' }, { root, refresh });

    root.querySelectorAll('.host').forEach((host) => host.replaceWith(host.cloneNode(false)));
    await flushMutations();

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("asks for a refresh when a re-render replaces the container's children and keeps it", async () => {
    const root = aRoot();
    const refresh = vi.fn();
    splitTextPlugin({ container: '.title', type: 'chars' }, { root, refresh });

    root.querySelector('.title')!.innerHTML = 'Hi there';
    await flushMutations();

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("doesn't ask for one when the container moves", async () => {
    const root = aRoot();
    root.insertAdjacentHTML('beforeend', '<div class="elsewhere"></div>');
    const refresh = vi.fn();
    splitTextPlugin({ container: '.title', type: 'chars' }, { root, refresh });

    root.querySelector('.elsewhere')!.appendChild(root.querySelector('.host')!);
    await flushMutations();

    expect(refresh).not.toHaveBeenCalled();
  });

  it("doesn't ask for one when autoSplit re-splits the container", async () => {
    const resized: Array<(entries: unknown[]) => void> = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: (entries: unknown[]) => void) {
          resized.push(callback);
        }
        observe() {}
        disconnect() {}
      },
    );
    const root = aRoot();
    const title = root.querySelector<HTMLElement>('.title')!;
    const refresh = vi.fn();
    const onSplit = vi.fn();
    splitTextPlugin(
      { container: '.title', type: 'chars', autoSplit: true, onSplit },
      { root, refresh },
    );
    const firstChars = [...title.querySelectorAll('.split-c')];

    resized[0]([{ target: title, borderBoxSize: [{ inlineSize: 321 }] }]);
    await flushMutations();

    expect(title.querySelector('.split-c')).not.toBe(firstChars[0]);
    expect(onSplit).toHaveBeenCalledTimes(2);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('marks the split with one hidden sentinel and no MutationObserver', () => {
    const root = aRoot();
    const observer = vi.spyOn(globalThis, 'MutationObserver');

    splitTextPlugin({ container: '.title', type: 'chars' }, { root, refresh: vi.fn() });

    const sentinels = root.querySelectorAll<HTMLElement>('.title > splittext-sentinel');
    expect(sentinels).toHaveLength(1);
    expect(sentinels[0].hidden).toBe(true);
    expect(sentinels[0].getAttribute('aria-hidden')).toBe('true');
    expect(observer).not.toHaveBeenCalled();
  });

  it('removes the sentinel with the split on cleanup', () => {
    const root = aRoot();
    const cleanup = splitTextPlugin(
      { container: '.title', type: 'chars' },
      { root, refresh: vi.fn() },
    );

    cleanup?.();

    expect(root.querySelector('splittext-sentinel')).toBeNull();
    expect(root.querySelector('.title')!.innerHTML).toBe('Hi there');
  });

  it('splits without a refresh from an Interact version that passes none', () => {
    const root = aRoot();

    splitTextPlugin({ container: '.title', type: 'chars' }, { root });

    expect(root.querySelectorAll('.split-c').length).toBeGreaterThan(0);
  });
});
