import { describe, it, expect } from 'vitest';
import { scoreComplexity } from '../src/score/complexityScorer';
import { scoreWeight } from '../src/score/weightScorer';
import { scoreA11y } from '../src/score/a11yScorer';
import { scoreCoherence } from '../src/score/coherenceScorer';
import { scoreBestPractices } from '../src/score/bestPracticesScorer';
import { scoreValidation } from '../src/score/validationScorer';
import { scoreConfig, scoreArtifact } from '../src/score/aggregate';
import { validateAll } from '../src/validate';
import type { InteractArtifact, InteractConfig, ValidationResult } from '../src/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function simpleConfig(overrides?: Partial<InteractConfig>): InteractConfig {
  return {
    effects: {
      fadeIn: {
        keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
        duration: 500,
      },
    },
    interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'fadeIn' }] }],
    ...overrides,
  } as InteractConfig;
}

function simpleArtifact(overrides?: Partial<InteractArtifact>): InteractArtifact {
  return {
    config: simpleConfig(),
    sourceType: 'separated',
    confidence: 'high',
    htmlMeta: { keys: ['hero'], initials: { hero: true }, interactElements: [] },
    setupMeta: {
      hasGenerate: true,
      hasDestroy: true,
      hasRegisterEffects: false,
      hasA11yTriggers: false,
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// scoreComplexity
// ---------------------------------------------------------------------------

describe('scoreComplexity', () => {
  it('scores a simple config near 1.0', () => {
    const result = scoreComplexity(simpleConfig());
    expect(result.dimension).toBe('complexity');
    expect(result.score).toBeGreaterThan(0.8);
    expect(result.subscores).toBeDefined();
  });

  it('penalizes many interactions', () => {
    const interactions = Array.from({ length: 25 }, (_, i) => ({
      key: `k${i}`,
      trigger: 'viewEnter' as const,
      effects: [{ effectId: 'fadeIn' }],
    }));
    const result = scoreComplexity(simpleConfig({ interactions } as any));
    const ixSub = result.subscores!.find((s) => s.dimension === 'interactionCount');
    expect(ixSub!.score).toBeLessThan(1);
  });

  it('penalizes many effects per interaction', () => {
    const effects = Array.from({ length: 10 }, (_, i) => ({
      keyframeEffect: { name: `e${i}`, keyframes: [{ opacity: 0 }] },
      duration: 100,
    }));
    const result = scoreComplexity(
      simpleConfig({
        interactions: [{ key: 'hero', trigger: 'viewEnter', effects }],
      } as any),
    );
    const effSub = result.subscores!.find((s) => s.dimension === 'effectsPerInteraction');
    expect(effSub!.score).toBeLessThan(1);
  });

  it('respects scope filtering', () => {
    const config = simpleConfig({
      interactions: [
        { key: 'a', trigger: 'viewEnter', effects: [{ effectId: 'fadeIn' }] },
        { key: 'b', trigger: 'hover', effects: [{ effectId: 'fadeIn' }] },
      ],
    } as any);
    const full = scoreComplexity(config);
    const scoped = scoreComplexity(config, { key: 'a' });
    expect(scoped.subscores!.find((s) => s.dimension === 'interactionCount')!.details).toContain(
      '1 interactions',
    );
  });
});

// ---------------------------------------------------------------------------
// scoreWeight
// ---------------------------------------------------------------------------

describe('scoreWeight', () => {
  it('scores a simple config near 1.0', () => {
    const result = scoreWeight(simpleConfig());
    expect(result.dimension).toBe('weight');
    expect(result.score).toBeGreaterThan(0.8);
  });

  it('penalizes layout-triggering properties', () => {
    const config = simpleConfig({
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          effects: [
            {
              keyframeEffect: {
                name: 'resize',
                keyframes: [{ width: '100px' }, { width: '200px' }],
              },
              duration: 500,
            },
          ],
        },
      ],
    } as any);
    const result = scoreWeight(config);
    const compositorSub = result.subscores!.find((s) => s.dimension === 'compositorFriendly');
    expect(compositorSub!.score).toBeLessThan(1);
  });

  it('rewards compositor-only properties', () => {
    const config = simpleConfig({
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          effects: [
            {
              keyframeEffect: {
                name: 'fadeMove',
                keyframes: [
                  { opacity: 0, transform: 'translateY(20px)' },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
              },
              duration: 500,
            },
          ],
        },
      ],
    } as any);
    const result = scoreWeight(config);
    const compositorSub = result.subscores!.find((s) => s.dimension === 'compositorFriendly');
    expect(compositorSub!.score).toBe(1);
  });

  it('penalizes very long total duration', () => {
    const effects = Array.from({ length: 5 }, (_, i) => ({
      keyframeEffect: { name: `e${i}`, keyframes: [{ opacity: 0 }] },
      duration: 5000,
    }));
    const result = scoreWeight(
      simpleConfig({
        interactions: [{ key: 'hero', trigger: 'viewEnter', effects }],
      } as any),
    );
    const durSub = result.subscores!.find((s) => s.dimension === 'totalDuration');
    expect(durSub!.score).toBeLessThan(1);
  });
});

