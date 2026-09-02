# SVG Morph Animations — Technical Design

**Status:** Proposed  
**Scope:** Importing, editing, storing, rendering, and controlling path-based SVG morph animations  
**Compatibility note:** Browser observations are current as of 23 July 2026.

## 1. Summary

SVG morph animation should be represented independently from the SVG markup itself:

- Store a sanitized, static SVG containing the animation’s default pose.
- Extract uploaded animations into a versioned, editor-friendly morph representation.
- Store the logical animation on the `SVGImage` component, while allowing large geometry payloads to be referenced from a deduplicated asset store.
- Represent one logical morph as multiple synchronized tracks—normally one track per `<path>`.
- Use WAAPI animation of the CSS `d` property when the browser actually supports it.
- Compile the same canonical representation to SMIL as the fallback.
- Never play animations automatically on the Editor stage.
- Server-render the static default pose so hydration cannot cause a visual jump.

### Recommended multi-path strategy

Use **one logical animation composed of one animation track per path**.

Path merging may be used as an import-time optimization only when the paths have identical painting and compositing semantics. The custom-property approach should not be used.

---

## 2. Goals

The feature should:

- Import animated SVG content expressed through supported animation formats.
- Extract morph animation data without executing uploaded scripts.
- Convert imported animation into a representation that can be edited and persisted.
- Recognize an imported animation as the component’s default morph animation.
- Allow an Editor-authored animation to be added to an `SVGImage`.
- Keep the Editor stage static unless the user explicitly enters preview mode.
- Support play, pause, reverse, cancel, and normalized seeking.
- Connect to time-, view-, and scroll-driven triggers.
- Render a stable default pose during SSR and hydration.
- Fall back on browsers without CSS `d` animation support.
- Minimize stored and transferred animation data.

## 3. Non-goals for the first version

The first version should not attempt to support:

- Executing JavaScript contained in uploaded SVGs.
- General SVG animation of transforms, gradients, filters, masks, opacity, or motion paths.
- Raster-to-vector conversion.
- Conversion of text or SVG primitives to paths; inputs are expected to already contain `<path>` elements.
- Arbitrary event-based source timing such as `begin="click"`.
- Multiple independently controlled morph effects on the same SVG root in the SMIL fallback.
- Complete Lottie, Rive, GIF, video, or After Effects import.

---

## 4. Core architectural decision

The system should maintain two separate artifacts:

1. **Static SVG asset**

   Contains the sanitized SVG structure, presentation attributes, stable path identifiers, and explicit default `d` values. It contains no active animation.

2. **Canonical Morph IR**

   Contains path targets, normalized geometry frames, offsets, easing, and timing. It is independent of CSS, WAAPI, and SMIL.

```text
Uploaded SVG
    │
    ▼
Secure parser and sanitizer
    │
    ├── Static SVG with base path data
    │
    └── Canonical Morph IR
              │
              ├── Editor preview renderer
              ├── WAAPI d compiler
              └── SMIL d compiler
```

This boundary ensures that:

- Uploaded animation markup never executes directly.
- The Editor can display the component without starting motion.
- The same animation can target different runtime backends.
- Runtime fallback does not require translating arbitrary CSS.
- Storage optimization can operate on structured geometry rather than strings.

---

## 5. Supported upload formats

### Recommended v1 scope

| Input                    | Support          | Behavior                                                                            |
| ------------------------ | ---------------- | ----------------------------------------------------------------------------------- |
| Static `.svg`            | Supported        | Imported without motion; animation may be added in the Editor                       |
| SVG with SMIL            | Supported subset | Extract `<animate attributeName="d">`                                               |
| SVG with embedded CSS    | Supported subset | Extract local `@keyframes` that animate `d`                                         |
| `.svgz`                  | Conditional      | Decompress with strict size and compression-ratio limits, then use the SVG pipeline |
| JavaScript-driven SVG    | Static only      | Remove scripts and report that motion could not be imported                         |
| Lottie JSON / dotLottie  | Later phase      | Add a separate path-only importer                                                   |
| Raster, GIF, APNG, video | Unsupported      | Cannot become editable path morph tracks                                            |

### Supported SMIL subset

Recognize:

