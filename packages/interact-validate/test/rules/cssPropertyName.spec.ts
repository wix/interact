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
    it('does not warn for a camelCase keyframe property', () => {
      expect(
        validateKeyframeProperty('backgroundColor').errors.filter((e) => e.code === CODE),
      ).toHaveLength(0);
    });

    it('does not warn for a kebab-case keyframe property', () => {
      expect(
        validateKeyframeProperty('background-color').errors.filter((e) => e.code === CODE),
      ).toHaveLength(0);
    });

    it('does not warn for a vendor-prefixed keyframe property in either casing', () => {
      expect(
        validateKeyframeProperty('-webkit-text-stroke', '1px red').errors.filter(
          (e) => e.code === CODE,
        ),
      ).toHaveLength(0);
      expect(
        validateKeyframeProperty('webkitTextStroke', '1px red').errors.filter(
          (e) => e.code === CODE,
        ),
      ).toHaveLength(0);
    });

    it('does not warn for WAAPI keyframe keywords', () => {
      const result = validateInteractConfig({
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
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for a CSS custom property (--*) in either shape', () => {
      expect(
        validateKeyframeProperty('--my-var', '1').errors.filter((e) => e.code === CODE),
      ).toHaveLength(0);
      expect(
        validateKeyframeProperty('--myVar', '1').errors.filter((e) => e.code === CODE),
      ).toHaveLength(0);
      expect(validateStyleProperty('--myVar').errors.filter((e) => e.code === CODE)).toHaveLength(
        0,
      );
    });

    it('does not warn for camelCase or kebab-case style properties', () => {
      expect(
        validateStyleProperty('backgroundColor').errors.filter((e) => e.code === CODE),
      ).toHaveLength(0);
      expect(
        validateStyleProperty('background-color').errors.filter((e) => e.code === CODE),
      ).toHaveLength(0);
    });
  });
});
