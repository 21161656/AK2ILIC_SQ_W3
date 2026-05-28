// ============================================================
// Week 3 Example 1: Classes and Fighter Objects
// ============================================================

// ============================================================
// PORTAL FIGHTER GAME
// ============================================================

let portal1;
let portal2;
let shots = [];
let portals = [];

let groundY;
let gameState = "menu";
let countdownStart;
let winner = "";
let activePortalIndex;

let selectedMode = "";
let aiMinShootDelay = 3000;
let aiMaxShootDelay = 5000;
let aiAggression = 0.7;

let bgImg;
let portalImg1;
let portalImg2;

// AUDIO
let calmMusic;
let actionMusic;
let startGameSound;
let spaceGunSound;
let deadSpaceGunSound;
let youWinSound;
let youLoseSound;

function preload() {
  bgImg = loadImage("assets/images/portalbackground.png");
  portalImg1 = loadImage("assets/images/characterportal.png");
  portalImg2 = loadImage("assets/images/characterportal.png");

  calmMusic = loadSound("assets/audio/calmmusic.mp3");
  actionMusic = loadSound("assets/audio/actionmusic.mp3");
  startGameSound = loadSound("assets/audio/gamestarter.mp3");
  spaceGunSound = loadSound("assets/audio/spacegun.mp3");
  deadSpaceGunSound = loadSound("assets/audio/deadspacegun.mp3");
  youWinSound = loadSound("assets/audio/youwin.mp3");
  youLoseSound = loadSound("assets/audio/youlose.mp3");
}

class Fighter {
  constructor(name, x, y, img, controls, gunDot, isRobot = false) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.speed = 0.9;
    this.maxSpeed = 18;
    this.friction = 0.92;
    this.gravity = 1.2;
    this.bounce = -0.8;

    this.r = 30;
    this.img = img;
    this.controls = controls;
    this.gunDot = gunDot;
    this.facing = 1;

    this.isRobot = isRobot;
    this.aiTimer = 0;
    this.aiMoveX = 0;
    this.aiMoveY = 0;
    this.teleportCooldown = 0;

    this.lastShotTime = 0;
    this.nextShotDelay = random(aiMinShootDelay, aiMaxShootDelay);
  }

  update() {
    if (this.teleportCooldown > 0) {
      this.teleportCooldown--;
    }

    if (this.isRobot) {
      this.updateRobotAI();
    } else {
      this.updatePlayerInput();
    }

    this.vx = constrain(this.vx, -this.maxSpeed, this.maxSpeed);
    this.vy = constrain(this.vy, -this.maxSpeed, this.maxSpeed);

    this.vy += this.gravity;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < this.r) {
      this.x = this.r;
      this.vx *= -0.9;
    }

    if (this.x > width - this.r) {
      this.x = width - this.r;
      this.vx *= -0.9;
    }

    if (this.y > groundY - this.r) {
      this.y = groundY - this.r;
      this.vy *= this.bounce;
    }

    if (this.y < this.r) {
      this.y = this.r;
      this.vy *= -0.9;
    }
  }

  updatePlayerInput() {
    if (keyIsDown(this.controls.left)) {
      this.vx -= this.speed;
      this.facing = -1;
    }

    if (keyIsDown(this.controls.right)) {
      this.vx += this.speed;
      this.facing = 1;
    }

    if (keyIsDown(this.controls.up)) {
      this.vy -= this.speed * 2;
    }

    if (keyIsDown(this.controls.down)) {
      this.vy += this.speed;
    }

    if (!keyIsDown(this.controls.left) && !keyIsDown(this.controls.right)) {
      this.vx *= this.friction;
    }
  }

  updateRobotAI() {
    this.aiTimer--;

    if (this.aiTimer <= 0) {
      this.aiMoveX = random([-1, 0, 1]);
      this.aiMoveY = random([-1, 0, 1]);
      this.aiTimer = int(random(25, 80));
    }

    this.vx += this.aiMoveX * this.speed * aiAggression;
    this.vy += this.aiMoveY * this.speed * aiAggression;

    let danger = portals[activePortalIndex];

    if (danger && dist(this.x, this.y, danger.x, danger.y) < 180) {
      if (this.x < danger.x) {
        this.vx -= this.speed * 2;
        this.facing = -1;
      } else {
        this.vx += this.speed * 2;
        this.facing = 1;
      }

      if (this.y < danger.y) {
        this.vy -= this.speed;
      } else {
        this.vy += this.speed;
      }
    }

    if (portal1.x < this.x) {
      this.facing = -1;
    } else {
      this.facing = 1;
    }

    if (millis() - this.lastShotTime > this.nextShotDelay) {
      this.shoot();
      this.lastShotTime = millis();
      this.nextShotDelay = random(aiMinShootDelay, aiMaxShootDelay);
    }

    this.vx *= 0.98;
  }

  shoot() {
    shots.push(new Shot(this.x + this.facing * 45, this.y, this.facing, this));

    if (spaceGunSound) {
      spaceGunSound.play();
    }
  }

  draw() {
    push();
    imageMode(CENTER);

    if (this.img) {
      image(this.img, this.x, this.y, 80, 80);
    } else {
      fill(255);
      ellipse(this.x, this.y, 60);
    }

    this.drawPortalGun();
    pop();
  }

  drawPortalGun() {
    push();
    translate(this.x + this.facing * 40, this.y + 5);
    rotate(this.facing === 1 ? 0 : PI);

    fill(255);
    noStroke();
    ellipse(0, 0, 38, 12);

    fill(this.gunDot);
    ellipse(15, 0, 8, 8);

    pop();
  }
}

