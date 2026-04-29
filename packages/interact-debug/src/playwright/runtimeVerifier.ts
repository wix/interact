import type { Page } from '@playwright/test';
import type { InteractArtifact, Scope, TriggerType } from '../types';
import { isRecord, isInScope, resolveEffect, buildGlobalMaps } from '../validate/helpers';
import { fireTrigger, reverseTrigger } from './triggerHelpers';
import { waitForAnimationState, getComputedStyleProp } from './animationHelpers';

export type VerificationCheck = {
  name: string;
  passed: boolean;
  expected?: string;
  actual?: string;
};

export type VerificationResult = {
  interaction: { key: string; trigger: TriggerType; index: number };
  passed: boolean;
  checks: VerificationCheck[];
};

/**
 * Verify all interactions in the artifact by firing triggers and checking
 * that animated styles actually change in the browser.
 */
export async function verifyAll(
  page: Page,
  artifact: InteractArtifact,
  scope?: Scope,
): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];

  for (let i = 0; i < artifact.config.interactions.length; i++) {
    const ix = artifact.config.interactions[i];
    if (!isInScope(ix, i, scope)) continue;
    results.push(await verifyInteraction(page, artifact, i));
  }

  return results;
}

/**
 * Verify a single interaction by index.
 */
export async function verifyInteraction(
  page: Page,
  artifact: InteractArtifact,
  index: number,
): Promise<VerificationResult> {
  const ix = artifact.config.interactions[index];
  const { globalEffects } = buildGlobalMaps(artifact.config);
  const checks: VerificationCheck[] = [];

  const targetKey = ix.key;
  const animatedProps = extractAnimatedProperties(ix, globalEffects);
  const effectTypes = classifyEffects(ix, globalEffects);

  // 1. Check DOM element exists
  const exists = await page.evaluate((key) => {
    return !!document.querySelector(`[data-interact-key="${key}"]`);
  }, targetKey);
  checks.push({
    name: 'element-exists',
    passed: exists,
    expected: 'present',
    actual: exists ? 'found' : 'missing',
  });

  if (!exists) {
    return { interaction: { key: targetKey, trigger: ix.trigger, index }, passed: false, checks };
  }

  // 2. Record baseline styles
  const baseline: Record<string, string> = {};
  for (const prop of animatedProps) {
    baseline[prop] = await getComputedStyleProp(page, targetKey, prop);
  }

  // 3. Fire trigger
  await fireTrigger(page, ix.trigger, targetKey);

  // 4. Wait for animation to start (time/scrub effects) or state to change
  if (effectTypes.has('time') || effectTypes.has('scrub')) {
    try {
      await waitForAnimationState(page, targetKey, ['running', 'finished'], 3000);
      checks.push({ name: 'animation-started', passed: true });
    } catch {
      checks.push({
        name: 'animation-started',
        passed: false,
        expected: 'running or finished',
        actual: 'no animation detected',
      });
    }
  }

  // Small settle time for state effects
  await page.waitForTimeout(300);

  // 5. Check that at least one animated property changed
  if (animatedProps.length > 0) {
    let anyChanged = false;
    for (const prop of animatedProps) {
      const current = await getComputedStyleProp(page, targetKey, prop);
      if (current !== baseline[prop]) {
        anyChanged = true;
        break;
      }
    }
    checks.push({
      name: 'style-changed',
      passed: anyChanged,
      expected: 'at least one property changed',
      actual: anyChanged ? 'changed' : 'no change detected',
    });
  }

  // 6. For state effects, check data attribute toggle
  if (effectTypes.has('state')) {
    const hasEffectAttr = await page.evaluate((key) => {
      const el = document.querySelector(`[data-interact-key="${key}"]`);
      return el ? el.hasAttribute('data-interact-effect') : false;
    }, targetKey);
    checks.push({
      name: 'state-attribute',
      passed: hasEffectAttr,
      expected: 'data-interact-effect present',
      actual: hasEffectAttr ? 'present' : 'missing',
    });
  }

  // 7. For alternate triggerType, reverse and check return to baseline
  const isAlternate = getEffectTriggerTypes(ix, globalEffects).includes('alternate');
  if (isAlternate) {
    await reverseTrigger(page, ix.trigger, targetKey);
    await page.waitForTimeout(500);

    let returned = true;
    for (const prop of animatedProps) {
      const current = await getComputedStyleProp(page, targetKey, prop);
      if (current !== baseline[prop]) {
        returned = false;
        break;
      }
    }
    checks.push({
      name: 'alternate-reset',
      passed: returned,
      expected: 'styles return to baseline',
      actual: returned ? 'returned' : 'did not return',
    });
  }

  // 8. For scrub effects, check multiple progress points produce different styles
  if (effectTypes.has('scrub') && ix.trigger === 'viewProgress') {
    const { scrollToProgress } = await import('./scrollHelpers');
    const stylesAtPoints: string[] = [];
    for (const progress of [0, 0.5, 1]) {
      await scrollToProgress(page, targetKey, progress);
      await page.waitForTimeout(200);
      const vals = await Promise.all(
        animatedProps.map((p) => getComputedStyleProp(page, targetKey, p)),
      );
      stylesAtPoints.push(vals.join('|'));
    }
    const uniqueStyles = new Set(stylesAtPoints).size;
    checks.push({
      name: 'scrub-variation',
      passed: uniqueStyles > 1,
      expected: 'different styles at different scroll positions',
      actual: `${uniqueStyles} unique style states across 3 points`,
    });
  }

  return {
    interaction: { key: targetKey, trigger: ix.trigger, index },
    passed: checks.every((c) => c.passed),
    checks,
  };
}

