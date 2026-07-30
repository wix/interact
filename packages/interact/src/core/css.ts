import type {
  InteractConfig,
  Interaction,
  ResolvedEffect,
  ResolvedSequence,
  Condition,
  ListPropertyName,
  ListCustomProps,
  CSSCoordinatedLists,
  CSSRuleData,
} from '../types';
import {
  kebabCustomProp,
  camelToKebabCase,
  transitionEffectToTransitionsList,
  getFullPredicateByType,
  getSelectorCondition,
  combineMedia,
  REDUCED_MOTION_QUERY,
} from '../utils';
import { getSelector } from './Interact';
import { resolveEffectForCSS, resolveSequenceForCSS } from './resolvers';
import { getElementHash, getUniqueEncodedHash } from './utilities';
import { keyframesToCSS, CSSRuleToString, buildListsRule } from './cssUtils';
import { effectToAnimationOptions } from '../handlers/utilities';
import { getCSSAnimation, MotionKeyframeEffect, TriggerVariant } from '@wix/motion';

/**
 * Options for CSS generation.
 *
 * `reducedMotion` (default `true`) emits `@media (prefers-reduced-motion: reduce)` rules that
 * neutralize animations and transitions for users who asked for reduced motion. Pass `false` only
 * when the surface deliberately opts out of the browser setting - the runtime counterpart of
 * `Interact.forceReducedMotion = false`.
 */
export type GenerateOptions = { reducedMotion?: boolean };

type CSSContext = { useFirstChild: boolean; reducedMotion: boolean };

export const DEFAULT_INITIAL = [
  { name: 'visibility', value: 'hidden' },
  { name: 'transform', value: 'none' },
  { name: 'translate', value: 'none' },
  { name: 'scale', value: 'none' },
  { name: 'rotate', value: 'none' },
];

const LIST_ANIMATION_PROPERTY_NAMES = [
  'animation',
  'animation-composition',
  'animation-timeline',
  'animation-range',
] as const satisfies readonly ListPropertyName[];

type AnimationPropertyName = (typeof LIST_ANIMATION_PROPERTY_NAMES)[number];

const LIST_PROPERTY_NAMES: ListPropertyName[] = ['transition', ...LIST_ANIMATION_PROPERTY_NAMES];

const LIST_PROPERTY_NAMES_MOTION: Record<AnimationPropertyName, string> = {
  animation: 'animation',
  'animation-composition': 'composition',
  'animation-timeline': 'animationTimeline',
  'animation-range': 'animationRange',
};

const LIST_PROPERTY_FALLBACKS: Record<ListPropertyName, string> = {
  animation: 'none',
  'animation-composition': 'replace',
  transition: '_',
  'animation-timeline': 'auto',
  'animation-range': 'normal',
};

// ----- Map Updaters -----

function accumulateUsedProperties(
  map: Map<string, Set<ListPropertyName>>,
  targetHash: string,
  props: ListPropertyName[],
) {
  const existing = map.get(targetHash);
  if (existing) {
    props.forEach((p) => existing.add(p));
  } else {
    map.set(targetHash, new Set(props));
  }
}

function pushToTargetCustomPropsLists(
  targetToLists: Map<string, CSSCoordinatedLists>,
  targetHash: string,
  customProps: ListCustomProps,
  usedProperties?: Set<ListPropertyName>,
): void {
  const { key, childSelector } = customProps;
  const propertyNames = usedProperties
    ? LIST_PROPERTY_NAMES.filter((n) => usedProperties.has(n))
    : LIST_PROPERTY_NAMES;

  if (!targetToLists.has(targetHash)) {
    targetToLists.set(targetHash, { key, childSelector, properties: {} });
  }
  const { properties } = targetToLists.get(targetHash)!;
  for (const name of propertyNames) {
    if (!properties[name]) {
      properties[name] = { fallback: LIST_PROPERTY_FALLBACKS[name], varNames: [] };
    }
    properties[name]!.varNames.push(customProps[name]);
  }
}

