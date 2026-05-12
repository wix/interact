// ═══════════════════════════════════════════════════════════════════════════
// @wix/interact — rules glossary (single source of truth)
// ═══════════════════════════════════════════════════════════════════════════

export const glossary = {
  // ═══════════════════════════════════════════════════════════════════════════
  // meta
  // ═══════════════════════════════════════════════════════════════════════════
  meta: {
    packageName: '@wix/interact',
    presetsPackage: '@wix/motion-presets',
    motionPackage: '@wix/motion',
    installCommand: 'npm install @wix/interact @wix/motion-presets',
    entry: {
      web: '@wix/interact/web',
      react: '@wix/interact/react',
      vanilla: '@wix/interact',
    },
    fouc: {
      key: 'hero',
      webSectionClass: ' class="hero"',
      reactClassName: ' className="hero"',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // vars — [PLACEHOLDER] defaults; triggers.<name>.vars overrides
  // ═══════════════════════════════════════════════════════════════════════════
  vars: {
    SOURCE_KEY:
      "identifier matching the element's key (`data-interact-key` for web, `interactKey` for React).",
    TARGET_KEY: "identifier matching the element's key on the element that animates.",
    EFFECT_NAME: 'unique string identifier for a `keyframeEffect`.',
    NAMED_EFFECT_DEFINITION:
      'object with properties of pre-built effect from `@wix/motion-presets`. Refer to motion-presets rules for available presets and their options.',
    KEYFRAMES:
      'array of keyframe objects (e.g. `[{ opacity: 0 }, { opacity: 1 }]`). Property names in camelCase.',
    FILL_MODE:
      "fill mode for the animation (`'none'`, `'forwards'`, `'backwards'`, `'both'`).",
    DURATION_MS: 'animation duration in milliseconds.',
    EASING_FUNCTION: 'CSS easing string or named easing from `@wix/motion`.',
    DELAY_MS: 'optional delay before the effect starts, in milliseconds.',
    ITERATIONS: 'optional. Number of iterations, or `Infinity` for continuous loops.',
    ALTERNATE_BOOL:
      'optional. `true` to alternate direction on every other iteration (within a single playback).',
    UNIQUE_EFFECT_ID:
      'optional. String identifier used by `animationEnd` triggers for chaining, and by sequences for referencing effects from the top-level `effects` map.',
    CUSTOM_EFFECT_CALLBACK:
      'function with signature `(element: HTMLElement, progress: number) => void`. Called on each animation frame with the target element and `progress` from 0 to 1.',
    TRANSITION_DURATION_MS:
      'optional number. Milliseconds for smoothing (interpolating) between progress updates. The animation does not jump to the new progress value instantly; instead it transitions over this duration. Use to add inertia/lag to the effect, making it feel more physical (e.g. `200`–`600`).',
    TRANSITION_EASING:
      'optional string. CSS easing or named easing from `@wix/motion`. Adds a natural deceleration feel when used with `transitionDuration`.',
    CENTERED_TO_TARGET: '`true` or `false`. See **Centering with `centeredToTarget`** above.',
    HIT_AREA:
      "`'self'` (track pointer within source element) or `'root'` (track pointer anywhere in viewport).",
    VISIBILITY_THRESHOLD:
      'optional. Number between 0–1 indicating how much of the source element must be visible to trigger (e.g. `0.3` = 30%).',
    VIEWPORT_INSETS:
      "optional. String adjusting the viewport detection area (e.g. `'-100px'` extends it, `'50px'` shrinks it).",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // effects
  // ═══════════════════════════════════════════════════════════════════════════
  effects: {
    triggerTypes: ['once', 'repeat', 'alternate', 'state'],
    easings: [
      'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'sineIn', 'sineOut', 'sineInOut',
      'quadIn', 'quadOut', 'quadInOut', 'cubicIn', 'cubicOut', 'cubicInOut', 'quartIn', 'quartOut',
      'quartInOut', 'quintIn', 'quintOut', 'quintInOut', 'expoIn', 'expoOut', 'expoInOut', 'circIn',
      'circOut', 'circInOut', 'backIn', 'backOut', 'backInOut',
    ],
    transitionEasings: ['linear', 'hardBackOut', 'easeOut', 'elastic', 'bounce'],
    presets: {
      entrance: [
        'FadeIn', 'GlideIn', 'SlideIn', 'FloatIn', 'RevealIn', 'ExpandIn', 'BlurIn', 'FlipIn', 'ArcIn',
        'ShuttersIn', 'CurveIn', 'DropIn', 'FoldIn', 'ShapeIn', 'TiltIn', 'WinkIn', 'SpinIn', 'TurnIn',
        'BounceIn',
      ],
      ongoing: [
        'Pulse', 'Spin', 'Breathe', 'Bounce', 'Wiggle', 'Flash', 'Flip', 'Fold', 'Jello', 'Poke', 'Rubber',
        'Swing', 'Cross',
      ],
      scroll: [
        'FadeScroll', 'RevealScroll', 'ParallaxScroll', 'MoveScroll', 'SlideScroll', 'GrowScroll',
        'ShrinkScroll', 'TiltScroll', 'PanScroll', 'BlurScroll', 'FlipScroll', 'SpinScroll', 'ArcScroll',
        'ShapeScroll', 'ShuttersScroll', 'SkewPanScroll', 'Spin3dScroll', 'StretchScroll', 'TurnScroll',
      ],
      mouse: [
        'TrackMouse', 'Tilt3DMouse', 'Track3DMouse', 'SwivelMouse', 'AiryMouse', 'ScaleMouse', 'BlurMouse',
        'SkewMouse', 'BlobMouse',
      ],
    },
    ranges: {
      cover: 'full visibility span from first pixel entering to last pixel leaving.',
      entry: 'the phase while the element is entering the viewport.',
      exit: 'the phase while the element is exiting the viewport.',
      contain:
        'while the element is fully contained in the viewport. Typically used with a `position: sticky` container.',
      'entry-crossing':
        "from the element's leading edge entering to its leading edge reaching the opposite side.",
      'exit-crossing':
        "from the element's trailing edge reaching the start to its trailing edge leaving.",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // triggers
  // ═══════════════════════════════════════════════════════════════════════════
  triggers: {
    hover: {
      name: 'hover',
      a11yAlias: 'interest',
      a11yNote:
        "Use `trigger: 'interest'` instead of `trigger: 'hover'` to also respond to keyboard focus.",
      defaultTriggerType: 'alternate',
      flags: { hasReversed: false, hasEffectId: false, showMultipleEffectsNote: true },
      vars: {
        SOURCE_KEY:
          "identifier matching the element's key (`data-interact-key` for web, `interactKey` for React). The element that listens for hover.",
        TARGET_KEY:
          "identifier matching the element's key on the element that animates. Use a different key from `[SOURCE_KEY]` when source and target must be separated (see hit-area shift above).",
        FILL_MODE:
          "usually `'both'`. Keeps the final state applied while hovering, and prevents garbage-collection of animation when finished.",
        EASING_FUNCTION:
          "CSS easing string (e.g. `'ease-out'`, `'ease-in-out'`, `'cubic-bezier(0.4, 0, 0.2, 1)'`), or named easing from `@wix/motion`.",
        ITERATIONS:
          "optional. Number of iterations, or `Infinity` for continuous loops. Primarily useful with `triggerType: 'state'`.",
      },
      prose: {
        fillCritical:
          "Always include `fill: 'both'` for `triggerType: 'alternate'`, `'repeat'` — keeps the effect applied while hovering and prevents garbage-collection. For `triggerType: 'once'` use `fill: 'backwards'`.",
        customEffectExamples: '',
        offsetEasingSuffix: ' CSS easing string, or named easing from `@wix/motion`.',
      },
      pitfalls: [{ id: 'hit-area', variant: 'full-lean-hover' }],
      triggerTypes: {
        alternate: { full: 'plays forward on enter, reverses on leave. Default. Most common for hover.', short: 'Play on enter, reverse on leave' },
        repeat: { full: 'restarts the animation from the beginning on each enter. On leave, jumps to the beginning and pauses.', short: 'Play on enter, stop and rewind on leave' },
        once: { full: 'plays once on the first enter and never again.', short: 'Play once on first enter only' },
        state: { full: 'resumes on enter, pauses on leave. Useful for continuous loops (`iterations: Infinity`).', short: 'Play on enter, pause on leave' },
      },
      stateActions: {
        toggle: { full: 'applies the style state on enter, removes on leave. Default.', short: 'Add style state on enter, remove on leave' },
        add: { full: 'applies the style state on enter. Leave does NOT remove it.', short: 'Add style state on enter; leave does NOT remove' },
        remove: { full: "removes a previously applied style state on enter. Use with provided `effectId` to map to a matching interaction with `add` and effect with same `effectId`.", short: 'Remove style state on enter' },
        clear: { full: "clears all previously applied style states on enter. Use to reset multiple stacked `'add'` style changes at once (e.g. a \"reset\" hover area that undoes several accumulated states).", short: 'Clear/reset all style states on enter' },
      },
    },

    click: {
      name: 'click',
      a11yAlias: 'activate',
      a11yNote:
        "Use `trigger: 'activate'` instead of `trigger: 'click'` to also respond to keyboard activation (Enter / Space).",
      defaultTriggerType: 'alternate',
      flags: { hasReversed: true, hasEffectId: true, showMultipleEffectsNote: false },
      vars: {
        SOURCE_KEY:
          "identifier matching the element's key (`data-interact-key` for web, `interactKey` for React). The element that listens for clicks.",
        TARGET_KEY:
          "identifier matching the element's key on the element that animates. If missing it defaults to `[SOURCE_KEY]` for targeting the source element.",
        FILL_MODE:
          "optional. Always `'both'` with `triggerType: 'alternate'` or `'repeat'`, otherwise depends on the effect.",
        EASING_FUNCTION: 'CSS easing string, or named easing from `@wix/motion`.',
        ALTERNATE_BOOL:
          "optional. `true` to alternate direction on every other iteration (within a single playback). Different from `triggerType: 'alternate'` which alternates per click.",
      },
      prose: {
        fillCritical:
          "Always include `fill: 'both'` for `triggerType: 'alternate'` or `'repeat'` — keeps the effect applied while finished and prevents garbage-collection, allowing efficient toggling. For `triggerType: 'once'` use `fill: 'backwards'`.",
        customEffectExamples: ', randomized behavior',
        offsetEasingSuffix: '',
      },
      pitfalls: [],
      triggerTypes: {
        alternate: { full: 'plays forward on first click, reverses on next click. Default.', short: 'Alternate play/reverse per click' },
        repeat: { full: 'restarts the animation from the beginning on each click.', short: 'Restart per click' },
        once: { full: 'plays once on the first click and never again.', short: 'Play once on first click only' },
        state: { full: 'resumes/pauses the animation on each click. Useful for continuous loops (`iterations: Infinity`).', short: 'Toggle play/pause per click' },
      },
      stateActions: {
        toggle: { full: 'applies the style state, removes it on next click. Default.', short: 'Toggle style state per click' },
        add: { full: 'applies the style state. Does not remove on subsequent clicks.', short: 'Add style state on click' },
        remove: { full: 'removes a previously applied style state.', short: 'Remove style state on click' },
        clear: { full: 'clears all previously applied style states. Useful for resetting multiple stacked style states at once.', short: 'Clear/reset all style states' },
      },
    },

    viewEnter: {
      name: 'viewEnter',
      defaultTriggerType: 'once',
      flags: { hasReversed: false, hasEffectId: false, showMultipleEffectsNote: true },
      params: [
        { name: 'threshold', varName: 'VISIBILITY_THRESHOLD', type: 'number', optional: true, description: 'Number between 0–1 indicating how much of the source element must be visible to trigger (e.g. `0.3` = 30%).' },
        { name: 'inset', varName: 'VIEWPORT_INSETS', type: 'string', optional: true, description: "String adjusting the viewport detection area (e.g. `'-100px'` extends it, `'50px'` shrinks it)." },
      ],
      vars: {
        SOURCE_KEY:
          "identifier matching the element's key (`data-interact-key` for web, `interactKey` for React). The **source element** is observed for viewport intersection. This is the element the IntersectionObserver watches.",
        FILL_MODE:
          "`'both'` for `triggerType: 'alternate'`, `'repeat'`, or `'state'`. For `triggerType: 'once'`: use `'backwards'` when the animation's final keyframe has no additional effect (over element's base style); use `'both'` otherwise.",
        ITERATIONS:
          "optional. Number of iterations, or `Infinity` for continuous loops. Primarily useful with `triggerType: 'state'`.",
        CUSTOM_EFFECT_CALLBACK:
          "function with signature `(element: HTMLElement, progress: number) => void`. Called on each animation frame with `element` being the target element, and `progress` from 0 to 1.",
      },
      pitfalls: [{ id: 'same-element-viewenter', variant: 'short' }],
      triggerTypes: {
        once: {
          full: 'plays once when the source element first enters the viewport and never again. Source and target may be the same element.',
          short: 'Play once on first enter only',
          default: true,
        },
        repeat: { full: 'restarts the animation every time the source element enters the viewport. Use separate source and target.', short: 'Restart on each viewport enter' },
        alternate: { full: 'plays forward when the source element enters the viewport, reverses when it leaves. Use separate source and target.', short: 'Play on enter, reverse on leave' },
        state: { full: 'resumes on enter, pauses on leave. Useful for continuous loops (`iterations: Infinity`). Use separate source and target.', short: 'Play on enter, pause on leave' },
      },
    },

    viewProgress: {
      name: 'viewProgress',
      defaultTriggerType: null,
      flags: { hasReversed: false, hasEffectId: false, showMultipleEffectsNote: true },
      pitfalls: [{ id: 'overflow-clip', variant: 'short' }],
    },

    pointerMove: {
      name: 'pointerMove',
      defaultTriggerType: null,
      flags: { hasReversed: false, hasEffectId: false, showMultipleEffectsNote: true },
      params: [
        { name: 'hitArea', type: "'root' | 'self'", optional: true, description: 'determines where mouse movement is tracked' },
        { name: 'axis', type: "'x' | 'y'", optional: true, description: 'restricts pointer tracking to a single axis' },
      ],
      pitfalls: [{ id: 'hit-area', variant: 'pointermove-source' }],
    },

    animationEnd: {
      name: 'animationEnd',
      defaultTriggerType: null,
      flags: { hasReversed: false, hasEffectId: false, showMultipleEffectsNote: false },
      params: [{ name: 'effectId', type: 'string', optional: false, description: 'ID of the preceding effect' }],
      pitfalls: [],
    },

    pageVisible: {
      name: 'pageVisible',
      defaultTriggerType: null,
      flags: { hasReversed: false, hasEffectId: false, showMultipleEffectsNote: false },
      params: [],
      pitfalls: [],
    },
  },
};
