import type {
  InteractConfig,
  Interaction,
  ResolvedEffect,
  ResolvedSequence,
  Condition,
  ListPropertyName,
  CSSRuleData,
  InteractPluginStyles,
  GenerateOptions,
} from '../types';
import { PLUGIN_FIELD_PREFIX } from '../types';
import {
  camelToKebabCase,
  getStateStyleProperties,
  transitionEffectToTransitionsList,
  getFullPredicateByType,
  getSelectorCondition,
} from '../utils';
import { getSelector } from './Interact';
import { resolveEffectForCSS, resolveSequenceForCSS } from './resolvers';
import { getElementHash } from './utilities';
import {
  LIST_ANIMATION_PROPERTY_NAMES,
  LIST_PROPERTY_NAMES,
  LIST_PROPERTY_FALLBACKS,
  keyframesToCSS,
  CSSRuleToString,
  buildListsRule,
  buildAtPropertyRules,
  getCustomPropName,
  buildSequenceListsRule,
} from './cssUtils';
import { effectToAnimationOptions } from '../handlers/utilities';
import { getCSSAnimation, MotionKeyframeEffect, TriggerVariant } from '@wix/motion';

export const DEFAULT_INITIAL = [
  { name: 'visibility', value: 'hidden' },
  { name: 'transform', value: 'none', important: true },
  { name: 'translate', value: 'none', important: true },
  { name: 'scale', value: 'none', important: true },
  { name: 'rotate', value: 'none', important: true },
];

type AnimationPropertyName = (typeof LIST_ANIMATION_PROPERTY_NAMES)[number];

const LIST_PROPERTY_NAMES_MOTION: Record<AnimationPropertyName, string> = {
  animation: 'animation',
  'animation-composition': 'composition',
  'animation-timeline': 'animationTimeline',
  'animation-range': 'animationRange',
};

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
    declarations: [
      {
        name: 'view-timeline',
        value: `--${triggerId}`,
      },
    ],
  };
}

function collectFieldPluginStyles(
  scope: 'interaction' | 'effect',
  source: Record<string, unknown>,
  key: string,
  media: string,
  plugins: InteractPluginStyles,
): CSSRuleData[] {
  const rules = [];
  for (const pluginName of Object.keys(plugins)) {
    const pluginField = `${PLUGIN_FIELD_PREFIX}${pluginName}`;
    if (!(pluginField in source)) {
      continue;
    }

    rules.push(
      ...plugins[pluginName](source[pluginField], {
        key,
        scope,
        config: source,
      }).map((data) => ({ ...data, key, media })),
    );
  }
  return rules;
}

function effectToCSS(
  effect: ResolvedEffect,
  configConditions: Record<string, Condition>,
  trigger: TriggerVariant,
  customProps: Record<ListPropertyName, string>,
  childSelector?: string,
  plugins?: InteractPluginStyles,
  sequence?: ResolvedSequence,
): {
  rules: CSSRuleData[];
  keyframes: MotionKeyframeEffect[];
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

  if (plugins) {
    rules.push(...collectFieldPluginStyles('effect', effect, key, media, plugins));
  }

  if (namedEffect || keyframeEffect) {
    const animationOptions = effectToAnimationOptions(effect);
    const cssAnimations = getCSSAnimation(null, animationOptions, trigger, sequence).filter(
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
            return (animation as Record<string, unknown>)[name];
          })
          .join(', ') || LIST_PROPERTY_FALLBACKS[propertyName],
    }));

    if (initial) {
      // declare animation custom properties with initial dependent on data-motion-enter
      rules.push({
        key,
        media,
        selectorCondition,
        childSelector,
        declarations: DEFAULT_INITIAL,
        selectorSuffix: ':not([data-interact-enter])',
      });
      rules.push({
        key,
        media,
        selectorCondition,
        childSelector,
        declarations: animationDeclarations,
        selectorSuffix: ':not([data-interact-enter="done"])',
      });
    } else {
      // declare animation custom properties
      declarations.push(...animationDeclarations);
    }
  } else if (transition || transitionProperties) {
    const properties = getStateStyleProperties(effect);
    const transitions = transitionEffectToTransitionsList(effect);

    // declaring transition custom property
    declarations.push({
      name: customProps.transition,
      value: transitions.join(', ') || LIST_PROPERTY_FALLBACKS.transition,
    });

    // adding state rule
    rules.push({
      key,
      media,
      selectorCondition,
      childSelector,
      states: [effectId],
      declarations: properties,
    });
  } else {
    // setting off animation custom properties
    declarations.push(
      ...LIST_ANIMATION_PROPERTY_NAMES.map((propertyName) => ({
        name: customProps[propertyName],
        value: LIST_PROPERTY_FALLBACKS[propertyName],
      })),
    );
  }

  return { rules: rules.filter((r) => r.declarations.length), keyframes };
}

