---
name: Interact E2E Testing
overview: 'Set up Playwright-based E2E test infrastructure for the @wix/interact package with dedicated test fixture pages. The plan is divided into phases: infrastructure setup, test fixtures creation, test scaffolding with titles, and incremental test implementation per suite.'
todos:
  - id: install-playwright
    content: Install Playwright dependencies and add scripts to packages/interact/package.json
    status: pending
  - id: playwright-config
    content: Create playwright.config.ts in packages/interact with projects, webServer, and reporter settings
    status: pending
  - id: test-fixtures-vite
    content: Create Vite config for test fixtures server in packages/interact/e2e/fixtures/
    status: pending
  - id: test-fixtures-hover
    content: Create test fixture page for hover trigger (basic, toggle, interest)
    status: pending
  - id: test-fixtures-click
    content: Create test fixture page for click trigger (basic, toggle, activate)
    status: pending
  - id: test-fixtures-view-enter
    content: Create test fixture page for viewEnter trigger (once, repeat, alternate, state)
    status: pending
  - id: test-fixtures-view-progress
    content: Create test fixture page for viewProgress trigger (scroll-linked animations)
    status: pending
  - id: test-fixtures-pointer-move
    content: Create test fixture page for pointerMove trigger (axis, hit area, composite)
    status: pending
  - id: test-fixtures-animation-end
    content: Create test fixture page for animationEnd trigger (effect chaining, callbacks)
    status: pending
  - id: test-fixtures-conditional
    content: Create test fixture page for conditional effects (media queries, selectors)
    status: pending
  - id: test-fixtures-effect-types
    content: Create test fixture page for effect types (time, transition, keyframe)
    status: pending
  - id: test-fixtures-list-container
    content: Create test fixture page for list container effects
    status: pending
  - id: test-fixtures-state
    content: Create test fixture page for state management (toggleEffect, getActiveEffects)
    status: pending
  - id: test-fixtures-react
    content: Create test fixture page for React integration (Interaction component, createInteractRef)
    status: pending
  - id: test-fixtures-web
    content: Create test fixture page for Web Components (interact-element lifecycle)
    status: pending
  - id: test-utils
    content: Create e2e/utils/ with animation, scroll, pointer, and interaction helpers
    status: pending
  - id: page-objects
    content: Create e2e/pages/ with page objects for each test fixture
    status: pending
  - id: scaffold-hover
    content: Create hover-trigger.spec.ts with test titles
    status: pending
  - id: scaffold-click
    content: Create click-trigger.spec.ts with test titles
    status: pending
  - id: scaffold-view-enter
    content: Create view-enter-trigger.spec.ts with test titles
    status: pending
  - id: scaffold-view-progress
    content: Create view-progress-trigger.spec.ts with test titles
    status: pending
  - id: scaffold-pointer-move
    content: Create pointer-move-trigger.spec.ts with test titles
    status: pending
  - id: scaffold-animation-end
    content: Create animation-end-trigger.spec.ts with test titles
    status: pending
  - id: scaffold-conditional
    content: Create conditional-effects.spec.ts with test titles
    status: pending
  - id: scaffold-effect-types
    content: Create effect-types.spec.ts with test titles
    status: pending
  - id: scaffold-list-container
    content: Create list-container.spec.ts with test titles
    status: pending
  - id: scaffold-state-mgmt
    content: Create state-management.spec.ts with test titles
    status: pending
  - id: scaffold-react
    content: Create react-integration.spec.ts with test titles
    status: pending
  - id: scaffold-web
    content: Create web-components-integration.spec.ts with test titles
    status: pending
  - id: impl-hover
    content: Implement hover trigger tests (mouse enter/leave, toggle, a11y)
    status: pending
  - id: impl-click
    content: Implement click trigger tests (basic, toggle, keyboard a11y)
    status: pending
  - id: impl-view-enter
    content: Implement view enter tests (once, repeat, alternate, state)
    status: pending
  - id: impl-view-progress
    content: Implement view progress tests (scroll linking, range config)
    status: pending
  - id: impl-pointer-move
    content: Implement pointer move tests (x/y axis, hit area, composite)
    status: pending
  - id: impl-animation-end
    content: Implement animation end tests (effect chaining, callbacks, sequencing)
    status: pending
  - id: impl-conditional
    content: Implement conditional effects tests (media queries, selectors, resize)
    status: pending
  - id: impl-effect-types
    content: Implement effect types tests (time, transition, keyframe)
    status: pending
  - id: impl-list-container
    content: Implement list container tests (static, dynamic lists)
    status: pending
  - id: impl-state-mgmt
    content: Implement state management tests (toggleEffect, getActiveEffects)
    status: pending
  - id: impl-react
    content: Implement React integration tests (Interaction component, createInteractRef)
    status: pending
  - id: impl-web
    content: Implement Web Components integration tests (interact-element lifecycle)
    status: pending
  - id: ci-integration
    content: Create dedicated interact-e2e.yml workflow (on-demand via workflow_dispatch) to run E2E tests with Playwright
    status: completed
