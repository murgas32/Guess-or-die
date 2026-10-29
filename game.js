// Guess or Die - Sprint 1: board, die, turn order and token movement.
// Sprint 2 will plug questions, timer, benefits and punishments into land().

const BOARD_SIZE = 24;
// S = start, Q = question (12), B = benefit (6), P = punishment (5)
const LAYOUT = "SQQBQPQBQQPQBQPQBQQPQBPB";
const SYMBOLS = { S: "Start", Q: "?", B: "+", P: "\u2620" };
const COLORS = ["#d9b25a", "#8fb3c4", "#c0708a", "#8aa05c"];
const FACES = ["\u2680", "\u2681", "\u2682", "\u2683", "\u2684", "\u2685"];

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
// Rotation (x, y) that brings each face to the front of the cube.
const FACE_ROT = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] };
let spinX = 0, spinY = 0;

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

function buildBoard() {
  const board = $("board");
  tiles = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const [row, col] = ringPos(i);
    const t = document.createElement("div");
    t.className = "tile t-" + LAYOUT[i];
    t.style.gridArea = `${row + 1} / ${col + 1}`;
    t.textContent = SYMBOLS[LAYOUT[i]];
    const tk = document.createElement("div");
    tk.className = "tokens";
    t.appendChild(tk);
    board.appendChild(t);
    tiles.push(tk);
  }
}

function buildDice() {
  const cube = $("cube");
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

// Turns the cube so face v points at the player; extra full turns make it tumble.
function showFace(v, tumble) {
  const [rx, ry] = FACE_ROT[v];
  if (tumble) { spinX += 720; spinY += 360; }
  $("cube").style.transform =
    `rotateX(-18deg) rotateY(-22deg) rotateX(${spinX + rx}deg) rotateY(${spinY + ry}deg)`;
}

function renderTokens(hopId) {
  tiles.forEach((tk) => (tk.innerHTML = ""));
  players.forEach((p) => {
    const el = document.createElement("div");
    el.className = "token";
    el.style.background = p.color;
    el.title = p.name;
    if (p.id === hopId) el.classList.add("hop");
    el.textContent = p.id + 1;
    tiles[p.progress % BOARD_SIZE].appendChild(el);
  });
}

function say(text) { $("msg").textContent = text; }

function log(text) {
  const li = document.createElement("li");
  li.textContent = text;
  $("log").prepend(li);
  while ($("log").children.length > 3) $("log").lastChild.remove();
}

function renderOrder(activeId) {
  const ol = $("order");
  ol.innerHTML = "";
  order.forEach((p) => {
    const li = document.createElement("li");
    if (p.id === activeId) li.className = "active";
    li.innerHTML = `<i style="background:${p.color}"></i>${p.name}`;
    ol.appendChild(li);
  });
}

// Waits for the current player to press the roll button, animates the die.
async function askRoll(p, prompt) {
  say(`${p.name}, ${prompt}.`);
  const btn = $("rollBtn");
  btn.disabled = false;
  btn.focus({ preventScroll: true });
  await new Promise((res) => btn.addEventListener("click", res, { once: true }));
  btn.disabled = true;
  const value = 1 + Math.floor(Math.random() * 6);
  showFace(value, true);
  await sleep(1050);
  return value;
}

// Everyone rolls; highest goes first. Tied players roll again among themselves.
async function rollOff(list) {
  const results = [];
  for (const p of list) {
    const v = await askRoll(p, "roll to decide the turn order");
    log(`${p.name} rolled ${v}.`);
    results.push({ p, v });
  }
  const sorted = [];
  for (let v = 6; v >= 1; v--) {
    const group = results.filter((r) => r.v === v).map((r) => r.p);
    if (group.length === 1) sorted.push(group[0]);
    else if (group.length > 1) {
      say(`Tie on ${v}. Roll again.`);
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
    if (p.progress >= BOARD_SIZE) break; // back at the start: lap complete
  }
}

// Landing scene: the camera looks up from the board toward the horizon (the board
// slides down), the tile's encounter comes in from above, then the camera looks back down. Sprint 2 will fill #frontBody
// with the question, answer options and timer, and apply benefit/punishment effects.
const ENCOUNTERS = {
  Q: { name: "a question tile", icon: "?", text: "A question waits for you. Questions arrive in Sprint 2." },
  B: { name: "a benefit tile", icon: "+", text: "Something is on your side. Effects arrive in Sprint 2." },
  P: { name: "a punishment tile", icon: "\u2620", text: "Something is waiting in the dark. Effects arrive in Sprint 2." },
};

async function land(p, index) {
  const type = LAYOUT[index];
  const info = ENCOUNTERS[type];
  const stage = $("stage"), front = $("front"), card = $("frontCard");

  // Fill the scene first, then start board and message together so the move is one quick motion.
  card.className = "front-card t-" + type;
  $("frontIcon").textContent = info.icon;
  $("frontTitle").textContent = `${p.name} landed on ${info.name}`;
  $("frontText").textContent = info.text;
  front.hidden = false;
  void front.offsetWidth; // register the start state before animating
  stage.classList.add("to-front");
  front.classList.add("show");
  $("frontBtn").focus({ preventScroll: true });
  await new Promise((res) => $("frontBtn").addEventListener("click", res, { once: true }));

  front.classList.remove("show");
  stage.classList.remove("to-front");
  await sleep(500);
  front.hidden = true;
}

async function play() {
  order = players.length > 1 ? await rollOff(players) : players.slice();
  if (players.length > 1) log(`${order[0].name} goes first.`);
  let turn = 0;
  while (true) {
    const p = order[turn % order.length];
    renderOrder(p.id);
    const v = await askRoll(p, "roll the die");
    log(`${p.name} rolled ${v}.`);
    await move(p, v);
    if (p.progress >= BOARD_SIZE) return finish(p);
    await land(p, p.progress % BOARD_SIZE);
    turn++;
  }
}

function finish(winner) {
  const solo = players.length === 1;
  $("endTitle").textContent = solo ? "You made it back" : `${winner.name} made it back`;
  $("endText").textContent = solo
    ? "You completed the lap."
    : "Everyone else is lost in the dark.";
  $("end").hidden = false;
  $("again").focus();
}

function start(n) {
  players = Array.from({ length: n }, (_, i) => ({
    id: i,
    name: `Player ${i + 1}`,
    color: COLORS[i],
    progress: 0,
  }));
  $("setup").hidden = true;
  $("game").hidden = false;
  buildBoard();
  buildDice();
  renderTokens();
  play();
}

document.querySelectorAll(".count button").forEach((b) =>
  b.addEventListener("click", () => start(Number(b.dataset.n)))
);
$("again").addEventListener("click", () => location.reload());
$("menuBtn").addEventListener("click", () => {
  if (confirm("Leave the game and return to the main menu?")) location.reload();
});
