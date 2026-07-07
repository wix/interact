import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// hover / click / activate / interest interactions accept BOTH time-based effects
// (keyframeEffect / namedEffect / customEffect with `triggerType`) and state effects
// (transition / transitionProperties with `stateAction`). See hover.md / click.md Rules 1–3.
// An effect that mixes `triggerType` and `stateAction` matches neither strict branch and is
// rejected (SCHEMA_INVALID_UNION).

describe('discrete trigger effects (hover/click/activate/interest)', () => {
  describe('time effects are accepted', () => {
    it('accepts a keyframeEffect TimeEffect with triggerType on hover', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            effects: [
              {
                // target a child via `selector` so the size/position transform does
                // not shift the hover hit area (see HIT_AREA_SHIFT).
                selector: '.inner',
                triggerType: 'alternate',
                duration: 200,
                fill: 'both',
                keyframeEffect: { name: 'lift', keyframes: [{ transform: 'translateY(-4px)' }] },
              },
            ],
          },
        ],
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts a namedEffect TimeEffect on click', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [
              {
                namedEffect: { type: 'Pulse' },
                duration: 300,
                triggerType: 'repeat',
                fill: 'both',
              },
            ],
          },
        ],
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts a customEffect TimeEffect on interest', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'interest',
            effects: [{ customEffect: () => {}, duration: 150 }],
          },
        ],
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts a TimeEffectRef (effectId) on activate', () => {
      const result = validateInteractConfig({
        effects: {
          pop: { namedEffect: { type: 'Pulse' }, duration: 300 },
        },
        interactions: [{ key: 'el', trigger: 'activate', effects: [{ effectId: 'pop' }] }],
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('state effects remain accepted', () => {
    it('accepts a transition StateEffect with stateAction on hover', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            effects: [
              {
                stateAction: 'toggle',
                transition: {
                  duration: 200,
                  styleProperties: [{ name: 'backgroundColor', value: 'red' }],
                },
              },
            ],
          },
        ],
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('mixing triggerType and stateAction is rejected', () => {
    it('rejects an effect that sets both triggerType and stateAction', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            effects: [
              {
                triggerType: 'alternate',
                stateAction: 'toggle',
                duration: 200,
                keyframeEffect: { name: 'x', keyframes: [{ opacity: 1 }] },
              },
            ],
          },
        ],
      });
      expect(result.valid).toBe(false);
      const err = result.errors.find((e) => e.path[2] === 'effects');
      expect(err?.path).toEqual(['interactions', 0, 'effects', 0]);
    });
  });
});
