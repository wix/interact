import { describe, expect, it } from 'vitest';
import { validateInteractConfig, assertValidInteractConfig, InteractValidationError } from '../src';

const VALID_CONFIG = {
  interactions: [
    {
      key: 'el',
      trigger: 'viewEnter',
      effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
    },
  ],
};

// Unused effects produce UNUSED_EFFECT warnings (via unusedDefinitions rule, rule.code = 'UNUSED_DEFINITION')
const CONFIG_WITH_WARNING = {
  effects: { unused: { namedEffect: { type: 'FadeIn' } } },
  interactions: [
    {
      key: 'el',
      trigger: 'viewEnter',
      effects: [{ namedEffect: { type: 'SlideIn' }, duration: 400 }],
    },
  ],
};

// Missing effectId reference → EFFECT_ID_NOT_FOUND (error)
const CONFIG_WITH_ERROR = {
  interactions: [{ key: 'el', trigger: 'viewEnter', effects: [{ effectId: 'missing' }] }],
};

describe('validateInteractConfig', () => {
  it('returns valid=true with no errors for a valid config', () => {
    const result = validateInteractConfig(VALID_CONFIG);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid=false for a config with structural errors', () => {
    const result = validateInteractConfig({ interactions: 'not-an-array' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('returns valid=true (warnings only) for a config with only warnings', () => {
    const result = validateInteractConfig(CONFIG_WITH_WARNING);
    expect(result.valid).toBe(true);
    expect(result.errors.some((e) => e.severity === 'warning')).toBe(true);
  });

  it('returns valid=false for a config with semantic errors', () => {
    const result = validateInteractConfig(CONFIG_WITH_ERROR);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'EFFECT_ID_NOT_FOUND')).toBe(true);
  });

  it('sorts errors by path lexicographically', () => {
    const config = {
      effects: {
        a: { namedEffect: { type: 'Foo' } },
        b: { namedEffect: { type: 'Bar' } },
      },
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [{ namedEffect: { type: 'Baz' }, duration: 400 }],
        },
      ],
    };
    const result = validateInteractConfig(config);
    const unusedErrors = result.errors.filter((e) => e.code === 'UNUSED_EFFECT');
    expect(unusedErrors).toHaveLength(2);
    expect(unusedErrors[0].path).toEqual(['effects', 'a']);
    expect(unusedErrors[1].path).toEqual(['effects', 'b']);
  });
});

describe('ValidateOptions', () => {
  it('strict promotes warnings to errors, making valid=false', () => {
    const result = validateInteractConfig(CONFIG_WITH_WARNING, { strict: true });
    expect(result.valid).toBe(false);
    expect(result.errors.every((e) => e.severity === 'error')).toBe(true);
  });

  it("severityOverrides with 'off' skips the rule entirely", () => {
    // 'UNUSED_DEFINITION' is the rule.code for the unusedDefinitions rule
    const result = validateInteractConfig(CONFIG_WITH_WARNING, {
      severityOverrides: { UNUSED_DEFINITION: 'off' },
    });
    expect(result.errors.filter((e) => e.code === 'UNUSED_EFFECT')).toHaveLength(0);
  });

  it("severityOverrides can promote a warning to 'error'", () => {
    const result = validateInteractConfig(CONFIG_WITH_WARNING, {
      severityOverrides: { UNUSED_DEFINITION: 'error' },
    });
    const unusedErr = result.errors.find((e) => e.code === 'UNUSED_EFFECT');
    expect(unusedErr?.severity).toBe('error');
  });

  it('max truncates the returned error list', () => {
    const config = {
      effects: {
        a: { namedEffect: { type: 'Foo' } },
        b: { namedEffect: { type: 'Bar' } },
        c: { namedEffect: { type: 'Baz' } },
      },
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [{ namedEffect: { type: 'Qux' }, duration: 400 }],
        },
      ],
    };
    const result = validateInteractConfig(config, { max: 1 });
    expect(result.errors).toHaveLength(1);
  });
});

describe('assertValidInteractConfig', () => {
  it('does not throw for a valid config', () => {
    expect(() => assertValidInteractConfig(VALID_CONFIG)).not.toThrow();
  });

  it('throws InteractValidationError for an invalid config', () => {
    expect(() => assertValidInteractConfig(CONFIG_WITH_ERROR)).toThrow(InteractValidationError);
  });

  it('thrown error carries the validation errors array', () => {
    try {
      assertValidInteractConfig(CONFIG_WITH_ERROR);
    } catch (e) {
      expect(e).toBeInstanceOf(InteractValidationError);
      expect((e as InteractValidationError).errors.length).toBeGreaterThan(0);
      expect((e as InteractValidationError).errors[0].code).toBe('EFFECT_ID_NOT_FOUND');
    }
  });

  it('narrows the type to InteractConfig after assertion', () => {
    const config: unknown = VALID_CONFIG;
    assertValidInteractConfig(config);
    // TypeScript now knows config: InteractConfig — no runtime assertion needed,
    // the fact that no throw occurred is the guarantee.
    expect(config).toBeDefined();
  });
});
