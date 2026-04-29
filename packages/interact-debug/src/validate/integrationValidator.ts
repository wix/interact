import type {
  InteractArtifact,
  ValidationResult,
  ValidationEntry,
  Scope,
  TriggerType,
} from '../types';
import {
  isRecord,
  error,
  warning,
  makeEntry,
  toResult,
  isInScope,
  resolveEffect,
  buildGlobalMaps,
} from './helpers';

const info = makeEntry('info');

/**
 * Validate the integration between config and the artifact's structured metadata.
 *
 * Consumes only typed fields (htmlMeta, setupMeta, registeredEffects, framework)
 * rather than raw HTML/CSS/JS strings. Checks are skipped when the relevant
 * metadata is unavailable, with an info-level note instead of a false result.
 *
 * Checks that can only be done reliably at runtime (CSS property scoping like
 * overflow:hidden per-element, or pointer-events:none on specific selectors)
 * are deferred to runtimeValidator and not attempted here.
 */
export function validateIntegration(artifact: InteractArtifact, scope?: Scope): ValidationResult {
  const entries: ValidationEntry[] = [];
  const { config, htmlMeta, setupMeta, registeredEffects } = artifact;
  const { globalEffects } = buildGlobalMaps(config);

  const allHtmlKeys = new Set(htmlMeta?.keys ?? []);

  const triggersByKey = new Map<string, Set<TriggerType>>();
  let usesNamedEffect = false;
  let needsA11y = false;

  for (let i = 0; i < config.interactions.length; i++) {
    const interaction = config.interactions[i];

    const triggers = triggersByKey.get(interaction.key) ?? new Set();
    triggers.add(interaction.trigger);
    triggersByKey.set(interaction.key, triggers);

    if (interaction.trigger === 'activate' || interaction.trigger === 'interest') {
      needsA11y = true;
    }

    if (!isInScope(interaction, i, scope)) continue;
    const basePath = ['interactions', i] as (string | number)[];

    // HTML key matching (skip if no htmlMeta available)
    if (htmlMeta && !allHtmlKeys.has(interaction.key)) {
      entries.push(
        error(
          [...basePath, 'key'],
          'key-missing-in-html',
          `Key "${interaction.key}" has no matching data-interact-key or <interact-element> in HTML`,
        ),
      );
    }

    // FOUC rules for viewEnter (requires both htmlMeta and setupMeta)
    if (interaction.trigger === 'viewEnter') {
      const effectsForFouc = resolveInteractionEffects(interaction, globalEffects);
      const isOnce = effectsForFouc.every((e) => !('triggerType' in e) || e.triggerType === 'once');
      const sameElement = effectsForFouc.every((e) => !('key' in e) || e.key === interaction.key);

      if (isOnce && sameElement && htmlMeta && setupMeta) {
        const hasInitial = interaction.key in (htmlMeta.initials ?? {});
        const hasGenerate = setupMeta.hasGenerate === true;

        if (hasInitial && !hasGenerate) {
          entries.push(
            error(
              [...basePath],
              'fouc-missing-generate',
              `viewEnter+once on key "${interaction.key}" has data-interact-initial but generate() CSS is missing; both are required`,
            ),
          );
        }
        if (!hasInitial && hasGenerate) {
          entries.push(
            warning(
              [...basePath],
              'fouc-missing-initial',
              `viewEnter+once on key "${interaction.key}" has generate() CSS but data-interact-initial is missing on the element`,
            ),
          );
        }
      }

      if (htmlMeta && !isOnce && interaction.key in (htmlMeta.initials ?? {})) {
        entries.push(
          warning(
            [...basePath],
            'initial-on-non-once',
            `data-interact-initial on key "${interaction.key}" is only valid for viewEnter+once; this interaction uses repeat/alternate/state`,
          ),
        );
      }
    }

    // Detect namedEffect usage (config-driven)
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

  // Setup metadata checks (skip entirely when setupMeta is unavailable)
  if (setupMeta) {
    if (usesNamedEffect) {
      if (setupMeta.hasRegisterEffects === false) {
        entries.push(
          error(
            ['setup'],
            'register-effects-missing',
            'Config uses namedEffect but registerEffects() is not called',
          ),
        );
      } else if (setupMeta.registerBeforeCreate === false) {
        entries.push(
          error(
            ['setup'],
            'register-effects-order',
            'registerEffects() must be called before Interact.create()',
          ),
        );
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
                  entries.push(
                    warning(
                      ['setup'],
                      'named-effect-not-registered',
                      `namedEffect.type "${type}" is used but not found in registerEffects() call`,
                    ),
                  );
                }
              }
            }
          }
        }
      }
    }

    if (setupMeta.setupBeforeCreate === false) {
      entries.push(
        error(['setup'], 'setup-order', 'Interact.setup() must be called before Interact.create()'),
      );
    }

    if (setupMeta.hasDestroy === false) {
      entries.push(
        warning(
          ['setup'],
          'missing-destroy',
          'No destroy() call found; consider adding cleanup to avoid memory leaks',
        ),
      );
    }

    if (needsA11y && setupMeta.hasA11yTriggers === false) {
      entries.push(
        error(
          ['setup'],
          'missing-a11y-triggers',
          'Config uses activate/interest triggers but Interact.allowA11yTriggers is not set to true',
        ),
      );
    }
  } else if (usesNamedEffect || needsA11y) {
    entries.push(
      info(
        ['setup'],
        'setup-meta-unavailable',
        'JS setup metadata not available; JS setup checks (registerEffects, destroy, a11y) were skipped. Use runtime validation for full coverage.',
      ),
    );
  }

  // Interact-element child checks (from htmlMeta.interactElements)
  if (htmlMeta?.interactElements) {
    for (const el of htmlMeta.interactElements) {
      if (!el.hasChild) {
        entries.push(
          error(
            ['html'],
            'interact-element-no-child',
            `<interact-element> for key "${el.key || '?'}" has no child element (library uses firstElementChild)`,
          ),
        );
      }
    }
  }

  // Accessibility: click without activate, hover without interest (config-driven)
  if (!scope) {
    for (const [key, triggers] of triggersByKey) {
      if (triggers.has('click') && !triggers.has('activate')) {
        entries.push(
          warning(
            ['interactions'],
            'click-without-activate',
            `Key "${key}" has click trigger but no matching activate trigger for keyboard support`,
          ),
        );
      }
      if (triggers.has('hover') && !triggers.has('interest')) {
        entries.push(
          warning(
            ['interactions'],
            'hover-without-interest',
            `Key "${key}" has hover trigger but no matching interest trigger for focus support`,
          ),
        );
      }
    }
  }

  // Note skipped checks when metadata is unavailable
  if (!htmlMeta) {
    entries.push(
      info(
        ['html'],
        'html-meta-unavailable',
        'HTML metadata not available; HTML integration checks (key matching, FOUC, interact-element) were skipped. Use runtime validation for full coverage.',
      ),
    );
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