function parseEffect(
  effect: ResolvedEffect,
  configConditions: Record<string, Condition>,
  trigger: TriggerVariant,
  targetsMap: Map<string, {
    key: string;
    childSelector?: string;
    animationIndex: number;
    transitionIndex: number;
    usedAnimationSlots: number;
    usedTransitionSlots: number;
    reservedAnimationSlots: number;
    reservedTransitionSlots: number;
    sequenceAnimationIndex: number;
    sequenceTransitionIndex: number;
    hasAnimation: boolean;
    hasTransition: boolean;
  }>,
  visited: Set<string>,
  keyframesMap: Map<string, Keyframe[]>,
  useFirstChild: boolean = true,
  plugins?: InteractPluginStyles,
  sequence?: ResolvedSequence,
): CSSRuleData[] {
  const { key } = effect;
  const targetHash = getElementHash(effect);
  const childSelector = getSelector(effect, {
    asCombinator: true,
    useFirstChild,
    addItemFilter: true,
  });

  const current = targetsMap.get(targetHash) || {
    key,
    childSelector,
    animationIndex: 0,
    transitionIndex: 0,
    usedAnimationSlots: 0,
    usedTransitionSlots: 0,
    reservedAnimationSlots: 0,
    reservedTransitionSlots: 0,
    sequenceAnimationIndex: 0,
    sequenceTransitionIndex: 0,
    hasAnimation: false,
    hasTransition: false,
  };
  visited.add(targetHash);

  const customProps = LIST_PROPERTY_NAMES.reduce(
    (acc, name) => {
      acc[name] = sequence
        ? getCustomPropName(
          name,
          name === 'transition'
            ? current.usedTransitionSlots + current.sequenceTransitionIndex
            : current.usedAnimationSlots + current.sequenceAnimationIndex,
          true
        ) : getCustomPropName(
          name,
          name === 'transition'
            ? current.transitionIndex
            : current.animationIndex
        );
      return acc;
    },
    {} as Record<ListPropertyName, string>
  );

  const { rules, keyframes } = effectToCSS(
    effect,
    configConditions,
    trigger,
    customProps,
    childSelector,
    plugins,
    sequence,
  );

  keyframes.forEach(({ name, keyframes }) => keyframesMap.set(name, keyframes));

  const hasAnimation = Boolean(effect.namedEffect || effect.keyframeEffect);
  const hasTransition = Boolean(effect.transition || effect.transitionProperties);
  current.hasAnimation ||= hasAnimation;
  current.hasTransition ||= hasTransition;
  if (sequence) {
    current.sequenceAnimationIndex += hasAnimation ? 1 : 0;
    current.sequenceTransitionIndex += hasTransition ? 1 : 0;
  }
  targetsMap.set(targetHash, current);

  return rules;
}

