import type {
  InteractConfig,
  Effect,
  EffectRef,
  EffectBase,
  StateEffect,
  Interaction,
  ResolvedEffect,
  ResolvedSequence,
  Condition,
  SequenceConfig,
  SequenceConfigRef,
  ListPropName,
  ListCustomProps,
  CoordLists,
  RuleObj,
} from '../types';
import {
  roundNumber,
  isTemplatedKey,
  kebabCustomProp,
  transitionEffectToTransitionsList,
  generateId,
  getFullPredicateByType,
  getSelectorCondition,
  applySelectorCondition,
  calculateSequenceEffectsOffsets,
} from '../utils';
import { getSelector } from './Interact';
import {
  getElementHash,
  getUniqueEncodedHash,
  shouldUseInitial,
  keyframePropertyToCSS,
  interpolateKeyframesOffsets,
} from './utilities';
import { effectToAnimationOptions } from '../handlers/utilities';
import { getCSSAnimation, MotionKeyframeEffect, NamedEffect, getJsEasing } from '@wix/motion';

const DEFAULT_INITIAL = [
  { name: 'visibility', value: 'hidden' },
  { name: 'transform', value: 'none' },
  { name: 'translate', value: 'none' },
  { name: 'scale', value: 'none' },
  { name: 'rotate', value: 'none' },
];

const EMPTY_KEYFRAMES_EFFECT = { name: 'interact-empty-kf-effect', keyframes: [{}, {}] };

// ----- Helpers -----

