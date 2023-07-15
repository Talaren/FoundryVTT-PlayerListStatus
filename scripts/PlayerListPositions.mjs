/** @module PlayerListPositions */

// noinspection JSUnusedGlobalSymbols
/**
 * @readonly
 * @type {{BEFORE_PLAYERNAME: Object, AFTER_PLAYERNAME: Object, BEFORE_ONLINE_STATUS: Object}}
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