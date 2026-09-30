import { describe, expect, it } from 'vitest';
import { Interact } from '@wix/interact';
import { validateInteractConfig } from '../../src';

const Move = {
  schema: {
    from: { type: 'enum', values: ['left', 'right'], default: 'left' },
    angle: { type: 'angle', default: 0 },
    travel: { type: 'length', default: { value: 10, unit: 'px' } },
    scale: { type: 'number', min: 0, max: 1, default: 0.5 },
    fade: { type: 'bool', default: true },
  },
};

const configWith = (namedEffect: Record<string, unknown>) => ({
  interactions: [
    {
      key: 'el',
      trigger: 'viewEnter',
      effects: [
        { namedEffect: { type: 'Move', ...namedEffect }, duration: 400, fill: 'backwards' },
      ],
    },
  ],
});

const paramErrors = (namedEffect: Record<string, unknown>) =>
  validateInteractConfig(configWith(namedEffect), { effects: { Move } }).errors.filter((e) =>
    e.code.startsWith('NAMED_EFFECT_'),
  );

describe('namedEffectParams', () => {
  it('accepts valid values of every param type', () => {
    expect(
      paramErrors({
        from: 'right',
        angle: '45deg',
        travel: { value: 20, unit: '%' },
        scale: 1,
        fade: false,
      }),
    ).toEqual([]);
    expect(paramErrors({ angle: 'top', travel: 'calc(100% - 10px)' })).toEqual([]);
    expect(paramErrors({ angle: 90, travel: 12 })).toEqual([]);
    expect(paramErrors({ angle: '-0.5turn', travel: '2rem' })).toEqual([]);
  });

  it('errors (NAMED_EFFECT_INVALID_PARAM) on values that do not match the schema', () => {
    const errors = paramErrors({
      from: 'top',
      angle: 'sideways',
      travel: '10 apples',
      scale: 2,
      fade: 'yes',
    });
    expect(errors.map((e) => e.path.at(-1)).sort()).toEqual([
      'angle',
      'fade',
      'from',
      'scale',
      'travel',
    ]);
    expect(errors.every((e) => e.code === 'NAMED_EFFECT_INVALID_PARAM')).toBe(true);
    expect(errors.every((e) => e.severity === 'error')).toBe(true);
    expect(errors.find((e) => e.path.at(-1) === 'from')?.path).toEqual([
      'interactions',
      0,
      'effects',
      0,
      'namedEffect',
      'from',
    ]);
    expect(paramErrors({ travel: { value: 'far', unit: 'px' } })).toHaveLength(1);
  });

  it('warns (NAMED_EFFECT_UNKNOWN_PARAM) on params the schema does not declare', () => {
    const [error] = paramErrors({ direction: 'left' });
    expect(error.code).toBe('NAMED_EFFECT_UNKNOWN_PARAM');
    expect(error.severity).toBe('warning');
    expect(error.path).toEqual(['interactions', 0, 'effects', 0, 'namedEffect', 'direction']);
  });

  it('skips effects without a schema', () => {
    const result = validateInteractConfig(configWith({ anything: 1 }), { effects: {} });
    expect(result.errors.filter((e) => e.code.startsWith('NAMED_EFFECT_'))).toEqual([]);
  });

  it('validates top-level effect definitions', () => {
    const result = validateInteractConfig(
      {
        effects: { move: { namedEffect: { type: 'Move', scale: -1 } } },
        interactions: [{ key: 'el', trigger: 'viewEnter', effects: [{ effectId: 'move' }] }],
      },
      { effects: { Move } },
    );
    const error = result.errors.find((e) => e.code === 'NAMED_EFFECT_INVALID_PARAM');
    expect(error?.path).toEqual(['effects', 'move', 'namedEffect', 'scale']);
  });

  it('uses the effects registered on Interact by default', () => {
    Interact.registerEffects({ Move } as any);
    const result = validateInteractConfig(configWith({ scale: 5 }));
    expect(result.errors.find((e) => e.code === 'NAMED_EFFECT_INVALID_PARAM')).toBeDefined();
  });

  it('can be turned off with severityOverrides', () => {
    const result = validateInteractConfig(configWith({ scale: 5, direction: 'left' }), {
      effects: { Move },
      severityOverrides: { NAMED_EFFECT_PARAMS: 'off' },
    });
    expect(result.errors.filter((e) => e.code.startsWith('NAMED_EFFECT_'))).toEqual([]);
  });
});
