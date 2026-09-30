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
import type { ListKind, ListLengths, ListSlots } from './cssUtils';
import { effectToAnimationOptions } from '../handlers/utilities';
import {
  getCSSAnimation,
  getRegisteredEffect,
  MotionKeyframeEffect,
  TriggerVariant,
} from '@wix/motion';
import type { AnimationEffectAPI } from '@wix/motion';

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
type SlotUsage = Record<ListKind, boolean>;
const NO_SLOTS: SlotUsage = { animation: false, transition: false, timeline: false };
type KeyframeSlotMember = { slotKey: string; getNames: (suffix?: string) => string[] };
type TargetContext = Record<ListKind, ListCounters> & {
  key: string;
  childSelector?: string;
  assigned: Set<string>;
  // namedEffects by the animation list entry they write (see getKeyframeSlots)
  keyframeEntries: Map<string, KeyframeSlotMember[]>;
};
type TargetsMap = Map<string, TargetContext>;

// the traversal's step per effect - generating its CSS, or collecting it for the keyframe slots
type EffectStep = (
  ctx: GenerateContext,
  effect: ResolvedEffect,
  target: TargetContext,
  trigger: TriggerVariant,
  customProps: Record<ListPropertyName, string>,
  sequence?: ResolvedSequence,
) => { rules: CSSRuleData[]; wrote: Record<ListKind, boolean> };

type GenerateContext = {
  config: InteractConfig;
  configConditions: Record<string, Condition>;
  targetsMap: TargetsMap;
  keyframesMap: Map<string, Keyframe[]>;
  customProperties: Set<string>;
  keyframeSlots: Map<string, string>;
  effectStep: EffectStep;
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
    keyframeEntries: new Map<string, KeyframeSlotMember[]>(),
    ...(Object.fromEntries(LIST_KINDS.map((kind) => [kind, createListCounters()])) as Record<
      ListKind,
      ListCounters
    >),
  };
}

function getCustomProps(
  target: TargetContext,
  useSlots: SlotUsage,
): Record<ListPropertyName, string> {
  return Object.fromEntries(
    LIST_PROPERTY_NAMES.map((name) => {
      const kind = listKind(name);
      const { listIndex, slotCursor, slotsInSequence } = target[kind];
      return [
        name,
        useSlots[kind]
          ? getCustomPropName(name, slotCursor + slotsInSequence, true)
          : getCustomPropName(name, listIndex),
      ];
    }),
  ) as Record<ListPropertyName, string>;
}

function endEffect(
  target: TargetContext,
  wrote: Record<ListKind, boolean>,
  useSlots: SlotUsage,
): void {
  LIST_KINDS.forEach((kind) => {
    if (!wrote[kind]) {
      return;
    }

    target[kind].touched = true;
    if (useSlots[kind]) {
      target[kind].slotsInSequence += 1;
    }
  });
}

function getEffectListKind(effect: ResolvedEffect): ListKind | null {
  const { namedEffect, keyframeEffect, transition, transitionProperties } = effect;

  if (namedEffect || keyframeEffect) {
    return 'animation';
  }
  if (transition || transitionProperties) {
    return 'transition';
  }
  return null;
}