function CSSRuleToString(rule: RuleObj): string {
  const { key, childSelector, declarations, media, states, selectorCondition, addInitialSelector } =
    rule;
  if (!declarations.length) {
    return '';
  }

  let selector = `[data-interact-key="${key}"]${
    addInitialSelector ? ':where(:not([data-interact-enter]))' : ''
  }`;

  // maybe nesting is simpler? - no need for `:where` only adding `&` before every option
  if (states && states.length) {
    const statesSelector = states
      .map((state) => `:state(${state}), :--${state}, [data-interact-effect~="${state}"]`)
      .join(', ');
    // :where to add no specificity and allow following stateless rules on same target
    // to be as specific and override
    selector = `${selector}:where(${statesSelector})`;
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

function buildListsRule(
  lists: CoordLists,
  customProps?: ListCustomProps,
  conditions?: string[],
  configConditions?: Record<string, Condition>,
): RuleObj {
  const { key, childSelector, props } = lists;

  const declarations = Object.entries(props).map(([name, { fallback, customProps }]) => ({
    name,
    value: customProps.map((n) => `var(${n}, ${fallback})`).join(', '),
  }));

  const rule: RuleObj = { key, childSelector, declarations };

  // option to assign into custom-props instead of directly into the actual css properties
  if (customProps) {
    rule.declarations.forEach((declaration) => {
      declaration.name = customProps[declaration.name as ListPropName];
    });
  }

  // option to add conditions to the rules
  if (conditions) {
    rule.media = getFullPredicateByType(conditions, configConditions || {}, 'media');
    rule.selectorCondition = getSelectorCondition(conditions, configConditions || {});
  }

  return rule;
}

// ----- Resolvers -----

function resolveEffectForCSS(
  effect: Effect | EffectRef,
  interaction: Interaction,
  config: InteractConfig,
): ResolvedEffect | null {
  const { effects = {}, conditions: configConditions = {} } = config;
  const { key: interactionKey, trigger } = interaction;
  const isPointerMove = trigger === 'pointerMove';

  // ensuring the original refernce of the effect has an id (required for states)
  if (!effect.effectId) {
    effect.effectId = generateId();
  }
  const { effectId } = effect;

  const fullEffect: EffectBase &
    StateEffect & {
      namedEffect?: NamedEffect;
      customEffect?: (element: Element, progress: any) => void;
      keyframeEffect?: MotionKeyframeEffect;
    } = { ...(effects[effectId] || {}), ...effect };

  let { key, conditions } = fullEffect;

  if (!key) {
    if (!interactionKey) {
      return null;
    }
    key = interactionKey;
  }
  if (isTemplatedKey(key)) {
    // should probably find a way to support those
    return null;
  }
  // TODO: handle here any key escaping if needed

  conditions = [
    ...new Set(...(conditions || []).filter((condition: string) => configConditions[condition])),
  ];

  const { namedEffect, customEffect, keyframeEffect, transition, transitionProperties, ...rest } = {
    ...fullEffect,
    key,
    conditions,
    effectId,
    initial: shouldUseInitial(interaction, { key, ...fullEffect }),
  };

  if (namedEffect) {
    // With the 2D nature of pointerMove namedEffects, there is no easy way to mimic the
    // behavior with CSSAnimations.
    return isPointerMove || !namedEffect.type ? null : { namedEffect, ...rest };
  } else if (keyframeEffect) {
    // Need to verify validity of name for CSS?
    if (!keyframeEffect.name) {
      const canUseEffectId = effectId && !(effects[effectId] && 'keyframeEffect' in effect);
      keyframeEffect.name = canUseEffectId ? effectId : generateId();
    }
    return { keyframeEffect, ...rest };
  } else if (customEffect) {
    return isPointerMove ? null : { keyframeEffect: EMPTY_KEYFRAMES_EFFECT, ...rest };
  } else if (transition) {
    return { transition, ...rest };
  } else {
    return transitionProperties ? { transitionProperties, ...rest } : rest;
  }
}

function resolveSequenceForCSS(
  sequence: SequenceConfig | SequenceConfigRef,
  interaction: Interaction,
  config: InteractConfig,
): ResolvedSequence | null {
  const { sequences = {}, conditions: configConditions = {} } = config;

  // required?
  if (!sequence.sequenceId) {
    sequence.sequenceId = generateId();
  }

  const { sequenceId } = sequence;
  const fullSequence = { ...(sequences[sequenceId] || {}), ...sequence };

  let { effects, conditions, delay = 0, offset = 0, offsetEasing = 'linear' } = fullSequence;

  conditions = [
    ...new Set(...(conditions || []).filter((condition: string) => configConditions[condition])),
  ];
  // resolving effects and cascading the conditions from sequence
  const resolvedEffects = effects.map((effect) => {
    if (!effect.conditions) {
      effect.conditions = [...conditions];
    } else {
      effect.conditions.push(...conditions);
    }
    return resolveEffectForCSS(effect, interaction, config);
  });

  // resolving offsets
  if (!(typeof offsetEasing === 'function')) {
    offsetEasing = getJsEasing(offsetEasing) || ((x) => x);
  }
  calculateSequenceEffectsOffsets(resolvedEffects, delay, offset, offsetEasing);

  // removing unsupported effects and the whole sequence if all are unsupported
  const filteredEffects = resolvedEffects.filter((effect) => effect !== null);
  if (!filteredEffects.length) {
    return null;
  }

  return {
    sequenceId,
    conditions,
    delay,
    offset,
    offsetEasing,
    effects: filteredEffects,
  };
}

// ----- Keyframes CSS -----

function keyframeObjectToKeyframeCSS(keyframeObj: Keyframe, percentage: number): string {
  const props = Object.entries(keyframeObj)
    .filter(([key, value]) => key !== 'offset' && value !== undefined && value !== null)
    .map(([key, value]) => {
      const cssKey = keyframePropertyToCSS(key);
      return `${cssKey}: ${value};`;
    })
    .join('\n');
  return `${percentage}% {\n${props}\n}`;
}

function keyframesToCSS(name: string, keyframes: Keyframe[]): string {
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

// ----- Map Updaters -----

function pushToTargetCustomPropsLists(
  targetToLists: Map<string, CoordLists>,
  targetHash: string,
  customProps: Omit<ListCustomProps, 'statePropsToInvalidate'>,
): void {
  const {
    key,
    childSelector,
    animation,
    transition,
    'animation-composition': animationComposition,
  } = customProps;

  if (!targetToLists.has(targetHash)) {
    targetToLists.set(targetHash, {
      key,
      childSelector,
      props: {
        animation: {
          fallback: 'none',
          customProps: [animation],
        },
        'animation-composition': {
          fallback: 'replace',
          customProps: [animationComposition],
        },
        transition: {
          fallback: '_',
          customProps: [transition],
        },
      },
    });
  } else {
    const { props } = targetToLists.get(targetHash)!;
    (Object.keys(props) as ListPropName[]).forEach((name) =>
      props[name].customProps.push(customProps[name]),
    );
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
    const props = (['animation', 'animation-composition', 'transition'] as ListPropName[]).reduce(
      (acc, name) => {
        acc[name] = kebabCustomProp([name, interactionIdx, getUniqueEncodedHash(targetHash)]);
        return acc;
      },
      {} as Record<ListPropName, string>,
    );
    targetToCustomProps.set(targetHash, {
      key,
      childSelector,
      statePropsToInvalidate: new Set<string>(),
      ...props,
    });
  }

  return targetToCustomProps.get(targetHash)!;
}

function getSequenceCustomPropsForTarget(
  targetHash: string,
  key: string,
  interactionIdx: number,
  targetToSequenceLists: Map<string, CoordLists & { statePropsToInvalidate: Set<string> }>,
  childSelector?: string,
): Record<ListPropName, string> {
  const index = targetToSequenceLists.get(targetHash)?.props?.animation.customProps.length || 0;
  const props = (['animation', 'animation-composition', 'transition'] as ListPropName[]).reduce(
    (acc, name) => {
      acc[name] = kebabCustomProp([name, interactionIdx, index, getUniqueEncodedHash(targetHash)]);
      return acc;
    },
    {} as Record<ListPropName, string>,
  );

  pushToTargetCustomPropsLists(targetToSequenceLists, targetHash, { key, childSelector, ...props });

  const sequenceList = targetToSequenceLists.get(targetHash)!;
  if (!sequenceList.statePropsToInvalidate) {
    sequenceList.statePropsToInvalidate = new Set<string>();
  }

  return props;
}

// ----- Parsers -----

function effectToCSS(
  effect: ResolvedEffect,
  configConditions: Record<string, Condition>,
  customProps: ListCustomProps,
  targetHash: string,
  childSelector?: string,
): {
  rules: RuleObj[];
  keyframes: MotionKeyframeEffect[];
  statePropsToInvalidate: Set<string>;
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

  const rules: RuleObj[] = [
    {
      key,
      media,
      selectorCondition,
      childSelector,
      // invalidating earlier cascaded custom properties affected from earlier transitionEffects
      // to implement same-interaction-cascade
      declarations: [...customProps.statePropsToInvalidate].map((name) => ({ name, value: ' ' })),
    },
  ];
  let keyframes: MotionKeyframeEffect[] = [];
  let statePropsToInvalidate = new Set<string>();

  const { declarations } = rules[0];

  if (namedEffect || keyframeEffect) {
    const animationOptions = effectToAnimationOptions(effect);
    const cssAnimations = getCSSAnimation(null, animationOptions).filter((anim) => anim.name);

    // accumulate keyframes
    keyframes = cssAnimations.map((anim) => ({
      name: anim.name as string,
      keyframes: anim.keyframes,
    }));

    // turning off cascaded transition
    declarations.push({
      name: customProps.transition,
      value: '_',
    });

    // declare custom parameters
    declarations.push(
      ...cssAnimations.flatMap(({ custom }) =>
        Object.entries(custom || {})
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => ({ name: key, value: value as string | number })),
      ),
    );

    const animationDeclarations = [
      {
        name: customProps.animation,
        value: cssAnimations.map(({ animation }) => animation).join(', '),
      },
      {
        name: customProps['animation-composition'],
        value: cssAnimations.map(({ composition }) => composition || 'replace').join(', '),
      },
    ];

    if (initial) {
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
    const properties = transition?.styleProperties || transitionProperties || [];
    const transitions = transitionEffectToTransitionsList(effect);

    // accumulating props affected by transition
    const stateProps = properties.map(
      ({ name }) => `--${name}-${getUniqueEncodedHash(targetHash)}`,
    );
    statePropsToInvalidate = new Set(stateProps);

    // turning off cascaded animation
    declarations.push(
      {
        name: customProps.animation,
        value: 'none',
      },
      {
        name: customProps['animation-composition'],
        value: 'replace',
      },
    );

    // declaring transition custom property
    declarations.push({
      name: customProps.transition,
      value: transitions.join(', '),
    });

    // adding state rule using custom properties that could be overriden to implement
    // same-interaction-cascade
    rules.push({
      key,
      media,
      selectorCondition,
      childSelector,
      states: [effectId],
      declarations: stateProps.flatMap((name, index) => [
        { name, value: properties[index].value },
        { name: properties[index].name, value: `var(${name}, )` },
      ]),
    });
  } else {
    // setting off animation, composition and transition custom properties
    declarations.push(
      {
        name: customProps.animation,
        value: 'none',
      },
      {
        name: customProps['animation-composition']!,
        value: 'replace',
      },
      {
        name: customProps.transition,
        value: '_',
      },
    );
  }

  return { rules, keyframes, statePropsToInvalidate };
}

function parseEffect(
  config: InteractConfig,
  interactionIdx: number,
  effect: ResolvedEffect,
  targetToCustomProps: Map<string, ListCustomProps>,
  keyframesMap: Map<string, Keyframe[]>,
  useFirstChild: boolean = true,
  // to use inside sequences to update the sequence's coordinated list without
  // breaking cascade logic
  targetToSequenceLists?: Map<string, CoordLists & { statePropsToInvalidate: Set<string> }>,
): RuleObj[] {
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
  if (targetToSequenceLists) {
    const props = getSequenceCustomPropsForTarget(
      targetHash,
      key,
      interactionIdx,
      targetToSequenceLists,
      childSelector,
    );
    Object.assign(localCustomProps, props);
  }

  // process effect into css-rules and keyframes
  const { rules, keyframes, statePropsToInvalidate } = effectToCSS(
    effect,
    configConditions,
    localCustomProps,
    targetHash,
    childSelector,
  );

  // in case effect is part of a sequence, we do not want to invalidate the props affected by current transitionEffect
  // in preceeding effects in the same sequence, so instead we update them on targetToSequenceLists to be added
  // later after parsing all of the effects of the sequence
  if (targetToSequenceLists) {
    localCustomProps.statePropsToInvalidate =
      targetToSequenceLists.get(targetHash)!.statePropsToInvalidate;
  }
  statePropsToInvalidate.forEach(localCustomProps.statePropsToInvalidate.add);

  // update keyframes map
  keyframes.forEach(({ name, keyframes }) => keyframesMap.set(name, keyframes));

  return rules;
}

function parseSequence(
  config: InteractConfig,
  interactionIdx: number,
  sequence: ResolvedSequence,
  targetToCustomProps: Map<string, ListCustomProps>,
  keyframesMap: Map<string, Keyframe[]>,
  useFirstChild: boolean = true,
): RuleObj[] {
  // in a similar manner to how we treat different interactions and use lists to concatenate them
  // instead of overriding, we use the same mechanism to allow all of the effects of a sequence to
  // exist together on the same target -
  // targetHash to lists of custom-properties for each coordinated-list type property
  // to be populated when parsing effects
  const targetToSequenceLists = new Map<
    string,
    CoordLists & { statePropsToInvalidate: Set<string> }
  >();

  const cssRules = sequence.effects.flatMap((effect) =>
    parseEffect(
      config,
      interactionIdx,
      effect,
      targetToCustomProps,
      keyframesMap,
      useFirstChild,
      targetToSequenceLists,
    ),
  );

  const configConditions = config.conditions || {};
  const { conditions } = sequence;

  targetToSequenceLists.forEach((lists, targetHash) => {
    const customProps = targetToCustomProps.get(targetHash)!;
    // updating set of props affected by transitionEffects on that target to invalidate on preceeding sequences
    lists.statePropsToInvalidate.forEach(customProps.statePropsToInvalidate.add);

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
  targetToLists: Map<string, CoordLists>,
  keyframesMap: Map<string, Keyframe[]>,
  useFirstChild: boolean = true,
): RuleObj[] {
  const { effects = [], sequences = [] } = interaction;

  // targetHash to custom-property per each coordinated-list type property for current interaction
  // to be populated when parsing the effects (since it is per target).
  // Each interaction uses a single custom-property for each coordinated-list type property,
  // to provide cascading in the array of effects - e.g. effects in the interaction array with exact same target
  // will populate the same per-interaction custom-property (e.g. `--animation-${interactionIdx}-${targetUniqueSuffix}`)
  // and the last one will be applied.
  const targetToCustomProps = new Map<string, ListCustomProps>();

  const resolvedEffects = effects
    .map((effect) => resolveEffectForCSS(effect, interaction, config))
    .filter((effect) => effect !== null);

  const cssRules = resolvedEffects.flatMap((effect) =>
    parseEffect(config, interactionIdx, effect, targetToCustomProps, keyframesMap, useFirstChild),
  );

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
        useFirstChild,
      ),
    ),
  );

  // after processing all of the effects, we add to the lists of custom-properties per target
  // the new interaction's custom-property names
  targetToCustomProps.forEach((customProps, targetHash) => {
    pushToTargetCustomPropsLists(targetToLists, targetHash, customProps);
  });

  return cssRules;
}

// ----- EndPoints -----

export function _generate(
  config: InteractConfig,
  useFirstChild: boolean = true,
): {
  cssRules: RuleObj[];
  keyframes: MotionKeyframeEffect[];
} {
  // targetHash to lists of custom-properties for each coordinated-list type property
  // to be populated when parsing interactions
  const targetToLists = new Map<string, CoordLists>();
  const keyframesMap = new Map<string, Keyframe[]>();

  const cssRules = config.interactions.flatMap((interaction, interactionIdx) =>
    parseInteraction(
      config,
      interaction,
      interactionIdx,
      targetToLists,
      keyframesMap,
      useFirstChild,
    ),
  );

  // for each target add unconditional rule for the coordinated lists from interactions targeting it
  targetToLists.forEach((lists) => {
    cssRules.push(buildListsRule(lists));
  });

  const keyframes = Object.entries(keyframesMap).map(([name, keyframes]) => ({ name, keyframes }));

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
    ...keyframes.map(({ name, keyframes }) => keyframesToCSS(name, keyframes)),
    ...cssRules.map(CSSRuleToString),
  ];

  return css.join('\n');
}