isProject: false
---

# E2E Test Infrastructure for @wix/interact

## Context

The `@wix/interact` package is a declarative interaction library providing:

- **8 Triggers**: hover, click, viewEnter, viewProgress, pointerMove, animationEnd, activate, interest
- **3 Effect Types**: TimeEffect (time-based), ScrubEffect (scroll/pointer-linked), TransitionEffect (CSS transitions)
- **Features**: Conditional effects (media/selector), list containers, state management (`toggleEffect`)
- **Integrations**: React (`<Interaction>` component) and Web Components (`<interact-element>`)

Dedicated test fixture pages will be created within the interact package to serve as stable, focused test harnesses.

---

## Phase 1: Infrastructure Setup

### 1.1 Install Playwright Dependencies

Add to `[packages/interact/package.json](packages/interact/package.json)`:

```json
"devDependencies": {
  "@playwright/test": "^1.52.0"
}
```

Add scripts:

```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:fixtures": "vite --config e2e/fixtures/vite.config.ts"
}
```

### 1.2 Create Playwright Configuration

Create `[packages/interact/playwright.config.ts](packages/interact/playwright.config.ts)`:

- Base URL: `http://localhost:5173` (test fixtures dev server)
- Test directory: `e2e/tests/`
- Web server command: `yarn test:e2e:fixtures`
- Projects: Chromium, Firefox, WebKit
- Reporter: HTML + list
- Retries: 2 on CI

### 1.3 Create Test Fixtures Server

Create `[packages/interact/e2e/fixtures/vite.config.ts](packages/interact/e2e/fixtures/vite.config.ts)`:

- Multi-page app with each fixture as an entry point
- React plugin for JSX/TSX support (needed for React integration tests)
- Alias `@wix/interact` to local `src/` for testing against source
- Alias `@wix/motion` to workspace package
- Dev server on port 5173

### 1.4 Create Test Utilities

Create `[packages/interact/e2e/utils/](packages/interact/e2e/utils/)` directory with:

| File                     | Purpose                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `animation-helpers.ts`   | Functions to wait for animations, check computed styles, measure transform values          |
| `scroll-helpers.ts`      | Functions to scroll elements into view, simulate scroll gestures with `page.mouse.wheel()` |
| `pointer-helpers.ts`     | Functions to simulate mouse movements, track pointer position across hit areas             |
| `interaction-helpers.ts` | Functions to verify interaction states, check active effects via `getActiveEffects()`      |

### 1.5 Create Page Objects

Create `[packages/interact/e2e/pages/](packages/interact/e2e/pages/)` directory with:

| File                        | Purpose                                                                   |
| --------------------------- | ------------------------------------------------------------------------- |
| `base-fixture-page.ts`      | Base page object with common fixture utilities, navigation, window access |
| `hover-page.ts`             | Page object for hover trigger fixture                                     |
| `click-page.ts`             | Page object for click trigger fixture                                     |
| `view-enter-page.ts`        | Page object for viewEnter trigger fixture                                 |
| `view-progress-page.ts`     | Page object for viewProgress trigger fixture                              |
| `pointer-move-page.ts`      | Page object for pointerMove trigger fixture                               |
| `animation-end-page.ts`     | Page object for animationEnd trigger fixture                              |
| `conditional-page.ts`       | Page object for conditional effects fixture                               |
| `effect-types-page.ts`      | Page object for effect types fixture                                      |
| `list-container-page.ts`    | Page object for list container fixture                                    |
| `state-management-page.ts`  | Page object for state management fixture                                  |
| `react-integration-page.ts` | Page object for React integration fixture                                 |
| `web-components-page.ts`    | Page object for Web Components fixture                                    |

---

## Phase 2: Test Fixtures Creation

Create dedicated HTML/TypeScript pages for each test scenario. Each fixture:

