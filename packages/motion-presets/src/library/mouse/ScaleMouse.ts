import {
  getCssUnits,
  getMouseTransitionEasing,
  mapRange,
  parseLengthOrCalc,
  parseDirection,
} from '../../utils';
import { CustomMouse } from './CustomMouse';
import {
  ScrubAnimationOptions,
  AnimationExtraOptions,
  ScaleMouse,
  Progress,
  MouseEffectAxis,
} from '../../types';

const AXES = ['both', 'horizontal', 'vertical'] as const;

export const schema = {
  axis: { type: 'enum', values: AXES, default: 'both' },
  distance: { type: 'length', default: { value: 80, unit: 'px' } },
  inverted: { type: 'bool', default: false },
  scale: { type: 'number', min: 0, default: 1.4 },
} as const;

class ScaleMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { distance, scale, invert, axis } = this.options;
    const distanceValue = typeof distance === 'string' ? 1 : distance.value;

    let translateX = 0;
    let translateY = 0;
    let scaleX = 1;
    let scaleY = 1;

    if (axis === 'both' || axis === 'horizontal') {
      translateX = mapRange(0, 1, -distanceValue, distanceValue, progressX) * invert;
      scaleX =
        progressX < 0.5
          ? mapRange(0, 0.5, scale, 1, progressX)
          : mapRange(0.5, 1, 1, scale, progressX);
    }

    if (axis === 'both' || axis === 'vertical') {
      translateY = mapRange(0, 1, -distanceValue, distanceValue, progressY) * invert;
      scaleY =
        progressY < 0.5
          ? mapRange(0, 0.5, scale, 1, progressY)
          : mapRange(0.5, 1, 1, scale, progressY);
    }

    // scale is uniform so we use the smaller scale value if scale < 1
    // and the bigger scale value if scale > 1
    const scaleBoth = scale < 1 ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);

    const toLength = (value: number) =>
      typeof distance === 'string'
        ? `calc(${value} * ${distance})`
        : `${value}${getCssUnits(distance.unit)}`;

    this.target.style.transform = `translateX(${toLength(translateX)}) translateY(${toLength(translateY)}) scale(${scaleBoth}) rotate(var(--motion-rotate, 0deg))`;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as ScaleMouse;
  const inverted = namedEffect.inverted ?? schema.inverted.default;
  const distance = parseLengthOrCalc(namedEffect.distance, schema.distance.default);
  const axis = parseDirection(namedEffect.axis, AXES, schema.axis.default) as MouseEffectAxis;
  const { scale = schema.scale.default } = namedEffect;
  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    invert,
    distance,
    axis,
    scale,
  };

  return (target: HTMLElement) => new ScaleMouseAnimation(target, animationOptions);
}

create.schema = schema;
