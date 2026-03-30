// ============================================================
// CONFIGURATION & GLOBAL STATE
// ============================================================
const ASCII_CHARS = "*z=a+bi*";
const SLOW_CHARS = "｜+-=*？/#";
const CLOCK_CHARS = "||<>";
const GRID = { cols: 6, rows: 6, focusRow: 1, focusCol: 2 };
const EXAM_ANSWERS = ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'D', 'A', 'B', 'C', 'D', 'D'];
const LETTERS = ['A', 'B', 'C', 'D'];

const Q_IMG_W = 600;
const Q_IMG_H = 200;
const W_IMG_W = 720;
const W_IMG_H = 120;

// Exam & Stage Flow
let stage = 0;
let stage3StartTime = 0;
let stage3RingPlayed = false;
let examStartRingPlayed = false;
let examStarted = false; 
let isExamFinished = false; 
let examFinishTime = 0;

// Question Data
let currentQIndex = 0;
let questions = []; 
let piledUpImages = []; 
let optionBounds = [];  

// Assets
let bgImgs = [];
let qImgs  = [];
let w1Imgs = [];
let w2Imgs = [];
let w3Imgs = [];
let ringSound, projectorSound;

// Visual Elements & Graphics Buffers
let pgStage0;
let texWhite, texPink, texYellow;
let floatingRects = [];
let driftingTextCells = [];
let staticSidePanel = [];
let clockDigits = [];

// Animations & Transforms
let freezeAmount = 0;
let frozenFrame = 0;
let curtainT = 0;
let globalZoom = 1.0;
let targetGlobalZoom = 1.0;

// Projector States
let projectorState = 0;
let projW = 0, projH = 0, projTargetH = 0, projTimer = 0;
let projReadyTimer = 0; 
let projectorReadySent = false;

// Network
let socket;


// ============================================================
// PRELOAD
// ============================================================
function preload() {
  ringSound = loadSound('ring.mp3');
  projectorSound = loadSound('projector.mp3');

  for (let i = 1; i <= 18; i++) {
    bgImgs.push(loadImage(`assets/q${i}.png`));
    qImgs.push(loadImage(`assets/q${i}-q.png`));
    w1Imgs.push(loadImage(`assets/q${i}-w1.png`));
    w2Imgs.push(loadImage(`assets/q${i}-w2.png`));
    w3Imgs.push(loadImage(`assets/q${i}-w3.png`));
  }
}


// ============================================================
// SETUP & INITIALIZATION
// ============================================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  pgStage0 = createGraphics(windowWidth, windowHeight / 2, WEBGL);

  initAnimatedTextures();
  initFloatingRects();
  initBlackboard();
  initPoster();
  initClock();

  socket = io.connect('http://localhost:8000');

  // Network Event Listeners
  socket.on('stage-n', d => {
    if ([1, 2, 3].includes(d.stage) && stage !== d.stage) frozenFrame = frameCount;
    if (d.stage === 3 && stage !== 3) {
      stage3StartTime = millis();
      if (ringSound) ringSound.play();
      stage3RingPlayed = true;
      examStartRingPlayed = false;
    }
    stage = d.stage;
  });

  socket.on('start-projector', () => {
    projectorState = 1;
    projectorReadySent = false;
    projReadyTimer = 0;
    projW = width * 0.57;
    projTargetH = projW * (height / width);
    projH = 0;
    globalZoom = 1.0;
    targetGlobalZoom = 1.0;
    if (projectorSound) { 
      projectorSound.setVolume(1.0); 
      projectorSound.loop(); 
    }
  });

  socket.on('exam-finished', () => {
    if (!isExamFinished) {
      isExamFinished = true;
      examFinishTime = millis();
    }
  });

  socket.on('answer-correct', (data) => {
    if (stage === 3 && examStarted && data.qIndex === currentQIndex) {
      // Alternate left/right for stacked discarded options
      questions[currentQIndex].wanderingImgs.forEach((wImg) => {
        let isLeft = (piledUpImages.length % 2 === 0);
        let newX = isLeft ? random(-100, 100) : width - W_IMG_W + random(-100, 100); 
        let newY = random(50, height - 150);

        piledUpImages.push({
          img: wImg.img,
          x: newX,
          y: newY,
          rotation: random(-PI / 6, PI / 6),
        });
      });
      currentQIndex++;
    }
  });

  // Layout Option Bounds
  const GAP = 8;
  const areaY = height / 4;
  const areaH = height * 3 / 4;
  const slotH = (areaH - GAP * 3) / 4;

  optionBounds = [
    { x: 0, y: areaY, w: width, h: slotH },                         // A
    { x: 0, y: areaY + (slotH + GAP), w: width, h: slotH },         // B
    { x: 0, y: areaY + (slotH + GAP) * 2, w: width, h: slotH },     // C
    { x: 0, y: areaY + (slotH + GAP) * 3, w: width, h: slotH },     // D
  ];

  // Initialize Exam Questions
  for (let i = 0; i < 18; i++) {
    const correctLetter = EXAM_ANSWERS[i];
    const correctAnsIndex = LETTERS.indexOf(correctLetter);
    const wrongOptIndices = [0, 1, 2, 3].filter(opt => opt !== correctAnsIndex);
    const wrongImgPool = [w1Imgs[i], w2Imgs[i], w3Imgs[i]];

    const wanderingImgs = wrongOptIndices.map((optIdx, k) => {
      const b = optionBounds[optIdx];
      const targetX = b.x + (b.w - W_IMG_W) / 2;
      const targetY = b.y + (b.h - W_IMG_H) / 2;
      const start = randomOffscreenStart(targetX, targetY);

      return {
        optIndex: optIdx,
        x: start.x,
        y: start.y,
        vx: 0,
        vy: 0,
        img: wrongImgPool[k],
        appearDelay: random(3000, 4000) * (k + 1), 
        lerpSpeed: 0.1,         
        changeFreq: floor(random(120, 240))       
      };
    });

    questions.push({
      bg: bgImgs[i],
      qImg: qImgs[i],
      correctOpt: correctAnsIndex,
      wanderingImgs,
      startTime: 0
    });
  }
}

