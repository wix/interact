import type {
  Effect,
  TriggerType,
  EffectRef,
  InteractionParamsTypes,
  StateEffect,
  TimeEffect,
  Interaction,
  InteractionTrigger,
  SequenceConfig,
  SequenceConfigRef,
  CreateTransitionCSSParams,
  IInteractionController,
  AnimationEndParams,
  AnimationOptions,
  ReducedMotionPolicy,
  TriggerLatch,
} from '../types';
import { PLUGIN_FIELD_PREFIX } from '../types';
import {
  createTransitionCSS,
  getMediaQuery,
  getSelectorCondition,
  generateId,
  isTransitionEffect,
} from '../utils';
import { getInterpolatedKey } from './utilities';
import {
  REDUCED_MOTION_REDUCE,
  getReducedMotionPolicy,
  getReducedMotionVariants,
} from './reducedMotion';
import { effectToAnimationOptions } from '../handlers/utilities';
import { Interact, getSelector } from './Interact';
import TRIGGER_TO_HANDLER_MODULE_MAP from '../handlers';
import type { AnimationGroupArgs } from '@wix/motion';

type InteractionsToApply = Array<
  [
    string,
    InteractionTrigger,
    Effect,
    HTMLElement | HTMLElement[],
    HTMLElement | HTMLElement[],
    string | undefined,
    boolean,
    string | undefined,
  ]
>;

type ListElements = {
  controllerKey: string;
  listContainer: string;
  elements: HTMLElement[];
};

/**
 * An effect of an interaction, resolved for this pass but not attached yet. `targetController` is
 * missing while the effect's target is not connected.
 */
type ResolvedEffect = {
  interactionId: string;
  effectOptions: Effect;
  target: string | undefined;
  targetController?: IInteractionController;
};

type ConnectedEffect = Required<ResolvedEffect>;

type ResolvedSequenceEffect = { effectOptions: Effect; target: string | undefined };

type PreparedSequenceEffect = {
  effectOptions: Effect;
  targetController: IInteractionController;
  resolvedTargetKey: string;
  readiness: PluginsReadiness;
};

/** A sequence of an interaction, resolved for this pass but not attached yet. */
type ResolvedSequence = {
  sequenceConfig: SequenceConfig;
  cacheKey: string;
  listElements?: ListElements;
  effects: ResolvedSequenceEffect[];
};

type PreparedSequence = Omit<ResolvedSequence, 'effects'> & { effects: PreparedSequenceEffect[] };

/**
 * A unit's plugin readiness: `true` once every plugin it carries is released and applied, `false`
 * while one is deferred (see the `defer` option of `Interact.use()`), or a promise while an async
 * plugin is in flight.
 */
type PluginsReadiness = boolean | Promise<void>;

// per controller, the number of its full add passes — a pass holds back again whatever is still
// waiting, so it supersedes the resumes that earlier passes are waiting to run (see `_hold`)
const addPasses = new WeakMap<IInteractionController, number>();

function _isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

/**
 * Whether `config` carries a field of a plugin that is still deferred for `key` (see the `defer`
 * option of `Interact.use()`).
 */
function _isDeferred(key: string, config: Record<string, unknown>): boolean {
  for (const name of Interact.getPluginsNames()) {
    if (`${PLUGIN_FIELD_PREFIX}${name}` in config && !Interact._isPluginReleased(name, key)) {
      return true;
    }
  }
  return false;
}

/**
 * Generic plugin bridge. For every `$`-prefixed field on an interaction or effect (e.g. `$splitText`
 * → the `splitText` plugin), look up the plugin registered via `Interact.use()` and invoke it with
 * the raw field value and a context. Any returned cleanup is stored on the owning controller and
 * run on disconnect. Interact never inspects what a plugin does — it only routes config → plugin.
 *
 * Plugins run BEFORE target resolution (`_getElementsFromData`), so any DOM they produce (e.g.
 * split `<span>`s) is visible to the selectors that follow. Each distinct plugin value object is
 * applied at most once per connect — the field values are shared by reference across resolution
 * passes, so identity is a stable dedup key.
 *
 * Returns the unit's readiness. While one of its plugins is deferred, none of them runs. An async
 * plugin's promise is recorded in the dedup guard, so other passes await it instead of running the
 * plugin again; it settles into the current connect only, and otherwise just runs its cleanup.
 * With `apply: false`, plugins not yet applied are not run (they were applied by an earlier pass).
 */
function _applyPlugins(
  owner: IInteractionController,
  root: HTMLElement,
  config: Record<string, unknown>,
  key: string,
  scope: 'interaction' | 'effect',
  apply: boolean = true,
): PluginsReadiness {
  if (_isDeferred(key, config)) {
    return false;
  }

  const pending: Promise<void>[] = [];

  for (const name of Interact.getPluginsNames()) {
    const field = `${PLUGIN_FIELD_PREFIX}${name}`;
    if (!(field in config)) {
      continue;
    }

    const value = config[field];
    const isObject = value !== null && typeof value === 'object';
    const applied = isObject ? owner._appliedPlugins.get(value) : undefined;

    if (applied === true) {
      continue;
    }

    if (applied) {
      pending.push(applied);
      continue;
    }

    if (!apply) {
      continue;
    }

    if (isObject) {
      owner._appliedPlugins.set(value, true);
    }

    const plugin = Interact.getPlugin(name)!;

    const result = plugin(value, { root, key, scope, config });

    if (_isThenable(result)) {
      const connectId = owner._connectId;
      const promise = Promise.resolve(result).then(
        (cleanup) => {
          if (owner._connectId !== connectId) {
            // disconnected while in flight — undo right away
            try {
              if (typeof cleanup === 'function') {
                cleanup();
              }
            } catch (e) {
              console.error(e);
            }
            return;
          }

          if (typeof cleanup === 'function') {
            owner._pluginCleanups.push(cleanup);
          }
          if (isObject) {
            owner._appliedPlugins.set(value, true);
          }
        },
        (e) => {
          console.error(e);

          if (isObject && owner._connectId === connectId) {
            owner._appliedPlugins.set(value, true);
          }
        },
      );

      // a primitive value has no identity to dedup by, so its promise cannot hold the unit back
      // (each pass would run the plugin again) — plugin values should be objects
      if (isObject) {
        owner._appliedPlugins.set(value, promise);
        pending.push(promise);
      }
    } else if (typeof result === 'function') {
      owner._pluginCleanups.push(result);
    }
  }

  return _combineReadiness(...pending);
}

