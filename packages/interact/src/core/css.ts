import type {
  InteractConfig,
  Interaction,
  ResolvedEffect,
  ResolvedSequence,
  Condition,
  ListPropertyName,
  ListCustomProps,
  CSSCoordiantedLists,
  CSSRuleData,
} from '../types';
import {
  kebabCustomProp,
  camelToKebabCase,
  transitionEffectToTransitionsList,
  getFullPredicateByType,
  getSelectorCondition,
} from '../utils';
import { getSelector } from './Interact';
import { resolveEffectForCSS, resolveSequenceForCSS } from './resolvers';
import { getElementHash, getUniqueEncodedHash } from './utilities';
import { keyframesToCSS, CSSRuleToString, buildListsRule } from './cssUtils';
import { effectToAnimationOptions } from '../handlers/utilities';
import { getCSSAnimation, MotionKeyframeEffect, TriggerVariant } from '@wix/motion';

export const DEFAULT_INITIAL = [
  { name: 'visibility', value: 'hidden' },
  { name: 'transform', value: 'none' },
  { name: 'translate', value: 'none' },
  { name: 'scale', value: 'none' },
  { name: 'rotate', value: 'none' },
];

const LIST_ANIMATION_PROPERTY_NAMES: ListPropertyName[] = [
  'animation',
  'animation-composition',
  'animation-timeline',
  'animation-range',
];

const LIST_PROPERTY_NAMES: ListPropertyName[] = ['transition', ...LIST_ANIMATION_PROPERTY_NAMES];

const LIST_PROPERTY_NAMES_MOTION = {
  animation: 'animation' as const,
  'animation-composition': 'composition' as const,
  'animation-timeline': 'animationTimeline' as const,
  'animation-range': 'animationRange' as const,
  // transition is dummy for type-check
  transition: 'animation' as const,
};

const LIST_PROPERTY_FALLBACKS: Record<ListPropertyName, string> = {
  animation: 'none',
  'animation-composition': 'replace',
  transition: '_',
  'animation-timeline': 'auto',
  'animation-range': 'normal',
};

// ----- Map Updaters -----

function pushToTargetCustomPropsLists(
  targetToLists: Map<string, CSSCoordiantedLists>,
  targetHash: string,
  customProps: ListCustomProps,
  usedProperties?: Set<ListPropertyName>,
): void {
  const { key, childSelector } = customProps;
  const propertyNames = usedProperties
    ? LIST_PROPERTY_NAMES.filter((n) => usedProperties.has(n))
    : LIST_PROPERTY_NAMES;

  if (!targetToLists.has(targetHash)) {
    const properties = propertyNames.reduce(
      (acc, name) => {
        acc[name] = {
          fallback: LIST_PROPERTY_FALLBACKS[name],
          varNames: [customProps[name]],
        };
        return acc;
      },
      {} as CSSCoordiantedLists['properties'],
    );

    targetToLists.set(targetHash, { key, childSelector, properties });
  } else {
    const { properties } = targetToLists.get(targetHash)!;
    propertyNames.forEach((name) => {
      if (!properties[name]) {
        properties[name] = { fallback: LIST_PROPERTY_FALLBACKS[name], varNames: [] };
      }
      properties[name]!.varNames.push(customProps[name]);
    });
  }
}

function getInteractionCustomPropsForTarget(
  targetHash: string,
  key: string,
  interactionIdx: number,
  targetToCustomProps: Map<string, ListCustomProps>,
  childSelector?: string,
): ListCustomProps {
  if (!targetToCustomProps.has(targetHash)) {
    const properties = LIST_PROPERTY_NAMES.reduce(
      (acc, name) => {
        acc[name] = kebabCustomProp([name, interactionIdx, getUniqueEncodedHash(targetHash)]);
        return acc;
      },
      {} as Record<ListPropertyName, string>,
    );
    targetToCustomProps.set(targetHash, {
      key,
      childSelector,
      ...properties,
    });
  }

  return targetToCustomProps.get(targetHash)!;
}

function generateSequenceCustomProps(
  targetHash: string,
  interactionIdx: number,
  index: number,
): Record<ListPropertyName, string> {
  return LIST_PROPERTY_NAMES.reduce(
    (acc, name) => {
      acc[name] = kebabCustomProp([name, interactionIdx, index, getUniqueEncodedHash(targetHash)]);
      return acc;
    },
    {} as Record<ListPropertyName, string>,
  );
}

// ----- Parsers -----

