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
    getSequence: vi.fn().mockReturnValue({ animationGroups: [], addGroups: vi.fn() }),
    registerEffects: vi.fn(),
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
});