// ---------------------------------------------------------------------------
// scoreA11y
// ---------------------------------------------------------------------------

describe('scoreA11y', () => {
  it('gives full score when activate is used instead of click', () => {
    const artifact = simpleArtifact({
      config: simpleConfig({
        interactions: [
          { key: 'btn', trigger: 'activate', effects: [{ effectId: 'fadeIn' }] },
          { key: 'card', trigger: 'interest', effects: [{ effectId: 'fadeIn' }] },
        ],
      } as any),
      htmlMeta: { keys: ['btn', 'card'], initials: {}, interactElements: [] },
      setupMeta: { hasA11yTriggers: true, hasDestroy: true, hasRegisterEffects: false },
    });
    const result = scoreA11y(artifact);
    expect(result.dimension).toBe('a11y');
    const activateSub = result.subscores!.find((s) => s.dimension === 'clickActivatePairing');
    expect(activateSub!.score).toBe(1);
    const interestSub = result.subscores!.find((s) => s.dimension === 'hoverInterestPairing');
    expect(interestSub!.score).toBe(1);
  });

  it('penalizes click (should use activate instead)', () => {
    const artifact = simpleArtifact({
      config: simpleConfig({
        interactions: [{ key: 'btn', trigger: 'click', effects: [{ effectId: 'fadeIn' }] }],
      } as any),
      htmlMeta: { keys: ['btn'], initials: {}, interactElements: [] },
    });
    const result = scoreA11y(artifact);
    const activateSub = result.subscores!.find((s) => s.dimension === 'clickActivatePairing');
    expect(activateSub!.score).toBe(0);
  });

  it('gives partial score when both click and activate are used (redundant but not wrong)', () => {
    const artifact = simpleArtifact({
      config: simpleConfig({
        interactions: [
          { key: 'btn', trigger: 'click', effects: [{ effectId: 'fadeIn' }] },
          { key: 'btn', trigger: 'activate', effects: [{ effectId: 'fadeIn' }] },
        ],
      } as any),
      htmlMeta: { keys: ['btn'], initials: {}, interactElements: [] },
      setupMeta: { hasA11yTriggers: true, hasDestroy: true, hasRegisterEffects: false },
    });
    const result = scoreA11y(artifact);
    const activateSub = result.subscores!.find((s) => s.dimension === 'clickActivatePairing');
    expect(activateSub!.score).toBe(0.5);
  });

  it('rewards prefers-reduced-motion condition', () => {
    const artifact = simpleArtifact({
      config: simpleConfig({
        conditions: {
          reducedMotion: { type: 'media', predicate: '(prefers-reduced-motion: reduce)' },
        },
      } as any),
    });
    const result = scoreA11y(artifact);
    const rmSub = result.subscores!.find((s) => s.dimension === 'reducedMotion');
    expect(rmSub!.score).toBe(1);
  });

  it('penalizes missing prefers-reduced-motion', () => {
    const result = scoreA11y(simpleArtifact());
    const rmSub = result.subscores!.find((s) => s.dimension === 'reducedMotion');
    expect(rmSub!.score).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// scoreCoherence
// ---------------------------------------------------------------------------

describe('scoreCoherence', () => {
  it('scores high when entrance preset is on viewEnter', () => {
    const config = simpleConfig({
      effects: { entrance: { namedEffect: { type: 'FadeIn' }, duration: 500 } },
      interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'entrance' }] }],
    } as any);
    const result = scoreCoherence(config);
    const affinitySub = result.subscores!.find((s) => s.dimension === 'presetTriggerAffinity');
    expect(affinitySub!.score).toBe(1);
  });

  it('scores high when scroll preset is on viewProgress', () => {
    const config = simpleConfig({
      effects: {
        scroll: {
          namedEffect: { type: 'FadeScroll' },
          rangeStart: { name: 'entry' },
          rangeEnd: { name: 'cover' },
        },
      },
      interactions: [{ key: 'hero', trigger: 'viewProgress', effects: [{ effectId: 'scroll' }] }],
    } as any);
    const result = scoreCoherence(config);
    const affinitySub = result.subscores!.find((s) => s.dimension === 'presetTriggerAffinity');
    expect(affinitySub!.score).toBe(1);
  });

  it('scores high when mouse preset is on pointerMove', () => {
    const config = simpleConfig({
      effects: { mouse: { namedEffect: { type: 'TrackMouse' } } },
      interactions: [{ key: 'hero', trigger: 'pointerMove', effects: [{ effectId: 'mouse' }] }],
    } as any);
    const result = scoreCoherence(config);
    const affinitySub = result.subscores!.find((s) => s.dimension === 'presetTriggerAffinity');
    expect(affinitySub!.score).toBe(1);
  });

  it('penalizes mismatched preset/trigger pairing', () => {
    const config = simpleConfig({
      effects: {
        entrance: {
          namedEffect: { type: 'FadeIn' },
          rangeStart: { name: 'entry' },
          rangeEnd: { name: 'cover' },
        },
      },
      interactions: [{ key: 'hero', trigger: 'viewProgress', effects: [{ effectId: 'entrance' }] }],
    } as any);
    const result = scoreCoherence(config);
    const affinitySub = result.subscores!.find((s) => s.dimension === 'presetTriggerAffinity');
    expect(affinitySub!.score).toBe(0);
  });

  it('penalizes wildly inconsistent durations', () => {
    const config = simpleConfig({
      interactions: [
        {
          key: 'a',
          trigger: 'viewEnter',
          effects: [{ keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] }, duration: 100 }],
        },
        {
          key: 'b',
          trigger: 'viewEnter',
          effects: [
            { keyframeEffect: { name: 'b', keyframes: [{ opacity: 0 }] }, duration: 10000 },
          ],
        },
      ],
    } as any);
    const result = scoreCoherence(config);
    const consistSub = result.subscores!.find((s) => s.dimension === 'durationEasingConsistency');
    expect(consistSub!.score).toBeLessThan(0.5);
  });

  it('gives full consistency score for same durations', () => {
    const config = simpleConfig({
      interactions: [
        {
          key: 'a',
          trigger: 'viewEnter',
          effects: [{ keyframeEffect: { name: 'a', keyframes: [{ opacity: 0 }] }, duration: 500 }],
        },
        {
          key: 'b',
          trigger: 'viewEnter',
          effects: [{ keyframeEffect: { name: 'b', keyframes: [{ opacity: 0 }] }, duration: 500 }],
        },
      ],
    } as any);
    const result = scoreCoherence(config);
    const consistSub = result.subscores!.find((s) => s.dimension === 'durationEasingConsistency');
    expect(consistSub!.score).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// scoreBestPractices
// ---------------------------------------------------------------------------

describe('scoreBestPractices', () => {
  it('gives high score for well-formed artifact', () => {
    const artifact = simpleArtifact();
    const result = scoreBestPractices(artifact);
    expect(result.dimension).toBe('bestPractices');
    expect(result.score).toBeGreaterThan(0.5);
  });

  it('penalizes anti-patterns', () => {
    const artifact = simpleArtifact({
      config: simpleConfig({
        interactions: [
          { key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'fadeIn' }] },
          { key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'fadeIn' }] },
        ],
      } as any),
    });
    const result = scoreBestPractices(artifact);
    const antiSub = result.subscores!.find((s) => s.dimension === 'antiPatterns');
    expect(antiSub!.score).toBeLessThan(1);
  });

  it('penalizes missing destroy', () => {
    const artifact = simpleArtifact({
      setupMeta: {
        hasGenerate: true,
        hasDestroy: false,
        hasRegisterEffects: false,
        hasA11yTriggers: false,
      },
    });
    const result = scoreBestPractices(artifact);
    const cleanupSub = result.subscores!.find((s) => s.dimension === 'cleanup');
    expect(cleanupSub!.score).toBeLessThan(1);
  });

  it('rewards complete FOUC prevention', () => {
    const artifact = simpleArtifact({
      htmlMeta: { keys: ['hero'], initials: { hero: true }, interactElements: [] },
      setupMeta: {
        hasGenerate: true,
        hasDestroy: true,
        hasRegisterEffects: false,
        hasA11yTriggers: false,
      },
    });
    const result = scoreBestPractices(artifact);
    const foucSub = result.subscores!.find((s) => s.dimension === 'foucPrevention');
    expect(foucSub!.score).toBe(1);
  });

  it('penalizes incomplete FOUC (missing generate)', () => {
    const artifact = simpleArtifact({
      htmlMeta: { keys: ['hero'], initials: { hero: true }, interactElements: [] },
      setupMeta: {
        hasGenerate: false,
        hasDestroy: true,
        hasRegisterEffects: false,
        hasA11yTriggers: false,
      },
    });
    const result = scoreBestPractices(artifact);
    const foucSub = result.subscores!.find((s) => s.dimension === 'foucPrevention');
    expect(foucSub!.score).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// scoreValidation
// ---------------------------------------------------------------------------

describe('scoreValidation', () => {
  it('gives full score for zero errors and warnings', () => {
    const result = scoreValidation({ valid: true, errors: [], warnings: [], infos: [] });
    expect(result.dimension).toBe('validation');
    expect(result.score).toBe(1);
  });

  it('penalizes errors', () => {
    const errors = Array.from({ length: 3 }, (_, i) => ({
      severity: 'error' as const,
      message: `err${i}`,
      path: [],
      rule: 'test',
    }));
    const result = scoreValidation({ valid: false, errors, warnings: [], infos: [] });
    expect(result.score).toBeLessThan(1);
    expect(result.score).toBeCloseTo(1 - 3 * 0.15, 5);
  });

  it('penalizes warnings', () => {
    const warnings = Array.from({ length: 4 }, (_, i) => ({
      severity: 'warning' as const,
      message: `warn${i}`,
      path: [],
      rule: 'test',
    }));
    const result = scoreValidation({ valid: true, errors: [], warnings, infos: [] });
    expect(result.score).toBeCloseTo(1 - 4 * 0.05, 5);
  });

  it('clamps score at 0', () => {
    const errors = Array.from({ length: 20 }, (_, i) => ({
      severity: 'error' as const,
      message: `err${i}`,
      path: [],
      rule: 'test',
    }));
    const result = scoreValidation({ valid: false, errors, warnings: [], infos: [] });
    expect(result.score).toBe(0);
  });

  it('works with validateAll output', () => {
    const artifact = simpleArtifact();
    const validation = validateAll(artifact);
    const result = scoreValidation(validation);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// scoreConfig (aggregate, config-only)
// ---------------------------------------------------------------------------

describe('scoreConfig', () => {
  it('returns a report with aggregate and dimensions', () => {
    const report = scoreConfig(simpleConfig());
    expect(report.aggregate).toBeGreaterThan(0);
    expect(report.aggregate).toBeLessThanOrEqual(1);
    expect(report.dimensions).toHaveLength(3);
    expect(report.dimensions.map((d) => d.dimension)).toEqual([
      'complexity',
      'weight',
      'coherence',
    ]);
  });

  it('aggregate is a weighted average of dimensions', () => {
    const report = scoreConfig(simpleConfig());
    let wSum = 0;
    let wTotal = 0;
    for (const d of report.dimensions) {
      wSum += d.score * d.weight;
      wTotal += d.weight;
    }
    expect(report.aggregate).toBeCloseTo(wSum / wTotal, 5);
  });
});

// ---------------------------------------------------------------------------
// scoreArtifact (aggregate, full artifact)
// ---------------------------------------------------------------------------

describe('scoreArtifact', () => {
  it('returns a report with 5 dimensions (no validation when not provided)', () => {
    const report = scoreArtifact(simpleArtifact());
    expect(report.dimensions).toHaveLength(5);
    const dims = report.dimensions.map((d) => d.dimension);
    expect(dims).toContain('complexity');
    expect(dims).toContain('weight');
    expect(dims).toContain('a11y');
    expect(dims).toContain('coherence');
    expect(dims).toContain('bestPractices');
  });

  it('returns 6 dimensions when validationResult is provided', () => {
    const artifact = simpleArtifact();
    const validation = validateAll(artifact);
    const report = scoreArtifact(artifact, undefined, validation);
    expect(report.dimensions).toHaveLength(6);
    const dims = report.dimensions.map((d) => d.dimension);
    expect(dims).toContain('validation');
  });

  it('aggregate is between 0 and 1', () => {
    const report = scoreArtifact(simpleArtifact());
    expect(report.aggregate).toBeGreaterThan(0);
    expect(report.aggregate).toBeLessThanOrEqual(1);
  });

  it('respects scope', () => {
    const artifact = simpleArtifact({
      config: simpleConfig({
        interactions: [
          { key: 'a', trigger: 'viewEnter', effects: [{ effectId: 'fadeIn' }] },
          { key: 'b', trigger: 'hover', effects: [{ effectId: 'fadeIn' }] },
        ],
      } as any),
      htmlMeta: { keys: ['a', 'b'], initials: {}, interactElements: [] },
    });
    const scoped = scoreArtifact(artifact, { key: 'a' });
    expect(scoped.aggregate).toBeDefined();
    expect(scoped.dimensions).toHaveLength(5);
  });

  it('well-formed artifact scores high', () => {
    const artifact = simpleArtifact({
      config: simpleConfig({
        conditions: {
          reducedMotion: { type: 'media', predicate: '(prefers-reduced-motion: reduce)' },
        },
      } as any),
    });
    const report = scoreArtifact(artifact);
    expect(report.aggregate).toBeGreaterThan(0.7);
  });

  it('validation errors lower the aggregate score', () => {
    const artifact = simpleArtifact();
    const noVal = scoreArtifact(artifact);

    const mockValidation: ValidationResult = {
      valid: false,
      errors: Array.from({ length: 5 }, (_, i) => ({
        severity: 'error' as const,
        message: `err${i}`,
        path: [],
        rule: 'test',
      })),
      warnings: [],
      infos: [],
    };
    const withVal = scoreArtifact(artifact, undefined, mockValidation);

    expect(withVal.aggregate).toBeLessThan(noVal.aggregate);
  });
});
