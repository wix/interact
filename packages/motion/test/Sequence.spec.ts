import { describe, expect, test, vi } from 'vitest';
import { AnimationGroup } from '../src/AnimationGroup';
import { linear } from '../src/easings';
import { Sequence } from '../src/Sequence';
import { getJsEasing } from '../src/utils';

(globalThis as any).CSSAnimation = class CSSAnimation {};

const createMockAnimation = (overrides: Partial<Animation> = {}): Animation =>
  ({
    id: '',
    currentTime: 0,
    playState: 'idle' as AnimationPlayState,
    ready: Promise.resolve(undefined as any),
    finished: Promise.resolve(undefined as any),
    effect: {
      getComputedTiming: vi.fn().mockReturnValue({ progress: 0.5 }),
      getTiming: vi.fn().mockReturnValue({ delay: 0, duration: 1000, iterations: 1 }),
      updateTiming: vi.fn(),
    } as any,
    play: vi.fn(),
    pause: vi.fn(),
    cancel: vi.fn(),
    reverse: vi.fn(),
    playbackRate: 1,
    ...overrides,
  }) as Animation;

function createGroup(
  options: {
    animations?: Animation[];
    ready?: Promise<void>;
    finished?: Promise<unknown>;
  } = {},
) {
  const animations = options.animations ?? [createMockAnimation()];
  const group = new AnimationGroup(
    animations,
    options.ready ? { measured: options.ready } : undefined,
  );

  if (options.finished) {
    Object.defineProperty(group, 'finished', {
      get: () => options.finished,
      configurable: true,
    });
  }

  return group;
}

function createStatefulMockAnimation(duration = 1000, initialDelay = 0): Animation {
  let currentDelay = initialDelay;
  let currentEndDelay = 0;
  return {
    id: '',
    currentTime: 0,
    playState: 'idle' as AnimationPlayState,
    ready: Promise.resolve(undefined as any),
    finished: Promise.resolve(undefined as any),
    effect: {
      getComputedTiming: vi.fn().mockReturnValue({ progress: 0.5 }),
      getTiming: vi.fn(() => ({
        delay: currentDelay,
        endDelay: currentEndDelay,
        duration,
        iterations: 1,
      })),
      updateTiming: vi.fn((opts: { delay?: number; endDelay?: number }) => {
        if (opts.delay !== undefined) currentDelay = opts.delay;
        if (opts.endDelay !== undefined) currentEndDelay = opts.endDelay;
      }),
    } as any,
    play: vi.fn(),
    pause: vi.fn(),
    cancel: vi.fn(),
    reverse: vi.fn(),
    playbackRate: 1,
  } as unknown as Animation;
}

function createStatefulGroup(duration = 1000, initialDelay = 0) {
  const anim = createStatefulMockAnimation(duration, initialDelay);
  return new AnimationGroup([anim]);
}

