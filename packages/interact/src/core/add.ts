import type {
  Effect,
  TriggerType,
  EffectRef,
  InteractionParamsTypes,
  TransitionEffect,
  TimeEffect,
  Interaction,
  InteractionTrigger,
  SequenceConfig,
  SequenceConfigRef,
  CreateTransitionCSSParams,
  IInteractionController,
} from '../types';
import { createTransitionCSS, getMediaQuery, getSelectorCondition, generateId } from '../utils';
import { getInterpolatedKey } from './utilities';
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
  ]
>;

type ListElements = {
  controllerKey: string;
  listContainer: string;
  elements: HTMLElement[];
};

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
      );
    });
  }
}

function _addInteraction(
  sourceKey: string,
  sourceController: IInteractionController,
  instance: Interact,
  interaction: Interaction,
  elements?: HTMLElement[],
) {
  const interactionVariations: Record<string, boolean> = {};

  const interactionsToApply: InteractionsToApply = [];

  (interaction.effects || []).forEach((effect) => {
    const effectId = (effect as EffectRef).effectId;

    const effectOptions = {
      ...(instance.dataCache.effects[effectId] || {}),
      ...effect,
      effectId,
    };
    const targetKey_ = effectOptions.key;

    const interactionId = getInterpolatedKey(effect.interactionId!, sourceKey);

    if (interactionVariations[interactionId!]) {
      // Skip this effect if it has already been added
      return;
    }

    if (instance.addedInteractions[interactionId!] && !elements) {
      // Skip this interaction if it has already been added
      return;
    }

    const mql = getMediaQuery(effectOptions.conditions || [], instance.dataCache.conditions);

    if (mql) {
      instance.setupMediaQueryListener(interactionId, mql, sourceKey, () => {
        sourceController.update();
      });
    }

    if (!mql || mql.matches) {
      interactionVariations[interactionId!] = true;

      const target = targetKey_ && getInterpolatedKey(targetKey_, sourceKey);

      let targetController;
      if (target) {
        targetController = Interact.getController(target);

        if (!targetController) {
          // Bail out :: no target element in cache
          return;
        }

        if (effectOptions.listContainer) {
          targetController.watchChildList(effectOptions.listContainer);
        }
      } else {
        // target is not specified - fallback to same as source
        targetController = sourceController;
      }

      const [sourceElements, targetElements] = _getInteractionElements(
        interaction,
        effectOptions,
        sourceController.element,
        sourceController.useFirstChild,
        targetController.element,
        targetController.useFirstChild,
        elements,
      );

      if (!sourceElements || !targetElements) {
        return;
      }

      instance.addedInteractions[interactionId!] = true;

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
      ]);
    }
  });

  // apply the effects in reverse to return to the order specified by the user to ensure order of composition is as defined
  interactionsToApply.reverse().forEach((interaction) => {
    _applyInteraction(...interaction);
  });

  _processSequences(sourceKey, sourceController, instance, interaction, elements);
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
  const animationGroupArgs: AnimationGroupArgs[] = [];
  let usedListElements = false;

  for (const effect of seqEffects) {
    const effectId = (effect as EffectRef).effectId;
    const resolvedEffect = effectId ? instance.dataCache.effects[effectId] || {} : {};
    const effectOptions = {
      ...resolvedEffect,
      ...effect,
    };

    const effectMql = getMediaQuery(effectOptions.conditions || [], instance.dataCache.conditions);

    if (effectMql) {
      const effectCacheKey = `${cacheKey}::${effectId || 'eff'}`;
      instance.setupMediaQueryListener(
        effectCacheKey,
        effectMql,
        options.updateKey,
        options.onUpdate,
      );
    }

    if (effectMql && !effectMql.matches) continue;

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
      cacheKey,
      sourceKey,
      sourceController,
      instance,
      { updateKey: sourceKey, onUpdate: () => sourceController.update() },
      listElements,
    );

    if (!animationGroupArgs) return;

    if (elements && instance.addedInteractions[cacheKey]) {
      const indices = _resolveListItemIndices(
        sourceController,
        interaction.listContainer!,
        elements,
      );

      Interact.addToSequence(cacheKey, animationGroupArgs, indices, {
        reducedMotion: Interact.forceReducedMotion,
      });

      return;
    }

    const sequence = Interact.getSequence(cacheKey, sequenceConfig, animationGroupArgs, {
      reducedMotion: Interact.forceReducedMotion,
    });

    instance.addedInteractions[cacheKey] = true;

    const selectorCondition = getSelectorCondition(
      interaction.conditions || [],
      instance.dataCache.conditions,
    );

    (TRIGGER_TO_HANDLER_MODULE_MAP[interaction.trigger] as any)?.add(
      sourceController.element,
      sourceController.element,
      {} as Effect,
      interaction.params || {},
      {
        reducedMotion: Interact.forceReducedMotion,
        selectorCondition,
        animation: sequence,
        allowA11yTriggers: Interact.allowA11yTriggers,
      },
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

      const listElements: ListElements | undefined =
        elements && listContainer
          ? { controllerKey: targetKey, listContainer, elements }
          : undefined;

      const animationGroupArgs = _buildAnimationGroupArgsFromSequence(
        sequenceConfig,
        cacheKey,
        sourceKey!,
        sourceController,
        instance,
        { updateKey: targetKey, onUpdate: () => targetController.update() },
        listElements,
      );

      if (!animationGroupArgs) return true;

      if (elements && instance.addedInteractions[cacheKey]) {
        const indices = _resolveListItemIndices(targetController, listContainer!, elements);

        Interact.addToSequence(cacheKey, animationGroupArgs, indices, {
          reducedMotion: Interact.forceReducedMotion,
        });

        return true;
      }

      const sequence = Interact.getSequence(cacheKey, sequenceConfig, animationGroupArgs, {
        reducedMotion: Interact.forceReducedMotion,
      });

      instance.addedInteractions[cacheKey] = true;

      const selectorCondition = getSelectorCondition(
        interaction.conditions || [],
        instance.dataCache.conditions,
      );

      (TRIGGER_TO_HANDLER_MODULE_MAP[interaction.trigger] as any)?.add(
        sourceController.element,
        sourceController.element,
        {} as Effect,
        interaction.params || {},
        {
          reducedMotion: Interact.forceReducedMotion,
          selectorCondition,
          animation: sequence,
          allowA11yTriggers: Interact.allowA11yTriggers,
        },
      );

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
    effectVariations.some(({ effect, ...interaction }) => {
      const interactionMql = getMediaQuery(
        interaction.conditions || [],
        instance!.dataCache.conditions,
      );

      if (interactionMql && !interactionMql.matches) {
        // skip this effect if the interaction's media conditions don't match
        return false;
      }

      const effectId = (effect as EffectRef).effectId;

      const effectOptions = {
        ...(instance!.dataCache.effects[effectId] || {}),
        ...effect,
        effectId,
      };

      if (listContainer && effectOptions.listContainer !== listContainer) {
        // skip this effect if a listContainer was provided and it's not matching this effect.listContainer
        return false;
      }

      const mql = getMediaQuery(effectOptions.conditions || [], instance!.dataCache.conditions);

      if (mql) {
        instance.setupMediaQueryListener(interactionId, mql, targetKey, () => {
          // For effects on target, we reconcile the target element
          targetController.update();
        });
      }

      if (!mql || mql.matches) {
        const sourceKey = interaction.key && getInterpolatedKey(interaction.key, targetKey);
        const sourceController = Interact.getController(sourceKey);

        if (!sourceController) {
          // Bail out :: no source or target elements in cache
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

        instance!.addedInteractions[interactionId] = true;

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
): void {
  let targetController;

  if (
    (effect as TransitionEffect).transition ||
    (effect as TransitionEffect).transitionProperties
  ) {
    const args: CreateTransitionCSSParams = {
      key: targetKey,
      effectId: (effect as Effect).effectId!,
      transition: (effect as TransitionEffect).transition,
      properties: (effect as TransitionEffect).transitionProperties,
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

  TRIGGER_TO_HANDLER_MODULE_MAP[trigger]?.add(source, target, effect, options, {
    reducedMotion: Interact.forceReducedMotion,
    targetController,
    selectorCondition,
    allowA11yTriggers: Interact.allowA11yTriggers,
  });
}

/**
 * Adds all events and effects to an element based on config
 */
export function add(controller: IInteractionController): boolean {
  const key = controller.key as string;
  const instance = Interact.getInstance(key);

  if (!instance) {
    console.warn(`No instance found for key: ${key}`);

    // even if we don't find a matching instance, we still want to cache the element
    Interact.setController(key, controller);
    return false;
  }

  const { triggers = [] } = instance?.get(key) || {};
  const hasTriggers = triggers.length > 0;

  instance.setController(key, controller);

  triggers.forEach((interaction, index) => {
    const mql = getMediaQuery(interaction.conditions, instance!.dataCache.conditions);

    if (mql) {
      const interactionId = `${key}::trigger::${index}`;
      instance.setupMediaQueryListener(interactionId, mql, key, () => {
        controller.update();
      });
    }

    if (!mql || mql.matches) {
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
        _addInteraction(key, controller, instance!, interaction, elements);
      }
    });

    addEffectsForTarget(key, controller, instance, listContainer, elements);
  }
}
