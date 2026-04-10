import type {
  TimeEffect,
  TransitionEffect,
  StateParams,
  HandlerObjectMap,
  PointerTriggerParams,
  EffectBase,
  InteractOptions,
  EventTriggerConfig,
  EventTriggerConfigEnterLeave,
  EventTriggerParams,
} from '../types';
import { addHandlerToMap, removeElementFromHandlerMap } from './utilities';
import { createTimeEffectHandler, createTransitionHandler } from './effectHandlers';

const handlerMap = new WeakMap() as HandlerObjectMap;

type EventHandler = (event: Event) => void;

function createFocusListener(source: HTMLElement, handler: EventHandler): EventListener {
  return (e: Event) => {
    const ev = e as FocusEvent;
    if (!source.contains(ev.relatedTarget as HTMLElement)) {
      handler(ev);
    }
  };
}

function createClickListener(handler: EventHandler): EventListener {
  return (e: Event) => {
    const ev = e as MouseEvent;
    if ((ev as PointerEvent).pointerType) {
      handler(ev);
    }
  };
}

function createKeydownListener(handler: EventHandler): EventListener {
  return (e: Event) => {
    const ev = e as KeyboardEvent;
    if (ev.code === 'Space') {
      ev.preventDefault();
      handler(ev);
    } else if (ev.code === 'Enter') {
      handler(ev);
    }
  };
}

const LISTENER_FACTORY_BY_EVENT_TYPE: Partial<
  Record<string, (source: HTMLElement, handler: EventHandler) => EventListener>
> = {
  focusin: (source, handler) => createFocusListener(source, handler),
  focusout: (source, handler) => createFocusListener(source, handler),
  click: (_source, handler) => createClickListener(handler),
  keydown: (_source, handler) => createKeydownListener(handler),
};

function getListenerForEventType(
  event: string,
  source: HTMLElement,
  handler: EventHandler,
): EventListener {
  const factory = LISTENER_FACTORY_BY_EVENT_TYPE[event];
  return factory ? factory(source, handler) : (e: Event) => handler(e);
}

type GenericEventConfig = {
  toggle?: string[];
  enter?: string[];
  leave?: string[];
};

function isEnterLeaveConfigShape(
  config: EventTriggerConfig,
): config is EventTriggerConfigEnterLeave {
  return (
    typeof config === 'object' && !Array.isArray(config) && ('enter' in config || 'leave' in config)
  );
}

function createGenericEventConfig(config: EventTriggerConfig): GenericEventConfig {
  if (typeof config === 'string') {
    return { toggle: [config] };
  }
  if (Array.isArray(config)) {
    return { toggle: [...config] };
  }
  if (isEnterLeaveConfigShape(config)) {
    const enter = config.enter ? [...config.enter] : [];
    const leave = config.leave ? [...config.leave] : [];
    return { enter, leave };
  }
  return {};
}

function isEnterLeaveMode(genericConfig: GenericEventConfig): boolean {
  return !!(genericConfig.enter?.length || genericConfig.leave?.length);
}

function getEnterLeaveConfig(
  genericConfig: GenericEventConfig,
): EventTriggerConfigEnterLeave | undefined {
  return isEnterLeaveMode(genericConfig)
    ? { enter: genericConfig.enter ?? [], leave: genericConfig.leave ?? [] }
    : undefined;
}

function addEventTriggerHandler(
  source: HTMLElement,
  target: HTMLElement,
  effect: (TimeEffect | TransitionEffect) & EffectBase,
  options: EventTriggerParams,
  {
    reducedMotion,
    targetController,
    selectorCondition,
    animation: preCreatedAnimation,
  }: InteractOptions,
) {
  const genericConfig = createGenericEventConfig(options.eventConfig);
  const isTransition =
    (effect as TransitionEffect).transition || (effect as TransitionEffect).transitionProperties;

  const enterLeave = getEnterLeaveConfig(genericConfig);

  let handler: EventHandler | null;
  let once = false;

  if (isTransition) {
    handler = createTransitionHandler(
      target,
      targetController!,
      effect as TransitionEffect & EffectBase & { effectId: string },
      options as StateParams,
      selectorCondition,
      enterLeave,
    );
  } else {
    handler = createTimeEffectHandler(
      target,
      effect as TimeEffect & EffectBase,
      options as PointerTriggerParams,
      reducedMotion,
      selectorCondition,
      enterLeave,
      preCreatedAnimation,
    );
    once = (options as PointerTriggerParams).type === 'once';
  }

  if (!handler) {
    return;
  }

  const resolvedHandler = handler;
  const controller = new AbortController();

  function addListener(element: HTMLElement, event: string, options?: AddEventListenerOptions) {
    const fn = getListenerForEventType(event, source, resolvedHandler);
    element.addEventListener(event, fn, { ...options, signal: controller.signal });
  }

  const cleanup = () => {
    controller.abort();
  };

  const handlerObj = { source, target, cleanup };
  addHandlerToMap(handlerMap, source, handlerObj);
  addHandlerToMap(handlerMap, target, handlerObj);

  if (enterLeave) {
    const enter = genericConfig.enter!;
    const leaveEvents = genericConfig.leave!;

    enter.forEach((eventType) => {
      if (eventType === 'focusin') {
        source.tabIndex = 0;
      }
      addListener(source, eventType, { passive: true, once });
    });

    const isToggle =
      !(options as StateParams).method || (options as StateParams).method === 'toggle';
    const addLeaveListeners = isTransition
      ? isToggle
      : (options as PointerTriggerParams).type !== 'once';

    if (addLeaveListeners) {
      leaveEvents.forEach((eventType) => {
        if (eventType === 'focusout') {
          addListener(source, eventType, { once });
          return;
        }
        addListener(source, eventType, { passive: true });
      });
    }
  } else {
    const events = genericConfig.toggle ?? [];
    events.forEach((eventType) => {
      const passive = eventType !== 'keydown';
      const opts = { once, passive };
      addListener(source, eventType, opts);
    });
  }
}

function removeEventTriggerHandler(element: HTMLElement) {
  removeElementFromHandlerMap(handlerMap, element);
}

export default {
  add: addEventTriggerHandler,
  remove: removeEventTriggerHandler,
};