// Generate a random off-screen start coordinate (Top, Bottom, Left, Right)
function randomOffscreenStart(targetX, targetY) {
  const side = floor(random(4)); 
  if (side === 0) return { x: targetX,        y: -W_IMG_H - 200 };
  if (side === 1) return { x: targetX,        y: height + 200   };
  if (side === 2) return { x: -W_IMG_W - 200, y: targetY        };
                  return { x: width + 200,    y: targetY        };
}


// ============================================================
// ENVIRONMENT GENERATORS
// ============================================================
function initFloatingRects() {
  for (let r = 0; r < GRID.rows; r++) {
    for (let c = 0; c < GRID.cols; c++) {
      const isF = (r === GRID.focusRow && c === GRID.focusCol);
      floatingRects.push({
        row: r, col: c,
        floatPhase: random(TWO_PI),
        floatSpeed: isF ? 0.04 : 0.01,
        amplitude:  isF ? 35   : 4,
      });
    }
  }
}

function initBlackboard() {
  const cCols = 25, cRows = 8;
  const occupied = Array.from({ length: cRows }, () => Array(cCols).fill(false));

  for (let r = 0; r < cRows; r++) {
    for (let c = 0; c < cCols; c++) {
      if (occupied[r][c] || random() > 0.45) continue;
      const bCols = min(floor(random(3, 8)), cCols - c);
      const bRows = min(floor(random(2, 4)), cRows - r);
      let canPlace = true;
      for (let i = 0; i < bRows && canPlace; i++)
        for (let j = 0; j < bCols && canPlace; j++)
          if (occupied[r+i][c+j]) canPlace = false;
      if (canPlace) {
        for (let i = 0; i < bRows; i++)
          for (let j = 0; j < bCols; j++)
            occupied[r+i][c+j] = true;
        driftingTextCells.push({
          col: c, row: r, bCols, bRows,
          charOffset: floor(random(SLOW_CHARS.length)),
          period: floor(random(2000, 3000)),
        });
      }
    }
  }
}

function initPoster() {
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 6; c++)
      staticSidePanel.push({ col: c, row: r, char: SLOW_CHARS.charAt(floor(random(SLOW_CHARS.length))) });
}

function initClock() {
  for (let i = 0; i < 5; i++)
    clockDigits.push({ isColon: i === 2, charOffset: floor(random(CLOCK_CHARS.length)), period: floor(random(90, 240)) });
}


