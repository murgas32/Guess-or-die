// Guess or Die - Atmospheric 3D Turn-based Horror Trivia Game

const BOARD_SIZE = 24;
// S = start, Q = question (12), B = benefit (6), P = punishment (5)
let LAYOUT = "SQQBQPQBQQPQBQPQBQQPQBPB"; // replaced by makeLayout() at the start of every game
const COLORS = ["#d9b25a", "#8fb3c4", "#c0708a", "#8aa05c"];

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Your own screamer files go here, e.g. "assets/screamers/1.jpg" and "assets/screamers/1.mp3".
// While these lists are empty, the built-in face and a synthesized scream are used.
const SCREAMER_IMAGES = [];
const SCREAMER_SOUNDS = [];

// Fisher-Yates: an unbiased shuffle.
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// A new random board for every game: tile 0 is the start pedestal; the other 23 tiles are
// 12 questions, 6 benefits and 5 punishments in random order, with a few fairness rules.
function validLayout(L) {
  if (L[1] === "P" || L[BOARD_SIZE - 1] === "P") return false; // no punishment right next to the start
  let run = 1;
  for (let i = 2; i < BOARD_SIZE; i++) {
    run = L[i] === L[i - 1] ? run + 1 : 1;
    if (L[i] === "P" && L[i - 1] === "P") return false;        // never two punishments in a row
    if (L[i] !== "Q" && run >= 3) return false;                // no trio of benefits or punishments
    if (L[i] === "Q" && run >= 5) return false;                // no wall of five questions
  }
  return true;
}
function makeLayout() {
  const kinds = [..."Q".repeat(12), ..."B".repeat(6), ..."P".repeat(5)];
  for (let attempt = 0; attempt < 1000; attempt++) {
    const L = "S" + shuffle(kinds).join("");
    if (validLayout(L)) return L;
  }
  return "SQQBQPQBQQPQBQPQBQQPQBPB";
}

// ---- Sound ----
let audioCtx = null, soundOn = true;
function audio() {
  if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ } }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function playScream() {
  if (!soundOn) return;
  if (SCREAMER_SOUNDS.length) {
    new Audio(SCREAMER_SOUNDS[Math.floor(Math.random() * SCREAMER_SOUNDS.length)]).play().catch(() => {});
    return;
  }
  const c = audio();
  if (!c) return;
  const t = c.currentTime, out = c.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.6, t + 0.02);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
  out.connect(c.destination);
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * 1.3), c.sampleRate), data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource(), band = c.createBiquadFilter();
  noise.buffer = buf; band.type = "bandpass"; band.Q.value = 0.8;
  band.frequency.setValueAtTime(2500, t); band.frequency.exponentialRampToValueAtTime(400, t + 1.2);
  noise.connect(band); band.connect(out); noise.start(t);
  const screech = c.createOscillator(); screech.type = "sawtooth";
  screech.frequency.setValueAtTime(1400, t); screech.frequency.exponentialRampToValueAtTime(180, t + 1.1);
  screech.connect(out); screech.start(t); screech.stop(t + 1.3);
  const boom = c.createOscillator(); boom.type = "sine";
  boom.frequency.setValueAtTime(90, t); boom.frequency.exponentialRampToValueAtTime(35, t + 0.6);
  boom.connect(out); boom.start(t); boom.stop(t + 0.8);
}

