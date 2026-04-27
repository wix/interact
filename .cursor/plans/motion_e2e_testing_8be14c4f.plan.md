---
name: Motion E2E Testing
overview: 'Set up Playwright-based E2E test infrastructure for the @wix/motion package with dedicated test fixture pages. Tests run on-demand via the motion-e2e GitHub Actions workflow (not in the CI workflow). The plan covers named effects (WAAPI + CSS), keyframe effects (WAAPI + CSS), custom effects, play/reverse, play/pause, scroll-driven, pointer-driven, responsive, and selector scenarios.'
todos:
  - id: install-playwright
    content: Install Playwright dependencies and add scripts to packages/motion/package.json
    status: pending
  - id: playwright-config
    content: Create playwright.config.ts in packages/motion with projects, webServer, and reporter settings
    status: pending
  - id: test-fixtures-vite
    content: Create Vite config for test fixtures server in packages/motion/e2e/fixtures/
    status: pending
  - id: test-fixtures-scroll
    content: Create test fixture page for scroll-driven animations (view-enter, view-progress, scrub)
    status: pending
  - id: test-fixtures-pointer
    content: Create test fixture page for pointer-driven animations (axis, composite)
    status: pending
  - id: test-fixtures-animation-group
    content: Create test fixture page for AnimationGroup API (lifecycle, progress, callbacks)
    status: pending
  - id: test-fixtures-effects
    content: 'Create test fixture page for effect types — named effects (WAAPI + CSS), keyframe effects (WAAPI + CSS), custom effects, play/reverse, and play/pause — with ad-hoc registered named effects'
    status: pending
  - id: test-fixtures-responsive
    content: Create test fixture page for responsive conditions (breakpoints)
    status: pending
  - id: test-fixtures-selector
    content: Create test fixture page for selector conditions (nth-child, list container)
    status: pending
  - id: test-utils
    content: Create e2e/utils/ with animation, scroll, and pointer helper functions
    status: pending
  - id: page-objects
    content: Create e2e/pages/ with page objects for each test fixture
    status: pending
  - id: scaffold-scroll
    content: Create scroll-animations.spec.ts with test titles
    status: pending
  - id: scaffold-pointer
    content: Create pointer-animations.spec.ts with test titles
    status: pending
  - id: scaffold-animation-group
    content: Create animation-group.spec.ts with test titles
    status: pending
  - id: scaffold-effects
    content: 'Create effects.spec.ts with test titles for named effects (WAAPI + CSS), keyframe effects (WAAPI + CSS), custom effects, play/reverse, and play/pause'
    status: pending
  - id: scaffold-responsive
    content: Create responsive-conditions.spec.ts with test titles
    status: pending
  - id: scaffold-selector
    content: Create selector-conditions.spec.ts with test titles
    status: pending
  - id: impl-scroll
    content: Implement scroll-driven animations tests (view-enter, view-progress, scrub)
    status: pending
  - id: impl-pointer
    content: Implement pointer-driven animations tests (axis, composite)
    status: pending
  - id: impl-animation-group
    content: Implement AnimationGroup API tests (lifecycle, progress, callbacks)
    status: pending
  - id: impl-effects
    content: 'Implement effects tests — named effects (WAAPI + CSS), keyframe effects (WAAPI + CSS), custom effects, play/reverse, play/pause'
    status: pending
  - id: impl-responsive
    content: Implement responsive conditions tests (breakpoints, resize)
    status: pending
  - id: impl-selector
    content: Implement selector conditions tests (nth-child, list container)
    status: pending
  - id: motion-e2e-workflow
    content: Create dedicated .github/workflows/motion-e2e.yml workflow for on-demand E2E test runs (not in CI)
    status: done
isProject: false
---

# E2E Test Infrastructure for @wix/motion

## Context

The `@wix/motion` package provides animation APIs for web applications:

