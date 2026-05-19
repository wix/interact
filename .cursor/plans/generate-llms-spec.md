# generate-llms.mjs -- Script Specification

Stage 1 of the [llms.txt web presence plan](llms-txt_web_presence_c57a751b.plan.md).

## Purpose

A deterministic Node.js ESM script that reads `packages/interact/rules/*.md` and produces two output files:

1. **`llms.txt`** -- a lightweight table-of-contents following the [llmstxt.org spec](https://llmstxt.org)
2. **`llms-full.txt`** -- all rule files concatenated into a single document

Both files are generated (never hand-edited). The script runs at deploy time in CI and locally via `yarn generate:llms`.

## File

`scripts/generate-llms.mjs` -- plain ESM, no dependencies beyond `node:fs` and `node:path`.

## Inputs

- **Rules directory**: `packages/interact/rules/` (all `.md` files)
- **Package metadata**: `packages/interact/package.json` (reads `version` and `description`)

## Outputs

The script writes three files (all paths relative to repo root):

| Output | Purpose |
|---|---|
| `llms.txt` | Deployed to site root; also the file that ships in the npm package |
| `llms-full.txt` | Deployed to site root only |
| `packages/interact/llms.txt` | Copy for npm package inclusion (identical to root `llms.txt`) |

### llms.txt format

Must conform to the llmstxt.org spec: exactly one H1, blockquote immediately after, body text, then H2 sections with link lists.

```
# @wix/interact

> {description from package.json}

- Install: `npm install @wix/interact @wix/motion-presets`
- Three entry points: vanilla JS (`@wix/interact`), React (`@wix/interact/react`), Web Components (`@wix/interact/web`)
- Five trigger types: hover, click, viewEnter, viewProgress, pointerMove
- Effects via named presets (`@wix/motion-presets`), keyframes, CSS transitions, or custom JS callbacks
- Configs are JSON-serializable -- designed for LLM generation

## Docs

- [Full Reference]({BASE_URL}/rules/full-lean.md): {extracted description} ({N} lines)
- [Integration Guide]({BASE_URL}/rules/integration.md): {extracted description} ({N} lines)

## Optional

- [{title}]({BASE_URL}/rules/{file}): {extracted description} ({N} lines)
  ... one entry per trigger file, alphabetically ...
- [All rules in one file]({BASE_URL}/llms-full.txt): Complete concatenation ({total} lines)
```

Where:
- `BASE_URL` = `https://wix.github.io/interact`
- `{extracted description}` = the text on the line immediately following the `# ...` heading in each file (the first non-empty line after the H1). Trim to first sentence if longer than 120 chars.
- `{N}` = line count of that file
- Body text (the bullet list between blockquote and `## Docs`) is **static/hardcoded** -- it describes the library's capabilities and does not change when rules files change.

### llms-full.txt format

```
# @wix/interact v{version} -- AI Rules Reference
# {BASE_URL}/llms.txt
# {file_count} files, {total_lines} lines

--- full-lean.md ---
{full content of full-lean.md}

--- integration.md ---
{full content of integration.md}

--- click.md ---
...
```

Header lines use `#` comment style (not markdown headings -- this is a concatenated document, not a spec-compliant llms.txt). Each file is separated by `--- {filename} ---` on its own line, followed by a blank line, then the file content verbatim. No trailing separator after the last file.

## File Ordering

Explicit priority list, then alphabetical fallback for unknown files:

1. `full-lean.md` (always first -- comprehensive reference)
2. `integration.md` (setup and framework patterns)
3. All remaining `.md` files, sorted alphabetically by filename

This ordering is optimized for truncation: an agent reading only the first ~1000 lines of `llms-full.txt` still gets the two most important files.

New files added to the rules directory in the future are automatically discovered and appended alphabetically after the priority files.

## Determinism

The script must produce **byte-identical output** given the same input files and package.json version. This means:
- No timestamps, dates, or random values in output
- File discovery uses sorted directory listing
- Line counts are computed, not hardcoded

## Error Handling

- If `packages/interact/rules/` does not exist or contains zero `.md` files: exit with code 1 and a clear error message.
- If `packages/interact/package.json` is missing or has no `version` field: exit with code 1.
- If a rules `.md` file has no `# ` heading on its first line: use the filename (without extension) as the title. Log a warning to stderr.

## Test Spec

Tests live in `scripts/generate-llms.spec.mjs` and run with the repo's vitest setup.

### Strategy

Test the script's **core logic as imported functions** -- not by spawning a child process. The script should export its key functions so tests can call them directly with controlled inputs (temporary directories with fixture files). The script's CLI entry point (the top-level code that reads real paths and writes real files) remains a thin wrapper around these functions and does not need its own test.

### Exported functions

The script should export these for testability:

- `generateLlmsTxt(files, metadata)` -- returns the `llms.txt` string
  - `files`: array of `{ name, content, lineCount }` objects, already in final order
  - `metadata`: `{ version, description, baseUrl }`
- `generateLlmsFullTxt(files, metadata)` -- returns the `llms-full.txt` string
  - Same signature
- `orderFiles(fileNames)` -- returns sorted array applying the priority + alphabetical rule
- `extractDescription(content)` -- returns the description line from a markdown file

### Test cases

**orderFiles**:
- Current 7 files: returns `['full-lean.md', 'integration.md', 'click.md', 'hover.md', 'pointermove.md', 'viewenter.md', 'viewprogress.md']`
- With unknown file `zebra.md`: appended after all known trigger files
- With unknown files `aaa.md` and `zzz.md`: both appended alphabetically after known files
- Empty array: returns empty array
- Only unknown files: returns them sorted alphabetically

**extractDescription**:
- Standard file (`# Title\n\nDescription line here`): returns `"Description line here"`
- File with blank lines between heading and description: skips blanks, returns first non-empty line
- File with no content after heading: returns empty string
- File with no `# ` heading: returns empty string
- Long description (>120 chars): truncated to first sentence (first `.` followed by space or EOL)

**generateLlmsTxt**:
- With the current 7 files: output starts with `# @wix/interact`, has `> ` blockquote, has `## Docs` with 2 entries, has `## Optional` with 6 entries (5 triggers + llms-full.txt link)
- All URLs are absolute HTTPS
- Line counts in parentheses match input
- Body text (static bullets) is present between blockquote and `## Docs`
- Exactly one H1 in the entire output
- No trailing whitespace on any line

**generateLlmsFullTxt**:
- Header contains version and file count
- Each file preceded by `--- {filename} ---` separator
- Content of each file appears verbatim (byte-equal to input)
- Files appear in the correct order
- No separator after the last file's content
- Total line count in header matches actual line count of body

**Determinism**:
- Calling `generateLlmsTxt` twice with same input produces identical output
- Calling `generateLlmsFullTxt` twice with same input produces identical output

### Not tested (avoid rabbit holes)

- Filesystem I/O (reading real files, writing output) -- tested manually during the verify step
- CLI exit codes -- trivial wrapper, not worth mocking `process.exit`
- Network accessibility of generated URLs -- verified manually post-deploy
- Content correctness of the static body text -- it's a string literal, testing it would just duplicate it
