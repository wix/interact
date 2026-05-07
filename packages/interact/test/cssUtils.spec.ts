import { describe, expect, it, vi } from 'vitest';
import {
  keyframePropertyToCSS,
  interpolateKeyframesOffsets,
  keyframeObjectToKeyframeCSS,
  keyframesToCSS,
  CSSRuleToString,
  buildListsRule,
} from '../src/core/cssUtils';
import type { CSSCoordinatedLists, ListCustomProps, CSSRuleData } from '../types';

describe('keyframePropertyToCSS', () => {
  it('should convert cssFloat to float', () => {
    expect(keyframePropertyToCSS('cssFloat')).toBe('float');
  });

  it('should convert easing to animation-timing-function', () => {
    expect(keyframePropertyToCSS('easing')).toBe('animation-timing-function');
  });

  it('should convert cssOffset to offset', () => {
    expect(keyframePropertyToCSS('cssOffset')).toBe('offset');
  });

  it('should convert composite to animation-composition', () => {
    expect(keyframePropertyToCSS('composite')).toBe('animation-composition');
  });

  it('should convert camelCase to kebab-case', () => {
    expect(keyframePropertyToCSS('backgroundColor')).toBe('background-color');
    expect(keyframePropertyToCSS('borderTopWidth')).toBe('border-top-width');
    expect(keyframePropertyToCSS('marginLeft')).toBe('margin-left');
  });

  it('should leave lowercase properties unchanged', () => {
    expect(keyframePropertyToCSS('opacity')).toBe('opacity');
    expect(keyframePropertyToCSS('color')).toBe('color');
    expect(keyframePropertyToCSS('transform')).toBe('transform');
  });
});

describe('interpolateKeyframesOffsets', () => {
  it('should return empty array for empty input', () => {
    expect(interpolateKeyframesOffsets([])).toEqual([]);
  });

  it('should set first offset to 0 and last to 1 when missing', () => {
    const result = interpolateKeyframesOffsets([{ opacity: '0' }, { opacity: '1' }]);
    expect(result[0].offset).toBe(0);
    expect(result[1].offset).toBe(1);
  });

  it('should preserve existing offsets', () => {
    const result = interpolateKeyframesOffsets([
      { offset: 0.2, opacity: '0' },
      { offset: 0.8, opacity: '1' },
    ]);
    expect(result[0].offset).toBe(0.2);
    expect(result[1].offset).toBe(0.8);
  });

  it('should interpolate undefined offsets between defined ones', () => {
    const result = interpolateKeyframesOffsets([
      { offset: 0, opacity: '0' },
      { opacity: '0.5' },
      { offset: 1, opacity: '1' },
    ]);
    expect(result[0].offset).toBe(0);
    expect(result[1].offset).toBe(0.5);
    expect(result[2].offset).toBe(1);
  });

  it('should interpolate multiple undefined offsets evenly', () => {
    const result = interpolateKeyframesOffsets([
      { offset: 0, opacity: '0' },
      { opacity: '0.25' },
      { opacity: '0.5' },
      { opacity: '0.75' },
      { offset: 1, opacity: '1' },
    ]);
    expect(result[1].offset).toBeCloseTo(0.25);
    expect(result[2].offset).toBeCloseTo(0.5);
    expect(result[3].offset).toBeCloseTo(0.75);
  });

  it('should handle a single keyframe (first-wins: offset becomes 0)', () => {
    const result = interpolateKeyframesOffsets([{ opacity: '1' }]);
    expect(result).toHaveLength(1);
    expect(result[0].offset).toBe(0);
  });

  it('should return empty array and log error for decreasing offsets', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = interpolateKeyframesOffsets([
      { offset: 0.8, opacity: '0' },
      { offset: 0.2, opacity: '1' },
    ]);
    expect(result).toEqual([]);
    expect(spy).toHaveBeenCalledWith('Offsets must be monotonically non-decreasing');
    spy.mockRestore();
  });

  it('should return empty array and log error for offset > 1', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = interpolateKeyframesOffsets([
      { offset: 0, opacity: '0' },
      { offset: 1.5, opacity: '1' },
    ]);
    expect(result).toEqual([]);
    expect(spy).toHaveBeenCalledWith('Offsets must be in the range [0,1]');
    spy.mockRestore();
  });

  it('should not mutate the original keyframes', () => {
    const original = [{ opacity: '0' }, { opacity: '1' }];
    interpolateKeyframesOffsets(original);
    expect(original[0]).not.toHaveProperty('offset');
    expect(original[1]).not.toHaveProperty('offset');
  });
});