function buildCustomProps(
  indices: (string | number)[],
  encodedHash: string,
): Record<ListPropertyName, string> {
  return LIST_PROPERTY_NAMES.reduce(
    (acc, name) => {
      acc[name] = kebabCustomProp([name, ...indices, encodedHash]);
      return acc;
    },
    {} as Record<ListPropertyName, string>,
  );
}

function getInteractionCustomPropsForTarget(
  targetHash: string,
  key: string,
  interactionIdx: number,
  targetToCustomProps: Map<string, ListCustomProps>,
  childSelector?: string,
): ListCustomProps {
  if (!targetToCustomProps.has(targetHash)) {
    targetToCustomProps.set(targetHash, {
      key,
      childSelector,
      ...buildCustomProps([interactionIdx], getUniqueEncodedHash(targetHash)),
    });
  }

  return targetToCustomProps.get(targetHash)!;
}

function generateSequenceCustomProps(
  targetHash: string,
  interactionIdx: number,
  index: number,
): Record<ListPropertyName, string> {
  return buildCustomProps([interactionIdx, index], getUniqueEncodedHash(targetHash));
}

function buildAnimationDeclarations(
  cssAnimations: ReturnType<typeof getCSSAnimation>,
  customProps: ListCustomProps,
) {
  return LIST_ANIMATION_PROPERTY_NAMES.map((propertyName) => ({
    name: customProps[propertyName],
    value:
      cssAnimations
        .map((animation) => {
          const name = LIST_PROPERTY_NAMES_MOTION[propertyName];
          return (animation as Record<string, unknown>)[name];
        })
        .join(', ') || LIST_PROPERTY_FALLBACKS[propertyName],
  }));
}

/**
 * Declarations that neutralize an effect for users who asked for reduced motion, mirroring what the
 * runtime does: a single-iteration time-based animation collapses into a 1ms animation that lands on
 * its end state, while scroll/pointer-driven and perpetual animations are turned off completely so
 * the element keeps its natural state.
 */
function buildReducedAnimationDeclarations(
  animationOptions: Parameters<typeof getCSSAnimation>[1],
  trigger: TriggerVariant,
  customProps: ListCustomProps,
) {
  const reducedAnimations = getCSSAnimation(null, animationOptions, trigger, {
    reducedMotion: true,
  }).filter((anim) => anim.name);

  return reducedAnimations.length
    ? buildAnimationDeclarations(reducedAnimations, customProps)
    : LIST_ANIMATION_PROPERTY_NAMES.map((propertyName) => ({
        name: customProps[propertyName],
        value: LIST_PROPERTY_FALLBACKS[propertyName],
      }));
}

// ----- Parsers -----

function triggerToCSS(
  interaction: Interaction,
  configConditions: Record<string, Condition>,
  triggerId: string,
  { useFirstChild }: CSSContext,
): CSSRuleData {
  const { key, conditions } = interaction;

  const media = getFullPredicateByType(conditions, configConditions, 'media');
  const selectorCondition = getSelectorCondition(conditions, configConditions);

  const childSelector = getSelector(interaction, {
    asCombinator: true,
    useFirstChild,
    addItemFilter: true,
  });

  return {
    key,
    media,
    selectorCondition,
    childSelector,
    // invalidating earlier cascaded custom properties affected from earlier transitionEffects
    // to implement same-interaction-cascade
    declarations: [
      {
        name: 'view-timeline',
        value: `--${triggerId}`,
      },
    ],
  };
}

