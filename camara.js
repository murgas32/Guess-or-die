// Pausa las animaciones de ambiente solo mientras la camara sube o baja.
(() => {
  const game = document.getElementById("game");
  if (!game) return;

  const style = document.createElement("style");
  style.textContent = `
    #game.cam-moving .wall-eye::after,
    #game.cam-moving .win-flare,
    #game.cam-moving .window-beam,
    #game.cam-moving .win-shadow,
    #game.cam-moving .front::after,
    #game.cam-moving .ember { animation-play-state: paused !important; }
  `;
  document.head.appendChild(style);

  let arriba = game.classList.contains("to-front");
  let espera;
  new MutationObserver(() => {
    const ahora = game.classList.contains("to-front");
    if (ahora === arriba) return;
    arriba = ahora;
    game.classList.add("cam-moving");
    clearTimeout(espera);
    espera = setTimeout(() => game.classList.remove("cam-moving"), 700);
  }).observe(game, { attributes: true, attributeFilter: ["class"] });
})();
