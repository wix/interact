// Static semantic checks derived from the documented constraints in
// `packages/interact/rules/*.md`. These run with no DOM and no runtime — they
// inspect the parsed config shape only. Warning/info checks are collected by
// `collectSemanticWarnings` (consumed by the schema `transform`).

import type { Path, SemanticIssue, AnyConfig, Visitors } from '../types';
import { checkKeyframePropCamelCase, checkInvalidInset } from './cssSyntax';
import { checkSameElementRetrigger, checkHitAreaShift } from './fouc';
import {
  checkListItemSelectorWithoutContainer,
  checkRedundantSelector,
  checkPointerAxisIgnored,
} from './ignored';
import {
  checkScrollPresetRange,
  checkEmptyStyleProperties,
  checkStateRemoveWithoutEffectId,
} from './partialData';
import { checkRecommendedFill, checkRecommendedFillBackwards } from './recommendedPatterns';
import { findAnimationEndWarnings } from './animationEndGraph';

// Single traversal of top-level registry effects/sequences and per-interaction
// effects/sequences, supplying each node's `path`, whether it is a top-level
// registry definition, and its owning interaction (when known).
export function walkConfig(config: AnyConfig, visitors: Visitors): void {
  const { onInteraction, onEffect, onSequence } = visitors;

  Object.entries(config.effects ?? {}).forEach(([id, effect]) => {
    onEffect(['effects', id], effect, true, undefined);
  });

  Object.entries(config.sequences ?? {}).forEach(([id, sequence]) => {
    onSequence(['sequences', id], sequence, true, undefined);
    sequence.effects?.forEach((effect, ei) => {
      onEffect(['sequences', id, 'effects', ei], effect, false, undefined);
    });
  });

  config.interactions.forEach((interaction, i) => {
    onInteraction?.(['interactions', i], interaction);
    interaction.effects?.forEach((effect, ei) => {
      onEffect(['interactions', i, 'effects', ei], effect, false, interaction);
    });
    interaction.sequences?.forEach((sequence, si) => {
      const seqPath: Path = ['interactions', i, 'sequences', si];
      onSequence(seqPath, sequence, false, interaction);
      sequence.effects?.forEach((effect, ei) => {
        onEffect([...seqPath, 'effects', ei], effect, false, interaction);
      });
    });
  });
}

// Collect every warning/info-level semantic issue (consumed by `transform`).
export function collectSemanticWarnings(config: AnyConfig): SemanticIssue[] {
  const warnings: SemanticIssue[] = [];

  walkConfig(config, {
    onInteraction: (path, interaction) => {
      warnings.push(...checkListItemSelectorWithoutContainer(path, interaction));
      warnings.push(...checkRedundantSelector(path, interaction));
      warnings.push(...checkInvalidInset(path, interaction));
    },
    // checks that only look at depth>1 properties in effects/sequences do not need resolving
    onEffect: (path, effect, isTopLevel, owner) => {
      const { effectId } = effect;
      const resolvedEffect =
        !isTopLevel && effectId
          ? { ...((config.effects ?? {})[effectId] ?? {}), ...effect }
          : effect;
      warnings.push(...checkSameElementRetrigger(path, resolvedEffect, owner));
      warnings.push(...checkHitAreaShift(path, resolvedEffect, owner));
      warnings.push(...checkScrollPresetRange(path, resolvedEffect, owner));
      warnings.push(...checkListItemSelectorWithoutContainer(path, resolvedEffect));
      warnings.push(...checkRedundantSelector(path, resolvedEffect));
      warnings.push(...checkEmptyStyleProperties(path, effect));
      warnings.push(...checkStateRemoveWithoutEffectId(path, effect));
      warnings.push(...checkRecommendedFill(path, resolvedEffect, owner));
      warnings.push(...checkRecommendedFillBackwards(path, resolvedEffect, owner));
      warnings.push(...checkPointerAxisIgnored(path, resolvedEffect, owner));
      warnings.push(...checkKeyframePropCamelCase(path, effect));
    },
    onSequence: (path, sequence, isTopLevel, owner) => {
      const { sequenceId } = sequence;
      const resolvedSequence =
        !isTopLevel && sequenceId
          ? { ...((config.sequences ?? {})[sequenceId] ?? {}), ...sequence }
          : sequence;
      warnings.push(...checkSameElementRetrigger(path, resolvedSequence, owner));
    },
  });

  warnings.push(...findAnimationEndWarnings(config));

  return warnings;
}
