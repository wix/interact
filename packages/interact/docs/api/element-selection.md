# Element Selection Priority

Understanding how `@wix/interact` selects elements is crucial for building reliable interactions. This guide explains the selection priority order, common patterns, and troubleshooting tips.

## Selection Priority Overview

When `@wix/interact` needs to determine which element to use (either as a trigger source or effect target), it follows a specific priority order:

```
┌─────────────────────────────────────┐
│  Use specified key as root element  │
└──────────┬──────────────────────────┘
           │
┌──────────┴──────────────────────────┐
│  Is listContainer specified?        │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┐
    │ YES         │ NO
    ▼             ▼
┌───────────┐  ┌──────────────────────┐
│ Find list │  │ Is selector          │
│ container │  │ specified?           │
│ element   │  └──────┬───────────────┘
│           │         │
└─────┬─────┘   ┌─────┴───────────┐
      │         │ YES             │ NO
      │         ▼                 ▼
      │    ┌──────────────┐  ┌─────────────────────┐
      │    │ Query        │  │ Is root element an  │
      │    │ selector all │  │ interact-element    │
      │    │ within       │  │ custom element?     │
      │    │ element      │  │                     │
      │    └──────────────┘  └───────┬─────────────┘
      │                         │
      ▼                   ┌─────┴──────┐
┌─────────────┐           │ YES        │ NO
│ Is selector │           ▼            ▼
│ specified?  │    ┌─────────────┐ ┌─────────────┐
└────────┬────┘    │ Use first   │ │ Use root    │
         │         │ child       │ │ element     │
         │         │ element     │ │             │
         │         └─────────────┘ └─────────────┘
    ┌────┴───────────────┐
    │ YES                │ NO
    ▼                    ▼
┌─────────────┐      ┌───────────────┐
│ Query       │      │ Use each      │
│ selector    │      │ direct child  │
│ all within  │      │ as item       │
│ container   │      └───────────────┘
└─────────────┘
```

## Priority Levels

### Priority 1: listContainer (Highest)

When `listContainer` is specified, it takes precedence over all other selectors.

**Behavior:**

- Finds the container element using the CSS selector
- If `selector` is also specified, uses `querySelectorAll` within the container to find all matching elements as list items
- If `selector` is not specified, targets all direct children of that container as list items

**Example:**

```typescript
{
    key: 'gallery',
    listContainer: '.gallery-grid',     // Priority 1: Find this container
    selector: '.gallery-item img',      // Then: Find all matching elements as list items
    trigger: 'hover',
    effects: [/* ... */]
}
```

```html
<interact-element data-interact-key="gallery">
  <div class="gallery-grid">
    <!-- listContainer targets this container -->
    <div class="gallery-item">
      <img src="1.jpg" />
      <!-- selector finds this as item 1 -->
    </div>
    <div class="gallery-item">
      <img src="2.jpg" />
      <!-- selector finds this as item 2 -->
    </div>
  </div>
</interact-element>
```

**Result:** Hover interactions apply to each `.gallery-item img` element found by `querySelectorAll` within the container.

### Priority 2: selector (Medium)

When only `selector` is specified (no `listContainer`), it selects all matching elements within the `interact-element`.

**Behavior:**

- Queries for all matching elements within the custom element
- Uses `querySelectorAll()` internally
- Each matched element receives the interaction/effect independently

**Example:**

```typescript
{
    key: 'card',
    selector: '.card-image',    // Priority 2: Find all matching elements
    trigger: 'hover',
    effects: [/* ... */]
}
```

```html
<interact-element data-interact-key="card">
  <div class="card">
    <div class="card-header">Title</div>
    <div class="card-image">
      <!-- selector targets this -->
      <img src="photo.jpg" />
    </div>
    <div class="card-footer">Footer</div>
  </div>
</interact-element>
```

**Result:** Hover interaction applies to all `.card-image` elements.

