import {
  getCSSAnimation,
  getEasing,
  prepareAnimation,
  getWebAnimation,
  getElementCSSAnimation,
  getElementAnimation,
  getScrubScene,
  getAnimation,
} from '../src/motion';
import type { AnimationOptions, TriggerVariant } from '../src/types';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { registerEffects } from '../src/api/registry';

const CustomMouse = vi.fn();
const BlobMouse = vi.fn();

// Mock dependencies
vi.mock('fastdom', () => ({
  default: {
    measure: vi.fn((fn) => fn()),
    mutate: vi.fn((fn) => fn()),
  },
}));

vi.mock('../src/AnimationGroup', () => ({
  AnimationGroup: vi.fn(),
}));

const mockFadeInPreset = {
  style: vi.fn((options: AnimationOptions) => [
    {
      name: 'fade-in',
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
      duration: 1000,
      fill: 'both',
      easing: 'ease-in',
      iterations: 1,
      ...options,
    },
  ]),
  web: vi.fn((options: AnimationOptions) => [
    {
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
      timing: { duration: options?.duration || 1000 },
      duration: 1000,
      ...options,
    },
  ]),
  getNames: vi.fn(() => ['fade-in']),
  prepare: vi.fn(),
};

const mockFadeScrollPreset = {
  style: vi.fn((options: AnimationOptions) => [
    {
      ...options,
      name: 'fade-scroll',
      keyframes: [{ opacity: 1 }, { opacity: 0 }],
      fill: 'both',
      easing: 'linear',
      iterations: 1,
      startOffset: (options as any).startOffset || {
        name: 'entry',
        offset: { value: 0, unit: 'percentage' },
      },
      endOffset: (options as any).endOffset || {
        name: 'exit',
        offset: { value: 100, unit: 'percentage' },
      },
    },
  ]),
  web: vi.fn((options: AnimationOptions) => {
    const startOffset = (options as any).startOffset
      ? {
          name: (options as any).startOffset.name || 'cover',
          offset: (options as any).startOffset.offset,
        }
      : { name: 'cover', offset: { value: 0, unit: 'percentage' } };
    const endOffset = (options as any).endOffset
      ? {
          name: (options as any).endOffset.name || 'cover',
          offset: (options as any).endOffset.offset,
        }
      : { name: 'cover', offset: { value: 100, unit: 'percentage' } };

    return [
      {
        ...options,
        name: 'fade-scroll',
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
        fill: 'both',
        easing: 'linear',
        iterations: 1,
        startOffsetAdd: (options as any).startOffsetAdd,
        endOffsetAdd: (options as any).endOffsetAdd,
        startOffset,
        endOffset,
      },
    ];
  }),
  getNames: vi.fn(() => ['fade-scroll']),
};

const mockGlitchInPreset = {
  style: vi.fn((options: AnimationOptions) => [
    {
      ...options,
      name: 'glitch-in',
      keyframes: [{ translate: '-100%' }, { translate: 0 }],
      duration: 1000,
      fill: 'both',
      easing: 'ease',
      iterations: 1,
    },
  ]),
  web: vi.fn((options: AnimationOptions) => [
    {
      ...options,
      name: 'glitch-in',
      keyframes: [{ translate: '-100%' }, { translate: 0 }],
      timing: { duration: options?.duration || 1000 },
    },
  ]),
  getNames: vi.fn(() => ['glitch-in']),
};

const mockBgPanPreset = {
  web: vi.fn((options: AnimationOptions) => [
    {
      ...options,
      name: 'bg-pan',
      part: 'bg',
      keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }],
      fill: 'both',
      easing: 'linear',
      iterations: 1,
    },
  ]),
};

const mockParallaxScrollPreset = {
  web: vi.fn((options: AnimationOptions) => [
    {
      ...options,
      name: 'parallax-scroll',
      keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(10px)' }],
      fill: 'both',
      easing: 'linear',
      iterations: 1,
      startOffset: (options as any).startOffset || {
        name: 'entry',
        offset: { value: 0, unit: 'percentage' },
      },
      endOffset: (options as any).endOffset || {
        name: 'exit',
        offset: { value: 100, unit: 'percentage' },
      },
    },
  ]),
};

const mockPokePreset = {
  web: vi.fn((options: AnimationOptions) => [
    {
      ...options,
      name: 'poke',
      keyframes: [{ transform: 'translateX(0px)' }, { transform: 'translateX(10px)' }],
    },
  ]),
};

registerEffects({
  FadeIn: mockFadeInPreset,
  FadeScroll: mockFadeScrollPreset,
  GlitchIn: mockGlitchInPreset,
  BgPan: mockBgPanPreset,
  ParallaxScroll: mockParallaxScrollPreset,
  Poke: mockPokePreset,
  CustomMouse,
  BlobMouse,
} as any);

// Don't mock getEasing for getEasing() tests - we want to test the real implementation
vi.mock('../src/utils', async () => {
  const originalUtils = await vi.importActual<typeof import('../src/utils')>('../src/utils');
  return {
    ...originalUtils,
    getCssUnits: vi.fn((type) => (type === 'percentage' ? '%' : type || 'px')),
    getJsEasing: vi.fn(),
  };
});

