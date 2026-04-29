import type { EvalScenario } from './types';

/**
 * Focused evaluation scenarios. Each scenario targets a single trigger type
 * with minimal but complete HTML to keep LLM generation fast (~30-60s each).
 */
export const scenarios: EvalScenario[] = [
  {
    id: 'viewEnter-once',
    name: 'viewEnter once entrance',
    prompt: `Generate a complete HTML page with a section containing a heading that fades in when scrolled into view. Use @wix/interact viewEnter trigger (once). Use a named effect preset from @wix/motion-presets. Prevent FOUC. Include registerEffects, Interact.create, and destroy.`,
  },

  {
    id: 'viewEnter-alternate',
    name: 'viewEnter alternate in/out',
    prompt: `Generate a complete HTML page with a card that animates in when scrolled into view and animates out when scrolled away. Use @wix/interact viewEnter trigger with triggerType "alternate". Use a named effect preset. Include registerEffects, Interact.create, and destroy.`,
  },

  {
    id: 'viewProgress-scroll',
    name: 'viewProgress scroll-driven',
    prompt: `Generate a complete HTML page with a progress bar that fills as the user scrolls. Use @wix/interact viewProgress trigger with a scroll preset from @wix/motion-presets. Use linear easing. Include registerEffects, Interact.create, and destroy.`,
  },

  {
    id: 'hover-interest',
    name: 'hover with a11y interest',
    prompt: `Generate a complete HTML page with a card that scales up on hover. Use @wix/interact hover trigger with triggerType "alternate". Also include an interest trigger for keyboard a11y. Call Interact.allowA11yTriggers. Include Interact.create and destroy.`,
  },

  {
    id: 'click-activate',
    name: 'click with a11y activate',
    prompt: `Generate a complete HTML page with a panel that toggles visibility on click. Use @wix/interact click trigger. Include an activate trigger for keyboard a11y. Use state effects with transition. Call Interact.allowA11yTriggers. Include Interact.create and destroy.`,
  },

  {
    id: 'pointerMove-tracking',
    name: 'pointerMove mouse tracking',
    prompt: `Generate a complete HTML page with a card that tilts following the mouse position. Use @wix/interact pointerMove trigger with a mouse preset. Add a (hover: hover) media condition. Include registerEffects, Interact.create, and destroy.`,
  },

  {
    id: 'animationEnd-chain',
    name: 'animationEnd chained sequence',
    prompt: `Generate a complete HTML page where a heading fades in on viewEnter, then after the heading animation completes (animationEnd trigger with params.effectId), an icon scales in. Use named effect presets. Prevent FOUC on both. Include registerEffects, Interact.create, and destroy.`,
  },

  {
    id: 'reduced-motion',
    name: 'prefers-reduced-motion',
    prompt: `Generate a complete HTML page with a heading that fades in on viewEnter. Include a prefers-reduced-motion condition that disables the animation. Use a named effect preset. Prevent FOUC. Include registerEffects, Interact.create, and destroy.`,
  },
];
