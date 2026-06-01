import { z } from 'zod';

import {
  Condition as ConditionSchema,
  ElementEntry as ElementEntrySchema,
  ExperienceMeta as ExperienceMetaSchema,
  ExperienceSchemaVersion as ExperienceSchemaVersionSchema,
  Keyframe as KeyframeSchema,
  LengthPercentage as LengthPercentageSchema,
  MediaCondition as MediaConditionSchema,
  RangeOffset as RangeOffsetSchema,
  StyleRule as StyleRuleSchema,
} from './primitives';
import {
  EffectBase as EffectBaseSchema,
  NamedEffect as NamedEffectSchema,
  SerializableEffect as SerializableEffectSchema,
  SerializableEffectRef as SerializableEffectRefSchema,
  SerializableEffectSource as SerializableEffectSourceSchema,
  SerializableScrubEffect as SerializableScrubEffectSchema,
  SerializableStateEffect as SerializableStateEffectSchema,
  SerializableTimeEffect as SerializableTimeEffectSchema,
} from './effects';
import {
  SerializableSequenceConfig as SerializableSequenceConfigSchema,
  SerializableSequenceConfigRef as SerializableSequenceConfigRefSchema,
} from './sequences';
import {
  AnimationEndParams as AnimationEndParamsSchema,
  ExperienceInteractConfig as ExperienceInteractConfigSchema,
  ExperienceInteraction as ExperienceInteractionSchema,
  PointerMoveParams as PointerMoveParamsSchema,
  TriggerParams as TriggerParamsSchema,
  TriggerType as TriggerTypeSchema,
  ViewEnterParams as ViewEnterParamsSchema,
} from './interactions';
import {
  BindingTarget as BindingTargetSchema,
  Control as ControlSchema,
  ControlBinding as ControlBindingSchema,
  ControlConstraints as ControlConstraintsSchema,
  ControlOption as ControlOptionSchema,
  ControlType as ControlTypeSchema,
  ControlValue as ControlValueSchema,
  ValueTransform as ValueTransformSchema,
} from './controls';

export {
  ConditionSchema as Condition,
  ElementEntrySchema as ElementEntry,
  ExperienceMetaSchema as ExperienceMeta,
  ExperienceSchemaVersionSchema as ExperienceSchemaVersion,
  KeyframeSchema as Keyframe,
  LengthPercentageSchema as LengthPercentage,
  MediaConditionSchema as MediaCondition,
  RangeOffsetSchema as RangeOffset,
  StyleRuleSchema as StyleRule,
  EffectBaseSchema as EffectBase,
  NamedEffectSchema as NamedEffect,
  SerializableEffectSchema as SerializableEffect,
  SerializableEffectRefSchema as SerializableEffectRef,
  SerializableEffectSourceSchema as SerializableEffectSource,
  SerializableScrubEffectSchema as SerializableScrubEffect,
  SerializableStateEffectSchema as SerializableStateEffect,
  SerializableTimeEffectSchema as SerializableTimeEffect,
  SerializableSequenceConfigSchema as SerializableSequenceConfig,
  SerializableSequenceConfigRefSchema as SerializableSequenceConfigRef,
  AnimationEndParamsSchema as AnimationEndParams,
  ExperienceInteractConfigSchema as ExperienceInteractConfig,
  ExperienceInteractionSchema as ExperienceInteraction,
  PointerMoveParamsSchema as PointerMoveParams,
  TriggerParamsSchema as TriggerParams,
  TriggerTypeSchema as TriggerType,
  ViewEnterParamsSchema as ViewEnterParams,
  BindingTargetSchema as BindingTarget,
  ControlSchema as Control,
  ControlBindingSchema as ControlBinding,
  ControlConstraintsSchema as ControlConstraints,
  ControlOptionSchema as ControlOption,
  ControlTypeSchema as ControlType,
  ControlValueSchema as ControlValue,
  ValueTransformSchema as ValueTransform,
};

export { ExperienceSchema } from './experience';
export type { Experience } from './experience';

export type Condition = z.infer<typeof ConditionSchema>;
export type ElementEntry = z.infer<typeof ElementEntrySchema>;
export type ExperienceMeta = z.infer<typeof ExperienceMetaSchema>;
export type ExperienceSchemaVersion = z.infer<typeof ExperienceSchemaVersionSchema>;
export type Keyframe = z.infer<typeof KeyframeSchema>;
export type LengthPercentage = z.infer<typeof LengthPercentageSchema>;
export type MediaCondition = z.infer<typeof MediaConditionSchema>;
export type RangeOffset = z.infer<typeof RangeOffsetSchema>;
export type StyleRule = z.infer<typeof StyleRuleSchema>;

export type EffectBase = z.infer<typeof EffectBaseSchema>;
export type NamedEffect = z.infer<typeof NamedEffectSchema>;
export type SerializableEffect = z.infer<typeof SerializableEffectSchema>;
export type SerializableEffectRef = z.infer<typeof SerializableEffectRefSchema>;
export type SerializableEffectSource = z.infer<typeof SerializableEffectSourceSchema>;
export type SerializableScrubEffect = z.infer<typeof SerializableScrubEffectSchema>;
export type SerializableStateEffect = z.infer<typeof SerializableStateEffectSchema>;
export type SerializableTimeEffect = z.infer<typeof SerializableTimeEffectSchema>;

export type SerializableSequenceConfig = z.infer<typeof SerializableSequenceConfigSchema>;
export type SerializableSequenceConfigRef = z.infer<typeof SerializableSequenceConfigRefSchema>;

export type AnimationEndParams = z.infer<typeof AnimationEndParamsSchema>;
export type ExperienceInteractConfig = z.infer<typeof ExperienceInteractConfigSchema>;
export type ExperienceInteraction = z.infer<typeof ExperienceInteractionSchema>;
export type PointerMoveParams = z.infer<typeof PointerMoveParamsSchema>;
export type TriggerParams = z.infer<typeof TriggerParamsSchema>;
export type TriggerType = z.infer<typeof TriggerTypeSchema>;
export type ViewEnterParams = z.infer<typeof ViewEnterParamsSchema>;

export type BindingTarget = z.infer<typeof BindingTargetSchema>;
export type Control = z.infer<typeof ControlSchema>;
export type ControlBinding = z.infer<typeof ControlBindingSchema>;
export type ControlConstraints = z.infer<typeof ControlConstraintsSchema>;
export type ControlOption = z.infer<typeof ControlOptionSchema>;
export type ControlType = z.infer<typeof ControlTypeSchema>;
export type ControlValue = z.infer<typeof ControlValueSchema>;
export type ValueTransform = z.infer<typeof ValueTransformSchema>;
