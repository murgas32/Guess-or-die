// Guess or Die - Atmospheric 3D Turn-based Horror Trivia Game

const BOARD_SIZE = 50;

// Fisher-Yates shuffle (Array.sort with random comparator is biased)
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Generate randomized board layout for each match:
// Casilla 0 (Tile 1): 'S' (Start / Salida in center)
// Casilla 49 (Tile 50): 'M' (Meta at outer rim)
// Casilla 24 (Tile 25): 'L' (Limbo midpoint landmark)
// Casilla 40 (Tile 41): 'L' (Limbo endgame peril)
// Remaining 46 tiles: 25 Questions ('Q'), 12 Benefits ('B'), 9 Punishments ('P')
function generateRandomLayout() {
  const pool = [
    ...Array(25).fill("Q"),
    ...Array(12).fill("B"),
    ...Array(9).fill("P")
  ];
  const shuffled = shuffle(pool);
  const layout = new Array(BOARD_SIZE);
  layout[0] = "S";
  layout[BOARD_SIZE - 1] = "M";
  layout[24] = "L";
  layout[40] = "L";
  let poolIdx = 0;
  for (let i = 1; i < BOARD_SIZE - 1; i++) {
    if (i !== 24 && i !== 40) {
      layout[i] = shuffled[poolIdx++];
    }
  }
  return layout;
}