// ============================================================
// MAIN DRAW LOOP
// ============================================================
function draw() {
  freezeAmount += (([1, 2, 3].includes(stage) ? 1 : 0) - freezeAmount) * 0.05;
  globalZoom   += (targetGlobalZoom - globalZoom) * 0.05;

  background(255);
  push();
  translate(width / 2, 0);
  scale(globalZoom);
  translate(-width / 2, 0);

  if (stage === 0) {
    drawEnvironment(false);
  } else if (stage === 1 || stage === 2) {
    drawEnvironment(true);
    drawProjector();
    if (projectorState >= 4) drawProjectorText();
  } else if (stage === 3) {
    if (!examStarted) {
      drawEnvironment(true);
      drawProjector();
      if (projectorState >= 4) drawExamInstructions();
    } else {
      pop();
      drawActiveExam();
      push();
    }
  } else {
    pop();
    background(stage === 4 ? color(0, 0, 255) : color(0, 255, 255));
    fill(0); 
    text(`stage ${stage}`, 10, 20);
    push();
  }
  pop();
}

function drawEnvironment(showExtras) {
  drawCurtain();
  drawBlackboard(showExtras);
  drawBottomGrid();
  if (showExtras) { drawPoster(); drawClock(); }
}


// ============================================================
// COMPONENT RENDERERS
// ============================================================
function drawBlackboard(showText) {
  const topW = width * 0.6;
  const topX = (width - topW) / 2;
  const topY = height * 0.1;
  const topH = height / 2 - topY;

  drawInPlaceAsciiBox(window, topX, topY, topW, topH, color(255));

  push();
  fill(200); textSize(14); textFont('monospace'); textAlign(CENTER, CENTER);
  for (let y = 0; y <= height / 1.6; y += 24) {
    drawSingleAscii(window, topX - 200, y);
    drawSingleAscii(window, topX + topW + 200, y);
  }
  if (showText) {
    textAlign(LEFT, TOP); textSize(22); noStroke();
    fill(200, map(freezeAmount, 0, 1, 0, 255));
    const innerX = topX + 40;
    const innerY = topY + topH * 0.35;
    const cellW  = (topW - 80) / 25;
    const cellH  = (topH * 0.65 - 25) / 8;
    for (const b of driftingTextCells) {
      const timeStep = floor(frameCount / b.period);
      for (let br = 0; br < b.bRows; br++)
        for (let bc = 0; bc < b.bCols; bc++) {
          let charIndex = (b.charOffset + bc * 3 + br * 5 + timeStep) % SLOW_CHARS.length;
          text(SLOW_CHARS.charAt(charIndex), innerX + (b.col + bc) * cellW, innerY + (b.row + br) * cellH);
        }
    }
  }
  pop();
}

function drawPoster() {
  const panelW = 90, panelH = 140, bStep = 12;
  const panelX = width * 0.2 - 90 - 30;
  const panelY = height * 0.29;
  push();
  textFont('monospace'); textAlign(LEFT, TOP); textSize(11); noStroke();
  fill(200, map(freezeAmount, 0, 1, 0, 255));
  for (let x = panelX; x <= panelX + panelW; x += bStep) { text('——', x, panelY); text('——', x, panelY + panelH); }
  for (let y = panelY; y <= panelY + panelH; y += bStep) { text('|', panelX, y); text('|', panelX + panelW, y); }
  fill(170, map(freezeAmount, 0, 1, 0, 255));
  for (const c of staticSidePanel) text(c.char, panelX + 6 + c.col * (panelW / 6), panelY + 6 + c.row * (panelH / 10));
  pop();
}

function drawClock() {
  const clockW = 120, clockH = 48, bStep = 12;
  const clockX = width * 0.8, clockY = height * 0.1 - clockH * 1.5;
  const alpha  = map(freezeAmount, 0, 1, 0, 255);
  push();
  textFont('monospace'); textAlign(CENTER, CENTER); textSize(12);
  stroke(220, alpha - 20); strokeWeight(2); fill(220, alpha - 20);
  for (let x = clockX; x <= clockX + clockW; x += bStep) { text('-', x, clockY); text('-', x, clockY + clockH); }
  for (let y = clockY; y <= clockY + clockH; y += bStep) { text('=', clockX, y); text('=', clockX + clockW, y); }
  noStroke(); textSize(30); fill(200, alpha);
  for (let i = 0; i < 5; i++) {
    const d = clockDigits[i];
    let ch = d.isColon ? ":" : CLOCK_CHARS.charAt((d.charOffset + floor(frameCount / d.period)) % CLOCK_CHARS.length);
    text(ch, clockX + (clockW / 5) * (i + 0.5), clockY + clockH / 2);
  }
  pop();
}

