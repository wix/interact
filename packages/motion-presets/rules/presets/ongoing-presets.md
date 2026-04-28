---
name: ongoing-presets
description: Full parameter reference for ongoing motion presets. Read when configuring Bounce, Breathe, Cross, DVD, Flash, Flip, Fold, Jello, Poke, Pulse, Rubber, Spin, Swing, or Wiggle continuous loop animations.
---

# Ongoing Presets

Ongoing presets run as continuous, looping animations. They repeat indefinitely until stopped, making them suitable for attention-drawing, idle-state, and ambient effects.

## Table of Contents

- [Bounce](#bounce)
- [Breathe](#breathe)
- [Cross](#cross)
- [DVD](#dvd)
- [Flash](#flash)
- [Flip](#flip)
- [Fold](#fold)
- [Jello](#jello)
- [Poke](#poke)
- [Pulse](#pulse)
- [Rubber](#rubber)
- [Spin](#spin)
- [Swing](#swing)
- [Wiggle](#wiggle)
- [Intensity Value Guide](#intensity-value-guide)

---

### Bounce

Visual: Element bounces up and down with a natural multi-step curve, like a ball settling.

Parameters:

- `intensity`: number — 0 to 1, maps to bounce height factor 1–3 (default: `0`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Bounce', intensity: 0.5, iterationDelay: 500 }
```

---

### Breathe

Visual: Element gently moves back and forth along an axis, like a breathing motion.

Parameters:

- `direction`: 'vertical' | 'horizontal' | 'center' (default: `'vertical'`)
- `distance`: UnitLengthPercentage — movement distance (default: `{ value: 25, unit: 'px' }`)
- `perspective`: number — 3D perspective for center direction (default: `800`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Breathe', direction: 'horizontal', distance: { value: 15, type: 'px' } }
```

---

### Cross

Visual: Element moves across the screen from side to side, horizontally or vertically, until reaching the edge of the view and repeats.

Parameters:

- `direction`: EffectEightDirections — one of 'left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right' (default: `'right'`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Cross', direction: 'top-left' }
```

---

### DVD

Visual: Element bounces diagonally off the viewport edges like a DVD screensaver logo. No configurable parameters — uses viewport dimensions to calculate bounce paths.

Parameters: None.

```typescript
{
  type: 'DVD';
}
```

---

### Flash

Visual: Element blinks by rapidly cycling opacity from visible to invisible and back.

Parameters:

- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Flash', iterationDelay: 300 }
```

---

### Flip

Visual: Element continuously flips with a full 360° 3D rotation.

Parameters:

- `direction`: 'vertical' | 'horizontal' (default: `'horizontal'`)
- `perspective`: number — 3D perspective in px (default: `800`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Flip', direction: 'vertical' }
```

---

### Fold

Visual: Element folds at an edge using 3D rotation, like a page turning back and forth.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' (default: `'top'`)
- `angle`: number — fold angle in degrees (default: `15`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Fold', direction: 'right', angle: 30 }
```

---

### Jello

Visual: Element wobbles with a skew-based jello-like deformation.

Parameters:

- `intensity`: number — 0 to 1, maps to skew factor 1–4 (default: `0.25`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Jello', intensity: 0.5 }
```

---

### Poke

Visual: Element makes two short, sharp translates in a direction back and forth, like being poked.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' (default: `'right'`)
- `intensity`: number — 0 to 1, maps to poke strength factor 1–4 (default: `0.5`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Poke', direction: 'left', intensity: 0.8 }
```

---

### Pulse

Visual: Element pulses by subtly scaling up and down.

Parameters:

- `intensity`: number — 0 to 1, adjusts the scale range (default: `0`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Pulse', intensity: 0.5 }
```

---

### Rubber

Visual: Element stretches non-uniformly on X and Y axes, creating a rubber-band wobble.

Parameters:

- `intensity`: number — 0 to 1, adjusts the stretch amplitude (default: `0.5`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Rubber', intensity: 0.8 }
```

---

### Spin

Visual: Element rotates continuously around its center.

Parameters:

- `direction`: 'clockwise' | 'counter-clockwise' (default: `'clockwise'`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Spin', direction: 'counter-clockwise' }
```

---

### Swing

Visual: Element swings like a pendulum from a pivot at one edge.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' — swing pivot edge (default: `'top'`)
- `swing`: number — maximum swing angle in degrees (default: `20`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Swing', swing: 40, direction: 'right' }
```

---

### Wiggle

Visual: Element shakes with combined rotation and vertical translation.

Parameters:

- `intensity`: number — 0 to 1, maps to wiggle strength factor 1–4 (default: `0.5`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Wiggle', intensity: 0.8 }
```

---

## Intensity Value Guide

Tested values for different intensity levels. When a user asks for "soft", "subtle", "medium", or "hard"/"dramatic" motion, use these as guidelines.

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
