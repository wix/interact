import { describe, expect, test } from 'vitest';

import type { MotionRange } from '../presetUtils';
import { CENTER_AND_FOUR_DIRECTIONS, FOUR_CORNERS_DIRECTIONS } from '../consts';
import { angleDirection, axisDirection, sideDirection, spinDirection } from '../directions';
import { entranceGroup } from '../entranceGroup';
import { ongoingGroup } from '../ongoingGroup';
import { parallaxScrollGroup, scrollGroup } from '../scrollGroup';
import type { Parallax } from '../parallaxUtils';
import { createParallax } from '../parallaxUtils';
import {
  useBasicPreset,
  useDirectionalPreset,
  useDirectionalPresetAsBasic,
  withSharedScrollRange,
} from '../presetUtils';

const basicPreset = (params: any) => ({ name: 'basic', keyframes: [], params });

function capture() {
  const calls: { motionRange: MotionRange; params: any }[] = [];
  const preset = (motionRange: MotionRange, params: any) => {
    calls.push({ motionRange: { ...motionRange }, params });
    return { name: 'directional', keyframes: [] };
  };
  return { preset, last: () => calls[calls.length - 1] };
}

const cover = (value: number) => ({ name: 'cover', offset: { value, unit: 'percentage' } });

describe('useBasicPreset', () => {
  test('passes the named effect to the preset and spreads options and overrides', () => {
    const result: any = useBasicPreset(
      basicPreset,
      { duration: 500, namedEffect: { type: 'FadeIn' } } as any,
      entranceGroup,
    );
    expect(result.name).toBe('basic');
    expect(result.duration).toBe(500);
    expect(result.params).toEqual({ type: 'FadeIn' });
  });

  describe('entrance', () => {
    test('defaults fill to backwards and keeps the user easing', () => {
      const result: any = useBasicPreset(
        basicPreset,
        { easing: 'sineIn', namedEffect: { type: 'X' } } as any,
        entranceGroup,
      );
      expect(result.fill).toBe('backwards');
      expect(result.easing).toBe('sineIn');
    });

    test('keeps an explicit fill', () => {
      const result: any = useBasicPreset(
        basicPreset,
        { fill: 'both', namedEffect: { type: 'X' } } as any,
        entranceGroup,
      );
      expect(result.fill).toBe('both');
    });
  });

  describe('scroll', () => {
    const scroll = (range?: string, parsingOptions = {}, options = {}) =>
      useBasicPreset(
        basicPreset,
        { easing: 'user-easing', namedEffect: { type: 'X', range }, ...options } as any,
        scrollGroup,
        true,
        '',
        parsingOptions,
      ) as any;

    test('in: fill backwards, cover 0% - 50%, preset easing', () => {
      const result = scroll('in', { easing: 'sineOut' });
      expect(result.fill).toBe('backwards');
      expect(result.reversed).toBeUndefined();
      expect(result.startOffset).toEqual(cover(0));
      expect(result.endOffset).toEqual(cover(50));
      expect(result.easing).toBe('cubic-bezier(0.39, 0.575, 0.565, 1)');
    });

    test('ignores the user easing', () => {
      expect(scroll('in').easing).toBe('linear');
    });

    test('out: reversed, fill forwards, cover 50% - 100%', () => {
      const result = scroll('out');
      expect(result.fill).toBe('forwards');
      expect(result.reversed).toBe(true);
      expect(result.startOffset).toEqual(cover(50));
      expect(result.endOffset).toEqual(cover(100));
    });

    test('out: flips an already reversed animation', () => {
      expect(scroll('out', {}, { reversed: true }).reversed).toBe(false);
    });

    test('out: uses easing as is, or mirrors outEasing since it is played reversed', () => {
      expect(scroll('out', { easing: 'ease-in' }).easing).toBe('cubic-bezier(0.42, 0, 1, 1)');
      expect(scroll('out', { easing: 'ease-in', outEasing: 'ease-out' }).easing).toBe(
        'cubic-bezier(0.42, 0, 1, 1)',
      );
      expect(scroll('out', { outEasing: 'ease-in' }).easing).toBe('cubic-bezier(0, 0, 0.58, 1)');
    });

    test('continuous: fill both, cover 0% - 100%, back-and-forth easing', () => {
      const result = scroll('continuous');
      expect(result.fill).toBe('both');
      expect(result.startOffset).toEqual(cover(0));
      expect(result.endOffset).toEqual(cover(100));
      expect(result.easing).toBe('linear(0 0%, 1 50%, 1 50%, 0 100%)');
    });

    test('continuous: continuousEasing overrides easing and continuousHold holds in the middle', () => {
      const result = scroll('continuous', {
        easing: 'sineOut',
        continuousEasing: 'linear',
        continuousHold: 0.2,
      });
      expect(result.easing).toBe('linear(0 0%, 1 40%, 1 60%, 0 100%)');
    });

    test('invalid range falls back to the default range', () => {
      const result = useBasicPreset(
        basicPreset,
        { namedEffect: { type: 'X', range: 'nope' } } as any,
        scrollGroup,
        true,
        '',
        { defaultRange: 'out' },
      ) as any;
      expect(result.reversed).toBe(true);
    });

    test('completes partial user offsets', () => {
      const result = scroll(
        'out',
        {},
        { startOffset: { name: 'cover' }, endOffset: { offset: { value: 80 } } },
      );
      expect(result.startOffset).toEqual(cover(50));
      expect(result.endOffset).toEqual(cover(80));
    });

    test('non-cover ranges default to 0% and the end range name to the start one', () => {
      const result = scroll('in', {}, { startOffset: { name: 'contain' }, endOffset: {} });
      expect(result.startOffset).toEqual({
        name: 'contain',
        offset: { value: 0, unit: 'percentage' },
      });
      expect(result.endOffset).toEqual({
        name: 'contain',
        offset: { value: 0, unit: 'percentage' },
      });
    });
  });

  describe('ongoing', () => {
    const ongoing = (namedEffect: any, parsingOptions = {}, options = {}) =>
      useBasicPreset(
        basicPreset,
        {
          duration: 1000,
          easing: 'user-easing',
          namedEffect: { type: 'X', ...namedEffect },
          ...options,
        } as any,
        ongoingGroup,
        true,
        '',
        parsingOptions,
      ) as any;

    test('does not override fill', () => {
      expect(ongoing({}).fill).toBeUndefined();
      expect(ongoing({}, {}, { fill: 'forwards' }).fill).toBe('forwards');
    });

    test('easing is linear without a loop', () => {
      expect(ongoing({}).easing).toBe('linear');
    });

    test('iterationDelay stretches the duration and holds rest at the end of the loop easing', () => {
      const result = ongoing(
        { iterationDelay: 1000 },
        {
          loop: {
            shape: [
              [0, 0],
              [1, 0.5],
              [0, 1],
            ],
          },
        },
      );
      expect(result.duration).toBe(2000);
      expect(result.easing).toBe('linear(1 0%, 0 25%, 0 25%, 1 50%, 1 100%)');
    });
  });
});

