import { describe, expect, it } from 'vitest';
import { generate, _generate } from '../src/core/css';
import { createTransitionCSS, getStateStyleProperties } from '../src/utils';
import type { InteractConfig } from '../src/types';

// CSS property names may be authored in camelCase or kebab-case - state effects end up
// in CSS text (kebab-case) and keyframes go through WAAPI (camelCase).

function stateEffectConfig(
  styleProperties: { name: string; value: string }[],
  duration = 200,
): InteractConfig {
  return {
    effects: {},
    interactions: [
      {
        key: 'el',
        trigger: 'hover',
        effects: [{ effectId: 'state1', transition: { duration, styleProperties } }],
      },
    ],
  };
}

describe('CSS property name casing', () => {
  describe('state effects — normalized to kebab-case', () => {
    it('normalizes camelCase style properties in the state rule', () => {
      const { cssRules } = _generate(
        stateEffectConfig([
          { name: 'backgroundColor', value: '#111' },
          { name: 'border-radius', value: '8px' },
        ]),
      );

      const stateRule = cssRules.find((r) => r.states?.includes('state1'))!;

      expect(stateRule.declarations).toEqual([
        { name: 'background-color', value: '#111' },
        { name: 'border-radius', value: '8px' },
      ]);
    });

    it('normalizes camelCase style properties in the transition shorthand', () => {
      const css = generate(
        stateEffectConfig([
          { name: 'backgroundColor', value: '#111' },
          { name: 'border-radius', value: '8px' },
        ]),
      );

      expect(css).toContain('background-color 200ms');
      expect(css).toContain('border-radius 200ms');
      expect(css).not.toContain('backgroundColor');
    });

    it('normalizes camelCase names in `transitionProperties`', () => {
      const config: InteractConfig = {
        effects: {},
        interactions: [
          {
            key: 'el',
            trigger: 'hover',
            effects: [
              {
                effectId: 'state1',
                transitionProperties: [
                  { name: 'boxShadow', value: '0 8px 24px rgb(0 0 0 / 20%)', duration: 300 },
                ],
              },
            ],
          },
        ],
      };

      const { cssRules } = _generate(config);
      const stateRule = cssRules.find((r) => r.states?.includes('state1'))!;
      const css = generate(config);

      expect(stateRule.declarations[0].name).toBe('box-shadow');
      expect(css).toContain('box-shadow 300ms');
      expect(css).not.toContain('boxShadow');
    });

    it('keeps custom properties verbatim', () => {
      const { cssRules } = _generate(stateEffectConfig([{ name: '--myVar', value: '1' }]));
      const stateRule = cssRules.find((r) => r.states?.includes('state1'))!;

      expect(stateRule.declarations[0].name).toBe('--myVar');
    });

    it('normalizes the runtime (`createTransitionCSS`) path too', () => {
      const rules = createTransitionCSS({
        key: 'el',
        effectId: 'state1',
        transition: {
          duration: 200,
          styleProperties: [{ name: 'backgroundColor', value: '#111' }],
        },
      });

      expect(rules.join('\n')).toContain('background-color: #111;');
      expect(rules.join('\n')).toContain('background-color 200ms');
      expect(rules.join('\n')).not.toContain('backgroundColor');
    });

    it('resolves `transition` over `transitionProperties` when both are set', () => {
      expect(
        getStateStyleProperties({
          transition: {
            duration: 200,
            styleProperties: [{ name: 'backgroundColor', value: 'red' }],
          },
          transitionProperties: [{ name: 'color', value: 'blue', duration: 100 }],
        }),
      ).toEqual([{ name: 'background-color', value: 'red' }]);
    });
  });

  describe('keyframe effects — normalized to camelCase, emitted as kebab-case', () => {
    const keyframeConfig = (keyframes: Record<string, string | number>[]): InteractConfig => ({
      effects: {},
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [
            { effectId: 'kf1', duration: 400, keyframeEffect: { name: 'mixed', keyframes } },
          ],
        },
      ],
    });

    it('emits kebab-case declarations for kebab-case keyframe properties', () => {
      const css = generate(
        keyframeConfig([
          { 'background-color': 'red', borderRadius: '0px' },
          { 'background-color': 'blue', borderRadius: '8px' },
        ]),
      );

      expect(css).toContain('@keyframes mixed');
      expect(css).toContain('background-color: red;');
      expect(css).toContain('border-radius: 8px;');
      expect(css).not.toContain('backgroundColor');
    });

    it('does not rewrite the authored config', () => {
      const keyframes = [{ 'background-color': 'red' }];

      generate(keyframeConfig(keyframes));

      expect(keyframes[0]).toEqual({ 'background-color': 'red' });
    });

    it('keeps custom properties verbatim', () => {
      const css = generate(keyframeConfig([{ '--myVar': '0' }, { '--myVar': '1' }]));

      expect(css).toContain('--myVar: 0;');
      expect(css).toContain('--myVar: 1;');
    });
  });
});
