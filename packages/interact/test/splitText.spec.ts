import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Interact, add, remove, generate, TEXT_SPLIT_STATE_ATTR } from '../src/index';
import type { InteractConfig, SplitTextConfig, SplitTextResolverContext } from '../src/types';
import type { NamedEffect } from '@wix/motion';

// Mock @wix/motion so add()/generate() run without the real animation engine.
vi.mock('@wix/motion', () => {
  const mockAnimation = () => ({
    play: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    reverse: vi.fn(),
    progress: vi.fn(),
    persist: vi.fn(),
    onFinish: vi.fn(),
    isCSS: false,
    playState: 'idle',
    ready: Promise.resolve(),
    finished: Promise.resolve(),
  });

  const mockSequence = {
    play: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    reverse: vi.fn(),
    progress: vi.fn(),
    persist: vi.fn(),
    onFinish: vi.fn(),
    isCSS: false,
    playState: 'idle',
    ready: Promise.resolve(),
    animations: [],
    animationGroups: [],
    addGroups: vi.fn(),
    removeGroups: vi.fn().mockReturnValue([]),
  };

  return {
    getEasing: vi.fn((v: string) => v),
    getJsEasing: vi.fn((v: string) => v),
    getCSSAnimation: vi.fn(() => []),
    getScrubScene: vi.fn(() => ({})),
    getAnimation: vi.fn(() => mockAnimation()),
    getWebAnimation: vi.fn(() => mockAnimation()),
    getElementCSSAnimation: vi.fn(() => null),
    registerEffects: vi.fn(),
    getSequence: vi.fn(() => mockSequence),
    createAnimationGroups: vi.fn(() => []),
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NAMED: NamedEffect = { type: 'FadeIn', power: 'medium' } as NamedEffect;

/**
 * A fake splitText resolver that splits the container's text into `.split-c`
 * spans (one per character) and records the call args + the hide-state
 * attribute observed at resolve time.
 */
function makeFakeResolver() {
  const originals = new WeakMap<Element, string>();

  const resolver = {
    resolve: vi.fn(
      (root: HTMLElement, config: SplitTextConfig, _context: SplitTextResolverContext) => {
        const container = root.querySelector(config.container);
        if (!container) return;
        if (originals.has(container)) return;

        resolver.attrAtResolve = container.getAttribute(TEXT_SPLIT_STATE_ATTR);
        originals.set(container, container.innerHTML);

        const text = container.textContent ?? '';
        container.textContent = '';
        Array.from(text).forEach((ch) => {
          const span = document.createElement('span');
          span.className = 'split-c';
          span.textContent = ch;
          container.appendChild(span);
        });
      },
    ),
    revert: vi.fn((root: HTMLElement, container: string) => {
      const el = root.querySelector(container);
      if (el && originals.has(el)) {
        el.innerHTML = originals.get(el)!;
        originals.delete(el);
      }
    }),
    attrAtResolve: null as string | null,
  };

  return resolver;
}

function makeElement(html: string, key: string): HTMLElement {
  const element = document.createElement('div');
  element.innerHTML = html;
  element.dataset.interactKey = key;
  return element;
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

beforeEach(() => {
  (window as any).IntersectionObserver = class IntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor() {}
  };

  (window as any).CSSStyleSheet = class CSSStyleSheet {
    cssRules: unknown[] = [];
    replaceSync = vi.fn();
    insertRule = vi.fn();
  };

  if (!document.adoptedStyleSheets) {
    (document as any).adoptedStyleSheets = [];
  }

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });

  Interact.allowA11yTriggers = false;
});

afterEach(() => {
  Interact.destroy();
  // Resolvers persist across destroy by design — clear it for test isolation.
  Interact.use('splitText', undefined);
  Interact.forceReducedMotion = false;
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('resolver registry', () => {
  it('round-trips use() / getResolver()', () => {
    const resolver = makeFakeResolver();
    Interact.use('splitText', resolver);
    expect(Interact.getResolver('splitText')).toBe(resolver);
  });

  it('persists registrations across Interact.destroy()', () => {
    const resolver = makeFakeResolver();
    Interact.use('splitText', resolver);
    Interact.destroy();
    expect(Interact.getResolver('splitText')).toBe(resolver);
  });
});

describe('parseConfig splitText cache', () => {
  it('caches top-level splitText definitions', () => {
    const instance = Interact.create({
      splitText: { hero: { container: '.title', type: 'chars', hide: true } },
      interactions: [],
    });

    expect(instance.dataCache.splitText.hero).toEqual({
      container: '.title',
      type: 'chars',
      hide: true,
    });
  });

  it('merges a splitId ref with its definition (inline overrides win)', () => {
    const resolver = makeFakeResolver();
    Interact.use('splitText', resolver);

    Interact.create({
      splitText: { heroSplit: { container: '.title', type: 'chars', hide: true } },
      interactions: [
        {
          trigger: 'click',
          key: 'hero',
          splitText: { splitId: 'heroSplit', type: 'words' },
          effects: [{ key: 'hero', effectId: 'fx' }],
        },
      ],
      effects: { fx: { namedEffect: NAMED, duration: 100 } },
    });

    add(makeElement('<h1 class="title">Hi</h1>', 'hero'), 'hero');

    const config = resolver.resolve.mock.calls[0][1];
    expect(config).toMatchObject({ container: '.title', type: 'words', hide: true });
  });
});

describe('applySplitText', () => {
  it('splits an interaction-level container and passes the right root/config/context', () => {
    const resolver = makeFakeResolver();
    Interact.use('splitText', resolver);

    Interact.create({
      interactions: [
        {
          trigger: 'click',
          key: 'hero',
          selector: '.trigger',
          splitText: { container: '.title', type: 'chars' },
          effects: [{ key: 'hero', selector: '.split-c', effectId: 'fx' }],
        },
      ],
      effects: { fx: { namedEffect: NAMED, duration: 100 } },
    });

    const element = makeElement(
      '<button class="trigger">x</button><h1 class="title">Hi</h1>',
      'hero',
    );
    add(element, 'hero');

    expect(resolver.resolve).toHaveBeenCalledTimes(1);
    const [root, config, context] = resolver.resolve.mock.calls[0];
    expect(root).toBe(element);
    expect(config).toMatchObject({ container: '.title', type: 'chars' });
    expect(context.key).toBe('hero');
    expect(context.selector).toBe('.trigger');
    expect(element.querySelectorAll('.split-c')).toHaveLength(2);
  });

  it('splits a same-element effect-level container with effect-derived context', () => {
    const resolver = makeFakeResolver();
    Interact.use('splitText', resolver);

    Interact.create({
      interactions: [
        {
          trigger: 'click',
          key: 'hero',
          effects: [
            {
              key: 'hero',
              selector: '.split-c',
              effectId: 'fx',
              splitText: { container: '.title', type: 'chars' },
            },
          ],
        },
      ],
      effects: { fx: { namedEffect: NAMED, duration: 100 } },
    });

    const element = makeElement('<h1 class="title">Hi</h1>', 'hero');
    add(element, 'hero');

    expect(resolver.resolve).toHaveBeenCalledTimes(1);
    const context = resolver.resolve.mock.calls[0][2];
    expect(context.key).toBe('hero');
    expect(context.selector).toBe('.split-c');
  });

  it('splits a cross-element container only when the target connects', () => {
    const resolver = makeFakeResolver();
    Interact.use('splitText', resolver);

    Interact.create({
      interactions: [
        {
          trigger: 'click',
          key: 'src',
          effects: [
            {
              key: 'tgt',
              selector: '.split-c',
              effectId: 'fx',
              splitText: { container: '.title', type: 'chars' },
            },
          ],
        },
      ],
      effects: { fx: { namedEffect: NAMED, duration: 100 } },
    });

    const source = makeElement('<span>source</span>', 'src');
    add(source, 'src');
    // Source has no container in its subtree → nothing split yet.
    expect(resolver.resolve).not.toHaveBeenCalled();

    const target = makeElement('<h1 class="title">Hi</h1>', 'tgt');
    add(target, 'tgt');

    expect(resolver.resolve).toHaveBeenCalledTimes(1);
    expect(resolver.resolve.mock.calls[0][0]).toBe(target);
    expect(target.querySelectorAll('.split-c')).toHaveLength(2);
  });

  it('dedupes by container — one split per container per connect', () => {
    const resolver = makeFakeResolver();
    Interact.use('splitText', resolver);

    Interact.create({
      interactions: [
        {
          trigger: 'click',
          key: 'hero',
          effects: [
            {
              key: 'hero',
              selector: '.split-c',
              effectId: 'a',
              splitText: { container: '.title', type: 'chars' },
            },
            {
              key: 'hero',
              selector: '.split-c',
              effectId: 'b',
              splitText: { container: '.title', type: 'chars' },
            },
          ],
        },
      ],
      effects: { fx: { namedEffect: NAMED, duration: 100 } },
    });

    add(makeElement('<h1 class="title">Hi</h1>', 'hero'), 'hero');

    expect(resolver.resolve).toHaveBeenCalledTimes(1);
  });

  it('throws when splitText is present but no resolver is registered', () => {
    Interact.use('splitText', undefined);

    Interact.create({
      interactions: [
        {
          trigger: 'click',
          key: 'hero',
          splitText: { container: '.title', type: 'chars' },
          effects: [{ key: 'hero', effectId: 'fx' }],
        },
      ],
      effects: { fx: { namedEffect: NAMED, duration: 100 } },
    });

    expect(() => add(makeElement('<h1 class="title">Hi</h1>', 'hero'), 'hero')).toThrow(
      /no resolver registered/,
    );
  });
});

describe('hide / FOUC guard', () => {
  function hideConfig(): InteractConfig {
    return {
      interactions: [
        {
          trigger: 'click',
          key: 'hero',
          splitText: { container: '.title', type: 'chars', hide: true },
          effects: [{ key: 'hero', selector: '.split-c', effectId: 'fx' }],
        },
      ],
      effects: { fx: { namedEffect: NAMED, duration: 100 } },
    };
  }

  it('stamps "pending" before split and "split" after', () => {
    const resolver = makeFakeResolver();
    Interact.use('splitText', resolver);
    Interact.create(hideConfig());

    const element = makeElement('<h1 class="title">Hi</h1>', 'hero');
    add(element, 'hero');

    expect(resolver.attrAtResolve).toBe('pending');
    expect(element.querySelector('.title')!.getAttribute(TEXT_SPLIT_STATE_ATTR)).toBe('split');
  });

  it('removes the hide attribute on disconnect/revert', () => {
    Interact.use('splitText', makeFakeResolver());
    Interact.create(hideConfig());

    const element = makeElement('<h1 class="title">Hi</h1>', 'hero');
    add(element, 'hero');
    remove('hero');

    expect(element.querySelector('.title')!.hasAttribute(TEXT_SPLIT_STATE_ATTR)).toBe(false);
  });

  it('reveals (split) even under reduced motion', () => {
    Interact.forceReducedMotion = true;
    Interact.use('splitText', makeFakeResolver());
    Interact.create(hideConfig());

    const element = makeElement('<h1 class="title">Hi</h1>', 'hero');
    add(element, 'hero');

    expect(element.querySelector('.title')!.getAttribute(TEXT_SPLIT_STATE_ATTR)).toBe('split');
  });
});

describe('integration: split spans become targets', () => {
  it('resolves split spans as animation targets and reverts on disconnect', async () => {
    const { getAnimation } = await import('@wix/motion');
    Interact.use('splitText', makeFakeResolver());

    Interact.create({
      interactions: [
        {
          trigger: 'viewEnter',
          key: 'hero',
          splitText: { container: '.title', type: 'chars' },
          effects: [{ key: 'hero', selector: '.split-c', effectId: 'fx' }],
        },
      ],
      effects: { fx: { namedEffect: NAMED, duration: 100 } },
    });

    const element = makeElement('<h1 class="title">Hi</h1>', 'hero');
    add(element, 'hero');

    // Split happened during add(), so target resolution found the spans.
    expect(element.querySelectorAll('.split-c')).toHaveLength(2);
    expect(getAnimation).toHaveBeenCalledTimes(2);
    const targets = (getAnimation as any).mock.calls.map((c: any[]) => c[0] as HTMLElement);
    targets.forEach((t: HTMLElement) => expect(t.classList.contains('split-c')).toBe(true));

    remove('hero');
    expect(element.querySelector('.split-c')).toBeNull();
    expect(element.querySelector('.title')!.innerHTML).toBe('Hi');
  });

  it('builds a sequence with split-span targets', async () => {
    const { getSequence } = await import('@wix/motion');
    Interact.use('splitText', makeFakeResolver());

    Interact.create({
      interactions: [
        {
          trigger: 'viewEnter',
          key: 'hero',
          splitText: { container: '.title', type: 'chars' },
          sequences: [
            {
              effects: [{ key: 'hero', selector: '.split-c', effectId: 'fx' }],
            },
          ],
        },
      ],
      effects: { fx: { namedEffect: NAMED, duration: 100 } },
    });

    add(makeElement('<h1 class="title">Hi</h1>', 'hero'), 'hero');

    expect(getSequence).toHaveBeenCalled();
    // Interact.getSequence calls the motion getSequence as (sequenceOptions, animationGroupArgs, context).
    const animationGroupArgs = (getSequence as any).mock.calls[0][1];
    const target = animationGroupArgs[0].target as HTMLElement[];
    expect(Array.isArray(target)).toBe(true);
    expect(target.length).toBe(2);
    expect(target.every((t) => t.classList.contains('split-c'))).toBe(true);
  });
});

describe('generate() hide rule', () => {
  const HIDE_RULE = `[${TEXT_SPLIT_STATE_ATTR}]:not([${TEXT_SPLIT_STATE_ATTR}="split"]){visibility:hidden}`;

  it('emits the hide rule when a hide splitText is present', () => {
    const css = generate({
      interactions: [
        {
          trigger: 'click',
          key: 'hero',
          splitText: { container: '.title', type: 'chars', hide: true },
          effects: [{ key: 'hero', effectId: 'fx' }],
        },
      ],
      effects: {
        fx: { transition: { duration: 100, styleProperties: [{ name: 'opacity', value: '0' }] } },
      },
    });

    expect(css).toContain(HIDE_RULE);
  });

  it('emits the hide rule when resolved through a splitId ref', () => {
    const css = generate({
      splitText: { s: { container: '.title', type: 'chars', hide: true } },
      interactions: [
        {
          trigger: 'click',
          key: 'hero',
          splitText: { splitId: 's' },
          effects: [{ key: 'hero', effectId: 'fx' }],
        },
      ],
      effects: {
        fx: { transition: { duration: 100, styleProperties: [{ name: 'opacity', value: '0' }] } },
      },
    });

    expect(css).toContain(HIDE_RULE);
  });

  it('does not emit the hide rule when no hide is set', () => {
    const css = generate({
      interactions: [
        {
          trigger: 'click',
          key: 'hero',
          splitText: { container: '.title', type: 'chars' },
          effects: [{ key: 'hero', effectId: 'fx' }],
        },
      ],
      effects: {
        fx: { transition: { duration: 100, styleProperties: [{ name: 'opacity', value: '0' }] } },
      },
    });

    expect(css).not.toContain(TEXT_SPLIT_STATE_ATTR);
  });
});
