---
name: entrance-presets
description: Full parameter reference for entrance motion presets. Read when configuring FadeIn, ArcIn, BlurIn, BounceIn, CurveIn, DropIn, ExpandIn, FlipIn, FloatIn, FoldIn, GlideIn, RevealIn, ShapeIn, ShuttersIn, SlideIn, SpinIn, TiltIn, TurnIn, or WinkIn entrance animations.
---

# Entrance Presets

Entrance presets animate an element's first appearance, typically triggered when it enters the viewport. They can also be triggered by hover, click, or other events.

## Table of Contents

- [FadeIn](#fadein)
- [ArcIn](#arcin)
- [BlurIn](#blurin)
- [BounceIn](#bouncein)
- [CurveIn](#curvein)
- [DropIn](#dropin)
- [ExpandIn](#expandin)
- [FlipIn](#flipin)
- [FloatIn](#floatin)
- [FoldIn](#foldin)
- [GlideIn](#glidein)
- [RevealIn](#revealin)
- [ShapeIn](#shapein)
- [ShuttersIn](#shuttersin)
- [SlideIn](#slidein)
- [SpinIn](#spinin)
- [TiltIn](#tiltin)
- [TurnIn](#turnin)
- [WinkIn](#winkin)
- [Optional Parameters](#optional-parameters)
- [Intensity Value Guide](#intensity-value-guide)

---

### FadeIn

Visual: Element fades in smoothly from fully transparent to fully opaque.

Parameters: None — this preset has no configurable parameters.

```typescript
{
  type: 'FadeIn';
}
```

---

### ArcIn

Visual: Element enters along a 3D arc path, rotating into view with depth motion.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' (default: `'right'`)
- `depth`: UnitLengthPercentage — Z translation distance (default: `{ value: 200, unit: 'px' }`)
- `perspective`: number — 3D perspective in px (default: `800`)

```typescript
{ type: 'ArcIn', direction: 'bottom' }
```

---

### BlurIn

Visual: Element transitions from blurred to sharp while fading in.

Parameters:

- `blur`: number — initial blur amount in px (default: `6`)

```typescript
{ type: 'BlurIn', blur: 25 }
```

---

### BounceIn

Visual: Element bounces into place from a direction with an elastic multi-step curve.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' | 'center' (default: `'bottom'`)
- `distanceFactor`: number — bounce distance multiplier (default: `1`)
- `perspective`: number — 3D perspective for center direction (default: `800`)

```typescript
{ type: 'BounceIn', direction: 'left', distanceFactor: 2 }
```

---

### CurveIn

Visual: Element curves in with a 180° rotation and depth motion in a 3D space, creating a swinging arc entrance.

Parameters:

- `direction`: 'left' | 'right' | 'pseudoLeft' | 'pseudoRight' (default: `'right'`)
- `depth`: UnitLengthPercentage — Z translation distance (default: `{ value: 300, unit: 'px' }`)
- `perspective`: number — 3D perspective in px (default: `200`)

```typescript
{ type: 'CurveIn', direction: 'left' }
```

---

### DropIn

Visual: Element shrinks down from a larger size to its final scale.

Parameters:

- `initialScale`: number — starting scale before settling to 1 (default: `1.6`)

```typescript
{ type: 'DropIn', initialScale: 2 }
```

---

### ExpandIn

Visual: Element expands from a point in a given direction, scaling from small to full size with a fade-in.

Parameters:

- `initialScale`: number — starting scale, 0 = invisible (default: `0`)
- `direction`: number | 'top' | 'right' | 'bottom' | 'left' — angle or cardinal direction (default: `90` / top). 0° = right, 90° = top, 180° = left, 270° = bottom
- `distance`: UnitLengthPercentage — how far the element travels (default: `{ value: 120, unit: 'percentage' }`)

```typescript
{ type: 'ExpandIn', direction: 'bottom', initialScale: 0.5 }
```

---

### FlipIn

Visual: Element flips into view with a 3D rotation around the X or Y axis.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' (default: `'top'`)
- `initialRotate`: number — starting rotation in degrees (default: `90`)
- `perspective`: number — 3D perspective in px (default: `800`)

```typescript
{ type: 'FlipIn', direction: 'right', initialRotate: 180 }
```

---

### FloatIn

Visual: Element drifts gently into place from a direction with a fade-in.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' (default: `'left'`)

```typescript
{ type: 'FloatIn', direction: 'bottom' }
```

---

### FoldIn

Visual: Element unfolds from an edge, rotating around an axis at the edge as if hinged.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' (default: `'top'`)
- `initialRotate`: number — starting fold angle in degrees (default: `90`)
- `perspective`: number — 3D perspective in px (default: `800`)

```typescript
{ type: 'FoldIn', direction: 'left', initialRotate: 60 }
```

---

### GlideIn

Visual: Element glides in smoothly from off-screen along a direction.

Parameters:

- `direction`: number | 'top' | 'right' | 'bottom' | 'left' — angle or cardinal (default: `180` / left). 0° = right, 90° = top, 180° = left, 270° = bottom
- `distance`: UnitLengthPercentage | 'top' | 'right' | 'bottom' | 'left' — travel distance or edge keyword (default: `{ value: 100, unit: 'percentage' }`)

```typescript
{ type: 'GlideIn', direction: 270, distance: { value: 200, type: 'px' } }
```

---

### RevealIn

Visual: Element is progressively revealed by an expanding clip-path from one edge.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' (default: `'left'`)

```typescript
{ type: 'RevealIn', direction: 'bottom' }
```

---

### ShapeIn

Visual: Element appears through an expanding geometric clip-path shape.

Parameters:

- `shape`: 'circle' | 'ellipse' | 'rectangle' | 'diamond' | 'window' (default: `'rectangle'`)

```typescript
{ type: 'ShapeIn', shape: 'circle' }
```

---

### ShuttersIn

Visual: Element is revealed through multiple shutter-like strips that open in sequence.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' (default: `'right'`)
- `shutters`: number — number of shutter segments (default: `12`)
- `staggered`: boolean — whether shutters open in a staggered pattern (default: `true`)

```typescript
{ type: 'ShuttersIn', direction: 'top', shutters: 8 }
```

---

### SlideIn

Visual: Element slides in from one side while being revealed with a clip-path mask.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' (default: `'left'`)
- `initialTranslate`: number — 0 to 1, how far off-screen the element starts (default: `1`)

```typescript
{ type: 'SlideIn', direction: 'right', initialTranslate: 0.5 }
```

---

### SpinIn

Visual: Element spins into view while scaling from small to full size.

Parameters:

- `spins`: number — number of full rotations (default: `0.5`)
- `direction`: 'clockwise' | 'counter-clockwise' (default: `'clockwise'`)
- `initialScale`: number — starting scale, 0 = invisible (default: `0`)

```typescript
{ type: 'SpinIn', spins: 1, direction: 'counter-clockwise' }
```

---

### TiltIn

Visual: Element tilts in from the side with 3D rotation and a clip-path reveal.

Parameters:

- `direction`: 'left' | 'right' (default: `'left'`)
- `depth`: UnitLengthPercentage — Z translation distance (default: `{ value: 200, unit: 'px' }`)
- `perspective`: number — 3D perspective in px (default: `800`)

```typescript
{ type: 'TiltIn', direction: 'right' }
```

---

### TurnIn

Visual: Element rotates into view around a corner pivot point.

Parameters:

- `direction`: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' (default: `'top-left'`)

```typescript
{ type: 'TurnIn', direction: 'bottom-right' }
```

---

### WinkIn

Visual: Element winks into view by expanding from its horizontal or vertical center, while being revealed with a clip-path.

Parameters:

- `direction`: 'horizontal' | 'vertical' (default: `'horizontal'`)

```typescript
{ type: 'WinkIn', direction: 'vertical' }
```

---

## Optional Parameters

Some preset parameters are exposed but their defaults have been tuned for good visual results and rarely need adjustment.

### 3D Perspective

| Preset            | Parameter     | Default | Range    |
| ----------------- | ------------- | ------- | -------- |
| ArcIn             | `perspective` | 800     | 200-2000 |
| TiltIn            | `perspective` | 800     | 200-2000 |
| FoldIn            | `perspective` | 800     | 200-2000 |
| FlipIn            | `perspective` | 800     | 200-2000 |
| CurveIn           | `perspective` | 200     | 100-1000 |
| BounceIn (center) | `perspective` | 800     | 200-2000 |

### Depth (Z Translation)

| Preset  | Parameter | Default | Notes                  |
| ------- | --------- | ------- | ---------------------- |
| ArcIn   | `depth`   | 200px   | Z translation distance |
| CurveIn | `depth`   | 300px   | Z translation distance |
| TiltIn  | `depth`   | 200px   | Z translation distance |

## Intensity Value Guide

Tested values for different intensity levels. When a user asks for "soft", "subtle", "medium", or "hard"/"dramatic" motion, use these as guidelines.

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

### Intensity Usage Example

When a user asks: "I want a subtle flip entrance"

Suggest: `{ type: 'FlipIn', initialRotate: 35 }`
