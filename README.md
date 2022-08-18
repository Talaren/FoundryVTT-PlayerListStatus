![](https://img.shields.io/badge/Foundry-9.269-ready)
![](https://img.shields.io/badge/Foundry-10.277-ready)

# FoundryVTT Library: PlayerList Status

Allow modules to show text or icon in the playerlist.

* [Include as a dependency in your manifest](#include-as-a-dependency-in-your-manifest)
  + [Foundry V10](#foundry-v10)
  + [Foundry V9](#foundry-v9)
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


# Include as a dependency in your manifest

## Foundry V10

```json
	"relationships": {
		"requires": [
			{
				"id": "playerListStatus",
				"type": "module",
				"manifest": "https://github.com/Talaren/FoundryVTT-PlayerListStatus/releases/latest/download/module.json",
				"compatibility": {
					"verified": "2.0.5"
				}
			}
		]
	}
```

## Foundry V9

```json
	"dependencies": [
		{
			"name": "playerListStatus",
			"type": "module",
			"manifest": "https://github.com/Talaren/FoundryVTT-PlayerListStatus/releases/latest/download/module.json",
			"version": "2.0.5"
		}
	]
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
