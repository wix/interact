import { z } from 'zod';
import type {
  SplitTextOptions,
  SplitTextPluginConfig,
  SplitTextResult,
  SplitType,
} from '@wix/splittext';

export const SplitTypeSchema = z.enum(['chars', 'words', 'lines', 'sentences']);

export const WrapperClassConfigSchema = z
  .object({
    chars: z.string().optional(),
    words: z.string().optional(),
    lines: z.string().optional(),
    sentences: z.string().optional(),
  })
  .strict();

/** Serializable inline-style values (CSS property → string or number). */
export const CssStyleRecord = z.record(z.string(), z.union([z.string(), z.number()]));

export const WrapperStyleConfigSchema = z
  .object({
    chars: CssStyleRecord.optional(),
    words: CssStyleRecord.optional(),
    lines: CssStyleRecord.optional(),
    sentences: CssStyleRecord.optional(),
  })
  .strict();

const StringRecord = z.record(z.string(), z.string());

export const WrapperAttrsConfigSchema = z
  .object({
    chars: StringRecord.optional(),
    words: StringRecord.optional(),
    lines: StringRecord.optional(),
    sentences: StringRecord.optional(),
  })
  .strict();

const SegmenterOption = z.custom<
  Intl.Segmenter | { new (locale: string, options: { granularity: string }): Intl.Segmenter }
>(
  (val) => {
    if (val == null) return false;
    if (typeof val === 'function') return true;
    return typeof Intl !== 'undefined' && val instanceof Intl.Segmenter;
  },
  { message: 'segmenter must be an Intl.Segmenter instance or constructor' },
);

const BidiResolver = z.custom<(text: string) => Array<{ text: string; direction: 'ltr' | 'rtl' }>>(
  (val) => typeof val === 'function',
  { message: 'bidiResolver must be a function' },
);

const OnSplitCallback = z.custom<(result: SplitTextResult) => void>(
  (val) => typeof val === 'function',
  { message: 'onSplit must be a function' },
);

const IgnorePredicate = z.custom<(node: Node) => boolean>((val) => typeof val === 'function', {
  message: 'ignore predicate must be a function',
});

const SplitTypeArray = z.array(SplitTypeSchema).min(1);

const SplitTypeValue = z.custom<SplitType | SplitType[]>().superRefine((val, ctx) => {
  if (typeof val === 'string') {
    const result = SplitTypeSchema.safeParse(val);
    if (!result.success) {
      addZodIssues(ctx, result.error.issues);
    }
    return;
  }
  if (Array.isArray(val)) {
    const result = SplitTypeArray.safeParse(val);
    if (!result.success) {
      addZodIssues(ctx, result.error.issues);
    }
    return;
  }
  ctx.addIssue({
    code: 'custom',
    message: 'type must be a split type or a non-empty array of split types',
  });
});

const WrapperClassOption = stringOrObject(z.string(), WrapperClassConfigSchema);

const WrapperStyleOption = objectOrRecord(WrapperStyleConfigSchema, CssStyleRecord);

const WrapperAttrsOption = objectOrRecord(WrapperAttrsConfigSchema, StringRecord);

const IgnoreOption = z.custom<string | ((node: Node) => boolean)>().superRefine((val, ctx) => {
  if (typeof val === 'string') {
    const result = z.string().min(1).safeParse(val);
    if (!result.success) {
      addZodIssues(ctx, result.error.issues);
    }
    return;
  }
  if (typeof val === 'function') {
    const result = IgnorePredicate.safeParse(val);
    if (!result.success) {
      addZodIssues(ctx, result.error.issues);
    }
    return;
  }
  ctx.addIssue({
    code: 'custom',
    message: 'ignore must be a non-empty CSS selector string or a predicate function',
  });
});

const NestedOption = z.union([z.enum(['flatten', 'preserve']), z.number().int().nonnegative()]);

function addZodIssues(ctx: z.RefinementCtx, issues: z.core.$ZodIssue[]) {
  for (const issue of issues) {
    ctx.addIssue({
      code: 'custom',
      message: issue.message,
      path: issue.path,
    });
  }
}

