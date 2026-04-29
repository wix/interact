import type { InteractArtifact, ValidationResult, Scope, TriggerType } from '../types';
import { isRecord, warning, toResult, isInScope, resolveEffect, buildGlobalMaps } from './helpers';

const LAYOUT_PROPERTIES = /\b(width|height|top|left|right|bottom|margin|padding)\b/i;
const SIZE_TRANSFORMS = /\b(scale|translate)\b/i;

const RANGE_ORDER: Record<string, number> = {
  entry: 0,
  'entry-crossing': 1,
  contain: 2,
  'exit-crossing': 3,
  exit: 4,
  cover: 5,
};

function effectChangesLayout(eff: Record<string, unknown>): boolean {
  if (isRecord(eff.keyframeEffect)) {
    const kf = eff.keyframeEffect as Record<string, unknown>;
    if (Array.isArray(kf.keyframes)) {
      const str = JSON.stringify(kf.keyframes);
      return LAYOUT_PROPERTIES.test(str) || SIZE_TRANSFORMS.test(str);
    }
  }
  return false;
}

function isSameElementTarget(
  interaction: Record<string, unknown>,
  eff: Record<string, unknown>,
): boolean {
  if ('selector' in eff) return false;
  if (typeof eff.key === 'string' && eff.key !== interaction.key) return false;
  return true;
}

/**
 * Detect common anti-patterns from the Interact rules documentation.
 */
export function detectAntiPatterns(artifact: InteractArtifact, scope?: Scope): ValidationResult {
  const entries = [];
  const { config } = artifact;
  const { globalEffects } = buildGlobalMaps(config);

  const keyTriggerPairs = new Set<string>();

  for (let i = 0; i < config.interactions.length; i++) {
    const interaction = config.interactions[i] as Record<string, unknown>;
    if (!isInScope(interaction as { key: string; trigger: string }, i, scope)) continue;
    const basePath = ['interactions', i] as (string | number)[];
    const trigger = interaction.trigger as TriggerType;
    const key = interaction.key as string;

    const pair = `${key}::${trigger}`;
    if (keyTriggerPairs.has(pair)) {
      entries.push(
        warning(
          basePath,
          'duplicate-key-trigger',
          `Duplicate key+trigger combination: "${key}" + "${trigger}"; the second interaction may shadow the first`,
        ),
      );
    }
    keyTriggerPairs.add(pair);

    const resolvedEffects = getResolvedEffects(interaction, globalEffects);

    for (let j = 0; j < resolvedEffects.length; j++) {
      const eff = resolvedEffects[j];
      const effPath = [...basePath, 'effects', j];

      if (trigger === 'viewEnter') {
        const triggerType = eff.triggerType as string | undefined;
        if (triggerType && triggerType !== 'once' && isSameElementTarget(interaction, eff)) {
          entries.push(
            warning(
              effPath,
              'viewEnter-same-element-non-once',
              `viewEnter with triggerType "${triggerType}" on same source/target element; use separate source and target elements`,
            ),
          );
        }
      }

      if (
        trigger === 'hover' &&
        isSameElementTarget(interaction, eff) &&
        effectChangesLayout(eff)
      ) {
        entries.push(
          warning(
            effPath,
            'hover-layout-same-element',
            'hover effect changes size/position on same element as source; this causes hit-area jitter. Use selector to animate a child element',
          ),
        );
      }

      if (
        trigger === 'pointerMove' &&
        isSameElementTarget(interaction, eff) &&
        effectChangesLayout(eff)
      ) {
        const params = interaction.params as Record<string, unknown> | undefined;
        if (params?.hitArea === 'self') {
          entries.push(
            warning(
              effPath,
              'pointerMove-self-layout',
              'pointerMove with hitArea "self" and layout-changing effects on same element; use selector to animate a child',
            ),
          );
        }
      }

      if (typeof eff.duration === 'number') {
        if (eff.duration === 0) {
          entries.push(
            warning(
              [...effPath, 'duration'],
              'duration-zero',
              'duration is 0, which produces no visible animation',
            ),
          );
        } else if (eff.duration > 10000) {
          entries.push(
            warning(
              [...effPath, 'duration'],
              'duration-extreme',
              `duration of ${eff.duration}ms is very long (>10s); this may be unintentional`,
            ),
          );
        }
      }

      if (isRecord(eff.rangeStart) && isRecord(eff.rangeEnd)) {
        const startName = (eff.rangeStart as Record<string, unknown>).name as string | undefined;
        const endName = (eff.rangeEnd as Record<string, unknown>).name as string | undefined;
        if (startName && endName && startName in RANGE_ORDER && endName in RANGE_ORDER) {
          if (RANGE_ORDER[startName] > RANGE_ORDER[endName]) {
            entries.push(
              warning(
                effPath,
                'range-inverted',
                `rangeStart "${startName}" comes after rangeEnd "${endName}" in scroll order; ranges may be inverted`,
              ),
            );
          }
        }
      }
    }

    if (trigger === 'viewEnter') {
      const hasRepeat = resolvedEffects.some((e) => e.triggerType === 'repeat');
      const params = interaction.params as Record<string, unknown> | undefined;
      if (hasRepeat && (!params || !('threshold' in params))) {
        entries.push(
          warning(
            basePath,
            'viewEnter-repeat-no-threshold',
            'viewEnter with repeat triggerType but no explicit threshold param; consider setting threshold for predictable re-triggering',
          ),
        );
      }
    }
  }

  return toResult(entries);
}

function getResolvedEffects(
  interaction: Record<string, unknown>,
  globalEffects: Record<string, Record<string, unknown>>,
): Record<string, unknown>[] {
  if (!Array.isArray(interaction.effects)) return [];
  return interaction.effects
    .filter((e: unknown) => isRecord(e))
    .map((e: unknown) => resolveEffect(e as Record<string, unknown>, globalEffects));
}
