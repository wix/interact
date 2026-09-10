import type {
  TimeEffect,
  ScrubEffect,
  RangeOffset,
  HandlerObject,
  HandlerObjectMap,
  AnimationOptions,
} from '../types';
import type { AnimationGroup } from '@wix/motion';

const DEFAULT_RANGE_VALUES = {
  rangeStart: { name: 'cover' as const, offset: { value: 0, unit: 'percentage' as const } },
  rangeEnd: { name: 'cover' as const, offset: { value: 100, unit: 'percentage' as const } },
};

function resolveRangeOffsets(
  rangeStart: RangeOffset | undefined,
  rangeEnd: RangeOffset | undefined,
): { startOffset: RangeOffset; endOffset: RangeOffset } {
  const startName = rangeStart?.name ?? DEFAULT_RANGE_VALUES.rangeStart.name;
  const endName = rangeEnd?.name ?? rangeStart?.name ?? DEFAULT_RANGE_VALUES.rangeEnd.name;

  const startOffset: RangeOffset = {
    name: startName,
    offset: rangeStart?.offset || DEFAULT_RANGE_VALUES.rangeStart.offset,
  };

  const endOffset: RangeOffset = {
    name: endName,
    offset: rangeEnd?.offset || DEFAULT_RANGE_VALUES.rangeEnd.offset,
  };

  return { startOffset, endOffset };
}

export function effectToAnimationOptions(effect: TimeEffect | ScrubEffect) {
  if ('keyframeEffect' in effect && !effect.keyframeEffect.name && 'effectId' in effect) {
    effect.keyframeEffect.name = effect.effectId as string;
  }

  if ('duration' in effect) {
    return {
      id: '',
      ...effect,
    } as AnimationOptions<'time'>;
  }

  const { rangeStart, rangeEnd, ...rest } = effect;
  const { startOffset, endOffset } = resolveRangeOffsets(rangeStart, rangeEnd);

  return {
    id: '',
    startOffset,
    endOffset,
    ...rest,
  } as AnimationOptions<'scrub'>;
}

export function addHandlerToMap(
  handlersMap: HandlerObjectMap,
  element: HTMLElement,
  handlerObj: HandlerObject,
) {
  let handlers = handlersMap.get(element);

  if (!handlers) {
    handlers = new Set();
    handlersMap.set(element, handlers);
  }

  handlers.add(handlerObj);
}

export function removeElementFromHandlerMap(handlerMap: HandlerObjectMap, element: HTMLElement) {
  const handlers = handlerMap.get(element);

  handlers?.forEach((handlerObj) => {
    const { source, target, cleanup } = handlerObj;
    cleanup();

    const otherKey = source === element ? target : source;
    const otherHandlers = handlerMap.get(otherKey);
    otherHandlers?.delete(handlerObj);
  });

  handlerMap.delete(element);
}

/**
 * Cancel now, then cancel once more when initialization completes.
 *
 * AnimationGroup.play() waits for ready before playing its animations. If teardown happens while
 * that wait is pending, a single synchronous cancel can be followed by the queued play. Repeating
 * the cancellation after ready makes teardown win that race as well.
 */
export function cancelAnimationGroup(animation: AnimationGroup): void {
  animation.cancel();
  void animation.ready?.then(
    () => animation.cancel(),
    () => undefined,
  );
}