// Multi-language dictionary
const I18N = {
  es: {
    tag: "Una sola respuesta incorrecta te devolverá al inicio.",
    note: "Todos juegan en esta computadora, por turnos. El primero en volver al inicio gana.",
    langLabel: "Idioma de las preguntas / Language:",
    timerLabel: "Tiempo por pregunta / Question timer:",
    timerOff: "Sin límite",
    playersLabel: "¿Cuántos jugadores? / How many players?",
    namesLabel: "Nombres de los jugadores:",
    defaultPlayer: (i) => `Jugador ${i}`,
    startBtn: "Entrar a la oscuridad",
    rollBtn: "Lanzar el dado",
    qualityHigh: "Calidad: alta",
    qualityLow: "Calidad: baja",
    mainMenu: "Menú principal",
    soundOn: "Sonido: sí",
    soundOff: "Sonido: no",
    warning: "Aviso: este juego contiene sustos repentinos y sonidos fuertes.",
    levels: ["Fácil", "Media", "Difícil"],
    confirmLeave: "¿Abandonar la partida y regresar al menú principal?",
    rollOrderPrompt: "lanza para decidir el orden de turnos",
    rollPrompt: "lanza el dado",
    extraRollPrompt: "lanza tu tirada adicional",
    extraRollLog: (name) => `${name} activa una tirada adicional.`,
    fiftyFiftyLog: (name) => `Un susurro disipó dos opciones falsas para ${name}.`,
    timePressureLog: (name) => `La presión temporal acecha a ${name}.`,
    anchorSaved: (tile) => `El ancla espectral resistió: caes a la casilla ${tile + 1}.`,
    cursedLog: (name) => `Una maldición envuelve a ${name}.`,
    cursedVictimLog: (name) => `La maldición del susurro le costó el siguiente turno a ${name}.`,
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
    wrongFeedbackShield: (ans) => `Incorrecto. ${ans}. Pero el aura espectral te protege del abismo.`,
    wrongFeedbackDeath: (ans) => `Incorrecto. ${ans}. Vuelves al inicio.`,
    answeredCorrectLog: (name) => `${name} respondió correctamente.`,
    failedSaltLog: (name) => `${name} falló, pero el aura espectral le protegió.`,
    failedLog: (name) => `${name} falló la pregunta y volvió al inicio.`,
    timeExpiredFeedbackShield: (ans) => `Tiempo agotado. ${ans}. Pero el aura espectral te protege.`,
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
    effects: {
      B1: { title: "Escudo Espectral", text: "Un aura espectral te protege. Tu siguiente error o tiempo agotado será perdonado sin enviarte al inicio." },
      B2: { title: "Paso Veloz", text: "Una ráfaga de viento frío te impulsa 2 casillas hacia adelante de inmediato." },
      B3: { title: "Susurro Protector", text: "El espíritu responde por ti. La siguiente casilla de pregunta que pises guardará silencio." },
      B4: { title: "Tirada Espectral", text: "Los dados resuenan con ecos espectrales. Lanzas el dado una vez más en este mismo turno." },
      B5: { title: "Susurro de Sabiduría", text: "Voces del más allá disiparán dos opciones incorrectas en tu próxima pregunta." },
      B6: { title: "Ancla Espectral", text: "Un ancla fantasmal fija tu posición. Si caes en tu próxima pregunta, solo retrocederás hasta esta casilla." },
      P1: { title: "Retroceso Espectral", text: "Fuerzas oscuras te arrastran 2 casillas hacia atrás entre lamentos lejanos." },
      P2: { title: "Parálisis del Miedo", text: "El terror congela tu cuerpo. Pierdes tu siguiente turno completo." },
      P3: { title: "Presión Temporal", text: "El tiempo se acelera furiosamente. Tu próxima pregunta tendrá solo la mitad del tiempo." },
      P5: { title: "Maldición del Susurro", text: "La oscuridad distorsiona la realidad: tus escudos quedan anulados, y fallar o acertar te costará tu siguiente turno." },
    }
  },
  en: {
    tag: "One wrong answer sends you back to the start.",
    note: "Everyone plays on this computer, taking turns. First back to the start wins.",
    langLabel: "Questions Language / Idioma:",
    timerLabel: "Question timer / Tiempo por pregunta:",
    timerOff: "No limit",
    playersLabel: "How many players? / ¿Cuántos jugadores?",
    namesLabel: "Player names:",
    defaultPlayer: (i) => `Player ${i}`,
    startBtn: "Enter the Dark",
    rollBtn: "Roll the die",
    qualityHigh: "Quality: high",
    qualityLow: "Quality: low",
    mainMenu: "Main menu",
    soundOn: "Sound: on",
    soundOff: "Sound: off",
    warning: "Warning: this game contains sudden scares and loud sounds.",
    levels: ["Easy", "Medium", "Hard"],
    confirmLeave: "Leave the game and return to the main menu?",
    rollOrderPrompt: "roll to decide the turn order",
    rollPrompt: "roll the die",
    extraRollPrompt: "roll your extra roll",
    extraRollLog: (name) => `${name} gains an extra roll.`,
    fiftyFiftyLog: (name) => `A whisper banished two false options for ${name}.`,
    timePressureLog: (name) => `Time pressure looms over ${name}.`,
    anchorSaved: (tile) => `The safety anchor held: you only fell to tile ${tile + 1}.`,
    cursedLog: (name) => `A dark curse grips ${name}.`,
    cursedVictimLog: (name) => `The cursed whisper cost ${name} their next turn.`,
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
    wrongFeedbackShield: (ans) => `Wrong. ${ans}. But the spectral shield holds: you are spared.`,
    wrongFeedbackDeath: (ans) => `Wrong. ${ans}. Back to the start.`,
    answeredCorrectLog: (name) => `${name} answered correctly.`,
    failedSaltLog: (name) => `${name} failed, but the spectral aura protected them.`,
    failedLog: (name) => `${name} failed the question and was sent back to start.`,
    timeExpiredFeedbackShield: (ans) => `Time expired. ${ans}. But the spectral shield holds: you are spared.`,
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
    effects: {
      B1: { title: "Spectral Shield", text: "A spectral aura protects you. Your next failed question or timeout will be forgiven." },
      B2: { title: "Swift Step", text: "A gust of cold wind propels you forward 2 tiles immediately." },
      B3: { title: "Protective Whisper", text: "The spirit answers for you. The next question tile you land on will stay silent." },
      B4: { title: "Spectral Roll", text: "The dice echo from the beyond. Roll the die one more time right now." },
      B5: { title: "Wisdom Whisper", text: "Voices from beyond will banish two incorrect options on your next question." },
      B6: { title: "Safety Anchor", text: "A phantom anchor marks your position. If you fall on your next question, you only retreat here." },
      P1: { title: "Spectral Drag", text: "Dark forces drag you back 2 tiles among distant wails." },
      P2: { title: "Fear Paralysis", text: "Terror freezes you in place. You lose your next turn completely." },
      P3: { title: "Time Pressure", text: "Time accelerates furiously. Your next question will only have half the normal time." },
      P5: { title: "The Cursed Whisper", text: "Darkness distorts reality: shields are voided, and answering will cost your next turn." },
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

function renderOrder(activeId) {
  const ol = $("order");
  ol.innerHTML = "";
  order.forEach((p) => {
    const li = document.createElement("li");
    if (p.id === activeId) li.className = "active";
    const dot = document.createElement("i");
    dot.style.background = p.color;
    li.appendChild(dot);
    li.appendChild(document.createTextNode(p.name));
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

// Questions already asked are remembered between games (localStorage), so every question
// in the bank appears before any of them repeats. Clear the browser's site data to reset it.
const SEEN_KEY = "guessOrDie.seen.v1";
const questionId = (q) => q.question_en;
function loadSeen() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]")); } catch (e) { return new Set(); }
}
function saveSeen(set) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...set])); } catch (e) { /* private mode: keep in memory */ }
}
let seenQuestions = loadSeen();

