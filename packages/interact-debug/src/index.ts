export type {
  InteractArtifact,
  ArtifactInput,
  FrameworkType,
  Scope,
  ValidationResult,
  ValidationEntry,
  ValidationSeverity,
  ScoreResult,
  ScoreReport,
  LogEntry,
  LogLevel,
  LogCategory,
} from './types';

export { parseArtifact } from './artifact';
export {
  extractDataInteractKeys,
  extractDataInteractInitials,
  hasInteractElements,
  extractInteractElementKeys,
  hasGenerateCss,
  hasSetupCall,
  hasDestroyCall,
  hasAllowA11yTriggers,
} from './artifact';

export {
  validateSchema,
  validateReferences,
  validateCompatibility,
  validateIntegration,
  detectAntiPatterns,
  validateRegistry,
  validateAll,
  validateConfig,
  validateInteraction,
  validateKey,
  validateEffect,
} from './validate';

// Logging
export { InteractLogger } from './log/logger';
export { enableLogging, disableLogging, getActiveLogger } from './log/patcher';

// Static inspection
export {
  inspectConfig,
  inspectInteraction,
  inspectEffect,
  inspectKey,
} from './inspect/configInspector';

export type {
  ConfigSummary,
  InteractionSummary,
  ResolvedEffectSummary,
  ResolvedSequenceSummary,
  EffectUsageSummary,
  KeySummary,
} from './inspect/configInspector';

// Runtime inspection (browser context)
export {
  inspectElement,
  getAnimationState,
  inspectByKey,
  findOrphanedElements,
} from './inspect/domInspector';

export type {
  ElementInspection,
  AnimationSnapshot,
  AnimationState,
} from './inspect/domInspector';

// Runtime validation (browser context)
export {
  validateRuntime,
  validateKeyRuntime,
  compareExpectedAnimations,
  captureWarnings,
  captureWarningsAsync,
} from './inspect/runtimeValidator';

export type {
  RuntimeCheck,
  CapturedWarning,
} from './inspect/runtimeValidator';
