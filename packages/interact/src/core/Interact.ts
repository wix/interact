import {
  InteractCache,
  InteractConfig,
  EffectRef,
  Effect,
  Interaction,
  SequenceConfig,
  SequenceConfigRef,
  ViewEnterParams,
  ViewEnterHandlerModule,
  IInteractionController,
  IInteractElement,
  InteractPlugin,
  ReducedMotionPolicy,
  InteractPluginOptions,
} from '../types';
import { getElementHash, getInterpolatedKey } from './utilities';
import { getFallbackId, getKeyframeSlots, getSlotKey } from './css';
import { withReducedMotionConditions } from './reducedMotion';
import TRIGGER_TO_HANDLER_MODULE_MAP from '../handlers';
import {
  registerEffects,
  getRegisteredEffect,
  getSequence as getMotionSequence,
  createAnimationGroups,
  Sequence,
} from '@wix/motion';
import type { SequenceOptions, AnimationGroupArgs, IndexedGroup } from '@wix/motion';

type InteractInitOptions = {
  useCustomElement?: boolean;
  configIndex?: number;
  // override Interact's for this instance
  forceReducedMotion?: boolean;
  reducedMotionPolicy?: ReducedMotionPolicy;
};

function _convertToKeyTemplate(key: string) {
  return key.replace(/\[[^\]]+]/g, '[]');
}

export class Interact {
  static defineInteractElement?: () => boolean;
  dataCache: InteractCache;
  addedInteractions: { [interactionId: string]: boolean };
  mediaQueryListeners: Map<
    string,
    {
      mql: MediaQueryList;
      handler: (e: MediaQueryListEvent | MediaQueryList) => void;
      key: string;
    }
  >;
  listInteractionsCache: {
    [listContainer: string]: { [interactionId: string]: boolean };
  };
  controllers: Set<IInteractionController>;
  static forceReducedMotion: boolean = false;
  static reducedMotionPolicy: ReducedMotionPolicy = 'collapse';
  static allowA11yTriggers: boolean = true;
  static instances: Interact[] = [];
  static controllerCache = new Map<string, IInteractionController>();
  static sequenceCache = new Map<string, Sequence>();
  static elementSequenceMap = new WeakMap<HTMLElement, Set<Sequence>>();
  private static plugins = new Map<string, InteractPlugin>();
  private static pluginDefers = new Map<string, string[]>();
  /** Released defer names: `name` (every key) or `name::key` (a single key). */
  static _released = new Set<string>();

  constructor() {
    this.dataCache = { effects: {}, sequences: {}, conditions: {}, interactions: {} };
    this.addedInteractions = {};
    this.mediaQueryListeners = new Map();
    this.listInteractionsCache = {};
    this.controllers = new Set();
  }

  init(config: InteractConfig, options?: InteractInitOptions): void {
    if (typeof window === 'undefined' || !window.customElements) {
      return;
    }

    const useCustomElement = options?.useCustomElement ?? !!Interact.defineInteractElement;

    this.dataCache = parseConfig(config, useCustomElement, {
      configIndex: options?.configIndex,
      forceReducedMotion: options?.forceReducedMotion ?? Interact.forceReducedMotion,
      reducedMotionPolicy: options?.reducedMotionPolicy ?? Interact.reducedMotionPolicy,
    });

    const defined = Interact.defineInteractElement?.();

    if (useCustomElement && defined === false) {
      // mostly to recover from React's <StrictMode>, blah...
      document.querySelectorAll('interact-element').forEach((element) => {
        (element as IInteractElement).connect();
      });
    } else {
      // Always try to reconnect elements from cache.
      // This handles cases where elements were added to DOM before the instance was created
      // (e.g., in React where useEffect runs after render), or when an instance is recreated
      // (e.g., in React StrictMode where effects run twice).
      // The connect() method has a guard to skip if already connected.
      Interact.controllerCache.forEach((controller: IInteractionController, key) =>
        controller.connect(key),
      );
    }
  }

