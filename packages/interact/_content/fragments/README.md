# Fragments

Reusable markdown content with `<!-- #section -->` markers for granular inclusion at different detail levels.

## Section Naming Conventions

| Pattern                    | When to use                                                    | Example                      |
| :------------------------- | :------------------------------------------------------------- | :--------------------------- |
| `#default`                 | Fragment has only one section                                  | `pitfalls/perspective.md`    |
| `#brief` / `#detailed`    | Two detail levels of the same content                          | `config-structure.md`        |
| `#short` / `#long`        | Short and long versions of the same concept                    | `fouc.md`, `overflow-clip.md`|
| `#<trigger-name>`         | Trigger-specific variant (e.g. `hover`, `viewEnter`)           | `hit-area.md`, `multiple-effects-note.md` |
| `#full-lean`              | Condensed wording used by the full-lean reference              | `overflow-clip.md`           |
| `#code-<variant>`         | Code example variant (e.g. `code-web`, `code-react`)           | `fouc.md`, `quick-start.md`  |
| `#<noun>` / `#<noun>-<qualifier>` | Named concept sections                                | `element-resolution.md`      |

When adding a new section, follow the closest existing pattern. Prefer descriptive names over generic ones when the section has trigger-specific or template-specific content.
