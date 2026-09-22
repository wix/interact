import { describe, expect, it } from 'vitest';
import { expectTypeOf } from 'vitest';
import type { z } from 'zod';
import type {
  SplitTextOptions,
  SplitTextPluginConfig,
  WrapperAttrsConfig,
  WrapperClassConfig,
  SplitType,
} from '../src/types';
import type { SplitTextPluginConfig as PluginConfigFromSchema } from '../src/schema';
import {
  SplitTextOptionsSchema,
  SplitTextPluginConfigSchema,
  validateSplitTextOptions,
  validateSplitTextPluginConfig,
  assertValidSplitTextOptions,
  assertValidSplitTextPluginConfig,
  WrapperClassConfigSchema,
  SplitTypeSchema,
} from '../src/schema';

type InferredOptions = z.infer<typeof SplitTextOptionsSchema>;
type InferredPlugin = z.infer<typeof SplitTextPluginConfigSchema>;

describe('SplitText schema validation', () => {
  it('accepts a minimal valid options object', () => {
    const result = validateSplitTextOptions({ type: 'chars' });
    expect(result.ok).toBe(true);
  });

  it('accepts union forms for wrapper options', () => {
    const perType = validateSplitTextOptions({
      type: ['words', 'chars'],
      nested: 'flatten',
      wrapperClass: { chars: 'c', words: 'w' },
      wrapperStyle: { chars: { opacity: '1' }, words: { opacity: '0.5' } },
      wrapperAttrs: { chars: { 'data-y': '2' } },
    });
    expect(perType.ok).toBe(true);

    const global = validateSplitTextOptions({
      wrapperClass: 'all',
      wrapperStyle: { opacity: '0' },
      wrapperAttrs: { 'data-x': '1' },
    });
    expect(global.ok).toBe(true);
  });

  it('accepts runtime function-valued options', () => {
    const result = validateSplitTextOptions({
      bidiResolver: (text: string) => [{ text, direction: 'ltr' as const }],
      onSplit: () => {},
      ignore: () => false,
    });
    expect(result.ok).toBe(true);
  });

  it('accepts segmenter constructor or instance when Intl is available', () => {
    if (typeof Intl === 'undefined' || !Intl.Segmenter) {
      return;
    }
    const result = validateSplitTextOptions({
      segmenter: Intl.Segmenter,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects unknown keys on options', () => {
    const result = validateSplitTextOptions({ type: 'chars', extra: true });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.message.toLowerCase().includes('unrecognized'))).toBe(true);
  });

  it('rejects multi-type split without nested flatten', () => {
    const result = validateSplitTextOptions({ type: ['words', 'chars'] });
    expect(result.ok).toBe(false);
  });

  it('requires container on plugin config', () => {
    const result = validateSplitTextPluginConfig({ type: 'chars' });
    expect(result.ok).toBe(false);
  });

  it('accepts valid plugin config', () => {
    const result = validateSplitTextPluginConfig({
      container: '.title',
      type: 'chars',
      hideUntilReady: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.container).toBe('.title');
    }
  });

  it('rejects invalid enum values', () => {
    const result = validateSplitTextOptions({ wordGlue: 'invalid' as 'adjacent' });
    expect(result.ok).toBe(false);
  });

  it('assert helpers throw with package prefix', () => {
    expect(() => assertValidSplitTextOptions({ badKey: 1 })).toThrow(/Invalid SplitTextOptions/);
    expect(() => assertValidSplitTextPluginConfig({})).toThrow(/Invalid SplitTextPluginConfig/);
  });
});

describe('SplitText schema type parity (drift guard)', () => {
  it('SplitType matches SplitTypeSchema', () => {
    expectTypeOf<SplitType>().toEqualTypeOf<z.infer<typeof SplitTypeSchema>>();
  });

  it('WrapperClassConfig matches schema', () => {
    expectTypeOf<WrapperClassConfig>().toEqualTypeOf<z.infer<typeof WrapperClassConfigSchema>>();
  });

  it('SplitTextOptions matches SplitTextOptionsSchema', () => {
    expectTypeOf<SplitTextOptions>().toEqualTypeOf<InferredOptions>();
  });

  it('SplitTextPluginConfig matches SplitTextPluginConfigSchema', () => {
    expectTypeOf<PluginConfigFromSchema>().toEqualTypeOf<InferredPlugin>();
  });

  it('plugin re-export matches schema plugin type', () => {
    expectTypeOf<SplitTextPluginConfig>().toEqualTypeOf<PluginConfigFromSchema>();
  });

  it('WrapperAttrsConfig per-type records use string values', () => {
    expectTypeOf<WrapperAttrsConfig['chars']>().toMatchTypeOf<Record<string, string> | undefined>();
  });
});
