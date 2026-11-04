import { StateEffect, TimeEffect } from '../schema/effects';
import { ReducedMotionMode } from '../schema/primitives';
import type {
  AnyConfig,
  AnyEffect,
  AnyInteraction,
  AnySequence,
  Path,
  SemanticIssue,
} from '../types';
import { SCRUB_TRIGGERS } from '../types';
import { issue } from './issue';

type Kind = 'time' | 'scrub' | 'state';

type UseSite = {
  effect: AnyEffect;
  // set on the effect or its definition
  explicit?: string;
  // from its sequence, interaction or config - unknown for a sequence definition's effect
  inherited?: string;
  kind: Kind;
};

const MODES: ReadonlySet<string> = new Set(ReducedMotionMode.options);

const replacementKinds = new WeakMap<AnyEffect, Kind>();

// the effect schema the replacement validates against
function getReplacementKind(replacement: AnyEffect): Kind {
  let kind = replacementKinds.get(replacement);
  if (!kind) {
    kind = StateEffect.safeParse(replacement).success
      ? 'state'
      : TimeEffect.safeParse(replacement).success
        ? 'time'
        : 'scrub';
    replacementKinds.set(replacement, kind);
  }
  return kind;
}

// the effect schema the interaction picks for its trigger - sequences only play on time triggers
function getKind(effect: AnyEffect, trigger?: string): Kind {
  if (effect.transition || effect.transitionProperties) return 'state';
  return trigger && SCRUB_TRIGGERS.includes(trigger) ? 'scrub' : 'time';
}

function getUseSite(
  config: AnyConfig,
  effect: AnyEffect,
  owner?: AnyInteraction,
  sequence?: AnySequence,
): UseSite {
  const definition = effect.effectId ? config.effects?.[effect.effectId] : undefined;
  const resolved = { ...definition, ...effect };
  return {
    effect: resolved,
    explicit: effect.reducedMotionHandling ?? definition?.reducedMotionHandling,
    inherited:
      owner &&
      (sequence?.reducedMotionHandling ??
        owner.reducedMotionHandling ??
        config.reducedMotionHandling),
    kind: getKind(resolved, owner?.trigger),
  };
}

function getReplacement(config: AnyConfig, handling?: string): AnyEffect | undefined {
  return handling && !MODES.has(handling) ? config.effects?.[handling] : undefined;
}

function isIncompatible(config: AnyConfig, { effect, kind }: UseSite, handling?: string): boolean {
  const replacement = getReplacement(config, handling);
  return !!replacement && handling !== effect.effectId && getReplacementKind(replacement) !== kind;
}

function checkReference(
  config: AnyConfig,
  path: Path,
  handling: string | undefined,
  isEffect: boolean,
): SemanticIssue[] {
  if (!handling || MODES.has(handling) || config.effects?.[handling]) return [];
  return [
    issue(
      [...path, 'reducedMotionHandling'],
      'REDUCED_MOTION_EFFECT_NOT_FOUND',
      `reducedMotionHandling effect "${handling}" not found${isEffect ? '' : ', so the effects inheriting it fall back to "collapse"'}`,
      isEffect ? 'error' : 'warning',
    ),
  ];
}

function incompatible(path: Path, handling: string, site: UseSite, severity: 'error' | 'warning') {
  return issue(
    path,
    'REDUCED_MOTION_INCOMPATIBLE_EFFECT',
    `reducedMotionHandling effect "${handling}" can't replace a ${site.kind} effect, so it falls back to "collapse"`,
    severity,
  );
}

export function checkReducedMotionErrors(
  config: AnyConfig,
  path: Path,
  effect: AnyEffect,
  isTopLevel: boolean,
  owner?: AnyInteraction,
  sequence?: AnySequence,
): SemanticIssue[] {
  const issues = checkReference(config, path, effect.reducedMotionHandling, true);
  if (isTopLevel) return issues;

  const site = getUseSite(config, effect, owner, sequence);
  if (site.explicit && isIncompatible(config, site, site.explicit)) {
    issues.push(incompatible(path, site.explicit, site, 'error'));
  }
  return issues;
}

