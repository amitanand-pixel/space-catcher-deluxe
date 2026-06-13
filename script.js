const game = document.getElementById("game");

const player = document.getElementById("player");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const finalScore = document.getElementById("finalScore");

let score = 0;
let lives = 3;
let level = 1;

let gameRunning = false;
let paused = false;

let playerX = window.innerWidth / 2;
let playerSpeed = 8;

const keys = {};

let itemSpeed = 3;
let spawnRate = 800;

let highScore =
Number(localStorage.getItem("spaceHighScore")) || 0;

highScoreEl.textContent = highScore;

const items = [];

/* -------------------- */
/* BACKGROUND STARS */
/* -------------------- */

function createBackgroundStars() {

    for(let i=0;i<120;i++){

        const star = document.createElement("div");

        star.className = "bgStar";

        star.style.left =
        Math.random() * window.innerWidth + "px";

        star.style.top =
        Math.random() * window.innerHeight + "px";

        game.appendChild(star);
    }
}

createBackgroundStars();

/* -------------------- */
/* PLAYER */
/* -------------------- */

document.addEventListener("keydown",(e)=>{

    keys[e.key] = true;

    if(e.key.toLowerCase() === "p"){
        togglePause();
    }
});

document.addEventListener("keyup",(e)=>{

    keys[e.key] = false;
});

function updatePlayer(){

    if(!gameRunning || paused) return;

    if(keys["ArrowLeft"]){

        playerX -= playerSpeed;
    }

    if(keys["ArrowRight"]){

        playerX += playerSpeed;
    }

    const maxX =
    window.innerWidth - player.offsetWidth;

    if(playerX < 0) playerX = 0;

    if(playerX > maxX) playerX = maxX;

    player.style.left = playerX + "px";
}

/* -------------------- */
/* ITEMS */
/* -------------------- */

function createItem(){

    if(!gameRunning || paused) return;

    const item = document.createElement("div");

    let type;

    const random = Math.random();

    if(random < 0.60){

        type = "star";
        item.innerHTML = "⭐";

    }else if(random < 0.75){

        type = "diamond";
        item.innerHTML = "💎";

    }else if(random < 0.90){

        type = "bomb";
        item.innerHTML = "💣";

    }else{

        type = "heart";
        item.innerHTML = "❤️";
    }

    item.classList.add(type);

    item.style.left =
    Math.random() *
    (window.innerWidth - 40)
    + "px";

    item.style.top = "-40px";

    game.appendChild(item);

    items.push({
        el:item,
        type:type,
        x:parseFloat(item.style.left),
        y:-40
    });
}

/* -------------------- */
/* COLLISION */
/* -------------------- */

function collision(a,b){

    return !(
        a.top > b.bottom ||
        a.bottom < b.top ||
        a.left > b.right ||
        a.right < b.left
    );
}

/* -------------------- */
/* UPDATE ITEMS */
/* -------------------- */

function updateItems(){

    if(!gameRunning || paused) return;

    const playerRect =
    player.getBoundingClientRect();

    for(let i=items.length-1;i>=0;i--){

        const item = items[i];

        item.y += itemSpeed;

        item.el.style.top =
        item.y + "px";

        const itemRect =
        item.el.getBoundingClientRect();

        if(collision(itemRect,playerRect)){

            if(item.type === "star"){

                score += 1;

            }else if(item.type === "diamond"){

                score += 5;

            }else if(item.type === "heart"){

                if(lives < 5){
                    lives += 1;
                }

            }else if(item.type === "bomb"){

                lives -= 1;
            }

            updateUI();

            item.el.remove();
            items.splice(i,1);

            continue;
        }

        if(item.y > window.innerHeight){

            item.el.remove();
            items.splice(i,1);

            continue;
        }
    }
}

/* -------------------- */
/* LEVEL SYSTEM */
/* -------------------- */

function updateLevel(){

    level =
    Math.floor(score / 20) + 1;

    itemSpeed =
    3 + (level - 1);

    levelEl.textContent = level;
}

/* -------------------- */
/* UI */
/* -------------------- */

function updateUI(){

    scoreEl.textContent = score;
    livesEl.textContent = lives;

    scoreEl.classList.add("scorePop");

    setTimeout(()=>{

        scoreEl.classList.remove("scorePop");

    },200);

    updateLevel();

    if(score > highScore){

        highScore = score;

        localStorage.setItem(
            "spaceHighScore",
            highScore
        );

        highScoreEl.textContent =
        highScore;
    }

    if(lives <= 0){

        gameOver();
    }
}

/* -------------------- */
/* PAUSE */
/* -------------------- */

function togglePause(){

    if(!gameRunning) return;

    paused = !paused;

    pauseScreen.style.display =
    paused ? "flex" : "none";
}

/* -------------------- */
/* GAME OVER */
/* -------------------- */

function gameOver(){

    gameRunning = false;

    finalScore.textContent = score;

    gameOverScreen.style.display =
    "flex";
}

/* -------------------- */
/* GAME LOOP */
/* -------------------- */

function gameLoop(){

    updatePlayer();

    updateItems();

    requestAnimationFrame(
        gameLoop
    );
}

gameLoop();

/* -------------------- */
/* SPAWNER */
/* -------------------- */

let spawnInterval;

function startSpawning(){

    spawnInterval =
    setInterval(()=>{

        createItem();

    },spawnRate);
}

/* -------------------- */
/* START */
/* -------------------- */

startBtn.addEventListener(
"click",
()=>{

    startScreen.style.display =
    "none";

    gameRunning = true;

    startSpawning();
});

/* -------------------- */
/* RESTART */
/* -------------------- */

restartBtn.addEventListener(
"click",
()=>{

    location.reload();
});

/* -------------------- */
/* RESIZE */
/* -------------------- */

window.addEventListener(
"resize",
()=>{

    const maxX =
    window.innerWidth -
    player.offsetWidth;

    if(playerX > maxX){

        playerX = maxX;
    }
});