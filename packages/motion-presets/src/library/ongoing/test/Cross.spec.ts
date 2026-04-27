import { describe, expect, test } from 'vitest';

import * as Cross from '../Cross';
import { Cross as CrossType, TimeAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Cross', () => {
  describe('web function', () => {
    test('default values', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as CrossType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          namedEffect: {} as CrossType,
          name: 'motion-cross',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-left': '0px',
            '--motion-top': '0px',
            '--motion-width': '100%',
            '--motion-height': '100%',
            '--motion-parent-width': '100vw',
            '--motion-parent-height': '100vh',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0 0',
            },
            {
              easing: 'step-start',
              offset: 0,
              translate: 'calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)) 0',
            },
            {
              offset: 0,
              translate: 'calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) 0',
            },
            {
              offset: 1,
              translate: '0 0',
            },
            {
              offset: 1,
              translate: '0 0',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom duration', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { iterationDelay: 500 } as CrossType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          namedEffect: {} as CrossType,
          name: 'motion-cross',
          easing: 'linear',
          duration: 1500,
          custom: {
            '--motion-left': '0px',
            '--motion-top': '0px',
            '--motion-width': '100%',
            '--motion-height': '100%',
            '--motion-parent-width': '100vw',
            '--motion-parent-height': '100vh',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0 0',
            },
            {
              easing: 'step-start',
              offset: 0,
              translate: 'calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)) 0',
            },
            {
              offset: 0,
              translate: 'calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) 0',
            },
            {
              offset: 0.67,
              translate: '0 0',
            },
            {
              offset: 1,
              translate: '0 0',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top' } as CrossType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          namedEffect: { direction: 'top' } as CrossType,
          name: 'motion-cross',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-left': '0px',
            '--motion-top': '0px',
            '--motion-width': '100%',
            '--motion-height': '100%',
            '--motion-parent-width': '100vw',
            '--motion-parent-height': '100vh',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0 0',
            },
            {
              easing: 'step-start',
              offset: 0,
              translate: '0 calc(var(--motion-top, 0px) * -1 - var(--motion-height, 100%))',
            },
            {
              offset: 0,
              translate: '0 calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px))',
            },
            {
              offset: 1,
              translate: '0 0',
            },
            {
              offset: 1,
              translate: '0 0',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - bottom', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'bottom' } as CrossType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          namedEffect: { direction: 'bottom' } as CrossType,
          name: 'motion-cross',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-left': '0px',
            '--motion-top': '0px',
            '--motion-width': '100%',
            '--motion-height': '100%',
            '--motion-parent-width': '100vw',
            '--motion-parent-height': '100vh',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0 0',
            },
            {
              easing: 'step-start',
              offset: 0,
              translate: '0 calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px))',
            },
            {
              offset: 0,
              translate: '0 calc(var(--motion-top, 0px) * -1 - var(--motion-height, 100%))',
            },
            {
              offset: 1,
              translate: '0 0',
            },
            {
              offset: 1,
              translate: '0 0',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'left' } as CrossType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          namedEffect: { direction: 'left' } as CrossType,
          name: 'motion-cross',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-left': '0px',
            '--motion-top': '0px',
            '--motion-width': '100%',
            '--motion-height': '100%',
            '--motion-parent-width': '100vw',
            '--motion-parent-height': '100vh',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0 0',
            },
            {
              easing: 'step-start',
              offset: 0,
              translate: 'calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) 0',
            },
            {
              offset: 0,
              translate: 'calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)) 0',
            },
            {
              offset: 1,
              translate: '0 0',
            },
            {
              offset: 1,
              translate: '0 0',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top-left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top-left' } as CrossType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          namedEffect: { direction: 'top-left' } as CrossType,
          name: 'motion-cross',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-left': '0px',
            '--motion-top': '0px',
            '--motion-width': '100%',
            '--motion-height': '100%',
            '--motion-parent-width': '100vw',
            '--motion-parent-height': '100vh',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0 0',
            },
            {
              easing: 'step-start',
              offset: 0,
              translate:
                'calc(min(calc(calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) * -1), calc(calc(var(--motion-top, 0px) * -1 - var(--motion-height, 100%)) * -1)) * -1) calc(min(calc(calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) * -1), calc(calc(var(--motion-top, 0px) * -1 - var(--motion-height, 100%)) * -1)) * -1)',
            },
            {
              offset: 0,
              translate:
                'calc(min(calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)), calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px))) * 1) calc(min(calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)), calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px))) * 1)',
            },
            {
              offset: 1,
              translate: '0 0',
            },
            {
              offset: 1,
              translate: '0 0',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - top-right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'top-right' } as CrossType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          namedEffect: { direction: 'top-right' } as CrossType,
          name: 'motion-cross',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-left': '0px',
            '--motion-top': '0px',
            '--motion-width': '100%',
            '--motion-height': '100%',
            '--motion-parent-width': '100vw',
            '--motion-parent-height': '100vh',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0 0',
            },
            {
              easing: 'step-start',
              offset: 0,
              translate:
                'calc(min(calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)), calc(calc(var(--motion-top, 0px) * -1 - var(--motion-height, 100%)) * -1)) * 1) calc(min(calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)), calc(calc(var(--motion-top, 0px) * -1 - var(--motion-height, 100%)) * -1)) * -1)',
            },
            {
              offset: 0,
              translate:
                'calc(min(calc(calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) * -1), calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px))) * -1) calc(min(calc(calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) * -1), calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px))) * 1)',
            },
            {
              offset: 1,
              translate: '0 0',
            },
            {
              offset: 1,
              translate: '0 0',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - bottom-left', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'bottom-left' } as CrossType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          namedEffect: { direction: 'bottom-left' } as CrossType,
          name: 'motion-cross',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-left': '0px',
            '--motion-top': '0px',
            '--motion-width': '100%',
            '--motion-height': '100%',
            '--motion-parent-width': '100vw',
            '--motion-parent-height': '100vh',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0 0',
            },
            {
              easing: 'step-start',
              offset: 0,
              translate:
                'calc(min(calc(calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) * -1), calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px))) * -1) calc(min(calc(calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) * -1), calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px))) * 1)',
            },
            {
              offset: 0,
              translate:
                'calc(min(calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)), calc(calc(var(--motion-top, 0px) * -1 - var(--motion-height, 100%)) * -1)) * 1) calc(min(calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)), calc(calc(var(--motion-top, 0px) * -1 - var(--motion-height, 100%)) * -1)) * -1)',
            },
            {
              offset: 1,
              translate: '0 0',
            },
            {
              offset: 1,
              translate: '0 0',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom direction - bottom-right', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { direction: 'bottom-right' } as CrossType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          namedEffect: { direction: 'bottom-right' } as CrossType,
          name: 'motion-cross',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-left': '0px',
            '--motion-top': '0px',
            '--motion-width': '100%',
            '--motion-height': '100%',
            '--motion-parent-width': '100vw',
            '--motion-parent-height': '100vh',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0 0',
            },
            {
              easing: 'step-start',
              offset: 0,
              translate:
                'calc(min(calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)), calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px))) * 1) calc(min(calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)), calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px))) * 1)',
            },
            {
              offset: 0,
              translate:
                'calc(min(calc(calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) * -1), calc(calc(var(--motion-top, 0px) * -1 - var(--motion-height, 100%)) * -1)) * -1) calc(min(calc(calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) * -1), calc(calc(var(--motion-top, 0px) * -1 - var(--motion-height, 100%)) * -1)) * -1)',
            },
            {
              offset: 1,
              translate: '0 0',
            },
            {
              offset: 1,
              translate: '0 0',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('no duration specified uses default', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: undefined,
        namedEffect: {} as CrossType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          namedEffect: {} as CrossType,
          name: 'motion-cross',
          easing: 'linear',
          duration: 1,
          custom: {
            '--motion-left': '0px',
            '--motion-top': '0px',
            '--motion-width': '100%',
            '--motion-height': '100%',
            '--motion-parent-width': '100vw',
            '--motion-parent-height': '100vh',
          },
        },
      ];

      const result = Cross.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('equal duration and delay', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 1000,
        namedEffect: { iterationDelay: 1000 } as CrossType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          namedEffect: {} as CrossType,
          name: 'motion-cross',
          easing: 'linear',
          duration: 2000,
          custom: {
            '--motion-left': '0px',
            '--motion-top': '0px',
            '--motion-width': '100%',
            '--motion-height': '100%',
            '--motion-parent-width': '100vw',
            '--motion-parent-height': '100vh',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0 0',
            },
            {
              easing: 'step-start',
              offset: 0,
              translate: 'calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)) 0',
            },
            {
              offset: 0,
              translate: 'calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) 0',
            },
            {
              offset: 0.5,
              translate: '0 0',
            },
            {
              offset: 1,
              translate: '0 0',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('delay longer than duration', () => {
      const mockOptions: TimeAnimationOptions = {
        ...baseMockOptions,
        duration: 500,
        namedEffect: { iterationDelay: 1500 } as CrossType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          namedEffect: {} as CrossType,
          name: 'motion-cross',
          easing: 'linear',
          duration: 2000,
          custom: {
            '--motion-left': '0px',
            '--motion-top': '0px',
            '--motion-width': '100%',
            '--motion-height': '100%',
            '--motion-parent-width': '100vw',
            '--motion-parent-height': '100vh',
          },
          keyframes: [
            {
              offset: 0,
              translate: '0 0',
            },
            {
              easing: 'step-start',
              offset: 0,
              translate: 'calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px)) 0',
            },
            {
              offset: 0,
              translate: 'calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%)) 0',
            },
            {
              offset: 0.25,
              translate: '0 0',
            },
            {
              offset: 1,
              translate: '0 0',
            },
          ],
        },
      ];

      const result = Cross.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
