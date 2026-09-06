import { describe, expect, it, vi } from 'vitest';
import {
  keyframePropertyToCSS,
  interpolateKeyframesOffsets,
  keyframeObjectToKeyframeCSS,
  keyframesToCSS,
  CSSRuleToString,
  buildListsRule,
  buildSequenceListsRule,
  buildAtPropertyRules,
  getCustomPropName,
} from '../src/core/cssUtils';
import type { ListSlots } from '../src/core/cssUtils';
import type { CSSRuleData } from '../src/types/css';

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

  it('should leave kebab-case properties unchanged', () => {
    expect(keyframePropertyToCSS('background-color')).toBe('background-color');
    expect(keyframePropertyToCSS('-webkit-text-stroke')).toBe('-webkit-text-stroke');
  });

  it('should leave custom properties untouched', () => {
    expect(keyframePropertyToCSS('--fooBar')).toBe('--fooBar');
    expect(keyframePropertyToCSS('--foo-bar')).toBe('--foo-bar');
  });

  it('should restore the leading dash of vendor-prefixed properties', () => {
    expect(keyframePropertyToCSS('webkitTextStroke')).toBe('-webkit-text-stroke');
  });
});

describe('interpolateKeyframesOffsets', () => {
  it('should return empty array for empty input', () => {
    expect(interpolateKeyframesOffsets([])).toEqual([]);
  });

  it('should set keyframes with a single keyframe with offset  0 to 0', () => {
    const result = interpolateKeyframesOffsets([{ offset: 0, opacity: '0' }]);
    expect(result[0].offset).toBe(0);
  });

  it('should set keyframes with offset to the correct offset', () => {
    const result = interpolateKeyframesOffsets([
      { offset: 0.5, opacity: '0' },
      { offset: 0.75, opacity: '1' },
    ]);
    expect(result[0].offset).toBe(0.5);
    expect(result[1].offset).toBe(0.75);
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
    expect(result[0].offset).toBe(1);
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
    const expected1 = '0% {\n    opacity: 0;\n    transform: scale(0.5);\n  }';
    const expected2 = '0% {\n    transform: scale(0.5);\n    opacity: 0;\n  }';
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
    const expected = '50% {\n    opacity: 1;\n  }';
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
    const expected =
      '@keyframes fadeIn {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}';
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
    const expected = '[data-interact-key="my-el"] {\n  opacity: 0;\n}';
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
    const expected = '[data-interact-key="my-el"] .inner {\n  color: red;\n}';
    expect(CSSRuleToString(rule)).toEqual(expected);
  });

  it('should serialize important declarations when flagged', () => {
    const rule: CSSRuleData = {
      key: 'my-el',
      selectorSuffix: ':not([data-interact-enter])',
      declarations: [
        { name: 'visibility', value: 'hidden', important: true },
        { name: 'transform', value: 'none', important: true },
      ],
    };
    const expected =
      '[data-interact-key="my-el"]:not([data-interact-enter]) {\n  visibility: hidden !important;\n  transform: none !important;\n}';
    expect(CSSRuleToString(rule)).toEqual(expected);
  });

  it('should add selectorSuffix when provided', () => {
    const rule: CSSRuleData = {
      key: 'my-el',
      selectorSuffix: ':not([data-interact-enter="done"])',
      declarations: [{ name: 'opacity', value: '0' }],
    };
    const expected =
      '[data-interact-key="my-el"]:not([data-interact-enter="done"]) {\n  opacity: 0;\n}';
    expect(CSSRuleToString(rule)).toEqual(expected);
  });

  it('should add state selectors when states are provided', () => {
    const rule: CSSRuleData = {
      key: 'my-el',
      states: ['active'],
      declarations: [{ name: 'opacity', value: '1' }],
    };
    const expected =
      '[data-interact-key="my-el"]:is(:state(active), :--active, [data-interact-effect~="active"]) {\n  opacity: 1;\n}';
    expect(CSSRuleToString(rule)).toEqual(expected);
  });

  it('should apply selectorCondition', () => {
    const rule: CSSRuleData = {
      key: 'my-el',
      selectorCondition: ':is(.visible)',
      declarations: [{ name: 'opacity', value: '1' }],
    };
    const expected = '[data-interact-key="my-el"]:is(.visible) {\n  opacity: 1;\n}';
    expect(CSSRuleToString(rule)).toEqual(expected);
  });

  it('should wrap in @media when media is provided', () => {
    const rule: CSSRuleData = {
      key: 'my-el',
      media: '(min-width: 768px)',
      declarations: [{ name: 'display', value: 'block' }],
    };
    const expected =
      '@media (min-width: 768px) {\n[data-interact-key="my-el"] {\n  display: block;\n}\n}';
    expect(CSSRuleToString(rule)).toEqual(expected);
  });

  it('should combine all options together', () => {
    const rule: CSSRuleData = {
      key: 'my-el',
      childSelector: '.child',
      selectorSuffix: ':not([data-interact-enter="done"])',
      states: ['hover'],
      media: '(min-width: 1024px)',
      declarations: [
        { name: 'opacity', value: '1' },
        { name: 'color', value: 'blue' },
      ],
    };
    const expected =
      '@media (min-width: 1024px) {\n[data-interact-key="my-el"]:is(:state(hover), :--hover, [data-interact-effect~="hover"]) .child:not([data-interact-enter="done"]) {\n  opacity: 1;\n  color: blue;\n}\n}';
    expect(CSSRuleToString(rule)).toEqual(expected);
  });
});

