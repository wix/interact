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

- `from`: 'top' | 'right' | 'bottom' | 'left' — the side the element comes from (default: `'right'`)
- `depth`: UnitLengthPercentage — Z translation distance (default: `{ value: 100, unit: 'px' }`)
- `perspective`: number — 3D perspective in px (default: `800`)

```typescript
{ type: 'ArcIn', from: 'bottom' }
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

- `from`: 'top' | 'right' | 'bottom' | 'left' | 'back' (default: `'bottom'`)
- `travel`: UnitLengthPercentage — bounce distance (default: `{ value: 50, unit: 'px' }`)
- `perspective`: number — 3D perspective for `'back'` (default: `800`)

```typescript
{ type: 'BounceIn', from: 'left', travel: { value: 100, unit: 'px' } }
```

---

### CurveIn

Visual: Element curves in with a 180° rotation and depth motion in a 3D space, creating a swinging arc entrance.

Parameters:

- `from`: 'top' | 'right' | 'bottom' | 'left' (default: `'right'`)
- `depth`: UnitLengthPercentage — Z translation distance (default: `{ value: 900, unit: 'px' }`)
- `perspective`: number — 3D perspective in px (default: `200`)

```typescript
{ type: 'CurveIn', from: 'left' }
```

---

### DropIn

Visual: Element shrinks down from a larger size to its final scale.

Parameters:

- `scale`: number — starting scale before settling to 1, min 1 (default: `1.6`)

```typescript
{ type: 'DropIn', scale: 2 }
```

---

### ExpandIn

Visual: Element expands from a point in a given direction, scaling from small to full size with a fade-in.

Parameters:

- `scale`: number — 0 to 1, starting scale, 0 = invisible (default: `0`)
- `from`: number | 'top' | 'right' | 'bottom' | 'left' — angle or side it comes from (default: `270` / top). 0° = right, 90° = bottom, 180° = left, 270° = top
- `travel`: UnitLengthPercentage — how far the element travels (default: `{ value: 120, unit: 'percentage' }`)

```typescript
{ type: 'ExpandIn', from: 'bottom', scale: 0.5 }
```

---

### FlipIn

Visual: Element flips into view with a 3D rotation around the X or Y axis.

Parameters:

- `direction`: 'horizontal' | 'vertical' — flip axis (default: `'vertical'`)
- `angle`: number — starting rotation in degrees; negative flips the other way (default: `90`)
- `perspective`: number — 3D perspective in px (default: `800`)

```typescript
{ type: 'FlipIn', direction: 'horizontal', angle: 180 }
```

---

### FloatIn

Visual: Element drifts gently into place from a direction with a fade-in.

Parameters:

- `from`: 'top' | 'right' | 'bottom' | 'left' (default: `'left'`)

```typescript
{ type: 'FloatIn', from: 'bottom' }
```

---

### FoldIn

Visual: Element unfolds from an edge, rotating around an axis at the edge as if hinged.

Parameters:

- `pivot`: 'top' | 'right' | 'bottom' | 'left' — the hinged edge (default: `'top'`)
- `angle`: number — starting fold angle in degrees (default: `-90`)
- `perspective`: number — 3D perspective in px (default: `800`)

```typescript
{ type: 'FoldIn', pivot: 'left', angle: -60 }
```

---

### GlideIn

Visual: Element glides in smoothly from off-screen along a direction.

Parameters:

- `from`: number | 'top' | 'right' | 'bottom' | 'left' — angle or side it comes from (default: `180` / left). 0° = right, 90° = bottom, 180° = left, 270° = top
- `travel`: UnitLengthPercentage — travel distance (default: `{ value: 100, unit: 'percentage' }`)

```typescript
{ type: 'GlideIn', from: 90, travel: { value: 200, unit: 'px' } }
```

---

### RevealIn

Visual: Element is progressively revealed by an expanding clip-path from one edge.

Parameters:

- `from`: 'top' | 'right' | 'bottom' | 'left' — the edge the reveal starts from (default: `'left'`)

```typescript
{ type: 'RevealIn', from: 'bottom' }
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

