import { describe, it, expect } from 'vitest';
import { validateCompatibility } from '../src/validate/compatibilityValidator';
import type { InteractConfig } from '../src/types';

function makeConfig(interactions: any[], effects: Record<string, any> = {}): InteractConfig {
  return { effects, interactions };
}

describe('validateCompatibility', () => {
  // ── Core trigger-effect pairing ────────────────────────────────────────

  it('passes for time effect on time trigger', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'a',
          trigger: 'viewEnter',
          effects: [{ keyframeEffect: { name: 'x', keyframes: [{}] }, duration: 500 }],
        },
      ]),
    );
    expect(result.valid).toBe(true);
  });

  it('passes for scrub effect on scrub trigger', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'a',
          trigger: 'viewProgress',
          effects: [
            {
              keyframeEffect: { name: 'x', keyframes: [{}] },
              rangeStart: { name: 'entry' },
              rangeEnd: { name: 'cover' },
            },
          ],
        },
      ]),
    );
    expect(result.valid).toBe(true);
  });

  it('passes for state effect on state trigger', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'a',
          trigger: 'hover',
          effects: [{ transition: { styleProperties: [{ name: 'color', value: 'red' }] } }],
        },
      ]),
    );
    expect(result.valid).toBe(true);
  });

  it('errors for time effect on scrub trigger', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'a',
          trigger: 'viewProgress',
          effects: [{ keyframeEffect: { name: 'x', keyframes: [{}] }, duration: 500 }],
        },
      ]),
    );
    expect(result.errors.some((e) => e.rule === 'time-on-non-time-trigger')).toBe(true);
  });

  it('errors for scrub effect on time-only trigger', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'a',
          trigger: 'viewEnter',
          effects: [
            {
              keyframeEffect: { name: 'x', keyframes: [{}] },
              rangeStart: { name: 'entry' },
              rangeEnd: { name: 'cover' },
            },
          ],
        },
      ]),
    );
    expect(result.errors.some((e) => e.rule === 'scrub-on-non-scrub-trigger')).toBe(true);
  });

  it('errors for state effect on non-state trigger (viewEnter)', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'a',
          trigger: 'viewEnter',
          effects: [{ transition: { styleProperties: [{ name: 'color', value: 'red' }] } }],
        },
      ]),
    );
    expect(result.errors.some((e) => e.rule === 'state-on-non-state-trigger')).toBe(true);
  });

  it('errors for state effect on non-state trigger (viewProgress)', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'a',
          trigger: 'viewProgress',
          effects: [{ transition: { styleProperties: [{ name: 'opacity', value: '1' }] } }],
        },
      ]),
    );
    expect(result.errors.some((e) => e.rule === 'state-on-non-state-trigger')).toBe(true);
  });

  it('accepts time effect on hover (also time-capable)', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'x',
          trigger: 'hover',
          effects: [{ keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] }, duration: 500 }],
        },
      ]),
    );
    expect(result.valid).toBe(true);
  });

  // ── triggerType / stateAction rules ─────────────────────────────────────

  it('warns on triggerType:state with non-state effect', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'a',
          trigger: 'hover',
          effects: [
            { keyframeEffect: { name: 'x', keyframes: [{}] }, duration: 500, triggerType: 'state' },
          ],
        },
      ]),
    );
    expect(result.warnings.some((w) => w.rule === 'triggerType-state-mismatch')).toBe(true);
  });

  it('errors when both triggerType and stateAction on same effect', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'a',
          trigger: 'hover',
          effects: [
            {
              transition: { styleProperties: [{ name: 'x', value: 'y' }] },
              triggerType: 'once',
              stateAction: 'toggle',
            },
          ],
        },
      ]),
    );
    expect(result.errors.some((e) => e.rule === 'triggerType-stateAction-mixed')).toBe(true);
  });

  // ── Sequence rules ─────────────────────────────────────────────────────

  it('warns on triggerType inside sequence effects', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'a',
          trigger: 'viewEnter',
          sequences: [
            {
              effects: [
                {
                  keyframeEffect: { name: 'x', keyframes: [{}] },
                  duration: 500,
                  triggerType: 'once',
                },
              ],
            },
          ],
        },
      ]),
    );
    expect(result.warnings.some((w) => w.rule === 'sequence-effect-triggerType')).toBe(true);
  });

  // ── animationEnd ────────────────────────────────────────────────────────

  it('warns when animationEnd params.effectId references non-time effect', () => {
    const result = validateCompatibility(
      makeConfig([{ key: 'a', trigger: 'animationEnd', params: { effectId: 'stateEff' } }], {
        stateEff: { transition: { styleProperties: [{ name: 'x', value: 'y' }] } },
      }),
    );
    expect(result.warnings.some((w) => w.rule === 'animationEnd-non-time-effect')).toBe(true);
  });

  // ── effectId resolution ─────────────────────────────────────────────────

  it('resolves effectId through config.effects for compatibility check', () => {
    const result = validateCompatibility(
      makeConfig([{ key: 'a', trigger: 'viewProgress', effects: [{ effectId: 'scroll' }] }], {
        scroll: {
          keyframeEffect: { name: 'x', keyframes: [{}] },
          rangeStart: { name: 'entry' },
          rangeEnd: { name: 'cover' },
        },
      }),
    );
    expect(result.valid).toBe(true);
  });

  // ── Property affinity (moved from configValidator) ─────────────────────

  it('warns when triggerType appears on scrub effect', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'x',
          trigger: 'viewProgress',
          effects: [
            {
              keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] },
              rangeStart: { name: 'entry' },
              rangeEnd: { name: 'cover' },
              triggerType: 'once',
            },
          ],
        },
      ]),
    );
    expect(result.warnings.some((w) => w.rule === 'triggerType-affinity')).toBe(true);
  });

  it('warns when transitionEasing appears on non-scrub effect', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'x',
          trigger: 'hover',
          effects: [
            {
              keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] },
              duration: 500,
              transitionEasing: 'linear',
            },
          ],
        },
      ]),
    );
    expect(result.warnings.some((w) => w.rule === 'transitionEasing-affinity')).toBe(true);
  });

  it('warns when stateAction appears on animation effect', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'x',
          trigger: 'hover',
          effects: [
            {
              keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] },
              duration: 500,
              stateAction: 'toggle',
            },
          ],
        },
      ]),
    );
    expect(result.warnings.some((w) => w.rule === 'stateAction-affinity')).toBe(true);
  });

  it('warns when duration appears on scrub effect', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'x',
          trigger: 'viewProgress',
          effects: [
            {
              keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] },
              rangeStart: { name: 'entry' },
              rangeEnd: { name: 'cover' },
              duration: 500,
            },
          ],
        },
      ]),
    );
    expect(result.warnings.some((w) => w.rule === 'duration-on-scrub')).toBe(true);
  });

  // ── viewProgress range warnings (moved from configValidator) ──────────

  it('warns when viewProgress effect is missing rangeStart/rangeEnd', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'x',
          trigger: 'viewProgress',
          effects: [{ keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] } }],
        },
      ]),
    );
    expect(result.warnings.some((w) => w.rule === 'range-start-missing')).toBe(true);
    expect(result.warnings.some((w) => w.rule === 'range-end-missing')).toBe(true);
  });

  // ── namedEffect scroll preset range warning (moved from configValidator)

  it('warns when scroll namedEffect in viewProgress has no range property', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'x',
          trigger: 'viewProgress',
          effects: [
            {
              namedEffect: { type: 'FadeScroll' },
              rangeStart: { name: 'entry' },
              rangeEnd: { name: 'cover' },
            },
          ],
        },
      ]),
    );
    expect(result.warnings.some((w) => w.rule === 'named-scroll-range')).toBe(true);
  });

  it('accepts scroll namedEffect with range property', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'x',
          trigger: 'viewProgress',
          effects: [
            {
              namedEffect: { type: 'FadeScroll', range: 'in' },
              rangeStart: { name: 'entry' },
              rangeEnd: { name: 'cover' },
            },
          ],
        },
      ]),
    );
    expect(result.warnings.filter((w) => w.rule === 'named-scroll-range')).toHaveLength(0);
  });

  // ── duration-required for time effects (moved from configValidator) ────

  it('errors when time effect is missing duration', () => {
    const result = validateCompatibility(
      makeConfig([
        {
          key: 'x',
          trigger: 'hover',
          effects: [{ keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] } }],
        },
      ]),
    );
    expect(result.errors.some((e) => e.rule === 'duration-required')).toBe(true);
  });
});