let currentLayout = generateRandomLayout();
const COLORS = ["#d9b25a", "#8fb3c4", "#c0708a", "#8aa05c"];

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Multi-language dictionary
const I18N = {
  es: {
    tag: "Una sola respuesta errónea te devuelve al inicio. A las 3 fallas o al caer en el Limbo, mueres.",
    note: "Todos juegan en esta computadora, por turnos. El primero en llegar a la META (casilla 50) o el último sobreviviente gana.",
    noteSolo: "Juegas solo: llega a la META (casilla 50) antes de acumular 3 fallas o sucumbir en el Limbo.",
    langLabel: "Idioma / Language:",
    timerLabel: "Tiempo por pregunta:",
    timerOff: "Sin límite",
    playersLabel: "¿Cuántos jugadores?",
    namesLabel: "Nombres de los jugadores:",
    defaultPlayer: (i) => `Jugador ${i}`,
    startBtn: "Entrar a la oscuridad",
    rollBtn: "Lanzar el dado",
    qualityHigh: "Calidad: alta",
    qualityLow: "Calidad: baja",
    mainMenu: "Menú principal",
    confirmLeave: "¿Abandonar la partida y regresar al menú principal?",
    rollOrderPrompt: "lanza para decidir el orden de turnos",
    rollPrompt: "lanza el dado",
    rolled: (name, v) => `${name} sacó un ${v}.`,
    tie: (v) => `Empate en ${v}. Vuelvan a lanzar.`,
    firstGoes: (name) => `${name} va primero.`,
    losesTurn: (name) => `${name} pierde un turno.`,
    heldInPlace: (name) => `${name} está atrapado y pierde este turno.`,
    whispersFadeTitle: "Los susurros se apagan",
    whispersFadeText: "No hay pregunta esta vez.",
    noQuestionsTitle: "No se cargaron preguntas",
    noQuestionsText: "Verifica que questions.js esté en la misma carpeta.",
    translateBtnShow: "Ver en inglés",
    translateBtnHide: "Ocultar inglés",
    correctFeedback: "Correcto. Sobrevives a esta casilla.",
    wrongFeedbackShield: (ans) => `Incorrecto. ${ans}. Pero el círculo de sal te protege del abismo.`,
    wrongFeedbackLives: (ans, livesLeft) => `Incorrecto. ${ans}. Vuelves al inicio. Te quedan ${livesLeft} ${livesLeft === 1 ? "vida" : "vidas"}.`,
    thirdFailureDeath: (ans) => `Incorrecto. ${ans}. Has acumulado 3 fallas. Has muerto y ahora eres un espectador.`,
    timeExpiredFeedbackShield: (ans) => `Tiempo agotado. ${ans}. Pero el círculo de sal te protege.`,
    timeExpiredFeedbackLives: (ans, livesLeft) => `Tiempo agotado. ${ans}. Vuelves al inicio. Te quedan ${livesLeft} ${livesLeft === 1 ? "vida" : "vidas"}.`,
    timeExpiredDeath: (ans) => `Tiempo agotado. ${ans}. Has acumulado 3 fallas. Has muerto y ahora eres un espectador.`,
    answeredCorrectLog: (name) => `${name} respondió correctamente.`,
    failedSaltLog: (name) => `${name} falló, pero el círculo de sal le protegió.`,
    failedLogLives: (name, fails) => `${name} falló la pregunta (${fails}/3 fallas) y volvió al inicio.`,
    playerDiedLog: (name) => `${name} acumuló 3 fallas y ha muerto. Ahora es un espectador.`,
    spectatorBadge: "ESPECTADOR",
    btnContinue: "Continuar",
    btnBackToStart: "Volver al inicio",
    soloWinTitle: "Has logrado escapar",
    soloWinText: "Alcanzaste la META en la casilla 50 y sobreviviste a la oscuridad.",
    multiWinTitle: (name) => `${name} ha alcanzado la META`,
    multiWinText: "Llegó a la casilla 50 y escapó de la oscuridad.",
    lastSurvivorTitle: (name) => `${name} es el único sobreviviente`,
    lastSurvivorText: "Todos los demás han perecido en la oscuridad. Eres el único que queda con vida.",
    soloGameOverTitle: "Has muerto",
    soloGameOverText: "Acumulaste 3 fallas. Tu alma quedó atrapada en la oscuridad para siempre.",
    gameOverAllDeadTitle: "Nadie ha sobrevivido",
    gameOverAllDeadText: "Todos los jugadores han muerto. La oscuridad los consumió a todos.",
    playAgain: "Jugar de nuevo",
    preparing: "Preparando la sala...",
    limboTitle: "LIMBO",
    limboSubtitle: "Pregunta de vida o muerte",
    limboWarning: "Has caído en el abismo del Limbo. Una sola respuesta incorrecta o que se extinga la vela significará tu MUERTE INMEDIATA.",
    limboEscaped: "¡Correcto! Has escapado del Limbo y tu alma sobrevive.",
    limboEscapedLog: (name) => `${name} superó la prueba del Limbo y salvó su vida.`,
    limboShieldSaved: (ans) => `Incorrecto. ${ans}. ¡El círculo de sal se destruye salvándote de la muerte en el Limbo!`,
    limboShieldLog: (name) => `${name} se salvó del Limbo gracias a su círculo de sal.`,
    limboDied: (ans) => `Incorrecto. ${ans}. El Limbo te consume por completo. Has muerto al instante.`,
    limboTimeoutDied: (ans) => `Tiempo agotado. ${ans}. El Limbo te consume por completo. Has muerto al instante.`,
    limboDiedLog: (name) => `${name} cayó en el Limbo y ha muerto. Ahora es un espectador.`,
    effects: {
      B1: { title: "La vela arde con más fuerza", text: "La oscuridad te deja pasar. Avanzas 2 casillas." },
      B2: { title: "Un círculo de sal", text: "Estás protegido. Tu próxima respuesta incorrecta será perdonada." },
      B3: { title: "Los susurros se apagan", text: "La siguiente casilla de pregunta guardará silencio." },
      P1: { title: "El suelo cede", text: "Algo te arrastra 2 casillas hacia atrás." },
      P2: { title: "Algo te retiene", text: "Pierdes tu siguiente turno." },
    }
  },
  en: {
    tag: "One wrong answer sends you to the start. At 3 strikes or falling in Limbo, you die.",
    note: "Everyone plays on this computer, taking turns. First to reach the GOAL (tile 50) or last survivor wins.",
    noteSolo: "Playing solo: reach the GOAL (tile 50) before getting 3 strikes or perishing in Limbo.",
    langLabel: "Language / Idioma:",
    timerLabel: "Time per question:",
    timerOff: "No limit",
    playersLabel: "How many players?",
    namesLabel: "Player names:",
    defaultPlayer: (i) => `Player ${i}`,
    startBtn: "Enter the Dark",
    rollBtn: "Roll the die",
    qualityHigh: "Quality: high",
    qualityLow: "Quality: low",
    mainMenu: "Main menu",
    confirmLeave: "Leave the game and return to the main menu?",
    rollOrderPrompt: "roll to decide the turn order",
    rollPrompt: "roll the die",
    rolled: (name, v) => `${name} rolled ${v}.`,
    tie: (v) => `Tie on ${v}. Roll again.`,
    firstGoes: (name) => `${name} goes first.`,
    losesTurn: (name) => `${name} loses a turn.`,
    heldInPlace: (name) => `${name} is held in place and loses this turn.`,
    whispersFadeTitle: "The whispers fade",
    whispersFadeText: "No question this time.",
    noQuestionsTitle: "No questions loaded",
    noQuestionsText: "Check that questions.js is in the same folder as index.html.",
    translateBtnShow: "Translate to Spanish",
    translateBtnHide: "Hide translation",
    correctFeedback: "Correct. You survive this tile.",
    wrongFeedbackShield: (ans) => `Wrong. ${ans}. But the circle of salt holds: you are spared.`,
    wrongFeedbackLives: (ans, livesLeft) => `Wrong. ${ans}. Back to start. You have ${livesLeft} ${livesLeft === 1 ? "life" : "lives"} left.`,
    thirdFailureDeath: (ans) => `Wrong. ${ans}. You reached 3 strikes. You died and are now a spectator.`,
    timeExpiredFeedbackShield: (ans) => `Time expired. ${ans}. But the circle of salt holds: you are spared.`,
    timeExpiredFeedbackLives: (ans, livesLeft) => `Time expired. ${ans}. Back to start. You have ${livesLeft} ${livesLeft === 1 ? "life" : "lives"} left.`,
    timeExpiredDeath: (ans) => `Time expired. ${ans}. You reached 3 strikes. You died and are now a spectator.`,
    answeredCorrectLog: (name) => `${name} answered correctly.`,
    failedSaltLog: (name) => `${name} failed, but the salt circle protected them.`,
    failedLogLives: (name, fails) => `${name} failed the question (${fails}/3 strikes) and returned to start.`,
    playerDiedLog: (name) => `${name} reached 3 strikes and died. They are now a spectator.`,
    spectatorBadge: "SPECTATOR",
    btnContinue: "Continue",
    btnBackToStart: "Back to start",
    soloWinTitle: "You escaped the dark",
    soloWinText: "You reached the GOAL at tile 50 and survived.",
    multiWinTitle: (name) => `${name} reached the GOAL`,
    multiWinText: "Reached tile 50 and escaped the darkness.",
    lastSurvivorTitle: (name) => `${name} is the last survivor`,
    lastSurvivorText: "Everyone else has perished in the dark. You won the game.",
    soloGameOverTitle: "You died",
    soloGameOverText: "You accumulated 3 strikes. Your soul is trapped in the dark forever.",
    gameOverAllDeadTitle: "Everyone died",
    gameOverAllDeadText: "All players have died. The darkness consumed everyone.",
    playAgain: "Play again",
    preparing: "Preparing the room...",
    limboTitle: "LIMBO",
    limboSubtitle: "Life or death question",
    limboWarning: "You have fallen into the abyss of Limbo. A single wrong answer or running out of time means INSTANT DEATH.",
    limboEscaped: "Correct! You escaped Limbo and your soul survives.",
    limboEscapedLog: (name) => `${name} overcame Limbo and saved their life.`,
    limboShieldSaved: (ans) => `Wrong. ${ans}. The circle of salt shatters, saving your life from Limbo!`,
    limboShieldLog: (name) => `${name} was saved from Limbo by the salt circle.`,
    limboDied: (ans) => `Wrong. ${ans}. Limbo claims your soul completely. You died instantly.`,
    limboTimeoutDied: (ans) => `Time expired. ${ans}. Limbo claims your soul completely. You died instantly.`,
    limboDiedLog: (name) => `${name} fell into Limbo and died. They are now a spectator.`,
    effects: {
      B1: { title: "The candle burns brighter", text: "The dark lets you pass. Move forward 2 tiles." },
      B2: { title: "A circle of salt", text: "You are protected. Your next wrong answer will be forgiven." },
      B3: { title: "The whispers fade", text: "The next question tile will stay silent." },
      P1: { title: "The floor gives way", text: "Something drags you back 2 tiles." },
      P2: { title: "Something holds you", text: "You lose your next turn." },
    }
  }
};

const CATEGORY_NAMES = {
  es: {
    Sports: "Deportes",
    History: "Historia",
    Mathematics: "Matemáticas",
    Geography: "Geografía"
  },
  en: {
    Sports: "Sports",
    History: "History",
    Mathematics: "Mathematics",
    Geography: "Geography"
  }
};

let gameLang = "es";
let timerSeconds = 20;

const PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
// Rotation (x, y) that brings each face to the front of the cube.
const FACE_ROT = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] };
let spinX = 0, spinY = 0, yaw = 0;

