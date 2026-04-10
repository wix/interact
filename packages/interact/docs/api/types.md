# Type Definitions

Complete TypeScript interface and type definitions for `@wix/interact`. These types ensure type safety when configuring interactions and working with the API.

## Import

```typescript
// From web entry point
import type {
  InteractConfig,
  Interaction,
  Effect,
  TriggerType,
  IInteractionController,
  IInteractElement,
  InteractOptions,
  // ... other types
} from '@wix/interact/web';

// From React entry point
import type {
  InteractConfig,
  Interaction,
  Effect,
  TriggerType,
  IInteractionController,
  InteractRef,
  InteractOptions,
  // ... other types
} from '@wix/interact/react';

// From base entry point (no framework-specific types)
import type {
  InteractConfig,
  Interaction,
  Effect,
  TriggerType,
  // ... other types
} from '@wix/interact';
```

## Configuration Types

### `InteractConfig`

The main configuration object for defining interactions, effects, and conditions.

```typescript
type InteractConfig = {
  effects: Record<string, Effect>;
  conditions?: Record<string, Condition>;
  interactions: Interaction[];
};
```

**Properties:**

- `interactions` - Array of interaction definitions (required)
- `effects` - Map of reusable effect definitions by ID (required)
- `conditions` - Map of conditional logic definitions by ID (optional)

**Example:**

```typescript
const config: InteractConfig = {
  interactions: [
    {
      trigger: 'viewEnter',
      key: 'hero',
      effects: [{ effectId: 'fade-in' }],
    },
    {
      trigger: 'hover',
      key: 'button',
      conditions: ['desktop-only'],
      effects: [{ effectId: 'lift' }],
    },
  ],
  effects: {
    'fade-in': {
      duration: 1000,
      keyframeEffect: {
        name: 'fade-in',
        keyframes: [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
      },
    },
    lift: {
      duration: 200,
      keyframeEffect: {
        name: 'lift',
        keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(-4px)' }],
      },
    },
  },
  conditions: {
    'desktop-only': {
      type: 'media',
      predicate: '(min-width: 1024px)',
    },
  },
};
```

### `Interaction`

Defines a single interaction binding a trigger to effects.

```typescript
type Interaction = {
  key: string;
  trigger: TriggerType;
  selector?: string;
  listContainer?: string;
  params?: TriggerParams;
  conditions?: string[];
  effects: ((Effect | EffectRef) & { interactionId?: string })[];
};
```

**Properties:**

- `key` - Unique identifier for the custom element that triggers the interaction
- `trigger` - Type of trigger event
- `selector` - Optional CSS selector to target elements. When `listContainer` is also specified, uses `querySelectorAll` within the container to find matching elements as list items. Without `listContainer`, uses `querySelectorAll` within the root element. For dynamically added list items, uses `querySelector` within each item.
- `listContainer` - Optional selector for list container when targeting list items
- `params` - Optional parameters for the trigger
- `conditions` - Optional array of condition IDs to evaluate
- `effects` - Array of effects to apply when triggered

**Example:**

```typescript
const interaction: Interaction = {
  trigger: 'viewEnter',
  key: 'hero',
  params: {
    type: 'once',
    threshold: 0.2,
    inset: '50px',
  },
  conditions: ['reduced-motion-off'],
  effects: [
    { effectId: 'entrance-animation' },
    {
      key: 'hero-text',
      effectId: 'text-reveal',
      conditions: ['desktop-only'],
    },
  ],
};
```

## Controller and Element Types

### `IInteractionController`

Interface for the controller that manages interactions on an element. This is the core unit of interaction management.

```typescript
interface IInteractionController {
  element: HTMLElement;
  key: string | undefined;
  connected: boolean;
  sheet: CSSStyleSheet | null;
  useFirstChild: boolean;

  connect(key?: string): void;
  disconnect(options?: { removeFromCache?: boolean }): void;
  update(): void;
  toggleEffect(
    effectId: string,
    method: StateParams['method'],
    item?: HTMLElement | null,
    isLegacy?: boolean,
  ): void;
  getActiveEffects(): string[];
  renderStyle(cssRules: string[]): void;
  watchChildList(listContainer: string): void;
}
```