/**
 * Verify all interactions for a given key.
 */
export async function verifyKey(
  page: Page,
  artifact: InteractArtifact,
  key: string,
): Promise<VerificationResult[]> {
  return verifyAll(page, artifact, { key });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function extractAnimatedProperties(
  interaction: Record<string, unknown>,
  globalEffects: Record<string, Record<string, unknown>>,
): string[] {
  const props = new Set<string>();
  const effects = Array.isArray(interaction.effects) ? interaction.effects : [];

  for (const raw of effects) {
    if (!isRecord(raw)) continue;
    const eff = resolveEffect(raw as Record<string, unknown>, globalEffects);
    const targetKey = typeof eff.key === 'string' ? eff.key : interaction.key;
    if (targetKey !== interaction.key) continue;

    if (isRecord(eff.keyframeEffect)) {
      const kf = eff.keyframeEffect as Record<string, unknown>;
      if (Array.isArray(kf.keyframes)) {
        for (const frame of kf.keyframes) {
          if (!isRecord(frame)) continue;
          for (const key of Object.keys(frame as Record<string, unknown>)) {
            if (key === 'offset' || key === 'easing' || key === 'composite') continue;
            props.add(camelToKebab(key));
          }
        }
      }
    }

    if (isRecord(eff.transition)) {
      const trans = eff.transition as Record<string, unknown>;
      for (const key of Object.keys(trans)) {
        props.add(camelToKebab(key));
      }
    }

    if (Array.isArray(eff.transitionProperties)) {
      for (const tp of eff.transitionProperties) {
        if (isRecord(tp) && typeof (tp as Record<string, unknown>).property === 'string') {
          props.add(camelToKebab((tp as Record<string, unknown>).property as string));
        }
      }
    }

    if (isRecord(eff.namedEffect)) {
      props.add('transform');
      props.add('opacity');
    }
  }

  return [...props];
}

function classifyEffects(
  interaction: Record<string, unknown>,
  globalEffects: Record<string, Record<string, unknown>>,
): Set<'time' | 'scrub' | 'state'> {
  const types = new Set<'time' | 'scrub' | 'state'>();
  const effects = Array.isArray(interaction.effects) ? interaction.effects : [];

  for (const raw of effects) {
    if (!isRecord(raw)) continue;
    const eff = resolveEffect(raw as Record<string, unknown>, globalEffects);
    if ('transition' in eff || 'transitionProperties' in eff) types.add('state');
    else if ('rangeStart' in eff || 'rangeEnd' in eff) types.add('scrub');
    else if ('keyframeEffect' in eff || 'namedEffect' in eff || 'customEffect' in eff)
      types.add('time');
  }

  return types;
}

function getEffectTriggerTypes(
  interaction: Record<string, unknown>,
  globalEffects: Record<string, Record<string, unknown>>,
): string[] {
  const types: string[] = [];
  const effects = Array.isArray(interaction.effects) ? interaction.effects : [];

  for (const raw of effects) {
    if (!isRecord(raw)) continue;
    const eff = resolveEffect(raw as Record<string, unknown>, globalEffects);
    if (typeof eff.triggerType === 'string') types.push(eff.triggerType);
  }

  return types;
}

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
