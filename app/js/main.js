/*global Phaser */
/* global Actor */
/*global HealthPickup */

var FONT = 32;

// map
var ROWS = 15;
var COLS = 30;
var map;

var screen;

// number of actors incl player
var ACTORS = 10;

var player;
var actorList;
var livingEnemies;

var PICKUPS = 3;
var pickupList;
var pickupMap;

// refernece to each actor's position for quick lookups
var actorMap;



// map

function drawMap() {
    for(var y = 0; y < ROWS; y++) {
        for(var x = 0; x < COLS; x++) {
            screen[y][x].content = map[y][x];
            screen[y][x].style.fill = '#fff';
        }
    }
}

function initCell(char, x, y) {
    var style = { font: FONT + 'px monospace', fill: '#fff' };
    return game.add.text(FONT * 0.6 * x, FONT * y, char, style);
}

// end map


// actors
function initActors() {
    actorList = [];
    actorMap = {};
    for(var i = 0; i < ACTORS; i++) {
        var actor = new Actor();

        // player has more hp!
        if(i === 0) {
            actor.name = 'Player';
            actor.hp = 3;
        }

        var pos = placeRandom(COLS, ROWS);
        actor.x = pos.x;
        actor.y = pos.y;

        actorMap[actor.y + '_' + actor.x] = actor;
        actorList.push(actor);
    }

    player = actorList[0];
    livingEnemies = ACTORS - 1;
}

function initPickups() {
    pickupList = [];
    pickupMap = {};

    var i;
    for(i = 0; i < PICKUPS; i++) {
        var pos = placeRandom(COLS, ROWS);
        var pickup = new HealthPickup(pos.x, pos.y);
        pickupMap[pickup.y + '_' + pickup.x] = pickup;
        pickupList.push(pickup);
    }
}

function drawPickups() {
    var i;
    var len = pickupList.length;
    for(i = 0; i < len; i++) {
        var pickup = pickupList[i];
        screen[pickup.y][pickup.x].content = pickup.tile;
        screen[pickup.y][pickup.x].style.fill = pickup.colour;
    }
}

function placeRandom(maxX, maxY) {
    var x = randomInt(maxX);
    var y = randomInt(maxY);

    if(map[y][x] !== '#' && typeof actorMap[y + '_' + x] === 'undefined') {
        return { x: x, y: y};
    } else {
        return placeRandom(maxX, maxY);
    }
}

function drawActors() {
    var i;
    var len = actorList.length;

    for(i = 0; i < len; i++) {
        if(actorList[i].hp > 0) {
            var actor = actorList[i];
            screen[actor.y][actor.x].content = i === 0 ? '' + player.hp : actor.tile;
            if(actor.hp > 1) {
                screen[actor.y][actor.x].style.fill = '#f11';
            } else {
                screen[actor.y][actor.x].style.fill = actor.colour;
            }
            
            
            if(actor.name === 'Player') {
                screen[actor.y][actor.x].style.fill = '#1f6';
            }
        }
    }
}

function moveTo(actor, dir) {
    if(!walkable(actor, dir)) {
        return false;
    }

    var newKey = (actor.y + dir.y) + '_' + (actor.x + dir.x);

    if(typeof actorMap[newKey] !== 'undefined' && actorMap[newKey]) {
        var victim = actorMap[newKey];
        log(actor.name + ' attacks ' + victim.name);
        victim.hp--;


        if(victim.hp === 0) {
            log(victim.name + ' dies!');
            actor.hp++;
            log(actor.name + ' increases in power! ' + actor.hp + ' health');

            delete actorMap[newKey];
            actorList.splice(actorList.indexOf(victim), 1);

            if(victim !== player) {
                livingEnemies--;
                if(livingEnemies === 0) {
                    // Win
                    var victory = game.add.text(
                                    game.world.centerX,
                                    game.world.centerY,
                                    'Super Win!\nF5 to replay.',
                                    {
                                        fill: '#2e2',
                                        align: 'center'
                                    });
                    victory.anchor.setTo(0.5, 0.5);
                    log('You win!');
                }
            }
        }
        
    } else {
        // remove reference to old pos
        delete actorMap[actor.y + '_' + actor.x];

        actor.y += dir.y;
        actor.x += dir.x;

        actorMap[actor.y + '_' + actor.x] = actor;
        

        if(pickupMap[actor.y + '_' + actor.x]) {
            var pickup = pickupMap[actor.y + '_' + actor.x];

            switch(pickup.constructor.name) {
            case 'HealthPickup':
                actor.hp++;
                log(actor.name + ' health increases to ' + actor.hp);
                break;
            }

            delete pickupMap[actor.y + '_' + actor.x];
            pickupList.splice(pickupList.indexOf(pickup), 1);
           
        }
    }

    return true;
}

