/* =========================
   ELEMENTS
========================= */

const game = document.getElementById("game");

const player = document.getElementById("player");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");

const startScreen =
document.getElementById("startScreen");

const pauseScreen =
document.getElementById("pauseScreen");

const gameOverScreen =
document.getElementById("gameOverScreen");

const startBtn =
document.getElementById("startBtn");

const restartBtn =
document.getElementById("restartBtn");

const finalScore =
document.getElementById("finalScore");

const leftBtn =
document.getElementById("leftBtn");

const rightBtn =
document.getElementById("rightBtn");

/* =========================
   GAME VARIABLES
========================= */

let score = 0;
let lives = 3;
let level = 1;

let gameRunning = false;
let paused = false;

let itemSpeed = 3;

let playerSpeed = 8;

let playerX =
(window.innerWidth / 2) - 40;

let spawnRate = 800;

let spawnInterval;

const keys = {};

const items = [];

/* =========================
   HIGH SCORE
========================= */

let highScore =
Number(
localStorage.getItem(
"spaceHighScore"
)
) || 0;

highScoreEl.textContent =
highScore;

/* =========================
   BACKGROUND STARS
========================= */

function createBackgroundStars(){

    for(let i=0;i<150;i++){

        const star =
        document.createElement("div");

        star.className =
        "bgStar";

        star.style.left =
        Math.random() *
        window.innerWidth +
        "px";

        star.style.top =
        Math.random() *
        window.innerHeight +
        "px";

        star.style.animationDelay =
        Math.random()*3 +
        "s";

        game.appendChild(star);
    }
}

createBackgroundStars();

/* =========================
   KEYBOARD CONTROLS
========================= */

document.addEventListener(
"keydown",
(e)=>{

    keys[e.key] = true;

    if(
        e.key.toLowerCase()
        === "p"
    ){
        togglePause();
    }
});

document.addEventListener(
"keyup",
(e)=>{

    keys[e.key] = false;
});

/* =========================
   MOBILE CONTROLS
========================= */

if(leftBtn){

    leftBtn.addEventListener(
    "touchstart",
    ()=>{

        keys["ArrowLeft"] = true;
    });

    leftBtn.addEventListener(
    "touchend",
    ()=>{

        keys["ArrowLeft"] = false;
    );
}

if(rightBtn){

    rightBtn.addEventListener(
    "touchstart",
    ()=>{

        keys["ArrowRight"] = true;
    });

    rightBtn.addEventListener(
    "touchend",
    ()=>{

        keys["ArrowRight"] = false;
    });
}

/* =========================
   PLAYER MOVEMENT
========================= */

function updatePlayer(){

    if(
        !gameRunning ||
        paused
    ) return;

    if(keys["ArrowLeft"]){

        playerX -=
        playerSpeed;
    }

    if(keys["ArrowRight"]){

        playerX +=
        playerSpeed;
    }

    const maxX =
    window.innerWidth -
    player.offsetWidth;

    if(playerX < 0){

        playerX = 0;
    }

    if(playerX > maxX){

        playerX = maxX;
    }

    player.style.left =
    playerX + "px";
}

/* =========================
   ITEM CREATION
========================= */

function createItem(){

    if(
        !gameRunning ||
        paused
    ) return;

    const item =
    document.createElement(
    "div"
    );

    const random =
    Math.random();

    let type;

    if(random < 0.60){

        type = "star";
        item.innerHTML =
        "⭐";

    }

    else if(random < 0.75){

        type = "diamond";
        item.innerHTML =
        "💎";
    }

    else if(random < 0.90){

        type = "bomb";
        item.innerHTML =
        "💣";
    }

    else{

        type = "heart";
        item.innerHTML =
        "❤️";
    }

    item.classList.add(
    type
    );

    item.style.left =
    Math.random() *
    (
        window.innerWidth
        - 50
    ) + "px";

    item.style.top =
    "-50px";

    game.appendChild(
    item
    );

    items.push({

        el:item,
        type:type,
        y:-50
    });
}

/* =========================
   START GAME
========================= */

startBtn.addEventListener(
"click",
()=>{

    startScreen.style.display =
    "none";

    gameRunning = true;

    startSpawning();
});

/* =========================
   SPAWNER
========================= */

function startSpawning(){

    spawnInterval =
    setInterval(
    ()=>{

        createItem();

    },
    spawnRate
    );
}

/* =========================
   MAIN LOOP
========================= */

function gameLoop(){

    updatePlayer();

    requestAnimationFrame(
    gameLoop
    );
}

gameLoop();

/* =========================
   COLLISION DETECTION
========================= */

function collision(a,b){

    return !(

        a.top > b.bottom ||
        a.bottom < b.top ||
        a.left > b.right ||
        a.right < b.left
    );
}

/* =========================
   UPDATE ITEMS
========================= */

function updateItems(){

    if(
        !gameRunning ||
        paused
    ) return;

    const playerRect =
    player.getBoundingClientRect();

    for(
        let i = items.length - 1;
        i >= 0;
        i--
    ){

        const item =
        items[i];

        item.y +=
        itemSpeed;

        item.el.style.top =
        item.y + "px";

        const itemRect =
        item.el.getBoundingClientRect();

        /* Collision */

        if(
            collision(
                itemRect,
                playerRect
            )
        ){

            handleItem(
                item.type
            );

            item.el.remove();

            items.splice(
                i,
                1
            );

            continue;
        }

        /* Missed Item */

        if(
            item.y >
            window.innerHeight
        ){

            item.el.remove();

            items.splice(
                i,
                1
            );
        }
    }
}

/* =========================
   ITEM EFFECTS
========================= */

function handleItem(type){

    switch(type){

        case "star":

            score += 1;
            break;

        case "diamond":

            score += 5;
            break;

        case "heart":

            if(lives < 5){

                lives++;
            }

            break;

        case "bomb":

            lives--;
            break;
    }

    updateUI();
}

/* =========================
   UI UPDATE
========================= */

function updateUI(){

    scoreEl.textContent =
    score;

    livesEl.textContent =
    lives;

    updateLevel();

    /* High Score */

    if(
        score > highScore
    ){

        highScore = score;

        localStorage.setItem(
            "spaceHighScore",
            highScore
        );

        highScoreEl.textContent =
        highScore;
    }

    /* Game Over */

    if(
        lives <= 0
    ){

        gameOver();
    }
}

/* =========================
   LEVEL SYSTEM
========================= */

function updateLevel(){

    level =
    Math.floor(
        score / 20
    ) + 1;

    levelEl.textContent =
    level;

    itemSpeed =
    3 + (
        level - 1
    );
}

/* =========================
   PAUSE
========================= */

function togglePause(){

    if(
        !gameRunning
    ) return;

    paused =
    !paused;

    pauseScreen.style.display =

    paused
    ? "flex"
    : "none";
}

/* =========================
   GAME OVER
========================= */

function gameOver(){

    gameRunning =
    false;

    clearInterval(
        spawnInterval
    );

    finalScore.textContent =
    score;

    gameOverScreen.style.display =
    "flex";
}

/* =========================
   RESTART
========================= */

restartBtn.addEventListener(
"click",
()=>{

    location.reload();
});

/* =========================
   RESIZE
========================= */

window.addEventListener(
"resize",
()=>{

    const maxX =

    window.innerWidth -

    player.offsetWidth;

    if(
        playerX > maxX
    ){

        playerX = maxX;
    }
});

/* =========================
   MAIN LOOP UPDATE
========================= */

/* Purane gameLoop ko replace karo */

function gameLoop(){

    updatePlayer();

    updateItems();

    requestAnimationFrame(
        gameLoop
    );
}
