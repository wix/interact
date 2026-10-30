import { cssEasings, jsEasings } from '@wix/motion';
import type { LengthPercentage } from '@wix/motion';
import type { LengthInput, LengthValue, RangeOffset, ScrubAnimationOptions } from './types';
import type {
  EffectFourDirections,
  EffectScrollRange,
  Point,
  ScrubTransitionEasing,
  AnimationFillMode,
  TimeAnimationOptions,
} from '@wix/motion';

export type Direction =
  | 'initial'
  | 'top'
  | 'right'
  | 'center'
  | 'bottom'
  | 'left'
  | 'vertical'
  | 'horizontal';

/**
 * Map a value from one range 'a' to different range 'b'
 */
export function mapRange(
  sourceMin: number,
  sourceMax: number,
  targetMin: number,
  targetMax: number,
  num: number,
): number {
  return ((num - sourceMin) * (targetMax - targetMin)) / (sourceMax - sourceMin) + targetMin;
}

export function distance2d([x1, y1]: Point, [x2, y2]: Point): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function getAngleInDeg(p1: Point = [0, 0], p2: Point = [0, 0], offset: number = 0): number {
  const angle = (Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180) / Math.PI;
  return (360 + offset + angle) % 360;
}

type ClipPolygonTemplateParams = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  centerX: number;
  centerY: number;
  minimum: number;
};

const CLIP_POLYGON_TEMPLATES: Record<Direction, (params: ClipPolygonTemplateParams) => string> = {
  initial: ({ top, bottom, left, right }) =>
    `${left}% ${top}%, ${right}% ${top}%, ${right}% ${bottom}%, ${left}% ${bottom}%`,
  top: ({ top, left, right, minimum }) =>
    `${left}% ${top}%, ${right}% ${top}%, ${right}% ${top + minimum}%, ${left}% ${top + minimum}%`,
  right: ({ top, bottom, right, minimum }) =>
    `${right - minimum}% ${top}%, ${right}% ${top}%, ${right}% ${bottom}%, ${
      right - minimum
    }% ${bottom}%`,
  center: ({ centerX, centerY, minimum }) =>
    `${centerX - minimum / 2}% ${centerY - minimum / 2}%, ${
      centerX + minimum / 2
    }% ${centerY - minimum / 2}%, ${centerX + minimum / 2}% ${
      centerY + minimum / 2
    }%, ${centerX - minimum / 2}% ${centerY + minimum / 2}%`,
  bottom: ({ bottom, left, right, minimum }) =>
    `${left}% ${bottom - minimum}%, ${right}% ${
      bottom - minimum
    }%, ${right}% ${bottom}%, ${left}% ${bottom}%`,
  left: ({ top, bottom, left, minimum }) =>
    `${left}% ${top}%, ${left + minimum}% ${top}%, ${
      left + minimum
    }% ${bottom}%, ${left}% ${bottom}%`,
  vertical: ({ top, bottom, left, right, minimum }) =>
    `${left}% ${top + minimum / 2}%, ${right}% ${
      top + minimum / 2
    }%, ${right}% ${bottom - minimum / 2}%, ${left}% ${bottom - minimum / 2}%`,
  horizontal: ({ top, bottom, left, right, minimum }) =>
    `${left + minimum / 2}% ${top}%, ${right - minimum / 2}% ${top}%, ${
      right - minimum / 2
    }% ${bottom}%, ${left + minimum / 2}% ${bottom}%`,
};

export function getClipPolygonParams({
  direction,
  scaleX = 1,
  scaleY = 1,
  minimum = 0,
}: {
  direction: Direction;
  scaleX?: number;
  scaleY?: number;
  minimum?: number;
}) {
  const top = ((1 - scaleY) / 2) * 100;
  const left = ((1 - scaleX) / 2) * 100;
  const right = 100 + left - (1 - scaleX) * 100;
  const bottom = 100 + top - (1 - scaleY) * 100;
  const centerX = (right + left) / 2;
  const centerY = (bottom + top) / 2;

  return `polygon(${CLIP_POLYGON_TEMPLATES[direction]({
    top,
    bottom,
    left,
    right,
    centerX,
    centerY,
    minimum,
  })})`;
}

export const INITIAL_CLIP = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
export const FOUR_DIRECTIONS: EffectFourDirections[] = ['bottom', 'left', 'top', 'right'];