- `values`
- `from` and `to`
- `keyTimes`
- `keySplines`
- `dur`
- `repeatCount`
- `fill`
- Linear, spline, and discrete calculation modes

Reject or explicitly approximate:

- `additive`
- `accumulate`
- `paced`
- Per-path repeat models that cannot be expressed as one logical timeline
- Event and cross-element timing expressions
- Wall-clock timing

### Supported CSS subset

Parse embedded CSS as an AST and resolve:

- `animation-name`
- `animation-duration`
- `animation-delay`
- `animation-iteration-count`
- `animation-direction`
- `animation-fill-mode`
- Per-keyframe easing
- `d: path("...")` declarations

Do not preserve author CSS animation rules after import. Once extracted, remove:

- `@keyframes`
- `animation-*` declarations
- CSS `d` declarations
- External stylesheets
- `@import`
- Unsafe or external `url()` references

---

## 6. Secure import pipeline

The server-side importer is authoritative.

1. Validate file extension and detected content type. Do not trust the upload’s `Content-Type`.
2. Enforce compressed and decompressed byte limits.
3. Parse XML with DTD and external entity resolution disabled.
4. Capture supported animation declarations.
5. Resolve CSS selectors to concrete local paths.
6. Assign stable `data-morph-id` identifiers.
7. Sanitize using an explicit SVG allowlist.
8. Remove scripts, event attributes, `foreignObject`, external resources, unsafe URLs, and unsupported interaction.
9. Choose the animation’s default pose and write it into each path’s `d` attribute.
10. Remove all active animation markup.
11. Normalize the morph geometry.
12. Serialize and revalidate the reconstructed SVG.
13. Persist the static SVG and Morph IR separately.