/**
 * Handles a unit (interaction, effect, or sequence) held back by its plugins. It is skipped without
 * being marked as added, so a later add pass of `passController` applies it: the one
 * `Interact.ready()` runs for a deferred plugin, or the one re-run here once an async plugin
 * settles. Meanwhile, a `viewEnter` or `animationEnd` on the unit's sources is latched, so an
 * entry or an animation end is not lost.
 *
 * `sourcePrepared` tells whether the source's own (interaction-level) plugins are applied — if
 * not, a source resolved by the interaction's `selector` / `listContainer` may not exist yet. A
 * trigger whose latch covers a subtree (`animationEnd`) is then latched on the source controller's
 * element, recording the sources' events whenever they appear; any other trigger only on the
 * sources that already exist (a source the plugin creates or replaces is not latched).
 *
 * The latches are released when the source controller disconnects, or once their element leaves
 * its DOM (see `_releaseDetachedLatches`).
 */
function _hold(
  readiness: PluginsReadiness,
  passController: IInteractionController,
  interaction: InteractionTrigger,
  sourceController: IInteractionController,
  sourcePrepared: boolean,
  elements?: HTMLElement[],
): void {
  if (_isThenable(readiness)) {
    const sourceConnectId = sourceController._connectId;
    const passConnectId = passController._connectId;
    const addPass = addPasses.get(passController);
    readiness.then(() => {
      // A target-owned pass must not revive a source that disconnected while waiting. Units held
      // back together resume once: the first one runs the pass again, for all of them.
      if (
        sourceController.connected &&
        sourceController._connectId === sourceConnectId &&
        passController._connectId === passConnectId &&
        addPasses.get(passController) === addPass
      ) {
        passController.resume();
      }
    });
  }

  const handlerModule = TRIGGER_TO_HANDLER_MODULE_MAP[interaction.trigger] as
    | { latch?: TriggerLatch<TriggerType>; latchesSubtree?: true }
    | undefined;
  const latch = handlerModule?.latch;

  if (!latch) {
    return;
  }

  let sources: HTMLElement | HTMLElement[] | null;
  let sourceSelector: string | undefined;

  if (sourcePrepared) {
    sources = _resolveSourceElements(interaction as Interaction, sourceController, elements);
  } else if (handlerModule.latchesSubtree && (interaction.selector || interaction.listContainer)) {
    sources = sourceController.element;
    sourceSelector = getSelector(interaction as Interaction);
  } else {
    sources = _getElementsFromData(
      interaction,
      sourceController.element,
      sourceController.useFirstChild,
      false,
    );
  }

  if (!sources) {
    return;
  }

  (Array.isArray(sources) ? sources : [sources]).forEach((source) => {
    const release = latch(source, interaction.params, sourceSelector);

    // already latched by an earlier pass, which recorded its release
    if (release) {
      sourceController._latches.push({ element: source, release });
    }
  });
}

/**
 * Releases the controller's latches on elements no longer in its DOM — e.g. replaced by the plugin
 * that held their trigger back — so they are not observed until the controller disconnects.
 */
function _releaseDetachedLatches(controller: IInteractionController): void {
  controller._latches = controller._latches.filter(({ element, release }) => {
    if (controller.element.contains(element)) {
      return true;
    }

    release();
    return false;
  });
}

/** Combines readinesses: a promise while any is in flight (its pass re-checks the rest). */
function _combineReadiness(...readinesses: PluginsReadiness[]): PluginsReadiness {
  const pending = readinesses.filter(_isThenable) as Promise<void>[];

  if (pending.length) {
    return Promise.all(pending).then(() => {});
  }

  return readinesses.every(Boolean);
}

function _getElementsFromData(
  data: Interaction | Effect,
  root: HTMLElement,
  useFirstChild: boolean,
  warn: boolean = true,
): HTMLElement | HTMLElement[] | null {
  if (data.listContainer) {
    const container = root.querySelector(data.listContainer);

    if (!container) {
      if (warn) {
        console.warn(`Interact: No container found for list container "${data.listContainer}"`);
      }

      return [];
    }

    if (data.selector) {
      return Array.from(container.querySelectorAll(data.selector)) as HTMLElement[];
    }

    return Array.from(container.children) as HTMLElement[];
  }

  if (data.selector) {
    const elements = root.querySelectorAll(data.selector);

    if (elements.length > 0) {
      return Array.from(elements) as HTMLElement[];
    }

    // An explicit selector never falls back to the root — binding there would attach the trigger
    // or animation to the wrong element and mark the interaction added, so a later pass (e.g.
    // after a plugin produced the matching DOM) could not retry it.
    if (warn) {
      console.warn(`Interact: No elements found for selector "${data.selector}"`);
    }

    return null;
  }

  return useFirstChild
    ? (root.firstElementChild as HTMLElement | null)
    : (root as HTMLElement | null);
}

