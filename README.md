![GitHub release (latest by date)](https://img.shields.io/github/v/release/Talaren/FoundryVTT-PlayerListStatus?style=for-the-badge)
![GitHub release (latest by date)](https://img.shields.io/github/downloads/Talaren/FoundryVTT-PlayerListStatus/latest/module.zip?style=for-the-badge)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https://forge-vtt.com/api/bazaar/package/playerListStatus&colorB=green&style=for-the-badge)

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https://github.com/Talaren/FoundryVTT-PlayerListStatus/releases/latest/download/module.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=green&style=for-the-badge)

# FoundryVTT Library: PlayerList Status

Allow modules to show text or icon in the player list.

* [Include as a dependency in your manifest](#include-as-a-dependency-in-your-manifest)
  + [Foundry V10](#foundry-v10)
* [Usage](#usage)
  + [registerKey](#registerregisterkey)
    - [options](#options)
* [API](#api)
  + [on](#gameplayerliststatuson)
  + [off](#gameplayerliststatusoff)
  + [status](#gameplayerliststatusstatus)
  + [changeValue](#gameplayerliststatuschangevalue)
  + [changePosition](#gameplayerliststatuschangeposition)
  + [removeKey](#gameplayerliststatusremovekey)

## Foundry V13 Behavior

- AFK handling: When the registered key name is "afk" (case-insensitive), the module does not render an icon/text in the list on V13. Instead, it mirrors the state by toggling the CSS class `idle` on the corresponding `<li class="player">` element, aligning with Foundry’s built-in Users view behavior.
- Other keys: All non-"afk" keys render as usual at the configured position.
- Online indicator: In V13 the online dot is provided via CSS `li.player::before` using `var(--player-color)`/`var(--player-border)`. Inserting content at `BEFORE_ONLINE_STATUS` positions your element at the start of the row and does not replace the dot.
- Version detection: Extracts the first numeric sequence from `game.version` or `game.release.version` to determine the major version (e.g., `13` from `13.348`).

## Deprecation

- POSITIONS.BEFORE_ONLINE_STATUS: Deprecated for Foundry V13+. The online status dot is rendered via CSS `::before`, so third‑party content cannot be positioned visually before it. Use `BEFORE_PLAYERNAME` or `AFTER_PLAYERNAME` instead. A console warning is emitted when registering a key with this position; the constant may be removed in a future release.


# Include as a dependency in your manifest

## Foundry V10+

```json
{
  "relationships": {
    "requires": [
      {
        "id": "playerListStatus",
        "type": "module",
        "manifest": "https://github.com/Talaren/FoundryVTT-PlayerListStatus/releases/latest/download/module.json",
        "compatibility": {
          "verified": "3.1.2"
        }
      }
    ]
  }
}
```

# Usage

## register.registerKey

key: `string` the registered key

element: `string` or `HTMLElement` the element to show

return: `boolean` is the registration successful.

```js
Hooks.once('playerListStatusInit', function(register) {
		let success = register.registerKey("afk", "💤");
});

```


### options

resetFlags: After Login or Reload should the active flags reset to inactive?

override: When the key is set from another module override the setting?

position: where should the text shown, default is after username.

<details><summary>position</summary>

`game.playerListStatus.positions.beforeOnlineStatus`

`game.playerListStatus.positions.beforePlayername`

`game.playerListStatus.positions.afterPlayername`
</details>

```js
Hooks.once('playerListStatusInit', function(register) {
		let options = {
			resetFlags: true,
			override: false,
			position: PLAYERLIST.POSITIONS.AFTER_PLAYERNAME
		}
		let success = register.registerKey("afk", "💤", options);
});

```


## API

### game.playerListStatus.on
Set the flag and show the key

<details><summary>parameters</summary>

key: `string` the registered key

id: (optional) `string` a user id
</details>


### game.playerListStatus.off

Remove the flag and hide the key

<details><summary>parameters</summary>

key: `string` the registered key

id: (optional) `string` a user id
</details>


### game.playerListStatus.status
Return the status from the key.

<details><summary>parameters</summary>

key: `string` the registered key

id: (optional) `string` a user id

return: `boolean` is key active?
</details>


### game.playerListStatus.changeValue

Change the element to show

<details><summary>parameters</summary>

key: `string` the registered key

element: `string` or `HTMLElement` the element to show
</details>

```js
	game.settings.register(moduleName, "typingIcon", {
		name: game.i18n.localize("PLAYER-STATUS.typing.icon"),
		scope: 'world',
		config: true,
		choices: {
			"⌛": "⌛",
			"🗨️": "🗨️"
		},
		type: String,
		default: "🗨️",
		onChange: setting => game.playerListStatus.changeValue("afk", setting)
	});

```


### game.playerListStatus.changePosition

Change the key position.

<details><summary>parameters</summary>

key: `string` the registered key

element: `game.playerListStatus.positions` the position to show the key
</details>

```js
	game.settings.register(moduleName, "afkIconPosition", {
		name: game.i18n.localize("PLAYER-STATUS.afk.iconPosition"),
		scope: 'world',
		config: true,
		choices: {
            PLAYERLIST.POSITIONS.BEFORE_ONLINE_STATUS: game.i18n.localize("PLAYER-STATUS.iconPosition.beforeOnline"),
            PLAYERLIST.POSITIONS.BEFORE_PLAYERNAME: game.i18n.localize("PLAYER-STATUS.iconPosition.afterOnline"),
            PLAYERLIST.POSITIONS.AFTER_PLAYERNAME: game.i18n.localize("PLAYER-STATUS.iconPosition.afterName")
		},
		type: Symbol,
		default: PLAYERLIST.POSITIONS.AFTER_PLAYERNAME,
		onChange: setting => game.playerListStatus.changePosition("afk", setting)
	});

```


### game.playerListStatus.removeKey

Remove a key

<details><summary>parameters</summary>

key: `string` the registered key
</details>
