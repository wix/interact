import type { TimeAnimationOptions, DomApi } from '../../types';
import { getElementOffset } from '../../utils';

const RATIO_DAMPING_FACTOR = 0.5;

export function web(options: TimeAnimationOptions, dom?: DomApi) {
  const duration = options.duration || 1;
  const delay = options.delay || 0;
  const [dvdX, dvdY] = getNames(options);

  let left = 0;
  let top = 0;
  let parentWidth = 0;
  let parentHeight = 0;
  let ratio = (16 / 9) * RATIO_DAMPING_FACTOR;

  if (dom) {
    dom.measure((target) => {
      if (!target) {
        return;
      }

      const rect = target.getBoundingClientRect();
      const { width, height } = rect;

      const parent = (target.closest('[data-block-level-container]') ||
        target.offsetParent) as HTMLElement;
      const offset = getElementOffset(target, parent);
      left = offset.left;
      top = offset.top;

      parentWidth = parent?.offsetWidth || 0;
      parentHeight = parent?.offsetHeight || 0;

      ratio = (parentWidth / parentHeight) * RATIO_DAMPING_FACTOR;

      dom.mutate(() => {
        target.style.setProperty('--motion-left', `${left}px`);
        target.style.setProperty('--motion-top', `${top}px`);
        target.style.setProperty('--motion-width', `${width}px`);
        target.style.setProperty('--motion-height', `${height}px`);
        target.style.setProperty('--motion-parent-width', `${parentWidth}px`);
        target.style.setProperty('--motion-parent-height', `${parentHeight}px`);
      });
    });
  }

  return [
    {
      ...options,
      name: dvdX,
      easing: 'linear',
      delay,
      duration: duration / ratio,
      alternate: true,
      keyframes: [
        {
          translate: 'calc(-1 * var(--motion-left, 0px))',
        },
        {
          translate:
            'calc(var(--motion-parent-width, 100vw) - var(--motion-left, 0px) - var(--motion-width, 100%))',
        },
      ],
      get timing() {
        return {
          iterationStart: left && parentWidth ? left / parentWidth : 0,
        };
      },
    },
    {
      ...options,
      name: dvdY,
      easing: 'linear',
      delay,
      duration: duration * ratio,
      alternate: true,
      composite: 'add' as const,
      keyframes: [
        {
          translate: '0 calc(-1 * var(--motion-top, 0px))',
        },
        {
          translate:
            '0 calc(var(--motion-parent-height, 100vh) - var(--motion-top, 0px) - var(--motion-height, 100%))',
        },
      ],
      get timing() {
        return {
          iterationStart: top && parentHeight ? top / parentHeight : 0,
        };
      },
    },
  ];
}

export function getNames(_: TimeAnimationOptions) {
  return ['motion-dvd-x', 'motion-dvd-y'];
}