**Properties:**

- `element` - The DOM element this controller manages
- `key` - The unique identifier for this element's interactions
- `connected` - Whether the controller is currently connected
- `sheet` - The adopted stylesheet for dynamic CSS rules
- `useFirstChild` - When true, interaction target is the first child (e.g. custom elements)

**Methods:**

- `connect(key?)` - Connects the controller to the interaction system
- `disconnect(options?)` - Disconnects and cleans up; `removeFromCache: true` removes from `Interact.controllerCache`
- `update()` - Disconnects and reconnects (refreshes interactions)
- `toggleEffect()` - Toggles a CSS state effect on the element
- `getActiveEffects()` - Returns array of currently active effect IDs
- `renderStyle()` - Renders CSS rules to the controller's stylesheet
- `watchChildList()` - Sets up mutation observer for list item tracking

**Example:**

```typescript
import { Interact, IInteractionController } from '@wix/interact/web';

const controller: IInteractionController | undefined = Interact.getController('my-element');

if (controller) {
  console.log('Element:', controller.element);
  console.log('Connected:', controller.connected);
  console.log('Active effects:', controller.getActiveEffects());

  // Toggle an effect
  controller.toggleEffect('expanded', 'toggle');
}
```

### `IInteractElement`

Interface for the custom `interact-element`. The element internally uses an `IInteractionController` to manage its interactions.

```typescript
interface IInteractElement extends HTMLElement {
  _internals: (ElementInternals & { states: Set<string> }) | null;
  controller: IInteractionController;

  connectedCallback(): void;
  disconnectedCallback(): void;
  connect(key?: string): void;
  disconnect(options?: { removeFromCache?: boolean }): void;
  toggleEffect(effectId: string, method: StateParams['method'], item?: HTMLElement | null): void;
  getActiveEffects(): string[];
}
```

**Properties:**

- `_internals` - Element internals for CSS custom state management
- `controller` - The internal `InteractionController` managing this element

**Methods:**

- `connect(key?)` - Manually connect interactions
- `disconnect()` - Disconnect and clean up
- `toggleEffect()` - Programmatically control effect states
- `getActiveEffects()` - Get array of active effect IDs

**Example:**

```typescript
import { IInteractElement } from '@wix/interact/web';

const element = document.querySelector('interact-element') as IInteractElement;

if (element) {
  // Access the internal controller
  console.log('Controller connected:', element.controller.connected);

  // Toggle effects
  element.toggleEffect('hover', 'add');

  // Get active effects
  const effects = element.getActiveEffects();
  console.log('Active effects:', effects);
}
```

### `InteractOptions`

Options passed to interaction handlers.

```typescript
type InteractOptions = {
  reducedMotion?: boolean;
  targetController?: IInteractionController;
  selectorCondition?: string;
  allowA11yTriggers?: boolean;
};
```

**Properties:**

- `reducedMotion` - Whether reduced motion is enabled (respects `prefers-reduced-motion` or `Interact.forceReducedMotion`)
- `targetController` - The controller managing the target element
- `selectorCondition` - Optional CSS selector condition for element matching
- `allowA11yTriggers` - Whether to enable accessibility triggers (keyboard events) for `click` and `hover` triggers. When `true`, `click` responds to Enter/Space keys and `hover` responds to focus events. Defaults to `true`.

**Example:**

```typescript
// Used internally by handlers
const options: InteractOptions = {
  reducedMotion: Interact.forceReducedMotion,
  targetController: Interact.getController('my-element'),
};
```

## React Types

### `InteractRef`

Type for React ref callbacks created by `createInteractRef`. This ref handles both React 18 and React 19 cleanup patterns.

