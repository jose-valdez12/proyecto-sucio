/* Resources.js
 * This is simply an image loading utility. It eases the process of loading
 * image files so that they can be used within your game. It also includes
 * a simple "caching" layer so it will reuse cached images if you attempt
 * to load the same image multiple times.
 */
(function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    /* This is the publicly accessible image loading function. It accepts
     * an array of strings pointing to image files or a string for a single
     * image. It will then call our private image loading function accordingly.
     */
    function load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            /* If the developer passed in an array of images
             * loop through each value and call our image
             * loader on that image file
             */
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        } else {
            /* The developer did not pass an array to this function,
             * assume the value is a string and call our image loader
             * directly.
             */
            _load(urlOrArr);
        }
    }

    /* This is our private image loader function, it is
     * called by the public image loader function.
     */
    function _load(url) {
        if(resourceCache[url]) {
            /* If this URL has been previously loaded it will exist within
             * our resourceCache array. Just return that image rather
             * re-loading the image.
             */
            return resourceCache[url];
        } else {
            /* This URL has not been previously loaded and is not present
             * within our cache; we'll need to load this image.
             */
            var img = new Image();
            img.onload = function() {
                /* Once our image has properly loaded, add it to our cache
                 * so that we can simply return this image if the developer
                 * attempts to load this file in the future.
                 */
                resourceCache[url] = img;

                /* Once the image is actually loaded and properly cached,
                 * call all of the onReady() callbacks we have defined.
                 */
                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };

            /* Set the initial cache value to false, this will change when
             * the image's onload event handler is called. Finally, point
             * the image's src attribute to the passed in URL.
             */
            resourceCache[url] = false;
            img.src = url;
        }
    }

    /* This is used by developers to grab references to images they know
     * have been previously loaded. If an image is cached, this functions
     * the same as calling load() on that URL.
     */
    function get(url) {
        return resourceCache[url];
    }

    /* This function determines if all of the images that have been requested
     * for loading have in fact been properly loaded.
     */
    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    /* This function will add a function to the callback stack that is called
     * when all requested images are properly loaded.
     */
    function onReady(func) {
        readyCallbacks.push(func);
    }

    /* This object defines the publicly accessible functions available to
     * developers by creating a global Resources object.
     */
    window.Resources = {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };
})();


'use strict';
// - - - - VARIABLES - - - -
// characters
const allEnemies = [];
const allKids = [];
const allFish = [];

// counters
let fishCounter = 0;
let timing;
let time = false;
let secCounter = 0;
let minCounter = 0;

// screens
let won;
let lost;
let pauseScreen;

// sound and music
const mainMusic = new Audio('https://res.cloudinary.com/jutzee/video/upload/v1534884142/arcade-game/main.mp3');
mainMusic.loop = true;
const fishSound = new Audio('https://res.cloudinary.com/jutzee/video/upload/v1534884181/arcade-game/fish%20-%20sound.wav');
const hurtSound = new Audio('https://res.cloudinary.com/jutzee/video/upload/v1534884138/arcade-game/hurt.wav');
const babySound = new Audio('https://res.cloudinary.com/jutzee/video/upload/v1534884169/arcade-game/baby.wav');
const gameOverSound = new Audio('https://res.cloudinary.com/jutzee/video/upload/v1534884138/arcade-game/game_over.wav');
const winSound = new Audio('https://res.cloudinary.com/jutzee/video/upload/v1534884140/arcade-game/win.wav');
const allSounds = [mainMusic, fishSound, hurtSound, babySound, gameOverSound, winSound];
let muted = false;


// - - - - CHARACTER - - - -
// basic character class
class Character {
    constructor(sprite, x, y) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x * 101, this.y * 83 - 30);
    }
}

// - - - - PLAYER CHARACTER - - - -
class Player extends Character {
    constructor(sprite, x, y) {
        super(sprite, x , y);
        this.grab = false;
        this.fish = false;
        this.life = 3;
    }
    
    // check for collision with enemies - loose life and fish if player was holding it
    update() {  
        allEnemies.forEach(function(enemy){
            if ((enemy.direction === -1 && enemy.x + enemy.length - 0.2 >= this.x && enemy.x < this.x + 1 - 0.4 && this.y === enemy.y) || 
            (enemy.direction === 1 && enemy.x <= this.x + 1 - 0.4 && enemy.x + enemy.length - 0.4> this.x && this.y === enemy.y)) {   
                this.x = 3;
                this.y = 1;
                this.life--;
                this.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player.png';
                if (this.grab === true) {
                    this.fish.x = this.fish.originalX;
                    this.fish.y = this.fish.originalY;
                    this.fish.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883496/arcade-game/fish%20-%20img.png';
                    this.fish.grabbed = false;
                    this.grab = false;
                }
                if (this.life < 0) {
                    loose();
                }
                else {
                    hurtSound.play();
                    looseLife();
                }
            }
        }.bind(this));
    }