// the warning and info issues - an explicit incompatible replacement is an error instead
export function createReducedMotionWarnings(config: AnyConfig) {
  const animationEndSources = new Set(
    config.interactions.flatMap(({ trigger, params }) =>
      trigger === 'animationEnd' && params?.effectId ? [params.effectId] : [],
    ),
  );

  const checkUseSite = (path: Path, site: UseSite): SemanticIssue[] => {
    const { effect, explicit, inherited, kind } = site;
    const handling = explicit ?? inherited ?? 'collapse';
    const issues: SemanticIssue[] = [];

    // the runtime resolves an animationEnd source's handling from its definition and the config only
    if (effect.effectId && animationEndSources.has(effect.effectId)) {
      const sourceHandling =
        config.effects?.[effect.effectId]?.reducedMotionHandling ??
        config.reducedMotionHandling ??
        'collapse';
      if (handling !== sourceHandling) {
        issues.push(
          issue(
            path,
            'REDUCED_MOTION_ANIMATION_END_SOURCE_MISMATCH',
            `Effect "${effect.effectId}" triggers animationEnd interactions, which resolve its reducedMotionHandling from its definition and the config only - set it there instead`,
            'warning',
          ),
        );
      }
    }

    // the default needs no notice
    if (!explicit && !inherited) return issues;

    let collapses = handling === 'collapse';
    if (!MODES.has(handling)) {
      if (handling === effect.effectId) {
        issues.push(
          issue(
            path,
            'REDUCED_MOTION_SELF_REFERENCE',
            `reducedMotionHandling replaces effect "${handling}" with itself, which is the same as "ignore"`,
            'warning',
          ),
        );
      } else if (!getReplacement(config, handling)) {
        collapses = true;
      } else if (isIncompatible(config, site, handling)) {
        collapses = true;
        if (!explicit) {
          issues.push(incompatible(path, handling, site, 'warning'));
        }
      }
    }

    if (
      collapses &&
      (kind === 'scrub' || effect.iterations === 0 || effect.iterations === Infinity)
    ) {
      issues.push(
        issue(
          path,
          'REDUCED_MOTION_COLLAPSE_CANCELS',
          `A ${kind === 'scrub' ? 'scroll or pointer driven' : 'looping'} effect has no end state to collapse to, so reduced motion cancels it`,
          'info',
        ),
      );
    }

    return issues;
  };

  return {
    onConfig: () => checkReference(config, [], config.reducedMotionHandling, false),
    onInteraction: (path: Path, interaction: AnyInteraction) =>
      checkReference(config, path, interaction.reducedMotionHandling, false),
    onEffect: (
      path: Path,
      effect: AnyEffect,
      isTopLevel: boolean,
      owner?: AnyInteraction,
      sequence?: AnySequence,
    ): SemanticIssue[] => {
      if (isTopLevel) {
        const id = path[1] as string;
        return MODES.has(id)
          ? [
              issue(
                path,
                'REDUCED_MOTION_SHADOWED_EFFECT_ID',
                `Effect "${id}" can't be used as a reducedMotionHandling replacement since "${id}" is a handling mode`,
                'warning',
              ),
            ]
          : [];
      }
      const site = getUseSite(config, effect, owner, sequence);
      // a sequence definition's effect inherits its handling where the sequence is referenced
      return owner || site.explicit ? checkUseSite(path, site) : [];
    },
    onSequence: (
      path: Path,
      sequence: AnySequence,
      isTopLevel: boolean,
      owner?: AnyInteraction,
    ): SemanticIssue[] => {
      const issues = checkReference(config, path, sequence.reducedMotionHandling, false);
      const definition =
        !isTopLevel && !sequence.effects && sequence.sequenceId
          ? config.sequences?.[sequence.sequenceId]
          : undefined;
      definition?.effects?.forEach((effect) => {
        const site = getUseSite(config, effect, owner, { ...definition, ...sequence });
        if (!site.explicit) {
          issues.push(...checkUseSite(path, site));
        }
      });
      return issues;
    },
  };
}
