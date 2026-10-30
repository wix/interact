import { EIGHT_DIRECTIONS } from '../../consts';
import type {
  AnimationExtraOptions,
  Cross,
  DomApi,
  EffectEightDirections,
  EffectFourDirections,
  OffsetByDirectionParams,
  TimeAnimationOptions,
} from '../../types';
import {
  getElementOffset,
  getTimingFactor,
  parseDirection,
  suffixCustomProperties,
  suffixNames,
  toKeyframeValue,
} from '../../utils';

const DEFAULTS: Required<Cross> = {
  type: 'Cross',
  direction: 'right',
  iterationDelay: 0,
};

export const schema = {
  direction: { type: 'enum', values: EIGHT_DIRECTIONS, default: DEFAULTS.direction },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
};

const FOUR_DIRECTIONS_TRANSLATIONS = {
  // 100cqw - left
  RIGHT: 'calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px))',
  // left * -1 - width
  LEFT: 'calc(var(--motion-left, 0px) * -1 - var(--motion-width, 100%))',
  // top * -1 - height
  TOP: 'calc(var(--motion-top, 0px) * -1 - var(--motion-height, 100%))',
  // 100cqh - top
  BOTTOM: 'calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px))',
};
const { RIGHT, LEFT, TOP, BOTTOM } = FOUR_DIRECTIONS_TRANSLATIONS;

const FOUR_CORNERS_TRANSLATIONS = {
  'top-left': {
    // min(100cqw - left, 100cqh - top)
    from: `min(${RIGHT}, ${BOTTOM})`,
    // min(abs(left * -1 - width), abs(top * -1 - height))
    to: `min(calc(${LEFT} * -1), calc(${TOP} * -1))`,
  },
  'top-right': {
    // min(abs(left * -1 - width), 100cqh - top)
    from: `min(calc(${LEFT} * -1), ${BOTTOM})`,
    // min(100cqw - left, abs(top * -1 - height))
    to: `min(${RIGHT}, calc(${TOP} * -1))`,
  },
  'bottom-left': {
    // min(100cqw - left, abs(top * -1 - height))
    from: `min(${RIGHT}, calc(${TOP} * -1))`,
    // min(abs(left * -1 - width), 100cqh - top)
    to: `min(calc(${LEFT} * -1), ${BOTTOM})`,
  },
  'bottom-right': {
    // min(abs(left * -1 - width), abs(top * -1 - height))
    from: `min(calc(${LEFT} * -1), calc(${TOP} * -1))`,
    // min(100cqw - left, 100cqh - top)
    to: `min(${RIGHT}, ${BOTTOM})`,
  },
};

const TRANSLATE_BY_DIRECTION_MAP = {
  left: {
    from: `${RIGHT}, 0px`,
    to: `${LEFT}, 0px`,
  },
  right: {
    from: `${LEFT}, 0px`,
    to: `${RIGHT}, 0px`,
  },
  top: {
    from: `0px, ${BOTTOM}`,
    to: `0px, ${TOP}`,
  },
  bottom: {
    from: `0px, ${TOP}`,
    to: `0px, ${BOTTOM}`,
  },
};

type Layout = OffsetByDirectionParams & { measured: boolean };

const SIDE_DISTANCES: Record<EffectFourDirections, (layout: Layout) => number> = {
  left: ({ left, width }) => left + width,
  right: ({ left, parentWidth }) => parentWidth - left,
  top: ({ top, height }) => top + height,
  bottom: ({ top, parentHeight }) => parentHeight - top,
};

const OPPOSITE_SIDES: Record<EffectFourDirections, EffectFourDirections> = {
  left: 'right',
  right: 'left',
  top: 'bottom',
  bottom: 'top',
};

function getDistance(layout: Layout, sides: EffectFourDirections[]) {
  return Math.min(...sides.map((side) => SIDE_DISTANCES[side](layout)));
}

// part of the motion until the element leaves its container, unmeasured sides are assumed equal
function getToOffset(direction: EffectEightDirections, layout?: Layout) {
  if (!layout?.measured) {
    return 0.5;
  }
  const sides = direction.split('-') as EffectFourDirections[];
  const to = getDistance(layout, sides);
  const from = getDistance(
    layout,
    sides.map((side) => OPPOSITE_SIDES[side]),
  );
  return to / (to + from || 1);
}