  destroy({ clearCache = false }: { clearCache?: boolean } = {}): void {
    for (const controller of this.controllers) {
      controller.disconnect({ removeFromCache: clearCache });
    }

    // Properly remove all media query listeners before clearing the Map
    // This is critical for React StrictMode where instances are destroyed and recreated,
    // to prevent duplicate listeners from firing with stale instance references
    for (const [, listener] of this.mediaQueryListeners.entries()) {
      listener.mql.removeEventListener('change', listener.handler);
    }
    this.mediaQueryListeners.clear();
    this.addedInteractions = {};
    this.listInteractionsCache = {};
    this.controllers.clear();
    this.dataCache = { effects: {}, sequences: {}, conditions: {}, interactions: {} };
    Interact.instances.splice(Interact.instances.indexOf(this), 1);
  }

  setController(key: string, controller: IInteractionController) {
    this.controllers.add(controller);

    Interact.setController(key, controller);
  }

  deleteController(key: string, removeFromCache: boolean = false) {
    const controller = Interact.controllerCache.get(key);

    this.clearInteractionStateForKey(key);
    this.clearMediaQueryListenersForKey(key);

    if (controller && removeFromCache) {
      this.controllers.delete(controller);
      Interact.deleteController(key);
    }
  }

  has(key: string): boolean {
    return !!this.get(key);
  }

  get(key: string): InteractCache['interactions'][string] | undefined {
    const processedKey = _convertToKeyTemplate(key);
    return this.dataCache.interactions[processedKey];
  }

  clearMediaQueryListenersForKey(key: string): void {
    for (const [id, listener] of this.mediaQueryListeners.entries()) {
      if (listener.key === key) {
        listener.mql.removeEventListener('change', listener.handler);
        this.mediaQueryListeners.delete(id);
      }
    }
  }

  clearInteractionStateForKey(key: string): void {
    const interactionIds = this.get(key)?.interactionIds || [];

    interactionIds.forEach((interactionId_) => {
      const interactionId = getInterpolatedKey(interactionId_, key);
      delete this.addedInteractions[interactionId];
    });

    const seqPrefix = `${key}::seq::`;
    for (const cacheKey of Interact.sequenceCache.keys()) {
      if (cacheKey.startsWith(seqPrefix)) {
        Interact.sequenceCache.delete(cacheKey);
        delete this.addedInteractions[cacheKey];
      }
    }
  }

  setupMediaQueryListener(id: string, mql: MediaQueryList, key: string, handler: () => void) {
    if (this.mediaQueryListeners.has(id)) {
      return;
    }

    mql.addEventListener('change', handler);

    this.mediaQueryListeners.set(id, {
      mql,
      handler,
      key,
    });
  }

  static create(config: InteractConfig, options?: InteractInitOptions): Interact {
    const instance = new Interact();
    Interact.instances.push(instance);

    instance.init(config, options);

    return instance;
  }

  static destroy(): void {
    Interact.controllerCache.forEach((controller: IInteractionController) => {
      controller.disconnect();
    });
    Interact.instances.length = 0;
    Interact.controllerCache.clear();
    Interact.sequenceCache.clear();
    Interact.elementSequenceMap = new WeakMap();
    Interact._released.clear();
  }

  static setup(options: {
    scrollOptionsGetter?: () => Partial<scrollConfig>;
    pointerOptionsGetter?: () => Partial<PointerConfig>;
    viewEnter?: Partial<ViewEnterParams>;
    allowA11yTriggers?: boolean;
    forceReducedMotion?: boolean;
    reducedMotionPolicy?: ReducedMotionPolicy;
  }): void {
    if (options.scrollOptionsGetter) {
      TRIGGER_TO_HANDLER_MODULE_MAP.viewProgress.registerOptionsGetter?.(
        options.scrollOptionsGetter,
      );
    }

    if (options.pointerOptionsGetter) {
      TRIGGER_TO_HANDLER_MODULE_MAP.pointerMove.registerOptionsGetter?.(
        options.pointerOptionsGetter,
      );
    }

    if (options.viewEnter) {
      (TRIGGER_TO_HANDLER_MODULE_MAP.viewEnter as ViewEnterHandlerModule).setOptions(
        options.viewEnter,
      );
    }

    if (options.allowA11yTriggers !== undefined) {
      Interact.allowA11yTriggers = options.allowA11yTriggers;
    }

    if (options.forceReducedMotion !== undefined) {
      Interact.forceReducedMotion = options.forceReducedMotion;
    }

    if (options.reducedMotionPolicy !== undefined) {
      Interact.reducedMotionPolicy = options.reducedMotionPolicy;
    }
  }