describe('motion.ts', () => {
  describe('Main Exported Functions', () => {
    describe('getCSSAnimation()', () => {
      beforeEach(() => {
        vi.clearAllMocks();
      });

      test('should return CSS animation data for basic animation', () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const result = getCSSAnimation('test-target', animationOptions);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          target: '#test-target',
          animation: expect.stringContaining('fade-in'),
          name: 'fade-in',
          keyframes: [{ opacity: 0 }, { opacity: 1 }],
        });
      });

      test('should handle view-progress trigger animations', () => {
        const animationOptions: AnimationOptions = {
          namedEffect: {
            type: 'FadeScroll',
            id: 'scroll-fade',
            range: 'in',
            opacity: 0.5,
          },
          startOffset: {
            name: 'entry',
            offset: { value: 0, unit: 'percentage' },
          },
          endOffset: {
            name: 'exit',
            offset: { value: 100, unit: 'percentage' },
          },
        };

        const trigger: TriggerVariant = {
          id: 'view-timeline-1',
          trigger: 'view-progress',
          componentId: 'comp-123',
        };

        const result = getCSSAnimation('test-target', animationOptions, trigger);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          target: '#test-target',
          animationTimeline: '--view-timeline-1',
          animationRange: expect.stringMatching(/entry.*exit/),
        });
      });

      test('should generate proper animation ranges for view-progress', () => {
        const animationOptions: AnimationOptions = {
          namedEffect: {
            type: 'FadeScroll',
            id: 'scroll-fade',
            range: 'in',
            opacity: 0.5,
          },
          startOffset: {
            name: 'entry',
            offset: { value: 20, unit: 'percentage' },
          },
          endOffset: {
            name: 'exit',
            offset: { value: 80, unit: 'percentage' },
          },
        };

        const trigger: TriggerVariant = {
          id: 'view-timeline-1',
          trigger: 'view-progress',
          componentId: 'comp-123',
        };

        const result = getCSSAnimation('test-target', animationOptions, trigger);

        expect(result[0].animationRange).toContain('entry 20%');
        expect(result[0].animationRange).toContain('exit 80%');
      });

      test('should generate correct animation IDs', () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
          effectId: 'my-effect',
        };

        const result = getCSSAnimation('test-target', animationOptions);

        expect(result[0].id).toBe('my-effect-1-1');
      });

      test('should handle null target', () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const result = getCSSAnimation(null, animationOptions);

        expect(result[0].target).toBe('');
      });

      test('should map effect data to CSS animation format', () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
          fill: 'forwards',
          iterations: 2,
        };

        const result = getCSSAnimation('test-target', animationOptions);

        expect(result[0]).toMatchObject({
          target: '#test-target',
          animation: 'fade-in 1000ms 1ms ease-in forwards 2 paused',
          name: 'fade-in',
          keyframes: [{ opacity: 0 }, { opacity: 1 }],
        });
      });

      test('should handle named effects', () => {
        const animationOptions: AnimationOptions = {
          namedEffect: {
            type: 'GlitchIn',
            id: 'some-glitch',
            direction: 1,
            distance: { value: 100, unit: 'percentage' },
          },
          duration: 1500,
        };

        const result = getCSSAnimation('test-target', animationOptions);

        expect(result[0].name).toBe('glitch-in');
        expect(result[0].keyframes).toEqual([{ translate: '-100%' }, { translate: 0 }]);
      });

      test('should handle keyframe effects', () => {
        const animationOptions: AnimationOptions = {
          keyframeEffect: {
            name: 'custom-keyframes',
            keyframes: [
              { offset: 0, transform: 'scale(1.2)' },
              { offset: 1, transform: 'scale(1)' },
            ],
          },
          duration: 800,
        };

        const result = getCSSAnimation('test-target', animationOptions);

        expect(result).toHaveLength(1);
      });

      test('should handle custom effects', () => {
        const animationOptions: AnimationOptions = {
          customEffect: {
            ranges: [
              { name: 'scale', min: 1, max: 1.5, step: 0.1 },
              { name: 'opacity', min: 0, max: 1, step: 0.1 },
            ],
          },
          duration: 1000,
        };

        const result = getCSSAnimation('test-target', animationOptions);

        // Custom effects don't work with CSS animations (no style method)
        // They return empty array as they need to be processed as web animations
        expect(result).toHaveLength(0);
      });
    });

    describe('getWebAnimation()', () => {
      let mockElement: HTMLElement;
      let mockAnimationGroup: any;
      let mockKeyframeEffect: any;
      let mockViewTimeline: any;

      beforeEach(() => {
        vi.clearAllMocks();
        // Create mock HTMLElement
        mockElement = {
          id: 'test-element',
          querySelector: vi.fn(),
          matches: vi.fn(),
          getAnimations: vi.fn(() => []),
          ownerDocument: document,
          getAttribute: vi.fn(),
          setAttribute: vi.fn(),
        } as any;

        // Mock AnimationGroup
        mockAnimationGroup = {
          ready: Promise.resolve(),
          pause: vi.fn(),
          play: vi.fn(),
          cancel: vi.fn(),
          currentTime: 0,
          playbackRate: 1,
        };

        // Mock KeyframeEffect
        mockKeyframeEffect = {
          target: mockElement,
          setKeyframes: vi.fn((keyframes) => {
            mockKeyframeEffect.keyframes = keyframes;
          }),
          updateTiming: vi.fn(),
        };

        // Mock ViewTimeline
        mockViewTimeline = {
          subject: mockElement,
          axis: 'block',
          inset: ['0px', '0px'],
        };

        // Mock document.getElementById
        Object.defineProperty(document, 'getElementById', {
          value: vi.fn((id) => (id === 'test-element' ? mockElement : null)),
          writable: true,
        });

        // Mock global constructors
        (globalThis as any).ViewTimeline = vi.fn(function (options = {}) {
          Object.assign(mockViewTimeline, options);
          return mockViewTimeline;
        });
        (globalThis as any).KeyframeEffect = vi.fn(function () {
          return mockKeyframeEffect;
        });
        (globalThis as any).Animation = vi.fn(function (keyframeEffect: any, timeline: any) {
          return {
            ready: Promise.resolve(),
            play: vi.fn(),
            pause: vi.fn(),
            cancel: vi.fn(),
            currentTime: 0,
            playbackRate: 1,
            effect: keyframeEffect,
            timeline,
          };
        }) as any;
      });

      test('should create AnimationGroup for basic animation', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        // Mock AnimationGroup constructor
        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });

        const result = getWebAnimation(mockElement, animationOptions);

        expect(AnimationGroup).toHaveBeenCalledWith(
          expect.arrayContaining([expect.anything()]), // expect.arrayContaining([expect.any(global.Animation)]),
          expect.objectContaining(animationOptions),
        );
        expect(result).toBe(mockAnimationGroup);

        (AnimationGroup as Mock).mockRestore();
      });

      test('should handle HTMLElement target', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };
        const div = document.createElement('div');

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });

        const result = getWebAnimation(div, animationOptions);

        expect(result).toBe(mockAnimationGroup);
        expect(KeyframeEffect).toHaveBeenCalledWith(
          div,
          expect.any(Array), // keyframes
          expect.any(Object), // timing
        );

        (AnimationGroup as Mock).mockRestore();
      });

      test('should handle custom mouse effects', async () => {
        const animationOptions: AnimationOptions = {
          customEffect: {
            ranges: [
              { name: 'scale', min: 1, max: 1.5, step: 0.1 },
              { name: 'opacity', min: 0, max: 1, step: 0.1 },
            ],
          },
        };

        const customMouseMock = {
          currentProgress: { x: 0, y: 0, v: { x: 0, y: 0 } },
          progress: vi.fn(),
          cancel: vi.fn(),
        };
        const CustomMouseMock = vi.fn(function (target: any, options: any) {
          Object.assign(customMouseMock, { target, options });
          return customMouseMock;
        });

        CustomMouse.mockImplementation(function (options: any) {
          return vi.fn(function (target_: any) {
            return new (CustomMouseMock as any)(target_, options);
          });
        });

        const result = getWebAnimation(mockElement.id, animationOptions, {
          element: mockElement,
          trigger: 'pointer-move',
        });

        expect(CustomMouseMock).toHaveBeenCalledWith(
          mockElement,
          expect.objectContaining(animationOptions),
        );
        expect(result).toBe(customMouseMock);
      });

      test('should create ViewTimeline for view-progress trigger when supported', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: {
            type: 'FadeScroll',
            id: 'fade',
            range: 'in',
            opacity: 0,
          },
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function (animations: any, options: any) {
          mockAnimationGroup.animations = animations;
          mockAnimationGroup.options = options;
          return mockAnimationGroup;
        });

        const result = getWebAnimation(mockElement.id, animationOptions, {
          element: mockElement,
          trigger: 'view-progress',
        });

        expect((globalThis as any).ViewTimeline).toHaveBeenCalledWith({
          subject: mockElement,
        });
        expect(AnimationGroup).toHaveBeenCalledWith(
          expect.arrayContaining([expect.anything()]), // expect.arrayContaining([expect.any(global.Animation)]),
          expect.objectContaining(animationOptions),
        );
        expect(result).toBe(mockAnimationGroup);
        expect(mockAnimationGroup.animations[0].timeline).toBe(mockViewTimeline);

        (AnimationGroup as Mock).mockRestore();
      });

      test('should handle view-progress trigger without ViewTimeline support', async () => {
        // Remove ViewTimeline support
        delete (globalThis as any).ViewTimeline;

        const animationOptions: AnimationOptions = {
          namedEffect: {
            type: 'FadeScroll',
            id: 'fade',
            range: 'in',
            opacity: 0,
          },
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function (animations: any, options: any) {
          mockAnimationGroup.animations = animations;
          mockAnimationGroup.options = options;
          return mockAnimationGroup;
        });

        const result = getWebAnimation(mockElement.id, animationOptions, {
          element: mockElement,
          trigger: 'view-progress',
        });

        expect(result).toBe(mockAnimationGroup);
        expect(mockAnimationGroup.animations[0].timeline).toBeUndefined();

        // Restore for other tests
        (globalThis as any).ViewTimeline = vi.fn(function () {
          return mockViewTimeline;
        });
      });

      test('should set animation ranges for view-progress', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: {
            type: 'FadeScroll',
            id: 'fade',
            range: 'in',
            opacity: 0,
          },
          startOffset: {
            offset: { value: 10, unit: 'percentage' },
          },
          endOffset: {
            offset: { value: 90, unit: 'percentage' },
          },
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function (animations: any, options: any) {
          mockAnimationGroup.animations = animations;
          mockAnimationGroup.options = options;
          return mockAnimationGroup;
        });

        const result = getWebAnimation(mockElement.id, animationOptions, {
          element: mockElement,
          trigger: 'view-progress',
        });

        expect(AnimationGroup).toHaveBeenCalledWith(
          expect.arrayContaining([expect.anything()]), // expect.arrayContaining([expect.any(global.Animation)]),
          expect.objectContaining(animationOptions),
        );
        expect(result).toBe(mockAnimationGroup);
        expect(mockAnimationGroup.animations[0].rangeStart).toBe('cover 10%');
        expect(mockAnimationGroup.animations[0].rangeEnd).toBe('cover 90%');
        expect(mockAnimationGroup.animations[0].timeline).toBe(mockViewTimeline);

        (AnimationGroup as Mock).mockRestore();
      });

      test('should handle animations with parts (data-motion-part)', async () => {
        const partElement = {
          ...mockElement,
          getAttribute: vi.fn(() => 'intro'),
        };

        mockElement.matches = vi.fn(() => false);
        mockElement.querySelector = vi.fn(() => partElement);

        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'BgPan', id: 'bg-pan', direction: 'left' },
          startOffset: {
            name: 'entry',
            offset: { value: 0, unit: 'percentage' },
          },
          endOffset: {
            name: 'exit',
            offset: { value: 100, unit: 'percentage' },
          },
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });

        const result = getWebAnimation(mockElement.id, animationOptions);

        expect(mockElement.matches).toHaveBeenCalledWith('[data-motion-part~="bg"]');
        expect(mockElement.querySelector).toHaveBeenCalledWith('[data-motion-part~="bg"]');
        expect(KeyframeEffect).toHaveBeenCalledWith(
          partElement,
          expect.any(Array),
          expect.any(Object),
        );
        expect(result).toBe(mockAnimationGroup);
      });

      test('should handle animations with targeyt as inner part (data-motion-part)', async () => {
        mockElement.matches = vi.fn(() => true);

        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'BgPan', id: 'bg-pan', direction: 'left' },
          startOffset: {
            name: 'entry',
            offset: { value: 0, unit: 'percentage' },
          },
          endOffset: {
            name: 'exit',
            offset: { value: 100, unit: 'percentage' },
          },
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });

        const result = getWebAnimation(mockElement.id, animationOptions);

        expect(mockElement.matches).toHaveBeenCalledWith('[data-motion-part~="bg"]');
        expect(mockElement.querySelector).not.toHaveBeenCalled();
        expect(KeyframeEffect).toHaveBeenCalledWith(
          mockElement,
          expect.any(Array),
          expect.any(Object),
        );
        expect(result).toBe(mockAnimationGroup);
      });

      test('should set keyframes and timing via fastdom.mutate', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });
        const fastdom = (await import('fastdom')).default;

        const result = getWebAnimation(mockElement, animationOptions);

        expect(fastdom.mutate).toHaveBeenCalled();

        // Execute the fastdom callback to test keyframe setting
        const mutateCallback = (fastdom.mutate as Mock).mock.calls[0][0];
        mutateCallback();

        expect(mockKeyframeEffect.setKeyframes).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ opacity: expect.any(Number) })]),
        );
        expect(result).toBe(mockAnimationGroup);

        (AnimationGroup as Mock).mockRestore();
      });

      test('should handle custom ownerDocument', async () => {
        const customDocument = {
          getElementById: vi.fn(() => mockElement),
        } as any;

        const elementWithCustomDoc = {
          ...mockElement,
          ownerDocument: customDocument,
        } as any;

        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });

        const result = getWebAnimation(elementWithCustomDoc, animationOptions);

        expect(result).toBe(mockAnimationGroup);

        (AnimationGroup as Mock).mockRestore();
      });

      test('should set animation IDs correctly', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'custom-fade-id' },
          duration: 1000,
          effectId: 'custom-fade-id',
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function (animations: any, options: any) {
          mockAnimationGroup.animations = animations;
          mockAnimationGroup.options = options;
          return mockAnimationGroup;
        });

        const result = getWebAnimation(mockElement.id, animationOptions);

        expect(AnimationGroup).toHaveBeenCalledWith(
          expect.arrayContaining([expect.anything()]), // expect.arrayContaining([expect.any(global.Animation)]),
          expect.objectContaining(animationOptions),
        );
        expect(result).toBe(mockAnimationGroup);
        expect(mockAnimationGroup.animations[0].id).toBe('custom-fade-id-1');

        (AnimationGroup as Mock).mockRestore();
      });

      test('should handle TimeAnimationOptions', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 2000,
          delay: 500,
          iterations: 3,
          fill: 'both',
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });

        const result = getWebAnimation(mockElement.id, animationOptions);

        expect(AnimationGroup).toHaveBeenCalledWith(
          expect.arrayContaining([expect.anything()]), // expect.arrayContaining([expect.any(global.Animation)]),
          expect.objectContaining({
            duration: 2000,
            delay: 500,
            iterations: 3,
            fill: 'both',
          }),
        );
        expect(result).toBe(mockAnimationGroup);

        (AnimationGroup as Mock).mockRestore();
      });

      test('should handle ScrubAnimationOptions', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: {
            type: 'FadeScroll',
            id: 'scroll',
            range: 'in',
            opacity: 0,
          },
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });

        const result = getWebAnimation(mockElement.id, animationOptions);

        expect(AnimationGroup).toHaveBeenCalledWith(
          expect.arrayContaining([expect.anything()]), // expect.arrayContaining([expect.any(global.Animation)]),
          expect.objectContaining(animationOptions),
        );
        expect(result).toBe(mockAnimationGroup);

        (AnimationGroup as Mock).mockRestore();
      });

      test('should handle named effects from different libraries', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });

        // Test entrance animation
        const entranceResult = getWebAnimation(mockElement.id, animationOptions);
        expect(entranceResult).toBe(mockAnimationGroup);

        // Test scroll animation
        const scrollOptions: AnimationOptions = {
          namedEffect: {
            type: 'FadeScroll',
            id: 'scroll',
          } as any, // Temporarily bypass strict typing for offset
          duration: 1000,
        };

        const scrollResult = getWebAnimation(mockElement.id, scrollOptions);
        expect(scrollResult).toBe(mockAnimationGroup);
      });

      test('should handle keyframe effects', async () => {
        const animationOptions: AnimationOptions = {
          keyframeEffect: {
            name: 'fade-scale-in',
            keyframes: [
              { opacity: 0, transform: 'scale(0.5)' },
              { opacity: 1, transform: 'scale(1)' },
            ],
          },
          duration: 1000,
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });

        const result = getWebAnimation(mockElement.id, animationOptions);

        expect(KeyframeEffect).toHaveBeenCalledWith(
          mockElement,
          [],
          expect.objectContaining({
            duration: 1000,
          }),
        );
        expect(mockKeyframeEffect.setKeyframes).toHaveBeenCalledWith([
          { opacity: 0, transform: 'scale(0.5)' },
          { opacity: 1, transform: 'scale(1)' },
        ]);
        expect(result).toBe(mockAnimationGroup);

        (AnimationGroup as Mock).mockRestore();
      });

      test('should return null when namedEffect is not found and no animation data is generated', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'NonExistentEffect' as any, id: 'nonexistent' },
          duration: 1000,
        };

        const result = getWebAnimation(mockElement, animationOptions);

        expect(result).toBeNull();
      });

      test('should return null for pointer-move trigger when mouse animation factory is not callable', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'NonExistentMouseEffect' as any, id: 'nonexistent' },
        };

        const result = getWebAnimation(mockElement.id, animationOptions, {
          element: mockElement,
          trigger: 'pointer-move',
        });

        expect(result).toBeNull();
      });
    });

    describe('getElementCSSAnimation()', () => {
      let mockElement: HTMLElement;
      let mockAnimationGroup: any;
      let mockCSSAnimations: CSSAnimation[];

      beforeEach(() => {
        vi.clearAllMocks();

        // Create mock CSSAnimations
        mockCSSAnimations = [
          {
            animationName: 'fade-in',
            playState: 'running',
          } as CSSAnimation,
          {
            animationName: 'slide-up',
            playState: 'running',
          } as CSSAnimation,
          {
            animationName: 'other-animation',
            playState: 'running',
          } as CSSAnimation,
        ];

        // Create mock HTMLElement
        mockElement = {
          id: 'test-element',
          getAnimations: vi.fn(() => mockCSSAnimations),
        } as any;

        // Mock AnimationGroup
        mockAnimationGroup = {
          animations: [],
          pause: vi.fn(),
          play: vi.fn(),
          cancel: vi.fn(),
        };

        // Mock document.getElementById
        Object.defineProperty(document, 'getElementById', {
          value: vi.fn((id) => (id === 'test-element' ? mockElement : null)),
          writable: true,
        });
      });

      test('should return AnimationGroup from CSS animations', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');

        (AnimationGroup as Mock).mockImplementation(function (animations: any) {
          mockAnimationGroup.animations = animations;
          return mockAnimationGroup;
        });

        const result = getElementCSSAnimation(mockElement, animationOptions);

        expect(AnimationGroup).toHaveBeenCalledWith([mockCSSAnimations[0]]);
        expect(result).toBe(mockAnimationGroup);
      });

      test('should filter animations by effect names', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');

        (AnimationGroup as Mock).mockImplementation(function (animations: any) {
          mockAnimationGroup.animations = animations;
          return mockAnimationGroup;
        });

        const result = getElementCSSAnimation(mockElement, animationOptions);

        expect(AnimationGroup).toHaveBeenCalledWith([mockCSSAnimations[0]]);
        expect(result).toBe(mockAnimationGroup);
      });

      test('should fallback to getElementAnimation when no style method', async () => {
        // TODO: Implement test
      });

      test('should return null when no named effect found', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'UnknownEffect' as any, id: 'unknown' },
          duration: 1000,
        };

        const result = getElementCSSAnimation(mockElement, animationOptions);

        expect(result).toBeNull();
      });

      test('should return null when no animations match', async () => {
        // Element has no animations
        mockElement.getAnimations = vi.fn(() => []);

        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const result = getElementCSSAnimation(mockElement, animationOptions);

        expect(result).toBeNull();
      });

      test('should handle string target', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');

        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });

        const result = getElementCSSAnimation('test-element', animationOptions);

        expect(document.getElementById).toHaveBeenCalledWith('test-element');
        expect(mockElement.getAnimations).toHaveBeenCalled();
        expect(result).toBe(mockAnimationGroup);
      });

      test('should filter CSSAnimations by name', async () => {
        // Setup element with multiple animations
        const multipleAnimations = [
          { animationName: 'fade-in', playState: 'running' } as CSSAnimation,
          { animationName: 'bounce', playState: 'running' } as CSSAnimation,
          { animationName: 'slide-in', playState: 'paused' } as CSSAnimation,
          { animationName: 'fade-in', playState: 'running' } as CSSAnimation, // duplicate
        ];

        mockElement.getAnimations = vi.fn(() => multipleAnimations);

        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');

        (AnimationGroup as Mock).mockImplementation(function (animations: any) {
          mockAnimationGroup.animations = animations;
          return mockAnimationGroup;
        });

        const result = getElementCSSAnimation(mockElement, animationOptions);

        // The getNames mock returns ['fade-in'], and the function uses find() which only gets the first match
        // So it should only include the first 'fade-in' animation, not the duplicate
        expect(AnimationGroup).toHaveBeenCalledWith([multipleAnimations[0]]);
        expect(result).toBe(mockAnimationGroup);
      });
    });

    describe('getElementAnimation()', () => {
      let mockElement: HTMLElement;
      let mockAnimationGroup: any;
      let mockAnimations: (Animation | CSSAnimation)[];

      beforeEach(() => {
        vi.clearAllMocks();

        // Create mock animations with different ID patterns
        mockAnimations = [
          { id: 'effect-123-1', playState: 'running' } as any,
          { id: 'effect-123-2', playState: 'running' } as any,
          { id: 'other-456-1', playState: 'running' } as any,
          {
            animationName: 'effect-123-css',
            playState: 'running',
          } as any,
          { animationName: 'other-css', playState: 'running' } as any,
          {
            id: undefined,
            animationName: undefined,
            playState: 'running',
          } as any, // no ID/name
        ];

        // Create mock HTMLElement
        mockElement = {
          id: 'test-element',
          getAnimations: vi.fn(() => mockAnimations),
        } as any;

        // Mock AnimationGroup
        mockAnimationGroup = {
          animations: [],
          pause: vi.fn(),
          play: vi.fn(),
          cancel: vi.fn(),
        };

        // Mock document.getElementById
        Object.defineProperty(document, 'getElementById', {
          value: vi.fn((id) => (id === 'test-element' ? mockElement : null)),
          writable: true,
        });
      });

      test('should return AnimationGroup filtered by effectId', async () => {
        const { AnimationGroup } = await import('../src/AnimationGroup');

        (AnimationGroup as Mock).mockImplementation(function (animations: any) {
          mockAnimationGroup.animations = animations;
          return mockAnimationGroup;
        });

        const result = getElementAnimation(mockElement, 'effect-123');

        // Should include animations with IDs/names starting with 'effect-123'
        const expectedAnimations = [
          mockAnimations[0], // id: 'effect-123-1'
          mockAnimations[1], // id: 'effect-123-2'
          mockAnimations[3], // animationName: 'effect-123-css'
          mockAnimations[5], // no ID/name (fallback case)
        ];

        expect(AnimationGroup).toHaveBeenCalledWith(expectedAnimations);
        expect(result).toBe(mockAnimationGroup);
      });

      test('should handle animations without IDs', async () => {
        // Element with only animations that have no ID/name
        const animationsWithoutIds = [
          {
            id: undefined,
            animationName: undefined,
            playState: 'running',
          } as any,
          { id: '', animationName: '', playState: 'running' } as any,
        ];

        mockElement.getAnimations = vi.fn(() => animationsWithoutIds);

        const { AnimationGroup } = await import('../src/AnimationGroup');

        (AnimationGroup as Mock).mockImplementation(function (animations: any) {
          mockAnimationGroup.animations = animations;
          return mockAnimationGroup;
        });

        const result = getElementAnimation(mockElement, 'any-effect');

        // When animations have no ID/name, they should all be returned (fallback)
        expect(AnimationGroup).toHaveBeenCalledWith(animationsWithoutIds);
        expect(result).toBe(mockAnimationGroup);
      });

      test('should filter by animation ID startsWith effectId', async () => {
        const animationsWithIds = [
          { id: 'fade-in-1', playState: 'running' } as Animation,
          { id: 'fade-in-2', playState: 'running' } as Animation,
          { id: 'slide-out-1', playState: 'running' } as Animation,
        ];

        mockElement.getAnimations = vi.fn(() => animationsWithIds);

        const { AnimationGroup } = await import('../src/AnimationGroup');

        (AnimationGroup as Mock).mockImplementation(function (animations: any) {
          mockAnimationGroup.animations = animations;
          return mockAnimationGroup;
        });

        const result = getElementAnimation(mockElement, 'fade-in');

        // Should only include animations with IDs starting with 'fade-in'
        expect(AnimationGroup).toHaveBeenCalledWith([animationsWithIds[0], animationsWithIds[1]]);
        expect(result).toBe(mockAnimationGroup);
      });

      test('should filter by CSSAnimation animationName', async () => {
        const cssAnimations = [
          {
            animationName: 'bounce-in-1',
            playState: 'running',
          } as any,
          {
            animationName: 'bounce-in-2',
            playState: 'running',
          } as any,
          { animationName: 'flip-out-1', playState: 'running' } as any,
        ];

        mockElement.getAnimations = vi.fn(() => cssAnimations);

        const { AnimationGroup } = await import('../src/AnimationGroup');

        (AnimationGroup as Mock).mockImplementation(function (animations: any) {
          mockAnimationGroup.animations = animations;
          return mockAnimationGroup;
        });

        const result = getElementAnimation(mockElement, 'bounce-in');

        // Should only include CSSAnimations with names starting with 'bounce-in'
        expect(AnimationGroup).toHaveBeenCalledWith([cssAnimations[0], cssAnimations[1]]);
        expect(result).toBe(mockAnimationGroup);
      });

      test('should return null when no animations found', async () => {
        // Element has no animations
        mockElement.getAnimations = vi.fn(() => []);

        const result = getElementAnimation(mockElement, 'any-effect');

        expect(result).toBeNull();
      });

      test('should handle string target', async () => {
        const { AnimationGroup } = await import('../src/AnimationGroup');

        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });

        const result = getElementAnimation('test-element', 'effect-123');

        expect(document.getElementById).toHaveBeenCalledWith('test-element');
        expect(mockElement.getAnimations).toHaveBeenCalled();
        expect(result).toBe(mockAnimationGroup);
      });

      test('should return all animations when no ID/name match', async () => {
        // Mix of animations: some with IDs that don't match, some without IDs
        const mixedAnimations = [
          { id: 'different-effect-1', playState: 'running' } as any,
          {
            animationName: 'different-effect-2',
            playState: 'running',
          } as any,
          {
            id: undefined,
            animationName: undefined,
            playState: 'running',
          } as any, // no ID/name
          { id: '', animationName: '', playState: 'running' } as any, // empty ID/name
        ];

        mockElement.getAnimations = vi.fn(() => mixedAnimations);

        const { AnimationGroup } = await import('../src/AnimationGroup');

        (AnimationGroup as Mock).mockImplementation(function (animations: any) {
          mockAnimationGroup.animations = animations;
          return mockAnimationGroup;
        });

        const result = getElementAnimation(mockElement, 'target-effect');

        // Should only include animations without IDs/names (fallback case)
        expect(AnimationGroup).toHaveBeenCalledWith([mixedAnimations[2], mixedAnimations[3]]);
        expect(result).toBe(mockAnimationGroup);
      });

      test('should return null when target element not found', async () => {
        // Mock getElementById to return null
        Object.defineProperty(document, 'getElementById', {
          value: vi.fn(() => null),
          writable: true,
        });

        const result = getElementAnimation('non-existent-element', 'effect-123');

        expect(document.getElementById).toHaveBeenCalledWith('non-existent-element');
        expect(result).toBeNull();
      });

      test('should handle mixed Animation and CSSAnimation types', async () => {
        const mixedAnimations = [
          { id: 'web-anim-1', playState: 'running' } as Animation,
          { animationName: 'css-anim-1', playState: 'running' } as CSSAnimation,
          { id: 'web-anim-2', playState: 'running' } as Animation,
          { animationName: 'css-anim-2', playState: 'running' } as CSSAnimation,
        ];

        mockElement.getAnimations = vi.fn(() => mixedAnimations);

        const { AnimationGroup } = await import('../src/AnimationGroup');

        (AnimationGroup as Mock).mockImplementation(function (animations: any) {
          mockAnimationGroup.animations = animations;
          return mockAnimationGroup;
        });

        const result = getElementAnimation(mockElement, 'web-anim');

        // Should include both Animation objects with matching IDs
        expect(AnimationGroup).toHaveBeenCalledWith([mixedAnimations[0], mixedAnimations[2]]);
        expect(result).toBe(mockAnimationGroup);
      });
    });

    describe('getScrubScene()', () => {
      let mockElement: HTMLElement;
      let mockViewSource: HTMLElement;
      let mockAnimationGroup: any;
      let mockMouseAnimation: any;
      let mockAnimations: any[];

      beforeEach(() => {
        vi.clearAllMocks();

        // Mock global constructors
        (globalThis as any).KeyframeEffect = vi.fn(function () {
          return {
            target: mockElement,
            setKeyframes: vi.fn(),
            updateTiming: vi.fn(),
            composite: 'replace',
            iterationComposite: 'replace',
            pseudoElement: null,
            getKeyframes: vi.fn(function () {
              return [];
            }),
            getComputedTiming: vi.fn(function () {
              return { activeDuration: 1000 };
            }),
            getTiming: vi.fn(function () {
              return { delay: 0 };
            }),
          };
        }) as any;
        (globalThis as any).Animation = vi.fn(function (keyframeEffect: any, timeline: any) {
          return {
            ready: Promise.resolve(),
            play: vi.fn(),
            pause: vi.fn(),
            cancel: vi.fn(),
            currentTime: 0,
            playbackRate: 1,
            effect: keyframeEffect,
            timeline,
          };
        }) as any;

        // Create mock animations
        mockAnimations = [
          {
            start: 'entry 0%',
            end: 'exit 100%',
            effect: {
              getComputedTiming: vi.fn(() => ({ activeDuration: 1000 })),
              getTiming: vi.fn(() => ({ delay: 100 })),
            },
            currentTime: 0,
            cancel: vi.fn(),
            getProgress: vi.fn(() => 0.4),
          },
          {
            start: 'entry 25%',
            end: 'exit 75%',
            effect: {
              getComputedTiming: vi.fn(() => ({ activeDuration: 800 })),
              getTiming: vi.fn(() => ({ delay: 50 })),
            },
            currentTime: 0,
            cancel: vi.fn(),
            getProgress: vi.fn(() => 0.4),
          },
        ];

        // Create mock view source element
        mockViewSource = {
          id: 'view-source',
        } as any;

        // Create mock target element
        mockElement = {
          id: 'test-element',
        } as any;

        // Mock AnimationGroup
        mockAnimationGroup = {
          animations: mockAnimations,
          ready: Promise.resolve(),
          getProgress: vi.fn(() => 0.5),
          progress: vi.fn(),
          cancel: vi.fn(),
        };

        // Mock MouseAnimation
        mockMouseAnimation = {
          target: mockElement,
          getProgress: vi.fn(() => ({ x: 0.3, y: 0.7 })),
          progress: vi.fn(),
          cancel: vi.fn(),
        };

        // Mock getElement
        (globalThis as any).getElement = vi.fn((id) => {
          if (id === 'test-element') {
            return mockElement;
          }
          if (id === 'view-source') {
            return mockViewSource;
          }
          return null;
        });

        // Mock window.ViewTimeline
        delete (globalThis as any).ViewTimeline;

        // Mock document.getElementById
        Object.defineProperty(document, 'getElementById', {
          value: vi.fn((id) => {
            if (id === 'test-element') {
              return mockElement;
            }
            if (id === 'view-source') {
              return mockViewSource;
            }
            return null;
          }),
          writable: true,
        });
      });

      test('should return ScrubScrollScene array for view-progress without ViewTimeline', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'ParallaxScroll', id: 'parallax', speed: 1 },
        };

        const trigger = {
          trigger: 'view-progress' as const,
          componentId: 'view-source',
        };

        const sceneOptions = {
          disabled: true,
          allowActiveEvent: false,
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');

        // override getWebAnimations and assume the animations it returned are `mockAnimations`
        (AnimationGroup as Mock).mockImplementation(function (_: any) {
          mockAnimationGroup.animations = mockAnimations;
          return mockAnimationGroup;
        });

        const result = getScrubScene(mockElement, animationOptions, trigger, sceneOptions) as any[];

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);

        // Test first scene
        const scene1 = result[0];
        expect(scene1.start).toBe('entry 0%');
        expect(scene1.end).toBe('exit 100%');
        expect(scene1.viewSource).toBe(mockViewSource);
        expect(scene1.ready).toBe(mockAnimationGroup.ready);
        expect(scene1.disabled).toBe(true);
        expect(typeof scene1.getProgress).toBe('function');
        expect(typeof scene1.effect).toBe('function');
        expect(typeof scene1.destroy).toBe('function');

        // Test getProgress method
        expect(scene1.getProgress()).toBe(0.5);
        expect(mockAnimationGroup.getProgress).toHaveBeenCalled();

        // Test effect method
        scene1.effect({}, 0.75);
        expect(mockAnimations[0].currentTime).toBe(825); // (100 + 1000) * 0.75

        // Test destroy method
        scene1.destroy();
        expect(mockAnimations[0].cancel).toHaveBeenCalled();

        (AnimationGroup as Mock).mockRestore();
      });

      test('should return ScrubPointerScene for pointer-move trigger', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'CustomMouse', id: 'mouse' },
          centeredToTarget: true,
        };

        const trigger = {
          trigger: 'pointer-move' as const,
        };

        const sceneOptions = {
          disabled: false,
          allowActiveEvent: true,
        };

        const webAnimations = await import('../src/api/webAnimations');
        const getWebAnimationSpy = vi.spyOn(webAnimations, 'getWebAnimation');
        getWebAnimationSpy.mockReturnValue(mockMouseAnimation);

        const result = getScrubScene(mockElement, animationOptions, trigger, sceneOptions) as any;

        expect(Array.isArray(result)).toBe(false);
        expect(result.target).toBe(mockElement);
        expect(result.centeredToTarget).toBe(true);
        expect(result.allowActiveEvent).toBe(true);
        expect(result.disabled).toBe(false);
        expect(typeof result.getProgress).toBe('function');
        expect(typeof result.effect).toBe('function');
        expect(typeof result.destroy).toBe('function');

        // Test getProgress method
        expect(result.getProgress()).toEqual({ x: 0.3, y: 0.7 });

        // Test effect method
        result.effect(
          {},
          {
            x: 0.5,
            y: 0.8,
          },
        );
        expect(mockMouseAnimation.progress).toHaveBeenCalledWith({
          x: 0.5,
          y: 0.8,
        });

        // Test destroy method
        result.destroy();
        expect(mockMouseAnimation.cancel).toHaveBeenCalled();

        getWebAnimationSpy.mockRestore();
      });

      test('should handle custom transition settings for mouse effects', async () => {
        const animationOptions: AnimationOptions = {
          customEffect: { ranges: [{ name: 'opacity', min: 0, max: 1 }] },
          transitionDuration: 500,
          transitionEasing: 'easeOut',
        };

        const trigger = {
          trigger: 'pointer-move' as const,
        };

        // Mock getJsEasing
        const mockJsEasing = 'cubic-bezier(0.4, 0, 0.6, 1)';
        const utils = await import('../src/utils');
        (utils.getJsEasing as Mock).mockReturnValue(mockJsEasing);

        const webAnimations = await import('../src/api/webAnimations');
        const getWebAnimationSpy = vi.spyOn(webAnimations, 'getWebAnimation');
        const mockMouseAnimationWithTarget = {
          ...mockMouseAnimation,
          target: mockElement,
        };
        getWebAnimationSpy.mockReturnValue(mockMouseAnimationWithTarget);

        const result = getScrubScene(mockElement, animationOptions, trigger) as any;

        expect(result.transitionDuration).toBe(500);
        expect(result.transitionEasing).toBe(mockJsEasing);
        expect(utils.getJsEasing).toHaveBeenCalledWith('easeOut');

        getWebAnimationSpy.mockRestore();
      });

      test('should include disabled and allowActiveEvent options', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'BlobMouse', id: 'mouse' },
        };

        const trigger = {
          trigger: 'pointer-move' as any,
        };

        const sceneOptions = {
          disabled: true,
          allowActiveEvent: false,
          customOption: 'test',
        };

        const webAnimations = await import('../src/api/webAnimations');
        const getWebAnimationSpy = vi.spyOn(webAnimations, 'getWebAnimation');
        getWebAnimationSpy.mockReturnValue(mockMouseAnimation);

        const result = getScrubScene(mockElement, animationOptions, trigger, sceneOptions) as any;

        expect(result.disabled).toBe(true);
        expect(result.allowActiveEvent).toBe(false);
        expect(result.customOption).toBeUndefined(); // custom options are filtered out

        getWebAnimationSpy.mockRestore();
      });

      test('should create an array of scenes with proper getProgress method', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'ParallaxScroll', id: 'parallax', speed: 1 },
        };

        const trigger = {
          trigger: 'view-progress' as any,
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');

        (AnimationGroup as Mock).mockImplementation(function (_: any) {
          mockAnimationGroup.animations = mockAnimations;
          return mockAnimationGroup;
        });

        const result = getScrubScene(mockElement, animationOptions, trigger) as any;

        expect(typeof result[0].getProgress).toBe('function');
        expect(result[0].getProgress()).toBe(0.5);
        expect(mockAnimationGroup.getProgress).toHaveBeenCalled();

        (AnimationGroup as Mock).mockRestore();
      });

      test('should create an array of scenes with proper effect method', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'ParallaxScroll', id: 'parallax', speed: 1 },
        };

        const trigger = {
          trigger: 'view-progress' as any,
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');

        (AnimationGroup as Mock).mockImplementation(function (_: any) {
          mockAnimationGroup.animations = mockAnimations;
          return mockAnimationGroup;
        });

        const result = getScrubScene(mockElement, animationOptions, trigger) as any;

        expect(typeof result[0].effect).toBe('function');

        // Test effect with simple number
        result[0].effect({}, 0.8);
        expect(mockAnimations[0].currentTime).toBe(0.8 * 1100);
        result[1].effect({}, 0.6);
        expect(mockAnimations[1].currentTime).toBe(0.6 * 850);

        // reset currentTime for next tests
        delete mockAnimations[0].currentTime;
        delete mockAnimations[1].currentTime;
        (AnimationGroup as Mock).mockRestore();
      });

      test('should create scene with proper destroy method', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'ParallaxScroll', id: 'parallax', speed: 1 },
        };

        const trigger = {
          trigger: 'scroll' as any,
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function (_: any) {
          mockAnimationGroup.animations = mockAnimations;
          return mockAnimationGroup;
        });

        const result = getScrubScene(mockElement, animationOptions, trigger) as any;

        expect(typeof result.destroy).toBe('function');
        result.destroy();
        expect(mockAnimationGroup.cancel).toHaveBeenCalled();

        (AnimationGroup as Mock).mockRestore();
      });

      test('should extract scene options properly', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'ParallaxScroll', id: 'parallax', speed: 1 },
        };

        const trigger = {
          trigger: 'scroll' as any,
        };

        const sceneOptions = {
          disabled: true,
          allowActiveEvent: false,
          customOption1: 'value1',
          customOption2: 'value2',
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function (_: any) {
          mockAnimationGroup.animations = mockAnimations;
          return mockAnimationGroup;
        });

        const result = getScrubScene(mockElement, animationOptions, trigger, sceneOptions) as any;

        // disabled should be extracted and included
        expect(result.disabled).toBe(true);

        // allowActiveEvent should be extracted but not included in non-pointer scenes
        expect(result.allowActiveEvent).toBeUndefined();

        (AnimationGroup as Mock).mockRestore();
      });

      test('should handle centeredToTarget option for mouse effects', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'BlobMouse', id: 'mouse' },
          centeredToTarget: false,
        };

        const trigger = {
          trigger: 'pointer-move' as const,
        };

        const sceneOptions = {
          allowActiveEvent: true,
        };

        const webAnimations = await import('../src/api/webAnimations');
        const getWebAnimationSpy = vi.spyOn(webAnimations, 'getWebAnimation');
        const mockMouseAnimationWithTarget = {
          ...mockMouseAnimation,
          target: mockElement,
        };
        getWebAnimationSpy.mockReturnValue(mockMouseAnimationWithTarget);

        const result = getScrubScene(mockElement, animationOptions, trigger, sceneOptions) as any;

        expect(result.centeredToTarget).toBe(false);
        expect(result.allowActiveEvent).toBe(true);
        expect(result.target).toBe(mockElement);

        getWebAnimationSpy.mockRestore();
      });

      test('should handle transition duration and easing for custom mouse effects', async () => {
        const animationOptions: AnimationOptions = {
          customEffect: { ranges: [{ name: 'scale', min: 0.8, max: 1.2 }] },
          transitionDuration: 750,
          transitionEasing: 'easeOut',
        };

        const trigger = {
          trigger: 'pointer-move' as const,
        };

        // Mock getJsEasing
        const mockJsEasing = 'cubic-bezier(0, 0, 0.58, 1)';
        const utils = await import('../src/utils');
        (utils.getJsEasing as Mock).mockReturnValue(mockJsEasing);

        const webAnimations = await import('../src/api/webAnimations');
        const getWebAnimationSpy = vi.spyOn(webAnimations, 'getWebAnimation');
        const mockMouseAnimationWithTarget = {
          ...mockMouseAnimation,
          target: mockElement,
        };
        getWebAnimationSpy.mockReturnValue(mockMouseAnimationWithTarget);

        const result = getScrubScene(mockElement, animationOptions, trigger) as any;

        expect(result.transitionDuration).toBe(750);
        expect(result.transitionEasing).toBe(mockJsEasing);
        expect(utils.getJsEasing).toHaveBeenCalledWith('easeOut');

        getWebAnimationSpy.mockRestore();
      });

      test('should create scroll scenes with start/end getters', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'ParallaxScroll', id: 'parallax', speed: 1 },
        };

        const trigger = {
          trigger: 'view-progress' as const,
          componentId: 'view-source',
        };

        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function (_: any) {
          mockAnimationGroup.animations = mockAnimations;
          return mockAnimationGroup;
        });

        const result = getScrubScene(mockElement, animationOptions, trigger) as any[];

        expect(Array.isArray(result)).toBe(true);

        const scene1 = result[0];
        const scene2 = result[1];

        // Test that start and end are getters that access the underlying animation properties
        expect(scene1.start).toBe('entry 0%');
        expect(scene1.end).toBe('exit 100%');
        expect(scene2.start).toBe('entry 25%');
        expect(scene2.end).toBe('exit 75%');

        // Verify that the getters are accessing the animation properties dynamically
        mockAnimations[0].start = 'updated-start';
        mockAnimations[0].end = 'updated-end';
        expect(scene1.start).toBe('updated-start');
        expect(scene1.end).toBe('updated-end');

        (AnimationGroup as Mock).mockRestore();
      });

      test('should return null when getWebAnimation returns null', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'NonExistentEffect' as any, id: 'nonexistent' },
        };

        const trigger = {
          trigger: 'view-progress' as const,
          componentId: 'view-source',
        };

        const result = getScrubScene(mockElement, animationOptions, trigger);

        expect(result).toBeNull();
      });
    });

    describe('prepareAnimation()', () => {
      let mockElement: HTMLElement;
      let mockCallback: Mock;

      beforeEach(async () => {
        vi.clearAllMocks();

        // Create mock HTMLElement
        mockElement = {
          id: 'test-element',
          querySelector: vi.fn(),
          matches: vi.fn(),
          getAnimations: vi.fn(() => []),
        } as any;

        // Create mock callback
        mockCallback = vi.fn();

        // Create mock prepare function
        // mockPrepareFn = vi.fn(); // Not needed - using the mock from library/entrance

        // Mock document.getElementById
        Object.defineProperty(document, 'getElementById', {
          value: vi.fn((id) => (id === 'test-element' ? mockElement : null)),
          writable: true,
        });

        mockFadeInPreset.prepare.mockReset();
      });

      test('should call preset.prepare when available', async () => {
        // Create animation with named effect that has prepare method
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const prepareFn = mockFadeInPreset.prepare;

        // Debug: Let's check if the mock is properly set up
        expect(prepareFn).toBeDefined();
        expect(typeof prepareFn).toBe('function');
        expect((prepareFn as Mock).mock.calls.length).toBe(0);

        prepareAnimation(mockElement.id, animationOptions, mockCallback);

        expect(prepareFn).toHaveBeenCalledWith(
          animationOptions,
          expect.objectContaining({
            measure: expect.any(Function),
            mutate: expect.any(Function),
          }),
        );
      });

      test('should create domApi for HTMLElement target', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const prepareFn = mockFadeInPreset.prepare;

        prepareAnimation(mockElement.id, animationOptions);

        expect(prepareFn).toHaveBeenCalledWith(
          animationOptions,
          expect.objectContaining({
            measure: expect.any(Function),
            mutate: expect.any(Function),
          }),
        );

        // Test that domApi functions work correctly
        const domApi = prepareFn.mock.calls[0][1];
        const measureCallback = vi.fn();
        const mutateCallback = vi.fn();

        domApi.measure(measureCallback);
        domApi.mutate(mutateCallback);

        expect(measureCallback).toHaveBeenCalledWith(mockElement);
        expect(mutateCallback).toHaveBeenCalledWith(mockElement);
      });

      test('should handle string target with getElementById', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const prepareFn = mockFadeInPreset.prepare;

        prepareAnimation('test-element', animationOptions);

        expect(document.getElementById).toHaveBeenCalledWith('test-element');
        expect(prepareFn).toHaveBeenCalledWith(
          animationOptions,
          expect.objectContaining({
            measure: expect.any(Function),
            mutate: expect.any(Function),
          }),
        );
      });

      test('should execute callback via fastdom.mutate', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        prepareAnimation(mockElement, animationOptions, mockCallback);

        // Check that fastdom.mutate was called with the callback
        const fastdom = (await import('fastdom')).default;
        expect(fastdom.mutate).toHaveBeenCalledWith(mockCallback);
      });

      test('should handle missing callback', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        // Should not throw when no callback provided
        expect(() => {
          prepareAnimation(mockElement, animationOptions);
        }).not.toThrow();

        // fastdom.mutate should not be called when no callback
        const fastdom = (await import('fastdom')).default;
        expect(fastdom.mutate).not.toHaveBeenCalled();
      });

      test('should handle preset without prepare method', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: {
            type: 'GlitchIn',
            id: 'glitch',
            direction: 45,
            distance: { value: 100, unit: 'percentage' },
          }, // Use GlitchIn which doesn't have prepare
          duration: 1000,
        };

        // Should not throw when preset has no prepare method
        expect(() => {
          prepareAnimation(mockElement, animationOptions, mockCallback);
        }).not.toThrow();

        // Callback should still be executed
        const fastdom = (await import('fastdom')).default;
        expect(fastdom.mutate).toHaveBeenCalledWith(mockCallback);
      });

      test('should handle null target element', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        const prepareFn = mockFadeInPreset.prepare;

        // Should not throw when target is null
        expect(() => {
          prepareAnimation(null, animationOptions, mockCallback);
        }).not.toThrow();

        // prepare should not be called when target is null
        expect(prepareFn).not.toHaveBeenCalled();

        // Callback should still be executed
        const fastdom = (await import('fastdom')).default;
        expect(fastdom.mutate).toHaveBeenCalledWith(mockCallback);
      });

      test('should pass TimeAnimationOptions to preset.prepare', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 2000,
          delay: 500,
          iterations: 3,
          fill: 'both',
        };

        const prepareFn = mockFadeInPreset.prepare;

        prepareAnimation(mockElement.id, animationOptions);

        expect(prepareFn).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 2000,
            delay: 500,
            iterations: 3,
            fill: 'both',
          }),
          expect.objectContaining({
            measure: expect.any(Function),
            mutate: expect.any(Function),
          }),
        );
      });
    });

    describe('getEasing()', () => {
      beforeEach(() => {
        vi.clearAllMocks();
      });

      test('should return CSS easing for known easing names', () => {
        // Test common CSS easing functions
        expect(getEasing('ease')).toBe('ease');
        expect(getEasing('easeIn')).toBe('ease-in');
        expect(getEasing('easeOut')).toBe('ease-out');
        expect(getEasing('easeInOut')).toBe('ease-in-out');
        expect(getEasing('linear')).toBe('linear');

        // Test custom easings from cssEasings object
        expect(getEasing('sineIn')).toBe('cubic-bezier(0.47, 0, 0.745, 0.715)');
        expect(getEasing('quadOut')).toBe('cubic-bezier(0.25, 0.46, 0.45, 0.94)');
        expect(getEasing('cubicInOut')).toBe('cubic-bezier(0.645, 0.045, 0.355, 1)');
        expect(getEasing('backOut')).toBe('cubic-bezier(0.175, 0.885, 0.32, 1.275)');
      });

      test('should return custom easing string when not found in presets', () => {
        const customCubicBezier = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
        expect(getEasing(customCubicBezier)).toBe(customCubicBezier);

        const customSteps = 'steps(4, end)';
        expect(getEasing(customSteps)).toBe(customSteps);

        const unknownEasing = 'some-unknown-easing';
        expect(getEasing(unknownEasing)).toBe(unknownEasing);
      });

      test('should return linear easing when no easing provided', () => {
        expect(getEasing()).toBe('linear');
        expect(getEasing(undefined)).toBe('linear');
      });

      test('should handle undefined easing parameter', () => {
        expect(getEasing(undefined)).toBe('linear');
      });

      test('should handle empty string easing', () => {
        expect(getEasing('')).toBe('linear');
      });
    });

    describe('getAnimation()', () => {
      let mockElement: HTMLElement;
      let mockAnimationGroup: any;
      let mockKeyframeEffect: any;
      let mockViewTimeline: any;
      let mockCSSAnimations: CSSAnimation[];
      let mockKeyframeEffectOptions: KeyframeEffectOptions | number | undefined;

      beforeEach(() => {
        vi.clearAllMocks();

        // Create mock HTMLElement
        mockElement = {
          id: 'test-element',
          querySelector: vi.fn(),
          matches: vi.fn(),
          getAnimations: vi.fn(() => []),
          ownerDocument: document,
          getAttribute: vi.fn(),
          setAttribute: vi.fn(),
        } as any;

        // Mock AnimationGroup
        mockAnimationGroup = {
          ready: Promise.resolve(),
          pause: vi.fn(),
          play: vi.fn(),
          cancel: vi.fn(),
          currentTime: 0,
          playbackRate: 1,
        };

        // Mock KeyframeEffect
        mockKeyframeEffect = {
          target: mockElement,
          setKeyframes: vi.fn((keyframes) => {
            mockKeyframeEffect.keyframes = keyframes;
          }),
          updateTiming: vi.fn(),
        };

        // Mock ViewTimeline
        mockViewTimeline = {
          subject: mockElement,
          axis: 'block',
          inset: ['0px', '0px'],
        };

        // Mock document.getElementById
        Object.defineProperty(document, 'getElementById', {
          value: vi.fn((id) => (id === 'test-element' ? mockElement : null)),
          writable: true,
        });

        // Mock global constructors
        (globalThis as any).ViewTimeline = vi.fn(function (options = {}) {
          Object.assign(mockViewTimeline, options);
          return mockViewTimeline;
        });
        (globalThis as any).KeyframeEffect = vi.fn(function (
          _target: Element | null,
          _keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
          options: KeyframeEffectOptions | number | undefined,
        ) {
          mockKeyframeEffectOptions = options;
          return mockKeyframeEffect;
        }) as any;
        (globalThis as any).Animation = vi.fn(function (keyframeEffect: any, timeline: any) {
          return {
            ready: Promise.resolve(),
            play: vi.fn(),
            pause: vi.fn(),
            cancel: vi.fn(),
            currentTime: 0,
            playbackRate: 1,
            effect: keyframeEffect,
            timeline,
          };
        }) as any;

        // Create mock CSSAnimations
        mockCSSAnimations = [
          {
            animationName: 'fade-in',
            playState: 'running',
          } as CSSAnimation,
          {
            animationName: 'slide-up',
            playState: 'running',
          } as CSSAnimation,
          {
            animationName: 'other-animation',
            playState: 'running',
          } as CSSAnimation,
        ];
      });

      test('should return animation with duration 1 if reducedMotion is true and iterations is 1', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
          iterations: 1,
        };

        // Mock AnimationGroup constructor
        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function (animations: any) {
          mockAnimationGroup.animations = animations;
          return mockAnimationGroup;
        });

        const result = getAnimation(mockElement, animationOptions, undefined, true);

        expect(AnimationGroup).toHaveBeenCalledWith(
          expect.arrayContaining([expect.anything()]),
          expect.objectContaining(animationOptions),
        );
        expect(result).toBe(mockAnimationGroup);
        expect(
          typeof mockKeyframeEffectOptions === 'number'
            ? mockKeyframeEffectOptions
            : mockKeyframeEffectOptions?.duration,
        ).toBe(1);

        (AnimationGroup as Mock).mockRestore();
      });

      test('should return null if reducedMotion is true and iterations is NOT 1', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'Poke', id: 'poke', direction: 'right' },
          duration: 1000,
          iterations: Infinity,
        };

        const result = getAnimation(mockElement, animationOptions, undefined, true);

        // When reducedMotion is true and iterations !== 1, no animation should be created
        expect(result).toBeNull();
      });

      test('should return a Web Animation if *NO* CSS animation is found', async () => {
        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        // Mock AnimationGroup constructor
        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });

        const result = getAnimation(mockElement, animationOptions);

        expect(AnimationGroup).toHaveBeenCalledWith(
          expect.arrayContaining([expect.anything()]),
          expect.objectContaining(animationOptions),
        );
        expect(result).toBe(mockAnimationGroup);

        (AnimationGroup as Mock).mockRestore();
      });

      test('should return a CSS animation if a CSS animation is found', async () => {
        // Create mock HTMLElement
        mockElement = {
          id: 'test-element',
          getAnimations: vi.fn(() => mockCSSAnimations),
        } as any;

        const animationOptions: AnimationOptions = {
          namedEffect: { type: 'FadeIn', id: 'fade' },
          duration: 1000,
        };

        // Mock AnimationGroup constructor
        const { AnimationGroup } = await import('../src/AnimationGroup');
        (AnimationGroup as Mock).mockImplementation(function () {
          return mockAnimationGroup;
        });

        const result = getAnimation(mockElement, animationOptions);

        expect(AnimationGroup).toHaveBeenCalledWith([mockCSSAnimations[0]]);
        expect(result).toBe(mockAnimationGroup);

        (AnimationGroup as Mock).mockRestore();
      });
    });
  });

  describe('Integration Tests', () => {
    describe('End-to-End Animation Creation', () => {
      test('should create complete CSS animation workflow', () => {
        // TODO: Implement test
      });

      test('should create complete Web Animation workflow', () => {
        // TODO: Implement test
      });

      test('should handle complex animation with multiple effects', () => {
        // TODO: Implement test
      });

      test('should handle animation with view-progress trigger end-to-end', () => {
        // TODO: Implement test
      });

      test('should handle mouse animation end-to-end', () => {
        // TODO: Implement test
      });

      test('should handle animation preparation and execution workflow', () => {
        // TODO: Implement test
      });

      test('should handle element animation retrieval and manipulation', () => {
        // TODO: Implement test
      });
    });

    describe('Cross-Function Integration', () => {
      test('should integrate getCSSAnimation with getElementCSSAnimation', () => {
        // TODO: Implement test
      });

      test('should integrate getWebAnimation with getScrubScene', () => {
        // TODO: Implement test
      });

      test('should integrate prepareAnimation with getWebAnimation', () => {
        // TODO: Implement test
      });

      test('should handle animation lifecycle from creation to cleanup', () => {
        // TODO: Implement test
      });
    });

    describe('Error Handling', () => {
      test('should handle invalid animation options gracefully', () => {
        // TODO: Implement test
      });

      test('should handle missing DOM elements gracefully', () => {
        // TODO: Implement test
      });

      test('should handle fastdom operation failures', () => {
        // TODO: Implement test
      });

      test('should handle Web Animation API unavailability', () => {
        // TODO: Implement test
      });

      test('should handle invalid effect configurations', () => {
        // TODO: Implement test
      });

      test('should handle null/undefined parameters across all functions', () => {
        // TODO: Implement test
      });
    });

    describe('Browser Compatibility', () => {
      test('should handle ViewTimeline API availability', () => {
        // TODO: Implement test
      });

      test('should handle ViewTimeline API unavailability', () => {
        // TODO: Implement test
      });

      test('should fallback gracefully when APIs are missing', () => {
        // TODO: Implement test
      });

      test('should handle different browser animation capabilities', () => {
        // TODO: Implement test
      });
    });

    describe('Async Operations', () => {
      test('should handle fastdom.measure operations correctly', () => {
        // TODO: Implement test
      });

      test('should handle fastdom.mutate operations correctly', () => {
        // TODO: Implement test
      });

      test('should handle AnimationGroup ready promise', () => {
        // TODO: Implement test
      });

      test('should handle concurrent async operations', () => {
        // TODO: Implement test
      });
    });

    describe('Performance', () => {
      test('should handle large numbers of animations efficiently', () => {
        // TODO: Implement test
      });

      test('should not cause memory leaks with animation cleanup', () => {
        // TODO: Implement test
      });

      test('should batch DOM operations appropriately', () => {
        // TODO: Implement test
      });
    });
  });
});
