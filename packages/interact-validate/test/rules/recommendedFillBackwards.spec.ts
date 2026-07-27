import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

const CODE = 'RECOMMENDED_FILL_BACKWARDS';

describe('recommendedFillBackwards — RECOMMENDED_FILL_BACKWARDS', () => {
  it('warns for a viewEnter once effect that omits fill', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400, triggerType: 'once' }],
        },
      ],
    });

    const err = result.errors.find((e) => e.code === CODE);
    expect(err).toBeDefined();
    expect(err?.severity).toBe('info');
    expect(err?.path).toEqual(['interactions', 0, 'effects', 0, 'fill']);
    expect(result.valid).toBe(true);
  });

  it('warns for a viewEnter effect with implicit once triggerType', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
        },
      ],
    });

    expect(result.errors.some((e) => e.code === CODE)).toBe(true);
  });

  it('warns for a viewEnter once keyframeEffect without fill', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [
            {
              keyframeEffect: { name: 'fade', keyframes: [{ opacity: '0' }, { opacity: '1' }] },
              duration: 400,
              delay: 200,
            },
          ],
        },
      ],
    });

    expect(result.errors.some((e) => e.code === CODE)).toBe(true);
  });

  it('warns for a viewEnter once sequence effect without fill', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          sequences: [
            {
              effects: [
                {
                  selector: '.card',
                  namedEffect: { type: 'FadeIn' },
                  duration: 400,
                },
              ],
            },
          ],
        },
      ],
    });

    expect(
      result.errors.some(
        (e) => e.code === CODE && e.path.join('.') === 'interactions.0.sequences.0.effects.0.fill',
      ),
    ).toBe(true);
  });

  describe('no warning for the documented valid patterns', () => {
    it('does not warn when fill: backwards is present', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [
              {
                fill: 'backwards',
                namedEffect: { type: 'FadeIn' },
                duration: 400,
                triggerType: 'once',
              },
            ],
          },
        ],
      });

      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn when fill: both is present', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [
              {
                fill: 'both',
                namedEffect: { type: 'FadeIn' },
                duration: 400,
                triggerType: 'once',
              },
            ],
          },
        ],
      });

      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for non-viewEnter triggers', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
          },
        ],
      });

      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for viewEnter repeat effects', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [
              {
                key: 'other',
                namedEffect: { type: 'FadeIn' },
                duration: 400,
                triggerType: 'repeat',
              },
            ],
          },
        ],
      });

      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });
  });
});