    // move player on game screen
    handleInput(key) {
        if (key === 'up' && this.y - 1 > 0) {
            this.y--;
            if (this.y === 1) {
                this.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player.png';
            }
            else {
                this.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player-swim-up.png';
            }
            if (this.grab === true) {
                this.fish.y--;
                this.fish.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883496/arcade-game/fish%20-%20img.png';
            }
        }
        else if (key === 'down' && this.y + 1 <= Math.round(document.querySelector('canvas').height / 115)) {
            this.y++;
            if (this.y === 2) {
                this.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player-swim-up.png';
            }
            else {
                this.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player-swim-down.png';
            }
            if (this.grab === true) {
                this.fish.y++;
                this.fish.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883496/arcade-game/fish-swim-down.png'
            }
        }
        else if (key === 'left' && this.x - 1 >= 0) {
            this.x--;
            if (this.y === 1) {
                this.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player.png';
            }
            else {
                this.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player-swim-left.png';
            }
            if (this.grab === true) {
                this.fish.x--;
                if (this.y === 1) {
                    this.fish.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883496/arcade-game/fish%20-%20img.png';
                }
                else {
                    this.fish.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883496/arcade-game/fish-swim-left.png';
                }
            }
        }
        else if (key === 'right' && this.x + 1 < Math.round(document.querySelector('canvas').width / 100)) {
            this.x++;
            if (this.y === 1) {
                this.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player.png';
            }
            else {
                this.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player-swim-right.png';
            }
            if (this.grab === true) {
                this.fish.x++;
                if (this.y === 1) {
                    this.fish.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player-swim-right.png';
                }
                else {
                    this.fish.sprite = 'https://res.cloudinary.com/jutzee/image/upload/v1534883496/arcade-game/fish-swim-right.png';
                }
            }
        }
        // grab a fish if on same block
        if (this.grab === false && allFish.find(a => a.x === this.x && a.y === this.y) !== undefined) {
            let grabbedFish = allFish.find(a => a.x === this.x && a.y === this.y);
            this.grab = true;
            grabbedFish.grabbed = true;
            this.fish = grabbedFish;
            fishSound.play();
        }
        // pass a fish to baby penguin if beneath one without a fish
        if (this.grab === true && this.y === 1) {
            let kidAbove = allKids.find(b => b.x === this.x);
            if (kidAbove.hasFish === false) {
                babySound.play();
                kidAbove.hasFish = true;
                this.fish.y--;
                this.grab = false;
                kidAbove.jump = true;
                this.fish.grabbed = false;
                fishCounter++;
                // if 7 fish is passed to baby penguin, the player wins
                if (fishCounter === 7) {
                    disable();
                    setTimeout(function() {
                        win();
                    }, 1000);
                }
            }
        }
    }

}

// - - - - INPUT HANDLER - - - -
// This listens for key presses and sends the keys to Player.handleInput() method
function movement(e) {
    
    const allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
}

// - - - - ENEMIES - - - - 
// our player must avoid
class Enemy extends Character {
    constructor(sprite, direction, length, speed, min, max) {
        super(sprite);
        this.direction = direction === 'right' ? -1 : 1;
        this.x = direction === 'right' ? this.direction * (Math.floor(Math.random() * 10) + 3) : (Math.floor(Math.random() * 10) + 7);
        this.y = Math.floor(Math.random() * (max - min + 1) + min);
        this.length = length;
        this.originalSpeed = speed;
        this.speed = speed;
        this.min = min;
        this.max = max;
    }

    // Update the enemy's position
    // Parameter: dt, a time delta between ticks
    update(dt) {
        this.x = (this.x + (-1 * this.direction) * this.speed * dt);
        if (this.direction === -1 && this.x > 7 || this.direction === 1 && this.x < -2) {
            this.x = this.direction === -1 ? this.direction * (Math.floor(Math.random() * 10) + 3) : (Math.floor(Math.random() * 12) + 9);
            this.y = Math.floor(Math.random() * (this.max - this.min + 1) + this.min);
        }
    }
}

// - - - - BABY PENGUINS to feed - - - -
class Kids extends Character {
    constructor(sprite, x, y) {
        super(sprite, x, y);
        this.hasFish = false;
        this.fishNumber = 'none';
        this.jump = false;
    }

