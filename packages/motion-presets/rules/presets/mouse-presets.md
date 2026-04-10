---
name: mouse-presets
description: Full parameter reference for mouse motion presets. Read when configuring AiryMouse, BlobMouse, BlurMouse, ScaleMouse, SkewMouse, SwivelMouse, Tilt3DMouse, Track3DMouse, or TrackMouse pointer-driven animations.
---

# Mouse Presets

Mouse presets drive element transforms in real-time based on pointer position. The element responds to cursor movement with translation, rotation, scale, or other effects. All mouse presets share the `inverted` base parameter.

**Mobile note:** Mouse presets respond to pointer events. On touch devices, behavior may differ — the element responds to touch position rather than a persistent cursor, so effects may only activate during active touch. Consider this when designing for cross-device experiences.

## Table of Contents

- [Shared Parameters](#shared-parameters)
- [AiryMouse](#airymouse)
- [BlobMouse](#blobmouse)
- [BlurMouse](#blurmouse)
- [ScaleMouse](#scalemouse)
- [SkewMouse](#skewmouse)
- [SwivelMouse](#swivelmouse)
- [Tilt3DMouse](#tilt3dmouse)
- [Track3DMouse](#track3dmouse)
- [TrackMouse](#trackmouse)
- [Intensity Value Guide](#intensity-value-guide)

---

## Shared Parameters

These parameters are available on all mouse presets:

- `inverted`: boolean — reverses the movement/effect direction (default: `false`)

The `axis` parameter, where available, accepts:

- `'both'`: respond on both axes
- `'horizontal'`: respond only on X
- `'vertical'`: respond only on Y

---

### AiryMouse

Visual: Element floats and rotates gently following the cursor, creating an airy, weightless feel.

Parameters:

- `inverted`: boolean (default: `false`)
- `distance`: UnitLengthPercentage — max translate distance (default: `{ value: 200, unit: 'px' }`)
- `angle`: number — max rotation in degrees (default: `30`)
- `axis`: 'both' | 'horizontal' | 'vertical' (default: `'both'`)

```typescript
{ type: 'AiryMouse', angle: 50, distance: { value: 150, type: 'px' } }
```

---

### BlobMouse

Visual: Element translates and scales non-uniformly following the cursor, creating a heavy liquid-like deformation.

Parameters:

- `inverted`: boolean (default: `false`)
- `distance`: UnitLengthPercentage — max translate distance (default: `{ value: 200, unit: 'px' }`)
- `scale`: number — max scale at edges (default: `1.4`)

```typescript
{ type: 'BlobMouse', scale: 2, distance: { value: 100, type: 'px' } }
```

---

### BlurMouse

Visual: Element translates, tilts in 3D, scales, and blurs based on distance from the cursor.

Parameters:

- `inverted`: boolean (default: `false`)
- `distance`: UnitLengthPercentage — max translate distance (default: `{ value: 80, unit: 'px' }`)
- `angle`: number — max 3D rotation in degrees (default: `5`)
- `scale`: number — min scale at edges (default: `0.3`)
- `blur`: number — max blur in px (default: `20`)
- `perspective`: number — 3D perspective in px (default: `600`)

```typescript
{ type: 'BlurMouse', blur: 30, angle: 10 }
```

---

### ScaleMouse

Visual: Element translates and scales uniformly following the cursor.

Parameters:

- `inverted`: boolean (default: `false`)
- `distance`: UnitLengthPercentage — max translate distance (default: `{ value: 80, unit: 'px' }`)
- `scale`: number — scale at edges, >1 for grow, <1 for shrink (default: `1.4`)
- `axis`: 'both' | 'horizontal' | 'vertical' (default: `'both'`)

```typescript
{ type: 'ScaleMouse', scale: 0.5 }
```

---

### SkewMouse

Visual: Element translates and skews following the cursor, creating a directional distortion.

Parameters:

- `inverted`: boolean (default: `false`)
- `distance`: UnitLengthPercentage — max translate distance (default: `{ value: 200, unit: 'px' }`)
- `angle`: number — max skew angle in degrees (default: `25`)
- `axis`: 'both' | 'horizontal' | 'vertical' (default: `'both'`)

```typescript
{ type: 'SkewMouse', angle: 15, axis: 'horizontal' }
```

---

### SwivelMouse

Visual: Element tilts in 3D around a chosen pivot axis following the cursor.

Parameters:

- `inverted`: boolean (default: `false`)
- `angle`: number — max tilt angle in degrees (default: `5`)
- `perspective`: number — 3D perspective in px (default: `800`)
- `pivotAxis`: 'top' | 'bottom' | 'right' | 'left' | 'center-horizontal' | 'center-vertical' (default: `'center-horizontal'`)

```typescript
{ type: 'SwivelMouse', angle: 25, pivotAxis: 'top' }
```

---

### Tilt3DMouse

Visual: Element tilts in 3D based on cursor position, rotating on X and Y axes from center.

Parameters:

- `inverted`: boolean (default: `false`)
- `angle`: number — max tilt angle in degrees (default: `5`)
- `perspective`: number — 3D perspective in px (default: `800`)

```typescript
{ type: 'Tilt3DMouse', angle: 15, perspective: 500 }
```

---

### Track3DMouse

Visual: Element translates and tilts in 3D following the cursor, combining movement with perspective rotation.

Parameters:

- `inverted`: boolean (default: `false`)
- `distance`: UnitLengthPercentage — max translate distance (default: `{ value: 200, unit: 'px' }`)
- `angle`: number — max 3D rotation in degrees (default: `5`)
- `axis`: 'both' | 'horizontal' | 'vertical' (default: `'both'`)
- `perspective`: number — 3D perspective in px (default: `800`)

```typescript
{ type: 'Track3DMouse', angle: 15, distance: { value: 100, type: 'px' } }
```

---

### TrackMouse

Visual: Element follows the cursor with direct translation, no rotation.

Parameters:

- `inverted`: boolean (default: `false`)
- `distance`: UnitLengthPercentage — max translate distance (default: `{ value: 200, unit: 'px' }`)
- `axis`: 'both' | 'horizontal' | 'vertical' (default: `'both'`)

```typescript
{ type: 'TrackMouse', distance: { value: 100, type: 'px' }, axis: 'vertical' }
```

---

## Intensity Value Guide

Tested values for different intensity levels. When a user asks for "soft", "subtle", "medium", or "hard"/"dramatic" motion, use these as guidelines.

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
