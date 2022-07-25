export default class PlayerListStatus {

	#moduleName = "playerListStatus";
	positions = {
		beforeOnlineStatus: "beforeOnlineStatus",
		beforePlayername: "beforePlayername",
		afterPlayername: "afterPlayername"
	}
	#registeredKeys = new Map();
	#defaultOptions = {
		resetFlags: true,
		override: false,
		position: this.positions.afterPlayername
	}

	constructor() {
		Object.freeze(this.positions);
	}

	registerKey(key, element, options = this.#defaultOptions) {
		if (typeof key == 'undefined') {
			console.error("no key")
			return false;
		}
		if (typeof key == 'undefined') {
			console.error("no element");
			return false;
		}
		if (!options.override && this.#registeredKeys.has(key)) {
			console.warn("Key is set, but not override is not set");
			return false;
		}
		this.#registeredKeys.set(key, { value: element, position: options.position });
		if (options.resetFlags) {
			this.#removeFlag(key, game.user, this.positions.beforeOnlineStatus);
			this.#removeFlag(key, game.user, this.positions.beforePlayername);
			this.#removeFlag(key, game.user, this.positions.afterPlayername);
		}
		return true;
	}

	removeKey(key) {
		off(key);
		this.#registeredKeys.delete(key);
	}

	on(key, id) {
		if (!this.#registeredKeys.has(key)) {
			console.error("Register Key for on!");
			return false;
		}
		let user = this.#getUser(id);
		if (typeof user !== "undefined") {
			let elementList = new Map();
			elementList.set(key, this.#registeredKeys.get(key).value);
			this.#setFlag(key, user, elementList);
			return true;
		}
		return false;
	}

	off(key, id) {
		if (!this.#registeredKeys.has(key)) {
			console.error("Register Key for on!");
			return false;
		}
		let user = this.#getUser(id);
		if (typeof user !== "undefined") {
			this.#removeFlag(key, user);
			return true;
		}
		return false;
	}

	status(key, id) {
		if (!this.#registeredKeys.has(key)) {
			console.error("Register Key for status!");
			return false;
		}
		let user = this.#getUser(id);
		let flags = user.getFlag(this.#moduleName, this.#registeredKeys.get(key).position);
		if (typeof flags == 'undefined') {
			return false
		}
		return new Map(Object.entries(flags)).has(key);
	}

	changeValue(key, element) {
		this.#registeredKeys.get(key).value = element;
		this.on(key);
	}

	changePosition(key, position) {
		let active = this.status(key);
		this.off(key);
		this.#registeredKeys.get(key).position = position;
		if (active) {
			this.on(key);
		}
	}

	#removeFlag(key, user) {
		let elementList = new Map();
		elementList.set("-=" + key, null);
		this.#setFlag(key, user, elementList)
	}

	#getUser(id) {
		if (typeof id == 'undefined') {
			return game.user;
		}
		if (id === game.user.id) {
			return game.user;
		} else {
			return game.users.get(id);
		}
	}

	#setFlag(key, user, elementList) {
		if (parseInt(game.version) == 9) {
			this.#setFlagAsync(key, user, elementList)
		} else {
			user.setFlag(this.#moduleName, this.#registeredKeys.get(key).position, Object.fromEntries(elementList));
		}
	}

	/* Workaround for Foundry V9 */
	async #setFlagAsync(key, user, elementList) {
		console.debug(await user.setFlag(this.#moduleName, this.#registeredKeys.get(key).position, Object.fromEntries(elementList)));
	}

	render(playerList, html) {
		let root = getComputedStyle(document.querySelector(":root"));
		let width = parseInt(root.getPropertyValue("--players-width").replace("px", ""));
		let maxWidth = 0;
		for (let user of playerList.getData().users) {
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
			if (parseInt(game.version) == 9) {
				flag = user.data.flags["playerListStatus"];
			} else {
				flag = user.flags["playerListStatus"];
			}

			if (typeof flag === 'undefined') {
				continue;
			}
			let beforeOnlineStatus = flag[this.positions.beforeOnlineStatus];
			let beforePlayername = flag[this.positions.beforePlayername];
			let afterPlayername = flag[this.positions.afterPlayername];
			if (typeof beforeOnlineStatus !== "undefined" && beforeOnlineStatus !== null) {
				for (let [key, value] of new Map(Object.entries(beforeOnlineStatus))) {
					if (value instanceof HTMLElement) {
						currentWidth += value.offsetWidth;
						buttonPlacement[0].insertBefore(value, playerActive);
					} else {
						currentWidth += value.length;
						let valueElement = document.createElement('span');
						valueElement.style.flex = "0 0 auto";
						valueElement.textContent = value;
						valueElement.id = key;
						buttonPlacement[0].insertBefore(valueElement, playerActive);
					}
				}
			}
			if (typeof beforePlayername !== "undefined" && beforePlayername !== null) {
				for (let [key, value] of new Map(Object.entries(beforePlayername))) {
					if (value instanceof HTMLElement) {
						currentWidth += value.offsetWidth;
						buttonPlacement[0].insertBefore(value, playerName);
					} else {
						currentWidth += value.length;
						let valueElement = document.createElement('span');
						valueElement.style.flex = "0 0 auto";
						valueElement.textContent = value;
						valueElement.id = key;
						buttonPlacement[0].insertBefore(valueElement, playerName);
					}
				}
			}
			if (typeof afterPlayername !== "undefined" && afterPlayername !== null) {
				for (let [key, value] of new Map(Object.entries(afterPlayername))) {
					if (value instanceof HTMLElement) {
						currentWidth += value.offsetWidth;
						buttonPlacement[0].appendChild(value);
					} else {
						currentWidth += value.length;
						let valueElement = document.createElement('span');
						valueElement.style.flex = "0 0 auto";
						valueElement.textContent = value;
						valueElement.id = key;
						playerName.append(valueElement);
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