let players = [];
let order = [];
let tiles = [];

// Spiral geometry constants for the 50-tile Archimedean spiral board
const SPIRAL_CX = 340;
const SPIRAL_CY = 340;
const SPIRAL_R0 = 40;
const SPIRAL_W = 68;
const SPIRAL_B = SPIRAL_W / (2 * Math.PI);
const SPIRAL_A0 = (215 * Math.PI) / 180; // 215 deg so Tile 50 finishes at top-left ~10:30 o'clock

function getSpiralTileCoord(i) {
  if (i === 0) {
    return { x: SPIRAL_CX, y: SPIRAL_CY, rMid: 0, aMid: SPIRAL_A0, th1: 0, th2: 2 * Math.PI };
  }
  let turn = 0, n = 12, j = 0;
  if (i <= 12) {
    turn = 0; n = 12; j = i - 1;
  } else if (i <= 29) {
    turn = 1; n = 17; j = i - 13;
  } else {
    turn = 2; n = 20; j = i - 30;
  }
  const tBase = turn * 2 * Math.PI;
  const th1 = tBase + (j / n) * 2 * Math.PI;
  const th2 = tBase + ((j + 1) / n) * 2 * Math.PI;
  const thMid = (th1 + th2) / 2;
  const aMid = SPIRAL_A0 + thMid;
  const rIn = SPIRAL_R0 + SPIRAL_B * thMid;
  const rOut = SPIRAL_R0 + SPIRAL_B * (thMid + 2 * Math.PI);
  const rMid = (rIn + rOut) / 2;
  const x = Math.round(SPIRAL_CX + rMid * Math.cos(aMid));
  const y = Math.round(SPIRAL_CY + rMid * Math.sin(aMid));
  return { x, y, rMid, aMid, th1, th2 };
}

function getSpiralTilePath(th1, th2) {
  const steps = 8;
  const pts = [];
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const th = th1 + t * (th2 - th1);
    const r = SPIRAL_R0 + SPIRAL_B * th;
    const a = SPIRAL_A0 + th;
    const x = (SPIRAL_CX + r * Math.cos(a)).toFixed(1);
    const y = (SPIRAL_CY + r * Math.sin(a)).toFixed(1);
    pts.push(`${x} ${y}`);
  }
  for (let s = steps; s >= 0; s--) {
    const t = s / steps;
    const th = th1 + t * (th2 - th1);
    const r = SPIRAL_R0 + SPIRAL_B * (th + 2 * Math.PI);
    const a = SPIRAL_A0 + th;
    const x = (SPIRAL_CX + r * Math.cos(a)).toFixed(1);
    const y = (SPIRAL_CY + r * Math.sin(a)).toFixed(1);
    pts.push(`${x} ${y}`);
  }
  return "M " + pts.join(" L ") + " Z";
}

function getCasilla1Path() {
  const steps = 16;
  const pts = [];
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const th = t * 2 * Math.PI;
    const r = SPIRAL_R0 + SPIRAL_B * th;
    const a = SPIRAL_A0 + th;
    const x = (SPIRAL_CX + r * Math.cos(a)).toFixed(1);
    const y = (SPIRAL_CY + r * Math.sin(a)).toFixed(1);
    pts.push(`${x} ${y}`);
  }
  return "M " + pts.join(" L ") + " Z";
}

// Emblem drawn on each kind of tile.
const GLYPHS = {
  Q: '<span class="g-q"><b>?</b></span>',
  B: '<span class="g-b"><i class="salt"></i><i class="flame"></i><i class="wax"></i></span>',
  P: '<span class="g-p"><i class="tri"></i><i class="eye"></i></span>',
  L: '<span class="g-l"><b class="limbo-mark">&#x2620;</b></span>',
  M: '<span class="g-m"><b class="meta-mark">&#x2605;</b></span>',
  S: "",
};

function buildPedestal() {
  const ped = document.createElement("div");
  ped.className = "ped";
  [["base", 64, 64, 8, 0], ["col", 44, 44, 30, 8], ["cap", 56, 56, 6, 38]].forEach(([cls, w, d, h, z]) => {
    const box = document.createElement("div");
    box.className = "box " + cls;
    box.style.cssText = `--w:${w}px;--d:${d}px;--h:${h}px;--z:${z}px`;
    box.innerHTML = '<i class="f top"></i><i class="f n"></i><i class="f s"></i><i class="f e"></i><i class="f w"></i>';
    ped.appendChild(box);
  });
  return ped;
}