function getSlotUsage(sequence: ResolvedSequence): Map<string, SlotUsage> {
  const counts = new Map<string, Record<ListKind, number>>();

  sequence.effects.forEach((effect) => {
    const kind = getEffectListKind(effect);
    if (!kind) {
      return;
    }

    const targetHash = getElementHash(effect);
    const count = counts.get(targetHash) || { animation: 0, transition: 0, timeline: 0 };
    count[kind] += 1;
    counts.set(targetHash, count);
  });

  return new Map(
    [...counts].map(([targetHash, count]) => [
      targetHash,
      Object.fromEntries(LIST_KINDS.map((kind) => [kind, count[kind] > 1])) as SlotUsage,
    ]),
  );
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

// the interaction's timeline is an entry of its source's view-timeline list
function timelineToCSS(
  ctx: GenerateContext,
  interaction: Interaction,
  triggerId: string,
  visited: Set<string>,
): CSSRuleData {
  const { key, conditions } = interaction;

  const media = getFullPredicateByType(conditions, ctx.configConditions, 'media');
  const selectorCondition = getSelectorCondition(conditions, ctx.configConditions);

  const childSelector = getSelector(interaction, {
    asCombinator: true,
    useFirstChild: ctx.useFirstChild,
    addItemFilter: true,
  });

  const sourceHash = getElementHash(interaction);
  const source = ctx.targetsMap.get(sourceHash) || createTargetContext(key, childSelector);
  const name = getCustomProps(source, NO_SLOTS)['view-timeline'];
  endEffect(source, { animation: false, transition: false, timeline: true }, NO_SLOTS);
  ctx.targetsMap.set(sourceHash, source);
  visited.add(sourceHash);

  return {
    key,
    media,
    selectorCondition,
    childSelector,
    declarations: [{ name, value: `--${triggerId}` }],
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
  const wrote: Record<ListKind, boolean> = { animation: false, transition: false, timeline: false };
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

    // declare custom parameters (registered as non-inherited with @property)
    const customDeclarations = cssAnimations.flatMap(({ custom }) =>
      Object.entries(custom || {})
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => ({ name: key, value: value as string | number })),
    );
    customDeclarations.forEach(({ name }) => ctx.customProperties.add(name));
    declarations.push(...customDeclarations);

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
  slotUsage?: Map<string, SlotUsage>,
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

  const useSlots = slotUsage?.get(targetHash) || NO_SLOTS;
  const customProps = getCustomProps(current, useSlots);

  const { rules, wrote } = ctx.effectStep(ctx, effect, current, trigger, customProps, sequence);

  endEffect(current, wrote, useSlots);
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
  const slotUsage = getSlotUsage(sequence);

  cssRules.push(
    ...sequence.effects.flatMap((effect) =>
      parseEffect(ctx, effect, trigger, localVisited, sequence, slotUsage),
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
  const visited = new Set<string>();

  if (trigger === 'viewProgress') {
    cssRules.push(timelineToCSS(ctx, interaction, motionTrigger.id, visited));
  }

  const resolvedEffects = effects
    .map((effect, effIndex) => {
      const resolved = resolveEffectForCSS(
        effect,
        interaction,
        ctx.config,
        `eff-${interactionIdx}-${effIndex}`,
      );
      if (resolved) {
        resolved.slotKey = getSlotKey(interactionIdx, effIndex);
      }
      return resolved;
    })
    .filter((effect) => effect !== null);

  cssRules.push(
    ...resolvedEffects.flatMap((effect) => parseEffect(ctx, effect, motionTrigger, visited)),
  );

  const resolvedSequences = sequences
    .map((sequence, seqIndex) =>
      resolveSequenceForCSS(
        sequence,
        interaction,
        ctx.config,
        `seq-${interactionIdx}-${seqIndex}`,
        (effIndex) => getSlotKey(interactionIdx, effIndex, seqIndex),
      ),
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

// generating the CSS of an effect - in its keyframe slot
const effectCSSStep: EffectStep = (ctx, effect, target, trigger, customProps, sequence) => {
  if (effect.namedEffect) {
    effect.suffix = ctx.keyframeSlots.get(effect.slotKey!);
  }
  const { rules, keyframes, wrote } = effectToCSS(
    ctx,
    effect,
    target,
    trigger,
    customProps,
    sequence,
  );
  keyframes.forEach(({ name, keyframes }) => ctx.keyframesMap.set(name, keyframes));
  return { rules, wrote };
};

// collecting a namedEffect by the animation list entry it writes on its target
const keyframeSlotStep: EffectStep = (_ctx, effect, target, _trigger, customProps) => {
  const kind = getEffectListKind(effect);
  const module =
    effect.namedEffect &&
    (getRegisteredEffect(effect.namedEffect.type, false) as AnimationEffectAPI<'time'> | null);
  if (module?.getNames) {
    const getNames = (suffix?: string) =>
      module.getNames({ ...effect, suffix } as Parameters<typeof module.getNames>[0]);
    // effects that ignore the suffix can't use slots
    if (getNames('-1').join() !== getNames().join()) {
      const entry = customProps.animation;
      const members = target.keyframeEntries.get(entry) || [];
      target.keyframeEntries.set(entry, [...members, { slotKey: effect.slotKey!, getNames }]);
    }
  }
  return {
    rules: [],
    wrote: { animation: kind === 'animation', transition: kind === 'transition', timeline: false },
  };
};

function parseConfig(
  config: InteractConfig,
  effectStep: EffectStep,
  {
    useFirstChild = true,
    plugins,
  }: { useFirstChild?: boolean; plugins?: InteractPluginStyles } = {},
  keyframeSlots: Map<string, string> = new Map(),
) {
  const ctx: GenerateContext = {
    config,
    configConditions: config.conditions || {},
    targetsMap: new Map<string, TargetContext>(),
    keyframesMap: new Map<string, Keyframe[]>(),
    customProperties: new Set<string>(),
    keyframeSlots,
    effectStep,
    useFirstChild,
    plugins,
  };

  const cssRules = (config.interactions || []).flatMap((interaction, interactionIdx) =>
    parseInteraction(ctx, interaction, interactionIdx),
  );

  return { ctx, cssRules };
}

export function getSlotKey(interactionIndex: number, effectIndex: number, sequenceIndex?: number) {
  return [interactionIndex, sequenceIndex, effectIndex].filter((i) => i !== undefined).join(':');
}

/**
 * Keyframes are shared between effects and parameterized by custom properties on their target, so effects that
 * write different animation list entries of a target (they play together) need their own names when theirs collide:
 * each entry takes the first slot free of the names of the target's other entries, and its effects' names are
 * suffixed by it. Effects of the same entry cascade over each other, so they share its slot.
 * Uses the same traversal as generate(), so the runtime finds the generated animations of an effect by its position.
 *
 * @returns the suffix of every effect not in the first slot, by its slot key (see getSlotKey)
 */
export function getKeyframeSlots(config: InteractConfig): Map<string, string> {
  const { ctx } = parseConfig(config, keyframeSlotStep);
  const slots = new Map<string, string>();

  ctx.targetsMap.forEach(({ keyframeEntries }) => {
    const used = new Set<string>();
    keyframeEntries.forEach((members) => {
      const suffixOf = (slot: number) => (slot ? `-${slot}` : undefined);
      const isTaken = (slot: number) =>
        members.some(({ getNames }) => getNames(suffixOf(slot)).some((name) => used.has(name)));
      let slot = 0;
      while (isTaken(slot)) {
        slot++;
      }
      members.forEach(({ slotKey, getNames }) => {
        getNames(suffixOf(slot)).forEach((name) => used.add(name));
        if (slot) {
          slots.set(slotKey, suffixOf(slot)!);
        }
      });
    });
  });

  return slots;
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
  const { ctx, cssRules } = parseConfig(
    config,
    effectCSSStep,
    normalizeGenerateOptions(options),
    getKeyframeSlots(config),
  );

  const targets = [...ctx.targetsMap.values()];
  const lengthsOf = (counter: keyof ListSlots) =>
    Object.fromEntries(
      LIST_KINDS.map((kind) => [
        kind,
        Math.max(0, ...targets.map((target) => target[kind][counter])),
      ]),
    ) as ListLengths;

  const lengths = lengthsOf('listIndex');
  const listsRule = buildListsRule(targets, lengths);
  const atProperty = buildAtPropertyRules(lengths, lengthsOf('slotCursor'), ctx.customProperties);

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
