import { Interact } from './Interact';
import { getInterpolatedKey } from './utilities';
import type {
  IInteractionController,
  Effect,
  EffectRef,
  SequenceConfig,
  SplitTextConfig,
  SplitTextConfigRef,
  SplitTextResolver,
  SplitTextResolverContext,
} from '../types';

/**
 * State attribute stamped on a `hide` container to drive the FOUC-prevention
 * CSS rule. Shared contract between `@wix/interact` and the splitText provider.
 */
export const TEXT_SPLIT_STATE_ATTR = 'data-text-split';
/** Container is awaiting split — hidden by the generated CSS rule. */
export const TEXT_SPLIT_PENDING = 'pending';
/** Container has been split — revealed. */
export const TEXT_SPLIT_DONE = 'split';

const MISSING_RESOLVER_ERROR =
  "splitText found in config but no resolver registered. Call Interact.use('splitText', resolver) before Interact.create().";

type SplitEntry = { container: string; root: HTMLElement; hide: boolean };

/** Carries enough of an interaction/effect to build a resolver context. */
type ContextSource = {
  selector?: string;
  listContainer?: string;
  listItemSelector?: string;
  conditions?: string[];
};

type SplitRequest = {
  raw: SplitTextConfig | SplitTextConfigRef;
  ctxSource: ContextSource;
};

// Track what was split per controller so revert() can undo exactly that.
const splitsByController = new WeakMap<IInteractionController, SplitEntry[]>();

/**
 * Stamp a container as hidden until splitText runs. Useful for consumers that
 * build DOM imperatively and want to opt into the FOUC guard (the same effect
 * the SSR/static-CSS layer achieves by rendering the attribute server-side).
 */
export function markSplitTextHidden(el: HTMLElement): void {
  el.setAttribute(TEXT_SPLIT_STATE_ATTR, TEXT_SPLIT_PENDING);
}

/** Resolve the literal target key of an effect, mirroring parseConfig's cascade. */
function resolveEffectTargetKey(
  effect: Effect | EffectRef,
  sourceKey: string,
  instance: Interact,
): string {
  let target = effect.key;

  if (!target) {
    const effectId = (effect as EffectRef).effectId;
    const referenced = effectId ? instance.dataCache.effects[effectId] : undefined;
    target = referenced?.key;
  }

  return target || sourceKey;
}

/** True when `effect` (sourced at `sourceKey`) ultimately targets `key`. */
function effectTargetsKey(
  effect: Effect | EffectRef,
  sourceKey: string,
  key: string,
  instance: Interact,
): boolean {
  return getInterpolatedKey(resolveEffectTargetKey(effect, sourceKey, instance), key) === key;
}

/** Merge a `splitId` reference with its definition, with inline fields winning. */
function resolveSplitConfig(
  raw: SplitTextConfig | SplitTextConfigRef,
  instance: Interact,
): SplitTextConfig {
  const splitId = (raw as SplitTextConfigRef).splitId;

  if (splitId) {
    const base = instance.dataCache.splitText[splitId];
    if (base) {
      return { ...base, ...raw } as SplitTextConfig;
    }
  }

  return raw as SplitTextConfig;
}

/**
 * Collect every splitText request whose container lives inside the connecting
 * element's subtree (`key`). Covers interaction-level, same-element
 * effect/sequence-level, and cross-element (this key is the target) cases.
 */
