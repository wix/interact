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
  // from its sequence or interaction - unknown for a sequence definition's effect
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
    explicit: effect.reducedMotionPolicy ?? definition?.reducedMotionPolicy,
    inherited: owner && (sequence?.reducedMotionPolicy ?? owner.reducedMotionPolicy),
    kind: getKind(resolved, owner?.trigger),
  };
}

function getReplacement(config: AnyConfig, policy?: string): AnyEffect | undefined {
  return policy && !MODES.has(policy) ? config.effects?.[policy] : undefined;
}

function isIncompatible(config: AnyConfig, { effect, kind }: UseSite, policy?: string): boolean {
  const replacement = getReplacement(config, policy);
  return !!replacement && policy !== effect.effectId && getReplacementKind(replacement) !== kind;
}

function checkReference(
  config: AnyConfig,
  path: Path,
  policy: string | undefined,
  isEffect: boolean,
): SemanticIssue[] {
  if (!policy || MODES.has(policy) || config.effects?.[policy]) return [];
  return [
    issue(
      [...path, 'reducedMotionPolicy'],
      'REDUCED_MOTION_EFFECT_NOT_FOUND',
      `reducedMotionPolicy effect "${policy}" not found${isEffect ? '' : ', so the effects inheriting it fall back to "collapse"'}`,
      isEffect ? 'error' : 'warning',
    ),
  ];
}

function incompatible(path: Path, policy: string, site: UseSite, severity: 'error' | 'warning') {
  return issue(
    path,
    'REDUCED_MOTION_INCOMPATIBLE_EFFECT',
    `reducedMotionPolicy effect "${policy}" can't replace a ${site.kind} effect, so it falls back to "collapse"`,
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
  const issues = checkReference(config, path, effect.reducedMotionPolicy, true);
  if (isTopLevel) return issues;

  const site = getUseSite(config, effect, owner, sequence);
  if (site.explicit && isIncompatible(config, site, site.explicit)) {
    issues.push(incompatible(path, site.explicit, site, 'error'));
  }
  return issues;
}

// the warning and info issues - an explicit incompatible replacement is an error instead. The instance's policy
// isn't part of the config, so it's taken to be the default 'collapse'
export function createReducedMotionWarnings(config: AnyConfig) {
  const animationEndSources = new Set(
    config.interactions.flatMap(({ trigger, params }) =>
      trigger === 'animationEnd' && params?.effectId ? [params.effectId] : [],
    ),
  );

  const checkUseSite = (path: Path, site: UseSite): SemanticIssue[] => {
    const { effect, explicit, inherited, kind } = site;
    const policy = explicit ?? inherited ?? 'collapse';
    const issues: SemanticIssue[] = [];

    // the runtime resolves an animationEnd source's policy from its definition and the instance only
    if (effect.effectId && animationEndSources.has(effect.effectId)) {
      const sourcePolicy = config.effects?.[effect.effectId]?.reducedMotionPolicy ?? 'collapse';
      if (policy !== sourcePolicy) {
        issues.push(
          issue(
            path,
            'REDUCED_MOTION_ANIMATION_END_SOURCE_MISMATCH',
            `Effect "${effect.effectId}" triggers animationEnd interactions, which resolve its reducedMotionPolicy from its definition only - set it there instead`,
            'warning',
          ),
        );
      }
    }

    // the default needs no notice
    if (!explicit && !inherited) return issues;

    let collapses = policy === 'collapse';
    if (!MODES.has(policy)) {
      if (policy === effect.effectId) {
        issues.push(
          issue(
            path,
            'REDUCED_MOTION_SELF_REFERENCE',
            `reducedMotionPolicy replaces effect "${policy}" with itself, which is the same as "ignore"`,
            'warning',
          ),
        );
      } else if (!getReplacement(config, policy)) {
        collapses = true;
      } else if (isIncompatible(config, site, policy)) {
        collapses = true;
        if (!explicit) {
          issues.push(incompatible(path, policy, site, 'warning'));
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
    onInteraction: (path: Path, interaction: AnyInteraction) =>
      checkReference(config, path, interaction.reducedMotionPolicy, false),
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
                `Effect "${id}" can't be used as a reducedMotionPolicy replacement since "${id}" is a policy mode`,
                'warning',
              ),
            ]
          : [];
      }
      const site = getUseSite(config, effect, owner, sequence);
      // a sequence definition's effect inherits its policy where the sequence is referenced
      return owner || site.explicit ? checkUseSite(path, site) : [];
    },
    onSequence: (
      path: Path,
      sequence: AnySequence,
      isTopLevel: boolean,
      owner?: AnyInteraction,
    ): SemanticIssue[] => {
      const issues = checkReference(config, path, sequence.reducedMotionPolicy, false);
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
