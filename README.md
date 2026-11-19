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
- Selector de Idioma (Espanol / English): Configura el idioma principal de las preguntas y de la interfaz, con boton dinamico para alternar la traduccion en cualquier momento.
- Banco Ampliado de Preguntas: Mas de 110 preguntas bilingues clasificadas en 4 categorias (Deportes, Historia, Matematicas y Geografia).
- Casillas Especiales:
  - Pregunta (?): Pregunta aleatoria del mazo sin repeticion.
  - Beneficio (+): Escudo Espectral (perdona 1 error/tiempo), Paso Veloz (+2 casillas), Susurro Protector (salta la proxima pregunta), Tirada Espectral (lanzamiento extra de dado), Susurro de Sabiduria (elimina 2 opciones 50/50) o Ancla Espectral (fija un checkpoint seguro ante caidas).
  - Castigo (+): Retroceso Espectral (-2 casillas), Paralisis del Miedo (pierde el turno), Presion Temporal (mitad de tiempo en la siguiente pregunta), Ceguera Amnesica (oculta la categoria y bloquea traduccion) o Maldicion del Susurro (anula escudos y el turno queda congelado).
- Modo de Calidad (Baja / Alta): Optimizado para correr fluido en cualquier equipo mediante texture baking y modo simplificado.

## Como jugar
Simplemente abre el archivo index.html en cualquier navegador web moderno (Chrome, Edge, Firefox, Safari). No requiere instalacion ni servidores.