    update() {
        if (this.jump === true) {
            this.y -= 0.5;
            player.fish.y -= 0.5;
            let k = this;
            setTimeout(function() {
                k.y += 0.5;
                player.fish.y += 0.5;
            }, 200);
            this.jump = false;
        }
    }
}

// - - - - FISH to collect - - - -
class Fish extends Character {
    constructor(sprite, x, y) {
        super(sprite, x, y);
        this.originalX = x;
        this.originalY = y;
        this.x = x;
        this.y = y;
        this.grabbed = false;
    }
}

// shuffle array to randomize fish's x position
let fishX = shuffle([0, 1, 2, 3, 4, 5, 6]); 

// - - - - SHUFFLE FUNCTION to randomize order of characters - - - -
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

// - - - - INSTANTIATE CHARACTERS
// player character
let player = new Player('https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player.png', 3, 1);

// enemies
for (let i = 0; i < 7; i++) {
    let e = new Enemy('https://res.cloudinary.com/jutzee/image/upload/v1534883495/arcade-game/enemy-seal.png', 'right', 2, 2, 3, 6);
    allEnemies.push(e);
}
let polar = new Enemy('https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/polar.png', 'left', 2, 1, 2, 2);
allEnemies.push(polar);

// baby penguins
for (let j = 0; j < 7; j++) {
    let k = new Kids('https://res.cloudinary.com/jutzee/image/upload/v1534883462/arcade-game/baby-penguin.png', j, 0);
    allKids.push(k);
}

// fish
for (let k = 0; k < 7; k++) {
    let f = new Fish('https://res.cloudinary.com/jutzee/image/upload/v1534883496/arcade-game/fish%20-%20img.png', fishX[k], Math.floor(Math.random() * (6 - 3 + 1) + 3));
    allFish.push(f);
}

// - - - - TIMER - - - -
function timer() {
    if (time === false) {
        time = true;
        timing = setInterval(function(){
            secCounter++;
            // add leading zero to seconds
            if (String(secCounter).length === 1) {
                secCounter = '0' + secCounter;
            }
            // if seconds reaches 60 reset seconds, increment minutes
            if (secCounter === 60) {
                secCounter = '00';
                document.querySelector('.secCount').textContent = secCounter;
                minCounter++;
                // add leading zero to minutes
                if (String(minCounter).length === 1) {
                    minCounter = '0' + minCounter;
                }
                document.querySelector('.minCount').textContent = minCounter;
            }
            else {
                document.querySelector('.secCount').textContent = secCounter;
            }
        },1000);
    }
}

function stopTimer() {
    if (time === true) {
        clearInterval(timing);
        time = false;
    }
}
// - - - - CALL STARTER SCREEN - - - -
start();

// - - - - START SCREEN - - - - 
function start() {
    // CREATE START SCREEN
    start = document.createElement('DIV');
    start.classList.add('start');

    // add header
    let startHeader = document.createElement('H1');
    startHeader.classList.add('startHeader');
    startHeader.textContent = 'How to play?';

    // add info about the game
    let instructions = document.createElement('DIV');

    let firstLine = document.createElement('DIV');
    firstLine.classList.add('instruction-div');

    let fishImage = document.createElement('IMG');
    fishImage.classList.add('fish');
    fishImage.src = 'https://res.cloudinary.com/jutzee/image/upload/v1534883496/arcade-game/fish-small.png';
    
    let firstLineText = document.createElement('H2');
    firstLineText.classList.add('instruction-first-line');
    firstLineText.textContent = 'Collect fish for the baby penguins.';

    firstLine.append(fishImage, firstLineText);

    let secondLine = document.createElement('H2');
    secondLine.classList.add('instruction-text');
    secondLine.textContent = 'When all the little ones have a fish, you win!';

    let thirdLine = document.createElement('H2');
    thirdLine.classList.add('instruction-text');
    thirdLine.textContent = 'You can move with the arrow keys (← ↑ → ↓) but make sure you avoid enemies.';

    instructions.append(firstLine, secondLine, thirdLine);

    // add new game button
    let startGameButton = document.createElement('DIV');
    startGameButton.classList.add('startGameButton');
    startGameButton.textContent = 'Start game';

    // add key press comment
    let startGameComment = document.createElement('H3');
    startGameComment.classList.add('startGameComment');
    startGameComment.textContent = 'or press any key';
        
    start.append(startHeader, instructions, startGameButton, startGameComment);

    document.body.appendChild(start);  

    // disable movement
    disable();
    
    // event listeners for new game button - click or keypress
    startGameButton.onclick = function() {
        startGame();
    };

    window.addEventListener('keypress', startGame, false);
}

