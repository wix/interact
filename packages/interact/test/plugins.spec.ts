import { afterEach, describe, expect, it, vi } from 'vitest';
import { Interact, add, remove } from '../src/index';
import type { InteractConfig, InteractPluginContext } from '../src/types';
import TRIGGER_TO_HANDLER_MODULE_MAP from '../src/handlers';

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
    getSequence: vi
      .fn()
      .mockReturnValue({ animationGroups: [], addGroups: vi.fn(), removeGroups: vi.fn() }),
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

    it('defers only the effect that carries an effect-level deferred plugin', () => {
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
      expect(hoverTargets(addSpy)).toContain(plain);
      expect(hoverTargets(addSpy).some((el) => el.classList.contains('pt'))).toBe(false);

      Interact.ready('hydrated');

      expect(apply).toHaveBeenCalledTimes(1);
      expect(apply).toHaveBeenCalledWith(split);
      expect(hoverTargets(addSpy).filter((el) => el === plain)).toHaveLength(1);
      expect(hoverTargets(addSpy).some((el) => el.classList.contains('pt'))).toBe(true);
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
});
