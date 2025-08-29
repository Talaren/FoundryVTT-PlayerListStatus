# Repository Guidelines

## Project Structure & Module Organization
- Root manifest: `module.json` (id, version, compatibility, entrypoints).
- Source code: `scripts/`
  - Entrypoint: `scripts/playerliststatus.js` (hooks, registry wiring).
  - Core classes: `scripts/PlayerListStatus.mjs`, `scripts/PlayerListRegistry.mjs`.
  - Constants: `scripts/PlayerListPositions.mjs` (exported `POSITIONS`).
- Docs: `README.md`; License: `LICENSE`.
- CI: `.github/workflows/` (CodeQL, release packaging).

## Build, Test, and Development Commands
- Build: no build step required (plain ES modules shipped as-is).
- Local run: develop against a Foundry VTT world.
  - Example (symlink into your Foundry data folder):
    - `ln -s "$(pwd)" /path/to/FoundryVTT/Data/modules/playerlist-status`
  - Enable the module in Foundry and watch the Player List.
- Package ZIP (manual, if needed):
  - `zip -r module.zip module.json LICENSE scripts/`
- Releases: GitHub Actions replaces URLs in `module.json` and uploads `module.zip`.

## Coding Style & Naming Conventions
- Language: modern JavaScript (ES modules).
- Indentation: 4 spaces; include semicolons; double quotes for strings.
- Files: classes in `PascalCase.mjs` (e.g., `PlayerListStatus.mjs`); entry file `playerliststatus.js`.
- Names: classes `PascalCase`, functions/variables `camelCase`, exported constants `UPPER_SNAKE`.
- Avoid side effects in modules; do all Foundry hook wiring in the entry file.

## Testing Guidelines
- No automated tests currently. Validate changes by launching Foundry and:
  - Register a test key on `playerListStatusInit` and verify render positions.
  - Exercise API: `game.playerListStatus.on/off/status/changeValue/changePosition`.
- If adding complex logic, consider unit tests or a minimal test harness.

## Commit & Pull Request Guidelines
- Commits: clear, imperative subject (e.g., "Add AFK position width calc").
- PRs: include purpose, summary of changes, before/after screenshots or short GIF for UI, and references to issues.
- Versioning: bump `version` in `module.json` when behavior/APIs change; update `compatibility` if applicable.
- Keep `README.md` API examples in sync with code.

## Security & Configuration Tips
- Do not commit secrets. CI uses repository secrets for publishing.
- Keep `module.json` `manifest`/`download` URLs untouched; the release workflow rewrites them per tag.