export function getOppositeDirection<T>(availableDirections: T[], direction: T) {
  const index = Math.max(0, availableDirections.indexOf(direction));
  const length = availableDirections.length;
  return availableDirections[(index + (length >> 1)) % length];
}

export function getRevealClipFrom(direction: EffectFourDirections, range: EffectScrollRange) {
  return range === 'out'
    ? INITIAL_CLIP
    : getClipPolygonParams({
        direction: getOppositeDirection(FOUR_DIRECTIONS, direction),
      });
}

export function getRevealClipTo(direction: EffectFourDirections, range: EffectScrollRange) {
  return range === 'in'
    ? INITIAL_CLIP
    : getClipPolygonParams({
        direction: range === 'out' ? getOppositeDirection(FOUR_DIRECTIONS, direction) : direction,
      });
}

export function transformPolarToXY(angle: number, distance: number) {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * distance;
  const y = Math.sin(radians) * distance;
  return [x, y];
}

export function getCssUnits(unit: 'percentage' | string) {
  return unit === 'percentage' ? '%' : unit || 'px';
}

export function getEasing(easing?: keyof typeof cssEasings | string): string {
  return easing ? cssEasings[easing as keyof typeof cssEasings] || easing : cssEasings.linear;
}

export function getJsEasing(
  easing?: keyof typeof jsEasings | string,
): ((t: number) => number) | undefined {
  return easing ? jsEasings[easing as keyof typeof jsEasings] : undefined;
}

export function getCssUnitValue(length: { value: number; unit: string }) {
  return `${length.value}${getCssUnits(length.unit)}`;
}

export function getEasingFamily(easing: string) {
  if (!cssEasings[easing as keyof typeof cssEasings]) {
    return {
      in: easing,
      inOut: easing,
      out: easing,
    };
  }

  const ease = easing.replace(/In|Out/g, '');
  if (ease === 'linear') {
    return {
      in: `linear`,
      inOut: `linear`,
      out: `linear`,
    };
  }

  return {
    in: `${ease}In`,
    inOut: `${ease}InOut`,
    out: `${ease}Out`,
  };
}

const MOUSE_TRANSITION_EASING_MAP: Record<ScrubTransitionEasing, string> = {
  linear: 'linear',
  easeOut: 'ease-out',
  hardBackOut: 'cubic-bezier(0.58, 2.5, 0, 0.95)',
  elastic:
    'linear( 0, 0.2178 2.1%, 1.1144 8.49%, 1.2959 10.7%, 1.3463 11.81%, 1.3705 12.94%, 1.3726, 1.3643 14.48%, 1.3151 16.2%, 1.0317 21.81%, 0.941 24.01%, 0.8912 25.91%, 0.8694 27.84%, 0.8698 29.21%, 0.8824 30.71%, 1.0122 38.33%, 1.0357, 1.046 42.71%, 1.0416 45.7%, 0.9961 53.26%, 0.9839 57.54%, 0.9853 60.71%, 1.0012 68.14%, 1.0056 72.24%, 0.9981 86.66%, 1 )',
  bounce:
    'linear( 0, 0.0039, 0.0157, 0.0352, 0.0625 9.09%, 0.1407, 0.25, 0.3908, 0.5625, 0.7654, 1, 0.8907, 0.8125 45.45%, 0.7852, 0.7657, 0.7539, 0.75, 0.7539, 0.7657, 0.7852, 0.8125 63.64%, 0.8905, 1 72.73%, 0.9727, 0.9532, 0.9414, 0.9375, 0.9414, 0.9531, 0.9726, 1, 0.9883, 0.9844, 0.9883, 1 )',
};

export function getMouseTransitionEasing(value?: ScrubTransitionEasing) {
  return (value && MOUSE_TRANSITION_EASING_MAP[value]) || 'linear';
}

export function deg2rad(angleInDeg: number): number {
  return (angleInDeg * Math.PI) / 180;
}

export function getEntranceFill(options: TimeAnimationOptions): AnimationFillMode {
  return options.fill ?? 'backwards';
}

