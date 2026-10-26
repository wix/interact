import { describe, expect, test } from 'vitest';

import * as backgroundScroll from '../index';
import { baseMockOptions } from './testUtils';

type StyleOutput = { part?: string; custom?: Record<string, unknown>; keyframes: object[] };

const presets = Object.entries(backgroundScroll).filter(([, preset]) => 'parts' in preset) as [
  string,
  { parts: string[]; style: (options: any) => StyleOutput[] },
][];

// set on the element at runtime by prepare()
const MEASURED_PROPERTIES = [
  '--motion-comp-height',
  '--motion-comp-half-height',
  '--motion-site-height',
];

describe('background scroll presets', () => {
  test.each(presets)('%s declares the parts it animates', (_, preset) => {
    const animatedParts = preset
      .style({ ...baseMockOptions, namedEffect: {} })
      .map(({ part }) => part);

    expect(new Set(animatedParts)).toEqual(new Set(preset.parts));
  });

  test.each(presets)('%s declares the custom properties its keyframes use', (_, preset) => {
    const animations = preset.style({ ...baseMockOptions, namedEffect: {} });
    const declared = animations.flatMap(({ custom }) => Object.keys(custom || {}));
    const used = [
      ...JSON.stringify(animations.map(({ keyframes }) => keyframes)).matchAll(/var\((--[\w-]+)/g),
    ]
      .map(([, name]) => name)
      .filter((name) => !MEASURED_PROPERTIES.includes(name));

    expect(declared).toEqual(expect.arrayContaining(used));
  });
});