function buildBoard() {
  const board = $("board");
  board.innerHTML = "";
  tiles = [];

  // 1. Create SVG spiral board
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "boardSvg";
  svg.setAttribute("viewBox", "0 0 680 680");
  svg.setAttribute("width", "680");
  svg.setAttribute("height", "680");

  let svgInner = `
    <defs>
      <radialGradient id="boardBaseGrad" cx="45%" cy="40%" r="55%">
        <stop offset="0%" stop-color="#181312" />
        <stop offset="65%" stop-color="#0c0909" />
        <stop offset="100%" stop-color="#040303" />
      </radialGradient>
      <linearGradient id="qGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#241a2e" />
        <stop offset="100%" stop-color="#0c0712" />
      </linearGradient>
      <linearGradient id="bGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2d2114" />
        <stop offset="100%" stop-color="#0d0905" />
      </linearGradient>
      <linearGradient id="pGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2c0f13" />
        <stop offset="100%" stop-color="#0d0305" />
      </linearGradient>
      <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38131a" />
        <stop offset="100%" stop-color="#120407" />
      </linearGradient>
      <linearGradient id="mGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#142c1b" />
        <stop offset="100%" stop-color="#050e08" />
      </linearGradient>
      <linearGradient id="lGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#363336" />
        <stop offset="50%" stop-color="#222123" />
        <stop offset="100%" stop-color="#111013" />
      </linearGradient>
      <path id="arcTop" d="M 90,340 A 250,250 0 0 1 590,340" />
      <path id="arcBottom" d="M 590,340 A 250,250 0 0 1 90,340" />
    </defs>
    <circle cx="340" cy="340" r="338" fill="url(#boardBaseGrad)" stroke="#c5b89a" stroke-width="2.6" stroke-opacity="0.4" />
    <circle cx="340" cy="340" r="332" fill="none" stroke="#c5b89a" stroke-width="1" stroke-dasharray="3,5" stroke-opacity="0.25" />
    <circle cx="340" cy="340" r="326" fill="none" stroke="#c5b89a" stroke-width="0.7" stroke-opacity="0.15" />
    <g fill="#c5b89a" fill-opacity="0.32" font-family="'Cinzel', Georgia, serif" font-size="11.5" text-anchor="middle" letter-spacing="14">
      <text><textPath href="#arcTop" startOffset="50%">GUESS</textPath></text>
      <text><textPath href="#arcBottom" startOffset="50%">OR DIE</textPath></text>
    </g>
  `;

  for (let i = 0; i < BOARD_SIZE; i++) {
    const type = currentLayout[i];
    const coord = getSpiralTileCoord(i);
    const num = i + 1;
    let path = "";
    let innerContent = "";

    if (type === "S") {
      path = getCasilla1Path();
      innerContent = `
        <circle cx="340" cy="340" r="26" fill="none" stroke="#c5b89a" stroke-width="0.9" stroke-dasharray="2,3" stroke-opacity="0.4" />
        <text class="casilla-label salida" x="340" y="347">SALIDA</text>
        <text class="casilla-sublabel" fill="#c2323e" x="340" y="358">▲ INICIO</text>
      `;
    } else if (type === "M") {
      path = getSpiralTilePath(coord.th1, coord.th2);
      innerContent = `
        <text class="casilla-label meta" x="${coord.x}" y="${coord.y - 19}">META</text>
      `;
    } else if (type === "L") {
      path = getSpiralTilePath(coord.th1, coord.th2);
      innerContent = `
        <text class="casilla-label limbo" x="${coord.x}" y="${coord.y - 19}">LIMBO</text>
      `;
    } else {
      path = getSpiralTilePath(coord.th1, coord.th2);
      innerContent = ``;
    }

    let grad = `url(#${type.toLowerCase()}Grad)`;
    let strokeCol = "#c5b89a";
    let strokeOpacity = "0.4";
    if (type === "Q") strokeCol = "#b7a4e0";
    else if (type === "B") strokeCol = "#e7b552";
    else if (type === "P") strokeCol = "#c2323e";
    else if (type === "L") { strokeCol = "#dedad2"; strokeOpacity = "0.75"; }
    else if (type === "M") { strokeCol = "#52c48a"; strokeOpacity = "0.7"; }
    else if (type === "S") { strokeCol = "#c2323e"; strokeOpacity = "0.6"; }

    svgInner += `
      <g id="casilla-${num}" class="casilla-g type-${type}">
        <path class="casilla-path" d="${path}" fill="${grad}" stroke="${strokeCol}" stroke-width="1.4" stroke-opacity="${strokeOpacity}" />
        ${innerContent}
      </g>
    `;
  }

  svg.innerHTML = svgInner;
  board.appendChild(svg);

  // 2. Create HTML 3D tile anchors for pawns
  const boardTiles = document.createElement("div");
  boardTiles.id = "boardTiles";
  board.appendChild(boardTiles);

  for (let i = 0; i < BOARD_SIZE; i++) {
    const type = currentLayout[i];
    const coord = getSpiralTileCoord(i);
    const num = i + 1;
    const t = document.createElement("div");
    t.className = `tile-node t-${type}`;
    t.style.left = `${coord.x}px`;
    t.style.top = `${coord.y}px`;
    t.dataset.num = num;
    t.dataset.type = type;

    t.addEventListener("mouseenter", () => {
      t.classList.add("hovered");
      const g = $("casilla-" + num);
      if (g) g.classList.add("hovered");
    });
    t.addEventListener("mouseleave", () => {
      t.classList.remove("hovered");
      const g = $("casilla-" + num);
      if (g) g.classList.remove("hovered");
    });

    if (type === "S") {
      t.appendChild(buildPedestal());
    } else if (GLYPHS[type]) {
      const gw = document.createElement("div");
      gw.className = "glyph-wrap";
      gw.innerHTML = GLYPHS[type];
      t.appendChild(gw);
    }

    const tk = document.createElement("div");
    tk.className = "tokens";
    t.appendChild(tk);
    boardTiles.appendChild(t);
    tiles.push(tk);
  }
}

function buildDice() {
  const cube = $("cube");
  cube.innerHTML = "";
  for (let n = 1; n <= 6; n++) {
    const face = document.createElement("div");
    face.className = "face";
    PIPS[n].forEach((cell) => {
      const pip = document.createElement("span");
      pip.className = "pip";
      pip.style.gridArea = `${Math.ceil(cell / 3)} / ${((cell - 1) % 3) + 1}`;
      face.appendChild(pip);
    });
    cube.appendChild(face);
  }
  showFace(1, false);
}

// Shows face v on TOP of the cube; extra full turns make it tumble.
function showFace(v, tumble) {
  const [rx, ry] = FACE_ROT[v];
  if (tumble) { spinX += 720; spinY += 360; yaw = Math.round(Math.random() * 70 - 35); }
  $("cube").style.transform =
    `rotateY(${yaw}deg) rotateX(90deg) rotateX(${spinX + rx}deg) rotateY(${spinY + ry}deg)`;
}

function renderTokens(hopId) {
  tiles.forEach((tk) => (tk.innerHTML = ""));
  players.forEach((p) => {
    if (!p.alive) return; // Dead players are eliminated spectators; don't render on board
    const el = document.createElement("div");
    el.className = "token";
    el.style.setProperty("--c", p.color);
    el.title = `${p.name} (${Math.max(0, 3 - p.failures)} vidas)`;
    if (p.id === hopId) el.classList.add("hop");
    el.innerHTML = `<i class="pawn-shadow"></i><i class="pawn">${p.id + 1}</i>`;
    const targetIdx = Math.min(p.progress, BOARD_SIZE - 1);
    tiles[targetIdx].appendChild(el);
  });
}

function say(text) { $("msg").textContent = text; }

function log(text) {
  const li = document.createElement("li");
  li.textContent = text;
  $("log").prepend(li);
  while ($("log").children.length > 4) $("log").lastChild.remove();
}

function renderOrder(activeId) {
  const ol = $("order");
  ol.innerHTML = "";
  order.forEach((p) => {
    const li = document.createElement("li");
    const classes = [];
    if (p.id === activeId) classes.push("active");
    if (!p.alive) classes.push("dead-player");
    if (classes.length) li.className = classes.join(" ");

    let statusHtml = "";
    if (!p.alive) {
      statusHtml = `<span class="life-status dead">💀 ${I18N[gameLang].spectatorBadge}</span>`;
    } else {
      const remaining = Math.max(0, 3 - p.failures);
      let pips = "";
      for (let i = 0; i < 3; i++) {
        pips += i < remaining
          ? '<span class="life-dot on" title="Vida">🕯️</span>'
          : '<span class="life-dot off" title="Falla">💀</span>';
      }
      statusHtml = `<span class="life-status">${pips}</span>`;
    }

    li.innerHTML = `<span class="p-info"><i style="background:${p.color}"></i>${p.name}</span> ${statusHtml}`;
    ol.appendChild(li);
  });
}

