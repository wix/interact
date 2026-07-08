/** Interact configs used only for build-time `generate()` FOUC CSS. */

const TILT_UP_OPTS = {
  name: 'tiltUp',
  keyframes: [
    {
      opacity: 0,
      transform: 'translateY(80px) rotateX(60deg) scale(0.9)',
      transformOrigin: 'center top',
    },
    {
      opacity: 1,
      transform: 'translateY(0) rotateX(0deg) scale(1)',
      transformOrigin: 'center top',
    },
  ],
};

/** Landing page (`index.html`) — viewEnter entrances for FOUC CSS generation. */
export const landingPageConfig = {
  interactions: [
    {
      key: 'perf-text',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'backwards',
          keyframeEffect: { ...TILT_UP_OPTS },
          duration: 1000,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        },
      ],
    },
    {
      key: 'perf-text-2',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'backwards',
          keyframeEffect: { ...TILT_UP_OPTS },
          duration: 1000,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        },
      ],
    },
    {
      key: 'hero-line-1',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'backwards',
          keyframeEffect: { ...TILT_UP_OPTS },
          duration: 900,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
          delay: 100,
        },
      ],
    },
    {
      key: 'hero-line-2',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'backwards',
          keyframeEffect: { ...TILT_UP_OPTS },
          duration: 900,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
          delay: 250,
        },
      ],
    },
    {
      key: 'hero-subtitle',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'backwards',
          namedEffect: { type: 'FadeIn', direction: 'bottom', distance: '30px' },
          duration: 1200,
          easing: 'ease-out',
          delay: 600,
        },
      ],
    },
    {
      key: 'nav-logo',
      trigger: 'viewEnter',
      effects: [{ fill: 'backwards', namedEffect: { type: 'FadeIn' }, duration: 1000 }],
    },
    {
      key: 'nav-cta',
      trigger: 'viewEnter',
      effects: [{ fill: 'backwards', namedEffect: { type: 'FadeIn' }, duration: 1000, delay: 200 }],
    },
    {
      key: 'tailored-header',
      trigger: 'viewEnter',
      effects: [
        {
          triggerType: 'once',
          fill: 'backwards',
          namedEffect: { type: 'FadeIn', distance: '40px', direction: 'bottom' },
          duration: 800,
        },
      ],
    },
    {
      key: 'tailored-col-1',
      trigger: 'viewEnter',
      effects: [
        {
          triggerType: 'once',
          fill: 'backwards',
          namedEffect: { type: 'FadeIn', distance: '40px', direction: 'bottom' },
          duration: 800,
          delay: 100,
        },
      ],
    },
    {
      key: 'tailored-col-2',
      trigger: 'viewEnter',
      effects: [
        {
          triggerType: 'once',
          fill: 'backwards',
          namedEffect: { type: 'FadeIn', distance: '40px', direction: 'bottom' },
          duration: 800,
          delay: 200,
        },
      ],
    },
    {
      key: 'tailored-col-3',
      trigger: 'viewEnter',
      effects: [
        {
          triggerType: 'once',
          fill: 'backwards',
          namedEffect: { type: 'FadeIn', distance: '40px', direction: 'bottom' },
          duration: 800,
          delay: 300,
        },
      ],
    },
    {
      key: 'footer-brand',
      trigger: 'viewEnter',
      effects: [{ fill: 'backwards', namedEffect: { type: 'FadeIn' }, duration: 600 }],
    },
    {
      key: 'footer-link',
      trigger: 'viewEnter',
      effects: [{ fill: 'backwards', namedEffect: { type: 'FadeIn' }, duration: 600, delay: 100 }],
    },
  ],
};

/** Examples gallery shell (`examples.html`). */
export const examplesPageConfig = {
  interactions: [
    {
      key: 'page-sidebar',
      trigger: 'viewEnter',
      effects: [{ effectId: 'float-left' }],
    },
    {
      key: 'page-connector',
      trigger: 'viewEnter',
      effects: [{ effectId: 'fade-in' }],
    },
    {
      key: 'page-content',
      trigger: 'viewEnter',
      effects: [{ effectId: 'float-bottom' }],
    },
  ],
  effects: {
    'float-left': {
      duration: 700,
      delay: 150,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both',
      namedEffect: { type: 'FloatIn', direction: 'left' },
    },
    'fade-in': {
      duration: 500,
      delay: 200,
      easing: 'ease',
      fill: 'both',
      namedEffect: { type: 'FadeIn' },
    },
    'float-bottom': {
      duration: 700,
      delay: 200,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both',
      namedEffect: { type: 'FloatIn', direction: 'bottom' },
    },
  },
};

/** View-enter demo (`assets/examples/basic/view-enter.html`). */
export const viewEnterDemoConfig = {
  interactions: [
    {
      key: 'circle-top',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'both',
          duration: 900,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          delay: 0,
          keyframeEffect: {
            name: 'slideTop',
            keyframes: [
              { opacity: 0, transform: 'translate(-200px, -80px)' },
              { opacity: 1, transform: 'translate(0, -80px)' },
            ],
          },
        },
      ],
    },
    {
      key: 'circle-right',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'both',
          duration: 900,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          delay: 100,
          keyframeEffect: {
            name: 'slideRight',
            keyframes: [
              { opacity: 0, transform: 'translate(80px, -200px)' },
              { opacity: 1, transform: 'translate(80px, 0)' },
            ],
          },
        },
      ],
    },
    {
      key: 'circle-bottom',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'both',
          duration: 900,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          delay: 200,
          keyframeEffect: {
            name: 'slideBottom',
            keyframes: [
              { opacity: 0, transform: 'translate(200px, 80px)' },
              { opacity: 1, transform: 'translate(0, 80px)' },
            ],
          },
        },
      ],
    },
    {
      key: 'circle-left',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'both',
          duration: 900,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          delay: 300,
          keyframeEffect: {
            name: 'slideLeft',
            keyframes: [
              { opacity: 0, transform: 'translate(-80px, 200px)' },
              { opacity: 1, transform: 'translate(-80px, 0)' },
            ],
          },
        },
      ],
    },
  ],
};
