export interface Enigma {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;  // Será randomizado a cada jogo
  hints: string[];  // 5 dicas progressivas
  theme: string;
}

// Enigmas temáticos - resposta correta será sorteada
export const ENIGMAS: Enigma[] = [
  {
    id: 1,
    question: "Três sábios afirmam possuir o Cristal da Verdade. Qual deles fala a verdade?",
    options: [
      "O Sábio do Norte: 'Eu possuo o cristal e nunca minto'",
      "O Sábio do Sul: 'O Sábio do Norte mente, eu tenho o cristal'",
      "O Sábio do Leste: 'Ambos mentem, o cristal está comigo'"
    ],
    correctAnswerIndex: 0, // Será randomizado
    hints: [
      "🔍 Dica 1: Um dos sábios sempre fala a verdade, os outros sempre mentem.",
      "🔍 Dica 2: O verdadeiro portador do cristal nunca mente sobre possuí-lo.",
      "🔍 Dica 3: Se o Sábio do Norte mente, ele não tem o cristal.",
      "🔍 Dica 4: Analise as contradições entre as afirmações dos três sábios.",
      "🔍 Dica 5: O único que pode dizer a verdade sem se contradizer é quem realmente possui o cristal."
    ],
    theme: "Lógica"
  },
  {
    id: 2,
    question: "Você encontra três portas guardadas por espíritos. Qual porta leva ao tesouro?",
    options: [
      "Porta Vermelha: Protegida por chamas eternas",
      "Porta Azul: Coberta por símbolos arcanos",
      "Porta Verde: Envolta em vinhas mágicas"
    ],
    correctAnswerIndex: 0, // Será randomizado
    hints: [
      "🔍 Dica 1: As chamas eternas guardam tesouros há mil anos.",
      "🔍 Dica 2: Símbolos arcanos são frequentemente armadilhas visuais.",
      "🔍 Dica 3: Vinhas mágicas crescem onde há poder natural concentrado.",
      "🔍 Dica 4: A porta mais perigosa geralmente esconde o maior tesouro.",
      "🔍 Dica 5: Antigos magos preferiam o elemento do fogo para proteger seus segredos."
    ],
    theme: "Intuição"
  },
  {
    id: 3,
    question: "Um oráculo profetizou: 'Quando três eras se encontrarem, a verdade será revelada'. Qual era chegou?",
    options: [
      "Era dos Dragões: Quando répteis alados dominavam os céus",
      "Era dos Titãs: Quando gigantes caminhavam pela terra",
      "Era dos Arcanos: Quando a magia fluía livremente"
    ],
    correctAnswerIndex: 0, // Será randomizado
    hints: [
      "🔍 Dica 1: A profecia menciona 'três eras se encontrarem'.",
      "🔍 Dica 2: Dragões eram conhecidos por guardar conhecimento ancestral.",
      "🔍 Dica 3: Titãs representavam a força bruta, não a sabedoria.",
      "🔍 Dica 4: A Era Arcana foi a última das três grandes eras.",
      "🔍 Dica 5: A resposta está na era que une força, sabedoria e magia."
    ],
    theme: "História"
  },
  {
    id: 4,
    question: "Qual dos três artefatos é a chave para despertar o Fluxo Primordial?",
    options: [
      "Bastão de Éter: Condutor de energia pura",
      "Orbe das Marés: Controlador dos elementos líquidos",
      "Âncora Temporal: Estabilizador do espaço-tempo"
    ],
    correctAnswerIndex: 0, // Será randomizado
    hints: [
      "🔍 Dica 1: O Fluxo Primordial é a fonte de toda energia mágica.",
      "🔍 Dica 2: Um bastão serve como condutor, não como fonte.",
      "🔍 Dica 3: As marés estão ligadas ao fluxo natural do mundo.",
      "🔍 Dica 4: O tempo é apenas uma manifestação do Fluxo.",
      "🔍 Dica 5: Para despertar uma fonte, você precisa de algo que canalizeenergía pura."
    ],
    theme: "Magia"
  }
];

// Função para pegar enigma aleatório com resposta correta randomizada
export const getRandomizedEnigma = (): Enigma => {
  const baseEnigma = ENIGMAS[Math.floor(Math.random() * ENIGMAS.length)];
  const randomCorrectIndex = Math.floor(Math.random() * baseEnigma.options.length);
  
  return {
    ...baseEnigma,
    correctAnswerIndex: randomCorrectIndex
  };
};

// Função para verificar se a resposta está correta
export const checkEnigmaAnswer = (enigma: Enigma, selectedIndex: number): boolean => {
  return selectedIndex === enigma.correctAnswerIndex;
};

