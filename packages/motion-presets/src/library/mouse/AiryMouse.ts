import {
  getCssUnits,
  getMouseTransitionEasing,
  mapRange,
  parseLength,
  parseDirection,
} from '../../utils';
import type {
  ScrubAnimationOptions,
  AiryMouse,
  AnimationExtraOptions,
  Progress,
  MouseEffectAxis,
} from '../../types';
import { CustomMouse } from './CustomMouse';

const DEFAULT_DISTANCE = { value: 200, unit: 'px' };
const DEFAULT_ANGLE = 30;
const DEFAULT_AXIS: MouseEffectAxis = 'both';
const AXES = ['both', 'horizontal', 'vertical'] as const;

class AiryMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    let translateX = 0;
    let translateY = 0;
    const { distance, invert, angle, axis } = this.options;

    if (axis !== 'vertical') {
      translateX = mapRange(0, 1, -distance.value, distance.value, progressX) * invert;
    }
    if (axis !== 'horizontal') {
      translateY = mapRange(0, 1, -distance.value, distance.value, progressY) * invert;
    }

    // if progress  === 0, rotate === angle, if progress === 0.5, rotate === 0, if progress === 1, rotate === angle
    const rotate = mapRange(0, 1, -angle, angle, progressX) * invert;
    const units = getCssUnits(distance.unit);

    this.target.style.transform = `translateX(${translateX}${units}) translateY(${translateY}${units}) rotate(calc(${rotate}deg + var(--motion-rotate, 0deg)))`;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as AiryMouse;
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

  return (target: HTMLElement) => new AiryMouseAnimation(target, animationOptions);
}
