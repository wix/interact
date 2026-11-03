import type { AnyConfig, AnyEffect, AnyInteraction, Path, SemanticIssue, Severity } from '../types';
import { walkConfig } from '../walkConfig';

type Kind = 'time' | 'scrub' | 'state';

type UseSite = {
  path: Path;
  effect: AnyEffect;
  // set on the effect itself or its definition
  explicit?: string;
  inherited?: string;
  interaction: AnyInteraction;
};

const MODES = new Set(['ignore', 'cancel', 'collapse']);
const SCRUB_TRIGGERS = new Set(['viewProgress', 'pointerMove']);

function issue(path: Path, domainCode: string, message: string, severity: Severity): SemanticIssue {
  return { code: 'custom', path, message, params: { domainCode }, severity };
}

function isState(effect: AnyEffect): boolean {
  return !!(effect.transition || effect.transitionProperties);
}

function getKind(effect: AnyEffect, trigger?: string): Kind {
  if (isState(effect)) return 'state';
  return trigger && SCRUB_TRIGGERS.has(trigger) ? 'scrub' : 'time';
}

function getReplacementKind(effect: AnyEffect): Kind {
  if (isState(effect)) return 'state';
  return 'duration' in effect ? 'time' : 'scrub';
}

function hasNoEndState(kind: Kind, effect: AnyEffect): boolean {
  return kind === 'scrub' || effect.iterations === 0 || effect.iterations === Infinity;
}

// every effect in the position it plays in, with the handling it gets there
function collectUseSites(config: AnyConfig): UseSite[] {
  const effects = config.effects ?? {};
  const sites: UseSite[] = [];

  const toSite = (
    path: Path,
    effect: AnyEffect,
    interaction: AnyInteraction,
    inherited?: string,
  ): UseSite => {
    const definition = effect.effectId ? effects[effect.effectId] : undefined;
    return {
      path,
      effect: { ...definition, ...effect },
      explicit: effect.reducedMotionHandling ?? definition?.reducedMotionHandling,
      inherited,
      interaction,
    };
  };

  config.interactions.forEach((interaction, i) => {
    const interactionHandling = interaction.reducedMotionHandling ?? config.reducedMotionHandling;

    interaction.effects?.forEach((effect, ei) => {
      sites.push(
        toSite(['interactions', i, 'effects', ei], effect, interaction, interactionHandling),
      );
    });

    interaction.sequences?.forEach((sequence, si) => {
      const definition =
        !sequence.effects && sequence.sequenceId
          ? config.sequences?.[sequence.sequenceId]
          : undefined;
      const full = { ...definition, ...sequence };
      const basePath: Path = definition
        ? ['sequences', sequence.sequenceId!]
        : ['interactions', i, 'sequences', si];
      const sequenceHandling = full.reducedMotionHandling ?? interactionHandling;

      full.effects?.forEach((effect, ei) => {
        sites.push(toSite([...basePath, 'effects', ei], effect, interaction, sequenceHandling));
      });
    });
  });

  return sites;
}

