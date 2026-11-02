import type { LengthValue } from '../../utils';
import { getMouseTransitionEasing, mapRange, parseCssLength, parseDirection } from '../../utils';
import type {
  ScrubAnimationOptions,
  AiryMouse,
  AnimationExtraOptions,
  Progress,
  MouseEffectAxis,
} from '../../types';
import { CustomMouse } from './CustomMouse';

const AXES = ['both', 'horizontal', 'vertical'] as const;

const DEFAULTS: Required<AiryMouse> = {
  type: 'AiryMouse',
  angle: 30,
  direction: 'both',
  inverted: false,
  travel: { value: 200, unit: 'px' },
};

export const schema = {
  angle: { type: 'number', min: 0, default: DEFAULTS.angle },
  direction: { type: 'enum', values: AXES, default: DEFAULTS.direction },
  inverted: { type: 'bool', default: DEFAULTS.inverted },
  travel: { type: 'length', default: DEFAULTS.travel },
};

class AiryMouseAnimation extends CustomMouse {
  progress({ x: progressX, y: progressY }: Progress) {
    let translateX = 0;
    let translateY = 0;
    const { travel, invert, angle, direction } = this.options;

    if (direction !== 'vertical') {
      translateX = mapRange(0, 1, -1, 1, progressX) * invert;
    }
    if (direction !== 'horizontal') {
      translateY = mapRange(0, 1, -1, 1, progressY) * invert;
    }

    // if progress  === 0, rotate === angle, if progress === 0.5, rotate === 0, if progress === 1, rotate === angle
    const rotate = mapRange(0, 1, -angle, angle, progressX) * invert;

    this.target.style.transform = `translateX(calc(${travel} * ${translateX})) translateY(calc(${travel} * ${translateY})) rotate(calc(${rotate}deg + var(--motion-rotate, 0deg)))`;
  }

  cancel() {
    this.target.style.transform = '';
    this.target.style.transition = '';
  }
}

export default function create(options: ScrubAnimationOptions & AnimationExtraOptions) {
  const { transitionDuration, transitionEasing } = options;
  const namedEffect = options.namedEffect as AiryMouse;
  const { inverted = DEFAULTS.inverted, angle = DEFAULTS.angle } = namedEffect;
  const travel = parseCssLength(namedEffect.travel, DEFAULTS.travel as LengthValue);
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
    angle,
    direction,
  };

  return (target: HTMLElement) => new AiryMouseAnimation(target, animationOptions);
}