// Difficulty by position on the board: first third easy, middle third medium, last third hard.
const levelFor = (progress) => (progress < BOARD_SIZE / 3 ? 1 : progress < (2 * BOARD_SIZE) / 3 ? 2 : 3);

function getNextQuestion(progress, afterReset = false) {
  if (typeof QUESTIONS === "undefined" || !QUESTIONS.length) return undefined;
  const level = levelFor(progress);
  const fallback = level === 1 ? [1, 2, 3] : level === 2 ? [2, 1, 3] : [3, 2, 1];
  for (const lv of fallback) {
    const pool = QUESTIONS.filter((q) => (q.difficulty || 2) === lv && !seenQuestions.has(questionId(q)));
    if (pool.length) {
      const q = pool[Math.floor(Math.random() * pool.length)];
      seenQuestions.add(questionId(q));
      saveSeen(seenQuestions);
      return q;
    }
  }
  if (afterReset) return pick(QUESTIONS);
  seenQuestions = new Set(); // the whole bank has been asked: start a new cycle
  saveSeen(seenQuestions);
  return getNextQuestion(progress, true);
}

// Options in random order (so the right answer is not always B or C), relabelled A-D,
// in the chosen language (options_es holds the Spanish text).
const LABELS = ["A", "B", "C", "D"];
const stripLabel = (t) => t.replace(/^[A-D]\)\s*/, "").trim();
function buildChoices(q) {
  const es = gameLang === "es" && Array.isArray(q.options_es);
  const items = q.options.map((o, i) => ({
    text: stripLabel(es ? q.options_es[i] : o),
    correct: o.trim()[0] === q.correct_letter,
  }));
  shuffle(items);
  return items.map((it, i) => ({ letter: LABELS[i], text: `${LABELS[i]}) ${it.text}`, correct: it.correct }));
}