function _queryItemElement(data: Interaction | Effect, elements: HTMLElement[]): HTMLElement[] {
  return elements
    .map((element) => {
      return data.selector ? element.querySelector(data.selector) : element;
    })
    .filter(Boolean) as HTMLElement[];
}

/**
 * The effect's reduced-motion variant whose media matches, listening on every variant's media so a change
 * re-resolves it.
 */
function _resolveVariant<T extends Effect>(
  effect: T,
  instance: Interact,
  listener: { id: string; key: string; onUpdate: () => void },
  inherited: { policy?: ReducedMotionPolicy; collapsesStagger?: boolean } = {},
): T | undefined {
  const { effects, conditions, reducedMotionPolicy, forceReducedMotion } = instance.dataCache;
  const variants = getReducedMotionVariants(
    effect,
    getReducedMotionPolicy(effect.reducedMotionPolicy, inherited.policy, reducedMotionPolicy),
    { effects, force: forceReducedMotion, collapsesStagger: inherited.collapsesStagger },
  );

  let chosen: T | undefined;

  variants.forEach((variant, index) => {
    const mql = getMediaQuery(variant.conditions || [], conditions);

    if (mql) {
      instance.setupMediaQueryListener(
        index ? `${listener.id}::rm${index}` : listener.id,
        mql,
        listener.key,
        listener.onUpdate,
      );
    }

    if (!chosen && (!mql || mql.matches)) {
      chosen = variant;
    }
  });

  return chosen;
}

function _getInteractionElements(
  interaction: InteractionTrigger,
  effect: Effect,
  source: HTMLElement,
  sourceUseFirstChild: boolean,
  target: HTMLElement,
  targetUseFirstChild: boolean,
  sourceElements?: HTMLElement[],
  targetElements?: HTMLElement[],
): [HTMLElement | HTMLElement[] | null, HTMLElement | HTMLElement[] | null] {
  return [
    sourceElements
      ? _queryItemElement(interaction, sourceElements)
      : _getElementsFromData(interaction, source, sourceUseFirstChild),
    targetElements
      ? _queryItemElement(effect, targetElements)
      : _getElementsFromData(effect, target, targetUseFirstChild),
  ];
}

function _applyInteraction(
  targetKey: string,
  interaction: InteractionTrigger,
  effect: Effect,
  sourceElements: HTMLElement | HTMLElement[],
  targetElements: HTMLElement | HTMLElement[],
  selectorCondition?: string,
  useFirstChild?: boolean,
  sourceKey?: string,
) {
  const isSourceArray = Array.isArray(sourceElements);
  const isTargetArray = Array.isArray(targetElements);

  if (isSourceArray) {
    sourceElements.forEach((sourceEl, index) => {
      const targetEl = isTargetArray ? targetElements[index] : targetElements;

      if (targetEl) {
        addInteraction(
          targetKey,
          sourceEl,
          interaction.trigger,
          targetEl,
          effect as Effect,
          interaction.params!,
          selectorCondition,
          useFirstChild,
          sourceKey,
        );
      }
    });
  } else {
    const targets = isTargetArray ? targetElements : [targetElements];
    targets.forEach((targetEl) => {
      addInteraction(
        targetKey,
        sourceElements,
        interaction.trigger,
        targetEl,
        effect as Effect,
        interaction.params!,
        selectorCondition,
        useFirstChild,
        sourceKey,
      );
    });
  }
}

/**
 * The interaction's effects to attach in this pass — the first matching variation per interaction
 * id, including those whose target is not connected yet — without running their plugins.
 */
function _resolveEffects(
  sourceKey: string,
  sourceController: IInteractionController,
  instance: Interact,
  interaction: Interaction,
  elements?: HTMLElement[],
): ResolvedEffect[] {
  const interactionVariations: Record<string, boolean> = {};
  const resolved: ResolvedEffect[] = [];

  (interaction.effects || []).forEach((effect, effectIndex) => {
    const effectId = (effect as EffectRef).effectId;

    const mergedEffect = {
      ...(instance.dataCache.effects[effectId] || {}),
      ...effect,
      effectId,
    } as Effect;
    const targetKey_ = mergedEffect.key;

    const interactionId = getInterpolatedKey(effect.interactionId!, sourceKey);

    if (interactionVariations[interactionId!]) {
      // Skip this effect if it has already been added
      return;
    }

    if (instance.addedInteractions[interactionId!] && !elements) {
      // Skip this interaction if it has already been added
      return;
    }

    const effectOptions = _resolveVariant(
      mergedEffect,
      instance,
      {
        id: `${interactionId}::${effectIndex}`,
        key: sourceKey,
        onUpdate: () => {
          sourceController.update();
        },
      },
      { policy: interaction.reducedMotionPolicy },
    );

    if (effectOptions) {
      interactionVariations[interactionId!] = true;

      const target = targetKey_ && getInterpolatedKey(targetKey_, sourceKey);

      let targetController;
      if (target) {
        targetController = Interact.getController(target);

        if (targetController && effectOptions.listContainer) {
          targetController.watchChildList(effectOptions.listContainer);
        }
      } else {
        // target is not specified - fallback to same as source
        targetController = sourceController;
      }

      resolved.push({ interactionId: interactionId!, effectOptions, target, targetController });
    }
  });

  return resolved;
}

