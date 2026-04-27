import { describe, expect, test, vi } from 'vitest';
import { AnimationGroup } from '../src/AnimationGroup';
import { AnimationGroupOptions, RangeOffset } from '../src/types';

(globalThis as any).CSSAnimation = class CSSAnimation {};

// Mock Web Animation API
const createMockAnimation = (overrides: Partial<Animation> = {}): Animation =>
  ({
    id: '',
    currentTime: 0,
    playState: 'idle' as AnimationPlayState,
    ready: Promise.resolve(undefined as any),
    finished: Promise.resolve(undefined as any),
    effect: {
      getComputedTiming: vi.fn().mockReturnValue({
        progress: 0.5,
      }),
      getTiming: vi.fn().mockReturnValue({
        delay: 0,
        duration: 1000,
      }),
    } as any,
    play: vi.fn(),
    pause: vi.fn(),
    cancel: vi.fn(),
    reverse: vi.fn(),
    playbackRate: 1,
    ...overrides,
  }) as Animation;

const createMockAnimationWithEndTime = (
  endTime: number,
  progress = 0.5,
  overrides: Partial<Animation> = {},
): Animation =>
  createMockAnimation({
    effect: {
      getComputedTiming: vi.fn().mockReturnValue({ progress, endTime }),
      getTiming: vi.fn().mockReturnValue({ delay: 0, duration: 1000 }),
    } as any,
    ...overrides,
  });