// Waits for current player to press roll button, animates the die.
async function askRoll(p, prompt) {
  say(`${p.name}, ${prompt}.`);
  const btn = $("rollBtn");
  btn.textContent = I18N[gameLang].rollBtn;
  btn.disabled = false;
  btn.focus({ preventScroll: true });
  await new Promise((res) => btn.addEventListener("click", res, { once: true }));
  btn.disabled = true;
  const value = 1 + Math.floor(Math.random() * 6);
  const dice = $("dice"), shadow = $("dieShadow");
  dice.classList.add("toss");
  shadow.classList.add("toss");
  showFace(value, true);
  await sleep(1100);
  dice.classList.remove("toss");
  shadow.classList.remove("toss");
  return value;
}

// Highest goes first. Tied players roll again among themselves.
async function rollOff(list) {
  const results = [];
  for (const p of list) {
    const v = await askRoll(p, I18N[gameLang].rollOrderPrompt);
    log(I18N[gameLang].rolled(p.name, v));
    results.push({ p, v });
  }
  const sorted = [];
  for (let v = 6; v >= 1; v--) {
    const group = results.filter((r) => r.v === v).map((r) => r.p);
    if (group.length === 1) sorted.push(group[0]);
    else if (group.length > 1) {
      say(I18N[gameLang].tie(v));
      await sleep(900);
      sorted.push(...(await rollOff(group)));
    }
  }
  return sorted;
}

async function move(p, steps) {
  for (let s = 0; s < steps; s++) {
    p.progress++;
    renderTokens(p.id);
    await sleep(260);
    if (p.progress >= BOARD_SIZE - 1) break; // reached META
  }
}

function setLite(on) {
  $("game").classList.toggle("lite", on);
  $("qualityBtn").textContent = on ? I18N[gameLang].qualityLow : I18N[gameLang].qualityHigh;
}

// Calculates difficulty/complexity score for a question (for Limbo selection)
function getQuestionComplexity(q) {
  let score = 0;
  const text = ((q.question_es || "") + " " + (q.question_en || "")).toLowerCase();
  const ans = ((q.answer_es || "") + " " + (q.answer || "")).toLowerCase();
  score += Math.min(30, Math.round(text.length / 4));

  const complexKeywords = [
    'tratado', 'revolución', 'dinastía', 'siglo', 'imperio', 'batalla', 'independencia',
    'raíz', 'potencia', 'elevado', 'primo', 'porcentaje', 'fracción', 'ecuación',
    'estrecho', 'fosa', 'cordillera', 'archipiélago', 'desierto', 'altiplano', 'meridiano',
    'teorema', 'filósofo', 'monarquía', 'constitución', 'olímpico', 'récord', 'ecosistema',
    'pandemia', 'civilización', 'conquista', 'astronomía', 'hemisferio', 'continente'
  ];
  for (const kw of complexKeywords) {
    if (text.includes(kw) || ans.includes(kw)) score += 20;
  }
  if (q.category === 'Mathematics' && /raíz|elevado|primo|divis|²|³|⁵/i.test(text)) {
    score += 25;
  }
  if (q.category === 'History' && /\b(1[0-9]{3}|[0-9]{3}\s*(a\.c|d\.c)|siglo)\b/i.test(text)) {
    score += 25;
  }
  return score;
}

let questionDeck = [];
let limboQuestionDeck = [];

function getNextQuestion() {
  if (!questionDeck.length) {
    questionDeck = (typeof QUESTIONS !== "undefined" && QUESTIONS.length)
      ? shuffle([...QUESTIONS])
      : [];
  }
  return questionDeck.pop();
}

// Draws the most complex/difficult questions specifically for LIMBO
function getLimboQuestion() {
  if (!limboQuestionDeck.length) {
    if (typeof QUESTIONS !== "undefined" && QUESTIONS.length) {
      const scored = QUESTIONS.map((q) => ({ q, score: getQuestionComplexity(q) }));
      scored.sort((a, b) => b.score - a.score);
      const topCount = Math.max(15, Math.floor(scored.length * 0.45));
      const pool = scored.slice(0, topCount).map((item) => item.q);
      limboQuestionDeck = shuffle([...pool]);
    } else {
      limboQuestionDeck = [];
    }
  }
  return limboQuestionDeck.pop();
}

// Benefits and punishments.
const EFFECTS = {
  B: [
    { id: "B1", run: (p) => move(p, 2) },
    { id: "B2", run: async (p) => { p.shield = true; } },
    { id: "B3", run: async (p) => { p.skipQ = true; } },
  ],
  P: [
    { id: "P1", run: async (p) => {
        for (let i = 0; i < 2 && p.progress > 0; i++) {
          p.progress--;
          renderTokens(p.id);
          await sleep(260);
        }
      }
    },
    { id: "P2", multiOnly: true, run: async (p) => { p.skipTurn = true; } },
  ],
};

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const words = (text) => esc(text).split(" ").map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(" ");

// Atmosphere effects (particles and lighting)
function setFx(type) {
  const front = $("front"), layer = $("fxLayer");
  front.classList.remove("fx-Q", "fx-B", "fx-P", "fx-limbo", "win", "fail");
  front.classList.add("fx-" + type);
  layer.innerHTML = "";
  if (type === "limbo") {
    for (let i = 0; i < 18; i++) {
      const e = document.createElement("i");
      e.className = "ember limbo-ember";
      e.style.cssText = `left:${5 + Math.random() * 90}%;--d:${(Math.random() * 2).toFixed(2)}s;--t:${(3 + Math.random() * 2.5).toFixed(2)}s;--s:${(3 + Math.random() * 5).toFixed(1)}px`;
      layer.appendChild(e);
    }
    return;
  }
  if (type !== "B") return;
  for (let i = 0; i < 14; i++) {
    const e = document.createElement("i");
    e.className = "ember";
    e.style.cssText = `left:${5 + Math.random() * 90}%;--d:${(Math.random() * 3).toFixed(2)}s;--t:${(4 + Math.random() * 3).toFixed(2)}s;--s:${(3 + Math.random() * 4).toFixed(1)}px`;
    layer.appendChild(e);
  }
}

// Instant screamer jumpscare execution
async function triggerScreamer() {
  const overlay = $("screamerOverlay");
  overlay.hidden = false;
  await sleep(1350);
  overlay.hidden = true;
}