describe('getCustomPropName', () => {
  it('should compress property names by stripping vowels', () => {
    expect(getCustomPropName('animation', 0)).toBe('--anm-0');
    expect(getCustomPropName('animation-composition', 0)).toBe('--anm-cmps-0');
    expect(getCustomPropName('animation-timeline', 0)).toBe('--anm-tmln-0');
    expect(getCustomPropName('animation-range', 0)).toBe('--anm-rng-0');
    expect(getCustomPropName('transition', 0)).toBe('--trns-0');
  });

  it('should append the index', () => {
    expect(getCustomPropName('animation', 3)).toBe('--anm-3');
  });

  it('should mark slot names when isSlot is true', () => {
    expect(getCustomPropName('animation', 2, true)).toBe('--anm-slot-2');
    expect(getCustomPropName('transition', 0, true)).toBe('--trns-slot-0');
  });
});

describe('buildAtPropertyRules', () => {
  it('should declare one @property per list property with its fallback as initial-value', () => {
    const rules = buildAtPropertyRules(1, 1, 0, 0);

    expect(rules).toEqual([
      '@property --anm-0 { syntax: "*"; inherits: false; initial-value: none; }',
      '@property --anm-cmps-0 { syntax: "*"; inherits: false; initial-value: replace; }',
      '@property --anm-tmln-0 { syntax: "*"; inherits: false; initial-value: auto; }',
      '@property --anm-rng-0 { syntax: "*"; inherits: false; initial-value: normal; }',
      '@property --trns-0 { syntax: "*"; inherits: false; initial-value: _; }',
    ]);
  });

  it('should declare one @property per index', () => {
    const rules = buildAtPropertyRules(2, 0, 0, 0);

    expect(rules.filter((rule) => rule.startsWith('@property --anm-'))).toHaveLength(8);
    expect(rules).toContain(
      '@property --anm-1 { syntax: "*"; inherits: false; initial-value: none; }',
    );
  });

  it('should declare slot properties alongside the non-slot ones', () => {
    const rules = buildAtPropertyRules(1, 0, 2, 0);

    expect(rules).toContain(
      '@property --anm-slot-0 { syntax: "*"; inherits: false; initial-value: none; }',
    );
    expect(rules).toContain(
      '@property --anm-slot-1 { syntax: "*"; inherits: false; initial-value: none; }',
    );
    expect(rules).toContain(
      '@property --anm-cmps-slot-1 { syntax: "*"; inherits: false; initial-value: replace; }',
    );
  });

  it('should use the transition lengths for the transition property', () => {
    const rules = buildAtPropertyRules(0, 2, 0, 1);

    expect(rules.filter((rule) => rule.startsWith('@property --trns-'))).toEqual([
      '@property --trns-0 { syntax: "*"; inherits: false; initial-value: _; }',
      '@property --trns-1 { syntax: "*"; inherits: false; initial-value: _; }',
      '@property --trns-slot-0 { syntax: "*"; inherits: false; initial-value: _; }',
    ]);
  });

  it('should return no rules when all lengths are zero', () => {
    expect(buildAtPropertyRules(0, 0, 0, 0)).toEqual([]);
  });
});

describe('buildListsRule', () => {
  it('should build one rule assigning each list property from its custom properties', () => {
    const rule = buildListsRule([{ key: 'my-el' }], 2, 1);

    expect(rule).toBe(
      [
        '[data-interact-key="my-el"] {',
        '  animation: var(--anm-0), var(--anm-1);',
        '  animation-composition: var(--anm-cmps-0), var(--anm-cmps-1);',
        '  animation-timeline: var(--anm-tmln-0), var(--anm-tmln-1);',
        '  animation-range: var(--anm-rng-0), var(--anm-rng-1);',
        '  transition: var(--trns-0);',
        '}',
      ].join('\n'),
    );
  });

  it('should append childSelector to the target selector', () => {
    const rule = buildListsRule([{ key: 'my-el', childSelector: '> :first-child' }], 1, 0);

    expect(rule).toContain('[data-interact-key="my-el"] > :first-child {');
  });

  it('should join all targets into a single selector list', () => {
    const rule = buildListsRule(
      [{ key: 'a', childSelector: '> :first-child' }, { key: 'b' }],
      1,
      0,
    );

    expect(rule).toContain('[data-interact-key="a"] > :first-child, [data-interact-key="b"] {');
  });

  it('should omit animation properties when there are no animations', () => {
    const rule = buildListsRule([{ key: 'my-el' }], 0, 1);

    expect(rule).not.toContain('animation');
    expect(rule).toContain('transition: var(--trns-0);');
  });

  it('should omit the transition property when there are no transitions', () => {
    const rule = buildListsRule([{ key: 'my-el' }], 1, 0);

    expect(rule).not.toContain('transition');
    expect(rule).toContain('animation: var(--anm-0);');
  });

  it('should return an empty string when there are no targets', () => {
    expect(buildListsRule([], 2, 1)).toBe('');
  });

  it('should return an empty string when there are no list properties', () => {
    expect(buildListsRule([{ key: 'my-el' }], 0, 0)).toBe('');
  });
});