function effectToCSS(
  effect: ResolvedEffect,
  configConditions: Record<string, Condition>,
  customProps: ListCustomProps,
  trigger: TriggerVariant,
  context: CSSContext,
  childSelector?: string,
): {
  rules: CSSRuleData[];
  keyframes: MotionKeyframeEffect[];
  usedProperties: ListPropertyName[];
} {
  const {
    key,
    effectId,
    conditions,
    namedEffect,
    keyframeEffect,
    transition,
    transitionProperties,
    initial,
  } = effect;

  const media = getFullPredicateByType(conditions, configConditions, 'media');
  const selectorCondition = getSelectorCondition(conditions, configConditions);
  const reducedMotionMedia = combineMedia(media, REDUCED_MOTION_QUERY);

  const rules: CSSRuleData[] = [
    {
      key,
      media,
      selectorCondition,
      childSelector,
      declarations: [],
    },
  ];
  let keyframes: MotionKeyframeEffect[] = [];

  const { declarations } = rules[0];

  let usedProperties: ListPropertyName[] = [];

  if (namedEffect || keyframeEffect) {
    usedProperties = [...LIST_ANIMATION_PROPERTY_NAMES];

    const animationOptions = effectToAnimationOptions(effect);
    const cssAnimations = getCSSAnimation(null, animationOptions, trigger).filter(
      (anim) => anim.name,
    );

    // accumulate keyframes
    keyframes = cssAnimations.map((anim) => ({
      name: anim.name as string,
      keyframes: anim.keyframes,
    }));

    // declare custom parameters
    declarations.push(
      ...cssAnimations.flatMap(({ custom }) =>
        Object.entries(custom || {})
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => ({ name: key, value: value as string | number })),
      ),
    );

    const animationDeclarations = buildAnimationDeclarations(cssAnimations, customProps);

    // reduced-motion overrides go right after the rule they override - same selector, same
    // specificity, so the later one wins wherever the media condition matches
    const reducedDeclarations = context.reducedMotion
      ? buildReducedAnimationDeclarations(animationOptions, trigger, customProps)
      : [];

    if (initial) {
      // declare animation and composition custom properties with initial dependent on data-motion-enter
      rules.push({
        key,
        media,
        selectorCondition,
        childSelector,
        declarations: DEFAULT_INITIAL,
        dataInteractEnterSelector: ':not([data-interact-enter])',
      });
      rules.push({
        key,
        media,
        selectorCondition,
        childSelector,
        declarations: animationDeclarations,
        dataInteractEnterSelector: ':not([data-interact-enter="done"])',
      });

      if (reducedDeclarations.length) {
        rules.push({
          key,
          media: reducedMotionMedia,
          selectorCondition,
          childSelector,
          declarations: reducedDeclarations,
          dataInteractEnterSelector: ':not([data-interact-enter="done"])',
        });
      }
    } else {
      // declare animation and composition custom properties
      declarations.push(...animationDeclarations);

      if (reducedDeclarations.length) {
        rules.push({
          key,
          media: reducedMotionMedia,
          selectorCondition,
          childSelector,
          declarations: reducedDeclarations,
        });
      }
    }
  } else if (transition || transitionProperties) {
    usedProperties = ['transition'];

    const properties = transition?.styleProperties || transitionProperties || [];
    const transitions = transitionEffectToTransitionsList(effect);

    // declaring transition custom property
    declarations.push({
      name: customProps.transition,
      value: transitions.join(', ') || LIST_PROPERTY_FALLBACKS.transition,
    });

    // the state itself still applies under reduced motion, it just applies instantly -
    // this mirrors the `(prefers-reduced-motion: no-preference)` wrapper in createTransitionCSS()
    if (context.reducedMotion && transitions.length) {
      rules.push({
        key,
        media: reducedMotionMedia,
        selectorCondition,
        childSelector,
        declarations: [{ name: customProps.transition, value: LIST_PROPERTY_FALLBACKS.transition }],
      });
    }

    // adding state rule using custom properties that could be overriden to implement
    // same-interaction-cascade
    rules.push({
      key,
      media,
      selectorCondition,
      childSelector,
      states: [effectId],
      declarations: properties,
    });
  } else {
    // setting off animation, composition and transition custom properties
    declarations.push(
      ...LIST_ANIMATION_PROPERTY_NAMES.map((propertyName) => ({
        name: customProps[propertyName],
        value: LIST_PROPERTY_FALLBACKS[propertyName],
      })),
    );
  }

  return { rules: rules.filter((r) => r.declarations.length), keyframes, usedProperties };
}

