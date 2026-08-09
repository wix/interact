import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// A scrub interaction or effect gated on `(prefers-reduced-motion: reduce)` can never run:
// `generate()` gates the source's `view-timeline` on `no-preference` regardless of
// conditions, and the handlers early-return on `Interact.reducedMotion` regardless of conditions.

const CODE = 'REDUCE_GATED_SCRUB';

const REDUCE = { type: 'media' as const, predicate: '(prefers-reduced-motion: reduce)' };
const NO_PREFERENCE = {
  type: 'media' as const,
  predicate: '(prefers-reduced-motion: no-preference)',
};
const DESKTOP = { type: 'media' as const, predicate: '(min-width: 900px)' };

const scrubEffect = {
  keyframeEffect: { name: 'parallax', keyframes: [{ transform: 'translateY(0)' }] },
  fill: 'both' as const,
  rangeStart: { name: 'cover' as const },
  rangeEnd: { name: 'cover' as const },
};

describe('reduceGatedScrub — REDUCE_GATED_SCRUB', () => {
  it('warns for a viewProgress interaction gated on reduce', () => {
    const result = validateInteractConfig({
      conditions: { 'motion-reduced': REDUCE },
      interactions: [
        {
          key: 'hero',
          trigger: 'viewProgress',
          conditions: ['motion-reduced'],
          effects: [scrubEffect],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === CODE);
    expect(err).toBeDefined();
    expect(err?.severity).toBe('warning');
    expect(err?.path).toEqual(['interactions', 0, 'conditions', 0]);
    expect(err?.message).toContain('viewEnter');
  });

  it('warns for a pointerMove effect gated on reduce', () => {
    const result = validateInteractConfig({
      conditions: { calm: REDUCE },
      interactions: [
        {
          key: 'card',
          trigger: 'pointerMove',
          params: { hitArea: 'self' },
          effects: [
            {
              keyframeEffect: { name: 'tilt', keyframes: [{ transform: 'rotate(2deg)' }] },
              fill: 'both',
              selector: '.inner',
              conditions: ['calm'],
            },
          ],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === CODE);
    expect(err).toBeDefined();
    expect(err?.path).toEqual(['interactions', 0, 'effects', 0, 'conditions', 0]);
  });

  it('points at the offending condition when it is not the first one', () => {
    const result = validateInteractConfig({
      conditions: { desktop: DESKTOP, 'motion-reduced': REDUCE },
      interactions: [
        {
          key: 'hero',
          trigger: 'viewProgress',
          conditions: ['desktop', 'motion-reduced'],
          effects: [scrubEffect],
        },
      ],
    });
    expect(result.errors.find((e) => e.code === CODE)?.path).toEqual([
      'interactions',
      0,
      'conditions',
      1,
    ]);
  });

  it('treats a bare `(prefers-reduced-motion)` predicate as gating on reduce', () => {
    const result = validateInteractConfig({
      conditions: { any: { type: 'media', predicate: '(prefers-reduced-motion)' } },
      interactions: [
        { key: 'hero', trigger: 'viewProgress', conditions: ['any'], effects: [scrubEffect] },
      ],
    });
    expect(result.errors.some((e) => e.code === CODE)).toBe(true);
  });

  it('resolves conditions from the referenced registry effect', () => {
    const result = validateInteractConfig({
      conditions: { 'motion-reduced': REDUCE },
      effects: { calmScroll: { ...scrubEffect, conditions: ['motion-reduced'] } },
      interactions: [
        { key: 'hero', trigger: 'viewProgress', effects: [{ effectId: 'calmScroll' }] },
      ],
    });
    expect(result.errors.some((e) => e.code === CODE)).toBe(true);
  });

  it('is silenceable and escalatable through the REDUCED_MOTION category', () => {
    const config = {
      conditions: { 'motion-reduced': REDUCE },
      interactions: [
        {
          key: 'hero',
          trigger: 'viewProgress',
          conditions: ['motion-reduced'],
          effects: [scrubEffect],
        },
      ],
    };
    expect(
      validateInteractConfig(config, {
        severityOverrides: { REDUCED_MOTION: 'off' },
      }).errors.filter((e) => e.code === CODE),
    ).toHaveLength(0);

    const escalated = validateInteractConfig(config, {
      severityOverrides: { REDUCED_MOTION: 'error' },
    });
    expect(escalated.errors.find((e) => e.code === CODE)?.severity).toBe('error');
    expect(escalated.valid).toBe(false);
  });

  describe('no warning for the documented valid patterns', () => {
    it('does not warn for a no-preference gate — redundant, not dead', () => {
      const result = validateInteractConfig({
        conditions: { 'motion-ok': NO_PREFERENCE },
        interactions: [
          {
            key: 'hero',
            trigger: 'viewProgress',
            conditions: ['motion-ok'],
            effects: [scrubEffect],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for a non-motion condition on a scrub', () => {
      const result = validateInteractConfig({
        conditions: { desktop: DESKTOP },
        interactions: [
          { key: 'hero', trigger: 'viewProgress', conditions: ['desktop'], effects: [scrubEffect] },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for a reduce gate on a time-based trigger — that is the supported pattern', () => {
      const result = validateInteractConfig({
        conditions: { 'motion-reduced': REDUCE },
        interactions: [
          {
            key: 'hero',
            trigger: 'viewEnter',
            conditions: ['motion-reduced'],
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400, fill: 'both' }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for a reduce condition on a `selector` condition', () => {
      const result = validateInteractConfig({
        conditions: {
          odd: { type: 'selector', predicate: ':nth-of-type(odd)' },
        },
        interactions: [
          { key: 'hero', trigger: 'viewProgress', conditions: ['odd'], effects: [scrubEffect] },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for a top-level registry effect whose trigger is unknown', () => {
      const result = validateInteractConfig({
        conditions: { 'motion-reduced': REDUCE },
        effects: { calm: { namedEffect: { type: 'FadeIn' }, conditions: ['motion-reduced'] } },
        interactions: [
          { key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'calm', fill: 'both' }] },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });
  });
});