class Shot {
  constructor(x, y, dir, owner) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.owner = owner;
    this.speed = 12;
    this.size = 18;
    this.hit = false;
  }

  update() {
    this.x += this.dir * this.speed;

    let target = this.owner === portal1 ? portal2 : portal1;

    if (!this.hit && dist(this.x, this.y, target.x, target.y) < target.r + this.size) {
      target.vx += this.dir * 35;
      target.vy -= 28;
      this.hit = true;
    }
  }

  draw() {
    rectMode(CENTER);
    fill(140);
    noStroke();
    rect(this.x, this.y, this.size, this.size);
  }

  offscreen() {
    return this.x < -60 || this.x > width + 60 || this.hit;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupGameObjects();
}

function setupGameObjects() {
  groundY = height - 100;
  shots = [];
  winner = "";

  portal1 = new Fighter(
    "Portal 1",
    width * 0.25,
    groundY - 30,
    portalImg1,
    {
      left: 65,
      right: 68,
      up: 87,
      down: 83,
      shoot: 71
    },
    color(0, 150, 255),
    false
  );

  portal2 = new Fighter(
    "Portal 2",
    width * 0.75,
    groundY - 30,
    portalImg2,
    null,
    color(255, 120, 0),
    true
  );

  makePortals();
  chooseRandomActivePortal();
}

function draw() {
  drawBackground();

  if (gameState === "menu") {
    drawMenu();
    return;
  }

  drawArena();
  drawPortals();

  if (gameState === "countdown") {
    portal1.draw();
    portal2.draw();
    drawCountdown();
    drawHUD();
    return;
  }

  if (gameState === "gameOver") {
    drawWinScreen();
    return;
  }

  portal1.update();
  portal2.update();

  checkTeleport(portal1);
  checkTeleport(portal2);

  updateShots();

  portal1.draw();
  portal2.draw();

  checkPortalLoss(portal1, portal2);
  checkPortalLoss(portal2, portal1);

  drawHUD();
}

function drawBackground() {
  if (bgImg) {
    image(bgImg, 0, 0, width, height);
  } else {
    background(255);
  }
}

function drawMenu() {
  fill(0, 180);
  noStroke();
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(54);
  text("PORTAL FIGHTER", width / 2, height * 0.25);

  textSize(24);
  text("Choose your mode, then click START", width / 2, height * 0.35);

  drawButton(width / 2 - 170, height * 0.5, 280, 70, "😊 EASY MODE", color(0, 180, 80), selectedMode === "easy");
  drawButton(width / 2 + 170, height * 0.5, 280, 70, "😡 HARD MODE", color(200, 40, 40), selectedMode === "hard");

  let startColor = selectedMode === "" ? color(100) : color(255, 180, 0);
  drawButton(width / 2, height * 0.68, 280, 70, "START", startColor, false);
}

function drawButton(x, y, w, h, label, buttonColor, selected) {
  rectMode(CENTER);

  if (selected) {
    stroke(255);
    strokeWeight(6);
  } else {
    noStroke();
  }

  fill(buttonColor);
  rect(x, y, w, h, 18);

  noStroke();
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(label, x, y);

  rectMode(CORNER);
}

function mousePressed() {
  if (gameState !== "menu") {
    return;
  }

  if (clickedButton(width / 2 - 170, height * 0.5, 280, 70)) {
    selectedMode = "easy";
    aiMinShootDelay = 4500;
    aiMaxShootDelay = 7000;
    aiAggression = 0.45;
  }

  if (clickedButton(width / 2 + 170, height * 0.5, 280, 70)) {
    selectedMode = "hard";
    aiMinShootDelay = 2000;
    aiMaxShootDelay = 3500;
    aiAggression = 1.1;
  }

  if (clickedButton(width / 2, height * 0.68, 280, 70) && selectedMode !== "") {
    setupGameObjects();
    countdownStart = millis();
    gameState = "countdown";

    if (calmMusic) {
      calmMusic.loop();
    }
  }
}

