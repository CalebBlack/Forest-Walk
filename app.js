function setCookie(cname, cvalue, exdays) {
    if (exdays != null) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    } else {
        document.cookie = cname + "=" + cvalue + ";path=/";

    }
}

function Monster(name, hp, attack, inventory) {
    this.name = name;
    this.hp = hp;
    this.att = attack;
    this.inventory = inventory || [];
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
var BattleManager = {
    player: {
        maxHP: 100,
        hp: 100,
        att: 4
    },
    checkLose: function () {
        if (this.player.hp <= 0) {
            log("You died!");
            game.lose();
        }
    },
    gameHeal: function (amount) {
        this.player.hp += amount;
        this.checkLose();
    },
    gameDamage: function (amount) {
        this.player.hp -= amount;
        this.checkLose();
    },
    heal: function (amount) {
        this.player.hp = Math.min(this.player.hp, this.player.maxHP);
    },
    active: false,
    opponent: null,
    battleRoom: null,
    canGameRun: function (input) {
        if (this.active) {
            this.action(input);
            return false;
        } else {
            return true;
        }
    },
    startBattle: function (monster,room) {
        this.opponent = monster;
        this.active = true;
        this.battleRoom = room;
        log("Battling " + monster.name + ", HP:" + monster.hp + " ATT:" + monster.att);
    },
    action: function (data) {
        var lower = data.trim().toLowerCase();
        if (lower === "run") {
            this.tryRun();
        } else if (lower === "status") {
            this.status();
        } else if (lower === "attack") {
            this.tryAttack();
            if (this.active) {
                this.enemyTurn();
            }
        } else {
            log("Invalid Battle Input: " + lower);
        }
    },
    checkOpponent: function () {
        if (this.opponent.hp <= 0) {
            this.win();
        } else {

        }
    },
    tryAttack: function () {
        this.attack();
    },
    attack: function () {
        this.opponent.hp -= this.player.att;
        log("You dealt " + this.player.att + " damage.");
        this.checkOpponent();
    },
    status: function () {
        if (this.opponent != null && this.opponent != undefined) {
            log("Your hp: " + this.player.hp + ", " + this.opponent.name + "'s hp: " + this.opponent.hp);
        } else {
            log("Your hp: " + this.player.hp);
        }
    },
    win: function () {
        log("You defeated " + this.opponent.name + ".");
        this.battleRoom.defeated(this.opponent.name);
        this.endBattle();
    },
    enemyTurn: function () {
        this.player.hp -= this.opponent.att;
        log(this.opponent.name + " dealt " + this.opponent.att + " damage.");
        this.checkLose();
    },
    tryRun: function () {
        if (randomBetween(0, Math.max(Math.round((this.opponent.att - this.player.att + 1) / 2), 0)) == 0) {
            this.run();
        } else {
            log("Failed to escape.");
            this.enemyTurn();
        }
    },
    run: function () {
        log("You ran away!");
        this.endBattle();
    },
    endBattle: function () {
        this.active = false;
        this.opponent = null;
    }
}

function log(data) {
    var text = document.createElement("p");
    text.innerHTML += data;
    output.appendChild(text);
    console.log(output.scrollHeight);
    output.scrollTop = output.scrollHeight;
    console.log(output.scrollTop);
}

function submitInput() {
    var inp = input.value;
    inp = inp.trim();
    input.value = "";
    if (inp != "") {
        handleInput(inp);
    }
}

function handleInput(inp) {
    game.handleInput(inp);
    lastInput = inp;
}

function clearOutput() {
    output.innerHTML = "";
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
//End of Functions
//Game Data
var Room = function (greetingIn) {
    this.greeting = greetingIn;
    this.enemies = [[], []];
    this.greet = function () {
        log(this.greeting);
        if (this.enemies[0].length > 0) {
            var out = "";
            for (var i = 0; i < this.enemies[0].length; i++) {
                if (out !== "") {
                    out += ", ";
                }
                out += this.enemies[0][i];
            }
            log("Monsters: " + out);
        }
    };
    this.defeated = function(enemyName) {
        var ind = this.enemies[0].indexOf(enemyName);
        if (ind > -1) {
            this.enemies[0].splice(ind,1);
            this.enemies[1].splice(ind,1);
        }
    }
    this.battle = function (enemyName) {
        var ind = this.enemies[0].indexOf(enemyName);
        if (ind > -1) {
            BattleManager.startBattle(this.enemies[1][ind],this);
            return true;
        } else {
            log("Enemy " + enemyName + " not found.");
            return false;
        }
    };
    this.addEnemy = function (enemy) {
        this.enemies[0].push(enemy.name);
        this.enemies[1].push(enemy);
    }
    this.inventory = [];
    this.itemAliases = {};
    this.itemMessages = {};
    this.pickUp = function (itemName) {
        var index = this.inventory.indexOf(itemName);
        if (index < 0) {
            if (this.itemAliases[itemName] != null) {
                index = this.inventory.indexOf(this.itemAliases[itemName]);
            }
        }
        if (index != -1) {
            var realItem = this.inventory[index];
            var message = "Picked up " + realItem + "!";
            if (this.itemMessages[realItem] != null) {
                message = this.itemMessages[realItem];
            }
            log(message);
            this.inventory.splice(index, 1);
            return realItem;
        } else {
            log(itemName + " not found.");
            return null;
        }
    }
    this.open = function (name) {
        log("There is nothing to open");
    };
    this.drop = function (name) {
        this.inventory.push(name);
        return true;
    }
}
var game = {
    won: false,
    lost: false,
    playerName: "",
    initialize: function () {
        log("Welcome to Forest Walk");
        log("Start? (yes/no)");
        input.value = "yes";
    },
    inventory: [],
    pickUp: function (item) {
        var room = this.getRoom();
        var result = room.pickUp(item);
        if (result != null && result != undefined) {
            this.obtainItem(result);
        }
    },
    obtainItem: function (item) {
        this.inventory.push(item);
        //log("Obtained "+item);
    },
    help: function () {
        log("Commands: Look, battle {name}, go (direction), inventory, pick up (name), clear, drop (name), eat (name), status");
    },
    position: {
        x: 6,
        y: 6
    },
    map: [new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13)],
    isStarted: false,
    drop: function (itemName) {
        var ind = this.inventory.indexOf(itemName);
        if (ind >= 0) {
            if (this.getRoom().drop(itemName)) {
                this.inventory.splice(ind, 1);
                log("Dropped " + itemName + "!");
            }
        } else {
            log("You do not have that item.");
        }
    },
    win: function () {
        if (!this.won && !this.lost) {
            this.won = true;
            alert("You Win!");
        }
    },
    lose: function () {
        if (!this.won && !this.lost) {
            this.lost = true;
            alert("You lose :(");
        }
    },
    handleInput: function (data) {
        if (!BattleManager.canGameRun(data)) {
            return;
        }
        data = data.trim();
        var lower = data.toLowerCase();
        var args = lower.split(" ");
        if (this.isStarted) {
            if (this.playerName === "") {
                if (lower !== "") {
                    this.playerName = data;
                    setCookie("name", data, null);
                    log("You wake up in a calm forest...<br>The air is fresh and full of life.");
                    this.look();
                } else {
                    log("Please enter a name.");
                }
                return true;
            }
            if (args[0] === "look") {
                this.look();
            } else if (args[0] === "eat") {
                if (args[1] != undefined && args[1].length > 0) {
                    this.eat(args[1]);
                } else {
                    log("Invalid Second Argument.");
                }
            } else if (args[0] === "status") {
                BattleManager.status();
            } else if (args[0] === "drop") {
                if (args[1] != undefined && args[1].length > 0) {
                    this.drop(args[1]);
                }
            } else if (args[0] === "go" || args[0] === "walk") {
                if (args[1] === "north" || args[1] === "up") {
                    //log("Going north.");
                    this.move("north");
                    this.look();
                } else if (args[1] == "south" || args[1] == "down") {
                    //log("Going south.");
                    this.move("south");
                    this.look();
                } else if (args[1] == "east" || args[1] == "right") {
                    //log("Going south.");
                    this.move("west");
                    this.look();
                } else if (args[1] == "west" || args[1] == "left") {
                    //log("Going west.");
                    this.move("west");
                    this.look();
                } else if (args[1] == "northeast") {
                    //log("Going west.");
                    this.move("northeast");
                    this.look();
                } else if (args[1] == "northwest") {
                    //log("Going west.");
                    this.move("west");
                    this.look();
                } else if (args[1] == "southeast") {
                    //log("Going west.");
                    this.move("southeast");
                    this.look();
                } else if (args[1] == "southwest") {
                    //log("Going west.");
                    this.move("southwest");
                    this.look();
                } else {
                    log("Invalid Direction: " + args[1]);
                }
            } else if (args[0] === "help") {
                this.help();
            } else if (args[0] === "inventory") {
                this.printInventory();
            } else if (args[0] === "pick" && args[1] === "up") {
                this.pickUp(args[2]);
            } else if (args[0] === "pick") {
                this.pickUp(args[1]);
            } else if (args[0] === "clear") {
                clearOutput();
                this.look();
            } else if (false) {

            } else if (args[0] === "battle") {
                this.getRoom().battle(args[1]);
            } else {
                var rand = randomBetween(0, 3);
                if (rand < 2) {
                    log("I don't understand...");
                } else if (rand == 2) {
                    log('You are confusing me 💔');
                } else {
                    log("Stop it :(");
                }
                this.help();
            }
        } else {
            if (lower == "yes") {
                this.isStarted = true;
                log("Please enter a name.");
                input.value = defaultName;
            } else if (lower == "no") {
                log("Okay, type yes when you are ready.");
            } else {
                log("Stop it :(");
            }
        }
    },
    eat: function (itemName) {
        var edibles = ["apples", "berries"];
        var hp = [10, -10];
        var ind = this.inventory.indexOf(itemName);
        if (ind >= 0) {
            if (edibles.indexOf(itemName) >= 0) {
                var health = hp[edibles.indexOf(itemName)];
                this.inventory.splice(ind, 1);
                if (health > 0) {
                    log("You ate the " + itemName + ", restoring " + health + " hp.");
                    BattleManager.gameHeal(health);
                } else if (health < 0) {
                    log("You ate the " + itemName + ", and lost " + Math.abs(health) + " hp.");
                    BattleManager.gameDamage(Math.abs(health));
                } else {
                    log("You ate the " + itemName + "!");
                }
            } else if (itemName === "horse") {
                log("NEIIIGH :(");
            } else {
                log("You can't eat that!");
            }
        } else {
            log("You don't have that!");
        }
    },
    printInventory: function () {
        if (this.inventory.length == 0) {
            log("Inventory empty :(");
        } else {
            log("Inventory contents: ");
            for (var i = 0; i < this.inventory.length; i++) {
                log(this.inventory[i]);
            }
        }
    },
    getRoom: function () {
        return this.map[this.position.x][this.position.y];
    },
    look: function () {
        this.getRoom().greet();
    },
    move: function (direction) {
        var velocity = [0, 0];
        if (direction === "east") {
            velocity[0] = 1;
        } else if (direction === "west") {
            velocity[0] = -1;
        } else if (direction === "north") {
            velocity[1] = -1;
        } else if (direction === "south") {
            velocity[1] = 1;
        } else if (direction === "northeast") {
            velocity[0] = 1;
            velocity[1] = -1;
        } else if (direction === "southeast") {
            velocity[0] = 1;
            velocity[1] = 1;
        } else if (direction === "southwest") {
            velocity[0] = -1;
            velocity[1] = 1;
        } else if (direction === "northwest") {
            velocity[0] = -1;
            velocity[1] = -1;
        } else {
            return;
        }
        var targetRoom = {
            x: undefined,
            y: undefined
        };
        targetRoom.x = this.position.x + velocity[0];
        targetRoom.y = this.position.y + velocity[1];
        while (this.map[targetRoom.x][targetRoom.y] === undefined /*&& !(targetRoom.x == this.position.x && targetRoom.y == this.position.x)*/ ) {
            targetRoom.x += velocity[0];
            if (targetRoom.x < 0) {
                targetRoom.x = this.map.length - 1;
            } else if (targetRoom.x > this.map.length) {
                targetRoom.x = 0;
            }
            targetRoom.y += velocity[1];
            if (targetRoom.y < 0) {
                targetRoom.y = this.map[0].length - 1;
            } else if (targetRoom.y > this.map[0].length) {
                targetRoom.y = 0;
            }
        }
        this.position = targetRoom;
        //console.log("Position: "+this.position.x+", "+this.position.y);
        //console.log(this.getRoom());
    }
}
game.map[6][6] = new Room("You are in a small opening surrounded by trees...<br>Everything is silent.");
game.map[6][6].addEnemy(new Monster("zorg", 30, 5));
game.map[6][5] = new Room("There is a stream, and a fruiting apple tree.");
game.map[6][5].inventory = ["apples"];
game.map[6][5].itemAliases = {
    apple: "apples"
};
game.map[6][5].itemMessages = {
    apples: "You picked the apples."
};
game.map[6][5].greet = function () {
    if (this.inventory.indexOf("apples") != -1) {
        return "There is a stream, and a fruiting apple tree.";
    } else {
        return "There is a stream, and a fruitless apple tree.";
    }
}

game.map[5][6] = new Room("You are surrounded by a patch of berries, dim under the great trees.");
game.map[5][6].inventory = [
"berries"];
game.map[5][6].greet = function () {
    if (this.inventory.indexOf("berries") != -1) {
        log("You are surrounded by a patch of berries, dim under the great trees.");
    } else {
        log("You are surrounded by a patch of barren berry bushes.");
    }
}
game.map[5][5] = new Room("There is a small shack to the north of you, with the smell of fresh dessert wafting out.");
game.map[5][4] = new Room("Inside this hut there is just a kitchen, the shelves are bulging with candy. You hear a scratching from inside the oven.");
game.map[6][7] = new Room("There is a pentagram on the blood soaked forest floor. The surrounding trees are scorched.");
game.map[7][7] = new Room();
game.map[7][7].inventory = ["horse"];
game.map[7][7].greet = function () {
    if (this.inventory.indexOf("horse") != -1) {
        return "There is a breathtaking waterfall, and a horse drinking from the resulting river.";
    } else {
        return "There is a breathtaking waterfall, flowing into a river.";
    }

}
game.map[7][8] = new Room("You see a mysterious glowing turd.");
game.map[7][8].inventory = ["turd"];
game.map[7][8].pickUp = function (itemName) {
    var index = this.inventory.indexOf(itemName);
    if (index < 0) {
        if (this.itemAliases[itemName] != null) {
            index = this.inventory.indexOf(this.itemAliases[itemName]);
        }
    }
    if (index != -1) {
        var realItem = this.inventory[index];
        var message = "Picked up " + realItem + "!";
        if (this.itemMessages[realItem] != null) {
            message = this.itemMessages[realItem];
        }
        log(message);
        this.inventory.splice(index, 1);
        if (realItem === "turd") {
            game.win();
        }
        return realItem;
    } else {
        log(itemName + " not found.");
        return null;
    }
}
//End of Game Data
//Main
var lastInput = "";
var output = document.getElementById("output");
var input = document.getElementById("input");
var defaultName = getCookie("name");
if (defaultName == null || defaultName == undefined) {
    defaultName = "";
}
input.onkeydown = function (event) {
    if (event.keyCode == 13) {
        submitInput();
    } else if (event.keyCode == 38 && lastInput !== "") {
        this.value = lastInput;
    } else if (event.keyCode == 40 && this.value.trim() !== "") {
        lastInput = this.value;
        this.value = "";
    }
};
window.onerror = function () {
    log("Error.");
};
game.initialize();



// End of Main
