/** @module PlayerListStatus */
// noinspection JSUnusedGlobalSymbols

import PlayerListRegistry from "./PlayerListRegistry.mjs";

export default class PlayerListStatus {

    #moduleName = "playerListStatus";
    #registry = new PlayerListRegistry();

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
     * @param {symbol} position the show position values get from this.
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

    render(foundry, html, options) {
        let root = getComputedStyle(document.querySelector(":root"));
        let width = parseInt(root.getPropertyValue("--players-width").replace("px", ""));
        let maxWidth = 0;
        for (let user of options.users) {
            /* V9 .id V10 ._id */
            let userid = (typeof user._id == 'undefined') ? user.id : user._id;
            let buttonPlacement = html.find(`[data-user-id="${userid}"]`);
            let currentWidth = 0;
            let children = buttonPlacement.children();
            let playerName = undefined;
            let playerActive = undefined;
            for (let child of children) {
                if (child.classList.contains("player-name")) {
                    playerName = child;
                } else if (child.classList.contains("player-active")) {
                    playerActive = child;
                } else if (child.classList.contains("player-inactive")) {
                    playerActive = child;
                }
            }
            if (typeof playerName === 'undefined' || typeof playerActive === 'undefined') {
                continue;
            }
            let flag
            if (parseInt(game.version) === 9) {
                flag = user.data.flags["playerListStatus"];
            } else {
                flag = user.flags["playerListStatus"];
            }

            if (typeof flag === 'undefined') {
                continue;
            }
            let beforeOnlineStatus = flag[PLAYERLIST.POSITIONS.BEFORE_ONLINE_STATUS.description];
            let beforePlayername = flag[PLAYERLIST.POSITIONS.BEFORE_PLAYERNAME.description];
            let afterPlayername = flag[PLAYERLIST.POSITIONS.AFTER_PLAYERNAME.description];
            if (typeof beforeOnlineStatus !== "undefined" && beforeOnlineStatus !== null) {
                for (let [key, value] of new Map(Object.entries(beforeOnlineStatus))) {
                    if (value instanceof HTMLElement) {
                        currentWidth += value.offsetWidth;
                        buttonPlacement[0].insertBefore(value, playerActive);
                    } else if (typeof value === 'string') {
                        currentWidth += value.length;
                        let valueElement = document.createElement('span');
                        valueElement.style.flex = "0 0 auto";
                        valueElement.textContent = value;
                        valueElement.id = key;
                        buttonPlacement[0].insertBefore(valueElement, playerActive);
                    } else {
                        console.error("Unknown Type")
                    }
                }
            }
            if (typeof beforePlayername !== "undefined" && beforePlayername !== null) {
                for (let [key, value] of new Map(Object.entries(beforePlayername))) {
                    if (value instanceof HTMLElement) {
                        currentWidth += value.offsetWidth;
                        buttonPlacement[0].insertBefore(value, playerName);
                    } else if (typeof value === 'string') {
                        currentWidth += value.length;
                        let valueElement = document.createElement('span');
                        valueElement.style.flex = "0 0 auto";
                        valueElement.textContent = value;
                        valueElement.id = key;
                        buttonPlacement[0].insertBefore(valueElement, playerName);
                    } else {
                        console.error("Unknown Type")
                    }
                }
            }
            if (typeof afterPlayername !== "undefined" && afterPlayername !== null) {
                for (let [key, value] of new Map(Object.entries(afterPlayername))) {
                    if (value instanceof HTMLElement) {
                        currentWidth += value.offsetWidth;
                        buttonPlacement[0].appendChild(value);
                    } else if (typeof value === 'string') {
                        currentWidth += value.length;
                        let valueElement = document.createElement('span');
                        valueElement.style.flex = "0 0 auto";
                        valueElement.textContent = value;
                        valueElement.id = key;
                        playerName.append(valueElement);
                    } else {
                        console.error("Unknown Type")
                    }
                }
            }
            if (currentWidth > maxWidth) {
                maxWidth = currentWidth;
            }

        }
        if (maxWidth > 0) {
            html[0].style.width = (width + maxWidth) + "px";
        }
    }
}
