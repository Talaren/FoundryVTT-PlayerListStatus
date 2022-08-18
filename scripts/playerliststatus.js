import * as PLAYERLIST from "./PlayerListPositions.mjs";
import PlayerListRegistry from "./PlayerListRegistry.mjs";
import PlayerListStatus from "./PlayerListStatus.mjs";

globalThis.PLAYERLIST = PLAYERLIST;

let playerListRegistry = new PlayerListRegistry();
Hooks.once("init", () => {
    Hooks.callAll("playerListStatusInit", playerListRegistry);
})

Hooks.once('ready', () => {
    Game.prototype.playerListStatus = new PlayerListStatus(playerListRegistry);

    Hooks.on('renderPlayerList', (foundry, html, data) => {
        game.playerListStatus.render(foundry, html, data);
    });
    Hooks.callAll("playerListStatusReady", game.playerListStatus);
})
