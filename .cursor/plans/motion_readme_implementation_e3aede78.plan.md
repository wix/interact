---
name: Motion README Implementation
overview: Rewrite the @wix/motion README.md to correctly position it as the low-level animation engine underpinning @wix/interact, emphasizing native WAAPI/CSS rendering, ViewTimeline scroll-driving, pointer animations, custom effects, and polyfill support — while removing incorrect claims (82+ presets, GSAP compatibility, UNLICENSED).
todos:
  - id: write-readme
    content: Write the new packages/motion/README.md following the section structure above
    status: pending
  - id: verify-examples
    content: Verify code examples compile against actual API signatures in src/motion.ts and src/api/
    status: pending
isProject: false
---

# Motion Package README Implementation Plan

## Problems with the Current README

The existing [`packages/motion/README.md`](packages/motion/README.md) has several factual and positioning issues:

- Claims "82+ presets" and lists preset categories — these belong in `@wix/motion-presets`
- Says "UNLICENSED" while `package.json` declares MIT
- Claims GSAP/Framer Motion "compatibility" which is just plain wrong
- Uses emoji headers (inconsistent with best-practice OSS READMEs)
- Fails to position Motion as the **engine layer** beneath Interact
- Doesn't showcase the dual-rendering (WAAPI + CSS) architecture properly
- Doesn't explain the relationship to polyfills or custom effects

## Target Positioning

**Motion is the low-level, web-native animation engine.** It wraps nothing — it targets the Web Animations API and CSS animations directly. Interact is the declarative layer above it. Presets are a separate catalog that registers into Motion's effect system.

## Proposed Section Structure

### 1. Title + One-Liner

```markdown
# @wix/motion

Low-level, web-native animation engine — WAAPI, CSS, scroll-driven, and pointer-tracking animations with a single dependency.
```

No emoji. Clean. Matches the `package.json` description tone.

### 2. Badges Row

- npm version (`@wix/motion`)
- Bundle size (bundlephobia)
- License: MIT

### 3. Why Motion? (Value Proposition)

5-6 bullet points emphasizing the user's requested qualities:

- **Native-first**: Built directly on WAAPI and CSS Animations — no custom runtime or interpolation loop
- **ViewTimeline**: First-class scroll-driven animations via the ViewTimeline API, with built-in fallback scrubbing when the API is unavailable
- **Pointer-driven**: `pointer-move` animations mapping (x, y) progress to effects, with transition smoothing
- **Custom effects**: Plug in programmatic `(element, progress) => void` callbacks or define inline `keyframeEffect` keyframes
- **Dual rendering**: Choose WAAPI for control or CSS for compositor-thread performance — same options shape for both
- **Performance**: fastdom batching for DOM reads/writes; zero layout thrashing
- **Pluggable presets**: `registerEffects()` accepts any effect module (use `@wix/motion-presets` or roll your own)

### 4. Install

```bash
npm install @wix/motion
```

### 5. Quick Start

Two concise examples from the **actual API** (verified against source):

**Time-based animation (WAAPI):**

```typescript
import { getWebAnimation } from '@wix/motion';

const animation = getWebAnimation(document.getElementById('hero'), {
  keyframeEffect: {
    name: 'fade-up',
    keyframes: [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
  duration: 600,
  easing: 'easeOut',
});

animation.play();
```

**Scroll-driven (ViewTimeline):**

```typescript
import { getWebAnimation } from '@wix/motion';

const scenes = getWebAnimation(
  document.getElementById('parallax'),
  {
    keyframeEffect: {
      name: 'parallax',
      keyframes: [{ transform: 'translateY(80px)' }, { transform: 'translateY(-80px)' }],
    },
    startOffset: { name: 'cover', value: { unit: 'percentage', value: 0 } },
    endOffset: { name: 'cover', value: { unit: 'percentage', value: 100 } },
  },
  { trigger: 'view-progress', element: scrollRoot },
);
```

**Scroll-driven (without ViewTimeline support):**

