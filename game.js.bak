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

// Your own screamer files go here, e.g. "assets/screamers/1.jpg" and "assets/screamers/1.mp3".
// While these lists are empty, the built-in face and a synthesized scream are used.
const SCREAMER_IMAGES = [];
const SCREAMER_SOUNDS = ["assets/sounds/screamer.wav"];

// ---- Sound Assets & System ----
const SOUND_FILES = {
  menu: "assets/sounds/song_menu.mp3",
  dice: "assets/sounds/dados.mp3",
  ficha: "assets/sounds/fichas.mp3",
  screamer: "assets/sounds/screamer.wav"
};

let audioCtx = null, soundOn = true;
let menuAudio = null;
let diceBuffer = null;
let fichaBuffer = null;
let screamerBuffer = null;
let buffersLoading = false;

function audio() {
  if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ } }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function loadSoundBuffers() {
  if (buffersLoading || diceBuffer) return;
  const c = audio();
  if (!c) return;
  buffersLoading = true;
  Promise.all([
    fetch(SOUND_FILES.dice).then(r => r.arrayBuffer()).then(b => c.decodeAudioData(b)).then(decoded => { diceBuffer = decoded; }).catch(() => {}),
    fetch(SOUND_FILES.ficha).then(r => r.arrayBuffer()).then(b => c.decodeAudioData(b)).then(decoded => { fichaBuffer = decoded; }).catch(() => {}),
    fetch(SOUND_FILES.screamer).then(r => r.arrayBuffer()).then(b => c.decodeAudioData(b)).then(decoded => { screamerBuffer = decoded; }).catch(() => {})
  ]).finally(() => { buffersLoading = false; });
}

function initAudioSystem() {
  menuAudio = $("menuMusic") || new Audio(SOUND_FILES.menu);
  menuAudio.loop = true;
  menuAudio.volume = 0.825; // Incrementado un 50% (de 0.55 a 0.825)

  // Garantizar bucle continuo: cada que termine el sonido del menú, se repite
  menuAudio.addEventListener("ended", () => {
    if (soundOn && $("setup") && !$("setup").hidden) {
      menuAudio.currentTime = 0;
      menuAudio.play().catch(() => {});
    }
  });

  const startMenuPlayback = () => {
    loadSoundBuffers();
    if (soundOn && menuAudio && $("setup") && !$("setup").hidden && menuAudio.paused) {
      menuAudio.play().catch(() => {});
    }
  };

  // Intentar reproducción inmediata o en primera interacción (política autoplay del navegador)
  if (soundOn && $("setup") && !$("setup").hidden) {
    menuAudio.play().catch(() => {});
  }
  window.addEventListener("click", startMenuPlayback, { passive: true });
  window.addEventListener("keydown", startMenuPlayback, { passive: true });
  window.addEventListener("touchstart", startMenuPlayback, { passive: true });
}

function stopMenuMusic() {
  if (menuAudio) {
    menuAudio.pause();
    menuAudio.currentTime = 0;
  }
}

function playDiceSound() {
  if (!soundOn) return;
  const c = audio();
  if (c && diceBuffer) {
    try {
      const src = c.createBufferSource();
      const gain = c.createGain();
      gain.gain.value = 0.95;
      src.buffer = diceBuffer;
      src.connect(gain);
      gain.connect(c.destination);
      src.start(0);
      return;
    } catch (e) {}
  }
  const a = new Audio(SOUND_FILES.dice);
  a.volume = 0.95;
  a.play().catch(() => {});
}

function playFichaSound() {
  if (!soundOn) return;
  const c = audio();
  if (c && fichaBuffer) {
    try {
      const src = c.createBufferSource();
      const gain = c.createGain();
      gain.gain.value = 0.85;
      src.buffer = fichaBuffer;
      src.connect(gain);
      gain.connect(c.destination);
      src.start(0);
      return;
    } catch (e) {}
  }
  const a = new Audio(SOUND_FILES.ficha);
  a.volume = 0.85;
  a.play().catch(() => {});
}

// ---- Question Countdown Audios by Category ----
const QUESTION_AUDIO_CONFIG = {
  Sports: {
    src: "assets/sounds/question_sports.mp3",
    elemId: "qAudioSports",
    duration: 14.00
  },
  Geography: {
    src: "assets/sounds/question_geography.mp3",
    elemId: "qAudioGeography",
    duration: 19.96
  },
  History: {
    src: "assets/sounds/question_history.mp3",
    elemId: "qAudioHistory",
    duration: 20.07
  },
  Mathematics: {
    src: "assets/sounds/question_math.mp3",
    elemId: "qAudioMath",
    duration: 19.52
  }
};

let currentQuestionAudio = null;

