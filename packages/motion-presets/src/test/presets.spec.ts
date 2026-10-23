import { describe, expect, test } from 'vitest';

import * as entrance from '../library/entrance';
import * as scroll from '../library/scroll';
import * as ongoing from '../library/ongoing';
import * as mouse from '../library/mouse';
import * as backgroundScroll from '../library/backgroundScroll';

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
  style?: (options: any, asWeb?: boolean) => any[];
  web: (options: any) => any[];
};

const SKIP = ['DVD'];
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

const expectValidDefaults = (schema: Record<string, Field>) => {
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
};

describe.each(presets)('$group $name', ({ group, name, module }) => {
  const schema = module.schema!;
  const render = module.style!;

  test('implicit defaults equal the schema defaults', () => {
    const implicit = render(optionsFor(group, { type: name }));
    const explicit = render(optionsFor(group, { type: name, ...defaultsOf(schema) }));
    expect(withoutNamedEffect(implicit)).toEqual(withoutNamedEffect(explicit));
  });

  test('getNames matches the animation names', () => {
    const options = optionsFor(group, { type: name });
    expect(namesOf(render(structuredClone(options)))).toEqual(module.getNames(options));
  });

  test('web and style return the same animations', () => {
    const webAnimations = module.web(optionsFor(group, { type: name }));
    const styleAnimations = module.style!(optionsFor(group, { type: name }));
    expect(namesOf(webAnimations)).toEqual(namesOf(styleAnimations));
    expect(webAnimations.length).toBe(styleAnimations.length);
  });

  test('schema defaults are valid', () => {
    expectValidDefaults(schema);
  });
});

type MouseModule = ((options: any) => (target: HTMLElement) => {
  progress: (progress: any) => void;
}) & { schema?: Record<string, Field> };

const mousePresets = Object.entries(mouse as Record<string, MouseModule>)
  .filter(([, create]) => create.schema)
  .map(([name, create]) => ({ name, create }));

const styleAfterProgress = (create: MouseModule, namedEffect: Record<string, unknown>) => {
  const target = document.createElement('div');
  create({ namedEffect: structuredClone(namedEffect) })(target).progress({
    x: 0.2,
    y: 0.7,
    v: { x: 1, y: -1 },
    active: true,
  });
  return target.style.cssText;
};

describe.each(mousePresets)('mouse $name', ({ name, create }) => {
  const schema = create.schema!;

  test('implicit defaults equal the schema defaults', () => {
    expect(styleAfterProgress(create, { type: name })).toEqual(
      styleAfterProgress(create, { type: name, ...defaultsOf(schema) }),
    );
  });

  test('schema defaults are valid', () => {
    expectValidDefaults(schema);
  });
});

const sampleValues = (field: Field & { int?: boolean }) => {
  if (field.type === 'enum') return field.values!;
  if (field.type === 'bool') return [true, false];
  if (field.type === 'length') {
    return [field.default, { value: 33, unit: 'px' }, { value: 2, unit: 'em' }, 'calc(1vh + 10px)'];
  }
  if (field.type === 'angle') return [field.default, 45, 'top', '0.25turn'];
  if (field.type === 'number') {
    const value = field.default as number;
    const values = [value, field.min ?? value - 1, field.max ?? value * 2 + 1];
    return [...new Set(field.int ? values.map(Math.round) : values)];
  }
  return [field.default];
};

const sampleParams = (schema: Record<string, Field> = {}) =>
  Object.entries(schema).reduce<Record<string, unknown>[]>(
    (params, [key, field]) =>
      params.flatMap((param) => sampleValues(field).map((value) => ({ ...param, [key]: value }))),
    [{}],
  );

// var() fallbacks never apply, since every animation declares its custom properties
const withoutVarFallbacks = (css: string) => {
  let result = '';
  for (let i = 0; i < css.length; i++) {
    const comma = css.indexOf(',', i);
    if (css.startsWith('var(', i) && comma !== -1 && comma < css.indexOf(')', i)) {
      let depth = 1;
      let j = comma + 1;
      for (; depth; j++) {
        if (css[j] === '(') depth++;
        if (css[j] === ')') depth--;
      }
      result += `${css.slice(i, comma)})`;
      i = j - 1;
    } else {
      result += css[i];
    }
  }
  return result;
};