// 6 Benefits and 5 Punishments fully adapted to game mechanics.
const EFFECTS = {
  B: [
    // BEN-01: Shield of Grammar / Escudo Espectral
    { id: "B1", run: async (p) => { p.shield = true; } },
    // BEN-02: Swift Step / Paso Veloz (+2 casillas)
    { id: "B2", run: async (p) => { await move(p, 2); } },
    // BEN-03: Skip Quest / Susurro Protector (salta la proxima pregunta)
    { id: "B3", run: async (p) => { p.skipQ = true; } },
    // BEN-04: Double Dice Roll / Tirada Espectral (lanzamiento extra inmediato)
    { id: "B4", run: async (p) => {
        log(I18N[gameLang].extraRollLog(p.name));
        await sleep(400);
        const v = await askRoll(p, I18N[gameLang].extraRollPrompt);
        log(I18N[gameLang].rolled(p.name, v));
        await move(p, v);
        if (p.progress < BOARD_SIZE) await land(p, p.progress % BOARD_SIZE);
      }
    },
    // BEN-05: Wisdom Whisper / Susurro de Sabiduria (50/50 en la siguiente pregunta)
    { id: "B5", run: async (p) => { p.fiftyFifty = true; } },
    // BEN-06: Safety Anchor / Ancla Espectral (punto de anclaje de seguridad)
    { id: "B6", run: async (p) => { p.anchor = p.progress; } },
  ],
  P: [
    // CAS-01: Retroceso Espectral (-2 casillas)
    { id: "P1", run: async (p) => {
        for (let i = 0; i < 2 && p.progress > 0; i++) {
          p.progress--;
          renderTokens(p.id);
          await sleep(260);
        }
      }
    },
    // CAS-02: Paralisis del Miedo (pierde el siguiente turno)
    { id: "P2", run: async (p) => { p.skipTurn = true; } },
    // CAS-03: Time Pressure / Presion Temporal (mitad de tiempo en la siguiente pregunta)
    { id: "P3", run: async (p) => { p.timePressure = true; } },
    // CAS-05: The Cursed Whisper / Maldicion del Susurro (anula escudos y cuesta el turno)
    { id: "P5", run: async (p) => { p.cursedWhisper = true; } },
  ],
};

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

