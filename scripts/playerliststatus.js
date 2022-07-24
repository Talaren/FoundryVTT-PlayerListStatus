import PlayerListStatus from "./PlayerListStatus.mjs";

Hooks.once('ready', () => {
	let playerListStatus = new PlayerListStatus();
	game.playerListStatus = playerListStatus;

	Hooks.on('renderPlayerList', (playerList, html) => {
		game.playerListStatus.render(playerList, html);
	});
	Hooks.callAll("playerListStatusReady", playerListStatus);
})