  static getInstance(key: string): Interact | undefined {
    const instance = Interact.instances.find((instance) => instance.has(key));
    if (!instance) {
      console.warn(`Interact: Instance for key "${key}" not found`);
    }
    return instance;
  }

  static getController(key: string | undefined): IInteractionController | undefined {
    const controller = key ? Interact.controllerCache.get(key) : undefined;
    if (!controller) {
      console.warn(`Interact: Controller for key "${key}" not found`);
    }
    return controller;
  }

  static setController(key: string, controller: IInteractionController): void {
    Interact.controllerCache.set(key, controller);
  }

  static deleteController(key: string): void {
    Interact.controllerCache.delete(key);
  }

  static registerEffects = registerEffects;
  static getRegisteredEffect = getRegisteredEffect;

  /**
   * Registers a plugin under a name. When the config carries a plugin field (e.g. `$splitText`) with a matching key
   * (on an interaction or effect), Interact invokes the plugin with the field's value and a
   * context. Interact is agnostic to what the plugin does — see the `InteractPlugin` type.
   *
   * With `options.defer`, the plugin — and every interaction, effect, or sequence carrying its
   * field — is deferred until each named event is released via `Interact.ready()`.
   */
  static use(name: string, plugin: InteractPlugin, options?: InteractPluginOptions): void {
    Interact.plugins.set(name, plugin);

    const defer = options?.defer;
    if (defer && defer.length) {
      Interact.pluginDefers.set(name, Array.isArray(defer) ? defer : [defer]);
    } else {
      Interact.pluginDefers.delete(name);
    }
  }

  /**
   * Releases a defer name — for every key, or only for `key` — and applies everything that was
   * deferred on it (see the `defer` option of `Interact.use()`).
   */
  static ready(name: string, key?: string): void {
    Interact._released.add(key ? `${name}::${key}` : name);

    if (key) {
      Interact.controllerCache.get(key)?.resume();
    } else {
      Interact.controllerCache.forEach((controller) => controller.resume());
    }
  }

  static _isPluginReleased(pluginName: string, key: string): boolean {
    const defer = Interact.pluginDefers.get(pluginName);
    if (!defer) {
      return true;
    }

    return defer.every(
      (name) => Interact._released.has(name) || Interact._released.has(`${name}::${key}`),
    );
  }

  static getPlugin(name: string): InteractPlugin | undefined {
    return Interact.plugins.get(name);
  }

  static getPluginsNames(): Set<string> {
    return new Set(Interact.plugins.keys());
  }

  static getSequence(
    cacheKey: string,
    sequenceOptions: SequenceOptions,
    animationGroupArgs: AnimationGroupArgs[],
  ): Sequence {
    const cached = Interact.sequenceCache.get(cacheKey);
    if (cached) return cached;

    const sequence = getMotionSequence(sequenceOptions, animationGroupArgs);
    Interact.sequenceCache.set(cacheKey, sequence);
    Interact._registerSequenceElements(animationGroupArgs, sequence);

    return sequence;
  }

  static addToSequence(
    cacheKey: string,
    animationGroupArgs: AnimationGroupArgs[],
    indices: number[],
  ): boolean {
    const cached = Interact.sequenceCache.get(cacheKey);

    if (!cached) return false;

    const newGroups = createAnimationGroups(animationGroupArgs);
    const entries: IndexedGroup[] = newGroups.map((group, i) => ({
      index: indices[i] ?? cached.animationGroups.length,
      group,
    }));

    cached.addGroups(entries);
    Interact._registerSequenceElements(animationGroupArgs, cached);

    return true;
  }

  private static _registerSequenceElements(
    animationGroupArgs: AnimationGroupArgs[],
    sequence: Sequence,
  ): void {
    for (const { target } of animationGroupArgs) {
      // String selector targets are resolved to HTMLElements before reaching here
      // (see _buildAnimationGroupArgsFromSequence in add.ts), so only HTMLElement
      // and HTMLElement[] need handling.
      const elements = Array.isArray(target)
        ? target
        : target instanceof HTMLElement
          ? [target]
          : [];
      for (const el of elements) {
        let seqs = Interact.elementSequenceMap.get(el);
        if (!seqs) {
          seqs = new Set();
          Interact.elementSequenceMap.set(el, seqs);
        }
        seqs.add(sequence);
      }
    }
  }