- **Core APIs**: `getWebAnimation()`, `getCSSAnimation()`, `getScrubScene()`, `getAnimation()`
- **AnimationGroup**: Class for managing animation groups with play/pause/reverse/cancel
- **Effect types**:
  - **Named effects** — registered via `registerEffects()`, looked up by `namedEffect.type`, support both WAAPI (`web()`) and CSS (`style()`) code paths
  - **Keyframe effects** — inline `keyframeEffect: { name, keyframes }`, synthesized into both WAAPI and CSS pipelines
  - **Custom effects** — `customEffect: (element, progress) => void`, drives `CustomAnimation` for WAAPI (no CSS equivalent)
- **Triggers**: time-based, scroll-driven (`viewProgress`), and pointer-driven (`pointerMove`)
- **Conditions**: Media queries and CSS selectors

Dedicated test fixture pages will be created within the motion package to serve as stable, focused test harnesses.

### Ad-hoc Named Effect Registration

Test fixtures that exercise named effects will **register their own ad-hoc effects** using `registerEffects()` rather than importing from `@wix/motion-presets`. This keeps E2E tests self-contained and decoupled from the presets package. Example pattern:

```ts
import { registerEffects } from '@wix/motion';

registerEffects({
  TestFadeIn: {
    getNames: () => ['test-fadeIn'],
    web: (options) => [
      { ...options, name: 'test-fadeIn', easing: 'linear', keyframes: [{ offset: 0, opacity: 0 }] },
    ],
    style: (options) => [
      { ...options, name: 'test-fadeIn', easing: 'linear', keyframes: [{ offset: 0, opacity: 0 }] },
    ],
  },
  TestSlideIn: {
    getNames: () => ['test-slideIn'],
    web: (options) => [
      {
        ...options,
        name: 'test-slideIn',
        easing: 'linear',
        keyframes: [
          { offset: 0, transform: 'translateX(-100%)' },
          { offset: 1, transform: 'translateX(0)' },
        ],
      },
    ],
    style: (options) => [
      {
        ...options,
        name: 'test-slideIn',
        easing: 'linear',
        keyframes: [
          { offset: 0, transform: 'translateX(-100%)' },
          { offset: 1, transform: 'translateX(0)' },
        ],
      },
    ],
  },
});
```

---

## Phase 1: Infrastructure Setup

### 1.1 Install Playwright Dependencies

Add to `[packages/motion/package.json](packages/motion/package.json)`:

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

Create `[packages/motion/playwright.config.ts](packages/motion/playwright.config.ts)`:

- Base URL: `http://localhost:5174` (test fixtures dev server)
- Test directory: `e2e/tests/`
- Web server command: `yarn test:e2e:fixtures`
- Projects: Chromium, Firefox, WebKit
- Reporter: HTML + list
- Retries: 2 on CI

### 1.3 Create Test Fixtures Server

Create `[packages/motion/e2e/fixtures/vite.config.ts](packages/motion/e2e/fixtures/vite.config.ts)`:

- Multi-page app with each fixture as an entry point
- Alias `@wix/motion` to local `src/` for testing against source
- Dev server on port 5174

### 1.4 Create Test Utilities

Create `[packages/motion/e2e/utils/](packages/motion/e2e/utils/)` directory with:

| File                   | Purpose                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `animation-helpers.ts` | Functions to wait for animations, check play states, measure progress, get computed styles   |
| `scroll-helpers.ts`    | Functions to scroll elements into view, simulate scroll gestures, calculate scroll positions |
| `pointer-helpers.ts`   | Functions to simulate mouse movements, track pointer position within bounded areas           |

### 1.5 Create Page Objects

Create `[packages/motion/e2e/pages/](packages/motion/e2e/pages/)` directory with:

| File                      | Purpose                                                                   |
| ------------------------- | ------------------------------------------------------------------------- |
| `base-fixture-page.ts`    | Base page object with common fixture utilities, navigation, window access |
| `scroll-page.ts`          | Page object for scroll animation fixture                                  |
| `pointer-page.ts`         | Page object for pointer animation fixture                                 |
| `animation-group-page.ts` | Page object for AnimationGroup fixture                                    |
| `effects-page.ts`         | Page object for effects fixture (named, keyframe, custom)                 |
| `responsive-page.ts`      | Page object for responsive conditions fixture                             |
| `selector-page.ts`        | Page object for selector conditions fixture                               |

---

## Phase 2: Test Fixtures Creation

