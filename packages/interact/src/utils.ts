import { getEasing } from '@wix/motion';
import type { Condition, CreateTransitionCSSParams } from './types';

export function roundNumber(num: number, precision = 2): number {
  return parseFloat(num.toFixed(precision));
}

export function isTemplatedKey(key: string) {
  return /\[]/g.test(key);
}

export function kebabCustomProp(args: (string | number)[]) {
  return `--${args.join('-')}`;
}

export function calculateSequenceEffectsOffsets(
  effects: ((any & { delay?: number }) | null)[],
  delay: number,
  offset: number,
  offsetEasing: (p: number) => number,
) : void {
  const maxIndex = effects.length - 1;

  effects.forEach((effect, index) => {
    if (effect) {
      const safeOffset = index ? (offsetEasing(index / maxIndex) * maxIndex * offset) | 0 : 0;
      effect.delay = delay + safeOffset + (effect.delay || 0);
    }
  });
}

/**
 * Applies a selector condition predicate to a base selector.
 * - If `&` is in the predicate, replace `&` with the base selector
 * - If no `&`, assume `&<predicate>` (append predicate to base selector)
 */
export function applySelectorCondition(baseSelector: string, predicate: string): string {
  if (predicate.includes('&')) {
    return predicate.replace(/&/g, baseSelector);
  }
  return `${baseSelector}${predicate}`;
}

export function generateId() {
  return 'wi-12343210'.replace(
    /\d/g,
    (c) =>
      String.fromCharCode(
        (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))) + 97,
      ), // 97 for "a"
  );
}

export function createStateRuleAndCSSTransitions({
  effectId,
  transition,
  properties,
  childSelector = '> :first-child',
  selectorCondition,
}: CreateTransitionCSSParams): {
  stateRule: string;
  transitions: string[];
} {
  let transitions: string[] = [];

  if (transition?.styleProperties) {
    const { duration, easing, delay } = transition;

    if (duration) {
      const hasCustomPropertiesTransition = transition.styleProperties.some((styleProperty) =>
        styleProperty.name.startsWith('--'),
      );

      if (hasCustomPropertiesTransition) {
        // If there are custom properties in the transition, we need to fall back to Viewer's legacy implementation
        transitions = [
          `all ${duration}ms ${getEasing(easing || 'ease')}${delay ? ` ${delay}ms` : ''}`,
          'visibility 0s',
        ];
      } else {
        transitions = transition.styleProperties.map(
          (styleProperty) =>
            `${styleProperty.name} ${duration}ms ${getEasing(
              easing || 'ease',
            )}${delay ? ` ${delay}ms` : ''}`,
        );
      }
    }

    properties = transition.styleProperties;
  } else {
    transitions =
      properties
        ?.filter((property) => property.duration)
        .map(
          (property) =>
            `${property.name} ${property.duration}ms ${
              getEasing(property.easing) || 'ease'
            }${property.delay ? ` ${property.delay}ms` : ''}`,
        ) || [];
  }

  const styleProperties =
    properties?.map((property) => `${property.name}: ${property.value};`) || [];

  // Build selectors, applying condition if present
  const stateSelector = `:where(:state(${effectId}), :--${effectId}) ${childSelector}`;
  const dataAttrSelector = `[data-interact-effect~="${effectId}"] ${childSelector}`;

  const finalStateSelector = selectorCondition
    ? applySelectorCondition(stateSelector, selectorCondition)
    : stateSelector;
  const finalDataAttrSelector = selectorCondition
    ? applySelectorCondition(dataAttrSelector, selectorCondition)
    : dataAttrSelector;

  const stateRule = `${finalStateSelector},
    ${finalDataAttrSelector} {
      ${styleProperties.join(`
      `)}
    }`;

  return { stateRule, transitions };
}

export function createTransitionCSS({
  key,
  effectId,
  transition,
  properties,
  childSelector = '> :first-child',
  selectorCondition,
}: CreateTransitionCSSParams): string[] {
  const { stateRule, transitions } = createStateRuleAndCSSTransitions({
    key,
    effectId,
    transition,
    properties,
    childSelector,
    selectorCondition,
  });
  const result = [stateRule];

  const escapedKey = key.replace(/"/g, "'");
  if (transitions.length) {
    const transitionSelector = `[data-interact-key="${escapedKey}"] ${childSelector}`;
    const finalTransitionSelector = selectorCondition
      ? applySelectorCondition(transitionSelector, selectorCondition)
      : transitionSelector;

    result.push(`@media (prefers-reduced-motion: no-preference) { ${finalTransitionSelector} {
      transition: ${transitions.join(', ')};
    } }`);
  }
  return result;
}

export function getFullPredicateByType(
  conditionNames: string[] | undefined,
  conditions: Record<string, Condition>,
  type: 'media' | 'container',
) {
  const conditionContent = (conditionNames || [])
    .filter((conditionName) => {
      return conditions[conditionName]?.type === type && conditions[conditionName].predicate;
    })
    .map((conditionName) => {
      return conditions[conditionName].predicate;
    })
    .join(') and (');

  return conditionContent && `(${conditionContent})`;
}

export function getMediaQuery(
  conditionNames: string[] | undefined,
  conditions: Record<string, Condition>,
) {
  const condition = getFullPredicateByType(conditionNames, conditions, 'media');
  const mql = condition && window.matchMedia(condition);

  return mql;
}

export function getSelectorCondition(
  conditionNames: string[] | undefined,
  conditions: Record<string, Condition>,
): string | undefined {
  return (conditionNames || [])
    .filter((conditionName) => {
      return conditions[conditionName]?.type === 'selector' && conditions[conditionName].predicate;
    })
    .map((conditionName) => {
      return `:where(${conditions[conditionName].predicate})`;
    })
    .join('');
}
