import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Interact, add, remove } from '../src/index';
import type { InteractConfig, InteractPluginContext } from '../src/types';
import TRIGGER_TO_HANDLER_MODULE_MAP from '../src/handlers';
import { addListItems } from '../src/core/add';
import { getWebAnimation } from '@wix/motion';

// Mock @wix/motion so the trigger handlers can run without a real animation engine.
vi.mock('@wix/motion', () => {
  const mock: any = {
    getWebAnimation: vi.fn().mockReturnValue({
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
    }),
    getElementCSSAnimation: vi.fn().mockReturnValue(null),
    getCSSAnimation: vi.fn().mockReturnValue(null),
    prepareAnimation: vi.fn(),
    getScrubScene: vi.fn().mockReturnValue({}),
    getEasing: vi.fn().mockImplementation((v) => v),
    getJsEasing: vi.fn().mockImplementation((v) => v),
    getAnimation: vi.fn().mockImplementation((target, options, trigger, reducedMotion) => {
      return mock.getWebAnimation(target, options, trigger, { reducedMotion });
    }),
    createAnimationGroups: vi.fn().mockReturnValue([]),
    getSequence: vi.fn().mockReturnValue({
      animationGroups: [],
      addGroups: vi.fn(),
      removeGroups: vi.fn(),
      cancel: vi.fn(),
    }),
    registerEffects: vi.fn(),
    getRegisteredEffect: vi.fn(),
    MotionKeyframeEffect: class {},
    TriggerVariant: {},
  };

  return mock;
});

vi.mock('kuliso', () => ({
  Pointer: vi.fn().mockImplementation(() => ({ start: vi.fn(), destroy: vi.fn() })),
}));

vi.mock('fizban', () => ({
  Scroll: vi.fn().mockImplementation(() => ({ start: vi.fn(), end: vi.fn() })),
}));

