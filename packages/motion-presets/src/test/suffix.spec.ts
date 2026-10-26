import { describe, expect, test } from 'vitest';

import * as presets from '../index';
import { suffixCustomProperties, suffixNames } from '../utils';

const SUFFIX = '-1';

type Animation = {
  name?: string;
  custom?: Record<string, string | number | undefined>;
  keyframes: Record<string, string | number | undefined>[];
};
type Preset = {
  getNames: (options: any) => string[];
  style?: (options: any) => Animation[];
};

const stylePresets = Object.entries(presets as Record<string, Preset>).filter(
  ([, preset]) => preset.style,
);

describe('suffixNames', () => {
  test('appends the suffix to every name', () => {
    expect(suffixNames(['a', 'b'], SUFFIX)).toEqual(['a-1', 'b-1']);
  });

  test('keeps the names without a suffix', () => {
    const names = ['a'];
    expect(suffixNames(names)).toBe(names);
  });
});

describe('suffixCustomProperties', () => {
  test('suffixes declared custom properties and their references only', () => {
    const [animation] = suffixCustomProperties(
      [
        {
          custom: { '--motion-x': 1, '--motion-x-y': 2 },
          keyframes: [
            {
              transform:
                'translate(var(--motion-x), var(--motion-x-y, 0)) rotate(var(--motion-rotate, 0deg))',
              opacity: 0,
            },
          ],
        },
      ],
      SUFFIX,
    );

    expect(animation.custom).toEqual({ '--motion-x-1': 1, '--motion-x-y-1': 2 });
    expect(animation.keyframes).toEqual([
      {
        transform:
          'translate(var(--motion-x-1), var(--motion-x-y-1, 0)) rotate(var(--motion-rotate, 0deg))',
        opacity: 0,
      },
    ]);
  });

  test('keeps references to properties that only start with a declared property', () => {
    const [animation] = suffixCustomProperties(
      [
        {
          custom: { '--motion-x': 1 },
          keyframes: [{ opacity: 'var(--motion-xé, var(--motion-x ))' }],
        },
      ],
      SUFFIX,
    );

    expect(animation.keyframes).toEqual([{ opacity: 'var(--motion-xé, var(--motion-x-1 ))' }]);
  });

  test('suffixes references from another animation of the same preset', () => {
    const [, animation] = suffixCustomProperties(
      [
        { custom: { '--motion-x': 1 }, keyframes: [] },
        { keyframes: [{ opacity: 'var(--motion-x)' }] },
      ],
      SUFFIX,
    );

    expect(animation.keyframes).toEqual([{ opacity: 'var(--motion-x-1)' }]);
  });

  test('keeps lazy keyframes lazy', () => {
    let value = 'var(--motion-x)';
    const [animation] = suffixCustomProperties(
      [
        {
          custom: { '--motion-x': 1 },
          get keyframes() {
            return [{ opacity: value }];
          },
        },
      ],
      SUFFIX,
    );
    value = 'calc(var(--motion-x) * 2)';

    expect(animation.keyframes).toEqual([{ opacity: 'calc(var(--motion-x-1) * 2)' }]);
  });
});

describe.each(stylePresets)('%s with a suffix', (type, preset) => {
  const options = { duration: 1000, namedEffect: { type } };
  const suffixed = { ...options, suffix: SUFFIX };
  const names = preset.getNames(options);
  // animations without a name only declare the static styles of their parts
  const animations = preset.style!(options).filter(({ name }) => name);
  const suffixedAnimations = preset.style!(suffixed).filter(({ name }) => name);

  test('getNames suffixes every name', () => {
    expect(preset.getNames(suffixed)).toEqual(names.map((name) => `${name}${SUFFIX}`));
  });

  test('style suffixes its animations names', () => {
    expect(suffixedAnimations.map(({ name }) => name)).toEqual(
      animations.map(({ name }) => `${name}${SUFFIX}`),
    );
  });

  test('style suffixes its custom properties and their references', () => {
    const props = animations.flatMap(({ custom }) => Object.keys(custom || {}));
    const suffixedProps = suffixedAnimations.flatMap(({ custom }) => Object.keys(custom || {}));
    expect(suffixedProps).toEqual(props.map((prop) => `${prop}${SUFFIX}`));

    const keyframes = JSON.stringify(suffixedAnimations.map((animation) => animation.keyframes));
    props.forEach((prop) => {
      expect(keyframes).not.toMatch(new RegExp(`var\\(${prop}[,)]`));
    });
  });
});
