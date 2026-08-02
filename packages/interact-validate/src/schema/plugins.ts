import { z } from 'zod';

/**
 * Prefix marking a config field as plugin config (routed to `Interact.use()` plugins at runtime).
 * MUST match `PLUGIN_FIELD_PREFIX` in `@wix/interact`. Kept as a local constant so this package
 * stays a types-only consumer of `@wix/interact` (no runtime import).
 */
export const PLUGIN_PREFIX = '$';

export function isPluginKey(key: string): boolean {
  return key.length > PLUGIN_PREFIX.length && key.startsWith(PLUGIN_PREFIX);
}

/**
 * Replacement for `.strict()` that tolerates plugin fields. Keys prefixed with `$` (e.g.
 * `$splitText`) are accepted with opaque values (validate never inspects plugin config); every
 * other unknown key is still reported as `SCHEMA_UNRECOGNIZED_KEYS`, preserving typo detection.
 */
export function withPluginFields<T extends z.ZodObject<any>>(schema: T) {
  const knownKeys = new Set(Object.keys(schema.shape));

  const keyCheck = z.check<Record<string, unknown>>((input) => {
    for (const key of Object.keys(input.value)) {
      if (knownKeys.has(key) || isPluginKey(key)) {
        continue;
      }

      input.issues.push({
        code: 'custom',
        input: input.value,
        message:
          `Unrecognized key: "${key}". Plugin config must use a "${PLUGIN_PREFIX}"-prefixed ` +
          `field (e.g. "${PLUGIN_PREFIX}splitText").`,
        params: { domainCode: 'SCHEMA_UNRECOGNIZED_KEYS' },
      });
    }
  });

  return schema.catchall(z.unknown()).check(keyCheck);
}
