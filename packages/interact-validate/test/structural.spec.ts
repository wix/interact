import { describe, expect, it } from 'vitest';
import { validateStructural } from '../src/structural';

const VALID_CONFIG = {
  interactions: [
    {
      key: 'el',
      trigger: 'viewEnter',
      effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
    },
  ],
  conditions: { 'condition-id': { type: 'media', predicate: '(min-width: 768px)' } },
};

describe('validateStructural', () => {
  it('returns ok=true and no errors for a valid config', () => {
    const result = validateStructural(VALID_CONFIG);
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.parsed).toBeDefined();
  });

  it('emits SCHEMA_INVALID_TYPE when interactions is missing', () => {
    const result = validateStructural({});
    expect(result.ok).toBe(false);
    const err = result.errors.find((e) => e.code === 'SCHEMA_INVALID_TYPE');
    expect(err?.path).toEqual(['interactions']);
  });

  it('emits SCHEMA_INVALID_TYPE when interactions is not an array', () => {
    const result = validateStructural({ interactions: 'not-an-array' });
    expect(result.ok).toBe(false);
    const err = result.errors.find((e) => e.code === 'SCHEMA_INVALID_TYPE');
    expect(err?.path).toEqual(['interactions']);
  });

  it('emits SCHEMA_UNRECOGNIZED_KEYS for an unknown root key', () => {
    const result = validateStructural({ ...VALID_CONFIG, unknownField: true });
    expect(result.ok).toBe(false);
    const err = result.errors.find((e) => e.code === 'SCHEMA_UNRECOGNIZED_KEYS');
    expect(err?.path).toEqual([]);
  });

  it('emits SCHEMA_TOO_SMALL when interaction key is an empty string', () => {
    const result = validateStructural({
      interactions: [
        { key: '', trigger: 'viewEnter', effects: [{ namedEffect: { type: 'FadeIn' } }] },
      ],
    });
    expect(result.ok).toBe(false);
    const err = result.errors.find((e) => e.code === 'SCHEMA_TOO_SMALL');
    expect(err?.path).toEqual(['interactions', 0, 'key']);
  });

  it('emits errors for an unrecognised trigger value', () => {
    const result = validateStructural({
      interactions: [
        { key: 'el', trigger: 'invalidTrigger', effects: [{ namedEffect: { type: 'FadeIn' } }] },
      ],
    });
    expect(result.ok).toBe(false);
    // Error is reported at the interaction element — the bad trigger is inside interactions[0]
    expect(result.errors.some((e) => e.path[0] === 'interactions' && e.path[1] === 0)).toBe(true);
  });

  it('emits SCHEMA_INVALID_UNION at the effect element when multiple sources are defined', () => {
    const result = validateStructural({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [
            {
              duration: 400,
              namedEffect: { type: 'FadeIn' },
              keyframeEffect: { name: 'k', keyframes: [{ opacity: 0 }] },
            },
          ],
        },
      ],
    });
    expect(result.ok).toBe(false);
    // Zod v4 always surfaces `invalid_union` at the element level for non-discriminated
    // unions — the MULTIPLE_EFFECT_SOURCES domainCode lives inside the member's .check()
    // but is not propagated through the union wrapper.  The path is still precise.
    const err = result.errors.find((e) => e.code === 'SCHEMA_INVALID_UNION');
    expect(err?.path).toEqual(['interactions', 0, 'effects', 0]);
  });

  it('returns the parsed config on success', () => {
    const result = validateStructural(VALID_CONFIG);
    expect(result.parsed).toMatchObject({ interactions: expect.any(Array) });
  });

  it('exposes path information in errors', () => {
    const result = validateStructural({ interactions: 'bad' });
    expect(result.errors[0].path).toEqual(['interactions']);
  });

  it('emits SCHEMA_TOO_SMALL when condition predicate is an empty string', () => {
    const result = validateStructural({
      interactions: [],
      conditions: {
        'condition-id': {
          type: 'media',
          predicate: '',
        },
      },
    });
    expect(result.ok).toBe(false);
    const err = result.errors.find((e) => e.code === 'SCHEMA_TOO_SMALL');
    expect(err?.path).toEqual(['conditions', 'condition-id', 'predicate']);
  });
});