function drawCurtain() {
  curtainT += 0.02;
  const maxSway = sin(curtainT) * width * 0.05 * (1 - freezeAmount * 0.6);
  push(); fill(130); noStroke(); textSize(14); textFont('monospace'); textAlign(CENTER, CENTER);
  drawCurtainSide('left',  width * 0.01, height * 0.6, maxSway);
  drawCurtainSide('right', width * 0.99, height * 0.6, maxSway);
  pop();
}

function drawCurtainSide(side, vx, vy, maxSway) {
  const step = 14;
  const bottomX = vx + maxSway;
  const isLeft = (side === 'left');
  for (let y = 0; y <= vy; y += step)
    drawSingleAscii(window, vx + maxSway * sin((y / vy) * HALF_PI), y);
  
  const xStart = bottomX;
  const xEnd = isLeft ? -30 : width + 30;
  const xStep = isLeft ? -step : step;
  
  for (let x = xStart; isLeft ? x >= xEnd : x <= xEnd; x += xStep) {
    const dist = abs(bottomX - x);
    const amp  = height * 0.02 * (dist / abs(xEnd - bottomX));
    let waveOffset = isLeft ? sin(x * 0.05 + PI + curtainT) : cos(x * 0.06 + curtainT);
    drawSingleAscii(window, x, vy + dist * 0.7 + amp * waveOffset);
  }
}

function drawProjector() {
  if (projectorState === 0) return;
  const baseProjW = width * 0.57;
  const now = millis(), dt = now - projTimer;

  if      (projectorState === 1   && abs(projH - projTargetH) < 2)              { projectorState = 1.5; projTimer = now; if (projectorSound?.isPlaying()) { projectorSound.fade(0, 0.2); setTimeout(() => projectorSound.stop(), 200); } }
  else if (projectorState === 1.5 && dt > 3000)                                 { projectorState = 2;   targetGlobalZoom = (width * 0.7)  / baseProjW; if (ringSound) ringSound.play(); }
  else if (projectorState === 2   && abs(globalZoom - targetGlobalZoom) < 0.02) { projectorState = 2.5; projTimer = now; }
  else if (projectorState === 2.5 && dt > 3000)                                 { projectorState = 3;   targetGlobalZoom = (width * 0.85) / baseProjW; if (ringSound) ringSound.play(); }
  else if (projectorState === 3   && abs(globalZoom - targetGlobalZoom) < 0.02) { projectorState = 3.5; projTimer = now; }
  else if (projectorState === 3.5 && dt > 3000)                                 { projectorState = 4;   targetGlobalZoom = width / baseProjW;          if (ringSound) ringSound.play(); }

  if (projectorState >= 1 && projectorState < 2) projH = lerp(projH, projTargetH, 0.015);

  const isMaxState = projectorState === 4 && abs(globalZoom - targetGlobalZoom) < 0.02;
  if (isMaxState) {
    if (projReadyTimer === 0) projReadyTimer = millis();
    if (!projectorReadySent && millis() - projReadyTimer > 3000) { 
      projectorReadySent = true; 
      socket.emit('projector-ready'); 
    }
  }

  drawInPlaceAsciiBox(window, (width - projW) / 2, 0, projW, projH, color(255), "/");

  const timeAtMax = isMaxState ? millis() - projReadyTimer : 0;
  const isZooming = projectorState >= 1.5 && !isMaxState;
  const canFlicker = isZooming || (isMaxState && timeAtMax < 2500);
  
  if (canFlicker) {
    const threshold = isZooming ? 0.8 : map(timeAtMax, 0, 2500, 0.65, 1);
    if (noise(frameCount * 0.2) > threshold || random() < 0.04) {
      push(); 
      fill(random(5, 10), 80); 
      noStroke(); 
      rect((width - projW) / 2, 0, projW, projH); 
      pop();
    }
  }
}

function drawProjectorText() {
  if (projReadyTimer === 0) return;
  const timeShown = millis() - projReadyTimer;
  if (timeShown < 1000) return;
  push();
  let textAlpha = (timeShown < 2000 && random() < 0.2) ? random(50, 150) : 255;
  fill(0, textAlpha); noStroke(); textFont("Noto Serif SC");
  translate(width / 2, 0); scale(0.9, 1.0);
  textAlign(CENTER, CENTER); textSize(32);
  text("请在下节课开始前换好座位", 0, projH / 2);
  pop();
}

