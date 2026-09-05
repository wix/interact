import type {
  Condition,
  ListPropertyName,
  CSSRuleData,
} from '../types';
import { toCSSPropertyName } from '@wix/motion';
import {
  roundNumber,
  getFullPredicateByType,
  getSelectorCondition,
  applySelectorCondition,
} from '../utils';

export function keyframePropertyToCSS(key: string): string {
  if (key === 'cssFloat') {
    return 'float';
  }
  if (key === 'easing') {
    return 'animation-timing-function';
  }
  if (key === 'cssOffset') {
    return 'offset';
  }
  if (key === 'composite') {
    return 'animation-composition';
  }
  return toCSSPropertyName(key);
}

export function interpolateKeyframesOffsets(keyframes: Keyframe[]): Keyframe[] {
  if (!keyframes.length) {
    return [];
  }

  const result = keyframes.map((kf) => ({ ...kf }));

  // Set first if not present
  if (result[0].offset === undefined) {
    result[0].offset = 0;
  }
  // Single keyframe without offset defaults to 1; multi-keyframe last defaults to 1 if missing
  if (result.length === 1) {
    if (keyframes[0].offset === undefined) {
      result[0].offset = 1;
    }
  } else if (result[result.length - 1].offset === undefined) {
    result[result.length - 1].offset = 1;
  }

  // Find segments between defined offsets and interpolate
  let lastDefinedIndex = 0,
    currentOffset = result[0].offset as number;
  for (let i = 1; i < result.length; i++) {
    if (result[i].offset !== undefined) {
      const endOffset = result[i].offset as number;

      if (endOffset < currentOffset) {
        console.error('Offsets must be monotonically non-decreasing');
        return [];
      } else if (endOffset > 1) {
        console.error('Offsets must be in the range [0,1]');
        return [];
      }
      const gap = i - lastDefinedIndex;

      for (let j = lastDefinedIndex + 1; j < i; j++) {
        const progress = (j - lastDefinedIndex) / gap;
        result[j].offset = currentOffset + (endOffset - currentOffset) * progress;
      }

      lastDefinedIndex = i;
      currentOffset = endOffset;
    }
  }

  return result;
}

export function keyframeObjectToKeyframeCSS(keyframeObj: Keyframe, percentage: number): string {
  const properties = Object.entries(keyframeObj)
    .filter(([key, value]) => key !== 'offset' && value !== undefined && value !== null)
    .map(([key, value]) => {
      const cssKey = keyframePropertyToCSS(key);
      return `${cssKey}: ${value};`;
    })
    .join('\n');
  return `${percentage}% {\n${properties}\n}`;
}

export function keyframesToCSS(name: string, keyframes: Keyframe[]): string {
  const interpolated = interpolateKeyframesOffsets(keyframes);
  if (!interpolated.length) {
    return '';
  }

  let keyframeBlocks = interpolated
    .map((kf) => {
      const offset = kf.offset as number;
      const percentage = roundNumber(offset * 100);

      return keyframeObjectToKeyframeCSS(kf, percentage);
    })
    .join('\n');

  return `@keyframes ${name} {\n${keyframeBlocks}\n}`;
}

export function CSSRuleToString(rule: CSSRuleData): string {
  const { key, childSelector, declarations, media, states, selectorCondition, selectorSuffix } =
    rule;
  if (!declarations.length) {
    return '';
  }

  let selector = `[data-interact-key="${key}"]`;

  // maybe nesting is simpler? - no need for `:is` only adding `&` before every option
  if (states && states.length) {
    const statesSelector = states
      .map((state) => `:state(${state}), :--${state}, [data-interact-effect~="${state}"]`)
      .join(', ');
    selector = `${selector}:is(${statesSelector})`;
  }

  // here nesting might be confusing due to spaces already being handled?
  if (childSelector) {
    selector = `${selector} ${childSelector}`;
  }

  if (selectorSuffix) {
    selector = `${selector}${selectorSuffix}`;
  }

  // maybe nesting is simpler? -
  // equivalent to `baseSelector { ${applySelectorCondition('&', selectorCondition)} { ... } }`
  if (selectorCondition) {
    selector = applySelectorCondition(selector, selectorCondition);
  }

  const declarationsStr = declarations
    .map(({ name, value, important }) => `${name}: ${value}${important ? ' !important' : ''};`)
    .join('\n');
  const cssRule = `${selector} {\n${declarationsStr}\n}`;

  return media ? `@media ${media} {\n${cssRule}\n}` : cssRule;
}