function checkUseSite(config: AnyConfig, site: UseSite): SemanticIssue[] {
  const { path, effect, explicit, inherited, interaction } = site;
  const handling = explicit ?? inherited;
  if (!handling || handling === 'ignore' || handling === 'cancel') {
    return [];
  }

  const issues: SemanticIssue[] = [];
  const kind = getKind(effect, interaction.trigger);
  let collapses = handling === 'collapse';

  if (!MODES.has(handling)) {
    const replacement = (config.effects ?? {})[handling];

    if (handling === effect.effectId) {
      issues.push(
        issue(
          path,
          'REDUCED_MOTION_SELF_REFERENCE',
          `reducedMotionHandling replaces effect "${handling}" with itself, which is the same as "ignore"`,
          'warning',
        ),
      );
    } else if (replacement && getReplacementKind(replacement) !== kind) {
      collapses = true;
      issues.push(
        issue(
          path,
          'REDUCED_MOTION_INCOMPATIBLE_EFFECT',
          `reducedMotionHandling effect "${handling}" is a ${getReplacementKind(replacement)} effect and can't replace a ${kind} effect, so it falls back to "collapse"`,
          explicit ? 'error' : 'warning',
        ),
      );
    } else if (!replacement) {
      // reported where the reference is written
      collapses = true;
    }
  }

  if (collapses && hasNoEndState(kind, effect)) {
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
}

// the source's use site is unknown at runtime, so it resolves its handling from its definition and the config only
function checkAnimationEndSources(config: AnyConfig, sites: UseSite[]): SemanticIssue[] {
  const sources = new Set(
    config.interactions
      .filter(({ trigger, params }) => trigger === 'animationEnd' && params?.effectId)
      .map(({ params }) => params!.effectId!),
  );

  return sites
    .filter(({ effect }) => effect.effectId && sources.has(effect.effectId))
    .filter(({ effect, explicit, inherited }) => {
      const sourceHandling =
        (config.effects ?? {})[effect.effectId!]?.reducedMotionHandling ??
        config.reducedMotionHandling ??
        'ignore';
      return (explicit ?? inherited ?? 'ignore') !== sourceHandling;
    })
    .map(({ path, effect }) =>
      issue(
        path,
        'REDUCED_MOTION_ANIMATION_END_SOURCE_MISMATCH',
        `Effect "${effect.effectId}" triggers animationEnd interactions, which resolve its reducedMotionHandling from its definition and the config only - set it there instead`,
        'warning',
      ),
    );
}

function checkReferences(config: AnyConfig): SemanticIssue[] {
  const effects = config.effects ?? {};
  const issues: SemanticIssue[] = [];

  const check = (path: Path, handling: string | undefined, isEffect: boolean) => {
    if (handling && !MODES.has(handling) && !effects[handling]) {
      issues.push(
        issue(
          [...path, 'reducedMotionHandling'],
          'REDUCED_MOTION_EFFECT_NOT_FOUND',
          `reducedMotionHandling effect "${handling}" not found${isEffect ? '' : ', so the effects inheriting it fall back to "collapse"'}`,
          isEffect ? 'error' : 'warning',
        ),
      );
    }
  };

  check([], config.reducedMotionHandling, false);
  walkConfig(config, {
    onInteraction: (path, interaction) => check(path, interaction.reducedMotionHandling, false),
    onEffect: (path, effect) => check(path, effect.reducedMotionHandling, true),
    onSequence: (path, sequence) => check(path, sequence.reducedMotionHandling, false),
  });

  Object.keys(effects)
    .filter((id) => MODES.has(id))
    .forEach((id) =>
      issues.push(
        issue(
          ['effects', id],
          'REDUCED_MOTION_SHADOWED_EFFECT_ID',
          `Effect "${id}" can't be used as a reducedMotionHandling replacement since "${id}" is a handling mode`,
          'warning',
        ),
      ),
    );

  return issues;
}

function dedupe(issues: SemanticIssue[]): SemanticIssue[] {
  const seen = new Set<string>();
  return issues.filter(({ path, params }) => {
    const id = `${params.domainCode}::${path.join('.')}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function collectReducedMotionIssues(config: AnyConfig): SemanticIssue[] {
  const sites = collectUseSites(config);

  return dedupe([
    ...checkReferences(config),
    ...sites.flatMap((site) => checkUseSite(config, site)),
    ...checkAnimationEndSources(config, sites),
  ]);
}

export function getReducedMotionReferences(config: AnyConfig): Set<string> {
  const references = new Set<string>();
  const add = (handling?: string) => handling && !MODES.has(handling) && references.add(handling);

  add(config.reducedMotionHandling);
  walkConfig(config, {
    onInteraction: (_path, interaction) => add(interaction.reducedMotionHandling),
    onEffect: (_path, effect) => add(effect.reducedMotionHandling),
    onSequence: (_path, sequence) => add(sequence.reducedMotionHandling),
  });

  return references;
}
