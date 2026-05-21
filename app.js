/* =========================================
   HANC // NEON VOID
   app.js
========================================= */

/* TELEGRAM */

const tg = window.Telegram.WebApp;

if (tg) {
  tg.expand();
  tg.ready();
}

/* CANVAS */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

/* HUD */

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const comboEl = document.getElementById("combo");
const finalScoreEl = document.getElementById("finalScore");

/* STORAGE */

let best = localStorage.getItem("hanc_best") || 0;
bestEl.innerText = best;

/* IMAGE */

const hanc = new Image();

/* IMPORTANT:
   Put your image in same folder
   and name it exactly:
   hanc.png
*/

hanc.src = "hanc.png";

/* GAME STATE */

let running = false;

let score = 0;
let combo = 1;
let speed = 7;

let glowPulse = 0;

let stars = [];
let obstacles = [];
let signals = [];
let particles = [];

/* STARFIELD */

for (let i = 0; i < 140; i++) {

  stars.push({

    x: Math.random() * w,
    y: Math.random() * h,

    size: Math.random() * 2.2,

    speed: Math.random() * 1.5

  });

}

/* PLAYER */

const player = {

  x: w / 2,

  /* LOWER POSITION */

  y: h - 55,

  /* SMALLER SIZE */

  size: 78

};

/* START */

function resetGame() {

  score = 0;
  combo = 1;
  speed = 7;

  glowPulse = 0;

  obstacles = [];
  signals = [];
  particles = [];

  running = true;

  document.getElementById(
    "menu"
  ).style.display = "none";

  document.getElementById(
    "gameover"
  ).style.display = "none";

  spawnObstacle();
  spawnSignal();

  loop();

}

/* SPAWN OBSTACLES */

function spawnObstacle() {

  if (!running) return;

  const lane =
    Math.floor(Math.random() * 3);

  const laneWidth = w / 3;

  obstacles.push({

    x:
      lane * laneWidth +
      laneWidth / 2 - 48,

    y: -220,

    width: 96,

    height:
      120 + Math.random() * 140

  });

  setTimeout(

    spawnObstacle,

    700 - Math.min(speed * 24, 480)

  );

}

/* SPAWN SIGNALS */

function spawnSignal() {

  if (!running) return;

  const lane =
    Math.floor(Math.random() * 3);

  const laneWidth = w / 3;

  signals.push({

    x:
      lane * laneWidth +
      laneWidth / 2,

    y: -100,

    size: 16

  });

  setTimeout(
    spawnSignal,
    820
  );

}

/* UPDATE */

function update() {

  glowPulse += 0.04;

  score += 0.12 * combo;

  speed += 0.0012;

  scoreEl.innerText =
    Math.floor(score);

  /* STARS */

  stars.forEach(s => {

    s.y += s.speed + speed * 0.15;

    if (s.y > h) {

      s.y = -10;

      s.x = Math.random() * w;

    }

  });

  /* OBSTACLES */

  obstacles.forEach(o => {

    o.y += speed;

    if (

      player.x - player.size / 2 <
      o.x + o.width &&

      player.x + player.size / 2 >
      o.x &&

      player.y - player.size / 2 <
      o.y + o.height &&

      player.y + player.size / 2 >
      o.y

    ) {

      endGame();

    }

  });

  /* SIGNALS */

  signals.forEach(s => {

    s.y += speed;

    const dx =
      player.x - s.x;

    const dy =
      player.y - s.y;

    const dist =
      Math.sqrt(dx * dx + dy * dy);

    if (dist < 52) {

      s.dead = true;

      combo++;

      score += 25 * combo;

      comboEl.innerText =
        "X" + combo;

      burst(s.x, s.y);

      if (combo % 5 === 0) {
        glitch();
      }

    }

  });

  /* CLEANUP */

  obstacles =
    obstacles.filter(
      o => o.y < h + 300
    );

  signals =
    signals.filter(
      s => s.y < h + 100 && !s.dead
    );

  particles.forEach(p => {

    p.x += p.vx;

    p.y += p.vy;

    p.life--;

  });

  particles =
    particles.filter(
      p => p.life > 0
    );

}

/* BACKGROUND */

function drawBackground() {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      h
    );

  gradient.addColorStop(
    0,
    "#11172d"
  );

  gradient.addColorStop(
    0.5,
    "#050505"
  );

  gradient.addColorStop(
    1,
    "#000"
  );

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    w,
    h
  );

}

/* STARS */

