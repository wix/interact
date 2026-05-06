# Fragments

Reusable markdown content with `<!-- #section -->` markers for granular inclusion at different detail levels.

## Section Naming Conventions

| Pattern                    | When to use                                                    | Example                      |
| :------------------------- | :------------------------------------------------------------- | :--------------------------- |
| `#default`                 | Fragment has only one section                                  | `pitfalls/perspective.md`    |
| `#brief` / `#detailed`    | Two detail levels of the same content                          | `config-structure.md`        |
| `#short` / `#long`        | Short and long versions of the same concept                    | `fouc.md`, `overflow-clip.md`|
| `#<trigger-name>`         | Trigger-specific variant (e.g. `hover`, `viewEnter`)           | `hit-area.md`, `multiple-effects-note.md` |
| `#full-lean` / `#full-lean-<qualifier>` | Condensed wording used by the full-lean reference | `overflow-clip.md`, `hit-area.md` |
| `#code-<variant>`         | Code example variant (e.g. `code-web`, `code-react`)           | `fouc.md`, `quick-start.md`  |
| `#<noun>` / `#<noun>-<qualifier>` | Named concept sections                                | `element-resolution.md`      |

When adding a new section, follow the closest existing pattern. Prefer descriptive names over generic ones when the section has trigger-specific or template-specific content.

## Parameter Conventions

Fragments use `{{paramName}}` placeholders for interpolation. Some conventions:

- **`{{key}}`** — element key. Pass `'hero'` for concrete examples, `'[SOURCE_KEY]'` for template placeholders.
- **`{{classAttr}}`** — an HTML attribute string **including the leading space** (e.g. `' class="hero"'`), or empty string `''` when omitted. The leading space is required because the placeholder is adjacent to the tag name (`<section{{classAttr}}>`).
- **`{{installCommand}}`**, **`{{webEntry}}`**, etc. — package metadata from `data/meta.mjs`, passed as `metaParams` by the build script.
