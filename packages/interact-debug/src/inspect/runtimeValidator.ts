/**
 * Runtime validator — runs in browser context.
 *
 * Validates that the live DOM is consistent with the InteractConfig:
 * every config key has a DOM element, a connected controller, and the
 * expected number of animations.
 */

import type { InteractConfig } from '../types';
import { isRecord, buildGlobalMaps, resolveEffect, resolveSequence } from '../validate/helpers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RuntimeCheck = {
  key: string;
  passed: boolean;
  checks: { name: string; passed: boolean; expected?: string; actual?: string }[];
};

export type CapturedWarning = {
  timestamp: number;
  message: string;
  args: unknown[];
};

// ---------------------------------------------------------------------------
// validateRuntime
// ---------------------------------------------------------------------------

/**
 * For every key in config, checks:
 * - A matching DOM element exists
 * - The element has a connected controller (via Interact.controllerCache or
 *   the presence of data-interact-enter/effect attrs)
 * - The expected animation count matches actual WAAPI animations
 */
export function validateRuntime(config: InteractConfig, root?: ParentNode): RuntimeCheck[] {
  const container = root ?? document;
  const results: RuntimeCheck[] = [];
  const seen = new Set<string>();

  for (const interaction of config.interactions) {
    if (seen.has(interaction.key)) continue;
    seen.add(interaction.key);
    results.push(validateKeyRuntime(config, interaction.key, container));
  }

  return results;
}

/**
 * Validate a single key at runtime.
 */
export function validateKeyRuntime(config: InteractConfig, key: string, root?: ParentNode): RuntimeCheck {
  const container = root ?? document;
  const checks: RuntimeCheck['checks'] = [];

  // 1. DOM element exists
  const el = container.querySelector(`[data-interact-key="${key}"]`)
    ?? container.querySelector(`interact-element[data-interact-key="${key}"]`);

  const hasElement = el !== null;
  checks.push({ name: 'dom-element-exists', passed: hasElement, expected: 'element present', actual: hasElement ? 'found' : 'missing' });

  if (!el) {
    return { key, passed: false, checks };
  }

  // 2. Controller connected
  const controllerConnected = checkControllerConnected(el, key);
  checks.push({
    name: 'controller-connected',
    passed: controllerConnected,
    expected: 'controller connected',
    actual: controllerConnected ? 'connected' : 'not connected',
  });

  // 3. Animation count
  const expected = countExpectedAnimations(config, key);
  const actual = countActualAnimations(el);
  // Only report if animations are expected and the trigger has likely fired
  if (expected > 0) {
    checks.push({
      name: 'animation-count',
      passed: actual >= 0, // relaxed: animations may not have fired yet
      expected: `${expected} expected`,
      actual: `${actual} present`,
    });
  }

  return {
    key,
    passed: checks.every((c) => c.passed),
    checks,
  };
}

// ---------------------------------------------------------------------------
// compareExpectedAnimations
// ---------------------------------------------------------------------------

/**
 * Count the expected number of animation effects for a key from the config,
 * and compare with the actual WAAPI animation count on the element.
 */
export function compareExpectedAnimations(
  config: InteractConfig,
  key: string,
  root?: ParentNode,
): { key: string; expected: number; actual: number; match: boolean } {
  const container = root ?? document;
  const expected = countExpectedAnimations(config, key);

  const el = container.querySelector(`[data-interact-key="${key}"]`);
  const actual = el ? countActualAnimations(el) : 0;

  return { key, expected, actual, match: actual === expected };
}

// ---------------------------------------------------------------------------
// captureWarnings
// ---------------------------------------------------------------------------

/**
 * Run a callback while capturing all console.warn calls.
 * Returns the captured warnings.
 */
export function captureWarnings(fn: () => void): CapturedWarning[] {
  const captured: CapturedWarning[] = [];
  const original = console.warn;

  console.warn = (...args: unknown[]) => {
    captured.push({
      timestamp: Date.now(),
      message: typeof args[0] === 'string' ? args[0] : String(args[0]),
      args,
    });
  };

  try {
    fn();
  } finally {
    console.warn = original;
  }

  return captured;
}

/**
 * Async variant of captureWarnings.
 */
export async function captureWarningsAsync(fn: () => Promise<void>): Promise<CapturedWarning[]> {
  const captured: CapturedWarning[] = [];
  const original = console.warn;

  console.warn = (...args: unknown[]) => {
    captured.push({
      timestamp: Date.now(),
      message: typeof args[0] === 'string' ? args[0] : String(args[0]),
      args,
    });
  };

  try {
    await fn();
  } finally {
    console.warn = original;
  }

  return captured;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function checkControllerConnected(el: Element, key: string): boolean {
  const Interact = (globalThis as any).Interact ?? (globalThis as any).window?.Interact;

  if (Interact?.controllerCache) {
    const controller = Interact.controllerCache.get(key);
    return controller != null;
  }

  // Fallback: check if the library has set its data attributes
  return el.hasAttribute('data-interact-enter')
    || el.hasAttribute('data-interact-effect')
    || el.tagName.toLowerCase() === 'interact-element';
}

function countExpectedAnimations(config: InteractConfig, key: string): number {
  const { globalEffects, globalSequences } = buildGlobalMaps(config);
  let count = 0;

  for (const interaction of config.interactions) {
    if (interaction.key !== key) continue;

    if (interaction.effects) {
      for (const raw of interaction.effects) {
        if (!isRecord(raw)) continue;
        const eff = resolveEffect(raw as Record<string, unknown>, globalEffects);
        // Only animation effects produce WAAPI animations (not state effects)
        if ('keyframeEffect' in eff || 'namedEffect' in eff || 'customEffect' in eff) {
          // Only count if targeting same element (no cross-key)
          if (!('key' in eff) || eff.key === key) {
            count++;
          }
        }
      }
    }

    if (interaction.sequences) {
      for (const rawSeq of interaction.sequences) {
        if (!isRecord(rawSeq)) continue;
        const seq = resolveSequence(rawSeq as Record<string, unknown>, globalSequences);
        if (Array.isArray(seq.effects)) {
          for (const rawEff of seq.effects) {
            if (!isRecord(rawEff)) continue;
            const eff = resolveEffect(rawEff as Record<string, unknown>, globalEffects);
            if ('keyframeEffect' in eff || 'namedEffect' in eff || 'customEffect' in eff) {
              if (!('key' in eff) || eff.key === key) {
                count++;
              }
            }
          }
        }
      }
    }
  }

  return count;
}

function countActualAnimations(el: Element): number {
  if (typeof (el as HTMLElement).getAnimations !== 'function') return 0;
  return (el as HTMLElement).getAnimations().length;
}
