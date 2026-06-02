import type { Severity, ValidationError } from '../errors';
import type { ValidationContext } from '../context';

import { effectIdsExist } from './referential/effectIdsExist';
import { sequenceIdsExist } from './referential/sequenceIdsExist';
import { animationEndEffectExists } from './referential/animationEndEffectExists';
import { conditionsExist } from './referential/conditionsExist';
import { interactionHasEffectsOrSequences } from './referential/interactionHasEffectsOrSequences';

import { validMediaQueries } from './conditions/validMediaQueries';

import { triggerEffectCompatible } from './semantic/triggerEffectCompatible';
import { numericBounds } from './semantic/numericBounds';
import { conditionPredicateRequired } from './semantic/conditionPredicateRequired';
import { uniqueDefinitionIds } from './semantic/uniqueDefinitionIds';
import { unusedDefinitions } from './semantic/unusedDefinitions';

export type Rule = {
  code: string;
  defaultSeverity: Severity;
  run: (ctx: ValidationContext) => ValidationError[];
};

export const RULES: Rule[] = [
  effectIdsExist,
  sequenceIdsExist,
  animationEndEffectExists,
  conditionsExist,
  interactionHasEffectsOrSequences,
  validMediaQueries,
  triggerEffectCompatible,
  numericBounds,
  conditionPredicateRequired,
  uniqueDefinitionIds,
  unusedDefinitions,
];
