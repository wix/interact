## detailed
| Method / Property                   | Description                                                                                                   |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| `Interact.create(config)`           | Initialize with a config. Returns the instance. Store the instance to manage its lifecycle.                   |
| `Interact.registerEffects(presets)` | Register named effect presets. MUST be called before `create`.                                                |
| `Interact.destroy()`                | Tear down all instances. Call on unmount or route change to prevent memory leaks.                             |
| `Interact.forceReducedMotion`       | `boolean` (default: `false`) — force reduced-motion behavior regardless of OS setting.                        |
| `Interact.allowA11yTriggers`        | `boolean` (default: `false`) — enable accessibility trigger variants (`interest`, `activate`).                |
| `Interact.setup(options)`           | Configure global options for scroll, pointer, and viewEnter systems. Call before `create`. See options below. |

**`Interact.setup(options)`** — optional configuration object:

| Option                 | Type                           | Description                                                           |
| :--------------------- | :----------------------------- | :-------------------------------------------------------------------- |
| `scrollOptionsGetter`  | `() => Partial<scrollConfig>`  | Function returning defaults for scroll-driven animation configuration |
| `pointerOptionsGetter` | `() => Partial<PointerConfig>` | Function returning defaults for pointer-move animation configuration  |
| `viewEnter`            | `Partial<ViewEnterParams>`     | Defaults for all viewEnter triggers (`threshold`,`inset`)             |
| `allowA11yTriggers`    | `boolean`                      | Enable accessibility trigger variants (use `interest` and `activate`) |

Use `setup()` when you need to override default observer thresholds or provide global configuration that applies to all interactions of a given trigger type.

Each `Interact.create()` call returns an instance. Store instances and call `instance.destroy()` when no longer needed (e.g. on component unmount) to prevent stale listeners and memory leaks.

## brief
Each `Interact.create(config)` call returns an instance. Keep a reference if you need to add/remove elements dynamically (vanilla JS) or to destroy a specific instance. Call `Interact.destroy()` to tear down all instances at once (e.g. on page navigation).

| Method / Property                   | Description                                                                                  |
| :---------------------------------- | :------------------------------------------------------------------------------------------- |
| `Interact.create(config)`           | Initialize with a config. Returns the instance. Multiple configs create separate instances.  |
| `Interact.registerEffects(presets)` | Register named effect presets before `create`. Required for `namedEffect` usage.             |
| `Interact.destroy()`                | Tear down all instances.                                                                     |
| `Interact.forceReducedMotion`       | `boolean` — force reduced-motion behavior regardless of OS setting. Default: `false`.        |
| `Interact.allowA11yTriggers`        | `boolean` — enable accessibility triggers (`interest`, `activate`). Default: `false`.        |
| `Interact.setup(options)`           | Configure global defaults for scroll/pointer/viewEnter trigger params. Call before `create`. |