- Imports directly from `@wix/interact` source
- Exposes interaction controllers to `window` for test assertions
- Has data-testid attributes for reliable element selection
- Includes minimal styling focused on testability

### 2.1 Hover Trigger Fixture

File: `[packages/interact/e2e/fixtures/hover.html](packages/interact/e2e/fixtures/hover.html)` + `[hover.tsx](packages/interact/e2e/fixtures/hover.tsx)`

Elements:

- Basic hover target element
- Toggle method hover target
- Interest trigger (a11y) target with focusable element

Exposed globals:

- `window.interactController`: Current InteractionController instance
- `window.getActiveEffects()`: Function to get active effects

Test IDs: `hover-target`, `hover-toggle-target`, `interest-target`

### 2.2 Click Trigger Fixture

File: `[packages/interact/e2e/fixtures/click.html](packages/interact/e2e/fixtures/click.html)` + `[click.tsx](packages/interact/e2e/fixtures/click.tsx)`

Elements:

- Basic click target element
- Toggle method click target
- Activate trigger (a11y) target with button element

Exposed globals:

- `window.interactController`: Current InteractionController instance
- `window.clickCount`: Track click event count

Test IDs: `click-target`, `click-toggle-target`, `activate-target`

### 2.3 ViewEnter Trigger Fixture

File: `[packages/interact/e2e/fixtures/view-enter.html](packages/interact/e2e/fixtures/view-enter.html)` + `[view-enter.tsx](packages/interact/e2e/fixtures/view-enter.tsx)`

Elements:

- Tall scrollable container (2000px+)
- Once type target in middle of scroll area
- Repeat type target
- Alternate type target
- State type target

Exposed globals:

- `window.viewEnterEvents`: Array of recorded viewEnter events
- `window.getElementState(testId)`: Function to get element animation state

Test IDs: `view-once`, `view-repeat`, `view-alternate`, `view-state`, `scroll-container`

### 2.4 ViewProgress Trigger Fixture

File: `[packages/interact/e2e/fixtures/view-progress.html](packages/interact/e2e/fixtures/view-progress.html)` + `[view-progress.tsx](packages/interact/e2e/fixtures/view-progress.tsx)`

Elements:

- Tall scrollable container (2000px+)
- Multiple scroll-linked animation targets
- Range configuration test elements

Exposed globals:

- `window.getScrollProgress(testId)`: Function to get current progress for element
- `window.scrollContainer`: Reference to scroll container

Test IDs: `scroll-container`, `scroll-target-1`, `scroll-target-2`, `scroll-target-3`

### 2.5 PointerMove Trigger Fixture

File: `[packages/interact/e2e/fixtures/pointer-move.html](packages/interact/e2e/fixtures/pointer-move.html)` + `[pointer-move.tsx](packages/interact/e2e/fixtures/pointer-move.tsx)`

Elements:

- X-axis tracking container and target
- Y-axis tracking container and target
- Composite transform element (scaleX + scaleY)
- Bounded pointer area with known dimensions

Exposed globals:

- `window.getPointerProgress()`: Function to get x/y progress
- `window.pointerContainer`: Reference to pointer container

Test IDs: `pointer-container`, `pointer-target`, `pointer-composite`, `pointer-x-target`, `pointer-y-target`

### 2.6 AnimationEnd Trigger Fixture

File: `[packages/interact/e2e/fixtures/animation-end.html](packages/interact/e2e/fixtures/animation-end.html)` + `[animation-end.tsx](packages/interact/e2e/fixtures/animation-end.tsx)`

Elements:

- Source animation element that triggers chain
- Target animation element triggered by animationEnd
- Multiple chained animation sequence elements
- Animation completion indicator

Exposed globals:

- `window.triggerSourceAnimation()`: Function to start the source animation
- `window.chainedEffects`: Array tracking which effects have been triggered
- `window.getAnimationState(testId)`: Function to get animation state
- `window.resetChain()`: Function to reset the animation chain

Test IDs: `animation-source`, `animation-target`, `chain-step-1`, `chain-step-2`, `chain-step-3`, `chain-indicator`

### 2.7 Conditional Effects Fixture

File: `[packages/interact/e2e/fixtures/conditional.html](packages/interact/e2e/fixtures/conditional.html)` + `[conditional.tsx](packages/interact/e2e/fixtures/conditional.tsx)`

Elements:

