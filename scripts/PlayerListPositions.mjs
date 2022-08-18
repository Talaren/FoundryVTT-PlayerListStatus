/** @module PlayerListPositions */

// noinspection JSUnusedGlobalSymbols
/**
 * @readonly
 * @type {{BEFORE_PLAYERNAME: symbol, AFTER_PLAYERNAME: symbol, BEFORE_ONLINE_STATUS: symbol}}
 */
export const POSITIONS = Object.freeze({
    /**
     * beforeOnlineStatus: symbol
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