// Instant screamer: one flash, a lunge and a scream (see .screamer-* in style.css).
async function triggerScreamer() {
  const overlay = $("screamerOverlay");
  const custom = SCREAMER_IMAGES.length > 0;
  overlay.classList.toggle("custom", custom);
  if (custom) overlay.style.setProperty("--scream-img", `url("${pick(SCREAMER_IMAGES)}")`);
  overlay.hidden = false;
  playScream();
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

  let q = null, effect = null, scene = null;
  if (type === "Q") {
    if (p.skipQ) {
      p.skipQ = false;
      scene = {
        icon: "\u2026",
        title: I18N[gameLang].whispersFadeTitle,
        text: I18N[gameLang].whispersFadeText
      };
    } else {
      q = getNextQuestion(p.progress);
      if (!q) {
        scene = {
          icon: "?",
          title: I18N[gameLang].noQuestionsTitle,
          text: I18N[gameLang].noQuestionsText
        };
      }
    }
  } else {
    effect = pick(EFFECTS[type]);
    const info = I18N[gameLang].effects[effect.id];
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
    if (effect) await effect.run(p);
    return;
  }

  // --- QUESTION ENCOUNTER (NO CONTINUE BUTTON) ---
  btn.hidden = true;
  const catName = (CATEGORY_NAMES[gameLang] && CATEGORY_NAMES[gameLang][q.category]) || q.category;
  
  // Check CAS-05: The Cursed Whisper
  let isCursed = false;
  if (p.cursedWhisper) {
    p.cursedWhisper = false;
    isCursed = true;
    p.shield = false; // The curse pierces all shields
    log(I18N[gameLang].cursedLog(p.name));
  }

  $("frontIcon").textContent = "?";
  $("frontTitle").textContent = `${p.name} \u2014 ${catName.toUpperCase()} \u00b7 ${I18N[gameLang].levels[(q.difficulty || 2) - 1].toUpperCase()}`;

  const isEs = (gameLang === "es");
  const primaryText = isEs ? q.question_es : q.question_en;
  const secondaryText = isEs ? q.question_en : q.question_es;
  const n = primaryText.split(" ").length;

  const choices = buildChoices(q);
  const correctChoice = choices.find((c) => c.correct);
  const correctLetter = correctChoice.letter;
  const answerText = correctChoice.text;

  $("frontText").innerHTML =
    `<span class="q-en notranslate" translate="no">${words(primaryText)}</span>` +
    `<button type="button" class="translate-btn" id="translateBtn">${I18N[gameLang].translateBtnShow}</button>` +
    `<span class="q-es-box" id="qEsBox" hidden></span>`;

  const tBtn = $("translateBtn"), esBox = $("qEsBox");
  tBtn.addEventListener("click", () => {
    const show = esBox.hidden;
    esBox.hidden = !show;
    esBox.textContent = show ? secondaryText : "";
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
      const correctBtn = opts.querySelector(`[data-letter="${correctLetter}"]`);

      if (b && b.dataset.letter === correctLetter) {
        // CORRECT ANSWER
        b.classList.add("correct");
        if (isCursed) {
          p.skipTurn = true;
          feedback.textContent = isEs
            ? "Correcto, pero la maldición del susurro congela tu siguiente turno."
            : "Correct, but the cursed whisper freezes your next turn.";
          log(I18N[gameLang].cursedVictimLog(p.name));
        } else {
          feedback.textContent = I18N[gameLang].correctFeedback;
        }
        feedback.className = "q-feedback correct";
        front.classList.add("win");
        log(I18N[gameLang].answeredCorrectLog(p.name));
        await sleep(900);
        await close();
        resolveQuestion();
      } else {
        // WRONG ANSWER
        if (b) b.classList.add("wrong");
        if (correctBtn) correctBtn.classList.add("correct");

        if (p.shield && !isCursed) {
          // Protected by Spectral Shield
          p.shield = false;
          feedback.textContent = I18N[gameLang].wrongFeedbackShield(answerText);
          feedback.className = "q-feedback correct";
          log(I18N[gameLang].failedSaltLog(p.name));
          await sleep(1600);
          await close();
          resolveQuestion();
        } else if (p.anchor && p.anchor > 0) {
          // Saved by Safety Anchor checkpoint
          const savedAnchor = p.anchor;
          p.anchor = 0;
          p.progress = savedAnchor;
          renderTokens(p.id);
          feedback.textContent = I18N[gameLang].anchorSaved(savedAnchor);
          feedback.className = "q-feedback wrong";
          front.classList.add("fail");
          card.classList.add("hit");
          log(I18N[gameLang].anchorSaved(savedAnchor));
          if (isCursed) {
            p.skipTurn = true;
            log(I18N[gameLang].cursedVictimLog(p.name));
          }
          await triggerScreamer();
          await close();
          resolveQuestion();
        } else {
          // Standard full demise: reset to start + screamer
          feedback.textContent = I18N[gameLang].wrongFeedbackDeath(answerText);
          feedback.className = "q-feedback wrong";
          front.classList.add("fail");
          card.classList.add("hit");
          log(I18N[gameLang].failedLog(p.name));
          p.progress = 0;
          renderTokens(p.id);
          if (isCursed) {
            p.skipTurn = true;
            log(I18N[gameLang].cursedVictimLog(p.name));
          }
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
      const correctBtn = opts.querySelector(`[data-letter="${correctLetter}"]`);
      if (correctBtn) correctBtn.classList.add("correct");

      if (p.shield && !isCursed) {
        p.shield = false;
        feedback.textContent = I18N[gameLang].timeExpiredFeedbackShield(answerText);
        feedback.className = "q-feedback correct";
        log(I18N[gameLang].failedSaltLog(p.name));
        await sleep(1600);
        await close();
        resolveQuestion();
      } else if (p.anchor && p.anchor > 0) {
        const savedAnchor = p.anchor;
        p.anchor = 0;
        p.progress = savedAnchor;
        renderTokens(p.id);
        feedback.textContent = I18N[gameLang].anchorSaved(savedAnchor);
        feedback.className = "q-feedback wrong";
        front.classList.add("fail");
        card.classList.add("hit");
        log(I18N[gameLang].anchorSaved(savedAnchor));
        if (isCursed) {
          p.skipTurn = true;
          log(I18N[gameLang].cursedVictimLog(p.name));
        }
        await triggerScreamer();
        await close();
        resolveQuestion();
      } else {
        feedback.textContent = I18N[gameLang].timeExpiredFeedbackDeath(answerText);
        feedback.className = "q-feedback wrong";
        front.classList.add("fail");
        card.classList.add("hit");
        log(I18N[gameLang].timeExpiredLog(p.name));
        p.progress = 0;
        renderTokens(p.id);
        if (isCursed) {
          p.skipTurn = true;
          log(I18N[gameLang].cursedVictimLog(p.name));
        }
        await triggerScreamer();
        await close();
        resolveQuestion();
      }
    };

    // Calculate effective timer (Check CAS-03: Time Pressure)
    let effectiveSeconds = timerSeconds;
    let isPressured = false;
    if (p.timePressure) {
      p.timePressure = false;
      isPressured = true;
      effectiveSeconds = Math.max(5, Math.floor(timerSeconds > 0 ? timerSeconds / 2 : 10));
      log(I18N[gameLang].timePressureLog(p.name));
    }

    // Countdown: it starts once the options are visible, so reading time is not lost.
    let timerStarted = false;
    const beginCountdown = () => {
      if (timerStarted || resolved || effectiveSeconds <= 0) return;
      timerStarted = true;
      const totalMs = effectiveSeconds * 1000;
      const startAt = performance.now();
      timerInterval = setInterval(() => {
        const remainingMs = Math.max(0, totalMs - (performance.now() - startAt));
        timerBar.style.width = `${(remainingMs / totalMs) * 100}%`;
        timerText.textContent = `${Math.ceil(remainingMs / 1000)}s`;
        if (remainingMs <= 5000 || isPressured) timerWrap.classList.add("urgent");
        if (remainingMs <= 0) handleTimeout();
      }, 100);
    };
    if (effectiveSeconds > 0) {
      timerWrap.hidden = false;
      timerWrap.classList.toggle("urgent", isPressured || effectiveSeconds <= 5);
      timerBar.style.width = "100%";
      timerText.textContent = `${effectiveSeconds}s`;
    }

    // Build answer buttons
    choices.forEach((choice, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "q-opt-btn notranslate";
      b.setAttribute("translate", "no");
      b.textContent = choice.text;
      b.dataset.letter = choice.letter;
      b.style.animationDelay = `${(0.35 + n * 0.05 + idx * 0.12).toFixed(2)}s`;
      b.addEventListener("click", () => handleSelect(b));
      opts.appendChild(b);
    });

    if (effectiveSeconds > 0) {
      opts.lastElementChild.addEventListener("animationend", beginCountdown, { once: true });
      setTimeout(beginCountdown, Math.round((0.35 + n * 0.05 + 3 * 0.12 + 0.6) * 1000) + 700); // fallback
    }

    // Check BEN-05: Wisdom Whisper (50/50 effect banishing 2 incorrect options)
    if (p.fiftyFifty) {
      p.fiftyFifty = false;
      const wrongButtons = Array.from(opts.querySelectorAll(".q-opt-btn")).filter(
        (b) => b.dataset.letter !== correctLetter
      );
      wrongButtons.sort(() => Math.random() - 0.5);
      wrongButtons.slice(0, 2).forEach((b) => {
        b.disabled = true;
        b.classList.add("banished-option");
      });
      log(I18N[gameLang].fiftyFiftyLog(p.name));
    }
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
    const v = await askRoll(p, I18N[gameLang].rollPrompt);
    log(I18N[gameLang].rolled(p.name, v));
    await move(p, v);
    if (p.progress >= BOARD_SIZE) return finish(p);
    await land(p, p.progress % BOARD_SIZE);
    if (p.progress >= BOARD_SIZE) return finish(p);
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
  const game = $("game"), cover = $("cover"), scare = $("screamerOverlay");
  $("coverText").textContent = I18N[gameLang].preparing;
  cover.hidden = false;
  game.classList.add("warm");
  scare.hidden = false; // drawn once behind the cover so the first scare does not stutter
  await sleep(500);
  scare.hidden = true;
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
    shield: false,
    skipQ: false,
    skipTurn: false,
    fiftyFifty: false,
    timePressure: false,
    cursedWhisper: false,
    anchor: 0,
  }));
  audio(); // created inside a click, so the browser allows the scream later
  LAYOUT = makeLayout(); // a different board every game
  $("menuBtn").textContent = I18N[gameLang].mainMenu;
  $("qualityBtn").textContent = I18N[gameLang].qualityHigh;
  $("soundBtn").textContent = I18N[gameLang].soundOn;
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
  $("setupTag").textContent = t.tag;
  $("setupNote").textContent = t.note;
  $("langLabel").textContent = t.langLabel;
  $("timerLabel").textContent = t.timerLabel;
  $("timerOffBtn").textContent = t.timerOff;
  $("playersLabel").textContent = t.playersLabel;
  $("namesLabel").textContent = t.namesLabel;
  $("startBtn").textContent = t.startBtn;
  $("setupWarn").textContent = t.warning;

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
$("soundBtn").addEventListener("click", () => {
  soundOn = !soundOn;
  $("soundBtn").textContent = soundOn ? I18N[gameLang].soundOn : I18N[gameLang].soundOff;
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
