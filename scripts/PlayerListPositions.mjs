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

/**
 * Shared warning for deprecated BEFORE_ONLINE_STATUS behavior on Foundry V13+.
 */
export const WARN_BEFORE_ONLINE_STATUS = "playerListStatus: POSITIONS.BEFORE_ONLINE_STATUS is deprecated on Foundry V13+. It cannot precede the CSS ::before online indicator; content will be inserted at the start of the row (visually after the dot). Use BEFORE_PLAYERNAME instead.";