describe('AnimationGroup', () => {
  describe('Constructor', () => {
    test('should create AnimationGroup with animations array and options', () => {
      const mockAnimations = [createMockAnimation(), createMockAnimation()];
      const mockOptions: AnimationGroupOptions = {
        duration: 1000,
        measured: Promise.resolve(),
      };

      const animationGroup = new AnimationGroup(mockAnimations, mockOptions);

      expect(animationGroup.animations).toBe(mockAnimations);
      expect(animationGroup.options).toBe(mockOptions);
      expect(animationGroup.ready).toBe(mockOptions.measured);
    });

    test('should create AnimationGroup with animations array only', () => {
      const mockAnimations = [createMockAnimation(), createMockAnimation()];

      const animationGroup = new AnimationGroup(mockAnimations);

      expect(animationGroup.animations).toBe(mockAnimations);
      expect(animationGroup.options).toBeUndefined();
      expect(animationGroup.ready).toBeInstanceOf(Promise);
    });

    test('should initialize properties correctly', () => {
      const mockAnimations = [createMockAnimation()];
      const mockOptions: AnimationGroupOptions = {
        effectId: 'test-effect',
      };

      const animationGroup = new AnimationGroup(mockAnimations, mockOptions);

      expect(animationGroup).toHaveProperty('animations');
      expect(animationGroup).toHaveProperty('options');
      expect(animationGroup).toHaveProperty('ready');
      expect(animationGroup.animations).toEqual(mockAnimations);
      expect(animationGroup.options).toEqual(mockOptions);
    });

    test('should set ready promise from options.measured', async () => {
      const mockAnimations = [createMockAnimation()];
      const measuredPromise = Promise.resolve();
      const mockOptions: AnimationGroupOptions = {
        measured: measuredPromise,
      };

      const animationGroup = new AnimationGroup(mockAnimations, mockOptions);

      expect(animationGroup.ready).toBe(measuredPromise);
      await expect(animationGroup.ready).resolves.toBeUndefined();
    });

    test('should default ready promise to resolved when no measured option', async () => {
      const mockAnimations = [createMockAnimation()];

      const animationGroup = new AnimationGroup(mockAnimations);

      expect(animationGroup.ready).toBeInstanceOf(Promise);
      await expect(animationGroup.ready).resolves.toBeUndefined();
    });
  });

  describe('Properties', () => {
    test('should expose animations property', () => {
      const mockAnimations = [createMockAnimation(), createMockAnimation()];
      const animationGroup = new AnimationGroup(mockAnimations);

      expect(animationGroup.animations).toBe(mockAnimations);
      expect(animationGroup.animations).toHaveLength(2);
      expect(animationGroup.animations[0]).toHaveProperty('play');
      expect(animationGroup.animations[1]).toHaveProperty('pause');
    });

    test('should expose options property', () => {
      const mockAnimations = [createMockAnimation()];
      const mockOptions: AnimationGroupOptions = {
        duration: 2000,
        effectId: 'test-effect-123',
        easing: 'ease-in-out',
      };

      const animationGroup = new AnimationGroup(mockAnimations, mockOptions);

      expect(animationGroup.options).toBe(mockOptions);
      expect(animationGroup.options?.duration).toBe(2000);
      expect(animationGroup.options?.effectId).toBe('test-effect-123');
      expect(animationGroup.options?.easing).toBe('ease-in-out');
    });

    test('should expose ready property', async () => {
      const mockAnimations = [createMockAnimation()];
      const measuredPromise = Promise.resolve();
      const mockOptions: AnimationGroupOptions = {
        measured: measuredPromise,
      };

      const animationGroup = new AnimationGroup(mockAnimations, mockOptions);

      expect(animationGroup.ready).toBe(measuredPromise);
      expect(animationGroup.ready).toBeInstanceOf(Promise);
      await expect(animationGroup.ready).resolves.toBeUndefined();
    });

    test('should handle animations with start and end range offsets', () => {
      const startOffset: RangeOffset = {
        name: 'entry',
        offset: { unit: 'percentage', value: 25 },
      };
      const endOffset: RangeOffset = {
        name: 'exit',
        offset: { unit: 'px', value: 100 },
      };

      const animationWithRanges = {
        ...createMockAnimation(),
        start: startOffset,
        end: endOffset,
      };

      const animationGroup = new AnimationGroup([animationWithRanges]);

      expect(animationGroup.animations[0]).toHaveProperty('start');
      expect(animationGroup.animations[0]).toHaveProperty('end');
      expect((animationGroup.animations[0] as any).start).toEqual(startOffset);
      expect((animationGroup.animations[0] as any).end).toEqual(endOffset);
      expect((animationGroup.animations[0] as any).start.name).toBe('entry');
      expect((animationGroup.animations[0] as any).end.name).toBe('exit');
    });
  });

  describe('_getAnimationWithLongestEndTime()', () => {
    test('returns the sole animation when there is only one', () => {
      const a = createMockAnimationWithEndTime(2000);
      const group = new AnimationGroup([a]);

      expect(group._getAnimationWithLongestEndTime()).toBe(a);
      expect(group.longestAnimation).toBe(a);
    });

    test('returns the animation with the greatest endTime', () => {
      const shorter = createMockAnimationWithEndTime(500);
      const longer = createMockAnimationWithEndTime(3000);
      const middle = createMockAnimationWithEndTime(1500);
      const group = new AnimationGroup([shorter, longer, middle]);

      expect(group._getAnimationWithLongestEndTime()).toBe(longer);
      expect(group.longestAnimation).toBe(longer);
    });

    test('when endTimes are equal, keeps the last animation (strict > comparison)', () => {
      const first = createMockAnimationWithEndTime(1000, 0.1);
      const second = createMockAnimationWithEndTime(1000, 0.9);
      const group = new AnimationGroup([first, second]);

      expect(group._getAnimationWithLongestEndTime()).toBe(second);
      expect(group.longestAnimation).toBe(second);
    });

    test('treats missing endTime as 0', () => {
      const noEndTime = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0.5 }),
          getTiming: vi.fn().mockReturnValue({ delay: 0, duration: 1000 }),
        } as any,
      });
      const withEndTime = createMockAnimationWithEndTime(100);
      const group = new AnimationGroup([noEndTime, withEndTime]);

      expect(group._getAnimationWithLongestEndTime()).toBe(withEndTime);
    });

    test('treats missing effect as endTime 0 so a later animation with timing can win', () => {
      const noEffect = createMockAnimation({ effect: null });
      const withEndTime = createMockAnimationWithEndTime(50);
      const group = new AnimationGroup([noEffect, withEndTime]);

      expect(group._getAnimationWithLongestEndTime()).toBe(withEndTime);
    });

    test('returns undefined for an empty animations array', () => {
      const group = new AnimationGroup([]);

      expect(group._getAnimationWithLongestEndTime()).toBeUndefined();
      expect(group.longestAnimation).toBeUndefined();
    });
  });

  describe('getProgress()', () => {
    test('should return progress from longest animation by endTime', () => {
      const mockAnimation1 = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0.75, endTime: 500 }),
          getTiming: vi.fn().mockReturnValue({ delay: 0, duration: 1000 }),
        } as any,
      });
      const mockAnimation2 = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0.25, endTime: 2000 }),
          getTiming: vi.fn().mockReturnValue({ delay: 0, duration: 1000 }),
        } as any,
      });

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2]);

      const progress = animationGroup.getProgress();

      expect(progress).toBe(0.25);
      expect(mockAnimation1.effect!.getComputedTiming).toHaveBeenCalled();
      expect(mockAnimation2.effect!.getComputedTiming).toHaveBeenCalled();
    });

    test('should return 0 when sole animation has no effect', () => {
      const mockAnimationNoEffect = createMockAnimation({
        effect: null,
      });

      const animationGroup = new AnimationGroup([mockAnimationNoEffect]);

      const progress = animationGroup.getProgress();

      expect(progress).toBe(0);
    });

    test('should return 0 when animations array is empty', () => {
      const animationGroup = new AnimationGroup([]);

      const progress = animationGroup.getProgress();

      expect(progress).toBe(0);
    });

    test('should return progress value between 0 and 1', () => {
      const testCases = [
        { inputProgress: 0, expectedProgress: 0 },
        { inputProgress: 0.25, expectedProgress: 0.25 },
        { inputProgress: 0.5, expectedProgress: 0.5 },
        { inputProgress: 0.99, expectedProgress: 0.99 },
        { inputProgress: 1, expectedProgress: 1 },
        { inputProgress: null, expectedProgress: 0 }, // Test fallback to 0
        { inputProgress: undefined, expectedProgress: 0 }, // Test fallback to 0
      ];

      testCases.forEach(({ inputProgress, expectedProgress }) => {
        const mockAnimation = createMockAnimation({
          effect: {
            getComputedTiming: vi.fn().mockReturnValue({ progress: inputProgress }),
            getTiming: vi.fn().mockReturnValue({ delay: 0, duration: 1000 }),
          } as any,
        });

        const animationGroup = new AnimationGroup([mockAnimation]);
        const actualProgress = animationGroup.getProgress();

        expect(actualProgress).toBe(expectedProgress);
      });
    });
  });

  describe('play()', () => {
    test('should call play on all animations', async () => {
      const mockAnimation1 = createMockAnimation();
      const mockAnimation2 = createMockAnimation();
      const mockAnimation3 = createMockAnimation();

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2, mockAnimation3]);

      await animationGroup.play();

      expect(mockAnimation1.play).toHaveBeenCalledTimes(1);
      expect(mockAnimation2.play).toHaveBeenCalledTimes(1);
      expect(mockAnimation3.play).toHaveBeenCalledTimes(1);
    });

    test('should wait for ready promise before playing', async () => {
      let readyResolve: () => void;
      const readyPromise = new Promise<void>((resolve) => {
        readyResolve = resolve;
      });

      const mockAnimation = createMockAnimation();
      const mockOptions: AnimationGroupOptions = {
        measured: readyPromise,
      };

      const animationGroup = new AnimationGroup([mockAnimation], mockOptions);

      // Start play but don't await yet
      const playPromise = animationGroup.play();

      // Animation should not be played yet
      expect(mockAnimation.play).not.toHaveBeenCalled();

      // Resolve the ready promise
      readyResolve!();

      // Now await the play completion
      await playPromise;

      // Animation should be played after ready resolves
      expect(mockAnimation.play).toHaveBeenCalledTimes(1);
    });

    test('should execute callback after all animations are ready', async () => {
      const callback = vi.fn();
      const mockAnimation1 = createMockAnimation();
      const mockAnimation2 = createMockAnimation();

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2]);

      await animationGroup.play(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(mockAnimation1.play).toHaveBeenCalled();
      expect(mockAnimation2.play).toHaveBeenCalled();
    });

    test('should handle callback when no callback provided', async () => {
      const mockAnimation = createMockAnimation();
      const animationGroup = new AnimationGroup([mockAnimation]);

      // Should not throw when no callback provided
      await expect(animationGroup.play()).resolves.toBeUndefined();
      expect(mockAnimation.play).toHaveBeenCalledTimes(1);
    });

    test('should handle empty animations array', async () => {
      const callback = vi.fn();
      const animationGroup = new AnimationGroup([]);

      await animationGroup.play(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      // No animations to play, but callback should still be called
    });

    // test('should handle animation ready promise rejections gracefully', async () => {
    //   const mockAnimation1 = createMockAnimation({
    //     ready: Promise.resolve(undefined as any),
    //   });
    //   const mockAnimation2 = createMockAnimation({
    //     ready: Promise.reject(new Error('Animation failed')),
    //   });
    //   const callback = vi.fn();
    //
    //   const animationGroup = new AnimationGroup([
    //     mockAnimation1,
    //     mockAnimation2,
    //   ]);
    //
    //   // Should not throw despite one animation ready promise rejecting
    //   await expect(animationGroup.play(callback)).resolves.toBeUndefined();
    //
    //   expect(mockAnimation1.play).toHaveBeenCalled();
    //   expect(mockAnimation2.play).toHaveBeenCalled();
    //   // Callback should still be called even if some ready promises reject
    //   expect(callback).toHaveBeenCalledTimes(1);
    // });
  });

  describe('pause()', () => {
    test('should call pause on all animations', () => {
      const mockAnimation1 = createMockAnimation();
      const mockAnimation2 = createMockAnimation();
      const mockAnimation3 = createMockAnimation();

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2, mockAnimation3]);

      animationGroup.pause();

      expect(mockAnimation1.pause).toHaveBeenCalledTimes(1);
      expect(mockAnimation2.pause).toHaveBeenCalledTimes(1);
      expect(mockAnimation3.pause).toHaveBeenCalledTimes(1);
    });

    test('should handle empty animations array', () => {
      const animationGroup = new AnimationGroup([]);

      // Should not throw when pausing empty array
      expect(() => animationGroup.pause()).not.toThrow();
    });

    test('should pause animations immediately without waiting for ready', () => {
      let readyResolve: () => void;
      const readyPromise = new Promise<void>((resolve) => {
        readyResolve = resolve;
      });

      const mockAnimation = createMockAnimation();
      const mockOptions: AnimationGroupOptions = {
        measured: readyPromise,
      };

      const animationGroup = new AnimationGroup([mockAnimation], mockOptions);

      // Call pause before ready promise resolves
      animationGroup.pause();

      // Animation should be paused immediately, not waiting for ready
      expect(mockAnimation.pause).toHaveBeenCalledTimes(1);

      // Resolve ready promise to ensure test cleanup
      readyResolve!();
    });
  });

  describe('reverse()', () => {
    test('should call reverse on all animations', async () => {
      const mockAnimation1 = createMockAnimation();
      const mockAnimation2 = createMockAnimation();
      const mockAnimation3 = createMockAnimation();

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2, mockAnimation3]);

      await animationGroup.reverse();

      expect(mockAnimation1.reverse).toHaveBeenCalledTimes(1);
      expect(mockAnimation2.reverse).toHaveBeenCalledTimes(1);
      expect(mockAnimation3.reverse).toHaveBeenCalledTimes(1);
    });

    test('should wait for ready promise before reversing', async () => {
      let readyResolve: () => void;
      const readyPromise = new Promise<void>((resolve) => {
        readyResolve = resolve;
      });

      const mockAnimation = createMockAnimation();
      const mockOptions: AnimationGroupOptions = {
        measured: readyPromise,
      };

      const animationGroup = new AnimationGroup([mockAnimation], mockOptions);

      // Start reverse but don't await yet
      const reversePromise = animationGroup.reverse();

      // Animation should not be reversed yet
      expect(mockAnimation.reverse).not.toHaveBeenCalled();

      // Resolve the ready promise
      readyResolve!();

      // Now await the reverse completion
      await reversePromise;

      // Animation should be reversed after ready resolves
      expect(mockAnimation.reverse).toHaveBeenCalledTimes(1);
    });

    test('should execute callback after all animations are ready', async () => {
      const callback = vi.fn();
      const mockAnimation1 = createMockAnimation();
      const mockAnimation2 = createMockAnimation();

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2]);

      await animationGroup.reverse(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(mockAnimation1.reverse).toHaveBeenCalled();
      expect(mockAnimation2.reverse).toHaveBeenCalled();
    });

    test('should handle callback when no callback provided', async () => {
      const mockAnimation = createMockAnimation();
      const animationGroup = new AnimationGroup([mockAnimation]);

      // Should not throw when no callback provided
      await expect(animationGroup.reverse()).resolves.toBeUndefined();
      expect(mockAnimation.reverse).toHaveBeenCalledTimes(1);
    });

    test('should handle empty animations array', async () => {
      const callback = vi.fn();
      const animationGroup = new AnimationGroup([]);

      await animationGroup.reverse(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      // No animations to reverse, but callback should still be called
    });

    // test('should handle animation ready promise rejections gracefully', async () => {
    //   const mockAnimation1 = createMockAnimation({
    //     ready: Promise.resolve(undefined as any),
    //   });
    //   const mockAnimation2 = createMockAnimation({
    //     ready: Promise.reject(new Error('Animation failed')),
    //   });
    //   const callback = vi.fn();
    //
    //   const animationGroup = new AnimationGroup([
    //     mockAnimation1,
    //     mockAnimation2,
    //   ]);
    //
    //   // Should not throw despite one animation ready promise rejecting
    //   await expect(animationGroup.reverse(callback)).resolves.toBeUndefined();
    //
    //   expect(mockAnimation1.reverse).toHaveBeenCalled();
    //   expect(mockAnimation2.reverse).toHaveBeenCalled();
    //   // Callback should still be called even if some ready promises reject
    //   expect(callback).toHaveBeenCalledTimes(1);
    // });
  });

  describe('progress()', () => {
    test('should set currentTime on all animations based on progress value', () => {
      const mockAnimation1 = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0, endTime: 0 }),
          getTiming: vi.fn().mockReturnValue({
            delay: 200,
            duration: 1000,
          }),
        } as any,
      });
      const mockAnimation2 = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0, endTime: 0 }),
          getTiming: vi.fn().mockReturnValue({
            delay: 100,
            duration: 2000,
          }),
        } as any,
      });

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2]);

      animationGroup.progress(0.5);

      // Expected calculation: (delay + duration * progress) * progress
      // Animation 1: (200 + 1000) * 0.5 = 600
      // Animation 2: (100 + 2000) * 0.5 = 1050
      expect(mockAnimation1.currentTime).toBe(600);
      expect(mockAnimation2.currentTime).toBe(1050);
      expect(mockAnimation1.effect!.getTiming).toHaveBeenCalled();
      expect(mockAnimation2.effect!.getTiming).toHaveBeenCalled();
    });

    test('should calculate currentTime using , progress, and delay', () => {
      const testCases = [
        {
          duration: 1000,
          delay: 500,
          progress: 0.75,
          expected: 1125, // (500 + 1000) * 0.75
        },
        {
          duration: 800,
          delay: 0,
          progress: 0.25,
          expected: 200, // (0 + 800) * 0.25
        },
        {
          duration: 0,
          delay: 300,
          progress: 1.0,
          expected: 300, // (300 + 0) * 1.0
        },
      ];

      testCases.forEach(({ duration, delay, progress, expected }) => {
        const mockAnimation = createMockAnimation({
          effect: {
            getComputedTiming: vi.fn().mockReturnValue({ progress: 0, endTime: 0 }),
            getTiming: vi.fn().mockReturnValue({
              delay,
              duration,
            }),
          } as any,
        });

        const animationGroup = new AnimationGroup([mockAnimation]);
        animationGroup.progress(progress);

        expect(mockAnimation.currentTime).toBe(expected);
      });
    });

    test('should handle progress value of 0', () => {
      const mockAnimation = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0, endTime: 0 }),
          getTiming: vi.fn().mockReturnValue({
            delay: 200,
            duration: 1000,
          }),
        } as any,
      });

      const animationGroup = new AnimationGroup([mockAnimation]);
      animationGroup.progress(0);

      expect(mockAnimation.currentTime).toBe(0);
    });

    test('should handle progress value of 1', () => {
      const mockAnimation = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0, endTime: 0 }),
          getTiming: vi.fn().mockReturnValue({
            delay: 200,
            duration: 1000,
          }),
        } as any,
      });

      const animationGroup = new AnimationGroup([mockAnimation]);
      animationGroup.progress(1);

      expect(mockAnimation.currentTime).toBe(1200); // (200 + 1000) * 1
    });

    test('should handle progress values greater than 1', () => {
      const mockAnimation = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0, endTime: 0 }),
          getTiming: vi.fn().mockReturnValue({
            delay: 200,
            duration: 1000,
          }),
        } as any,
      });

      const animationGroup = new AnimationGroup([mockAnimation]);
      animationGroup.progress(1.5);

      expect(mockAnimation.currentTime).toBe(1800); // (200 + 1000) * 1.5
    });

    test('should handle negative progress values', () => {
      const mockAnimation = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0, endTime: 0 }),
          getTiming: vi.fn().mockReturnValue({
            delay: 200,
            duration: 1000,
          }),
        } as any,
      });

      const animationGroup = new AnimationGroup([mockAnimation]);
      animationGroup.progress(-0.5);

      expect(mockAnimation.currentTime).toBe(-600); // (200 + 1000) * -0.5
    });

    test('should handle animations with no delay', () => {
      const mockAnimation = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0, endTime: 0 }),
          getTiming: vi.fn().mockReturnValue({
            delay: undefined,
            duration: 1000,
          }),
        } as any,
      });

      const animationGroup = new AnimationGroup([mockAnimation]);
      animationGroup.progress(0.5);

      // Should use 0 for delay when undefined: (0 + 1000) * 0.5 = 500
      expect(mockAnimation.currentTime).toBe(500);
    });

    test('should handle animations with zero duration', () => {
      const mockAnimation = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0, endTime: 0 }),
          getTiming: vi.fn().mockReturnValue({
            delay: 200,
            duration: 0,
          }),
        } as any,
      });

      const animationGroup = new AnimationGroup([mockAnimation]);
      animationGroup.progress(0.5);

      // Should handle zero duration: (200 + 0) * 0.5 = 100
      expect(mockAnimation.currentTime).toBe(100);
    });

    test('should account for iterations in currentTime calculation', () => {
      const mockAnimation = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0, endTime: 0 }),
          getTiming: vi.fn().mockReturnValue({
            delay: 100,
            duration: 500,
            iterations: 3,
          }),
        } as any,
      });

      const animationGroup = new AnimationGroup([mockAnimation]);
      animationGroup.progress(0.5);

      // time = duration * iterations = 500 * 3 = 1500
      // currentTime = (100 + 1500) * 0.5 = 800
      expect(mockAnimation.currentTime).toBe(800);
    });

    test('should treat Infinity iterations as 1', () => {
      const mockAnimation = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0, endTime: 0 }),
          getTiming: vi.fn().mockReturnValue({
            delay: 0,
            duration: 1000,
            iterations: Infinity,
          }),
        } as any,
      });

      const animationGroup = new AnimationGroup([mockAnimation]);
      animationGroup.progress(0.5);

      // Infinity iterations falls back to 1: time = 1000 * 1 = 1000
      // currentTime = (0 + 1000) * 0.5 = 500
      expect(mockAnimation.currentTime).toBe(500);
    });

    test('should handle empty animations array', () => {
      const animationGroup = new AnimationGroup([]);

      // Should not throw when progressing empty array
      expect(() => animationGroup.progress(0.5)).not.toThrow();
    });
  });

  describe('cancel()', () => {
    test('should call cancel on all animations', () => {
      const mockAnimation1 = createMockAnimation();
      const mockAnimation2 = createMockAnimation();
      const mockAnimation3 = createMockAnimation();

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2, mockAnimation3]);

      animationGroup.cancel();

      expect(mockAnimation1.cancel).toHaveBeenCalledTimes(1);
      expect(mockAnimation2.cancel).toHaveBeenCalledTimes(1);
      expect(mockAnimation3.cancel).toHaveBeenCalledTimes(1);
    });

    test('should handle empty animations array', () => {
      const animationGroup = new AnimationGroup([]);

      // Should not throw when cancelling empty array
      expect(() => animationGroup.cancel()).not.toThrow();
    });

    test('should cancel animations immediately without waiting for ready', () => {
      let readyResolve: () => void;
      const readyPromise = new Promise<void>((resolve) => {
        readyResolve = resolve;
      });

      const mockAnimation = createMockAnimation();
      const mockOptions: AnimationGroupOptions = {
        measured: readyPromise,
      };

      const animationGroup = new AnimationGroup([mockAnimation], mockOptions);

      // Call cancel before ready promise resolves
      animationGroup.cancel();

      // Animation should be cancelled immediately, not waiting for ready
      expect(mockAnimation.cancel).toHaveBeenCalledTimes(1);

      // Resolve ready promise to ensure test cleanup
      readyResolve!();
    });
  });

  describe('setPlaybackRate()', () => {
    test('should set playbackRate on all animations', () => {
      const mockAnimation1 = createMockAnimation();
      const mockAnimation2 = createMockAnimation();
      const mockAnimation3 = createMockAnimation();

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2, mockAnimation3]);

      animationGroup.setPlaybackRate(2.0);

      expect(mockAnimation1.playbackRate).toBe(2.0);
      expect(mockAnimation2.playbackRate).toBe(2.0);
      expect(mockAnimation3.playbackRate).toBe(2.0);
    });

    test('should handle positive playback rates', () => {
      const testRates = [0.5, 1.0, 1.5, 2.0, 3.0];

      testRates.forEach((rate) => {
        const mockAnimation = createMockAnimation();
        const animationGroup = new AnimationGroup([mockAnimation]);

        animationGroup.setPlaybackRate(rate);

        expect(mockAnimation.playbackRate).toBe(rate);
      });
    });

    test('should handle negative playback rates', () => {
      const mockAnimation = createMockAnimation();
      const animationGroup = new AnimationGroup([mockAnimation]);

      animationGroup.setPlaybackRate(-1.0);

      expect(mockAnimation.playbackRate).toBe(-1.0);
    });

    test('should handle zero playback rate', () => {
      const mockAnimation = createMockAnimation();
      const animationGroup = new AnimationGroup([mockAnimation]);

      animationGroup.setPlaybackRate(0);

      expect(mockAnimation.playbackRate).toBe(0);
    });

    test('should handle empty animations array', () => {
      const animationGroup = new AnimationGroup([]);

      // Should not throw when setting playback rate on empty array
      expect(() => animationGroup.setPlaybackRate(2.0)).not.toThrow();
    });
  });

  describe('onFinish()', () => {
    test('should execute callback when all animations finish', async () => {
      const callback = vi.fn();
      let finishResolve1: () => void;
      let finishResolve2: () => void;

      const mockAnimation1 = createMockAnimation({
        finished: new Promise<Animation>((resolve) => {
          finishResolve1 = () => resolve(undefined as any);
        }),
      });
      const mockAnimation2 = createMockAnimation({
        finished: new Promise<Animation>((resolve) => {
          finishResolve2 = () => resolve(undefined as any);
        }),
      });

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2]);

      // Start onFinish but don't await yet
      const finishPromise = animationGroup.onFinish(callback);

      // Callback should not be called yet
      expect(callback).not.toHaveBeenCalled();

      // Finish first animation
      finishResolve1!();
      await new Promise((resolve) => setTimeout(resolve, 0)); // Let promises resolve

      // Callback still should not be called
      expect(callback).not.toHaveBeenCalled();

      // Finish second animation
      finishResolve2!();
      await finishPromise;

      // Now callback should be called
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should handle animations finishing at different times', async () => {
      const callback = vi.fn();
      const mockAnimation1 = createMockAnimation({
        finished: Promise.resolve(undefined as any),
      });
      const mockAnimation2 = createMockAnimation({
        finished: new Promise((resolve) => setTimeout(() => resolve(undefined as any), 10)),
      });

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2]);

      await animationGroup.onFinish(callback);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should catch and log errors when animations are interrupted', async () => {
      const callback = vi.fn();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockAnimation1 = createMockAnimation({
        finished: Promise.resolve(undefined as any),
      });
      const mockAnimation2 = createMockAnimation({
        finished: Promise.reject(new Error('Animation interrupted')),
      });

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2]);

      await animationGroup.onFinish(callback);

      expect(callback).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'animation was interrupted - aborting onFinish callback - ',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    test('should handle empty animations array', async () => {
      const callback = vi.fn();
      const animationGroup = new AnimationGroup([]);

      await animationGroup.onFinish(callback);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should not execute callback if any animation is cancelled', async () => {
      const callback = vi.fn();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockAnimation1 = createMockAnimation({
        finished: Promise.resolve(undefined as any),
      });
      const mockAnimation2 = createMockAnimation({
        finished: Promise.reject(new Error('Animation was cancelled')),
      });

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2]);

      await animationGroup.onFinish(callback);

      expect(callback).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should handle promise rejections gracefully', async () => {
      const callback = vi.fn();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockAnimation = createMockAnimation({
        finished: Promise.reject(new Error('Unexpected animation error')),
      });

      const animationGroup = new AnimationGroup([mockAnimation]);

      // Should not throw
      await expect(animationGroup.onFinish(callback)).resolves.toBeUndefined();

      expect(callback).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'animation was interrupted - aborting onFinish callback - ',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('onAbort()', () => {
    test('should execute callback when a CSSAnimation is cancelled externally (not via AnimationGroup.cancel)', async () => {
      const callback = vi.fn();
      let rejectFinished: (error: any) => void;

      const finishedPromise = new Promise<Animation>((_resolve, reject) => {
        rejectFinished = reject;
      });

      const mockAnimation = createMockAnimation({
        finished: finishedPromise,
        cancel: vi.fn(() => {
          rejectFinished(new DOMException('The animation was aborted.', 'AbortError'));
        }),
      });

      const animationGroup = new AnimationGroup([mockAnimation]);
      const abortPromise = animationGroup.onAbort(callback);

      expect(callback).not.toHaveBeenCalled();

      // Cancel the inner CSSAnimation directly, simulating the browser
      // removing the animation (e.g. a viewEnter effect going out of range)
      mockAnimation.cancel();

      await abortPromise;

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should execute callback when one of multiple animations is cancelled externally', async () => {
      const callback = vi.fn();
      let rejectFinished: (error: any) => void;

      const cancelledAnimation = createMockAnimation({
        finished: new Promise<Animation>((_resolve, reject) => {
          rejectFinished = reject;
        }),
        cancel: vi.fn(() => {
          rejectFinished(new DOMException('The animation was aborted.', 'AbortError'));
        }),
      });

      const normalAnimation = createMockAnimation({
        finished: new Promise<Animation>(() => {}),
      });

      const animationGroup = new AnimationGroup([normalAnimation, cancelledAnimation]);
      const abortPromise = animationGroup.onAbort(callback);

      cancelledAnimation.cancel();

      await abortPromise;

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should not execute callback for non-AbortError rejections', async () => {
      const callback = vi.fn();

      const mockAnimation = createMockAnimation({
        finished: Promise.reject(new Error('Some other error')),
      });

      const animationGroup = new AnimationGroup([mockAnimation]);
      await animationGroup.onAbort(callback);

      expect(callback).not.toHaveBeenCalled();
    });

    test('should not execute callback when animations finish successfully', async () => {
      const callback = vi.fn();

      const mockAnimation = createMockAnimation({
        finished: Promise.resolve(undefined as any),
      });

      const animationGroup = new AnimationGroup([mockAnimation]);
      await animationGroup.onAbort(callback);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('playState getter', () => {
    test('should return playState from first animation', () => {
      const mockAnimation1 = createMockAnimation({
        playState: 'running' as AnimationPlayState,
      });
      const mockAnimation2 = createMockAnimation({
        playState: 'paused' as AnimationPlayState,
      });

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2]);

      expect(animationGroup.playState).toBe('running');
    });

    test('should handle empty animations array', () => {
      const animationGroup = new AnimationGroup([]);

      // Should not throw when accessing playState on empty array
      expect(() => animationGroup.playState).not.toThrow();
      // Should return undefined for empty array
      expect(animationGroup.playState).toBeUndefined();
    });

    test('should return correct state for different animation states', () => {
      const testStates: AnimationPlayState[] = ['idle', 'running', 'paused', 'finished'];

      testStates.forEach((state) => {
        const mockAnimation = createMockAnimation({
          playState: state,
        });
        const animationGroup = new AnimationGroup([mockAnimation]);

        expect(animationGroup.playState).toBe(state);
      });
    });
  });

  describe('getTimingOptions()', () => {
    test('returns delay, duration, and iterations for each animation', () => {
      const mockAnimation1 = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0.5 }),
          getTiming: vi.fn().mockReturnValue({ delay: 100, duration: 500, iterations: 2 }),
        } as any,
      });
      const mockAnimation2 = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0.5 }),
          getTiming: vi.fn().mockReturnValue({ delay: 0, duration: 1000, iterations: 1 }),
        } as any,
      });

      const group = new AnimationGroup([mockAnimation1, mockAnimation2]);

      expect(group.getTimingOptions()).toEqual([
        { delay: 100, duration: 500, iterations: 2 },
        { delay: 0, duration: 1000, iterations: 1 },
      ]);
    });

    test('defaults delay to 0 when undefined', () => {
      const mockAnimation = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0.5 }),
          getTiming: vi.fn().mockReturnValue({ duration: 800, iterations: 1 }),
        } as any,
      });

      const group = new AnimationGroup([mockAnimation]);

      expect(group.getTimingOptions()[0].delay).toBe(0);
    });

    test('defaults duration to 0 for non-numeric values', () => {
      const mockAnimation = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0.5 }),
          getTiming: vi.fn().mockReturnValue({ delay: 0, duration: 'auto', iterations: 1 }),
        } as any,
      });

      const group = new AnimationGroup([mockAnimation]);

      expect(group.getTimingOptions()[0].duration).toBe(0);
    });

    test('defaults iterations to 1 when undefined', () => {
      const mockAnimation = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0.5 }),
          getTiming: vi.fn().mockReturnValue({ delay: 0, duration: 1000 }),
        } as any,
      });

      const group = new AnimationGroup([mockAnimation]);

      expect(group.getTimingOptions()[0].iterations).toBe(1);
    });

    test('returns empty array for empty animations', () => {
      const group = new AnimationGroup([]);

      expect(group.getTimingOptions()).toEqual([]);
    });
  });

  describe('Integration Tests', () => {
    test('should coordinate multiple animations with different timings', () => {
      const mockAnimation1 = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0.3, endTime: 5000 }),
          getTiming: vi.fn().mockReturnValue({
            delay: 100,
            duration: 1000,
          }),
        } as any,
        playState: 'running' as AnimationPlayState,
      });
      const mockAnimation2 = createMockAnimation({
        effect: {
          getComputedTiming: vi.fn().mockReturnValue({ progress: 0.7, endTime: 1000 }),
          getTiming: vi.fn().mockReturnValue({
            delay: 200,
            duration: 2000,
          }),
        } as any,
        playState: 'running' as AnimationPlayState,
      });

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2]);

      // Test multiple operations on the group
      expect(animationGroup.getProgress()).toBe(0.3); // From longest (highest endTime) animation
      expect(animationGroup.playState).toBe('running');

      animationGroup.progress(0.5);
      expect(mockAnimation1.currentTime).toBe(550); // (100 + 1000) * 0.5
      expect(mockAnimation2.currentTime).toBe(1100); // (200 + 2000) * 0.5

      animationGroup.setPlaybackRate(2.0);
      expect(mockAnimation1.playbackRate).toBe(2.0);
      expect(mockAnimation2.playbackRate).toBe(2.0);

      animationGroup.pause();
      expect(mockAnimation1.pause).toHaveBeenCalled();
      expect(mockAnimation2.pause).toHaveBeenCalled();
    });

    test('should work with animations that have start and end range offsets', () => {
      const startOffset: RangeOffset = {
        name: 'entry',
        offset: { unit: 'percentage', value: 25 },
      };
      const endOffset: RangeOffset = {
        name: 'exit',
        offset: { unit: 'px', value: 100 },
      };

      const animationWithRanges = {
        ...createMockAnimation(),
        start: startOffset,
        end: endOffset,
      };

      const animationGroup = new AnimationGroup([animationWithRanges]);

      // Verify range offsets are preserved
      expect((animationGroup.animations[0] as any).start).toEqual(startOffset);
      expect((animationGroup.animations[0] as any).end).toEqual(endOffset);

      // Normal operations should still work
      animationGroup.progress(0.75);
      expect(animationWithRanges.currentTime).toBe(750); // (0 + 1000) * 0.75 from default mock

      animationGroup.pause();
      expect(animationWithRanges.pause).toHaveBeenCalled();
    });

    test('should handle complex animation group lifecycle', async () => {
      const callback = vi.fn();
      const mockAnimation1 = createMockAnimation();
      const mockAnimation2 = createMockAnimation();

      const mockOptions: AnimationGroupOptions = {
        duration: 1000,
        effectId: 'complex-effect',
        measured: Promise.resolve(),
      };

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2], mockOptions);

      // Test full lifecycle
      await animationGroup.play();
      expect(mockAnimation1.play).toHaveBeenCalled();
      expect(mockAnimation2.play).toHaveBeenCalled();

      animationGroup.progress(0.5);
      expect(mockAnimation1.currentTime).toBe(500);
      expect(mockAnimation2.currentTime).toBe(500);

      animationGroup.setPlaybackRate(1.5);
      expect(mockAnimation1.playbackRate).toBe(1.5);
      expect(mockAnimation2.playbackRate).toBe(1.5);

      await animationGroup.reverse(callback);
      expect(mockAnimation1.reverse).toHaveBeenCalled();
      expect(mockAnimation2.reverse).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();

      animationGroup.cancel();
      expect(mockAnimation1.cancel).toHaveBeenCalled();
      expect(mockAnimation2.cancel).toHaveBeenCalled();
    });

    test('should work correctly with measured promise timing', async () => {
      let measuredResolve: () => void;
      const measuredPromise = new Promise<void>((resolve) => {
        measuredResolve = resolve;
      });

      const mockAnimation = createMockAnimation();
      const mockOptions: AnimationGroupOptions = {
        measured: measuredPromise,
      };

      const animationGroup = new AnimationGroup([mockAnimation], mockOptions);

      // Immediate operations should work
      animationGroup.pause();
      animationGroup.progress(0.5);
      expect(mockAnimation.pause).toHaveBeenCalled();
      expect(mockAnimation.currentTime).toBe(500);

      // Promise-based operations should wait
      const playPromise = animationGroup.play();
      expect(mockAnimation.play).not.toHaveBeenCalled();

      measuredResolve!();
      await playPromise;
      expect(mockAnimation.play).toHaveBeenCalled();
    });

    test('should maintain animation state consistency across operations', () => {
      const mockAnimation1 = createMockAnimation({
        playState: 'idle' as AnimationPlayState,
      });
      const mockAnimation2 = createMockAnimation({
        playState: 'idle' as AnimationPlayState,
      });

      const animationGroup = new AnimationGroup([mockAnimation1, mockAnimation2]);

      // Initial state
      expect(animationGroup.playState).toBe('idle');
      expect(animationGroup.getProgress()).toBe(0.5); // From default mock

      // Change state through operations
      animationGroup.progress(0.25);
      expect(mockAnimation1.currentTime).toBe(250);
      expect(mockAnimation2.currentTime).toBe(250);

      // Test play state changes by creating new group with updated state
      const updatedAnimation1 = createMockAnimation({
        playState: 'running' as AnimationPlayState,
      });
      const updatedGroup = new AnimationGroup([updatedAnimation1, mockAnimation2]);
      expect(updatedGroup.playState).toBe('running');

      // Multiple coordinated operations
      animationGroup.setPlaybackRate(0.5);
      animationGroup.progress(1.0);

      expect(mockAnimation1.playbackRate).toBe(0.5);
      expect(mockAnimation2.playbackRate).toBe(0.5);
      expect(mockAnimation1.currentTime).toBe(1000);
      expect(mockAnimation2.currentTime).toBe(1000);
    });
  });
});