```typescript
type InteractRef = (node: Element | null) => () => void;
```

**Usage:**

```tsx
import { createInteractRef, InteractRef } from '@wix/interact/react';

function MyComponent() {
  const interactRef = useRef<InteractRef>(createInteractRef('my-element'));

  return (
    <div ref={interactRef.current} data-interact-key="my-element">
      Content
    </div>
  );
}
```

**Behavior:**

- When `node` is provided (mount): Calls `add(node, key)` to set up interactions
- When `node` is `null` (React 18 unmount): Calls `remove(key)` to clean up
- Returns cleanup function (React 19+): Also calls `remove(key)`

## Trigger Types

### `TriggerType`

Union type of all supported trigger types.

```typescript
type TriggerType =
  | 'hover'
  | 'click'
  | 'interest'
  | 'activate'
  | 'viewEnter'
  | 'pageVisible'
  | 'animationEnd'
  | 'viewProgress'
  | 'pointerMove';
```

### Trigger Parameters

#### `ViewEnterParams`

Parameters for viewport entry triggers (`viewEnter`, `pageVisible`, `viewProgress`).

```typescript
type ViewEnterParams = {
  type?: ViewEnterType;
  threshold?: number;
  inset?: string;
  useSafeViewEnter?: boolean;
};

type ViewEnterType = 'once' | 'repeat' | 'alternate' | 'state';
```

**Properties:**

- `type` - How the trigger behaves: `'once'` (default), `'repeat'`, `'alternate'`, `'state'` (play on enter, pause on exit)
- `threshold` - Percentage of element that must be visible (0-1)
- `inset` - CSS-style inset to shrink the root intersection area
- `useSafeViewEnter` - When true, handles elements taller than viewport

**Examples:**

```typescript
// Trigger once when 50% visible
const onceParams: ViewEnterParams = {
  type: 'once',
  threshold: 0.5,
};

// Trigger repeatedly with margin
const repeatParams: ViewEnterParams = {
  type: 'repeat',
  threshold: 0.1,
  inset: '100px',
};

// Alternate effects on enter/exit
const alternateParams: ViewEnterParams = {
  type: 'alternate',
  threshold: 0.3,
};
```

#### `StateParams`

Parameters for state-based triggers (`hover`, `click`, `interest`, `activate`).

```typescript
type StateParams = {
  method: TransitionMethod;
};

type TransitionMethod = 'add' | 'remove' | 'toggle' | 'clear';
```

**Properties:**

- `method` - How to modify the element's state
  - `'add'` - Add the effect state
  - `'remove'` - Remove the effect state
  - `'toggle'` - Toggle the effect state
  - `'clear'` - Clear all effect states

**Examples:**

```typescript
// Toggle effect on click
const toggleClick: StateParams = {
  method: 'toggle',
};

// Add effect on hover enter, remove on hover exit
const hoverState: StateParams = {
  method: 'add', // hover exit automatically uses 'remove'
};
```

#### `PointerMoveParams`

Parameters for pointer/mouse movement triggers.

```typescript
type PointerMoveAxis = 'x' | 'y';

type PointerMoveParams = {
  hitArea?: 'root' | 'self';
  axis?: PointerMoveAxis;
};
```

**Properties:**

- `hitArea` - `'self'` (default) or `'root'` (viewport)
- `axis` - `'x'` or `'y'` (default `'y'`) for scrub direction

**Example:**

```typescript
const pointerParams: PointerMoveParams = {
  hitArea: 'self',
  axis: 'y',
};
```

#### `AnimationEndParams`

Parameters for animation completion triggers.

```typescript
type AnimationEndParams = {
  effectId: string;
};
```

**Properties:**

- `effectId` - ID of the effect whose completion triggers this interaction

**Example:**

```typescript
const chainedAnimation: AnimationEndParams = {
  effectId: 'entrance-animation', // Trigger when entrance completes
};
```

## Effect Types

