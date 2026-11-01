import type { LengthValue } from '../../utils';
import { getMouseTransitionEasing, mapRange, parseLengthLazy, parseDirection } from '../../utils';
import { CustomMouse } from './CustomMouse';
import {
  ScrubAnimationOptions,
  AnimationExtraOptions,
  ScaleMouse,
  Progress,
  MouseEffectAxis,
} from '../../types';

const AXES = ['both', 'horizontal', 'vertical'] as const;

const DEFAULTS: Required<ScaleMouse> = {
  type: 'ScaleMouse',
  direction: 'both',
  inverted: false,
  scale: 1.4,
  travel: { value: 80, unit: 'px' },
};

export const schema = {
  direction: { type: 'enum', values: AXES, default: DEFAULTS.direction },
  inverted: { type: 'bool', default: DEFAULTS.inverted },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  travel: { type: 'length', default: DEFAULTS.travel },
};

class ScaleMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    const { travel, scale, invert, direction } = this.options;

    let translateX = 0;
    let translateY = 0;
    let scaleX = 1;
    let scaleY = 1;

    if (direction === 'both' || direction === 'horizontal') {
      translateX = mapRange(0, 1, -1, 1, progressX) * invert;
      scaleX =
        progressX < 0.5
          ? mapRange(0, 0.5, scale, 1, progressX)
          : mapRange(0.5, 1, 1, scale, progressX);
    }

    if (direction === 'both' || direction === 'vertical') {
      translateY = mapRange(0, 1, -1, 1, progressY) * invert;
      scaleY =
        progressY < 0.5
          ? mapRange(0, 0.5, scale, 1, progressY)
          : mapRange(0.5, 1, 1, scale, progressY);
    }

    // scale is uniform so we use the smaller scale value if scale < 1
    // and the bigger scale value if scale > 1
    const scaleBoth = scale < 1 ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);

    this.target.style.transform = `translateX(calc(${travel} * ${translateX})) translateY(calc(${travel} * ${translateY})) scale(${scaleBoth}) rotate(var(--motion-rotate, 0deg))`;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as ScaleMouse;
  const { inverted = DEFAULTS.inverted, scale = DEFAULTS.scale } = namedEffect;
  const travel = parseLengthLazy(namedEffect.travel, DEFAULTS.travel as LengthValue);
  const direction = parseDirection(
    namedEffect.direction,
    AXES,
    DEFAULTS.direction,
  ) as MouseEffectAxis;
  const invert = inverted ? -1 : 1;
  const animationOptions = {
    transition: transitionDuration
      ? `transform ${transitionDuration}ms ${getMouseTransitionEasing(transitionEasing)}`
      : '',
    invert,
    travel,
    direction,
    scale,
  };

  return (target: HTMLElement) => new ScaleMouseAnimation(target, animationOptions);
}
