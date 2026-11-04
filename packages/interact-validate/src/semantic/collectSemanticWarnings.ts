// Static semantic checks derived from the documented constraints in
// `packages/interact/rules/*.md`. These run with no DOM and no runtime — they
// inspect the parsed config shape only. Warning/info checks are collected by
// `collectSemanticWarnings` (consumed by the schema `transform`).

import type { SemanticIssue, AnyConfig } from '../types';
import { walkConfig } from '../walkConfig';
import { checkFunctionOffsetEasing } from './cssGeneration';
import { checkCSSPropertyNames, checkInvalidInset } from './cssSyntax';
import { checkSameElementRetrigger, checkHitAreaShift } from './fouc';
import {
  checkListItemSelectorWithoutContainer,
  checkRedundantSelector,
  checkPointerAxisIgnored,
} from './ignored';
import { checkEmptyStyleProperties, checkStateRemoveWithoutEffectId } from './partialData';
import { checkRecommendedFill } from './recommendedPatterns';
import { findAnimationEndWarnings } from './animationEndGraph';
import { checkNamedEffectParams } from './namedEffectParams';
import { createReducedMotionWarnings } from './reducedMotion';

// Collect every warning/info-level semantic issue (consumed by `transform`).
export function collectSemanticWarnings(config: AnyConfig): SemanticIssue[] {
  const reducedMotion = createReducedMotionWarnings(config);
  const warnings: SemanticIssue[] = [...reducedMotion.onConfig()];

  walkConfig(config, {
    onInteraction: (path, interaction) => {
      warnings.push(...reducedMotion.onInteraction(path, interaction));
      warnings.push(...checkListItemSelectorWithoutContainer(path, interaction));
      warnings.push(...checkRedundantSelector(path, interaction));
      warnings.push(...checkInvalidInset(path, interaction));
    },
    // checks that only look at depth>1 properties in effects/sequences do not need resolving
    onEffect: (path, effect, isTopLevel, owner, sequence) => {
      warnings.push(...reducedMotion.onEffect(path, effect, isTopLevel, owner, sequence));
      const { effectId } = effect;
      const resolvedEffect =
        !isTopLevel && effectId
          ? { ...((config.effects ?? {})[effectId] ?? {}), ...effect }
          : effect;
      warnings.push(...checkSameElementRetrigger(path, resolvedEffect, owner));
      warnings.push(...checkHitAreaShift(path, resolvedEffect, owner));
      warnings.push(...checkListItemSelectorWithoutContainer(path, resolvedEffect));
      warnings.push(...checkRedundantSelector(path, resolvedEffect));
      warnings.push(...checkEmptyStyleProperties(path, effect));
      warnings.push(...checkStateRemoveWithoutEffectId(path, effect));
      warnings.push(...checkRecommendedFill(path, resolvedEffect, owner));
      warnings.push(...checkPointerAxisIgnored(path, resolvedEffect, owner));
      warnings.push(...checkCSSPropertyNames(path, effect));
      warnings.push(...checkNamedEffectParams(path, effect));
    },
    onSequence: (path, sequence, isTopLevel, owner) => {
      warnings.push(...reducedMotion.onSequence(path, sequence, isTopLevel, owner));
      const { sequenceId } = sequence;
      const resolvedSequence =
        !isTopLevel && sequenceId
          ? { ...((config.sequences ?? {})[sequenceId] ?? {}), ...sequence }
          : sequence;
      warnings.push(...checkSameElementRetrigger(path, resolvedSequence, owner));
      warnings.push(...checkFunctionOffsetEasing(path, sequence));
    },
  });

  warnings.push(...findAnimationEndWarnings(config));

  return warnings;
}