// Simple modal scene for benefits, whispers, or regular punishments
async function showBannerScene(icon, title, text, fxType = "B") {
  const front = $("front"), card = $("frontCard"), body = $("frontBody"), btn = $("frontBtn");
  const timerWrap = $("frontTimerWrap");

  timerWrap.hidden = true;
  body.innerHTML = "";
  btn.hidden = false;
  btn.textContent = I18N[gameLang].btnContinue;
  setFx(fxType);
  card.className = `front-card t-${fxType} fx-${fxType}`;

  $("frontIcon").textContent = icon;
  $("frontTitle").textContent = title;
  $("frontText").innerHTML = words(text);

  const waitContinue = () => new Promise((res) => btn.addEventListener("click", res, { once: true }));
  const open = () => {
    front.hidden = false;
    void front.offsetWidth;
    $("game").classList.add("to-front");
    front.classList.add("show");
  };
  const close = async () => {
    front.classList.remove("show", "win", "fail");
    card.classList.remove("hit");
    $("game").classList.remove("to-front");
    await sleep(600);
    front.hidden = true;
    body.innerHTML = "";
  };

  open();
  btn.focus({ preventScroll: true });
  await waitContinue();
  await close();
}

// Handles trivia encounters: standard questions or life-or-death LIMBO
async function askQuestion(p, isLimbo = false) {
  const front = $("front"), card = $("frontCard"), body = $("frontBody"), btn = $("frontBtn");
  const timerWrap = $("frontTimerWrap"), timerBar = $("timerBar"), timerText = $("timerText");

  body.innerHTML = "";
  btn.hidden = true;

  const q = isLimbo ? getLimboQuestion() : getNextQuestion();
  if (!q) return;

  setFx(isLimbo ? "limbo" : "Q");
  card.className = `front-card ${isLimbo ? "t-L fx-limbo" : "t-Q fx-Q"}`;

  let timerInterval = null;
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerWrap.hidden = true;
    timerWrap.classList.remove("urgent");
  };

  const open = () => {
    front.hidden = false;
    void front.offsetWidth;
    $("game").classList.add("to-front");
    front.classList.add("show");
  };

  const close = async () => {
    stopTimer();
    front.classList.remove("show", "win", "fail");
    card.classList.remove("hit");
    $("game").classList.remove("to-front");
    await sleep(600);
    front.hidden = true;
    body.innerHTML = "";
  };

  if (isLimbo) {
    $("frontIcon").innerHTML = '<span class="limbo-icon">&#x2620;</span>';
    $("frontTitle").innerHTML = `<span class="limbo-title">${I18N[gameLang].limboTitle}</span><span class="limbo-subtitle">${p.name} &mdash; ${I18N[gameLang].limboSubtitle}</span>`;
  } else {
    const catName = (CATEGORY_NAMES[gameLang] && CATEGORY_NAMES[gameLang][q.category]) || q.category;
    $("frontIcon").textContent = "?";
    $("frontTitle").textContent = `${p.name} \u2014 ${catName.toUpperCase()}`;
  }

  const isEs = (gameLang === "es");
  const primaryText = isEs ? q.question_es : q.question_en;
  const secondaryText = isEs ? q.question_en : q.question_es;
  const n = primaryText.split(" ").length;
  const optsPrimary = (isEs && q.options_es) ? q.options_es : q.options;
  const optsSecondary = (isEs ? q.options : q.options_es) || q.options;
  const answerPrimary = (isEs && q.answer_es) ? q.answer_es : q.answer;

  const introWarning = isLimbo ? `<div class="limbo-warning">${I18N[gameLang].limboWarning}</div>` : "";

  $("frontText").innerHTML =
    introWarning +
    `<span class="q-en notranslate" translate="no">${words(primaryText)}</span>` +
    `<button type="button" class="translate-btn" id="translateBtn">${I18N[gameLang].translateBtnShow}</button>` +
    `<span class="q-es-box" id="qEsBox" hidden></span>`;

  const tBtn = $("translateBtn"), esBox = $("qEsBox");
  tBtn.addEventListener("click", () => {
    const show = esBox.hidden;
    esBox.hidden = !show;
    esBox.textContent = show ? `${secondaryText}\n${optsSecondary.join("\n")}` : "";
    tBtn.textContent = show ? I18N[gameLang].translateBtnHide : I18N[gameLang].translateBtnShow;
  });

  const opts = document.createElement("div");
  opts.className = "q-options";
  const feedback = document.createElement("p");
  feedback.className = "q-feedback";

  body.appendChild(opts);
  body.appendChild(feedback);
  open();

  await new Promise((resolveQuestion) => {
    let resolved = false;

    // Handle answer selection
    const handleSelect = async (b) => {
      if (resolved) return;
      resolved = true;
      stopTimer();

      opts.querySelectorAll(".q-opt-btn").forEach((x) => (x.disabled = true));
      const correctBtn = opts.querySelector(`[data-letter="${q.correct_letter}"]`);

      if (b && b.dataset.letter === q.correct_letter) {
        // CORRECT ANSWER
        b.classList.add("correct");
        feedback.textContent = isLimbo ? I18N[gameLang].limboEscaped : I18N[gameLang].correctFeedback;
        feedback.className = "q-feedback correct";
        front.classList.add("win");
        log(isLimbo ? I18N[gameLang].limboEscapedLog(p.name) : I18N[gameLang].answeredCorrectLog(p.name));
        await sleep(isLimbo ? 1100 : 850);
        await close();
        resolveQuestion();
      } else {
        // WRONG ANSWER
        if (b) b.classList.add("wrong");
        if (correctBtn) correctBtn.classList.add("correct");

        if (p.shield) {
          p.shield = false;
          feedback.textContent = isLimbo
            ? I18N[gameLang].limboShieldSaved(answerPrimary)
            : I18N[gameLang].wrongFeedbackShield(answerPrimary);
          feedback.className = "q-feedback correct";
          log(isLimbo ? I18N[gameLang].limboShieldLog(p.name) : I18N[gameLang].failedSaltLog(p.name));
          await sleep(1800);
          await close();
          resolveQuestion();
        } else if (isLimbo) {
          // LIMBO LIFE OR DEATH: INSTANT DEATH
          p.failures = 3;
          p.alive = false;
          feedback.textContent = I18N[gameLang].limboDied(answerPrimary);
          feedback.className = "q-feedback wrong";
          front.classList.add("fail");
          card.classList.add("hit");
          log(I18N[gameLang].limboDiedLog(p.name));
          renderTokens(p.id);
          renderOrder(p.id);

          await triggerScreamer();
          await close();
          resolveQuestion();
        } else {
          // Standard question failure: add strike, reset to start
          p.failures++;
          p.progress = 0;
          renderTokens(p.id);

          if (p.failures >= 3) {
            p.alive = false;
            feedback.textContent = I18N[gameLang].thirdFailureDeath(answerPrimary);
            log(I18N[gameLang].playerDiedLog(p.name));
          } else {
            const livesLeft = 3 - p.failures;
            feedback.textContent = I18N[gameLang].wrongFeedbackLives(answerPrimary, livesLeft);
            log(I18N[gameLang].failedLogLives(p.name, p.failures));
          }
          feedback.className = "q-feedback wrong";
          front.classList.add("fail");
          card.classList.add("hit");
          renderOrder(p.id);

          await triggerScreamer();
          await close();
          resolveQuestion();
        }
      }
    };

    // Handle time expiration
    const handleTimeout = async () => {
      if (resolved) return;
      resolved = true;
      stopTimer();

      opts.querySelectorAll(".q-opt-btn").forEach((x) => (x.disabled = true));
      const correctBtn = opts.querySelector(`[data-letter="${q.correct_letter}"]`);
      if (correctBtn) correctBtn.classList.add("correct");

      if (p.shield) {
        p.shield = false;
        feedback.textContent = isLimbo
          ? I18N[gameLang].limboShieldSaved(answerPrimary)
          : I18N[gameLang].timeExpiredFeedbackShield(answerPrimary);
        feedback.className = "q-feedback correct";
        log(isLimbo ? I18N[gameLang].limboShieldLog(p.name) : I18N[gameLang].failedSaltLog(p.name));
        await sleep(1800);
        await close();
        resolveQuestion();
      } else if (isLimbo) {
        // LIMBO TIMEOUT: INSTANT DEATH
        p.failures = 3;
        p.alive = false;
        feedback.textContent = I18N[gameLang].limboTimeoutDied(answerPrimary);
        feedback.className = "q-feedback wrong";
        front.classList.add("fail");
        card.classList.add("hit");
        log(I18N[gameLang].limboDiedLog(p.name));
        renderTokens(p.id);
        renderOrder(p.id);

        await triggerScreamer();
        await close();
        resolveQuestion();
      } else {
        p.failures++;
        p.progress = 0;
        renderTokens(p.id);

        if (p.failures >= 3) {
          p.alive = false;
          feedback.textContent = I18N[gameLang].timeExpiredDeath(answerPrimary);
          log(I18N[gameLang].playerDiedLog(p.name));
        } else {
          const livesLeft = 3 - p.failures;
          feedback.textContent = I18N[gameLang].timeExpiredFeedbackLives(answerPrimary, livesLeft);
          log(I18N[gameLang].failedLogLives(p.name, p.failures));
        }
        feedback.className = "q-feedback wrong";
        front.classList.add("fail");
        card.classList.add("hit");
        renderOrder(p.id);

        await triggerScreamer();
        await close();
        resolveQuestion();
      }
    };

    // Start countdown timer if enabled
    if (timerSeconds > 0) {
      timerWrap.hidden = false;
      timerWrap.classList.remove("urgent");
      timerBar.style.width = "100%";
      timerText.textContent = `${timerSeconds}s`;

      const totalMs = timerSeconds * 1000;
      const startAt = performance.now();

      timerInterval = setInterval(() => {
        const elapsed = performance.now() - startAt;
        const remainingMs = Math.max(0, totalMs - elapsed);
        const pct = Math.max(0, (remainingMs / totalMs) * 100);
        const secs = Math.ceil(remainingMs / 1000);

        timerBar.style.width = `${pct}%`;
        timerText.textContent = `${secs}s`;

        if (remainingMs <= 5000) {
          timerWrap.classList.add("urgent");
        }

        if (remainingMs <= 0) {
          handleTimeout();
        }
      }, 100);
    }

    // Build answer buttons
    optsPrimary.forEach((optText, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "q-opt-btn notranslate";
      b.setAttribute("translate", "no");
      b.textContent = optText;
      b.dataset.letter = optText.trim()[0];
      b.style.animationDelay = `${(0.35 + n * 0.05 + idx * 0.12).toFixed(2)}s`;
      b.addEventListener("click", () => handleSelect(b));
      opts.appendChild(b);
    });
  });
}