export function getTransformParams(
  originDirection: { dx: number; dy: number },
  angleInRad: number,
  scale: number = 1,
) {
  const x = `calc(var(--motion-height, 100%) * ${
    scale * originDirection.dy * Math.sin(-angleInRad)
  } + var(--motion-width, 100%) * ${scale * originDirection.dx * Math.cos(angleInRad)})`;

  const y = `calc(var(--motion-height, 100%) * ${
    scale * originDirection.dy * Math.cos(-angleInRad)
  } + var(--motion-width, 100%) * ${scale * originDirection.dx * Math.sin(angleInRad)})`;

  return { x, y };
}

export function getOutOfScreenDistance(angle: number) {
  const angleInRad = (angle * Math.PI) / 180;
  const angleCos = Math.round(Math.cos(angleInRad) * 10) / 10;
  const angleSin = Math.round(Math.sin(angleInRad) * 10) / 10;

  // Calculate x and y direction based on angle
  const xDirection = Math.sign(angleCos);
  const yDirection = Math.sign(angleSin);
  const left = `var(--motion-left, 0px)`;
  const top = `var(--motion-top, 0px)`;

  // Calculate x and y distances between component and stage
  const xDistance = xDirection
    ? xDirection === -1
      ? `(-1 * ${left} - 100%)`
      : `(100vw - ${left})`
    : 0;
  const yDistance = yDirection
    ? yDirection === -1
      ? `(-1 * ${top} - 100%)`
      : `(100vh - ${top})`
    : 0;

  // Calculate hypotenuse
  let hypotenuse;
  const hypotX = `calc(${xDistance} / ${angleCos})`;
  const hypotY = `calc(${yDistance} / ${angleSin})`;

  if (!angleCos) {
    hypotenuse = hypotY;
  } else if (!angleSin) {
    hypotenuse = hypotX;
  } else {
    hypotenuse = `min(${hypotY}, ${hypotX})`;
  }

  return {
    x: `calc(${hypotenuse} * ${angleCos})`,
    y: `calc(${hypotenuse} * ${angleSin})`,
  };
}

export function keyframesToDuration(
  keyframes_translation: { keyframe: number }[],
  duration: number,
) {
  return keyframes_translation.map(({ keyframe }, idx) => {
    const stepDuration = keyframe - (idx > 0 ? keyframes_translation[idx - 1].keyframe : 0);
    return duration * (stepDuration / 100);
  });
}

export function getElementOffset(element: HTMLElement, parent?: HTMLElement) {
  let left = element.offsetLeft;
  let top = element.offsetTop;
  let offsetParent = element.offsetParent as HTMLElement;

  while (offsetParent) {
    if (parent && offsetParent === parent) {
      break;
    }

    left += offsetParent.offsetLeft;
    top += offsetParent.offsetTop;
    offsetParent = offsetParent.offsetParent as HTMLElement;
  }

  return { left, top };
}

const generateShuttersClipPath = (
  direction: EffectFourDirections,
  shutterCount: number,
  staggered: boolean,
) => {
  const isTopOrLeft = direction === 'top' || direction === 'left';
  const iterStart = isTopOrLeft ? shutterCount : 0;
  const iterEnd = isTopOrLeft ? 0 : shutterCount;
  const inc = isTopOrLeft ? -1 : 1;

  const isVerticalPath = direction === 'top' || direction === 'bottom';

  const clipPathStart = [];
  const clipPathEnd = [];

  for (let i = iterStart; i !== iterEnd; i += inc) {
    const shutterEndPosInPercentage = 100 * ((i + inc) / shutterCount);
    const clipStart = (100 * (i / shutterCount)) | 0;
    let clipEnd;

    if (staggered) {
      const staggerFactor = isTopOrLeft
        ? 1 + (shutterCount - i) / shutterCount
        : 1 + i / shutterCount;

      clipEnd = isTopOrLeft
        ? 100 - (100 - shutterEndPosInPercentage) * staggerFactor
        : shutterEndPosInPercentage * staggerFactor;
    } else {
      clipEnd = shutterEndPosInPercentage;
    }

    clipEnd |= 0;

    if (isVerticalPath) {
      clipPathStart.push(
        `0% ${clipStart}%, 100% ${clipStart}%, 100% ${clipStart}%, 0% ${clipStart}%`,
      );
      clipPathEnd.push(`0% ${clipStart}%, 100% ${clipStart}%, 100% ${clipEnd}%, 0% ${clipEnd}%`);
    } else {
      clipPathStart.push(
        `${clipStart}% 0%, ${clipStart}% 100%, ${clipStart}% 100%, ${clipStart}% 0%`,
      );
      clipPathEnd.push(`${clipStart}% 0%, ${clipStart}% 100%, ${clipEnd}% 100%, ${clipEnd}% 0%`);
    }
  }

  return { start: clipPathStart, end: clipPathEnd };
};

