import type { InteractArtifact, ValidationResult, ValidationEntry, Scope, TriggerType } from '../types';
import { isRecord, error, warning, toResult, isInScope, resolveEffect, buildGlobalMaps } from './helpers';
import {
  extractDataInteractKeys,
  extractDataInteractInitials,
  hasInteractElements,
  extractInteractElementKeys,
  hasGenerateCss,
  hasSetupCall,
  hasDestroyCall,
  hasAllowA11yTriggers,
} from '../artifact';

/**
 * Validate the integration between config, HTML, CSS, and JS:
 * - HTML has matching data-interact-key for every config key
 * - <interact-element> has >= 1 child
 * - FOUC: generate() + data-interact-initial for viewEnter+once
 * - registerEffects before Interact.create when namedEffect used
 * - Correct entry point imports
 * - Interact.setup before create when used
 * - Interact.allowA11yTriggers when activate/interest triggers used
 * - Cleanup (destroy) present
 * - overflow:clip not overflow:hidden for viewProgress ancestors
 * - pointer-events not none for pointerMove sources
 * - Accessibility: click without activate, hover without interest
 */
export function validateIntegration(artifact: InteractArtifact, scope?: Scope): ValidationResult {
  const entries: ValidationEntry[] = [];
  const { config, html, css, js, framework, registeredEffects } = artifact;
  const { globalEffects } = buildGlobalMaps(config);

  const htmlKeys = html ? extractDataInteractKeys(html) : [];
  const initials = html ? extractDataInteractInitials(html) : new Map<string, boolean>();
  const usesWebComponents = html ? hasInteractElements(html) : false;
  const webComponentKeys = html ? extractInteractElementKeys(html) : [];
  const allHtmlKeys = new Set([...htmlKeys, ...webComponentKeys]);

  const hasGenerate = js ? hasGenerateCss(js) : false;
  const usesSetup = js ? hasSetupCall(js) : false;
  const hasDestroy = js ? hasDestroyCall(js) : false;
  const hasA11y = js ? hasAllowA11yTriggers(js) : false;

  const configKeys = new Set<string>();
  const triggersByKey = new Map<string, Set<TriggerType>>();
  let usesNamedEffect = false;
  let needsA11y = false;

  for (let i = 0; i < config.interactions.length; i++) {
    const interaction = config.interactions[i];
    configKeys.add(interaction.key);

    const triggers = triggersByKey.get(interaction.key) ?? new Set();
    triggers.add(interaction.trigger);
    triggersByKey.set(interaction.key, triggers);

    if (interaction.trigger === 'activate' || interaction.trigger === 'interest') {
      needsA11y = true;
    }

    if (!isInScope(interaction, i, scope)) continue;
    const basePath = ['interactions', i] as (string | number)[];

    // HTML key matching
    if (html && !allHtmlKeys.has(interaction.key)) {
      entries.push(error([...basePath, 'key'], 'key-missing-in-html', `Key "${interaction.key}" has no matching data-interact-key or <interact-element> in HTML`));
    }

    // FOUC rules for viewEnter
    if (interaction.trigger === 'viewEnter') {
      const effectsForFouc = resolveInteractionEffects(interaction, globalEffects);
      const isOnce = effectsForFouc.every((e) => !('triggerType' in e) || e.triggerType === 'once');
      const sameElement = effectsForFouc.every((e) => !('key' in e) || e.key === interaction.key);

      if (isOnce && sameElement) {
        const hasInitial = initials.has(interaction.key);
        if (hasInitial && !hasGenerate) {
          entries.push(error([...basePath], 'fouc-missing-generate', `viewEnter+once on key "${interaction.key}" has data-interact-initial but generate() CSS is missing; both are required`));
        }
        if (!hasInitial && hasGenerate) {
          entries.push(warning([...basePath], 'fouc-missing-initial', `viewEnter+once on key "${interaction.key}" has generate() CSS but data-interact-initial is missing on the element`));
        }
      }

      if (!isOnce && initials.has(interaction.key)) {
        entries.push(warning([...basePath], 'initial-on-non-once', `data-interact-initial on key "${interaction.key}" is only valid for viewEnter+once; this interaction uses repeat/alternate/state`));
      }
    }

    // viewProgress: check for overflow:hidden in CSS
    if (interaction.trigger === 'viewProgress' && css) {
      if (/overflow\s*:\s*hidden/i.test(css)) {
        entries.push(warning([...basePath], 'overflow-hidden', 'CSS contains overflow:hidden which breaks viewProgress (ViewTimeline); use overflow:clip instead'));
      }
    }

    // pointerMove: check for pointer-events:none
    if (interaction.trigger === 'pointerMove' && css) {
      if (/pointer-events\s*:\s*none/i.test(css)) {
        entries.push(warning([...basePath], 'pointer-events-none', 'CSS contains pointer-events:none which prevents pointerMove from working'));
      }
    }

    // Detect namedEffect usage
    if (interaction.effects) {
      for (const eff of interaction.effects) {
        const resolved = resolveEffect(eff as Record<string, unknown>, globalEffects);
        if ('namedEffect' in resolved) usesNamedEffect = true;
      }
    }
    if (interaction.sequences) {
      for (const seq of interaction.sequences) {
        const seqObj = seq as Record<string, unknown>;
        const seqEffects = Array.isArray(seqObj.effects) ? seqObj.effects : [];
        for (const eff of seqEffects) {
          const resolved = resolveEffect(eff as Record<string, unknown>, globalEffects);
          if ('namedEffect' in resolved) usesNamedEffect = true;
        }
      }
    }
  }

  // JS rules (global, not per-interaction)
  if (js) {
    if (usesNamedEffect) {
      if (!js.includes('registerEffects')) {
        entries.push(error(['js'], 'register-effects-missing', 'Config uses namedEffect but registerEffects() is not called in JS'));
      } else {
        const registerPos = js.indexOf('registerEffects');
        const createPos = js.indexOf('Interact.create');
        if (createPos >= 0 && registerPos > createPos) {
          entries.push(error(['js'], 'register-effects-order', 'registerEffects() must be called before Interact.create()'));
        }
      }

      if (registeredEffects && registeredEffects.length > 0) {
        const registeredSet = new Set(registeredEffects);
        for (const interaction of config.interactions) {
          if (interaction.effects) {
            for (const eff of interaction.effects) {
              const resolved = resolveEffect(eff as Record<string, unknown>, globalEffects);
              if (isRecord(resolved.namedEffect)) {
                const type = (resolved.namedEffect as Record<string, unknown>).type;
                if (typeof type === 'string' && !registeredSet.has(type)) {
                  entries.push(warning(['js'], 'named-effect-not-registered', `namedEffect.type "${type}" is used but not found in registerEffects() call`));
                }
              }
            }
          }
        }
      }
    }

    if (framework === 'react' && !js.includes('@wix/interact/react')) {
      entries.push(warning(['js'], 'import-mismatch', 'React framework detected but @wix/interact/react import not found'));
    }
    if (framework === 'web' && !js.includes('@wix/interact/web')) {
      entries.push(warning(['js'], 'import-mismatch', 'Web Components framework detected but @wix/interact/web import not found'));
    }

    if (usesSetup) {
      const setupPos = js.indexOf('Interact.setup');
      const createPos = js.indexOf('Interact.create');
      if (createPos >= 0 && setupPos > createPos) {
        entries.push(error(['js'], 'setup-order', 'Interact.setup() must be called before Interact.create()'));
      }
    }

    if (!hasDestroy) {
      entries.push(warning(['js'], 'missing-destroy', 'No destroy() call found; consider adding cleanup to avoid memory leaks'));
    }

    if (needsA11y && !hasA11y) {
      entries.push(error(['js'], 'missing-a11y-triggers', 'Config uses activate/interest triggers but Interact.allowA11yTriggers is not set to true'));
    }
  }

  // Web component checks
  if (usesWebComponents && html) {
    const dom = parseDom(html);
    const elements = dom.querySelectorAll('interact-element');
    for (const el of elements) {
      if (!el.firstElementChild) {
        const key = el.getAttribute('data-interact-key') ?? el.getAttribute('interact-key') ?? '?';
        entries.push(error(['html'], 'interact-element-no-child', `<interact-element> for key "${key}" has no child element (library uses firstElementChild)`));
      }
    }
  }

  // Accessibility: click without activate, hover without interest
  if (!scope) {
    for (const [key, triggers] of triggersByKey) {
      if (triggers.has('click') && !triggers.has('activate')) {
        entries.push(warning(['interactions'], 'click-without-activate', `Key "${key}" has click trigger but no matching activate trigger for keyboard support`));
      }
      if (triggers.has('hover') && !triggers.has('interest')) {
        entries.push(warning(['interactions'], 'hover-without-interest', `Key "${key}" has hover trigger but no matching interest trigger for focus support`));
      }
    }
  }

  return toResult(entries);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveInteractionEffects(
  interaction: Record<string, unknown>,
  globalEffects: Record<string, Record<string, unknown>>,
): Record<string, unknown>[] {
  if (!Array.isArray(interaction.effects)) return [];
  return interaction.effects.map((e: unknown) =>
    isRecord(e) ? resolveEffect(e as Record<string, unknown>, globalEffects) : {},
  );
}

function parseDom(html: string): Document {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(html);
  return dom.window.document;
}
