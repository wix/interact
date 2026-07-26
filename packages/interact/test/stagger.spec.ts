import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Interact } from '../src/web';
import { InteractionController } from '../src/core/InteractionController';
import { addListItems } from '../src/core/add';
import { staggerPropName } from '../src/core/utilities';
import type { InteractConfig } from '../src/types';

// Run fastdom mutations synchronously so per-element stagger writes are observable right away.
vi.mock('fastdom', () => ({
  default: {
    measure: (cb: () => void) => cb(),
    mutate: (cb: () => void) => cb(),
  },
}));

vi.mock('@wix/motion', () => {
  const mockSequence = {
    play: vi.fn(),
    cancel: vi.fn(),
    onFinish: vi.fn(),
    pause: vi.fn(),
    reverse: vi.fn(),
    progress: vi.fn(),
    persist: vi.fn(),
    isCSS: false,
    playState: 'idle',
    ready: Promise.resolve(),
    animations: [],
    animationGroups: [],
    addGroups: vi.fn(),
    removeGroups: vi.fn().mockReturnValue([]),
  };

  return {
    getWebAnimation: vi.fn(),
    getScrubScene: vi.fn(),
    getEasing: vi.fn((v: string) => v),
    getJsEasing: vi.fn(() => (t: number) => t),
    getAnimation: vi.fn(),
    registerEffects: vi.fn(),
    getSequence: vi.fn().mockReturnValue(mockSequence),
    createAnimationGroups: vi.fn().mockReturnValue([]),
  };
});

function createListElement() {
  const element = document.createElement('interact-element') as HTMLElement;
  const child = document.createElement('div');
  const list = document.createElement('ul');
  list.id = 'my-list';
  child.append(list);
  element.append(child);
  return { element, child, list };
}

function createListItems(count: number): HTMLElement[] {
  return Array.from({ length: count }, () => document.createElement('li'));
}

function addElement(element: HTMLElement, key: string) {
  const controller = new InteractionController(element, key, { useFirstChild: true });
  controller.connect(key);
  return controller;
}

function listSequenceConfig(
  overrides?: Partial<InteractConfig['interactions'][number]['sequences']>,
): InteractConfig {
  return {
    effects: {},
    interactions: [
      {
        key: 'list-key',
        trigger: 'click',
        listContainer: '#my-list',
        sequences: [
          {
            sequenceId: 'stg-seq',
            offset: 30,
            delay: 10,
            effects: [
              {
                effectId: 'item-fade',
                key: 'list-key',
                listContainer: '#my-list',
                duration: 200,
                keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
              },
            ],
            ...(overrides as object),
          },
        ],
      },
    ],
  };
}

describe('sequence stagger custom properties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Interact.forceReducedMotion = false;
    (globalThis as any).IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    };
  });

  afterEach(() => {
    Interact.destroy();
  });

  test('writes the running ordinal (linear) as the stagger factor on each matched list element', () => {
    Interact.create(listSequenceConfig(), { useCustomElement: false });
    const { element, list } = createListElement();
    const items = createListItems(3);
    items.forEach((li) => list.append(li));

    addElement(element, 'list-key');

    const prop = staggerPropName('stg-seq', 0);
    expect(items[0].style.getPropertyValue(prop)).toBe('0');
    expect(items[1].style.getPropertyValue(prop)).toBe('1');
    expect(items[2].style.getPropertyValue(prop)).toBe('2');
  });

  test('applies a non-linear offsetEasing function to the factor', () => {
    // easing(t) = t^2; factor_i = (i/last)^2 * last, last = 2
    const config = listSequenceConfig();
    (config.interactions[0].sequences![0] as any).offsetEasing = (t: number) => t * t;

    Interact.create(config, { useCustomElement: false });
    const { element, list } = createListElement();
    const items = createListItems(3);
    items.forEach((li) => list.append(li));

    addElement(element, 'list-key');

    const prop = staggerPropName('stg-seq', 0);
    expect(items[0].style.getPropertyValue(prop)).toBe('0'); // (0/2)^2 * 2
    expect(items[1].style.getPropertyValue(prop)).toBe('0.5'); // (1/2)^2 * 2
    expect(items[2].style.getPropertyValue(prop)).toBe('2'); // (2/2)^2 * 2
  });

  test('continues the ordinal across effects and gives one property per effect on a shared element', () => {
    const config: InteractConfig = {
      effects: {},
      interactions: [
        {
          key: 'list-key',
          trigger: 'click',
          listContainer: '#my-list',
          sequences: [
            {
              sequenceId: 'multi-seq',
              offset: 30,
              effects: [
                {
                  effectId: 'a',
                  key: 'list-key',
                  listContainer: '#my-list',
                  duration: 200,
                  keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
                },
                {
                  effectId: 'b',
                  key: 'list-key',
                  listContainer: '#my-list',
                  duration: 200,
                  keyframeEffect: { name: 'b', keyframes: [{ opacity: 1 }, { opacity: 0 }] },
                },
              ],
            },
          ],
        },
      ],
    };

    Interact.create(config, { useCustomElement: false });
    const { element, list } = createListElement();
    const items = createListItems(2);
    items.forEach((li) => list.append(li));

    addElement(element, 'list-key');

    const propA = staggerPropName('multi-seq', 0);
    const propB = staggerPropName('multi-seq', 1);
    // ordering: effect A over items [0,1] (ordinals 0,1) then effect B over items [0,1] (ordinals 2,3)
    expect(items[0].style.getPropertyValue(propA)).toBe('0');
    expect(items[1].style.getPropertyValue(propA)).toBe('1');
    expect(items[0].style.getPropertyValue(propB)).toBe('2');
    expect(items[1].style.getPropertyValue(propB)).toBe('3');
  });

  test('reindexes all elements when list items are added', () => {
    Interact.create(listSequenceConfig(), { useCustomElement: false });
    const { element, list } = createListElement();
    const items = createListItems(3);
    items.forEach((li) => list.append(li));

    const controller = addElement(element, 'list-key');

    const prop = staggerPropName('stg-seq', 0);
    expect(items[2].style.getPropertyValue(prop)).toBe('2');

    const [added] = createListItems(1);
    list.append(added);
    addListItems(controller, '#my-list', [added]);

    // full re-resolve: count is now 4, ordinals 0..3
    expect(items[0].style.getPropertyValue(prop)).toBe('0');
    expect(items[1].style.getPropertyValue(prop)).toBe('1');
    expect(items[2].style.getPropertyValue(prop)).toBe('2');
    expect(added.style.getPropertyValue(prop)).toBe('3');
  });

  test('does not write stagger factors under forced reduced motion', () => {
    Interact.forceReducedMotion = true;
    Interact.create(listSequenceConfig(), { useCustomElement: false });
    const { element, list } = createListElement();
    const items = createListItems(3);
    items.forEach((li) => list.append(li));

    addElement(element, 'list-key');

    const prop = staggerPropName('stg-seq', 0);
    expect(items[0].style.getPropertyValue(prop)).toBe('');
    expect(items[2].style.getPropertyValue(prop)).toBe('');
  });
});