```typescript
import { getScrubScene } from '@wix/motion';

const scenes = getScrubScene(
  document.getElementById('parallax'),
  {
    keyframeEffect: {
      name: 'parallax',
      keyframes: [{ transform: 'translateY(80px)' }, { transform: 'translateY(-80px)' }],
    },
    startOffset: { name: 'cover', value: { unit: 'percentage', value: 0 } },
    endOffset: { name: 'cover', value: { unit: 'percentage', value: 100 } },
  },
  { trigger: 'view-progress', element: scrollRoot },
);
```

Use `keyframeEffect` (inline keyframes) rather than `namedEffect` in examples — keeps quickstart self-contained without preset registration.

### 6. Animation Modes

Brief descriptions of the three driving modes with when-to-use guidance:

| Mode           | Driver                        | API                                            |
| -------------- | ----------------------------- | ---------------------------------------------- |
| Time-based     | Duration + easing             | `getWebAnimation()` / `getCSSAnimation()`      |
| Scroll-driven  | ViewTimeline / external scrub | `getScrubScene()` with `view-progress` trigger |
| Pointer-driven | Mouse/touch position          | `getScrubScene()` with `pointer-move` trigger  |

### 7. Core API Table

Scannable table of main exports linking to docs:

| Function             | Purpose                                                     |
| -------------------- | ----------------------------------------------------------- |
| `getWebAnimation()`  | Create WAAPI-backed animations (time or scroll)             |
| `getCSSAnimation()`  | Generate CSS animation descriptors for stylesheet injection |
| `getScrubScene()`    | Build scroll polyfill/custom or pointer-driven scrub scenes |
| `prepareAnimation()` | Pre-measure/mutate DOM via fastdom before animating         |
| `getAnimation()`     | Auto-select CSS (if present) or WAAPI path                  |
| `getSequence()`      | Coordinate staggered groups with easing-based offsets       |
| `registerEffects()`  | Register named effect modules into the global registry      |

### 8. Custom Effects

Short section showing the three customization paths:

1. **Inline keyframes** (`keyframeEffect`) — define keyframes directly
2. **Custom callback** (`customEffect: (el, progress) => void`) — full programmatic control per frame
3. **Named presets** (`namedEffect`) — use registered effects from `@wix/motion-presets` or custom modules

### 9. Sequences and Staggering

Brief paragraph + compact example from [`src/Sequence.ts`](packages/motion/src/Sequence.ts) showing `getSequence()` with offset easing. Reference the stagger model from docs.

### 10. ViewTimeline and Polyfills

Explain the progressive enhancement story:

- When `window.ViewTimeline` is available → native scroll-linked animation
- When absent → `getScrubScene()` returns `ScrubScrollScene[]` objects with an `effect(progress)` method for external drivers (e.g., `fizban` in Interact, or your own IntersectionObserver/scroll listener)
- Pointer polyfill story: `ScrubPointerScene` supports `transitionDuration` / `transitionEasing` for smoothed pointer tracking

### 11. Performance Notes

- fastdom batching (`prepareAnimation` runs measure/mutate phases)
- CSS rendering path offloads to compositor thread
- No `requestAnimationFrame` loop unless `customEffect` callback is used

### 12. Browser Support

Baseline — wide availability, with options for polyfill integration.

### 13. Related Packages

- `@wix/interact` — declarative, config-driven layer built on Motion
- `@wix/motion-presets` — ready-made effect catalog (entrance, scroll, pointer, etc.)

### 14. Documentation Links

Link to `docs/` subdirectory files: getting-started, core-concepts, API reference, category guides, advanced patterns.

### 15. License

```
MIT
```

## Key Decisions

- **No preset catalog in this README** — all preset content moves to / stays in `@wix/motion-presets`
- **No emoji headers** — clean markdown, matches top-tier OSS style (Motion, GSAP, Lenis)
- **Examples use `keyframeEffect`** not `namedEffect` — keeps quickstart zero-config (no preset registration needed)
- **Engine positioning** — the first sentence and value prop section make it clear this is the foundation layer
- **Fix license** — MIT per `package.json`
- **Remove false claims** — no GSAP compatibility, no "82+ presets", no "framework compatibility" claims that aren't real
