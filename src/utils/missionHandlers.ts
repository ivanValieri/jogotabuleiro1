import { Enigma, checkEnigmaAnswer } from "@/types/enigmas";

interface MissionProgress {
  relics?: number;
  resources?: number;
  duelsWon?: number;
  enigmasSolved?: number;
  allianceMarks?: string[];
  prophecies?: number;
  throneDefended?: boolean;
  energyPoints?: number;
  enigmaHints?: number;
  canAnswerEnigma?: boolean;
  enigmaAnswered?: boolean;
  hasCompletedLap?: boolean;
  thronePosition?: number;
  throneBattlesWon?: number;
}

interface Player {
  id: number;
  name: string;
  credits: number;
  mission_id?: number;
  isAI?: boolean;
  missionProgress: MissionProgress;
  enigma?: Enigma;
}

export const createRelicHandler = (
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  addGameEvent: (event: { type: string; message: string }) => void,
  toast: any,
  checkVictory: () => void
) => {
  return (player: Player) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((p) =>
        p.id === player.id
          ? { 
              ...p, 
              missionProgress: {
                ...p.missionProgress,
                relics: (p.missionProgress.relics || 0) + 1
              }
            }
          : p
      )
    );

    const newCount = (player.missionProgress.relics || 0) + 1;
    addGameEvent({
      type: "system",
      message: `🏺 ${player.name} coletou uma relíquia! (${newCount}/3)`,
    });

    if (!player.isAI) {
      toast({
        title: "Relíquia Coletada!",
        description: `Você tem ${newCount}/3 relíquias!`,
      });
    }

    setTimeout(() => checkVictory(), 100);
  };
};

export const createResourceHandler = (
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  addGameEvent: (event: { type: string; message: string }) => void,
  checkVictory: () => void
) => {
  return (player: Player, resource: { id: string; name: string; price: number }) => {
    if (player.credits < resource.price) return;

    setPlayers((prevPlayers) =>
      prevPlayers.map((p) =>
        p.id === player.id
          ? { 
              ...p, 
              credits: p.credits - resource.price,
              missionProgress: {
                ...p.missionProgress,
                resources: (p.missionProgress.resources || 0) + 1
              }
            }
          : p
      )
    );

    const newCount = (player.missionProgress.resources || 0) + 1;
    addGameEvent({
      type: "system",
      message: `💎 ${player.name} comprou ${resource.name}! Recursos: ${newCount}/12`,
    });

    setTimeout(() => checkVictory(), 100);
  };
};

export const createEnigmaHintHandler = (
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  addGameEvent: (event: { type: string; message: string }) => void
) => {
  return (player: Player) => {
    const hints = (player.missionProgress.enigmaHints || 0) + 1;
    setPlayers((prevPlayers) =>
      prevPlayers.map((p) =>
        p.id === player.id
          ? { 
              ...p, 
              missionProgress: {
                ...p.missionProgress,
                enigmaHints: hints
              }
            }
          : p
      )
    );

    addGameEvent({
      type: "system",
      message: `🧩 ${player.name} recebeu uma dica! (${hints}/5)`,
    });
  };
};

export const createEnigmaAnswerHandler = (
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  addGameEvent: (event: { type: string; message: string }) => void,
  toast: any,
  checkVictory: () => void
) => {
  return (player: Player, answerIndex: number) => {
    if (!player.enigma) return;

    const isCorrect = checkEnigmaAnswer(player.enigma, answerIndex);

    if (isCorrect) {
      setPlayers((prevPlayers) =>
        prevPlayers.map((p) =>
          p.id === player.id
            ? { 
                ...p, 
                missionProgress: {
                  ...p.missionProgress,
                  enigmaAnswered: true,
                  enigmasSolved: 1
                }
              }
            : p
        )
      );

      toast({
        title: "🎉 Enigma Resolvido!",
        description: `${player.name} acertou o enigma e venceu o jogo!`,
        duration: 10000,
      });

      addGameEvent({
        type: "game",
        message: `🏆 ${player.name} resolveu o Enigma das Runas e venceu!`,
      });

      setTimeout(() => checkVictory(), 100);
    } else {
      toast({
        title: "❌ Resposta Errada!",
        description: `${player.name} errou o enigma e foi eliminado do jogo!`,
        variant: "destructive",
        duration: 10000,
      });

      addGameEvent({
        type: "game",
        message: `💀 ${player.name} errou o enigma e foi eliminado!`,
      });

      setPlayers((prevPlayers) => prevPlayers.filter(p => p.id !== player.id));
    }
  };
};

export const createAllianceHandler = (
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  addGameEvent: (event: { type: string; message: string }) => void,
  checkVictory: () => void
) => {
  return (player: Player, region: string) => {
    const marks = player.missionProgress.allianceMarks || [];
    if (marks.includes(region)) return;

    setPlayers((prevPlayers) =>
      prevPlayers.map((p) =>
        p.id === player.id
          ? { 
              ...p, 
              missionProgress: {
                ...p.missionProgress,
                allianceMarks: [...marks, region]
              }
            }
          : p
      )
    );

    addGameEvent({
      type: "system",
      message: `🏛️ ${player.name} formou aliança com a região ${region}! (${marks.length + 1}/4)`,
    });

    setTimeout(() => checkVictory(), 100);
  };
};

export const createProphecyHandler = (
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  addGameEvent: (event: { type: string; message: string }) => void,
  checkVictory: () => void
) => {
  return (player: Player) => {
    const newCount = (player.missionProgress.prophecies || 0) + 1;
    setPlayers((prevPlayers) =>
      prevPlayers.map((p) =>
        p.id === player.id
          ? { 
              ...p, 
              missionProgress: {
                ...p.missionProgress,
                prophecies: newCount
              }
            }
          : p
      )
    );

    addGameEvent({
      type: "system",
      message: `🔮 ${player.name} cumpriu uma profecia! (${newCount}/3)`,
    });

    setTimeout(() => checkVictory(), 100);
  };
};

export const createEnergyHandler = (
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  addGameEvent: (event: { type: string; message: string }) => void,
  checkVictory: () => void
) => {
  return (player: Player) => {
    const newCount = (player.missionProgress.energyPoints || 0) + 1;
    setPlayers((prevPlayers) =>
      prevPlayers.map((p) =>
        p.id === player.id
          ? { 
              ...p, 
              missionProgress: {
                ...p.missionProgress,
                energyPoints: newCount
              }
            }
          : p
      )
    );

    addGameEvent({
      type: "system",
      message: `⚡ ${player.name} ativou um Ponto de Energia! (${newCount}/5)`,
    });

    setTimeout(() => checkVictory(), 100);
  };
};

