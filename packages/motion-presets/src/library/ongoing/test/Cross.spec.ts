import { describe, expect, test } from 'vitest';

import * as Cross from '../Cross';
import {
  Cross as CrossType,
  DomApi,
  EffectEightDirections,
  TimeAnimationOptions,
} from '../../../types';
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

  describe('measured', () => {
    const layout = { left: 200, top: 100, width: 100, height: 50 };
    const parentSize = { width: 1000, height: 800 };

    function createDom() {
      const properties: Record<string, string> = {};
      const parent = { offsetParent: null, getBoundingClientRect: () => parentSize };
      const target = {
        offsetLeft: layout.left,
        offsetTop: layout.top,
        offsetParent: parent,
        getBoundingClientRect: () => ({ width: layout.width, height: layout.height }),
        style: { setProperty: (name: string, value: string) => (properties[name] = value) },
      } as unknown as HTMLElement;
      const measures: ((target: HTMLElement | null) => void)[] = [];
      const mutations: ((target: HTMLElement | null) => void)[] = [];
      const dom: DomApi = {
        measure: (fn) => measures.push(fn),
        mutate: (fn) => mutations.push(fn),
      };
      const flush = () => {
        measures.forEach((fn) => fn(target));
        mutations.forEach((fn) => fn(target));
      };
      return { dom, flush, properties };
    }

    function evaluateLength(value: string, properties: Record<string, string>) {
      const expression = value
        .replace(/var\((--[\w-]+), [^()]+\)/g, (_, name) => `${parseFloat(properties[name])}`)
        .replace(/min\(/g, 'Math.min(')
        .replace(/calc\(/g, '(');
      return new Function(`return ${expression}`)() as number;
    }

    function evaluateTranslate(translate: string, properties: Record<string, string>) {
      let depth = 0;
      const split = [...translate].findIndex((char) => {
        depth += char === '(' ? 1 : char === ')' ? -1 : 0;
        return char === ' ' && depth === 0;
      });
      return [translate.slice(0, split), translate.slice(split + 1)].map((value) =>
        evaluateLength(value, properties),
      );
    }

    // the element's distances (px) to fully leave its 1000x800 parent through each side
    const right = 800;
    const left = 300;
    const bottom = 700;
    const top = 150;

    const cases: [EffectEightDirections, [number, number], [number, number]][] = [
      ['right', [right, 0], [-left, 0]],
      ['left', [-left, 0], [right, 0]],
      ['bottom', [0, bottom], [0, -top]],
      ['top', [0, -top], [0, bottom]],
      ['bottom-right', [bottom, bottom], [-top, -top]],
      ['bottom-left', [-left, left], [top, -top]],
      ['top-right', [top, -top], [-left, left]],
      ['top-left', [-top, -top], [bottom, bottom]],
    ];

    test.each(cases)(
      'moves towards %s before wrapping around from the opposite side',
      (direction, expectedTo, expectedFrom) => {
        const { dom, flush, properties } = createDom();
        const [effect] = Cross.web(
          { ...baseMockOptions, duration: 1000, namedEffect: { direction } as CrossType },
          dom,
        );
        const { keyframes } = { ...effect };

        flush();

        const [, to, from] = keyframes;
        const toDistance = Math.max(...expectedTo.map(Math.abs));
        const fromDistance = Math.max(...expectedFrom.map(Math.abs));

        expect(to.offset).toBeCloseTo(toDistance / (toDistance + fromDistance));
        expect(from.offset).toBe(to.offset);
        expect(evaluateTranslate(to.translate as string, properties)).toEqual(expectedTo);
        expect(evaluateTranslate(from.translate as string, properties)).toEqual(expectedFrom);
      },
    );

    test('scales the wrap point by the iteration delay', () => {
      const { dom, flush } = createDom();
      const [effect] = Cross.web(
        { ...baseMockOptions, duration: 1000, namedEffect: { iterationDelay: 1000 } as CrossType },
        dom,
      );

      flush();

      expect(effect.keyframes.map(({ offset }) => offset)).toEqual([
        0,
        (right / (right + left)) * 0.5,
        (right / (right + left)) * 0.5,
        0.5,
        1,
      ]);
    });
  });
});
