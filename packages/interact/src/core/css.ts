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
  InteractPluginStyles,
  GenerateOptions,
} from '../types';
import { PLUGIN_FIELD_PREFIX } from '../types';
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

/**
 * Collects build-time plugin styles for one effect config object. For every
 * `$`-prefixed field with a matching generator in `plugins`, calls the generator with the raw
 * value and a context scoped to the element, and return CSS rule(s) data. Interact
 * never inspects the field value — it only routes it to the plugin (same contract as `create()`).
 */
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
  customProps: ListCustomProps,
  trigger: TriggerVariant,
  childSelector?: string,
  plugins?: InteractPluginStyles,
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

  if (plugins) {
    rules.push(...collectFieldPluginStyles('effect', effect, key, media, plugins));
  }

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
    usedProperties = ['transition'];

    const properties = transition?.styleProperties || transitionProperties || [];
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

  return { rules: rules.filter((r) => r.declarations.length), keyframes, usedProperties };
}

function parseEffect(
  configConditions: Record<string, Condition>,
  interactionIdx: number,
  effect: ResolvedEffect,
  targetToCustomProps: Map<string, ListCustomProps>,
  keyframesMap: Map<string, Keyframe[]>,
  trigger: TriggerVariant,
  useFirstChild: boolean = true,
  plugins?: InteractPluginStyles,
  sequenceCustomProps?: Record<ListPropertyName, string>,
  precomputedTargetHash?: string,
): { rules: CSSRuleData[]; usedProperties: ListPropertyName[] } {
  const { key } = effect;
  const targetHash = precomputedTargetHash ?? getElementHash(effect);
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
    plugins,
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
  useFirstChild: boolean = true,
  targetUsedProperties?: Map<string, Set<ListPropertyName>>,
  plugins?: InteractPluginStyles,
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
      useFirstChild,
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
      useFirstChild,
      plugins,
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
  useFirstChild: boolean = true,
  plugins?: InteractPluginStyles,
): CSSRuleData[] {
  const { key, conditions, effects = [], sequences = [] } = interaction;
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

  for (const effect of resolvedEffects) {
    const targetHash = getElementHash(effect);
    const { rules, usedProperties } = parseEffect(
      configConditions,
      interactionIdx,
      effect,
      targetToCustomProps,
      keyframesMap,
      motionTrigger,
      useFirstChild,
      plugins,
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
        useFirstChild,
        targetUsedProperties,
        plugins,
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
  keyframes: Map<string, Keyframe[]>;
} {
  const { useFirstChild, plugins } = normalizeGenerateOptions(options);

  // targetHash to lists of custom-properties for each coordinated-list type property
  // to be populated when parsing interactions
  const targetToLists = new Map<string, CSSCoordinatedLists>();
  const keyframes = new Map<string, Keyframe[]>();

  const cssRules = config.interactions.flatMap((interaction, interactionIdx) =>
    parseInteraction(
      config,
      interaction,
      interactionIdx,
      targetToLists,
      keyframes,
      useFirstChild,
      plugins,
    ),
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
  const { cssRules, keyframes } = _generate(config, options);

  const css = [
    ...[...keyframes.entries()].map(([name, keyframes]) => keyframesToCSS(name, keyframes)),
    ...cssRules.map(CSSRuleToString),
  ];

  return css.join('\n');
}
