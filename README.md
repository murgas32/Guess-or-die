# Guess or Die

Juego de mesa por turnos de terror psicologico y supervivencia con trivia bilingue, desarrollado en HTML5, CSS 3D puro y Vanilla JavaScript.

## Sinopsis
Los jugadores se encuentran en una misteriosa sala oscura iluminada unicamente por una lampara sobre la mesa. Para escapar deben recorrer un tablero maldito de 24 casillas. Una sola respuesta incorrecta sin proteccion sobrenatural te devolvera al punto de partida.

## Caracteristicas
- Entorno 3D sin librerias externas: Habitacion completa en CSS 3D con perspectiva, efectos de iluminacion, chimenea, ventana con luz de luna y camara en primera persona que levanta la mirada en cada encuentro.
- Screamer instantaneo al fallar: Si un jugador responde incorrectamente sin la proteccion del circulo de sal, un screamer visual azota la pantalla e inmediatamente el peon es devuelto a la casilla de inicio.
- Flujo agil sin boton de continuar: Al acertar una pregunta, el sistema valida la respuesta y transfiere el turno directamente al siguiente jugador sin pantallas intermedias.
- Temporizador de Vela: Cuenta regresiva visual (15s, 20s, 30s o desactivado). Si la vela se extingue antes de responder, la oscuridad te consume y vuelves al inicio.
- Personalizacion de Jugadores (1 a 4 jugadores): Permite ingresar los nombres de cada participante con su peon de color correspondiente.
- Selector de Idioma (Espanol / English): Configura el idioma de las preguntas, de sus opciones de respuesta y de toda la interfaz (incluida la pantalla de configuracion), con boton para ver la pregunta y las opciones en el otro idioma en cualquier momento.
- Banco Ampliado de Preguntas: Mas de 110 preguntas bilingues clasificadas en 4 categorias (Deportes, Historia, Matematicas y Geografia).
- Casillas Especiales:
  - Pregunta (?): Pregunta aleatoria del mazo sin repeticion.
  - Beneficio (+): 6 posibles, se guardan hasta usarse y se muestran junto al nombre del jugador:
    - Vela mas brillante: avanza 2 casillas.
    - Circulo de sal: escudo que perdona el proximo fallo.
    - Susurros apagados: la proxima casilla de pregunta guarda silencio (sin pregunta).
    - Dados del destino: la proxima tirada se lanza dos veces y se suman (`DOUBLE_DICE_MODE` en game.js permite quedarse con la mayor).
    - Susurro del mas alla (50/50): en la proxima pregunta desaparecen dos respuestas incorrectas.
    - Ancla fantasmal: fija la casilla actual durante el proximo turno. Si fallas (o se acaba el tiempo) vuelves a esa casilla en vez de al inicio, y "Algo te retiene" no tiene efecto. El circulo de sal se gasta antes que el ancla.
  - Castigo (+): El suelo cede (-2 casillas) o Retencion (pierde el turno). En modo de 1 jugador solo aparece "El suelo cede", porque perder el turno no tiene sentido sin rivales.
- Modo de Calidad (Baja / Alta): Optimizado para correr fluido en cualquier equipo mediante texture baking y modo simplificado.

## Como jugar
Simplemente abre el archivo index.html en cualquier navegador web moderno (Chrome, Edge, Firefox, Safari). No requiere instalacion ni servidores.
