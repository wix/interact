# README Research

## Research Findings & README Content Strategy

### Tier 1 — Direct Competitors / Closest Analogues

| Repository                                                                 | Stars | Why It's Relevant                                                                                        |
| :------------------------------------------------------------------------- | :---- | :------------------------------------------------------------------------------------------------------- |
| [**Motion**](https://github.com/motiondivision/motion) (fka Framer Motion) | 31.8k | Closest competitor — animation library, monorepo, multi-platform (React/JS/Vue), also built on WAAPI     |
| [**GSAP**](https://github.com/greensock/GSAP)                              | 24.6k | Gold standard animation library README — rich docs, clear hierarchy, plugin ecosystem                    |
| [**react-spring**](https://github.com/pmndrs/react-spring)                 | 29k   | Cross-platform spring-physics animation — excellent concise README with social proof                     |
| [**Lenis**](https://github.com/darkroomengineering/lenis)                  | 13.5k | Scroll library — the most comprehensive API reference README I found; excellent for developer experience |
| [**Theatre.js**](https://github.com/theatre-js/theatre)                    | 12k   | Motion design monorepo — visual \+ programmatic API, great "use cases" section with GIFs                 |
| [**AutoAnimate**](https://github.com/formkit/auto-animate)                 | 13.8k | Zero-config animation — extremely concise, visual-first README                                           |

### Tier 2 — Declarative/Config-Driven & Generative UI

| Repository                                                              | Stars | Why It's Relevant                                                                                                                     |
| :---------------------------------------------------------------------- | :---- | :------------------------------------------------------------------------------------------------------------------------------------ |
| [**json-render**](https://github.com/vercel-labs/json-render)           | 14k   | Declarative JSON-driven UI framework — excellent monorepo package table, catalog pattern similar to Interact's config-driven approach |
| [**OpenAI Agents SDK**](https://github.com/openai/openai-agents-python) | —     | Best-in-class "core concepts" numbered list with linked docs; good model for AI Support section                                       |

---

### Section Anatomy: What the Best READMEs Do

I identified **14 recurring section patterns** across these projects. Here's what each achieves:

| \#  | Section                           | Goal                                                                | Best Example                                                                           |
| :-- | :-------------------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------- |
| 1   | **Hero Banner / Logo**            | Visual identity, instant recognition                                | Motion, react-spring, Lenis, Theatre.js                                                |
| 2   | **One-Line Description**          | Instant "what is this?" comprehension                               | Motion: _"An open source animation library for React and JavaScript"_                  |
| 3   | **Badges**                        | Trust signals (npm version, downloads, build status, bundle size)   | Lenis (npm, downloads, size), AutoAnimate                                              |
| 4   | **Why X? / Value Proposition**    | Answer "why should I use this over alternatives?"                   | Motion: bullet list of differentiators. GSAP: narrative paragraph                      |
| 5   | **Install**                       | Immediate actionability — copy-paste-ready                          | All of them — typically first code block                                               |
| 6   | **Quick Start**                   | "Hello world" in \<30 seconds                                       | Motion: 3-line code per platform. Your Interact README already does this well          |
| 7   | **Core Concepts**                 | Mental model for the library's architecture                         | OpenAI Agents SDK: numbered list with linked docs. Interact's current README does this |
| 8   | **Packages / Ecosystem Table**    | Monorepo navigation \+ scope clarity                                | json-render: comprehensive table. Lenis: linked sub-packages                           |
| 9   | **API Reference (inline)**        | Key APIs surfaced without leaving the README                        | Lenis: full Settings/Properties/Methods/Events tables                                  |
| 10  | **Examples / Demos**              | "See it in action" — live links, GIFs, CodeSandbox                  | Theatre.js: animated GIFs. Motion: 330+ examples link                                  |
| 11  | **Framework Integration**         | Shows flexibility and reduces "will it work with my stack?" anxiety | Motion: React/JS/Vue tabs. Interact already has this                                   |
| 12  | **AI Support / LLM-Friendliness** | Machine-readable guidance for coding agents                         | Interact's current README has this — unique differentiator\!                           |
| 13  | **Browser Support**               | Compatibility clarity                                               | Lenis: limitations section. GSAP: broad compatibility claims                           |
| 14  | **Contributing / License**        | Community invitation \+ legal clarity                               | Universal pattern                                                                      |

---

### Content Strategy Per File

#### 1\. Root README (`/README.md`)

**Current state:** Generic monorepo boilerplate. Doesn't convey what the project _is_ or _why_ it matters.

**Recommended sections:**

| Section                 | Content Description                                                                                                                                                                                                                                                 |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Hero**                | Logo/banner image \+ tagline: _"Web-native animation & interaction libraries — declarative, AI-ready, framework-agnostic."_                                                                                                                                         |
| **Badges**              | npm versions for all 3 packages, MIT license, CI status, bundle sizes                                                                                                                                                                                               |
| **What is Interact?**   | 2-3 sentence elevator pitch explaining the project vision: declarative, config-driven animations built on native browser APIs (WAAPI, ViewTimeline, pointer tracking). Emphasize: zero dependencies on external animation engines, everything runs on the platform. |
| **Packages**            | Table with columns: Package, npm name, Description, Links (README, npm, docs). List `@wix/motion`, `@wix/interact`, `@wix/motion-presets`. Include the dependency graph from AGENTS.md as a small diagram.                                                          |
| **Quick Start**         | Minimal "pick your path" section — 3 short code snippets showing the most common entry point for each package (similar to how Motion shows React/JS/Vue).                                                                                                           |
| **Live Demo / Website** | Link to `https://wix.github.io/interact/` with a screenshot or GIF of the examples page                                                                                                                                                                             |
| **Documentation**       | Links to docs site, API reference, guides, examples gallery                                                                                                                                                                                                         |
| **AI Support**          | Brief section noting the project ships with LLM/agent integration rules. Link to the rules files. Mention the `llms.txt`\-style resources. This is a unique differentiator — lean into it.                                                                          |
| **Development**         | Condensed: `nvm use && yarn install && yarn build && yarn test`. Link to CONTRIBUTING.md for details.                                                                                                                                                               |
| **Contributing**        | Short invitation \+ link to CONTRIBUTING.md                                                                                                                                                                                                                         |
| **License**             | MIT                                                                                                                                                                                                                                                                 |

**Key principle:** The root README is a _landing page_ and _navigation hub_. It should not duplicate package-level detail. It answers: "What is this monorepo? What's in it? Where do I go next?"

**Best references:** json-render (package table), Motion (platform tabs), Lenis (clean hierarchy)

---

#### 2\. `@wix/motion` README (`packages/motion/README.md`)

**Current state:** Decent but has issues — claims "82+ presets" which belongs to motion-presets, has emojis in section headers (inconsistent style), mentions GSAP/Framer Motion compatibility (questionable), says "UNLICENSED" but package.json says MIT.

**Recommended sections:**

| Section                | Content Description                                                                                                                                                                 |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Title \+ One-Liner** | `@wix/motion` — _"Low-level, web-first animation toolkit. WAAPI, scroll-driven, and pointer-tracking animations with zero dependencies."_ (Use the package.json description)        |
| **Badges**             | npm version, bundle size (bundlephobia), license                                                                                                                                    |
| **Why Motion?**        | 4-5 bullet points: built on native WAAPI (no custom runtime), ViewTimeline for scroll, pointer-driven animations, fastdom for perf, dual rendering (WAAPI \+ CSS), TypeScript-first |
| **Install**            | `npm install @wix/motion`                                                                                                                                                           |
| **Quick Start**        | 2 examples: (1) Basic time-based animation with `getWebAnimation()`, (2) Scroll-driven with `getScrubScene()`. Keep them accurate to the actual API.                                |
| **Core APIs**          | Brief table or list of the main exports: `getWebAnimation()`, `getScrubScene()`, `prepareAnimation()`, CSS integration. Link each to API docs.                                      |
| **Animation Types**    | Explain the 3 animation modes: time-based (WAAPI), scroll-driven (ViewTimeline), pointer-driven. Brief description \+ code snippet each.                                            |
| **TypeScript**         | Show the key interfaces — `TimeAnimationOptions`, `ScrubSceneOptions`. Developers love seeing the type signatures upfront.                                                          |
| **Performance**        | Brief section on fastdom batching, why it matters, best practices                                                                                                                   |
| **Documentation**      | Links to full API docs, category guides, preset reference                                                                                                                           |
| **Browser Support**    | WAAPI support, ViewTimeline (with polyfill note via `fizban`), fallback strategy                                                                                                    |
| **Related Packages**   | `@wix/interact` (declarative layer on top), `@wix/motion-presets` (ready-made presets), `fizban` (scroll polyfill), `kuliso` (pointer polyfill)                                     |
| **AI Support**         | Link to rules for LLM/agent integration                                                                                                                                             |
| **License**            | MIT (fix the current "UNLICENSED" error)                                                                                                                                            |

**Best references:** Lenis (comprehensive API tables), GSAP (clear value prop narrative), Motion (concise per-platform examples)

---

#### 3\. `@wix/interact` README (`packages/interact/README.md`)

**Current state:** This is actually the strongest README already. Good structure, real code examples, covers all 3 entry points. Needs refinement, not a rewrite.

**Recommended sections:**

| Section                  | Content Description                                                                                                                                                                                                                                                                        |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Title \+ One-Liner**   | `@wix/interact` — _"Declarative, configuration-driven interaction library — web-native, AI-ready, and framework-agnostic."_                                                                                                                                                                |
| **Badges**               | npm version, bundle size, license                                                                                                                                                                                                                                                          |
| **Why Interact?**        | Emphasize the unique value: JSON config drives everything, works with vanilla/React/Web Components, AI agents can generate configs. Compare briefly to imperative alternatives.                                                                                                            |
| **Install**              | `npm install @wix/interact`                                                                                                                                                                                                                                                                |
| **Quick Start**          | Keep the 3 entry points (Custom Elements, React, Vanilla) but make them more concise — show just one trigger type in each, not all three with identical configs.                                                                                                                           |
| **How It Works**         | A Mermaid diagram or ASCII flow showing: `Config → Interact.create() → Triggers → Effects → Animation`. This is the mental model section — the config structure is the key concept.                                                                                                        |
| **Triggers**             | Table of all trigger types with one-line descriptions. Keep what's there but tighten.                                                                                                                                                                                                      |
| **Effects**              | Table of effect types.                                                                                                                                                                                                                                                                     |
| **Configuration Schema** | The annotated config structure — keep but add links to full schema docs                                                                                                                                                                                                                    |
| **Examples**             | 3-4 focused examples: entrance, click, scroll-driven, responsive. Keep but slim down — the current README has too many full config blocks. Link to the examples gallery for more.                                                                                                          |
| **Entry Points**         | Table: `@wix/interact` (vanilla), `@wix/interact/react` (React), `@wix/interact/web` (Custom Elements). Brief description of when to use each.                                                                                                                                             |
| **Documentation**        | Links to docs, guides, API reference, examples                                                                                                                                                                                                                                             |
| **AI Support**           | This is Interact's killer feature for differentiation. Expand this section: explain that configs are JSON-serializable and LLM-friendly, link to all rule files, mention that AI agents can generate complete interaction configs. Consider linking to `llms.txt` or Context7 integration. |
| **Browser Support**      | Keep current content                                                                                                                                                                                                                                                                       |
| **Related Packages**     | `@wix/motion`, `@wix/motion-presets`, `fizban`, `kuliso`                                                                                                                                                                                                                                   |
| **License**              | MIT                                                                                                                                                                                                                                                                                        |

**Best references:** json-render (config-driven framework with similar catalog/registry pattern), OpenAI Agents SDK (core concepts list), Motion (multi-platform quick start)

---

#### 4\. `@wix/motion-presets` README (`packages/motion-presets/README.md`) — **NEW**

**Current state:** Does not exist. Needs to be created.

**Recommended sections:**

| Section                        | Content Description                                                                                                                                                                                                                                          |
| :----------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Title \+ One-Liner**         | `@wix/motion-presets` — _"Ready-made animation presets for `@wix/motion` — entrance, scroll, pointer, loop, and background effects."_                                                                                                                        |
| **Badges**                     | npm version, bundle size, license                                                                                                                                                                                                                            |
| **What's Included**            | Summary: X presets across 5 categories. Brief bullet list of categories with counts.                                                                                                                                                                         |
| **Install**                    | `npm install @wix/motion-presets`                                                                                                                                                                                                                            |
| **Quick Start**                | Show `registerEffects()` usage — how to import and register presets, then use them by name                                                                                                                                                                   |
| **Preset Categories**          | 5 subsections, one per category (Entrance, Ongoing, Scroll, Mouse, Background Scroll). Each has: description, preset list (names only — like a menu), link to detailed docs. Move the category content from the current Motion README here where it belongs. |
| **Usage with `@wix/interact`** | Show how presets are consumed via Interact's `namedEffect` in config. This bridges the two packages.                                                                                                                                                         |
| **Usage with `@wix/motion`**   | Show direct usage with `getWebAnimation()` and `getScrubScene()`                                                                                                                                                                                             |
| **Creating Custom Presets**    | Brief guide or link to docs on the preset structure/interface                                                                                                                                                                                                |
| **Full Preset Reference**      | Link to docs with every preset's parameters and visual preview                                                                                                                                                                                               |
| **Related Packages**           | `@wix/motion` (required peer), `@wix/interact` (declarative layer)                                                                                                                                                                                           |
| **License**                    | MIT                                                                                                                                                                                                                                                          |

**Best references:** The current Motion README's "Animation Categories" section (move it here), GSAP (plugin ecosystem presentation)

---

### Cross-Cutting Recommendations

1. **Kill the emojis in headers.** The current Motion README uses emoji headers. None of the top-tier libraries (Motion, GSAP, Lenis) do this. Use clean markdown headers.

2. **Add badges to all packages.** npm version, bundle size (bundlephobia), license badge, and CI status. This is universal across all well-maintained OSS.

3. **AI Support is your differentiator — make it prominent.** No other animation library has a dedicated AI/LLM section. Interact's existing `AI Support` section with rule links is ahead of the curve. Expand it in the Interact README and reference it from root.

4. **Use a consistent structure.** All 3 package READMEs should follow the same template: Title \+ one-liner → badges → why/value prop → install → quick start → core concepts → API overview → docs links → related → license.

5. **Add visual assets.** Theatre.js and AutoAnimate demonstrate that GIFs/screenshots dramatically increase engagement. Consider adding:
   - A hero GIF for the root README showing the examples page
   - Small inline GIFs for each animation category in motion-presets

6. **Keep API reference minimal in READMEs.** Lenis is an outlier with its full API tables in the README. For your project, link to the docs site — the README should be a "menu" not the "full meal."

7. **llms.txt consideration.** Given the AI-ready positioning, consider adding an `llms.txt` file at the root that describes the project in a structured format for AI agents. Reference it from the root README. This aligns with the emerging GitHub convention.

8. **Fix factual errors.** The current Motion README says "UNLICENSED" but package.json says MIT. It also claims features (82+ presets, GSAP compatibility) that belong to other packages or aren't accurate.
