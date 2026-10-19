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
  parseLengthOrCalc,
  parseDirection,
} from '../../utils';
import { CustomMouse } from './CustomMouse';

const AXES = ['both', 'horizontal', 'vertical'] as const;

export const schema = {
  angle: { type: 'number', default: 5 },
  axis: { type: 'enum', values: AXES, default: 'both' },
  distance: { type: 'length', default: { value: 200, unit: 'px' } },
  inverted: { type: 'bool', default: false },
  perspective: { type: 'number', min: 0, default: 800 },
} as const;

class Track3DMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { invert, distance, angle, axis, perspective } = this.options;
    const distanceValue = typeof distance === 'string' ? 1 : distance.value;

    let translateX = 0;
    let translateY = 0;
    let rotateX = 0;
    let rotateY = 0;
    // if progressX === 0, translateX === -distance
    // if progressX === 0.5, translateX === 0
    // if progressX === 1, translateX === distance
    // if progressX === 0, rotateX === -angle, if progressX === 0.5, rotateX === 0, if progressX === 1, rotateX === angle
    if (axis === 'both' || axis === 'horizontal') {
      translateX = mapRange(0, 1, -distanceValue, distanceValue, progressX);
      rotateY = mapRange(0, 1, -angle, angle, progressX) * invert;
    }
    if (axis === 'both' || axis === 'vertical') {
      translateY = mapRange(0, 1, -distanceValue, distanceValue, progressY);
      rotateX = mapRange(0, 1, angle, -angle, progressY) * invert;
    }
    const toLength = (value: number) =>
      typeof distance === 'string'
        ? `calc(${value} * ${distance})`
        : `${value}${getCssUnits(distance.unit)}`;

    this.target.style.transform = `perspective(${perspective}px) translateX(${toLength(translateX)}) translateY(${toLength(translateY)}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(var(--motion-rotate, 0deg))`;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as Track3DMouse;
  const inverted = namedEffect.inverted ?? schema.inverted.default;
  const distance = parseLengthOrCalc(namedEffect.distance, schema.distance.default);
  const angle = parseDirection(namedEffect.angle, [], schema.angle.default, true) as number;
  const axis = parseDirection(namedEffect.axis, AXES, schema.axis.default) as MouseEffectAxis;
  const { perspective = schema.perspective.default } = namedEffect;
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

create.schema = schema;