function aiAct(actor) {
    var directions = [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: 0, y: 1 }
    ];
    var dx = player.x - actor.x;
    var dy = player.y - actor.y;

    // if player far away
    if(Math.abs(dx) + Math.abs(dy) > 6) {
        while(!moveTo(actor, directions[randomInt(directions.length)])) {}
    }

    // walk towards player
    if(Math.abs(dx) > Math.abs(dy)) {
        if(dx < 0) {
            // left
            moveTo(actor, directions[0]);
        } else {
            // right
            moveTo(actor, directions[1]);
        }
    } else {
        if(dy < 0) {
            // up
            moveTo(actor, directions[2]);
        } else {
            // down
            moveTo(actor, directions[3]);
        }
    }

    if(player.hp < 1) {
        // game over man
        var gameOver = game.add.text(
                        game.world.centerX, 
                        game.world.centerY, 
                        'Game Over!\nF5 to restart', 
                        { fill: '#e22', align: 'center' }
                        );
        gameOver.anchor.setTo(0.5, 0.5);
        log('You lose!');
    }
}

// end actors

// init
// monospace fonts = 60% width:height
var game = new Phaser.Game(COLS * FONT * 0.6,
                           ROWS * FONT,
                           Phaser.AUTO,
                           'main',
                           { create: create }
                           );

function onKeyUp(event) {
    // event.preventDefault();
    // redraw map
    drawMap();

    var acted = false;
    switch(event.keyCode) {
        case Phaser.Keyboard.LEFT:
            acted = moveTo(player, { x: -1, y: 0 });
            break;
        case Phaser.Keyboard.RIGHT:
            acted = moveTo(player, { x: 1, y: 0 });
            break;
        case Phaser.Keyboard.UP:
            acted = moveTo(player, { x: 0, y: -1 });
            break;
        case Phaser.Keyboard.DOWN:
            acted = moveTo(player, { x: 0, y: 1 });
            break;
    }

    if(acted) {
        var i;
        var len = actorList.length;
        for(i = 0; i < len; i++) {
            if(i > 0) {
                var enemy = actorList[i];
                if(enemy) {
                    aiAct(enemy);
                }
            }
        }
    }

    drawPickups();
    drawActors();
}

function create() {
    game.input.keyboard.addCallbacks(null, null, onKeyUp);

    // initMap();
    map = new Map(ROWS, COLS);

    screen = [];
    for(var y = 0; y < ROWS; y++) {
        var newRow = [];
        screen.push(newRow);
        for(var x = 0; x < COLS; x++) {
            newRow.push(initCell('', x, y));
        }
    }

    initActors();
    initPickups();

    drawMap();
    drawPickups();
    drawActors();
}
// end init



// utils
function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function walkable(actor, dir) {
    return actor.x + dir.x >= 0 &&
            actor.x + dir.x <= COLS - 1 &&
            actor.y + dir.y >= 0 &&
            actor.y + dir.y <= ROWS - 1 &&
            map[actor.y + dir.y][actor.x + dir.x] === '.';
}

function log(text) {
    var output = document.getElementById('console');
    var line = document.createElement('p');
    line.innerHTML = text;
    output.insertBefore(line, output.firstChild);
}
