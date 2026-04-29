import { describe, it, expect } from 'vitest';
import { validateSchema } from '../src/validate/configValidator';

function validConfig(overrides?: Record<string, unknown>) {
  return {
    effects: {
      fadeIn: {
        keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
        duration: 500,
      },
    },
    interactions: [
      {
        key: 'hero',
        trigger: 'viewEnter',
        effects: [{ effectId: 'fadeIn' }],
      },
    ],
    ...overrides,
  };
}

describe('validateSchema', () => {
  // ── Happy path ──────────────────────────────────────────────────────────

  it('accepts a minimal valid config', () => {
    const result = validateSchema(validConfig());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts config with conditions', () => {
    const result = validateSchema(
      validConfig({
        conditions: {
          desktop: { type: 'media', predicate: '(min-width: 1024px)' },
        },
      }),
    );
    expect(result.valid).toBe(true);
  });

  it('accepts config with state effects on state-capable trigger', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'btn',
          trigger: 'hover',
          effects: [
            {
              transition: {
                duration: 200,
                styleProperties: [{ name: 'background', value: 'red' }],
              },
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it('accepts config with scrub effects (rangeStart/rangeEnd, no duration)', () => {
    const result = validateSchema({
      effects: {
        scroll: {
          keyframeEffect: {
            name: 'move',
            keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(100px)' }],
          },
          rangeStart: { name: 'entry' },
          rangeEnd: { name: 'cover' },
        },
      },
      interactions: [
        {
          key: 'panel',
          trigger: 'viewProgress',
          effects: [{ effectId: 'scroll' }],
        },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it('accepts config with namedEffect', () => {
    const result = validateSchema({
      effects: {
        entrance: {
          namedEffect: { type: 'FadeIn' },
          duration: 800,
        },
      },
      interactions: [
        {
          key: 'card',
          trigger: 'viewEnter',
          effects: [{ effectId: 'entrance' }],
        },
      ],
    });
    expect(result.valid).toBe(true);
  });

  // ── Top-level shape errors ──────────────────────────────────────────────

  it('rejects non-object config', () => {
    const result = validateSchema('not an object');
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe('config-type');
  });

  it('rejects config with array effects', () => {
    const result = validateSchema({
      effects: [],
      interactions: [
        {
          key: 'a',
          trigger: 'hover',
          effects: [{ transition: { styleProperties: [{ name: 'x', value: 'y' }] } }],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'effects-not-array')).toBe(true);
  });

  it('rejects config with missing interactions', () => {
    const result = validateSchema({ effects: {} });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'interactions-type')).toBe(true);
  });

  it('rejects config with empty interactions array', () => {
    const result = validateSchema({ effects: {}, interactions: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'interactions-empty')).toBe(true);
  });

  // ── Interaction-level errors ────────────────────────────────────────────

  it('rejects interaction without key', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          trigger: 'hover',
          effects: [{ transition: { styleProperties: [{ name: 'x', value: 'y' }] } }],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'interaction-key')).toBe(true);
  });

  it('rejects interaction with empty key', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: '',
          trigger: 'hover',
          effects: [{ transition: { styleProperties: [{ name: 'x', value: 'y' }] } }],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'interaction-key')).toBe(true);
  });

  it('rejects interaction with invalid trigger', () => {
    const result = validateSchema({
      effects: {},
      interactions: [{ key: 'x', trigger: 'scroll', effects: [] }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'interaction-trigger')).toBe(true);
  });

  it('warns when interaction has neither effects nor sequences (#3)', () => {
    const result = validateSchema({
      effects: {},
      interactions: [{ key: 'x', trigger: 'hover' }],
    });
    expect(result.warnings.some((w) => w.rule === 'interaction-no-effects')).toBe(true);
  });

  // ── Effect resolution ──────────────────────────────────────────────────

  it('resolves EffectRef by merging with config.effects base', () => {
    const result = validateSchema(validConfig());
    expect(result.valid).toBe(true);
  });

  it('allows EffectRef to override properties from base', () => {
    const result = validateSchema({
      effects: {
        base: {
          keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
          duration: 500,
        },
      },
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          effects: [{ effectId: 'base', duration: 800, fill: 'forwards' }],
        },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it('flags ambiguity when EffectRef adds a different effectProperty than base', () => {
    const result = validateSchema({
      effects: {
        base: {
          keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
          duration: 500,
        },
      },
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          effects: [{ effectId: 'base', namedEffect: { type: 'FadeIn' } }],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'effect-property-exclusive')).toBe(true);
  });

  it('allows partial base in config.effects completed by inline override', () => {
    const result = validateSchema({
      effects: { shared: { duration: 600, fill: 'forwards' } },
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          effects: [
            {
              effectId: 'shared',
              keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it('errors when resolved EffectRef still has no effect property', () => {
    const result = validateSchema({
      effects: { empty: { duration: 500 } },
      interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'empty' }] }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'effect-property')).toBe(true);
  });

  it('errors when effectId references non-existent effect and inline has no property', () => {
    const result = validateSchema({
      effects: {},
      interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'missing' }] }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'effect-property')).toBe(true);
  });

  // ── Effect shape errors ─────────────────────────────────────────────────

  it('rejects effect with multiple animation properties', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'hover',
          effects: [
            {
              keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] },
              namedEffect: { type: 'FadeIn' },
              duration: 500,
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'effect-property-exclusive')).toBe(true);
  });

  it('rejects effect mixing keyframe with transition', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'hover',
          effects: [
            {
              keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] },
              transition: { styleProperties: [{ name: 'color', value: 'red' }] },
              duration: 500,
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'effect-mixed-types')).toBe(true);
  });

  it('rejects effect with both transition and transitionProperties', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'hover',
          effects: [
            {
              transition: { styleProperties: [{ name: 'color', value: 'red' }] },
              transitionProperties: [{ name: 'color', value: 'blue' }],
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'state-exclusive')).toBe(true);
  });

  it('rejects time effect with non-positive duration', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'hover',
          effects: [{ keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] }, duration: -100 }],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'duration-positive')).toBe(true);
  });

  it('rejects keyframeEffect with missing name', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'hover',
          effects: [{ keyframeEffect: { keyframes: [{ opacity: 0 }] }, duration: 500 }],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'keyframe-name')).toBe(true);
  });

  it('rejects keyframeEffect with empty name (#7)', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'hover',
          effects: [{ keyframeEffect: { name: '', keyframes: [{ opacity: 0 }] }, duration: 500 }],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'keyframe-name-empty')).toBe(true);
  });

  it('rejects keyframeEffect with empty keyframes', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'hover',
          effects: [{ keyframeEffect: { name: 'x', keyframes: [] }, duration: 500 }],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'keyframe-keyframes')).toBe(true);
  });

  it('rejects namedEffect without type', () => {
    const result = validateSchema({
      effects: {},
      interactions: [{ key: 'x', trigger: 'hover', effects: [{ namedEffect: {}, duration: 500 }] }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'named-effect-type')).toBe(true);
  });

  // ── triggerType / fill / stateAction enums ──────────────────────────────

  it('rejects invalid triggerType value', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'hover',
          effects: [
            {
              keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] },
              duration: 500,
              triggerType: 'loop',
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'trigger-type-value')).toBe(true);
  });

  it('rejects invalid fill value', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'hover',
          effects: [
            {
              keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] },
              duration: 500,
              fill: 'auto',
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'fill-value')).toBe(true);
  });

  it('rejects invalid stateAction', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'btn',
          trigger: 'click',
          effects: [
            {
              stateAction: 'flip',
              transition: { styleProperties: [{ name: 'color', value: 'blue' }] },
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'state-action-value')).toBe(true);
  });

  // ── rangeOffset validation ─────────────────────────────────────────────

  it('rejects invalid rangeStart name', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'viewProgress',
          effects: [
            {
              keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] },
              rangeStart: { name: 'start' },
              rangeEnd: { name: 'cover' },
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'range-name-value')).toBe(true);
  });

  it('validates rangeOffset offset object shape', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'viewProgress',
          effects: [
            {
              keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] },
              rangeStart: { name: 'entry', offset: { value: 'bad', unit: 'percentage' } },
              rangeEnd: { name: 'cover' },
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'range-offset-value')).toBe(true);
  });

  // ── Conditions definition shape ────────────────────────────────────────

  it('rejects invalid condition type', () => {
    const result = validateSchema(validConfig({ conditions: { bad: { type: 'viewport' } } }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'condition-type-value')).toBe(true);
  });

  // ── Params validation (#2) ────────────────────────────────────────────

  it('requires params for animationEnd even when undefined', () => {
    const result = validateSchema({
      effects: {},
      interactions: [{ key: 'x', trigger: 'animationEnd' }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'params-required')).toBe(true);
  });

  it('requires effectId in animationEnd params', () => {
    const result = validateSchema({
      effects: {},
      interactions: [{ key: 'x', trigger: 'animationEnd', params: {} }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'param-effect-id-required')).toBe(true);
  });

  it('rejects invalid hitArea in pointerMove params', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'pointerMove',
          params: { hitArea: 'page' },
          effects: [
            {
              keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] },
              rangeStart: { name: 'cover' },
              rangeEnd: { name: 'cover' },
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'param-hit-area')).toBe(true);
  });

  it('rejects invalid axis in pointerMove params', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'pointerMove',
          params: { axis: 'z' },
          effects: [
            {
              keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] },
              rangeStart: { name: 'cover' },
              rangeEnd: { name: 'cover' },
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'param-axis')).toBe(true);
  });

  it('rejects invalid threshold type in viewEnter params', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'x',
          trigger: 'viewEnter',
          params: { threshold: 'high' },
          effects: [{ effectId: 'fadeIn' }],
        },
      ],
    });
    expect(result.errors.some((e) => e.rule === 'param-threshold')).toBe(true);
  });

  // ── Scope filtering ───────────────────────────────────────────────────

  it('filters validation to a specific interaction index', () => {
    const result = validateSchema(
      {
        effects: {},
        interactions: [
          { key: 'a', trigger: 'badTrigger', effects: [] },
          {
            key: 'b',
            trigger: 'hover',
            effects: [{ transition: { styleProperties: [{ name: 'x', value: 'y' }] } }],
          },
        ],
      },
      { interactionIndex: 1 },
    );
    expect(result.valid).toBe(true);
  });

  it('filters validation to a specific key', () => {
    const result = validateSchema(
      {
        effects: {},
        interactions: [
          { key: 'a', trigger: 'badTrigger', effects: [] },
          {
            key: 'b',
            trigger: 'hover',
            effects: [{ transition: { styleProperties: [{ name: 'x', value: 'y' }] } }],
          },
        ],
      },
      { key: 'b' },
    );
    expect(result.valid).toBe(true);
  });

  it('filters validation to a specific trigger type', () => {
    const result = validateSchema(
      {
        effects: {},
        interactions: [
          { key: 'a', trigger: 'badTrigger', effects: [] },
          {
            key: 'b',
            trigger: 'hover',
            effects: [{ transition: { styleProperties: [{ name: 'x', value: 'y' }] } }],
          },
        ],
      },
      { trigger: 'hover' },
    );
    expect(result.valid).toBe(true);
  });

  // ── Inline effects in interactions ─────────────────────────────────────

  it('validates inline effects within interactions', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          effects: [
            {
              keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
              duration: 500,
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(true);
  });

  // ── Sequences ──────────────────────────────────────────────────────────

  it('validates inline sequence effects', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          sequences: [
            {
              effects: [
                {
                  keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
                  duration: 500,
                },
              ],
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it('resolves SequenceConfigRef from config.sequences', () => {
    const result = validateSchema({
      effects: {},
      sequences: {
        entrance: {
          effects: [
            {
              keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
              duration: 500,
            },
          ],
        },
      },
      interactions: [
        { key: 'hero', trigger: 'viewEnter', sequences: [{ sequenceId: 'entrance' }] },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it('allows sequenceId to inherit props while overriding effects (#4)', () => {
    const result = validateSchema({
      effects: {},
      sequences: {
        base: {
          delay: 100,
          effects: [
            { keyframeEffect: { name: 'old', keyframes: [{ opacity: 0 }] }, duration: 300 },
          ],
        },
      },
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          sequences: [
            {
              sequenceId: 'base',
              effects: [
                {
                  keyframeEffect: { name: 'new', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
                  duration: 500,
                },
              ],
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it('validates effects inside sequences with resolution', () => {
    const result = validateSchema({
      effects: { shared: { duration: 500 } },
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          sequences: [
            {
              effects: [
                {
                  effectId: 'shared',
                  keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
                },
              ],
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it('validates sequence options', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          sequences: [
            {
              delay: 'bad',
              effects: [
                {
                  keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
                  duration: 500,
                },
              ],
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'sequence-delay')).toBe(true);
  });

  it('validates conditions shape inside sequences', () => {
    const result = validateSchema({
      effects: {},
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          sequences: [
            {
              conditions: [123],
              effects: [
                {
                  keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
                  duration: 500,
                },
              ],
            },
          ],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'condition-ref-type')).toBe(true);
  });
});
