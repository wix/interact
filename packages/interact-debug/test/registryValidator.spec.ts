import { describe, it, expect } from 'vitest';
import { validateRegistry } from '../src/validate/registryValidator';
import type { InteractArtifact } from '../src/types';

function makeArtifact(config: any, registeredEffects?: string[]): InteractArtifact {
  return {
    config,
    html: '<div data-interact-key="hero">Hello</div>',
    sourceType: 'separated',
    registeredEffects,
  };
}

describe('validateRegistry', () => {
  it('passes when namedEffect is a known preset and registered', () => {
    const result = validateRegistry(makeArtifact(
      {
        effects: { entrance: { namedEffect: { type: 'FadeIn' }, duration: 500 } },
        interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'entrance' }] }],
      },
      ['FadeIn'],
    ));
    expect(result.valid).toBe(true);
  });

  it('errors when namedEffect is unknown and not registered', () => {
    const result = validateRegistry(makeArtifact(
      {
        effects: {},
        interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ namedEffect: { type: 'CustomThing' }, duration: 500 }] }],
      },
      [],
    ));
    expect(result.errors.some((e) => e.rule === 'unknown-named-effect')).toBe(true);
  });

  it('errors when namedEffect is a known preset but not registered', () => {
    const result = validateRegistry(makeArtifact(
      {
        effects: { entrance: { namedEffect: { type: 'SlideIn' }, duration: 500 } },
        interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'entrance' }] }],
      },
      [],
    ));
    expect(result.errors.some((e) => e.rule === 'preset-not-registered')).toBe(true);
  });

  it('passes when namedEffect is custom but registered', () => {
    const result = validateRegistry(makeArtifact(
      {
        effects: {},
        interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ namedEffect: { type: 'MyCustomEffect' }, duration: 500 }] }],
      },
      ['MyCustomEffect'],
    ));
    expect(result.valid).toBe(true);
  });

  it('validates namedEffects inside sequences', () => {
    const result = validateRegistry(makeArtifact(
      {
        effects: {},
        interactions: [
          {
            key: 'hero', trigger: 'viewEnter',
            sequences: [{ effects: [{ namedEffect: { type: 'BounceIn' }, duration: 500 }] }],
          },
        ],
      },
      [],
    ));
    expect(result.errors.some((e) => e.rule === 'preset-not-registered')).toBe(true);
  });

  it('resolves effectId to check namedEffect in base', () => {
    const result = validateRegistry(makeArtifact(
      {
        effects: { eff: { namedEffect: { type: 'SpinIn' }, duration: 500 } },
        interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'eff' }] }],
      },
      ['SpinIn'],
    ));
    expect(result.valid).toBe(true);
  });

  it('validates all preset categories', () => {
    // Test one from each category
    for (const type of ['FadeIn', 'Bounce', 'FadeScroll', 'TrackMouse', 'BgZoom']) {
      const result = validateRegistry(makeArtifact(
        {
          effects: {},
          interactions: [{ key: 'a', trigger: 'viewEnter', effects: [{ namedEffect: { type }, duration: 500 }] }],
        },
        [type],
      ));
      expect(result.valid).toBe(true);
    }
  });
});
