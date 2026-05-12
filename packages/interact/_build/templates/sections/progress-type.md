## detailed
When using `customEffect` with `pointerMove`, the progress parameter is an object:

```typescript
type Progress = {
  x: number; // 0-1: horizontal position (0 = left edge, 1 = right edge)
  y: number; // 0-1: vertical position (0 = top edge, 1 = bottom edge)
  v?: {
    x: number; // Horizontal velocity: negative = moving left, positive = moving right. Magnitude reflects speed.
    y: number; // Vertical velocity: negative = moving up, positive = moving down. Magnitude reflects speed.
  };
  active?: boolean; // Whether mouse is currently in the hit area
};
```
## brief
**Progress object** (for `customEffect`):

```ts
{ x: number; y: number; v?: { x: number; y: number }; active?: boolean }
// x, y: 0–1 normalized position within hit area
// v: velocity vector (unbounded, typically -1 to 1 range at moderate speed; 0 = stationary)
// active: whether pointer is within the active hit area
```
