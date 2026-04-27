import { getEasing } from '@wix/motion';
import type { Condition, CreateTransitionCSSParams } from './types';

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

export function createTransitionCSS({
  key,
  effectId,
  transition,
  properties,
  childSelector = '> :first-child',
  selectorCondition,
}: CreateTransitionCSSParams): string[] {
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
  const escapedKey = key.replace(/"/g, "'");

  // Build selectors, applying condition if present
  const stateSelector = `:is(:state(${effectId}), :--${effectId}) ${childSelector}`;
  const dataAttrSelector = `[data-interact-effect~="${effectId}"] ${childSelector}`;

  const finalStateSelector = selectorCondition
    ? applySelectorCondition(stateSelector, selectorCondition)
    : stateSelector;
  const finalDataAttrSelector = selectorCondition
    ? applySelectorCondition(dataAttrSelector, selectorCondition)
    : dataAttrSelector;

  const result = [
    `${finalStateSelector},
    ${finalDataAttrSelector} {
      ${styleProperties.join(`
      `)}
    }`,
  ];

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

export function getMediaQuery(
  conditionNames: string[] | undefined,
  conditions: Record<string, Condition>,
) {
  const conditionContent = (conditionNames || [])
    .filter((conditionName) => {
      return conditions[conditionName]?.type === 'media' && conditions[conditionName].predicate;
    })
    .map((conditionName) => {
      return conditions[conditionName].predicate;
    })
    .join(') and (');

  const condition = conditionContent && `(${conditionContent})`;
  const mql = condition && window.matchMedia(condition);

  return mql;
}

export function getSelectorCondition(
  conditionNames: string[] | undefined,
  conditions: Record<string, Condition>,
): string | undefined {
  for (const name of conditionNames || []) {
    const condition = conditions[name];
    if (condition?.type === 'selector' && condition.predicate) {
      return condition.predicate;
    }
  }
  return;
}