Create dedicated HTML/TypeScript pages for each test scenario. Each fixture:

- Imports directly from `@wix/motion` source
- Exposes animation instances to `window` for test assertions
- Has data-testid attributes for reliable element selection
- Includes minimal styling focused on testability
- Registers ad-hoc named effects via `registerEffects()` where needed (no dependency on `@wix/motion-presets`)

### 2.1 Scroll-Driven Animations Fixture

File: `[packages/motion/e2e/fixtures/scroll.html](packages/motion/e2e/fixtures/scroll.html)` + `[scroll.ts](packages/motion/e2e/fixtures/scroll.ts)`

Elements:

- Tall scrollable container (2000px+)
- View-progress target with rangeStart/rangeEnd
- Multiple scroll cards for staggered testing

Exposed globals:

- `window.scrubScene`: Current ScrubScrollScene instance
- `window.getScrollProgress()`: Function to get current progress

### 2.2 Pointer-Driven Animations Fixture

File: `[packages/motion/e2e/fixtures/pointer.html](packages/motion/e2e/fixtures/pointer.html)` + `[pointer.ts](packages/motion/e2e/fixtures/pointer.ts)`

Elements:

- X-axis tracking element
- Y-axis tracking element
- Composite transform element (scaleX + scaleY)
- Bounded pointer area with known dimensions

Exposed globals:

- `window.pointerScene`: Current ScrubPointerScene instance
- `window.getPointerProgress()`: Function to get x/y progress

### 2.3 AnimationGroup API Fixture

File: `[packages/motion/e2e/fixtures/animation-group.html](packages/motion/e2e/fixtures/animation-group.html)` + `[animation-group.ts](packages/motion/e2e/fixtures/animation-group.ts)`

Elements:

- Multiple animated elements in a group
- Progress indicator element
- Play state display

Exposed globals:

- `window.animationGroup`: AnimationGroup instance
- `window.lifecycleEvents`: Array of recorded events
- Control functions: `window.play()`, `window.pause()`, `window.reverse()`, `window.cancel()`

### 2.4 Effects Fixture (Named, Keyframe, Custom)

File: `[packages/motion/e2e/fixtures/effects.html](packages/motion/e2e/fixtures/effects.html)` + `[effects.ts](packages/motion/e2e/fixtures/effects.ts)`

This fixture is dedicated to testing all three effect types through both WAAPI and CSS code paths, plus play/reverse and play/pause playback controls.

**Ad-hoc named effect registration** at fixture init:

```ts
import { registerEffects, getWebAnimation, getCSSAnimation } from '@wix/motion';

// Register simple, deterministic named effects for testing
registerEffects({
  TestFadeIn: {
    getNames: () => ['test-fadeIn'],
    web: (options) => [
      { ...options, name: 'test-fadeIn', easing: 'linear', keyframes: [{ offset: 0, opacity: 0 }] },
    ],
    style: (options) => [
      { ...options, name: 'test-fadeIn', easing: 'linear', keyframes: [{ offset: 0, opacity: 0 }] },
    ],
  },
  TestScale: {
    getNames: () => ['test-scale'],
    web: (options) => [
      {
        ...options,
        name: 'test-scale',
        easing: 'linear',
        keyframes: [
          { offset: 0, transform: 'scale(0)' },
          { offset: 1, transform: 'scale(1)' },
        ],
      },
    ],
    style: (options) => [
      {
        ...options,
        name: 'test-scale',
        easing: 'linear',
        keyframes: [
          { offset: 0, transform: 'scale(0)' },
          { offset: 1, transform: 'scale(1)' },
        ],
      },
    ],
  },
});
```

Elements:

- Named effect WAAPI target: element animated via `getWebAnimation()` with `namedEffect: { type: 'TestFadeIn' }`
- Named effect CSS target: element animated via `getCSSAnimation()` with `namedEffect: { type: 'TestScale' }` + applied CSS keyframes
- Keyframe effect WAAPI target: element animated via `getWebAnimation()` with `keyframeEffect: { name: 'kf-slide', keyframes: [...] }`
- Keyframe effect CSS target: element animated via `getCSSAnimation()` with `keyframeEffect: { name: 'kf-rotate', keyframes: [...] }` + applied CSS keyframes
- Custom effect target: element animated via `getWebAnimation()` with `customEffect: (el, progress) => { ... }`

