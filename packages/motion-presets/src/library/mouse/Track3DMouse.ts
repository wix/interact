import {
  ScrubAnimationOptions,
  AnimationExtraOptions,
  Track3DMouse,
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
import { CustomMouse } from './CustomMouse';

const DEFAULT_DISTANCE = { value: 200, unit: 'px' };
const DEFAULT_ANGLE = 5;
const DEFAULT_AXIS: MouseEffectAxis = 'both';
const AXES = ['both', 'horizontal', 'vertical'] as const;

class Track3DMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { invert, distance, angle, axis, perspective } = this.options;

    let translateX = 0;
    let translateY = 0;
    let rotateX = 0;
    let rotateY = 0;
    // if progressX === 0, translateX === -distance
    // if progressX === 0.5, translateX === 0
    // if progressX === 1, translateX === distance
    // if progressX === 0, rotateX === -angle, if progressX === 0.5, rotateX === 0, if progressX === 1, rotateX === angle
    if (axis === 'both' || axis === 'horizontal') {
      translateX = mapRange(0, 1, -distance.value, distance.value, progressX);
      rotateY = mapRange(0, 1, -angle, angle, progressX) * invert;
    }
    if (axis === 'both' || axis === 'vertical') {
      translateY = mapRange(0, 1, -distance.value, distance.value, progressY);
      rotateX = mapRange(0, 1, angle, -angle, progressY) * invert;
    }
    const units = getCssUnits(distance.unit);

    this.target.style.transform = `perspective(${perspective}px) translateX(${translateX}${units}) translateY(${translateY}${units}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(var(--motion-rotate, 0deg))`;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as Track3DMouse;
  const inverted = namedEffect.inverted ?? false;
  const distance = parseLength(namedEffect.distance, DEFAULT_DISTANCE);
  const angle = parseDirection(namedEffect.angle, [], DEFAULT_ANGLE, true) as number;
  const axis = parseDirection(namedEffect.axis, AXES, DEFAULT_AXIS) as MouseEffectAxis;
  const { perspective = 800 } = namedEffect;
  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    invert,
    distance,
    axis,
    angle,
    perspective,
  };

  return (target: HTMLElement) => new Track3DMouseAnimation(target, animationOptions);
}
