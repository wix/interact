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
  LIST_KINDS,
  listKind,
} from './cssUtils';
import type { ListKind, ListSlots } from './cssUtils';
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

type ListCounters = ListSlots & {
  slotsInInteraction: number;
  touched: boolean;
};
type TargetContext = {
  key: string;
  childSelector?: string;
  assigned: Set<string>;
  animation: ListCounters;
  transition: ListCounters;
};
type TargetsMap = Map<string, TargetContext>;

type GenerateContext = {
  config: InteractConfig;
  configConditions: Record<string, Condition>;
  targetsMap: TargetsMap;
  keyframesMap: Map<string, Keyframe[]>;
  useFirstChild: boolean;
  plugins?: InteractPluginStyles;
};

function createTargetContext(key: string, childSelector?: string): TargetContext {
  const createListCounters = (): ListCounters => ({
    listIndex: 0,
    slotCursor: 0,
    slotsInInteraction: 0,
    slotsInSequence: 0,
    touched: false,
  });

  return {
    key,
    childSelector,
    assigned: new Set<string>(),
    animation: createListCounters(),
    transition: createListCounters(),
  };
}

function getCustomProps(
  target: TargetContext,
  inSequence: boolean,
): Record<ListPropertyName, string> {
  return Object.fromEntries(
    LIST_PROPERTY_NAMES.map((name) => {
      const { listIndex, slotCursor, slotsInSequence } = target[listKind(name)];
      return [
        name,
        inSequence
          ? getCustomPropName(name, slotCursor + slotsInSequence, true)
          : getCustomPropName(name, listIndex),
      ];
    }),
  ) as Record<ListPropertyName, string>;
}

function endEffect(
  target: TargetContext,
  wrote: Record<ListKind, boolean>,
  inSequence: boolean,
): void {
  LIST_KINDS.forEach((kind) => {
    if (!wrote[kind]) {
      return;
    }

    target[kind].touched = true;
    if (inSequence) {
      target[kind].slotsInSequence += 1;
    }
  });
}

function endSequence(target: TargetContext): void {
  LIST_KINDS.forEach((kind) => {
    const counters = target[kind];
    counters.slotsInInteraction = Math.max(counters.slotsInInteraction, counters.slotsInSequence);
    counters.slotsInSequence = 0;
  });
}

function endInteraction(target: TargetContext): void {
  LIST_KINDS.forEach((kind) => {
    const counters = target[kind];
    counters.listIndex += counters.touched ? 1 : 0;
    counters.slotCursor += counters.slotsInInteraction;
    counters.slotsInInteraction = 0;
    counters.touched = false;
  });
}

const LIST_PROPERTY_NAMES_MOTION: Record<AnimationPropertyName, string> = {
  animation: 'animation',
  'animation-composition': 'composition',
  'animation-timeline': 'animationTimeline',
  'animation-range': 'animationRange',
};

function triggerToCSS(
  ctx: GenerateContext,
  interaction: Interaction,
  triggerId: string,
): CSSRuleData {
  const { key, conditions } = interaction;

  const media = getFullPredicateByType(conditions, ctx.configConditions, 'media');
  const selectorCondition = getSelectorCondition(conditions, ctx.configConditions);

  const childSelector = getSelector(interaction, {
    asCombinator: true,
    useFirstChild: ctx.useFirstChild,
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
  ctx: GenerateContext,
  effect: ResolvedEffect,
  target: TargetContext,
  trigger: TriggerVariant,
  customProps: Record<ListPropertyName, string>,
  sequence?: ResolvedSequence,
): {
  rules: CSSRuleData[];
  keyframes: MotionKeyframeEffect[];
  wrote: Record<ListKind, boolean>;
} {
  const { assigned, childSelector } = target;
  const wrote: Record<ListKind, boolean> = { animation: false, transition: false };
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

  const media = getFullPredicateByType(conditions, ctx.configConditions, 'media');
  const selectorCondition = getSelectorCondition(conditions, ctx.configConditions);

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

  if (ctx.plugins) {
    rules.push(...collectFieldPluginStyles('effect', effect, key, media, ctx.plugins));
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
    // TODO - register those to define with @property to prevent unintended override
    declarations.push(
      ...cssAnimations.flatMap(({ custom }) =>
        Object.entries(custom || {})
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => ({ name: key, value: value as string | number })),
      ),
    );

    const animationDeclarations = LIST_ANIMATION_PROPERTY_NAMES.map((propertyName) => ({
      _listPropertyName: propertyName,
      name: customProps[propertyName],
      value: cssAnimations
        .map((animation) => {
          const name = LIST_PROPERTY_NAMES_MOTION[propertyName];
          return (
            (animation as Record<string, unknown>)[name] || LIST_PROPERTY_FALLBACKS[propertyName]
          );
        })
        .join(', '),
    })).filter(
      ({ _listPropertyName, name, value }) =>
        value !== LIST_PROPERTY_FALLBACKS[_listPropertyName] || assigned.has(name),
    );
    animationDeclarations.forEach(({ name }) => assigned.add(name));
    wrote.animation = animationDeclarations.length > 0;

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
    if (transitions.length || assigned.has(customProps.transition)) {
      declarations.push({
        name: customProps.transition,
        value: transitions.join(', ') || LIST_PROPERTY_FALLBACKS.transition,
      });
      assigned.add(customProps.transition);
      wrote.transition = true;
    }

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
      ...LIST_ANIMATION_PROPERTY_NAMES.filter((propertyName) =>
        assigned.has(customProps[propertyName]),
      ).map((propertyName) => ({
        name: customProps[propertyName],
        value: LIST_PROPERTY_FALLBACKS[propertyName],
      })),
    );
  }

  return { rules: rules.filter((r) => r.declarations.length), keyframes, wrote };
}