Exposed globals:

- `window.namedWaapiGroup`: AnimationGroup from `getWebAnimation()` with named effect
- `window.namedCssData`: CSS animation data from `getCSSAnimation()` with named effect
- `window.keyframeWaapiGroup`: AnimationGroup from `getWebAnimation()` with keyframe effect
- `window.keyframeCssData`: CSS animation data from `getCSSAnimation()` with keyframe effect
- `window.customEffectGroup`: AnimationGroup from `getWebAnimation()` with custom effect
- `window.customEffectLog`: Array tracking `(element, progress)` calls from the custom effect function
- `window.runNamedWaapi()`: Trigger named effect via WAAPI
- `window.runNamedCss()`: Trigger named effect via CSS path
- `window.runKeyframeWaapi()`: Trigger keyframe effect via WAAPI
- `window.runKeyframeCss()`: Trigger keyframe effect via CSS path
- `window.runCustomEffect()`: Trigger custom effect via WAAPI

### 2.5 Responsive Conditions Fixture

File: `[packages/motion/e2e/fixtures/responsive.html](packages/motion/e2e/fixtures/responsive.html)` + `[responsive.ts](packages/motion/e2e/fixtures/responsive.ts)`

Elements:

- Desktop-only animation target (>1024px)
- Tablet animation target (768-1024px)
- Mobile animation target (<768px)
- Current breakpoint indicator

Exposed globals:

- `window.activeCondition`: Currently active media query condition
- `window.triggerAnimation()`: Function to trigger animations

### 2.6 Selector Conditions Fixture

File: `[packages/motion/e2e/fixtures/selector.html](packages/motion/e2e/fixtures/selector.html)` + `[selector.ts](packages/motion/e2e/fixtures/selector.ts)`

Elements:

- Grid of 10 elements for nth-child testing
- List container with child elements
- Selector indicator showing which condition matched

Exposed globals:

- `window.getMatchedSelectors()`: Function returning which elements matched

---

## Phase 3: Test Scaffolding (Titles Only)

Create test files with `describe` blocks and empty `test()` stubs.

### 3.1 Scroll-Driven Animations Suite

File: `[packages/motion/e2e/tests/scroll-animations.spec.ts](packages/motion/e2e/tests/scroll-animations.spec.ts)`

```
describe('Scroll-Driven Animations')
  describe('View Progress Trigger')
    - should animate based on scroll progress
    - should respect rangeStart and rangeEnd boundaries
    - should update progress on scroll direction change
  describe('Scrub Scene')
    - should create scrub scene with correct range offsets
    - should report accurate progress percentage
    - should handle destroy cleanup properly
```

### 3.2 Pointer-Driven Animations Suite

File: `[packages/motion/e2e/tests/pointer-animations.spec.ts](packages/motion/e2e/tests/pointer-animations.spec.ts)`

```
describe('Pointer-Driven Animations')
  describe('Pointer Move Trigger')
    - should animate on x-axis based on horizontal mouse position
    - should animate on y-axis based on vertical mouse position
    - should handle axis switching dynamically
  describe('Composite Operations')
    - should apply composite add for independent transforms
    - should handle scaleX/scaleY independently
  describe('Mouse Animation Instance')
    - should return correct progress values
    - should handle destroy and cleanup
```

### 3.3 AnimationGroup API Suite

File: `[packages/motion/e2e/tests/animation-group.spec.ts](packages/motion/e2e/tests/animation-group.spec.ts)`

```
describe('AnimationGroup API')
  describe('Lifecycle Methods')
    - should play animation and resolve ready promise
    - should pause animation immediately
    - should reverse animation direction
    - should cancel animation and reset
  describe('Progress Control')
    - should set progress manually
    - should report accurate progress percentage
    - should handle setPlaybackRate
  describe('Callbacks')
    - should fire onFinish callback when animation completes
    - should handle multiple onFinish subscribers
```

### 3.4 Effects Suite (Named, Keyframe, Custom + Playback)