### Priority 3: Root element or First Child (Fallback)

When neither `listContainer` nor `selector` is specified, depending on the type of integration used, Interact fallbacks to the following options:

- `web`: uses first element child of root custom element, which matches the selector `[data-interact-key="${key}"] > :first-child`.
- default (Vanilla) or `react`: uses the root element specified by the `key`, which matches the selector `[data-interact-key="${key}"]`.

**Behavior for `web`:**

- Uses `firstElementChild` of the `interact-element`

**Example:**

```typescript
{
    key: 'button',
    // No selector or listContainer specified
    trigger: 'click',
    effects: [/* ... */]
}
```

```html
<interact-element data-interact-key="button">
  <button class="primary-btn">Click Me</button>
  <!-- First child is used -->
</interact-element>
```

**Result:** Click interaction applies to the `<button>` element.

**Behavior for default or `react`:**

- Uses root element

**Example with `react`:**

```typescript
{
    key: 'button',
    // No selector or listContainer specified
    trigger: 'click',
    effects: [/* ... */]
}
```

```jsx
<Interaction tagName="button" interactKey="button" class="primary-btn">
  Click Me
</Interaction>
```

**Result:** Click interaction applies to the `<button>` element.

## Selection Scenarios

### Scenario 1: Simple Element (No Selectors)

**Configuration:**

```typescript
{
    key: 'hero',
    trigger: 'viewEnter',
    effects: [{
        key: 'hero',
        keyframeEffect: {
            name: 'fade',
            keyframes: [
                { opacity: '0' },
                { opacity: '1' }
            ]
        },
        duration: 800
    }]
}
```

**HTML:**

```html
<interact-element data-interact-key="hero">
  <section class="hero-section">
    <h1>Welcome</h1>
    <p>Subtitle</p>
  </section>
</interact-element>
```

**Result:** The `<section>` element (first child) gets the fade effect.

### Scenario 2: Using selector

**Configuration:**

```typescript
{
    key: 'card',
    selector: '.card-content',      // Target specific element
    trigger: 'hover',
    effects: [{
        key: 'card',
        selector: '.card-image img',  // Different target for effect
        keyframeEffect: {
            name: 'zoom',
            keyframes: [
                { transform: 'scale(1)' },
                { transform: 'scale(1.1)' }
            ]
        },
        duration: 300
    }]
}
```

**HTML:**

```html
<interact-element data-interact-key="card">
  <div class="card">
    <div class="card-image">
      <img src="product.jpg" />
      <!-- Effect applies here -->
    </div>
    <div class="card-content">
      <!-- Trigger listens here -->
      <h3>Product Name</h3>
    </div>
  </div>
</interact-element>
```

**Result:** Hovering `.card-content` triggers zoom on `.card-image img`.

### Scenario 3: Using listContainer

**Configuration:**

```typescript
{
    key: 'products',
    listContainer: '.product-grid',    // Container with multiple items
    trigger: 'viewEnter',
    effects: [{
        key: 'products',
        listContainer: '.product-grid',
        keyframeEffect: {
            name: 'slide-up',
            keyframes: [
                { opacity: '0', transform: 'translateY(20px)' },
                { opacity: '1', transform: 'translateY(0)' }
            ]
        },
        duration: 600
    }]
}
```

**HTML:**

```html
<interact-element data-interact-key="products">
  <div class="product-grid">
    <div class="product-card">Product 1</div>
    <!-- Effect applies -->
    <div class="product-card">Product 2</div>
    <!-- Effect applies -->
    <div class="product-card">Product 3</div>
    <!-- Effect applies -->
  </div>
</interact-element>
```

**Result:** Each product card gets the slide-up animation independently.

### Scenario 4: listContainer + selector

**Configuration:**

