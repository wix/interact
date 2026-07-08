import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// C8 — a StateEffect whose transition.styleProperties (or transitionProperties) is [] toggles nothing.
// C9 — stateAction 'remove' with no effectId has nothing to pair with a matching 'add'.
// Source: hover.md / click.md Rule 2.

describe('stateEffectCoherence', () => {
  describe('EMPTY_STYLE_PROPERTIES (warning)', () => {
    it('warns for an empty transition.styleProperties array', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            effects: [{ stateAction: 'toggle', transition: { styleProperties: [] } }],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'EMPTY_STYLE_PROPERTIES');
      expect(err).toBeDefined();
      expect(err?.severity).toBe('warning');
      expect(err?.path).toEqual(['interactions', 0, 'effects', 0, 'transition', 'styleProperties']);
    });

    it('warns for an empty transitionProperties array', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [{ stateAction: 'toggle', transitionProperties: [] }],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'EMPTY_STYLE_PROPERTIES');
      expect(err).toBeDefined();
      expect(err?.path).toEqual(['interactions', 0, 'effects', 0, 'transitionProperties']);
    });

    it('does not warn when styleProperties has at least one entry', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            effects: [
              {
                stateAction: 'toggle',
                transition: { styleProperties: [{ name: 'backgroundColor', value: 'red' }] },
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === 'EMPTY_STYLE_PROPERTIES')).toHaveLength(0);
    });
  });

  describe('STATE_REMOVE_WITHOUT_EFFECT_ID (warning)', () => {
    it("warns for stateAction 'remove' with no effectId", () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                stateAction: 'remove',
                transition: { styleProperties: [{ name: 'opacity', value: '0' }] },
              },
            ],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'STATE_REMOVE_WITHOUT_EFFECT_ID');
      expect(err).toBeDefined();
      expect(err?.path).toEqual(['interactions', 0, 'effects', 0, 'stateAction']);
    });

    it("does not warn for stateAction 'remove' paired with an effectId", () => {
      const result = validateInteractConfig({
        effects: { hidden: { transition: { styleProperties: [{ name: 'opacity', value: '0' }] } } },
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [{ effectId: 'hidden', stateAction: 'remove' }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === 'STATE_REMOVE_WITHOUT_EFFECT_ID')).toHaveLength(
        0,
      );
    });

    it("does not warn for stateAction 'add'", () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                stateAction: 'add',
                transition: { styleProperties: [{ name: 'opacity', value: '0' }] },
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === 'STATE_REMOVE_WITHOUT_EFFECT_ID')).toHaveLength(
        0,
      );
    });
  });
});
