#!/usr/bin/env python3
"""Optimiza Guess or Die sin cambiar su aspecto.

Uso: copia este archivo junto a index.html y ejecuta:  python optimizar.py
Es todo o nada: si algun fragmento no coincide, no se modifica ningun archivo.
Guarda los originales como game.js.bak y style.css.bak
"""
import re
import shutil
import sys
from pathlib import Path

MARCA = "/* OPTIMIZADO */"


class ErrorParche(Exception):
    pass


def reemplazar(texto, viejo, nuevo, nombre):
    """Reemplaza un fragmento que debe aparecer exactamente una vez.
    La sangria y los saltos de linea pueden variar."""
    patron = r"\s+".join(re.escape(p) for p in viejo.split())
    n = len(re.findall(patron, texto))
    if n != 1:
        raise ErrorParche(f"{nombre}: se esperaba 1 coincidencia y hay {n}")
    return re.sub(patron, lambda _: nuevo, texto)


def parchear_js(js):
    # 1. Cargar los sonidos una sola vez. Antes, si fetch fallaba (p. ej. al abrir
    #    con file://), cada clic o tecla volvia a lanzar las 3 descargas.
    js = reemplazar(js, "let buffersLoading = false;",
                    "let buffersRequested = false;", "bandera de carga")
    js = reemplazar(js, "if (buffersLoading || diceBuffer) return;",
                    "if (buffersRequested) return;", "guarda de carga")
    js = reemplazar(js, "buffersLoading = true;",
                    "buffersRequested = true;\n  getNoiseBuffer(c);", "inicio de carga")
    js = reemplazar(js, "]).finally(() => { buffersLoading = false; });",
                    "]);", "fin de carga")

    # 2. Reutilizar elementos <audio> de respaldo en vez de crear uno por sonido
    #    (la ficha suena cada 260 ms). Y generar el ruido del grito una sola vez.
    ayudas = """const sfxPools = {};
function getSfxPool(src) {
  if (!sfxPools[src]) {
    sfxPools[src] = {
      next: 0,
      items: Array.from({ length: 4 }, () => {
        const a = new Audio(src);
        a.preload = "auto";
        return a;
      })
    };
  }
  return sfxPools[src];
}

function playFallback(src, volume) {
  const pool = getSfxPool(src);
  const a = pool.items[pool.next];
  pool.next = (pool.next + 1) % pool.items.length;
  a.volume = volume;
  a.currentTime = 0;
  a.play().catch(() => {});
}

let noiseBuffer = null;
function getNoiseBuffer(c) {
  if (!noiseBuffer) {
    noiseBuffer = c.createBuffer(1, Math.floor(c.sampleRate * 0.35), c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.08));
    }
  }
  return noiseBuffer;
}

function loadSoundBuffers() {"""
    js = reemplazar(js, "function loadSoundBuffers() {", ayudas, "funciones de apoyo")

    for clave, vol in (("dice", "0.95"), ("ficha", "0.85")):
        js = reemplazar(
            js,
            f"const a = new Audio(SOUND_FILES.{clave}); a.volume = {vol}; a.play().catch(() => {{}});",
            f"playFallback(SOUND_FILES.{clave}, {vol});", f"sonido {clave}")

    js = reemplazar(
        js,
        """const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.35), c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.08));
        }""",
        "", "ruido del grito")
    js = reemplazar(js, "noise.buffer = buf;",
                    "noise.buffer = getNoiseBuffer(c);", "uso del ruido")

    js = reemplazar(
        js, "bakeTextures(); initAudioSystem();",
        "bakeTextures();\ninitAudioSystem();\n"
        "getSfxPool(SOUND_FILES.dice);\ngetSfxPool(SOUND_FILES.ficha);", "arranque")

    # 3. Temporizador: tocar el texto solo cuando cambia el segundo.
    js = reemplazar(
        js, "timerText.textContent = `${Math.ceil(remainingMs / 1000)}s`;",
        "const label = `${Math.ceil(remainingMs / 1000)}s`;\n"
        "        if (timerText.textContent !== label) timerText.textContent = label;",
        "temporizador")

    # 4. Decodificar las imagenes antes de jugar.
    precarga = """const IMAGE_ASSETS = [
  "assets/wall-brick.jpg", "assets/wall-eye.png", "assets/win-entity.png",
  "assets/eye-sclera.png", "assets/eye-pupil.png",
  "assets/eye-eyelids.png", "assets/eye-blink.png"
];
const preloadedImages = [];
const imagesReady = Promise.all(IMAGE_ASSETS.concat(SCREAMER_IMAGES).map((src) => {
  const img = new Image();
  img.src = src;
  preloadedImages.push(img);
  return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
}));

async function warmUp() {"""
    js = reemplazar(js, "async function warmUp() {", precarga, "precarga de imagenes")

    # 5. Dibujar tambien la escena de castigo detras de la cortina inicial.
    js = reemplazar(
        js, 'game.classList.add("warm");',
        'game.classList.add("warm", "scene-P");', "calentamiento inicio")
    js = reemplazar(
        js,
        'game.classList.remove("to-front"); await sleep(500); game.classList.remove("warm");',
        'game.classList.remove("to-front", "scene-P");\n'
        '  await Promise.all([sleep(700), Promise.race([imagesReady, sleep(1500)])]);\n'
        '  game.classList.remove("warm");', "calentamiento fin")
    return MARCA + "\n" + js


