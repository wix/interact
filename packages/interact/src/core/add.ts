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
  HandlerDisposer,
  AnimationEndParams,
  AnimationOptions,
  ReducedMotionPolicy,
} from '../types';
import { PLUGIN_FIELD_PREFIX } from '../types';
import {
  createTransitionCSS,
  getMediaQuery,
  getSelectorCondition,
  generateId,
  isTransitionEffect,
} from '../utils';
import { getInterpolatedKey, getKeyTemplate } from './utilities';
import {
  REDUCED_MOTION_REDUCE,
  getReducedMotionPolicy,
  getReducedMotionVariants,
  isReducedMotionVariant,
} from './reducedMotion';
import { effectToAnimationOptions } from '../handlers/utilities';
import { Interact, getMountedController, getSelector } from './Interact';
import { writeOwnedStyle } from './runtimeStyle';
import TRIGGER_TO_HANDLER_MODULE_MAP from '../handlers';
import type { AnimationGroupArgs } from '@wix/motion';

type ListElements = {
  controllerKey: string;
  listContainer: string;
  elements: HTMLElement[];
};

type ListChange = ListElements & { container?: Element };

function getListContainer(element: HTMLElement, selector?: string): Element | null {
  return selector ? element.querySelector(selector) : null;
}

function matchesList(
  element: HTMLElement,
  selector: string | undefined,
  list: ListChange,
): boolean {
  return list.container
    ? getListContainer(element, selector) === list.container
    : selector === list.listContainer;
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
 */
function _applyPlugins(
  owner: IInteractionController,
  root: HTMLElement,
  config: Record<string, unknown>,
  key: string,
  scope: 'interaction' | 'effect',
): void {
  const pluginNames = Interact.getPluginsNames();

  for (const name of pluginNames) {
    const field = `${PLUGIN_FIELD_PREFIX}${name}`;
    if (!(field in config)) {
      continue;
    }

    const value = config[field];

    if (value !== null && typeof value === 'object') {
      if (owner._appliedPlugins.has(value)) {
        continue;
      }
      owner._appliedPlugins.add(value);
    }

    const plugin = Interact.getPlugin(name)!;

    const cleanup = plugin(value, { root, key, scope, config });

    if (typeof cleanup === 'function') {
      owner._pluginCleanups.push(cleanup);
    }
  }
}

/**
 * Whether `config` carries a field of a plugin that is still deferred for `key` (see the `defer`
 * option of `Interact.use()`). A deferred unit is skipped without being marked as added, so the
 * add pass that `Interact.ready()` re-runs for the released key (or every key) applies it.
 */
function _isDeferred(key: string, config: Record<string, unknown>): boolean {
  for (const name of Interact.getPluginsNames()) {
    if (`${PLUGIN_FIELD_PREFIX}${name}` in config && !Interact._isPluginReleased(name, key)) {
      return true;
    }
  }
  return false;
}

function _getElementsFromData(
  data: Interaction | Effect,
  root: HTMLElement,
  useFirstChild: boolean,
): HTMLElement | HTMLElement[] | null {
  if (data.listContainer) {
    const container = root.querySelector(data.listContainer);

    if (!container) {
      console.warn(`Interact: No container found for list container "${data.listContainer}"`);

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
    } else {
      console.warn(`Interact: No elements found for selector "${data.selector}"`);
    }
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

type EffectEndpoint = {
  key: string;
  controller: IInteractionController;
  list: Element | null;
};

function _applyInteraction(
  instance: Interact,
  {
    dataCache,
    pairId,
    styleSlot,
    source: sourceEndpoint,
    target: targetEndpoint,
  }: {
    dataCache: Interact['dataCache'];
    pairId: string;
    styleSlot: string;
    source: EffectEndpoint;
    target: EffectEndpoint;
  },
  interaction: InteractionTrigger,
  effect: Effect,
  sourceElements: HTMLElement | HTMLElement[],
  targetElements: HTMLElement | HTMLElement[],
  selectorCondition: string | undefined,
): void {
  const sourceKey = sourceEndpoint.key;
  const targetKey = targetEndpoint.key;
  const ownsElement = ({ key, controller }: EffectEndpoint, element: HTMLElement) =>
    Interact.isMountedController(key, controller) && controller.element.contains(element);

  const attach = (source: HTMLElement, target: HTMLElement) => {
    const isCurrent = () =>
      instance.dataCache === dataCache &&
      ownsElement(sourceEndpoint, source) &&
      ownsElement(targetEndpoint, target);
    if (!isCurrent()) {
      return;
    }

    const dispose = addInteraction(
      instance,
      sourceKey,
      targetKey,
      styleSlot,
      source,
      interaction.trigger,
      target,
      effect,
      interaction.params!,
      selectorCondition,
      targetEndpoint.controller.useFirstChild,
    );
    if (!isCurrent()) {
      dispose?.();
      return;
    }

    const bindings = instance.markEffectPair(sourceKey, targetKey, pairId);
    if (dispose) {
      instance.trackEffectBinding(sourceKey, targetKey, bindings, {
        source,
        target,
        sourceList: sourceEndpoint.list,
        targetList: targetEndpoint.list,
        dispose,
      });
    }
  };

  if (Array.isArray(sourceElements)) {
    sourceElements.forEach((source, index) => {
      const target = Array.isArray(targetElements) ? targetElements[index] : targetElements;
      if (target) {
        attach(source, target);
      }
    });
  } else {
    const targets = Array.isArray(targetElements) ? targetElements : [targetElements];
    for (const target of targets) {
      attach(sourceElements, target);
    }
  }
}

function _addInteraction(
  sourceKey: string,
  sourceController: IInteractionController,
  instance: Interact,
  interaction: Interaction,
  { onlyTargetKey, list }: { onlyTargetKey?: string; list?: ListChange } = {},
) {
  const dataCache = instance.dataCache;
  const interactionVariations = new Set<string>();
  const interactionsToApply: (() => void)[] = [];
  const sourceItems =
    list?.controllerKey === sourceKey &&
    matchesList(sourceController.element, interaction.listContainer, list)
      ? list.elements
      : undefined;
  const onlyTargetTemplate =
    onlyTargetKey === undefined ? undefined : getKeyTemplate(onlyTargetKey);

  for (const [effectIndex, effect] of (interaction.effects || []).entries()) {
    const effectId = (effect as EffectRef).effectId;
    const mergedEffect = {
      ...instance.dataCache.effects[effectId],
      ...effect,
      effectId,
    } as Effect;
    const targetTemplate = mergedEffect.key || interaction.key;
    const interactionId = effect.interactionId;

    if (
      !interactionId ||
      interactionVariations.has(interactionId) ||
      (onlyTargetTemplate !== undefined && onlyTargetTemplate !== targetTemplate)
    ) {
      continue;
    }

    const effectOptions = _resolveVariant(
      mergedEffect,
      instance,
      {
        id: JSON.stringify([interactionId, sourceKey, effectIndex]),
        key: sourceKey,
        onUpdate: () => sourceController.update(),
      },
      { policy: interaction.reducedMotionPolicy },
    );

    if (!effectOptions) {
      continue;
    }
    interactionVariations.add(interactionId);
    const styleSlot = JSON.stringify([
      interactionId,
      effectIndex,
      isReducedMotionVariant(effectOptions),
    ]);

    const matches = Interact.getMatchingControllers(sourceKey, targetTemplate, onlyTargetKey);
    for (const [targetKey, targetController] of matches) {
      const targetItems =
        list?.controllerKey === targetKey &&
        matchesList(targetController.element, effectOptions.listContainer, list)
          ? list.elements
          : undefined;
      const pairId = JSON.stringify([interactionId, sourceKey, targetKey]);

      if (
        (list ? !sourceItems && !targetItems : instance.hasEffectPair(sourceKey, pairId)) ||
        _isDeferred(targetKey, effectOptions)
      ) {
        continue;
      }
      _applyPlugins(targetController, targetController.element, effectOptions, targetKey, 'effect');
      if (instance.dataCache !== dataCache) {
        return;
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
        sourceItems,
        targetItems,
      );

      if (
        !sourceElements ||
        !targetElements ||
        (Array.isArray(sourceElements) && !sourceElements.length) ||
        (Array.isArray(targetElements) && !targetElements.length)
      ) {
        continue;
      }

      const selectorCondition = getSelectorCondition(
        effectOptions.conditions || [],
        instance.dataCache.conditions,
      );

      const sourceList = getListContainer(sourceController.element, interaction.listContainer);
      const targetList = getListContainer(targetController.element, effectOptions.listContainer);
      interactionsToApply.push(() => {
        _applyInteraction(
          instance,
          {
            dataCache,
            pairId,
            styleSlot,
            source: { key: sourceKey, controller: sourceController, list: sourceList },
            target: { key: targetKey, controller: targetController, list: targetList },
          },
          interaction,
          effectOptions,
          sourceElements,
          targetElements,
          selectorCondition,
        );
      });
    }
  }

  // Variants are considered from last to first, but their effects run in authored order.
  interactionsToApply.reverse().forEach((apply) => apply());
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
 * Shared logic for building animation group args from a sequence config.
 * Handles sequence-level and effect-level media conditions, target resolution, and element lookup.
 * Returns null when the sequence should be skipped (conditions not met, missing targets, etc.).
 *
 * When `listElements` is provided (from addListItems), effects matching the specified controller
 * and listContainer will resolve targets from the provided elements instead of querying the DOM.
 * Returns null if listElements was provided but no effects matched it (avoids duplicate sequences).
 */
function _buildAnimationGroupArgsFromSequence(
  sequenceConfig: SequenceConfig,
  interaction: InteractionTrigger,
  cacheKey: string,
  sourceKey: string,
  sourceController: IInteractionController,
  instance: Interact,
  options: { updateKey: string; onUpdate: () => void },
  listElements?: ListElements,
): AnimationGroupArgs[] | null {
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

  // A sequence is built as a whole, so one deferred effect defers all of it — checked up front so
  // no plugin of the sequence runs while it is deferred.
  const isDeferred = seqEffects.some((effect) => {
    const effectOptions = resolveEffect(effect);
    const effectMql = getMediaQuery(effectOptions.conditions || [], instance.dataCache.conditions);

    if (effectMql && !effectMql.matches) return false;

    const target = effectOptions.key && getInterpolatedKey(effectOptions.key, sourceKey);
    return _isDeferred(target || sourceKey, effectOptions);
  });

  if (isDeferred) {
    return null;
  }

  const animationGroupArgs: AnimationGroupArgs[] = [];
  const policy = _getSequencePolicy(sequenceConfig, interaction, instance);
  let usedListElements = false;

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

    const targetKey_ = effectOptions.key;
    const target = targetKey_ && getInterpolatedKey(targetKey_, sourceKey);

    let targetController;
    if (target) {
      targetController = Interact.getController(target);
      if (!targetController) return null;
    } else {
      targetController = sourceController;
    }

    const resolvedTargetKey = target || sourceKey;

    // Effect-level plugins act on the effect's target element before it is resolved.
    _applyPlugins(
      targetController,
      targetController.element,
      effectOptions,
      resolvedTargetKey,
      'effect',
    );

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

function _processSequences(
  sourceKey: string,
  sourceController: IInteractionController,
  instance: Interact,
  interaction: Interaction,
  elements?: HTMLElement[],
) {
  interaction.sequences?.forEach((seqOrRef) => {
    let sequenceConfig: SequenceConfig;

    if (_isSequenceConfigRef(seqOrRef)) {
      const resolved = instance.dataCache.sequences[seqOrRef.sequenceId];

      if (!resolved) {
        console.warn(`Interact: Sequence "${seqOrRef.sequenceId}" not found in cache`);
        return;
      }

      sequenceConfig = { ...resolved, ...seqOrRef };
    } else {
      sequenceConfig = seqOrRef as SequenceConfig;
    }

    const sequenceId = sequenceConfig.sequenceId || generateId();
    const cacheKey = getInterpolatedKey(`${sourceKey}::seq::${sequenceId}`, sourceKey);

    if (instance.addedInteractions[cacheKey] && !elements) return;

    const listElements: ListElements | undefined =
      elements && interaction.listContainer
        ? { controllerKey: sourceKey, listContainer: interaction.listContainer, elements }
        : undefined;

    const animationGroupArgs = _buildAnimationGroupArgsFromSequence(
      sequenceConfig,
      interaction,
      cacheKey,
      sourceKey,
      sourceController,
      instance,
      {
        updateKey: sourceKey,
        onUpdate: () => sourceController.update(),
      },
      listElements,
    );

    if (!animationGroupArgs) return;

    if (elements && instance.addedInteractions[cacheKey]) {
      const indices = _resolveListItemIndices(
        sourceController,
        interaction.listContainer!,
        elements,
      );

      Interact.addToSequence(cacheKey, animationGroupArgs, indices);

      const sequence = Interact.getSequence(
        cacheKey,
        _getSequenceOptions(sequenceConfig, interaction, instance),
        animationGroupArgs,
      );

      const selectorCondition = getSelectorCondition(
        interaction.conditions || [],
        instance.dataCache.conditions,
      );

      const sourceElements = _resolveSourceElements(interaction, sourceController, elements);

      if (sourceElements) {
        _attachSequenceTriggers(
          interaction,
          sequenceConfig,
          sourceElements,
          sequence,
          selectorCondition,
        );
      }

      return;
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

    const sourceElements = _resolveSourceElements(interaction, sourceController, elements);

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

    seqVariations.some(({ sequence: sequenceConfig, ...interaction }) => {
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

      if (_isDeferred(sourceKey!, interaction)) {
        return true;
      }

      const listElements: ListElements | undefined =
        elements && listContainer
          ? { controllerKey: targetKey, listContainer, elements }
          : undefined;

      const animationGroupArgs = _buildAnimationGroupArgsFromSequence(
        sequenceConfig,
        interaction,
        cacheKey,
        sourceKey!,
        sourceController,
        instance,
        {
          updateKey: targetKey,
          onUpdate: () => targetController.update(),
        },
        listElements,
      );

      if (!animationGroupArgs) return true;

      if (elements && instance.addedInteractions[cacheKey]) {
        const indices = _resolveListItemIndices(targetController, listContainer!, elements);

        Interact.addToSequence(cacheKey, animationGroupArgs, indices);

        return true;
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

      const sourceElements = _resolveSourceElements(interaction, sourceController);

      if (!sourceElements) return true;

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

      return true;
    });
  });
}

function addEffectsForTarget(targetKey: string, list?: ListChange): boolean {
  let hasEffects = false;

  for (const instance of Interact.getInstancesForKey(targetKey)) {
    const dataCache = instance.dataCache;
    const targetData = instance.get(targetKey);
    const sourceTemplates = new Set(
      Object.values(targetData?.effects ?? {}).map(([variation]) => variation.key),
    );
    hasEffects ||= sourceTemplates.size > 0;

    for (const sourceTemplate of sourceTemplates) {
      for (const [sourceKey, sourceController] of Interact.getMatchingControllers(
        targetKey,
        sourceTemplate,
      )) {
        for (const interaction of instance.get(sourceKey)?.triggers ?? []) {
          if (instance.dataCache !== dataCache) {
            break;
          }
          const mql = getMediaQuery(interaction.conditions, instance.dataCache.conditions);
          if ((!mql || mql.matches) && !_isDeferred(sourceKey, interaction)) {
            _addInteraction(sourceKey, sourceController, instance, interaction, {
              onlyTargetKey: targetKey,
              list,
            });
          }
        }
      }
    }
  }

  return hasEffects;
}

/**
 * Registers a handler to an event on a given element.
 */
function addInteraction<T extends TriggerType>(
  instance: Interact,
  sourceKey: string,
  targetKey: string,
  styleSlot: string,
  source: HTMLElement,
  trigger: T,
  target: HTMLElement,
  effect: Effect,
  options: InteractionParamsTypes[T],
  selectorCondition?: string,
  useFirstChild?: boolean,
): HandlerDisposer | void {
  let targetController: IInteractionController | undefined;

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

    const dataCache = instance.dataCache;
    const targetMount = getMountedController(targetKey);
    writeOwnedStyle(
      instance,
      targetController,
      styleSlot,
      createTransitionCSS(args),
      () =>
        instance.dataCache === dataCache &&
        targetMount?.controller === targetController &&
        getMountedController(targetKey) === targetMount,
    );
  }

  let sourceAnimationOptions;
  if (trigger === 'animationEnd') {
    const triggerEffectId = (options as AnimationEndParams).effectId;
    const definition = instance.dataCache.effects[triggerEffectId];
    // the source's use site is unknown, so its policy resolves from its definition and the config only
    const srcEffect =
      definition &&
      _resolveVariant(definition, instance, {
        id: `${sourceKey}::animationEnd::${triggerEffectId}`,
        key: sourceKey,
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

  return TRIGGER_TO_HANDLER_MODULE_MAP[trigger]?.add(source, target, effect, options, {
    targetController,
    selectorCondition,
    allowA11yTriggers: Interact.allowA11yTriggers,
    sourceAnimationOptions,
  });
}

function addEffectsForSource(
  key: string,
  controller: IInteractionController,
  controllerOwner: Interact,
  list?: ListChange,
): boolean {
  let hasTriggers = false;

  for (const instance of Interact.getInstancesForKey(key)) {
    const dataCache = instance.dataCache;
    const triggers = instance.get(key)?.triggers ?? [];
    triggers.forEach((interaction, index) => {
      if (
        instance.dataCache !== dataCache ||
        (list && !matchesList(controller.element, interaction.listContainer, list)) ||
        (instance !== controllerOwner && !interaction.effects?.length)
      ) {
        return;
      }
      hasTriggers = true;
      const mql = getMediaQuery(interaction.conditions, instance.dataCache.conditions);
      if (mql) {
        const listenerId = list
          ? `${key}::listTrigger::${list.listContainer}::${index}`
          : `${key}::trigger::${index}`;
        instance.setupMediaQueryListener(listenerId, mql, key, () => controller.update());
      }
      if ((mql && !mql.matches) || _isDeferred(key, interaction)) {
        return;
      }

      if (!list) {
        _applyPlugins(controller, controller.element, interaction, key, 'interaction');
        if (instance.dataCache !== dataCache) {
          return;
        }
        if (interaction.listContainer) {
          controller.watchChildList(interaction.listContainer);
        }
      }

      _addInteraction(key, controller, instance, interaction, { list });
      if (
        instance.dataCache === dataCache &&
        instance === controllerOwner &&
        (!list || interaction.listContainer === list.listContainer)
      ) {
        _processSequences(key, controller, instance, interaction, list?.elements);
      }
    });
  }

  return hasTriggers;
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

  const previous = Interact.getController(key);
  if (
    previous &&
    previous !== controller &&
    previous.element === controller.element &&
    previous.connected
  ) {
    return false;
  }

  instance.setController(key, controller);
  if (!Interact.isMountedController(key, controller)) {
    return false;
  }
  const hasTriggers = addEffectsForSource(key, controller, instance);
  const hasEffects = addEffectsForTarget(key);
  _processSequencesForTarget(key, controller, instance);

  return hasTriggers || hasEffects || Object.keys(instance.get(key)?.sequences ?? {}).length > 0;
}

export function addListItems(
  controller: IInteractionController,
  listContainer: string,
  elements: HTMLElement[],
  container?: Element,
) {
  const key = controller.key as string;
  const instance = Interact.getInstance(key);

  if (instance) {
    const list = { controllerKey: key, listContainer, elements, container };
    addEffectsForSource(key, controller, instance, list);
    addEffectsForTarget(key, list);
    _processSequencesForTarget(key, controller, instance, listContainer, elements);
  }
}