### `Effect`

Union type of all effect types.

```typescript
type Effect = (TimeEffect | ScrubEffect | TransitionEffect) & {
  conditions?: string[];
};
```

### `TimeEffect`

Duration-based animations with easing and timing control.

```typescript
type TimeEffect = {
  key?: string;
  selector?: string;
  listContainer?: string;
  duration: number;
  easing?: string;
  iterations?: number;
  alternate?: boolean;
  fill?: Fill;
  reversed?: boolean;
  delay?: number;
  effectId?: string;
} & EffectProperty;

type Fill = 'none' | 'forwards' | 'backwards' | 'both';
```

**Properties:**

- `key` - unique identifier for targeting a custom element (optional, defaults to source key from the `Interaction`)
- `selector` - CSS selector for targeting elements inside the custom element (uses `querySelectorAll`) or each list item if combined with `listContainer` (optional, defaults to `firstElementChild`)
- `listContainer` - CSS selector for list container when targeting list items (optional)
- `duration` - Animation duration in milliseconds (required)
- `easing` - Easing function name or custom cubic-bezier
- `iterations` - Number of times to repeat (default: 1)
- `alternate` - Whether to alternate direction on iterations
- `fill` - How to apply styles before/after animation
- `reversed` - Whether to play animation in reverse
- `delay` - Delay before animation starts in milliseconds

**Examples:**

```typescript
// Basic fade animation
const fadeEffect: TimeEffect = {
  duration: 800,
  easing: 'ease-out',
  keyframeEffect: {
    name: 'fade',
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
  },
};

// Complex bounce with iterations
const bounceEffect: TimeEffect = {
  duration: 600,
  iterations: 3,
  alternate: true,
  easing: 'ease-in-out',
  fill: 'forwards',
  keyframeEffect: {
    name: 'bounce',
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-20px)' },
      { transform: 'translateY(0)' },
    ],
  },
};

// Delayed entrance
const delayedEffect: TimeEffect = {
  duration: 1000,
  delay: 500,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  namedEffect: {
    type: 'slideInLeft',
  },
};
```

### `ScrubEffect`

Scroll-driven animations tied to scroll progress.

```typescript
type ScrubEffect = {
  key?: string;
  selector?: string;
  listContainer?: string;
  easing?: string;
  iterations?: number;
  alternate?: boolean;
  fill?: Fill;
  reversed?: boolean;
  rangeStart?: RangeOffset;
  rangeEnd?: RangeOffset;
  centeredToTarget?: boolean;
  transitionDuration?: number;
  transitionDelay?: number;
  transitionEasing?: ScrubTransitionEasing;
} & EffectProperty;
```

**Scroll-specific Properties:**

- `rangeStart` - Scroll position where animation starts
- `rangeEnd` - Scroll position where animation ends
- `centeredToTarget` - Whether to center scroll range on target element
- `transitionDuration` - Smooth transition duration when entering/exiting scrub
- `transitionDelay` - Delay for scrub transition
- `transitionEasing` - Easing for scrub transition

**Examples:**

```typescript
// Parallax background
const parallaxEffect: ScrubEffect = {
  easing: 'linear',
  rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
  rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
  keyframeEffect: {
    name: 'parallax',
    keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(-50px)' }],
  },
};

// Progress-based fade
const progressFade: ScrubEffect = {
  centeredToTarget: true,
  transitionDuration: 300,
  keyframeEffect: {
    name: 'progress-fade',
    keyframes: [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }],
  },
};
```

### `TransitionEffect`

CSS transition-based effects for style property changes.

```typescript
type TransitionEffect = {
  key?: string;
  effectId?: string;
  transition?: TransitionOptions & {
    styleProperties: StyleProperty[];
  };
  transitionProperties?: TransitionProperty[];
};

type TransitionOptions = {
  duration?: number;
  delay?: number;
  easing?: string;
};

type StyleProperty = {
  name: string;
  value: string;
};

type TransitionProperty = StyleProperty & TransitionOptions;
```

