---
name: motion-presets
description: Reference for selecting and configuring Interact motion presets. Read when applying entrance, scroll, ongoing, or mouse animations to elements, choosing presets by atmosphere or tone, combining effects, or handling accessibility and reduced motion.
---

# Motion Presets Reference

## Table of Contents

- [Terminology](#terminology)
- [Preset Categories](#preset-categories)
- [Trigger and Effect Binding](#trigger-and-effect-binding)
- [Combining Effects](#combining-effects)
- [Parameter Standards](#parameter-standards)
- [Available Presets](#available-presets)
- [Selection by Atmosphere](#selection-by-atmosphere)
- [Selection Recommendations](#selection-recommendations)
- [Cross-Category Parallels](#cross-category-parallels)
- [Accessibility](#accessibility)

## Terminology

| Term          | Meaning                                                                                 |
| ------------- | --------------------------------------------------------------------------------------- |
| **Effect**    | Interact's term for an operation applied to an element (animation, custom effect, etc.) |
| **Preset**    | A pre-built, named effect configuration from this library (e.g., `FadeIn`, `BounceIn`)  |
| **Animation** | The actual visual motion that runs in the browser (CSS or WAAPI)                        |

A preset is a named effect. "Preset" is used when talking about selection and configuration; "effect" when talking about the Interact runtime; "animation" when referring to the visual motion or CSS/WAAPI mechanism.

## Preset Categories

| Category | Optimized For                                      | Implementation                              | Notes                                                                   |
| -------- | -------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| entrance | When an element enters the viewport                | `viewEnter` (intersection observer)         | Can also be triggered by hover, click, animationend, and other triggers |
| scroll   | Scroll position of an element relative to document | ViewTimeline (scroll progress)              | Animation progress tied to element's position in the viewport           |
| ongoing  | Continuous loop                                    | infinite CSS/WAAPI animation                | Runs indefinitely until stopped                                         |
| mouse    | Follow or Repel by Pointer position                | transform values driven by pointer position | Real-time response to cursor position; may behave differently on mobile |

For full parameter details per category, see the dedicated reference files:

- [Entrance Presets](./entrance-presets.md)
- [Scroll Presets](./scroll-presets.md)
- [Ongoing Presets](./ongoing-presets.md)
- [Mouse Presets](./mouse-presets.md)

## Trigger and Effect Binding

In the simplest case, a trigger and its effect are bound to the same element. However, an effect on one element can also be triggered by another element (e.g., hovering a button triggers a FadeIn on a sibling panel).

## Combining Effects

1. Avoid mixing multiple effects on the same element at the same time when possible
2. Never combine effects that affect the same CSS properties (e.g., two effects both using `transform`)
3. When combining is necessary, effect order matters — later effects may override earlier ones
4. If possible, use nested containers to separate effects that would conflict — place each effect on a separate wrapper element. Note: here also order matters

## Parameter Standards

### Animation Options (Not Preset Parameters)

These are set on the effect configuration level, not on the preset itself:

- `duration`: Animation duration in ms (entrance, ongoing)
- `delay`: Animation start delay in ms (entrance, ongoing)
- `easing`: Easing function
- `iterations`: Number of iterations
- `alternate`: Alternate direction on each iteration
- `fill`: Animation fill mode
- `reversed`: Reverse the animation

**Ongoing-specific preset parameter:**

- `iterationDelay`: Idle time in ms appended after each active iteration cycle. Available on all ongoing presets except DVD. This compresses the active animation keyframes into a fraction of the total iteration duration, creating a pause between repetitions. Set on the `namedEffect`, not on the animation options.

**Scroll-specific animation options:**

- `rangeStart` / `rangeEnd`: `RangeOffset` controlling when the scroll animation starts/ends
- `transitionDuration` / `transitionDelay` / `transitionEasing`: Transition smoothing

### Overloaded Parameter Names

The `direction` parameter accepts different values depending on the preset:

| Meaning            | Accepted Values                                           | Presets                                                                                                              |
| ------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Cardinal           | 'top', 'right', 'bottom', 'left'                          | FlipIn, FoldIn, SlideIn, FloatIn, RevealIn, ShuttersIn, Poke, Swing, Fold, RevealScroll, ShuttersScroll, SlideScroll |
| Cardinal + center  | 'top', 'right', 'bottom', 'left', 'center'                | BounceIn                                                                                                             |
| Two sides          | 'left', 'right'                                           | TiltIn, PanScroll, SkewPanScroll, TiltScroll, TurnScroll                                                             |
| Two sides + pseudo | 'left', 'right', 'pseudoLeft', 'pseudoRight'              | CurveIn                                                                                                              |
| Corner             | 'top-left', 'top-right', 'bottom-left', 'bottom-right'    | TurnIn                                                                                                               |
| Eight directions   | 4 cardinal + 4 diagonal                                   | Cross                                                                                                                |
| Nine directions    | 4 cardinal + 4 diagonal + 'center'                        | GrowScroll, ShrinkScroll                                                                                             |
| Axis               | 'horizontal', 'vertical'                                  | WinkIn, ArcScroll, FlipScroll, Flip                                                                                  |
| Axis + center      | 'horizontal', 'vertical', 'center'                        | Breathe                                                                                                              |
| Rotation           | 'clockwise', 'counter-clockwise'                          | SpinIn, SpinScroll, Spin                                                                                             |
| Angle (number)     | 0–360 (0° = right, 90° = top, 180° = left, 270° = bottom) | GlideIn, ExpandIn                                                                                                    |

### Using Units

Interact supports both an object (e.g., `distance: { value: 120, unit: 'px' }`, typed as `UnitLengthPercentage`) and flat string values (e.g., `distance: '120px'`).

Prefer the object notation. Be consistent within a configuration — use one format, not both.

### Coordinate System

**Standard:** 0° = right (east), angles increase counter-clockwise

- 0° = right (east)
- 90° = top (north)
- 180° = left (west)
- 270° = bottom (south)

### Distance Units

Supported unit types: `px`, `em`, `rem`, `vh`, `vw`, `vmin`, `vmax`, `percentage`

```typescript
distance: { value: 120, unit: 'px' }       // pixels
distance: { value: 50, unit: 'percentage' } // percentage
distance: { value: 10, unit: 'vh' }        // viewport height
```

### CSS Custom Properties

The library uses these CSS custom properties for runtime control:

- `--motion-rotate`: Element rotation (used by SpinIn and other rotation presets)

## Available Presets

### Entrance (19 presets)

FadeIn, ArcIn, BlurIn, BounceIn, CurveIn, DropIn, ExpandIn, FlipIn, FloatIn, FoldIn, GlideIn, RevealIn, ShapeIn, ShuttersIn, SlideIn, SpinIn, TiltIn, TurnIn, WinkIn

→ [Full entrance preset reference](./entrance-presets.md)

### Scroll (19 presets)

ArcScroll, BlurScroll, FadeScroll, FlipScroll, GrowScroll, MoveScroll, PanScroll, ParallaxScroll, RevealScroll, ShapeScroll, ShrinkScroll, ShuttersScroll, SkewPanScroll, SlideScroll, Spin3dScroll, SpinScroll, StretchScroll, TiltScroll, TurnScroll

→ [Full scroll preset reference](./scroll-presets.md)

### Ongoing (14 presets)

Bounce, Breathe, Cross, DVD, Flash, Flip, Fold, Jello, Poke, Pulse, Rubber, Spin, Swing, Wiggle

→ [Full ongoing preset reference](./ongoing-presets.md)

### Mouse (11 presets)

AiryMouse, BlobMouse, BlurMouse, BounceMouse, ScaleMouse, SkewMouse, SpinMouse, SwivelMouse, Tilt3DMouse, Track3DMouse, TrackMouse

→ [Full mouse preset reference](./mouse-presets.md)

## Selection by Atmosphere

### Playful / Fun / Whimsical

Keywords: playful, fun, quirky, whimsical, lighthearted, bouncy, cheerful, cute, charming, goofy, jiggly, cheeky, springy, joyful, upbeat, poppy, friendly, casual, funky, groovy, surprising

| Effect | Trigger  | Preset      |
| ------ | -------- | ----------- |
| Wink   | entrance | WinkIn      |
| Wiggle | loop     | Wiggle      |
| Jello  | loop     | Jello       |
| Poke   | loop     | Poke        |
| DVD    | loop     | DVD         |
| Cross  | loop     | Cross       |
| Spin   | entrance | SpinIn      |
| Spin   | scroll   | SpinScroll  |
| Spin   | loop     | Spin        |
| Flip   | entrance | FlipIn      |
| Flip   | scroll   | FlipScroll  |
| Flip   | loop     | Flip        |
| Bounce | entrance | BounceIn    |
| Bounce | loop     | Bounce      |
| Bounce | mouse    | BounceMouse |
| Swing  | loop     | Swing       |
| Blob   | mouse    | BlobMouse   |
| Rubber | loop     | Rubber      |
| Track  | mouse    | TrackMouse  |
| Swivel | mouse    | SwivelMouse |

### Smooth / Elegant / Refined

Keywords: smooth, elegant, graceful, flowing, refined, sophisticated, polished, seamless, effortless, silky, controlled, classic, curved, rhythmic, continuous, circular, pendular, mesmerizing

| Effect | Trigger  | Preset       |
| ------ | -------- | ------------ |
| Glide  | entrance | GlideIn      |
| Swivel | mouse    | SwivelMouse  |
| Turn   | entrance | TurnIn       |
| Turn   | scroll   | TurnScroll   |
| Arc    | entrance | ArcIn        |
| Arc    | scroll   | ArcScroll    |
| Slide  | entrance | SlideIn      |
| Slide  | scroll   | SlideScroll  |
| Move   | scroll   | MoveScroll   |
| Fold   | entrance | FoldIn       |
| Fold   | loop     | Fold         |
| Shape  | entrance | ShapeIn      |
| Shape  | scroll   | ShapeScroll  |
| Fade   | entrance | FadeIn       |
| Fade   | scroll   | FadeScroll   |
| Blur   | entrance | BlurIn       |
| Blur   | scroll   | BlurScroll   |
| Blur   | mouse    | BlurMouse    |
| Float  | entrance | FloatIn      |
| Airy   | mouse    | AiryMouse    |
| Pulse  | loop     | Pulse        |
| Swing  | loop     | Swing        |
| Shrink | entrance | DropIn       |
| Shrink | scroll   | ShrinkScroll |

### Bold / Energetic / Dynamic

Keywords: bold, dynamic, energetic, fast, impactful, attention-grabbing, eye-catching, striking, lively, electric, bright, sharp, snappy, quick, welcoming, opening, confident, blooming, emerging

| Effect   | Trigger  | Preset         |
| -------- | -------- | -------------- |
| 3D spin  | scroll   | Spin3dScroll   |
| Tilt     | entrance | TiltIn         |
| Tilt     | scroll   | TiltScroll     |
| Resize   | mouse    | ScaleMouse     |
| Spin     | entrance | SpinIn         |
| Spin     | scroll   | SpinScroll     |
| Spin     | loop     | Spin           |
| Flip     | entrance | FlipIn         |
| Flip     | scroll   | FlipScroll     |
| Flip     | loop     | Flip           |
| Shutters | entrance | ShuttersIn     |
| Shutters | scroll   | ShuttersScroll |
| Bounce   | entrance | BounceIn       |
| Bounce   | loop     | Bounce         |
| Grow     | scroll   | GrowScroll     |
| Flash    | loop     | Flash          |
| Expand   | entrance | ExpandIn       |
| Stretch  | scroll   | StretchScroll  |

### Soft / Gentle / Organic

Keywords: soft, gentle, delicate, light, airy, breezy, wispy, floating, ethereal, dreamy, cloudy, hazy, atmospheric, gradual, subtle, calm, soothing, natural, zen, meditative, serene, relaxed, breathing, alive, organic

| Effect  | Trigger  | Preset       |
| ------- | -------- | ------------ |
| Breathe | loop     | Breathe      |
| Float   | entrance | FloatIn      |
| Airy    | mouse    | AiryMouse    |
| Blur    | entrance | BlurIn       |
| Blur    | scroll   | BlurScroll   |
| Blur    | mouse    | BlurMouse    |
| Fade    | entrance | FadeIn       |
| Fade    | scroll   | FadeScroll   |
| Pulse   | loop     | Pulse        |
| Shrink  | entrance | DropIn       |
| Shrink  | scroll   | ShrinkScroll |
| Expand  | entrance | ExpandIn     |

### Dramatic / Cinematic / Theatrical

Keywords: dramatic, cinematic, theatrical, staged, sweeping, intimate, focused, detailed, revealing

| Effect   | Trigger  | Preset         |
| -------- | -------- | -------------- |
| Shutters | entrance | ShuttersIn     |
| Shutters | scroll   | ShuttersScroll |
| Parallax | scroll   | ParallaxScroll |
| Expand   | entrance | ExpandIn       |
| Reveal   | entrance | RevealIn       |
| Reveal   | scroll   | RevealScroll   |

### Modern / Tech / Immersive

Keywords: modern, tech, immersive, dimensional, spatial, 3d, depth, layered, innovative, interactive, responsive, engaging, following

| Effect   | Trigger  | Preset         |
| -------- | -------- | -------------- |
| Tilt 3D  | mouse    | Tilt3DMouse    |
| Track 3D | mouse    | Track3DMouse   |
| Track    | mouse    | TrackMouse     |
| Skew     | mouse    | SkewMouse      |
| Spin     | mouse    | SpinMouse      |
| 3D spin  | scroll   | Spin3dScroll   |
| Parallax | scroll   | ParallaxScroll |
| Resize   | mouse    | ScaleMouse     |
| Blur     | entrance | BlurIn         |
| Blur     | scroll   | BlurScroll     |
| Blur     | mouse    | BlurMouse      |
| Fold     | entrance | FoldIn         |
| Fold     | loop     | Fold           |

### Creative / Experimental / Edgy

Keywords: creative, artistic, experimental, unconventional, edgy, distorted, unique, expressive, graphic, transformative, fluid, liquid, elastic, flexible, stretchy

| Effect  | Trigger  | Preset        |
| ------- | -------- | ------------- |
| Skew    | mouse    | SkewMouse     |
| Tilt    | entrance | TiltIn        |
| Tilt    | scroll   | TiltScroll    |
| Shape   | entrance | ShapeIn       |
| Shape   | scroll   | ShapeScroll   |
| Blob    | mouse    | BlobMouse     |
| Spin    | mouse    | SpinMouse     |
| Cross   | loop     | Cross         |
| Stretch | scroll   | StretchScroll |
| Rubber  | loop     | Rubber        |

### Clean / Professional / Minimal

Keywords: clean, structured, organized, directional, purposeful, direct, simple, straightforward, progressive, minimalist, precise, understated, professional

| Effect | Trigger  | Preset       |
| ------ | -------- | ------------ |
| Slide  | entrance | SlideIn      |
| Slide  | scroll   | SlideScroll  |
| Move   | scroll   | MoveScroll   |
| Fold   | entrance | FoldIn       |
| Fold   | loop     | Fold         |
| Reveal | entrance | RevealIn     |
| Reveal | scroll   | RevealScroll |
| Shrink | entrance | DropIn       |
| Shrink | scroll   | ShrinkScroll |

## Selection Recommendations

1. Do not add entrance presets (or any animation that starts with opacity 0) to `<h1>` elements in the first fold
2. Do not add scroll-in animations in the first fold
3. Do not add scroll-out animations in the last fold

## Cross-Category Parallels

| Entrance   | Scroll         | Ongoing | Mouse       |
| ---------- | -------------- | ------- | ----------- |
| FadeIn     | FadeScroll     | Flash   | -           |
| ArcIn      | ArcScroll      | -       | -           |
| SpinIn     | SpinScroll     | Spin    | SpinMouse   |
| BounceIn   | -              | Bounce  | BounceMouse |
| TiltIn     | TiltScroll     | -       | Tilt3DMouse |
| FlipIn     | FlipScroll     | Flip    | -           |
| FoldIn     | -              | Fold    | -           |
| ExpandIn   | GrowScroll     | Pulse   | ScaleMouse  |
| SlideIn    | SlideScroll    | -       | TrackMouse  |
| BlurIn     | BlurScroll     | -       | BlurMouse   |
| RevealIn   | RevealScroll   | -       | -           |
| ShapeIn    | ShapeScroll    | -       | -           |
| ShuttersIn | ShuttersScroll | -       | -           |
| TurnIn     | TurnScroll     | -       | -           |
| -          | ParallaxScroll | -       | TrackMouse  |

## Accessibility

### Host vs Preset Responsibility

The presets provide animations; the host platform decides when/whether to apply them.

Interact supports `conditions` in the config for handling reduced motion. Define a media condition for `(prefers-reduced-motion: reduce)` and use it to swap high-risk presets for safer alternatives (e.g., SpinIn → FadeIn, BounceIn → FadeIn). Conditions can be applied per-interaction or per-effect, and automatically re-evaluate when the user's preference changes.

If the host handles accessibility globally (e.g., disabling all animations on `(prefers-reduced-motion: reduce)`), presets don't need to address it separately.

### Preset Risk Levels

**High risk** (vestibular triggers, seizure risk if motion is fast and repetitive):

- Spinning: SpinIn, Spin, SpinScroll, Spin3dScroll
- Bouncing: BounceIn, Bounce
- 3D rotations: ArcIn, FlipIn, ArcScroll, FlipScroll, Tilt3DMouse
- Continuous motion: Flash, DVD, Jello, Wiggle

**Medium risk** (strong motion, may affect some users):

- TurnIn
- ParallaxScroll at high speed values

**Low risk / safe** (opacity/blur changes, minimal spatial movement):

- FadeIn, FadeScroll, BlurIn, BlurScroll
- SlideIn (subtle), GlideIn (subtle)
- Pulse (subtle), Breathe

### Reduced Motion Fallbacks

| Original                          | Fallback                  |
| --------------------------------- | ------------------------- |
| BounceIn, SpinIn                  | FadeIn                    |
| ArcIn, FlipIn, TurnIn             | FadeIn                    |
| Spin, Bounce, Wiggle              | Stop or subtle Pulse      |
| Flash                             | Reduce frequency (<3/sec) |
| ParallaxScroll                    | Static position           |
| ArcScroll, FlipScroll, SpinScroll | FadeScroll or disable     |
| All mouse presets                 | Static state              |

### LLM Guidance Principles

1. **Do not limit creativity by default** — generate what the user asks for
2. **Apply constraints only when explicitly requested** — keywords: "accessible", "a11y", "reduced motion safe", "subtle", "tone down"
3. **High-risk presets are informational, not blockers** — optionally note vestibular concerns in response
4. **Mouse presets may behave differently on mobile** — note this as context, not a restriction
5. **Duration guidelines are suggestions** — functional UI <500ms, decorative up to 1200ms, hero up to 2000ms
