import { describe, expect, test } from 'vitest';

import * as backgroundScroll from '../index';
import { animationsOf, baseMockOptions } from './testUtils';

type StyleOutput = {
  name?: string;
  part?: string;
  custom?: Record<string, unknown>;
  style?: Record<string, unknown>;
  keyframes: object[];
};

const presets = Object.entries(backgroundScroll).filter(([, preset]) => 'parts' in preset) as [
  string,
  {
    parts: string[];
    style: (options: any) => StyleOutput[];
    web: (options: any) => StyleOutput[];
  },
][];

// set on the element at runtime by prepare()
const MEASURED_PROPERTIES = [
  '--motion-comp-height',
  '--motion-comp-half-height',
  '--motion-site-height',
];

describe('background scroll presets', () => {
  test.each(presets)('%s declares the parts it animates', (_, preset) => {
    const animatedParts = animationsOf(preset.style({ ...baseMockOptions, namedEffect: {} })).map(
      ({ part }) => part,
    );

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

  test.each(presets)('%s clips its media to its layer', (_, preset) => {
    const clip = preset
      .style({ ...baseMockOptions, namedEffect: {} })
      .find(({ name, part }) => !name && part === 'MEDIA_CLIP');

    expect(clip?.style).toMatchObject({ overflow: 'clip', contain: 'layout' });
  });

  test.each(presets)('%s only animates in web()', (_, preset) => {
    const animations = preset.web({ ...baseMockOptions, namedEffect: {} });

    expect(animations.every(({ name }) => name)).toBe(true);
  });
});
