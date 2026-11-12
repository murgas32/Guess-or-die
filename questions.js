const QUESTIONS = [
  {
    "category": "Sports",
    "question_en": "How many players are on the field for one team in a soccer match?",
    "question_es": "¿Cuántos jugadores por equipo hay en cancha durante un partido de fútbol?",
    "options": [
      "A) 9",
      "B) 10",
      "C) 11",
      "D) 12"
    ],
    "answer": "C) 11",
    "correct_letter": "C"
  },
  {
    "category": "Sports",
    "question_en": "How points is a free throw worth in basketball?",
    "question_es": "¿Cuántos puntos vale un tiro libre en baloncesto?",
    "options": [
      "A) 1 point",
      "B) 2 points",
      "C) 3 points",
      "D) 4 points"
    ],
    "answer": "A) 1 point",
    "correct_letter": "A"
  },
  {
    "category": "Sports",
    "question_en": "Which country won the FIFA Men's World Cup in 2022?",
    "question_es": "¿Qué país ganó el Mundial de Fútbol Masculino en 2022?",
    "options": [
      "A) Brazil",
      "B) France",
      "C) Argentina",
      "D) Germany"
    ],
    "answer": "C) Argentina",
    "correct_letter": "C"
  },
  {
    "category": "Sports",
    "question_en": "What colored card does a referee show to remove a player from a soccer game?",
    "question_es": "¿Qué tarjeta muestra el árbitro para expulsar a un jugador en fútbol?",
    "options": [
      "A) Yellow",
      "B) Red",
      "C) Blue",
      "D) Green"
    ],
    "answer": "B) Red",
    "correct_letter": "B"
  },
  {
    "category": "Sports",
    "question_en": "What sport is Usain Bolt famous for?",
    "question_es": "¿Por qué deporte es famoso Usain Bolt?",
    "options": [
      "A) Swimming",
      "B) Running (Track and Field)",
      "C) Cycling",
      "D) Basketball"
    ],
    "answer": "B) Running (Track and Field)",
    "correct_letter": "B"
  },
  {
    "category": "Sports",
    "question_en": "Which famous basketball player wore the number 23 for the Chicago Bulls?",
    "question_es": "¿Qué famoso baloncestista usó el número 23 en los Chicago Bulls?",
    "options": [
      "A) LeBron James",
      "B) Kobe Bryant",
      "C) Michael Jordan",
      "D) Shaquille O'Neal"
    ],
    "answer": "C) Michael Jordan",
    "correct_letter": "C"
  },
  {
    "category": "Sports",
    "question_en": "How often are the Summer Olympic Games held?",
    "question_es": "¿Cada cuántos años se celebran los Juegos Olímpicos de Verano?",
    "options": [
      "A) Every 2 years",
      "B) Every 3 years",
      "C) Every 4 years",
      "D) Every 5 years"
    ],
    "answer": "C) Every 4 years",
    "correct_letter": "C"
  },
  {
    "category": "Sports",
    "question_en": "What shirt number does Lionel Messi wear for the Argentina national team?",
    "question_es": "¿Qué número de camiseta usa Lionel Messi en la selección de Argentina?",
    "options": [
      "A) 7",
      "B) 9",
      "C) 10",
      "D) 11"
    ],
    "answer": "C) 10",
    "correct_letter": "C"
  },
  {
    "category": "Sports",
    "question_en": "What shirt number is famous for Cristiano Ronaldo (CR7)?",
    "question_es": "¿Qué número de camiseta es famoso para Cristiano Ronaldo (CR7)?",
    "options": [
      "A) 7",
      "B) 9",
      "C) 10",
      "D) 11"
    ],
    "answer": "A) 7",
    "correct_letter": "A"
  },
  {
    "category": "Sports",
    "question_en": "Which country won the FIFA Men's World Cup in 2026?",
    "question_es": "¿Qué país ganó el Mundial de Fútbol Masculino en 2026?",
    "options": [
      "A) Argentina",
      "B) France",
      "C) Spain",
      "D) Brazil"
    ],
    "answer": "C) Spain",
    "correct_letter": "C"
  },
  {
    "category": "Sports",
    "question_en": "How many players play in a volleyball team?",
    "question_es": "¿Cuántos jugadores juegan en un equipo de voleibol?",
    "options": [
      "A) 5",
      "B) 6",
      "C) 7",
      "D) 11"
    ],
    "answer": "B) 6",
    "correct_letter": "B"
  },
  {
    "category": "Sports",
    "question_en": "Which Colombian soccer team is nicknamed \"El Tiburón\" (The Shark)?",
    "question_es": "¿A qué equipo de fútbol colombiano le dicen \"El Tiburón\"?",
    "options": [
      "A) Millonarios",
      "B) Atlético Nacional",
      "C) Junior de Barranquilla",
      "D) América de Cali"
    ],
    "answer": "C) Junior de Barranquilla",
    "correct_letter": "C"
  },
  {
    "category": "Sports",
    "question_en": "What is the most popular sport in the world?",
    "question_es": "¿Cuál es el deporte más popular del mundo?",
    "options": [
      "A) Basketball",
      "B) Soccer (Football)",
      "C) Tennis",
      "D) Baseball"
    ],
    "answer": "B) Soccer (Football)",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "Who was the first President of the United States?",
    "question_es": "¿Quién fue el primer presidente de los Estados Unidos?",
    "options": [
      "A) Abraham Lincoln",
      "B) Thomas Jefferson",
      "C) George Washington",
      "D) John Adams"
    ],
    "answer": "C) George Washington",
    "correct_letter": "C"
  },
  {
    "category": "History",
    "question_en": "What ship sank in 1912 after hitting an iceberg?",
    "question_es": "¿Qué barco se hundió en 1912 tras chocar con un iceberg?",
    "options": [
      "A) Santa Maria",
      "B) Titanic",
      "C) Britannic",
      "D) Mayflower"
    ],
    "answer": "B) Titanic",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "Who painted the Mona Lisa?",
    "question_es": "¿Quién pintó la Mona Lisa?",
    "options": [
      "A) Vincent van Gogh",
      "B) Pablo Picasso",
      "C) Leonardo da Vinci",
      "D) Michelangelo"
    ],
    "answer": "C) Leonardo da Vinci",
    "correct_letter": "C"
  },
  {
    "category": "History",
    "question_en": "Which ancient civilization built the Colosseum in Rome?",
    "question_es": "¿Qué antigua civilización construyó el Coliseo de Roma?",
    "options": [
      "A) The Greeks",
      "B) The Romans",
      "C) The Egyptians",
      "D) The Mayans"
    ],
    "answer": "B) The Romans",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "In which year did World War II end?",
    "question_es": "¿En qué año terminó la Segunda Guerra Mundial?",
    "options": [
      "A) 1918",
      "B) 1939",
      "C) 1945",
      "D) 1950"
    ],
    "answer": "C) 1945",
    "correct_letter": "C"
  },
  {
    "category": "History",
    "question_en": "Who was known as the King of Pop?",
    "question_es": "¿Quién era conocido como el Rey del Pop?",
    "options": [
      "A) Elvis Presley",
      "B) Michael Jackson",
      "C) Prince",
      "D) David Bowie"
    ],
    "answer": "B) Michael Jackson",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "Which explorer reached America in 1492?",
    "question_es": "¿Qué explorador llegó a América en 1492?",
    "options": [
      "A) Christopher Columbus",
      "B) Marco Polo",
      "C) Ferdinand Magellan",
      "D) Vasco da Gama"
    ],
    "answer": "A) Christopher Columbus",
    "correct_letter": "A"
  },
  {
    "category": "History",
    "question_en": "What structure was built in China to protect against invasions?",
    "question_es": "¿Qué estructura se construyó en China para protegerse de invasiones?",
    "options": [
      "A) The Berlin Wall",
      "B) The Great Wall of China",
      "C) Hadrian's Wall",
      "D) The Red Wall"
    ],
    "answer": "B) The Great Wall of China",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "Which empire was ruled by Julius Caesar?",
    "question_es": "¿Qué imperio fue gobernado por Julio César?",
    "options": [
      "A) Persian Empire",
      "B) Roman Empire",
      "C) Ottoman Empire",
      "D) British Empire"
    ],
    "answer": "B) Roman Empire",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "What was the name of the first human to walk on the Moon?",
    "question_es": "¿Cómo se llamaba el primer humano en caminar sobre la Luna?",
    "options": [
      "A) Yuri Gagarin",
      "B) Buzz Aldrin",
      "C) Neil Armstrong",
      "D) John Glenn"
    ],
    "answer": "C) Neil Armstrong",
    "correct_letter": "C"
  },
  {
    "category": "History",
    "question_en": "In which country did the Industrial Revolution begin?",
    "question_es": "¿En qué país comenzó la Revolución Industrial?",
    "options": [
      "A) United States",
      "B) France",
      "C) Great Britain",
      "D) Germany"
    ],
    "answer": "C) Great Britain",
    "correct_letter": "C"
  },
  {
    "category": "History",
    "question_en": "Which famous queen ruled ancient Egypt alongside Julius Caesar and Mark Antony?",
    "question_es": "¿Qué famosa reina gobernó el antiguo Egipto junto a Julio César y Marco Antonio?",
    "options": [
      "A) Nefertiti",
      "B) Cleopatra",
      "C) Hatshepsut",
      "D) Elizabeth I"
    ],
    "answer": "B) Cleopatra",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "What famous revolution started in 1789 with the storming of the Bastille?",
    "question_es": "¿Qué famosa revolución comenzó en 1789 con la toma de la Bastilla?",
    "options": [
      "A) American Revolution",
      "B) French Revolution",
      "C) Russian Revolution",
      "D) Industrial Revolution"
    ],
    "answer": "B) French Revolution",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 7 × 8?",
    "question_es": "¿Cuánto es 7 × 8?",
    "options": [
      "A) 54",
      "B) 56",
      "C) 64",
      "D) 48"
    ],
    "answer": "B) 56",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "How many sides does a hexagon have?",
    "question_es": "¿Cuántos lados tiene un hexágono?",
    "options": [
      "A) 5",
      "B) 6",
      "C) 7",
      "D) 8"
    ],
    "answer": "B) 6",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What is the square root of 81?",
    "question_es": "¿Cuál es la raíz cuadrada de 81?",
    "options": [
      "A) 7",
      "B) 8",
      "C) 9",
      "D) 10"
    ],
    "answer": "C) 9",
    "correct_letter": "C"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 15 + 27?",
    "question_es": "¿Cuánto es 15 + 27?",
    "options": [
      "A) 40",
      "B) 42",
      "C) 44",
      "D) 52"
    ],
    "answer": "B) 42",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 50% of 120?",
    "question_es": "¿Cuánto es el 50% de 120?",
    "options": [
      "A) 50",
      "B) 60",
      "C) 70",
      "D) 80"
    ],
    "answer": "B) 60",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 100 - 37?",
    "question_es": "¿Cuánto es 100 - 37?",
    "options": [
      "A) 63",
      "B) 67",
      "C) 73",
      "D) 53"
    ],
    "answer": "A) 63",
    "correct_letter": "A"
  },
  {
    "category": "Mathematics",
    "question_en": "What prime number comes after 5?",
    "question_es": "¿Qué número primo sigue después del 5?",
    "options": [
      "A) 6",
      "B) 7",
      "C) 8",
      "D) 9"
    ],
    "answer": "B) 7",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 12 × 12?",
    "question_es": "¿Cuánto es 12 × 12?",
    "options": [
      "A) 124",
      "B) 134",
      "C) 144",
      "D) 154"
    ],
    "answer": "C) 144",
    "correct_letter": "C"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 3³ (3 to the power of 3)?",
    "question_es": "¿Cuánto es 3³ (3 elevado a la 3)?",
    "options": [
      "A) 9",
      "B) 18",
      "C) 27",
      "D) 81"
    ],
    "answer": "C) 27",
    "correct_letter": "C"
  },
  {
    "category": "Mathematics",
    "question_en": "What number is represented by the Roman numeral 'X'?",
    "question_es": "¿Qué número representa el numeral romano 'X'?",
    "options": [
      "A) 5",
      "B) 10",
      "C) 50",
      "D) 100"
    ],
    "answer": "B) 10",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 144 ÷ 12?",
    "question_es": "¿Cuánto es 144 ÷ 12?",
    "options": [
      "A) 10",
      "B) 11",
      "C) 12",
      "D) 14"
    ],
    "answer": "C) 12",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "What is the capital city of France?",
    "question_es": "¿Cuál es la capital de Francia?",
    "options": [
      "A) Rome",
      "B) Madrid",
      "C) Paris",
      "D) Berlin"
    ],
    "answer": "C) Paris",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "Which is the largest ocean on Earth?",
    "question_es": "¿Cuál es el océano más grande de la Tierra?",
    "options": [
      "A) Atlantic Ocean",
      "B) Indian Ocean",
      "C) Pacific Ocean",
      "D) Arctic Ocean"
    ],
    "answer": "C) Pacific Ocean",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "In which continent is the Amazon Rainforest located?",
    "question_es": "¿En qué continente se encuentra la Selva Amazónica?",
    "options": [
      "A) Africa",
      "B) South America",
      "C) Asia",
      "D) North America"
    ],
    "answer": "B) South America",
    "correct_letter": "B"
  },
  {
    "category": "Geography",
    "question_en": "What is the largest country in the world by land area?",
    "question_es": "¿Cuál es el país más grande del mundo por área terrestre?",
    "options": [
      "A) China",
      "B) Canada",
      "C) United States",
      "D) Russia"
    ],
    "answer": "D) Russia",
    "correct_letter": "D"
  },
  {
    "category": "Geography",
    "question_en": "Which river is considered the longest in the world?",
    "question_es": "¿Qué río se considera el más largo del mundo?",
    "options": [
      "A) Amazon River",
      "B) Nile River",
      "C) Mississippi River",
      "D) Yangtze River"
    ],
    "answer": "B) Nile River",
    "correct_letter": "B"
  },
  {
    "category": "Geography",
    "question_en": "What is the capital city of Japan?",
    "question_es": "¿Cuál es la capital de Japón?",
    "options": [
      "A) Beijing",
      "B) Seoul",
      "C) Tokyo",
      "D) Bangkok"
    ],
    "answer": "C) Tokyo",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "Which continent has the most countries?",
    "question_es": "¿Qué continente tiene más países?",
    "options": [
      "A) Asia",
      "B) Europe",
      "C) Africa",
      "D) South America"
    ],
    "answer": "C) Africa",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "Mount Everest is located in which mountain range?",
    "question_es": "¿En qué cordillera se encuentra el Monte Everest?",
    "options": [
      "A) The Andes",
      "B) The Alps",
      "C) The Himalayas",
      "D) The Rockies"
    ],
    "answer": "C) The Himalayas",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "What is the capital city of Australia?",
    "question_es": "¿Cuál es la capital de Australia?",
    "options": [
      "A) Sydney",
      "B) Melbourne",
      "C) Canberra",
      "D) Brisbane"
    ],
    "answer": "C) Canberra",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "Which country has a map shaped like a boot?",
    "question_es": "¿Qué país tiene un mapa con forma de bota?",
    "options": [
      "A) Spain",
      "B) Italy",
      "C) Greece",
      "D) Portugal"
    ],
    "answer": "B) Italy",
    "correct_letter": "B"
  },
  {
    "category": "Geography",
    "question_en": "What is the coldest continent on Earth?",
    "question_es": "¿Cuál es el continente más frío de la Tierra?",
    "options": [
      "A) Europe",
      "B) North America",
      "C) Antarctica",
      "D) Asia"
    ],
    "answer": "C) Antarctica",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "Which desert is the largest hot desert in the world?",
    "question_es": "¿Qué desierto es el desierto cálido más grande del mundo?",
    "options": [
      "A) Gobi Desert",
      "B) Atacama Desert",
      "C) Sahara Desert",
      "D) Kalahari Desert"
    ],
    "answer": "C) Sahara Desert",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "What is the capital city of Canada?",
    "question_es": "¿Cuál es la capital de Canadá?",
    "options": [
      "A) Toronto",
      "B) Vancouver",
      "C) Montreal",
      "D) Ottawa"
    ],
    "answer": "D) Ottawa",
    "correct_letter": "D"
  },
  {
    "category": "Geography",
    "question_en": "Which country borders Colombia to the south?",
    "question_es": "¿Qué países limitan con Colombia al sur?",
    "options": [
      "A) Panama",
      "B) Venezuela",
      "C) Ecuador and Peru",
      "D) Brazil"
    ],
    "answer": "C) Ecuador and Peru",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "Which country is famous for its pyramids of Chichen Itza and tacos?",
    "question_es": "¿Qué país es famoso por sus pirámides de Chichén Itzá y tacos?",
    "options": [
      "A) Spain",
      "B) Mexico",
      "C) Cuba",
      "D) Peru"
    ],
    "answer": "B) Mexico",
    "correct_letter": "B"
  },
  {
    "category": "Sports",
    "question_en": "Which Grand Slam tennis tournament is played on clay courts?",
    "question_es": "¿Qué torneo de tenis de Grand Slam se juega en canchas de arcilla?",
    "options": [
      "A) Wimbledon",
      "B) US Open",
      "C) Roland Garros (French Open)",
      "D) Australian Open"
    ],
    "answer": "C) Roland Garros (French Open)",
    "correct_letter": "C"
  },
  {
    "category": "Sports",
    "question_en": "Which swimming stroke is named after an insect?",
    "question_es": "¿Qué estilo de natación lleva el nombre de un insecto?",
    "options": [
      "A) Freestyle",
      "B) Butterfly",
      "C) Breaststroke",
      "D) Backstroke"
    ],
    "answer": "B) Butterfly",
    "correct_letter": "B"
  },
  {
    "category": "Sports",
    "question_en": "How many minutes does a standard regulation soccer match last (excluding extra time)?",
    "question_es": "¿Cuántos minutos dura un partido reglamentario de fútbol (sin contar tiempo extra)?",
    "options": [
      "A) 80 minutes",
      "B) 90 minutes",
      "C) 100 minutes",
      "D) 120 minutes"
    ],
    "answer": "B) 90 minutes",
    "correct_letter": "B"
  },
  {
    "category": "Sports",
    "question_en": "How many minutes is a standard round in professional men's boxing?",
    "question_es": "¿Cuántos minutos dura un asalto estándar en el boxeo profesional masculino?",
    "options": [
      "A) 2 minutes",
      "B) 3 minutes",
      "C) 4 minutes",
      "D) 5 minutes"
    ],
    "answer": "B) 3 minutes",
    "correct_letter": "B"
  },
  {
    "category": "Sports",
    "question_en": "What is the official distance of an Olympic marathon race?",
    "question_es": "¿Cuál es la distancia oficial de una carrera de maratón olímpica?",
    "options": [
      "A) 21.097 km",
      "B) 35.000 km",
      "C) 42.195 km",
      "D) 50.000 km"
    ],
    "answer": "C) 42.195 km",
    "correct_letter": "C"
  },
  {
    "category": "Sports",
    "question_en": "In baseball, how many strikes are required for a batter to strike out?",
    "question_es": "En el béisbol, ¿cuántos strikes se necesitan para que un bateador sea ponchado?",
    "options": [
      "A) 2",
      "B) 3",
      "C) 4",
      "D) 5"
    ],
    "answer": "B) 3",
    "correct_letter": "B"
  },
  {
    "category": "Sports",
    "question_en": "How many players per team are on the basketball court at the same time?",
    "question_es": "¿Cuántos jugadores por equipo están en la cancha al mismo tiempo en baloncesto?",
    "options": [
      "A) 4",
      "B) 5",
      "C) 6",
      "D) 7"
    ],
    "answer": "B) 5",
    "correct_letter": "B"
  },
  {
    "category": "Sports",
    "question_en": "In American football, how many points is a touchdown worth?",
    "question_es": "En el fútbol americano, ¿cuántos puntos vale un touchdown (anotación)?",
    "options": [
      "A) 3 points",
      "B) 6 points",
      "C) 7 points",
      "D) 8 points"
    ],
    "answer": "B) 6 points",
    "correct_letter": "B"
  },
  {
    "category": "Sports",
    "question_en": "What is the most prestigious multi-stage road cycling race in the world, held in France?",
    "question_es": "¿Cuál es la carrera ciclista por etapas más prestigiosa del mundo, celebrada en Francia?",
    "options": [
      "A) Giro d'Italia",
      "B) Vuelta a España",
      "C) Tour de France",
      "D) Paris-Roubaix"
    ],
    "answer": "C) Tour de France",
    "correct_letter": "C"
  },
  {
    "category": "Sports",
    "question_en": "What flag is waved in Formula 1 to indicate the winner has crossed the finish line?",
    "question_es": "¿Qué bandera se ondea en la Fórmula 1 para indicar el final de la carrera?",
    "options": [
      "A) Yellow flag",
      "B) Green flag",
      "C) Red flag",
      "D) Checkered black and white flag"
    ],
    "answer": "D) Checkered black and white flag",
    "correct_letter": "D"
  },
  {
    "category": "Sports",
    "question_en": "Which country hosted and won the very first FIFA World Cup in 1930?",
    "question_es": "¿Qué país organizó y ganó la primera Copa del Mundo de la FIFA en 1930?",
    "options": [
      "A) Brazil",
      "B) Uruguay",
      "C) Argentina",
      "D) Italy"
    ],
    "answer": "B) Uruguay",
    "correct_letter": "B"
  },
  {
    "category": "Sports",
    "question_en": "In chess, which piece can only move diagonally across the board?",
    "question_es": "En el ajedrez, ¿qué pieza solo puede moverse en diagonal?",
    "options": [
      "A) Rook (Torre)",
      "B) Knight (Caballo)",
      "C) Bishop (Alfil)",
      "D) Pawn (Peón)"
    ],
    "answer": "C) Bishop (Alfil)",
    "correct_letter": "C"
  },
  {
    "category": "Sports",
    "question_en": "What is another commonly used name for table tennis?",
    "question_es": "¿Qué otro nombre recibe comúnmente el tenis de mesa?",
    "options": [
      "A) Squash",
      "B) Badminton",
      "C) Ping-Pong",
      "D) Racquetball"
    ],
    "answer": "C) Ping-Pong",
    "correct_letter": "C"
  },
  {
    "category": "Sports",
    "question_en": "In golf, what is the term for scoring one stroke under par on a hole?",
    "question_es": "En golf, ¿cómo se llama completar un hoyo en un golpe menos que el par?",
    "options": [
      "A) Bogey",
      "B) Birdie",
      "C) Eagle",
      "D) Albatross"
    ],
    "answer": "B) Birdie",
    "correct_letter": "B"
  },
  {
    "category": "Sports",
    "question_en": "Which European city hosted the 2024 Summer Olympic Games?",
    "question_es": "¿Qué ciudad europea fue sede de los Juegos Olímpicos de Verano 2024?",
    "options": [
      "A) London",
      "B) Madrid",
      "C) Paris",
      "D) Rome"
    ],
    "answer": "C) Paris",
    "correct_letter": "C"
  },
  {
    "category": "History",
    "question_en": "Which ancient Roman city was buried in ash by the eruption of Mount Vesuvius in 79 AD?",
    "question_es": "¿Qué antigua ciudad romana quedó sepultada por la erupción del Vesubio en el 79 d.C.?",
    "options": [
      "A) Carthage",
      "B) Pompeii",
      "C) Athens",
      "D) Alexandria"
    ],
    "answer": "B) Pompeii",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "Who is known as 'El Libertador' for leading independence wars in Colombia, Venezuela, and other nations?",
    "question_es": "¿Quién es conocido como 'El Libertador' por liderar la independencia de Colombia, Venezuela y otros países?",
    "options": [
      "A) José de San Martín",
      "B) Simón Bolívar",
      "C) Bernardo O'Higgins",
      "D) Francisco de Miranda"
    ],
    "answer": "B) Simón Bolívar",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "What monumental stone structures were built as tombs for ancient Egyptian pharaohs?",
    "question_es": "¿Qué monumentales estructuras de piedra fueron construidas como tumbas para los faraones egipcios?",
    "options": [
      "A) Ziggurats",
      "B) Pyramids",
      "C) Obelisks",
      "D) Colosseums"
    ],
    "answer": "B) Pyramids",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "Which Renaissance artist sculpted the famous statue of David and painted the Sistine Chapel ceiling?",
    "question_es": "¿Qué artista del Renacimiento esculpió el David y pintó la bóveda de la Capilla Sixtina?",
    "options": [
      "A) Leonardo da Vinci",
      "B) Raphael",
      "C) Michelangelo (Miguel Ángel)",
      "D) Donatello"
    ],
    "answer": "C) Michelangelo (Miguel Ángel)",
    "correct_letter": "C"
  },
  {
    "category": "History",
    "question_en": "In which ancient Greek city-state was democracy first established?",
    "question_es": "¿En qué antigua ciudad-estado griega se estableció por primera vez la democracia?",
    "options": [
      "A) Sparta",
      "B) Corinth",
      "C) Athens",
      "D) Thebes"
    ],
    "answer": "C) Athens",
    "correct_letter": "C"
  },
  {
    "category": "History",
    "question_en": "In which year did World War I begin?",
    "question_es": "¿En qué año comenzó la Primera Guerra Mundial?",
    "options": [
      "A) 1912",
      "B) 1914",
      "C) 1918",
      "D) 1939"
    ],
    "answer": "B) 1914",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "What was the name of the first artificial satellite launched into Earth orbit by the USSR in 1957?",
    "question_es": "¿Cuál fue el primer satélite artificial lanzado a la órbita terrestre por la URSS en 1957?",
    "options": [
      "A) Apollo 11",
      "B) Sputnik 1",
      "C) Vostok 1",
      "D) Voyager 1"
    ],
    "answer": "B) Sputnik 1",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "Which devastating pandemic wiped out a large portion of Europe's population in the 14th century?",
    "question_es": "¿Qué devastadora pandemia acabó con gran parte de la población europea en el siglo XIV?",
    "options": [
      "A) The Black Death (Peste Negra)",
      "B) Spanish Flu",
      "C) Cholera",
      "D) Smallpox"
    ],
    "answer": "A) The Black Death (Peste Negra)",
    "correct_letter": "A"
  },
  {
    "category": "History",
    "question_en": "In what year was the United States Declaration of Independence signed?",
    "question_es": "¿En qué año se firmó la Declaración de Independencia de los Estados Unidos?",
    "options": [
      "A) 1765",
      "B) 1776",
      "C) 1789",
      "D) 1804"
    ],
    "answer": "B) 1776",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "Which physicist developed the theory of general relativity?",
    "question_es": "¿Qué físico formuló la teoría de la relatividad general?",
    "options": [
      "A) Isaac Newton",
      "B) Nikola Tesla",
      "C) Albert Einstein",
      "D) Niels Bohr"
    ],
    "answer": "C) Albert Einstein",
    "correct_letter": "C"
  },
  {
    "category": "History",
    "question_en": "Which symbolic barrier separating East and West Germany fell in November 1989?",
    "question_es": "¿Qué muro simbólico que separaba Alemania Oriental y Occidental cayó en noviembre de 1989?",
    "options": [
      "A) The Iron Curtain",
      "B) The Berlin Wall",
      "C) The Maginot Line",
      "D) The Rhine Wall"
    ],
    "answer": "B) The Berlin Wall",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "Who spent 27 years in prison before becoming the first Black president of South Africa in 1994?",
    "question_es": "¿Quién pasó 27 años en prisión antes de convertirse en el primer presidente negro de Sudáfrica en 1994?",
    "options": [
      "A) Desmond Tutu",
      "B) Nelson Mandela",
      "C) Kofi Annan",
      "D) Steve Biko"
    ],
    "answer": "B) Nelson Mandela",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "Who pioneered the non-violent resistance philosophy that led India to independence from British rule?",
    "question_es": "¿Quién lideró el movimiento pacífico que llevó a la independencia de la India del dominio británico?",
    "options": [
      "A) Jawaharlal Nehru",
      "B) Mahatma Gandhi",
      "C) Rabindranath Tagore",
      "D) Subhas Chandra Bose"
    ],
    "answer": "B) Mahatma Gandhi",
    "correct_letter": "B"
  },
  {
    "category": "History",
    "question_en": "What was the capital city of the Aztec Empire, built over a lake in the Valley of Mexico?",
    "question_es": "¿Cuál era la ciudad capital del Imperio Azteca, fundada sobre un lago en el Valle de México?",
    "options": [
      "A) Teotihuacán",
      "B) Chichén Itzá",
      "C) Tenochtitlan",
      "D) Tikal"
    ],
    "answer": "C) Tenochtitlan",
    "correct_letter": "C"
  },
  {
    "category": "History",
    "question_en": "Who is recognized for inventing the movable-type printing press in Europe around 1440?",
    "question_es": "¿A quién se reconoce la invención de la imprenta de tipos móviles en Europa hacia 1440?",
    "options": [
      "A) Johannes Gutenberg",
      "B) Galileo Galilei",
      "C) Leonardo da Vinci",
      "D) Martin Luther"
    ],
    "answer": "A) Johannes Gutenberg",
    "correct_letter": "A"
  },
  {
    "category": "Mathematics",
    "question_en": "What is the sum of the interior angles of any triangle?",
    "question_es": "¿Cuánto suman los ángulos interiores de cualquier triángulo?",
    "options": [
      "A) 90 degrees",
      "B) 180 degrees",
      "C) 270 degrees",
      "D) 360 degrees"
    ],
    "answer": "B) 180 degrees",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 9 × 9?",
    "question_es": "¿Cuánto es 9 × 9?",
    "options": [
      "A) 72",
      "B) 81",
      "C) 89",
      "D) 99"
    ],
    "answer": "B) 81",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What is a geometric polygon with 8 sides called?",
    "question_es": "¿Cómo se llama un polígono de 8 lados?",
    "options": [
      "A) Heptagon",
      "B) Octagon",
      "C) Nonagon",
      "D) Decagon"
    ],
    "answer": "B) Octagon",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "If 2x = 20, what is the value of x?",
    "question_es": "Si 2x = 20, ¿cuál es el valor de x?",
    "options": [
      "A) 5",
      "B) 10",
      "C) 15",
      "D) 40"
    ],
    "answer": "B) 10",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 25% of 200?",
    "question_es": "¿Cuánto es el 25% de 200?",
    "options": [
      "A) 25",
      "B) 40",
      "C) 50",
      "D) 75"
    ],
    "answer": "C) 50",
    "correct_letter": "C"
  },
  {
    "category": "Mathematics",
    "question_en": "Which real number is neither positive nor negative?",
    "question_es": "¿Qué número real no es ni positivo ni negativo?",
    "options": [
      "A) -1",
      "B) 0",
      "C) 1",
      "D) Infinity"
    ],
    "answer": "B) 0",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 15 × 4?",
    "question_es": "¿Cuánto es 15 × 4?",
    "options": [
      "A) 45",
      "B) 50",
      "C) 60",
      "D) 65"
    ],
    "answer": "C) 60",
    "correct_letter": "C"
  },
  {
    "category": "Mathematics",
    "question_en": "What is the perimeter of a square with a side length of 6 cm?",
    "question_es": "¿Cuál es el perímetro de un cuadrado cuyos lados miden 6 cm?",
    "options": [
      "A) 12 cm",
      "B) 24 cm",
      "C) 36 cm",
      "D) 48 cm"
    ],
    "answer": "B) 24 cm",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 2 to the power of 5 (2⁵)?",
    "question_es": "¿Cuánto es 2 elevado a la 5 (2⁵)?",
    "options": [
      "A) 10",
      "B) 25",
      "C) 32",
      "D) 64"
    ],
    "answer": "C) 32",
    "correct_letter": "C"
  },
  {
    "category": "Mathematics",
    "question_en": "What is the square root of 144?",
    "question_es": "¿Cuál es la raíz cuadrada de 144?",
    "options": [
      "A) 11",
      "B) 12",
      "C) 13",
      "D) 14"
    ],
    "answer": "B) 12",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What is the only even prime number?",
    "question_es": "¿Cuál es el único número primo que es par?",
    "options": [
      "A) 0",
      "B) 2",
      "C) 4",
      "D) 6"
    ],
    "answer": "B) 2",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What number does the Roman numeral 'L' represent?",
    "question_es": "¿Qué número representa el número romano 'L'?",
    "options": [
      "A) 50",
      "B) 100",
      "C) 500",
      "D) 1000"
    ],
    "answer": "A) 50",
    "correct_letter": "A"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 250 ÷ 5?",
    "question_es": "¿Cuánto es 250 ÷ 5?",
    "options": [
      "A) 25",
      "B) 50",
      "C) 75",
      "D) 100"
    ],
    "answer": "B) 50",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 13 + 28?",
    "question_es": "¿Cuánto es 13 + 28?",
    "options": [
      "A) 39",
      "B) 41",
      "C) 42",
      "D) 45"
    ],
    "answer": "B) 41",
    "correct_letter": "B"
  },
  {
    "category": "Mathematics",
    "question_en": "In a right-angled triangle, what is the side opposite the right angle called?",
    "question_es": "En un triángulo rectángulo, ¿cómo se llama el lado opuesto al ángulo recto?",
    "options": [
      "A) Adjacent leg",
      "B) Opposite leg",
      "C) Hypotenuse",
      "D) Median"
    ],
    "answer": "C) Hypotenuse",
    "correct_letter": "C"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 7² (7 squared)?",
    "question_es": "¿Cuánto es 7² (7 al cuadrado)?",
    "options": [
      "A) 14",
      "B) 42",
      "C) 49",
      "D) 56"
    ],
    "answer": "C) 49",
    "correct_letter": "C"
  },
  {
    "category": "Mathematics",
    "question_en": "What is 11 × 11?",
    "question_es": "¿Cuánto es 11 × 11?",
    "options": [
      "A) 111",
      "B) 121",
      "C) 131",
      "D) 141"
    ],
    "answer": "B) 121",
    "correct_letter": "B"
  },
  {
    "category": "Geography",
    "question_en": "Which is the longest continental mountain range in the world, running along South America?",
    "question_es": "¿Cuál es la cordillera continental más larga del mundo, que recorre América del Sur?",
    "options": [
      "A) The Rocky Mountains",
      "B) The Alps",
      "C) The Andes",
      "D) The Himalayas"
    ],
    "answer": "C) The Andes",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "Which river flows directly through the city of London?",
    "question_es": "¿Qué río atraviesa la ciudad de Londres?",
    "options": [
      "A) Seine",
      "B) River Thames (Támesis)",
      "C) Danube",
      "D) Rhine"
    ],
    "answer": "B) River Thames (Támesis)",
    "correct_letter": "B"
  },
  {
    "category": "Geography",
    "question_en": "What is the largest non-continental island in the world by surface area?",
    "question_es": "¿Cuál es la isla más grande del mundo por superficie?",
    "options": [
      "A) Madagascar",
      "B) Greenland (Groenlandia)",
      "C) New Guinea",
      "D) Iceland"
    ],
    "answer": "B) Greenland (Groenlandia)",
    "correct_letter": "B"
  },
  {
    "category": "Geography",
    "question_en": "What is the capital city of Spain?",
    "question_es": "¿Cuál es la capital de España?",
    "options": [
      "A) Barcelona",
      "B) Madrid",
      "C) Valencia",
      "D) Seville"
    ],
    "answer": "B) Madrid",
    "correct_letter": "B"
  },
  {
    "category": "Geography",
    "question_en": "On which continent is the country of Egypt primarily situated?",
    "question_es": "¿En qué continente se encuentra principalmente Egipto?",
    "options": [
      "A) Asia",
      "B) Europe",
      "C) Africa",
      "D) Middle East"
    ],
    "answer": "C) Africa",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "Which ocean separates the American continent from Europe and Africa?",
    "question_es": "¿Qué océano separa el continente americano de Europa y África?",
    "options": [
      "A) Pacific Ocean",
      "B) Atlantic Ocean",
      "C) Indian Ocean",
      "D) Arctic Ocean"
    ],
    "answer": "B) Atlantic Ocean",
    "correct_letter": "B"
  },
  {
    "category": "Geography",
    "question_en": "Mount Fuji is an iconic volcano and the highest peak in which nation?",
    "question_es": "El Monte Fuji es un volcán icónico y el pico más alto de ¿qué país?",
    "options": [
      "A) China",
      "B) South Korea",
      "C) Japan",
      "D) Indonesia"
    ],
    "answer": "C) Japan",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "Which country is composed of 50 federal states?",
    "question_es": "¿Qué país está compuesto por 50 estados federales?",
    "options": [
      "A) Brazil",
      "B) Mexico",
      "C) Australia",
      "D) United States"
    ],
    "answer": "D) United States",
    "correct_letter": "D"
  },
  {
    "category": "Geography",
    "question_en": "Which lake in Siberia is the deepest freshwater lake on Earth?",
    "question_es": "¿Qué lago de Siberia es el lago de agua dulce más profundo del mundo?",
    "options": [
      "A) Lake Superior",
      "B) Lake Victoria",
      "C) Lake Baikal",
      "D) Caspian Sea"
    ],
    "answer": "C) Lake Baikal",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "Angel Falls (Salto Ángel), the world's highest uninterrupted waterfall, is in which country?",
    "question_es": "El Salto Ángel, la cascada ininterrumpida más alta del mundo, se encuentra en ¿qué país?",
    "options": [
      "A) Colombia",
      "B) Brazil",
      "C) Venezuela",
      "D) Peru"
    ],
    "answer": "C) Venezuela",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "What is the capital city of Colombia?",
    "question_es": "¿Cuál es la capital de Colombia?",
    "options": [
      "A) Medellín",
      "B) Cali",
      "C) Barranquilla",
      "D) Bogotá"
    ],
    "answer": "D) Bogotá",
    "correct_letter": "D"
  },
  {
    "category": "Geography",
    "question_en": "Which body of water separates southern Europe from northern Africa?",
    "question_es": "¿Qué masa de agua separa el sur de Europa del norte de África?",
    "options": [
      "A) Red Sea",
      "B) Mediterranean Sea",
      "C) Black Sea",
      "D) Baltic Sea"
    ],
    "answer": "B) Mediterranean Sea",
    "correct_letter": "B"
  },
  {
    "category": "Geography",
    "question_en": "Which two countries share the longest international land border in the world?",
    "question_es": "¿Qué dos países comparten la frontera terrestre internacional más larga del mundo?",
    "options": [
      "A) Russia and China",
      "B) United States and Canada",
      "C) Chile and Argentina",
      "D) Brazil and Bolivia"
    ],
    "answer": "B) United States and Canada",
    "correct_letter": "B"
  },
  {
    "category": "Geography",
    "question_en": "What is the capital city of Germany?",
    "question_es": "¿Cuál es la capital de Alemania?",
    "options": [
      "A) Munich",
      "B) Frankfurt",
      "C) Berlin",
      "D) Hamburg"
    ],
    "answer": "C) Berlin",
    "correct_letter": "C"
  },
  {
    "category": "Geography",
    "question_en": "What is the largest living coral reef ecosystem on Earth, located off the coast of Australia?",
    "question_es": "¿Cuál es el sistema de arrecifes de coral más grande de la Tierra, situado en Australia?",
    "options": [
      "A) Mesoamerican Barrier Reef",
      "B) The Great Barrier Reef (Gran Barrera de Coral)",
      "C) Red Sea Reef",
      "D) New Caledonia Barrier Reef"
    ],
    "answer": "B) The Great Barrier Reef (Gran Barrera de Coral)",
    "correct_letter": "B"
  }
];
