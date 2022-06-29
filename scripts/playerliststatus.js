import PlayerListStatus from "./PlayerListStatus.mjs";

Hooks.on('renderPlayerList', (playerList, html) => {
    game.playerListStatus.render(playerList, html);
});

Hooks.once('init', () => {
    let playerListStatus = new PlayerListStatus();
    game.playerListStatus = playerListStatus;
})
