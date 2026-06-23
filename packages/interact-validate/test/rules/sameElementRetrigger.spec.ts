import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// A1 — viewEnter/pageVisible with a re-triggering triggerType ('repeat'/'alternate'/'state')
// on the SAME source+target element causes re-trigger loops (the observed element leaves/re-enters
// the viewport as it animates). Source: viewenter.md top CRITICAL + full-lean.md "viewEnter".

const CODE = 'SAME_ELEMENT_RETRIGGER';

describe('sameElementRetrigger — SAME_ELEMENT_RETRIGGER', () => {
  it('warns for a viewEnter effect with triggerType "alternate" targeting the source element', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400, triggerType: 'alternate' }],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === CODE);
    expect(err).toBeDefined();
    expect(err?.severity).toBe('warning');
    expect(err?.path).toEqual(['interactions', 0, 'effects', 0, 'triggerType']);
    // warnings never make a config invalid
    expect(result.valid).toBe(true);
  });

  it('warns for pageVisible with triggerType "state" on the same element', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'pageVisible',
          effects: [
            { namedEffect: { type: 'Pulse' }, duration: 400, triggerType: 'state', fill: 'both' },
          ],
        },
      ],
    });
    expect(result.errors.some((e) => e.code === CODE)).toBe(true);
  });

  it('warns for a viewEnter sequence with a non-once triggerType whose effects target the source', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          sequences: [
            { triggerType: 'repeat', effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }] },
          ],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === CODE);
    expect(err).toBeDefined();
    expect(err?.path).toEqual(['interactions', 0, 'sequences', 0, 'triggerType']);
  });

  describe('no warning for the documented valid patterns', () => {
    it('does not warn for triggerType "once" on the same element', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400, triggerType: 'once' }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn when the effect targets a separate element via key', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'source',
            trigger: 'viewEnter',
            effects: [
              {
                key: 'target',
                namedEffect: { type: 'FadeIn' },
                duration: 400,
                triggerType: 'alternate',
                fill: 'both',
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn when the effect targets a child via selector', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [
              {
                selector: '.child',
                namedEffect: { type: 'FadeIn' },
                duration: 400,
                triggerType: 'repeat',
                fill: 'both',
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });
  });
});