function parseEffect(
  configConditions: Record<string, Condition>,
  interactionIdx: number,
  effect: ResolvedEffect,
  targetToCustomProps: Map<string, ListCustomProps>,
  keyframesMap: Map<string, Keyframe[]>,
  trigger: TriggerVariant,
  context: CSSContext,
  sequenceCustomProps?: Record<ListPropertyName, string>,
  precomputedTargetHash?: string,
): { rules: CSSRuleData[]; usedProperties: ListPropertyName[] } {
  const { key } = effect;
  const targetHash = precomputedTargetHash ?? getElementHash(effect);
  const childSelector = getSelector(effect, {
    asCombinator: true,
    useFirstChild: context.useFirstChild,
    addItemFilter: true,
  });

  // get existing custom-property names for coordinated-list for this target and interaction
  // or generate them if it is first time this interaction uses this target
  const customProps = getInteractionCustomPropsForTarget(
    targetHash,
    key,
    interactionIdx,
    targetToCustomProps,
    childSelector,
  );

  // in case effect is part of a sequence, we use different custom-proprties names to not override
  // the entire interaction, instead we generate unique-per-effect name to allow effects to live together
  const localCustomProps = { ...customProps };
  if (sequenceCustomProps) {
    Object.assign(localCustomProps, sequenceCustomProps);
  }

  // process effect into css-rules and keyframes
  const { rules, keyframes, usedProperties } = effectToCSS(
    effect,
    configConditions,
    localCustomProps,
    trigger,
    context,
    childSelector,
  );

  // update keyframes map
  keyframes.forEach(({ name, keyframes }) => keyframesMap.set(name, keyframes));

  return { rules, usedProperties };
}

function parseSequence(
  configConditions: Record<string, Condition>,
  interactionIdx: number,
  sequence: ResolvedSequence,
  targetToCustomProps: Map<string, ListCustomProps>,
  keyframesMap: Map<string, Keyframe[]>,
  trigger: TriggerVariant,
  context: CSSContext,
  targetUsedProperties?: Map<string, Set<ListPropertyName>>,
): CSSRuleData[] {
  // in a similar manner to how we treat different interactions and use lists to concatenate them
  // instead of overriding, we use the same mechanism to allow all of the effects of a sequence to
  // exist together on the same target -
  // targetHash to lists of custom-properties for each coordinated-list type property
  // to be populated when parsing effects
  const targetToSequenceLists = new Map<string, CSSCoordinatedLists>();
  const targetSequenceIndex = new Map<string, number>();

  const cssRules: CSSRuleData[] = [];

  for (const effect of sequence.effects) {
    const targetHash = getElementHash(effect);
    const { key } = effect;
    const childSelector = getSelector(effect, {
      asCombinator: true,
      useFirstChild: context.useFirstChild,
      addItemFilter: true,
    });

    const index = targetSequenceIndex.get(targetHash) || 0;
    targetSequenceIndex.set(targetHash, index + 1);

    const seqCustomProps = generateSequenceCustomProps(targetHash, interactionIdx, index);

    const { rules, usedProperties } = parseEffect(
      configConditions,
      interactionIdx,
      effect,
      targetToCustomProps,
      keyframesMap,
      trigger,
      context,
      seqCustomProps,
      targetHash,
    );
    cssRules.push(...rules);

    const usedSet = new Set(usedProperties);

    pushToTargetCustomPropsLists(
      targetToSequenceLists,
      targetHash,
      { key, childSelector, ...seqCustomProps },
      usedSet,
    );

    if (targetUsedProperties) {
      accumulateUsedProperties(targetUsedProperties, targetHash, usedProperties);
    }
  }

  const { conditions } = sequence;

  targetToSequenceLists.forEach((lists, targetHash) => {
    const customProps = targetToCustomProps.get(targetHash)!;

    // for each target add rule with sequence-conditions for the coordinated lists from interactions targeting it
    // here we use the interaction's custom-properties to set the lists as values for them instead of
    // directly into the actual coordinated-list type property, to provide cascading in the array of sequences
    cssRules.push(buildListsRule(lists, customProps, conditions, configConditions));
  });

  return cssRules;
}