function measureLayout(dom?: DomApi) {
  const layout: Layout = {
    measured: false,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    parentWidth: 0,
    parentHeight: 0,
  };
  if (!dom) {
    return layout;
  }

  dom.measure((target) => {
    if (!target) {
      return;
    }

    const parent = target.offsetParent as HTMLElement;
    const offset = getElementOffset(target, parent);

    Object.assign(layout, {
      measured: true,
      left: offset.left,
      top: offset.top,
      width: target.offsetWidth,
      height: target.offsetHeight,
      parentWidth: parent?.offsetWidth || 0,
      parentHeight: parent?.offsetHeight || 0,
    });
  });

  dom.mutate((target) => {
    if (!target || !layout.measured) {
      return;
    }
    target.style.setProperty('--motion-left', `${layout.left}px`);
    target.style.setProperty('--motion-top', `${layout.top}px`);
    target.style.setProperty('--motion-width', `${layout.width}px`);
    target.style.setProperty('--motion-height', `${layout.height}px`);
    target.style.setProperty('--motion-parent-width', `${layout.parentWidth}px`);
    target.style.setProperty('--motion-parent-height', `${layout.parentHeight}px`);
  });

  return layout;
}

function generateTranslate(direction: keyof typeof FOUR_CORNERS_TRANSLATIONS) {
  const _from = FOUR_CORNERS_TRANSLATIONS[direction].from;
  const _to = FOUR_CORNERS_TRANSLATIONS[direction].to;
  const fromYFactor = direction.startsWith('top') ? 1 : -1;
  const toYFactor = -fromYFactor;
  const fromXFactor = direction.endsWith('left') ? 1 : -1;
  const toXFactor = -fromXFactor;

  return {
    from: `calc(${_from} * ${fromXFactor}), calc(${_from} * ${fromYFactor})`,
    to: `calc(${_to} * ${toXFactor}), calc(${_to} * ${toYFactor})`,
  };
}

export function prepare(_options: TimeAnimationOptions & AnimationExtraOptions, dom?: DomApi) {
  measureLayout(dom);
}

export function web(options: TimeAnimationOptions & AnimationExtraOptions, dom?: DomApi) {
  return style(options, true, measureLayout(dom));
}

export function style(
  options: TimeAnimationOptions & AnimationExtraOptions,
  asWeb = false,
  layout?: Layout,
) {
  const namedEffect = options.namedEffect as Cross;
  const direction = parseDirection(namedEffect?.direction, EIGHT_DIRECTIONS, DEFAULTS.direction);
  const duration = options.duration || 1;
  const { iterationDelay = DEFAULTS.iterationDelay } = namedEffect;
  const timingFactor = duration / (duration + iterationDelay);
  const [name] = getNames(options);

  const { from, to } =
    direction in TRANSLATE_BY_DIRECTION_MAP
      ? TRANSLATE_BY_DIRECTION_MAP[direction as keyof typeof TRANSLATE_BY_DIRECTION_MAP]
      : generateTranslate(direction as keyof typeof FOUR_CORNERS_TRANSLATIONS);
  const custom = { '--motion-cross-from': from, '--motion-cross-to': to };
  const transform = (translate: string) =>
    `translate(${translate}) rotate(var(--motion-rotate, 0deg))`;

  const animations = [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      custom,
      get keyframes() {
        const toOffset = getToOffset(direction, layout) * timingFactor;

        return [
          {
            offset: 0,
            transform: transform('0px, 0px'),
          },
          {
            offset: toOffset,
            transform: transform(toKeyframeValue(custom, '--motion-cross-to', asWeb) as string),
            easing: 'step-start',
          },
          {
            offset: toOffset,
            transform: transform(toKeyframeValue(custom, '--motion-cross-from', asWeb) as string),
          },
          {
            offset: timingFactor,
            transform: transform('0px, 0px'),
          },
          {
            offset: 1,
            transform: transform('0px, 0px'),
          },
        ];
      },
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Cross)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true) as string;

  return suffixNames([`motion-cross-${timingFactor}`], options.suffix);
}
