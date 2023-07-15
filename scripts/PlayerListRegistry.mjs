/** @module PlayerListRegistry */

export default class PlayerListRegistry {
    #registeredKeys = new Map();
    #defaultOptions = {
        resetFlags: true, override: false, position: PLAYERLIST.POSITIONS.AFTER_PLAYERNAME
    }
    #toReset = new Set();

    /**
     * register a key for use
     *
     * @param {string} key the key to register
     * @param {string|HTMLElement} element
     * @param {{resetFlags: boolean, override: boolean, position: Object}} options
     * @returns {boolean} is key successful registered
     */
    registerKey(key, element, options = this.#defaultOptions) {
        if (typeof key == 'undefined') {
            console.error("no key")
            return false;
        }
        if (typeof element == 'undefined') {
            console.error("no element");
            return false;
        }
        if (typeof options == 'undefined') {
            options = this.#defaultOptions;
        }
        if (typeof options.resetFlags == 'undefined') {
            options.resetFlags = this.#defaultOptions.resetFlags;
        }
        if (typeof options.override == 'undefined') {
            options.override = this.#defaultOptions.override;
        }
        if (typeof options.position == 'undefined') {
            options.position = this.#defaultOptions.position;
        }
        if (options.position !== PLAYERLIST.POSITIONS.BEFORE_ONLINE_STATUS && options.position !== PLAYERLIST.POSITIONS.BEFORE_PLAYERNAME && options.position !== PLAYERLIST.POSITIONS.AFTER_PLAYERNAME) {
            console.error("invalid position");
            return false;
        }
        if (!options.override && this.#registeredKeys.has(key)) {
            console.warn("Key is set, but not override is not set");
            return false;
        }
        this.#registeredKeys.set(key, {value: element, position: options.position});
        if (options.resetFlags) {
            this.#toReset.add(key);
        }
        return true;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * removes the key from the registry
     *
     * @param {string} key the key
     */
    removeKey(key) {
        this.#registeredKeys.delete(key);
    }

    /**
     * get the keys
     *
     * @returns {Map<string, any>}
     */
    getKeys() {
        return this.#registeredKeys;
    }

    /**
     * get the keys to reset
     *
     * @returns {IterableIterator<string>}
     */
    getToReset() {
        return this.#toReset.keys();
    }
}