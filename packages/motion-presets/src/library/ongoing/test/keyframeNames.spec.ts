import { describe, expect, test } from 'vitest';

import * as ongoing from '..';
import type { TimeAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

type Field = { type: string; values?: readonly string[] };
type Preset = {
  schema: Record<string, Field>;
  style?: (options: TimeAnimationOptions) => { name: string; keyframes: unknown }[];
};

const EASINGS = [
  undefined,
  'linear',
  'sineIn',
  'cubic-bezier(0.1, 0.2, 0.3, 1)',
  'cubic-bezier(0.1,2,0.3,1)',
  'cubic-bezier(0,1.2,0.3,1)',
  'linear(0, 0.25 50%, 1)',
  'linear(0, 0.25 -50%, 1)',
  'linear(0, 0.0039, 0.0157, 0.0352, 0.0625 25%, 0.1407, 0.25, 0.5, 0.75 75%, 1)',
];

// every enum value and boolean of the schema, one param at a time, with and without a delay
function getVariants(schema: Record<string, Field>) {
  const variants: Record<string, unknown>[] = [{}];
  for (const [key, field] of Object.entries(schema)) {
    if (field.type === 'enum') {
      variants.push(...field.values!.map((value) => ({ [key]: value })));
    } else if (field.type === 'bool') {
      variants.push({ [key]: true }, { [key]: false });
    }
  }
  return [0, 500].flatMap((iterationDelay) =>
    variants.map((variant) => ({ iterationDelay, ...variant })),
  );
}

// CSS @keyframes are shared by name, so a name must always stand for the same keyframes
describe('ongoing presets keyframe names', () => {
  const presets = Object.entries(ongoing as unknown as Record<string, Preset>).filter(
    ([, preset]) => preset.style && preset.schema,
  );

  test.each(presets)('%s', (type, preset) => {
    const keyframesByName = new Map<string, string>();
    for (const variant of getVariants(preset.schema)) {
      for (const easing of EASINGS) {
        const animations = preset.style!({
          ...baseMockOptions,
          duration: 1000,
          easing,
          namedEffect: { type, ...variant },
        } as TimeAnimationOptions);
        for (const { name, keyframes } of animations) {
          const serialized = JSON.stringify(keyframes);
          expect(
            keyframesByName.get(name) ?? serialized,
            `${name} with ${JSON.stringify({ easing, ...variant })}`,
          ).toBe(serialized);
          keyframesByName.set(name, serialized);
        }
      }
    }
  });
});
