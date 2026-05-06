/**
 * Renders integration.md — integration guide covering entry points, config schema, and triggers overview.
 * @param {{ triggers: object[], effects: object, meta: object }} data — no `trigger`; receives the full data object
 * @param {import('../../scripts/build-rules.mjs').Fragments} fragments
 */
export function render(data, fragments) {
  const metaParams = {
    installCommand: data.meta.installCommand,
    webEntry: data.meta.entryPoints.web,
    reactEntry: data.meta.entryPoints.react,
    vanillaEntry: data.meta.entryPoints.vanilla,
    presetsPackage: data.meta.presetsPackage,
  };

  return `# ${data.meta.packageName} Integration Rules

Rules for integrating \`${data.meta.packageName}\` into a webpage — binding animations and effects to user-driven triggers via declarative configuration.

## Table of Contents

- [Entry Points](#entry-points)
  - [Web (Custom Elements)](#web-custom-elements)
  - [React](#react)
  - [Vanilla JS](#vanilla-js)
- [Named Effects & registerEffects](#named-effects--registereffects)
- [Configuration Schema](#configuration-schema)
  - [InteractConfig](#interactconfig)
  - [Interaction](#interaction)
  - [Element Selection](#element-selection)
- [Triggers](#triggers)
- [Sequences](#sequences)
- [Critical CSS (FOUC Prevention)](#critical-css-fouc-prevention)
- [Static API](#static-api)

---

## Entry Points

Install with your package manager:

${fragments.get('quick-start', 'install', metaParams)}

### Web (Custom Elements)

${fragments.get('quick-start', 'web-brief', metaParams)}

Wrap target elements with \`<interact-element>\`:

\`\`\`html
<interact-element data-interact-key="hero">
  <section class="hero">...</section>
</interact-element>
\`\`\`

**Rules:**

- MUST set \`data-interact-key\` to a unique string within the page.
- MUST contain at least one child element (the library targets \`.firstElementChild\` by default).

### React

- Wrap the \`Interact.create()\` call in a \`useEffect\` hook to prevent it from running on server-side.
- Store the returned instance, and call its \`.destroy()\` method on the effect's cleanup function.

\`\`\`typescript
import { useEffect } from 'react';
import { Interact } from '@wix/interact/react';

useEffect(() => {
  const instance = Interact.create(config);

  return () => {
    instance.destroy();
  };
}, [config]);
\`\`\`

Replace target elements with \`<Interaction>\`:

\`\`\`tsx
import { Interaction } from '@wix/interact/react';

<Interaction tagName="div" interactKey="hero" className="hero">
  ...
</Interaction>;
\`\`\`

**Rules:**

- MUST set \`tagName\` to a valid HTML tag string for the element being replaced.
- MUST set \`interactKey\` to a unique string within the page.

### Vanilla JS

${fragments.get('quick-start', 'vanilla-brief', metaParams)}

**Rules:**

- Call \`add(element, key)\` after elements exist in the DOM.
- Call \`remove(key)\` to unregister all interactions for a key.

---

## Named Effects & registerEffects

To use \`namedEffect\` presets from \`${data.meta.presetsPackage}\`, register them before calling \`Interact.create\`. For full effect type syntax (\`keyframeEffect\`, \`customEffect\`, \`StateEffect\`, \`ScrubEffect\`), see \`full-lean.md\`.

**Install:**

\`\`\`bash
> npm install ${data.meta.presetsPackage}
\`\`\`

**Import and register:**

\`\`\`typescript
import { Interact } from '${data.meta.entryPoints.web}';
import * as presets from '${data.meta.presetsPackage}';

Interact.registerEffects(presets);
\`\`\`

Or register selectively:

\`\`\`typescript
import { FadeIn, ParallaxScroll } from '${data.meta.presetsPackage}';
Interact.registerEffects({ FadeIn, ParallaxScroll });
\`\`\`

Then use in effects:

\`\`\`typescript
{ namedEffect: { type: 'FadeIn' }, duration: 800, easing: 'ease-out' }
\`\`\`

For full effect type syntax (\`keyframeEffect\`, \`namedEffect\`, \`customEffect\`, \`transition\`/\`transitionProperties\`), see [full-lean.md](./full-lean.md) and the trigger-specific rule files.

---

## Configuration Schema

${fragments.get('config-structure', 'brief')}

### Interaction

\`\`\`typescript
{
  key: string;                     // REQUIRED — matches data-interact-key / interactKey
  trigger: TriggerType;            // REQUIRED — trigger type
  params?: TriggerParams;          // trigger-specific parameters
  selector?: string;               // CSS selector to refine target within the element
  listContainer?: string;          // CSS selector for a list container
  listItemSelector?: string;       // optional — CSS selector to filter which children of listContainer are selected
  conditions?: string[];           // array of condition IDs; all must pass
  effects?: Effect[];              // effects to apply
  sequences?: SequenceConfig[];    // sequences to apply
}
\`\`\`

At least one of \`effects\` or \`sequences\` MUST be provided.

**Multiple effects per interaction:** A single interaction can contain multiple effects in its \`effects\` array. All effects share the same trigger — they fire together when the trigger activates. Use this to animate different targets from the same trigger event instead of duplicating interactions.

### Element Selection

**Most common**: Omit \`selector\`/\`listContainer\`/\`listItemSelector\` entirely — the element with the matching key is used as both source and target. Use \`selector\` to target a child element within the keyed element. Use \`listContainer\` for staggered sequences across list items.

\`listItemSelector\` is **optional** — only use it when you need to **filter** which children of \`listContainer\` participate (e.g. select only \`.active\` items). When omitted, all immediate children of the \`listContainer\` are selected.

${fragments.get('element-resolution', 'source-brief')}

${fragments.get('element-resolution', 'target-brief')}

---

## Triggers

| Trigger        | Description                            | Trigger \`params\`                                                                        | Rules                                |
| :------------- | :------------------------------------- | :-------------------------------------------------------------------------------------- | :----------------------------------- |
| \`hover\`        | Mouse enter/leave                      | No params. Set \`triggerType\` on TimeEffect or \`stateAction\` on StateEffect.             | [hover.md](./hover.md)               |
| \`click\`        | Mouse click                            | Same as \`hover\`                                                                         | [click.md](./click.md)               |
| \`interest\`     | Accessible hover (hover + focus)       | Same as \`hover\`                                                                         | [hover.md](./hover.md)               |
| \`activate\`     | Accessible click (click + Enter/Space) | Same as \`click\`                                                                         | [click.md](./click.md)               |
| \`viewEnter\`    | Element enters viewport                | \`threshold?\`; \`inset?\`. Set \`triggerType\` on TimeEffect or sequence config.             | [viewenter.md](./viewenter.md)       |
| \`viewProgress\` | Scroll-driven (ViewTimeline)           | No trigger params. Configure \`rangeStart\`/\`rangeEnd\` on the **effect**, not on \`params\` | [viewprogress.md](./viewprogress.md) |
| \`pointerMove\`  | Mouse movement                         | \`hitArea?\`: \`'self'\` \\| \`'root'\`; \`axis?\`: \`'x'\` \\| \`'y'\`                               | [pointermove.md](./pointermove.md)   |
| \`animationEnd\` | Chain after another effect             | \`effectId\`: ID of the preceding effect                                                  | —                                    |
| \`pageVisible\`  | Page visibility change                 | No params. Fires when the page becomes visible (e.g. tab switch).                       | —                                    |

For \`hover\`/\`click\` (and their accessible variants \`interest\`/\`activate\`): set \`triggerType\` on the effect for keyframe/named/custom effects (TimeEffect), or \`stateAction\` on the effect for transitions (StateEffect). Do not mix both on the same effect.

---

## Sequences

${fragments.get('sequences', 'brief')}

---

## Critical CSS (FOUC Prevention)

**Problem:** Elements with entrance animations (e.g. \`FadeIn\` on \`viewEnter\`) are initially visible in their final state. Before the animation framework applies the starting keyframe, the content flashes visibly — a flash of un-animated content (FOUC).

**Solution:** Two things are required — both MUST be present:

1. **Generate critical CSS** with \`generate(config)\` — produces CSS that hides entrance-animated elements until the animation plays.
2. **Mark elements with \`initial\`** — \`data-interact-initial="true"\` on \`<interact-element>\`, or \`initial={true}\` on \`<Interaction>\` in React.

Using only one of these has no effect — both are required.

See [viewenter.md](./viewenter.md) for full details.

**Rules:**

- \`generate()\` should be called server-side or at build time. Can also be called on the client if page content is initially hidden (e.g. behind a loader).
- Only valid for \`viewEnter\` + \`triggerType: 'once'\` (or no \`triggerType\`, which defaults to \`'once'\`) where source and target are the same element.

\`\`\`javascript
import { generate } from '${data.meta.entryPoints.web}';
const css = generate(config);
\`\`\`

${fragments.get('fouc', 'code-inject')}

${fragments.get('fouc', 'code-web', { key: 'hero', classAttr: ' class="hero"' })}

${fragments.get('fouc', 'code-react', { key: 'hero', classAttr: ' className="hero"' })}

${fragments.get('fouc', 'code-vanilla', { key: 'hero', classAttr: ' class="hero"' })}

---

## Static API

${fragments.get('static-api', 'brief')}
`;
}
