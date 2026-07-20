# Tech Glitch

Words split into individual interact-elements that reveal on viewEnter with a stepped glitch effect using clip-path wipe directions, skewX jitter, and chromatic text-shadow.

**Tags:** viewEnter, clip-path, transform, text-shadow, reveal, typography, stepped-easing

## Markup

```html
<div class="h-screen flex items-center justify-center text-center px-4">
  <div>
    <p class="mb-4 text-base">SYSTEM_STATUS: ONLINE</p>
    <p class="text-sm">SCROLL_DOWN_TO_INITIATE_DATA_STREAM</p>
  </div>
</div>

<main class="max-w-7xl mx-auto px-12 pb-80 space-y-96">
  <div class="flex flex-col items-start w-full max-w-3xl">
    <h1 aria-label="01_CRITICAL_FAILURE" class="text-2xl mb-5">
      <interact-element
        data-interact-key="h1-01-w-0"
        aria-hidden="true"
        style="display:inline-block;margin-right:0.3em"
      >
        <span class="glitch-word" style="opacity:1;clip-path:inset(0 100% 0 0)"
          >01_CRITICAL_FAILURE</span
        >
      </interact-element>
    </h1>
    <p aria-label="Data corruption detected in sector" class="text-base leading-relaxed">
      <interact-element
        data-interact-key="p-01-w-0"
        aria-hidden="true"
        style="display:inline-block;margin-right:0.3em"
      >
        <span class="glitch-word" style="opacity:1;clip-path:inset(0 0 0 100%)">Data</span>
      </interact-element>
      <interact-element
        data-interact-key="p-01-w-1"
        aria-hidden="true"
        style="display:inline-block;margin-right:0.3em"
      >
        <span class="glitch-word" style="opacity:1;clip-path:inset(100% 0 0 0)">corruption</span>
      </interact-element>
      <interact-element
        data-interact-key="p-01-w-2"
        aria-hidden="true"
        style="display:inline-block;margin-right:0.3em"
      >
        <span class="glitch-word" style="opacity:1;clip-path:inset(0 0 100% 0)">detected</span>
      </interact-element>
    </p>
  </div>

  <div class="flex flex-col items-end text-right w-full ml-auto max-w-3xl">
    <h1 aria-label="02_SYNTAX_ERROR" class="text-2xl mb-5">
      <interact-element
        data-interact-key="h1-02-w-0"
        aria-hidden="true"
        style="display:inline-block;margin-right:0.3em"
      >
        <span class="glitch-word" style="opacity:1;clip-path:inset(0 0 100% 0)"
          >02_SYNTAX_ERROR</span
        >
      </interact-element>
    </h1>
    <p aria-label="Unexpected token in input stream" class="text-base leading-relaxed">
      <interact-element
        data-interact-key="p-02-w-0"
        aria-hidden="true"
        style="display:inline-block;margin-right:0.3em"
      >
        <span class="glitch-word" style="opacity:1;clip-path:inset(0 100% 0 0)">Unexpected</span>
      </interact-element>
      <interact-element
        data-interact-key="p-02-w-1"
        aria-hidden="true"
        style="display:inline-block;margin-right:0.3em"
      >
        <span class="glitch-word" style="opacity:1;clip-path:inset(0 0 0 100%)">token</span>
      </interact-element>
      <interact-element
        data-interact-key="p-02-w-2"
        aria-hidden="true"
        style="display:inline-block;margin-right:0.3em"
      >
        <span class="glitch-word" style="opacity:1;clip-path:inset(100% 0 0 0)">in</span>
      </interact-element>
    </p>
  </div>
</main>

<div class="h-screen"></div>
```

## Essential styles

```css
body {
  overflow-x: clip;
  min-height: 100vh;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.glitch-word {
  display: inline-block;
  white-space: pre;
  will-change: transform, clip-path;
}

@media (prefers-reduced-motion: reduce) {
  .glitch-word {
    opacity: 1 !important;
    clip-path: inset(0 0 0 0) !important;
    transform: none !important;
  }
}
```

## Interact config

```js
const getGlitchKeyframes = (direction) => {
  let startClip = '';
  switch (direction) {
    case 0:
      startClip = 'inset(0 100% 0 0)';
      break;
    case 1:
      startClip = 'inset(0 0 0 100%)';
      break;
    case 2:
      startClip = 'inset(100% 0 0 0)';
      break;
    case 3:
      startClip = 'inset(0 0 100% 0)';
      break;
  }
  const red = 'rgba(255,0,0,0.7)';
  const cyan = 'rgba(0,255,255,0.7)';
  return [
    {
      offset: 0,
      clipPath: startClip,
      transform: 'skewX(10deg) translateX(-5px)',
      textShadow: `2px 0 ${red}, -2px 0 ${cyan}`,
    },
    {
      offset: 0.1,
      clipPath: startClip.replace('100%', '80%'),
      transform: 'skewX(-10deg) translateX(3px)',
      textShadow: `-2px 0 ${red}, 2px 0 ${cyan}`,
    },
    {
      offset: 0.2,
      clipPath: startClip.replace('100%', '90%'),
      transform: 'skewX(20deg) translateX(-2px)',
      textShadow: `1px 1px ${red}, -1px -1px ${cyan}`,
    },
    {
      offset: 0.3,
      clipPath: startClip.replace('100%', '40%'),
      transform: 'skewX(-5deg) translateX(2px)',
      textShadow: `0px 2px ${red}, 0px -2px ${cyan}`,
    },
    {
      offset: 0.5,
      clipPath: startClip.replace('100%', '60%'),
      transform: 'skewX(0deg) translateX(0px)',
      textShadow: `3px 0 ${red}, -3px 0 ${cyan}`,
    },
    {
      offset: 0.7,
      clipPath: startClip.replace('100%', '20%'),
      transform: 'skewX(5deg) translateX(-1px)',
      textShadow: `-1px 0 ${red}, 1px 0 ${cyan}`,
    },
    {
      offset: 0.8,
      clipPath: 'inset(0 0 0 0)',
      transform: 'skewX(-2deg) translateX(1px)',
      textShadow: `0px 0px ${red}, 0px 0px ${cyan}`,
    },
    {
      offset: 0.9,
      clipPath: startClip.replace('100%', '10%'),
      transform: 'skewX(0deg) translateX(0px)',
      textShadow: `1px 0 ${red}, -1px 0 ${cyan}`,
    },
    {
      offset: 1,
      clipPath: 'inset(0 0 0 0)',
      transform: 'skewX(0deg) translateX(0px)',
      textShadow: 'none',
    },
  ];
};

const wordEntries = [
  { key: 'h1-01-w-0', dir: 0 },
  { key: 'p-01-w-0', dir: 1 },
  { key: 'p-01-w-1', dir: 2 },
  { key: 'p-01-w-2', dir: 3 },
  { key: 'h1-02-w-0', dir: 3 },
  { key: 'p-02-w-0', dir: 0 },
  { key: 'p-02-w-1', dir: 1 },
  { key: 'p-02-w-2', dir: 2 },
];

const interactions = wordEntries.map(({ key, dir }) => ({
  key,
  trigger: 'viewEnter',
  params: { threshold: 0, inset: '20%' },
  effects: [
    {
      triggerType: 'once',
      keyframeEffect: {
        name: `glitch-${key}`,
        keyframes: getGlitchKeyframes(dir),
      },
      duration: 700,
      easing: 'steps(6, end)',
      fill: 'both',
    },
  ],
}));

const config = { interactions };
```
