import { describe, it, expect } from 'vitest';
import {
  inspectConfig,
  inspectInteraction,
  inspectEffect,
  inspectKey,
} from '../src/inspect/configInspector';
import type { InteractConfig } from '../src/types';

function makeConfig(overrides?: Partial<InteractConfig>): InteractConfig {
  return {
    effects: {
      fadeIn: {
        keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
        duration: 500,
      },
      grow: { namedEffect: { type: 'GrowScroll' } },
    } as any,
    interactions: [
      { key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'fadeIn' }] },
      { key: 'panel', trigger: 'viewProgress', effects: [{ effectId: 'grow' }] },
    ] as any,
    ...overrides,
  };
}

describe('inspectConfig', () => {
  it('returns correct counts and unique keys', () => {
    const summary = inspectConfig(makeConfig());
    expect(summary.interactionCount).toBe(2);
    expect(summary.effectCount).toBe(2);
    expect(summary.uniqueKeys).toContain('hero');
    expect(summary.uniqueKeys).toContain('panel');
    expect(summary.triggersUsed).toContain('viewEnter');
    expect(summary.triggersUsed).toContain('viewProgress');
  });

  it('detects named effects', () => {
    const summary = inspectConfig(makeConfig());
    expect(summary.hasNamedEffects).toBe(true);
  });

  it('detects state effects', () => {
    const summary = inspectConfig(
      makeConfig({
        effects: {} as any,
        interactions: [
          {
            key: 'btn',
            trigger: 'hover',
            effects: [{ transition: { styleProperties: [{ name: 'color', value: 'red' }] } }],
          },
        ] as any,
      }),
    );
    expect(summary.hasStateEffects).toBe(true);
  });

  it('detects cross-key edges', () => {
    const summary = inspectConfig(
      makeConfig({
        effects: {
          fadeIn: { keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] }, duration: 500 },
        } as any,
        interactions: [
          { key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'fadeIn', key: 'banner' }] },
        ] as any,
      }),
    );
    expect(summary.crossKeyEdges).toHaveLength(1);
    expect(summary.crossKeyEdges[0]).toEqual({
      sourceKey: 'hero',
      targetKey: 'banner',
      effectId: 'fadeIn',
    });
  });

  it('reports conditions and sequences counts', () => {
    const summary = inspectConfig(
      makeConfig({
        conditions: { desktop: { type: 'media' } },
        sequences: { entrance: { effects: [] } },
      } as any),
    );
    expect(summary.conditionCount).toBe(1);
    expect(summary.sequenceCount).toBe(1);
  });
});

describe('inspectInteraction', () => {
  it('returns null for out-of-bounds index', () => {
    expect(inspectInteraction(makeConfig(), 99)).toBeNull();
  });

  it('returns resolved effects for interaction', () => {
    const result = inspectInteraction(makeConfig(), 0);
    expect(result).not.toBeNull();
    expect(result!.key).toBe('hero');
    expect(result!.trigger).toBe('viewEnter');
    expect(result!.resolvedEffects).toHaveLength(1);
    expect(result!.resolvedEffects[0].kind).toBe('keyframe');
    expect(result!.resolvedEffects[0].effectId).toBe('fadeIn');
    expect(result!.resolvedEffects[0].properties).toContain('opacity');
  });

  it('resolves sequences', () => {
    const config = makeConfig({
      sequences: { seq: { effects: [{ effectId: 'fadeIn' }], delay: 100 } } as any,
      interactions: [
        { key: 'hero', trigger: 'viewEnter', sequences: [{ sequenceId: 'seq' }] },
      ] as any,
    });
    const result = inspectInteraction(config, 0);
    expect(result!.resolvedSequences).toHaveLength(1);
    expect(result!.resolvedSequences[0].sequenceId).toBe('seq');
    expect(result!.resolvedSequences[0].delay).toBe(100);
  });

  it('includes conditions', () => {
    const config = makeConfig({
      conditions: { desktop: { type: 'media' } },
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          conditions: ['desktop'],
          effects: [{ effectId: 'fadeIn' }],
        },
      ] as any,
    });
    const result = inspectInteraction(config, 0);
    expect(result!.conditions).toEqual(['desktop']);
  });
});

describe('inspectEffect', () => {
  it('returns null for unknown effect', () => {
    expect(inspectEffect(makeConfig(), 'nonexistent')).toBeNull();
  });

  it('returns usage and kind for a known effect', () => {
    const result = inspectEffect(makeConfig(), 'fadeIn');
    expect(result).not.toBeNull();
    expect(result!.effectId).toBe('fadeIn');
    expect(result!.kind).toBe('keyframe');
    expect(result!.referencedBy).toHaveLength(1);
    expect(result!.referencedBy[0].key).toBe('hero');
    expect(result!.referencedBy[0].context).toBe('effect');
  });

  it('detects usage within sequences', () => {
    const config = makeConfig({
      sequences: { seq: { effects: [{ effectId: 'fadeIn' }] } } as any,
      interactions: [
        { key: 'hero', trigger: 'viewEnter', sequences: [{ sequenceId: 'seq' }] },
      ] as any,
    });
    const result = inspectEffect(config, 'fadeIn');
    expect(result!.referencedBy).toHaveLength(1);
    expect(result!.referencedBy[0].context).toBe('sequence');
  });
});

describe('inspectKey', () => {
  it('finds interactions where key is source', () => {
    const result = inspectKey(makeConfig(), 'hero');
    expect(result.key).toBe('hero');
    expect(result.interactionsAsSource).toHaveLength(1);
    expect(result.interactionsAsSource[0].trigger).toBe('viewEnter');
  });

  it('finds interactions where key is target (cross-key)', () => {
    const config = makeConfig({
      effects: {
        fadeIn: { keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] }, duration: 500 },
      } as any,
      interactions: [
        { key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'fadeIn', key: 'banner' }] },
      ] as any,
    });
    const result = inspectKey(config, 'banner');
    expect(result.interactionsAsTarget).toHaveLength(1);
    expect(result.interactionsAsTarget[0].sourceKey).toBe('hero');
  });

  it('collects effectIds used for the key', () => {
    const result = inspectKey(makeConfig(), 'hero');
    expect(result.effectIds).toContain('fadeIn');
  });

  it('returns empty arrays for unknown key', () => {
    const result = inspectKey(makeConfig(), 'nonexistent');
    expect(result.interactionsAsSource).toHaveLength(0);
    expect(result.interactionsAsTarget).toHaveLength(0);
    expect(result.effectIds).toHaveLength(0);
  });
});
