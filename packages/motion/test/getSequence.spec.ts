import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AnimationGroup } from '../src/AnimationGroup';
import { getSequence, createAnimationGroups } from '../src/motion';
import type { AnimationGroupArgs, SequenceOptions } from '../src/types';

vi.mock('../src/api/webAnimations', () => ({
  getWebAnimation: vi.fn(),
}));

import { getWebAnimation } from '../src/api/webAnimations';

(globalThis as any).CSSAnimation = class CSSAnimation {};

const mockedGetWebAnimation = vi.mocked(getWebAnimation);

const createAnimationGroupArgs = (
  target: AnimationGroupArgs['target'],
  effectId = 'effect-id',
): AnimationGroupArgs => ({
  target,
  options: {
    keyframeEffect: {
      name: effectId,
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
    },
    effectId,
  } as any,
});

const createGroup = () => new AnimationGroup([]);

describe('getSequence()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    (HTMLElement.prototype as any).getAnimations = vi.fn(() => []);
  });

  describe('AnimationGroupArgs[] flow', () => {
    test('creates Sequence with one AnimationGroup per resolved target element across multiple entries', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const el3 = document.createElement('div');
      const group1 = createGroup();
      const group2 = createGroup();
      const group3 = createGroup();
      mockedGetWebAnimation
        .mockReturnValueOnce(group1)
        .mockReturnValueOnce(group2)
        .mockReturnValueOnce(group3);

      const sequence = getSequence({}, [
        createAnimationGroupArgs(el1, 'effect-a'),
        createAnimationGroupArgs([el2, el3], 'effect-b'),
      ]);

      expect(sequence).toBeInstanceOf(AnimationGroup);
      expect(sequence.animationGroups).toEqual([group1, group2, group3]);
      expect(mockedGetWebAnimation).toHaveBeenCalledTimes(3);
      expect(mockedGetWebAnimation).toHaveBeenNthCalledWith(
        1,
        el1,
        expect.objectContaining({ effectId: 'effect-a' }),
        undefined,
        { reducedMotion: false },
      );
      expect(mockedGetWebAnimation).toHaveBeenNthCalledWith(
        2,
        el2,
        expect.objectContaining({ effectId: 'effect-b' }),
        undefined,
        { reducedMotion: false },
      );
      expect(mockedGetWebAnimation).toHaveBeenNthCalledWith(
        3,
        el3,
        expect.objectContaining({ effectId: 'effect-b' }),
        undefined,
        { reducedMotion: false },
      );
    });

    test('handles a single entry with HTMLElement target', () => {
      const element = document.createElement('button');
      const group = createGroup();
      mockedGetWebAnimation.mockReturnValueOnce(group);

      const sequence = getSequence({}, [
        createAnimationGroupArgs(element, 'single-element-effect'),
      ]);

      expect(sequence.animationGroups).toEqual([group]);
      expect(mockedGetWebAnimation).toHaveBeenCalledOnce();
      expect(mockedGetWebAnimation).toHaveBeenCalledWith(
        element,
        expect.objectContaining({ effectId: 'single-element-effect' }),
        undefined,
        { reducedMotion: false },
      );
    });

    test('handles a single entry with HTMLElement[] target where each element becomes its own group', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const group1 = createGroup();
      const group2 = createGroup();
      mockedGetWebAnimation.mockReturnValueOnce(group1).mockReturnValueOnce(group2);

      const sequence = getSequence({}, [createAnimationGroupArgs([el1, el2], 'array-effect')]);

      expect(sequence.animationGroups).toEqual([group1, group2]);
      expect(mockedGetWebAnimation).toHaveBeenCalledTimes(2);
    });

    test('handles a single entry with string selector target via querySelectorAll', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      el1.className = 'card';
      el2.className = 'card';
      document.body.append(el1, el2);

      const group1 = createGroup();
      const group2 = createGroup();
      mockedGetWebAnimation.mockReturnValueOnce(group1).mockReturnValueOnce(group2);

      const sequence = getSequence({}, [createAnimationGroupArgs('.card', 'selector-effect')]);

      expect(sequence.animationGroups).toEqual([group1, group2]);
      expect(mockedGetWebAnimation).toHaveBeenCalledTimes(2);
      expect(mockedGetWebAnimation).toHaveBeenNthCalledWith(
        1,
        el1,
        expect.objectContaining({ effectId: 'selector-effect' }),
        undefined,
        { reducedMotion: false },
      );
      expect(mockedGetWebAnimation).toHaveBeenNthCalledWith(
        2,
        el2,
        expect.objectContaining({ effectId: 'selector-effect' }),
        undefined,
        { reducedMotion: false },
      );
    });

    test('handles a single entry with null target and passes it through to getAnimation', () => {
      const group = createGroup();
      mockedGetWebAnimation.mockReturnValueOnce(group);

      const sequence = getSequence({}, [createAnimationGroupArgs(null, 'null-target-effect')]);

      expect(sequence.animationGroups).toEqual([group]);
      expect(mockedGetWebAnimation).toHaveBeenCalledOnce();
      expect(mockedGetWebAnimation).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ effectId: 'null-target-effect' }),
        undefined,
        { reducedMotion: false },
      );
    });

    test('creates Sequence with one group per entry', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const group1 = createGroup();
      const group2 = createGroup();
      mockedGetWebAnimation.mockReturnValueOnce(group1).mockReturnValueOnce(group2);

      const sequence = getSequence({}, [
        createAnimationGroupArgs(el1, 'entry-1'),
        createAnimationGroupArgs(el2, 'entry-2'),
      ]);

      expect(sequence.animationGroups).toEqual([group1, group2]);
      expect(mockedGetWebAnimation).toHaveBeenCalledTimes(2);
    });

    test('resolves each entry target independently', () => {
      const item1 = document.createElement('div');
      item1.className = 'item-a';
      const item2 = document.createElement('div');
      item2.className = 'item-b';
      document.body.append(item1, item2);

      const group1 = createGroup();
      const group2 = createGroup();
      mockedGetWebAnimation.mockReturnValueOnce(group1).mockReturnValueOnce(group2);

      const sequence = getSequence({}, [
        createAnimationGroupArgs('.item-a', 'a-effect'),
        createAnimationGroupArgs('.item-b', 'b-effect'),
      ]);

      expect(sequence.animationGroups).toEqual([group1, group2]);
      expect(mockedGetWebAnimation).toHaveBeenNthCalledWith(
        1,
        item1,
        expect.objectContaining({ effectId: 'a-effect' }),
        undefined,
        { reducedMotion: false },
      );
      expect(mockedGetWebAnimation).toHaveBeenNthCalledWith(
        2,
        item2,
        expect.objectContaining({ effectId: 'b-effect' }),
        undefined,
        { reducedMotion: false },
      );
    });
  });

  describe('Options forwarding', () => {
    test('passes SequenceOptions (delay, offset, offsetEasing) to Sequence constructor', () => {
      const element = document.createElement('div');
      const group = createGroup();
      const options: SequenceOptions = {
        delay: 100,
        offset: 50,
        offsetEasing: 'quadIn',
      };
      mockedGetWebAnimation.mockReturnValueOnce(group);

      const sequence = getSequence(options, [createAnimationGroupArgs(element, 'opts-effect')]);

      expect(sequence.delay).toBe(100);
      expect(sequence.offset).toBe(50);
      expect(sequence.offsetEasing(0.5)).toBe(0.25);
    });

    test('passes context.reducedMotion to getAnimation', () => {
      const element = document.createElement('div');
      const group = createGroup();
      mockedGetWebAnimation.mockReturnValueOnce(group);

      getSequence({}, [createAnimationGroupArgs(element, 'reduced-motion-effect')], {
        reducedMotion: true,
      });

      expect(mockedGetWebAnimation).toHaveBeenCalledWith(
        element,
        expect.objectContaining({ effectId: 'reduced-motion-effect' }),
        undefined,
        { reducedMotion: true },
      );
    });
  });

  describe('Edge cases', () => {
    test('skips entries where getAnimation returns non-AnimationGroup', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const validGroup = createGroup();
      mockedGetWebAnimation
        .mockReturnValueOnce({ play: vi.fn() } as any)
        .mockReturnValueOnce(validGroup);

      const sequence = getSequence({}, [
        createAnimationGroupArgs([el1, el2], 'mixed-results-effect'),
      ]);

      expect(sequence.animationGroups).toEqual([validGroup]);
      expect(mockedGetWebAnimation).toHaveBeenCalledTimes(2);
    });

    test('returns Sequence with empty groups when all entries fail', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      mockedGetWebAnimation.mockReturnValue(null);

      const sequence = getSequence({}, [createAnimationGroupArgs([el1, el2], 'all-fail-effect')]);

      expect(sequence.animationGroups).toEqual([]);
      expect(sequence.animations).toEqual([]);
      expect(mockedGetWebAnimation).toHaveBeenCalledTimes(2);
    });
  });

  describe('createAnimationGroups()', () => {
    test('creates AnimationGroup array from AnimationGroupArgs without creating Sequence', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const group1 = createGroup();
      const group2 = createGroup();
      mockedGetWebAnimation.mockReturnValueOnce(group1).mockReturnValueOnce(group2);

      const groups = createAnimationGroups([
        createAnimationGroupArgs(el1, 'effect-a'),
        createAnimationGroupArgs(el2, 'effect-b'),
      ]);

      expect(groups).toEqual([group1, group2]);
      expect(groups).toBeInstanceOf(Array);
      expect(mockedGetWebAnimation).toHaveBeenCalledTimes(2);
    });

    test('returns empty array when all entries produce non-AnimationGroup results', () => {
      const el1 = document.createElement('div');
      mockedGetWebAnimation.mockReturnValue(null);

      const groups = createAnimationGroups([createAnimationGroupArgs(el1, 'fail-effect')]);

      expect(groups).toEqual([]);
    });
  });
});