BLOQUE = re.compile(
    r"/\* -+ VICTORY PEDESTAL EYE & CINEMATIC -+ \*/.*?"
    r"#panelPlay #setupWarn \{[^{}]*\}", re.S)

CSS_NUEVO = """

/* ---------- Rendimiento ---------- */
/* Los ojos de la pared solo se ven en la escena de castigo: fuera de ella no se
   pintan y sus animaciones quedan en pausa. */
.wall-eyes {
  visibility: hidden;
  transition: opacity var(--head-turn-dur) var(--head-turn-ease),
    filter var(--head-turn-dur) var(--head-turn-ease),
    visibility 0s linear var(--head-turn-dur);
}
#game.scene-P .wall-eyes { visibility: visible; transition-delay: 0s; }
#game:not(.scene-P) .wall-eye::after { animation-play-state: paused; }
/* La barra del tiempo no obliga a recalcular el resto de la pagina. */
.timer-track { contain: layout paint; }
"""


def parchear_css(css):
    """Deja solo la primera copia del bloque repetido. Devuelve (css, copias)."""
    copias = BLOQUE.findall(css)
    if not copias:
        raise ErrorParche("CSS: no se encontro el bloque repetido")
    if len({" ".join(c.split()) for c in copias}) != 1:
        raise ErrorParche("CSS: las copias del bloque no son identicas")
    vistos = []

    def quitar(m):
        vistos.append(1)
        return m.group(0) if len(vistos) == 1 else ""

    css = BLOQUE.sub(quitar, css)
    if css.count("{") != css.count("}"):
        raise ErrorParche("CSS: las llaves quedaron desbalanceadas")
    return MARCA + "\n" + css.rstrip() + CSS_NUEVO, len(copias)


def main():
    carpeta = Path(__file__).resolve().parent
    rutas = {n: carpeta / n for n in ("game.js", "style.css")}
    textos, crlf = {}, {}
    for nombre, ruta in rutas.items():
        if not ruta.exists():
            sys.exit(f"No encuentro {nombre}. Copia el script junto a index.html.")
        crudo = ruta.read_bytes().decode("utf-8")
        crlf[nombre] = "\r\n" in crudo
        textos[nombre] = crudo.replace("\r\n", "\n")
        if MARCA in textos[nombre]:
            sys.exit(f"{nombre} ya estaba optimizado. No se hizo nada.")
    try:
        js = parchear_js(textos["game.js"])
        css, copias = parchear_css(textos["style.css"])
    except ErrorParche as e:
        sys.exit(f"No se modifico nada. {e}")

    for nombre, nuevo in (("game.js", js), ("style.css", css)):
        ruta = rutas[nombre]
        antes = ruta.stat().st_size
        shutil.copy2(ruta, ruta.with_name(nombre + ".bak"))
        if crlf[nombre]:
            nuevo = nuevo.replace("\n", "\r\n")
        ruta.write_bytes(nuevo.encode("utf-8"))
        print(f"{nombre}: {antes / 1024:.0f} KB -> {ruta.stat().st_size / 1024:.0f} KB")
    print(f"Copias del bloque CSS: {copias} -> 1")
    print("Listo. Originales guardados como .bak")


if __name__ == "__main__":
    main()