/** The interaction's sequences to attach in this pass, without running their plugins. */
function _resolveSequences(
  sourceKey: string,
  sourceController: IInteractionController,
  instance: Interact,
  interaction: Interaction,
  elements?: HTMLElement[],
): ResolvedSequence[] {
  const resolved: ResolvedSequence[] = [];

  interaction.sequences?.forEach((seqOrRef) => {
    let sequenceConfig: SequenceConfig;

    if (_isSequenceConfigRef(seqOrRef)) {
      const resolvedConfig = instance.dataCache.sequences[seqOrRef.sequenceId];

      if (!resolvedConfig) {
        console.warn(`Interact: Sequence "${seqOrRef.sequenceId}" not found in cache`);
        return;
      }

      sequenceConfig = { ...resolvedConfig, ...seqOrRef };
    } else {
      sequenceConfig = seqOrRef as SequenceConfig;
    }

    const sequenceId = sequenceConfig.sequenceId || generateId();
    const cacheKey = getInterpolatedKey(`${sourceKey}::seq::${sequenceId}`, sourceKey);

    if (instance.addedInteractions[cacheKey] && !elements) return;

    const effects = _resolveSequenceEffects(
      sequenceConfig,
      interaction,
      cacheKey,
      sourceKey,
      instance,
      {
        updateKey: sourceKey,
        onUpdate: () => sourceController.update(),
      },
    );

    if (!effects) return;

    // an item pass only extends an attached sequence — until then it is built from every item
    const listElements: ListElements | undefined =
      elements && interaction.listContainer && instance.addedInteractions[cacheKey]
        ? { controllerKey: sourceKey, listContainer: interaction.listContainer, elements }
        : undefined;

    resolved.push({ sequenceConfig, cacheKey, listElements, effects });
  });

  return resolved;
}

/**
 * Resolves the interaction's effects and sequences for this pass and starts their plugins — or none
 * of them while one is deferred. They are held back together: the readiness is `true` only once
 * every one of them is ready, so sibling effects of one trigger attach (and play) together.
 *
 * A unit whose target is not connected yet holds the others back while one of its plugins is
 * deferred, since that is known without its target. Its async plugins only start once the target
 * connects, so they are not waited for; the target's pass runs this interaction again (see
 * `addEffectsForTarget`).
 */
function _prepareInteraction(
  sourceKey: string,
  sourceController: IInteractionController,
  instance: Interact,
  interaction: Interaction,
  elements?: HTMLElement[],
): { readiness: PluginsReadiness; effects: ConnectedEffect[]; sequences: PreparedSequence[] } {
  const effects = _resolveEffects(sourceKey, sourceController, instance, interaction, elements);
  const sequences = _resolveSequences(sourceKey, sourceController, instance, interaction, elements);

  // checked up front, so no plugin of the interaction runs while one of them is deferred
  const isDeferred =
    effects.some(({ effectOptions, target }) =>
      _isDeferred(target || interaction.key, effectOptions),
    ) || sequences.some((sequence) => _isSequenceDeferred(sequence.effects, sourceKey));

  if (isDeferred) {
    return { readiness: false, effects: [], sequences: [] };
  }

  const connectedEffects = effects.filter(
    (effect): effect is ConnectedEffect => !!effect.targetController,
  );

  // Effect-level plugins act on the effect's target element before it is resolved — all of them
  // start before any target resolves, so async ones run concurrently.
  const readinesses = connectedEffects.map(({ effectOptions, target, targetController }) =>
    _applyPlugins(
      targetController,
      targetController.element,
      effectOptions,
      target || interaction.key,
      'effect',
    ),
  );

  const preparedSequences: PreparedSequence[] = [];

  sequences.forEach((sequence) => {
    const prepared = _prepareSequenceEffects(sequence.effects, sourceKey, sourceController);

    if (prepared) {
      preparedSequences.push({ ...sequence, effects: prepared });
      readinesses.push(...prepared.map((effect) => effect.readiness));
    }
  });

  return {
    readiness: _combineReadiness(...readinesses),
    effects: connectedEffects,
    sequences: preparedSequences,
  };
}

/**
 * Attaches the interaction's effects and sequences once all of them are ready, or holds them back
 * together — re-running the pass of `passController` once they may be.
 */
function _addInteraction(
  sourceKey: string,
  sourceController: IInteractionController,
  instance: Interact,
  interaction: Interaction,
  elements?: HTMLElement[],
  passController: IInteractionController = sourceController,
): void {
  const prepared = _prepareInteraction(
    sourceKey,
    sourceController,
    instance,
    interaction,
    elements,
  );

  if (prepared.readiness !== true) {
    _hold(prepared.readiness, passController, interaction, sourceController, true, elements);
    return;
  }

  const interactionsToApply: InteractionsToApply = [];

  prepared.effects.forEach(({ interactionId, effectOptions, target, targetController }) => {
    const [sourceElements, targetElements] = _getInteractionElements(
      interaction,
      effectOptions,
      sourceController.element,
      sourceController.useFirstChild,
      targetController.element,
      targetController.useFirstChild,
      // An item pass only extends an attached effect. Until then it attaches to every item at once —
      // marking it added for the new items alone would make the full pass skip the others (e.g. the
      // one about to resume once an async plugin settled).
      instance.addedInteractions[interactionId] ? elements : undefined,
    );

    if (!sourceElements || !targetElements) {
      return;
    }

    instance.addedInteractions[interactionId] = true;

    const key = target || interaction.key;
    const selectorCondition = getSelectorCondition(
      effectOptions.conditions || [],
      instance.dataCache.conditions,
    );

    interactionsToApply.push([
      key,
      interaction,
      effectOptions,
      sourceElements,
      targetElements,
      selectorCondition,
      targetController.useFirstChild,
      sourceKey,
    ]);
  });

  // apply the effects in reverse to return to the order specified by the user to ensure order of composition is as defined
  interactionsToApply.reverse().forEach((interaction) => {
    _applyInteraction(...interaction);
  });

  _processSequences(sourceController, instance, interaction, prepared.sequences, elements);
}

