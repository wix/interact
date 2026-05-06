<!-- #default -->
## Interactions

Each interaction maps a source element + trigger to one or more effects.

**Multiple effects per interaction:** A single interaction can contain multiple effects in its `effects` array. All effects in the same interaction share the same trigger — they all fire together when the trigger activates. Use this to apply different animations to different targets from the same trigger event, rather than creating separate interactions with duplicate trigger configs.

```ts
{
  key: string;                   // REQUIRED — matches data-interact-key / interactKey - the root element
  trigger: TriggerType;          // REQUIRED
  params?: TriggerParams;        // trigger-specific options
  effects?: (Effect | EffectRef)[]; // possible to add multiple effects for same trigger
  sequences?: (SequenceConfig | SequenceConfigRef)[]; // possible to add multiple sequences for same trigger
  conditions?: string[];         // ids referencing the top-level conditions map; all must pass
  selector?: string;             // optional - CSS selector to refine source element selection within the root element
  listContainer?: string;        // optional — CSS selector for list container
  listItemSelector?: string;     // optional — CSS selector to filter which children of listContainer are observed as sources
}
```

At least one of `effects` or `sequences` MUST be provided.

For most use cases, `key` alone is sufficient for both source and target resolution. The `selector`, `listContainer`, and `listItemSelector` fields are only needed for advanced patterns (lists, delegated triggers, child targeting). See [Element Resolution](#element-resolution) for details.
