import { describe, it, expect } from 'vitest';
import { validateIntegration } from '../src/validate/integrationValidator';
import type { InteractArtifact, InteractConfig } from '../src/types';

function makeArtifact(overrides?: Partial<InteractArtifact>): InteractArtifact {
  return {
    config: {
      effects: {
        fadeIn: { keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] }, duration: 500 } as any,
      },
      interactions: [
        { key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'fadeIn' }] } as any,
      ],
    },
    html: '<div data-interact-key="hero">Hello</div>',
    js: 'import { Interact } from "@wix/interact";\nInteract.create(config);\nInteract.destroy();',
    sourceType: 'separated',
    ...overrides,
  };
}

describe('validateIntegration', () => {
  it('passes for a well-formed artifact', () => {
    const result = validateIntegration(makeArtifact());
    expect(result.valid).toBe(true);
  });

  it('errors when config key has no matching HTML element', () => {
    const result = validateIntegration(makeArtifact({
      html: '<div>No interact keys here</div>',
    }));
    expect(result.errors.some((e) => e.rule === 'key-missing-in-html')).toBe(true);
  });

  it('errors when registerEffects is missing but namedEffect is used', () => {
    const artifact = makeArtifact({
      config: {
        effects: { entrance: { namedEffect: { type: 'FadeIn' }, duration: 500 } as any },
        interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'entrance' }] } as any],
      },
      js: 'import { Interact } from "@wix/interact";\nInteract.create(config);\nInteract.destroy();',
    });
    const result = validateIntegration(artifact);
    expect(result.errors.some((e) => e.rule === 'register-effects-missing')).toBe(true);
  });

  it('errors when registerEffects is called after Interact.create', () => {
    const artifact = makeArtifact({
      config: {
        effects: { entrance: { namedEffect: { type: 'FadeIn' }, duration: 500 } as any },
        interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'entrance' }] } as any],
      },
      js: 'Interact.create(config);\nregisterEffects({ FadeIn });\nInteract.destroy();',
    });
    const result = validateIntegration(artifact);
    expect(result.errors.some((e) => e.rule === 'register-effects-order')).toBe(true);
  });

  it('warns when destroy is missing', () => {
    const artifact = makeArtifact({
      js: 'import { Interact } from "@wix/interact";\nInteract.create(config);',
    });
    const result = validateIntegration(artifact);
    expect(result.warnings.some((w) => w.rule === 'missing-destroy')).toBe(true);
  });

  it('errors when activate/interest trigger used without allowA11yTriggers', () => {
    const artifact = makeArtifact({
      config: {
        effects: { fadeIn: { keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] }, duration: 500 } as any },
        interactions: [
          { key: 'hero', trigger: 'activate', effects: [{ effectId: 'fadeIn' }] } as any,
        ],
      },
      js: 'import { Interact } from "@wix/interact";\nInteract.create(config);\nInteract.destroy();',
    });
    const result = validateIntegration(artifact);
    expect(result.errors.some((e) => e.rule === 'missing-a11y-triggers')).toBe(true);
  });

  it('warns on click without activate', () => {
    const artifact = makeArtifact({
      config: {
        effects: { fadeIn: { keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] }, duration: 500 } as any },
        interactions: [
          { key: 'btn', trigger: 'click', effects: [{ effectId: 'fadeIn' }] } as any,
        ],
      },
      html: '<div data-interact-key="btn">Click me</div>',
    });
    const result = validateIntegration(artifact);
    expect(result.warnings.some((w) => w.rule === 'click-without-activate')).toBe(true);
  });

  it('warns on hover without interest', () => {
    const artifact = makeArtifact({
      config: {
        effects: { fadeIn: { keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] }, duration: 500 } as any },
        interactions: [
          { key: 'card', trigger: 'hover', effects: [{ effectId: 'fadeIn' }] } as any,
        ],
      },
      html: '<div data-interact-key="card">Hover me</div>',
    });
    const result = validateIntegration(artifact);
    expect(result.warnings.some((w) => w.rule === 'hover-without-interest')).toBe(true);
  });

  it('warns on overflow:hidden in CSS for viewProgress', () => {
    const artifact = makeArtifact({
      config: {
        effects: { scroll: { keyframeEffect: { name: 'x', keyframes: [{}] }, rangeStart: {}, rangeEnd: {} } as any },
        interactions: [{ key: 'hero', trigger: 'viewProgress', effects: [{ effectId: 'scroll' }] } as any],
      },
      css: '.container { overflow: hidden; }',
    });
    const result = validateIntegration(artifact);
    expect(result.warnings.some((w) => w.rule === 'overflow-hidden')).toBe(true);
  });

  it('warns on pointer-events:none in CSS for pointerMove', () => {
    const artifact = makeArtifact({
      config: {
        effects: { mouse: { keyframeEffect: { name: 'x', keyframes: [{}] }, rangeStart: {}, rangeEnd: {} } as any },
        interactions: [{ key: 'hero', trigger: 'pointerMove', effects: [{ effectId: 'mouse' }] } as any],
      },
      css: '.source { pointer-events: none; }',
    });
    const result = validateIntegration(artifact);
    expect(result.warnings.some((w) => w.rule === 'pointer-events-none')).toBe(true);
  });

  it('errors when <interact-element> has no child', () => {
    const artifact = makeArtifact({
      html: '<interact-element data-interact-key="hero"></interact-element>',
      framework: 'web',
    });
    const result = validateIntegration(artifact);
    expect(result.errors.some((e) => e.rule === 'interact-element-no-child')).toBe(true);
  });

  it('passes when <interact-element> has a child', () => {
    const artifact = makeArtifact({
      html: '<interact-element data-interact-key="hero"><div>Child</div></interact-element>',
      framework: 'web',
    });
    const result = validateIntegration(artifact);
    expect(result.errors.filter((e) => e.rule === 'interact-element-no-child')).toHaveLength(0);
  });

  it('errors on setup called after create', () => {
    const artifact = makeArtifact({
      js: 'Interact.create(config);\nInteract.setup({});\nInteract.destroy();',
    });
    const result = validateIntegration(artifact);
    expect(result.errors.some((e) => e.rule === 'setup-order')).toBe(true);
  });
});