function startQuestionAudio(category, effectiveSeconds) {
  if (!soundOn) return;
  stopQuestionAudio();

  const cfg = QUESTION_AUDIO_CONFIG[category] || QUESTION_AUDIO_CONFIG.History;
  const audio = $(cfg.elemId) || new Audio(cfg.src);
  audio.volume = 0.85;

  if (effectiveSeconds > 0) {
    // Adapta el audio a la duración exacta del temporizador (15s, 20s, 30s o presión temporal)
    const rate = cfg.duration / effectiveSeconds;
    const clampedRate = Math.max(0.15, Math.min(4.0, rate));
    audio.playbackRate = clampedRate;
    audio.defaultPlaybackRate = clampedRate;
    audio.loop = false;
    audio.currentTime = 0;
    audio.onplay = () => { audio.playbackRate = clampedRate; };
    // Si concluye ligeramente antes del tiempo de vela, se reinicia suavemente
    audio.onended = () => {
      if (currentQuestionAudio === audio) {
        audio.currentTime = 0;
        audio.playbackRate = clampedRate;
        audio.play().catch(() => {});
      }
    };
  } else {
    // Si lo pone en ilimitado (sin límite), el audio se repite infinitamente
    audio.playbackRate = 1.0;
    audio.defaultPlaybackRate = 1.0;
    audio.loop = true;
    audio.currentTime = 0;
    audio.onended = () => {
      if (currentQuestionAudio === audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };
  }

  currentQuestionAudio = audio;
  audio.play().catch(() => {});
}

function stopQuestionAudio() {
  if (currentQuestionAudio) {
    currentQuestionAudio.pause();
    currentQuestionAudio.currentTime = 0;
    currentQuestionAudio.onended = null;
    currentQuestionAudio = null;
  }
}

// ---- Event & Question Atmosphere Audios ----
let currentBenefitAudio = null;
let currentPunishmentAudio = null;
let currentWhisperAudio = null;

function playBenefitAudio() {
  if (!soundOn) return;
  stopBenefitAudio();
  const a = $("audioBenefit") || new Audio("assets/sounds/benefit.mp3");
  a.currentTime = 0;
  a.volume = 0.85;
  a.play().catch(() => {});
  currentBenefitAudio = a;
}

function stopBenefitAudio() {
  if (currentBenefitAudio) {
    currentBenefitAudio.pause();
    currentBenefitAudio.currentTime = 0;
    currentBenefitAudio = null;
  }
}

function playPunishmentAudio() {
  if (!soundOn) return;
  stopPunishmentAudio();
  const a = $("audioPunishment") || new Audio("assets/sounds/punishment.mp3");
  a.currentTime = 0;
  a.volume = 0.85;
  a.play().catch(() => {});
  currentPunishmentAudio = a;
}

function stopPunishmentAudio() {
  if (currentPunishmentAudio) {
    currentPunishmentAudio.pause();
    currentPunishmentAudio.currentTime = 0;
    currentPunishmentAudio = null;
  }
}

function playQuestionWhisper() {
  if (!soundOn) return;
  stopQuestionWhisper();
  const a = $("audioWhisperQ") || new Audio("assets/sounds/whisper_question.mp3");
  a.currentTime = 0;
  a.volume = 0.95;
  a.play().catch(() => {});
  currentWhisperAudio = a;
}

function stopQuestionWhisper() {
  if (currentWhisperAudio) {
    currentWhisperAudio.pause();
    currentWhisperAudio.currentTime = 0;
    currentWhisperAudio.onended = null;
    currentWhisperAudio = null;
  }
  const el = $("audioWhisperQ");
  if (el) {
    el.pause();
    el.currentTime = 0;
    el.onended = null;
  }
}

function playScream() {
  if (!soundOn) return;

  // 1. Reproducción de cero latencia del buffer de audio decodificado
  const c = audio();
  let bufferPlayed = false;
  if (c && screamerBuffer) {
    try {
      const src = c.createBufferSource();
      const gain = c.createGain();
      src.buffer = screamerBuffer;
      gain.gain.setValueAtTime(1.0, c.currentTime);
      src.connect(gain);
      gain.connect(c.destination);
      src.start(0);
      bufferPlayed = true;
    } catch (e) {}
  }

  // 2. Elemento de audio precargado como respaldo inmediato
  if (!bufferPlayed) {
    try {
      const a = $("audioScreamer");
      if (a) {
        a.currentTime = 0;
        a.volume = 1.0;
        a.play().catch(() => {});
      } else {
        const soundFile = SCREAMER_SOUNDS.length
          ? SCREAMER_SOUNDS[Math.floor(Math.random() * SCREAMER_SOUNDS.length)]
          : "assets/sounds/screamer.wav";
        const audioObj = new Audio(soundFile);
        audioObj.volume = 1.0;
        audioObj.play().catch(() => {});
      }
    } catch (e) {}
  }

  // 3. Capa física de refuerzo sintético (sub-bass visceral que retumba en el pecho + distorsión abrasiva)
  if (c) {
    try {
      const t = c.currentTime;
      // Sub-bass thump súbito (golpe sordo)
      const subOsc = c.createOscillator();
      const subGain = c.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(130, t);
      subOsc.frequency.exponentialRampToValueAtTime(28, t + 0.45);
      subGain.gain.setValueAtTime(0.85, t);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      subOsc.connect(subGain);
      subGain.connect(c.destination);
      subOsc.start(t);
      subOsc.stop(t + 0.75);

      // Desgarro ruidoso de choque transitorio
      const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.35), c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.08));
      }
      const noise = c.createBufferSource();
      noise.buffer = buf;
      const band = c.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.setValueAtTime(3400, t);
      band.Q.value = 2.8;
      const noiseGain = c.createGain();
      noiseGain.gain.setValueAtTime(0.65, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      noise.connect(band);
      band.connect(noiseGain);
      noiseGain.connect(c.destination);
      noise.start(t);
    } catch (e) {}
  }
}

