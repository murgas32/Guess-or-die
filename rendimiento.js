// Prepara las capas que usa rendimiento.css. Se carga despues de game.js.
(() => {
  const crear = (clase) => {
    const el = document.createElement("i");
    el.className = clase;
    el.setAttribute("aria-hidden", "true");
    return el;
  };
  const back = document.querySelector("#roomBox .p.back");
  const sides = document.querySelectorAll("#roomBox .p.side");
  if (!back || sides.length !== 2) return;
  sides[0].classList.add("izq");
  sides[1].classList.add("der");

  [back, ...sides].forEach((pared) => {
    const medio = crear("medio");
    medio.removeAttribute("aria-hidden");
    while (pared.firstChild) medio.appendChild(pared.firstChild);
    pared.appendChild(medio);
  });
  back.prepend(crear("pared-castigo"));

  const ventana = back.querySelector(".window");
  ["normal", "beneficio", "castigo"].forEach((tipo) => ventana.before(crear("brillo " + tipo)));
})();

// ---- Preparacion completa: ensaya todas las escenas detras de la pantalla de carga ----
(() => {
  if (typeof warmUp !== "function") return;
  const cuadro = () => new Promise((r) => requestAnimationFrame(r));

  // Espera a que el navegador dibuje varios cuadros seguidos sin atascarse (con tiempo maximo).
  async function esperarFluidez(maximo) {
    const inicio = performance.now();
    let antes = await cuadro(), seguidos = 0;
    while (seguidos < 8 && performance.now() - inicio < maximo) {
      const ahora = await cuadro();
      seguidos = ahora - antes < 25 ? seguidos + 1 : 0;
      antes = ahora;
    }
  }

  // Textura de madera ya convertida a imagen (la prepara bakeTextures en game.js).
  async function esperarMadera(maximo) {
    const inicio = performance.now();
    while (!getComputedStyle(document.documentElement).getPropertyValue("--wood").includes("blob:") &&
           performance.now() - inicio < maximo) await sleep(100);
  }

  window.warmUp = async function () {
    const game = $("game"), cover = $("cover"), scare = $("screamerOverlay");
    const front = $("front"), card = $("frontCard"), body = $("frontBody");
    const ESCENAS = ["scene-Q", "scene-B", "scene-P", "scene-limbo"];
    $("coverText").textContent = I18N[gameLang].preparing;
    cover.hidden = false;
    try {
      loadSoundBuffers();
      await Promise.race([Promise.all([imagesReady, document.fonts.ready]), sleep(3000)]);
      await esperarMadera(3000);
      await esperarFluidez(2000);

      for (const tipo of ["Q", "B", "P", "limbo"]) {
        setFx(tipo);
        card.className = "front-card " + (tipo === "limbo" ? "t-L fx-limbo" : `t-${tipo} fx-${tipo}`);
        $("frontIcon").textContent = "?";
        $("frontTitle").textContent = "Guess or Die";
        $("frontText").innerHTML = words(I18N[gameLang].tag);
        body.innerHTML = '<div class="q-options">' +
          ["A", "B", "C", "D"].map((l) => `<button type="button" class="q-opt-btn" tabindex="-1">${l}</button>`).join("") +
          "</div>";
        front.hidden = false;
        void front.offsetWidth;
        game.classList.add("to-front"); // la camara sube de verdad, tapada por la pantalla de carga
        front.classList.add("show");
        await sleep(900);
        await esperarFluidez(1000);
        front.classList.remove("show");
        game.classList.remove("to-front");
        await sleep(700);
        game.classList.remove(...ESCENAS);
        front.hidden = true;
      }

      scare.hidden = false;
      await sleep(500);
      scare.hidden = true;
      await esperarFluidez(2000);
    } finally {
      // Dejar todo como al empezar, incluso si algo fallara.
      scare.hidden = true;
      front.hidden = true;
      front.classList.remove("show", "fx-Q", "fx-B", "fx-P", "fx-limbo");
      game.classList.remove("to-front", ...ESCENAS);
      card.className = "front-card";
      body.innerHTML = "";
      $("frontIcon").textContent = $("frontTitle").textContent = $("frontText").textContent = "";
      $("fxLayer").innerHTML = "";
      cover.hidden = true;
    }
  };
})();
