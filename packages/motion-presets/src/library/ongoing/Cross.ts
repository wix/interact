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
import { getElementOffset, getTimingFactor, parseDirection } from '../../utils';

export const schema = {
  direction: { type: 'enum', values: EIGHT_DIRECTIONS, default: 'right' },
  iterationDelay: { type: 'number', min: 0, default: 0 },
} as const;

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
    from: `${RIGHT} 0`,
    to: `${LEFT} 0`,
  },
  right: {
    from: `${LEFT} 0`,
    to: `${RIGHT} 0`,
  },
  top: {
    from: `0 ${BOTTOM}`,
    to: `0 ${TOP}`,
  },
  bottom: {
    from: `0 ${TOP}`,
    to: `0 ${BOTTOM}`,
  },
};

const SIDE_DISTANCE: Record<EffectFourDirections, (params: OffsetByDirectionParams) => number> = {
  left: ({ left, width }) => left + width,
  right: ({ left, parentWidth }) => parentWidth - left,
  top: ({ top, height }) => top + height,
  bottom: ({ top, parentHeight }) => parentHeight - top,
};

const OPPOSITE_SIDE: Record<EffectFourDirections, EffectFourDirections> = {
  left: 'right',
  right: 'left',
  top: 'bottom',
  bottom: 'top',
};

function getDistance(sides: EffectFourDirections[], params: OffsetByDirectionParams) {
  return Math.min(...sides.map((side) => SIDE_DISTANCE[side](params)));
}

function getOffsetByDirection(direction: EffectEightDirections, params: OffsetByDirectionParams) {
  const sides = direction.split('-') as EffectFourDirections[];
  const toDistance = getDistance(sides, params);
  const fromDistance = getDistance(
    sides.map((side) => OPPOSITE_SIDE[side]),
    params,
  );

  return toDistance / (toDistance + fromDistance || 1);
}

function generateTranslate(direction: keyof typeof FOUR_CORNERS_TRANSLATIONS) {
  const _from = FOUR_CORNERS_TRANSLATIONS[direction].from;
  const _to = FOUR_CORNERS_TRANSLATIONS[direction].to;
  const fromYFactor = direction.startsWith('top') ? 1 : -1;
  const toYFactor = -fromYFactor;
  const fromXFactor = direction.endsWith('left') ? 1 : -1;
  const toXFactor = -fromXFactor;

  return {
    from: `calc(${_from} * ${fromXFactor}) calc(${_from} * ${fromYFactor})`,
    to: `calc(${_to} * ${toXFactor}) calc(${_to} * ${toYFactor})`,
  };
}

export function web(options: TimeAnimationOptions & AnimationExtraOptions, dom?: DomApi) {
  const namedEffect = options.namedEffect as Cross;
  const direction = parseDirection<EffectEightDirections>(
    namedEffect?.direction,
    EIGHT_DIRECTIONS,
    schema.direction.default,
  );
  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  // Create CSS custom properties for the Cross configuration
  const custom: Record<string, string | number> = {
    '--motion-left': '0px',
    '--motion-top': '0px',
    '--motion-width': '100%',
    '--motion-height': '100%',
    '--motion-parent-width': '100vw',
    '--motion-parent-height': '100vh',
  };

  let from, to;
  if (direction in TRANSLATE_BY_DIRECTION_MAP) {
    from = TRANSLATE_BY_DIRECTION_MAP[direction as keyof typeof TRANSLATE_BY_DIRECTION_MAP].from;
    to = TRANSLATE_BY_DIRECTION_MAP[direction as keyof typeof TRANSLATE_BY_DIRECTION_MAP].to;
  } else {
    const cornerFromTo = generateTranslate(direction as keyof typeof FOUR_CORNERS_TRANSLATIONS);
    from = cornerFromTo.from;
    to = cornerFromTo.to;
  }

  const keyframes = [
    {
      offset: 0,
      translate: '0 0',
    },
    {
      offset: 0,
      translate: to,
      easing: 'step-start',
    },
    {
      offset: 0,
      translate: from,
    },
    {
      offset: timingFactor,
      translate: '0 0',
    },
    {
      offset: 1,
      translate: '0 0',
    },
  ];

  let left = 0;
  let top = 0;
  let width = 0;
  let height = 0;
  let parentWidth = 0;
  let parentHeight = 0;

  if (dom) {
    // @wix/motion reads the keyframes before measuring, so the wrap offset is updated in place
    dom.measure((target) => {
      if (!target) {
        return;
      }

      const { width: targetWidth, height: targetHeight } = target.getBoundingClientRect();
      const parent = target.offsetParent as HTMLElement;
      const parentRect = parent?.getBoundingClientRect() || ({} as DOMRect);
      const offset = getElementOffset(target, parent);

      left = offset.left;
      top = offset.top;
      width = targetWidth;
      height = targetHeight;
      parentWidth = parentRect.width;
      parentHeight = parentRect.height;

      const toDurationOffset =
        getOffsetByDirection(direction, {
          left,
          top,
          width,
          height,
          parentWidth,
          parentHeight,
        }) * timingFactor;
      keyframes[1].offset = toDurationOffset;
      keyframes[2].offset = toDurationOffset;
    });

    dom.mutate((target) => {
      target?.style.setProperty('--motion-left', `${left}px`);
      target?.style.setProperty('--motion-top', `${top}px`);
      target?.style.setProperty('--motion-width', `${width}px`);
      target?.style.setProperty('--motion-height', `${height}px`);
      target?.style.setProperty('--motion-parent-width', `${parentWidth}px`);
      target?.style.setProperty('--motion-parent-height', `${parentHeight}px`);
    });
  }

  return [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      custom,
      keyframes,
    },
  ];
}

export function getNames({ suffix = '' }: TimeAnimationOptions & AnimationExtraOptions) {
  return ['motion-cross'].map((name) => name + suffix);
}