- Desktop-only animation target (>1024px)
- Tablet animation target (768-1024px)
- Mobile animation target (<768px)
- Grid of elements for nth-child selector testing
- Trigger button

Exposed globals:

- `window.activeCondition`: Currently active media query condition
- `window.triggerAnimation()`: Function to trigger animations
- `window.getMatchedSelectors()`: Function returning which elements matched

Test IDs: `desktop-target`, `tablet-target`, `mobile-target`, `trigger-btn`, `selector-grid`, `selector-item-{n}`

### 2.8 Effect Types Fixture

File: `[packages/interact/e2e/fixtures/effect-types.html](packages/interact/e2e/fixtures/effect-types.html)` + `[effect-types.tsx](packages/interact/e2e/fixtures/effect-types.tsx)`

Elements:

- TimeEffect test element with configurable duration/easing/iterations
- TransitionEffect test element with transitionProperties
- KeyframeEffect test element with custom keyframes
- Fill mode test element (none, forwards, backwards, both)

Exposed globals:

- `window.triggerTimeEffect()`: Function to trigger time-based effect
- `window.triggerTransitionEffect()`: Function to trigger transition effect
- `window.triggerKeyframeEffect()`: Function to trigger keyframe effect
- `window.getEffectState(testId)`: Function to get effect state and computed styles

Test IDs: `time-effect-target`, `transition-effect-target`, `keyframe-effect-target`, `fill-mode-target`, `effect-trigger-btn`

### 2.9 List Container Fixture

File: `[packages/interact/e2e/fixtures/list-container.html](packages/interact/e2e/fixtures/list-container.html)` + `[list-container.tsx](packages/interact/e2e/fixtures/list-container.tsx)`

Elements:

- List container with multiple child elements
- Dynamic list with add/remove buttons
- Selector condition items (even/odd)

Exposed globals:

- `window.addListItem()`: Function to add item dynamically
- `window.removeListItem()`: Function to remove item dynamically
- `window.getListItemStates()`: Function to get animation states

Test IDs: `list-container`, `list-item-{n}`, `add-item-btn`, `remove-item-btn`

### 2.10 State Management Fixture

File: `[packages/interact/e2e/fixtures/state-management.html](packages/interact/e2e/fixtures/state-management.html)` + `[state-management.tsx](packages/interact/e2e/fixtures/state-management.tsx)`

Elements:

- State target element
- Control buttons for add/remove/toggle/clear

Exposed globals:

- `window.interactController`: InteractionController instance
- `window.toggleEffect(method)`: Function to call toggleEffect with method
- `window.getActiveEffects()`: Function to get active effects

Test IDs: `state-target`, `toggle-add-btn`, `toggle-remove-btn`, `toggle-toggle-btn`, `toggle-clear-btn`

### 2.11 React Integration Fixture

File: `[packages/interact/e2e/fixtures/react-integration.html](packages/interact/e2e/fixtures/react-integration.html)` + `[react-integration.tsx](packages/interact/e2e/fixtures/react-integration.tsx)`

Elements:

- `<Interaction>` component with various tagNames
- `createInteractRef` hook usage
- Mount/unmount toggle button

Exposed globals:

- `window.Interact`: Reference to Interact class
- `window.toggleMount()`: Function to mount/unmount component
- `window.getControllerState()`: Function to check controller connection

Test IDs: `interaction-component`, `ref-target`, `mount-toggle-btn`

### 2.12 Web Components Fixture

File: `[packages/interact/e2e/fixtures/web-components.html](packages/interact/e2e/fixtures/web-components.html)` + `[web-components.ts](packages/interact/e2e/fixtures/web-components.ts)`

Elements:

- `<interact-element>` custom element
- Attribute change test element
- Lifecycle test element

Exposed globals:

- `window.customElements`: Check element registration
- `window.getElementController()`: Function to get element's controller
- `window.changeAttribute(attr, value)`: Function to change attribute

Test IDs: `interact-element-target`, `attribute-test-element`, `lifecycle-test-element`

---

## Phase 3: Test Scaffolding (Titles Only)

Create test files with `describe` blocks and empty `test()` stubs.

### 3.1 Hover Trigger Suite

File: `[packages/interact/e2e/tests/hover-trigger.spec.ts](packages/interact/e2e/tests/hover-trigger.spec.ts)`

