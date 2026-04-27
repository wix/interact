# Contributing to Interact

Thank you for your interest in contributing to Interact! We welcome all kinds of contributions: bug reports, documentation improvements, examples, performance enhancements, and new features.

> **Note:** Issues and pull requests that don't follow the guidelines below may be closed until they meet the expected standards.

---

## Table of Contents

- [Before You Start](#before-you-start)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Bug Reports](#bug-reports)
- [Feature Proposals](#feature-proposals)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Commit Messages](#commit-messages)
- [Documentation & Examples](#documentation--examples)
- [Accessibility & Motion](#accessibility--motion)
- [License](#license)
- [Security](#security)
- [Questions & Discussion](#questions--discussion)

---

## Before You Start

1. **Search existing issues** to see if your bug or feature has already been reported or discussed.
2. **For significant changes** (new APIs, architectural changes, large features), open an issue or discussion first. This helps align on design before you invest time coding.
3. **Understand the scope:** We'll merge contributions that fit the library's goals—declarative interactions, performance, and developer experience. We may decline contributions that add excessive complexity or don't align with the project's direction.

---

## Development Setup

### Prerequisites

- **Node.js** `>=18`
- **Yarn** `4.10.3` (managed via Corepack)

### Getting Started

```bash
# Clone your fork
git clone https://github.com/<your-username>/interact.git
cd interact

# Enable Corepack and set up Yarn 4
corepack enable
corepack prepare yarn@4.10.3 --activate

# Install dependencies
yarn install

# Build all packages and apps
yarn build

# Run tests
yarn test

# Run linting and type checks
yarn lint

# Check formatting
yarn format:check

# Auto-format code
yarn format
```

### Running the Apps

```bash
# Start the demo app (hot-reload)
yarn dev:demo

# Start the documentation app (hot-reload)
yarn dev:docs
```

### Working with Individual Workspaces

```bash
# Run a script in a specific workspace
yarn workspace @wix/interact test
yarn workspace @wix/motion test
yarn workspace @wix/interact-docs dev
yarn workspace @wix/interact-demo dev
```

---

## Project Structure

| Path                     | Description                                |
| ------------------------ | ------------------------------------------ |
| `packages/interact/src/` | Core interaction library (`@wix/interact`) |
| `packages/motion/src/`   | Motion/animation toolkit (`@wix/motion`)   |
| `apps/docs/src/`         | Documentation app (`@wix/interact-docs`)   |
| `apps/demo/src/`         | Demo app (`@wix/interact-demo`)            |
| `packages/*/test/`       | Test suites (Vitest)                       |
| `packages/*/docs/`       | Package-specific markdown documentation    |

---

## Bug Reports

Please use the [Bug Report template](https://github.com/wix/interact/issues/new?template=bug_report.md) and include:

- [ ] A clear, descriptive title
- [ ] Steps to reproduce (preferably a minimal example on [JSBin](https://jsbin.com), [CodeSandbox](https://codesandbox.io), or similar)
- [ ] Expected vs. actual behavior
- [ ] Environment details: OS, browser, and versions
- [ ] Screenshots or recordings if applicable

---

## Feature Proposals

Please use the [Feature Request template](https://github.com/wix/interact/issues/new?template=feature_request.md) and include:

- [ ] The problem you're trying to solve
- [ ] Your proposed solution or API
- [ ] Alternatives you've considered
- [ ] Backwards compatibility considerations
- [ ] Performance implications (if any)

For large features, **open an issue first** to discuss the design before implementing.

---

## Pull Request Process

### Getting Started

1. **Fork** the repository and clone your fork.
2. **Create a branch** from `master`:
   - `feature/<short-description>` for new features
   - `fix/<short-description>` for bug fixes
   - `docs/<short-description>` for documentation changes

### Before Submitting

- [ ] **Link the related issue** in your PR description (e.g., "Fixes #123" or "Relates to #456")
- [ ] **Keep PRs focused**—one logical change per PR
- [ ] **Add or update tests** for any behavior changes (`packages/*/test/`)
- [ ] **Update documentation** if the public API or behavior changes
- [ ] **All CI checks must pass:**
  - `yarn build`
  - `yarn test`
  - `yarn lint`
  - `yarn format:check`

### Review Process

- A maintainer will review your PR, usually within a few days.
- Address feedback by pushing new commits (don't force-push during review).
- Once approved and CI passes, a maintainer will merge your PR.

---

## Code Standards

### TypeScript

- Write TypeScript for all source code.
- Export public types from package entry points.
- Prefer explicit types for public APIs; internal code can use inference.

### Performance

- Avoid layout thrash — batch DOM reads and writes (we use `fastdom` internally).
- Prefer existing utilities over adding new dependencies.
- Be mindful of animation frame budgets.

### Formatting & Linting

- **Prettier** handles formatting. Run `yarn format` before committing.
- **ESLint** enforces code quality. Run `yarn lint` to check.
- **TypeScript** strict mode is enabled. Run `yarn lint` (which includes `tsc --noEmit`) in packages.

---

## Commit Messages

We recommend clear, imperative commit messages:

```
<type>(<scope>): <short description>

[optional body with more detail]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Scope:** `interact`, `motion`, `docs`, `demo`, or omit for repo-wide changes

**Examples:**

```
feat(interact): add viewProgress handler for scroll-linked animations
fix(motion): correct easing calculation for spring animations
docs: update README with new installation instructions
chore: upgrade Vite to v7.2
```

---

## Documentation & Examples

### Where Docs Live

- **Package docs:** `packages/interact/docs/` and `packages/motion/docs/`
- **Docs app:** `apps/docs/src/`

### Adding Examples

Good examples for an animation library:

- Show clear before/after states
- Keep code minimal and focused on one concept
- Include comments explaining key parts
- Consider providing a live demo link (CodeSandbox, JSBin)

To preview documentation changes:

```bash
yarn dev:docs
```

---

## Accessibility & Motion

Animation libraries have a responsibility to respect user preferences:

- Support `prefers-reduced-motion` where applicable.
- Document how users can disable or reduce animations.
- Consider users with vestibular disorders when designing motion.

---

## License

By contributing to Interact, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

## Security

If you discover a security vulnerability, **do not open a public issue**. Instead, please report it responsibly by emailing the maintainers directly or through GitHub's private vulnerability reporting feature.

---

## Questions & Discussion

- **Questions:** Open a [GitHub Discussion](https://github.com/wix/interact/discussions) for general questions or ideas.
- **Bugs:** Use the [Bug Report template](https://github.com/wix/interact/issues/new?template=bug_report.md).
- **Features:** Use the [Feature Request template](https://github.com/wix/interact/issues/new?template=feature_request.md).

---

Thank you for helping make Interact better!
