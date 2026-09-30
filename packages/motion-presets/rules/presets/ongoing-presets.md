---
name: ongoing-presets
description: Full parameter reference for ongoing motion presets. Read when configuring Bounce, Breathe, Cross, Flash, Flip, Fold, Jello, Poke, Pulse, Rubber, Spin, Swing, or Wiggle continuous loop animations.
---

# Ongoing Presets

Ongoing presets run as continuous, looping animations. They repeat indefinitely until stopped, making them suitable for attention-drawing, idle-state, and ambient effects.

## Table of Contents

- [Bounce](#bounce)
- [Breathe](#breathe)
- [Cross](#cross)
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

- `travel`: UnitLengthPercentage — bounce height at the peak (default: `{ value: 49, unit: 'px' }`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Bounce', travel: { value: 98, unit: 'px' }, iterationDelay: 500 }
```

---

### Breathe

Visual: Element gently moves back and forth along an axis, like a breathing motion.

Parameters:

- `direction`: 'vertical' | 'horizontal' | 'center' (default: `'vertical'`)
- `travel`: UnitLengthPercentage — movement distance (default: `{ value: 25, unit: 'px' }`)
- `perspective`: number — 3D perspective for center direction (default: `800`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Breathe', direction: 'horizontal', travel: { value: 15, unit: 'px' } }
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

- `pivot`: 'top' | 'right' | 'bottom' | 'left' — the folding edge (default: `'top'`)
- `angle`: number — fold angle in degrees; always folds towards the viewer first (default: `15`)
- `perspective`: number — 3D perspective in px (default: `800`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Fold', pivot: 'right', angle: 30 }
```

---

### Jello

Visual: Element wobbles with a skew-based jello-like deformation.

Parameters:

- `skew`: number — peak skew in degrees (default: `12.25`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Jello', skew: 17.5 }
```

---

### Poke

Visual: Element makes two short, sharp translates in a direction back and forth, like being poked.

Parameters:

- `direction`: 'top' | 'right' | 'bottom' | 'left' (default: `'right'`)
- `travel`: UnitLengthPercentage — poke distance at the peak (default: `{ value: 62.5, unit: 'px' }`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Poke', direction: 'left', travel: { value: 85, unit: 'px' } }
```

---

### Pulse

Visual: Element pulses by subtly scaling up and down.

Parameters:

- `scale`: number — scale at the deeper of the two beats (default: `0.93`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Pulse', scale: 0.87 }
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

- `pivot`: 'top' | 'right' | 'bottom' | 'left' — swing pivot edge (default: `'top'`)
- `angle`: number — maximum swing angle in degrees (default: `20`)
- `iterationDelay`: number — idle time in ms after each iteration cycle (default: `0`)

```typescript
{ type: 'Swing', angle: 40, pivot: 'right' }
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
| Bounce | travel    | 49px        | 98px   | 147px         |
| Fold   | angle     | 15°         | 30°    | 45°           |
| Jello  | skew      | 7°          | 14°    | 28°           |
| Poke   | travel    | 25px        | 50px   | 100px         |
| Pulse  | scale     | 0.93        | 0.87   | 0.81          |
| Rubber | intensity | 0           | 0.5    | 1             |
| Swing  | angle     | 20°         | 40°    | 60°           |
| Wiggle | intensity | 0           | 0.33   | 1             |
