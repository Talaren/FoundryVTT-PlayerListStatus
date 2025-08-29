# Development Guidelines for FoundryVTT-PlayerListStatus

Audience: Advanced Foundry VTT module developers working on this repository.

Last verified: 2025-08-10

## 1) Build / Configuration

This module ships as plain ES modules; there is no build step.

- Entry point: `scripts/playerliststatus.js`
  - Exposes `globalThis.PLAYERLIST` with position symbols from `scripts/PlayerListPositions.mjs`.
  - Installs hooks and attaches `Game.prototype.playerListStatus`.
- Manifest: `module.json`
  - `id`: `playerListStatus`
  - `esmodules`: `["scripts/playerliststatus.js"]`
  - `compatibility`: minimum 10, verified 12.331, maximum 12. This repo is authored for v10–v12. Some contributors test on v13+, but the manifest currently caps at 12. If you validate on v13, adjust `compatibility` accordingly and regression test.

Local development install options:
- Recommended: symlink the repo into your Foundry data directory as `Data/modules/playerListStatus` so edits hot-reload on refresh. Example (Linux):
  - `ln -s /path/to/FoundryVTT-PlayerListStatus ~/FoundryVTT/Data/modules/playerListStatus`
- Or manually copy the repo into `Data/modules/playerListStatus`.
- Enable the module in a test world and open the Players list sidebar to see effects.

Notes about Foundry internals this module relies on:
- Hooks:
  - `playerListStatusInit` (once, during `init`): receives an instance of `PlayerListRegistry`. Consumers should register keys here.
  - `playerListStatusReady` (once, during `ready`): receives the `PlayerListStatus` API instance.
  - `renderPlayerList` (on player list render): module injects values relative to the player’s online indicator and name.
- DOM/CSS contracts:
  - Uses `.player-active` / `.player-inactive` and `.player-name` elements inside each `[data-user-id]` row of the Players list.
  - Adjusts the sidebar width by reading `--players-width` from `:root` and adding the measured width of injected content.

## 2) Testing

There are two practical layers of testing for this module:
- Static checks outside Foundry (sanity validation of manifest and source wiring).
- Interactive checks inside Foundry (ensuring hook behavior and DOM injection still align with core changes between Foundry versions).

### 2.1 Static checks (runnable without Foundry)

To quickly validate the repo state, the following Python script checks:
- `module.json` integrity and that the entry module exists.
- Presence of core sources.
- That the entry module wires key hooks and exports.
- That public methods exist on `PlayerListStatus`.

Example script (place at `tests/test_manifest_and_sources.py`):

```python
#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "module.json"
REQUIRED_FILES = [
    ROOT / "scripts" / "playerliststatus.js",
    ROOT / "scripts" / "PlayerListRegistry.mjs",
    ROOT / "scripts" / "PlayerListStatus.mjs",
    ROOT / "scripts" / "PlayerListPositions.mjs",
]

def assert_true(cond, msg):
    print(("[ OK ] " if cond else "[FAIL] ") + msg)
    return bool(cond)

def main() -> int:
    ok = True
    mf = json.loads(MANIFEST.read_text(encoding="utf-8"))
    ok &= assert_true(mf.get("id") == "playerListStatus", "manifest id is 'playerListStatus'")
    ok &= assert_true(isinstance(mf.get("esmodules"), list), "manifest has 'esmodules' array")
    entry_rel = mf["esmodules"][0]
    ok &= assert_true((ROOT / entry_rel).exists(), f"entry module exists: {entry_rel}")
    for f in REQUIRED_FILES:
        ok &= assert_true(f.exists(), f"required file exists: {f.relative_to(ROOT)}")
    src = (ROOT / entry_rel).read_text(encoding="utf-8")
    ok &= assert_true("Hooks.once(\"init\"" in src, "hooks: init registered")
    ok &= assert_true("renderPlayerList" in src, "hooks: renderPlayerList registered")
    ok &= assert_true("Game.prototype.playerListStatus" in src, "Game.prototype.playerListStatus is assigned")
    ok &= assert_true("globalThis.PLAYERLIST" in src, "globalThis.PLAYERLIST is exported")
    pls = (ROOT / "scripts" / "PlayerListStatus.mjs").read_text(encoding="utf-8")
    for m in ("on(", "off(", "status(", "changeValue(", "changePosition(", "render("):
        ok &= assert_true(m in pls, f"PlayerListStatus has method: {m.rstrip('(')}")
    print("\nSummary:\n" + ("PASS" if ok else "FAIL"))
    return 0 if ok else 1

if __name__ == "__main__":
    raise SystemExit(main())
```

Run:
- `python3 tests/test_manifest_and_sources.py`

Verified output on 2025-08-10:

```
Project root: /home/rainerw/git/FoundryVTT-PlayerListStatus
[ OK ] manifest id is 'playerListStatus'
[ OK ] manifest has 'esmodules' array
[ OK ] entry module exists: scripts/playerliststatus.js
[ OK ] required file exists: scripts/playerliststatus.js
[ OK ] required file exists: scripts/PlayerListRegistry.mjs
[ OK ] required file exists: scripts/PlayerListStatus.mjs
[ OK ] required file exists: scripts/PlayerListPositions.mjs
[ OK ] hooks: init registered
[ OK ] hooks: renderPlayerList registered
[ OK ] Game.prototype.playerListStatus is assigned
[ OK ] globalThis.PLAYERLIST is exported
[ OK ] positions include symbol description: beforeOnlineStatus
[ OK ] positions include symbol description: beforePlayername
[ OK ] positions include symbol description: afterPlayername
[ OK ] registry exposes getKeys and registerKey
[ OK ] PlayerListStatus has method: on
[ OK ] PlayerListStatus has method: off
[ OK ] PlayerListStatus has method: status
[ OK ] PlayerListStatus has method: changeValue
[ OK ] PlayerListStatus has method: changePosition
[ OK ] PlayerListStatus has method: render
Summary:
PASS
```

How to extend:
- Add more static assertions around DOM class names used by `render` (e.g., `.player-active`, `.player-name`).
- Parse `module.json` `compatibility` and enforce consistency with README.

### 2.2 Interactive checks inside Foundry

To validate integration behavior across Foundry versions:
- In a test world, create a macro and run after startup:

```js
// Register a key and toggle it
Hooks.once('playerListStatusInit', (register) => {
  register.registerKey('afk', '💤', { resetFlags: false, override: true, position: PLAYERLIST.POSITIONS.AFTER_PLAYERNAME });
});
Hooks.once('playerListStatusReady', (pls) => {
  pls.on('afk');
  ui.players.render(true);
});
```

- Expected: a sleep emoji appears after the player name in the Players sidebar; width may expand. Toggle with `game.playerListStatus.off('afk')`.

## 3) Additional Development Information

Architecture & APIs:
- `PlayerListRegistry` validates and stores keys. Options:
  - `resetFlags` (default true): if true, keys are turned off for the current user on first construction during a new session (`PlayerListStatus` constructor iterates `getToReset()` and calls `off`).
  - `override` (default false): if false and key exists, registration fails.
  - `position`: one of `PLAYERLIST.POSITIONS.{BEFORE_ONLINE_STATUS,BEFORE_PLAYERNAME,AFTER_PLAYERNAME}`. Internally stored as Symbols with `.description` used for flag paths.
- `PlayerListStatus` methods:
  - `on(key, user=game.user)` / `off(key, user=game.user)` write/delete user flags under module namespace `playerListStatus` and the position-specific subpath (`Symbol.description`).
  - `status(key, user=game.user)` reads flags to determine visibility.
  - `changeValue(key, element)` updates the registry and re-applies the flag.
  - `changePosition(key, position)` updates position; re-applies if active.
  - `render(foundry, html, options)` injects registered values near the appropriate DOM nodes and adjusts sidebar width based on measured text/element width (`canvas.measureText` for strings; `offsetWidth` for HTMLElements).

Version notes:
- User flag access includes a legacy branch for v9; v10+ uses `user.flags`. DOM structure and CSS variable names are based on v10–v12; verify against core changes when moving to v13+ (Players list application and class names).
- If raising `compatibility.maximum` beyond 12, test across multiple worlds and systems; pay attention to `renderPlayerList` payload and `.player-active/.player-inactive` classes.

Conventions:
- ES modules with private class fields (`#field`) are used; stay on Node/engine targets that support them (Foundry’s Electron runtime suffices for v10+).
- Positions are Symbols; do not serialize them directly. Use the provided `PLAYERLIST.POSITIONS` reference; persistence uses `Symbol.description`.
- Avoid heavy DOM manipulation outside `renderPlayerList` to prevent desync. Prefer updating via flags and calling `ui.players.render(true)`.

Packaging & Release:
- The manifest points to GitHub Releases. When bumping version:
  - Update `module.json#version`, `download`, and ensure the release asset uses the matching tag.
  - Keep README’s dependency `compatibility.verified` in sync if changed.

Known sensitivities:
- Width calculation assumes `--players-width` is a pixel value on `:root`.
- The locator for player status/name relies on specific class names; double-check against Foundry core changes.

Debugging tips:
- Use DevTools in Foundry: inspect a player row `[data-user-id]` and verify injected spans have the registered key as `id`.
- Log flags: `console.log(game.user.flags.playerListStatus)` to see stored maps keyed by position description.
