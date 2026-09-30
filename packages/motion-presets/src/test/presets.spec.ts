import { describe, expect, test } from 'vitest';

import * as entrance from '../library/entrance';
import * as scroll from '../library/scroll';
import * as ongoing from '../library/ongoing';

type Field = {
  type: string;
  values?: readonly string[];
  min?: number;
  max?: number;
  default: unknown;
};
type PresetModule = {
  schema?: Record<string, Field>;
  getNames: (options: any) => string[];
  style: (options: any, asWeb?: boolean) => any[];
  web: (options: any) => any[];
};

const SKIP = ['Wiggle', 'Rubber', 'DVD'];
// getNames appends an undefined suffix
const GROUP_OPTIONS = {
  entrance: { duration: 1000 },
  scroll: {
    startOffset: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
    endOffset: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
  },
  ongoing: { duration: 1000 },
};

const presets = Object.entries({ entrance, scroll, ongoing }).flatMap(([group, modules]) =>
  Object.entries(modules as Record<string, PresetModule>)
    .filter(([name, module]) => module.schema && !SKIP.includes(name))
    .map(([name, module]) => ({ group: group as keyof typeof GROUP_OPTIONS, name, module })),
);

const optionsFor = (group: keyof typeof GROUP_OPTIONS, namedEffect: Record<string, unknown>) =>
  structuredClone({ ...GROUP_OPTIONS[group], namedEffect });

const defaultsOf = (schema: Record<string, Field>) =>
  Object.fromEntries(
    Object.entries(schema).map(([key, field]) => [key, structuredClone(field.default)]),
  );

const withoutNamedEffect = (animations: any[]) =>
  animations.map(({ namedEffect: _, ...rest }) => rest);
const namesOf = (animations: any[]) =>
  animations.map((animation) => animation.name).filter(Boolean);

describe.each(presets)('$group $name', ({ group, name, module }) => {
  const schema = module.schema!;

  test('implicit defaults equal the schema defaults', () => {
    const implicit = module.style(optionsFor(group, { type: name }));
    const explicit = module.style(optionsFor(group, { type: name, ...defaultsOf(schema) }));
    expect(withoutNamedEffect(implicit)).toEqual(withoutNamedEffect(explicit));
  });

  test('getNames matches the animation names', () => {
    const options = optionsFor(group, { type: name });
    expect(namesOf(module.style(structuredClone(options)))).toEqual(module.getNames(options));
  });

  test('web and style return the same animations', () => {
    const webAnimations = module.web(optionsFor(group, { type: name }));
    const styleAnimations = module.style(optionsFor(group, { type: name }));
    expect(namesOf(webAnimations)).toEqual(namesOf(styleAnimations));
    expect(webAnimations.length).toBe(styleAnimations.length);
  });

  test('schema defaults are valid', () => {
    for (const [key, field] of Object.entries(schema)) {
      if (field.type === 'enum') {
        expect(field.values, key).toContain(field.default);
      }
      if (field.type === 'number') {
        expect(typeof field.default, key).toBe('number');
        if (field.min !== undefined)
          expect(field.default as number, key).toBeGreaterThanOrEqual(field.min);
        if (field.max !== undefined)
          expect(field.default as number, key).toBeLessThanOrEqual(field.max);
      }
      if (field.type === 'bool') {
        expect(typeof field.default, key).toBe('boolean');
      }
    }
  });
});