describe('Sequence', () => {
  describe('Constructor', () => {
    test('creates Sequence with empty groups array', () => {
      const sequence = new Sequence([]);

      expect(sequence.animationGroups).toEqual([]);
      expect(sequence.animations).toEqual([]);
    });

    test('creates Sequence from multiple AnimationGroups', () => {
      const group1 = createGroup();
      const group2 = createGroup();

      const sequence = new Sequence([group1, group2]);

      expect(sequence.animationGroups).toEqual([group1, group2]);
    });

    test('flattens all child animations into parent animations array', () => {
      const a1 = createMockAnimation();
      const a2 = createMockAnimation();
      const a3 = createMockAnimation();
      const group1 = createGroup({ animations: [a1] });
      const group2 = createGroup({ animations: [a2, a3] });

      const sequence = new Sequence([group1, group2]);

      expect(sequence.animations).toEqual([a1, a2, a3]);
    });

    test('stores animationGroups reference', () => {
      const groups = [createGroup(), createGroup()];

      const sequence = new Sequence(groups);

      expect(sequence.animationGroups).toBe(groups);
    });

    test('defaults delay=0, offset=0, offsetEasing=linear', () => {
      const sequence = new Sequence([createGroup()]);

      expect(sequence.delay).toBe(0);
      expect(sequence.offset).toBe(0);
      expect(sequence.offsetEasing).toBe(linear);
    });

    test('accepts custom delay, offset, and offsetEasing function', () => {
      const offsetEasing = (p: number) => p ** 3;
      const sequence = new Sequence([createGroup()], { delay: 30, offset: 120, offsetEasing });

      expect(sequence.delay).toBe(30);
      expect(sequence.offset).toBe(120);
      expect(sequence.offsetEasing).toBe(offsetEasing);
    });

    test("resolves named offsetEasing string via getJsEasing (e.g. 'quadIn')", () => {
      const sequence = new Sequence([createGroup()], { offsetEasing: 'quadIn' });
      const quadIn = getJsEasing('quadIn');

      expect(quadIn).toBeDefined();
      expect(sequence.offsetEasing(0.5)).toBe(quadIn!(0.5));
    });

    test('resolves cubic-bezier offsetEasing string', () => {
      const sequence = new Sequence([createGroup()], {
        offsetEasing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      });

      expect(sequence.offsetEasing(0.5)).not.toBe(0.5);
    });

    test('falls back to linear for invalid or unknown offsetEasing string', () => {
      const sequence = new Sequence([createGroup()], { offsetEasing: 'not-a-real-easing' });

      expect(sequence.offsetEasing(0.25)).toBe(linear(0.25));
      expect(sequence.offsetEasing(0.75)).toBe(linear(0.75));
    });
  });

  describe('Offset calculation (calculateOffsets)', () => {
    test('single group returns [0]', () => {
      const sequence = new Sequence([createGroup()], { offset: 200 });

      expect((sequence as any).calculateOffsets()).toEqual([0]);
    });

    test('linear easing with 5 groups and offset=200 produces [0, 200, 400, 600, 800]', () => {
      const groups = Array.from({ length: 5 }, () => createGroup());
      const sequence = new Sequence(groups, { offset: 200, offsetEasing: 'linear' });

      expect((sequence as any).calculateOffsets()).toEqual([0, 200, 400, 600, 800]);
    });

    test('quadIn easing with 5 groups and offset=200 produces [0, 50, 200, 450, 800]', () => {
      const groups = Array.from({ length: 5 }, () => createGroup());
      const sequence = new Sequence(groups, { offset: 200, offsetEasing: 'quadIn' });

      expect((sequence as any).calculateOffsets()).toEqual([0, 50, 200, 450, 800]);
    });

    test('sineOut easing produces expected non-linear offsets', () => {
      const groups = Array.from({ length: 5 }, () => createGroup());
      const sequence = new Sequence(groups, { offset: 200, offsetEasing: 'sineOut' });

      expect((sequence as any).calculateOffsets()).toEqual([0, 306, 565, 739, 800]);
    });

    test('floors fractional offsets', () => {
      const groups = [createGroup(), createGroup(), createGroup()];
      const sequence = new Sequence(groups, { offset: 99, offsetEasing: (p) => p * 0.5 });

      expect((sequence as any).calculateOffsets()).toEqual([0, 49, 99]);
    });
  });

  describe('applyOffsets (synchronous in constructor)', () => {
    test('sets correct delay and endDelay on each animation', () => {
      const groups = [createStatefulGroup(), createStatefulGroup(), createStatefulGroup()];
      new Sequence(groups, { delay: 100, offset: 50, offsetEasing: 'linear' });

      // offsets: [0, 50, 100], this.delay=100, all durations=1000
      // stagger delays (before this.delay): [0, 50, 100]
      // sequenceDuration = max(0+1000, 50+1000, 100+1000) = 1100
      // endDelays: 1100-1000=100, 1100-1050=50, 1100-1100=0
      // final delays: stagger + this.delay = [100, 150, 200]
      const timings = groups.map((g) => g.animations[0].effect!.getTiming());
      expect(timings[0]).toEqual(expect.objectContaining({ delay: 100, endDelay: 100 }));
      expect(timings[1]).toEqual(expect.objectContaining({ delay: 150, endDelay: 50 }));
      expect(timings[2]).toEqual(expect.objectContaining({ delay: 200, endDelay: 0 }));
    });

    test('sets delay 0 and endDelay 0 when delay and offset are both 0', () => {
      const groups = [createStatefulGroup(), createStatefulGroup()];
      new Sequence(groups, { delay: 0, offset: 0 });

      const timings = groups.map((g) => g.animations[0].effect!.getTiming());
      expect(timings[0]).toEqual(expect.objectContaining({ delay: 0, endDelay: 0 }));
      expect(timings[1]).toEqual(expect.objectContaining({ delay: 0, endDelay: 0 }));
    });

    test('applyOffsets is idempotent (calling twice produces same result)', () => {
      const groups = [createStatefulGroup(), createStatefulGroup(), createStatefulGroup()];
      const sequence = new Sequence(groups, { delay: 50, offset: 100, offsetEasing: 'linear' });

      const getTimings = () =>
        groups.map((g) => {
          const t = g.animations[0]?.effect?.getTiming();
          return { delay: t?.delay, endDelay: t?.endDelay };
        });
      const timingsAfterFirst = getTimings();

      (sequence as any).applyOffsets();
      const timingsAfterSecond = getTimings();

      expect(timingsAfterFirst).toEqual(timingsAfterSecond);
    });

    test('ready resolves after all group ready promises settle', async () => {
      let resolveFirst!: () => void;
      let resolveSecond!: () => void;
      const firstReady = new Promise<void>((r) => {
        resolveFirst = r;
      });
      const secondReady = new Promise<void>((r) => {
        resolveSecond = r;
      });

      const group1 = createGroup({ ready: firstReady });
      const group2 = createGroup({ ready: secondReady });
      const sequence = new Sequence([group1, group2], { delay: 10 });

      let resolved = false;
      const readyPromise = sequence.ready.then(() => {
        resolved = true;
      });

      await Promise.resolve();
      expect(resolved).toBe(false);

      resolveFirst();
      await Promise.resolve();
      expect(resolved).toBe(false);

      resolveSecond();
      await readyPromise;
      expect(resolved).toBe(true);
    });
  });

  describe('endDelay for reverse playback', () => {
    test('computes endDelay so all animations share the same total timeline', () => {
      const groups = [createStatefulGroup(), createStatefulGroup(), createStatefulGroup()];
      new Sequence(groups, { delay: 0, offset: 100, offsetEasing: 'linear' });

      // absoluteDelays: [0, 100, 200], all durations=1000
      // sequenceDuration = 200 + 1000 = 1200
      // endDelays: 1200-0-1000=200, 1200-100-1000=100, 1200-200-1000=0
      const timings = groups.map((g) => g.animations[0].effect!.getTiming());
      expect(timings[0].endDelay).toBe(200);
      expect(timings[1].endDelay).toBe(100);
      expect(timings[2].endDelay).toBe(0);

      // Verify all total times are equal
      timings.forEach((t) => {
        expect((t.delay as number) + (t.duration as number) + (t.endDelay as number)).toBe(1200);
      });
    });

    test('sets endDelay 0 on all groups when offset is 0', () => {
      const groups = [createStatefulGroup(), createStatefulGroup()];
      new Sequence(groups, { delay: 0, offset: 0 });

      // sequenceDuration = 1000, all delays = 0
      // endDelay = 1000 - 0 - 1000 = 0
      expect(groups[0].animations[0].effect!.getTiming().endDelay).toBe(0);
      expect(groups[1].animations[0].effect!.getTiming().endDelay).toBe(0);
    });

    test('single group gets endDelay 0', () => {
      const groups = [createStatefulGroup()];
      new Sequence(groups, { offset: 200 });

      expect(groups[0].animations[0].effect!.getTiming().endDelay).toBe(0);
    });

    test('computes correct endDelay with varying durations across groups', () => {
      // G0: duration=500, G1: duration=200, G2: duration=300
      const groups = [createStatefulGroup(500), createStatefulGroup(200), createStatefulGroup(300)];
      new Sequence(groups, { delay: 0, offset: 100, offsetEasing: 'linear' });

      // absoluteDelays: [0, 100, 200]
      // sequenceDuration = max(0+500, 100+200, 200+300) = max(500, 300, 500) = 500
      // endDelays: 500-0-500=0, 500-100-200=200, 500-200-300=0
      const timings = groups.map((g) => g.animations[0].effect!.getTiming());
      expect(timings[0].endDelay).toBe(0);
      expect(timings[1].endDelay).toBe(200);
      expect(timings[2].endDelay).toBe(0);

      // Verify all total times are equal
      timings.forEach((t) => {
        expect((t.delay as number) + (t.duration as number) + (t.endDelay as number)).toBe(500);
      });
    });

    test('handles varying durations within a single group', () => {
      const anim1 = createStatefulMockAnimation(800);
      const anim2 = createStatefulMockAnimation(400);
      const group = new AnimationGroup([anim1, anim2]);
      const groups = [group, createStatefulGroup(600)];
      new Sequence(groups, { delay: 0, offset: 100, offsetEasing: 'linear' });

      // absoluteDelays: [0, 100]
      // sequenceDuration = max(0+800, 0+400, 100+600) = max(800, 400, 700) = 800
      // G0 anim1: endDelay = 800 - 0 - 800 = 0
      // G0 anim2: endDelay = 800 - 0 - 400 = 400
      // G1 anim:  endDelay = 800 - 100 - 600 = 100
      expect(anim1.effect!.getTiming().endDelay).toBe(0);
      expect(anim2.effect!.getTiming().endDelay).toBe(400);
      expect(groups[1].animations[0].effect!.getTiming().endDelay).toBe(100);
    });

    test('endDelay is recalculated after addGroups', () => {
      const groups = [createStatefulGroup(), createStatefulGroup()];
      const sequence = new Sequence(groups, { delay: 0, offset: 100, offsetEasing: 'linear' });

      // 2 groups: sequenceDuration = 100+1000 = 1100
      // endDelays: 1100-0-1000=100, 1100-100-1000=0
      expect(groups[0].animations[0].effect!.getTiming().endDelay).toBe(100);
      expect(groups[1].animations[0].effect!.getTiming().endDelay).toBe(0);

      const gNew = createStatefulGroup();
      sequence.addGroups([{ index: 1, group: gNew }]);

      // 3 groups: sequenceDuration = 200+1000 = 1200
      // endDelays: 1200-0-1000=200, 1200-100-1000=100, 1200-200-1000=0
      const allEndDelays = sequence.animationGroups.map(
        (g) => g.animations[0]?.effect?.getTiming().endDelay as number,
      );
      expect(allEndDelays).toEqual([200, 100, 0]);
    });

    test('with non-linear easing, endDelays account for both offsets and durations', () => {
      const groups = Array.from({ length: 5 }, () => createStatefulGroup());
      new Sequence(groups, { offset: 200, offsetEasing: 'quadIn' });

      // quadIn offsets: [0, 50, 200, 450, 800], all durations=1000
      // sequenceDuration = 800 + 1000 = 1800
      // endDelays: 1800-0-1000=800, 1800-50-1000=750, 1800-200-1000=600, 1800-450-1000=350, 1800-800-1000=0
      const endDelays = groups.map((g) => g.animations[0].effect!.getTiming().endDelay as number);
      expect(endDelays).toEqual([800, 750, 600, 350, 0]);
    });

    test('sequence delay shifts all animation delays without affecting endDelays', () => {
      const groups = [createStatefulGroup(), createStatefulGroup(), createStatefulGroup()];
      new Sequence(groups, { delay: 500, offset: 100, offsetEasing: 'linear' });

      // offsets: [0, 100, 200], this.delay=500, all durations=1000
      // stagger delays: [0, 100, 200]
      // sequenceDuration = max(0+1000, 100+1000, 200+1000) = 1200
      // endDelays: [1200-1000, 1200-1100, 1200-1200] = [200, 100, 0]
      // final delays: stagger + this.delay = [500, 600, 700]
      const delays = groups.map((g) => g.animations[0].effect!.getTiming().delay as number);
      const endDelays = groups.map((g) => g.animations[0].effect!.getTiming().endDelay as number);
      expect(delays).toEqual([500, 600, 700]);
      expect(endDelays).toEqual([200, 100, 0]);
    });
  });

  describe('addGroups', () => {
    test('inserts groups at specified indices', () => {
      const g1 = createGroup();
      const g2 = createGroup();
      const sequence = new Sequence([g1, g2]);

      const gNew = createGroup();
      sequence.addGroups([{ index: 1, group: gNew }]);

      expect(sequence.animationGroups).toEqual([g1, gNew, g2]);
    });

    test('appends groups when index equals length (end of sequence)', () => {
      const g1 = createGroup();
      const sequence = new Sequence([g1]);

      const gNew = createGroup();
      sequence.addGroups([{ index: 1, group: gNew }]);

      expect(sequence.animationGroups).toEqual([g1, gNew]);
    });

    test('inserts flattened animations at correct position in animations array', () => {
      const a1 = createMockAnimation();
      const a2 = createMockAnimation();
      const g1 = createGroup({ animations: [a1] });
      const g2 = createGroup({ animations: [a2] });
      const sequence = new Sequence([g1, g2]);

      const aNew = createMockAnimation();
      const gNew = createGroup({ animations: [aNew] });
      sequence.addGroups([{ index: 1, group: gNew }]);

      expect(sequence.animations).toEqual([a1, aNew, a2]);
    });

    test('recalculates delays and endDelays for all groups after insertion', () => {
      const groups = [createStatefulGroup(), createStatefulGroup()];
      const sequence = new Sequence(groups, { delay: 0, offset: 100, offsetEasing: 'linear' });

      const gNew = createStatefulGroup();
      sequence.addGroups([{ index: 1, group: gNew }]);

      // 3 groups, linear, offset=100: delays [0, 100, 200]
      // sequenceDuration = 200+1000 = 1200, endDelays [200, 100, 0]
      const allDelays = sequence.animationGroups.map(
        (g) => g.animations[0]?.effect?.getTiming().delay as number,
      );
      const allEndDelays = sequence.animationGroups.map(
        (g) => g.animations[0]?.effect?.getTiming().endDelay as number,
      );
      expect(allDelays).toEqual([0, 100, 200]);
      expect(allEndDelays).toEqual([200, 100, 0]);
    });

    test('updates ready promise to include new groups', async () => {
      const g1 = createGroup();
      const sequence = new Sequence([g1]);

      let newReady = false;
      const newReadyPromise = new Promise<void>((r) => {
        setTimeout(() => {
          newReady = true;
          r();
        }, 0);
      });
      const gNew = createGroup({ ready: newReadyPromise });
      sequence.addGroups([{ index: 1, group: gNew }]);

      await sequence.ready;
      expect(newReady).toBe(true);
    });

    test('with empty array is a no-op', () => {
      const g1 = createGroup();
      const sequence = new Sequence([g1], { offset: 100 });
      const groupsBefore = [...sequence.animationGroups];
      const animsBefore = [...sequence.animations];

      sequence.addGroups([]);

      expect(sequence.animationGroups).toEqual(groupsBefore);
      expect(sequence.animations).toEqual(animsBefore);
    });

    test('preserves existing base delays when recalculating after insertion', () => {
      const a1 = createStatefulMockAnimation(1000, 50);
      const g1 = createGroup({ animations: [a1] });
      const g2 = createStatefulGroup();
      const sequence = new Sequence([g1, g2], { offset: 100, offsetEasing: 'linear' });

      // g1 baseDelay=50, g2 baseDelay=0. offsets: [0, 100]
      // delays: [50+0, 0+100] = [50, 100]
      // activeDurations: [0+1050, 100+1000] = [1050, 1100]
      // sequenceDuration = 1100
      expect(a1.effect!.getTiming().delay).toBe(50);

      const gNew = createStatefulGroup();
      sequence.addGroups([{ index: 2, group: gNew }]);

      // 3 groups. offsets: [0, 100, 200], delays: [50, 100, 200]
      // activeDurations: [1050, 1100, 1200]
      // sequenceDuration = 1200
      // g1 endDelay = 1200 - (50 + 1000) = 150
      expect(a1.effect!.getTiming().delay).toBe(50);
      expect(a1.effect!.getTiming().endDelay).toBe(150);
    });

    test('handles multiple insertions at different indices in correct order', () => {
      const g1 = createGroup();
      const g2 = createGroup();
      const g3 = createGroup();
      const sequence = new Sequence([g1, g2, g3]);

      const gA = createGroup();
      const gB = createGroup();
      sequence.addGroups([
        { index: 0, group: gA },
        { index: 2, group: gB },
      ]);

      // Sorted descending: insert gB at 2 first -> [g1, g2, gB, g3], then gA at 0 -> [gA, g1, g2, gB, g3]
      expect(sequence.animationGroups).toEqual([gA, g1, g2, gB, g3]);
    });

    test('clamps index to animationGroups.length when index exceeds bounds', () => {
      const g1 = createGroup();
      const sequence = new Sequence([g1]);

      const gNew = createGroup();
      sequence.addGroups([{ index: 999, group: gNew }]);

      expect(sequence.animationGroups).toEqual([g1, gNew]);
    });
  });

  describe('Inherited playback API (from AnimationGroup)', () => {
    test('play() plays all flattened animations', async () => {
      const a1 = createMockAnimation();
      const a2 = createMockAnimation();
      const sequence = new Sequence([
        createGroup({ animations: [a1] }),
        createGroup({ animations: [a2] }),
      ]);

      await sequence.play();

      expect(a1.play).toHaveBeenCalledTimes(1);
      expect(a2.play).toHaveBeenCalledTimes(1);
    });

    test('pause() pauses all flattened animations', () => {
      const a1 = createMockAnimation();
      const a2 = createMockAnimation();
      const sequence = new Sequence([
        createGroup({ animations: [a1] }),
        createGroup({ animations: [a2] }),
      ]);

      sequence.pause();

      expect(a1.pause).toHaveBeenCalledTimes(1);
      expect(a2.pause).toHaveBeenCalledTimes(1);
    });

    test('reverse() reverses all flattened animations', async () => {
      const a1 = createMockAnimation();
      const a2 = createMockAnimation();
      const sequence = new Sequence([
        createGroup({ animations: [a1] }),
        createGroup({ animations: [a2] }),
      ]);

      await sequence.reverse();

      expect(a1.reverse).toHaveBeenCalledTimes(1);
      expect(a2.reverse).toHaveBeenCalledTimes(1);
    });

    test('cancel() cancels all flattened animations', () => {
      const a1 = createMockAnimation();
      const a2 = createMockAnimation();
      const sequence = new Sequence([
        createGroup({ animations: [a1] }),
        createGroup({ animations: [a2] }),
      ]);

      sequence.cancel();

      expect(a1.cancel).toHaveBeenCalledTimes(1);
      expect(a2.cancel).toHaveBeenCalledTimes(1);
    });

    test('setPlaybackRate() sets rate on all flattened animations', () => {
      const a1 = createMockAnimation();
      const a2 = createMockAnimation();
      const sequence = new Sequence([
        createGroup({ animations: [a1] }),
        createGroup({ animations: [a2] }),
      ]);

      sequence.setPlaybackRate(1.5);

      expect(a1.playbackRate).toBe(1.5);
      expect(a2.playbackRate).toBe(1.5);
    });

    test('playState returns from first animation', () => {
      const playing = createMockAnimation({ playState: 'running' });
      const idle = createMockAnimation({ playState: 'idle' });
      const sequence = new Sequence([
        createGroup({ animations: [playing] }),
        createGroup({ animations: [idle] }),
      ]);

      expect(sequence.playState).toBe('running');
    });
  });

  describe('onFinish (overridden)', () => {
    test('calls callback when all animation groups finish', async () => {
      const group1 = createGroup({ finished: Promise.resolve(undefined) });
      const group2 = createGroup({ finished: Promise.resolve(undefined) });
      const sequence = new Sequence([group1, group2]);
      const callback = vi.fn();

      await sequence.onFinish(callback);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("does not call callback if any group's finished promise rejects", async () => {
      const group1 = createGroup({ finished: Promise.resolve(undefined) });
      const group2 = createGroup({ finished: Promise.reject(new Error('interrupted')) });
      const sequence = new Sequence([group1, group2]);
      const callback = vi.fn();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await sequence.onFinish(callback);

      expect(callback).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    test('logs warning on interrupted animation', async () => {
      const error = new Error('interrupted');
      const group = createGroup({ finished: Promise.reject(error) });
      const sequence = new Sequence([group]);
      const callback = vi.fn();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await sequence.onFinish(callback);

      expect(warnSpy).toHaveBeenCalledWith(
        'animation was interrupted - aborting onFinish callback - ',
        error,
      );
      warnSpy.mockRestore();
    });

    test('handles empty groups array', async () => {
      const sequence = new Sequence([]);
      const callback = vi.fn();

      await sequence.onFinish(callback);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeGroups', () => {
    test('removes groups matching predicate', () => {
      const g1 = createGroup();
      const g2 = createGroup();
      const g3 = createGroup();
      const sequence = new Sequence([g1, g2, g3]);

      sequence.removeGroups((group) => group === g2);

      expect(sequence.animationGroups).toEqual([g1, g3]);
    });

    test('removes corresponding entries from animations array', () => {
      const a1 = createMockAnimation();
      const a2 = createMockAnimation();
      const a3 = createMockAnimation();
      const g1 = createGroup({ animations: [a1] });
      const g2 = createGroup({ animations: [a2] });
      const g3 = createGroup({ animations: [a3] });
      const sequence = new Sequence([g1, g2, g3]);

      sequence.removeGroups((group) => group === g2);

      expect(sequence.animations).toEqual([a1, a3]);
    });

    test('removes corresponding entries from timingOptions (addGroups still works after removal)', () => {
      const groups = [createStatefulGroup(), createStatefulGroup(), createStatefulGroup()];
      const sequence = new Sequence(groups, { offset: 100, offsetEasing: 'linear' });

      sequence.removeGroups((group) => group === groups[1]);

      // After removing middle group, 2 groups remain. Add a new group and verify offsets recalculate.
      const gNew = createStatefulGroup();
      sequence.addGroups([{ index: 1, group: gNew }]);

      // 3 groups again: offsets [0, 100, 200], delays [0, 100, 200]
      const allDelays = sequence.animationGroups.map(
        (g) => g.animations[0]?.effect?.getTiming().delay as number,
      );
      expect(allDelays).toEqual([0, 100, 200]);
    });

    test('cancels animations in removed groups', () => {
      const a1 = createMockAnimation();
      const a2 = createMockAnimation();
      const g1 = createGroup({ animations: [a1] });
      const g2 = createGroup({ animations: [a2] });
      const sequence = new Sequence([g1, g2]);

      sequence.removeGroups((group) => group === g1);

      expect(a1.cancel).toHaveBeenCalledTimes(1);
      expect(a2.cancel).not.toHaveBeenCalled();
    });

    test('recalculates offsets after removal', () => {
      const groups = [
        createStatefulGroup(),
        createStatefulGroup(),
        createStatefulGroup(),
        createStatefulGroup(),
      ];
      const sequence = new Sequence(groups, { delay: 0, offset: 100, offsetEasing: 'linear' });

      // Before removal: 4 groups, offsets [0, 100, 200, 300]
      // sequenceDuration = 300 + 1000 = 1300
      // endDelays: [300, 200, 100, 0]
      expect(groups[0].animations[0].effect!.getTiming().endDelay).toBe(300);

      sequence.removeGroups((group) => group === groups[1]);

      // After removal: 3 groups remain (groups[0], groups[2], groups[3])
      // offsets: [0, 100, 200], sequenceDuration = 200 + 1000 = 1200
      // endDelays: [200, 100, 0]
      const delays = sequence.animationGroups.map(
        (g) => g.animations[0]?.effect?.getTiming().delay as number,
      );
      const endDelays = sequence.animationGroups.map(
        (g) => g.animations[0]?.effect?.getTiming().endDelay as number,
      );
      expect(delays).toEqual([0, 100, 200]);
      expect(endDelays).toEqual([200, 100, 0]);
    });

    test('updates ready promise after removal', async () => {
      const g1 = createGroup();
      const g2 = createGroup();
      const sequence = new Sequence([g1, g2]);

      sequence.removeGroups((group) => group === g2);

      await expect(sequence.ready).resolves.toBeUndefined();
    });

    test('returns removed groups', () => {
      const g1 = createGroup();
      const g2 = createGroup();
      const g3 = createGroup();
      const sequence = new Sequence([g1, g2, g3]);

      const removed = sequence.removeGroups((group) => group === g1 || group === g3);

      expect(removed).toEqual([g1, g3]);
    });

    test('no-op when predicate matches nothing', () => {
      const g1 = createGroup();
      const g2 = createGroup();
      const sequence = new Sequence([g1, g2], { offset: 100 });
      const groupsBefore = [...sequence.animationGroups];
      const animsBefore = [...sequence.animations];

      const removed = sequence.removeGroups(() => false);

      expect(removed).toEqual([]);
      expect(sequence.animationGroups).toEqual(groupsBefore);
      expect(sequence.animations).toEqual(animsBefore);
    });

    test('handles removing all groups (empty sequence)', () => {
      const g1 = createGroup();
      const g2 = createGroup();
      const sequence = new Sequence([g1, g2], { offset: 100 });

      const removed = sequence.removeGroups(() => true);

      expect(removed).toEqual([g1, g2]);
      expect(sequence.animationGroups).toEqual([]);
      expect(sequence.animations).toEqual([]);
    });

    test('addGroups after removing all groups works correctly', () => {
      const g1 = createStatefulGroup();
      const g2 = createStatefulGroup();
      const sequence = new Sequence([g1, g2], { offset: 100, offsetEasing: 'linear' });

      sequence.removeGroups(() => true);
      expect(sequence.animationGroups).toEqual([]);

      const gNew1 = createStatefulGroup();
      const gNew2 = createStatefulGroup();
      sequence.addGroups([
        { index: 0, group: gNew1 },
        { index: 1, group: gNew2 },
      ]);

      expect(sequence.animationGroups).toEqual([gNew1, gNew2]);
      const delays = sequence.animationGroups.map(
        (g) => g.animations[0]?.effect?.getTiming().delay as number,
      );
      expect(delays).toEqual([0, 100]);
    });

    test('handles removing from single-group sequence', () => {
      const g1 = createGroup();
      const sequence = new Sequence([g1], { offset: 200 });

      const removed = sequence.removeGroups((group) => group === g1);

      expect(removed).toEqual([g1]);
      expect(sequence.animationGroups).toEqual([]);
      expect(sequence.animations).toEqual([]);
    });

    test('removing multiple groups at once recalculates correctly', () => {
      const groups = Array.from({ length: 5 }, () => createStatefulGroup());
      const sequence = new Sequence(groups, { delay: 0, offset: 100, offsetEasing: 'linear' });

      // Remove groups at index 1 and 3
      sequence.removeGroups((group) => group === groups[1] || group === groups[3]);

      // 3 groups remain: groups[0], groups[2], groups[4]
      expect(sequence.animationGroups).toEqual([groups[0], groups[2], groups[4]]);
      const delays = sequence.animationGroups.map(
        (g) => g.animations[0]?.effect?.getTiming().delay as number,
      );
      expect(delays).toEqual([0, 100, 200]);
    });
  });
});