const EASINGS = [undefined, 'linear', 'quadIn', 'cubic-bezier(0.1, 0.2, 0.3, 0.4)'];

test('each keyframes name always has the same keyframes', () => {
  const groups = { entrance, scroll, ongoing, backgroundScroll };
  const groupOptions: Record<string, Record<string, unknown>[]> = {
    entrance: [{ duration: 1000 }],
    ongoing: [{ duration: 1000 }, { duration: 500 }],
  };
  const extraParams: Record<string, Record<string, unknown>[]> = {
    ongoing: [{}, { iterationDelay: 500 }, { iterationDelay: 1000 }],
  };
  const keyframesByName = new Map<string, string>();
  const collisions = new Set<string>();

  for (const [group, modules] of Object.entries(groups)) {
    for (const [type, module] of Object.entries(modules as Record<string, PresetModule>)) {
      if (!module.style) continue;
      for (const options of groupOptions[group] ?? [{}])
        for (const easing of EASINGS)
          for (const params of sampleParams(module.schema))
            for (const extra of extraParams[group] ?? [{}]) {
              const namedEffect = { type, ...params, ...extra };
              for (const { name, keyframes } of module.style(
                structuredClone({ ...options, easing, namedEffect }),
              )) {
                const css = withoutVarFallbacks(JSON.stringify(keyframes));
                if (!keyframesByName.has(name)) keyframesByName.set(name, css);
                else if (keyframesByName.get(name) !== css) collisions.add(name);
              }
            }
    }
  }

  expect([...collisions]).toEqual([]);
});

const EXTERNAL_PROPERTIES = ['--motion-rotate', '--motion-left'];

describe.each(presets)('$group $name custom properties', ({ group, name, module }) => {
  test.each(sampleParams(module.schema))('are suffixed for %o', (params) => {
    const options = { ...optionsFor(group, { type: name, ...params }), suffix: '-s1' };
    for (const { custom = {}, keyframes } of module.style!(options)) {
      for (const key of Object.keys(custom)) expect(key).toContain('-s1');
      const referenced = [...JSON.stringify(keyframes).matchAll(/var\((--[\w-]+)/g)].map(
        ([, property]) => property,
      );
      for (const property of referenced)
        expect([...Object.keys(custom), ...EXTERNAL_PROPERTIES]).toContain(property);
    }
  });
});

describe.each(presets.filter(({ group }) => group === 'ongoing'))(
  'ongoing $name iteration delay',
  ({ name, module }) => {
    const { iterationDelay: _, ...schema } = module.schema!;
    test.each(
      sampleParams(schema).flatMap((params) => [
        { params, duration: 1000, iterationDelay: 500, timingFactor: 0.67 },
        { params, duration: 500, iterationDelay: 1000, timingFactor: 0.33 },
      ]),
    )(
      'holds the rest after the undelayed motion for $params, $duration + $iterationDelay',
      ({ params, duration, iterationDelay, timingFactor }) => {
        const [undelayed] = module.style!(
          structuredClone({ duration, namedEffect: { type: name, ...params } }),
        );
        const [delayed] = module.style!(
          structuredClone({ duration, namedEffect: { type: name, ...params, iterationDelay } }),
        );
        const keyframes = undelayed.keyframes.map((keyframe: { offset: number }) => ({
          ...keyframe,
          offset: keyframe.offset * timingFactor,
        }));

        expect(delayed.duration).toBe(duration + iterationDelay);
        expect(delayed.custom).toEqual(undelayed.custom);
        expect(delayed.keyframes).toEqual([
          ...keyframes,
          { ...undelayed.keyframes[undelayed.keyframes.length - 1], offset: 1 },
        ]);
      },
    );
  },
);
