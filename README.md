# Interact Monorepo

This repository hosts the Interact library, accompanying docs, and any supporting applications. It is structured as an npm workspace-powered monorepo with the following layout:

- `packages/` for publishable libraries (starting with the core Interact library).
- `apps/` for documentation, demos, and future experience-specific frontends.
- Shared root tooling such as TypeScript configs, linting, and scripts.

## Getting Started

### Install dependencies

```bash
yarn install
```

### Building

```bash
yarn build
```

### Testing

```bash
yarn test
```

## Running demo app

```bash
yarn dev:demo
```

## Running documentation app

```bash
yarn dev:docs
```

## Tooling

- `yarn lint` – runs ESLint across all packages and apps using the shared config.
- `yarn format` – formats the repo with Prettier's shared settings.
- `yarn format:check` – verifies formatting without writing changes.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Reporting bugs and proposing features
- Pull request process and code standards

## License

[MIT](LICENSE)