OWASP recommends validating detected file types, imposing size limits, renaming stored files, and keeping uploads outside the web root. SVG additionally requires strict control of scripting and external resources. [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [SVG Integration](https://www.w3.org/TR/svg-integration/).

SVGO’s `removeScripts` can help remove scripts, event attributes, and script links, but it should be one part of the allowlist policy rather than the complete sanitizer. [SVGO `removeScripts`](https://svgo.dev/docs/plugins/removeScripts/).

### Import failure behavior

Animation import should be atomic.

If any required path track cannot be normalized:

- Preserve the sanitized static SVG.
- Import it as static content.
- Report “Animation could not be imported.”
- Include path-level diagnostic codes.
- Do not silently publish only some of the moving paths.

---

## 7. Default pose

Every morph animation must have an explicit base pose.

The recommended rule is:

> The canonical default pose is the animation’s sampled visual state at logical progress `0`.

This pose is written into the static SVG’s `d` attributes and used by:

- The Editor stage.
- SSR.
- The first client paint.
- Reduced-motion rendering.
- A component with no active effect.
- A canceled or failed animation.
- The first frame of every generated backend.

The original underlying `d` may be retained as import metadata, but it should not be used for rendering if it differs from the canonical progress-zero pose.

This invariant eliminates load-to-hydration geometry jumps.

---

## 8. Path normalization

SVG only interpolates two `d` values smoothly when they have the same command types, count, and ordering. Otherwise the animation is discrete. [SVG 2 path interpolation](https://www.w3.org/TR/SVG2/paths.html).

The importer should:

1. Parse path data into commands and numeric parameters.
2. Reject non-finite or excessively large values.
3. Convert relative commands to absolute coordinates.
4. Expand shorthand commands.
5. Convert segments to a canonical representation, normally cubic Bézier curves.
6. Preserve subpath boundaries and open/closed state.
7. Match subpaths by explicit identity and source order.
8. Equalize segment counts through curve subdivision.
9. Align winding direction and the starting point of closed contours.
10. Verify that every frame has identical topology.
11. Store the topology once and frame coordinates separately.

The normalizer must be deterministic. Importing the same bytes twice should produce the same:

- Path identifiers
- Geometry frames
- Diagnostics
- Serialized static SVG
- Content hashes

---

## 9. Canonical Morph IR

An illustrative schema:

```ts
type MorphSetV1 = {
  version: 1;
  defaultAnimationId?: string;

  animations: Array<{
    id: string;
    name: string;
    source: 'upload' | 'editor';

    durationMs: number;
    iterations: number | 'infinite';
    direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    fill: 'none' | 'forwards' | 'backwards' | 'both';

    tracks: Array<{
      targetId: string;
      topology: string;
      offsets: number[];
      easings: string[];
      frames: Array<'$base' | number[]>;
    }>;

    importMetadata?: {
      format: 'smil' | 'css' | 'editor';
      warnings: string[];
    };
  }>;
};
```

### Timing model

All tracks belong to one logical timeline.

If an imported path starts late or finishes early, represent that using hold keyframes in the shared `0–1` timeline. This makes the animation easy to:

- Seek with normalized progress.
- Attach to a scroll timeline.
- Reverse.
- Preview in the Editor.
- Compile to either WAAPI or SMIL.

Per-path repeat counts and unrelated time containers should remain outside the v1 import subset.

---

## 10. `SVGImage` component storage

```ts
type SVGImageMorphState = {
  version: 1;

  defaultAnimationId?: string;
  selectedAnimationId?: string;

  animations: Array<{
    id: string;
    definitionRef?: string;
    inlineDefinition?: MorphSetV1;
  }>;

  defaultPose: {
    animationId?: string;
    progress: 0;
  };
};

type SVGImage = {
  assetRef: string;
  morph?: SVGImageMorphState;
};
```

The component logically owns:

- Animation identity
- Default and selected animation IDs
- Editor state
- References used by the motion engine

Large imported geometry does not need to be physically duplicated on every component. It may be stored as a content-addressed asset and referenced by the component.

An uploaded animated SVG should produce:

```ts
svgImage.morph.defaultAnimationId = importedAnimation.id;
```

This identifies the default animation but does not cause it to play in the Editor.

Trigger behavior—autoplay, view, click, hover, or scroll—should remain in the existing engine and reference the component and animation IDs.

---

## 11. Runtime interface

Expose a single logical handle even when the implementation contains many path animations.

```ts
interface MorphPlayer {
  readonly backend: 'waapi-d' | 'smil-d' | 'static';
  readonly ready: Promise<void>;

  play(options?: { from?: number; direction?: 1 | -1 }): void;

  pause(): void;
  seek(progress: number): void;
  setPlaybackRate(rate: number): void;
  finish(): void;
  cancel(): void;
  destroy(): void;
}
```

`seek(progress)` is the most important integration boundary. It allows the existing engine to drive:

- Scroll position
- View progress
- Drag or pointer position
- Timeline scrubbing
- Editor preview
- Tests at deterministic progress points

All path tracks should receive the same progress update within one engine frame.

---

## 12. Primary runtime: WAAPI animation of `d`

Each path receives one `KeyframeEffect`:

```ts
const effect = new KeyframeEffect(
  path,
  frames.map((frame, index) => ({
    d: `path("${serialize(frame)}")`,
    offset: offsets[index],
    easing: easings[index] ?? 'linear',
  })),
  {
    duration: durationMs,
    iterations,
    direction,
    fill,
  },
);

const animation = new Animation(effect, document.timeline);
```

Using `new Animation(...)` keeps the animation idle until the engine explicitly plays or seeks it. `Element.animate()` begins playback immediately.

A `KeyframeEffect` has one target element, so multiple paths naturally require multiple effects. [Web Animations specification](https://www.w3.org/TR/web-animations-1/), [KeyframeEffect target](https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/target).

The component-level `MorphPlayer` groups them into one effect.

### CSS output

The publish pipeline may optionally generate per-path `@keyframes` for simple declarative output. This is a compiler target, not the stored representation.

Do not persist or transfer both a full CSS animation and a full SMIL version. Select and generate one backend at runtime.

---

## 13. Runtime fallback: generated SMIL

The CSS `d` property works in Chromium and Firefox, but current compatibility data records that stable Safari parses it without applying it. [MDN browser compatibility data](https://github.com/mdn/browser-compat-data/blob/main/css/properties/d.json).

When native `d` animation fails, compile the Morph IR to:

```xml
<path data-morph-id="p1" d="M ...base pose...">
  <animate
    data-generated-morph="default"
    attributeName="d"
    begin="indefinite"
    dur="1200ms"
    values="M ...;M ...;M ..."
    keyTimes="0;0.45;1"
    calcMode="spline"
    keySplines=".4 0 .2 1;.2 0 0 1"
    fill="freeze" />
</path>
```

SMIL `<animate>` is broadly supported, including Safari. [MDN compatibility data](https://github.com/mdn/browser-compat-data/blob/main/svg/elements/animate.json).

### SMIL control mapping

- **Play:** call `beginElement()` on the clock track.
- **Pause/resume:** use `pauseAnimations()` and `unpauseAnimations()` on the inline SVG root.
- **Seek:** keep the root paused and call `setCurrentTime(progress * duration)`.
- **Cancel:** end or remove generated animation nodes and restore the root time to zero.
- **Reverse:** drive time from the existing engine or compile reversed values.

The SVG pause and seek APIs operate on the SVG document fragment, not an individual animation group. [SVGSVGElement animation controls](https://developer.mozilla.org/en-US/docs/Web/API/SVGSVGElement).

Therefore, v1 should allow only one active logical morph per inline SVG root. Starting another replaces the current morph.

This is a generated fallback backend, not a general CSS-to-SMIL polyfill. The system compiles trusted Morph IR directly to SMIL.

---

## 14. Capability detection

Do not rely only on:

```ts
CSS.supports('d', 'path("M0 0 L1 1")');
```

Safari may parse the property while not applying it.

Use a cached behavioral probe:

1. Create an off-screen inline SVG path that remains renderable.
2. Apply a static CSS `d`.
3. Verify that `getBBox()` changes.
4. Create a WAAPI `d` animation.
5. Pause it at 50%.
6. Verify that the measured geometry is between the endpoints.
7. Remove the probe.

Backend selection:

```text
Behavioral CSS d + WAAPI probe passes
    → waapi-d

Otherwise SMIL API smoke test passes
    → smil-d

Otherwise
    → static
```

Use capability results rather than user-agent sniffing.

---

## 15. Multi-path strategy comparison

| Strategy                                   | Integration                                      | Portability          | Performance and size                                        | Decision                                   |
| ------------------------------------------ | ------------------------------------------------ | -------------------- | ----------------------------------------------------------- | ------------------------------------------ |
| One track per path                         | Direct WAAPI and SMIL mapping; simple target IDs | High                 | More native effect objects, but geometry normally dominates | **Recommended**                            |
| Merge every path                           | Simple single animation                          | Technically portable | Fewer effect objects but similar coordinate payload         | Only when semantics are provably identical |
| Animate custom properties                  | Difficult target/cascade model                   | Low                  | Does not remove geometry data                               | Reject                                     |
| CSS keyframes per path                     | Good for declarative output                      | Limited by CSS `d`   | Similar to WAAPI and can duplicate fallback data            | Optional output                            |
| JavaScript `requestAnimationFrame` sampler | Maximum control                                  | High                 | Main-thread parsing, interpolation, and DOM writes          | Last-resort backend                        |

### Why custom properties should be rejected

The CSS `path()` function requires a single path string and cannot construct the path from `var()` values. Typed custom-property interpolation for path geometry is also not sufficiently portable. [MDN `path()` documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/basic-shape/path).

### Safe path-merging conditions

Paths may be merged only when they share:

- Fill, stroke, stroke properties, and opacity
- `fill-rule`
- Transform chain and origin
- Clip, mask, filter, markers, and blend context
- Keyframe offsets and easing
- Accessibility and Editor-selection behavior
- No externally referenced IDs
- No overlap or z-order behavior that changes when combined

Path merging should be an optional optimizer whose output is visually regression-tested.

---

## 16. Editor behavior

The Editor stage should be static by construction:

- The stored SVG contains no active animation markup.
- The stage renderer does not instantiate `MorphPlayer`.
- Imported CSS animation declarations have already been removed.
- Selecting or transforming the component cannot start motion.
- Reloading the Editor continues to show the base pose.

An explicit Preview mode may:

1. Instantiate a paused player.
2. Call `seek(progress)` from a scrubber.
3. Allow play and pause.
4. Cancel and restore the base pose when preview closes.

### Adding an animation in the Editor

1. Capture the current path geometry as progress `0`.
2. Capture the edited geometry as progress `1`.
3. Normalize both poses.
4. Validate path identity and topology.
5. Store the animation on `SVGImage`.
6. Create or update the existing engine’s effect binding.
7. Save and reload with the component still showing its base pose.

If geometry editing changes path count or identity, the Editor must explicitly invalidate or rebind affected morph tracks. It should never silently retarget by DOM index.

---

## 17. SSR and hydration

SSR should emit:

- Inline sanitized SVG
- Explicit `viewBox`
- Stable dimensions or aspect ratio
- Static presentation styles
- Stable `data-morph-id` values
- Base `d` values
- A compact animation definition reference

SSR should not emit an active CSS animation.

If SMIL must be pre-emitted, every generated `<animate>` must use:

```xml
begin="indefinite"
```

Hydration sequence:

1. The browser paints the static SVG.
2. The animation payload loads.
3. Capability detection selects a backend.
4. The player is constructed idle.
5. Progress `0` matches the existing static `d`.
6. The engine attaches its trigger.
7. Motion begins only when triggered.

Do not hide the SVG until hydration. The static content should remain visible and contribute to first paint rather than flashing into view later.

A visual regression test should compare:

- Server-rendered state
- Client state immediately after hydration
- Player at progress `0`
- Reduced-motion state
- State after `cancel()`

These states should be pixel-equivalent within anti-aliasing tolerance.

---

## 18. Trigger and timeline integration

The motion engine should treat morphing like any other effect.

- **Time trigger:** `play()`
- **View entry:** `play()` when the existing observer fires
- **View exit:** pause, cancel, or reverse according to binding
- **Scroll:** `seek(normalizedProgress)`
- **Editor scrubber:** `seek(normalizedProgress)`
- **Timeline composition:** engine supplies time or progress

Native `ScrollTimeline` and `ViewTimeline` can be used as progressive enhancements, but should not be required because browser support is uneven. [Scroll-driven Animations specification](https://www.w3.org/TR/scroll-animations-1/).

For portability, the existing engine’s normalized progress remains the primary integration.

Continuous updates should:

- Be coalesced to one animation frame.
- Avoid writes when progress is unchanged.
- Batch all path updates together.

---

## 19. Reduced motion

When `prefers-reduced-motion: reduce` is active:

- Do not autoplay.
- Do not attach continuous scroll morphing by default.
- Render the base pose.
- Return a static player unless motion is explicitly user-initiated.
- Cancel active looping motion if the preference changes at runtime.
- Provide a pause mechanism for persistent motion.

---

## 20. Storage and payload optimization

### Storage layout

- Store sanitized static SVG by content hash.
- Store Morph IR payloads by content hash.
- Store component-level references and animation IDs on `SVGImage`.
- Keep small unsaved Editor definitions inline.
- Promote large or reusable definitions to the asset store.

### Geometry representation

Instead of storing:

```json
["M 10 20 C ...", "M 11 21 C ...", "M 12 22 C ..."]
```

store:

```ts
{
  topology: "MCCCCZ",
  frames: [
    "$base",
    [11, 21, ...],
    [12, 22, ...]
  ]
}
```

Recommended optimizations:

- Store topology once per track.
- Elide a first frame identical to the base pose.
- Quantize coordinates using a viewBox-relative error tolerance.
- Delta-encode frames from the base or previous frame.
- Use deterministic numeric rounding.
- Apply Brotli or equivalent response compression.
- Lazy-load animation data for off-screen SVGs.
- Compile only the selected runtime backend.

SVGO’s path optimizer demonstrates useful techniques such as relative/absolute conversion, redundant-command removal, delimiter trimming, and numeric rounding. These should run only after interpolation topology has been fixed. [SVGO `convertPathData`](https://svgo.dev/docs/plugins/convertPathData/).

---

## 21. Performance considerations

Animating `d` changes geometry and generally requires path recomputation and repaint. WAAPI provides a better control model, but it does not make morphing equivalent to compositor-only `transform` or `opacity` animation. [MDN animation performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate).

Measure:

- Animated path count
- Cubic segment count per frame
- Keyframe count
- Numeric parameters
- Painted area
- Runtime compile time
- Decoded memory
- Frame time and dropped frames
- Continuous scroll-seek cost
- SSR and transfer bytes

Limits should be configuration rather than schema constants.

The implementation spike should recommend:

- Soft warning thresholds
- Hard upload limits
- Maximum decompression ratio
- Maximum paths per animation
- Maximum keyframes per track
- Maximum segments and numeric parameters
- Maximum active morphs per page

Assets above a hard complexity limit should import as static.

---

## 22. Testing

### Import tests

- SMIL `values`
- SMIL `from`/`to`
- `keyTimes`
- `keySplines`
- CSS animation shorthand
- Multiple selectors and paths
- Delays and hold frames
- Repeats and directions
- Unsupported source timing
- Invalid topology

### Normalization tests

- Relative versus absolute commands
- Lines and curves
- Arc conversion
- Open and closed paths
- Multiple subpaths
- Different segment counts
- Winding and start-point alignment
- Deterministic serialization
- Non-finite and extreme values

### Runtime tests

Run in supported Chromium, Firefox, and Safari/WebKit targets:

- Backend selection
- Play
- Pause
- Seek
- Reverse
- Cancel
- View trigger
- Scroll progress
- Reduced motion
- Player destruction
- Multiple path synchronization

### Visual tests

Capture fixed progress points:

- `0`
- `0.25`
- `0.5`
- `0.75`
- `1`

Also compare SSR before and after hydration.

### Security tests

Include malicious fixtures covering:

- `<script>`
- Event attributes
- `javascript:` and unsafe `data:` URLs
- External CSS and resources
- `foreignObject`
- XXE
- Compression bombs
- Excessive nesting
- Huge path strings
- Non-finite coordinates
- CSS selector abuse

---

## 23. Rollout plan

### Phase 0: Technical spike

- Build the behavioral CSS `d` probe.
- Prototype synchronized multi-path WAAPI.
- Prototype the SMIL fallback.
- Test pause and normalized seeking in Safari.
- Benchmark path normalization alternatives.
- Establish performance and payload budgets.

### Phase 1: Import pipeline

- Secure parsing and sanitization
- SMIL extraction
- CSS extraction
- Stable path IDs
- Geometry normalization
- Diagnostics
- Static SVG reconstruction

### Phase 2: Component and Editor

- `SVGImage` schema
- Default imported animation
- Add/remove/replace animation
- Static stage rendering
- Explicit preview and scrubbing
- Persistence and migrations

### Phase 3: WAAPI runtime

- `MorphPlayer`
- Grouped per-path effects
- Existing engine integration
- Time, view, and scroll triggers

### Phase 4: SMIL and SSR

- Fallback compiler
- Behavioral backend selection
- SVG clock control
- SSR and hydration stability
- Reduced-motion handling

### Phase 5: Hardening

- Complexity limits
- Metrics and diagnostics
- Payload optimization
- Staged feature flags
- Production performance monitoring

---

## 24. Open decisions

Before implementation, confirm:

1. Exact supported browser and WebView versions.
2. Whether `.svgz` is needed in v1.
3. Whether Lottie path animation import is required in v1.
4. Whether uploaded `begin="0s"` should create an autoplay engine binding.
5. Whether a component may store multiple animations while allowing only one active morph.
6. Which normalization library meets determinism, security, licensing, and visual-quality requirements.
7. Accepted numeric precision and complexity budgets.
8. Whether morph-capable `SVGImage` can always use sanitized inline SVG.
9. How path identity is preserved when users edit SVG geometry.
10. Whether a JavaScript attribute sampler is needed beyond the WAAPI and SMIL backends.

## 25. Final recommendation

Approve the following architecture for v1:

- Static sanitized inline SVG as the authoritative default rendering.
- Component-owned, versioned Morph IR.
- One logical morph containing synchronized per-path tracks.
- WAAPI animation of CSS `d` as the preferred backend.
- Generated SMIL as the compatibility backend.
- Behavioral capability detection.
- Static Editor and SSR rendering by default.
- Content-addressed animation storage with shared topology and numeric frames.
- Path merging only as a verified, semantics-preserving optimization.
- No custom-property-based path architecture.