  static removeFromSequences(elements: HTMLElement[]): void {
    for (const element of elements) {
      const sequences = Interact.elementSequenceMap.get(element);
      if (!sequences) continue;

      for (const sequence of sequences) {
        // Optional chaining on `.effect` handles cases where animations were
        // already cancelled (e.g. by a prior removeGroups call in this loop),
        // which may null out the effect reference.
        sequence.removeGroups((group) =>
          group.animations.some((a) => (a.effect as KeyframeEffect)?.target === element),
        );
      }

      Interact.elementSequenceMap.delete(element);
    }
  }
}

let interactionIdCounter = 0;

export function getSelector(
  d: Interaction | Effect,
  {
    asCombinator = false,
    addItemFilter = false,
    useFirstChild = false,
  }: { asCombinator?: boolean; addItemFilter?: boolean; useFirstChild?: boolean } = {},
): string {
  if (d.listContainer) {
    const itemFilter = `${addItemFilter && d.listItemSelector ? ` > ${d.listItemSelector}` : ''}`;

    if (d.selector) {
      return `${d.listContainer}${itemFilter} ${d.selector}`;
    }

    return `${d.listContainer}${itemFilter || ' > *'}`;
  } else if (d.selector) {
    return d.selector;
  }

  // TODO: consider moving :scope to be configurable since it may lead to unexpected results in some cases
  return useFirstChild ? (asCombinator ? '> :first-child' : ':scope > :first-child') : '';
}

/**
 * Parses the config object and caches interactions, effects, and conditions
 */
function _isSequenceConfigRef(
  config: SequenceConfig | SequenceConfigRef,
): config is SequenceConfigRef {
  return 'sequenceId' in config && !('effects' in config);
}

function _ensureInteractionEntry(
  interactions: InteractCache['interactions'],
  key: string,
): InteractCache['interactions'][string] {
  if (!interactions[key]) {
    interactions[key] = {
      triggers: [],
      effects: {},
      sequences: {},
      interactionIds: new Set(),
      selectors: new Set(),
    };
  }

  return interactions[key];
}

// the sequence's effects in their slots - copied, since a referenced sequence can be in different slots
function withSlots<T extends SequenceConfig | SequenceConfigRef>(
  sequence: T,
  getKey: (effectIndex: number) => string,
  slots: Map<string, string>,
): T {
  const { effects = [] } = sequence as Partial<SequenceConfig>;
  if (!effects.some((_, index) => slots.has(getKey(index)))) {
    return sequence;
  }
  return {
    ...sequence,
    effects: effects.map((effect, index) => {
      const suffix = slots.get(getKey(index));
      return suffix ? { ...effect, suffix } : effect;
    }),
  };
}

