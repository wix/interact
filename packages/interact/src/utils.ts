import { getEasing, toCSSPropertyName } from '@wix/motion';
import type { Condition, CreateTransitionCSSParams, StateEffect, StyleProperty } from './types';

const MOTION_PREFERENCE_FEATURE = 'prefers-reduced-motion';
const MOTION_PREFERENCE_CONDITION = `$${MOTION_PREFERENCE_FEATURE}`;
export const REDUCED_MOTION_QUERY = `(${MOTION_PREFERENCE_FEATURE}: reduce)`;

export function hasMotionPreferenceCondition(
  conditions?: string[],
  configConditions?: Record<string, Condition>,
): boolean {
  return !!conditions?.some((conditionName) => {
    const condition = configConditions?.[conditionName];
    return condition?.type === 'media' && condition.predicate.includes(MOTION_PREFERENCE_FEATURE);
  });
}

/**
 * Composes a motion preference into the media predicate of the given conditions, so a gated
 * interaction ends up with `(min-width: 900px) and (prefers-reduced-motion: reduce)`.
 *
 * An author-declared motion-preference condition wins outright, since composing on top of it would
 * yield a query that can never match. Pass `force` for a gate the runtime applies regardless
 * of what the author asked for, where that unmatchable query is the correct encoding.
 */
export function getMotionPreferenceMedia(
  preference: 'reduce' | 'no-preference',
  conditions?: string[],
  configConditions?: Record<string, Condition>,
  force = false,
): string {
  if (!force && hasMotionPreferenceCondition(conditions, configConditions)) {
    return getFullPredicateByType(conditions, configConditions || {}, 'media');
  }

  return getFullPredicateByType(
    [...(conditions || []), MOTION_PREFERENCE_CONDITION],
    {
      ...configConditions,
      [MOTION_PREFERENCE_CONDITION]: {
        type: 'media',
        predicate: `${MOTION_PREFERENCE_FEATURE}: ${preference}`,
      },
    },
    'media',
  );
}

export function roundNumber(num: number, precision = 2): number {
  return parseFloat(num.toFixed(precision));
}

export function isTemplatedKey(key: string) {
  return /\[]/g.test(key);
}

export function kebabCustomProp(args: (string | number)[]) {
  return `--${args.join('-')}`;
}

export function camelToKebabCase(property: string): string {
  return property.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

export function calculateSequenceEffectsOffsets(
  effects: ((any & { delay?: number }) | null)[],
  delay: number,
  offset: number,
  offsetEasing: (p: number) => number,
): void {
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

/**
 * Resolves the style properties of a state effect - `transition.styleProperties` wins
 * when both are set - with property names normalized to the kebab-case form CSS expects.
 * Property names may be authored in either camelCase or kebab-case.
 */
export function getStateStyleProperties(
  transitionEffect: Pick<StateEffect, 'transition' | 'transitionProperties'>,
): StyleProperty[] {
  const { transition, transitionProperties } = transitionEffect;
  const properties = transition?.styleProperties || transitionProperties || [];

  return properties.map((property) => ({
    ...property,
    name: toCSSPropertyName(property.name),
  }));
}

export function transitionEffectToTransitionsList(transitionEffect: StateEffect) {
  let { transition, transitionProperties } = transitionEffect;
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
            `${toCSSPropertyName(styleProperty.name)} ${duration}ms ${getEasing(
              easing || 'ease',
            )}${delay ? ` ${delay}ms` : ''}`,
        );
      }
    }
  } else {
    transitions =
      transitionProperties
        ?.filter((property) => property.duration)
        .map(
          (property) =>
            `${toCSSPropertyName(property.name)} ${property.duration}ms ${
              getEasing(property.easing) || 'ease'
            }${property.delay ? ` ${property.delay}ms` : ''}`,
        ) || [];
  }

  return transitions;
}

// TODO: createTransitionCSS overlaps with effectToCSS's transition branch and could be
// consolidated once the runtime path migrates to the CSS generation pipeline.
export function createTransitionCSS({
  key,
  effectId,
  transition,
  transitionProperties,
  childSelector = '> :first-child',
  selectorCondition,
}: CreateTransitionCSSParams): string[] {
  const transitions: string[] = transitionEffectToTransitionsList({
    transition,
    transitionProperties,
  });

  const styleProperties = getStateStyleProperties({ transition, transitionProperties }).map(
    (property) => `${property.name}: ${property.value};`,
  );
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

    result.push(`@media ${getMotionPreferenceMedia('no-preference')} { ${finalTransitionSelector} {
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
      return `:is(${conditions[conditionName].predicate})`;
    })
    .join('');
}