export function getShuttersClipPaths(
  direction: EffectFourDirections,
  shutterCount: number,
  staggered: boolean,
  reverse?: boolean,
) {
  const { start, end } = generateShuttersClipPath(direction, shutterCount, staggered);

  if (reverse) {
    start.reverse();
    end.reverse();
  }

  return {
    clipStart: `polygon(${start.join(', ')})`,
    clipEnd: `polygon(${end.join(', ')})`,
  };
}

export function roundNumber(num: number, precision = 2) {
  return parseFloat(num.toFixed(precision));
}

export function toKeyframeValue(
  custom: Record<string, string | number>,
  key: string,
  useValue: boolean | undefined = false,
  fallback: string | undefined = undefined,
) {
  return useValue ? custom[key] : `var(${key}${fallback !== undefined ? `, ${fallback}` : ''})`;
}

export function getTimingFactor(
  duration: number,
  delay: number,
  asString = false,
): number | string {
  const duration_ = duration || 1;
  const delay_ = delay || 0;
  const timingFactor = roundNumber(duration_ / (duration_ + delay_));
  return asString ? timingFactor.toString().replace(/\./g, '') : timingFactor;
}

const CSS_UNIT_REGEX = /^(-?\d*\.?\d+)(px|%|em|rem|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/i;

/**
 * Normalize unit string to internal format
 */
function normalizeUnit(unit: string): string {
  const lower = unit.toLowerCase();
  return lower === '%' ? 'percentage' : lower;
}

/**
 * Parse length value from number, string, or object format
 * @param input - Number, String (e.g., "100px", "50%", "100"), or object { value, type }
 * @param defaultValue - Fallback value if input is invalid
 * @returns Normalized length object { value, type }
 */
export function parseLength(input: LengthInput, defaultValue: LengthValue): LengthValue {
  if (input === undefined || input === null) {
    return defaultValue;
  }

  // Handle number input - use default unit type
  if (typeof input === 'number') {
    return { value: input, unit: defaultValue.unit };
  }

  // Handle object input { value, unit }
  if (typeof input === 'object' && 'value' in input && 'unit' in input) {
    const value = typeof input.value === 'string' ? parseFloat(input.value) : input.value;
    if (typeof value === 'number' && !isNaN(value) && typeof input.unit === 'string') {
      return { value, unit: normalizeUnit(input.unit) };
    }
    return defaultValue;
  }

  // Handle string input
  if (typeof input === 'string') {
    const trimmed = input.trim();

    // Try parsing as number + unit (e.g., "100px", "50%")
    const match = trimmed.match(CSS_UNIT_REGEX);
    if (match) {
      return { value: parseFloat(match[1]), unit: normalizeUnit(match[2]) };
    }

    // Try parsing as plain number string (e.g., "100", "100.5")
    if (trimmed !== '') {
      const numValue = Number(trimmed);
      if (!isNaN(numValue)) {
        return { value: numValue, unit: defaultValue.unit };
      }
    }
  }

  return defaultValue;
}

export type DirectionKeywords = readonly string[];

/**
 * Parse direction value from keyword, number (degrees), or string with "deg" suffix
 * @param input - String keyword, number, or "45deg" string
 * @param allowedKeywords - Array of valid keyword strings for this preset
 * @param defaultValue - Fallback value if input is invalid
 * @param acceptAngles - Whether to accept numeric angle values (default: false)
 * @returns Normalized direction value (number for angles, string for keywords)
 */
export function parseDirection<T extends string | number>(
  input: string | number | undefined,
  allowedKeywords: DirectionKeywords,
  defaultValue: T,
  acceptAngles = false,
): T {
  if (input === undefined || input === null) {
    return defaultValue;
  }

  if (typeof input === 'number') {
    return acceptAngles ? (input as T) : defaultValue;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim().toLowerCase();

    // Check if it's a valid keyword
    if (allowedKeywords.includes(trimmed)) {
      return trimmed as T;
    }

    if (acceptAngles) {
      // Check if it's a degree string (e.g., "45deg", "90DEG")
      const degMatch = trimmed.match(/^(-?\d*\.?\d+)deg$/i);
      if (degMatch) {
        return parseFloat(degMatch[1]) as T;
      }

      // Check if it's just a number as string
      if (trimmed !== '') {
        const numValue = Number(trimmed);
        if (!isNaN(numValue)) {
          return numValue as T;
        }
      }
    }
  }

  return defaultValue;
}

const CSS_UNIT_REGEX_NO_I = /^(-?\d*\.?\d+)(px|%|em|rem|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/;
export const CSS_CALC_REGEX = /^calc\(.*\)$/;
export const stripCalc = (str: string) => str.replace(/calc/g, '');

// should not be used to compare direction against preset's default because undefined !== <default>
export function compareKeywordToNonDefaults(direction: string | undefined, compare: string[]) {
  const normalized = direction?.trim().toLowerCase();
  return compare.some((keyword) => normalized === keyword);
}

export function parseLengthLazy(input: LengthInput, defaultValue: LengthValue) {
  const parsedLength = { ...defaultValue };

  if (typeof input === 'number') {
    parsedLength.value = input;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim().toLowerCase();
    if (CSS_CALC_REGEX.test(trimmed) || CSS_UNIT_REGEX_NO_I.test(trimmed)) {
      return trimmed;
    }
    if (trimmed && !isNaN(Number(trimmed))) {
      parsedLength.value = Number(trimmed);
    }
  }

  if (typeof input === 'object' && input !== null && 'value' in input && 'unit' in input) {
    const value = typeof input.value === 'string' ? parseFloat(input.value) : input.value;
    if (typeof value === 'number' && !isNaN(value) && typeof input.unit === 'string') {
      parsedLength.value = value;
      parsedLength.unit = input.unit.toLowerCase();
    }
  }

  return `${parsedLength.value}${getCssUnits(parsedLength.unit)}`;
}

export function parseKeywordLazy<T extends string>(
  input: string | number | undefined,
  allowedKeywords: readonly string[],
  defaultValue: T,
) {
  if (typeof input === 'string') {
    const trimmed = input.trim().toLowerCase();
    // Check if it's a valid keyword
    if (allowedKeywords.includes(trimmed)) {
      return trimmed as T;
    }
  }
  return defaultValue;
}

export function suffixNames(names: string[], suffix?: string) {
  return suffix ? names.map((name) => `${name}${suffix}`) : names;
}

type CSSValues = Record<string, string | number | undefined>;

/**
 * Suffixes the custom properties the animations declare, and their references, so animations of the same
 * preset in different keyframe slots of an element don't override each other's parameters.
 * Mutates the animations in place, keeping lazy `keyframes` getters lazy.
 */
export function suffixCustomProperties<T extends { custom?: CSSValues; keyframes: CSSValues[] }>(
  animations: T[],
  suffix?: string,
): T[] {
  const props = new Set(animations.flatMap(({ custom }) => Object.keys(custom || {})));
  if (!suffix || !props.size) {
    return animations;
  }

  const suffixValues = (values: CSSValues) =>
    Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        props.has(key) ? `${key}${suffix}` : key,
        typeof value === 'string'
          ? value.replace(/var\((--[\w-]+)(?=\s*[,)])/g, (match, prop) =>
              props.has(prop) ? `var(${prop}${suffix}` : match,
            )
          : value,
      ]),
    );

  animations.forEach((animation) => {
    if (animation.custom) {
      animation.custom = suffixValues(animation.custom);
    }
    const { get, value } = Object.getOwnPropertyDescriptor(animation, 'keyframes')!;
    Object.defineProperty(animation, 'keyframes', {
      ...(get
        ? { get: () => get.call(animation).map(suffixValues) }
        : { value: value.map(suffixValues), writable: true }),
      enumerable: true,
      configurable: true,
    });
  });

  return animations;
}