**Examples:**

```typescript
// Simple color transition
const colorTransition: TransitionEffect = {
  transition: {
    duration: 300,
    easing: 'ease-out',
    styleProperties: [
      { name: 'background-color', value: '#3b82f6' },
      { name: 'color', value: 'white' },
    ],
  },
};

// Individual property transitions
const complexTransition: TransitionEffect = {
  transitionProperties: [
    {
      name: 'transform',
      value: 'scale(1.05)',
      duration: 200,
      easing: 'ease-out',
    },
    {
      name: 'box-shadow',
      value: '0 10px 20px rgba(0,0,0,0.1)',
      duration: 300,
      delay: 50,
    },
  ],
};
```

### `EffectRef`

Reference to a reusable effect definition.

```typescript
type EffectRef = {
  key?: string;
  selector?: string;
  listContainer?: string;
  effectId: string;
  conditions?: string[];
};
```

**Properties:**

- `key`, `selector`, `listContainer` - Same as in `Effect` for targeting elements
- `effectId` - ID of the effect in the `effects` configuration object
- `conditions` - Additional conditions for this effect usage

**Example:**

```typescript
// Reference a reusable effect
const effectRef: EffectRef = {
  effectId: 'slide-up',
  key: 'custom-target',
  conditions: ['desktop-only'],
};

// Used in interaction
const interaction: Interaction = {
  trigger: 'viewEnter',
  key: 'trigger',
  effects: [
    effectRef, // Reference existing effect
    {
      // Inline effect
      duration: 500,
      keyframeEffect: {
        name: 'fade',
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
      },
    },
  ],
};
```

## Effect Properties

### `EffectProperty`

Union type for defining animation content.

```typescript
type EffectProperty =
  | { keyframeEffect: MotionKeyframeEffect }
  | { namedEffect: NamedEffect }
  | { customEffect: CustomEffect };
```

**Types:**

- `keyframeEffect` - Raw keyframe animation definition
- `namedEffect` - Pre-built animations from `@wix/motion-presets`
- `customEffect` - Function `(element: Element, progress: number) => void` for custom scrub/behavior

**Examples:**

```typescript
// Keyframe effect
const keyframeEffect = {
  name: 'bounce-in',
  keyframes: [
    { transform: 'translateX(-100%)', opacity: 0 },
    { transform: 'translateX(0)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(0)', opacity: 1 },
  ],
};

// Named effect
const namedEffect = {
  namedEffect: { type: 'SlideIn' },
};

// Custom effect (signature: element, progress)
const customEffect = {
  customEffect: (element: Element, progress: number) => {
    (element as HTMLElement).style.opacity = String(progress);
  },
};
```

## Sequence Types

### `SequenceOptionsConfig`

Shared options for sequence timing, identity, and conditional gating.

```typescript
type SequenceOptionsConfig = {
  delay?: number;
  offset?: number;
  offsetEasing?: string | ((p: number) => number);
  sequenceId?: string;
  conditions?: string[];
};
```

**Properties:**

- `delay` - Base delay (ms) applied to all effects in the sequence. Default: `0`.
- `offset` - Stagger interval (ms) between consecutive effects. Default: `0`.
- `offsetEasing` - Easing function or named string for offset distribution (`'linear'`, `'quadIn'`, `'sineOut'`, etc.). Default: `linear`.
- `sequenceId` - Optional ID for referencing a reusable sequence from `InteractConfig.sequences`.
- `conditions` - Optional array of condition IDs. When set, the sequence is only active when all conditions match.

### `SequenceConfig`

Inline sequence definition with an effects array.

```typescript
type SequenceConfig = SequenceOptionsConfig & {
  effects: (Effect | EffectRef)[];
};
```

**Properties:**

- All properties from `SequenceOptionsConfig`
- `effects` - Array of effects that participate in the sequence. Each effect becomes an `AnimationGroup` in the underlying `Sequence` instance.

