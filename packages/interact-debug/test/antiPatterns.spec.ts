import { describe, it, expect } from 'vitest';
import { detectAntiPatterns } from '../src/validate/antiPatterns';
import type { InteractArtifact } from '../src/types';

function makeArtifact(config: any): InteractArtifact {
  return {
    config,
    sourceType: 'separated',
    confidence: 'high',
  };
}

describe('detectAntiPatterns', () => {
  it('passes for a clean config', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {},
        interactions: [
          {
            key: 'hero',
            trigger: 'viewEnter',
            effects: [
              { keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] }, duration: 500 },
            ],
          },
        ],
      }),
    );
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('warns on duplicate key+trigger', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {},
        interactions: [
          {
            key: 'hero',
            trigger: 'viewEnter',
            effects: [{ keyframeEffect: { name: 'a', keyframes: [{}] }, duration: 500 }],
          },
          {
            key: 'hero',
            trigger: 'viewEnter',
            effects: [{ keyframeEffect: { name: 'b', keyframes: [{}] }, duration: 300 }],
          },
        ],
      }),
    );
    expect(result.warnings.some((w) => w.rule === 'duplicate-key-trigger')).toBe(true);
  });

  it('warns on viewEnter same-element with non-once triggerType', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {},
        interactions: [
          {
            key: 'hero',
            trigger: 'viewEnter',
            effects: [
              {
                keyframeEffect: { name: 'a', keyframes: [{}] },
                duration: 500,
                triggerType: 'repeat',
              },
            ],
          },
        ],
      }),
    );
    expect(result.warnings.some((w) => w.rule === 'viewEnter-same-element-non-once')).toBe(true);
  });

  it('does not warn on viewEnter non-once with separate target key', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {},
        interactions: [
          {
            key: 'source',
            trigger: 'viewEnter',
            effects: [
              {
                key: 'target',
                keyframeEffect: { name: 'a', keyframes: [{}] },
                duration: 500,
                triggerType: 'repeat',
              },
            ],
          },
        ],
      }),
    );
    expect(
      result.warnings.filter((w) => w.rule === 'viewEnter-same-element-non-once'),
    ).toHaveLength(0);
  });

  it('warns on hover layout-changing effect on same element', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {},
        interactions: [
          {
            key: 'btn',
            trigger: 'hover',
            effects: [
              {
                keyframeEffect: {
                  name: 'grow',
                  keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }],
                },
                duration: 300,
              },
            ],
          },
        ],
      }),
    );
    expect(result.warnings.some((w) => w.rule === 'hover-layout-same-element')).toBe(true);
  });

  it('does not warn on hover layout effect with selector', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {},
        interactions: [
          {
            key: 'btn',
            trigger: 'hover',
            effects: [
              {
                selector: '.inner',
                keyframeEffect: {
                  name: 'grow',
                  keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }],
                },
                duration: 300,
              },
            ],
          },
        ],
      }),
    );
    expect(result.warnings.filter((w) => w.rule === 'hover-layout-same-element')).toHaveLength(0);
  });

  it('warns on pointerMove hitArea:self with layout changes on same element', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {},
        interactions: [
          {
            key: 'card',
            trigger: 'pointerMove',
            params: { hitArea: 'self' },
            effects: [
              {
                keyframeEffect: {
                  name: 'tilt',
                  keyframes: [{ transform: 'translate(0px)' }, { transform: 'translate(10px)' }],
                },
              },
            ],
          },
        ],
      }),
    );
    expect(result.warnings.some((w) => w.rule === 'pointerMove-self-layout')).toBe(true);
  });

  it('warns on duration of 0', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {},
        interactions: [
          {
            key: 'a',
            trigger: 'hover',
            effects: [{ keyframeEffect: { name: 'x', keyframes: [{}] }, duration: 0 }],
          },
        ],
      }),
    );
    expect(result.warnings.some((w) => w.rule === 'duration-zero')).toBe(true);
  });

  it('warns on extreme duration (>10s)', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {},
        interactions: [
          {
            key: 'a',
            trigger: 'hover',
            effects: [{ keyframeEffect: { name: 'x', keyframes: [{}] }, duration: 15000 }],
          },
        ],
      }),
    );
    expect(result.warnings.some((w) => w.rule === 'duration-extreme')).toBe(true);
  });

  it('warns on viewEnter repeat without threshold', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {},
        interactions: [
          {
            key: 'hero',
            trigger: 'viewEnter',
            effects: [
              {
                keyframeEffect: { name: 'a', keyframes: [{}] },
                duration: 500,
                triggerType: 'repeat',
              },
            ],
          },
        ],
      }),
    );
    expect(result.warnings.some((w) => w.rule === 'viewEnter-repeat-no-threshold')).toBe(true);
  });

  it('does not warn on viewEnter repeat with threshold', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {},
        interactions: [
          {
            key: 'hero',
            trigger: 'viewEnter',
            params: { threshold: 0.5 },
            effects: [
              {
                keyframeEffect: { name: 'a', keyframes: [{}] },
                duration: 500,
                triggerType: 'repeat',
              },
            ],
          },
        ],
      }),
    );
    expect(result.warnings.filter((w) => w.rule === 'viewEnter-repeat-no-threshold')).toHaveLength(
      0,
    );
  });

  it('warns on inverted rangeStart/rangeEnd', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {},
        interactions: [
          {
            key: 'hero',
            trigger: 'viewProgress',
            effects: [
              {
                keyframeEffect: { name: 'x', keyframes: [{ opacity: 0 }] },
                rangeStart: { name: 'exit' },
                rangeEnd: { name: 'entry' },
              },
            ],
          },
        ],
      }),
    );
    expect(result.warnings.some((w) => w.rule === 'range-inverted')).toBe(true);
  });

  it('does not warn on correct range order', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {},
        interactions: [
          {
            key: 'hero',
            trigger: 'viewProgress',
            effects: [
              {
                keyframeEffect: { name: 'x', keyframes: [{ opacity: 0 }] },
                rangeStart: { name: 'entry' },
                rangeEnd: { name: 'cover' },
              },
            ],
          },
        ],
      }),
    );
    expect(result.warnings.filter((w) => w.rule === 'range-inverted')).toHaveLength(0);
  });

  it('resolves effectId for anti-pattern checks', () => {
    const result = detectAntiPatterns(
      makeArtifact({
        effects: {
          grow: {
            keyframeEffect: { name: 'grow', keyframes: [{ transform: 'scale(1.2)' }] },
            duration: 300,
          },
        },
        interactions: [{ key: 'btn', trigger: 'hover', effects: [{ effectId: 'grow' }] }],
      }),
    );
    expect(result.warnings.some((w) => w.rule === 'hover-layout-same-element')).toBe(true);
  });
});