```
describe('Hover Trigger')
  describe('Basic Hover')
    - should start animation on mouse enter
    - should reverse animation on mouse leave
    - should handle rapid hover in/out
  describe('Toggle Method')
    - should toggle effect state on hover
    - should maintain toggled state after mouse leave
  describe('Interest Trigger (A11y)')
    - should trigger on focus for keyboard users
    - should behave like hover on mouse interaction
```

### 3.2 Click Trigger Suite

File: `[packages/interact/e2e/tests/click-trigger.spec.ts](packages/interact/e2e/tests/click-trigger.spec.ts)`

```
describe('Click Trigger')
  describe('Basic Click')
    - should start animation on click
    - should repeat animation on subsequent clicks
  describe('Toggle Method')
    - should toggle effect state on click
    - should clear effect state with toggle again
  describe('Activate Trigger (A11y)')
    - should trigger on Enter key press
    - should trigger on Space key press
    - should behave like click on mouse interaction
```

### 3.3 ViewEnter Trigger Suite

File: `[packages/interact/e2e/tests/view-enter-trigger.spec.ts](packages/interact/e2e/tests/view-enter-trigger.spec.ts)`

```
describe('ViewEnter Trigger')
  describe('Once Type')
    - should trigger animation when element enters viewport
    - should not re-trigger when element exits and re-enters
  describe('Repeat Type')
    - should trigger animation on each viewport entry
    - should respect threshold parameter
  describe('Alternate Type')
    - should reverse animation when element exits viewport
    - should play forward when element re-enters
  describe('State Type')
    - should add effect state on viewport enter
    - should remove effect state on viewport exit
```

### 3.4 ViewProgress Trigger Suite

File: `[packages/interact/e2e/tests/view-progress-trigger.spec.ts](packages/interact/e2e/tests/view-progress-trigger.spec.ts)`

```
describe('ViewProgress Trigger')
  describe('Basic Scroll Linking')
    - should animate based on scroll progress
    - should update progress on scroll direction change
  describe('Range Configuration')
    - should respect rangeStart and rangeEnd boundaries
    - should handle percentage offsets correctly
  describe('Multiple Elements')
    - should animate elements independently based on their scroll position
```

### 3.5 PointerMove Trigger Suite

File: `[packages/interact/e2e/tests/pointer-move-trigger.spec.ts](packages/interact/e2e/tests/pointer-move-trigger.spec.ts)`

```
describe('PointerMove Trigger')
  describe('X-Axis')
    - should animate based on horizontal mouse position
    - should update progress as mouse moves left to right
  describe('Y-Axis')
    - should animate based on vertical mouse position
    - should update progress as mouse moves top to bottom
  describe('Hit Area')
    - should track pointer within self bounds
    - should track pointer within root bounds
  describe('Composite Operations')
    - should apply composite add for independent transforms
    - should handle scaleX/scaleY independently
```

### 3.6 AnimationEnd Trigger Suite

File: `[packages/interact/e2e/tests/animation-end-trigger.spec.ts](packages/interact/e2e/tests/animation-end-trigger.spec.ts)`

```
describe('AnimationEnd Trigger')
  describe('Basic Chaining')
    - should trigger target effect when source animation ends
    - should pass correct effectId to animationEnd params
  describe('Effect Sequencing')
    - should chain multiple animations in sequence
    - should handle parallel chains from same source
  describe('Callbacks and Timing')
    - should fire after animation fully completes
    - should not trigger if animation is cancelled
```

### 3.7 Conditional Effects Suite

File: `[packages/interact/e2e/tests/conditional-effects.spec.ts](packages/interact/e2e/tests/conditional-effects.spec.ts)`

```
describe('Conditional Effects')
  describe('Media Query Conditions')
    - should apply desktop effect above 1024px
    - should apply tablet effect between 768px and 1024px
    - should apply mobile effect below 768px
  describe('Dynamic Resize')
    - should switch effects when viewport resizes across breakpoints
  describe('Selector Conditions')
    - should apply pulse effect to :nth-child(even) elements
    - should apply spin effect to :nth-child(odd) elements
```

### 3.8 Effect Types Suite

File: `[packages/interact/e2e/tests/effect-types.spec.ts](packages/interact/e2e/tests/effect-types.spec.ts)`

```
describe('Effect Types')
  describe('Time Effects')
    - should respect configured duration
    - should apply easing function correctly
    - should handle iterations and alternate
  describe('Transition Effects')
    - should apply CSS transition on trigger
    - should handle multiple transitionProperties
  describe('Keyframe Effects')
    - should execute custom keyframe sequences
    - should apply fill mode correctly
```

