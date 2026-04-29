import { describe, it, expect } from 'vitest';
import { validateIntegration } from '../src/validate/integrationValidator';
import type { InteractArtifact, HtmlMetadata, SetupMetadata } from '../src/types';

function makeArtifact(overrides?: Partial<InteractArtifact>): InteractArtifact {
  return {
    config: {
      effects: {
        fadeIn: {
          keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
          duration: 500,
        } as any,
      },
      interactions: [
        { key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'fadeIn' }] } as any,
      ],
    },
    sourceType: 'separated',
    confidence: 'high',
    htmlMeta: {
      keys: ['hero'],
      initials: {},
      interactElements: [],
    },
    setupMeta: {
      hasGenerate: false,
      hasDestroy: true,
      hasA11yTriggers: false,
      hasRegisterEffects: false,
      registerBeforeCreate: undefined,
      setupBeforeCreate: undefined,
    },
    ...overrides,
  };
}

describe('validateIntegration', () => {
  it('passes for a well-formed artifact', () => {
    const result = validateIntegration(makeArtifact());
    expect(result.valid).toBe(true);
  });

  it('errors when config key has no matching HTML element', () => {
    const result = validateIntegration(
      makeArtifact({
        htmlMeta: { keys: [], initials: {}, interactElements: [] },
      }),
    );
    expect(result.errors.some((e) => e.rule === 'key-missing-in-html')).toBe(true);
  });

  it('errors when registerEffects is missing but namedEffect is used', () => {
    const artifact = makeArtifact({
      config: {
        effects: { entrance: { namedEffect: { type: 'FadeIn' }, duration: 500 } as any },
        interactions: [
          { key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'entrance' }] } as any,
        ],
      },
      setupMeta: {
        hasRegisterEffects: false,
        hasDestroy: true,
        hasA11yTriggers: false,
      },
    });
    const result = validateIntegration(artifact);
    expect(result.errors.some((e) => e.rule === 'register-effects-missing')).toBe(true);
  });

  it('errors when registerEffects is called after Interact.create', () => {
    const artifact = makeArtifact({
      config: {
        effects: { entrance: { namedEffect: { type: 'FadeIn' }, duration: 500 } as any },
        interactions: [
          { key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'entrance' }] } as any,
        ],
      },
      setupMeta: {
        hasRegisterEffects: true,
        registerBeforeCreate: false,
        hasDestroy: true,
        hasA11yTriggers: false,
      },
    });
    const result = validateIntegration(artifact);
    expect(result.errors.some((e) => e.rule === 'register-effects-order')).toBe(true);
  });

  it('warns when destroy is missing', () => {
    const artifact = makeArtifact({
      setupMeta: {
        hasDestroy: false,
        hasRegisterEffects: false,
        hasA11yTriggers: false,
      },
    });
    const result = validateIntegration(artifact);
    expect(result.warnings.some((w) => w.rule === 'missing-destroy')).toBe(true);
  });

  it('errors when activate/interest trigger used without allowA11yTriggers', () => {
    const artifact = makeArtifact({
      config: {
        effects: {
          fadeIn: {
            keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] },
            duration: 500,
          } as any,
        },
        interactions: [
          { key: 'hero', trigger: 'activate', effects: [{ effectId: 'fadeIn' }] } as any,
        ],
      },
      setupMeta: {
        hasA11yTriggers: false,
        hasDestroy: true,
        hasRegisterEffects: false,
      },
    });
    const result = validateIntegration(artifact);
    expect(result.errors.some((e) => e.rule === 'missing-a11y-triggers')).toBe(true);
  });

  it('warns on click without activate', () => {
    const artifact = makeArtifact({
      config: {
        effects: {
          fadeIn: {
            keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] },
            duration: 500,
          } as any,
        },
        interactions: [{ key: 'btn', trigger: 'click', effects: [{ effectId: 'fadeIn' }] } as any],
      },
      htmlMeta: { keys: ['btn'], initials: {}, interactElements: [] },
    });
    const result = validateIntegration(artifact);
    expect(result.warnings.some((w) => w.rule === 'click-without-activate')).toBe(true);
  });

  it('warns on hover without interest', () => {
    const artifact = makeArtifact({
      config: {
        effects: {
          fadeIn: {
            keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] },
            duration: 500,
          } as any,
        },
        interactions: [{ key: 'card', trigger: 'hover', effects: [{ effectId: 'fadeIn' }] } as any],
      },
      htmlMeta: { keys: ['card'], initials: {}, interactElements: [] },
    });
    const result = validateIntegration(artifact);
    expect(result.warnings.some((w) => w.rule === 'hover-without-interest')).toBe(true);
  });

  it('errors when <interact-element> has no child', () => {
    const artifact = makeArtifact({
      htmlMeta: {
        keys: ['hero'],
        initials: {},
        interactElements: [{ key: 'hero', hasChild: false }],
      },
      framework: 'web',
    });
    const result = validateIntegration(artifact);
    expect(result.errors.some((e) => e.rule === 'interact-element-no-child')).toBe(true);
  });

  it('passes when <interact-element> has a child', () => {
    const artifact = makeArtifact({
      htmlMeta: {
        keys: ['hero'],
        initials: {},
        interactElements: [{ key: 'hero', hasChild: true }],
      },
      framework: 'web',
    });
    const result = validateIntegration(artifact);
    expect(result.errors.filter((e) => e.rule === 'interact-element-no-child')).toHaveLength(0);
  });

  it('errors on setup called after create', () => {
    const artifact = makeArtifact({
      setupMeta: {
        setupBeforeCreate: false,
        hasDestroy: true,
        hasRegisterEffects: false,
        hasA11yTriggers: false,
      },
    });
    const result = validateIntegration(artifact);
    expect(result.errors.some((e) => e.rule === 'setup-order')).toBe(true);
  });

  it('skips setup checks and emits info when setupMeta is unavailable', () => {
    const artifact = makeArtifact({
      config: {
        effects: { entrance: { namedEffect: { type: 'FadeIn' }, duration: 500 } as any },
        interactions: [
          { key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'entrance' }] } as any,
        ],
      },
      setupMeta: undefined,
    });
    const result = validateIntegration(artifact);
    expect(result.errors.filter((e) => e.rule === 'register-effects-missing')).toHaveLength(0);
    expect(result.infos.some((i) => i.rule === 'setup-meta-unavailable')).toBe(true);
  });

  it('skips HTML checks and emits info when htmlMeta is unavailable', () => {
    const artifact = makeArtifact({
      htmlMeta: undefined,
    });
    const result = validateIntegration(artifact);
    expect(result.errors.filter((e) => e.rule === 'key-missing-in-html')).toHaveLength(0);
    expect(result.infos.some((i) => i.rule === 'html-meta-unavailable')).toBe(true);
  });

  it('FOUC: errors when initial present but generate missing', () => {
    const artifact = makeArtifact({
      htmlMeta: {
        keys: ['hero'],
        initials: { hero: true },
        interactElements: [],
      },
      setupMeta: {
        hasGenerate: false,
        hasDestroy: true,
        hasRegisterEffects: false,
        hasA11yTriggers: false,
      },
    });
    const result = validateIntegration(artifact);
    expect(result.errors.some((e) => e.rule === 'fouc-missing-generate')).toBe(true);
  });

  it('FOUC: warns when generate present but initial missing', () => {
    const artifact = makeArtifact({
      htmlMeta: {
        keys: ['hero'],
        initials: {},
        interactElements: [],
      },
      setupMeta: {
        hasGenerate: true,
        hasDestroy: true,
        hasRegisterEffects: false,
        hasA11yTriggers: false,
      },
    });
    const result = validateIntegration(artifact);
    expect(result.warnings.some((w) => w.rule === 'fouc-missing-initial')).toBe(true);
  });
});
