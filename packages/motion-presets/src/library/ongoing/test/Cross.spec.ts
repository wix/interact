import { describe, expect, test, vi } from 'vitest';

import * as Cross from '../Cross';
import { AnimationData, Cross as CrossType, DomApi, TimeAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

const LAYOUT = {
  left: 100,
  top: 50,
  width: 200,
  height: 100,
  parentWidth: 1000,
  parentHeight: 500,
};

function mockDom() {
  const setProperty = vi.fn();
  const parent = { offsetWidth: LAYOUT.parentWidth, offsetHeight: LAYOUT.parentHeight };
  const target = {
    offsetLeft: LAYOUT.left,
    offsetTop: LAYOUT.top,
    offsetWidth: LAYOUT.width,
    offsetHeight: LAYOUT.height,
    offsetParent: parent,
    style: { setProperty },
  } as unknown as HTMLElement;
  const dom = {
    measure: (fn: (target: HTMLElement) => void) => fn(target),
    mutate: (fn: (target: HTMLElement) => void) => fn(target),
  } as DomApi;
  return { dom, setProperty };
}

describe('Cross', () => {
  test('schema', () => {
    expect(Cross.schema).toEqual({
      direction: {
        type: 'enum',
        values: [
          'top',
          'right',
          'bottom',
          'left',
          'top-left',
          'top-right',
          'bottom-left',
          'bottom-right',
        ],
        default: 'right',
      },
      iterationDelay: { type: 'number', min: 0, default: 0 },
    });
  });

  test('prepare measures the layout into custom properties', () => {
    const { dom, setProperty } = mockDom();

    Cross.prepare({ ...baseMockOptions, namedEffect: {} as CrossType }, dom);

    expect(setProperty.mock.calls).toEqual([
      ['--motion-left', '100px'],
      ['--motion-top', '50px'],
      ['--motion-width', '200px'],
      ['--motion-height', '100px'],
      ['--motion-parent-width', '1000px'],
      ['--motion-parent-height', '500px'],
    ]);
  });

  describe('web function', () => {
    test('unmeasured layout assumes equal sides', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as CrossType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-cross-1',
          easing: 'linear',
          duration: 1,
          custom: {},
          keyframes: [
            {
              offset: 0,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5,
              transform:
                'translate(calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)), 0px) rotate(var(--motion-rotate, 0deg))',
              easing: 'step-start',
            },
            {
              offset: 0.5,
              transform:
                'translate(calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)), 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('measured layout - right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as CrossType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-cross-1',
          easing: 'linear',
          duration: 1,
          custom: {},
          keyframes: [
            {
              offset: 0,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.75,
              transform:
                'translate(calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)), 0px) rotate(var(--motion-rotate, 0deg))',
              easing: 'step-start',
            },
            {
              offset: 0.75,
              transform:
                'translate(calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)), 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions, mockDom().dom);

      expect(result).toMatchObject(expectedResult);
    });

    test('measured layout - top-left with delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { direction: 'top-left', iterationDelay: 500 } as CrossType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          duration: 1500,
          name: 'motion-cross-067',
          easing: 'linear',
          custom: {},
          keyframes: [
            {
              offset: 0,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.16666666666666666,
              transform:
                'translate(calc(min(calc(calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) * -1), calc(calc(var(--motion-top, 0px) * -1 - var(--motion-height, 100%)) * -1)) * -1), calc(min(calc(calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) * -1), calc(calc(var(--motion-top, 0px) * -1 - var(--motion-height, 100%)) * -1)) * -1)) rotate(var(--motion-rotate, 0deg))',
              easing: 'step-start',
            },
            {
              offset: 0.16666666666666666,
              transform:
                'translate(calc(min(calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)), calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px))) * 1), calc(min(calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)), calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px))) * 1)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.6666666666666666,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions, mockDom().dom);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style function', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as CrossType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-cross-1',
          easing: 'linear',
          duration: 1,
          custom: {},
          keyframes: [
            {
              offset: 0,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-to)) rotate(var(--motion-rotate, 0deg))',
              easing: 'step-start',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Cross.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top' } as CrossType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-cross-1',
          easing: 'linear',
          duration: 1,
          custom: {},
          keyframes: [
            {
              offset: 0,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-to)) rotate(var(--motion-rotate, 0deg))',
              easing: 'step-start',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Cross.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - bottom', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'bottom' } as CrossType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-cross-1',
          easing: 'linear',
          duration: 1,
          custom: {},
          keyframes: [
            {
              offset: 0,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-to)) rotate(var(--motion-rotate, 0deg))',
              easing: 'step-start',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Cross.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left' } as CrossType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-cross-1',
          easing: 'linear',
          duration: 1,
          custom: {},
          keyframes: [
            {
              offset: 0,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-to)) rotate(var(--motion-rotate, 0deg))',
              easing: 'step-start',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Cross.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top-left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top-left' } as CrossType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-cross-1',
          easing: 'linear',
          duration: 1,
          custom: {},
          keyframes: [
            {
              offset: 0,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-to)) rotate(var(--motion-rotate, 0deg))',
              easing: 'step-start',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Cross.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top-right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top-right' } as CrossType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-cross-1',
          easing: 'linear',
          duration: 1,
          custom: {},
          keyframes: [
            {
              offset: 0,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-to)) rotate(var(--motion-rotate, 0deg))',
              easing: 'step-start',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Cross.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - bottom-left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'bottom-left' } as CrossType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-cross-1',
          easing: 'linear',
          duration: 1,
          custom: {},
          keyframes: [
            {
              offset: 0,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-to)) rotate(var(--motion-rotate, 0deg))',
              easing: 'step-start',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Cross.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - bottom-right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'bottom-right' } as CrossType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          name: 'motion-cross-1',
          easing: 'linear',
          duration: 1,
          custom: {},
          keyframes: [
            {
              offset: 0,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-to)) rotate(var(--motion-rotate, 0deg))',
              easing: 'step-start',
            },
            {
              offset: 0.5,
              transform: 'translate(var(--motion-cross-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Cross.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('equal duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { iterationDelay: 1000 } as CrossType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          duration: 2000,
          name: 'motion-cross-05',
          easing: 'linear',
          custom: {},
          keyframes: [
            {
              offset: 0,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.25,
              transform: 'translate(var(--motion-cross-to)) rotate(var(--motion-rotate, 0deg))',
              easing: 'step-start',
            },
            {
              offset: 0.25,
              transform: 'translate(var(--motion-cross-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.5,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Cross.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('delay longer than duration', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 500,
        namedEffect: { iterationDelay: 1500 } as CrossType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          duration: 2000,
          name: 'motion-cross-025',
          easing: 'linear',
          custom: {},
          keyframes: [
            {
              offset: 0,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.125,
              transform: 'translate(var(--motion-cross-to)) rotate(var(--motion-rotate, 0deg))',
              easing: 'step-start',
            },
            {
              offset: 0.125,
              transform: 'translate(var(--motion-cross-from)) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 0.25,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
            {
              offset: 1,
              transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg))',
            },
          ],
        },
      ];

      const result = Cross.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
