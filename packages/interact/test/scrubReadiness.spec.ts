import { afterEach, describe, expect, it, vi } from 'vitest';
import { getScrubScene, type ScrubPointerScene, type ScrubScrollScene } from '@wix/motion';
import { add, Interact } from '../src';

vi.mock('@wix/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@wix/motion')>()),
  getScrubScene: vi.fn(),
}));

describe('scrub manager readiness', () => {
  afterEach(() => {
    Interact.destroy();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    { trigger: 'pointerMove', event: 'pointermove', disposeBeforeReady: true },
    { trigger: 'viewProgress', event: 'scroll', disposeBeforeReady: true },
    { trigger: 'pointerMove', event: 'pointermove', disposeBeforeReady: false },
    { trigger: 'viewProgress', event: 'scroll', disposeBeforeReady: false },
  ] as const)(
    '$trigger starts only while its config is active (dispose early: $disposeBeforeReady)',
    async ({ trigger, event, disposeBeforeReady }) => {
      vi.stubGlobal('scrollTo', () => {});
      vi.stubGlobal(
        'ResizeObserver',
        class {
          observe() {}
          disconnect() {}
          unobserve() {}
        },
      );
      const added = vi.spyOn(window, 'addEventListener');
      const removed = vi.spyOn(window, 'removeEventListener');
      const source = document.createElement('div');
      const target = document.createElement('div');
      let resolveReady = () => {};
      const ready = new Promise<void>((resolve) => {
        resolveReady = resolve;
      });
      const scene = {
        ready,
        getProgress: () => 0,
        effect() {},
        disabled: false,
        destroy() {},
      };

      if (trigger === 'pointerMove') {
        vi.mocked(getScrubScene).mockReturnValue({ ...scene, target } satisfies ScrubPointerScene);
      } else {
        vi.mocked(getScrubScene).mockReturnValue([
          {
            ...scene,
            viewSource: source,
            start: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
            end: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          } satisfies ScrubScrollScene,
        ]);
      }

      const effect = {
        key: 'target',
        keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
      };
      Interact.create({
        conditions: { off: { type: 'media', predicate: 'max-width: 2px' } },
        interactions: [
          {
            key: 'source',
            trigger: 'click',
            conditions: ['off'],
            effects: [{ ...effect, duration: 100 }],
          },
        ],
      });
      const later = Interact.create({
        interactions: [
          { key: 'source', trigger, reducedMotionPolicy: 'ignore', effects: [effect] },
        ],
      });
      add(target, 'target');
      add(source, 'source');

      expect(getScrubScene).toHaveBeenCalledTimes(1);
      expect(added.mock.calls.some(([type]) => type === event)).toBe(false);

      if (disposeBeforeReady) {
        later.destroy({ clearCache: true });
      }
      resolveReady();
      await new Promise((done) => setTimeout(done, 0));

      const listeners = added.mock.calls.filter(([type]) => type === event);
      if (disposeBeforeReady) {
        expect(listeners).toHaveLength(0);
      } else {
        expect(listeners).toHaveLength(1);
        later.destroy({ clearCache: true });
        const listener = listeners[0][1];
        expect(
          removed.mock.calls.some(([type, callback]) => type === event && callback === listener),
        ).toBe(true);
      }
    },
  );
});