File: `[packages/motion/e2e/tests/effects.spec.ts](packages/motion/e2e/tests/effects.spec.ts)`

```
describe('Effect Types')
  describe('Named Effects — WAAPI')
    - should create AnimationGroup via getWebAnimation with registered named effect
    - should apply correct keyframes from named effect web() method
    - should animate element opacity/transform as defined by the named effect
  describe('Named Effects — CSS')
    - should generate CSS animation data via getCSSAnimation with registered named effect
    - should produce correct keyframe name and CSS properties from style() method
    - should return animation data with correct duration, easing, and keyframes
  describe('Keyframe Effects — WAAPI')
    - should create AnimationGroup via getWebAnimation with inline keyframeEffect
    - should apply keyframeEffect keyframes to the element
    - should respect keyframeEffect name as animation id
  describe('Keyframe Effects — CSS')
    - should generate CSS animation data via getCSSAnimation with inline keyframeEffect
    - should produce correct CSS keyframe name from keyframeEffect.name
    - should include keyframeEffect keyframes in CSS output
  describe('Custom Effects')
    - should create animation via getWebAnimation with customEffect function
    - should call customEffect function with (element, progress) during playback
    - should call customEffect with null progress on cancel
    - should track progress updates through customEffect callback
  describe('Playback — Play/Reverse')
    - should play animation forward and then reverse it
    - should return to initial state after reverse completes
  describe('Playback — Play/Pause')
    - should pause animation mid-playback and hold current state
    - should resume from paused position when played again
```

### 3.5 Responsive Conditions Suite

File: `[packages/motion/e2e/tests/responsive-conditions.spec.ts](packages/motion/e2e/tests/responsive-conditions.spec.ts)`

```
describe('Responsive Conditions')
  describe('Desktop Breakpoint')
    - should apply desktop effect above 1024px
    - should not apply tablet/mobile effects
  describe('Tablet Breakpoint')
    - should apply tablet effect between 768px and 1024px
  describe('Mobile Breakpoint')
    - should apply mobile effect below 768px
  describe('Dynamic Resize')
    - should switch effects when viewport resizes
```

### 3.6 Selector Conditions Suite

File: `[packages/motion/e2e/tests/selector-conditions.spec.ts](packages/motion/e2e/tests/selector-conditions.spec.ts)`

```
describe('Selector Conditions')
  describe('nth-child Selectors')
    - should apply pulse effect to even children
    - should apply spin effect to odd children
  describe('List Container')
    - should animate all matching elements in container
    - should respect viewEnter trigger for each element
```

---

## Phase 4: Test Implementation

### 4.1 Implement Scroll-Driven Animations Tests

- Navigate to scroll fixture page
- Implement view-progress tests with `page.mouse.wheel()` for scroll simulation
- Call `window.getScrollProgress()` to verify progress values
- Assert on element transform/opacity changes during scroll

### 4.2 Implement Pointer-Driven Animations Tests

- Navigate to pointer fixture page
- Implement axis tests using `page.mouse.move()` with coordinates
- Call `window.getPointerProgress()` to verify x/y progress
- Test composite operations by verifying independent transform values
- Use `getComputedStyle` to verify transform matrix

### 4.3 Implement AnimationGroup API Tests

- Navigate to animation-group fixture page
- Implement lifecycle tests calling `window.play()`, `window.pause()`, `window.reverse()`, `window.cancel()`
- Implement progress tests using `window.animationGroup.getProgress()`
- Assert on `window.lifecycleEvents` array for callback verification
- Test `window.animationGroup.finished` promise resolution

### 4.4 Implement Effects Tests (Named, Keyframe, Custom + Playback)

- Navigate to effects fixture page

**Named effects — WAAPI:**

- Call `window.runNamedWaapi()` to trigger `getWebAnimation()` with `namedEffect: { type: 'TestFadeIn' }`
- Assert that `window.namedWaapiGroup` is a valid AnimationGroup
- Verify the element's computed opacity changes from 0 to 1
- Check `playState` transitions through `running` → `finished`

**Named effects — CSS:**