**Example:**

```typescript
const inlineSequence: SequenceConfig = {
  offset: 150,
  offsetEasing: 'quadIn',
  effects: [
    { effectId: 'card-entrance' },
    {
      duration: 500,
      keyframeEffect: {
        name: 'fade-in',
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
      },
    },
  ],
};
```

### `SequenceConfigRef`

Reference to a reusable sequence by ID, with optional timing overrides.

```typescript
type SequenceConfigRef = {
  sequenceId: string;
  delay?: number;
  offset?: number;
  offsetEasing?: string | ((p: number) => number);
  conditions?: string[];
};
```

**Properties:**

- `sequenceId` - ID of the sequence in `InteractConfig.sequences` (required)
- `delay`, `offset`, `offsetEasing`, `conditions` - Override values that merge on top of the referenced sequence

**Example:**

```typescript
// Reference a reusable sequence with override
const sequenceRef: SequenceConfigRef = {
  sequenceId: 'card-stagger',
  offset: 200, // Override the default offset
};
```

### Updated `InteractConfig`

The `InteractConfig` type includes an optional `sequences` map for reusable sequence definitions:

```typescript
type InteractConfig = {
  effects: Record<string, Effect>;
  sequences?: Record<string, SequenceConfig>;
  conditions?: Record<string, Condition>;
  interactions: Interaction[];
};
```

### Updated `Interaction`

Interactions can include a `sequences` array alongside or instead of `effects`:

```typescript
type Interaction = InteractionTrigger & {
  effects?: ((Effect | EffectRef) & { interactionId?: string })[];
  sequences?: (SequenceConfig | SequenceConfigRef)[];
};
```

An interaction can have `effects` only, `sequences` only, or both.

## Condition Types

### `Condition`

Defines conditional logic for interactions.

```typescript
type Condition = {
  type: 'media' | 'container' | 'selector';
  predicate?: string;
};
```

**Properties:**

- `type` - `'media'` (media query), `'container'` (container query), or `'selector'`
- `predicate` - The query string or selector to evaluate

**Examples:**

```typescript
// Media query conditions
const mobileOnly: Condition = {
  type: 'media',
  predicate: '(max-width: 767px)',
};

const darkMode: Condition = {
  type: 'media',
  predicate: '(prefers-color-scheme: dark)',
};

const reducedMotion: Condition = {
  type: 'media',
  predicate: '(prefers-reduced-motion: reduce)',
};

// Container query condition
const wideContainer: Condition = {
  type: 'container',
  predicate: '(min-width: 400px)',
};
```

## Trigger parameter types

### `InteractionParamsTypes`

Map of trigger types to their parameter types.

```typescript
type InteractionParamsTypes = {
  hover: StateParams | PointerTriggerParams;
  click: StateParams | PointerTriggerParams;
  interest: StateParams | PointerTriggerParams;
  activate: StateParams | PointerTriggerParams;
  viewEnter: ViewEnterParams;
  pageVisible: ViewEnterParams;
  animationEnd: AnimationEndParams;
  viewProgress: ViewEnterParams;
  pointerMove: PointerMoveParams;
};
```

### `TriggerParams`

Union type of all trigger parameter types.

```typescript
type TriggerParams =
  | StateParams
  | PointerTriggerParams
  | ViewEnterParams
  | PointerMoveParams
  | AnimationEndParams;
```

## See Also

- [Sequences & Staggering Guide](../guides/sequences.md) - Comprehensive sequences guide
- [Interact Class](interact-class.md) - Main API class
- [InteractionController](interaction-controller.md) - Controller API
- [Functions](functions.md) - Standalone functions
- [Custom Element](interact-element.md) - Custom element API
- [React Integration](../integration/react.md) - React components and hooks
- [Configuration Guide](../guides/configuration-structure.md) - Building configurations
- [Examples](../examples/README.md) - Practical usage examples