// scroll presets hold their rest state outside the scroll range, unless the user sets a fill
export function getScrollFill(options: { fill?: AnimationFillMode }, range: EffectScrollRange) {
  return (
    options.fill ?? (range === 'out' ? 'forwards' : range === 'continuous' ? 'both' : 'backwards')
  );
}

// fills in a partial range offset - a cover offset defaults to its place in the cover range, any other to 0
function completeRangeOffset(
  rangeOffset: Partial<RangeOffset>,
  defaultName: NonNullable<RangeOffset['name']>,
  coverValue: number,
) {
  const name = rangeOffset.name || defaultName;
  const unit = rangeOffset.offset?.unit || 'percentage';
  const value =
    rangeOffset.offset?.value ?? (name === 'cover' && unit === 'percentage' ? coverValue : 0);
  return {
    ...rangeOffset,
    name,
    offset: { ...rangeOffset.offset, unit, value } as LengthPercentage,
  };
}

// in: cover 0% - 50%, out: cover 50% - 100%, continuous: cover 0% - 100%
export function completeScrollOffsets(options: ScrubAnimationOptions, range: EffectScrollRange) {
  const startOffset = completeRangeOffset(
    options.startOffset ?? {},
    'cover',
    range === 'out' ? 50 : 0,
  );
  const endOffset = completeRangeOffset(
    options.endOffset ?? {},
    startOffset.name,
    range === 'in' ? 50 : 100,
  );
  return { startOffset, endOffset };
}

