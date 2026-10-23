import {
  ScrubAnimationOptions,
  AnimationExtraOptions,
  SkewMouse,
  Progress,
  MouseEffectAxis,
} from '../../types';
import {
  getCssUnits,
  getMouseTransitionEasing,
  mapRange,
  parseLengthOrCalc,
  parseDirection,
} from '../../utils';
import { circInOut } from '@wix/motion';
import { CustomMouse } from './CustomMouse';

const AXES = ['both', 'horizontal', 'vertical'] as const;

export const schema = {
  angle: { type: 'number', default: 25 },
  axis: { type: 'enum', values: AXES, default: 'both' },
  distance: { type: 'length', default: { value: 200, unit: 'px' } },
  inverted: { type: 'bool', default: false },
} as const;

class SkewMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    let translateX = 0;
    let translateY = 0;
    let skewX = 0;
    let skewY = 0;
    const { distance, angle, axis, invert } = this.options;
    const distanceValue = typeof distance === 'string' ? 1 : distance.value;

    // distance
    if (axis !== 'vertical') {
      translateX = mapRange(0, 1, -distanceValue, distanceValue, progressX) * invert;
      skewX = mapRange(0, 1, angle, -angle, progressX) * invert;
    }
    if (axis !== 'horizontal') {
      translateY = mapRange(0, 1, -distanceValue, distanceValue, progressY) * invert;
      skewY = mapRange(0, 1, angle, -angle, progressY) * invert;
    }
    if (axis === 'both') {
      // We want to do `skewX *= progressY < 0.5 ? 1 : -1`
      // but normalize it by y progress (so it will be 0 when y is 0.5)
      // and apply a circInOut easing on the progress so it will feel more natural
      skewX *= mapRange(0, 1, 1, -1, circInOut(progressY));

      // we want to do `skewY *= progressX < 0.5 ? 1 : -1`
      // but normalize it by x progress (so it will be 0 when x is 0.5)
      // and apply a circInOut easing on the progress so it will feel more natural
      skewY *= mapRange(0, 1, 1, -1, circInOut(progressX));
    }

    const toLength = (value: number) =>
      typeof distance === 'string'
        ? `calc(${value} * ${distance})`
        : `${value}${getCssUnits(distance.unit)}`;

    const transform = `translateX(${toLength(translateX)}) translateY(${toLength(translateY)}) skew(${skewX}deg, ${skewY}deg) rotate(var(--motion-rotate, 0deg))`;

    this.target.style.transform = transform;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as SkewMouse;
  const inverted = namedEffect.inverted ?? schema.inverted.default;
  const distance = parseLengthOrCalc(namedEffect.distance, schema.distance.default);
  const angle = parseDirection(namedEffect.angle, [], schema.angle.default, true) as number;
  const axis = parseDirection(namedEffect.axis, AXES, schema.axis.default) as MouseEffectAxis;
  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    invert,
    distance,
    angle,
    axis,
  };

  return (target: HTMLElement) => new SkewMouseAnimation(target, animationOptions);
}

create.schema = schema;
