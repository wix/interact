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

  it("watches only the children of the containers' ancestors up to the root", () => {
    document.body.innerHTML = '<main><section class="root"></section></main>';
    const root = document.querySelector<HTMLElement>('.root')!;
    root.innerHTML =
      '<div class="a"><h2 class="title">One</h2></div>' +
      '<div class="b"><div class="c"><h2 class="title">Two</h2></div></div>' +
      '<div class="busy"><ul><li>other content</li></ul></div>';
    const observe = vi.spyOn(MutationObserver.prototype, 'observe');

    splitTextPlugin({ container: '.title', type: 'chars' }, { root, refresh: vi.fn() });

    const observed = observe.mock.calls.map(([target]) => (target as Element).className);
    expect(observed.sort()).toEqual(['a', 'b', 'c', 'root']);
    expect(observe.mock.calls.every(([, options]) => !options?.subtree)).toBe(true);
    observe.mockRestore();
  });

  it('splits without a refresh from an Interact version that passes none', () => {
    const root = aRoot();

    splitTextPlugin({ container: '.title', type: 'chars' }, { root });

    expect(root.querySelectorAll('.split-c').length).toBeGreaterThan(0);
  });
});