// - - - - START GAME - - - -
function startGame() {
    // enable movement
    enable();

    // remove start screen
    start.style.display = 'none';
    start.remove();

    // start timer
    timer();

    // start main music
    mainMusic.play();
}

// - - - - LIFE COUNTER IN STAT PANEL - - - -
function looseLife() {
    // remove a heart image
    let child = document.getElementsByClassName('heart')[player.life];
    child.parentNode.removeChild(child);
}

// - - - - RESTART FUNCTION - - - -
const restartButton = document.querySelector('.restart');

restartButton.onclick = function() {
    restart();
};

// restart function, starts a new game
function restart() {
    window.removeEventListener('keypress', restart);

    // start main music
    mainMusic.play();

    // reset timer
    stopTimer();
    
    document.querySelector('.secCount').textContent = '00';
    document.querySelector('.minCount').textContent = '00';

    // reshuffle fish's x position
    fishX = shuffle([0, 1, 2, 3, 4, 5, 6]);

    // randomize fish position
    allFish.forEach(function(fish, index) {
        fish.x = fishX[index];
        fish.y = Math.floor(Math.random() * (6 - 3 + 1) + 3);
        fish.grabbed = false;
    });

    // reset and randomize enemies
    allEnemies.forEach(function(enemy) {
        enemy.x = enemy.direction === 1 ? enemy.direction * (Math.floor(Math.random() * 10) + 3) : (Math.floor(Math.random() * 10) + 7);
        enemy.y = Math.floor(Math.random() * (enemy.max - enemy.min + 1) + enemy.min);
    });
    polar.x = polar.direction === 1 ? polar.direction * (Math.floor(Math.random() * 10) + 3) : (Math.floor(Math.random() * 10) + 7);
    polar.y = Math.floor(Math.random() * (polar.max - polar.min + 1) + polar.min);

    // reset baby penguins has fish
    allKids.forEach(function(kid) {
        kid.hasFish = false;
    });
        
    // reset life
    let addLife = player.life === -1 ? 3 : 3 - player.life;
    if (addLife !== 0) {
        let fragment = document.createDocumentFragment();
        for (let m = 0; m < addLife; m++) {
            let heart = document.createElement('IMG');
            heart.classList.add('heart');
            heart.src = 'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/Heart.png';
            fragment.appendChild(heart);
        }
        document.querySelector('.life').appendChild(fragment);
    }

    // remove screen if new game initiated from there
    if (won !== undefined) {
        won.style.display = 'none';
        won.remove();
    }

    if (lost !== undefined) {
        lost.style.display = 'none';
        lost.remove();
    }

    // reset variables
    secCounter = 0;
    minCounter = 0;
    player.x = 3;
    player.y = 1; 
    player.life = 3;
    fishCounter = 0;

    // enable movement
    enable();

    // start timer
    timer();
}

// - - - - PAUSE BUTTON  - - - -
const pauseButton = document.querySelector('.pause');
pauseButton.onclick = function() {
    pause();
};

// - - - - PAUSE - - - 
function pause() {
    // clear timer
    stopTimer();

    // create pause screen
    pauseScreen = document.createElement('DIV');
    pauseScreen.classList.add('pause-screen');

    let pauseText = document.createElement('H1');
    pauseText.textContent = 'Game paused';
    pauseScreen.appendChild(pauseText);

    let pauseComment = document.createElement('H3');
    pauseComment.textContent = 'press any key or click to return';
    pauseScreen.appendChild(pauseComment);

    document.body.appendChild(pauseScreen); 

    // disable movement
    disable();
    
    // event listener to resume a game with a keypress or click
    window.addEventListener('keydown', resume);
    pauseScreen.onclick = function() {
        resume();
    };
    
}

// - - - - RESUME the game after it was paused - - - -
function resume() {
    window.removeEventListener('keypress', resume);

    // hide pause screen and remove
    if (pauseScreen !== undefined) {
        pauseScreen.style.display = 'none';
        pauseScreen.remove();
    }
    
    // enable movement
    enable();

    // start timer again
    timer();
}

// - - - - VOLUME FUNCTION - - - -
const volumeButton = document.querySelector('.volume');

volumeButton.onclick = function() {
    let icon = document.querySelector('.volume-icon').classList;
    // if not muted pause main music and mute all sounds
    if (muted === false) {
        mainMusic.pause();
        allSounds.forEach(function(sound) {
            sound.muted = true;
        });
        // change icon
        icon.replace('fa-volume-up', 'fa-volume-off');
        muted = true;
    }
    // if muted start main music unmute sounds
    else {
        mainMusic.play();
        allSounds.forEach(function(sound) {
            sound.muted = false;
        });
        // change back icon
        icon.replace('fa-volume-off', 'fa-volume-up');
        muted = false;
    }
};