// Multi-language dictionary
const I18N = {
  es: {
    tag: "Una sola respuesta errónea te devuelve al inicio. A las 3 fallas o al caer en el Limbo, mueres.",
    note: "Todos juegan en esta computadora, por turnos. El primero en llegar a la META (casilla 50) o el último sobreviviente gana.",
    noteSolo: "Juegas solo: llega a la META (casilla 50) antes de acumular 3 fallas o sucumbir en el Limbo.",
    langLabel: "Idioma / Language:",
    timerLabel: "Tiempo por pregunta:",
    timerOff: "Sin límite",
    playersLabel: "¿Cuántos jugadores? / How many players?",
    namesLabel: "Nombres de los jugadores:",
    defaultPlayer: (i) => `Jugador ${i}`,
    menuPlay: "Jugar",
    menuPlayers: "Jugadores",
    menuTimer: "Tiempo",
    menuLang: "Idioma",
    menuRules: "Reglas",
    menuCredits: "Créditos",
    playModalTitle: "Entrar a la oscuridad",
    playersModalTitle: "Configurar Jugadores",
    timerModalTitle: "Temporizador de Vela",
    langModalTitle: "Idioma de Preguntas",
    rulesModalTitle: "Reglas y Supervivencia",
    creditsModalTitle: "Créditos del Proyecto",
    timerSubtitle: "Si la vela se apaga antes de responder, la oscuridad te consume.",
    langSubtitle: "Configura el idioma principal de las preguntas y la interfaz.",
    btnSave: "Listo",
    btnUnderstood: "Entendido",
    btnClose: "Cerrar",
    statusPlayers: (count) => `${count} ${count === 1 ? "Jugador" : "Jugadores"}`,
    statusTimer: (seconds) => seconds === 0 ? "Vela: sin límite" : `Vela: ${seconds}s`,
    statusLang: "Español",
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
    tag: "One wrong answer sends you to the start. At 3 strikes or falling in Limbo, you die.",
    note: "Everyone plays on this computer, taking turns. First to reach the GOAL (tile 50) or last survivor wins.",
    noteSolo: "Playing solo: reach the GOAL (tile 50) before getting 3 strikes or perishing in Limbo.",
    langLabel: "Language / Idioma:",
    timerLabel: "Time per question:",
    timerOff: "No limit",
    playersLabel: "How many players? / ¿Cuántos jugadores?",
    namesLabel: "Player names:",
    defaultPlayer: (i) => `Player ${i}`,
    menuPlay: "Play",
    menuPlayers: "Players",
    menuTimer: "Time",
    menuLang: "Language",
    menuRules: "Rules",
    menuCredits: "Credits",
    playModalTitle: "Enter the darkness",
    playersModalTitle: "Configure Players",
    timerModalTitle: "Candle Timer",
    langModalTitle: "Question Language",
    rulesModalTitle: "Rules and Survival",
    creditsModalTitle: "Project Credits",
    timerSubtitle: "If the candle goes out before you answer, the darkness consumes you.",
    langSubtitle: "Set the primary language for questions and the interface.",
    btnSave: "Done",
    btnUnderstood: "Got it",
    btnClose: "Close",
    statusPlayers: (count) => `${count} ${count === 1 ? "Player" : "Players"}`,
    statusTimer: (seconds) => seconds === 0 ? "No limit" : `Candle: ${seconds}s`,
    statusLang: "English",
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

// White dry-brush SVG emblems for each tile type
const GLYPHS = {
  Q: `<span class="pencil-glyph pg-q" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="44" height="44">
          <g filter="url(#brushDry)" fill="#f5f3ee">
            <path d="M14.2 21.8 C12.6 15.2 17.8 7.8 26.4 8.2 C34.2 8.6 37.6 15.2 34.4 21.2 C32.2 25.3 27.6 26.8 26.6 31.2 L20.4 31.4 C20.6 25.6 25.2 23.4 27.2 20.2 C29.0 17.3 27.8 14.0 24.4 13.8 C20.8 13.6 18.8 17.0 19.4 21.4 Z"/>
            <path d="M18.6 10.6 C22.5 7.4 29.2 7.5 33.2 11.4" fill="none" stroke="#f5f3ee" stroke-width="1.3" stroke-dasharray="6 2.5 4 2" stroke-linecap="round"/>
            <path d="M20.4 35.4 C22.8 34.8 26.0 34.9 27.8 35.6 C28.2 37.4 28.0 39.4 27.2 40.8 C24.8 41.2 22.0 41.0 20.2 40.3 C19.8 38.6 19.9 36.8 20.4 35.4 Z"/>
          </g>
        </svg>
      </span>`,
  B: `<span class="pencil-glyph pg-b" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="44" height="44">
          <g filter="url(#brushDry)" fill="#f5f3ee">
            <path d="M24 6.5 C27.8 11.8 29.2 16.0 27.6 19.6 C26.4 22.0 21.6 22.0 20.4 19.6 C18.8 16.0 20.2 11.8 24 6.5 Z"/>
            <path d="M18.2 23.2 L29.8 23.0 L29.2 39.2 L18.8 39.2 Z"/>
            <path d="M14.5 39.5 L33.5 39.5" fill="none" stroke="#f5f3ee" stroke-width="3.2" stroke-linecap="round"/>
          </g>
        </svg>
      </span>`,
  P: `<span class="pencil-glyph pg-p" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="44" height="44">
          <g filter="url(#brushDry)">
            <polygon points="7.5,11.5 40.5,11.5 24,40.5" fill="none" stroke="#f5f3ee" stroke-width="4.2" stroke-linejoin="round"/>
            <path d="M15.8 20.5 Q24 14.5 32.2 20.5 Q24 26.5 15.8 20.5 Z" fill="none" stroke="#f5f3ee" stroke-width="2.6" stroke-linejoin="round"/>
            <circle cx="24" cy="20.5" r="3.2" fill="#f5f3ee"/>
          </g>
        </svg>
      </span>`,
  L: `<span class="pencil-glyph pg-l" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="44" height="44">
          <g filter="url(#brushDry)" fill="#f5f3ee">
            <path d="M13.5 22.5 C13.5 12.8 34.5 12.8 34.5 22.5 C34.5 27.2 31.6 29.8 30.2 31.4 L30.2 37.5 L17.8 37.5 L17.8 31.4 C16.4 29.8 13.5 27.2 13.5 22.5 Z"/>
            <circle cx="19.5" cy="22.5" r="3.0" fill="#0a090b"/>
            <circle cx="28.5" cy="22.5" r="3.0" fill="#0a090b"/>
            <path d="M24 26.8 L22.2 30.2 L25.8 30.2 Z" fill="#0a090b"/>
            <line x1="21.0" y1="33.2" x2="21.0" y2="37.5" stroke="#0a090b" stroke-width="1.6"/>
            <line x1="24.0" y1="33.2" x2="24.0" y2="37.5" stroke="#0a090b" stroke-width="1.6"/>
            <line x1="27.0" y1="33.2" x2="27.0" y2="37.5" stroke="#0a090b" stroke-width="1.6"/>
          </g>
        </svg>
      </span>`,
  M: `<span class="pencil-glyph pg-m" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="44" height="44">
          <g filter="url(#brushDry)">
            <polygon points="24,7.5 28.4,18.4 40.2,19.0 31.0,26.4 34.2,37.8 24,31.2 13.8,37.8 17.0,26.4 7.8,19.0 19.6,18.4" fill="#f5f3ee" stroke="#f5f3ee" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="24" cy="23.8" r="3.5" fill="#040805"/>
          </g>
        </svg>
      </span>`,
  S: "",
};

function buildPedestal() {
  const ped = document.createElement("div");
  ped.className = "ped ped-eye";
  ped.innerHTML = `
    <div class="ped-eye-rim" aria-hidden="true"></div>
    <div class="ped-eye-top" aria-hidden="true">
      <div class="ped-eye-stage">
        <img src="assets/eye-sclera.png" alt="" class="gow-eye-sclera">
        <img src="assets/eye-pupil.png" alt="" class="gow-eye-pupil">
        <img src="assets/eye-eyelids.png" alt="" class="gow-eye-eyelids">
        <img src="assets/eye-blink.png" alt="" class="gow-eye-blink">
      </div>
    </div>
  `;
  return ped;
}

function buildBoard() {
  const board = $("board");
  board.innerHTML = "";
  tiles = [];

  // 1. Create SVG spiral board matching the logo's white-pencil-on-black style
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "boardSvg";
  svg.setAttribute("viewBox", "0 0 680 680");
  svg.setAttribute("width", "680");
  svg.setAttribute("height", "680");

  let svgInner = `
    <defs>
      <filter id="chalkStroke" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.065" numOctaves="2" result="noise" seed="7" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="brushDry" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.18 0.06" numOctaves="3" seed="11" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <path id="arcTop" d="M 16,340 A 324,324 0 0 1 664,340" />
      <path id="arcBottom" d="M 664,340 A 324,324 0 0 1 16,340" />
    </defs>
    <circle cx="340" cy="340" r="338" fill="#000000" stroke="#e4e0d8" stroke-width="2.6" stroke-opacity="0.78" filter="url(#chalkStroke)" />
    <circle cx="340" cy="340" r="313" fill="none" stroke="#dcd8d0" stroke-width="1.1" stroke-dasharray="6,4,2,4" stroke-opacity="0.4" filter="url(#chalkStroke)" />
    <g fill="#e6e2da" fill-opacity="0.82" font-family="'Cinzel', Georgia, serif" font-size="13.5" font-weight="700" text-anchor="middle" dominant-baseline="middle" letter-spacing="14" filter="url(#chalkStroke)">
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
        <circle cx="340" cy="340" r="44" fill="none" stroke="#e4e0d8" stroke-width="1.1" stroke-dasharray="3,4" stroke-opacity="0.55" filter="url(#chalkStroke)" />
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

    const isSpecial = type === "L" || type === "M" || type === "S";
    const strokeCol = isSpecial ? "#f0ece4" : "#d8d4cc";
    const strokeOpacity = isSpecial ? "0.85" : "0.65";
    const strokeWidth = isSpecial ? "1.9" : "1.5";

    svgInner += `
      <g id="casilla-${num}" class="casilla-g type-${type}">
        <path class="casilla-path" d="${path}" fill="#000000" stroke="${strokeCol}" stroke-width="${strokeWidth}" stroke-opacity="${strokeOpacity}" filter="url(#chalkStroke)" />
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
  playDiceSound();
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
    playFichaSound();
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
        if (p.progress < BOARD_SIZE - 1) await land(p, p.progress);
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
          playFichaSound();
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
  const game = $("game"), front = $("front"), layer = $("fxLayer");
  game.classList.remove("scene-Q", "scene-B", "scene-P", "scene-limbo");
  game.classList.add("scene-" + type);
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

// Instant screamer: one flash, a lunge and a scream (see .screamer-* in style.css).
async function triggerScreamer() {
  const overlay = $("screamerOverlay");
  const custom = SCREAMER_IMAGES.length > 0;
  overlay.classList.toggle("custom", custom);
  if (custom) overlay.style.setProperty("--scream-img", `url("${pick(SCREAMER_IMAGES)}")`);
  overlay.hidden = false;
  playScream();
  await sleep(950);
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

  if (fxType === "B") {
    playBenefitAudio();
  } else if (fxType === "P") {
    playPunishmentAudio();
  }

  const waitContinue = () => new Promise((res) => btn.addEventListener("click", res, { once: true }));
  const open = () => {
    front.hidden = false;
    void front.offsetWidth;
    $("game").classList.add("to-front");
    front.classList.add("show");
  };
  const close = async () => {
    stopBenefitAudio();
    stopPunishmentAudio();
    front.classList.remove("show", "win", "fail");
    card.classList.remove("hit");
    $("game").classList.remove("to-front");
    await sleep(600);
    $("game").classList.remove("scene-Q", "scene-B", "scene-P", "scene-limbo");
    front.hidden = true;
    body.innerHTML = "";
  };

  open();
  btn.focus({ preventScroll: true });
  await waitContinue();
  await close();
}

// Options in random order (so the right answer is not always B or C), relabelled A-D,
// in the chosen language (options_es holds the Spanish text).
const LABELS = ["A", "B", "C", "D"];
const stripLabel = (t) => (t || "").replace(/^[A-D]\)\s*/, "").trim();

function buildChoices(q) {
  const es = (gameLang === "es") && Array.isArray(q.options_es);
  const baseOptions = (es && q.options_es.length === 4) ? q.options_es : q.options;
  const items = q.options.map((o, i) => ({
    text: stripLabel(baseOptions[i] || o),
    correct: o.trim()[0] === q.correct_letter,
  }));
  shuffle(items);
  return items.map((it, i) => ({
    letter: LABELS[i],
    text: `${LABELS[i]}) ${it.text}`,
    correct: it.correct
  }));
}

// Handles trivia encounters: standard questions or life-or-death LIMBO
async function askQuestion(p, isLimbo = false) {
  const front = $("front"), card = $("frontCard"), body = $("frontBody"), btn = $("frontBtn");
  const timerWrap = $("frontTimerWrap"), timerBar = $("timerBar"), timerText = $("timerText");

  body.innerHTML = "";
  btn.hidden = true;

  const q = isLimbo ? getLimboQuestion() : getNextQuestion();
  if (!q) {
    await showBannerScene("!", I18N[gameLang].noQuestionsTitle, I18N[gameLang].noQuestionsText, "Q");
    return;
  }

  setFx(isLimbo ? "limbo" : "Q");
  card.className = `front-card ${isLimbo ? "t-L fx-limbo" : "t-Q fx-Q"}`;

  // Check CAS-05: The Cursed Whisper
  let isCursed = false;
  if (p.cursedWhisper) {
    p.cursedWhisper = false;
    isCursed = true;
    p.shield = false; // The curse pierces all shields
    log(I18N[gameLang].cursedLog(p.name));
  }

  let timerInterval = null;
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerWrap.hidden = true;
    timerWrap.classList.remove("urgent");
    stopQuestionWhisper();
    stopQuestionAudio();
  };

  const open = () => {
    front.hidden = false;
    void front.offsetWidth;
    $("game").classList.add("to-front");
    front.classList.add("show");
    playQuestionWhisper();
  };

  const close = async () => {
    stopTimer();
    stopQuestionWhisper();
    stopQuestionAudio();
    front.classList.remove("show", "win", "fail");
    card.classList.remove("hit");
    $("game").classList.remove("to-front");
    await sleep(600);
    $("game").classList.remove("scene-Q", "scene-B", "scene-P", "scene-limbo");
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

  const choices = buildChoices(q);
  const correctChoice = choices.find((c) => c.correct) || choices[0];
  const correctLetter = correctChoice.letter;
  const answerText = correctChoice.text;
  const answerPrimary = answerText;

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
          log(I18N[gameLang].cursedVictimLog(p.name));
        }
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

        if (isCursed) {
          p.skipTurn = true;
          log(I18N[gameLang].cursedVictimLog(p.name));
        }

        if (p.shield && !isCursed) {
          // Protected by Spectral Shield
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
          // Standard question failure: add strike, reset to start or anchor
          p.failures++;
          if (p.anchor && p.anchor > 0) {
            const savedAnchor = p.anchor;
            p.anchor = 0;
            p.progress = savedAnchor;
            renderTokens(p.id);
            log(I18N[gameLang].anchorSaved(savedAnchor));
          } else {
            p.progress = 0;
            renderTokens(p.id);
          }

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
      const correctBtn = opts.querySelector(`[data-letter="${correctLetter}"]`);
      if (correctBtn) correctBtn.classList.add("correct");

      if (isCursed) {
        p.skipTurn = true;
        log(I18N[gameLang].cursedVictimLog(p.name));
      }

      if (p.shield && !isCursed) {
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
        if (p.anchor && p.anchor > 0) {
          const savedAnchor = p.anchor;
          p.anchor = 0;
          p.progress = savedAnchor;
          renderTokens(p.id);
          log(I18N[gameLang].anchorSaved(savedAnchor));
        } else {
          p.progress = 0;
          renderTokens(p.id);
        }

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

    // Calculate effective timer (Check CAS-03: Time Pressure)
    let effectiveSeconds = timerSeconds;
    let isPressured = false;
    if (p.timePressure) {
      p.timePressure = false;
      isPressured = true;
      effectiveSeconds = Math.max(5, Math.floor(timerSeconds > 0 ? timerSeconds / 2 : 10));
      log(I18N[gameLang].timePressureLog(p.name));
    }

    // Countdown: it starts once the options are visible (no need to wait for whispers to end)
    let timerStarted = false;
    const beginCountdown = () => {
      if (timerStarted || resolved || effectiveSeconds <= 0) return;
      timerStarted = true;
      startQuestionAudio(q.category, effectiveSeconds);
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

    const startUnlimited = () => {
      if (timerStarted || resolved) return;
      timerStarted = true;
      startQuestionAudio(q.category, 0);
    };

    let countdownTriggered = false;
    const triggerCountdown = () => {
      if (countdownTriggered || resolved) return;
      countdownTriggered = true;
      if (effectiveSeconds > 0) {
        beginCountdown();
      } else {
        startUnlimited();
      }
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

    const optionsDurationMs = Math.round((0.35 + n * 0.05 + 3 * 0.12 + 0.6) * 1000);
    if (opts.lastElementChild) {
      opts.lastElementChild.addEventListener("animationend", triggerCountdown, { once: true });
    }
    setTimeout(triggerCountdown, optionsDurationMs + 300);

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

function playEyeDrone() {
  if (!soundOn) return;
  const c = audio();
  if (!c) return;
  try {
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(45, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 5.5);

    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(120, t);
    filter.frequency.exponentialRampToValueAtTime(260, t + 2.4);
    filter.frequency.exponentialRampToValueAtTime(80, t + 6.0);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 2.0);
    gain.gain.setValueAtTime(0.25, t + 4.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 6.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 6.3);
  } catch (e) {}
}

function playTypeSound() {
  if (!soundOn) return;
  const c = audio();
  if (!c) return;
  try {
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(420 + Math.random() * 80, t);
    gain.gain.setValueAtTime(0.035, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.03);
  } catch (e) {}
}

function animateEyeSequence() {
  return new Promise((resolve) => {
    const stage = $("winEyeStage");
    const lidTop = $("winLidTop");
    const lidBottom = $("winLidBottom");
    const blink = $("winEyeBlink");
    const pupil = $("winPupil");

    const tOpen = 2400;   // 2.4s para abrirse lentamente
    const tHold = 2200;   // 2.2s mirando fijamente al jugador
    const tClose = 1800;  // 1.8s para volver a cerrarse
    const startTime = performance.now();

    function setEyeProgress(progress, elapsed) {
      // progress: 0 (cerrado) a 1 (completamente abierto)
      const clamped = Math.max(0, Math.min(1, progress));
      const openPct = (clamped * 49).toFixed(2);
      const topPct = (-clamped * 110).toFixed(2);
      const botPct = (clamped * 110).toFixed(2);
      const blinkOp = (1 - clamped).toFixed(3);

      if (stage) stage.style.setProperty("--eye-open", `${openPct}%`);
      if (lidTop) lidTop.style.setProperty("--lid-top-y", `${topPct}%`);
      if (lidBottom) lidBottom.style.setProperty("--lid-bottom-y", `${botPct}%`);
      if (blink) blink.style.setProperty("--blink-opacity", blinkOp);

      if (pupil) {
        // Mirada fija al frente, con un sutil micro-latido de presencia viva
        const breath = 1 + Math.sin(elapsed / 320) * 0.02 * clamped;
        pupil.style.transform = `translateX(0) scale(${breath.toFixed(4)})`;
      }
    }

    function easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function frame(now) {
      const elapsed = now - startTime;

      if (elapsed < tOpen) {
        const p = easeInOutCubic(elapsed / tOpen);
        setEyeProgress(p, elapsed);
        requestAnimationFrame(frame);
      } else if (elapsed < tOpen + tHold) {
        setEyeProgress(1, elapsed);
        requestAnimationFrame(frame);
      } else if (elapsed < tOpen + tHold + tClose) {
        const closeElapsed = elapsed - (tOpen + tHold);
        const p = 1 - easeInOutCubic(closeElapsed / tClose);
        setEyeProgress(Math.max(0, p), elapsed);
        requestAnimationFrame(frame);
      } else {
        setEyeProgress(0, elapsed);
        resolve();
      }
    }

    setEyeProgress(0, 0);
    requestAnimationFrame(frame);
  });
}

async function typewrite(element, text, speed = 40) {
  element.textContent = "";
  element.classList.add("typing");
  for (let i = 0; i < text.length; i++) {
    element.textContent += text[i];
    if (i % 2 === 0) playTypeSound();
    await sleep(speed);
  }
  element.classList.remove("typing");
}

async function playWinCinematic(winner, explanation) {
  const t = I18N[gameLang];
  const winTitleText = gameLang === "en" 
    ? `${winner.name} escaped the darkness` 
    : `${winner.name} escapó de la oscuridad`;

  const endScreen = $("end");
  const eyeOverlay = $("eyeOverlay");
  const endContent = $("endContent");
  const titleEl = $("endTitle");
  const textEl = $("endText");
  const againBtn = $("again");

  // 1. Pantalla en negro total
  endScreen.style.background = "#000000";
  titleEl.textContent = "";
  textEl.textContent = "";
  againBtn.style.opacity = "0";
  againBtn.style.pointerEvents = "none";
  againBtn.textContent = t.playAgain;

  endContent.hidden = true;
  eyeOverlay.hidden = false;
  eyeOverlay.style.opacity = "1";
  endScreen.hidden = false;

  // Pausa en negro antes de abrir el ojo
  await sleep(650);

  // 2. El ojo se abre lentamente, mirando al frente, y luego vuelve a cerrarse
  playEyeDrone();
  playQuestionWhisper();
  await animateEyeSequence();
  stopQuestionWhisper();

  // Pausa en negro tras cerrarse el ojo
  await sleep(500);
  eyeOverlay.style.transition = "opacity 0.6s ease";
  eyeOverlay.style.opacity = "0";
  await sleep(600);
  eyeOverlay.hidden = true;

  // 3. Aparece el texto escribiéndose
  endContent.hidden = false;
  await sleep(350);

  // Escribir: "$jugador escapó de la oscuridad"
  await typewrite(titleEl, winTitleText, 45);
  await sleep(400);

  // Escribir la breve explicación de por qué
  await typewrite(textEl, explanation, 35);
  await sleep(600);

  // Botón "Jugar de nuevo" aparece suavemente
  againBtn.style.transition = "opacity 0.8s ease";
  againBtn.style.opacity = "1";
  againBtn.style.pointerEvents = "auto";
  againBtn.focus();
}

function finish(winner) {
  const solo = players.length === 1;
  const t = I18N[gameLang];
  const explanation = solo ? t.soloWinText : t.multiWinText;
  playWinCinematic(winner, explanation);
}

function finishAllDead() {
  const solo = players.length === 1;
  const t = I18N[gameLang];
  $("eyeOverlay").hidden = true;
  $("endContent").hidden = false;
  $("endTitle").textContent = solo ? t.soloGameOverTitle : t.gameOverAllDeadTitle;
  $("endText").textContent = solo ? t.soloGameOverText : t.gameOverAllDeadText;
  $("again").textContent = t.playAgain;
  $("again").style.opacity = "1";
  $("again").style.pointerEvents = "auto";
  $("end").hidden = false;
  $("again").focus();
}

function finishLastSurvivor(winner) {
  const t = I18N[gameLang];
  const explanation = t.lastSurvivorText;
  playWinCinematic(winner, explanation);
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
  closeMenuModal();
  stopMenuMusic();
  stopQuestionWhisper();
  stopQuestionAudio();
  stopBenefitAudio();
  stopPunishmentAudio();
  currentLayout = generateRandomLayout();
  questionDeck = [];
  limboQuestionDeck = [];
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
    fiftyFifty: false,
    anchor: 0,
    timePressure: false,
    cursedWhisper: false,
  }));
  audio(); // created inside a click, so the browser allows the scream later
  $("menuBtn").textContent = I18N[gameLang].mainMenu;
  $("qualityBtn").textContent = I18N[gameLang].qualityHigh;
  $("soundBtn").textContent = I18N[gameLang].soundOn;
  $("rollBtn").textContent = I18N[gameLang].rollBtn;
  $("setup").hidden = true;
  $("game").hidden = false;
  buildBoard();
  buildDice();
  renderTokens();
  warmUp().then(play).catch((err) => console.error("Game loop error:", err));
}

// ---------------- SPIRAL MENU & MODAL LOGIC ----------------
let selectedPlayerCount = 2;

function getRulesHTML(lang) {
  if (lang === "en") {
    return `
      <h3>Objective</h3>
      <p>Travel through the 50 cursed tiles of the spiral board and be the first survivor to reach the GOAL (tile 50) or be the last one standing.</p>
      <h3>Survival & 3 Lives</h3>
      <p>Each player begins with <strong>3 lives</strong>. Answering incorrectly or letting the candle burn out costs 1 life and sends you back to the start (unless protected by a shield or anchor). Losing all 3 lives eliminates you and activates <strong>Spectator Mode</strong> to watch the remaining players.</p>
      <h3>Cursed Tiles</h3>
      <ul>
        <li><strong>Question (?)</strong>: Bilingual trivia across 4 categories with progressive difficulty.</li>
        <li><strong>Benefits (+)</strong>: Spectral Shield, Swift Step (+2), Protective Whisper (skips next question), Spectral Roll (extra die toss), 50/50 Wisdom and Safety Anchor (checkpoint).</li>
        <li><strong>Punishments (+)</strong>: Spectral Drag (-2), Fear Paralysis (skips turn), Time Pressure (halved time) and The Cursed Whisper.</li>
        <li><strong>LIMBO (†)</strong>: A rare, extreme life-or-death confrontation tile.</li>
      </ul>
      <h3>Category Nemeses</h3>
      <p>Each discipline is guarded by a horror entity with its own jumpscare: The Referee (Sports), The Chronicler (History), The Reckoner (Mathematics), and The Cartographer (Geography).</p>
    `;
  }
  return `
    <h3>Objetivo</h3>
    <p>Recorre las 50 casillas malditas del tablero en espiral y sé el primer superviviente en alcanzar la META (casilla 50) o ser el último en pie.</p>
    <h3>Supervivencia y 3 Vidas</h3>
    <p>Cada jugador cuenta con <strong>3 vidas</strong>. Responder incorrectamente o que se consuma la vela cuesta 1 vida y regresa al peón a la casilla de salida (salvo protección de escudos o anclas). Perder las 3 vidas elimina al jugador y activa el <strong>Modo Espectador</strong> para seguir presenciando la partida.</p>
    <h3>Casillas del Tablero</h3>
    <ul>
      <li><strong>Pregunta (?)</strong>: Preguntas bilingües en 4 categorías con dificultad progresiva según tu avance.</li>
      <li><strong>Beneficios (+)</strong>: Escudo Espectral, Paso Veloz (+2), Susurro Protector, Tirada Espectral (dado extra), Susurro 50/50 y Ancla Espectral (checkpoint de caída).</li>
      <li><strong>Castigos (+)</strong>: Retroceso (-2), Parálisis (pierde turno), Presión Temporal (tiempo a la mitad) y Maldición del Susurro.</li>
      <li><strong>LIMBO (†)</strong>: Casilla oculta de juicio mortal extremo.</li>
    </ul>
    <h3>Entidades por Categoría</h3>
    <p>Cada área está custodiada por un enemigo temático con su propio screamer: El Árbitro (Deportes), El Cronista (Historia), El Contador (Matemáticas) y El Cartógrafo (Geografía).</p>
  `;
}

function getCreditsHTML(lang) {
  return `
    <h3>Guess or Die</h3>
    <p><strong>Programa:</strong> Análisis y Desarrollo de Software (ADSO)<br><strong>Ficha:</strong> 3408345 | <strong>Centro:</strong> SENA</p>
    <h3>Equipo de Desarrollo</h3>
    <ul>
      <li><strong>Miguel Andrés Murgas García</strong></li>
      <li><strong>Joiman Enoc Rico Bueno</strong></li>
      <li><strong>Jesús Samuel Suarez Padilla</strong></li>
      <li><strong>Yoimer Jimenez Peinado</strong></li>
      <li><strong>Jesús José Castro Genez</strong></li>
      <li><strong>Jose Angel Soto Mejia</strong></li>
    </ul>
    <h3>Tecnología</h3>
    <p>Desarrollado en HTML5 semántico, CSS 3D nativo y JavaScript moderno (ES6+ Vanilla). Sin librerías externas.</p>
  `;
}

function updateRosterSummary() {
  const container = $("playRosterSummary");
  if (!container) return;
  const inputs = document.querySelectorAll(".player-name-input");
  container.innerHTML = "";
  inputs.forEach((inp, i) => {
    const val = inp.value.trim() || I18N[gameLang].defaultPlayer(i + 1);
    const chip = document.createElement("div");
    chip.className = "roster-chip";
    chip.innerHTML = `<span class="roster-chip-dot" style="background:${COLORS[i]};color:${COLORS[i]}"></span><span>${val}</span>`;
    container.appendChild(chip);
  });
}

function updateStatusBar() {
  const t = I18N[gameLang];
  if ($("statusPlayers")) $("statusPlayers").textContent = t.statusPlayers(selectedPlayerCount);
  if ($("statusTimer")) $("statusTimer").textContent = t.statusTimer(timerSeconds);
  if ($("statusLang")) $("statusLang").textContent = t.statusLang;
}

function openMenuModal(panelId) {
  const modal = $("menuModal");
  if (!modal) return;
  modal.querySelectorAll(".modal-panel").forEach((p) => (p.hidden = true));
  const target = $(panelId);
  if (target) {
    target.hidden = false;
    modal.hidden = false;
    if (panelId === "panelPlay") updateRosterSummary();
    if (panelId === "panelRules") $("rulesContent").innerHTML = getRulesHTML(gameLang);
    if (panelId === "panelCredits") $("creditsContent").innerHTML = getCreditsHTML(gameLang);
  }
}

function closeMenuModal() {
  const modal = $("menuModal");
  if (!modal) return;
  modal.hidden = true;
  modal.querySelectorAll(".modal-panel").forEach((p) => (p.hidden = true));
  updateStatusBar();
  updateRosterSummary();
}

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
  updateRosterSummary();
}

function updateSetupTexts() {
  const t = I18N[gameLang];
  if ($("setupTag")) $("setupTag").textContent = t.tag;
  if ($("playSetupTag")) $("playSetupTag").textContent = t.tag;
  if ($("setupNote")) $("setupNote").textContent = selectedPlayerCount === 1 ? t.noteSolo : t.note;
  if ($("langLabel")) $("langLabel").textContent = t.langLabel;
  if ($("timerLabel")) $("timerLabel").textContent = t.timerLabel;
  if ($("timerOffBtn")) $("timerOffBtn").textContent = t.timerOff;
  if ($("playersLabel")) $("playersLabel").textContent = t.playersLabel;
  if ($("namesLabel")) $("namesLabel").textContent = t.namesLabel;
  if ($("startBtn")) $("startBtn").textContent = t.startBtn;
  if ($("setupWarn")) $("setupWarn").textContent = t.warning;

  // Spiral menu buttons
  if ($("lblMenuPlay")) $("lblMenuPlay").textContent = t.menuPlay;
  if ($("lblMenuPlayers")) $("lblMenuPlayers").textContent = t.menuPlayers;
  if ($("lblMenuTimer")) $("lblMenuTimer").textContent = t.menuTimer;
  if ($("lblMenuLang")) $("lblMenuLang").textContent = t.menuLang;
  if ($("lblMenuRules")) $("lblMenuRules").textContent = t.menuRules;
  if ($("lblMenuCredits")) $("lblMenuCredits").textContent = t.menuCredits;

  // Modal titles & subtitles
  if ($("playTitle")) $("playTitle").textContent = t.playModalTitle;
  if ($("playersTitle")) $("playersTitle").textContent = t.playersModalTitle;
  if ($("timerTitle")) $("timerTitle").textContent = t.timerModalTitle;
  if ($("timerSubtitle")) $("timerSubtitle").textContent = t.timerSubtitle;
  if ($("langTitle")) $("langTitle").textContent = t.langModalTitle;
  if ($("langSubtitle")) $("langSubtitle").textContent = t.langSubtitle;
  if ($("rulesTitle")) $("rulesTitle").textContent = t.rulesModalTitle;
  if ($("creditsTitle")) $("creditsTitle").textContent = t.creditsModalTitle;

  // Modal action buttons
  if ($("savePlayersBtn")) $("savePlayersBtn").textContent = t.btnSave;
  if ($("saveTimerBtn")) $("saveTimerBtn").textContent = t.btnSave;
  if ($("saveLangBtn")) $("saveLangBtn").textContent = t.btnSave;
  if ($("closeRulesBtn")) $("closeRulesBtn").textContent = t.btnUnderstood;
  if ($("closeCreditsBtn")) $("closeCreditsBtn").textContent = t.btnClose;

  updateStatusBar();
  updateRosterSummary();

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
    updateStatusBar();
  });
});