function drawExamInstructions() {
  if (projReadyTimer === 0) return;
  const timeShown = millis() - projReadyTimer;
  if (timeShown < 1000) return;
  push();
  fill(0); noStroke();
  
  const elapsed = (millis() - stage3StartTime) / 1000;
  const timeLeft = Math.floor(Math.max(0, 5 - elapsed));
  
  if (timeLeft === 0 && !examStartRingPlayed) {
    if (ringSound) ringSound.play();
    examStartRingPlayed = true;
    examStarted = true;
    socket.emit('exam-start');
  }

  textFont("Noto Serif SC");
  translate(width / 2, 0); scale(0.9, 1.0);
  textAlign(CENTER, TOP); textSize(32);
  text("考试即将开始 00:" + nf(timeLeft, 2), 0, projH * 0.15);
  textSize(18); textAlign(LEFT, TOP);
  
  const rules = [
    "考生须知",
    "1）遇到题干变化不用慌张，新题旧题都是换汤不换药；",
    "2）对选项有不理解之处不可以举手问老师，一旦选择，无法反悔；",
    "3）可与同伴讨论，也要注重独立思考，切忌偏听偏信；",
    "4）本场考试全是送分题；",
    "5）相信自己，你的答案超乎你的想象。",
  ];
  
  const startY = projH * 0.25, lineH = projH * 0.08, relX = -projW * 0.4;
  rules.forEach((r, i) => text(r, relX, startY + i * lineH));
  
  textAlign(CENTER, BOTTOM); textSize(28);
  text("沉着冷静    认真答卷", 0, projH * 0.85);
  pop();
}


// ============================================================
// ASCII UTILITIES & TEXTURES
// ============================================================
function drawBottomGrid() {
  pgStage0.clear(); pgStage0.push(); pgStage0.rotateX(PI / 2.5); pgStage0.noStroke();
  const spX = pgStage0.width * 0.3, spY = pgStage0.height * 0.5;
  const rW  = spX * 0.65,            rH  = spY * 0.65;
  const sX  = -(GRID.cols - 1) * spX / 2, sY = -(GRID.rows - 1) * spY / 2;
  
  updateAnimatedTextures(color(255), color(255, 231, 243), color(252, 255, 156));
  
  for (const it of floatingRects) {
    pgStage0.push();
    const zOffset = sin(frameCount * it.floatSpeed + it.floatPhase) * it.amplitude * (1 - freezeAmount);
    pgStage0.translate(sX + it.col * spX, sY + it.row * spY - pgStage0.height * 0.55, zOffset);
    if      (it.row === GRID.focusRow && it.col === GRID.focusCol) pgStage0.texture(texPink);
    else if (it.row === 2 && it.col === 2)                          pgStage0.texture(texYellow);
    else                                                            pgStage0.texture(texWhite);
    pgStage0.rect(-rW / 2, -rH / 2, rW, rH);
    pgStage0.pop();
  }
  pgStage0.pop(); image(pgStage0, 0, height / 2);
}

function drawSingleAscii(ctx, x, y) {
  const fc = floor(lerp(frameCount, frozenFrame, freezeAmount));
  let charIndex = floor(fc * 0.2 + abs(sin(x * 12.9898 + y * 78.233)) * 43758.5453) % ASCII_CHARS.length;
  charIndex = (charIndex + ASCII_CHARS.length) % ASCII_CHARS.length;
  ctx.text(ASCII_CHARS.charAt(charIndex), x, y);
}

function drawInPlaceAsciiBox(ctx, rx, ry, rw, rh, bgColor, customChar = null) {
  if (rw <= 0 || rh <= 0) return;
  ctx.push(); ctx.fill(bgColor); ctx.noStroke(); ctx.rect(rx, ry, rw, rh);
  ctx.fill(160); ctx.textSize(14); ctx.textFont('monospace'); ctx.textAlign(ctx.CENTER, ctx.CENTER);
  
  const step = 12, pad = 6;
  const l = rx + pad, t = ry + pad, r = rx + rw - pad, b = ry + rh - pad;
  if (l >= r || t >= b) { ctx.pop(); return; }
  
  const drawChar = (x, y) => customChar ? ctx.text(customChar, x, y) : drawSingleAscii(ctx, x, y);
  for (let x = l; x < r; x += step) drawChar(x, t);
  for (let y = t; y < b; y += step) drawChar(r, y);
  for (let x = r; x > l; x -= step) drawChar(x, b);
  for (let y = b; y > t; y -= step) drawChar(l, y);
  ctx.pop();
}