// Landing scene: camera tilts up, encounter resolves, camera tilts back down.
async function land(p, index) {
  if (index >= BOARD_SIZE - 1) return finish(p);
  const type = currentLayout[index];
  if (type === "S" || type === "M") return;

  if (type === "L") {
    // Dedicated LIMBO tile!
    log(`${p.name}: ¡Ha caído en la casilla del LIMBO!`);
    await askQuestion(p, true);
    return;
  }

  if (type === "Q") {
    if (p.skipQ) {
      p.skipQ = false;
      await showBannerScene("\u2026", I18N[gameLang].whispersFadeTitle, I18N[gameLang].whispersFadeText, "Q");
      return;
    }
    await askQuestion(p, false);
    return;
  }

  if (type === "P") {
    // Regular punishments (filtered for solo mode if needed)
    const pool = EFFECTS.P.filter((e) => !(e.multiOnly && players.length === 1));
    const effect = pick(pool);
    const info = I18N[gameLang].effects[effect.id];
    log(`${p.name}: ${info.title}.`);
    await showBannerScene("\u2020", info.title, info.text, "P");
    if (effect) await effect.run(p);
    return;
  }

  if (type === "B") {
    const effect = pick(EFFECTS.B);
    const info = I18N[gameLang].effects[effect.id];
    log(`${p.name}: ${info.title}.`);
    await showBannerScene("+", info.title, info.text, "B");
    if (effect) await effect.run(p);
    return;
  }
}

async function play() {
  order = players.length > 1 ? await rollOff(players) : players.slice();
  if (players.length > 1) log(I18N[gameLang].firstGoes(order[0].name));
  let turn = 0;
  while (true) {
    // Check if any players are alive
    const alive = players.filter((pl) => pl.alive);
    if (alive.length === 0) {
      return finishAllDead();
    }
    if (players.length > 1 && alive.length === 1) {
      return finishLastSurvivor(alive[0]);
    }

    const p = order[turn % order.length];
    if (!p.alive) {
      // Dead spectator: skip their turn immediately
      turn++;
      continue;
    }

    renderOrder(p.id);
    if (p.skipTurn) {
      p.skipTurn = false;
      say(I18N[gameLang].heldInPlace(p.name));
      log(I18N[gameLang].losesTurn(p.name));
      await sleep(1800);
      turn++;
      continue;
    }

    const v = await askRoll(p, I18N[gameLang].rollPrompt);
    log(I18N[gameLang].rolled(p.name, v));
    await move(p, v);
    if (p.alive && p.progress >= BOARD_SIZE - 1) return finish(p);

    await land(p, p.progress);
    if (p.alive && p.progress >= BOARD_SIZE - 1) return finish(p);

    // Re-check alive counts after encounter
    const aliveAfter = players.filter((pl) => pl.alive);
    if (aliveAfter.length === 0) {
      return finishAllDead();
    }
    if (players.length > 1 && aliveAfter.length === 1) {
      return finishLastSurvivor(aliveAfter[0]);
    }

    turn++;
  }
}

