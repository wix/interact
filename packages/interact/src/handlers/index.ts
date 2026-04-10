import type {
  Effect,
  InteractOptions,
  PointerTriggerParams,
  StateParams,
  TriggerHandlerMap,
  TriggerType,
} from '../types';
import viewEnterHandler from './viewEnter';
import viewProgressHandler from './viewProgress';
import pointerMoveHandler from './pointerMove';
import animationEndHandler from './animationEnd';
import eventTrigger from './eventTrigger';
import { EVENT_TRIGGER_PRESETS } from './constants';

const a11yTriggerOverrides = {
  click: EVENT_TRIGGER_PRESETS.activate,
  hover: EVENT_TRIGGER_PRESETS.interest,
} as const;

function withEventTriggerConfig(presetKey: keyof typeof EVENT_TRIGGER_PRESETS) {
  const preset = EVENT_TRIGGER_PRESETS[presetKey];
  return (
    source: HTMLElement,
    target: HTMLElement,
    effect: Effect,
    options: StateParams | PointerTriggerParams,
    interactOptions?: InteractOptions,
  ) => {
    const eventConfig =
      interactOptions?.allowA11yTriggers && presetKey in a11yTriggerOverrides
        ? a11yTriggerOverrides[presetKey as keyof typeof a11yTriggerOverrides]
        : preset;
    eventTrigger.add(source, target, effect, { ...options, eventConfig }, interactOptions ?? {});
  };
}

export default {
  viewEnter: viewEnterHandler,
  hover: {
    add: withEventTriggerConfig('hover'),
    remove: eventTrigger.remove,
  },
  click: {
    add: withEventTriggerConfig('click'),
    remove: eventTrigger.remove,
  },
  pageVisible: viewEnterHandler,
  animationEnd: animationEndHandler,
  viewProgress: viewProgressHandler,
  pointerMove: pointerMoveHandler,
  activate: {
    add: withEventTriggerConfig('activate'),
    remove: eventTrigger.remove,
  },
  interest: {
    add: withEventTriggerConfig('interest'),
    remove: eventTrigger.remove,
  },
} as TriggerHandlerMap<TriggerType>;
