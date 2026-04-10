export const EVENT_TRIGGER_PRESETS = {
  click: ['click'] as const,
  activate: ['click', 'keydown'] as const,
  hover: { enter: ['mouseenter'], leave: ['mouseleave'] } as const,
  interest: {
    enter: ['mouseenter', 'focusin'],
    leave: ['mouseleave', 'focusout'],
  } as const,
} as const;
