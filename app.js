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
    inp.trim();
    input.value = "";
    if (inp != "") {
        handleInput(inp);
    }
}

function handleInput(inp) {
    game.handleInput(inp);
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
    this.greeting = function () {
        return greetingIn
    };
    this.inventory = [];
    this.pickUp = function (itemName) {
        var index = this.inventory.indexOf(itemName);
        if (index != -1) {
            log("Picked up " + itemName + "!");
            this.inventory.splice(index, 1);
            return itemName;
        } else {
            log(itemName + " not found.");
            return null;
        }
    }
    this.open = function(name){log("There is nothing to open");};
}
var game = {
    start: function () {
        log("Welcome to Forest Walk");
        log("Start? (yes/no)")
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
        log("Commands: Look, go (direction), inventory, pick up (name), clear");
    },
    position: {
        x: 6,
        y: 6
    },
    map: [new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13), new Array(13)],
    isStarted: false,
    handleInput: function (data) {
        var lower = data.toLowerCase();
        var args = lower.split(" ");
        if (this.isStarted) {
            if (args[0] === "look") {
                this.look();
            } else if (args[0] === "go") {
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
            } else if (args[0] === "clear"){
                clearOutput();
                this.look();
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
                log("You wake up in a calm forest...");
                log("The air is fresh and full of life.");
                this.look();
            } else if (lower == "no") {
                log("Okay, type yes when you are ready.");
            } else {
                log("Stop it :(");
            }
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
        log(this.getRoom().greeting());
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
game.map[6][5] = new Room("There is a stream, and a fruiting apple tree.");
game.map[6][5].inventory = ["apples"];
game.map[5][6] = new Room("You are surrounded by a patch of berries, dim under the great trees.");
game.map[5][6].inventory = [
"berries"];
game.map[5][6].greeting = function () {
    if (this.inventory.indexOf("berries") != -1) {
        return "You are surrounded by a patch of berries, dim under the great trees.";
    } else {
        return "You are surrounded by a patch of barren berry bushes."
    }
}
game.map[5][5] = new Room("There is a small shack to the north of you, with the smell of fresh dessert wafting out.");
game.map[5][4] = new Room("Inside this hut there is just a kitchen, the shelves are bulging with candy. You hear a scratching from inside the oven.");
//End of Game Data 
//Main
var output = document.getElementById("output");
var input = document.getElementById("input");
input.onkeydown = function (event) {
    if (event.keyCode == 13) {
        submitInput();
    }
};
window.onerror = function () {
    log("Error.");
};
game.start();



// End of Main
