import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// CSS property names may be camelCase or kebab-case (Interact normalizes either
// form); only names that are neither are reported. Source: every trigger rule.

const CODE = 'INVALID_CSS_PROPERTY_NAME';

function validateKeyframeProperty(property: string, value: string = 'red') {
  return validateInteractConfig({
    interactions: [
      {
        key: 'el',
        trigger: 'viewEnter',
        effects: [
          {
            duration: 400,
            keyframeEffect: { name: 'kf', keyframes: [{ [property]: value }] },
          },
        ],
      },
    ],
  });
}

function validateStyleProperty(name: string) {
  return validateInteractConfig({
    interactions: [
      {
        key: 'el',
        trigger: 'hover',
        effects: [
          {
            transition: { duration: 200, styleProperties: [{ name, value: 'red' }] },
          },
        ],
      },
    ],
  });
}

describe('cssSyntax — INVALID_CSS_PROPERTY_NAME', () => {
  it('warns for a keyframe property that is neither camelCase nor kebab-case', () => {
    const result = validateKeyframeProperty('background-Color');
    const err = result.errors.find((e) => e.code === CODE);

    expect(err).toBeDefined();
    expect(err?.severity).toBe('warning');
    expect(err?.path).toEqual([
      'interactions',
      0,
      'effects',
      0,
      'keyframeEffect',
      'keyframes',
      0,
      'background-Color',
    ]);
    expect(err?.message).toContain('background-Color');
  });

  it('warns for a state-effect style property that is neither casing', () => {
    const result = validateStyleProperty('BackgroundColor');
    const err = result.errors.find((e) => e.code === CODE);

    expect(err).toBeDefined();
    expect(err?.severity).toBe('warning');
    expect(err?.path).toEqual([
      'interactions',
      0,
      'effects',
      0,
      'transition',
      'styleProperties',
      0,
      'name',
    ]);
  });

  it('warns for a `transitionProperties` name that is neither casing', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'hover',
          effects: [
            {
              transitionProperties: [{ name: 'Background Color', value: 'red', duration: 200 }],
            },
          ],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === CODE);

    expect(err).toBeDefined();
    expect(err?.path).toEqual(['interactions', 0, 'effects', 0, 'transitionProperties', 0, 'name']);
  });

  describe('no warning for the documented valid patterns', () => {
    // `valid` must be asserted alongside the missing warning: a structural (zod) rejection
    // skips the semantic layer entirely, which would also produce zero INVALID_CSS_PROPERTY_NAME
    // issues - and would mean the casing was never accepted in the first place.
    function expectAccepted(result: ReturnType<typeof validateInteractConfig>) {
      expect(result.errors.filter((e) => e.code.startsWith('SCHEMA_'))).toEqual([]);
      expect(result.valid).toBe(true);
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    }

    it('does not warn for a camelCase keyframe property', () => {
      expectAccepted(validateKeyframeProperty('backgroundColor'));
    });

    it('does not warn for a kebab-case keyframe property', () => {
      expectAccepted(validateKeyframeProperty('background-color'));
    });

    it('does not warn for a vendor-prefixed keyframe property in either casing', () => {
      expectAccepted(validateKeyframeProperty('-webkit-text-stroke', '1px red'));
      expectAccepted(validateKeyframeProperty('webkitTextStroke', '1px red'));
    });

    it('does not warn for WAAPI keyframe keywords', () => {
      expectAccepted(
        validateInteractConfig({
          interactions: [
            {
              key: 'el',
              trigger: 'viewEnter',
              effects: [
                {
                  duration: 400,
                  keyframeEffect: {
                    name: 'kf',
                    keyframes: [{ opacity: 0, offset: 0, easing: 'ease-in', composite: 'add' }],
                  },
                },
              ],
            },
          ],
        }),
      );
    });

    it('does not warn for a CSS custom property (--*) in either shape', () => {
      expectAccepted(validateKeyframeProperty('--my-var', '1'));
      expectAccepted(validateKeyframeProperty('--myVar', '1'));
      expectAccepted(validateStyleProperty('--myVar'));
    });

    it('does not warn for camelCase or kebab-case style properties', () => {
      expectAccepted(validateStyleProperty('backgroundColor'));
      expectAccepted(validateStyleProperty('background-color'));
    });
  });
});
