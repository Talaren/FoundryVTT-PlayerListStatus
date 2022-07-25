- [FoundryVTT Library: PlayerList Status](#foundryvtt-library--playerlist-status)
  * [Include as a dependency in your manifest](#include-as-a-dependency-in-your-manifest)
    + [Foundry V10](#foundry-v10)
    + [Foundry V9](#foundry-v9)
  * [Usage](#usage)
    + [register key](#register-key)
      - [default options](#default-options)
      - [with options](#with-options)
    + [api access after key registration](#api-access-after-key-registration)
      - [on](#on)
      - [off](#off)
      - [status](#status)
      - [changeValue](#changevalue)
      - [changePosition](#changeposition)
      - [removeKey](#removekey)

![](https://img.shields.io/badge/Foundry-9.269-ready)

![](https://img.shields.io/badge/Foundry-10.275-ready)

# FoundryVTT Library: PlayerList Status

Allow modules to show text or icon in the playerlist.

## Include as a dependency in your manifest

### Foundry V10

```json
	"relationships": {
		"requires": [
			{
				"id": "playerListStatus",
				"type": "module",
				"manifest": "https://github.com/Talaren/FoundryVTT-PlayerListStatus/releases/latest/download/module.json",
				"compatibility": {
					"verified": "2.0.0"
				}
			}
		]
	}
```

### Foundry V9

```json
	"dependencies": [
		{
			"name": "playerListStatus",
			"type": "module",
			"manifest": "https://github.com/Talaren/FoundryVTT-PlayerListStatus/releases/latest/download/module.json"
		}
	]
```

## Usage

### register key

#### default options

key: `string' the registered key

element: `string` or `HTMLElement` the element to show

return: `boolean` is the registration successful
.

```js
Hooks.once('playerListStatusReady', function() {
		let success = game.playerListStatus.registerKey("afk", "💤");
});

```


#### with options

resetFlags: After Login or Reload should the active flags reset to inactive?

override: When the key is set from another module override the setting?

position: where should the text shown, default is after username.

`game.playerListStatus.options.beforeOnlineStatus`

`game.playerListStatus.options.beforePlayername`

`game.playerListStatus.options.afterPlayername`


```js
Hooks.once('playerListStatusReady', function() {
		let options = {
			resetFlags: true,
			override: false,
			position: game.playerListStatus.positions.beforeOnlineStatus
		}
		let success = game.playerListStatus.registerKey("afk", "💤", options);
});

```

### api access after key registration


#### on

Set the flag and show the key


key: `string' the registered key

id: (optional) `string` a user id


#### off

Remove the flag and hide the key


key: `string' the registered key

id: (optional) `string` a user id


#### status

Returns is the


key: `string' the registered key


id: (optional) `string` a user id

return: 'boolean' is key active?


#### changeValue

Change the element to show


key: `string' the registered key

element: `string` or `HTMLElement` the element to show



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
		onChange: setting => game.playerListStatus.changeValue(setting)
	});

```


#### changePosition

Change the key position.


key: `string' the registered key

element: `game.playerListStatus.positions` the position to show the key



```js
	game.settings.register(moduleName, "afkIconPosition", {
		name: game.i18n.localize("PLAYER-STATUS.afk.iconPosition"),
		scope: 'world',
		config: true,
		choices: {
			game.playerListStatus.options.beforeOnlineStatus: game.i18n.localize("PLAYER-STATUS.iconPosition.beforeOnline"),
			game.playerListStatus.options.beforePlayername: game.i18n.localize("PLAYER-STATUS.iconPosition.afterOnline"),
			game.playerListStatus.options.afterPlayername: game.i18n.localize("PLAYER-STATUS.iconPosition.afterName")
		},
		type: String,
		default: game.playerListStatus.options.afterPlayername,
		onChange: setting => game.playerListStatus.changePosition(setting)
	});

```


#### removeKey

Remove a key

key: `string' the registered key