function initAnimatedTextures() {
  if (texWhite) { texWhite.remove(); texPink.remove(); texYellow.remove(); }
  const w = windowWidth * 0.195, h = windowHeight * 0.1625;
  texWhite  = createGraphics(w, h);
  texPink   = createGraphics(w, h);
  texYellow = createGraphics(w, h);
}

function updateAnimatedTextures(cWhite, cPink, cYellow) {
  drawInPlaceAsciiBox(texWhite,  0, 0, texWhite.width,  texWhite.height,  cWhite);
  drawInPlaceAsciiBox(texPink,   0, 0, texPink.width,   texPink.height,   cPink);
  drawInPlaceAsciiBox(texYellow, 0, 0, texYellow.width, texYellow.height, cYellow);
}


// ============================================================
// EXAM RENDERER
// ============================================================
function drawActiveExam() {
  // End of exam power-off sequence
  if (isExamFinished) {
    const dt = millis() - examFinishTime;
    
    if (dt > 1000) { 
      // Total blackout after 2.5 seconds
      background(0);
      return;
    } else {
      // Struggle phase: increasing blackout probability
      let threshold = map(dt, 0, 1000, 0.8, 0.2); 
      // Use noise and random logic for continuous and sudden flickering
      if (noise(frameCount * 0.4) > threshold || random() < (dt / 1000 * 0.2)) {
        background(0); 
        return;  
      }
    }
  }

  // Prevent drawing index out of bounds
  if (currentQIndex >= 18) return;

  const q = questions[currentQIndex];
  if (q.startTime === 0) q.startTime = millis();
  const elapsedInQuestion = millis() - q.startTime;

  // 1. Fullscreen Background
  image(q.bg, 0, 0, width, height);

  // 2. Discarded Images (Stacked)
  for (const p of piledUpImages) {
    push();
    translate(p.x + W_IMG_W / 2, p.y + W_IMG_H / 2);
    rotate(p.rotation);
    image(p.img, -W_IMG_W / 2, -W_IMG_H / 2, W_IMG_W, W_IMG_H);
    pop();
  }

  // 3. Main Question Image
  const qDrawX = (width - Q_IMG_W) / 2;
  const qDrawY = height * 0.08;
  const alphaVal = map(sin(frameCount * 0.1), -1, 1, 100, 255);
  
  push();
  tint(255, alphaVal);
  image(q.qImg, qDrawX, qDrawY, Q_IMG_W, Q_IMG_H);
  pop();

  // 4. Wandering Wrong Options (with delay and dynamic movement)
  const badBounds = q.wanderingImgs.map(w => optionBounds[w.optIndex]);

  for (let i = 0; i < q.wanderingImgs.length; i++) {
    const wImg = q.wanderingImgs[i];
    
    if (elapsedInQuestion > wImg.appearDelay) {
      const myTargetIndex = Math.floor(frameCount / wImg.changeFreq) % badBounds.length;
      const b = badBounds[myTargetIndex];

      const targetX = b.x + (b.w - W_IMG_W) / 2;
      const targetY = b.y + (b.h - W_IMG_H) / 2;

      wImg.x = lerp(wImg.x, targetX, wImg.lerpSpeed);
      wImg.y = lerp(wImg.y, targetY, wImg.lerpSpeed);

      image(wImg.img, wImg.x, wImg.y, W_IMG_W, W_IMG_H);
    }
  }
}


// ============================================================
// WINDOW & INPUT HANDLERS
// ============================================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pgStage0.remove();
  pgStage0 = createGraphics(windowWidth, windowHeight / 2, WEBGL);
  initAnimatedTextures();
}

function keyPressed() {
  if (key >= '0' && key <= '5') {
    let nextStage = int(key);
    if (['1', '2', '3'].includes(key) && stage !== nextStage) frozenFrame = frameCount;
    if (nextStage === 3 && stage !== 3) {
      stage3StartTime = millis();
      if (ringSound) ringSound.play();
      stage3RingPlayed = true;
      examStartRingPlayed = false;
    }
    stage = nextStage;
    if (socket?.connected) socket.emit('stage-n', { stage });
  }
}