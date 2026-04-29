import type { InteractArtifact, ValidationResult, ValidationEntry, Scope } from '../types';
import {
  isRecord,
  error,
  toResult,
  isInScope,
  resolveEffect,
  resolveSequence,
  buildGlobalMaps,
} from './helpers';

// ---------------------------------------------------------------------------
// Known presets from @wix/motion-presets (75 total)
// ---------------------------------------------------------------------------

const ENTRANCE_PRESETS = [
  'ArcIn',
  'BlurIn',
  'BounceIn',
  'CurveIn',
  'DropIn',
  'ExpandIn',
  'FadeIn',
  'FlipIn',
  'FloatIn',
  'FoldIn',
  'GlideIn',
  'RevealIn',
  'ShapeIn',
  'ShuttersIn',
  'SlideIn',
  'SpinIn',
  'TiltIn',
  'TurnIn',
  'WinkIn',
] as const;

const ONGOING_PRESETS = [
  'Bounce',
  'Breathe',
  'Cross',
  'Flash',
  'Flip',
  'Fold',
  'Jello',
  'Poke',
  'Pulse',
  'Rubber',
  'Spin',
  'Swing',
  'Wiggle',
] as const;

const SCROLL_PRESETS = [
  'ArcScroll',
  'BlurScroll',
  'FadeScroll',
  'FlipScroll',
  'GrowScroll',
  'MoveScroll',
  'PanScroll',
  'ParallaxScroll',
  'RevealScroll',
  'ShapeScroll',
  'ShuttersScroll',
  'ShrinkScroll',
  'SkewPanScroll',
  'SlideScroll',
  'Spin3dScroll',
  'SpinScroll',
  'StretchScroll',
  'TiltScroll',
  'TurnScroll',
] as const;

const MOUSE_PRESETS = [
  'AiryMouse',
  'BlobMouse',
  'BlurMouse',
  'BounceMouse',
  'CustomMouse',
  'ScaleMouse',
  'SkewMouse',
  'SpinMouse',
  'SwivelMouse',
  'Tilt3DMouse',
  'Track3DMouse',
  'TrackMouse',
] as const;

const BG_SCROLL_PRESETS = [
  'BgCloseUp',
  'BgFade',
  'BgFadeBack',
  'BgFake3D',
  'BgPan',
  'BgParallax',
  'BgPullBack',
  'BgReveal',
  'BgRotate',
  'BgSkew',
  'BgZoom',
  'ImageParallax',
] as const;

const ALL_PRESETS = new Set<string>([
  ...ENTRANCE_PRESETS,
  ...ONGOING_PRESETS,
  ...SCROLL_PRESETS,
  ...MOUSE_PRESETS,
  ...BG_SCROLL_PRESETS,
]);

export {
  ENTRANCE_PRESETS,
  ONGOING_PRESETS,
  SCROLL_PRESETS,
  MOUSE_PRESETS,
  BG_SCROLL_PRESETS,
  ALL_PRESETS,
};

/**
 * Validate that all namedEffect.type values reference known presets
 * or are covered by registerEffects() calls.
 *
 * When `registeredEffects` is undefined (metadata unavailable), only the
 * "is this a known preset name" check runs. The "was it registered" check
 * is skipped to avoid false positives.
 */
export function validateRegistry(artifact: InteractArtifact, scope?: Scope): ValidationResult {
  const entries: ValidationEntry[] = [];
  const { config, registeredEffects } = artifact;
  const { globalEffects, globalSequences } = buildGlobalMaps(config);
  const hasRegistrationInfo = registeredEffects !== undefined;
  const registeredSet = new Set(registeredEffects ?? []);

  for (let i = 0; i < config.interactions.length; i++) {
    const interaction = config.interactions[i];
    if (!isInScope(interaction, i, scope)) continue;
    const basePath = ['interactions', i] as (string | number)[];

    if (interaction.effects) {
      for (let j = 0; j < interaction.effects.length; j++) {
        const raw = interaction.effects[j] as Record<string, unknown>;
        if (!isRecord(raw)) continue;
        const resolved = resolveEffect(raw, globalEffects);
        checkNamedEffect(
          resolved,
          [...basePath, 'effects', j],
          hasRegistrationInfo,
          registeredSet,
          entries,
        );
      }
    }

    if (interaction.sequences) {
      for (let j = 0; j < interaction.sequences.length; j++) {
        const seq = interaction.sequences[j] as Record<string, unknown>;
        if (!isRecord(seq)) continue;
        const seqResolved = resolveSequence(seq, globalSequences);
        const seqEffects = Array.isArray(seqResolved.effects) ? seqResolved.effects : [];

        for (let k = 0; k < seqEffects.length; k++) {
          const effRaw = seqEffects[k] as Record<string, unknown>;
          if (!isRecord(effRaw)) continue;
          const resolved = resolveEffect(effRaw, globalEffects);
          checkNamedEffect(
            resolved,
            [...basePath, 'sequences', j, 'effects', k],
            hasRegistrationInfo,
            registeredSet,
            entries,
          );
        }
      }
    }
  }

  return toResult(entries);
}

function checkNamedEffect(
  eff: Record<string, unknown>,
  path: (string | number)[],
  hasRegistrationInfo: boolean,
  registeredSet: Set<string>,
  entries: ValidationEntry[],
): void {
  if (!isRecord(eff.namedEffect)) return;
  const ne = eff.namedEffect as Record<string, unknown>;
  const type = ne.type;
  if (typeof type !== 'string') return;

  const isKnownPreset = ALL_PRESETS.has(type);
  const isRegistered = registeredSet.has(type);

  if (!isKnownPreset && !isRegistered) {
    if (hasRegistrationInfo) {
      entries.push(
        error(
          [...path, 'namedEffect', 'type'],
          'unknown-named-effect',
          `namedEffect.type "${type}" is not a known @wix/motion-presets preset and was not found in registerEffects()`,
        ),
      );
    } else {
      entries.push(
        error(
          [...path, 'namedEffect', 'type'],
          'unknown-named-effect',
          `namedEffect.type "${type}" is not a known @wix/motion-presets preset; verify it is registered via registerEffects()`,
        ),
      );
    }
  } else if (isKnownPreset && !isRegistered && hasRegistrationInfo) {
    entries.push(
      error(
        [...path, 'namedEffect', 'type'],
        'preset-not-registered',
        `namedEffect.type "${type}" is a known preset but was not registered via registerEffects(); call registerEffects({ ${type} }) before Interact.create()`,
      ),
    );
  }
}
