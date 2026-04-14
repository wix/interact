# Interact Class

The `Interact` class is the main entry point for managing interactions in your application. It provides both static methods for global operations and instance methods for managing specific interaction configurations.

## Import

```typescript
// Web entry point with automatic custom-element registration
import { Interact } from '@wix/interact/web';

// React entry point
import { Interact } from '@wix/interact/react';

// Base entry point (no framework/native-specific features)
import { Interact } from '@wix/interact';
```

## Class Overview

```typescript
class Interact {
  // Static methods
  static create(config: InteractConfig, options?: { useCustomElement?: boolean }): Interact;
  static getInstance(key: string): Interact | undefined;
  static destroy(): void;
  static setup(options: {
    scrollOptionsGetter?: () => Partial<scrollConfig>;
    pointerOptionsGetter?: () => Partial<PointerConfig>;
    viewEnter?: Partial<ViewEnterParams>;
    allowA11yTriggers?: boolean;
  }): void;
  static registerEffects(effects: Record<string, NamedEffect>): void;
  static getController(key: string | undefined): IInteractionController | undefined;

  // Instance methods
  init(config: InteractConfig, options?: { useCustomElement?: boolean }): void;
  destroy(): void;
  has(key: string): boolean;
  get(key: string): InteractCache['interactions'][string] | undefined;
}
```

## Static Methods

### `Interact.create(config)`

Creates a new `Interact` instance with the provided configuration and initializes it.

**Parameters:**

- `config: InteractConfig` - The interaction configuration object

**Returns:** `Interact` - The initialized interact instance

**Example:**

```typescript
import { Interact } from '@wix/interact/web';

const config = {
  interactions: [
    {
      trigger: 'viewEnter',
      params: { type: 'once' },
      key: 'hero',
      effects: [{ effectId: 'fade-in' }],
    },
  ],
  effects: {
    'fade-in': {
      duration: 1000,
      keyframeEffect: {
        name: 'fade-in',
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
      },
    },
  },
};

const interact = Interact.create(config);
```

**Details:**

- Returns the fully initialized instance ready for use
- When using the web entry point, registers the custom `interact-element` if not already registered

### `Interact.getInstance(key)`

Retrieves the `Interact` instance that manages interactions for a specific element key.

**Parameters:**

- `key: string` - The element key to search for

**Returns:** `Interact | undefined` - The instance managing this key, or undefined if not found

**Example:**

```typescript
// Get the instance managing interactions for 'hero'
const instance = Interact.getInstance('hero');

if (instance) {
  console.log('Found instance managing hero');
  console.log('Has interactions:', instance.has('hero'));
}
```

### `Interact.destroy()`

Destroys all `Interact` instances and clears all cached controllers.

**Returns:** `void`

**Example:**

```typescript
// Clean up everything
Interact.destroy();

console.log('All instances destroyed:', Interact.instances.length === 0);
console.log('Cache cleared:', Interact.controllerCache.size === 0);
```

### `Interact.setup(options)`

Configures global settings for the Interact system.

**Parameters:**

- `options.scrollOptionsGetter` - Optional callback returning default partial scroll config for `viewProgress` trigger
- `options.pointerOptionsGetter` - Optional callback returning default partial pointer config for `pointerMove` trigger
- `options.viewEnter` - Optional default partial `ViewEnterParams` (e.g. `threshold`, `inset`, `useSafeViewEnter`)
- `options.allowA11yTriggers` - When `true`, `click` and `hover` triggers also respond to keyboard (Enter/Space) and focus

To force reduced motion globally, set `Interact.forceReducedMotion = true` (static property, not via `setup`).

**Example:**

```typescript
// Configure viewEnter defaults
Interact.setup({
  viewEnter: { threshold: 0.5 },
});

// Provide scroll/pointer options via getters
Interact.setup({
  scrollOptionsGetter: () => ({
    /* scroll config */
  }),
  pointerOptionsGetter: () => ({
    /* pointer config */
  }),
});

// Enable accessibility for click and hover triggers
Interact.setup({
  allowA11yTriggers: true,
});
```

### `Interact.registerEffects(effects)`

Registers named-effect (or presets) modules so you can reference them via `namedEffect` (e.g. presets from `@wix/motion-presets` or your own custom-made effects).

**Parameters:**

- `effects: Record<string, EffectModule>` - An object mapping effect names (used as `namedEffect.type`) to effect modules

**Returns:** `void`

**Example:**

