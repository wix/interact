import { describe, expect, test } from 'vitest';

import * as DVD from '../DVD';
import { TimeAnimationOptions, DVD as DVDType } from '../../../types';
import { baseMockOptions } from './testUtils';

describe('DVD', () => {
  test('default values', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      namedEffect: {} as DVDType,
    };

    const expectedResult = [
      {
        duration: 9 / 8,
        keyframes: [
          {
            translate: 'calc(-1 * var(--motion-left, 0px))',
          },
          {
            translate:
              'calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px) - var(--motion-width, 100%))',
          },
        ],
        timing: {
          iterationStart: 0,
        },
      },
      {
        duration: 8 / 9,
        keyframes: [
          {
            translate: '0 calc(-1 * var(--motion-top, 0px))',
          },
          {
            translate:
              '0 calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px) - var(--motion-height, 100%))',
          },
        ],
        timing: {
          iterationStart: 0,
        },
      },
    ];

    const result = DVD.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });

  test('custom duration and delay', () => {
    const mockOptions: TimeAnimationOptions = {
      ...baseMockOptions,
      duration: 1000,
      delay: 500,
      namedEffect: {} as DVDType,
    };

    const expectedResult = [
      {
        delay: 500,
        duration: 1125,
      },
      {
        delay: 500,
        duration: 888.8888888888888,
      },
    ];

    const result = DVD.web(mockOptions);

    expect(result).toMatchObject(expectedResult);
  });
});