function parseSequence(
  sequence: ResolvedSequence,
  configConditions: Record<string, Condition>,
  trigger: TriggerVariant,
  targetsMap: Map<string, {
    key: string;
    childSelector?: string;
    animationIndex: number;
    transitionIndex: number;
    usedAnimationSlots: number;
    usedTransitionSlots: number;
    reservedAnimationSlots: number;
    reservedTransitionSlots: number;
    sequenceAnimationIndex: number;
    sequenceTransitionIndex: number;
    hasAnimation: boolean;
    hasTransition: boolean;
  }>,
  visited: Set<string>,
  keyframesMap: Map<string, Keyframe[]>,
  useFirstChild: boolean = true,
  plugins?: InteractPluginStyles,
): CSSRuleData[] {
  const cssRules: CSSRuleData[] = [];

  const localVisited = new Set<string>();

  for (const effect of sequence.effects) {
    const rules = parseEffect(
      effect,
      configConditions,
      trigger,
      targetsMap,
      localVisited,
      keyframesMap,
      useFirstChild,
      plugins,
      sequence,
    );
    cssRules.push(...rules);
  }

  const { conditions } = sequence;

  localVisited.forEach((targetHash) => {
    visited.add(targetHash);
    const current = targetsMap.get(targetHash)!;

    current.reservedAnimationSlots = Math.max(current.reservedAnimationSlots, current.sequenceAnimationIndex);
    current.reservedTransitionSlots = Math.max(current.reservedTransitionSlots, current.sequenceTransitionIndex);
    const rule = buildSequenceListsRule(
      current.sequenceAnimationIndex,
      current.sequenceTransitionIndex,
      current.animationIndex,
      current.transitionIndex,
      current.usedAnimationSlots,
      current.usedTransitionSlots,
      current.key,
      current.childSelector,
      conditions,
      configConditions,
    );
    if (rule) {
      cssRules.push(rule);
    }

    current.sequenceAnimationIndex = 0;
    current.sequenceTransitionIndex = 0;

  });

  return cssRules;
}

function parseInteraction(
  config: InteractConfig,
  interaction: Interaction,
  interactionIdx: number,
  targetsMap: Map<string, {
    key: string;
    childSelector?: string;
    animationIndex: number;
    transitionIndex: number;
    usedAnimationSlots: number;
    usedTransitionSlots: number;
    reservedAnimationSlots: number;
    reservedTransitionSlots: number;
    sequenceAnimationIndex: number;
    sequenceTransitionIndex: number;
    hasAnimation: boolean;
    hasTransition: boolean;
  }>,
  keyframesMap: Map<string, Keyframe[]>,
  useFirstChild: boolean = true,
  plugins?: InteractPluginStyles,
): CSSRuleData[] {
  const { key, conditions, effects = [], sequences = [] } = interaction;
  const configConditions = config.conditions || {};

  const cssRules = plugins
    ? collectFieldPluginStyles(
        'interaction',
        interaction,
        key,
        getFullPredicateByType(conditions, configConditions, 'media'),
        plugins,
      )
    : [];

  const { trigger } = interaction;
  const motionTrigger = {
    trigger: camelToKebabCase(trigger),
    id: ['trigger', interactionIdx].join('-'),
    componentId: '',
  } as TriggerVariant;
  if (trigger === 'viewProgress') {
    cssRules.push(triggerToCSS(interaction, configConditions, motionTrigger.id, useFirstChild));
  }

  const visited = new Set<string>();

  const resolvedEffects = effects
    .map((effect, effIndex) =>
      resolveEffectForCSS(effect, interaction, config, `eff-${interactionIdx}-${effIndex}`),
    )
    .filter((effect) => effect !== null);

  cssRules.push(...resolvedEffects.flatMap((effect) => parseEffect(
    effect,
    configConditions,
    motionTrigger,
    targetsMap,
    visited,
    keyframesMap,
    useFirstChild,
    plugins,
  )));

  const resolvedSequences = sequences
    .map((sequence, seqIndex) =>
      resolveSequenceForCSS(sequence, interaction, config, `seq-${interactionIdx}-${seqIndex}`),
    )
    .filter((sequence) => sequence !== null);

  cssRules.push(...resolvedSequences.flatMap((sequence) => parseSequence(
    sequence,
    configConditions,
    motionTrigger,
    targetsMap,
    visited,
    keyframesMap,
    useFirstChild,
    plugins,
  )));

  visited.forEach((targetHash) => {
    const current = targetsMap.get(targetHash)!;
    current.animationIndex += current.hasAnimation ? 1 : 0;
    current.transitionIndex += current.hasTransition ? 1 : 0;
    current.usedAnimationSlots += current.reservedAnimationSlots;
    current.usedTransitionSlots += current.reservedTransitionSlots;
    current.reservedAnimationSlots = 0;
    current.reservedTransitionSlots = 0;
    current.hasAnimation = false;
    current.hasTransition = false;
  });

  return cssRules;
}

