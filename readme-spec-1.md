# README Research

**Current Repo Takeaways** The rewrite should cover [root README.md](http:///Users/Yehonatand/dev/interact/README.md:1), [packages/interact/README.md](http:///Users/Yehonatand/dev/interact/packages/interact/README.md:1), [packages/motion/README.md](http:///Users/Yehonatand/dev/interact/packages/motion/README.md:1), and add a missing package README for `packages/motion-presets/`.

Important cleanup: `@wix/motion` should be presented as the low-level engine, not as the preset catalog. Presets now belong in `@wix/motion-presets`. Also, the Motion README says `UNLICENSED`, while package metadata says `MIT`.

**Strong GitHub References**

| Category                | References                                                                                                                                                                                                                                                                                           | What To Borrow                                                                       |
| :---------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| Animation engines       | [Motion](https://github.com/motiondivision/motion), [GSAP](https://github.com/greensock/GSAP), [Anime.js](https://github.com/juliangarnier/anime), [react-spring](https://github.com/pmndrs/react-spring), [Popmotion](https://github.com/Popmotion/popmotion)                                       | crisp positioning, tiny first example, “why this engine,” platform/API split         |
| Declarative interaction | [AOS](https://github.com/michalsnik/aos), [VueUse Motion](https://github.com/vueuse/motion), [use-gesture](https://github.com/pmndrs/use-gesture), [interact.js](https://github.com/taye/interact.js), [AutoAnimate](https://github.com/formkit/auto-animate)                                        | config defaults, trigger tables, recipe/caveat sections, clear scope boundaries      |
| Presets/catalogs        | [Motion Primitives](https://github.com/ibelick/motion-primitives), [Magic UI](https://github.com/magicuidesign/magicui), [Rive Web](https://github.com/rive-app/rive-wasm), [Lottie Web](https://github.com/airbnb/lottie-web)                                                                       | catalog navigation, designer/developer workflow, examples, performance notes         |
| LLM/generative UI       | [Vercel AI SDK](https://github.com/vercel/ai), [Tambo](https://github.com/tambo-ai/tambo), [json-render](https://github.com/vercel-labs/json-render), [OpenUI](https://github.com/thesysdev/openui), [Google A2UI](https://github.com/google/A2UI), [AG-UI](https://github.com/ag-ui-protocol/ag-ui) | schema-first explanations, component maps, guardrails, “for agents” setup            |
| Agent docs/tooling      | [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk), [Magic UI MCP](https://github.com/magicuidesign/mcp), [OpenAI Agents JS](https://github.com/openai/openai-agents-js)                                                                                                   | runnable examples, concepts first, tool/resource tables, agent-specific instructions |

**Reusable Section Strategy**

| Section                          | Goal                                                                                       |
| :------------------------------- | :----------------------------------------------------------------------------------------- |
| One-line identity                | Say exactly what the package is, who it is for, and what problem it solves.                |
| Package/entry-point matrix       | Help developers and agents choose the right import.                                        |
| Install \+ first working example | One copy-paste path that works without needing the whole docs site.                        |
| Mental model                     | Define stable nouns: trigger, effect, preset, sequence, condition, scene, scrub.           |
| API surface table                | Small, scannable table of exported functions/classes and when to use each.                 |
| Recipes                          | 3-5 common tasks, each linked to docs: entrance, hover/click, scroll, pointer, state/list. |
| Caveats                          | Browser support, reduced motion, layout pitfalls, preset registration, DOM binding.        |
| Agent/LLM support                | Link rules files, show canonical config shape, list “do not guess” constraints.            |
| Development                      | Repo commands only where relevant; package READMEs should stay user-facing first.          |

**Root README Strategy**

Make the root README the map of the ecosystem, not a full API guide.

Suggested sections:

1. `# Wix Interact` or `# Wix Motion & Interact`
2. Short monorepo promise: web-native animation and declarative interaction libraries.
3. Package matrix: `@wix/motion`, `@wix/interact`, `@wix/motion-presets`.
4. “Which package should I use?” decision table.
5. Minimal combined example: `@wix/interact` \+ `@wix/motion-presets`.
6. Architecture diagram showing Motion underneath Interact and Presets.
7. Docs/rules links, including agent-facing rules.
8. Development setup: `nvm use`, `yarn install`, `yarn build`, `yarn test`, docs/demo commands.
9. Contributing/license.

**@wix/motion README Strategy**

Position it as the engine.

Suggested sections:

1. What it is: low-level WAAPI/CSS animation toolkit.
2. When to use Motion directly vs Interact.
3. Install.
4. Quickstart with `getWebAnimation`.
5. Scroll/pointer-driven example with `getScrubScene`.
6. Core concepts: time animations, scrub animations, named effects, custom effects, sequences.
7. API table: `getWebAnimation`, `getCSSAnimation`, `getScrubScene`, `prepareAnimation`, `getSequence`, `registerEffects`.
8. Using presets via `@wix/motion-presets`.
9. Performance/browser/reduced-motion notes.
10. Agent notes: prefer Motion for custom low-level animation generation.

**@wix/interact README Strategy**

Position it as the declarative runtime.

Suggested sections:

1. What it is: JSON/config-driven trigger-to-effect binding.
2. Entry-point table: `@wix/interact`, `/react`, `/web`.
3. Install, with optional `@wix/motion-presets`.
4. One canonical quickstart for React, then links for Web Components and vanilla.
5. Mental model: element keys \-\> triggers \-\> effects/sequences \-\> conditions.
6. Trigger table: `viewEnter`, `viewProgress`, `hover`, `click`, `pointerMove`, `animationEnd`, etc.
7. Effect table: keyframes, named presets, CSS transitions/state, custom effects.
8. Recipes: entrance, hover, scroll progress, pointer tracking, list items.
9. Common pitfalls from [full-lean rules](http:///Users/Yehonatand/dev/interact/packages/interact/rules/full-lean.md:1).
10. AI support: stable config shape, rules links, “register presets before create,” “do not manually attach listeners.”

**@wix/motion-presets README Strategy**

Add this README. It should be a catalog gateway.

Suggested sections:

1. What it is: ready-made named effects for Motion/Interact.
2. Install.
3. Register all presets and selective registration examples.
4. Category matrix: entrance, ongoing, scroll, mouse, background-scroll.
5. “Choose by intent” table: reveal, attention, parallax, pointer, background media.
6. Small examples for Interact and Motion.
7. Link to preset reference docs/rules.
8. Parameter conventions: direction, distance units, range offsets, reduced motion.
9. Agent support: link [presets-main.md](http:///Users/Yehonatand/dev/interact/packages/motion-presets/rules/presets/presets-main.md:1), say to rely on defaults when unsure.

One extra note: reconcile preset counts before publishing. Local source currently suggests category counts that do not perfectly match one rules file, especially mouse presets.
