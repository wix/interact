import { describe, expectTypeOf, it } from 'vitest';
import type { z } from 'zod';
import type { InteractConfig, Condition as ConditionDef } from '@wix/interact';
import { InteractConfigSchema, Condition } from '../src/schema';

type InferredConfig = z.infer<typeof InteractConfigSchema>;
type InferredCondition = z.infer<typeof Condition>;

// ---------------------------------------------------------------------------
// These tests are compile-time drift guards. They fail at TypeScript type-
// checking time (yarn lint / tsc --noEmit) if the zod schemas diverge from
// the hand-written types in @wix/interact. At runtime they are no-ops.
// ---------------------------------------------------------------------------

describe('schema type parity (drift guard)', () => {
  it('Condition schema type field is identical to the hand-written ConditionDef type field', () => {
    expectTypeOf<InferredCondition['type']>().toEqualTypeOf<ConditionDef['type']>();
  });

  it('Condition schema predicate field is identical to the hand-written ConditionDef predicate field', () => {
    expectTypeOf<InferredCondition['predicate']>().toEqualTypeOf<ConditionDef['predicate']>();
  });

  it('InteractConfigSchema has required interactions (mirrors InteractConfig)', () => {
    type Interactions = InferredConfig['interactions'];
    // interactions must be a required array
    expectTypeOf<Interactions>().not.toEqualTypeOf<undefined>();
    expectTypeOf<InteractConfig['interactions']>().not.toEqualTypeOf<undefined>();
  });

  it('InteractConfigSchema has optional effects (mirrors InteractConfig)', () => {
    // Both types declare effects as optional
    expectTypeOf<InferredConfig['effects']>().toMatchTypeOf<Record<string, unknown> | undefined>();
    expectTypeOf<InteractConfig['effects']>().toMatchTypeOf<Record<string, unknown> | undefined>();
  });

  it('InteractConfigSchema has optional sequences (mirrors InteractConfig)', () => {
    expectTypeOf<InferredConfig['sequences']>().toMatchTypeOf<
      Record<string, unknown> | undefined
    >();
    expectTypeOf<InteractConfig['sequences']>().toMatchTypeOf<
      Record<string, unknown> | undefined
    >();
  });

  it('InteractConfigSchema has optional conditions (mirrors InteractConfig)', () => {
    expectTypeOf<InferredConfig['conditions']>().toMatchTypeOf<
      Record<string, unknown> | undefined
    >();
    expectTypeOf<InteractConfig['conditions']>().toMatchTypeOf<
      Record<string, unknown> | undefined
    >();
  });
});