function _getSequencePolicy(
  sequenceConfig: SequenceConfig,
  interaction: InteractionTrigger,
  instance: Interact,
): ReducedMotionPolicy {
  return getReducedMotionPolicy(
    sequenceConfig.reducedMotionPolicy,
    interaction.reducedMotionPolicy,
    instance.dataCache.reducedMotionPolicy,
  );
}

// the stagger collapses under reduced motion, unless the sequence ignores it
function _getSequenceOptions(
  sequenceConfig: SequenceConfig,
  interaction: InteractionTrigger,
  instance: Interact,
): SequenceConfig {
  const { forceReducedMotion, conditions } = instance.dataCache;
  const mql = getMediaQuery([REDUCED_MOTION_REDUCE], conditions);
  const isReduced = forceReducedMotion || !!(mql && mql.matches);

  return isReduced && _getSequencePolicy(sequenceConfig, interaction, instance) !== 'ignore'
    ? { ...sequenceConfig, offset: 0 }
    : sequenceConfig;
}

function _isSequenceConfigRef(
  config: SequenceConfig | SequenceConfigRef,
): config is SequenceConfigRef {
  return 'sequenceId' in config && !('effects' in config);
}

/**
 * The sequence's effects, each with its reduced-motion variant resolved and its target key —
 * effects cancelled by their media or policy are dropped, so they neither hold back the sequence
 * nor run their plugins. Returns null when the sequence's own conditions do not match.
 */
function _resolveSequenceEffects(
  sequenceConfig: SequenceConfig,
  interaction: InteractionTrigger,
  cacheKey: string,
  sourceKey: string,
  instance: Interact,
  options: { updateKey: string; onUpdate: () => void },
): ResolvedSequenceEffect[] | null {
  const seqMql = getMediaQuery(sequenceConfig.conditions || [], instance.dataCache.conditions);

  if (seqMql) {
    instance.setupMediaQueryListener(cacheKey, seqMql, options.updateKey, options.onUpdate);
  }

  if (seqMql && !seqMql.matches) return null;

  const seqEffects: (Effect | EffectRef)[] = sequenceConfig.effects || [];
  const resolveEffect = (effect: Effect | EffectRef) => {
    const effectId = (effect as EffectRef).effectId;
    const resolvedEffect = effectId ? instance.dataCache.effects[effectId] || {} : {};
    return { ...resolvedEffect, ...effect } as Effect;
  };

  const policy = _getSequencePolicy(sequenceConfig, interaction, instance);
  const resolvedEffects: ResolvedSequenceEffect[] = [];

  for (const effect of seqEffects) {
    const effectId = (effect as EffectRef).effectId;
    const effectOptions = _resolveVariant(
      resolveEffect(effect),
      instance,
      {
        id: `${cacheKey}::${effectId || 'eff'}`,
        key: options.updateKey,
        onUpdate: options.onUpdate,
      },
      { policy, collapsesStagger: policy !== 'ignore' },
    );

    if (!effectOptions) continue;

    const target = effectOptions.key && getInterpolatedKey(effectOptions.key, sourceKey);
    resolvedEffects.push({ effectOptions, target });
  }

  return resolvedEffects;
}

/** A sequence is built as a whole, so one deferred effect defers all of it. */
function _isSequenceDeferred(effects: ResolvedSequenceEffect[], sourceKey: string): boolean {
  return effects.some(({ effectOptions, target }) =>
    _isDeferred(target || sourceKey, effectOptions),
  );
}

/**
 * Starts the plugins of the sequence's effects — all of them before any of its targets resolves,
 * so async ones run concurrently. Returns null when a target is not connected.
 */
function _prepareSequenceEffects(
  effects: ResolvedSequenceEffect[],
  sourceKey: string,
  sourceController: IInteractionController,
): PreparedSequenceEffect[] | null {
  const preparedEffects: PreparedSequenceEffect[] = [];

  for (const { effectOptions, target } of effects) {
    let targetController;
    if (target) {
      targetController = Interact.getController(target);
      if (!targetController) return null;
    } else {
      targetController = sourceController;
    }

    const resolvedTargetKey = target || sourceKey;

    // Effect-level plugins act on the effect's target element before it is resolved.
    const readiness = _applyPlugins(
      targetController,
      targetController.element,
      effectOptions,
      resolvedTargetKey,
      'effect',
    );

    preparedEffects.push({ effectOptions, targetController, resolvedTargetKey, readiness });
  }

  return preparedEffects;
}

/**
 * Builds the animation group args of a sequence whose plugins are ready, resolving its targets.
 * Returns null when the sequence should be skipped (missing targets, etc.).
 *
 * When `listElements` is provided (from addListItems), effects matching the specified controller
 * and listContainer will resolve targets from the provided elements instead of querying the DOM.
 * Returns null if listElements was provided but no effects matched it (avoids duplicate sequences).
 */
