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

  it('splits without a refresh from an Interact version that passes none', () => {
    const root = aRoot();

    splitTextPlugin({ container: '.title', type: 'chars' }, { root });

    expect(root.querySelectorAll('.split-c').length).toBeGreaterThan(0);
  });
});