function triggerToCSS(
  interaction: Interaction,
  configConditions: Record<string, Condition>,
  triggerId: string,
  useFirstChild: boolean = true,
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
    usedProperties = LIST_ANIMATION_PROPERTY_NAMES;

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

    const animationDeclarations = LIST_ANIMATION_PROPERTY_NAMES.map((propertyName) => ({
      name: customProps[propertyName],
      value:
        cssAnimations
          .map((animation) => {
            const name = LIST_PROPERTY_NAMES_MOTION[propertyName];
            return animation[name];
          })
          .join(', ') || LIST_PROPERTY_FALLBACKS[propertyName],
    }));

    if (initial) {
      // declare animation and composition custom properties with initial dependent on data-motion-enter
      rules.push({
        key,
        media,
        selectorCondition,
        childSelector,
        declarations: animationDeclarations.concat(DEFAULT_INITIAL),
        addInitialSelector: true,
      });
    } else {
      // declare animation and composition custom properties
      declarations.push(...animationDeclarations);
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

  return { rules, keyframes, usedProperties };
}

function parseEffect(
  config: InteractConfig,
  interactionIdx: number,
  effect: ResolvedEffect,
  targetToCustomProps: Map<string, ListCustomProps>,
  keyframesMap: Map<string, Keyframe[]>,
  trigger: TriggerVariant,
  useFirstChild: boolean = true,
  sequenceCustomProps?: Record<ListPropertyName, string>,
): { rules: CSSRuleData[]; usedProperties: ListPropertyName[] } {
  const configConditions = config.conditions || {};

  const { key } = effect;
  const targetHash = getElementHash(effect);
  const childSelector = getSelector(effect, {
    asCombinator: true,
    useFirstChild,
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
    childSelector,
  );

  // update keyframes map
  keyframes.forEach(({ name, keyframes }) => keyframesMap.set(name, keyframes));

  return { rules, usedProperties };
}

function parseSequence(
  config: InteractConfig,
  interactionIdx: number,
  sequence: ResolvedSequence,
  targetToCustomProps: Map<string, ListCustomProps>,
  keyframesMap: Map<string, Keyframe[]>,
  trigger: TriggerVariant,
  useFirstChild: boolean = true,
  targetUsedProperties?: Map<string, Set<ListPropertyName>>,
): CSSRuleData[] {
  // in a similar manner to how we treat different interactions and use lists to concatenate them
  // instead of overriding, we use the same mechanism to allow all of the effects of a sequence to
  // exist together on the same target -
  // targetHash to lists of custom-properties for each coordinated-list type property
  // to be populated when parsing effects
  const targetToSequenceLists = new Map<string, CSSCoordiantedLists>();
  const targetSequenceIndex = new Map<string, number>();

  const cssRules: CSSRuleData[] = [];

  for (const effect of sequence.effects) {
    const targetHash = getElementHash(effect);
    const { key } = effect;
    const childSelector = getSelector(effect, {
      asCombinator: true,
      useFirstChild,
      addItemFilter: true,
    });

    const index = targetSequenceIndex.get(targetHash) || 0;
    targetSequenceIndex.set(targetHash, index + 1);

    const seqCustomProps = generateSequenceCustomProps(targetHash, interactionIdx, index);

    const { rules, usedProperties } = parseEffect(
      config,
      interactionIdx,
      effect,
      targetToCustomProps,
      keyframesMap,
      trigger,
      useFirstChild,
      seqCustomProps,
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
      if (!targetUsedProperties.has(targetHash)) {
        targetUsedProperties.set(targetHash, new Set(usedProperties));
      } else {
        usedProperties.forEach((p) => targetUsedProperties.get(targetHash)!.add(p));
      }
    }
  }

  const configConditions = config.conditions || {};
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
  targetToLists: Map<string, CSSCoordiantedLists>,
  keyframesMap: Map<string, Keyframe[]>,
  useFirstChild: boolean = true,
): CSSRuleData[] {
  const { effects = [], sequences = [] } = interaction;

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
    cssRules.push(
      triggerToCSS(interaction, config.conditions || {}, motionTrigger.id, useFirstChild),
    );
  }

  for (const effect of resolvedEffects) {
    const targetHash = getElementHash(effect);
    const { rules, usedProperties } = parseEffect(
      config,
      interactionIdx,
      effect,
      targetToCustomProps,
      keyframesMap,
      motionTrigger,
      useFirstChild,
    );
    cssRules.push(...rules);

    if (!targetUsedProperties.has(targetHash)) {
      targetUsedProperties.set(targetHash, new Set(usedProperties));
    } else {
      usedProperties.forEach((p) => targetUsedProperties.get(targetHash)!.add(p));
    }
  }

  const resolvedSequences = sequences
    .map((sequence) => resolveSequenceForCSS(sequence, interaction, config))
    .filter((sequence) => sequence !== null);

  cssRules.push(
    ...resolvedSequences.flatMap((sequence) =>
      parseSequence(
        config,
        interactionIdx,
        sequence,
        targetToCustomProps,
        keyframesMap,
        motionTrigger,
        useFirstChild,
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
): {
  cssRules: CSSRuleData[];
  keyframes: Map<string, Keyframe[]>;
} {
  // targetHash to lists of custom-properties for each coordinated-list type property
  // to be populated when parsing interactions
  const targetToLists = new Map<string, CSSCoordiantedLists>();
  const keyframes = new Map<string, Keyframe[]>();

  const cssRules = config.interactions.flatMap((interaction, interactionIdx) =>
    parseInteraction(config, interaction, interactionIdx, targetToLists, keyframes, useFirstChild),
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
 * @returns string containing all of the CSS rules needed for time-based animations
 */
export function generate(config: InteractConfig): string {
  const { cssRules, keyframes } = _generate(config);

  const css = [
    ...[...keyframes.entries()].map(([name, keyframes]) => keyframesToCSS(name, keyframes)),
    ...cssRules.map(CSSRuleToString),
  ];

  return css.join('\n');
}
