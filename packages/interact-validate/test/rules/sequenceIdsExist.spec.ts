import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

describe('sequenceIdsExist — SEQUENCE_ID_NOT_FOUND', () => {
  it('emits no errors when a sequenceId reference resolves to a defined sequence', () => {
    const result = validateInteractConfig({
      sequences: { seq: { effects: [{ namedEffect: { type: 'FadeIn' } }] } },
      interactions: [{ key: 'el', trigger: 'viewEnter', sequences: [{ sequenceId: 'seq' }] }],
    });
    expect(result.errors.filter((e) => e.code === 'SEQUENCE_ID_NOT_FOUND')).toHaveLength(0);
  });

  it('emits SEQUENCE_ID_NOT_FOUND when a sequenceId reference has no matching definition', () => {
    const result = validateInteractConfig({
      interactions: [{ key: 'el', trigger: 'viewEnter', sequences: [{ sequenceId: 'missing' }] }],
    });
    const errs = result.errors.filter((e) => e.code === 'SEQUENCE_ID_NOT_FOUND');
    expect(errs).toHaveLength(1);
    expect(errs[0].severity).toBe('error');
    expect(errs[0].path).toContain('sequenceId');
  });
});