```typescript
{
    key: 'gallery',
    listContainer: '.gallery-grid',
    selector: '.gallery-item',         // Trigger on item container
    trigger: 'hover',
    effects: [{
        key: 'gallery',
        listContainer: '.gallery-grid',
        selector: '.gallery-item img',  // Effect on image
        keyframeEffect: {
            name: 'zoom',
            keyframes: [
                { transform: 'scale(1)' },
                { transform: 'scale(1.05)' }
            ]
        },
        duration: 300
    }]
}
```

**HTML:**

```html
<interact-element data-interact-key="gallery">
  <div class="gallery-grid">
    <div class="gallery-item">
      <!-- Hover trigger -->
      <img src="photo1.jpg" />
      <!-- Zoom effect -->
      <div class="overlay">View</div>
    </div>
    <div class="gallery-item">
      <!-- Hover trigger -->
      <img src="photo2.jpg" />
      <!-- Zoom effect -->
      <div class="overlay">View</div>
    </div>
  </div>
</interact-element>
```

**Result:** Hovering each `.gallery-item` triggers zoom on its `img`.

## Selector Inheritance

**Important:** `selector` and `listContainer` are **NOT** inherited from Interaction to Effect.

```typescript
// ❌ This does NOT work - Effect selector is independent
{
    key: 'card',
    selector: '.card-content',         // Interaction selector
    trigger: 'hover',
    effects: [{
        key: 'card',
        // Missing selector - will use first child of card, not .card-content
        duration: 300
    }]
}

// ✅ Correct - Explicitly specify selectors
{
    key: 'card',
    selector: '.card-content',         // Interaction selector
    trigger: 'hover',
    effects: [{
        key: 'card',
        selector: '.card-image',        // Effect selector (independent)
        duration: 300
    }]
}
```

**Rule:** Always specify `selector` and `listContainer` on both `Interaction` and `Effect` if you need them for both.

## Common Patterns

### Pattern 1: Self-Targeting

Element triggers effect on itself.

```typescript
{
    key: 'button',
    trigger: 'hover',
    effects: [{
        key: 'button',  // Same key = self-targeting
        namedEffect: { type: 'Scale' },
        duration: 200
    }]
}
```

### Pattern 2: Cross-Element Targeting

One element triggers effect on another.

```typescript
{
    key: 'menu-button',
    trigger: 'click',
    effects: [{
        key: 'sidebar',  // Different key = cross-targeting
        namedEffect: { type: 'SlideIn' },
        duration: 300
    }]
}
```

### Pattern 3: Multiple Targets

One trigger affects multiple elements.

```typescript
{
    key: 'master',
    trigger: 'click',
    effects: [
        { key: 'element-1', /* ... */ },
        { key: 'element-2', /* ... */ },
        { key: 'element-3', /* ... */ }
    ]
}
```

### Pattern 4: Specific Within Generic

Use selector to target specific elements.

```typescript
{
    key: 'card',
    selector: '.card',
    trigger: 'hover',
    effects: [
        { key: 'card', selector: '.card-image', /* zoom */ },
        { key: 'card', selector: '.card-title', /* color change */ },
        { key: 'card', selector: '.card-button', /* reveal */ }
    ]
}
```

### Pattern 5: List with Specific Targets

Combine listContainer with selector for complex lists.

```typescript
{
    key: 'products',
    listContainer: '.products',
    selector: '.product-card',
    trigger: 'hover',
    effects: [{
        key: 'products',
        listContainer: '.products',
        selector: '.product-image',  // Specific target in each item
        keyframeEffect: {
            name: 'zoom',
            keyframes: [
                { transform: 'scale(1)' },
                { transform: 'scale(1.1)' }
            ]
        },
        duration: 300
    }]
}
```

## Troubleshooting

### Problem: Effect Not Applying

**Check 1: Verify Selector Matches**

```javascript
const element = document.querySelector('[data-interact-key="my-key"]');
const target = element.querySelector('.my-selector');
console.log('Target found:', !!target);
```