// ----- EndPoints -----

/**
 * Normalizes `generate()`'s single optional argument, which is either the legacy `useFirstChild`
 * boolean or an options bag.
 */
function normalizeGenerateOptions(options: boolean | GenerateOptions = {}): {
  useFirstChild: boolean;
  plugins?: InteractPluginStyles;
} {
  const { useFirstChild = true, plugins } =
    typeof options === 'boolean' ? { useFirstChild: options, plugins: undefined } : options;

  return { useFirstChild, plugins };
}

export function _generate(
  config: InteractConfig,
  options?: boolean | GenerateOptions,
): {
  cssRules: CSSRuleData[];
  listsRule: string;
  keyframes: Map<string, Keyframe[]>;
  atProperty: string[];
} {
  const { useFirstChild, plugins } = normalizeGenerateOptions(options);

  const targetsMap = new Map<string, {
    key: string;
    childSelector?: string;
    animationIndex: number;
    transitionIndex: number;
    usedAnimationSlots: number;
    usedTransitionSlots: number;
    reservedAnimationSlots: number;
    reservedTransitionSlots: number;
    sequenceAnimationIndex: number;
    sequenceTransitionIndex: number;
    hasAnimation: boolean;
    hasTransition: boolean;
  }>();
  const keyframes = new Map<string, Keyframe[]>();

  const cssRules = config.interactions.flatMap((interaction, interactionIdx) =>
    parseInteraction(
      config,
      interaction,
      interactionIdx,
      targetsMap,
      keyframes,
      useFirstChild,
      plugins,
    ),
  );

  const targets = [...targetsMap.values()];

  const animationLength = Math.max(...targets.map(({ animationIndex }) => animationIndex));
  const transitionLength = Math.max(...targets.map(({ transitionIndex }) => transitionIndex));
  const listsRule = buildListsRule(targets, animationLength, transitionLength);

  const animationSlotLength = Math.max(...targets.map(({ usedAnimationSlots }) => usedAnimationSlots));
  const transitionSlotLength = Math.max(...targets.map(({ usedTransitionSlots }) => usedTransitionSlots));
  const atProperty = buildAtPropertyRules(
    animationLength, transitionLength, animationSlotLength, transitionSlotLength
  );

  return { keyframes, atProperty, cssRules, listsRule };
}
/**
 * Generates CSS for animations from an InteractConfig.
 *
 * @param config - The interact configuration containing effects and interactions
 * @param options - Either a {@link GenerateOptions} bag or — for backwards compatibility — a bare
 *   boolean used as `useFirstChild`:
 *
 *   - `useFirstChild` - Whether to use the first child selector (default: true)
 *   - `plugins` - Optional map of plugin name → SSR style generator. For every `$<name>` field in
 *       the config, the matching generator is called with the field's (opaque) value and a context;
 *       its returned CSS is appended. Used e.g. to hide pre-split text for FOUC prevention.
 *       Interact never inspects the field value — mirroring `create()`/`use()`.
 *
 * @returns string containing all of the CSS rules needed for time-based animations
 */
export function generate(config: InteractConfig, options?: boolean | GenerateOptions): string {
  const { cssRules, keyframes, atProperty, listsRule } = _generate(config, options);

  const css = [
    ...atProperty,
    ...[...keyframes.entries()].map(([name, keyframes]) => keyframesToCSS(name, keyframes)),
    ...cssRules.map(CSSRuleToString),
    listsRule
  ];

  return css.join('\n');
}