### 3.9 List Container Suite

File: `[packages/interact/e2e/tests/list-container.spec.ts](packages/interact/e2e/tests/list-container.spec.ts)`

```
describe('List Container')
  describe('Static Lists')
    - should apply effects to all matching list items
    - should respect listItemSelector
  describe('Dynamic Lists')
    - should handle dynamically added list items
    - should clean up removed list items
```

### 3.10 State Management Suite

File: `[packages/interact/e2e/tests/state-management.spec.ts](packages/interact/e2e/tests/state-management.spec.ts)`

```
describe('State Management')
  describe('toggleEffect API')
    - should add effect state with add method
    - should remove effect state with remove method
    - should toggle effect state with toggle method
    - should clear all effects with clear method
  describe('getActiveEffects API')
    - should return currently active effects
    - should update after state changes
```

### 3.11 React Integration Suite

File: `[packages/interact/e2e/tests/react-integration.spec.ts](packages/interact/e2e/tests/react-integration.spec.ts)`

```
describe('React Integration')
  describe('Interaction Component')
    - should render with correct tagName
    - should connect element on mount
    - should disconnect element on unmount
  describe('createInteractRef Hook')
    - should return working ref callback
    - should handle ref reassignment
```

### 3.12 Web Components Integration Suite

File: `[packages/interact/e2e/tests/web-components-integration.spec.ts](packages/interact/e2e/tests/web-components-integration.spec.ts)`

```
describe('Web Components Integration')
  describe('interact-element Custom Element')
    - should register custom element
    - should connect on connectedCallback
    - should disconnect on disconnectedCallback
  describe('Attribute Handling')
    - should read data-interact-key attribute
    - should update when attribute changes
```

---

## Phase 4: Test Implementation

### 4.1 Implement Hover Trigger Tests

- Navigate to hover fixture page
- Implement hover trigger tests using `page.hover()` and `page.locator().hover()`
- Assert on transform/opacity changes using `getComputedStyle`
- Call `window.getActiveEffects()` to verify effect state
- Test rapid hover with programmatic mouse events

### 4.2 Implement Click Trigger Tests

- Navigate to click fixture page
- Use `page.getByTestId('click-target').click()` to trigger
- Assert animation plays via style changes
- Test keyboard accessibility with `page.keyboard.press('Enter')` and `Space`
- Assert on `window.clickCount` for event tracking

### 4.3 Implement ViewEnter Trigger Tests

- Navigate to view-enter fixture page
- Use `scrollIntoViewIfNeeded()` for viewport entry
- Use scroll helpers to scroll elements out of viewport
- Call `window.getElementState(testId)` to verify animation state
- Assert on `window.viewEnterEvents` for event tracking

### 4.4 Implement ViewProgress Trigger Tests

- Navigate to view-progress fixture page
- Use `page.mouse.wheel()` to simulate scroll gestures
- Call `window.getScrollProgress(testId)` to verify progress values
- Assert on element transform/opacity changes during scroll

### 4.5 Implement PointerMove Trigger Tests

- Navigate to pointer-move fixture page
- Implement axis tests using `page.mouse.move()` with coordinates
- Call `window.getPointerProgress()` to verify x/y progress
- Test composite operations by verifying independent transform values
- Use `getComputedStyle` to verify transform matrix

### 4.6 Implement AnimationEnd Trigger Tests

- Navigate to animation-end fixture page
- Call `window.triggerSourceAnimation()` to start the chain
- Verify `window.chainedEffects` tracks triggered effects in order
- Call `window.getAnimationState(testId)` to verify target animation started
- Test cancellation by cancelling source animation mid-flight
- Use `window.resetChain()` between tests

### 4.7 Implement Conditional Effects Tests

- Navigate to conditional fixture page
- Use `page.setViewportSize()` to test breakpoints
- Assert on `window.activeCondition` for correct media query
- Call `window.triggerAnimation()` and verify correct effect applies
- Call `window.getMatchedSelectors()` to verify selector matching

### 4.8 Implement Effect Types Tests

- Navigate to effect-types fixture page
- Call `window.triggerTimeEffect()` and verify duration, easing, iterations
- Call `window.triggerTransitionEffect()` and verify transitionProperties applied
- Call `window.triggerKeyframeEffect()` and verify custom keyframe sequences
- Call `window.getEffectState(testId)` to verify computed styles
- Test fill mode behavior with `fill-mode-target`

