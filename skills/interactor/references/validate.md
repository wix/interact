# Config validation (@wix/interact-validate)

Static schema + referential validation for `InteractConfig`. Runs with no DOM — safe in Node, CI, and agent scratch scripts. Full error catalogue: [rules/validate.md](https://wix.github.io/interact/rules/validate.md).

## When to validate

- **Always (agent):** before `generate()` / `Interact.create()` and before declaring done.
- **After validation, for static site output:** follow the canonical CSS
  generation policy in `references/integration-recipes.md`.
- **Never ship:** no `@wix/interact-validate` import or call in the code you deliver — unless the user explicitly asked for a permanent dev/CI guard.
- **Optional permanent guard:** keep `assertValidInteractConfig` in bundled user code as a devDependency — only when scaffolding or the user asks for CI. Distinct from the temporary injection loop below.

## Quick API

```ts
import { validateInteractConfig, assertValidInteractConfig } from '@wix/interact-validate';

const { valid, errors } = validateInteractConfig(config);
// valid: true when no severity:'error' issues remain (warnings alone keep valid:true)

assertValidInteractConfig(config); // throws InteractValidationError on failure
```

```ts
type ValidationError = {
  code: string;
  message: string;
  path: (string | number)[];
  severity: 'error' | 'warning';
};
```

**Options:** `strict` (promote warnings to errors), `max` (truncate issue list), `severityOverrides` (per rule category — see full docs).

---

## How to RUN the validator (by environment)

| Environment                                             | Config is…     | How the agent runs validation                                                                                                               |
| ------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| This monorepo                                           | any            | `@wix/interact-validate` is built + symlinked; run a scratch `node` script that imports it and calls `validateInteractConfig(config)`.      |
| User project, package already installed                 | any            | Scratch script or dev test importing the installed package.                                                                                 |
| User project, package NOT installed, **static** config  | static literal | `npm i -D @wix/interact-validate` → validate in scratch script → **`npm uninstall`** it. Nothing touches shipped files.                     |
| User project, package NOT installed, **dynamic** config | runtime-built  | If builder module is importable in isolation → dev-only validation script (never ships). Else → temporary in-page injection (next section). |

### Static config — scratch script example

```js
// validate-scratch.mjs — delete after use; never commit to user project
import { validateInteractConfig } from '@wix/interact-validate';

const config = {
  /* paste the literal you authored */
};
const { valid, errors } = validateInteractConfig(config);
if (!valid) {
  for (const e of errors)
    console.error(`[${e.severity}] ${e.code} at ${e.path.join('.')}: ${e.message}`);
  process.exit(1);
}
```

---

## Temporary injection loop (dynamic configs)

Use when the config is assembled at runtime (from data/props/fetch/loops) and cannot be read as a literal.

1. **Inject** `assertValidInteractConfig(config)` (or `validateInteractConfig(config)` + `console.error(errors)`) on the line immediately before `generate()` / `create()`.
2. **Add the import for the run only:**
   - Bundled → temp `-D` devDep + `import { assertValidInteractConfig } from '@wix/interact-validate'`
   - CDN → temp `import { assertValidInteractConfig } from 'https://esm.sh/@wix/interact-validate'`
3. **Run and reach the code path** — dev server / build / test. Validation only happens if that path executes.
4. **Runtime-reachability caveat:** configs built lazily, conditionally, or inside event handlers must be **triggered** during the test run. A plain page load that never hits the builder silently passes without validating anything.
5. Fix every `severity: 'error'`; re-run until valid.
6. **Removal is the loop-terminal step.** Remove the call, import, any `esm.sh` import, and any temporary `package.json` devDep. Verify:

```bash
grep -REn 'interact-validate|validateInteractConfig|assertValidInteractConfig|InteractValidationError' <shipped files>
# expect: no matches
```

**Middle case (preferred):** if the dynamic config's builder is importable in isolation, write a dev-only validation script that imports the builder, constructs the config, and validates it — never ships, no removal step, no reachability risk.

---

## Optional permanent in-code guard (bundled, opt-in)

Only when scaffolding a new project or the user asks for CI — **not** the temporary injection above:

```ts
import { assertValidInteractConfig } from '@wix/interact-validate';

assertValidInteractConfig(config); // throws InteractValidationError
Interact.registerEffects({ FadeIn });
const css = generate(config, false);
Interact.create(config);
```

Install as devDependency: `npm install -D @wix/interact-validate`.

---

## What validate does NOT check

Keep applying the semantic checklist in SKILL.md and trigger/preset references for:

- **Preset registry** — whether `namedEffect.type` is a registered preset or has valid options
- **DOM / markup** — element existence for keys/selectors, matching `data-interact-key` / `interactKey`
- **`registerEffects()` order** — unregistered presets log a warning, not a validation error
- **FOUC / `generate()`** — CSS injection, `useFirstChild` parity (validator also emits `RECOMMENDED_FILL_BACKWARDS` when a `viewEnter` + `once` named/keyframe effect targeting another element or using a same-element delay omits `backwards`/`both`, and `FUNCTION_OFFSET_EASING` when a sequence's function easing keeps it out of the generated CSS)
- **`overflow: clip`** — ancestors with `overflow: hidden` break `viewProgress`

---

## Full documentation

- [rules/validate.md](https://wix.github.io/interact/rules/validate.md) — complete API, error-code catalogue, severity model
- [@wix/interact-validate README](https://github.com/wix/interact/blob/master/packages/interact-validate/README.md)
