import { z } from 'zod';
import type { SplitTextResult } from './types';

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

export const WrapperAttrsConfigSchema = z
  .object({
    chars: z.record(z.string(), z.string()).optional(),
    words: z.record(z.string(), z.string()).optional(),
    lines: z.record(z.string(), z.string()).optional(),
    sentences: z.record(z.string(), z.string()).optional(),
  })
  .strict();

const StringRecord = z.record(z.string(), z.string());

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

const SplitTypeValue = z.union([SplitTypeSchema, z.array(SplitTypeSchema).min(1)]);

const WrapperClassOption = z.union([z.string(), WrapperClassConfigSchema]);

const WrapperStyleOption = z.union([CssStyleRecord, WrapperStyleConfigSchema]);

const WrapperAttrsOption = z.union([StringRecord, WrapperAttrsConfigSchema]);

const IgnoreOption = z.union([z.string().min(1), IgnorePredicate]);

const NestedOption = z.union([z.enum(['flatten', 'preserve']), z.number().int().nonnegative()]);

function isMultiTypeSplit(type: z.infer<typeof SplitTypeValue> | undefined): boolean {
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

export type SplitType = z.infer<typeof SplitTypeSchema>;

export interface WrapperClassConfig extends z.infer<typeof WrapperClassConfigSchema> {}

export interface WrapperStyleConfig extends z.infer<typeof WrapperStyleConfigSchema> {}

export interface WrapperAttrsConfig extends z.infer<typeof WrapperAttrsConfigSchema> {}

/** Options for {@link splitText} and the `$splitText` Interact plugin (except `container`). */
export interface SplitTextOptions {
  /**
   * Split types to build. When specified, splitting runs eagerly on invocation;
   * omitting the option defers splitting until each getter is accessed.
   *
   * A single type produces a flat split. An array of two or more types builds a
   * **nested** DOM tree (coarse → fine), e.g. words containing chars. Array
   * order is normalized automatically to `lines → sentences → words → chars`.
   *
   * Multi-type arrays require `nested: 'flatten'` (v1). Single-type splits
   * support all `nested` modes (`'preserve'`, `'flatten'`, or a number).
   */
  type?: z.infer<typeof SplitTypeValue>;

  /**
   * CSS class(es) added to every wrapper `<span>`. Accepts either a single
   * string (applied to all types) or a per-type config object.
   */
  wrapperClass?: z.infer<typeof WrapperClassOption>;

  /**
   * Inline styles applied to every wrapper `<span>`. Accepts either a global
   * `CSSStyleDeclaration` partial (applied to all types) or a per-type config.
   */
  wrapperStyle?: z.infer<typeof WrapperStyleOption>;

  /**
   * Custom HTML attributes applied to every wrapper `<span>`. Accepts either a
   * global record (applied to all types) or a per-type config.
   */
  wrapperAttrs?: z.infer<typeof WrapperAttrsOption>;

  /**
   * Controls whether char/word wrappers receive a `data-content` attribute
   * mirroring their text content (useful for CSS `content: attr(data-content)`
   * generated-content effects).
   *
   * - `'both'` (default): text content present and `data-content` set.
   * - `'none'`: no `data-content` attribute.
   * - `'attribute-only'`: `data-content` set, text content left empty.
   */
  contentAttribute?: 'none' | 'both' | 'attribute-only';

  /**
   * ARIA handling mode.
   *
   * - `'auto'` (default): wraps split content in an `aria-hidden` div and
   *   preserves the original text for screen readers.
   * - `'none'`: no ARIA changes.
   */
  aria?: 'auto' | 'none';

  /**
   * When `true` (default), inserts a visually-hidden `<span>` containing the
   * original text as a sibling of the split content for SEO and assistive
   * technology. When `false`, sets `aria-label` on the container instead.
   */
  preserveText?: boolean;

  /**
   * Provide a custom `Intl.Segmenter` constructor when native support is
   * missing. Accepts either an already-constructed instance or the constructor
   * itself (the library will instantiate it per granularity).
   */
  segmenter?: z.infer<typeof SegmenterOption>;

  /**
   * Optional plugin for BiDi (bidirectional text) handling. Receives the flat
   * text content and must return ordered runs with explicit direction. See docs
   * for plugin contract details.
   */
  bidiResolver?: z.infer<typeof BidiResolver>;

  /**
   * When `true`, attaches a `ResizeObserver` and `fonts.ready` listener that
   * automatically re-split on viewport or font changes.
   */
  autoSplit?: boolean;

  /**
   * Called after every split (including re-splits triggered by `autoSplit`).
   * Receives the updated `SplitTextResult`.
   */
  onSplit?: (result: SplitTextResult) => void;

  /**
   * When `true` (default), sets CSS custom properties (`--char-index`,
   * `--word-index`, `--line-index`, `--sentence-index`) on each wrapper span
   * for use in staggered CSS animations.
   */
  partIndexing?: boolean;

  /**
   * Controls how punctuation and whitespace relate to word wrappers.
   *
   * - `'adjacent'` (default): punctuation is glued to the nearest word within
   *   each whitespace-delimited token; trailing spaces attach to the preceding
   *   word. Every visible character participates in word-level effects.
   * - `'none'`: lexical words and punctuation each receive their own indexed
   *   wrapper; whitespace remains as plain text nodes between spans.
   */
  wordGlue?: 'adjacent' | 'none';

  /**
   * Controls how nested DOM elements within the target are handled during splitting.
   *
   * - `'preserve'` (default): Preserves inline element structure (e.g. `<a>`, `<strong>`,
   *   `<em>`). Each text node is split in place, keeping parent elements intact so they
   *   remain in the output DOM alongside the split spans.
   * - `'flatten'`: Extracts plain text via `element.textContent`, ignores all inner DOM
   *   structure, and splits that flat string. Useful for dirty/generated markup.
   * - `number`: Like `'preserve'`, but only the first N element levels are kept. Elements
   *   deeper than N levels are replaced with their text content. For example, `nested: 2`
   *   on `<b>bold <i>italic <u>underlined</u></i></b>` keeps `<b>` and `<i>` but removes
   *   `<u>`, inlining its text as `<b>bold <i>italic underlined</i></b>`.
   */
  nested?: z.infer<typeof NestedOption>;

  /**
   * CSS selector or predicate to skip nodes during traversal (only applies in
   * `'preserve'` / `number` nested modes). Use a comma-separated selector for
   * logical OR (e.g. `'sup, sub'`).
   */
  ignore?: z.infer<typeof IgnoreOption>;
}

/** Config accepted under `$splitText` in an InteractConfig on an interaction or effect. */
export interface SplitTextPluginConfig extends SplitTextOptions {
  container: string;
  /**
   * Hide the container until the split has been applied, to prevent a flash of the un-split text
   * before an entrance/scroll animation runs. Emits SSR CSS via {@link splitTextStyle} and is
   * revealed once the runtime plugin marks the container ready.
   */
  hideUntilReady?: boolean;
}

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
    throw new Error(`[@wix/splittext] Invalid SplitTextOptions — ${detail}`);
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
    throw new Error(`[@wix/splittext] Invalid SplitTextPluginConfig — ${detail}`);
  }
}