function parseEffect(
  ctx: GenerateContext,
  effect: ResolvedEffect,
  trigger: TriggerVariant,
  visited: Set<string>,
  sequence?: ResolvedSequence,
): CSSRuleData[] {
  const targetHash = getElementHash(effect);
  const current =
    ctx.targetsMap.get(targetHash) ||
    createTargetContext(
      effect.key,
      getSelector(effect, {
        asCombinator: true,
        useFirstChild: ctx.useFirstChild,
        addItemFilter: true,
      }),
    );
  visited.add(targetHash);

  const inSequence = Boolean(sequence);
  const customProps = getCustomProps(current, inSequence);

  const { rules, keyframes, wrote } = effectToCSS(
    ctx,
    effect,
    current,
    trigger,
    customProps,
    sequence,
  );

  keyframes.forEach(({ name, keyframes }) => ctx.keyframesMap.set(name, keyframes));

  endEffect(current, wrote, inSequence);
  ctx.targetsMap.set(targetHash, current);

  return rules;
}

function parseSequence(
  ctx: GenerateContext,
  sequence: ResolvedSequence,
  trigger: TriggerVariant,
  visited: Set<string>,
): CSSRuleData[] {
  const cssRules: CSSRuleData[] = [];

  const localVisited = new Set<string>();

  cssRules.push(
    ...sequence.effects.flatMap((effect) =>
      parseEffect(ctx, effect, trigger, localVisited, sequence),
    ),
  );

  const { conditions } = sequence;

  localVisited.forEach((targetHash) => {
    visited.add(targetHash);
    const current = ctx.targetsMap.get(targetHash)!;

    const rule = buildSequenceListsRule(current, conditions, ctx.configConditions);
    if (rule) {
      rule.declarations.forEach(({ name }) => current.assigned.add(name));
      cssRules.push(rule);
    }

    endSequence(current);
  });

  return cssRules;
}

function parseInteraction(
  ctx: GenerateContext,
  interaction: Interaction,
  interactionIdx: number,
): CSSRuleData[] {
  const { key, conditions, effects = [], sequences = [] } = interaction;

  const cssRules = ctx.plugins
    ? collectFieldPluginStyles(
        'interaction',
        interaction,
        key,
        getFullPredicateByType(conditions, ctx.configConditions, 'media'),
        ctx.plugins,
      )
    : [];

  const { trigger } = interaction;
  const motionTrigger = {
    trigger: camelToKebabCase(trigger),
    id: ['trigger', interactionIdx].join('-'),
    componentId: '',
  } as TriggerVariant;
  if (trigger === 'viewProgress') {
    cssRules.push(triggerToCSS(ctx, interaction, motionTrigger.id));
  }

  const visited = new Set<string>();

  const resolvedEffects = effects
    .map((effect, effIndex) =>
      resolveEffectForCSS(effect, interaction, ctx.config, `eff-${interactionIdx}-${effIndex}`),
    )
    .filter((effect) => effect !== null);

  cssRules.push(
    ...resolvedEffects.flatMap((effect) => parseEffect(ctx, effect, motionTrigger, visited)),
  );

  const resolvedSequences = sequences
    .map((sequence, seqIndex) =>
      resolveSequenceForCSS(sequence, interaction, ctx.config, `seq-${interactionIdx}-${seqIndex}`),
    )
    .filter((sequence) => sequence !== null);

  cssRules.push(
    ...resolvedSequences.flatMap((sequence) =>
      parseSequence(ctx, sequence, motionTrigger, visited),
    ),
  );

  visited.forEach((targetHash) => endInteraction(ctx.targetsMap.get(targetHash)!));

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

  const ctx: GenerateContext = {
    config,
    configConditions: config.conditions || {},
    targetsMap: new Map<string, TargetContext>(),
    keyframesMap: new Map<string, Keyframe[]>(),
    useFirstChild,
    plugins,
  };

  const cssRules = config.interactions.flatMap((interaction, interactionIdx) =>
    parseInteraction(ctx, interaction, interactionIdx),
  );

  const targets = [...ctx.targetsMap.values()];

  const animationLength = Math.max(0, ...targets.map(({ animation }) => animation.listIndex));
  const transitionLength = Math.max(0, ...targets.map(({ transition }) => transition.listIndex));
  const listsRule = buildListsRule(targets, animationLength, transitionLength);

  const animationSlotLength = Math.max(0, ...targets.map(({ animation }) => animation.slotCursor));
  const transitionSlotLength = Math.max(
    0,
    ...targets.map(({ transition }) => transition.slotCursor),
  );
  const atProperty = buildAtPropertyRules(
    animationLength,
    transitionLength,
    animationSlotLength,
    transitionSlotLength,
  );

  return { keyframes: ctx.keyframesMap, atProperty, cssRules, listsRule };
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
    listsRule,
  ].filter((rule) => rule);

  return css.join('\n');
}
