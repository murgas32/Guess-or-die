// Guess or Die - Atmospheric 3D Turn-based Horror Trivia Game

const BOARD_SIZE = 24;
// S = start, Q = question (12), B = benefit (6), P = punishment (5)
// Distribución base (cantidades fijas). En cada partida se reordena al azar con randomizeLayout().
const LAYOUT_BASE = "SQQBQPQBQQPQBQPQBQQPQBPB";
let LAYOUT = LAYOUT_BASE;
const COLORS = ["#d9b25a", "#8fb3c4", "#c0708a", "#8aa05c"];
// Beneficio "dado doble": "sum" suma las dos tiradas, "best" se queda con la mayor.
const DOUBLE_DICE_MODE = "sum";
// Castigo "La vela se consume": segundos de la siguiente pregunta cuando el temporizador está desactivado.
// Con temporizador activo se reduce a la mitad (mínimo 5s).
const RUSH_FALLBACK_SECONDS = 10;

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Multi-language dictionary
const I18N = {
  es: {
    tag: "Una sola respuesta incorrecta te devolverá al inicio.",
    note: "Todos juegan en esta computadora, por turnos. El primero en volver al inicio gana.",
    noteSolo: "Juegas solo: completa la vuelta al tablero sin fallar.",
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
    wrongFeedbackDeath: (ans) => `Incorrecto. ${ans}. Vuelves al inicio.`,
    answeredCorrectLog: (name) => `${name} respondió correctamente.`,
    failedSaltLog: (name) => `${name} falló, pero el círculo de sal le protegió.`,
    failedLog: (name) => `${name} falló la pregunta y volvió al inicio.`,
    timeExpiredFeedbackShield: (ans) => `Tiempo agotado. ${ans}. Pero el círculo de sal te protege.`,
    timeExpiredFeedbackDeath: (ans) => `Tiempo agotado. ${ans}. La oscuridad te arrastra al inicio.`,
    timeExpiredLog: (name) => `${name} agotó el tiempo y volvió al inicio.`,
    btnContinue: "Continuar",
    btnBackToStart: "Volver al inicio",
    soloWinTitle: "Has logrado regresar",
    soloWinText: "Completaste la vuelta al tablero.",
    multiWinTitle: (name) => `${name} ha logrado regresar`,
    multiWinText: "Todos los demás han quedado atrapados en la oscuridad.",
    playAgain: "Jugar de nuevo",
    preparing: "Preparando la sala...",
    rollAgainPrompt: "lanza el dado otra vez (dado doble)",
    doubleRolled: (name, a, b, total) => `${name} sacó ${a} y ${b}: avanza ${total}.`,
    fiftyHint: "Los susurros eliminaron dos respuestas incorrectas.",
    wrongFeedbackAnchor: (ans) => `Incorrecto. ${ans}. Pero el ancla te sujeta: vuelves a la casilla fijada, no al inicio.`,
    timeExpiredFeedbackAnchor: (ans) => `Tiempo agotado. ${ans}. Pero el ancla te sujeta: vuelves a la casilla fijada.`,
    failedAnchorLog: (name) => `${name} falló, pero el ancla evitó que volviera al inicio.`,
    rushHint: (s) => `La vela se consume: solo tienes ${s}s.`,
    blindHint: "La niebla oculta la categoría de la pregunta.",
    cursedHint: "El susurro maldito te acecha: aunque aciertes, no avanzarás.",
    cursedSoftHint: "El ancla debilita la maldición: aunque aciertes, no avanzarás.",
    cursedCorrect: "Correcto, pero la maldición te devuelve a donde estabas.",
    cursedFailMulti: "La maldición rompe tus protecciones y pierdes tu próximo turno.",
    cursedFailSolo: "La maldición rompe tus protecciones.",
    cursedCorrectLog: (name) => `${name} acertó, pero la maldición le impidió avanzar.`,
    cursedFailLog: (name) => `${name} falló bajo el susurro maldito: doble castigo.`,
    status: { shield: "círculo de sal", skipQ: "susurros apagados", doubleDice: "dado doble", fifty: "50/50", anchor: "ancla", rush: "vela débil", blind: "niebla", cursed: "maldito" },
    effects: {
      B1: { title: "La vela arde con más fuerza", text: "La oscuridad te deja pasar. Avanzas 2 casillas." },
      B2: { title: "Un círculo de sal", text: "Estás protegido. Tu próxima respuesta incorrecta será perdonada." },
      B3: { title: "Los susurros se apagan", text: "La siguiente casilla de pregunta guardará silencio." },
      B4: { title: "Los dados del destino", text: "Tu próxima tirada se lanza dos veces." },
      B5: { title: "Un susurro del más allá", text: "En tu próxima pregunta desaparecerán dos respuestas incorrectas." },
      B6: { title: "Un ancla fantasmal", text: "Tu posición queda fijada durante tu próximo turno: si fallas volverás aquí en lugar del inicio, y nada podrá retenerte." },
      P1: { title: "El suelo cede", text: "Algo te arrastra 2 casillas hacia atrás." },
      P2: { title: "Algo te retiene", text: "Pierdes tu siguiente turno." },
      P2_anchor: { title: "Algo intenta retenerte", text: "El ancla fantasmal te sujeta: no pierdes tu siguiente turno." },
      P3: { title: "La vela se consume", text: "La llama se agita y la cera se derrite deprisa. Tendrás la mitad de tiempo en tu próxima pregunta." },
      P3_anchor: { title: "La vela vacila", text: "El ancla fantasmal sostiene la llama: el tiempo de tu próxima pregunta no cambia." },
      P4: { title: "Niebla en la mente", text: "Una bruma espesa te nubla: no sabrás la categoría de tu próxima pregunta hasta responderla." },
      P5: { title: "El susurro maldito", text: "Una voz distorsiona el tablero. En tu próxima pregunta, si aciertas no avanzas; si fallas, el castigo será doble." },
      P5_anchor: { title: "El susurro se debilita", text: "El ancla fantasmal atenúa la maldición: si aciertas en tu próxima pregunta no avanzas, pero fallar no te costará más de lo normal." },
    }
  },
  en: {
    tag: "One wrong answer sends you back to the start.",
    note: "Everyone plays on this computer, taking turns. First back to the start wins.",
    noteSolo: "Playing solo: complete the lap around the board without failing.",
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
    wrongFeedbackDeath: (ans) => `Wrong. ${ans}. Back to the start.`,
    answeredCorrectLog: (name) => `${name} answered correctly.`,
    failedSaltLog: (name) => `${name} failed, but the salt circle protected them.`,
    failedLog: (name) => `${name} failed the question and was sent back to start.`,
    timeExpiredFeedbackShield: (ans) => `Time expired. ${ans}. But the circle of salt holds: you are spared.`,
    timeExpiredFeedbackDeath: (ans) => `Time expired. ${ans}. The dark drags you back to the start.`,
    timeExpiredLog: (name) => `${name} ran out of time and was sent back to start.`,
    btnContinue: "Continue",
    btnBackToStart: "Back to start",
    soloWinTitle: "You made it back",
    soloWinText: "You completed the lap.",
    multiWinTitle: (name) => `${name} made it back`,
    multiWinText: "Everyone else is lost in the dark.",
    playAgain: "Play again",
    preparing: "Preparing the room...",
    rollAgainPrompt: "roll the die again (double roll)",
    doubleRolled: (name, a, b, total) => `${name} rolled ${a} and ${b}: moves ${total}.`,
    fiftyHint: "The whispers removed two wrong answers.",
    wrongFeedbackAnchor: (ans) => `Wrong. ${ans}. But the anchor holds: you return to the marked tile, not the start.`,
    timeExpiredFeedbackAnchor: (ans) => `Time expired. ${ans}. But the anchor holds: you return to the marked tile.`,
    failedAnchorLog: (name) => `${name} failed, but the anchor kept them from going back to the start.`,
    rushHint: (s) => `The candle gutters: you only have ${s}s.`,
    blindHint: "The fog hides the category of the question.",
    cursedHint: "The cursed whisper stalks you: even if you answer right, you will not advance.",
    cursedSoftHint: "The anchor weakens the curse: even if you answer right, you will not advance.",
    cursedCorrect: "Correct, but the curse drags you back to where you were.",
    cursedFailMulti: "The curse shatters your protections and you lose your next turn.",
    cursedFailSolo: "The curse shatters your protections.",
    cursedCorrectLog: (name) => `${name} answered correctly, but the curse kept them from advancing.`,
    cursedFailLog: (name) => `${name} failed under the cursed whisper: double punishment.`,
    status: { shield: "salt circle", skipQ: "whispers silenced", doubleDice: "double roll", fifty: "50/50", anchor: "anchor", rush: "weak candle", blind: "fog", cursed: "cursed" },
    effects: {
      B1: { title: "The candle burns brighter", text: "The dark lets you pass. Move forward 2 tiles." },
      B2: { title: "A circle of salt", text: "You are protected. Your next wrong answer will be forgiven." },
      B3: { title: "The whispers fade", text: "The next question tile will stay silent." },
      B4: { title: "The dice of fate", text: "Your next roll is thrown twice." },
      B5: { title: "A whisper from beyond", text: "On your next question, two wrong answers will vanish." },
      B6: { title: "A ghostly anchor", text: "Your position is fixed during your next turn: if you fail you return here instead of the start, and nothing can hold you." },
      P1: { title: "The floor gives way", text: "Something drags you back 2 tiles." },
      P2: { title: "Something holds you", text: "You lose your next turn." },
      P2_anchor: { title: "Something tries to hold you", text: "The ghostly anchor holds firm: you do not lose your next turn." },
      P3: { title: "The candle gutters", text: "The flame thrashes and the wax melts fast. You get half the time on your next question." },
      P3_anchor: { title: "The candle wavers", text: "The ghostly anchor steadies the flame: the time on your next question is unchanged." },
      P4: { title: "Fog on the mind", text: "A thick haze clouds you: you will not know the category of your next question until you answer it." },
      P5: { title: "The cursed whisper", text: "A voice warps the board. On your next question, if you answer right you do not advance; if you fail, the punishment is doubled." },
      P5_anchor: { title: "The whisper weakens", text: "The ghostly anchor dampens the curse: if you answer right on your next question you do not advance, but failing will cost no more than usual." },
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

// Position of tile i on the 7x7 ring, clockwise from the top-left corner.
function ringPos(i) {
  if (i <= 6) return [0, i];
  if (i <= 12) return [i - 6, 6];
  if (i <= 18) return [6, 18 - i];
  return [24 - i, 0];
}

// Emblem drawn on each kind of tile. The start tile gets a 3D pedestal instead.
const GLYPHS = {
  Q: '<span class="g-q"><b>?</b></span>',
  B: '<span class="g-b"><i class="salt"></i><i class="flame"></i><i class="wax"></i></span>',
  P: '<span class="g-p"><i class="tri"></i><i class="eye"></i></span>',
  S: "",
};

function buildPedestal() {
  const ped = document.createElement("div");
  ped.className = "ped";
  [["base", 76, 76, 8, 0], ["col", 50, 50, 30, 8], ["cap", 64, 64, 6, 38]].forEach(([cls, w, d, h, z]) => {
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
  const art = document.createElement("div");
  art.id = "boardArt";
  board.appendChild(art);
  for (let i = 0; i < BOARD_SIZE; i++) {
    const [row, col] = ringPos(i);
    const t = document.createElement("div");
    t.className = "tile t-" + LAYOUT[i];
    t.style.gridArea = `${row + 1} / ${col + 1}`;
    t.innerHTML = GLYPHS[LAYOUT[i]];
    if (LAYOUT[i] === "S") t.appendChild(buildPedestal());
    const tk = document.createElement("div");
    tk.className = "tokens";
    t.appendChild(tk);
    board.appendChild(t);
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
    const el = document.createElement("div");
    el.className = "token";
    el.style.setProperty("--c", p.color);
    el.title = p.name;
    if (p.id === hopId) el.classList.add("hop");
    el.innerHTML = `<i class="pawn-shadow"></i><i class="pawn">${p.id + 1}</i>`;
    tiles[p.progress % BOARD_SIZE].appendChild(el);
  });
}

function say(text) { $("msg").textContent = text; }

function log(text) {
  const li = document.createElement("li");
  li.textContent = text;
  $("log").prepend(li);
  while ($("log").children.length > 4) $("log").lastChild.remove();
}

// Beneficios que el jugador tiene guardados (se muestran junto a su nombre).
function statusBadges(p) {
  const t = I18N[gameLang].status;
  const on = [];
  if (p.shield) on.push(t.shield);
  if (p.skipQ) on.push(t.skipQ);
  if (p.doubleDice) on.push(t.doubleDice);
  if (p.fifty) on.push(t.fifty);
  if (p.anchor) on.push(t.anchor);
  if (p.rush) on.push(t.rush);
  if (p.blind) on.push(t.blind);
  if (p.cursed) on.push(t.cursed);
  return on.length ? `<small class="st">${on.join(" · ")}</small>` : "";
}

function renderOrder(activeId) {
  const ol = $("order");
  ol.innerHTML = "";
  order.forEach((p) => {
    const li = document.createElement("li");
    if (p.id === activeId) li.className = "active";
    li.innerHTML = `<i style="background:${p.color}"></i>${p.name}${statusBadges(p)}`;
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
    if (p.progress >= BOARD_SIZE) break; // back at start: lap complete
  }
}

function setLite(on) {
  $("game").classList.toggle("lite", on);
  $("qualityBtn").textContent = on ? I18N[gameLang].qualityLow : I18N[gameLang].qualityHigh;
}

// Fisher-Yates (Array.sort with a random comparator is biased)
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Baraja las casillas (la de inicio "S" siempre queda en la posición 0, y se mantiene la cantidad
// de cada tipo). Para que el tablero no quede injusto, se descartan barajas con 3 o más casillas
// iguales de beneficio/castigo seguidas.
function randomizeLayout() {
  const rest = LAYOUT_BASE.slice(1).split("");
  const clustered = (l) => {
    for (let i = 0; i < l.length; i++) {
      const a = l[i];
      if (a !== "Q" && a === l[(i + 1) % l.length] && a === l[(i + 2) % l.length]) return true;
    }
    return false;
  };
  let layout;
  let tries = 0;
  do {
    layout = "S" + shuffle(rest.slice()).join("");
    tries++;
  } while (clustered(layout) && tries < 200);
  LAYOUT = layout;
}

let questionDeck = [];
function getNextQuestion() {
  if (!questionDeck.length) {
    questionDeck = (typeof QUESTIONS !== "undefined" && QUESTIONS.length)
      ? shuffle([...QUESTIONS])
      : [];
  }
  return questionDeck.pop();
}

// Benefits and punishments.
const EFFECTS = {
  B: [
    { id: "B1", run: (p) => move(p, 2) },
    { id: "B2", run: async (p) => { p.shield = true; } },
    { id: "B3", run: async (p) => { p.skipQ = true; } },
    { id: "B4", run: async (p) => { p.doubleDice = true; } },
    { id: "B5", run: async (p) => { p.fifty = true; } },
    // turns: 2 = el resto de este turno + el próximo turno completo del jugador.
    { id: "B6", run: async (p) => { p.anchor = { pos: p.progress, turns: 2 }; } },
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
    // soft: versión que se aplica si el jugador tiene el ancla (B6) activa.
    { id: "P2", multiOnly: true, run: async (p) => { p.skipTurn = true; }, soft: async () => {} },
    // P3 (Time Pressure): la próxima pregunta tiene la mitad de tiempo.
    { id: "P3", run: async (p) => { p.rush = true; }, soft: async () => {} },
    // P4 (Amne-Sight): la próxima pregunta no muestra su categoría hasta responderla.
    { id: "P4", run: async (p) => { p.blind = true; } },
    // P5 (Cursed Whisper): próxima pregunta. "full": acertar no avanza y fallar rompe protecciones
    // y (en multijugador) cuesta el siguiente turno. "soft" (con ancla): solo acertar no avanza.
    { id: "P5", run: async (p) => { p.cursed = "full"; }, soft: async (p) => { p.cursed = "soft"; } },
  ],
};

// Protecciones ante un fallo, por orden de prioridad: círculo de sal y luego ancla.
// Devuelve null si no hay ninguna.
function useGuard(p) {
  if (p.shield) { p.shield = false; return { type: "shield" }; }
  if (p.anchor) { const pos = p.anchor.pos; p.anchor = null; return { type: "anchor", pos }; }
  return null;
}

// Al terminar un turno jugado, el ancla gasta una ronda.
function tickAnchor(p) {
  if (p.anchor && --p.anchor.turns <= 0) p.anchor = null;
}

// P5: acertar bajo la maldición anula el avance de este turno (vuelve a donde estaba al tirar).
async function undoAdvance(p) {
  while (p.progress > p.turnStart) {
    p.progress--;
    renderTokens(p.id);
    await sleep(140);
  }
}

// P5: fallar bajo la maldición completa ("full") rompe círculo de sal y ancla y cuesta el siguiente turno.
function curseBacklash(p) {
  p.shield = false;
  p.anchor = null;
  if (players.length > 1) p.skipTurn = true;
}

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const words = (text) => esc(text).split(" ").map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(" ");

// Atmosphere effects (particles and lighting)
function setFx(type) {
  const front = $("front"), layer = $("fxLayer");
  front.classList.remove("fx-Q", "fx-B", "fx-P", "win", "fail");
  front.classList.add("fx-" + type);
  layer.innerHTML = "";
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

// Landing scene: camera tilts up, encounter resolves, camera tilts back down.
async function land(p, index) {
  const type = LAYOUT[index];
  const front = $("front"), card = $("frontCard"), body = $("frontBody"), btn = $("frontBtn");
  const timerWrap = $("frontTimerWrap"), timerBar = $("timerBar"), timerText = $("timerText");

  if (type === "S") return;
  card.className = `front-card t-${type} fx-${type}`;
  body.innerHTML = "";
  btn.hidden = true; // Hidden by default (no continue button on questions!)
  setFx(type);

  let timerInterval = null;
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerWrap.hidden = true;
    timerWrap.classList.remove("urgent");
  };

  const waitContinue = () => new Promise((res) => btn.addEventListener("click", res, { once: true }));
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

  let q = null, effect = null, scene = null, anchored = false;
  if (type === "Q") {
    if (p.skipQ) {
      p.skipQ = false;
      scene = {
        icon: "\u2026",
        title: I18N[gameLang].whispersFadeTitle,
        text: I18N[gameLang].whispersFadeText
      };
    } else {
      q = getNextQuestion();
      if (!q) {
        scene = {
          icon: "?",
          title: I18N[gameLang].noQuestionsTitle,
          text: I18N[gameLang].noQuestionsText
        };
      }
    }
  } else {
    // Punishments that only make sense with other players (e.g. losing a turn) are dropped in solo mode
    const pool = EFFECTS[type].filter((e) => !(e.multiOnly && players.length === 1));
    effect = pick(pool);
    // B6: el ancla suaviza los castigos severos (los que tienen versión "soft").
    anchored = type === "P" && !!effect.soft && !!p.anchor;
    if (anchored) p.anchor = null;
    const info = I18N[gameLang].effects[effect.id + (anchored ? "_anchor" : "")];
    scene = { icon: type === "B" ? "+" : "\u2020", title: info.title, text: info.text };
    log(`${p.name}: ${info.title}.`);
  }

  // Non-question scene (benefit, punishment, or whispers faded)
  if (scene) {
    stopTimer();
    btn.hidden = false;
    btn.textContent = I18N[gameLang].btnContinue;
    $("frontIcon").textContent = scene.icon;
    $("frontTitle").textContent = scene.title;
    $("frontText").innerHTML = words(scene.text);
    open();
    btn.focus({ preventScroll: true });
    await waitContinue();
    await close();
    if (effect) await (anchored ? effect.soft : effect.run)(p);
    return;
  }

  // --- QUESTION ENCOUNTER (NO CONTINUE BUTTON) ---
  btn.hidden = true;
  const catName = (CATEGORY_NAMES[gameLang] && CATEGORY_NAMES[gameLang][q.category]) || q.category;
  const hints = [];
  // P3: la vela se consume (mitad de tiempo; con temporizador desactivado, tiempo fijo).
  let qSeconds = timerSeconds;
  if (p.rush) {
    p.rush = false;
    qSeconds = timerSeconds > 0 ? Math.max(5, Math.ceil(timerSeconds / 2)) : RUSH_FALLBACK_SECONDS;
    hints.push(I18N[gameLang].rushHint(qSeconds));
  }
  // P4: la categoría queda oculta hasta que se responde.
  const blinded = p.blind;
  if (blinded) { p.blind = false; hints.push(I18N[gameLang].blindHint); }
  // P5: maldición sobre esta pregunta ("full" o "soft").
  const curse = p.cursed;
  if (curse) {
    p.cursed = null;
    hints.push(curse === "soft" ? I18N[gameLang].cursedSoftHint : I18N[gameLang].cursedHint);
  }
  $("frontIcon").textContent = "?";
  const fullTitle = `${p.name} \u2014 ${catName.toUpperCase()}`;
  $("frontTitle").textContent = blinded ? `${p.name} \u2014 ???` : fullTitle;
  const revealCategory = () => { $("frontTitle").textContent = fullTitle; };

  const isEs = (gameLang === "es");
  const primaryText = isEs ? q.question_es : q.question_en;
  const secondaryText = isEs ? q.question_en : q.question_es;
  const n = primaryText.split(" ").length;
  let optsPrimary = (isEs && q.options_es) ? q.options_es : q.options;
  let optsSecondary = (isEs ? q.options : q.options_es) || q.options;
  // B5: elimina dos respuestas incorrectas (queda la correcta y una incorrecta).
  let fiftyApplied = false;
  if (p.fifty && optsPrimary.length > 2) {
    p.fifty = false;
    fiftyApplied = true;
    const letterOf = (o) => o.trim()[0];
    const keepWrong = pick(optsPrimary.map(letterOf).filter((l) => l !== q.correct_letter));
    const keep = (o) => letterOf(o) === q.correct_letter || letterOf(o) === keepWrong;
    optsPrimary = optsPrimary.filter(keep);
    optsSecondary = optsSecondary.filter(keep);
  }
  const answerPrimary = (isEs && q.answer_es) ? q.answer_es : q.answer;


  $("frontText").innerHTML =
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

  if (fiftyApplied) hints.unshift(I18N[gameLang].fiftyHint);
  feedback.textContent = hints.join(" ");
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
      revealCategory();

      opts.querySelectorAll(".q-opt-btn").forEach((x) => (x.disabled = true));
      const correctBtn = opts.querySelector(`[data-letter="${q.correct_letter}"]`);

      if (b && b.dataset.letter === q.correct_letter) {
        // CORRECT ANSWER: brief visual feedback, then automatically move to next player
        b.classList.add("correct");
        feedback.textContent = curse ? I18N[gameLang].cursedCorrect : I18N[gameLang].correctFeedback;
        feedback.className = "q-feedback correct";
        front.classList.add("win");
        log(curse ? I18N[gameLang].cursedCorrectLog(p.name) : I18N[gameLang].answeredCorrectLog(p.name));
        await sleep(curse ? 1400 : 850);
        await close();
        if (curse) await undoAdvance(p); // P5: acertar no avanza
        resolveQuestion();
      } else {
        // WRONG ANSWER
        if (b) b.classList.add("wrong");
        if (correctBtn) correctBtn.classList.add("correct");

        const guard = curse === "full" ? null : useGuard(p); // P5 "full" ignora las protecciones
        if (guard && guard.type === "shield") {
          feedback.textContent = I18N[gameLang].wrongFeedbackShield(answerPrimary);
          feedback.className = "q-feedback correct";
          log(I18N[gameLang].failedSaltLog(p.name));
          await sleep(1600);
          await close();
          resolveQuestion();
        } else if (guard) {
          // B6: el ancla devuelve al jugador a la casilla fijada en lugar del inicio
          feedback.textContent = I18N[gameLang].wrongFeedbackAnchor(answerPrimary);
          feedback.className = "q-feedback correct";
          log(I18N[gameLang].failedAnchorLog(p.name));
          p.progress = guard.pos;
          renderTokens(p.id);
          await sleep(1600);
          await close();
          resolveQuestion();
        } else {
          feedback.textContent = I18N[gameLang].wrongFeedbackDeath(answerPrimary);
          feedback.className = "q-feedback wrong";
          front.classList.add("fail");
          card.classList.add("hit");
          log(I18N[gameLang].failedLog(p.name));
          if (curse === "full") {
            curseBacklash(p);
            feedback.textContent += " " + (players.length > 1 ? I18N[gameLang].cursedFailMulti : I18N[gameLang].cursedFailSolo);
            log(I18N[gameLang].cursedFailLog(p.name));
          }
          p.progress = 0;
          renderTokens(p.id);

          // Instant screamer jumpscare
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
      revealCategory();

      opts.querySelectorAll(".q-opt-btn").forEach((x) => (x.disabled = true));
      const correctBtn = opts.querySelector(`[data-letter="${q.correct_letter}"]`);
      if (correctBtn) correctBtn.classList.add("correct");

      const guard = curse === "full" ? null : useGuard(p); // P5 "full" ignora las protecciones
      if (guard && guard.type === "shield") {
        feedback.textContent = I18N[gameLang].timeExpiredFeedbackShield(answerPrimary);
        feedback.className = "q-feedback correct";
        log(I18N[gameLang].failedSaltLog(p.name));
        await sleep(1600);
        await close();
        resolveQuestion();
      } else if (guard) {
        feedback.textContent = I18N[gameLang].timeExpiredFeedbackAnchor(answerPrimary);
        feedback.className = "q-feedback correct";
        log(I18N[gameLang].failedAnchorLog(p.name));
        p.progress = guard.pos;
        renderTokens(p.id);
        await sleep(1600);
        await close();
        resolveQuestion();
      } else {
        feedback.textContent = I18N[gameLang].timeExpiredFeedbackDeath(answerPrimary);
        feedback.className = "q-feedback wrong";
        front.classList.add("fail");
        card.classList.add("hit");
        log(I18N[gameLang].timeExpiredLog(p.name));
        if (curse === "full") {
          curseBacklash(p);
          feedback.textContent += " " + (players.length > 1 ? I18N[gameLang].cursedFailMulti : I18N[gameLang].cursedFailSolo);
          log(I18N[gameLang].cursedFailLog(p.name));
        }
        p.progress = 0;
        renderTokens(p.id);

        // Instant screamer jumpscare
        await triggerScreamer();
        await close();
        resolveQuestion();
      }
    };

    // Start countdown timer if enabled
    if (qSeconds > 0) {
      timerWrap.hidden = false;
      timerWrap.classList.remove("urgent");
      timerBar.style.width = "100%";
      timerText.textContent = `${qSeconds}s`;

      const totalMs = qSeconds * 1000;
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

async function play() {
  order = players.length > 1 ? await rollOff(players) : players.slice();
  if (players.length > 1) log(I18N[gameLang].firstGoes(order[0].name));
  let turn = 0;
  while (true) {
    const p = order[turn % order.length];
    renderOrder(p.id);
    if (p.skipTurn) {
      p.skipTurn = false;
      say(I18N[gameLang].heldInPlace(p.name));
      log(I18N[gameLang].losesTurn(p.name));
      await sleep(1800);
      turn++;
      continue;
    }
    p.turnStart = p.progress; // P5: casilla de la que partió este turno
    let v = await askRoll(p, I18N[gameLang].rollPrompt);
    log(I18N[gameLang].rolled(p.name, v));
    if (p.doubleDice) { // B4: segunda tirada
      p.doubleDice = false;
      const v2 = await askRoll(p, I18N[gameLang].rollAgainPrompt);
      const total = DOUBLE_DICE_MODE === "best" ? Math.max(v, v2) : v + v2;
      log(I18N[gameLang].doubleRolled(p.name, v, v2, total));
      v = total;
    }
    await move(p, v);
    if (p.progress >= BOARD_SIZE) return finish(p);
    await land(p, p.progress % BOARD_SIZE);
    if (p.progress >= BOARD_SIZE) return finish(p);
    tickAnchor(p);
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
  players = playerNames.map((name, i) => ({
    id: i,
    name: name,
    color: COLORS[i],
    progress: 0,
    shield: false,     // B2: perdona el próximo fallo
    skipQ: false,      // B3: la próxima casilla de pregunta guarda silencio
    doubleDice: false, // B4: la próxima tirada es doble
    fifty: false,      // B5: la próxima pregunta pierde 2 respuestas incorrectas
    anchor: null,      // B6: { pos, turns } casilla fijada durante el próximo turno
    skipTurn: false,   // P2
    rush: false,       // P3: la próxima pregunta tiene la mitad de tiempo
    blind: false,      // P4: la próxima pregunta oculta su categoría
    cursed: null,      // P5: "full" | "soft" sobre la próxima pregunta
    turnStart: 0,      // casilla al inicio del turno (para P5)
  }));
  $("menuBtn").textContent = I18N[gameLang].mainMenu;
  setLite($("game").classList.contains("lite"));
  $("rollBtn").textContent = I18N[gameLang].rollBtn;
  $("setup").hidden = true;
  $("game").hidden = false;
  randomizeLayout();
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