describe('useDirectionalPreset', () => {
  const run = (group: any, namedEffect: any, parsingOptions: any = {}, options: any = {}) => {
    const { preset, last } = capture();
    const result: any = useDirectionalPreset(
      preset,
      { namedEffect: { type: 'X', ...namedEffect }, ...options } as any,
      group,
      { directionType: axisDirection, ...parsingOptions },
    );
    return { result, ...last() };
  };

  describe('four-sides', () => {
    const sides = { directionType: sideDirection };

    test('entrance starts at the `from` side', () => {
      expect(run(entranceGroup, { from: 'left' }, sides).motionRange).toEqual({
        fromSign: -1,
        toSign: 0,
        vertical: false,
        movementAngle: '0deg',
      });
      expect(run(entranceGroup, { from: 'right' }, sides).motionRange.fromSign).toBe(1);
      expect(run(entranceGroup, { from: 'bottom' }, sides).motionRange).toEqual({
        fromSign: 1,
        toSign: 0,
        vertical: true,
        movementAngle: '90deg',
      });
    });

    test('entrance falls back to the default direction', () => {
      expect(
        run(entranceGroup, { from: 'nope' }, { ...sides, defaultDirection: 'top' }).motionRange,
      ).toMatchObject({
        fromSign: -1,
        vertical: true,
      });
    });

    test('scroll moves towards `direction`', () => {
      expect(run(scrollGroup, { direction: 'right' }, sides).motionRange).toMatchObject({
        fromSign: -1,
        toSign: 0,
      });
      expect(run(scrollGroup, { direction: 'top' }, sides).motionRange).toMatchObject({
        fromSign: 1,
        vertical: true,
      });
    });

    test('scroll out is the opposite direction reversed', () => {
      const { motionRange, result } = run(scrollGroup, { direction: 'right', range: 'out' }, sides);
      expect(motionRange).toMatchObject({ fromSign: 1, toSign: 0, movementAngle: '0deg' });
      expect(result.reversed).toBe(true);
    });

    test('scroll continuous ends at the opposite sign', () => {
      expect(
        run(scrollGroup, { direction: 'right', range: 'continuous' }, sides).motionRange,
      ).toMatchObject({
        fromSign: -1,
        toSign: 1,
      });
      expect(
        run(scrollGroup, { direction: 'left', range: 'continuous' }, sides).motionRange,
      ).toMatchObject({
        fromSign: 1,
        toSign: -1,
      });
    });

    test('scroll continuous directional linear easing stays linear', () => {
      expect(
        run(scrollGroup, { direction: 'right', range: 'continuous' }, sides).result.easing,
      ).toBe('linear');
    });

    test('ongoing keyframes start at the peak towards `direction`', () => {
      expect(run(ongoingGroup, { direction: 'right' }, sides).motionRange).toMatchObject({
        fromSign: 1,
        movementAngle: '0deg',
      });
    });
  });

  describe('axis', () => {
    test('vertical and horizontal', () => {
      expect(run(entranceGroup, { direction: 'vertical' }).motionRange).toEqual({
        fromSign: -1,
        toSign: 0,
        vertical: true,
        movementAngle: '90deg',
      });
      expect(run(entranceGroup, { direction: 'horizontal' }).motionRange).toMatchObject({
        vertical: false,
        movementAngle: '0deg',
      });
    });

    test('defaults to vertical and is not flipped by group or out', () => {
      expect(run(entranceGroup, {}).motionRange.vertical).toBe(true);
      expect(run(ongoingGroup, { direction: 'horizontal' }).motionRange).toMatchObject({
        fromSign: -1,
        vertical: false,
      });
      expect(run(scrollGroup, { direction: 'horizontal', range: 'out' }).motionRange).toMatchObject(
        {
          fromSign: -1,
          vertical: false,
        },
      );
    });
  });

  describe('spin', () => {
    const spin = { directionType: spinDirection };

    test('clockwise starts negative, counter-clockwise positive, no movement angle', () => {
      expect(run(entranceGroup, { direction: 'clockwise' }, spin).motionRange).toEqual({
        fromSign: -1,
        toSign: 0,
        vertical: false,
        movementAngle: '0deg',
      });
      expect(
        run(entranceGroup, { direction: 'counter-clockwise' }, spin).motionRange.fromSign,
      ).toBe(1);
    });

    test('is not flipped for entrance or ongoing, only for scroll out', () => {
      expect(run(ongoingGroup, { direction: 'clockwise' }, spin).motionRange.fromSign).toBe(-1);
      expect(
        run(scrollGroup, { direction: 'clockwise', range: 'out' }, spin).motionRange.fromSign,
      ).toBe(1);
    });
  });

  describe('angle', () => {
    const angle = { directionType: angleDirection };

    test('scroll uses numeric and css angles as is', () => {
      expect(run(scrollGroup, { direction: 45 }, angle).motionRange).toMatchObject({
        fromSign: -1,
        movementAngle: '45deg',
      });
      expect(run(scrollGroup, { direction: '0.5turn' }, angle).motionRange.movementAngle).toBe(
        '0.5turn',
      );
      expect(run(scrollGroup, { direction: '30' }, angle).motionRange.movementAngle).toBe('30deg');
      expect(
        run(scrollGroup, { direction: 'calc(10deg + 5deg)' }, angle).motionRange.movementAngle,
      ).toBe('calc(10deg + 5deg)');
    });

    test('entrance `from` angle is turned around', () => {
      expect(run(entranceGroup, { from: 45 }, angle).motionRange.movementAngle).toBe(
        'calc(180deg + 45deg)',
      );
    });

    test('accepts side keywords', () => {
      expect(run(entranceGroup, { from: 'left' }, angle).motionRange).toMatchObject({
        fromSign: -1,
        movementAngle: '0deg',
      });
    });

    test('falls back to the default angle', () => {
      expect(
        run(scrollGroup, { direction: 'nope' }, { ...angle, defaultDirection: 90 }).motionRange
          .movementAngle,
      ).toBe('90deg');
    });
  });

  describe('params', () => {
    test('parses travel and depth with defaults', () => {
      expect(run(entranceGroup, {}).params).toMatchObject({
        travel: '0px',
        depth: '0px',
        toTravel: undefined,
      });
      expect(run(entranceGroup, { travel: 50, depth: '20%' }).params).toMatchObject({
        travel: '50px',
        depth: '20%',
      });
      expect(
        run(
          entranceGroup,
          {},
          { defaultTravel: { value: 10, unit: 'vh' }, defaultDepth: { value: 5, unit: 'px' } },
        ).params,
      ).toMatchObject({ travel: '10vh', depth: '5px' });
    });

    test('keeps the other named effect params', () => {
      expect(run(entranceGroup, { angle: 30 }).params.angle).toBe(30);
    });

    test('swaps travel and toTravel on out', () => {
      expect(run(scrollGroup, { travel: '10px', toTravel: '20px' }).params).toMatchObject({
        travel: '10px',
        toTravel: '20px',
      });
      expect(
        run(scrollGroup, { travel: '10px', toTravel: '20px', range: 'out' }).params,
      ).toMatchObject({
        travel: '20px',
        toTravel: '10px',
      });
      expect(run(scrollGroup, { travel: '10px', range: 'out' }).params).toMatchObject({
        travel: '10px',
        toTravel: undefined,
      });
    });

    test('maps the pivot to a transform origin', () => {
      expect(run(entranceGroup, {}).params.transformOrigin).toEqual({ x: '0px', y: '0px' });
      expect(run(entranceGroup, { pivot: 'top-left' }).params.transformOrigin).toEqual({
        x: '-50%',
        y: '-50%',
      });
      expect(run(entranceGroup, { pivot: 'bottom-right' }).params.transformOrigin).toEqual({
        x: '50%',
        y: '50%',
      });
      expect(run(entranceGroup, { pivot: 'right' }).params.transformOrigin).toEqual({
        x: '50%',
        y: '0px',
      });
    });

    test('limits the pivot to the given pivots', () => {
      expect(
        run(entranceGroup, { pivot: 'top-left' }, { pivots: CENTER_AND_FOUR_DIRECTIONS }).params
          .transformOrigin,
      ).toEqual({
        x: '0px',
        y: '0px',
      });
      expect(
        run(
          entranceGroup,
          { pivot: 'top' },
          { pivots: FOUR_CORNERS_DIRECTIONS, defaultPivot: 'bottom-left' },
        ).params.transformOrigin,
      ).toEqual({ x: '-50%', y: '50%' });
      expect(
        run(entranceGroup, { pivot: 'top' }, { pivots: CENTER_AND_FOUR_DIRECTIONS }).params
          .transformOrigin,
      ).toEqual({
        x: '0px',
        y: '-50%',
      });
    });
  });

  describe('parallax', () => {
    const apply = (parallax: Parallax) => {
      const custom = {};
      const rangeOffsets = parallax(custom, '--p');
      return { custom, rangeOffsets };
    };

    test('defaults the center by range and spans the scroll range', () => {
      expect(apply(run(parallaxScrollGroup, { parallax: { speed: 2 } }).params.parallax)).toEqual(
        apply(createParallax({ startOffset: cover(0), endOffset: cover(50) } as any, false, 2, 1)),
      );
      expect(
        apply(
          run(parallaxScrollGroup, { parallax: { speed: 2 }, range: 'continuous' }).params.parallax,
        ),
      ).toEqual(
        apply(
          createParallax({ startOffset: cover(0), endOffset: cover(100) } as any, false, 2, 0.5),
        ),
      );
      expect(
        apply(run(parallaxScrollGroup, { parallax: { speed: 2 }, range: 'out' }).params.parallax),
      ).toEqual(
        apply(createParallax({ startOffset: cover(50), endOffset: cover(100) } as any, true, 2, 0)),
      );
    });

    test('keeps an explicit center', () => {
      expect(
        apply(run(parallaxScrollGroup, { parallax: { speed: 2, center: 0.3 } }).params.parallax),
      ).toEqual(
        apply(
          createParallax({ startOffset: cover(0), endOffset: cover(50) } as any, false, 2, 0.3),
        ),
      );
    });

    test('is applied only by the parallax scroll group', () => {
      expect(run(scrollGroup, { parallax: { speed: 2 } }).params.parallax).toEqual({ speed: 2 });
      expect(run(entranceGroup, { parallax: { speed: 2 } }).params.parallax).toEqual({ speed: 2 });
    });
  });
});