document.querySelectorAll(".count-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".count-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedPlayerCount = Number(btn.dataset.n);
    renderPlayerInputs(selectedPlayerCount);
    updateStatusBar();
    if ($("setupNote")) {
      $("setupNote").textContent = selectedPlayerCount === 1
        ? I18N[gameLang].noteSolo
        : I18N[gameLang].note;
    }
  });
});

// God of War menu navigation
$("menuTilePlay").addEventListener("click", () => openMenuModal("panelPlay"));
$("menuTilePlayers").addEventListener("click", () => openMenuModal("panelPlayers"));
$("menuTileTimer").addEventListener("click", () => openMenuModal("panelTimer"));
$("menuTileLang").addEventListener("click", () => openMenuModal("panelLang"));
$("menuTileRules").addEventListener("click", () => openMenuModal("panelRules"));
$("menuTileCredits").addEventListener("click", () => openMenuModal("panelCredits"));

// Modal close buttons
$("modalCloseBtn").addEventListener("click", closeMenuModal);
$("modalBackdrop").addEventListener("click", closeMenuModal);
$("savePlayersBtn").addEventListener("click", closeMenuModal);
$("saveTimerBtn").addEventListener("click", closeMenuModal);
$("saveLangBtn").addEventListener("click", closeMenuModal);
$("closeRulesBtn").addEventListener("click", closeMenuModal);
$("closeCreditsBtn").addEventListener("click", closeMenuModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("menuModal") && !$("menuModal").hidden) {
    closeMenuModal();
  }
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
  if (!soundOn) {
    stopMenuMusic();
    stopQuestionWhisper();
    stopQuestionAudio();
    stopBenefitAudio();
    stopPunishmentAudio();
  } else if ($("setup") && !$("setup").hidden) {
    if (menuAudio) {
      menuAudio.currentTime = 0;
      menuAudio.play().catch(() => {});
    }
  }
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
initAudioSystem();
