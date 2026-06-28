import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// Trigger-effect compatibility is enforced structurally by the Zod discriminated-union
// schemas: each trigger type uses a strict effect schema that only allows the fields
// appropriate for that trigger.  The old TRIGGER_EFFECT_INCOMPATIBLE warning code is
// therefore never emitted; instead, incompatible field combinations fail schema
// validation (SCHEMA_INVALID_UNION / SCHEMA_UNRECOGNIZED_KEYS / SCHEMA_INVALID).
// The error is always anchored at the effect element:
//   path = ['interactions', interactionIndex, 'effects', effectIndex]

describe('triggerEffectCompatible', () => {
  describe('valid combinations', () => {
    it('emits no errors for a time effect on a discrete trigger', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400, delay: 100 }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === 'TRIGGER_EFFECT_INCOMPATIBLE')).toHaveLength(0);
    });

    it('emits no errors for a scrub effect on a viewProgress trigger', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [{ namedEffect: { type: 'FadeIn' }, rangeStart: { name: 'entry' } }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === 'TRIGGER_EFFECT_INCOMPATIBLE')).toHaveLength(0);
    });

    it('emits no errors for a scrub effect on a pointerMove trigger', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'pointerMove',
            effects: [{ namedEffect: { type: 'ParallaxMove' }, rangeEnd: { name: 'exit' } }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === 'TRIGGER_EFFECT_INCOMPATIBLE')).toHaveLength(0);
    });
  });

  describe('time fields on scrub trigger (structurally rejected by strict schema)', () => {
    it('rejects duration on viewProgress (schema does not allow time fields here)', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 500 }],
          },
        ],
      });
      expect(result.valid).toBe(false);
      const err = result.errors.find((e) => e.path[2] === 'effects');
      expect(err?.path).toEqual(['interactions', 0, 'effects', 0]);
    });

    it('rejects delay on pointerMove (schema does not allow time fields here)', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'pointerMove',
            effects: [{ namedEffect: { type: 'FadeIn' }, delay: 200 }],
          },
        ],
      });
      expect(result.valid).toBe(false);
      const err = result.errors.find((e) => e.path[2] === 'effects');
      expect(err?.path).toEqual(['interactions', 0, 'effects', 0]);
    });
  });

  describe('state fields on scrub trigger (structurally rejected by strict schema)', () => {
    it('rejects stateAction on viewProgress (schema does not allow state fields here)', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [{ stateAction: 'add' }],
          },
        ],
      });
      expect(result.valid).toBe(false);
      const err = result.errors.find((e) => e.path[2] === 'effects');
      expect(err?.path).toEqual(['interactions', 0, 'effects', 0]);
    });
  });

  describe('scrub fields on discrete trigger (structurally rejected by strict schema)', () => {
    it('rejects rangeStart on viewEnter (schema does not allow scrub fields here)', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'FadeIn' }, rangeStart: { name: 'entry' } }],
          },
        ],
      });
      expect(result.valid).toBe(false);
      const err = result.errors.find((e) => e.path[2] === 'effects');
      expect(err?.path).toEqual(['interactions', 0, 'effects', 0]);
    });

    it('rejects transitionDuration on click (schema does not allow scrub fields here)', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [{ namedEffect: { type: 'FadeIn' }, transitionDuration: 300 }],
          },
        ],
      });
      expect(result.valid).toBe(false);
      const err = result.errors.find((e) => e.path[2] === 'effects');
      expect(err?.path).toEqual(['interactions', 0, 'effects', 0]);
    });
  });
});
