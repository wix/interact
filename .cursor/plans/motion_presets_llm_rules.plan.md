---
name: LLM Preset Rules
overview: Single source of truth for generating and maintaining all preset reference files.
todos: []
isProject: false
---

# LLM Rules for Motion Presets

This file is the **single source of truth** for generating all preset reference files. Every guideline, table, and parameter standard in the generated files originates here.

## Table of Contents

- [Generated Files](#generated-files)
- [Skills Compatibility](#skills-compatibility)
- [Terminology](#terminology)
- [Preset Registry](#preset-registry)
- [Key Constraints](#key-constraints)
- [Parameter Standards](#parameter-standards)
- [Optional Parameters](#optional-parameters)
- [Accessibility](#accessibility)
- [Selection Tables](#selection-tables)
- [Intensity Value Guide](#intensity-value-guide)
- [Preset Entry Format](#preset-entry-format)
- [Regeneration Steps](#regeneration-steps)

## Generated Files

```text
packages/motion-presets/rules/presets/
├── presets-main.md      # Generated: entry point (<500 lines) — decision flow, categories, standards, selection, a11y
├── entrance-presets.md  # Generated: full entrance preset params, examples, optional params, intensity
├── scroll-presets.md    # Generated: full scroll preset params, examples, optional params, intensity
├── ongoing-presets.md   # Generated: full ongoing preset params, examples, intensity
└── mouse-presets.md     # Generated: full mouse preset params, examples, intensity, mobile notes
```

### What Goes Where

| Source Section (this file)                        | Generates Into          |
| ------------------------------------------------- | ----------------------- |
| Terminology                                       | presets-main.md         |
| Key Constraints (categories, triggers, combining) | presets-main.md         |
| Parameter Standards                               | presets-main.md         |
| Selection Tables                                  | presets-main.md         |
| Accessibility                                     | presets-main.md         |
| Preset Registry                                   | presets-main.md (lists) |
| Preset Entry Format + source code                 | {category}-presets.md   |
| Optional Parameters                               | {category}-presets.md   |
| Intensity Value Guide                             | {category}-presets.md   |

---

## Skills Compatibility

The generated files are structured for future conversion to an Agentic Skill. When generating or editing these files, follow these conventions so they can be moved with minimal changes:

### Frontmatter

Every generated file must have YAML frontmatter with at least `name` and `description`. The `description` should be written in third person and include both WHAT the file does and WHEN an agent should read it.

```yaml
---
name: lowercase-with-hyphens (max 64 chars)
description: Third-person description with trigger terms. Max 1024 chars.
---
```

When converting to a real skill, `presets-main.md` becomes `SKILL.md` and its `description` becomes the skill discovery text.

### Structure Rules

- **Main entry file** (`presets-main.md` / future `SKILL.md`): under 500 lines
- **Reference files**: linked one level deep from the main file, no further nesting
- **Heading hierarchy**: `#` (title) → `##` (sections) → `###` (subsections) — no skipped levels
- **Progressive disclosure**: essential info in the main file, detailed reference in separate files
- **TOC**: include a table of contents in every file
- **Consistent terminology**: "preset" for selection, "effect" for runtime, "animation" for visual motion
- **No time-sensitive information**: avoid dates, version-specific caveats

### Future Conversion Checklist

To convert to a real Cursor Skill:

1. Create the skill in the right "skills" folder
2. Copy `presets-main.md` → `SKILL.md`
3. Copy `{category}-presets.md` files alongside it
4. Verify `SKILL.md` description has trigger terms for agent discovery
5. Remove `category` field from frontmatter (not needed in skills)
6. Verify all internal links still resolve

---

## Terminology

| Term          | Meaning                                                                                 |
| ------------- | --------------------------------------------------------------------------------------- |
| **Effect**    | Interact's term for an operation applied to an element (animation, custom effect, etc.) |
| **Preset**    | A pre-built, named effect configuration from this library (e.g., `FadeIn`, `BounceIn`)  |
| **Animation** | The actual visual motion that runs in the browser (CSS or WAAPI)                        |

A preset is a named effect. "Preset" is used when talking about selection and configuration; "effect" when talking about the Interact runtime; "animation" when referring to the visual motion or CSS/WAAPI mechanism.

---

## Preset Registry

A list of the presets present in the project. Before continuing, make sure this list is aligned with `packages/motion-presets/src/library` and update accordingly.

Descriptions marked with **(designer)** are approved by design and should be used as-is in generated files. All other descriptions are derived and should follow the same style.

### Excluded Presets

The following presets exist in the library but should **not** be documented in the generated rules:

- `CustomMouse` — fully custom callback, not a configurable preset
- `SpinMouse` — excluded by design
- `BounceMouse` — excluded by design

### Entrance Presets

| Preset     | Description                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| FadeIn     | Element fades in smoothly from fully transparent to fully opaque.                                                                  |
| ArcIn      | **(designer)** Element enters along a 3D arc path, rotating into view with depth motion.                                           |
| BlurIn     | **(designer)** Element transitions from blurred to sharp while fading in.                                                          |
| BounceIn   | Element bounces into place from a direction with an elastic multi-step curve.                                                      |
| CurveIn    | **(designer)** Element curves in with a 180° rotation and depth motion in a 3D space, creating a swinging arc entrance.            |
| DropIn     | **(designer)** Element shrinks down from a larger size to its final scale.                                                         |
| ExpandIn   | Element expands from a point in a given direction, scaling from small to full size with a fade-in.                                 |
| FlipIn     | Element flips into view with a 3D rotation around the X or Y axis.                                                                 |
| FloatIn    | Element drifts gently into place from a direction with a fade-in.                                                                  |
| FoldIn     | Element unfolds from an edge, rotating around an axis at the edge as if hinged.                                                    |
| GlideIn    | **(designer)** Element glides in smoothly from off-screen along a direction.                                                       |
| RevealIn   | Element is progressively revealed by an expanding clip-path from one edge.                                                         |
| ShapeIn    | Element appears through an expanding geometric clip-path shape.                                                                    |
| ShuttersIn | Element is revealed through multiple shutter-like strips that open in sequence.                                                    |
| SlideIn    | Element slides in from one side while being revealed with a clip-path mask.                                                        |
| SpinIn     | Element spins into view while scaling from small to full size.                                                                     |
| TiltIn     | Element tilts in from the side with 3D rotation and a clip-path reveal.                                                            |
| TurnIn     | Element rotates into view around a corner pivot point.                                                                             |
| WinkIn     | **(designer)** Element winks into view by expanding from its horizontal or vertical center, while being revealed with a clip-path. |

### Scroll Presets

| Preset         | Description                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ArcScroll      | Element rotates along a 3D arc as it scrolls into or out of view.                                                                                                               |
| BlurScroll     | Element blurs or unblurs as it scrolls through the viewport.                                                                                                                    |
| FadeScroll     | Element fades in or out based on scroll position.                                                                                                                               |
| FlipScroll     | Element performs a 3D flip rotation as it scrolls.                                                                                                                              |
| GrowScroll     | **(designer)** Element scales up from a direction as it scrolls into or out of view.                                                                                            |
| MoveScroll     | Element translates along an angle for a given distance as it scrolls.                                                                                                           |
| PanScroll      | **(designer)** Horizontal panning tied to scroll.                                                                                                                               |
| ParallaxScroll | Element moves at a different speed than the scroll, creating a depth illusion.                                                                                                  |
| RevealScroll   | Element is progressively revealed from an edge via clip-path as it scrolls.                                                                                                     |
| ShapeScroll    | Element is revealed through an expanding geometric clip-path shape on scroll.                                                                                                   |
| ShrinkScroll   | **(designer)** Element shrinks toward a direction as it scrolls into or out of view, the inverse of GrowScroll.                                                                 |
| ShuttersScroll | **(designer)** Element is revealed through staggered shutter-like strips that open on scroll in. When scrolling out, the element disappears with the same animation in reverse. |
| SkewPanScroll  | Element pans horizontally with a skew distortion as it scrolls.                                                                                                                 |
| SlideScroll    | Element slides in from an edge with a clip-path reveal as it scrolls.                                                                                                           |
| Spin3dScroll   | Element performs a 3D spin with rotation on multiple axes as it scrolls.                                                                                                        |
| SpinScroll     | Element spins (2D rotation) with optional scale change as it scrolls.                                                                                                           |
| StretchScroll  | Element stretches vertically with scaleY increasing while scaleX decreases, with an opacity transition.                                                                         |
| TiltScroll     | **(designer)** Element tilts in 3D and perspective, with optional parallax vertical movement as it scrolls into or out of view.                                                 |
| TurnScroll     | Element pans in from off-screen while turning (rotating) as it scrolls.                                                                                                         |

### Ongoing Presets

| Preset  | Description                                                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Bounce  | Element bounces up and down with a natural multi-step curve, like a ball settling.                                                                                             |
| Breathe | Element gently moves back and forth along an axis, like a breathing motion.                                                                                                    |
| Cross   | **(designer)** Element moves across the screen from side to side, horizontally or vertically, until reaching the edge of the view and repeats.                                 |
| DVD     | **(designer)** Element bounces diagonally off the viewport edges like a DVD screensaver logo. No configurable parameters — uses viewport dimensions to calculate bounce paths. |
| Flash   | Element blinks by rapidly cycling opacity from visible to invisible and back.                                                                                                  |
| Flip    | Element continuously flips with a full 360° 3D rotation.                                                                                                                       |
| Fold    | Element folds at an edge using 3D rotation, like a page turning back and forth.                                                                                                |
| Jello   | Element wobbles with a skew-based jello-like deformation.                                                                                                                      |
| Poke    | **(designer)** Element makes two short, sharp translates in a direction back and forth, like being poked.                                                                      |
| Pulse   | **(designer)** Element pulses by subtly scaling up and down.                                                                                                                   |
| Rubber  | Element stretches non-uniformly on X and Y axes, creating a rubber-band wobble.                                                                                                |
| Spin    | Element rotates continuously around its center.                                                                                                                                |
| Swing   | Element swings like a pendulum from a pivot at one edge.                                                                                                                       |
| Wiggle  | Element shakes with combined rotation and vertical translation.                                                                                                                |

### Mouse Presets

| Preset       | Description                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| AiryMouse    | Element floats and rotates gently following the cursor, creating an airy, weightless feel.                                 |
| BlobMouse    | **(designer)** Element translates and scales non-uniformly following the cursor, creating a heavy liquid-like deformation. |
| BlurMouse    | Element translates, tilts in 3D, scales, and blurs based on distance from the cursor.                                      |
| BounceMouse  | _(excluded from generated rules)_ Element follows the cursor with an elastic, bouncy motion.                               |
| CustomMouse  | _(excluded from generated rules)_ Fully custom callback effect.                                                            |
| ScaleMouse   | Element translates and scales uniformly following the cursor.                                                              |
| SkewMouse    | Element translates and skews following the cursor, creating a directional distortion.                                      |
| SpinMouse    | _(excluded from generated rules)_ Element rotates toward the cursor position.                                              |
| SwivelMouse  | Element tilts in 3D around a chosen pivot axis following the cursor.                                                       |
| Tilt3DMouse  | Element tilts in 3D based on cursor position, rotating on X and Y axes from center.                                        |
| Track3DMouse | Element translates and tilts in 3D following the cursor, combining movement with perspective rotation.                     |
| TrackMouse   | Element follows the cursor with direct translation, no rotation.                                                           |

---

## Key Constraints

### Preset Categories

These are categories of presets, each optimized for certain use cases but not limited to a single trigger mechanism.

| Category | Optimized For                                      | Implementation                              | Notes                                                                   |
| -------- | -------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| entrance | When an element enters the viewport                | `viewEnter` (intersection observer)         | Can also be triggered by hover, click, animationend, and other triggers |
| scroll   | Scroll position of an element relative to document | ViewTimeline (scroll progress)              | Animation progress tied to element's position in the viewport           |
| ongoing  | Continuous loop                                    | infinite CSS/WAAPI animation                | Runs indefinitely until stopped                                         |
| mouse    | Follow or Repel by Pointer position                | transform values driven by pointer position | Real-time response to cursor position; may behave differently on mobile |

### Trigger and Effect Binding

In the simplest case, a trigger and its effect are bound to the same element. However, an effect on one element can also be triggered by another element (e.g., hovering a button triggers a FadeIn on a sibling panel).

### Combining Effects

1. Avoid mixing multiple effects on the same element at the same time when possible
2. Never combine effects that affect the same CSS properties (e.g., two effects both using `transform`)
3. When combining is necessary, effect order matters — later effects may override earlier ones
4. If possible, use nested containers to separate effects that would conflict — place each effect on a separate wrapper element. Note: here also order matters

---

## Parameter Standards

### Animation Options (Not Preset Parameters)

These are set on the effect configuration level, not on the preset itself:

- `duration`: Animation duration in ms (entrance, ongoing)
- `delay`: Animation delay in ms (entrance, ongoing)
- `easing`: Easing function
- `iterations`: Number of iterations
- `alternate`: Alternate direction on each iteration
- `fill`: Animation fill mode
- `reversed`: Reverse the animation

**Scroll-specific animation options:**

- `rangeStart` / `rangeEnd`: `RangeOffset` controlling when the scroll animation starts/ends
- `transitionDuration` / `transitionDelay` / `transitionEasing`: Transition smoothing

### Preset-Specific Parameters

**Most Scroll presets:**

- `range`: 'in' | 'out' | 'continuous'
  - `'in'`: animation ends at the element's idle state (element animates in as it enters)
  - `'out'`: animation starts from the element's idle state (element animates out as it exits)
  - `'continuous'`: animation passes through the idle state (animates across the full scroll range)

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
| Angle (number)     | 0–360 (0° = right, 90° = top, 180° = left, 270° = bottom) | GlideIn, ExpandIn, MoveScroll                                                                                        |

### Using Units

Interact supports both a CSSUnitValue-style object (e.g., `distance: { value: 120, type: 'px' }`, mapped to the internal type `UnitLengthPercentage`) and flat string values (e.g., `distance: '120px'`).

Prefer the object notation. In any case, be consistent within a configuration — use one format, not both.

### Coordinate System

**Standard:** 0° = right (east), angles increase counter-clockwise

- 0° = right (east)
- 90° = top (north)
- 180° = left (west)
- 270° = bottom (south)

### Distance Units

Supported unit types: `px`, `em`, `rem`, `vh`, `vw`, `vmin`, `vmax`, `percentage`

```typescript
distance: { value: 120, type: 'px' }       // pixels
distance: { value: 50, type: 'percentage' } // percentage
distance: { value: 10, type: 'vh' }        // viewport height
```

### CSS Custom Properties

The library uses these CSS custom properties for runtime control:

- `--motion-rotate`: Element rotation (used by SpinIn and other rotation presets)

---

## Optional Parameters

Some preset parameters are exposed, but their defaults have been tuned for good visual results and rarely need adjustment:

### 3D Perspective

| Preset            | Parameter     | Default | Range    |
| ----------------- | ------------- | ------- | -------- |
| ArcIn             | `perspective` | 800     | 200-2000 |
| TiltIn            | `perspective` | 800     | 200-2000 |
| FoldIn            | `perspective` | 800     | 200-2000 |
| FlipIn            | `perspective` | 800     | 200-2000 |
| CurveIn           | `perspective` | 200     | 100-1000 |
| BounceIn (center) | `perspective` | 800     | 200-2000 |
| ArcScroll         | `perspective` | 500     | 200-2000 |
| FlipScroll        | `perspective` | 800     | 200-2000 |
| TiltScroll        | `perspective` | 400     | 200-2000 |
| Spin3dScroll      | `perspective` | 1000    | 200-2000 |

### Depth (Z Translation)

| Preset  | Parameter | Default | Notes                  |
| ------- | --------- | ------- | ---------------------- |
| ArcIn   | `depth`   | 200px   | Z translation distance |
| CurveIn | `depth`   | 300px   | Z translation distance |
| TiltIn  | `depth`   | 200px   | Z translation distance |

---

## Accessibility

This section documents preset selection guidance for accessibility. It is not about library-level features (like `allowA11yTriggers`).

### Host vs Preset Responsibility

The presets generally provide animations; the host platform decides when/whether to apply them.

Interact supports `conditions` in the config for handling reduced motion. Define a media condition for `(prefers-reduced-motion: reduce)` and use it to swap high-risk presets for safer alternatives (e.g., SpinIn → FadeIn, BounceIn → FadeIn). Conditions can be applied per-interaction or per-effect, and automatically re-evaluate when the user's preference changes.

If it is known that the host handles accessibility globally (e.g., disabling all animations on `(prefers-reduced-motion: reduce)`), presets don't need to address it separately.

### Preset Risk Levels

_Note:_ this section should be confirmed by an a11y expert

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

---

## Selection Tables

### Selection by Atmosphere

#### Playful / Fun / Whimsical

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
| Swing  | loop     | Swing       |
| Blob   | mouse    | BlobMouse   |
| Rubber | loop     | Rubber      |
| Track  | mouse    | TrackMouse  |
| Swivel | mouse    | SwivelMouse |

#### Smooth / Elegant / Refined

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

#### Bold / Energetic / Dynamic

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

#### Soft / Gentle / Organic

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

#### Dramatic / Cinematic / Theatrical

Keywords: dramatic, cinematic, theatrical, staged, sweeping, intimate, focused, detailed, revealing

| Effect   | Trigger  | Preset         |
| -------- | -------- | -------------- |
| Shutters | entrance | ShuttersIn     |
| Shutters | scroll   | ShuttersScroll |
| Parallax | scroll   | ParallaxScroll |
| Expand   | entrance | ExpandIn       |
| Reveal   | entrance | RevealIn       |
| Reveal   | scroll   | RevealScroll   |

#### Modern / Tech / Immersive

Keywords: modern, tech, immersive, dimensional, spatial, 3d, depth, layered, innovative, interactive, responsive, engaging, following

| Effect   | Trigger  | Preset         |
| -------- | -------- | -------------- |
| Tilt 3D  | mouse    | Tilt3DMouse    |
| Track3D  | mouse    | Track3DMouse   |
| Track    | mouse    | TrackMouse     |
| Skew     | mouse    | SkewMouse      |
| 3D spin  | scroll   | Spin3dScroll   |
| Parallax | scroll   | ParallaxScroll |
| Resize   | mouse    | ScaleMouse     |
| Blur     | entrance | BlurIn         |
| Blur     | scroll   | BlurScroll     |
| Blur     | mouse    | BlurMouse      |
| Fold     | entrance | FoldIn         |
| Fold     | loop     | Fold           |

#### Creative / Experimental / Edgy

Keywords: creative, artistic, experimental, unconventional, edgy, distorted, unique, expressive, graphic, transformative, fluid, liquid, elastic, flexible, stretchy

| Effect  | Trigger  | Preset        |
| ------- | -------- | ------------- |
| Skew    | mouse    | SkewMouse     |
| Tilt    | entrance | TiltIn        |
| Tilt    | scroll   | TiltScroll    |
| Shape   | entrance | ShapeIn       |
| Shape   | scroll   | ShapeScroll   |
| Blob    | mouse    | BlobMouse     |
| Cross   | loop     | Cross         |
| Stretch | scroll   | StretchScroll |
| Rubber  | loop     | Rubber        |

#### Clean / Professional / Minimal

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

### Preset Selection Recommendations

1. Do not add entrance presets (or any animation that starts with opacity 0) to `<h1>` elements in the first fold
2. Do not add scroll-in animations in the first fold
3. Do not add scroll-out animations in the last fold

### Cross-Category Parallels

| Entrance   | Scroll         | Ongoing | Mouse       |
| ---------- | -------------- | ------- | ----------- |
| FadeIn     | FadeScroll     | Flash   | -           |
| ArcIn      | ArcScroll      | -       | -           |
| SpinIn     | SpinScroll     | Spin    | -           |
| BounceIn   | -              | Bounce  | -           |
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

---

## Intensity Value Guide

Tested values for different intensity levels of effects. When a user asks for "soft", "subtle", "medium", or "hard"/"dramatic" motion, use these as guidelines for suggesting appropriate parameter values.

### Entrance Presets Intensity Values

| Preset   | Parameter        | Subtle/Soft | Medium     | Dramatic/Hard |
| -------- | ---------------- | ----------- | ---------- | ------------- |
| ArcIn    | easing           | sineOut     | cubicInOut | quintInOut    |
| BlurIn   | blur             | 6px         | 25px       | 50px          |
| BounceIn | distanceFactor   | 1           | 2          | 3             |
| DropIn   | initialScale     | 1.2         | 1.6        | 2             |
| FlipIn   | initialRotate    | 35°         | 60°        | 90°           |
| FoldIn   | initialRotate    | 35°         | 60°        | 90°           |
| ExpandIn | initialScale     | 0.8         | 0.6        | 0             |
| SlideIn  | initialTranslate | 0.2         | 0.8        | 1             |
| SpinIn   | initialScale     | 1           | 0.6        | 0             |

### Scroll Presets Intensity Values

| Preset        | Parameter | Subtle/Soft | Medium | Dramatic/Hard |
| ------------- | --------- | ----------- | ------ | ------------- |
| BlurScroll    | blur      | 6px         | 25px   | 50px          |
| FlipScroll    | rotate    | 60°         | 120°   | 420°          |
| GrowScroll    | scale     | 1.2         | 1.7    | 4             |
| MoveScroll    | distance  | 150px       | 400px  | 800px         |
| ShrinkScroll  | scale     | 0.8         | 0.3    | 0             |
| SkewPanScroll | skew      | 10°         | 17°    | 24°           |
| Spin3dScroll  | rotate    | 45°         | 100°   | 200°          |
| SpinScroll    | scale     | 1           | 0.7    | 0.4           |
| StretchScroll | stretch   | 1.2         | 1.5    | 2             |
| TiltScroll    | distance  | 0           | 0.5    | 1             |
| TurnScroll    | scale     | 1           | 1.3    | 1.6           |

### Ongoing Presets Intensity Values

| Preset | Parameter | Subtle/Soft | Medium | Dramatic/Hard |
| ------ | --------- | ----------- | ------ | ------------- |
| Bounce | intensity | 0           | 0.5    | 1             |
| Fold   | angle     | 15°         | 30°    | 45°           |
| Jello  | intensity | 0           | 0.33   | 1             |
| Poke   | intensity | 0           | 0.33   | 1             |
| Pulse  | intensity | 0           | 0.5    | 1             |
| Rubber | intensity | 0           | 0.5    | 1             |
| Swing  | swing     | 20°         | 40°    | 60°           |
| Wiggle | intensity | 0           | 0.33   | 1             |

### Mouse Presets Intensity Values

| Preset            | Parameter(s)       | Subtle/Soft | Medium   | Dramatic/Hard |
| ----------------- | ------------------ | ----------- | -------- | ------------- |
| AiryMouse         | angle              | 10°         | 50°      | 85°           |
| BlobMouse         | scale              | 1.2         | 1.6      | 2.4           |
| BlurMouse         | angle, scale       | 0°, 1       | 25°, 0.7 | 65°, 0.25     |
| ScaleMouse (down) | scale              | 0.85        | 0.5      | 0             |
| ScaleMouse (up)   | scale              | 1.2         | 1.6      | 2.4           |
| SkewMouse         | angle              | 10°         | 20°      | 45°           |
| SwivelMouse       | angle, perspective | 25°, 1000   | 50°, 700 | 85°, 300      |
| Tilt3DMouse       | angle, perspective | 25°, 1000   | 50°, 500 | 85°, 200      |
| Track3DMouse      | angle, perspective | 25°, 1000   | 50°, 500 | 85°, 333      |

### Intensity Usage Example

When a user asks: "I want a subtle flip entrance"

Suggest: `{ type: 'FlipIn', initialRotate: 35 }`

---

## Preset Entry Format

For each preset in the per-category reference files (`{category}-presets.md`):

```markdown
### PresetName

Visual: [Use the description from the Preset Registry. Designer-approved descriptions must be used as-is.]

Parameters:

- `param1`: type/range (default: value)
- `param2`: type/range (default: value)

\`\`\`typescript
{ type: 'PresetName', param1: 'value' }
\`\`\`
```

**Notes:**

- Include all required parameters
- Include optional parameters with their defaults
- For angle-based presets, note that 0° = right (east)
- For 3D presets, include perspective parameter if customizable

---

## Regeneration Steps

To regenerate the preset reference files:

### Step 1: Verify Registry

Ensure the Preset Registry (above) is aligned with actual preset files in `packages/motion-presets/src/library/{category}/` (exclude index.ts and test files).

### Step 2: Generate `presets-main.md`

Build from these sections of this file:

- **Terminology** → Terminology section
- **Key Constraints** (categories table, trigger binding, combining effects) → Categories + Decision Flow + Combining Effects
- **Parameter Standards** (all subsections) → Parameter Standards section
- **Selection Tables** (by atmosphere, recommendations, cross-category parallels) → Selection Tables section
- **Accessibility** (all subsections) → Accessibility section
- **Preset Registry** → Available preset lists per category
- Add progressive disclosure links to each `{category}-presets.md`
- Keep under 500 lines

### Step 3: Generate `{category}-presets.md` files

For each category (entrance, scroll, ongoing, mouse):

1. Read preset type definitions from `packages/motion-presets/src/types.ts`
2. For each preset in that category, get params from `packages/motion-presets/src/library/{category}/{Preset}.ts`
3. Write each preset entry using the **Preset Entry Format** above
4. Append the **Optional Parameters** tables relevant to that category
5. Append the **Intensity Value** table for that category from the Intensity Value Guide above
6. For mouse: include mobile considerations note

### Step 4: Validate

1. `presets-main.md` is under 500 lines
2. Heading hierarchy: `#` → `##` → `###` (no skipped levels)
3. Every file has a table of contents after the title
4. Every file has YAML frontmatter with `name` and `description` (see [Skills Compatibility](#skills-compatibility))
5. Run `yarn format` on all generated markdown files to ensure they pass CI formatting checks
6. Verify no content duplication between this plan and generated files (generated files should stand alone; this plan is the source, not a supplement)