// - - - - DISABLE movement - - - -
function disable() {
    // set enemies' speed to zero
    allEnemies.forEach(function(enemy){
        enemy.speed = 0;
    });
    // remove input handler for player
    document.removeEventListener('keyup', movement);
}

// - - - - ENABLE movement - - - - 
function enable() {
    // remove event listener for keypress
    window.removeEventListener('keypress', resume);
    
    // add input handler back for player
    document.addEventListener('keyup', movement);

    // reset enemies' speed to original
    allEnemies.forEach(function(enemy){
        enemy.speed = enemy.originalSpeed;
    });
}

// - - - - WINNER SCREEN - - - - 
function win() {
    // winner music
    // stop main music
    mainMusic.pause();
    // play winner music
    winSound.play();

    // stop timer
    stopTimer();

    // create winner screen
    won = document.createElement('DIV');
    won.classList.add('winner');

    // add header
    let wonHeader = document.createElement('H1');
    wonHeader.classList.add('winnerHeader');
    wonHeader.textContent = 'Congratulation!';

    // add info about the game
    let wonText = document.createElement('H2');
    wonText.classList.add('winnerText');
    let wonInfo = minCounter === 0 ? 
        'You won in ' + secCounter + ' sec!' : 
        'You won in ' + minCounter + ' min ' + secCounter + ' sec!';
    wonText.textContent = wonInfo;

    // add new game button
    let newGameButton = document.createElement('DIV');
    newGameButton.classList.add('newGameButton');
    newGameButton.textContent = 'Play again?';

    // add press key comment
    let newGameComment = document.createElement('H3');
    newGameComment.classList.add('newGameComment');
    newGameComment.textContent = 'or press any key';
        
    won.append(wonHeader, wonText, newGameButton, newGameComment);

    document.body.appendChild(won);  

    // event listeners for new game button - click or keypress
    newGameButton.onclick = function(){
        winSound.pause();
        winSound.currentTime = 0;
        restart();
    };
    window.addEventListener('keypress', restart);
}

// GAME OVER SCREEN
function loose() {

    // stop main music
    mainMusic.pause();
    // play game over sound
    gameOverSound.play();
    
    // disable movement
    disable();

    // clear timer
    stopTimer();

    // CREATE GAME OVER SCREEN
    lost = document.createElement('DIV');
    lost.classList.add('lost');

    // add header
    let lostHeader = document.createElement('H1');
    lostHeader.classList.add('lostHeader');
    lostHeader.textContent = 'GAME OVER';

    // add new game button
    let newGameButton = document.createElement('DIV');
    newGameButton.classList.add('newGameButton');
    newGameButton.textContent = 'Play again?';

    // add key press comment
    let newGameComment = document.createElement('H3');
    newGameComment.classList.add('newGameComment');
    newGameComment.textContent = 'or press any key';
        
    lost.append(lostHeader, newGameButton, newGameComment);

    document.body.appendChild(lost);  

    // event listeners for new game button - click or keypress
    newGameButton.onclick = function(){
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
        restart();
    };
    window.addEventListener('keypress', restart);
}

/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make 
 * writing app.js a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 710;
    canvas.height = 690;
    doc.body.appendChild(canvas);

    

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        // checkCollisions();
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
        allKids.forEach(function(kid) {
            kid.update(dt);
        });
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/snow-block.png',
                'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/snow-block.png',
                'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/water-block.png',
                'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/water-block.png',
                'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/water-block.png',
                'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/water-block.png',
                'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/water-block.png',
            ],
            numRows = 7,
            numCols = 7,
            row, col;
        
        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height)

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        
        allKids.forEach(function(kids) {
            kids.render();
        });

        player.render();

        allFish.forEach(function(fish) {
            fish.render();
        });

        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/snow-block.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/water-block.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883462/arcade-game/baby-penguin.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player-swim-up.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player-swim-down.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player-swim-left.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/player-swim-right.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883495/arcade-game/enemy-seal.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883518/arcade-game/polar.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883496/arcade-game/fish%20-%20img.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883496/arcade-game/fish-swim-down.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883496/arcade-game/fish-swim-left.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883496/arcade-game/fish-swim-right.png',
        'https://res.cloudinary.com/jutzee/image/upload/v1534883496/arcade-game/fish-small.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
