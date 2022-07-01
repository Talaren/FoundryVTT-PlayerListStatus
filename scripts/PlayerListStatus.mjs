export default class PlayerListStatus {
    constructor() {
        this.moduleName = "playerListStatus";
    }

    addStatusBeforeOnlineStatus(id, key, element) {
        this.addStatus(id, "beforeOnlineStatus", key, element);
    }

    removeStatusBeforeOnlineStatus(id, key) {
        this.removeStatus(id, "beforeOnlineStatus", key);
    }

    addStatusBeforePlayername(id, key, element) {
        this.addStatus(id, "beforePlayername", key, element);
    }

    removeStatusBeforePlayername(id, key) {
        this.removeStatus(id, "beforePlayername", key);
    }

    addStatusAfterPlayername(id, key, element) {
        this.addStatus(id, "afterPlayername", key, element);
    }

    removeStatusAfterPlayername(id, key) {
        this.removeStatus(id, "afterPlayername", key);
    }

    isStatusActiv(id, key) {
        let user = this.getUser(id);
        if (typeof user !== "undefined") {
            let beforeOnlineStatus = user.getFlag(this.moduleName, "beforeOnlineStatus");
            let beforePlayername = user.getFlag(this.moduleName, "beforePlayername");
            let afterPlayername = user.getFlag(this.moduleName, "afterPlayername");
            if (typeof beforeOnlineStatus !== "undefined" && beforeOnlineStatus !== null) {
                return new Map(Object.entries(beforeOnlineStatus)).has(key);
            }
            if (typeof beforePlayername !== "undefined" && beforePlayername !== null) {
                return new Map(Object.entries(beforePlayername)).has(key);
            }
            if (typeof afterPlayername !== "undefined" && afterPlayername !== null) {
                return new Map(Object.entries(afterPlayername)).has(key);
            }
        }
        return false;
    }

    addStatus(id, list, key, element) {
        let user = this.getUser(id);
        if (typeof user !== "undefined") {
			let elementList = new Map();
			elementList.set(key, element);
            console.debug(user.setFlag(this.moduleName, list, Object.fromEntries(elementList)));
        }
    }

    removeStatus(id, list, key) {
        let user = this.getUser(id);
        if (typeof user !== "undefined") {
            console.debug(user.unsetFlag(this.moduleName, list + "." + key));
        }
    }

    getUser(id) {
        if (id === game.user.id) {
            return game.user;
        } else {
            return game.users.get(id);
        }
    }

    render(playerList, html) {
        for (let user of game.users) {
            let buttonPlacement = html.find(`[data-user-id="${user.id}"]`);
            let children = buttonPlacement.children();
            if (children.length === 0) {
                //Is Offline User
                continue;
            }
            let playerName = undefined;
            let playerActive = undefined;
            for (let child of children) {
                if (child.classList.contains("player-name")) {
                    playerName = child;
                } else if (child.classList.contains("player-active")) {
                    playerActive = child;
                }
            }
            if (typeof playerName === 'undefined' || typeof playerActive === 'undefined') {
                continue;
            }
            playerName.style.flex = 'auto';
            let flag = user.data.flags["playerListStatus"];
            if (typeof flag === 'undefined') {
                continue;
            }
            let beforeOnlineStatus = flag["beforeOnlineStatus"];
            let beforePlayername = flag["beforePlayername"];
            let afterPlayername = flag["afterPlayername"];
            if (typeof beforeOnlineStatus !== "undefined" && beforeOnlineStatus !== null) {
                for (let [key, value] of new Map(Object.entries(beforeOnlineStatus))) {
                    if (value instanceof HTMLElement) {
                        buttonPlacement[0].insertBefore(value, playerActive);
                    } else {
                        let valueElement = document.createElement('span');
                        valueElement.textContent = value;
                        buttonPlacement[0].insertBefore(valueElement, playerActive);
                    }
                }
            }
            if (typeof beforePlayername !== "undefined" && beforePlayername !== null) {
                for (let [key, value] of new Map(Object.entries(beforePlayername))) {
                    if (value instanceof HTMLElement) {
                        buttonPlacement[0].insertBefore(value, playerName);
                    } else {
                        let valueElement = document.createElement('span');
                        valueElement.textContent = value;
                        buttonPlacement[0].insertBefore(valueElement, playerName);
                    }
                }
            }
            if (typeof afterPlayername !== "undefined" && afterPlayername !== null) {
                for (let [key, value] of new Map(Object.entries(afterPlayername))) {
                    if (value instanceof HTMLElement) {
                        buttonPlacement[0].appendChild(value);
                    } else {
                        let valueElement = document.createElement('span');
                        valueElement.textContent = value;
                        buttonPlacement[0].appendChild(valueElement);
                    }
                }
            }
        }
    }
}
