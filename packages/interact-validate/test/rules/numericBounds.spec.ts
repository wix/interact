import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

describe('numericBounds', () => {
  describe('valid configs', () => {
    it('emits no numeric errors for non-negative effect fields', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400, delay: 0, iterations: 1 }],
          },
        ],
      });
      const numericCodes = [
        'NEGATIVE_DURATION',
        'NEGATIVE_DELAY',
        'NEGATIVE_ITERATIONS',
        'THRESHOLD_OUT_OF_RANGE',
        'NEGATIVE_OFFSET',
      ];
      expect(result.errors.filter((e) => numericCodes.includes(e.code))).toHaveLength(0);
    });

    it('emits no errors for a top-level effect with valid fields', () => {
      const result = validateInteractConfig({
        effects: { fade: { namedEffect: { type: 'FadeIn' }, duration: 600, delay: 50 } },
        interactions: [{ key: 'el', trigger: 'viewEnter', effects: [{ effectId: 'fade' }] }],
      });
      expect(result.errors.filter((e) => e.code === 'NEGATIVE_DURATION')).toHaveLength(0);
    });
  });

  describe('NEGATIVE_DURATION', () => {
    it('emits NEGATIVE_DURATION for a negative duration on an inline effect', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: -1 }],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'NEGATIVE_DURATION');
      expect(err).toBeDefined();
      expect(err?.severity).toBe('error');
      expect(err?.path).toContain('duration');
    });

    it('emits NEGATIVE_DURATION for a negative duration in a top-level effect definition', () => {
      const result = validateInteractConfig({
        effects: { fade: { namedEffect: { type: 'FadeIn' }, duration: -100 } },
        interactions: [{ key: 'el', trigger: 'viewEnter', effects: [{ effectId: 'fade' }] }],
      });
      expect(result.errors.some((e) => e.code === 'NEGATIVE_DURATION')).toBe(true);
    });
  });

  describe('NEGATIVE_DELAY', () => {
    it('emits NEGATIVE_DELAY for a negative delay on an inline effect', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400, delay: -50 }],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'NEGATIVE_DELAY');
      expect(err).toBeDefined();
      expect(err?.path).toContain('delay');
    });

    it('emits NEGATIVE_DELAY for a negative delay in a top-level sequence definition', () => {
      const result = validateInteractConfig({
        sequences: {
          seq: { effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }], delay: -10 },
        },
        interactions: [{ key: 'el', trigger: 'viewEnter', sequences: [{ sequenceId: 'seq' }] }],
      });
      expect(result.errors.some((e) => e.code === 'NEGATIVE_DELAY')).toBe(true);
    });
  });

  describe('NEGATIVE_ITERATIONS', () => {
    it('emits NEGATIVE_ITERATIONS for a negative iterations value', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400, iterations: -2 }],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'NEGATIVE_ITERATIONS');
      expect(err).toBeDefined();
      expect(err?.path).toContain('iterations');
    });
  });

  describe('iterations: Infinity', () => {
    it('allows iterations: Infinity on a time-based effect (continuous loop)', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [
              {
                namedEffect: { type: 'Pulse' },
                duration: 400,
                triggerType: 'state',
                iterations: Infinity,
              },
            ],
          },
        ],
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('allows iterations: 0 on a time-based effect (treated as Infinity at runtime)', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            effects: [
              { namedEffect: { type: 'Pulse' }, duration: 400, iterations: 0, fill: 'both' },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === 'NEGATIVE_ITERATIONS')).toHaveLength(0);
      expect(result.valid).toBe(true);
    });

    it('rejects iterations: Infinity on a scroll-driven (viewProgress) effect', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [
              {
                namedEffect: { type: 'FadeScroll', range: 'continuous' },
                rangeStart: { name: 'entry' },
                iterations: Infinity,
              },
            ],
          },
        ],
      });
      expect(result.valid).toBe(false);
      const err = result.errors.find((e) => e.code === 'ITERATIONS_INFINITY_ON_SCRUB');
      expect(err).toBeDefined();
      expect(err?.severity).toBe('error');
      expect(err?.path).toContain('iterations');
    });

    it('rejects iterations: Infinity on a pointerMove effect', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'pointerMove',
            effects: [{ namedEffect: { type: 'TrackMouse' }, iterations: Infinity }],
          },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'ITERATIONS_INFINITY_ON_SCRUB')).toBe(true);
    });
  });

  describe('NEGATIVE_OFFSET', () => {
    it('emits NEGATIVE_OFFSET for a negative offset on a top-level sequence', () => {
      const result = validateInteractConfig({
        sequences: {
          seq: { effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }], offset: -5 },
        },
        interactions: [{ key: 'el', trigger: 'viewEnter', sequences: [{ sequenceId: 'seq' }] }],
      });
      const err = result.errors.find((e) => e.code === 'NEGATIVE_OFFSET');
      expect(err).toBeDefined();
      expect(err?.path).toContain('offset');
    });
  });

  describe('THRESHOLD_OUT_OF_RANGE', () => {
    it('emits THRESHOLD_OUT_OF_RANGE for threshold > 1 on viewEnter', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            params: { threshold: 1.5 },
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
          },
        ],
      });
      const err = result.errors.find((e) => e.code === 'THRESHOLD_OUT_OF_RANGE');
      expect(err).toBeDefined();
      expect(err?.severity).toBe('error');
      expect(err?.path).toContain('threshold');
    });

    it('emits THRESHOLD_OUT_OF_RANGE for threshold < 0 on viewEnter', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            params: { threshold: -0.1 },
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
          },
        ],
      });
      expect(result.errors.some((e) => e.code === 'THRESHOLD_OUT_OF_RANGE')).toBe(true);
    });

    it('emits no errors for threshold = 0 and threshold = 1 (boundary values)', () => {
      for (const threshold of [0, 1]) {
        const result = validateInteractConfig({
          interactions: [
            {
              key: 'el',
              trigger: 'viewEnter',
              params: { threshold },
              effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
            },
          ],
        });
        expect(result.errors.filter((e) => e.code === 'THRESHOLD_OUT_OF_RANGE')).toHaveLength(0);
      }
    });
  });
});