function clickedButton(x, y, w, h) {
  return (
    mouseX > x - w / 2 &&
    mouseX < x + w / 2 &&
    mouseY > y - h / 2 &&
    mouseY < y + h / 2
  );
}

function drawCountdown() {
  let elapsed = millis() - countdownStart;

  fill(255);
  stroke(0);
  strokeWeight(4);
  textAlign(CENTER, CENTER);
  textSize(90);

  if (elapsed < 1000) {
    text("3...", width / 2, height / 2);
  } else if (elapsed < 2000) {
    text("2...", width / 2, height / 2);
  } else if (elapsed < 3000) {
    text("1!", width / 2, height / 2);
  } else {
    gameState = "playing";

    if (calmMusic) {
      calmMusic.stop();
    }

    if (startGameSound) {
      startGameSound.play();
    }

    if (actionMusic) {
      actionMusic.loop();
    }
  }
}

function keyPressed() {
  if (gameState === "playing") {
    if (keyCode === portal1.controls.shoot) {
      portal1.shoot();
    }
  }
}

function makePortals() {
  portals = [
    { x: 50, y: height * 0.3, w: 30, h: 100 },
    { x: 50, y: height * 0.65, w: 30, h: 100 },

    { x: width - 50, y: height * 0.3, w: 30, h: 100 },
    { x: width - 50, y: height * 0.65, w: 30, h: 100 },

    { x: width / 2, y: 40, w: 120, h: 30 },
    { x: width / 2, y: groundY + 50, w: 120, h: 30 }
  ];
}

function chooseRandomActivePortal() {
  let possible = [0, 1, 2, 3];
  activePortalIndex = random(possible);
}

function drawPortals() {
  for (let i = 0; i < portals.length; i++) {
    let p = portals[i];

    noFill();

    if (i === activePortalIndex) {
      stroke(255, 255, 0);
      strokeWeight(8);
    } else {
      stroke(80, 180, 255);
      strokeWeight(5);
    }

    ellipse(p.x, p.y, p.w, p.h);

    stroke(255, 120, 0);
    strokeWeight(3);
    ellipse(p.x, p.y, p.w + 12, p.h + 12);
  }
}

function checkPortalLoss(loser, winnerFighter) {
  let p = portals[activePortalIndex];

  if (dist(loser.x, loser.y, p.x, p.y) < loser.r + 25) {
    gameState = "gameOver";
    winner = winnerFighter.name;

    if (actionMusic) {
      actionMusic.stop();
    }

    if (calmMusic) {
      calmMusic.stop();
    }

    if (winner === "Portal 1") {
      if (youWinSound) {
        youWinSound.play();
      }
    } else {
      if (deadSpaceGunSound) {
        deadSpaceGunSound.play();
      }

      if (youLoseSound) {
        youLoseSound.play();
      }
    }
  }
}

function checkTeleport(fighter) {
  if (fighter.teleportCooldown > 0) {
    return;
  }

  for (let i = 0; i < portals.length; i++) {
    if (i === activePortalIndex) {
      continue;
    }

    let p = portals[i];

    if (dist(fighter.x, fighter.y, p.x, p.y) < fighter.r + 20) {
      let targetIndex = getPairedPortalIndex(i);
      let target = portals[targetIndex];

      fighter.x = target.x;
      fighter.y = target.y;

      fighter.vx *= 0.7;
      fighter.vy *= 0.7;

      fighter.teleportCooldown = 45;
      return;
    }
  }
}

function getPairedPortalIndex(i) {
  if (i === 0) return 2;
  if (i === 2) return 0;

  if (i === 1) return 3;
  if (i === 3) return 1;

  if (i === 4) return 5;
  if (i === 5) return 4;
}

function updateShots() {
  for (let i = shots.length - 1; i >= 0; i--) {
    shots[i].update();
    shots[i].draw();

    if (shots[i].offscreen()) {
      shots.splice(i, 1);
    }
  }
}

function drawArena() {
  fill(40, 170);
  noStroke();
  rect(0, groundY, width, height - groundY);

  stroke(100);
  strokeWeight(2);
  line(0, groundY, width, groundY);
}

function drawHUD() {
  fill(255);
  noStroke();
  textSize(18);

  textAlign(LEFT);
  text("Portal 1: WASD move   G shoot", 25, 30);

  textAlign(RIGHT);
  text("Mode: " + selectedMode.toUpperCase(), width - 25, 30);
}

function drawWinScreen() {
  background(0);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(50);

  if (winner === "Portal 1") {
    text("🍰 YOU WIN", width / 2, height / 2);
  } else {
    text("💀 YOU LOSE", width / 2, height / 2);
  }

  textSize(22);
  text("Refresh to play again", width / 2, height / 2 + 70);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setupGameObjects();
}