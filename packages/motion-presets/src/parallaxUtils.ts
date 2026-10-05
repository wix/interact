import type { Length } from '@wix/motion';
import type { RangeOffset } from './types';
import { declareCustom, mapRange } from './utils';

const EPSILON = 0.01;

type ParallaxRange = { startOffset: Required<RangeOffset>; endOffset: Required<RangeOffset> };

// the parallax of a transform layer - declares the layer's parallax custom properties and returns its widened scroll range
export type Parallax = (
  custom: Record<string, number | string>,
  prefix: string,
  asWeb?: boolean,
) => ReturnType<typeof scaleVhPercentageRangeAroundCenter>;

function rangeOffsetToVhPercentageSum({ name, offset }: Required<RangeOffset>) {
  const { unit = 'percentage', value = 0 } = offset;
  const isPercentage = unit === 'percentage';
  const isVH = unit === 'vh';
  const rangePercentage = isPercentage ? value : 0;

  const percentage = name === 'contain' ? 100 - rangePercentage : rangePercentage;
  const vh =
    (isVH ? value : 0) +
    (name.includes('entry') ? 0 : name.includes('exit') ? 100 : rangePercentage);

  return { percentage, vh, ...(!isPercentage && !isVH && { absoluteOffset: { value, unit } }) };
}

function lengthsLinearCombination(a1: number, a2: number, l1?: Length, l2?: Length) {
  if (l1?.value) {
    const l2Copy = l2 || { value: 0, unit: l1.unit };
    if (l1.unit === l2Copy.unit || l2Copy.value === 0) {
      return `${a1 * l1.value + a2 * l2Copy.value}${l1.unit}`;
    } else {
      return `calc(${a1 * l1.value}${l1.unit} + ${a2 * l2Copy.value}${l2Copy.unit})`;
    }
  } else if (l2?.value) {
    return `${a2 * l2.value}${l2.unit}`;
  }
  return '';
}

function scaleVhPercentageRangeAroundCenter(
  start: ReturnType<typeof rangeOffsetToVhPercentageSum>,
  end: ReturnType<typeof rangeOffsetToVhPercentageSum>,
  scale: number,
  center: number,
) {
  const startOffsetFactor = center * (1 - scale);
  const endOffsetFactor = (1 - center) * (1 - scale);

  const rangeOffsets = {
    startOffset: {
      name: 'entry-crossing' as const,
      offset: {
        value: mapRange(0, 1, start.percentage, end.percentage, startOffsetFactor),
        unit: 'percentage' as const,
      },
    },
    startOffsetAdd: `${mapRange(0, 1, start.vh, end.vh, startOffsetFactor)}vh`,
    endOffset: {
      name: 'entry-crossing' as const,
      offset: {
        value: mapRange(0, 1, end.percentage, start.percentage, endOffsetFactor),
        unit: 'percentage' as const,
      },
    },
    endOffsetAdd: `${mapRange(0, 1, end.vh, start.vh, endOffsetFactor)}vh`,
  };

  const startAbsoluteAdd = lengthsLinearCombination(
    startOffsetFactor,
    1 - startOffsetFactor,
    end.absoluteOffset,
    start.absoluteOffset,
  );
  const endOAbsoluteAdd = lengthsLinearCombination(
    1 - endOffsetFactor,
    endOffsetFactor,
    end.absoluteOffset,
    start.absoluteOffset,
  );

  if (startAbsoluteAdd) {
    rangeOffsets.startOffsetAdd = `calc(${rangeOffsets.startOffsetAdd} + ${startAbsoluteAdd})`;
  }
  if (endOAbsoluteAdd) {
    rangeOffsets.endOffsetAdd = `calc(${rangeOffsets.endOffsetAdd} + ${endOAbsoluteAdd})`;
  }

  return rangeOffsets;
}

// This parallax is made for small components - for elements larger than viewport `entry`, `exit` and `contain`
// behave differently and will create speed and center to drift as computations here are made assuming the behavior
// for elements smaller than the viewport.
// It is possible to support those to using calcs with min(1%, 1vh) (or max) but that requires support for those
// in both fizban and out JS implementation (currently sets rangeOffsets as strings on the animation if no CSS animation
// which is not formally supported with calc - could move to implementation that uses CSS.add/sub() with CSS.percent/px() etc).
function computeParallax(
  range: ParallaxRange,
  reversed: boolean,
  speed: number = 1,
  center: number = 0.5,
  custom: Record<string, number | string>,
  prefix: string,
  asWeb: boolean = false,
) {
  const { startOffset, endOffset } = range;
  const end = rangeOffsetToVhPercentageSum(endOffset);
  const start = rangeOffsetToVhPercentageSum(startOffset);

  const invSpeed = 1 / Math.max(speed, EPSILON);
  const c = Math.min(1, Math.max(0, center));

  const rangeOffsets = scaleVhPercentageRangeAroundCenter(start, end, invSpeed, c);

  const absoluteTravel = lengthsLinearCombination(1, -1, end.absoluteOffset, start.absoluteOffset);
  const percentageTravel = `${end.percentage - start.percentage}%`;
  const vhTravel = `${end.vh - start.vh}vh`;
  const travel = `(${percentageTravel} + ${vhTravel}${absoluteTravel ? ` + ${absoluteTravel}` : ''})`;

  const { custom: parallaxCustom, vars } = declareCustom(
    `${prefix}-parallax`,
    {
      center: [c, '0.5'],
      'inv-speed': [invSpeed, '1'],
      travel: [travel, '0px'],
    },
    asWeb,
  );
  Object.assign(custom, parallaxCustom);

  const from = `calc(${vars.center} * (1 - ${vars['inv-speed']}) * ${vars.travel})`;
  const to = `calc((${vars.center} - 1) * (1 - ${vars['inv-speed']}) * ${vars.travel})`;
  custom[`${prefix}-parallax-from`] = reversed ? to : from;
  custom[`${prefix}-parallax-to`] = reversed ? from : to;

  return rangeOffsets;
}

export function createParallax(
  range: ParallaxRange,
  reversed: boolean,
  speed?: number,
  center?: number,
): Parallax {
  return (custom, prefix, asWeb) =>
    computeParallax(range, reversed, speed, center, custom, prefix, asWeb);
}