function _buildAnimationGroupArgsFromSequence(
  preparedEffects: PreparedSequenceEffect[],
  listElements?: ListElements,
): AnimationGroupArgs[] | null {
  const animationGroupArgs: AnimationGroupArgs[] = [];
  let usedListElements = false;

  for (const { effectOptions, targetController, resolvedTargetKey } of preparedEffects) {
    let targetElement: HTMLElement | HTMLElement[] | null;

    if (
      listElements &&
      resolvedTargetKey === listElements.controllerKey &&
      effectOptions.listContainer === listElements.listContainer
    ) {
      targetElement = _queryItemElement(effectOptions, listElements.elements);
      if ((targetElement as HTMLElement[]).length > 0) {
        usedListElements = true;
      }
    } else {
      targetElement = _getElementsFromData(
        effectOptions,
        targetController.element,
        targetController.useFirstChild,
      );
    }

    if (!targetElement || (Array.isArray(targetElement) && targetElement.length === 0)) return null;

    const animOptions = effectToAnimationOptions(effectOptions as TimeEffect);
    animationGroupArgs.push({ target: targetElement, options: animOptions });
  }

  if (listElements && !usedListElements) return null;

  return animationGroupArgs.length > 0 ? animationGroupArgs : null;
}

function _resolveSourceElements(
  interaction: Interaction,
  sourceController: IInteractionController,
  elements?: HTMLElement[],
): HTMLElement | HTMLElement[] | null {
  const resolved = elements
    ? _queryItemElement(interaction, elements)
    : _getElementsFromData(interaction, sourceController.element, sourceController.useFirstChild);

  // Treat an empty array as "no elements" so callers' null-guards bail instead of
  // marking the interaction added while attaching zero triggers.
  return Array.isArray(resolved) && resolved.length === 0 ? null : resolved;
}

function _attachSequenceTriggers(
  interaction: Interaction,
  sequenceConfig: SequenceConfig,
  sourceElements: HTMLElement | HTMLElement[],
  sequence: ReturnType<typeof Interact.getSequence>,
  selectorCondition?: string,
) {
  const sources = Array.isArray(sourceElements) ? sourceElements : [sourceElements];

  sources.forEach((sourceEl) => {
    (TRIGGER_TO_HANDLER_MODULE_MAP[interaction.trigger] as any)?.add(
      sourceEl,
      sourceEl,
      { triggerType: sequenceConfig.triggerType } as Effect,
      interaction.params || {},
      {
        selectorCondition,
        animation: sequence,
        allowA11yTriggers: Interact.allowA11yTriggers,
      },
    );
  });
}

function _resolveListItemIndices(
  controller: IInteractionController,
  listContainer: string,
  elements: HTMLElement[],
): number[] {
  const useFirstChild = controller.useFirstChild;
  const root = useFirstChild
    ? (controller.element.firstElementChild as HTMLElement)
    : controller.element;
  const container = root?.querySelector(listContainer);

  if (!container) return elements.map((_, i) => i);

  const allChildren = Array.from(container.children);

  return elements.map((el) => {
    const idx = allChildren.indexOf(el);
    return idx >= 0 ? idx : allChildren.length;
  });
}

/** Attaches the interaction's prepared sequences, whose plugins are all ready. */
function _processSequences(
  sourceController: IInteractionController,
  instance: Interact,
  interaction: Interaction,
  sequences: PreparedSequence[],
  elements?: HTMLElement[],
) {
  sequences.forEach(({ sequenceConfig, cacheKey, listElements, effects }) => {
    const animationGroupArgs = _buildAnimationGroupArgsFromSequence(effects, listElements);

    if (!animationGroupArgs) return;

    // an item pass extends an attached sequence, and attaches its trigger to the new items only
    const items = instance.addedInteractions[cacheKey] ? elements : undefined;

    if (items) {
      const indices = _resolveListItemIndices(sourceController, interaction.listContainer!, items);

      Interact.addToSequence(cacheKey, animationGroupArgs, indices);
    }

    const sequence = Interact.getSequence(
      cacheKey,
      _getSequenceOptions(sequenceConfig, interaction, instance),
      animationGroupArgs,
    );

    const selectorCondition = getSelectorCondition(
      interaction.conditions || [],
      instance.dataCache.conditions,
    );

    const sourceElements = _resolveSourceElements(interaction, sourceController, items);

    if (!sourceElements) return;

    // Mark added only after the source resolves, so an unresolved element can be
    // retried on a later pass instead of being permanently disabled by the guard above.
    instance.addedInteractions[cacheKey] = true;

    _attachSequenceTriggers(
      interaction,
      sequenceConfig,
      sourceElements,
      sequence,
      selectorCondition,
    );
  });
}

/**
 * What a cross-element target's pass runs before extending its unit `id` (an effect or a sequence
 * of `owner`, the source interaction). The source may connect (or resume) after this target, so its
 * interaction-level plugins are applied here before its elements are resolved. Then, until the
 * unit is attached, it attaches with its siblings in `owner`, waiting for them — this target may
 * resume before the source does (e.g. a plugin released for this key only) — to every list item at
 * once. Returns whether the unit was already attached, leaving only an item pass to extend it.
 */
function _isAttachedWithOwner(
  id: string,
  owner: Interaction,
  sourceKey: string,
  sourceController: IInteractionController,
  targetController: IInteractionController,
  instance: Interact,
): boolean {
  const sourceReadiness = _applyPlugins(
    sourceController,
    sourceController.element,
    owner,
    sourceKey,
    'interaction',
  );

  if (sourceReadiness !== true) {
    _hold(sourceReadiness, targetController, owner, sourceController, false);
    return false;
  }

  if (!instance.addedInteractions[id]) {
    _addInteraction(sourceKey, sourceController, instance, owner, undefined, targetController);
    return false;
  }

  return true;
}

