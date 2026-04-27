import { describe, expect, test } from 'vitest';

import * as Spin3dScroll from '../Spin3dScroll';
import type { Spin3dScroll as Spin3dScrollType, ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('Spin3dScroll', () => {
  describe('web', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Spin3dScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          startOffsetAdd: '0vh',
          endOffsetAdd: '0px',
          keyframes: [
            {
              transform:
                'perspective(1000px) translateY(0vh) rotateZ(calc(var(--motion-rotate, 0deg) + 100deg)) rotateY(100deg) rotateX(200deg)',
            },
            {
              transform:
                'perspective(1000px) translateY(0vh) rotateZ(calc(var(--motion-rotate, 0deg) + 0deg)) rotateY(0deg) rotateX(0deg)',
            },
          ],
        },
      ];

      const result = Spin3dScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom rotate value', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { rotate: -50 } as Spin3dScrollType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform:
                'perspective(1000px) translateY(0vh) rotateZ(calc(var(--motion-rotate, 0deg) + 50deg)) rotateY(50deg) rotateX(100deg)',
            },
            {
              transform:
                'perspective(1000px) translateY(0vh) rotateZ(calc(var(--motion-rotate, 0deg) + 0deg)) rotateY(0deg) rotateX(0deg)',
            },
          ],
        },
      ];

      const result = Spin3dScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as Spin3dScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          startOffsetAdd: '0px',
          endOffsetAdd: '0vh',
          keyframes: [
            {
              transform:
                'perspective(1000px) translateY(0vh) rotateZ(calc(var(--motion-rotate, 0deg) + 0deg)) rotateY(0deg) rotateX(0deg)',
            },
            {
              transform:
                'perspective(1000px) translateY(0vh) rotateZ(calc(var(--motion-rotate, 0deg) + -100deg)) rotateY(-200deg) rotateX(-300deg)',
            },
          ],
        },
      ];

      const result = Spin3dScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        fill: 'both',
        namedEffect: { range: 'continuous' } as Spin3dScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          startOffsetAdd: '0vh',
          endOffsetAdd: '0vh',
          keyframes: [
            {
              transform:
                'perspective(1000px) translateY(0vh) rotateZ(calc(var(--motion-rotate, 0deg) + 100deg)) rotateY(100deg) rotateX(200deg)',
            },
            {
              transform:
                'perspective(1000px) translateY(0vh) rotateZ(calc(var(--motion-rotate, 0deg) + -200deg)) rotateY(-100deg) rotateX(-180deg)',
            },
          ],
        },
      ];

      const result = Spin3dScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom speed', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { speed: 0.5 } as Spin3dScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '-20vh',
          endOffsetAdd: '0px',
          keyframes: [
            {
              transform:
                'perspective(1000px) translateY(-20vh) rotateZ(calc(var(--motion-rotate, 0deg) + 100deg)) rotateY(100deg) rotateX(200deg)',
            },
            {
              transform:
                'perspective(1000px) translateY(0vh) rotateZ(calc(var(--motion-rotate, 0deg) + 0deg)) rotateY(0deg) rotateX(0deg)',
            },
          ],
        },
      ];

      const result = Spin3dScroll.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('default values', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: {} as Spin3dScrollType,
      };

      const expectedResult = [
        {
          fill: 'backwards',
          easing: 'linear',
          startOffsetAdd: '0vh',
          endOffsetAdd: '0px',
          custom: {
            '--motion-perspective': '1000px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-from)) rotateZ(calc(var(--motion-rotate, 0deg) + var(--motion-rot-z-from))) rotateY(var(--motion-rot-y-from)) rotateX(var(--motion-rot-x-from))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-to)) rotateZ(calc(var(--motion-rotate, 0deg) + var(--motion-rot-z-to))) rotateY(var(--motion-rot-y-to)) rotateX(var(--motion-rot-x-to))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom rotate value', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { rotate: -50 } as Spin3dScrollType,
      };

      const expectedResult = [
        {
          custom: {
            '--motion-perspective': '1000px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-from)) rotateZ(calc(var(--motion-rotate, 0deg) + var(--motion-rot-z-from))) rotateY(var(--motion-rot-y-from)) rotateX(var(--motion-rot-x-from))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-to)) rotateZ(calc(var(--motion-rotate, 0deg) + var(--motion-rot-z-to))) rotateY(var(--motion-rot-y-to)) rotateX(var(--motion-rot-x-to))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - out', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as Spin3dScrollType,
      };

      const expectedResult = [
        {
          fill: 'forwards',
          startOffsetAdd: '0px',
          endOffsetAdd: '0vh',
          custom: {
            '--motion-perspective': '1000px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-from)) rotateZ(calc(var(--motion-rotate, 0deg) + var(--motion-rot-z-from))) rotateY(var(--motion-rot-y-from)) rotateX(var(--motion-rot-x-from))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-to)) rotateZ(calc(var(--motion-rotate, 0deg) + var(--motion-rot-z-to))) rotateY(var(--motion-rot-y-to)) rotateX(var(--motion-rot-x-to))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom range - continuous', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        fill: 'both',
        namedEffect: { range: 'continuous' } as Spin3dScrollType,
      };

      const expectedResult = [
        {
          fill: 'both',
          startOffsetAdd: '0vh',
          endOffsetAdd: '0vh',
          custom: {
            '--motion-perspective': '1000px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-from)) rotateZ(calc(var(--motion-rotate, 0deg) + var(--motion-rot-z-from))) rotateY(var(--motion-rot-y-from)) rotateX(var(--motion-rot-x-from))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-to)) rotateZ(calc(var(--motion-rotate, 0deg) + var(--motion-rot-z-to))) rotateY(var(--motion-rot-y-to)) rotateX(var(--motion-rot-x-to))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('custom speed', () => {
      const mockOptions: ScrubAnimationOptions = {
        ...baseMockOptions,
        namedEffect: { speed: 0.5 } as Spin3dScrollType,
      };

      const expectedResult = [
        {
          startOffsetAdd: '-20vh',
          endOffsetAdd: '0px',
          custom: {
            '--motion-perspective': '1000px',
          },
          keyframes: [
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-from)) rotateZ(calc(var(--motion-rotate, 0deg) + var(--motion-rot-z-from))) rotateY(var(--motion-rot-y-from)) rotateX(var(--motion-rot-x-from))',
            },
            {
              transform:
                'perspective(var(--motion-perspective)) translateY(var(--motion-travel-to)) rotateZ(calc(var(--motion-rotate, 0deg) + var(--motion-rot-z-to))) rotateY(var(--motion-rot-y-to)) rotateX(var(--motion-rot-x-to))',
            },
          ],
        },
      ];

      const result = Spin3dScroll.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