type ParallaxOffset = { percentage: number; vh: number; length?: LengthPercentage };

// a range offset as a sum of a percentage of the element, viewport heights and an absolute length
function toParallaxOffset({
  name,
  offset,
}: ReturnType<typeof completeRangeOffset>): ParallaxOffset {
  const { value, unit } = offset;
  const percentage = unit === 'percentage' ? value : 0;

  return {
    percentage: name === 'contain' ? 100 - percentage : percentage,
    vh:
      (unit === 'vh' ? value : 0) +
      (name.includes('entry') ? 0 : name.includes('exit') ? 100 : percentage),
    ...(unit !== 'percentage' && unit !== 'vh' && { length: offset }),
  };
}

function toLengthTerms(lengths: [number, LengthPercentage | undefined][]) {
  return lengths
    .filter(([, length]) => length?.value)
    .map(([factor, length]) => ` + ${factor * length!.value}${length!.unit}`)
    .join('');
}

function toOffsetAdd(vh: number, lengths: [number, LengthPercentage | undefined][]) {
  const terms = toLengthTerms(lengths);
  return terms ? `calc(${vh}vh${terms})` : `${vh}vh`;
}

// widens the scroll range by 1 / speed around center, and translates the element against it to move at speed
// center defaults to the element's rest state: the end of 'in', the start of 'out' and the middle of 'continuous'
export function getScrollParallax(
  options: ScrubAnimationOptions,
  range: EffectScrollRange,
  speed: number,
  center: number = range === 'continuous' ? 0.5 : range === 'out' ? 0 : 1,
) {
  const offsets = completeScrollOffsets(options, range);
  const start = toParallaxOffset(offsets.startOffset);
  const end = toParallaxOffset(offsets.endOffset);
  const factor = 1 - 1 / Math.max(speed, 0.01);
  const startFactor = center * factor;
  const endFactor = (1 - center) * factor;
  const travel = `(${end.percentage - start.percentage}% + ${end.vh - start.vh}vh${toLengthTerms([
    [1, end.length],
    [-1, start.length],
  ])})`;

  return {
    startOffset: {
      name: 'entry-crossing' as const,
      offset: {
        value: start.percentage + startFactor * (end.percentage - start.percentage),
        unit: 'percentage' as const,
      },
    },
    startOffsetAdd: toOffsetAdd(start.vh + startFactor * (end.vh - start.vh), [
      [startFactor, end.length],
      [1 - startFactor, start.length],
    ]),
    endOffset: {
      name: 'entry-crossing' as const,
      offset: {
        value: end.percentage + endFactor * (start.percentage - end.percentage),
        unit: 'percentage' as const,
      },
    },
    endOffsetAdd: toOffsetAdd(end.vh + endFactor * (start.vh - end.vh), [
      [1 - endFactor, end.length],
      [endFactor, start.length],
    ]),
    from: `calc(${startFactor} * ${travel})`,
    to: `calc(${startFactor - factor} * ${travel})`,
  };
}