- Call `window.runNamedCss()` to trigger `getCSSAnimation()` with `namedEffect: { type: 'TestScale' }`
- Assert that `window.namedCssData` contains valid CSS animation data
- Verify the returned data includes the correct keyframe name (`test-scale`), duration, easing, and keyframes

**Keyframe effects — WAAPI:**

- Call `window.runKeyframeWaapi()` to trigger `getWebAnimation()` with `keyframeEffect: { name: 'kf-slide', keyframes: [...] }`
- Assert that `window.keyframeWaapiGroup` is a valid AnimationGroup
- Verify the element's computed transform changes according to keyframes

**Keyframe effects — CSS:**

- Call `window.runKeyframeCss()` to trigger `getCSSAnimation()` with `keyframeEffect: { name: 'kf-rotate', keyframes: [...] }`
- Assert that `window.keyframeCssData` contains valid CSS animation data
- Verify the CSS output includes `kf-rotate` keyframe name and correct keyframe values

**Custom effects:**

- Call `window.runCustomEffect()` to trigger `getWebAnimation()` with a `customEffect` function
- Assert that `window.customEffectLog` is populated with `(element, progress)` entries
- Verify progress values increase from 0 toward 1 during playback
- Cancel the animation and verify `customEffect` is called with `null` progress

**Playback — Play/Reverse:**

- Create an animation via `getWebAnimation()` (using any effect type), call `play()`
- Wait for partial playback, then call `reverse()`
- Assert element animates back toward its initial state
- Wait for `finished` and verify element returns to initial computed style values

**Playback — Play/Pause:**

- Create an animation via `getWebAnimation()`, call `play()`
- Wait for partial playback, then call `pause()`
- Record the element's computed style at the pause point
- Wait briefly and assert the computed style has not changed (animation is held)
- Call `play()` again and verify the animation resumes from the paused position

### 4.5 Implement Responsive Conditions Tests

- Navigate to responsive fixture page
- Use `page.setViewportSize()` to test breakpoints
- Assert on `window.activeCondition` for correct media query
- Call `window.triggerAnimation()` and verify correct effect applies
- Test dynamic resize behavior by changing viewport size

### 4.6 Implement Selector Conditions Tests

- Navigate to selector fixture page
- Scroll grid elements into view
- Call `window.getMatchedSelectors()` to verify selector matching
- Verify different animations apply based on `:nth-child` selector

---

## File Structure

```
packages/motion/
  e2e/
    fixtures/
      vite.config.ts
      index.html              # Entry with links to all fixtures
      scroll.html
      scroll.ts
      pointer.html
      pointer.ts
      animation-group.html
      animation-group.ts
      effects.html             # Named (WAAPI+CSS), Keyframe (WAAPI+CSS), Custom effects, Play/Reverse, Play/Pause
      effects.ts
      responsive.html
      responsive.ts
      selector.html
      selector.ts
      styles.css              # Shared minimal styles
    pages/
      base-fixture-page.ts
      scroll-page.ts
      pointer-page.ts
      animation-group-page.ts
      effects-page.ts
      responsive-page.ts
      selector-page.ts
    utils/
      animation-helpers.ts
      scroll-helpers.ts
      pointer-helpers.ts
    tests/
      scroll-animations.spec.ts
      pointer-animations.spec.ts
      animation-group.spec.ts
      effects.spec.ts          # Named (WAAPI+CSS), Keyframe (WAAPI+CSS), Custom effects, Play/Reverse, Play/Pause
      responsive-conditions.spec.ts
      selector-conditions.spec.ts
  playwright.config.ts
```

---

## GitHub Actions Workflow (On-Demand)

E2E tests run via the dedicated `**motion-e2e**` workflow (`.github/workflows/motion-e2e.yml`), triggered **on-demand** via `workflow_dispatch` — they do **not** run in the CI workflow.

The workflow:

- Is triggered manually with a browser selection input (chromium / firefox / webkit / all)
- Checks out the repo, sets up Node + Yarn, installs dependencies
- Builds the motion package
- Caches and installs Playwright browsers
- Runs `npx playwright test` (with `--project` filter for single-browser runs)
- Uploads the Playwright HTML report as an artifact (retained 14 days)
