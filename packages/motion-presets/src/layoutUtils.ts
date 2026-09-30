import type { DomApi, EffectEightDirections, EffectFourDirections } from './types';
import { getElementOffset } from './utils';

// the element's layout position inside its container, measured before the animation starts
const LEFT = '--motion-left';
const TOP = '--motion-top';
const WIDTH = '--motion-width';
const HEIGHT = '--motion-height';
const CONTAINER_WIDTH = '--motion-container-width';
const CONTAINER_HEIGHT = '--motion-container-height';

export type LayoutContainer = 'viewport' | 'parent';

export type Layout = {
  measured: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
  containerWidth: number;
  containerHeight: number;
};

// measures the element's position (and the container's size when it is not the viewport) into custom-properties
// the returned layout is filled once measured, for values that must be computed from it (e.g. lazy timing)
export function measureLayout(dom?: DomApi, container: LayoutContainer = 'viewport'): Layout {
  const layout: Layout = {
    measured: false,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    containerWidth: 0,
    containerHeight: 0,
  };
  if (!dom) {
    return layout;
  }

  dom.measure((target) => {
    if (!target) {
      return;
    }
    // the layout size, before transforms (as percentages of the element's own size are)
    Object.assign(layout, {
      measured: true,
      width: target.offsetWidth,
      height: target.offsetHeight,
    });
    const { left, top } = target.getBoundingClientRect();
    if (container === 'viewport') {
      Object.assign(layout, {
        left,
        top,
        containerWidth: window.innerWidth,
        containerHeight: window.innerHeight,
      });
      return;
    }
    const parent = target.offsetParent as HTMLElement;
    Object.assign(layout, getElementOffset(target, parent), {
      containerWidth: parent?.offsetWidth || 0,
      containerHeight: parent?.offsetHeight || 0,
    });
  });

  dom.mutate((target) => {
    if (!target || !layout.measured) {
      return;
    }
    target.style.setProperty(LEFT, `${layout.left}px`);
    target.style.setProperty(TOP, `${layout.top}px`);
    target.style.setProperty(WIDTH, `${layout.width}px`);
    target.style.setProperty(HEIGHT, `${layout.height}px`);
    if (container === 'parent') {
      target.style.setProperty(CONTAINER_WIDTH, `${layout.containerWidth}px`);
      target.style.setProperty(CONTAINER_HEIGHT, `${layout.containerHeight}px`);
    }
  });

  return layout;
}

// distance to move the element along a side until it is fully outside its container
// the element's size is explicit since a diagonal travel is used on both axes, and fallbacks (not measured) are always far enough
const OFFSCREEN_TRAVEL: Record<EffectFourDirections, string> = {
  left: `calc(var(${LEFT}, calc(100vw - 100%)) + var(${WIDTH}, 100%))`,
  right: `calc(var(${CONTAINER_WIDTH}, 100vw) - var(${LEFT}, 0px))`,
  top: `calc(var(${TOP}, calc(100vh - 100%)) + var(${HEIGHT}, 100%))`,
  bottom: `calc(var(${CONTAINER_HEIGHT}, 100vh) - var(${TOP}, 0px))`,
};

const SIDES_OF: Record<EffectEightDirections, EffectFourDirections[]> = {
  top: ['top'],
  right: ['right'],
  bottom: ['bottom'],
  left: ['left'],
  'top-right': ['top', 'right'],
  'top-left': ['top', 'left'],
  'bottom-right': ['bottom', 'right'],
  'bottom-left': ['bottom', 'left'],
};

const OPPOSITE: Record<EffectEightDirections, EffectEightDirections> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
  'top-right': 'bottom-left',
  'top-left': 'bottom-right',
  'bottom-right': 'top-left',
  'bottom-left': 'top-right',
};

// a diagonal leaves the container through the nearer of its two sides, moving along the 45deg line
export function getOffscreenTravel(direction: EffectEightDirections) {
  const [first, second] = SIDES_OF[direction];
  return second
    ? `calc(min(${OFFSCREEN_TRAVEL[first]}, ${OFFSCREEN_TRAVEL[second]}) * ${Math.SQRT2})`
    : OFFSCREEN_TRAVEL[first];
}

// travels for moving towards `direction` from fully offscreen on the other side to fully offscreen on that side
// travel - the side it comes from, toTravel - the side it moves to
export function getOffscreenTravels(direction: EffectEightDirections) {
  return {
    travel: getOffscreenTravel(OPPOSITE[direction]),
    toTravel: getOffscreenTravel(direction),
  };
}

const OFFSCREEN_DISTANCE: Record<EffectFourDirections, (layout: Layout) => number> = {
  left: ({ left, width }) => left + width,
  right: ({ left, containerWidth }) => containerWidth - left,
  top: ({ top, height }) => top + height,
  bottom: ({ top, containerHeight }) => containerHeight - top,
};

// the measured distance (in px, along the motion) matching getOffscreenTravel
export function getOffscreenDistance(layout: Layout, direction: EffectEightDirections) {
  const [first, second] = SIDES_OF[direction];
  return second
    ? Math.min(OFFSCREEN_DISTANCE[first](layout), OFFSCREEN_DISTANCE[second](layout)) * Math.SQRT2
    : OFFSCREEN_DISTANCE[first](layout);
}

export function getOppositeDirection(direction: EffectEightDirections) {
  return OPPOSITE[direction];
}