function gatherSplitRequests(key: string, instance: Interact): SplitRequest[] {
  const data = instance.get(key);
  if (!data) return [];

  const requests: SplitRequest[] = [];

  // Interactions where `key` is the source.
  for (const interaction of data.triggers) {
    // Interaction-level split.
    if (interaction.splitText) {
      requests.push({ raw: interaction.splitText, ctxSource: interaction });
    }

    // Same-element effect-level split (effect targets the source element).
    for (const effect of interaction.effects || []) {
      if (effect.splitText && effectTargetsKey(effect, key, key, instance)) {
        requests.push({ raw: effect.splitText, ctxSource: effect });
      }
    }

    // Same-element sequence effect-level split.
    for (const seqOrRef of interaction.sequences || []) {
      const seqEffects = (seqOrRef as SequenceConfig).effects;
      if (!seqEffects) continue;

      for (const effect of seqEffects) {
        if (effect.splitText && effectTargetsKey(effect, key, key, instance)) {
          requests.push({ raw: effect.splitText, ctxSource: effect });
        }
      }
    }
  }

  // Cross-element effects where `key` is the target.
  for (const variations of Object.values(data.effects)) {
    for (const { effect } of variations) {
      if (effect.splitText) {
        requests.push({ raw: effect.splitText, ctxSource: effect });
      }
    }
  }

  // Cross-element sequence effects where `key` is the target.
  for (const variations of Object.values(data.sequences)) {
    for (const { sequence, ...interaction } of variations) {
      const seqSourceKey = interaction.key;
      for (const effect of sequence.effects || []) {
        if (effect.splitText && effectTargetsKey(effect, seqSourceKey, key, instance)) {
          requests.push({ raw: effect.splitText, ctxSource: effect });
        }
      }
    }
  }

  return requests;
}

/**
 * Pre-processing DOM-mutation step run at the top of `add(controller)`: splits
 * every in-subtree container into wrapper spans before Interact resolves
 * animation targets. Throws if any splitText config is present but no resolver
 * was registered.
 */
export function applySplitText(controller: IInteractionController, instance: Interact): void {
  const key = controller.key as string;
  const requests = gatherSplitRequests(key, instance);

  if (requests.length === 0) return;

  const resolver = Interact.getResolver<SplitTextResolver>('splitText');
  if (!resolver) {
    throw new Error(MISSING_RESOLVER_ERROR);
  }

  const root = controller.element;
  const seen = new Set<string>();
  const entries: SplitEntry[] = splitsByController.get(controller) ?? [];

  for (const { raw, ctxSource } of requests) {
    const merged = resolveSplitConfig(raw, instance);

    // One split per container per connect.
    if (!merged.container || seen.has(merged.container)) continue;
    seen.add(merged.container);

    const containerEl = root.querySelector(merged.container);

    // Hide the container before splitting (idempotent; SSR may have set it).
    if (merged.hide) {
      containerEl?.setAttribute(TEXT_SPLIT_STATE_ATTR, TEXT_SPLIT_PENDING);
    }

    const context: SplitTextResolverContext = {
      key,
      selector: ctxSource.selector,
      listContainer: ctxSource.listContainer,
      listItemSelector: ctxSource.listItemSelector,
      conditions: ctxSource.conditions,
      onResplit: () => controller.update(),
    };

    resolver.resolve(root, merged, context);

    // Reveal once split — always, regardless of reduced motion, otherwise the
    // text would stay hidden.
    if (merged.hide) {
      containerEl?.setAttribute(TEXT_SPLIT_STATE_ATTR, TEXT_SPLIT_DONE);
    }

    entries.push({ container: merged.container, root, hide: !!merged.hide });
  }

  if (entries.length) {
    splitsByController.set(controller, entries);
  }
}

/**
 * Revert every split performed for `controller`, restoring original content
 * and clearing any `hide` state attribute. Reached on disconnect and on
 * `controller.update()` (disconnect → connect).
 */
export function revertSplitText(controller: IInteractionController): void {
  const entries = splitsByController.get(controller);
  if (!entries || entries.length === 0) return;

  const resolver = Interact.getResolver<SplitTextResolver>('splitText');

  for (const entry of entries) {
    resolver?.revert(entry.root, entry.container);

    if (entry.hide) {
      entry.root.querySelector(entry.container)?.removeAttribute(TEXT_SPLIT_STATE_ATTR);
    }
  }

  splitsByController.delete(controller);
}
