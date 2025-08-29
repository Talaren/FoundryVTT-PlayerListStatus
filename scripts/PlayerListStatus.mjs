/** @module PlayerListStatus */

import PlayerListRegistry from "./PlayerListRegistry.mjs";

export default class PlayerListStatus {

    #moduleName = "playerListStatus";
    #registry = new PlayerListRegistry();
    #warnedBeforeOnlineV13 = false;

    /**
     *
     * @param {PlayerListRegistry} registry the registry
     * @private constructor
     */
    constructor(registry) {
        if (typeof registry === "undefined") {
            return;
        }
        this.#registry = registry;
        for (let key of this.#registry.getToReset()) {
            this.off(key);
        }
    }

    /**
     * Determine the running Foundry major version.
     * Extracts the first numeric sequence from `game.version` or
     * `game.release.version` to avoid parseInt quirks with prefixes/suffixes.
     * @returns {number}
     */
    #getMajorVersion() {
        try {
            const versionStr = game?.version ?? game?.release?.version ?? "";
            const match = versionStr.match(/\d+/);
            const v = match ? parseInt(match[0], 10) : 0;
            return Number.isNaN(v) ? 0 : v;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Show the key
     * optional set the user
     *
     * @param {string} key the key
     * @param {User} user the user
     * @returns {boolean} was successful?
     */
    on(key, user = game.user) {
        if (!this.#registry.getKeys().has(key)) {
            console.error("Register Key for on!");
            return false;
        }
        if (typeof user !== "undefined") {
            let elementList = new Map();
            elementList.set(key, this.#registry.getKeys().get(key).value);
            this.#setFlag(key, user, elementList);
            return true;
        }
        return false;
    }

    /**
     * Hide the key
     * optional set the user
     *
     * @param {string} key the key
     * @param {User} user the user
     * @returns {boolean}
     */
    off(key, user = game.user) {
        if (!this.#registry.getKeys().has(key)) {
            console.error("Register Key for on!");
            return false;
        }
        if (typeof user !== "undefined") {
            this.#removeFlag(key, user);
            return true;
        }
        return false;
    }

    /**
     * Get the status from the key
     *
     * @param {string} key the key
     * @param {User} user the user
     * @returns {boolean}
     */
    status(key, user = game.user) {
        if (!this.#registry.getKeys().has(key)) {
            console.error("Register Key for status!");
            return false;
        }
        let flags = user.getFlag(this.#moduleName, this.#registry.getKeys().get(key).position.description);
        if (typeof flags == 'undefined') {
            return false
        }
        return new Map(Object.entries(flags)).has(key);
    }

    /**
     * Is the key active?
     *
     * @param {string} key the key
     * @returns {boolean} is active?
     */
    // noinspection JSUnusedGlobalSymbols
    isRegistered(key) {
        return this.#registry.getKeys().has(key);
    }

    /**
     * Change the showed value from key
     *
     * @param {string} key the key
     * @param {string|HTMLElement} element element to show
     */
    changeValue(key, element) {
        this.#registry.getKeys().get(key).value = element;
        this.on(key);
    }

    /**
     * Change the showed position
     *
     * @param {string} key the key
     * @param {Object} position the show position values get from this.
     */
    changePosition(key, position = PLAYERLIST.POSITIONS.AFTER_PLAYERNAME) {
        let active = this.status(key);
        this.off(key);
        this.#registry.getKeys().get(key).position = position;
        if (active) {
            this.on(key);
        }
    }

    /**
     * Removes the Flag
     *
     * @param {string} key the key
     * @param {User} user the user
     */
    #removeFlag(key, user = game.user) {
        let elementList = new Map();
        elementList.set("-=" + key, null);
        this.#setFlag(key, user, elementList)
    }

    /**
     * Set the Flag on User
     *
     * @param {string} key the key
     * @param {User} user a user
     * @param {Map} elementList the element list
     */
    #setFlag(key, user, elementList) {
        user.setFlag(this.#moduleName, this.#registry.getKeys().get(key).position.description, Object.fromEntries(elementList)).then(null, error => console.error(error));
    }

    /**
     * Insert an element or a string value at a specific position
     *
     * @param {HTMLElement} container The container to insert the value to
     * @param {HTMLElement} referenceNode The reference node to insert before
     * @param {string|HTMLElement} value The value to insert
     * @param {string} key The key for the inserted element
     */
    #insertValue(container, referenceNode, value, key) {
        if (value instanceof HTMLElement) {
            container.insertBefore(value, referenceNode);
        } else if (typeof value === 'string') {
            let valueElement = document.createElement('span');
            valueElement.style.flex = "0 0 auto";
            valueElement.textContent = value;
            valueElement.id = key;
            container.insertBefore(valueElement, referenceNode);
        } else {
            console.error("Unknown Type")
        }
    }

    render(foundry, html, options) {
        // Compute base width when available (v12); v13 may not expose this var.
        let width = 0;
        try {
            let root = getComputedStyle(document.querySelector(":root"));
            width = parseInt((root.getPropertyValue("--players-width") || "0").replace("px", "")) || 0;
        } catch (e) { /* ignore */ }

        let maxWidth = 0;
        const major = this.#getMajorVersion();

        const users = (options && options.users) || game.users?.contents || game.users;
        for (let user of users) {
            const userid = user.id || user._id;
            const row = this.#findRow(html, userid);
            if (!row) continue;

            const anchors = this.#findAnchors(row, major);
            if (!anchors.nameEl) continue; // cannot reliably place without a name element

            const flag = (user.flags && user.flags["playerListStatus"]) || (user.data?.flags && user.data.flags["playerListStatus"]);
            if (typeof flag === 'undefined') continue;
            let afkPresent = false;

            const beforeOnlineStatus = flag[PLAYERLIST.POSITIONS.BEFORE_ONLINE_STATUS.description];
            const beforePlayername = flag[PLAYERLIST.POSITIONS.BEFORE_PLAYERNAME.description];
            const afterPlayername = flag[PLAYERLIST.POSITIONS.AFTER_PLAYERNAME.description];

            if (beforeOnlineStatus) {
                if (major >= 13 && !this.#warnedBeforeOnlineV13) {
                    console.warn(PLAYERLIST.WARN_BEFORE_ONLINE_STATUS);
                    this.#warnedBeforeOnlineV13 = true;
                }
                for (let [key, value] of new Map(Object.entries(beforeOnlineStatus))) {
                    if (this.#shouldSkipRenderForKey(major, key)) { afkPresent = true; continue; }
                    maxWidth = this.#updateMaxWidth(maxWidth, value);
                    // v13: there is no inline status icon; insert at row start
                    // v12: if a status/indicator anchor exists, place before it
                    const reference = anchors.statusEl || row.firstChild;
                    this.#insertValue(row, reference, value, this.#keyId(key, userid));
                }
            }
            if (beforePlayername) {
                for (let [key, value] of new Map(Object.entries(beforePlayername))) {
                    if (this.#shouldSkipRenderForKey(major, key)) { afkPresent = true; continue; }
                    maxWidth = this.#updateMaxWidth(maxWidth, value);
                    this.#insertValue(row, anchors.nameEl, value, this.#keyId(key, userid));
                }
            }
            if (afterPlayername) {
                for (let [key, value] of new Map(Object.entries(afterPlayername))) {
                    if (this.#shouldSkipRenderForKey(major, key)) { afkPresent = true; continue; }
                    maxWidth = this.#updateMaxWidth(maxWidth, value);
                    // Append after the name element
                    this.#insertAfter(anchors.nameEl, value, this.#keyId(key, userid));
                }
            }

            // Mirror AFK to core-style "idle" class in V13. Do not affect other keys.
            if (major >= 13) {
                row.classList.toggle("idle", !!afkPresent);
            }
        }

        if (maxWidth > 0 && width > 0) {
            html[0].style.width = (width + maxWidth) + "px";
        }
    }

    /**
     * Measures the width of a string in pixels when rendered in the given font.
     *
     * @param {string} text The text to measure.
     * @param {string} font The CSS font declaration (e.g., "16px Arial").
     * @returns {number} The width of the text in pixels.
     */
    #measureTextWidth(text, font) {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        context.font = font;
        return context.measureText(text).width;
    }

    /**
     * Update the maximum width if the given value's width is larger
     *
     * @param {number} maxWidth The current maximum width
     * @param {string|HTMLElement} value The value to check the width of
     * @returns {number} The updated maximum width
     */
    #updateMaxWidth(maxWidth, value) {
        let width;
        if (value instanceof HTMLElement) {
            width = value.offsetWidth;
        } else if (typeof value === 'string') {
            width = this.#measureTextWidth(value, "14px Arial");
        }
        return Math.max(maxWidth, width);
    }

    /**
     * Find the row element for the given user id within the rendered html
     */
    #findRow(html, userid) {
        const root = html[0] || html;
        return (
            root.querySelector?.(`[data-user-id="${userid}"]`) ||
            root.querySelector?.(`[data-user='${userid}']`) ||
            null
        );
    }

    /**
     * Find anchors for status and name elements.
     * V13 DOM from user: li.player > span.player-name. No inline status node.
     * V12 DOM: varies; try legacy selectors.
     */
    #findAnchors(row, major) {
        let nameEl = null;
        let statusEl = null;
        if (major >= 13) {
            nameEl = row.querySelector?.("span.player-name");
            // No dedicated status element in V13 rows; keep null to insert at start when needed.
            statusEl = null;
        }
        if (!nameEl) {
            // Fallbacks for v12 and themed installs
            nameEl = row.querySelector?.(
                ".player-name, .user-name, .name, [data-element='user-name'], [data-role='user-name'], h4, .username"
            );
        }
        if (major < 13) {
            statusEl = row.querySelector?.(
                ".player-active, .player-inactive, .status, [data-role='status']"
            ) || statusEl;
        }
        return { nameEl, statusEl };
    }

    /**
     * Insert node/value right after a reference node
     */
    #insertAfter(referenceNode, value, key) {
        const container = referenceNode.parentNode;
        if (!container) return;
        const next = referenceNode.nextSibling;
        this.#insertValue(container, next, value, key);
    }

    /**
     * Compose a unique element id per user/key
     */
    #keyId(key, userid) {
        return `pls-${key}-${userid}`;
    }

    /**
     * Should rendering be skipped for this key at this version? (e.g., AFK on V13)
     * @param {number} major
     * @param {string} key
     * @returns {boolean}
     */
    #shouldSkipRenderForKey(major, key) {
        return major >= 13 && this.#isAfkKey(key);
    }

    /**
     * Is the provided key an AFK indicator (case-insensitive)?
     * @param {string} key
     * @returns {boolean}
     */
    #isAfkKey(key) {
        return key?.toString().toLowerCase() === "afk";
    }

    // No generic AFK fallback detection needed for V13 per project guidance.
}
