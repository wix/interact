---
name: Context SSOT Restructure
overview: "Restructure the rules/ and docs/ across all three packages (@wix/interact, @wix/motion, @wix/motion-presets) into a single-source-of-truth system where structured data (params, defaults, types, term definitions) lives in YAML glossary files, and final markdown outputs are assembled by a lightweight build script. Work proceeds one package at a time: Interact, then Motion, then Motion-Presets."
todos:
  - id: phase-0-schema
    content: Design YAML glossary schema and marker syntax for templates
    status: pending
  - id: phase-0-build
    content: Build scripts/build-context.js (YAML + templates -> rules/ and docs/ markdown)
    status: pending
  - id: phase-0-validate
    content: Build scripts/validate-context.js (check glossary data against TypeScript source)
    status: pending
  - id: phase-1-audit
    content: "Interact: Audit and verify all ground truth claims via ad-hoc Vitest tests"
    status: pending
  - id: phase-1-glossary
    content: "Interact: Create context/glossary.yaml with all verified terms, params, defaults"
    status: pending
  - id: phase-1-rules-templates
    content: "Interact: Create rules template files (overview, config, triggers, effects, pitfalls)"
    status: pending
  - id: phase-1-docs-templates
    content: "Interact: Create docs template files (guides, api, integration, examples)"
    status: pending
  - id: phase-1-build-validate
    content: "Interact: Run build + validate, iterate until output is correct and readable"
    status: pending
  - id: phase-1-replace
    content: "Interact: Replace old rules/ and docs/ with generated output, verify all builds pass"
    status: pending
  - id: phase-2-audit
    content: "Motion: Audit and verify ground truth (API signatures, return types, scroll/pointer)"
    status: pending
  - id: phase-2-migrate
    content: "Motion: Create glossary, templates, build, and replace (add new rules/ dir)"
    status: pending
  - id: phase-3-audit
    content: "Motion-Presets: Audit all 74 presets params/defaults against source"
    status: pending
  - id: phase-3-migrate
    content: "Motion-Presets: Create glossary, templates, build, and replace"
    status: pending
  - id: phase-3-cross-validate
    content: "Cross-package validation: verify shared concepts are consistent across all three packages"
    status: pending
isProject: false
---

