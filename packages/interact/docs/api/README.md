# API Reference

Complete reference documentation for all public APIs in `@wix/interact`.

## Core API

### Classes

- [**Interact**](interact-class.md) - Main interaction manager class
  - [Static methods](interact-class.md#static-methods): `create()`, `getInstance()`, `destroy()`, `setup()`, `registerEffects()`
  - [Instance methods](interact-class.md#instance-methods): `init()`, `destroy()`, `has()`, `get()`
  - [Error handling](interact-class.md#error-handling)

### Functions

- [**add(element, path)**](functions.md#add) - Add interactions to an element
  - [Usage examples](functions.md#examples) and [behavior details](functions.md#behavior-details)
  - [Error handling](functions.md#error-handling) and [performance considerations](functions.md#performance-considerations)
- [**remove(path)**](functions.md#remove) - Remove interactions from an element
  - [Cleanup behavior](functions.md#behavior-details) and [advanced usage](functions.md#advanced-usage)
- [**generateCSS(config)**](functions.md#generate) - Generate CSS for hiding elements with entrance animations
  - [SSR usage](functions.md#server-side-rendering-ssr) and [React integration](functions.md#with-react)
  - [HTML setup](functions.md#html-setup) and [accessibility](functions.md#accessibility)
- [**addListItems(root, key, listContainer, elements)**](functions.md#addlistitems) - Add interactions to new list items
  - [Manual list management](functions.md#manual-list-item-addition) and [batch operations](functions.md#batch-adding-items)
- [**removeListItems(elements)**](functions.md#removelistitems) - Remove interactions from list items
  - [Cleanup workflows](functions.md#complete-removal-workflow) and [performance tips](functions.md#performance-considerations)

### Custom Elements

- [**interact-element**](interact-element.md) - Custom element for wrapping interactive content
  - [Interface](interact-element.md#element-interface) and [lifecycle methods](interact-element.md#methods)
  - [Framework integration](interact-element.md#framework-integration) (React)
  - [State management](interact-element.md#state-management) and [browser support](interact-element.md#browser-support)
  - [List management with watchChildList](interact-element.md#list-management-with-watchchildlist)

### Element Selection

- [**Element Selection Priority**](element-selection.md) - Understanding how elements are selected
  - [Selection priority order](element-selection.md#selection-priority-overview) with flowchart
  - [Common patterns](element-selection.md#common-patterns) and [troubleshooting](element-selection.md#troubleshooting)
  - [listContainer vs selector](element-selection.md#scenario-4-listcontainer--selector)

## Type Definitions

### Configuration Types

- [**InteractConfig**](types.md#interactconfig) - Main configuration object
- [**Interaction**](types.md#interaction) - Individual interaction definition
- [**Effect**](types.md#effect) - Effect definition and parameters
- [**Condition**](types.md#condition) - Conditional interaction logic

### Trigger Types

- [**TriggerType**](types.md#triggertype) - Union of all supported triggers
- [**ViewEnterParams**](types.md#viewenterparams) - Viewport entry configuration
- [**PointerMoveParams**](types.md#pointermoveparams) - Pointer movement configuration
- [**AnimationEndParams**](types.md#animationendparams) - Animation completion triggers

### Effect Types

- [**TimeEffect**](types.md#timeeffect) - Time-based animations with examples
- [**ScrubEffect**](types.md#scrubeffect) - Progress-based animations with named ranges
- [**StateEffect**](types.md#stateeffect) - CSS transition effects
- [**EffectRef**](types.md#effectref) - Effect reference by ID

### Advanced Types

- [**IInteractElement**](types.md#iwixinteractelement) - Custom element interface
- [**InteractCache**](types.md#interactcache) - Internal cache structure
- [**EffectProperty**](types.md#effectproperty) - Animation content types
- [**TypeScript patterns**](types.md#typescript-usage-patterns) - Type guards and generic constraints

## Quick Reference

### Essential Imports

```typescript
import {
  Interact, // Main class
  add,
  remove, // Standalone functions
  generate, // CSS generation for entrance animations
  InteractConfig, // Configuration type
  IInteractElement, // Custom element interface
} from '@wix/interact';
```

### Basic Pattern

```typescript
// 1. Create configuration
const config: InteractConfig = {
  interactions: [
    {
      /* ... */
    },
  ],
  effects: {
    /* ... */
  },
};

// 2. Initialize
const interact = Interact.create(config);

// 3. HTML usage
// <interact-element data-interact-key="#element">
//   <div>Content</div>
// </interact-element>
```

### Type Hierarchy

```
InteractConfig
├── interactions: Interaction[]
│   ├── key: string
│   ├── selector?: string
│   ├── listContainer?: string
│   ├── trigger: TriggerType
│   ├── params?: TriggerParams
│   ├── conditions?: string[]
│   └── effects: (Effect | EffectRef)[]
├── effects?: Record<string, Effect>
│   ├── TimeEffect (duration-based)
│   ├── ScrubEffect (progress-based)
│   └── StateEffect (CSS transitions)
└── conditions?: Record<string, Condition>
    ├── Media queries
    ├── Container queries
    └── Selector queries
```

## Integration with @wix/motion

The `@wix/interact` package provides a declarative layer on top of `@wix/motion`. Effect definitions can include:

- `keyframeEffect` - Raw keyframe animations
- `namedEffect` - Pre-built animation effects from @wix/motion-presets
- `customEffect` - Custom animation functions with full control

**Example Integration:**

```typescript
{
  effects: {
    'slide-in': {
      duration: 800,
      keyframeEffect: {
        name: 'slide-in',
        keyframes: [
          { opacity: 0, transform: 'translateY(50px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ]
      }
    },
    'bounce': {
      duration: 600,
      namedEffect: { // Pre-built from @wix/motion-presets
        type: 'GlideIn'
      }
    }
  }
}
```

See the [Effects Guide](../guides/effects.md) for detailed information on animation integration and [Examples](../examples/README.md) for practical usage patterns.
