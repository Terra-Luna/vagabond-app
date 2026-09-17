# Vagabond App

Vagabond App: a Foundry VTT system built with TypeScript, React, Vite, and Tailwind CSS.

## Prerequisites

- Node.js with Corepack enabled
- pnpm `11.0.9` (the version declared by the project)
- A local Foundry VTT installation with the Node-based launcher

The `foundry` script assumes the Windows default installation path:
`C:/Program Files/FoundryVTT-Node/main.js`. Update that script, or use
`foundry-linux`, if Foundry is installed elsewhere.

## Project Setup

1. Install the dependencies:

	```sh
	corepack enable
	pnpm install
	```

2. Build the system and run the test suite:

	```sh
	pnpm build
	pnpm test
	```

3. Link or copy the generated `dist` directory into your Foundry data directory:

	```text
	<Foundry data>/systems/vagabond-app/
	```

	The directory must contain the built system files and `system.json` and `./lang/en.json`. A
	symlink is recommended for local development so each build is immediately available to Foundry.

## Local Development

Run Foundry and Vite in separate terminals:

```sh
pnpm foundry
pnpm vite
```

The Vite server listens on `http://localhost:30001` and proxies Foundry
requests to `http://localhost:30000`. `pnpm vite` opens the browser
automatically; use the following command when that is not wanted:

```sh
pnpm vite-no
```

Hot module reload will automatically refresh the system build. JSX files
should instantly refresh while updates to normal typescript files will
trigger a browser refresh.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm build` | Build the system into `dist` |
| `pnpm test` | Build and run Jest tests |
| `pnpm lint` | Run ESLint and check circular dependencies |
| `pnpm lint:fix` | Apply ESLint fixes to `src` |
| `pnpm circ-deps` | Check the dependency graph for cycles |
| `pnpm pack:build` | Pack compendium data and build the system |
| `pnpm pack:packs` | Generate packed compendium files in `dist` |
| `pnpm unpack:packs` | Expand packed compendium files into `packs` |
| `pnpm clean-dist` | Remove generated files that should not be deployed |

## Repository Layout

```text
src/       Application, models, rules, combat, views, and styles
packs/     Unpacked Foundry compendium and game data
public/    Foundry system metadata and static assets
scripts/   Pack, unpack, cleanup, and deployment utilities
test/      Jest tests organized by application area
dist/      Generated build output (not checked in)
```

## Validation Before Changes Are Shared

Run the full local checks before opening a pull request:

```sh
pnpm build
pnpm test
pnpm lint
pnpm lint:fix
```