function _processSequencesForTarget(
  targetKey: string,
  targetController: IInteractionController,
  instance: Interact,
  listContainer?: string,
  elements?: HTMLElement[],
) {
  const sequences = instance.get(targetKey)?.sequences || {};
  const seqInteractionIds = Object.keys(sequences);

  seqInteractionIds.forEach((seqInteractionId_) => {
    const seqVariations = sequences[seqInteractionId_];

    seqVariations.some(({ sequence: sequenceConfig, owner, ...interaction }) => {
      const interactionMql = getMediaQuery(
        interaction.conditions || [],
        instance.dataCache.conditions,
      );

      if (interactionMql && !interactionMql.matches) {
        return false;
      }

      const sourceKey = interaction.key && getInterpolatedKey(interaction.key, targetKey);
      const sourceController = Interact.getController(sourceKey);

      if (!sourceController) {
        return true;
      }

      const sequenceId = sequenceConfig.sequenceId || generateId();
      const cacheKey = getInterpolatedKey(`${sourceKey}::seq::${sequenceId}`, sourceKey!);

      if (instance.addedInteractions[cacheKey] && !elements) {
        return true;
      }

      if (
        !_isAttachedWithOwner(
          cacheKey,
          owner,
          sourceKey!,
          sourceController,
          targetController,
          instance,
        )
      ) {
        return true;
      }

      const effects = _resolveSequenceEffects(
        sequenceConfig,
        interaction,
        cacheKey,
        sourceKey!,
        instance,
        { updateKey: targetKey, onUpdate: () => targetController.update() },
      );

      if (!effects) return true;

      const prepared = _isSequenceDeferred(effects, sourceKey!)
        ? null
        : _prepareSequenceEffects(effects, sourceKey!, sourceController);
      const readiness = prepared
        ? _combineReadiness(...prepared.map((effect) => effect.readiness))
        : false;

      if (readiness !== true) {
        _hold(readiness, targetController, interaction, sourceController, true);
        return true;
      }

      // attached, so this is an item pass (see the guard above), which extends it
      const animationGroupArgs = _buildAnimationGroupArgsFromSequence(prepared!, {
        controllerKey: targetKey,
        listContainer: listContainer!,
        elements: elements!,
      });

      if (animationGroupArgs) {
        const indices = _resolveListItemIndices(targetController, listContainer!, elements!);

        Interact.addToSequence(cacheKey, animationGroupArgs, indices);
      }

      return true;
    });
  });
}

function addEffectsForTarget(
  targetKey: string,
  targetController: IInteractionController,
  instance: Interact,
  listContainer?: string,
  elements?: HTMLElement[],
) {
  const targetData = instance.get(targetKey);
  const effects = targetData?.effects || {};
  const interactionIds = Object.keys(effects);
  const interactionsToApply: InteractionsToApply = [];

  interactionIds.forEach((interactionId_) => {
    const interactionId = getInterpolatedKey(interactionId_, targetKey);

    if (instance.addedInteractions[interactionId] && !elements) {
      // Skip this interaction if it has already been added
      return;
    }

    const effectVariations = effects[interactionId_];

    // use `some` to short-circuit after the first effect that matches the conditions
    effectVariations.some(({ effect, owner, ...interaction }, variationIndex) => {
      const interactionMql = getMediaQuery(
        interaction.conditions || [],
        instance!.dataCache.conditions,
      );

      if (interactionMql && !interactionMql.matches) {
        // skip this effect if the interaction's media conditions don't match
        return false;
      }

      const effectId = (effect as EffectRef).effectId;

      const mergedEffect = {
        ...(instance!.dataCache.effects[effectId] || {}),
        ...effect,
        effectId,
      } as Effect;

      if (listContainer && mergedEffect.listContainer !== listContainer) {
        // skip this effect if a listContainer was provided and it's not matching this effect.listContainer
        return false;
      }

      const effectOptions = _resolveVariant(
        mergedEffect,
        instance,
        {
          id: `${interactionId}::${variationIndex}`,
          key: targetKey,
          onUpdate: () => {
            // For effects on target, we reconcile the target element
            targetController.update();
          },
        },
        { policy: interaction.reducedMotionPolicy },
      );

      if (effectOptions) {
        const sourceKey = interaction.key && getInterpolatedKey(interaction.key, targetKey);
        const sourceController = Interact.getController(sourceKey);

        if (!sourceController) {
          // Bail out :: no source or target elements in cache
          return true;
        }

        if (
          !_isAttachedWithOwner(
            interactionId,
            owner,
            sourceKey!,
            sourceController,
            targetController,
            instance,
          )
        ) {
          return true;
        }

        // Effect-level plugins act on the effect's target element before it is resolved.
        const readiness = _applyPlugins(
          targetController,
          targetController.element,
          effectOptions,
          targetKey,
          'effect',
        );

        if (readiness !== true) {
          _hold(readiness, targetController, interaction, sourceController, true);
          return true;
        }

        if (effectOptions.listContainer) {
          targetController.watchChildList(effectOptions.listContainer);
        }

        const [sourceElements, targetElements] = _getInteractionElements(
          interaction,
          effectOptions,
          sourceController.element,
          sourceController.useFirstChild,
          targetController.element,
          targetController.useFirstChild,
          undefined,
          elements,
        );

        if (!sourceElements || !targetElements) {
          // Bail out :: no source or target elements found in DOM
          return true;
        }

        const selectorCondition = getSelectorCondition(
          effectOptions.conditions || [],
          instance!.dataCache.conditions,
        );

        interactionsToApply.push([
          targetKey,
          interaction,
          effectOptions as Effect,
          sourceElements,
          targetElements,
          selectorCondition,
          targetController.useFirstChild,
          sourceKey || undefined,
        ]);

        // short-circuit the loop since we have a match
        return true;
      }

      return false;
    });
  });

  // apply the effects in reverse to return to the order specified by the user to ensure order of composition is as defined
  interactionsToApply.reverse().forEach((interaction) => {
    _applyInteraction(...interaction);
  });

  _processSequencesForTarget(targetKey, targetController, instance, listContainer, elements);

  const hasSequences = Object.keys(targetData?.sequences || {}).length > 0;
  return interactionIds.length > 0 || hasSequences;
}

