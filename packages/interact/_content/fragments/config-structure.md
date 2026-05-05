<!-- #detailed -->
```ts
type InteractConfig = {
  interactions: Interaction[]; // REQUIRED
  effects?: Record<string, Effect>; // reusable effects referenced by effectId
  sequences?: Record<string, SequenceConfig>; // reusable sequences by sequenceId
  conditions?: Record<string, Condition>; // named conditions; keys are condition ids
};
```

All cross-references (by id) MUST point to existing entries. Element keys MUST be stable for the config's lifetime.

<!-- #brief -->
### InteractConfig

```typescript
type InteractConfig = {
  interactions: Interaction[];
  effects?: Record<string, Effect>;
  sequences?: Record<string, SequenceConfig>;
  conditions?: Record<string, Condition>;
};
```

| Field          | Description                                                             |
| :------------- | :---------------------------------------------------------------------- |
| `interactions` | Required. Array of interaction definitions binding triggers to effects. |
| `effects?`     | Reusable effects referenced by `effectId` from interactions.            |
| `sequences?`   | Reusable sequence definitions, referenced by `sequenceId`.              |
| `conditions?`  | Named conditions (media/container/selector queries), referenced by ID.  |

Each call to `Interact.create(config)` creates a new `Interact` instance. A single config can define multiple interactions.
