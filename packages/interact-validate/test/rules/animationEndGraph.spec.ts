import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// B4 — animationEnd chaining graph. An animationEnd interaction "waits-for" its
// params.effectId; an interaction "produces" the effects it lists by effectId.
// - Self-reference (warning): the interaction waits for an effect it also produces → never starts.
// - Cycle (error): A waits B, B waits A, … → deadlock.
// Source: full-lean.md / integration.md animationEnd.

describe('animationEndGraph', () => {
  describe('ANIMATION_END_SELF_REFERENCE (warning)', () => {
    it('warns when an animationEnd interaction waits for an effect it produces itself', () => {
      const result = validateInteractConfig({
        effects: { pulse: { namedEffect: { type: 'Pulse' }, duration: 300 } },
        interactions: [
          {
            key: 'el',
            trigger: 'animationEnd',
            params: { effectId: 'pulse' },
            effects: [{ effectId: 'pulse' }],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'ANIMATION_END_SELF_REFERENCE');
      expect(err).toBeDefined();
      expect(err?.severity).toBe('warning');
      expect(err?.path).toEqual(['interactions', 0, 'params', 'effectId']);
      // self-reference is a warning, not a deadlock error
      expect(result.valid).toBe(true);
    });
  });

  describe('ANIMATION_END_CYCLE (error)', () => {
    it('errors when two animationEnd interactions wait on each other', () => {
      const result = validateInteractConfig({
        effects: {
          e1: { namedEffect: { type: 'Pulse' }, duration: 300 },
          e2: { namedEffect: { type: 'Spin' }, duration: 300 },
        },
        interactions: [
          {
            key: 'a',
            trigger: 'animationEnd',
            params: { effectId: 'e2' },
            effects: [{ effectId: 'e1' }],
          },
          {
            key: 'b',
            trigger: 'animationEnd',
            params: { effectId: 'e1' },
            effects: [{ effectId: 'e2' }],
          },
        ],
      });
      expect(result.valid).toBe(false);
      const errs = result.errors.filter((e) => e.code === 'ANIMATION_END_CYCLE');
      expect(errs.length).toBeGreaterThan(0);
      expect(errs.every((e) => e.severity === 'error')).toBe(true);
      expect(errs.some((e) => e.path.includes('params'))).toBe(true);
    });
  });

  describe('no graph issues for a valid chain', () => {
    it('does not flag an animationEnd waiting on an effect produced by a different trigger', () => {
      const result = validateInteractConfig({
        effects: { intro: { namedEffect: { type: 'FadeIn' }, duration: 300 } },
        interactions: [
          { key: 'b', trigger: 'viewEnter', effects: [{ effectId: 'intro' }] },
          {
            key: 'a',
            trigger: 'animationEnd',
            params: { effectId: 'intro' },
            effects: [{ namedEffect: { type: 'Spin' }, duration: 300 }],
          },
        ],
      });
      const graphCodes = ['ANIMATION_END_SELF_REFERENCE', 'ANIMATION_END_CYCLE'];
      expect(result.errors.filter((e) => graphCodes.includes(e.code))).toHaveLength(0);
    });
  });
});