### 4.9 Implement List Container Tests

- Navigate to list-container fixture page
- Scroll list-container into view
- Call `window.getListItemStates()` to verify all items receive effects
- Call `window.addListItem()` and `window.removeListItem()` to test dynamic behavior

### 4.10 Implement State Management Tests

- Navigate to state-management fixture page
- Click control buttons to test add/remove/toggle/clear
- Call `window.getActiveEffects()` to verify state changes
- Assert on visual state changes of `state-target`

### 4.11 Implement React Integration Tests

- Navigate to react-integration fixture page
- Verify `<Interaction>` component renders with correct tagName
- Call `window.getControllerState()` to verify element connection
- Use `window.toggleMount()` to test mount/unmount behavior

### 4.12 Implement Web Components Integration Tests

- Navigate to web-components fixture page
- Verify `<interact-element>` custom element is defined via `window.customElements`
- Call `window.getElementController()` to verify controller connection
- Use `window.changeAttribute()` to test attribute handling

---

## Phase 5: CI Integration

Create a dedicated `[.github/workflows/interact-e2e.yml](.github/workflows/interact-e2e.yml)` workflow (matching the `motion-e2e.yml` pattern):

- **Trigger**: `workflow_dispatch` with a browser choice input (chromium / firefox / webkit / all, default: webkit)
- **Steps**: Checkout, setup Node 24, cache Yarn deps, enable Corepack, install deps, build motion & interact packages, cache & install Playwright browsers, run E2E tests for selected or all browsers, upload HTML report artifact (14-day retention)
- E2E tests are **not** run in the main CI workflow (`ci.yml`) — they are triggered on demand via the GitHub Actions UI

---

## File Structure

```
packages/interact/
  e2e/
    fixtures/
      vite.config.ts
      index.html                      # Entry with links to all fixtures
      hover.html
      hover.tsx
      click.html
      click.tsx
      view-enter.html
      view-enter.tsx
      view-progress.html
      view-progress.tsx
      pointer-move.html
      pointer-move.tsx
      animation-end.html
      animation-end.tsx
      conditional.html
      conditional.tsx
      effect-types.html
      effect-types.tsx
      list-container.html
      list-container.tsx
      state-management.html
      state-management.tsx
      react-integration.html
      react-integration.tsx
      web-components.html
      web-components.ts               # No React needed for Web Components
      styles.css                      # Shared minimal styles
    pages/
      base-fixture-page.ts
      hover-page.ts
      click-page.ts
      view-enter-page.ts
      view-progress-page.ts
      pointer-move-page.ts
      animation-end-page.ts
      conditional-page.ts
      effect-types-page.ts
      list-container-page.ts
      state-management-page.ts
      react-integration-page.ts
      web-components-page.ts
    utils/
      animation-helpers.ts
      scroll-helpers.ts
      pointer-helpers.ts
      interaction-helpers.ts
    tests/
      hover-trigger.spec.ts
      click-trigger.spec.ts
      view-enter-trigger.spec.ts
      view-progress-trigger.spec.ts
      pointer-move-trigger.spec.ts
      animation-end-trigger.spec.ts
      conditional-effects.spec.ts
      effect-types.spec.ts
      list-container.spec.ts
      state-management.spec.ts
      react-integration.spec.ts
      web-components-integration.spec.ts
  playwright.config.ts
```

---

## Key Considerations

- **Self-Contained**: All E2E infrastructure lives within `packages/interact/e2e/`, keeping tests close to the code they test
- **Embedded Fixtures**: Following the same pattern as `@wix/motion`, test fixtures are served by a local Vite config without requiring a separate workspace package
- **Test IDs**: All interactive elements use `data-testid` attributes for reliable selection
- **Exposed Globals**: Test fixtures expose controllers and helper functions to `window` for direct API testing via `page.evaluate()`
- **React Support**: The Vite config includes `@vitejs/plugin-react` for React integration test fixtures
- **Source Testing**: Fixtures import from local `src/` via alias, testing against actual source code
- **Animation Timing**: Use Playwright's `waitForFunction` or animation helpers to wait for animations to complete before asserting
- **Scroll Simulation**: Use `page.mouse.wheel()` for realistic scroll behavior with ViewProgress tests
- **Reduced Motion**: Consider adding tests that verify `prefers-reduced-motion` behavior