describe('keyframeObjectToKeyframeCSS', () => {
  it('should convert a keyframe object to a CSS block at the given percentage', () => {
    const result = keyframeObjectToKeyframeCSS({ opacity: '0', transform: 'scale(0.5)' }, 0);
    const expected1 = '0% {\nopacity: 0;\ntransform: scale(0.5);\n}';
    const expected2 = '0% {\ntransform: scale(0.5);\nopacity: 0;\n}';
    expect(result === expected1 || result === expected2).toBe(true);
  });

  it('should filter out the offset property', () => {
    const result = keyframeObjectToKeyframeCSS({ offset: 0, opacity: '1' }, 0);
    expect(result).not.toContain('offset');
  });

  it('should filter out undefined and null values', () => {
    const result = keyframeObjectToKeyframeCSS(
      { opacity: '1', transform: undefined, color: null },
      50,
    );
    const expected = '50% {\nopacity: 1;\n}';
    expect(result).toEqual(expected);
  });

  it('should convert camelCase properties to kebab-case', () => {
    const result = keyframeObjectToKeyframeCSS({ backgroundColor: 'red' }, 100);
    expect(result).toContain('background-color: red;');
  });
});

describe('keyframesToCSS', () => {
  it('should generate a full @keyframes block', () => {
    const result = keyframesToCSS('fadeIn', [
      { offset: 0, opacity: '0' },
      { offset: 1, opacity: '1' },
    ]);
    const expected = '@keyframes fadeIn {\n0% {\nopacity: 0;\n}\n100% {\nopacity: 1;\n}\n}';
    expect(result).toEqual(expected);
  });

  it('should return empty string for empty keyframes', () => {
    expect(keyframesToCSS('empty', [])).toBe('');
  });

  it('should return empty string when interpolation fails', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = keyframesToCSS('bad', [
      { offset: 0.8, opacity: '0' },
      { offset: 0.2, opacity: '1' },
    ]);
    expect(result).toBe('');
    spy.mockRestore();
  });

  it('should interpolate offsets and convert to percentages', () => {
    const result = keyframesToCSS('slide', [
      { transform: 'translateX(-100px)' },
      { transform: 'translateX(0)' },
    ]);
    expect(result).toContain('0% {');
    expect(result).toContain('100% {');
  });
});

describe('CSSRuleToString', () => {
  it('should generate a simple rule with key and declarations', () => {
    const rule: CSSRuleData = {
      key: 'my-el',
      declarations: [{ name: 'opacity', value: '0' }],
    };
    const result = CSSRuleToString(rule);
    const expected = '[data-interact-key="my-el"] {\nopacity: 0;\n}';
    expect(result).toEqual(expected);
  });

  it('should return empty string when declarations are empty', () => {
    const rule: CSSRuleData = { key: 'my-el', declarations: [] };
    expect(CSSRuleToString(rule)).toBe('');
  });

  it('should append childSelector', () => {
    const rule: CSSRuleData = {
      key: 'my-el',
      childSelector: '.inner',
      declarations: [{ name: 'color', value: 'red' }],
    };
    const expected = '[data-interact-key="my-el"] .inner {\ncolor: red;\n}';
    expect(CSSRuleToString(rule)).toEqual(expected);
  });

  it('should add :is(:not([data-interact-enter])) when addInitialSelector is true', () => {
    const rule: CSSRuleData = {
      key: 'my-el',
      addInitialSelector: true,
      declarations: [{ name: 'opacity', value: '0' }],
    };
    const expected =
      '[data-interact-key="my-el"]:is(:not([data-interact-enter])) {\nopacity: 0;\n}';
    expect(CSSRuleToString(rule)).toEqual(expected);
  });

  it('should add state selectors when states are provided', () => {
    const rule: CSSRuleData = {
      key: 'my-el',
      states: ['active'],
      declarations: [{ name: 'opacity', value: '1' }],
    };
    const expected =
      '[data-interact-key="my-el"]:is(:state(active), :--active, [data-interact-effect~="active"]) {\nopacity: 1;\n}';
    expect(CSSRuleToString(rule)).toEqual(expected);
  });

  it('should apply selectorCondition', () => {
    const rule: CSSRuleData = {
      key: 'my-el',
      selectorCondition: ':is(.visible)',
      declarations: [{ name: 'opacity', value: '1' }],
    };
    const expected = '[data-interact-key="my-el"]:is(.visible) {\nopacity: 1;\n}';
    expect(CSSRuleToString(rule)).toEqual(expected);
  });

  it('should wrap in @media when media is provided', () => {
    const rule: CSSRuleData = {
      key: 'my-el',
      media: '(min-width: 768px)',
      declarations: [{ name: 'display', value: 'block' }],
    };
    const expected =
      '@media (min-width: 768px) {\n[data-interact-key="my-el"] {\ndisplay: block;\n}\n}';
    expect(CSSRuleToString(rule)).toEqual(expected);
  });

  it('should combine all options together', () => {
    const rule: CSSRuleData = {
      key: 'my-el',
      childSelector: '.child',
      addInitialSelector: true,
      states: ['hover'],
      media: '(min-width: 1024px)',
      declarations: [
        { name: 'opacity', value: '1' },
        { name: 'color', value: 'blue' },
      ],
    };
    const expected =
      '@media (min-width: 1024px) {\n[data-interact-key="my-el"]:is(:not([data-interact-enter])):is(:state(hover), :--hover, [data-interact-effect~="hover"]) .child {\nopacity: 1;\ncolor: blue;\n}\n}';
    expect(CSSRuleToString(rule)).toEqual(expected);
  });
});