function drawStars() {

  stars.forEach(s => {

    ctx.beginPath();

    ctx.arc(
      s.x,
      s.y,
      s.size,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "rgba(255,255,255,0.8)";

    ctx.fill();

  });

}

/* LANES */

function drawLanes() {

  ctx.strokeStyle =
    "rgba(255,255,255,0.05)";

  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.moveTo(w / 3, 0);

  ctx.lineTo(w / 3, h);

  ctx.stroke();

  ctx.beginPath();

  ctx.moveTo((w / 3) * 2, 0);

  ctx.lineTo((w / 3) * 2, h);

  ctx.stroke();

}

/* SIGNALS */

function drawSignals() {

  signals.forEach(s => {

    ctx.beginPath();

    ctx.arc(
      s.x,
      s.y,
      s.size,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = "white";

    ctx.shadowBlur =
      28 +
      Math.sin(glowPulse) * 8;

    ctx.shadowColor = "white";

    ctx.fill();

    ctx.shadowBlur = 0;

  });

}

/* OBSTACLES */

function drawObstacles() {

  obstacles.forEach(o => {

    const g =
      ctx.createLinearGradient(
        o.x,
        o.y,
        o.x + o.width,
        o.y + o.height
      );

    g.addColorStop(
      0,
      "rgba(255,0,90,0.14)"
    );

    g.addColorStop(
      1,
      "rgba(255,60,60,0.05)"
    );

    ctx.fillStyle = g;

    ctx.fillRect(
      o.x,
      o.y,
      o.width,
      o.height
    );

    ctx.strokeStyle =
      "rgba(255,120,120,0.45)";

    ctx.lineWidth = 2;

    ctx.strokeRect(
      o.x,
      o.y,
      o.width,
      o.height
    );

  });

}

/* PARTICLES */

function drawParticles() {

  particles.forEach(p => {

    ctx.fillStyle =
      `rgba(255,255,255,${
        p.life / 30
      })`;

    ctx.fillRect(
      p.x,
      p.y,
      3,
      3
    );

  });

}

/* PLAYER */

function drawPlayer() {

  const float =
    Math.sin(Date.now() * 0.006) * 2;

  ctx.save();

  ctx.translate(
    player.x,
    player.y + float
  );

  /* GLOW */

  ctx.beginPath();

  ctx.arc(
    0,
    0,
    player.size / 2 + 8,
    0,
    Math.PI * 2
  );

  const glow =
    ctx.createRadialGradient(
      0,
      0,
      8,
      0,
      0,
      player.size
    );

  glow.addColorStop(
    0,
    "rgba(255,255,255,0.22)"
  );

  glow.addColorStop(
    1,
    "rgba(255,255,255,0)"
  );

  ctx.fillStyle = glow;

  ctx.fill();

  /* PERFECT CIRCLE */

  ctx.beginPath();

  ctx.arc(
    0,
    0,
    player.size / 2,
    0,
    Math.PI * 2
  );

  ctx.closePath();

  ctx.clip();

  /* HANC IMAGE */

  ctx.drawImage(

    hanc,

    -player.size / 2,
    -player.size / 2,

    player.size,
    player.size

  );

  ctx.restore();

  /* OUTLINE */

  ctx.beginPath();

  ctx.arc(
    player.x,
    player.y + float,
    player.size / 2,
    0,
    Math.PI * 2
  );

  ctx.strokeStyle =
    "rgba(255,255,255,0.32)";

  ctx.lineWidth = 2;

  ctx.shadowBlur = 25;

  ctx.shadowColor =
    "rgba(255,255,255,0.45)";

  ctx.stroke();

  ctx.shadowBlur = 0;

}

/* DRAW */

function draw() {

  drawBackground();

  drawStars();

  drawLanes();

  drawSignals();

  drawObstacles();

  drawParticles();

  drawPlayer();

}

/* PARTICLE BURST */

function burst(x, y) {

  for (let i = 0; i < 18; i++) {

    particles.push({

      x,
      y,

      vx:
        (Math.random() - 0.5) * 8,

      vy:
        (Math.random() - 0.5) * 8,

      life: 30

    });

  }

}

/* GLITCH */

function glitch() {

  document.body.style.transform =
    `translateX(${
      Math.random() * 12 - 6
    }px)`;

  setTimeout(() => {

    document.body.style.transform =
      "translateX(0px)";

  }, 90);

}

/* END */

function endGame() {

  running = false;

  document.body.classList.add(
    "flash"
  );

  finalScoreEl.innerText =
    Math.floor(score);

  if (score > best) {

    best = Math.floor(score);

    localStorage.setItem(
      "hanc_best",
      best
    );

    bestEl.innerText = best;

  }

  setTimeout(() => {

    document.getElementById(
      "gameover"
    ).style.display = "flex";

  }, 250);

}

/* LOOP */

function loop() {

  if (!running) return;

  update();

  draw();

  requestAnimationFrame(loop);

}

/* CONTROLS */

canvas.addEventListener(
  "touchmove",
  e => {

    const touch =
      e.touches[0];

    player.x =
      touch.clientX;

  }
);

canvas.addEventListener(
  "mousemove",
  e => {

    player.x =
      e.clientX;

  }
);

/* BUTTONS */

document
.getElementById("startBtn")
.addEventListener(
  "click",
  resetGame
);

document
.getElementById("restartBtn")
.addEventListener(
  "click",
  resetGame
);

/* RESIZE */

window.addEventListener(
  "resize",
  () => {

    w =
      canvas.width =
      window.innerWidth;

    h =
      canvas.height =
      window.innerHeight;

    player.y = h - 55;

  }
);