---
name: scroll-presets
description: Full parameter reference for scroll motion presets. Read when configuring ArcScroll, BlurScroll, FadeScroll, FlipScroll, GrowScroll, MoveScroll, PanScroll, ParallaxScroll, RevealScroll, ShapeScroll, ShrinkScroll, ShuttersScroll, SkewPanScroll, SlideScroll, Spin3dScroll, SpinScroll, StretchScroll, TiltScroll, or TurnScroll scroll animations.
---

# Scroll Presets

Scroll presets tie animation progress to an element's scroll position relative to the viewport. They use ViewTimeline (scroll-driven animations) so the effect advances as the user scrolls.

## Table of Contents

- [Scroll Range](#scroll-range)
- [ArcScroll](#arcscroll)
- [BlurScroll](#blurscroll)
- [FadeScroll](#fadescroll)
- [FlipScroll](#flipscroll)
- [GrowScroll](#growscroll)
- [MoveScroll](#movescroll)
- [PanScroll](#panscroll)
- [ParallaxScroll](#parallaxscroll)
- [RevealScroll](#revealscroll)
- [ShapeScroll](#shapescroll)
- [ShrinkScroll](#shrinkscroll)
- [ShuttersScroll](#shuttersscroll)
- [SkewPanScroll](#skewpanscroll)
- [SlideScroll](#slidescroll)
- [Spin3dScroll](#spin3dscroll)
- [SpinScroll](#spinscroll)
- [StretchScroll](#stretchscroll)
- [TiltScroll](#tiltscroll)
- [TurnScroll](#turnscroll)
- [Optional Parameters](#optional-parameters)
- [Intensity Value Guide](#intensity-value-guide)

---

## Scroll Range

Most scroll presets accept a `range` parameter:

- `'in'`: Animation ends at the element's idle state (element animates in as it enters)
- `'out'`: Animation starts from the element's idle state (element animates out as it exits)
- `'continuous'`: Animation passes through the idle state (animates across the full scroll range)

`'out'` is `'in'` reversed with the direction flipped (for directional presets); `'continuous'` is `'in'` followed by `'out'`. `direction` always names where the motion goes. Scroll presets use their own easing — the effect's `easing` is ignored.

---

### ArcScroll

Visual: Element rotates along a 3D arc as it scrolls into or out of view.

Parameters:

- `direction`: 'vertical' | 'horizontal' (default: `'horizontal'`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)
- `perspective`: number — 3D perspective in px (default: `500`)

```typescript
{ type: 'ArcScroll', direction: 'vertical', range: 'continuous' }
```

---

### BlurScroll

Visual: Element blurs or unblurs as it scrolls through the viewport.

Parameters:

- `blur`: number — maximum blur amount in px (default: `6`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)

```typescript
{ type: 'BlurScroll', blur: 25, range: 'out' }
```

---

### FadeScroll

Visual: Element fades in or out based on scroll position.

Parameters:

- `opacity`: number — target opacity at the animated end (default: `0`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)

```typescript
{ type: 'FadeScroll', range: 'continuous' }
```

---

### FlipScroll

Visual: Element performs a 3D flip rotation as it scrolls.

Parameters:

- `direction`: 'vertical' | 'horizontal' (default: `'horizontal'`)
- `angle`: number — rotation amount in degrees (default: `240`)
- `range`: 'in' | 'out' | 'continuous' (default: `'continuous'`)
- `perspective`: number — 3D perspective in px (default: `800`)

```typescript
{ type: 'FlipScroll', angle: 360, direction: 'vertical' }
```

---

### GrowScroll

Visual: Element scales up from a direction as it scrolls into or out of view.

Parameters:

- `pivot`: EffectNineDirections — origin point for scaling (default: `'center'`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)
- `scale`: number — starting scale on 'in', ending scale otherwise; inverted to below 1 for 'in' and above 1 otherwise (default: `0.25`, i.e. `4` for 'out')
- `speed`: number — visual speed relative to the scroll, 1 = moves with the page (default: `1`)

```typescript
{ type: 'GrowScroll', pivot: 'top-left', scale: 0.5 }
```

---

### MoveScroll

Visual: Element translates along an angle for a given distance as it scrolls.

Parameters:

- `direction`: number — angle in degrees the element moves towards, 0° = right, 90° = bottom, 270° = top (default: `-60`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)
- `travel`: UnitLengthPercentage — travel distance (default: `{ value: 400, unit: 'px' }`)

```typescript
{ type: 'MoveScroll', direction: 270, travel: { value: 200, unit: 'px' } }
```

---

### PanScroll

Visual: Horizontal panning tied to scroll.

Parameters:

- `direction`: 'left' | 'right' (default: `'right'`)
- `distance`: UnitLengthPercentage — pan distance (default: `{ value: 400, unit: 'px' }`)
- `startFromOffScreen`: boolean — whether to start from off-screen (default: `true`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)

```typescript
{ type: 'PanScroll', direction: 'left', startFromOffScreen: false }
```

---

### ParallaxScroll

Visual: Element moves at a different speed than the scroll, creating a depth illusion.

Parameters:

- `speed`: number — visual speed relative to the scroll; 1 = moves with the page, below 1 = slower (default: `0.7159`)
- `center`: number — 0 to 1, point of the scroll range where the element is at its natural position (default: `0.5`)

```typescript
{ type: 'ParallaxScroll', speed: 0.6 }
```

---

### RevealScroll

Visual: Element is progressively revealed from an edge via clip-path as it scrolls.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' (default: `'bottom'`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)

```typescript
{ type: 'RevealScroll', direction: 'left', range: 'continuous' }
```

---

### ShapeScroll

Visual: Element is revealed through an expanding geometric clip-path shape on scroll.

Parameters:

- `shape`: 'circle' | 'ellipse' | 'rectangle' | 'diamond' | 'window' (default: `'circle'`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)
- `start`: number — 0 to 1, how open the shape starts (default: `0.5`)

```typescript
{ type: 'ShapeScroll', shape: 'diamond', range: 'out' }
```

---

### ShrinkScroll

Visual: Element shrinks toward a direction as it scrolls into or out of view, the inverse of GrowScroll.

Parameters:

- `pivot`: EffectNineDirections — shrink origin (default: `'center'`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)
- `scale`: number — starting scale on 'in', ending scale otherwise; inverted to above 1 for 'in' and below 1 otherwise (default: `1.2`)
- `speed`: number — visual speed relative to the scroll, 1 = moves with the page (default: `1`)

```typescript
{ type: 'ShrinkScroll', pivot: 'bottom', scale: 2 }
```

---

### ShuttersScroll

Visual: Element is revealed through staggered shutter-like strips that open on scroll in. When scrolling out, the element disappears with the same animation in reverse.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' — the way the shutters open (default: `'right'`)
- `shutters`: number — number of shutter segments, min 1 (default: `12`)
- `staggered`: boolean — whether shutters open in a staggered pattern (default: `true`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)

```typescript
{ type: 'ShuttersScroll', shutters: 6, range: 'continuous' }
```

---

### SkewPanScroll

Visual: Element pans horizontally with a skew distortion as it scrolls.

Parameters:

- `direction`: 'left' | 'right' (default: `'left'`)
- `skew`: number — skew angle in degrees (default: `10`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)

```typescript
{ type: 'SkewPanScroll', skew: 20, direction: 'right' }
```

---

### SlideScroll

Visual: Element slides in from an edge with a clip-path reveal as it scrolls.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' — where the element moves to (default: `'top'`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)

```typescript
{ type: 'SlideScroll', direction: 'left', range: 'out' }
```

---

### Spin3dScroll

Visual: Element performs a 3D spin with rotation on multiple axes as it scrolls.

Parameters:

- `angle`: number — rotation amount in degrees, applied on all axes (default: `100`)
- `speed`: number — visual speed relative to the scroll, 1 = moves with the page (default: `1`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)
- `perspective`: number — 3D perspective in px (default: `1000`)

```typescript
{ type: 'Spin3dScroll', angle: 200, perspective: 600 }
```

---

### SpinScroll

Visual: Element spins (2D rotation) with optional scale change as it scrolls.

Parameters:

- `direction`: 'clockwise' | 'counter-clockwise' (default: `'clockwise'`)
- `spins`: number — number of full rotations (default: `0.15`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)
- `scale`: number — scale during spin (default: `1`)

```typescript
{ type: 'SpinScroll', spins: 0.5, direction: 'counter-clockwise' }
```

---

### StretchScroll

Visual: Element stretches vertically with scaleY increasing while scaleX decreases, with an opacity transition.

Parameters:

- `stretch`: number — -1 to 1, stretch factor (scaleY = 1 + stretch, scaleX = 1 − stretch) (default: `0.6`)
- `range`: 'in' | 'out' | 'continuous' (default: `'out'`)

```typescript
{ type: 'StretchScroll', stretch: 0.8, range: 'continuous' }
```

---

### TiltScroll

Visual: Element tilts in 3D and perspective, with optional parallax vertical movement as it scrolls into or out of view.

Parameters:

- `direction`: 'clockwise' | 'counter-clockwise' — z-rotation direction (default: `'counter-clockwise'`)
- `speed`: number — visual speed relative to the scroll, 1 = moves with the page (default: `1`)
- `perspective`: number — 3D perspective in px (default: `400`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)

```typescript
{ type: 'TiltScroll', direction: 'clockwise', speed: 1.4 }
```

---

### TurnScroll

Visual: Element pans in from off-screen while turning (rotating) as it scrolls.

Parameters:

- `direction`: 'left' | 'right' — where the element moves to (default: `'left'`)
- `spin`: 'clockwise' | 'counter-clockwise' (default: `'clockwise'`)
- `angle`: number — turn angle in degrees (default: `45`)
- `scale`: number — scale during turn (default: `1`)
- `range`: 'in' | 'out' | 'continuous' (default: `'in'`)

```typescript
{ type: 'TurnScroll', direction: 'right', spin: 'counter-clockwise' }
```

---

## Optional Parameters

### 3D Perspective

| Preset       | Parameter     | Default | Range    |
| ------------ | ------------- | ------- | -------- |
| ArcScroll    | `perspective` | 500     | 200-2000 |
| FlipScroll   | `perspective` | 800     | 200-2000 |
| TiltScroll   | `perspective` | 400     | 200-2000 |
| Spin3dScroll | `perspective` | 1000    | 200-2000 |

## Intensity Value Guide

Tested values for different intensity levels. When a user asks for "soft", "subtle", "medium", or "hard"/"dramatic" motion, use these as guidelines.

| Preset        | Parameter | Subtle/Soft | Medium | Dramatic/Hard |
| ------------- | --------- | ----------- | ------ | ------------- |
| BlurScroll    | blur      | 6px         | 25px   | 50px          |
| FlipScroll    | angle     | 60°         | 120°   | 420°          |
| GrowScroll    | scale     | 1.2         | 1.7    | 4             |
| MoveScroll    | travel    | 150px       | 400px  | 800px         |
| ShrinkScroll  | scale     | 0.8         | 0.3    | 0             |
| SkewPanScroll | skew      | 10°         | 17°    | 24°           |
| Spin3dScroll  | angle     | 45°         | 100°   | 200°          |
| SpinScroll    | scale     | 1           | 0.7    | 0.4           |
| StretchScroll | stretch   | 0.2         | 0.5    | 1             |
| TiltScroll    | speed     | 1           | 1.4    | 1.6           |
| TurnScroll    | scale     | 1           | 1.3    | 1.6           |