/**
 * Registers a handler to an event on a given element.
 */
function addInteraction<T extends TriggerType>(
  targetKey: string,
  source: HTMLElement,
  trigger: T,
  target: HTMLElement,
  effect: Effect,
  options: InteractionParamsTypes[T],
  selectorCondition?: string,
  useFirstChild?: boolean,
  sourceKey?: string,
): void {
  let targetController;

  if (isTransitionEffect(effect)) {
    const args: CreateTransitionCSSParams = {
      key: targetKey,
      effectId: (effect as Effect).effectId!,
      transition: (effect as StateEffect).transition,
      transitionProperties: (effect as StateEffect).transitionProperties,
      childSelector: getSelector(effect, {
        asCombinator: true,
        addItemFilter: true,
        useFirstChild,
      }),
      selectorCondition,
    };

    targetController = Interact.getController(targetKey);
    if (!targetController) {
      return;
    }

    targetController.renderStyle(createTransitionCSS(args));
  }

  let sourceAnimationOptions;
  if (trigger === 'animationEnd') {
    const triggerEffectId = (options as AnimationEndParams).effectId;
    const instance = sourceKey ? Interact.getInstance(sourceKey) : undefined;
    const definition = instance?.dataCache.effects[triggerEffectId];
    // the source's use site is unknown, so its policy resolves from its definition and the config only
    const srcEffect =
      definition &&
      _resolveVariant(definition, instance!, {
        id: `${sourceKey}::animationEnd::${triggerEffectId}`,
        key: sourceKey!,
        onUpdate: () => {
          Interact.getController(sourceKey)?.update();
        },
      });
    if (srcEffect) {
      sourceAnimationOptions = effectToAnimationOptions(srcEffect as TimeEffect) as
        | AnimationOptions<'time'>
        | undefined;
    }
  }

  TRIGGER_TO_HANDLER_MODULE_MAP[trigger]?.add(source, target, effect, options, {
    targetController,
    selectorCondition,
    allowA11yTriggers: Interact.allowA11yTriggers,
    sourceAnimationOptions,
  });
}

/**
 * Adds all events and effects to an element based on config
 */
export function add(controller: IInteractionController): boolean {
  const key = controller.key as string;
  const instance = Interact.getInstance(key);

  if (!instance) {
    // even if we don't find a matching instance, we still want to cache the element
    Interact.setController(key, controller);
    return false;
  }

  const { triggers = [] } = instance?.get(key) || {};
  const hasTriggers = triggers.length > 0;

  instance.setController(key, controller);
  addPasses.set(controller, (addPasses.get(controller) || 0) + 1);
  _releaseDetachedLatches(controller);

  triggers.forEach((interaction, index) => {
    const mql = getMediaQuery(interaction.conditions, instance!.dataCache.conditions);

    if (mql) {
      const interactionId = `${key}::trigger::${index}`;
      instance.setupMediaQueryListener(interactionId, mql, key, () => {
        controller.update();
      });
    }

    if (!mql || mql.matches) {
      // Run interaction-level plugins before target resolution / list observation so any DOM they
      // create is visible to the selectors and MutationObservers that follow.
      const readiness = _applyPlugins(
        controller,
        controller.element,
        interaction,
        key,
        'interaction',
      );

      if (readiness !== true) {
        _hold(readiness, controller, interaction, controller, false);
        return;
      }

      if (interaction.listContainer) {
        controller.watchChildList(interaction.listContainer);
      }

      _addInteraction(key, controller, instance!, interaction);
    }
  });

  let hasEffects = false;
  if (instance) {
    hasEffects = addEffectsForTarget(key, controller, instance);
  }

  return hasTriggers || hasEffects;
}

export function addListItems(
  controller: IInteractionController,
  listContainer: string,
  elements: HTMLElement[],
) {
  const key = controller.key as string;
  const instance = Interact.getInstance(key);

  if (instance) {
    const { triggers = [] } = instance?.get(key) || {};

    triggers.forEach((interaction, index) => {
      if (interaction.listContainer !== listContainer) {
        return;
      }

      const mql = getMediaQuery(interaction.conditions, instance!.dataCache.conditions);

      if (mql) {
        const interactionId = `${key}::listTrigger::${listContainer}::${index}`;
        instance.setupMediaQueryListener(interactionId, mql, key, () => {
          // For list items, reconciling the root might be expensive but safe
          controller.update();
        });
      }

      if (!mql || mql.matches) {
        // applied by the add pass — only held back while deferred or in flight
        const readiness = _applyPlugins(
          controller,
          controller.element,
          interaction,
          key,
          'interaction',
          false,
        );

        if (readiness !== true) {
          _hold(readiness, controller, interaction, controller, false);
          return;
        }

        _addInteraction(key, controller, instance!, interaction, elements);
      }
    });

    addEffectsForTarget(key, controller, instance, listContainer, elements);
  }
}
