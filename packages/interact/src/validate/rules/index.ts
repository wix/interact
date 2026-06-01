import type { Severity, ValidationError } from '../errors';
import type { ValidationContext } from '../context';

import { interactionKeysExist } from './referential/interactionKeysExist';
import { effectKeyExistsInElements } from './referential/effectKeyExistsInElements';
import { effectIdsExist } from './referential/effectIdsExist';
import { sequenceIdsExist } from './referential/sequenceIdsExist';
import { animationEndEffectExists } from './referential/animationEndEffectExists';
import { conditionsExist } from './referential/conditionsExist';
import { interactionHasEffectsOrSequences } from './referential/interactionHasEffectsOrSequences';
import { controlTargetsExist } from './referential/controlTargetsExist';
import { styleBindingSelectorExists } from './referential/styleBindingSelectorExists';
import { variableBindingIsCustomProperty } from './referential/variableBindingIsCustomProperty';
import { bindingPropertyRequired } from './referential/bindingPropertyRequired';

import { rangeDefaultWithinBounds } from './controls/rangeDefaultWithinBounds';
import { selectDefaultMatchesOption } from './controls/selectDefaultMatchesOption';
import { uniqueControlIds } from './controls/uniqueControlIds';
import { validTransformTypes } from './controls/validTransformTypes';
import { selectMapCoverage } from './controls/selectMapCoverage';
import { variableUsageReferenced } from './controls/variableUsageReferenced';

import { validMediaQueries } from './conditions/validMediaQueries';

export type Rule = {
  code: string;
  defaultSeverity: Severity;
  run: (ctx: ValidationContext) => ValidationError[];
};

export const RULES: Rule[] = [
  interactionKeysExist,
  effectKeyExistsInElements,
  effectIdsExist,
  sequenceIdsExist,
  animationEndEffectExists,
  conditionsExist,
  interactionHasEffectsOrSequences,
  controlTargetsExist,
  styleBindingSelectorExists,
  variableBindingIsCustomProperty,
  bindingPropertyRequired,

  rangeDefaultWithinBounds,
  selectDefaultMatchesOption,
  uniqueControlIds,
  validTransformTypes,
  selectMapCoverage,
  variableUsageReferenced,

  validMediaQueries,
];
