export interface Mission {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface MissionProgress {
  relics?: number;           // Guardião das Relíquias (0-3)
  resources?: number;         // Mestre dos Recursos (0-12)
  duelsWon?: number;         // Campeão da Arena (0-3)
  enigmasSolved?: number;    // Enigma das Runas (0-4)
  allianceMarks?: string[];  // Construtor da Aliança (até 4 regiões)
  prophecies?: number;       // Escolhido do Oráculo (0-3)
  throneDefended?: boolean;  // Usurpador do Trono (conseguiu defender)
  energyPoints?: number;     // Despertar do Fluxo (0-5)
  enigmaHints?: number;      // Contador de dicas recebidas (0-5)
  canAnswerEnigma?: boolean; // Se completou 1 volta e pode responder
  enigmaAnswered?: boolean;  // Se já respondeu o enigma
  hasCompletedLap?: boolean; // Se completou primeira volta
  thronePosition?: number;   // Posição antes de ir ao trono (para voltar se perder)
  throneBattlesWon?: number; // Quantas batalhas venceu no trono
}

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "Guardião das Relíquias",
    description: "Colete 3 Relíquias Antigas espalhadas pelo tabuleiro e leve-as ao Templo Central.",
    icon: "🏺"
  },
  {
    id: 2,
    title: "Mestre dos Recursos",
    description: "Acumule 12 unidades de recurso (ouro, gemas, ou artefatos) antes de todos os outros.",
    icon: "💰"
  },
  {
    id: 3,
    title: "Campeão da Arena",
    description: "Vença 3 duelos diretos contra outros jogadores em desafios ativados por casas especiais.",
    icon: "⚔️"
  },
  {
    id: 4,
    title: "Enigma das Runas",
    description: "Resolva 4 enigmas mágicos em locais distintos do tabuleiro.",
    icon: "🧠"
  },
  {
    id: 5,
    title: "Construtor da Aliança",
    description: "Visite todas as 4 Regiões do mapa e colete uma Marca de Aliança em cada uma.",
    icon: "🏛️"
  },
  {
    id: 6,
    title: "O Escolhido do Oráculo",
    description: "Encontre e cumpra 3 Profecias reveladas em santuários secretos.",
    icon: "🧙"
  },
  {
    id: 7,
    title: "Usurpador do Trono Vazio",
    description: "Conquiste o Trono Sagrado no centro do mapa e defenda por 2 rodadas seguidas.",
    icon: "👑"
  },
  {
    id: 8,
    title: "Despertar do Fluxo",
    description: "Ative 5 Pontos de Energia espalhados pelo tabuleiro para restabelecer o equilíbrio.",
    icon: "🔮"
  }
];

export const getMissionById = (id: number): Mission | undefined => {
  return MISSIONS.find(mission => mission.id === id);
};