import type { InteractArtifact, InteractConfig, ValidationResult, ValidationEntry, Scope } from '../types';
import { toResult } from './helpers';
import { validateSchema } from './configValidator';
import { validateReferences } from './referenceValidator';
import { validateCompatibility } from './compatibilityValidator';
import { validateIntegration } from './integrationValidator';
import { detectAntiPatterns } from './antiPatterns';
import { validateRegistry } from './registryValidator';

export { validateSchema } from './configValidator';
export { validateReferences } from './referenceValidator';
export { validateCompatibility } from './compatibilityValidator';
export { validateIntegration } from './integrationValidator';
export { detectAntiPatterns } from './antiPatterns';
export { validateRegistry } from './registryValidator';
export {
  TIME_TRIGGERS,
  SCRUB_TRIGGERS,
  STATE_TRIGGERS,
  TRIGGER_TYPES,
  isRecord,
  toResult,
  makeEntry,
} from './helpers';
export {
  ALL_PRESETS,
  ENTRANCE_PRESETS,
  ONGOING_PRESETS,
  SCROLL_PRESETS,
  MOUSE_PRESETS,
  BG_SCROLL_PRESETS,
} from './registryValidator';

// ---------------------------------------------------------------------------
// Aggregate validators
// ---------------------------------------------------------------------------

function mergeResults(...results: ValidationResult[]): ValidationResult {
  const allEntries: ValidationEntry[] = [];
  for (const r of results) {
    allEntries.push(...r.errors, ...r.warnings, ...r.infos);
  }
  return toResult(allEntries);
}

/**
 * Run all validators on a full artifact (config + HTML + CSS + JS).
 */
export function validateAll(artifact: InteractArtifact, scope?: Scope): ValidationResult {
  return mergeResults(
    validateSchema(artifact.config, scope),
    validateReferences(artifact.config, scope),
    validateCompatibility(artifact.config, scope),
    validateIntegration(artifact, scope),
    detectAntiPatterns(artifact, scope),
    validateRegistry(artifact, scope),
  );
}

/**
 * Config-only validation (no HTML/JS/CSS needed).
 * Runs schema, reference, and compatibility validators.
 */
export function validateConfig(config: unknown, scope?: Scope): ValidationResult {
  const schemaResult = validateSchema(config, scope);
  if (!schemaResult.valid) return schemaResult;

  const typedConfig = config as InteractConfig;
  return mergeResults(
    schemaResult,
    validateReferences(typedConfig, scope),
    validateCompatibility(typedConfig, scope),
  );
}

/**
 * Validate a specific interaction by index.
 */
export function validateInteraction(artifact: InteractArtifact, index: number): ValidationResult {
  const scope: Scope = { interactionIndex: index };
  return validateAll(artifact, scope);
}

/**
 * Validate all interactions/effects for a specific key.
 */
export function validateKey(artifact: InteractArtifact, key: string): ValidationResult {
  const scope: Scope = { key };
  return validateAll(artifact, scope);
}

/**
 * Validate a specific named effect (all interactions that reference it).
 */
export function validateEffect(artifact: InteractArtifact, effectId: string): ValidationResult {
  const scope: Scope = { effectId };
  return validateAll(artifact, scope);
}