export const LIST_ANIMATION_PROPERTY_NAMES = [
  'animation',
  'animation-composition',
  'animation-timeline',
  'animation-range',
] as const satisfies readonly ListPropertyName[];
export const LIST_PROPERTY_NAMES = [...LIST_ANIMATION_PROPERTY_NAMES, 'transition'] as const satisfies readonly ListPropertyName[];
export const LIST_PROPERTY_FALLBACKS: Record<ListPropertyName, string> = {
  transition: '_',
  animation: 'none',
  'animation-composition': 'replace',
  'animation-timeline': 'auto',
  'animation-range': 'normal',
};

// TODO: maybe add `-intrct` to names? --anm-0 or --trns-0 could collide with user-defined names
export function getCustomPropName(name: string, index: number, isSlot: boolean = false): string {
  return `--${name.replace(/(?<!(^|-))([aeiou]|tion)/g, '')}${isSlot ? '-slot' : ''}-${index}`;
}

export function buildAtPropertyRules(
  animationLength: number,
  transitionLength: number,
  animationSlotLength: number,
  transitionSlotLength: number,
) : string[] {
  return LIST_PROPERTY_NAMES.flatMap((name) => [
    ...Array(name === 'transition' ? transitionLength : animationLength).map(
      (_, i) => `@property ${getCustomPropName(name, i)} { syntax: "*"; inherits: false; initial-value: ${LIST_PROPERTY_FALLBACKS[name]}; }`
    ),
    ...Array(name === 'transition' ? animationSlotLength : transitionSlotLength).map(
      (_, i) => `@property ${getCustomPropName(name, i)} { syntax: "*"; inherits: false; initial-value: ${LIST_PROPERTY_FALLBACKS[name]}; }`
    ),
  ])
}

export function buildSequenceListsRule(
  animationLength: number,
  transitionLength: number,
  animationIndex: number,
  transitionIndex: number,
  animationSlotIndex: number,
  transitionSlotIndex: number,
  key: string,
  childSelector?: string,
  conditions?: string[],
  configConditions?: Record<string, Condition>,
) : CSSRuleData | null {
  const propertyNames = [
    ...(animationLength <= 0 ? [] : LIST_ANIMATION_PROPERTY_NAMES),
    ...(transitionLength <= 0 ? [] : ['transition']),
  ];
  if (propertyNames.length === 0) {
    return null;
  }

  const declarations = propertyNames.map(
    (name) => ({
      name: getCustomPropName(name, name === 'transition' ? transitionIndex : animationIndex),
      value: Array(name === 'transition' ? transitionLength : animationLength).map(
        (_, i) => `var(${getCustomPropName(name, i + (name === 'transition' ? transitionSlotIndex : animationSlotIndex), true)})`
      ).join(', ')}),
  );

  const rule: CSSRuleData = { key, childSelector, declarations };

  if (conditions) {
    rule.media = getFullPredicateByType(conditions, configConditions || {}, 'media');
    rule.selectorCondition = getSelectorCondition(conditions, configConditions || {});
  }

  return rule;
}

export function buildListsRule(
  targets: { key: string; childSelector?: string }[],
  animationLength: number,
  transitionLength: number,
) : string {
  if (targets.length === 0) {
    return '';
  }

  const propertyNames = [
    ...(animationLength <= 0 ? [] : LIST_ANIMATION_PROPERTY_NAMES),
    ...(transitionLength <= 0 ? [] : ['transition']),
  ];
  if (propertyNames.length === 0) {
    return '';
  }

  const declarations = propertyNames.map(
    (name) => ({
      name,
      value: Array(name === 'transition' ? transitionLength : animationLength).map(
        // TODO: maybe add `-intrct` to names? --anm-0 or --trns-0 could collide with user-defined names
        (_, i) => `var(${getCustomPropName(name, i)})`
      ).join(', ')}),
  );

  const joinedSelector = targets.map(
    ({ key, childSelector }) => `[data-interact-key="${key}"]${childSelector ? ` ${childSelector}` : ''}`
  ).join(', ');


  return `${joinedSelector} {\n${declarations.map(({ name, value }) => `  ${name}: ${value};`).join('\n')}\n}`;
}