describe('buildSequenceListsRule', () => {
  const target = ({
    key = 'my-el',
    childSelector,
    animation,
    transition,
  }: {
    key?: string;
    childSelector?: string;
    animation?: Partial<ListSlots>;
    transition?: Partial<ListSlots>;
  } = {}) => ({
    key,
    childSelector,
    animation: { listIndex: 0, slotCursor: 0, slotsInSequence: 0, ...animation },
    transition: { listIndex: 0, slotCursor: 0, slotsInSequence: 0, ...transition },
  });

  it('should assign the interaction custom property from the sequence slot properties', () => {
    const rule = buildSequenceListsRule(target({ animation: { slotsInSequence: 2 } }))!;

    expect(rule.key).toBe('my-el');
    expect(rule.declarations).toEqual([
      { name: '--anm-0', value: 'var(--anm-slot-0), var(--anm-slot-1)' },
      { name: '--anm-cmps-0', value: 'var(--anm-cmps-slot-0), var(--anm-cmps-slot-1)' },
      { name: '--anm-tmln-0', value: 'var(--anm-tmln-slot-0), var(--anm-tmln-slot-1)' },
      { name: '--anm-rng-0', value: 'var(--anm-rng-slot-0), var(--anm-rng-slot-1)' },
    ]);
  });

  it('should offset the slot names by the slot index', () => {
    const rule = buildSequenceListsRule(
      target({ animation: { slotsInSequence: 2, listIndex: 1, slotCursor: 3 } }),
    )!;

    expect(rule.declarations[0]).toEqual({
      name: '--anm-1',
      value: 'var(--anm-slot-3), var(--anm-slot-4)',
    });
  });

  it('should include childSelector when present', () => {
    const rule = buildSequenceListsRule(
      target({ childSelector: '.target', animation: { slotsInSequence: 1 } }),
    )!;

    expect(rule.childSelector).toBe('.target');
  });

  it('should omit animation properties when there are no animations', () => {
    const rule = buildSequenceListsRule(target({ transition: { slotsInSequence: 1 } }))!;

    expect(rule.declarations).toEqual([{ name: '--trns-0', value: 'var(--trns-slot-0)' }]);
  });

  it('should offset transition slots independently of animation slots', () => {
    const rule = buildSequenceListsRule(
      target({
        animation: { slotsInSequence: 1, listIndex: 2, slotCursor: 4 },
        transition: { slotsInSequence: 2, listIndex: 1, slotCursor: 3 },
      }),
    )!;

    expect(rule.declarations[0]).toEqual({ name: '--anm-2', value: 'var(--anm-slot-4)' });
    expect(rule.declarations[4]).toEqual({
      name: '--trns-1',
      value: 'var(--trns-slot-3), var(--trns-slot-4)',
    });
  });

  it('should return null when there are no list properties', () => {
    expect(buildSequenceListsRule(target())).toBeNull();
  });

  it('should add media condition when conditions with media type are provided', () => {
    const rule = buildSequenceListsRule(
      target({ animation: { slotsInSequence: 1 } }),
      ['desktop'],
      {
        desktop: { type: 'media' as const, predicate: 'min-width: 1024px' },
      },
    )!;

    expect(rule.media).toBe('(min-width: 1024px)');
    expect(rule.selectorCondition).toBeFalsy();
  });

  it('should add selectorCondition when conditions with selector type are provided', () => {
    const rule = buildSequenceListsRule(
      target({ animation: { slotsInSequence: 1 } }),
      ['visible'],
      {
        visible: { type: 'selector' as const, predicate: '.is-visible' },
      },
    )!;

    expect(rule.selectorCondition).toBe(':is(.is-visible)');
    expect(rule.media).toBeFalsy();
  });

  it('should have no media or selectorCondition when no conditions are given', () => {
    const rule = buildSequenceListsRule(target({ animation: { slotsInSequence: 1 } }))!;

    expect(rule.media).toBeUndefined();
    expect(rule.selectorCondition).toBeUndefined();
  });
});
