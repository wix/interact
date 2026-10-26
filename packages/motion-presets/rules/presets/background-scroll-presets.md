---
name: background-scroll-presets
description: Full parameter reference for background scroll motion presets. Read when configuring BgCloseUp, BgFade, BgFadeBack, BgFake3D, BgPan, BgParallax, BgPullBack, BgReveal, BgRotate, BgSkew, BgZoom, or ImageParallax on the background media of a section, or when building the markup they animate.
---

# Background Scroll Presets

Background scroll presets animate the background media of a section — an image or video behind its content — as the section scrolls through the viewport. Like scroll presets, they're driven by ViewTimeline, so use them with the `viewProgress` trigger on the section.

Unlike other presets, they animate **parts** of the section rather than the section itself, and they come with the **static styles** those parts need: sizing the media to cover its motion, clipping it to the section, and keeping it fixed to the viewport for the parallax and reveal effects. Interact applies those styles, both in `generate()` and at runtime, only while the effect is active.

## Table of Contents

- [Markup](#markup)
- [Usage](#usage)
- [Host Responsibilities](#host-responsibilities)
- [BgCloseUp](#bgcloseup)
- [BgFade](#bgfade)
- [BgFadeBack](#bgfadeback)
- [BgFake3D](#bgfake3d)
- [BgPan](#bgpan)
- [BgParallax](#bgparallax)
- [BgPullBack](#bgpullback)
- [BgReveal](#bgreveal)
- [BgRotate](#bgrotate)
- [BgSkew](#bgskew)
- [BgZoom](#bgzoom)
- [ImageParallax](#imageparallax)

---

## Markup

The section must contain three nested parts, marked with `data-motion-part`:

| Part            | Role                                                                         |
| --------------- | ---------------------------------------------------------------------------- |
| `MEDIA_CLIP`    | The layer the background is clipped to. It must cover the section.           |
| `MEDIA_WRAPPER` | The box the media is sized and positioned in; most presets animate it.       |
| `MEDIA`         | The image or video itself (or the element showing it as a background image). |

```html
<interact-element data-interact-key="hero">
  <section style="position: relative">
    <div data-motion-part="MEDIA_CLIP" style="position: absolute; inset: 0">
      <div data-motion-part="MEDIA_WRAPPER">
        <img data-motion-part="MEDIA" src="hero.jpg" alt="" style="object-fit: cover" />
      </div>
    </div>
    <!-- section content -->
  </section>
</interact-element>
```

Make `MEDIA_CLIP` cover the section; the presets style the rest themselves — clipping the media to `MEDIA_CLIP`, and sizing and positioning `MEDIA_WRAPPER` and `MEDIA` — so don't size those yourself.

## Usage

```typescript
import { Interact, generate } from '@wix/interact/web';
import { BgParallax } from '@wix/motion-presets';

Interact.registerEffects({ BgParallax });

const config = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewProgress',
      effects: [{ namedEffect: { type: 'BgParallax', speed: 0.3 } }],
    },
  ],
};

const css = generate(config, true);
Interact.create(config);
```

Don't set `rangeStart`/`rangeEnd` or `duration` — each preset defines the scroll range its motion and static styles are designed for. To switch the effect by breakpoint, add effects with media `conditions` to the same interaction: the last one whose conditions hold wins, together with its static styles.

## Host Responsibilities

- **Firefox:** the presets that keep their media fixed (BgParallax, BgReveal, BgFake3D, and BgZoom zooming in) need `will-change: transform` on their wrapper in Firefox ([bug 1791232](https://bugzilla.mozilla.org/show_bug.cgi?id=1791232)). They read it from `--motion-bgreveal-will-change`, so set it for Firefox only:

  ```css
  @supports (-moz-appearance: none) {
    body {
      --motion-bgreveal-will-change: transform;
    }
  }
  ```

- **Section height:** some presets size their scroll range or media by the section's height, which the runtime measures and sets on the section as `--motion-comp-height`. When rendering with `generate()` before the runtime runs, set it on the section yourself if you know its height.
- **BgRotate at extreme aspect ratios:** BgRotate sizes its media to cover the rotated layer at any aspect ratio, which may oversize it a little for very wide or very tall sections. Refine the wrapper's size with container queries on `MEDIA_CLIP` if needed.

---

### BgCloseUp

Visual: The background zooms toward the viewer while fading out as the section scrolls up.

Parameters:

- `scale`: number — zoom depth in px of `translateZ` at a 100px perspective (default: `80`)

```typescript
{ type: 'BgCloseUp', scale: 60 }
```

---

### BgFade

Visual: The background fades in as the section enters, or out as it exits.

Parameters:

- `range`: 'in' | 'out' (default: `'in'`)

```typescript
{ type: 'BgFade', range: 'out' }
```

---

### BgFadeBack

Visual: The background shrinks back and fades out as the section scrolls up.

Parameters:

- `scale`: number — the background's scale at the end (default: `0.7`)

```typescript
{ type: 'BgFadeBack', scale: 0.8 }
```

---

### BgFake3D

Visual: The background stays fixed to the viewport while it stretches and zooms in depth, faking a 3D move.

Parameters:

- `stretch`: number — vertical stretch factor (default: `1.3`)
- `zoom`: number — zoom depth in px of `translateZ` (default: `16.67`)

```typescript
{ type: 'BgFake3D', stretch: 1.2 }
```

---

### BgPan

Visual: The background pans horizontally as the section scrolls.

Parameters:

- `direction`: 'left' | 'right' (default: `'left'`)
- `speed`: number — how much wider than the section the media is, and pans across (default: `0.2`)

```typescript
{ type: 'BgPan', direction: 'right', speed: 0.3 }
```

---

### BgParallax

Visual: The background stays fixed to the viewport and moves slower than the content, for a classic parallax.

Parameters:

- `speed`: number — the background's speed relative to the scroll; `0` is fully fixed (default: `0.2`)

```typescript
{ type: 'BgParallax', speed: 0.5 }
```

---

### BgPullBack

Visual: The background pulls back from the viewer, from zoomed-in to its resting size, as the section enters.

Parameters:

- `scale`: number — starting zoom depth in px of `translateZ` at a 100px perspective (default: `50`)

```typescript
{ type: 'BgPullBack', scale: 30 }
```

---

### BgReveal

Visual: The background stays fixed to the viewport, so the section reveals it as it scrolls, like `background-attachment: fixed`. It has no animation, only static styles.

Parameters: none.

```typescript
{
  type: 'BgReveal';
}
```

---

### BgRotate

Visual: The background rotates back to its resting angle as the section scrolls.

Parameters:

- `angle`: number — starting angle in degrees (default: `22`)
- `direction`: 'clockwise' | 'counter-clockwise' (default: `'counter-clockwise'`)

```typescript
{ type: 'BgRotate', angle: 15, direction: 'clockwise' }
```

---

### BgSkew

Visual: The background skews from one side to the other as the section scrolls.

Parameters:

- `angle`: number — skew angle in degrees (default: `20`)
- `direction`: 'clockwise' | 'counter-clockwise' (default: `'counter-clockwise'`)

```typescript
{ type: 'BgSkew', angle: 10 }
```

---

### BgZoom

Visual: The background zooms in while staying fixed to the viewport, or zooms out within the section.

Parameters:

- `direction`: 'in' | 'out' (default: `'in'`)
- `zoom`: number — zoom depth in px of `translateZ` (default: `40`)

```typescript
{ type: 'BgZoom', direction: 'out', zoom: 30 }
```

---

### ImageParallax

Visual: The media moves inside its section as it scrolls, slower than the content, like a parallax window.

Parameters:

- `speed`: number — how much taller than the section the media is, and moves across (default: `1.5`)
- `reverse`: boolean — move in the opposite direction (default: `false`)
- `isPage`: boolean — the background spans the whole page rather than a section (default: `false`)

```typescript
{ type: 'ImageParallax', speed: 1.3, reverse: true }
```
