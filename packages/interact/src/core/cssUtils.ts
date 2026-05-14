import type {
  Condition,
  ListPropertyName,
  ListCustomProps,
  CSSCoordinatedLists,
  CSSRuleData,
} from '../types';
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
  return key.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function interpolateKeyframesOffsets(keyframes: Keyframe[]): Keyframe[] {
  if (!keyframes.length) {
    return [];
  }

  const result = keyframes.map((kf) => ({ ...kf }));

  // Set first and last if not present
  if (result[0].offset === undefined) {
    result[0].offset = 0;
  }
  if (result[result.length - 1].offset === undefined || result.length === 1) {
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
  const { key, childSelector, declarations, media, states, selectorCondition, addInitialSelector } =
    rule;
  if (!declarations.length) {
    return '';
  }

  let selector = `[data-interact-key="${key}"]${
    addInitialSelector ? ':is(:not([data-interact-enter]))' : ''
  }`;

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

  // maybe nesting is simpler? -
  // equivalent to `baseSelector { ${applySelectorCondition('&', selectorCondition)} { ... } }`
  if (selectorCondition) {
    selector = applySelectorCondition(selector, selectorCondition);
  }

  const declarationsStr = declarations.map(({ name, value }) => `${name}: ${value};`).join('\n');
  const cssRule = `${selector} {\n${declarationsStr}\n}`;

  return media ? `@media ${media} {\n${cssRule}\n}` : cssRule;
}

export function buildListsRule(
  lists: CSSCoordinatedLists,
  customProps?: ListCustomProps,
  conditions?: string[],
  configConditions?: Record<string, Condition>,
): CSSRuleData {
  const { key, childSelector, properties } = lists;

  const declarations = Object.entries(properties)
    .filter(
      (entry: [string, { fallback: string; varNames: string[] }]) =>
        entry[1] && entry[1].varNames.length,
    )
    .map(([name, { fallback, varNames }]) => ({
      name,
      value: varNames.map((n) => `var(${n}, ${fallback})`).join(', '),
    }));

  const rule: CSSRuleData = { key, childSelector, declarations };

  // option to assign into custom-properties instead of directly into the actual css properties
  if (customProps) {
    rule.declarations.forEach((declaration) => {
      declaration.name = customProps[declaration.name as ListPropertyName];
    });
  }

  // option to add conditions to the rules
  if (conditions) {
    rule.media = getFullPredicateByType(conditions, configConditions || {}, 'media');
    rule.selectorCondition = getSelectorCondition(conditions, configConditions || {});
  }

  return rule;
}
