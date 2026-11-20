import type {
  TimeEffect,
  ScrubEffect,
  RangeOffset,
  HandlerObject,
  HandlerObjectMap,
  HandlerDisposer,
  AnimationOptions,
} from '../types';

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

function addHandlerToMap<T extends HandlerObject>(
  handlersMap: HandlerObjectMap<T>,
  element: HTMLElement,
  handlerObj: T,
) {
  let handlers = handlersMap.get(element);

  if (!handlers) {
    handlers = new Set();
    handlersMap.set(element, handlers);
  }

  handlers.add(handlerObj);
}

export function registerHandler<T extends HandlerObject>(
  handlerMap: HandlerObjectMap<T>,
  handler: T,
): HandlerDisposer {
  const cleanup = handler.cleanup;
  const dispose: HandlerDisposer = (finished = false) => {
    if (!handlerMap.get(handler.source)?.delete(handler)) {
      return;
    }

    handlerMap.get(handler.target)?.delete(handler);
    const onDispose = dispose.onDispose;
    dispose.onDispose = undefined;
    onDispose?.();
    if (!finished) {
      cleanup();
    }
  };
  handler.cleanup = dispose;
  addHandlerToMap(handlerMap, handler.source, handler);
  addHandlerToMap(handlerMap, handler.target, handler);
  return dispose;
}

export function removeElementFromHandlerMap<T extends HandlerObject>(
  handlerMap: HandlerObjectMap<T>,
  element: HTMLElement,
  untrackedOnly = false,
) {
  const handlers = handlerMap.get(element);
  handlers?.forEach(({ cleanup }) => {
    if (!untrackedOnly || !cleanup.onDispose) {
      cleanup();
    }
  });
  if (!handlers?.size) {
    handlerMap.delete(element);
  }
}
