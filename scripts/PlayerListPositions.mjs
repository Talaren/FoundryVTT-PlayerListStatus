/** @module PlayerListPositions */

// noinspection JSUnusedGlobalSymbols
/**
 * @readonly
 * @type {{BEFORE_PLAYERNAME: Object, AFTER_PLAYERNAME: Object, BEFORE_ONLINE_STATUS: Object}}
 */
export const POSITIONS = Object.freeze({
    /**
     * beforeOnlineStatus: symbol
     * @deprecated Deprecated for Foundry V13+. The online indicator is rendered via CSS ::before,
     * so content cannot be placed visually before it. Use BEFORE_PLAYERNAME instead.
     */
    BEFORE_ONLINE_STATUS: Symbol("beforeOnlineStatus"),
    /**
     * beforePlayername: symbol
     */
    BEFORE_PLAYERNAME: Symbol("beforePlayername"),
    /**
     * afterPlayername: symbol
     */
    AFTER_PLAYERNAME: Symbol("afterPlayername")
});