```typescript
import { Interact } from '@wix/interact/web';
import * as presets from '@wix/motion-presets';

// Register all presets at once
Interact.registerEffects(presets);

// Now you can use namedEffect in your configuration
const config = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [
        {
          namedEffect: { type: 'FadeIn' }, // Works because FadeIn is registered
          duration: 1000,
        },
      ],
    },
  ],
};

Interact.create(config);
```

**Selective Registration:**

```typescript
import { Interact } from '@wix/interact/web';
import { FadeIn, SlideIn } from '@wix/motion-presets';

// Register only the effects you need (smaller bundle)
Interact.registerEffects({ FadeIn, SlideIn });
```

**Custom effect registration:**

```typescript
import { Interact } from '@wix/interact/web';

Interact.registerEffects({
  CustomFadeIn: {
    web: (options) => [
      { ...options, name: 'CustomFadeIn', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
    ],
    getNames: () => ['CustomFadeIn'],
    style: (options) => [
      { ...options, name: 'CustomFadeIn', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
    ],
  },
});
```

**Details:**

- Effects must be registered before calling `Interact.create()` with configurations that reference them
- Registration is global — once registered, effects are available to all Interact instances

### `Interact.getController(key)`

Retrieves a cached `InteractionController` by its key.

**Parameters:**

- `key: string | undefined` - The element key to retrieve

**Returns:** `IInteractionController | undefined` - The cached controller, or undefined if not found

**Example:**

```typescript
// Get a cached controller
const controller = Interact.getController('my-element');

if (controller) {
  console.log('Controller found in cache');
  console.log('Connected:', controller.connected);

  // You can interact with the controller directly
  controller.toggleEffect('my-effect', 'add');

  // Get active effects
  const activeEffects = controller.getActiveEffects();
  console.log('Active effects:', activeEffects);
}
```

**Details:**

- Controllers are automatically cached when `add()` is called or when custom elements connect
- Cache is cleared when `remove()` is called or when elements disconnect
- Useful for programmatic element manipulation
- Returns the controller that manages the element's interactions

## Instance Methods

### `init(config)`

Initializes the instance with a configuration object.

**Parameters:**

- `config: InteractConfig` - The interaction configuration

**Returns:** `void`

**Example:**

```typescript
const instance = new Interact();

const config = {
  interactions: [
    {
      trigger: 'click',
      key: 'button',
      effects: [{ effectId: 'bounce' }],
    },
  ],
  effects: {
    bounce: {
      duration: 500,
      namedEffect: 'bounce',
    },
  },
};

instance.init(config);
```

**Details:**

- Can be called multiple times to update configuration

### `destroy()`

Destroys this instance and cleans up all its resources.

**Returns:** `void`

**Example:**

```typescript
const instance = Interact.create(config);

// Later, clean up this specific instance
instance.destroy();
```

**Details:**

- Disconnects all controllers managed by this instance
- Removes all media query listeners
- Clears all interaction state
- Removes this instance from `Interact.instances`

### `has(key)`

Checks if the instance has interactions configured for a specific element key.

**Parameters:**

- `key: string` - The element key to check

**Returns:** `boolean` - True if interactions exist for this key

**Example:**

```typescript
const instance = Interact.create(config);

// Check if an element has interactions
if (instance.has('hero')) {
  console.log('hero has interactions configured');
} else {
  console.log('hero has no interactions');
}

// Useful for conditional logic
if (instance.has('optional-animation')) {
  // Only add element if it has interactions
  document.body.appendChild(createOptionalElement());
}
```

### `get(key)`

Gets the cached interaction data for a specific element key.

**Parameters:**

- `key: string` - The element key to retrieve

**Returns:** `CachedInteractionData | undefined` - The cached data or undefined

**Example:**

```typescript
const instance = Interact.create(config);

const data = instance.get('hero');
if (data) {
  console.log('Triggers:', data.triggers);
  console.log('Effects:', data.effects);
  console.log('Selectors:', data.selectors);
}
```

## Error Handling

The `Interact` class includes built-in error handling and validation:

```typescript
// Configuration validation
const config = {
  interactions: [
    {
      // Missing key will log an error
      trigger: 'click',
      effects: [{ effectId: 'missing-effect' }],
    },
  ],
};

const instance = Interact.create(config);
// Console: "Interaction 1 is missing a key for source element."
```

## See Also

- [Standalone Functions](functions.md) - `add()` and `remove()` functions
- [InteractionController](interaction-controller.md) - Controller class API
- [Type Definitions](types.md) - `InteractConfig` and related types
- [Custom Element](interact-element.md) - `interact-element` API
- [React Integration](../integration/react.md) - React components and hooks
- [Configuration Guide](../guides/configuration-structure.md) - Building interaction configurations
