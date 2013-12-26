/*global Phaser */
/* global Actor */

var FONT = 32;

// map
var ROWS = 10;
var COLS = 15;
var map;

var screen;

// number of actors incl player
var ACTORS = 10;

var player;
var actorList;
var livingEnemies;

// refernece to each actor's position for quick lookups
var actorMap;



// map
function initMap() {
    map = [];
    for(var y = 0; y < ROWS; y++) {
        var newRow = [];
        for(var x = 0; x < COLS; x++) {
            if(Math.random() > 0.8) {
                newRow.push('#');
            } else {
                newRow.push('.');
            }
        }
        map.push(newRow);
    }
}

function drawMap() {
    for(var y = 0; y < ROWS; y++) {
        for(var x = 0; x < COLS; x++) {
            screen[y][x].content = map[y][x];
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
        // var actor = {
        //     x: 0,
        //     y: 0,
        //     hp: i === 0 ? 3 : 1
        // };
        var actor = new Actor();

        // player has more hp!
        if(i === 0) {
            actor.hp = 3;
        }

        var pos = placeRandom(COLS, ROWS);
        actor.x = pos.x;
        actor.y = pos.y;
        console.log(actor);

        actorMap[actor.y + '_' + actor.x] = actor;
        actorList.push(actor);
    }

    player = actorList[0];
    livingEnemies = ACTORS - 1;
}

function placeRandom(maxX, maxY) {
    var x = randomInt(maxX);
    var y = randomInt(maxY);

    console.log(map[y][x] !== '#' && typeof actorMap[y + '_' + x] === 'undefined');

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
            screen[actor.y][actor.x].content = i === 0 ? '' + player.hp : 'e';
        }
    }
    console.log(screen);
}

// init
// monospace fonts = 60% width:height
var game = new Phaser.Game(COLS * FONT * 0.6,
                           ROWS * FONT,
                           Phaser.AUTO,
                           null,
                           { create: create }
                           );

function onKeyUp(event) {
    switch(event.keyCode) {
        case Keyboard.LEFT:
        case Keyboard.RIGHT:
        case Keyboard.UP:
        case Keyboard.DOWN:
    }
}

function create() {
    game.input.keyboard.addCallbacks(null, null, onKeyUp);

    initMap();

    screen = [];
    for(var y = 0; y < ROWS; y++) {
        var newRow = [];
        screen.push(newRow);
        for(var x = 0; x < COLS; x++) {
            newRow.push(initCell('', x, y));
        }
    }

    initActors();

    drawMap();
    drawActors();
}
// end init

// utils
function randomInt(max) {
    return Math.floor(Math.random() * max);
}