describe('useDirectionalPresetAsBasic', () => {
  test('always uses a fixed motion range and normalized params', () => {
    const { preset, last } = capture();
    useDirectionalPresetAsBasic(
      preset,
      { namedEffect: { type: 'X', range: 'out', pivot: 'top', scale: 2 } } as any,
      scrollGroup,
      {},
    );
    expect(last().motionRange).toEqual({
      fromSign: -1,
      toSign: 0,
      movementAngle: '90deg',
      vertical: true,
    });
    expect(last().params).toMatchObject({ scale: 2, transformOrigin: { x: '0px', y: '-50%' } });
  });

  test('uses non-directional continuous easing', () => {
    const { preset } = capture();
    const result: any = useDirectionalPresetAsBasic(
      preset,
      { namedEffect: { type: 'X', range: 'continuous' } } as any,
      scrollGroup,
      {},
    );
    expect(result.easing).toBe('linear(0 0%, 1 50%, 1 50%, 0 100%)');
  });
});

describe('withSharedScrollRange', () => {
  test('copies the defined scroll range keys of the first animation to the rest', () => {
    const [first, second, third]: any[] = withSharedScrollRange([
      { keyframes: [], startOffset: cover(10), endOffset: cover(90), startOffsetAdd: '5vh' } as any,
      { keyframes: [], startOffset: cover(0), endOffset: cover(100), endOffsetAdd: '1px' } as any,
      { keyframes: [], name: 'third' } as any,
    ]);
    expect(first.startOffset).toEqual(cover(10));
    expect(second).toMatchObject({
      startOffset: cover(10),
      endOffset: cover(90),
      startOffsetAdd: '5vh',
      endOffsetAdd: '1px',
    });
    expect(third).toMatchObject({
      name: 'third',
      startOffset: cover(10),
      endOffset: cover(90),
      startOffsetAdd: '5vh',
    });
    expect('endOffsetAdd' in third).toBe(false);
  });
});
