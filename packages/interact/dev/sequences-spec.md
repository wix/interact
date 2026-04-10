# Sequences

This is a proposal for supporting sequenced effects (also known as “timelines”) for Interact that can be declared using the Config.

# Technical Design

## Config spec

- A Sequence is a list of `Effect`s managed by a single trigger/timeline.
- `Effect`s in a `Sequence` are applied in their specified order inside `Interaction.sequence.effects`.
- Reusable `Sequence`s will be declared using a new `InteractConfig.sequences` property, which is a map of Sequence declarations by a unique key.
- `Sequence`s can be defined on an `Interaction` using a new `Interaction.sequences` property which is a list of `Sequence`s.
- Each Sequence will have an `effects` property which contains its child Effects.
- A `Sequence` does not have a `key` property, nor any of the other element targeting-related properties, since it by itself is not tied to an element.
- The `Effect`s inside a `Sequence` are the objects that define that related target.

## The new `sequences` property

```ts
/**
 * Reusable Sequence declarations on the InteractConfig top-level
 */
type InteractConfig = {
  sequences: {[key: string]: Sequence};
  //...
}

/**
 * Sequence definitions on each Interaction
 * Like `effects`, can either reference a declaration using sequenceId
 * Or specify values inline, or both and inlined overrides referenced declarations
 */
type Interaction = {
  sequences: Sequence[];
  //...
};

/**
 * The SequenceOptions type
 */
type SequenceOptions = {
  delay?: number; // default 0
  offset?: number; // default 0
  offsetEasing?: string | (p: number) => number; // linear
  sequenceId?: string; // provided or generated automatically
};

/**
 * The SequenceConfig type
 */
type SequenceConfig = SequenceOptions & {
  effects: Effect[];
};
```

## The `Sequence.delay`

- A fixed offset of milliseconds to delay the playing of the entire Sequence
- Defaults to `0`

## The `Sequence.offset`

- A fixed amount of milliseconds to multiply the result of the `easing` function
- Defaults to `0`

## The `Sequence.offsetEasing`

- Either a JS function or a valid CSS `easing` value, or a valid `easing` name in `@wix/motion` library
  - A JS function takes a `number` from 0 to 1\.
  - An `easing` value, either valid from CSS, or in `@wix/motion`, will be translated to the corresponding function in JS or a CSS `calc()`.
- The mapping of each offset using the easing function as done as follows:

```javascript
// `indices` is the array of indices from 0 to Length-1
// `easing` is the easing function
// `offset` is the `sequence.offset` property
const last = indices.at(-1);
indices.map((n) => (easing(n / last) * last * offset) | 0); // | 0 is basically flooring
```

### Easing examples

```javascript
const items = [0, 1, 2, 3, 4];
const offset = 200;

const linear = (t) => t;
// 0, 200, 400, 600, 800

const quadIn = (t) => t ** 2;
// 0, 50, 200, 450, 800

const sinOut = (t) => Math.sin((t * Math.PI) / 2);
// 0, 306, 565, 739, 800
```

## The `Sequence.align`

- **Ignore for now \- DO NOT implement**
- Specifies how to align the Effects inside the Sequence:
  - `start` aligns to the beginning
  - `end` aligns to the end
  - `sequence` aligns each effect’s start to the end of its preceding effect
  - `sequence-reverse` is same as `sequence` but starts from the last effect backwards

# Effect on Effects’ `delay`

- In initial phase this feature should only apply to `keyframeEffect`s and `namedEffect`s \- where we generate Web or CSS animations
- The result of calculated offset should be added to the Effect’s specified `delay`
- If an Effect is removed (e.g. when an Effect’s `condition` stops matching the state of its environment and needs to be removed) it should propagate to the corresponding Sequence to update the calculated delays
- If an entire Sequence is removed we should try to remove it completely without a significant overhead of propagating each Effect being removed.

# Implementation

- Create a new `Sequence` class in `@wix/motion` package that manages a list of `AnimationGroup` instances.
- A `Sequence` instance manages its own playback, similar to `AnimationGroup`, only difference is its `animations` property holds `AnimationGroup` instances. Therefor, it should extend `AnimationGroup` and have a similar API.
- Note that `Sequence` does not have a `target`, so all of its API endpoints that involve an element target should be written accordingly, or not exist if not relevant.
- In the `@eix/interact` package `Sequence`s will be created from an `InteractConfig` for every declaration inside `Interaction.sequences`.

# Appendix

## A CSS solution in a futuristic world where CSS math functions are widely supported

- The index of each Effect in the Sequence and count of Effects in the Sequence are set on each target element.
- Generated `animation-delay` should be a `calc()` that includes the effect’s `delay` \+ the generated staggering offset as follows:

```css
@property --interact-seq-c {
  syntax: '<number>';
  initial-value: 1;
  inherits: false;
}

@property --interact-seq-i {
  syntax: '<number>';
  initial-value: 0;
  inherits: false;
}

.target {
  --_interact-delay: calc(
    pow(var(--interact-seq-i) / var(--interact-seq-c), 2)
  ); /* quadIn - this is here for readability, don't actually have to add as a separate property */
  animation-delay: calc(
    effectDelay + var(--_interact-delay) * var(--interact-seq-c) * <sequence.offset>
  );
}
```

```javascript
// According to initial design
{
   interactions: [{
     trigger: 'viewEnter',
     sequence: {
       offset: 150,
       offsetEasing: 'ease-out'
     },
     effects: [...]
   }]
}

// According to alternative design
{
   interactions: [{
     trigger: 'viewEnter',
     sequences: [{
       offset: 150,
       offsetEasing: 'ease-out',
       effects: [{

       }]
     }]
   }]
}
```
