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

    // Foundry v12: PlayerList (ApplicationV1)
    Hooks.on('renderPlayerList', (app, html, data) => {
        game.playerListStatus.render(app, html, data);
    });
    // Foundry v13+: Users/User Management (ApplicationV2).
    Hooks.on('renderPlayers', (app, html, data) => {
        game.playerListStatus.render(app, html, data);
    });

    Hooks.callAll("playerListStatusReady", game.playerListStatus);
})