**Check 2: Inspect Element Structure**

```javascript
function debugSelection(key, selector) {
  const element = Interact.getElement(key);
  console.log({
    element,
    firstChild: element?.firstElementChild,
    selectorMatch: element?.querySelector(selector),
  });
}

debugSelection('my-key', '.my-selector');
```

### Problem: Wrong Element Selected

**Symptom:** Effect applies to unexpected element

**Solution:** Be specific with selectors

```typescript
// ❌ Too generic
selector: '.item';

// ✅ More specific
selector: '.product-grid > .item';
```

### Problem: listContainer Not Working

**Check Container Exists:**

```javascript
const element = document.querySelector('[data-interact-key="my-list"]');
const container = element?.querySelector('.list-container');
console.log({
  containerExists: !!container,
  childCount: container?.children.length,
});
```

**Verify Configuration:**

```typescript
// Both interaction and effect need listContainer
{
    key: 'list',
    listContainer: '.items',  // On interaction
    trigger: 'hover',
    effects: [{
        key: 'list',
        listContainer: '.items',  // ALSO on effect
        duration: 300
    }]
}
```

## Best Practices

### 1. Use Descriptive Selectors

```typescript
// ✅ Good: Clear intent
selector: '.product-card .primary-image';

// ❌ Avoid: Ambiguous
selector: '.image';
```

### 2. Keep Selectors Specific but Flexible

```typescript
// ✅ Good: Works with structure changes
selector: '.card-image img';

// ❌ Avoid: Too rigid
selector: 'div > div.card > div.image > img:first-child';
```

### 3. Use `listContainer` for Repeating Elements

```typescript
// ✅ Good: Scales automatically
{
    listContainer: '.products',
    trigger: 'hover'
}

// ❌ Avoid: Manual management
{
    key: 'product-1',
    trigger: 'hover'
},
{
    key: 'product-2',
    trigger: 'hover'
}
// ... repeating for every item
```

### 4. Document Complex Selections

```typescript
{
    key: 'gallery',
    // Select all images within gallery items
    // Structure: grid > item > image-wrapper > img
    listContainer: '.gallery-grid',
    selector: '.gallery-item .image-wrapper img',
    trigger: 'hover',
    effects: [/* ... */]
}
```

## Visual Reference

### Simple Selection (No Selectors)

```
<interact-element>
    <div> ← Selected (first child)
        <span>Not considered</span>
    </div>
</interact-element>
```

### With Selector

```
<interact-element>
    <div>
        <span class="target"> ← Selected (matches selector)
        <span class="target"> ← Selected (matches selector)
        <span class="other">Not selected</span>
    </div>
</interact-element>
```

### With listContainer

```
<interact-element>
    <div class="container">  ← Container found
        <div> ← Selected (child 1)
        <div> ← Selected (child 2)
        <div> ← Selected (child 3)
    </div>
</interact-element>
```

### With listContainer + selector

```
<interact-element>
    <div class="container">  ← Container found
        <div>
            <img> ← Selected (matches selector in child 1)
        </div>
        <div>
            <img> ← Selected (matches selector in child 2)
        </div>
    </div>
</interact-element>
```

## Quick Decision Guide

**Use First Child when:**

- Single element per interaction
- Simple structure
- Element is direct child

**Use selector when:**

- Need specific elements within structure
- Multiple matching elements should receive the same interaction
- Elements are nested

**Use listContainer when:**

- Repeating elements (lists, grids)
- Dynamic content (items added/removed)
- Same interaction for multiple items

**Use listContainer + selector when:**

- Repeating complex structures
- Need specific element in each item
- Need to filter items
- Galleries, product grids, card lists

## See Also

- [Configuration Structure](../guides/configuration-structure.md) - Organizing interactions
- [Lists and Dynamic Content](../guides/lists-and-dynamic-content.md) - Working with lists
- [API Reference](./README.md) - Complete API documentation