function finish(winner) {
  const solo = players.length === 1;
  const t = I18N[gameLang];
  $("endTitle").textContent = solo ? t.soloWinTitle : t.multiWinTitle(winner.name);
  $("endText").textContent = solo ? t.soloWinText : t.multiWinText;
  $("again").textContent = t.playAgain;
  $("end").hidden = false;
  $("again").focus();
}

function finishAllDead() {
  const solo = players.length === 1;
  const t = I18N[gameLang];
  $("endTitle").textContent = solo ? t.soloGameOverTitle : t.gameOverAllDeadTitle;
  $("endText").textContent = solo ? t.soloGameOverText : t.gameOverAllDeadText;
  $("again").textContent = t.playAgain;
  $("end").hidden = false;
  $("again").focus();
}

function finishLastSurvivor(winner) {
  const t = I18N[gameLang];
  $("endTitle").textContent = t.lastSurvivorTitle(winner.name);
  $("endText").textContent = t.lastSurvivorText;
  $("again").textContent = t.playAgain;
  $("end").hidden = false;
  $("again").focus();
}

async function warmUp() {
  const game = $("game"), cover = $("cover");
  $("coverText").textContent = I18N[gameLang].preparing;
  cover.hidden = false;
  game.classList.add("warm");
  await sleep(500);
  game.classList.add("to-front");
  await sleep(700);
  game.classList.remove("to-front");
  await sleep(500);
  game.classList.remove("warm");
  cover.hidden = true;
}

function start(playerNames) {
  currentLayout = generateRandomLayout();
  players = playerNames.map((name, i) => ({
    id: i,
    name: name,
    color: COLORS[i],
    progress: 0,
    failures: 0,
    alive: true,
    shield: false,
    skipQ: false,
    skipTurn: false,
  }));
  $("menuBtn").textContent = I18N[gameLang].mainMenu;
  setLite($("game").classList.contains("lite"));
  $("rollBtn").textContent = I18N[gameLang].rollBtn;
  $("setup").hidden = true;
  $("game").hidden = false;
  buildBoard();
  buildDice();
  renderTokens();
  warmUp().then(play);
}

// ---------------- SETUP SCREEN LOGIC ----------------
let selectedPlayerCount = 2;

function renderPlayerInputs(n) {
  const container = $("playerInputs");
  const existingValues = Array.from(container.querySelectorAll(".player-name-input")).map((inp) => inp.value.trim());
  container.innerHTML = "";

  for (let i = 0; i < n; i++) {
    const row = document.createElement("div");
    row.className = "player-row";

    const pawn = document.createElement("i");
    pawn.className = "player-row-pawn";
    pawn.style.background = COLORS[i];
    pawn.style.color = COLORS[i];

    const input = document.createElement("input");
    input.type = "text";
    input.className = "player-name-input";
    input.maxLength = 18;

    const defaultName = I18N[gameLang].defaultPlayer(i + 1);
    input.placeholder = defaultName;
    input.value = existingValues[i] || defaultName;

    row.appendChild(pawn);
    row.appendChild(input);
    container.appendChild(row);
  }
}

function updateSetupTexts() {
  const t = I18N[gameLang];
  document.documentElement.lang = gameLang;
  $("setupTag").textContent = t.tag;
  $("setupNote").textContent = selectedPlayerCount === 1 ? t.noteSolo : t.note;
  $("langLabel").textContent = t.langLabel;
  $("timerLabel").textContent = t.timerLabel;
  $("timerOffBtn").textContent = t.timerOff;
  $("playersLabel").textContent = t.playersLabel;
  $("namesLabel").textContent = t.namesLabel;
  $("startBtn").textContent = t.startBtn;

  // Update existing inputs if they still hold default names
  const inputs = document.querySelectorAll(".player-name-input");
  inputs.forEach((inp, idx) => {
    const oldDefaultEs = I18N.es.defaultPlayer(idx + 1);
    const oldDefaultEn = I18N.en.defaultPlayer(idx + 1);
    if (!inp.value || inp.value === oldDefaultEs || inp.value === oldDefaultEn) {
      inp.value = t.defaultPlayer(idx + 1);
    }
    inp.placeholder = t.defaultPlayer(idx + 1);
  });
}

// Setup Event Listeners
document.querySelectorAll("#langGroup .pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#langGroup .pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    gameLang = btn.dataset.lang;
    updateSetupTexts();
  });
});

document.querySelectorAll("#timerGroup .pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#timerGroup .pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    timerSeconds = Number(btn.dataset.timer);
  });
});

document.querySelectorAll(".count-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".count-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedPlayerCount = Number(btn.dataset.n);
    renderPlayerInputs(selectedPlayerCount);
    updateSetupTexts();
  });
});

$("startBtn").addEventListener("click", () => {
  const inputs = document.querySelectorAll(".player-name-input");
  const names = [];
  inputs.forEach((inp, i) => {
    const val = inp.value.trim();
    names.push(val || I18N[gameLang].defaultPlayer(i + 1));
  });
  start(names);
});

$("again").addEventListener("click", () => location.reload());
$("menuBtn").addEventListener("click", () => {
  if (confirm(I18N[gameLang].confirmLeave)) location.reload();
});
$("qualityBtn").addEventListener("click", () => setLite(!$("game").classList.contains("lite")));

// Initialize setup state
renderPlayerInputs(selectedPlayerCount);
updateSetupTexts();

// Rasterize SVG textures once for performance
function bakeTextures() {
  ["--wood", "--plaster"].forEach((name) => {
    const m = /url\("(.*)"\)/.exec(getComputedStyle(document.documentElement).getPropertyValue(name));
    if (!m) return;
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth || 512;
        c.height = img.naturalHeight || 512;
        c.getContext("2d").drawImage(img, 0, 0);
        c.toBlob((b) => b && document.documentElement.style.setProperty(name, `url("${URL.createObjectURL(b)}")`));
      } catch (e) { /* keep SVG */ }
    };
    img.src = m[1];
  });
}
bakeTextures();
