import { describe, expect, test } from 'vitest';

import * as backgroundScroll from '..';
import type { ScrubAnimationOptions } from '../../../types';
import { baseMockOptions } from './testUtils';

type LengthDefault = { value: number; unit: string };
type Field = { type: string; values?: readonly string[]; default: unknown };
type Preset = {
  schema: Record<string, Field>;
  style: (options: ScrubAnimationOptions) => { name: string; keyframes: unknown }[];
};

// a non-default value for each field, so every param is exercised one at a time
function getVariants(schema: Record<string, Field>) {
  const variants: Record<string, unknown>[] = [{}];
  for (const [key, field] of Object.entries(schema)) {
    if (field.type === 'enum') {
      variants.push(...field.values!.map((value) => ({ [key]: value })));
    } else if (field.type === 'bool') {
      variants.push({ [key]: true }, { [key]: false });
    } else if (field.type === 'number') {
      variants.push({ [key]: (field.default as number) + 1 });
    } else if (field.type === 'lengthObject') {
      const def = field.default as LengthDefault;
      variants.push({ [key]: { value: def.value + 10, unit: def.unit } });
    }
  }
  return variants;
}

// CSS @keyframes are shared by name, so a name must always stand for the same keyframes
describe('background scroll presets keyframe names', () => {
  test.each(Object.entries(backgroundScroll as unknown as Record<string, Preset>))(
    '%s',
    (type, preset) => {
      const keyframesByName = new Map<string, string>();
      for (const variant of getVariants(preset.schema)) {
        const animations = preset.style({
          ...baseMockOptions,
          namedEffect: { type, ...variant },
        } as ScrubAnimationOptions);
        for (const { name, keyframes } of animations) {
          const serialized = JSON.stringify(keyframes);
          expect(
            keyframesByName.get(name) ?? serialized,
            `${name} with ${JSON.stringify(variant)}`,
          ).toBe(serialized);
          keyframesByName.set(name, serialized);
        }
      }
    },
  );
});
