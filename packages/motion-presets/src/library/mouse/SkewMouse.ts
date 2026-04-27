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
  parseLength,
  parseDirection,
} from '../../utils';
import { circInOut } from '@wix/motion';
import { CustomMouse } from './CustomMouse';

const DEFAULT_DISTANCE = { value: 200, unit: 'px' };
const DEFAULT_ANGLE = 25;
const DEFAULT_AXIS: MouseEffectAxis = 'both';
const AXES = ['both', 'horizontal', 'vertical'] as const;

class SkewMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    let translateX = 0;
    let translateY = 0;
    let skewX = 0;
    let skewY = 0;
    const { distance, angle, axis, invert } = this.options;

    // distance
    if (axis !== 'vertical') {
      translateX = mapRange(0, 1, -distance.value, distance.value, progressX) * invert;
      skewX = mapRange(0, 1, angle, -angle, progressX) * invert;
    }
    if (axis !== 'horizontal') {
      translateY = mapRange(0, 1, -distance.value, distance.value, progressY) * invert;
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

    const units = getCssUnits(distance.unit);

    const transform = `translateX(${translateX}${units}) translateY(${translateY}${units}) skew(${skewX}deg, ${skewY}deg) rotate(var(--motion-rotate, 0deg))`;

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
  const inverted = namedEffect.inverted ?? false;
  const distance = parseLength(namedEffect.distance, DEFAULT_DISTANCE);
  const angle = parseDirection(namedEffect.angle, [], DEFAULT_ANGLE, true) as number;
  const axis = parseDirection(namedEffect.axis, AXES, DEFAULT_AXIS) as MouseEffectAxis;
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