function parseInteraction(
  config: InteractConfig,
  interaction: Interaction,
  interactionIdx: number,
  targetToLists: Map<string, CSSCoordinatedLists>,
  keyframesMap: Map<string, Keyframe[]>,
  context: CSSContext,
): CSSRuleData[] {
  const { effects = [], sequences = [] } = interaction;
  const configConditions = config.conditions || {};

  // targetHash to custom-property per each coordinated-list type property for current interaction
  // to be populated when parsing the effects (since it is per target).
  // Each interaction uses a single custom-property for each coordinated-list type property,
  // to provide cascading in the array of effects - e.g. effects in the interaction array with exact same target
  // will populate the same per-interaction custom-property (e.g. `--animation-${interactionIdx}-${targetUniqueSuffix}`)
  // and the last one will be applied.
  const targetToCustomProps = new Map<string, ListCustomProps>();

  const targetUsedProperties = new Map<string, Set<ListPropertyName>>();

  const resolvedEffects = effects
    .map((effect) => resolveEffectForCSS(effect, interaction, config))
    .filter((effect) => effect !== null);

  const cssRules = [];

  const { trigger } = interaction;
  const motionTrigger = {
    trigger: camelToKebabCase(trigger),
    id: ['trigger', interactionIdx].join('-'),
    componentId: '',
  } as TriggerVariant;
  if (trigger === 'viewProgress') {
    cssRules.push(triggerToCSS(interaction, configConditions, motionTrigger.id, context));
  }

  for (const effect of resolvedEffects) {
    const targetHash = getElementHash(effect);
    const { rules, usedProperties } = parseEffect(
      configConditions,
      interactionIdx,
      effect,
      targetToCustomProps,
      keyframesMap,
      motionTrigger,
      context,
    );
    cssRules.push(...rules);

    accumulateUsedProperties(targetUsedProperties, targetHash, usedProperties);
  }

  const resolvedSequences = sequences
    .map((sequence) => resolveSequenceForCSS(sequence, interaction, config))
    .filter((sequence) => sequence !== null);

  cssRules.push(
    ...resolvedSequences.flatMap((sequence) =>
      parseSequence(
        configConditions,
        interactionIdx,
        sequence,
        targetToCustomProps,
        keyframesMap,
        motionTrigger,
        context,
        targetUsedProperties,
      ),
    ),
  );

  // after processing all of the effects, we add to the lists of custom-properties per target
  // the new interaction's custom-property names
  targetToCustomProps.forEach((customProps, targetHash) => {
    pushToTargetCustomPropsLists(
      targetToLists,
      targetHash,
      customProps,
      targetUsedProperties.get(targetHash),
    );
  });

  return cssRules;
}

// ----- EndPoints -----

export function _generate(
  config: InteractConfig,
  useFirstChild: boolean = true,
  options: GenerateOptions = {},
): {
  cssRules: CSSRuleData[];
  keyframes: Map<string, Keyframe[]>;
} {
  // targetHash to lists of custom-properties for each coordinated-list type property
  // to be populated when parsing interactions
  const targetToLists = new Map<string, CSSCoordinatedLists>();
  const keyframes = new Map<string, Keyframe[]>();
  const context: CSSContext = {
    useFirstChild,
    reducedMotion: options.reducedMotion ?? true,
  };

  const cssRules = config.interactions.flatMap((interaction, interactionIdx) =>
    parseInteraction(config, interaction, interactionIdx, targetToLists, keyframes, context),
  );

  // for each target add unconditional rule for the coordinated lists from interactions targeting it
  targetToLists.forEach((lists) => {
    cssRules.push(buildListsRule(lists));
  });

  return { keyframes, cssRules };
}
/**
 * Generates CSS for animations from an InteractConfig.
 *
 * @param config - The interact configuration containing effects and interactions
 * @param useFirstChild - Whether to use the first child selector (default: true)
 * @param options - `reducedMotion: false` skips the `prefers-reduced-motion` rules (default: `true`)
 * @returns string containing all of the CSS rules needed for time-based animations
 */
export function generate(
  config: InteractConfig,
  useFirstChild: boolean = true,
  options: GenerateOptions = {},
): string {
  const { cssRules, keyframes } = _generate(config, useFirstChild, options);

  const css = [
    ...[...keyframes.entries()].map(([name, keyframes]) => keyframesToCSS(name, keyframes)),
    ...cssRules.map(CSSRuleToString),
  ];

  return css.join('\n');
}