describe('interact plugin bridge', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    Interact.destroy();
    Interact.forceReducedMotion = false;
    Interact.allowA11yTriggers = false;
  });

  describe('registry (use / getPlugin)', () => {
    it('registers and retrieves a plugin by name', () => {
      const plugin = vi.fn();
      Interact.use('demo-registry', plugin);

      expect(Interact.getPlugin('demo-registry')).toBe(plugin);
    });

    it('returns undefined for an unregistered plugin name', () => {
      expect(Interact.getPlugin('never-registered')).toBeUndefined();
    });
  });

  describe('interaction-level plugins', () => {
    it('invokes the plugin once with the config value and context on connect', () => {
      const seen: Array<[unknown, InteractPluginContext]> = [];
      Interact.use('demo', (value, ctx) => {
        seen.push([value, ctx]);
      });

      const config: InteractConfig = {
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            $demo: { foo: 'bar' },
            effects: [{ key: 'el', namedEffect: { type: 'FadeIn' } as any, duration: 100 }],
          },
        ],
      };

      const element = document.createElement('div');
      Interact.create(config);
      add(element, 'el');

      expect(seen).toHaveLength(1);
      const [value, ctx] = seen[0];
      expect(value).toEqual({ foo: 'bar' });
      expect(ctx.root).toBe(element);
      expect(ctx.key).toBe('el');
      expect(ctx.scope).toBe('interaction');
      expect((ctx.config as { trigger: string }).trigger).toBe('hover');
    });

    it('runs before target resolution so plugin-created elements are targeted', () => {
      // Plugin injects a `.pt` span; the effect selector targets it. If the effect resolves to
      // the injected element, the plugin must have run first.
      Interact.use('demo', (_value, ctx) => {
        const span = document.createElement('span');
        span.className = 'pt';
        ctx.root.appendChild(span);
      });

      const config: InteractConfig = {
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            $demo: {},
            effects: [
              { key: 'el', selector: '.pt', namedEffect: { type: 'FadeIn' } as any, duration: 100 },
            ],
          },
        ],
      };

      const element = document.createElement('div');
      const addSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create(config);
      add(element, 'el');

      // handler.add(source, target, ...) — the resolved target must be the plugin-created span.
      const targetedInjected = addSpy.mock.calls.some((call) =>
        (call[1] as HTMLElement)?.classList?.contains('pt'),
      );
      expect(element.querySelector('.pt')).not.toBeNull();
      expect(targetedInjected).toBe(true);
    });

    it('runs the returned cleanup on disconnect', () => {
      const cleanup = vi.fn();
      Interact.use('demo', (_value, ctx) => {
        const span = document.createElement('span');
        span.className = 'pt';
        ctx.root.appendChild(span);
        return () => {
          span.remove();
          cleanup();
        };
      });

      const config: InteractConfig = {
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            $demo: {},
            effects: [{ key: 'el', namedEffect: { type: 'FadeIn' } as any, duration: 100 }],
          },
        ],
      };

      const element = document.createElement('div');
      Interact.create(config);
      add(element, 'el');

      expect(element.querySelector('.pt')).not.toBeNull();
      expect(cleanup).not.toHaveBeenCalled();

      remove('el');

      expect(cleanup).toHaveBeenCalledTimes(1);
      expect(element.querySelector('.pt')).toBeNull();
    });

    it('re-applies after update (media-query reconnect) — disconnect resets the dedup guard', () => {
      const apply = vi.fn();
      Interact.use('demo', () => {
        apply();
        return vi.fn();
      });

      const config: InteractConfig = {
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            $demo: {},
            effects: [{ key: 'el', namedEffect: { type: 'FadeIn' } as any, duration: 100 }],
          },
        ],
      };

      const element = document.createElement('div');
      Interact.create(config);
      add(element, 'el');
      expect(apply).toHaveBeenCalledTimes(1);

      const controller = Interact.getController('el');
      controller?.update(); // disconnect + connect

      expect(apply).toHaveBeenCalledTimes(2);
    });
  });

  describe('effect-level plugins (cross-element)', () => {
    it('applies a plugin to the effect target element before resolving it', () => {
      const roots: HTMLElement[] = [];
      Interact.use('demo', (_value, ctx) => {
        roots.push(ctx.root);
        expect(ctx.scope).toBe('effect');
      });

      const config: InteractConfig = {
        interactions: [
          {
            key: 'source',
            trigger: 'hover',
            effects: [
              {
                key: 'target',
                $demo: {},
                namedEffect: { type: 'FadeIn' } as any,
                duration: 100,
              },
            ],
          },
        ],
      };

      const source = document.createElement('div');
      const target = document.createElement('div');
      Interact.create(config);
      add(target, 'target');
      add(source, 'source');

      // The plugin ran against the effect's target element, not the source.
      expect(roots).toContain(target);
      expect(roots).not.toContain(source);
    });
  });

  describe('deferred plugins (use options.defer + ready)', () => {
    const fadeIn = { namedEffect: { type: 'FadeIn' } as any, duration: 100 };

    function hoverTargets(spy: ReturnType<typeof vi.spyOn>): HTMLElement[] {
      return spy.mock.calls.map((call) => call[1] as HTMLElement);
    }

    function useSpanPlugin(name: string, defer: string | string[]) {
      const apply = vi.fn();
      Interact.use(
        name,
        (_value, ctx) => {
          apply(ctx.root);
          const span = document.createElement('span');
          span.className = 'pt';
          ctx.root.appendChild(span);
        },
        { defer },
      );
      return apply;
    }

    it('defers an interaction-level plugin and its interaction until ready()', () => {
      const apply = useSpanPlugin('deferred', 'hydrated');
      const addSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            $deferred: {},
            effects: [{ key: 'el', selector: '.pt', ...fadeIn }],
          },
        ],
      });
      const element = document.createElement('div');
      add(element, 'el');

      expect(apply).not.toHaveBeenCalled();
      expect(addSpy).not.toHaveBeenCalled();

      Interact.ready('hydrated');

      expect(apply).toHaveBeenCalledTimes(1);
      expect(hoverTargets(addSpy).some((el) => el.classList.contains('pt'))).toBe(true);
    });

    it('applies non-deferred interactions immediately and does not duplicate them on ready()', () => {
      useSpanPlugin('deferred', 'hydrated');
      const eager = vi.fn();
      Interact.use('eager', eager);
      const hoverSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');
      const clickSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.click, 'add');

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'click', $eager: {}, effects: [{ key: 'el', ...fadeIn }] },
          {
            key: 'el',
            trigger: 'hover',
            $deferred: {},
            effects: [{ key: 'el', selector: '.pt', ...fadeIn }],
          },
        ],
      });
      add(document.createElement('div'), 'el');

      expect(eager).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(hoverSpy).not.toHaveBeenCalled();

      Interact.ready('hydrated');

      expect(eager).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(hoverSpy).toHaveBeenCalledTimes(1);
    });

    it('defers the sibling effects of an effect that carries a deferred plugin', () => {
      const apply = useSpanPlugin('deferred', 'hydrated');
      const addSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          {
            key: 'source',
            trigger: 'hover',
            effects: [
              { key: 'plain', ...fadeIn },
              { key: 'split', $deferred: {}, selector: '.pt', ...fadeIn },
            ],
          },
        ],
      });
      const plain = document.createElement('div');
      const split = document.createElement('div');
      add(plain, 'plain');
      add(split, 'split');
      add(document.createElement('div'), 'source');

      expect(apply).not.toHaveBeenCalled();
      expect(addSpy).not.toHaveBeenCalled();

      Interact.ready('hydrated');

      expect(apply).toHaveBeenCalledTimes(1);
      expect(apply).toHaveBeenCalledWith(split);
      expect(hoverTargets(addSpy).filter((el) => el === plain)).toHaveLength(1);
      expect(hoverTargets(addSpy).some((el) => el.classList.contains('pt'))).toBe(true);
    });

    it("attaches the siblings when only the deferred effect's target is released", () => {
      const apply = useSpanPlugin('deferred', 'hydrated');
      const addSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          {
            key: 'source',
            trigger: 'hover',
            effects: [
              { key: 'plain', ...fadeIn },
              { key: 'split', $deferred: {}, selector: '.pt', ...fadeIn },
            ],
          },
        ],
      });
      const plain = document.createElement('div');
      const split = document.createElement('div');
      add(document.createElement('div'), 'source');
      add(plain, 'plain');
      add(split, 'split');

      expect(addSpy).not.toHaveBeenCalled();

      Interact.ready('hydrated', 'split');

      expect(apply).toHaveBeenCalledTimes(1);
      expect(hoverTargets(addSpy).filter((el) => el === plain)).toHaveLength(1);
      expect(hoverTargets(addSpy).filter((el) => el.classList.contains('pt'))).toHaveLength(1);
    });

    it('defers the sequences of an interaction while a sibling effect is deferred', () => {
      useSpanPlugin('deferred', 'hydrated');
      const addSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.click, 'add');
      const getSequenceSpy = vi.spyOn(Interact, 'getSequence');

      Interact.create({
        interactions: [
          {
            key: 'source',
            trigger: 'click',
            effects: [{ key: 'split', $deferred: {}, selector: '.pt', ...fadeIn }],
            sequences: [{ effects: [{ key: 'seq', ...fadeIn }] }],
          },
        ],
      });
      add(document.createElement('div'), 'source');
      add(document.createElement('div'), 'seq');
      add(document.createElement('div'), 'split');

      expect(getSequenceSpy).not.toHaveBeenCalled();
      expect(addSpy).not.toHaveBeenCalled();

      Interact.ready('hydrated', 'split');

      expect(getSequenceSpy).toHaveBeenCalledTimes(1);
      expect(addSpy).toHaveBeenCalledTimes(2);
    });

    function listTarget(key: string) {
      const element = document.createElement('div');
      const list = document.createElement('ul');
      list.className = 'items';
      list.append(document.createElement('li'), document.createElement('li'));
      element.append(list);
      add(element, key);
      const appendItem = () => {
        const item = document.createElement('li');
        list.append(item);
        addListItems(Interact.getController(key)!, '.items', [item]);
        return item;
      };
      return { list, appendItem };
    }

    it('holds a list effect added while a sibling is deferred, then attaches it to all items', () => {
      useSpanPlugin('deferred', 'hydrated');
      const addSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          {
            key: 'source',
            trigger: 'hover',
            effects: [
              { key: 'list', listContainer: '.items', ...fadeIn },
              { key: 'split', $deferred: {}, selector: '.pt', ...fadeIn },
            ],
          },
        ],
      });
      add(document.createElement('div'), 'source');
      add(document.createElement('div'), 'split');
      const { list, appendItem } = listTarget('list');
      appendItem();

      expect(addSpy).not.toHaveBeenCalled();

      Interact.ready('hydrated');

      const items = Array.from(list.children);
      expect(hoverTargets(addSpy).filter((el) => items.includes(el))).toHaveLength(3);
    });

    it('holds a list sequence added while a sibling is deferred, then builds it for all items', () => {
      useSpanPlugin('deferred', 'hydrated');
      const getSequenceSpy = vi.spyOn(Interact, 'getSequence');

      Interact.create({
        interactions: [
          {
            key: 'source',
            trigger: 'click',
            effects: [{ key: 'split', $deferred: {}, selector: '.pt', ...fadeIn }],
            sequences: [
              {
                sequenceId: 'list-seq',
                effects: [{ key: 'list', listContainer: '.items', ...fadeIn }],
              },
            ],
          },
        ],
      });
      add(document.createElement('div'), 'source');
      add(document.createElement('div'), 'split');
      const { list, appendItem } = listTarget('list');
      appendItem();

      expect(getSequenceSpy).not.toHaveBeenCalled();

      Interact.ready('hydrated');

      expect(getSequenceSpy).toHaveBeenCalledTimes(1);
      const groups = getSequenceSpy.mock.calls[0][2] as Array<{ target: HTMLElement[] }>;
      expect(groups[0].target).toEqual(Array.from(list.children));
    });

    it('defers the sibling effects of a sequence with a deferred effect', () => {
      useSpanPlugin('deferred', 'hydrated');
      const addSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.click, 'add');
      const getSequenceSpy = vi.spyOn(Interact, 'getSequence');

      Interact.create({
        interactions: [
          {
            key: 'source',
            trigger: 'click',
            effects: [{ key: 'plain', ...fadeIn }],
            sequences: [{ effects: [{ key: 'split', $deferred: {}, selector: '.pt', ...fadeIn }] }],
          },
        ],
      });
      add(document.createElement('div'), 'source');
      add(document.createElement('div'), 'plain');
      add(document.createElement('div'), 'split');

      expect(addSpy).not.toHaveBeenCalled();

      Interact.ready('hydrated', 'split');

      expect(getSequenceSpy).toHaveBeenCalledTimes(1);
      expect(addSpy).toHaveBeenCalledTimes(2);
    });

    it('defers a whole sequence when one of its effects is deferred', () => {
      const apply = useSpanPlugin('deferred', 'hydrated');
      const eager = vi.fn();
      Interact.use('eager', eager);
      const getSequenceSpy = vi.spyOn(Interact, 'getSequence');

      Interact.create({
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            sequences: [
              {
                effects: [
                  { key: 'el', $eager: {}, ...fadeIn },
                  { key: 'el', $deferred: {}, selector: '.pt', ...fadeIn },
                ],
              },
            ],
          },
        ],
      });
      add(document.createElement('div'), 'el');

      expect(eager).not.toHaveBeenCalled();
      expect(apply).not.toHaveBeenCalled();
      expect(getSequenceSpy).not.toHaveBeenCalled();

      Interact.ready('hydrated');

      expect(eager).toHaveBeenCalledTimes(1);
      expect(apply).toHaveBeenCalledTimes(1);
      expect(getSequenceSpy).toHaveBeenCalledTimes(1);
    });

    it('does not defer a sequence on an effect its reduced-motion policy cancels', () => {
      const apply = useSpanPlugin('deferred', 'hydrated');
      const getSequenceSpy = vi.spyOn(Interact, 'getSequence');
      Interact.forceReducedMotion = true;

      Interact.create({
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            sequences: [
              {
                effects: [
                  { key: 'el', ...fadeIn },
                  {
                    key: 'el',
                    $deferred: {},
                    selector: '.pt',
                    reducedMotionPolicy: 'cancel',
                    ...fadeIn,
                  },
                ],
              },
            ],
          },
        ],
      });
      add(document.createElement('div'), 'el');

      expect(apply).not.toHaveBeenCalled();
      expect(getSequenceSpy).toHaveBeenCalledTimes(1);
    });

    it('ready(name, key) releases only that key', () => {
      const apply = useSpanPlugin('deferred', 'hydrated');

      Interact.create({
        interactions: ['a', 'b'].map((key) => ({
          key,
          trigger: 'hover' as const,
          $deferred: {},
          effects: [{ key, ...fadeIn }],
        })),
      });
      const a = document.createElement('div');
      const b = document.createElement('div');
      add(a, 'a');
      add(b, 'b');

      Interact.ready('hydrated', 'a');

      expect(apply).toHaveBeenCalledTimes(1);
      expect(apply).toHaveBeenCalledWith(a);

      Interact.ready('hydrated');

      expect(apply).toHaveBeenCalledTimes(2);
      expect(apply).toHaveBeenLastCalledWith(b);
    });

    it('applies a deferred source plugin before a cross-element target cached first resolves it', () => {
      const apply = useSpanPlugin('deferred', 'hydrated');
      const hoverSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          { key: 'a', trigger: 'hover', $deferred: {}, effects: [{ key: 'b', ...fadeIn }] },
        ],
      });
      const a = document.createElement('div');
      add(document.createElement('div'), 'b');
      add(a, 'a');

      expect(hoverSpy).not.toHaveBeenCalled();

      // `b` was cached first, so it resumes — and resolves `a`'s side — before `a` does
      Interact.ready('hydrated');

      expect(apply).toHaveBeenCalledTimes(1);
      expect(apply).toHaveBeenCalledWith(a);
      expect(hoverSpy).toHaveBeenCalledTimes(1);
      expect(apply.mock.invocationCallOrder[0]).toBeLessThan(hoverSpy.mock.invocationCallOrder[0]);
    });

    it('applies a deferred source plugin before a cross-element sequence target cached first resolves it', () => {
      const apply = useSpanPlugin('deferred', 'hydrated');
      const getSequenceSpy = vi.spyOn(Interact, 'getSequence');

      Interact.create({
        interactions: [
          {
            key: 'a',
            trigger: 'click',
            $deferred: {},
            sequences: [{ effects: [{ key: 'b', ...fadeIn }] }],
          },
        ],
      });
      const a = document.createElement('div');
      add(document.createElement('div'), 'b');
      add(a, 'a');

      Interact.ready('hydrated');

      expect(apply).toHaveBeenCalledTimes(1);
      expect(apply).toHaveBeenCalledWith(a);
      expect(getSequenceSpy).toHaveBeenCalledTimes(1);
      expect(apply.mock.invocationCallOrder[0]).toBeLessThan(
        getSequenceSpy.mock.invocationCallOrder[0],
      );
    });

    it('ready(name, key) does not resume other controllers', () => {
      useSpanPlugin('deferred', 'hydrated');

      Interact.create({
        interactions: ['a', 'b'].map((key) => ({
          key,
          trigger: 'hover' as const,
          $deferred: {},
          effects: [{ key, ...fadeIn }],
        })),
      });
      add(document.createElement('div'), 'a');
      add(document.createElement('div'), 'b');
      const resumeB = vi.spyOn(Interact.getController('b')!, 'resume');

      Interact.ready('hydrated', 'a');

      expect(resumeB).not.toHaveBeenCalled();
    });

    it('ready(name, targetKey) releases a cross-element effect deferred on its target', () => {
      const apply = useSpanPlugin('deferred', 'hydrated');
      const addSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          {
            key: 'source',
            trigger: 'hover',
            effects: [{ key: 'split', $deferred: {}, selector: '.pt', ...fadeIn }],
          },
        ],
      });
      const split = document.createElement('div');
      add(split, 'split');
      add(document.createElement('div'), 'source');

      Interact.ready('hydrated', 'source');
      expect(apply).not.toHaveBeenCalled();

      Interact.ready('hydrated', 'split');
      expect(apply).toHaveBeenCalledTimes(1);
      expect(apply).toHaveBeenCalledWith(split);
      expect(hoverTargets(addSpy).filter((el) => el.classList.contains('pt'))).toHaveLength(1);
    });

    it('ready(name, targetKey) releases a sequence deferred on an effect target', () => {
      const apply = useSpanPlugin('deferred', 'hydrated');
      const getSequenceSpy = vi.spyOn(Interact, 'getSequence');

      Interact.create({
        interactions: [
          {
            key: 'source',
            trigger: 'click',
            sequences: [
              {
                effects: [
                  { key: 'source', ...fadeIn },
                  { key: 'split', $deferred: {}, selector: '.pt', ...fadeIn },
                ],
              },
            ],
          },
        ],
      });
      const split = document.createElement('div');
      add(split, 'split');
      add(document.createElement('div'), 'source');

      Interact.ready('hydrated', 'source');
      expect(getSequenceSpy).not.toHaveBeenCalled();

      Interact.ready('hydrated', 'split');
      expect(apply).toHaveBeenCalledTimes(1);
      expect(apply).toHaveBeenCalledWith(split);
      expect(getSequenceSpy).toHaveBeenCalledTimes(1);
    });

    it('stays deferred until every defer name is released', () => {
      const apply = useSpanPlugin('deferred', ['hydrated', 'fonts']);

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'hover', $deferred: {}, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      add(document.createElement('div'), 'el');

      Interact.ready('hydrated');
      expect(apply).not.toHaveBeenCalled();

      Interact.ready('fonts');
      expect(apply).toHaveBeenCalledTimes(1);
    });

    it('does not defer when the name was released before the element connects', () => {
      const apply = useSpanPlugin('deferred', 'hydrated');
      Interact.ready('hydrated');

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'hover', $deferred: {}, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      add(document.createElement('div'), 'el');

      expect(apply).toHaveBeenCalledTimes(1);
    });

    it('does not resume an element that disconnected while deferred', () => {
      const apply = useSpanPlugin('deferred', 'hydrated');

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'hover', $deferred: {}, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      add(document.createElement('div'), 'el');
      remove('el');

      Interact.ready('hydrated');

      expect(apply).not.toHaveBeenCalled();
    });

    it('stays deferred across update() and applies once after release', () => {
      const apply = useSpanPlugin('deferred', 'hydrated');

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'hover', $deferred: {}, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      add(document.createElement('div'), 'el');

      Interact.getController('el')?.update();
      expect(apply).not.toHaveBeenCalled();

      Interact.ready('hydrated');
      expect(apply).toHaveBeenCalledTimes(1);

      Interact.getController('el')?.update();
      expect(apply).toHaveBeenCalledTimes(2);
    });

    it('Interact.destroy() resets released names', () => {
      const apply = useSpanPlugin('deferred', 'hydrated');
      Interact.ready('hydrated');
      Interact.destroy();

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'hover', $deferred: {}, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      add(document.createElement('div'), 'el');

      expect(apply).not.toHaveBeenCalled();
    });
  });

  describe('async plugins', () => {
    const fadeIn = { namedEffect: { type: 'FadeIn' } as any, duration: 100 };
    const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

    function deferred<T = void>() {
      let resolve!: (value: T) => void;
      let reject!: (reason: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    }

    /** An async plugin that appends a `.pt` span once its promise is resolved by the test. */
    function useAsyncSpanPlugin(name: string) {
      const calls: Array<{ root: HTMLElement; resolve: (cleanup?: () => void) => void }> = [];
      const plugin = vi.fn((_value: unknown, ctx: InteractPluginContext) => {
        const { promise, resolve } = deferred<void | (() => void)>();
        calls.push({
          root: ctx.root,
          resolve: (cleanup) => {
            const span = document.createElement('span');
            span.className = 'pt';
            ctx.root.appendChild(span);
            resolve(cleanup);
          },
        });
        return promise;
      });
      Interact.use(name, plugin);
      return { plugin, calls };
    }

    it.each(['effect', 'sequence'] as const)(
      'does not resume a cross-element %s after its source disconnects',
      async (kind) => {
        const pending = deferred();
        const cleanup = vi.fn();
        const plugin = vi.fn(() => pending.promise.then(() => cleanup));
        Interact.use('async-disconnect', plugin);
        const addSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.click, 'add');
        const effect = {
          key: 'target',
          keyframes: [{ opacity: 0 }, { opacity: 1 }],
          duration: 100,
        };
        Interact.create({
          interactions: [
            {
              key: 'source',
              trigger: 'click',
              '$async-disconnect': {},
              ...(kind === 'effect'
                ? { effects: [effect] }
                : { sequences: [{ effects: [effect] }] }),
            },
          ],
        });
        add(document.createElement('div'), 'source');
        add(document.createElement('div'), 'target');
        const source = Interact.getController('source')!;
        source.disconnect();

        pending.resolve();
        await flush();

        expect(source.connected).toBe(false);
        expect(plugin).toHaveBeenCalledTimes(1);
        expect(cleanup).toHaveBeenCalledTimes(1);
        expect(addSpy).not.toHaveBeenCalled();
      },
    );

    it('holds the interaction until the plugin resolves, then targets the DOM it produced', async () => {
      const { plugin, calls } = useAsyncSpanPlugin('async');
      const hoverSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            $async: {},
            effects: [{ key: 'el', selector: '.pt', ...fadeIn }],
          },
        ],
      });
      const element = document.createElement('div');
      add(element, 'el');

      expect(plugin).toHaveBeenCalledTimes(1);
      expect(hoverSpy).not.toHaveBeenCalled();

      calls[0].resolve();
      await flush();

      expect(plugin).toHaveBeenCalledTimes(1);
      expect(hoverSpy).toHaveBeenCalledTimes(1);
      expect(hoverSpy.mock.calls[0][1]).toBe(element.querySelector('.pt'));
    });

    it('attaches to every list item when an item is added right after the plugin settles', async () => {
      let resolve!: () => void;
      Interact.use('async', () => new Promise<void>((res) => (resolve = res)));
      const hoverSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          {
            key: 'el',
            listContainer: '.list',
            trigger: 'hover',
            effects: [{ key: 'el', listContainer: '.list', $async: {}, ...fadeIn }],
          },
        ],
      });
      const element = document.createElement('div');
      const list = document.createElement('div');
      list.className = 'list';
      element.appendChild(list);
      const items = [document.createElement('div'), document.createElement('div')];
      list.append(...items);
      add(element, 'el');

      resolve();
      // the plugin is applied, but the held pass has not resumed yet
      await Promise.resolve();
      const added = document.createElement('div');
      list.appendChild(added);
      await flush();

      expect(hoverSpy.mock.calls.map(([source]) => source)).toEqual([...items, added]);
    });

    it('resumes once for all the interactions held back by one promise', async () => {
      const pending = deferred();
      Interact.use('async', () => pending.promise);
      const hoverSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [100, 200, 300].map((duration) => ({
          key: 'el',
          trigger: 'hover' as const,
          $async: {},
          effects: [{ key: 'el', ...fadeIn, duration }],
        })),
      });
      add(document.createElement('div'), 'el');
      const resumeSpy = vi.spyOn(Interact.getController('el')!, 'resume');

      pending.resolve();
      await flush();

      expect(resumeSpy).toHaveBeenCalledTimes(1);
      expect(hoverSpy).toHaveBeenCalledTimes(3);
    });

    it('holds the sibling effects of an effect with an async plugin', async () => {
      const { calls } = useAsyncSpanPlugin('async');
      const hoverSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            effects: [
              { key: 'el', ...fadeIn },
              { key: 'el', $async: {}, selector: '.pt', ...fadeIn },
            ],
          },
        ],
      });
      const element = document.createElement('div');
      add(element, 'el');

      expect(hoverSpy).not.toHaveBeenCalled();

      calls[0].resolve();
      await flush();

      expect(hoverSpy).toHaveBeenCalledTimes(2);
      expect(hoverSpy.mock.calls.map((call) => call[1])).toContain(element.querySelector('.pt'));
    });

    it('holds cross-element siblings until an async plugin on another target resolves', async () => {
      const { plugin, calls } = useAsyncSpanPlugin('async');
      const hoverSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          {
            key: 'source',
            trigger: 'hover',
            effects: [
              { key: 'plain', ...fadeIn },
              { key: 'split', $async: {}, selector: '.pt', ...fadeIn },
            ],
          },
        ],
      });
      const plain = document.createElement('div');
      const split = document.createElement('div');
      // an async plugin starts once its target connects, so the targets connect first
      add(plain, 'plain');
      add(split, 'split');
      add(document.createElement('div'), 'source');

      expect(plugin).toHaveBeenCalledTimes(1);
      expect(hoverSpy).not.toHaveBeenCalled();

      calls[0].resolve();
      await flush();

      expect(plugin).toHaveBeenCalledTimes(1);
      expect(hoverSpy).toHaveBeenCalledTimes(2);
      expect(hoverSpy.mock.calls.map((call) => call[1])).toEqual(
        expect.arrayContaining([plain, split.querySelector('.pt')]),
      );
    });

    it('does not hold siblings for an async plugin whose target connects after them', async () => {
      const { calls } = useAsyncSpanPlugin('async');
      const hoverSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          {
            key: 'source',
            trigger: 'hover',
            effects: [
              { key: 'plain', ...fadeIn },
              { key: 'split', $async: {}, selector: '.pt', ...fadeIn },
            ],
          },
        ],
      });
      const plain = document.createElement('div');
      const split = document.createElement('div');
      add(document.createElement('div'), 'source');
      add(plain, 'plain');

      // the plugin has not started yet, so nothing tells the siblings to wait
      expect(hoverSpy.mock.calls.map((call) => call[1])).toEqual([plain]);

      add(split, 'split');
      expect(hoverSpy).toHaveBeenCalledTimes(1);

      calls[0].resolve();
      await flush();

      expect(hoverSpy.mock.calls.map((call) => call[1])).toEqual([
        plain,
        split.querySelector('.pt'),
      ]);
    });

    it('holds a whole sequence while one of its effect plugins is in flight', async () => {
      const { calls } = useAsyncSpanPlugin('async');
      const getSequenceSpy = vi.spyOn(Interact, 'getSequence');

      Interact.create({
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            sequences: [
              {
                effects: [
                  { key: 'el', ...fadeIn },
                  { key: 'el', $async: {}, selector: '.pt', ...fadeIn },
                ],
              },
            ],
          },
        ],
      });
      add(document.createElement('div'), 'el');

      expect(getSequenceSpy).not.toHaveBeenCalled();

      calls[0].resolve();
      await flush();

      expect(getSequenceSpy).toHaveBeenCalledTimes(1);
    });

    it('holds a cross-element effect on an async source plugin and attaches it once', async () => {
      const { plugin, calls } = useAsyncSpanPlugin('async');
      const hoverSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          { key: 'a', trigger: 'hover', $async: {}, effects: [{ key: 'b', ...fadeIn }] },
        ],
      });
      // the target is cached first, so both its pass and the source's hit the in-flight plugin
      add(document.createElement('div'), 'b');
      add(document.createElement('div'), 'a');

      expect(plugin).toHaveBeenCalledTimes(1);
      expect(hoverSpy).not.toHaveBeenCalled();

      calls[0].resolve();
      await flush();

      expect(plugin).toHaveBeenCalledTimes(1);
      expect(hoverSpy).toHaveBeenCalledTimes(1);
    });

    it('stores the resolved cleanup and runs it on disconnect', async () => {
      const { calls } = useAsyncSpanPlugin('async');
      const cleanup = vi.fn();

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'hover', $async: {}, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      add(document.createElement('div'), 'el');

      calls[0].resolve(cleanup);
      await flush();
      expect(cleanup).not.toHaveBeenCalled();

      remove('el');
      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it('runs the cleanup right away and attaches nothing when disconnected while in flight', async () => {
      const { calls } = useAsyncSpanPlugin('async');
      const hoverSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');
      const cleanup = vi.fn();

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'hover', $async: {}, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      add(document.createElement('div'), 'el');
      remove('el');

      calls[0].resolve(cleanup);
      await flush();

      expect(cleanup).toHaveBeenCalledTimes(1);
      expect(hoverSpy).not.toHaveBeenCalled();
    });

    it('re-runs for the new connect after update() while in flight and attaches once', async () => {
      const { plugin, calls } = useAsyncSpanPlugin('async');
      const hoverSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');
      const staleCleanup = vi.fn();

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'hover', $async: {}, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      add(document.createElement('div'), 'el');
      Interact.getController('el')!.update();

      expect(plugin).toHaveBeenCalledTimes(2);

      calls[0].resolve(staleCleanup);
      await flush();

      expect(staleCleanup).toHaveBeenCalledTimes(1);
      expect(hoverSpy).not.toHaveBeenCalled();

      calls[1].resolve();
      await flush();

      expect(plugin).toHaveBeenCalledTimes(2);
      expect(hoverSpy).toHaveBeenCalledTimes(1);
    });

    it('does not hold back a unit for an async plugin with a primitive value', async () => {
      let resolve!: () => void;
      const plugin = vi.fn(() => new Promise<void>((r) => (resolve = r)));
      Interact.use('asyncFlag', plugin);
      const hoverSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'hover', $asyncFlag: true, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      add(document.createElement('div'), 'el');

      expect(hoverSpy).toHaveBeenCalledTimes(1);

      resolve();
      await flush();

      expect(plugin).toHaveBeenCalledTimes(1);
      expect(hoverSpy).toHaveBeenCalledTimes(1);
    });

    it('logs a rejected plugin and applies its unit without it', async () => {
      const error = new Error('boom');
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const plugin = vi.fn(() => Promise.reject(error));
      Interact.use('asyncFail', plugin);
      const hoverSpy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.hover, 'add');

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'hover', $asyncFail: {}, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      add(document.createElement('div'), 'el');
      await flush();

      expect(errorSpy).toHaveBeenCalledWith(error);
      expect(plugin).toHaveBeenCalledTimes(1);
      expect(hoverSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('viewEnter while held back', () => {
    const fadeIn = { namedEffect: { type: 'FadeIn' } as any, duration: 100 };
    const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
    let observers: Array<{ cb: IntersectionObserverCallback; observed: Set<Element> }>;
    let originalIO: typeof IntersectionObserver | undefined;

    function intersect(element: Element, isIntersecting: boolean) {
      observers.forEach(({ cb, observed }) => {
        if (observed.has(element)) {
          cb(
            [
              {
                target: element,
                isIntersecting,
                boundingClientRect: { height: 100 },
                rootBounds: { height: 100 },
              } as unknown as IntersectionObserverEntry,
            ],
            {} as IntersectionObserver,
          );
        }
      });
    }

    beforeEach(() => {
      observers = [];
      originalIO = (window as any).IntersectionObserver;
      (window as any).IntersectionObserver = class {
        observed = new Set<Element>();
        constructor(cb: IntersectionObserverCallback) {
          observers.push({ cb, observed: this.observed });
        }
        observe(element: Element) {
          this.observed.add(element);
        }
        unobserve(element: Element) {
          this.observed.delete(element);
        }
        disconnect() {}
      };
      (TRIGGER_TO_HANDLER_MODULE_MAP.viewEnter as any).reset();
    });

    afterEach(() => {
      (window as any).IntersectionObserver = originalIO;
    });

    function playSpy() {
      return (getWebAnimation as unknown as ReturnType<typeof vi.fn>)().play as ReturnType<
        typeof vi.fn
      >;
    }

    it('records a latch once, however many passes hold its source back', () => {
      Interact.use('deferred', () => {}, { defer: 'hydrated' });

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'viewEnter', $deferred: {}, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      add(document.createElement('div'), 'el');
      const controller = Interact.getController('el')!;

      controller.resume();
      controller.resume();

      expect(controller._latches).toHaveLength(1);
    });

    it('replays a once entry that happened while deferred', () => {
      Interact.use('deferred', () => {}, { defer: 'hydrated' });

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'viewEnter', $deferred: {}, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      const element = document.createElement('div');
      add(element, 'el');

      intersect(element, true);
      intersect(element, false);

      expect(playSpy()).not.toHaveBeenCalled();

      Interact.ready('hydrated');

      expect(playSpy()).toHaveBeenCalledTimes(1);
    });

    it('replays a once entry that happened while an async effect plugin was in flight', async () => {
      let resolve!: () => void;
      Interact.use('async', () => new Promise<void>((res) => (resolve = res)));

      Interact.create({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ key: 'el', $async: {}, ...fadeIn }],
          },
        ],
      });
      const element = document.createElement('div');
      add(element, 'el');

      intersect(element, true);
      intersect(element, false);

      resolve();
      await flush();

      expect(playSpy()).toHaveBeenCalledTimes(1);
    });

    it('does not play when the source did not enter while held back', () => {
      Interact.use('deferred', () => {}, { defer: 'hydrated' });

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'viewEnter', $deferred: {}, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      const element = document.createElement('div');
      add(element, 'el');

      intersect(element, false);
      Interact.ready('hydrated');

      expect(playSpy()).not.toHaveBeenCalled();
    });

    it('forgets a latched entry on disconnect', () => {
      Interact.use('deferred', () => {}, { defer: 'hydrated' });

      Interact.create({
        interactions: [
          { key: 'el', trigger: 'viewEnter', $deferred: {}, effects: [{ key: 'el', ...fadeIn }] },
        ],
      });
      const element = document.createElement('div');
      add(element, 'el');

      intersect(element, true);
      Interact.getController('el')!.update();
      Interact.ready('hydrated');

      expect(playSpy()).not.toHaveBeenCalled();
    });

    describe('interaction-level plugin with its own selector / listContainer', () => {
      function child(parent: Element, className = 'child') {
        const element = document.createElement('span');
        element.className = className;
        parent.appendChild(element);
        return element;
      }

      it('attaches to a source the plugin created once it settles', async () => {
        let resolve!: () => void;
        Interact.use(
          'async',
          (_value, { root }) =>
            new Promise<void>((res) => {
              resolve = () => {
                child(root);
                res();
              };
            }),
        );

        Interact.create({
          interactions: [
            {
              key: 'el',
              selector: '.child',
              trigger: 'viewEnter',
              $async: {},
              effects: [{ key: 'el', selector: '.child', ...fadeIn }],
            },
          ],
        });
        const element = document.createElement('div');
        add(element, 'el');

        resolve();
        await flush();
        intersect(element.querySelector('.child')!, true);

        expect(playSpy()).toHaveBeenCalledTimes(1);
      });

      it('replays a once entry of a source that existed before the plugin', async () => {
        let resolve!: () => void;
        Interact.use('async', () => new Promise<void>((res) => (resolve = res)));

        Interact.create({
          interactions: [
            {
              key: 'el',
              selector: '.child',
              trigger: 'viewEnter',
              $async: {},
              effects: [{ key: 'el', selector: '.child', ...fadeIn }],
            },
          ],
        });
        const element = document.createElement('div');
        const source = child(element);
        add(element, 'el');

        intersect(source, true);
        intersect(source, false);

        resolve();
        await flush();

        expect(playSpy()).toHaveBeenCalledTimes(1);
      });

      it('replays a once entry of a list item that existed before the plugin', async () => {
        let resolve!: () => void;
        Interact.use('async', () => new Promise<void>((res) => (resolve = res)));

        Interact.create({
          interactions: [
            {
              key: 'el',
              listContainer: '.list',
              trigger: 'viewEnter',
              $async: {},
              effects: [{ key: 'el', listContainer: '.list', ...fadeIn }],
            },
          ],
        });
        const element = document.createElement('div');
        const list = child(element, 'list');
        const items = [child(list, 'item'), child(list, 'item')];
        add(element, 'el');

        intersect(items[1], true);
        intersect(items[1], false);

        resolve();
        await flush();

        expect(playSpy()).toHaveBeenCalledTimes(1);
      });

      it('stops observing a latched source the plugin replaced', async () => {
        let resolve!: () => void;
        Interact.use(
          'async',
          (_value, { root }) =>
            new Promise<void>((res) => {
              resolve = () => {
                root.replaceChildren();
                child(root);
                res();
              };
            }),
        );

        Interact.create({
          interactions: [
            {
              key: 'el',
              selector: '.child',
              trigger: 'viewEnter',
              $async: {},
              effects: [{ key: 'el', selector: '.child', ...fadeIn }],
            },
          ],
        });
        const element = document.createElement('div');
        const replaced = child(element);
        add(element, 'el');

        expect(observers.some(({ observed }) => observed.has(replaced))).toBe(true);

        resolve();
        await flush();

        expect(observers.some(({ observed }) => observed.has(replaced))).toBe(false);
        expect(playSpy()).not.toHaveBeenCalled();
      });

      it('stops observing a latched source on disconnect', () => {
        Interact.use('deferred', () => {}, { defer: 'hydrated' });

        Interact.create({
          interactions: [
            {
              key: 'el',
              selector: '.child',
              trigger: 'viewEnter',
              $deferred: {},
              effects: [{ key: 'el', selector: '.child', ...fadeIn }],
            },
          ],
        });
        const element = document.createElement('div');
        const source = child(element);
        add(element, 'el');

        intersect(source, true);
        Interact.getController('el')!.disconnect();

        expect(observers.some(({ observed }) => observed.has(source))).toBe(false);
      });
    });
  });

  describe('animationEnd while held back', () => {
    const fadeIn = { namedEffect: { type: 'FadeIn' } as any, duration: 100 };
    const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

    function playSpy() {
      return (getWebAnimation as unknown as ReturnType<typeof vi.fn>)().play as ReturnType<
        typeof vi.fn
      >;
    }

    function animationEnd(element: Element, animationName: string) {
      const event = new Event('animationend');
      Object.defineProperty(event, 'animationName', { value: animationName });
      element.dispatchEvent(event);
    }

    function createDeferred() {
      Interact.use('deferred', () => {}, { defer: 'hydrated' });

      Interact.create({
        interactions: [
          {
            key: 'el',
            trigger: 'animationEnd',
            params: { effectId: 'src' },
            $deferred: {},
            effects: [{ key: 'el', ...fadeIn }],
          },
        ],
        effects: { src: { ...fadeIn } },
      });
      const element = document.createElement('div');
      add(element, 'el');

      return element;
    }

    it('replays an animation end that happened while deferred', () => {
      const element = createDeferred();

      animationEnd(element, 'motion-fadeIn');

      expect(playSpy()).not.toHaveBeenCalled();

      Interact.ready('hydrated');

      expect(playSpy()).toHaveBeenCalledTimes(1);
    });

    it('replays an animation end that happened while an async effect plugin was in flight', async () => {
      let resolve!: () => void;
      Interact.use('async', () => new Promise<void>((res) => (resolve = res)));

      Interact.create({
        interactions: [
          {
            key: 'el',
            trigger: 'animationEnd',
            params: { effectId: 'src' },
            effects: [{ key: 'el', $async: {}, ...fadeIn }],
          },
        ],
        effects: { src: { ...fadeIn } },
      });
      const element = document.createElement('div');
      add(element, 'el');

      animationEnd(element, 'motion-fadeIn');

      resolve();
      await flush();

      expect(playSpy()).toHaveBeenCalledTimes(1);
    });

    it('does not play when no animation ended while held back', () => {
      createDeferred();

      Interact.ready('hydrated');

      expect(playSpy()).not.toHaveBeenCalled();
    });

    it('does not replay an animation end the trigger would have ignored', async () => {
      const { getElementCSSAnimation } = await import('@wix/motion');
      (getElementCSSAnimation as ReturnType<typeof vi.fn>).mockReturnValue({
        playState: 'finished',
        hasAnimationName: (name: string) => name === 'motion-fadeIn',
        hasAnimationId: () => false,
      });

      try {
        const element = createDeferred();

        animationEnd(element, 'motion-other');
        Interact.ready('hydrated');

        expect(playSpy()).not.toHaveBeenCalled();

        animationEnd(element, 'motion-fadeIn');

        expect(playSpy()).toHaveBeenCalledTimes(1);
      } finally {
        (getElementCSSAnimation as ReturnType<typeof vi.fn>).mockReturnValue(null);
      }
    });

    it('plays once for several latched animation ends', () => {
      const element = createDeferred();

      animationEnd(element, 'motion-fadeIn');
      animationEnd(element, 'motion-slideIn');
      animationEnd(element, 'motion-fadeIn');
      Interact.ready('hydrated');

      expect(playSpy()).toHaveBeenCalledTimes(1);
    });

    it('forgets latched animation ends on disconnect', () => {
      const element = createDeferred();

      animationEnd(element, 'motion-fadeIn');
      Interact.getController('el')!.update();
      Interact.ready('hydrated');

      expect(playSpy()).not.toHaveBeenCalled();
    });

    it('does not replay a source latch to a trigger on its descendant', async () => {
      Interact.use('deferred', () => {}, { defer: 'hydrated' });

      Interact.create({
        interactions: [
          {
            key: 'outer',
            trigger: 'animationEnd',
            params: { effectId: 'src' },
            $deferred: {},
            effects: [{ key: 'outer', ...fadeIn }],
          },
          {
            key: 'inner',
            trigger: 'animationEnd',
            params: { effectId: 'src' },
            effects: [{ key: 'inner', ...fadeIn }],
          },
        ],
        effects: { src: { ...fadeIn } },
      });
      const outer = document.createElement('div');
      const inner = document.createElement('div');
      outer.appendChild(inner);
      add(outer, 'outer');

      animationEnd(inner, 'motion-fadeIn');
      add(inner, 'inner');

      expect(playSpy()).not.toHaveBeenCalled();
    });

    it('forgets latched animation ends of a selector source on disconnect', async () => {
      const resolvers: Array<() => void> = [];
      Interact.use('async', () => new Promise<void>((res) => resolvers.push(res)));

      Interact.create({
        interactions: [
          {
            key: 'el',
            selector: '.child',
            trigger: 'animationEnd',
            params: { effectId: 'src' },
            effects: [{ key: 'el', selector: '.child', $async: {}, ...fadeIn }],
          },
        ],
        effects: { src: { ...fadeIn } },
      });
      const element = document.createElement('div');
      const child = document.createElement('span');
      child.className = 'child';
      element.appendChild(child);
      add(element, 'el');

      animationEnd(child, 'motion-fadeIn');
      Interact.getController('el')!.update();
      resolvers.forEach((resolve) => resolve());
      await flush();

      expect(resolvers.length).toBeGreaterThan(1);
      expect(playSpy()).not.toHaveBeenCalled();
    });

    describe('interaction-level plugin with its own selector / listContainer', () => {
      function child(parent: Element, className = 'child') {
        const element = document.createElement('span');
        element.className = className;
        parent.appendChild(element);
        return element;
      }

      // the plugin creates `.child` right away, but stays in flight until `resolve()`
      function createHeld(interaction: Record<string, unknown>) {
        let resolve!: () => void;
        Interact.use('async', (_value, { root }) => {
          child(root);
          return new Promise<void>((res) => (resolve = res));
        });

        Interact.create({
          interactions: [
            {
              key: 'el',
              trigger: 'animationEnd',
              params: { effectId: 'src' },
              $async: {},
              effects: [{ key: 'el', ...fadeIn }],
              ...interaction,
            } as any,
          ],
          effects: { src: { ...fadeIn } },
        });
        const element = document.createElement('div');
        add(element, 'el');

        return { element, resolve: () => resolve() };
      }

      it('replays an animation end of a source the plugin created', async () => {
        const { element, resolve } = createHeld({ selector: '.child' });

        animationEnd(element.querySelector('.child')!, 'motion-fadeIn');
        resolve();
        await flush();

        expect(playSpy()).toHaveBeenCalledTimes(1);
      });

      it.each([false, true])(
        'replays a root-scoped source animation end (bubbles: %s)',
        async (bubbles) => {
          const { element, resolve } = createHeld({ selector: ':scope > .child' });
          const source = element.querySelector('.child')!;
          const target = bubbles ? child(source, 'char') : source;
          target.dispatchEvent(
            new CustomEvent('animationend', { bubbles, detail: { effectId: 'src' } }),
          );
          resolve();
          await flush();

          expect(playSpy()).toHaveBeenCalledTimes(1);
        },
      );

      it('replays a non-bubbling animation end of a WAAPI animation', async () => {
        const { element, resolve } = createHeld({ selector: '.child' });

        element
          .querySelector('.child')!
          .dispatchEvent(new CustomEvent('animationend', { detail: { effectId: 'src' } }));
        resolve();
        await flush();

        expect(playSpy()).toHaveBeenCalledTimes(1);
      });

      it('replays an animation end of a list item', async () => {
        const { element, resolve } = createHeld({ listContainer: '.list' });
        const item = child(child(element, 'list'), 'item');

        animationEnd(item, 'motion-fadeIn');
        resolve();
        await flush();

        expect(playSpy()).toHaveBeenCalledTimes(1);
      });

      it('replays a bubbling animation end of a descendant of a source', async () => {
        const { element, resolve } = createHeld({ selector: '.child' });

        // a CSS animation's `animationend` bubbles
        const event = new Event('animationend', { bubbles: true });
        Object.defineProperty(event, 'animationName', { value: 'motion-fadeIn' });
        child(element.querySelector('.child')!, 'char').dispatchEvent(event);
        resolve();
        await flush();

        expect(playSpy()).toHaveBeenCalledTimes(1);
      });

      it.each(['.child', ':scope > .child'])(
        'does not replay a %s subtree latch to an unrelated descendant trigger',
        async (selector) => {
          const { element, resolve } = createHeld({ selector });
          const inner = child(element.querySelector('.child')!, 'inner');
          Interact.create({
            interactions: [
              {
                key: 'inner',
                trigger: 'animationEnd',
                params: { effectId: 'src' },
                effects: [{ ...fadeIn }],
              },
            ],
            effects: { src: { ...fadeIn } },
          });
          inner.dispatchEvent(
            new CustomEvent('animationend', { bubbles: true, detail: { effectId: 'src' } }),
          );
          add(inner, 'inner');

          expect(playSpy()).not.toHaveBeenCalled();
          resolve();
          await flush();
          expect(playSpy()).toHaveBeenCalledTimes(1);
        },
      );

      it('does not replay an animation end of an element that is not a source', async () => {
        const { element, resolve } = createHeld({ selector: '.child' });

        animationEnd(element, 'motion-fadeIn');
        animationEnd(child(element, 'other'), 'motion-fadeIn');
        resolve();
        await flush();

        expect(playSpy()).not.toHaveBeenCalled();
      });

      it('forgets latched animation ends on disconnect', async () => {
        const { element, resolve } = createHeld({ selector: '.child' });

        animationEnd(element.querySelector('.child')!, 'motion-fadeIn');
        Interact.getController('el')!.update();
        resolve();
        await flush();

        expect(playSpy()).not.toHaveBeenCalled();
      });
    });
  });
});