function parseConfig(
  config: InteractConfig,
  useCustomElement: boolean,
  options: Required<Pick<InteractInitOptions, 'forceReducedMotion' | 'reducedMotionPolicy'>> &
    Pick<InteractInitOptions, 'configIndex'>,
): InteractCache {
  const { configIndex } = options;
  const { effects: effectMap = {}, sequences: sequenceMap = {}, conditions = {} } = config;
  const interactions: InteractCache['interactions'] = {};
  const slots = config.interactions ? getKeyframeSlots(config, options) : new Map<string, string>();

  config.interactions?.forEach((interaction_, interactionIndex) => {
    const source = interaction_.key;
    const interactionIdx = ++interactionIdCounter;
    const { effects: effects_, sequences: sequences_, ...rest } = interaction_;

    if (!source) {
      console.error(`Interaction ${interactionIdx} is missing a key for source element.`);
      return;
    }

    _ensureInteractionEntry(interactions, source);

    /*
     * Cache interaction trigger by source element
     */
    const effects = effects_ ? Array.from(effects_) : [];
    effects.reverse(); // reverse to ensure the first effect is the one that will be applied first

    // Resolve and preprocess sequences
    const processedSequences = sequences_?.map((seqOrRef, sequenceIndex) => {
      if (_isSequenceConfigRef(seqOrRef)) {
        const resolved = sequenceMap[seqOrRef.sequenceId];
        if (!resolved) {
          console.warn(`Interact: Sequence "${seqOrRef.sequenceId}" not found in config`);
          return seqOrRef;
        }
        return { ...resolved, ...seqOrRef } as SequenceConfig;
      }

      const seq = seqOrRef as SequenceConfig;
      if (!seq.sequenceId) {
        seq.sequenceId = getFallbackId('seq', [interactionIndex, sequenceIndex], configIndex);
      }
      return seq;
    });

    const interaction = {
      ...rest,
      effects: effects.length > 0 ? effects : undefined,
      sequences: processedSequences?.map((seq, sequenceIndex) =>
        withSlots(
          seq,
          (effectIndex) => getSlotKey(interactionIndex, effectIndex, sequenceIndex),
          slots,
        ),
      ),
    } as Interaction;

    interactions[source].triggers.push(interaction);
    interactions[source].selectors.add(
      getSelector(interaction, { useFirstChild: useCustomElement }),
    );

    const listContainer = interaction.listContainer;

    effects.forEach((effect, effectIndex) => {
      /*
       * Target cascade order is the first of:
       *  -> Config.interactions.effects.effect.key
       *  -> Config.effects.effect.key
       *  -> Config.interactions.interaction.key
       */
      const referencedEffect = (effect as EffectRef).effectId
        ? effectMap[(effect as EffectRef).effectId]
        : undefined;
      let target = effect.key || referencedEffect?.key;

      const configEffectIndex = effects.length - 1 - effectIndex;
      if (!(effect as EffectRef).effectId) {
        (effect as EffectRef).effectId = getFallbackId(
          'eff',
          [interactionIndex, configEffectIndex],
          configIndex,
        );
      }
      const suffix = slots.get(getSlotKey(interactionIndex, configEffectIndex));
      if (suffix) {
        (effect as { suffix?: string }).suffix = suffix;
      }

      // if no target is specified, use the source element as the target
      target = target || source;
      effect.key = target;

      if (listContainer && effect.listContainer) {
        // we do not support having 2 separate lists for same interaction
        if (target !== source || effect.listContainer !== listContainer) {
          return;
        }
      }

      const targetHash = getElementHash({ ...referencedEffect, ...effect, key: target });
      const interactionId = `${source}::${targetHash}::${interactionIdx}`;
      effect.interactionId = interactionId;
      interactions[source].interactionIds.add(interactionId);

      if (target === source) {
        // if target is the source element, no need to add an interaction to `effects`
        return;
      }

      /*
       * Cache interaction effect by target element
       */
      const targetEntry = _ensureInteractionEntry(interactions, target);
      if (!targetEntry.effects[interactionId]) {
        targetEntry.effects[interactionId] = [];
        targetEntry.interactionIds.add(interactionId);
      }

      targetEntry.effects[interactionId].push({ ...rest, effect });
      targetEntry.selectors.add(getSelector(effect, { useFirstChild: useCustomElement }));
    });

    // Process sequence effects for selector tracking and cross-element referencing
    processedSequences?.forEach((seqConfig) => {
      if (!seqConfig || _isSequenceConfigRef(seqConfig)) return;

      const sequenceConfig = seqConfig as SequenceConfig;
      const sequenceId = sequenceConfig.sequenceId!;
      const seqEffects = sequenceConfig.effects;

      seqEffects.forEach((effect, effectIndex) => {
        if (!(effect as EffectRef).effectId) {
          (effect as EffectRef).effectId = `eff-${sequenceId}-${effectIndex}`;
        }

        let target = effect.key;
        if (!target && (effect as EffectRef).effectId) {
          const referencedEffect = effectMap[(effect as EffectRef).effectId];
          if (referencedEffect) {
            target = referencedEffect.key;
          }
        }
        target = target || source;

        const effectSelector = getSelector(effect, { useFirstChild: useCustomElement });
        if (effectSelector) {
          interactions[source].selectors.add(effectSelector);
        }

        if (target !== source) {
          const targetEntry = _ensureInteractionEntry(interactions, target);
          const seqInteractionId = `${target}::seq::${sequenceId}::${interactionIdx}`;

          if (!targetEntry.sequences[seqInteractionId]) {
            targetEntry.sequences[seqInteractionId] = [];
            targetEntry.interactionIds.add(seqInteractionId);
          }

          targetEntry.sequences[seqInteractionId].push({
            ...rest,
            sequence: sequenceConfig,
          });
          targetEntry.selectors.add(effectSelector);
        }
      });
    });
  });

  return {
    effects: effectMap,
    sequences: sequenceMap,
    conditions: withReducedMotionConditions(conditions),
    reducedMotionPolicy: options.reducedMotionPolicy,
    forceReducedMotion: options.forceReducedMotion,
    interactions,
  };
}
