import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

describe('unusedDefinitions', () => {
  it('emits no errors when all definitions are referenced', () => {
    const result = validateInteractConfig({
      effects: { fade: { namedEffect: { type: 'FadeIn' } } },
      sequences: { seq: { effects: [{ namedEffect: { type: 'SlideIn' }, duration: 400 }] } },
      conditions: { mq: { type: 'media', predicate: '(min-width: 768px)' } },
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          conditions: ['mq'],
          effects: [{ effectId: 'fade' }],
          sequences: [{ sequenceId: 'seq' }],
        },
      ],
    });
    const unusedCodes = ['UNUSED_EFFECT', 'UNUSED_SEQUENCE', 'UNUSED_CONDITION'];
    expect(result.errors.filter((e) => unusedCodes.includes(e.code))).toHaveLength(0);
  });

  describe('UNUSED_EFFECT', () => {
    it('emits UNUSED_EFFECT for a defined effect that no interaction references', () => {
      const result = validateInteractConfig({
        effects: { fade: { namedEffect: { type: 'FadeIn' } } },
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'SlideIn' }, duration: 400 }],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'UNUSED_EFFECT');
      expect(err).toBeDefined();
      expect(err?.severity).toBe('warning');
      expect(err?.path).toEqual(['effects', 'fade']);
    });

    it('does not emit UNUSED_EFFECT for an effect referenced via effectId', () => {
      const result = validateInteractConfig({
        effects: { fade: { namedEffect: { type: 'FadeIn' } } },
        interactions: [{ key: 'el', trigger: 'viewEnter', effects: [{ effectId: 'fade' }] }],
      });
      expect(result.errors.filter((e) => e.code === 'UNUSED_EFFECT')).toHaveLength(0);
    });

    it('does not emit UNUSED_EFFECT for an effect referenced inside a sequence', () => {
      const result = validateInteractConfig({
        effects: { fade: { namedEffect: { type: 'FadeIn' } } },
        sequences: { seq: { effects: [{ effectId: 'fade' }] } },
        interactions: [{ key: 'el', trigger: 'viewEnter', sequences: [{ sequenceId: 'seq' }] }],
      });
      expect(result.errors.filter((e) => e.code === 'UNUSED_EFFECT')).toHaveLength(0);
    });
  });

  describe('UNUSED_SEQUENCE', () => {
    it('emits UNUSED_SEQUENCE for a defined sequence that no interaction references', () => {
      const result = validateInteractConfig({
        sequences: { seq: { effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }] } },
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'SlideIn' }, duration: 400 }],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'UNUSED_SEQUENCE');
      expect(err).toBeDefined();
      expect(err?.severity).toBe('warning');
      expect(err?.path).toEqual(['sequences', 'seq']);
    });

    it('does not emit UNUSED_SEQUENCE for a sequence referenced via sequenceId', () => {
      const result = validateInteractConfig({
        sequences: { seq: { effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }] } },
        interactions: [{ key: 'el', trigger: 'viewEnter', sequences: [{ sequenceId: 'seq' }] }],
      });
      expect(result.errors.filter((e) => e.code === 'UNUSED_SEQUENCE')).toHaveLength(0);
    });
  });

  describe('UNUSED_CONDITION', () => {
    it('emits UNUSED_CONDITION for a defined condition that nothing references', () => {
      const result = validateInteractConfig({
        conditions: { mq: { type: 'media', predicate: '(min-width: 768px)' } },
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'UNUSED_CONDITION');
      expect(err).toBeDefined();
      expect(err?.severity).toBe('warning');
      expect(err?.path).toEqual(['conditions', 'mq']);
    });

    it('does not emit UNUSED_CONDITION when the condition is referenced by an interaction', () => {
      const result = validateInteractConfig({
        conditions: { mq: { type: 'media', predicate: '(min-width: 768px)' } },
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            conditions: ['mq'],
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === 'UNUSED_CONDITION')).toHaveLength(0);
    });

    it('does not emit UNUSED_CONDITION when the condition is referenced by an inline effect', () => {
      const result = validateInteractConfig({
        conditions: { mq: { type: 'media', predicate: '(min-width: 768px)' } },
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400, conditions: ['mq'] }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === 'UNUSED_CONDITION')).toHaveLength(0);
    });
  });
});
