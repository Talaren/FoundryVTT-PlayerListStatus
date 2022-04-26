Hooks.on('renderPlayerList', (playerList, html) => {
    for (let user of game.users) {
        const buttonPlacement = html.find(`[data-user-id="${user.id}"]`);
        const children = buttonPlacement.children();
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
        const bos = PlayerListStatus.users.get(user.name);
        if (typeof bos !== "undefined") {
            if (bos.beforeOnlineStatus.size > 0) {
                for (let [key, value] of bos.beforeOnlineStatus) {
                    if (value instanceof HTMLElement) {
                        buttonPlacement[0].insertBefore(value, playerActive);
                    } else {
                        let valueElement = document.createElement('span');
                        valueElement.textContent = value;
                        buttonPlacement[0].insertBefore(valueElement, playerActive);
                    }
                }
            }
            if (bos.beforePlayername.size > 0) {
                for (let [key, value] of bos.beforePlayername) {
                    if (value instanceof HTMLElement) {
                        buttonPlacement[0].insertBefore(value, playerName);
                    } else {
                        let valueElement = document.createElement('span');
                        valueElement.textContent = value;
                        buttonPlacement[0].insertBefore(valueElement, playerName);
                    }
                }
            }
            if (bos.afterPlayername.size > 0) {
                for (let [key, value] of bos.afterPlayername) {
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
})

Hooks.once('init', () => {
    PlayerListStatus.initialize();
    game.socket.on('module.playerListStatus', (playerListStatus, userid) => {
        switch (playerListStatus.action) {
        case "add":
            switch (playerListStatus.where) {
            case "beforeOnlineStatus":
                PlayerListStatus.addStatusBeforeOnlineStatus(playerListStatus.username, playerListStatus.key, playerListStatus.element);
                break;
            case "beforePlayername":
                PlayerListStatus.addStatusBeforePlayername(playerListStatus.username, playerListStatus.key, playerListStatus.element);
                break;
            case "afterPlayername":
                PlayerListStatus.addStatusAfterPlayername(playerListStatus.username, playerListStatus.key, playerListStatus.element);
                break;
            }
            break;
        case "remove":
            switch (playerListStatus.where) {
            case "beforeOnlineStatus":
                PlayerListStatus.removeStatusBeforeOnlineStatus(playerListStatus.username, playerListStatus.key, playerListStatus.element);
                break;
            case "beforePlayername":
                PlayerListStatus.removeStatusBeforePlayername(playerListStatus.username, playerListStatus.key, playerListStatus.element);
                break;
            case "afterPlayername":
                PlayerListStatus.removeStatusAfterPlayername(playerListStatus.username, playerListStatus.key, playerListStatus.element);
                break;
            }
            break;
        }
    });
})

class PlayerListStatus {
    static initialize() {
        this.users = new Map();
    }

    static addStatusBeforeOnlineStatus(username, key, element) {
        this.addUsername(username);
        this.users.get(username).beforeOnlineStatus.set(key, element);
        if (game.user.data.name === username) {
            socket.emit('module.playerListStatus', new PlayerListStatusEvent('add', 'beforeOnlineStatus', username, key, element));
        }
        game.users.render();
    }

    static removeStatusBeforeOnlineStatus(username, key) {
        if (typeof this.users.get(username) !== 'undefined') {
            this.users.get(username).beforeOnlineStatus.delete(key);
            if (game.user.data.name === username) {
                socket.emit('module.playerListStatus', new PlayerListStatusEvent('remove', 'beforeOnlineStatus', username, key, null));
            }

        }
        game.users.render();
    }

    static addStatusBeforePlayername(username, key, element) {
        this.addUsername(username);
        this.users.get(username).beforePlayername.set(key, element);
        if (game.user.data.name === username) {
            socket.emit('module.playerListStatus', new PlayerListStatusEvent('add', 'beforePlayername', username, key, element));
        }
        game.users.render();
    }

    static removeStatusBeforePlayername(username, key) {
        if (typeof this.users.get(username) !== 'undefined') {
            this.users.get(username).beforePlayername.delete(key);
            if (game.user.data.name === username) {
                socket.emit('module.playerListStatus', new PlayerListStatusEvent('remove', 'beforePlayername', username, key, null));
            }

        }
        game.users.render();
    }

    static addStatusAfterPlayername(username, key, element) {
        this.addUsername(username);
        this.users.get(username).afterPlayername.set(key, element);
        if (game.user.data.name === username) {
            socket.emit('module.playerListStatus', new PlayerListStatusEvent('add', 'afterPlayername', username, key, element));
        }
        game.users.render();
    }

    static removeStatusAfterPlayername(username, key) {
        if (typeof this.users.get(username) !== 'undefined') {
            this.users.get(username).afterPlayername.delete(key);
            if (game.user.data.name === username) {
                socket.emit('module.playerListStatus', new PlayerListStatusEvent('remove', 'afterPlayername', username, key, null));
            }

        }
        game.users.render();
    }

    static addUsername(username) {
        if (typeof this.users.get(username) === 'undefined') {
            this.users.set(username, new UserStatus());
        }
    }

    static deleteStatus(username) {
        this.users.delete(username);
        game.users.render();
    }
}

class PlayerListStatusEvent {
    constructor(action, where, username, key, element) {
        this.action = action;
        this.where = where;
        this.username = username;
        this.key = key;
        this.element = element;
    }
}

class UserStatus {
    constructor() {
        this.beforeOnlineStatus = new Map();
        this.beforePlayername = new Map();
        this.afterPlayername = new Map();
    }
}