describe('buildListsRule', () => {
  const baseLists: CSSCoordinatedLists = {
    key: 'my-el',
    properties: {
      animation: {
        fallback: 'none',
        varNames: ['--anim-1', '--anim-2'],
      },
      transition: {
        fallback: '_',
        varNames: ['--trans-1'],
      },
      'animation-composition': {
        fallback: 'replace',
        varNames: ['--comp-1'],
      },
    },
  };

  it('should build a rule with var() declarations for each prop', () => {
    const rule = buildListsRule(baseLists);
    expect(rule.key).toBe('my-el');
    expect(rule.declarations).toHaveLength(3);

    const animDecl = rule.declarations.find((d) => d.name === 'animation');
    expect(animDecl?.value).toBe('var(--anim-1, none), var(--anim-2, none)');

    const compositionDecl = rule.declarations.find((d) => d.name === 'animation-composition');
    expect(compositionDecl?.value).toBe('var(--comp-1, replace)');

    const transDecl = rule.declarations.find((d) => d.name === 'transition');
    expect(transDecl?.value).toBe('var(--trans-1, _)');
  });

  it('should include childSelector when present', () => {
    const lists: CSSCoordinatedLists = { ...baseLists, childSelector: '.target' };
    const rule = buildListsRule(lists);
    expect(rule.childSelector).toBe('.target');
  });

  it('should rename declarations when customProps mapping is provided', () => {
    const customProps = {
      key: 'my-el',
      childSelector: undefined,
      animation: '--my-anim',
      transition: '--my-trans',
      'animation-composition': '--my-comp',
    } as ListCustomProps;

    const rule = buildListsRule(baseLists, customProps);
    const names = rule.declarations.map((d) => d.name);
    expect(names).toContain('--my-anim');
    expect(names).toContain('--my-trans');
    expect(names).toContain('--my-comp');
    expect(names).not.toContain('animation');
    expect(names).not.toContain('transition');
    expect(names).not.toContain('animation-composition');
  });

  it('should add media condition when conditions with media type are provided', () => {
    const conditions = ['desktop'];
    const configConditions = {
      desktop: { type: 'media' as const, predicate: 'min-width: 1024px' },
    };
    const rule = buildListsRule(baseLists, undefined, conditions, configConditions);
    expect(rule.media).toBe('(min-width: 1024px)');
    expect(rule.selectorCondition).toBeFalsy();
  });

  it('should add selectorCondition when conditions with selector type are provided', () => {
    const conditions = ['visible'];
    const configConditions = {
      visible: { type: 'selector' as const, predicate: '.is-visible' },
    };
    const rule = buildListsRule(baseLists, undefined, conditions, configConditions);
    expect(rule.selectorCondition).toBe(':is(.is-visible)');
    expect(rule.media).toBeFalsy();
  });

  it('should have no media or selectorCondition when no conditions are given', () => {
    const rule = buildListsRule(baseLists);
    expect(rule.media).toBeUndefined();
    expect(rule.selectorCondition).toBeUndefined();
  });
});