- `from`: 'top' | 'right' | 'bottom' | 'left' — the side the shutters open from (default: `'left'`)
- `shutters`: number — number of shutter segments, min 1 (default: `12`)
- `staggered`: boolean — whether shutters open in a staggered pattern (default: `true`)

```typescript
{ type: 'ShuttersIn', from: 'bottom', shutters: 8 }
```

---

### SlideIn

Visual: Element slides in from one side while being revealed with a clip-path mask.

Parameters:

- `from`: 'top' | 'right' | 'bottom' | 'left' (default: `'left'`)
- `start`: number — 0 to 1, how far into the slide the element starts; 0 = fully offset (default: `0`)

```typescript
{ type: 'SlideIn', from: 'right', start: 0.5 }
```

---

### SpinIn

Visual: Element spins into view while scaling from small to full size.

Parameters:

- `spins`: number — number of full rotations (default: `0.5`)
- `direction`: 'clockwise' | 'counter-clockwise' (default: `'clockwise'`)
- `scale`: number — starting scale, 0 = invisible (default: `0`)

```typescript
{ type: 'SpinIn', spins: 1, direction: 'counter-clockwise' }
```

---

### TiltIn

Visual: Element tilts in from the side with 3D rotation and a clip-path reveal.

Parameters:

- `from`: 'left' | 'right' (default: `'left'`)
- `depth`: UnitLengthPercentage — Z translation distance (default: `{ value: 100, unit: 'px' }`)
- `perspective`: number — 3D perspective in px (default: `800`)

```typescript
{ type: 'TiltIn', from: 'right' }
```

---

### TurnIn

Visual: Element rotates into view around a corner pivot point.

Parameters:

- `pivot`: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' (default: `'top-left'`)

```typescript
{ type: 'TurnIn', pivot: 'bottom-right' }
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

| Preset          | Parameter     | Default | Range    |
| --------------- | ------------- | ------- | -------- |
| ArcIn           | `perspective` | 800     | 200-2000 |
| TiltIn          | `perspective` | 800     | 200-2000 |
| FoldIn          | `perspective` | 800     | 200-2000 |
| FlipIn          | `perspective` | 800     | 200-2000 |
| CurveIn         | `perspective` | 200     | 100-1000 |
| BounceIn (back) | `perspective` | 800     | 200-2000 |

### Depth (Z Translation)

| Preset  | Parameter | Default | Notes                  |
| ------- | --------- | ------- | ---------------------- |
| ArcIn   | `depth`   | 100px   | Z translation distance |
| CurveIn | `depth`   | 900px   | Z translation distance |
| TiltIn  | `depth`   | 100px   | Z translation distance |

## Intensity Value Guide

Tested values for different intensity levels. When a user asks for "soft", "subtle", "medium", or "hard"/"dramatic" motion, use these as guidelines.

| Preset   | Parameter | Subtle/Soft | Medium     | Dramatic/Hard |
| -------- | --------- | ----------- | ---------- | ------------- |
| ArcIn    | easing    | sineOut     | cubicInOut | quintInOut    |
| BlurIn   | blur      | 6px         | 25px       | 50px          |
| BounceIn | travel    | 50px        | 100px      | 150px         |
| DropIn   | scale     | 1.2         | 1.6        | 2             |
| FlipIn   | angle     | 35°         | 60°        | 90°           |
| FoldIn   | angle     | -35°        | -60°       | -90°          |
| ExpandIn | scale     | 0.8         | 0.6        | 0             |
| SlideIn  | start     | 0.8         | 0.2        | 0             |
| SpinIn   | scale     | 1           | 0.6        | 0             |

### Intensity Usage Example

When a user asks: "I want a subtle flip entrance"

Suggest: `{ type: 'FlipIn', angle: 35 }`