function stringOrObject<S extends z.ZodString, O extends z.ZodObject<z.ZodRawShape>>(
  stringSchema: S,
  objectSchema: O,
) {
  return z.custom<z.infer<S> | z.infer<O>>().superRefine((val, ctx) => {
    if (typeof val === 'string') {
      const result = stringSchema.safeParse(val);
      if (!result.success) {
        addZodIssues(ctx, result.error.issues);
      }
      return;
    }
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      const result = objectSchema.safeParse(val);
      if (!result.success) {
        addZodIssues(ctx, result.error.issues);
      }
      return;
    }
    ctx.addIssue({
      code: 'custom',
      message: 'Expected string or object',
    });
  });
}

function objectOrRecord<O extends z.ZodObject<z.ZodRawShape>, R extends z.ZodRecord>(
  objectSchema: O,
  recordSchema: R,
) {
  return z.custom<z.infer<O> | z.infer<R>>().superRefine((val, ctx) => {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Expected object',
      });
      return;
    }
    const perType = objectSchema.safeParse(val);
    if (perType.success) {
      return;
    }
    const global = recordSchema.safeParse(val);
    if (global.success) {
      return;
    }
    addZodIssues(ctx, global.error.issues);
  });
}

function isMultiTypeSplit(type: SplitType | SplitType[] | undefined): boolean {
  return Array.isArray(type) && type.length >= 2;
}

export const SplitTextOptionsSchema = z
  .object({
    type: SplitTypeValue.optional(),
    wrapperClass: WrapperClassOption.optional(),
    wrapperStyle: WrapperStyleOption.optional(),
    wrapperAttrs: WrapperAttrsOption.optional(),
    contentAttribute: z.enum(['none', 'both', 'attribute-only']).optional(),
    aria: z.enum(['auto', 'none']).optional(),
    preserveText: z.boolean().optional(),
    segmenter: SegmenterOption.optional(),
    bidiResolver: BidiResolver.optional(),
    autoSplit: z.boolean().optional(),
    onSplit: OnSplitCallback.optional(),
    partIndexing: z.boolean().optional(),
    wordGlue: z.enum(['adjacent', 'none']).optional(),
    nested: NestedOption.optional(),
    ignore: IgnoreOption.optional(),
  })
  .strict()
  .superRefine((options, ctx) => {
    if (!isMultiTypeSplit(options.type)) {
      return;
    }
    const nested = options.nested ?? 'preserve';
    if (nested !== 'flatten') {
      ctx.addIssue({
        code: 'custom',
        message:
          'Multi-type splits require nested: "flatten" (preserve mode and numeric nested are not supported for nested composition)',
        path: ['nested'],
      });
    }
  });

export const SplitTextPluginConfigSchema = SplitTextOptionsSchema.safeExtend({
  container: z.string().min(1),
  hideUntilReady: z.boolean().optional(),
});

export type SplitTextValidationError = {
  path: (string | number)[];
  message: string;
};

export type SplitTextValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: SplitTextValidationError[] };

function formatIssues(issues: z.ZodIssue[]): SplitTextValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.filter(
      (p): p is string | number => typeof p === 'string' || typeof p === 'number',
    ),
    message: issue.message,
  }));
}

export function validateSplitTextOptions(
  input: unknown,
): SplitTextValidationResult<SplitTextOptions> {
  const result = SplitTextOptionsSchema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return { ok: false, errors: formatIssues(result.error.issues) };
}

export function validateSplitTextPluginConfig(
  input: unknown,
): SplitTextValidationResult<SplitTextPluginConfig> {
  const result = SplitTextPluginConfigSchema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return { ok: false, errors: formatIssues(result.error.issues) };
}

export function assertValidSplitTextOptions(input: unknown): asserts input is SplitTextOptions {
  const result = validateSplitTextOptions(input);
  if (!result.ok) {
    const detail = result.errors
      .map((e) => `${e.path.join('.') || '(root)'}: ${e.message}`)
      .join('; ');
    throw new Error(`[@wix/interact-validate] Invalid SplitTextOptions — ${detail}`);
  }
}

export function assertValidSplitTextPluginConfig(
  input: unknown,
): asserts input is SplitTextPluginConfig {
  const result = validateSplitTextPluginConfig(input);
  if (!result.ok) {
    const detail = result.errors
      .map((e) => `${e.path.join('.') || '(root)'}: ${e.message}`)
      .join('; ');
    throw new Error(`[@wix/interact-validate] Invalid SplitTextPluginConfig — ${detail}`);
  }
}

export type {
  SplitTextOptions,
  SplitTextPluginConfig,
  SplitType,
  WrapperClassConfig,
  WrapperStyleConfig,
  WrapperAttrsConfig,
} from '@wix/splittext';
