import { toCSSPropertyName } from '@wix/motion';
import type { DomApi, EffectEightDirections, EffectFourDirections } from './types';
import { sideDirection } from './directions';
import { getElementOffset } from './utils';

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

type LayoutProperty = Exclude<keyof Layout, 'measured'>;

// the element's layout position inside its container, measured before the animation starts
const ELEMENT_PROPERTIES: LayoutProperty[] = ['left', 'top', 'width', 'height'];
const CONTAINER_PROPERTIES: LayoutProperty[] = ['containerWidth', 'containerHeight'];

const layoutProperty = (name: LayoutProperty) => `--motion-${toCSSPropertyName(name)}`;
const layoutVar = (name: LayoutProperty, fallback: string) =>
  `var(${layoutProperty(name)}, ${fallback})`;

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

  const inViewport = container === 'viewport';
  dom.measure((target) => {
    if (!target) {
      return;
    }
    const parent = target.offsetParent as HTMLElement;
    const { left, top } = inViewport
      ? target.getBoundingClientRect()
      : getElementOffset(target, parent);
    Object.assign(layout, {
      measured: true,
      left,
      top,
      // the layout size, before transforms (as percentages of the element's own size are)
      width: target.offsetWidth,
      height: target.offsetHeight,
      containerWidth: inViewport ? window.innerWidth : parent?.offsetWidth || 0,
      containerHeight: inViewport ? window.innerHeight : parent?.offsetHeight || 0,
    });
  });

  dom.mutate((target) => {
    if (!target || !layout.measured) {
      return;
    }
    // the viewport's size is left to the fallbacks
    const properties = inViewport
      ? ELEMENT_PROPERTIES
      : [...ELEMENT_PROPERTIES, ...CONTAINER_PROPERTIES];
    properties.forEach((name) =>
      target.style.setProperty(layoutProperty(name), `${layout[name]}px`),
    );
  });

  return layout;
}

// distance to move the element along a side until it is fully outside its container
// the element's size is explicit since a diagonal travel is used on both axes, and fallbacks (not measured) are always far enough
const OFFSCREEN_TRAVEL: Record<EffectFourDirections, string> = {
  left: `calc(${layoutVar('left', 'calc(100vw - 100%)')} + ${layoutVar('width', '100%')})`,
  right: `calc(${layoutVar('containerWidth', '100vw')} - ${layoutVar('left', '0px')})`,
  top: `calc(${layoutVar('top', 'calc(100vh - 100%)')} + ${layoutVar('height', '100%')})`,
  bottom: `calc(${layoutVar('containerHeight', '100vh')} - ${layoutVar('top', '0px')})`,
};

const OFFSCREEN_DISTANCE: Record<EffectFourDirections, (layout: Layout) => number> = {
  left: ({ left, width }) => left + width,
  right: ({ left, containerWidth }) => containerWidth - left,
  top: ({ top, height }) => top + height,
  bottom: ({ top, containerHeight }) => containerHeight - top,
};

const sidesOf = (direction: EffectEightDirections) =>
  direction.split('-') as EffectFourDirections[];

// a diagonal leaves the container through the nearer of its two sides, moving along the 45deg line
export function getOffscreenTravel(direction: EffectEightDirections) {
  const travels = sidesOf(direction).map((side) => OFFSCREEN_TRAVEL[side]);
  return travels.length > 1 ? `calc(min(${travels.join(', ')}) * ${Math.SQRT2})` : travels[0];
}

// the measured distance (in px, along the motion) matching getOffscreenTravel
export function getOffscreenDistance(layout: Layout, direction: EffectEightDirections) {
  const distances = sidesOf(direction).map((side) => OFFSCREEN_DISTANCE[side](layout));
  return distances.length > 1 ? Math.min(...distances) * Math.SQRT2 : distances[0];
}

export function getOppositeDirection(direction: EffectEightDirections) {
  return sidesOf(direction).map(sideDirection.opposite).join('-') as EffectEightDirections;
}

// travels for moving towards `direction` from fully offscreen on the other side to fully offscreen on that side
// travel - the side it comes from, toTravel - the side it moves to
export function getOffscreenTravels(direction: EffectEightDirections) {
  return {
    travel: getOffscreenTravel(getOppositeDirection(direction)),
    toTravel: getOffscreenTravel(direction),
  };
}
