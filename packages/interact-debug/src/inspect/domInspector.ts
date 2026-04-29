/**
 * DOM inspector — runs in browser context.
 *
 * Provides introspection of data-interact-* attributes, adopted stylesheets,
 * and Web Animations API state for Interact-managed elements.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ElementInspection = {
  tagName: string;
  key: string | null;
  attributes: Record<string, string>;
  /** data-interact-* attribute values */
  interactAttributes: Record<string, string>;
  /** CSS rules from adopted stylesheets targeting this element (if any) */
  adoptedStyleRules: string[];
  animations: AnimationSnapshot[];
  childCount: number;
};

export type AnimationSnapshot = {
  name: string;
  playState: string;
  currentTime: number | null;
  duration: number | null;
  progress: number | null;
  keyframeCount: number;
};

export type AnimationState = {
  name: string;
  playState: string;
  currentTime: number | null;
  duration: number | null;
  progress: number | null;
};

// ---------------------------------------------------------------------------
// inspectElement
// ---------------------------------------------------------------------------

/**
 * Inspect an element for Interact-related attributes and animation state.
 */
export function inspectElement(element: Element): ElementInspection {
  const attrs: Record<string, string> = {};
  const interactAttrs: Record<string, string> = {};

  for (const attr of element.attributes) {
    attrs[attr.name] = attr.value;
    if (attr.name.startsWith('data-interact')) {
      interactAttrs[attr.name] = attr.value;
    }
  }

  const adoptedRules = getAdoptedStyleRules(element);
  const animations = getAnimationSnapshots(element);

  return {
    tagName: element.tagName.toLowerCase(),
    key: element.getAttribute('data-interact-key'),
    attributes: attrs,
    interactAttributes: interactAttrs,
    adoptedStyleRules: adoptedRules,
    animations,
    childCount: element.children.length,
  };
}

// ---------------------------------------------------------------------------
// getAnimationState
// ---------------------------------------------------------------------------

/**
 * Get the state of all WAAPI animations on an element.
 */
export function getAnimationState(element: Element): AnimationState[] {
  if (typeof (element as HTMLElement).getAnimations !== 'function') return [];

  return (element as HTMLElement).getAnimations().map((anim) => {
    const effect = anim.effect as KeyframeEffect | null;
    const timing = effect?.getComputedTiming?.();

    return {
      name: (anim as any).animationName ?? anim.id ?? '',
      playState: anim.playState,
      currentTime: typeof anim.currentTime === 'number' ? anim.currentTime : null,
      duration: typeof timing?.duration === 'number' ? timing.duration : null,
      progress: typeof timing?.progress === 'number' ? timing.progress : null,
    };
  });
}

// ---------------------------------------------------------------------------
// inspectByKey
// ---------------------------------------------------------------------------

/**
 * Find an element by its data-interact-key and return a full inspection.
 */
export function inspectByKey(key: string, root?: ParentNode): ElementInspection | null {
  const container = root ?? document;
  const element =
    container.querySelector(`[data-interact-key="${key}"]`) ??
    container.querySelector(`interact-element[data-interact-key="${key}"]`);

  if (!element) return null;
  return inspectElement(element);
}

// ---------------------------------------------------------------------------
// findOrphanedElements
// ---------------------------------------------------------------------------

/**
 * Find all elements with data-interact-key that do NOT have a connected
 * InteractionController (detected by the absence of data-interact-enter
 * or data-interact-effect attributes, which are set by the library on connect).
 *
 * A more reliable check uses the Interact static cache when available.
 */
export function findOrphanedElements(root?: ParentNode): { key: string; element: Element }[] {
  const container = root ?? document;
  const allKeyed = container.querySelectorAll('[data-interact-key]');
  const orphans: { key: string; element: Element }[] = [];

  const Interact = (globalThis as any).Interact ?? (globalThis as any).window?.Interact;
  const controllerCache: Map<string, unknown> | undefined = Interact?.controllerCache;

  for (const element of allKeyed) {
    const key = element.getAttribute('data-interact-key');
    if (!key) continue;

    if (controllerCache) {
      if (!controllerCache.has(key)) {
        orphans.push({ key, element });
      }
    } else {
      const hasController =
        element.hasAttribute('data-interact-enter') || element.hasAttribute('data-interact-effect');
      if (!hasController) {
        orphans.push({ key, element });
      }
    }
  }

  return orphans;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getAdoptedStyleRules(element: Element): string[] {
  const rules: string[] = [];
  try {
    const doc = element.ownerDocument;
    if (!doc?.adoptedStyleSheets) return rules;

    for (const sheet of doc.adoptedStyleSheets) {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSStyleRule) {
          try {
            if (element.matches(rule.selectorText)) {
              rules.push(rule.cssText);
            }
          } catch {
            // invalid selector — skip
          }
        }
      }
    }
  } catch {
    // adoptedStyleSheets not supported
  }
  return rules;
}

function getAnimationSnapshots(element: Element): AnimationSnapshot[] {
  if (typeof (element as HTMLElement).getAnimations !== 'function') return [];

  return (element as HTMLElement).getAnimations().map((anim) => {
    const effect = anim.effect as KeyframeEffect | null;
    const timing = effect?.getComputedTiming?.();
    let keyframeCount = 0;
    try {
      keyframeCount = (effect as KeyframeEffect)?.getKeyframes?.()?.length ?? 0;
    } catch {
      // not all effects support getKeyframes
    }

    return {
      name: (anim as any).animationName ?? anim.id ?? '',
      playState: anim.playState,
      currentTime: typeof anim.currentTime === 'number' ? anim.currentTime : null,
      duration: typeof timing?.duration === 'number' ? timing.duration : null,
      progress: typeof timing?.progress === 'number' ? timing.progress : null,
      keyframeCount,
    };
  });
}
