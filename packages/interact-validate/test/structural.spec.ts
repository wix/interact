import { describe, expect, it } from 'vitest';
import { validateStructural } from '../src/structural';

const VALID_CONFIG = {
  interactions: [
    { key: 'el', trigger: 'viewEnter', effects: [{ namedEffect: { type: 'FadeIn' } }] },
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
    expect(result.errors.some((e) => e.code === 'SCHEMA_INVALID_TYPE')).toBe(true);
  });

  it('emits SCHEMA_INVALID_TYPE when interactions is not an array', () => {
    const result = validateStructural({ interactions: 'not-an-array' });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.code === 'SCHEMA_INVALID_TYPE')).toBe(true);
  });

  it('emits SCHEMA_UNRECOGNIZED_KEYS for an unknown root key', () => {
    const result = validateStructural({ ...VALID_CONFIG, unknownField: true });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.code === 'SCHEMA_UNRECOGNIZED_KEYS')).toBe(true);
  });

  it('emits SCHEMA_TOO_SMALL when interaction key is an empty string', () => {
    const result = validateStructural({
      interactions: [
        { key: '', trigger: 'viewEnter', effects: [{ namedEffect: { type: 'FadeIn' } }] },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.code === 'SCHEMA_TOO_SMALL')).toBe(true);
  });

  it('emits errors for an unrecognised trigger value', () => {
    const result = validateStructural({
      interactions: [
        { key: 'el', trigger: 'invalidTrigger', effects: [{ namedEffect: { type: 'FadeIn' } }] },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('emits SCHEMA_INVALID when an effect defines multiple sources', () => {
    const result = validateStructural({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [
            {
              namedEffect: { type: 'FadeIn' },
              keyframeEffect: { name: 'k', keyframes: [{ opacity: 0 }] },
            },
          ],
        },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.code === 'SCHEMA_INVALID')).toBe(true);
  });

  it('returns the parsed config on success', () => {
    const result = validateStructural(VALID_CONFIG);
    expect(result.parsed).toMatchObject({ interactions: expect.any(Array) });
  });

  it('exposes path information in errors', () => {
    const result = validateStructural({ interactions: 'bad' });
    expect(result.errors[0].path).toBeDefined();
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
    expect(result.errors.some((e) => e.code === 'SCHEMA_TOO_SMALL')).toBe(true);
  });
});
