import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import GameBoard from "@/components/GameBoard";
import DiceRoller from "@/components/DiceRoller";
import PlayerPanel from "@/components/PlayerPanel";
import PlayerMissionPanel from "@/components/PlayerMissionPanel";
import GameFeed from "@/components/GameFeed";
import BattleArena from "@/components/battles/BattleArena";
import { ShopDialog } from "@/components/ShopDialog";
import { LifeCardDialog } from "@/components/LifeCardDialog";
import GameSettings, { GameSettings as GameSettingsType, AIDifficulty } from "@/components/GameSettings";
import BoardLegend from "@/components/BoardLegend";
import { NormalCellEventDialog, getRandomNormalEvent } from "@/components/NormalCellEvent";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ShopItem } from "@/types/shop";
import { LifeCard, getRandomLifeCard, getLifeCardPositions } from "@/types/lifeCards";
import { getCellByPosition } from "@/types/boardCells";
import { MissionProgress } from "@/types/missions";
import { Enigma, getRandomizedEnigma, checkEnigmaAnswer } from "@/types/enigmas";
import { RelicDialog } from "@/components/missions/RelicDialog";
import { ResourceDialog } from "@/components/missions/ResourceDialog";
import { AllianceDialog } from "@/components/missions/AllianceDialog";
import { ProphecyDialog } from "@/components/missions/ProphecyDialog";
import { EnergyDialog } from "@/components/missions/EnergyDialog";
import { EnigmaDialog } from "@/components/missions/EnigmaDialog";
import { ThroneDialog } from "@/components/missions/ThroneDialog";

interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
  avatar: string;
  player_id: string;
  turn_order: number;
  credits: number;
  laps: number;
  mission_id?: number;
  class_id?: string;
  isAI?: boolean;
  aiDifficulty?: AIDifficulty;
  missionProgress: MissionProgress;
  enigma?: Enigma;
  lastBattleWon?: boolean;
  isOnThrone?: boolean;
}

interface GameEvent {
  id: string;
  type: "roll" | "move" | "turn" | "game" | "system";
  message: string;
  timestamp: Date;
  diceValue?: number;
  playerPosition?: number;
}

const SinglePlayerGame = () => {
  const [gameSettings, setGameSettings] = useState<GameSettingsType | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [gameStats, setGameStats] = useState({
    totalRolls: 0,
    gameStartTime: new Date(),
  });
  const [playerMission, setPlayerMission] = useState<number | undefined>();
  const [playerClass, setPlayerClass] = useState<string | undefined>();
  const [showBattleArena, setShowBattleArena] = useState(false);
  const [battlePlayers, setBattlePlayers] = useState<{ player1: Player; player2: Player } | null>(null);
  const [showShopDialog, setShowShopDialog] = useState(false);
  const [shopPlayer, setShopPlayer] = useState<Player | null>(null);
  const [showLifeCardDialog, setShowLifeCardDialog] = useState(false);
  const [currentLifeCard, setCurrentLifeCard] = useState<LifeCard | null>(null);
  const [lifeCardPlayer, setLifeCardPlayer] = useState<Player | null>(null);
  const [showNormalEventDialog, setShowNormalEventDialog] = useState(false);
  const [currentNormalEvent, setCurrentNormalEvent] = useState<ReturnType<typeof getRandomNormalEvent> | null>(null);
  const [normalEventPlayer, setNormalEventPlayer] = useState<Player | null>(null);
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
  
  // Mission dialogs
  const [showRelicDialog, setShowRelicDialog] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [showAllianceDialog, setShowAllianceDialog] = useState(false);
  const [showProphecyDialog, setShowProphecyDialog] = useState(false);
  const [showEnergyDialog, setShowEnergyDialog] = useState(false);
  const [showEnigmaDialog, setShowEnigmaDialog] = useState(false);
  const [showThroneDialog, setShowThroneDialog] = useState(false);
  const [missionDialogPlayer, setMissionDialogPlayer] = useState<Player | null>(null);
  const [currentRegion, setCurrentRegion] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar autenticação
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Inicializar jogo quando configurações forem definidas
  const handleStartGame = (settings: GameSettingsType) => {
    setGameSettings(settings);
    
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];
    const avatars = ['👤', '🤖', '🤖', '🤖'];
    const aiNames = ['Máquina Alpha', 'Máquina Beta', 'Máquina Gamma'];
    
    // Criar jogador humano
    const missionId = Math.floor(Math.random() * 8) + 1;
    const humanPlayer: Player = {
      id: 1,
      name: user?.email?.split('@')[0] || 'Jogador',
      position: 0,
      color: colors[0],
      avatar: avatars[0],
      player_id: user?.id || '',
      turn_order: 1,
      credits: settings.initialCredits,
      laps: 0,
      mission_id: missionId,
      class_id: 'Aventureiro',
      isAI: false,
      missionProgress: {
        relics: 0,
        resources: 0,
        duelsWon: 0,
        enigmasSolved: 0,
        allianceMarks: [],
        prophecies: 0,
        energyPoints: 0,
        enigmaHints: 0,
        canAnswerEnigma: false,
        enigmaAnswered: false,
        hasCompletedLap: false,
        throneDefended: false,
        throneBattlesWon: 0,
      },
      enigma: missionId === 4 ? getRandomizedEnigma() : undefined,
      lastBattleWon: false,
      isOnThrone: false,
    };

    // Criar IAs
    const aiPlayers: Player[] = Array.from({ length: settings.numberOfAIs }, (_, i) => {
      const aiMissionId = Math.floor(Math.random() * 8) + 1;
      return {
        id: i + 2,
        name: aiNames[i] || `Máquina ${i + 1}`,
        position: 0,
        color: colors[i + 1],
        avatar: avatars[i + 1],
        player_id: `ai-player-${i + 1}`,
        turn_order: i + 2,
        credits: settings.initialCredits,
        laps: 0,
        mission_id: aiMissionId,
        class_id: 'Guerreiro',
        isAI: true,
        aiDifficulty: settings.aiDifficulty,
        missionProgress: {
          relics: 0,
          resources: 0,
          duelsWon: 0,
          enigmasSolved: 0,
          allianceMarks: [],
          prophecies: 0,
          energyPoints: 0,
          enigmaHints: 0,
          canAnswerEnigma: false,
          enigmaAnswered: false,
          hasCompletedLap: false,
          throneDefended: false,
          throneBattlesWon: 0,
        },
        enigma: aiMissionId === 4 ? getRandomizedEnigma() : undefined,
        lastBattleWon: false,
        isOnThrone: false,
      };
    });

    setPlayers([humanPlayer, ...aiPlayers]);
    setPlayerMission(humanPlayer.mission_id);
    setPlayerClass(humanPlayer.class_id);
    setCurrentPlayer(0);

    addGameEvent({
      type: "game",
      message: `🎮 Jogo iniciado! Você vs ${settings.numberOfAIs} oponente${settings.numberOfAIs > 1 ? 's' : ''} (Dificuldade: ${settings.aiDifficulty === 'easy' ? 'Fácil' : settings.aiDifficulty === 'medium' ? 'Médio' : 'Difícil'})`,
    });

    addGameEvent({
      type: "turn",
      message: `${humanPlayer.name} começa o jogo!`,
    });
  };

  // Lógica da IA baseada em dificuldade
  const getAIDecision = (aiPlayer: Player, decisionType: 'shop' | 'challenge'): boolean => {
    if (!aiPlayer.aiDifficulty) return false;
    
    const probabilities = {
      easy: { shop: 0.2, challenge: 0.3 },
      medium: { shop: 0.3, challenge: 0.5 },
      hard: { shop: 0.5, challenge: 0.7 },
    };
    
    return Math.random() < probabilities[aiPlayer.aiDifficulty][decisionType];
  };

  // Lógica da IA para jogar automaticamente
  useEffect(() => {
    if (!gameSettings || players.length === 0 || isRolling) return;
    if (showBattleArena || showShopDialog || showLifeCardDialog || showNormalEventDialog) return;
    if (showRelicDialog || showResourceDialog || showAllianceDialog || showProphecyDialog) return;
    if (showEnergyDialog || showEnigmaDialog || showThroneDialog) return;

    const currentPlayerData = players[currentPlayer];
    if (!currentPlayerData || !currentPlayerData.isAI) return;

    const delay = gameSettings.gameSpeed === 'fast' ? 800 : gameSettings.gameSpeed === 'slow' ? 2500 : 1500;
    const aiTurnTimer = setTimeout(() => {
      handleAITurn();
    }, delay);

    return () => clearTimeout(aiTurnTimer);
  }, [currentPlayer, players.length, isRolling, showBattleArena, showShopDialog, showLifeCardDialog, showNormalEventDialog, showRelicDialog, showResourceDialog, showAllianceDialog, showProphecyDialog, showEnergyDialog, showEnigmaDialog, showThroneDialog, gameSettings]);

  const addGameEvent = (event: Omit<GameEvent, "id" | "timestamp">) => {
    const newEvent: GameEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setGameEvents((prev) => [...prev, newEvent]);
  };

  const handleAITurn = () => {
    if (isRolling) return;
    const aiPlayer = players.find(p => p.isAI && p.id === players[currentPlayer]?.id);
    if (!aiPlayer) return;

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const diceValue = dice1 + dice2;

    handleDiceRoll(diceValue, dice1, dice2, aiPlayer);
  };

  const getAnimationDelay = () => {
    if (!gameSettings) return 300;
    return gameSettings.gameSpeed === 'fast' ? 150 : gameSettings.gameSpeed === 'slow' ? 500 : 300;
  };

  const handleDiceRoll = async (diceValue: number, dice1: number, dice2: number, playerOverride?: Player) => {
    if (isRolling) return;

    const activePlayerData = playerOverride || players[currentPlayer];
    
    if (!activePlayerData.isAI && activePlayerData.player_id !== user?.id) {
      toast({
        title: "Não é sua vez!",
        description: "Aguarde sua vez de jogar",
        variant: "destructive"
      });
      return;
    }

    setIsRolling(true);

    try {
      const oldPosition = activePlayerData.position;
      let newPosition = oldPosition + diceValue;
      let newLaps = 0;
      let bonusCredits = 0;
      
      const passedThroughStart = oldPosition + diceValue >= 40;
      if (passedThroughStart) {
        bonusCredits = 150;
      }
      
      if (newPosition >= 40) {
        newLaps = Math.floor(newPosition / 40);
        newPosition = newPosition % 40;
      }
      
      const finalPosition = newPosition;

      setPlayers((prevPlayers) =>
        prevPlayers.map((player) => {
          if (player.id === activePlayerData.id) {
            return {
              ...player,
              position: finalPosition,
              laps: (player.laps || 0) + newLaps,
              credits: player.credits + bonusCredits,
            };
          }
          return player;
        })
      );

      // Animação de movimento
      const delay = getAnimationDelay();
      const totalSteps = diceValue;
      for (let step = 1; step <= totalSteps; step++) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        let intermediatePosition = oldPosition + step;
        if (intermediatePosition >= 40) {
          intermediatePosition = intermediatePosition % 40;
        }
        
        setPlayers((prevPlayers) =>
          prevPlayers.map((player) =>
            player.id === activePlayerData.id
              ? { ...player, position: intermediatePosition }
              : player
          )
        );
      }

      addGameEvent({
        type: "roll",
        message: `${activePlayerData.name} tirou ${diceValue} (${dice1}+${dice2})`,
        diceValue,
      });

      if (newLaps > 0) {
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} completou ${newLaps} volta(s)!`,
        });

        // Marcar primeira volta completa para enigma
        if (!activePlayerData.missionProgress.hasCompletedLap) {
          setPlayers((prevPlayers) =>
            prevPlayers.map((player) =>
              player.id === activePlayerData.id
                ? { 
                    ...player, 
                    missionProgress: {
                      ...player.missionProgress,
                      hasCompletedLap: true,
                      canAnswerEnigma: player.mission_id === 4
                    }
                  }
                : player
            )
          );

          if (activePlayerData.mission_id === 4 && !activePlayerData.isAI) {
            toast({
              title: "Enigma Desbloqueado!",
              description: "Você completou uma volta e agora pode responder o enigma a qualquer momento!",
            });
          }
        }
      }

      if (bonusCredits > 0) {
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} passou pela casa INÍCIO e recebeu ${bonusCredits} créditos!`,
        });
        
        if (!activePlayerData.isAI) {
          toast({
            title: "Bônus Recebido!",
            description: `Você recebeu ${bonusCredits} créditos por passar pela casa INÍCIO`,
          });
        }
      }

      // Verificar tipo de casa usando boardCells
      const cellData = getCellByPosition(finalPosition);
      const cellType = cellData?.type || 'normal';

      if (cellType === 'battle') {
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} caiu numa casa de desafio!`,
        });

        // Escolher oponente
        const opponents = players.filter(p => p.id !== activePlayerData.id);
        if (opponents.length > 0) {
          const opponent = opponents[Math.floor(Math.random() * opponents.length)];
          
          setTimeout(() => {
            setBattlePlayers({
              player1: activePlayerData,
              player2: opponent
            });
            setShowBattleArena(true);
          }, 1000);
        } else {
          setTimeout(() => nextTurn(), 1000);
        }
      } else if (cellType === 'shop') {
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} chegou à loja! 🏪`,
        });

        if (activePlayerData.isAI) {
          if (getAIDecision(activePlayerData, 'shop')) {
            setTimeout(() => {
              handleAIShopPurchase(activePlayerData);
              nextTurn();
            }, 1000);
          } else {
            setTimeout(() => nextTurn(), 1000);
          }
        } else {
          setShopPlayer(activePlayerData);
          setShowShopDialog(true);
        }
      } else if (cellType === 'life_card') {
        const randomCard = getRandomLifeCard();
        setCurrentLifeCard(randomCard);
        setLifeCardPlayer(activePlayerData);
        
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} puxou uma Carta da Vida! 🃏`,
        });

        if (activePlayerData.isAI) {
          setTimeout(() => {
            handleLifeCardEffect(randomCard, activePlayerData);
            nextTurn();
          }, 1000);
        } else {
          setShowLifeCardDialog(true);
        }
      } else if (cellType === 'relic') {
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} encontrou uma Relíquia Antiga! 🏺`,
        });

        if (activePlayerData.isAI) {
          if (activePlayerData.mission_id === 1) {
            handleRelicCollect(activePlayerData);
          }
          setTimeout(() => nextTurn(), 500);
        } else {
          setMissionDialogPlayer(activePlayerData);
          setShowRelicDialog(true);
        }
      } else if (cellType === 'resource') {
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} chegou ao Mercado de Recursos! 💎`,
        });

        if (activePlayerData.isAI) {
          if (activePlayerData.mission_id === 2 && activePlayerData.credits >= 5000) {
            handleResourcePurchase(activePlayerData, { id: 'gold', name: 'Ouro Puro', icon: '🪙', price: 5000, description: 'Ouro' });
          }
          setTimeout(() => nextTurn(), 500);
        } else {
          setMissionDialogPlayer(activePlayerData);
          setShowResourceDialog(true);
        }
      } else if (cellType === 'enigma') {
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} encontrou um Enigma Mágico! 🧩`,
        });

        if (activePlayerData.isAI) {
          if (activePlayerData.mission_id === 4) {
            handleEnigmaHint(activePlayerData);
          }
          setTimeout(() => nextTurn(), 500);
        } else {
          setMissionDialogPlayer(activePlayerData);
          setShowEnigmaDialog(true);
        }
      } else if (cellType === 'alliance') {
        const region = cellData?.region || 'norte';
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} chegou à Aliança do ${region.charAt(0).toUpperCase() + region.slice(1)}! 🏛️`,
        });

        setCurrentRegion(region);
        if (activePlayerData.isAI) {
          if (activePlayerData.mission_id === 5) {
            handleAllianceCollect(activePlayerData, region);
          }
          setTimeout(() => nextTurn(), 500);
        } else {
          setMissionDialogPlayer(activePlayerData);
          setShowAllianceDialog(true);
        }
      } else if (cellType === 'prophecy') {
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} encontrou um Santuário da Profecia! 🔮`,
        });

        if (activePlayerData.isAI) {
          if (activePlayerData.mission_id === 6) {
            handleProphecyFulfill(activePlayerData);
          }
          setTimeout(() => nextTurn(), 500);
        } else {
          setMissionDialogPlayer(activePlayerData);
          setShowProphecyDialog(true);
        }
      } else if (cellType === 'throne') {
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} chegou ao Trono Sagrado! 👑`,
        });

        if (activePlayerData.isAI) {
          setTimeout(() => nextTurn(), 500);
        } else {
          setMissionDialogPlayer(activePlayerData);
          setShowThroneDialog(true);
        }
      } else if (cellType === 'energy') {
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} encontrou um Ponto de Energia! ⚡`,
        });

        if (activePlayerData.isAI) {
          if (activePlayerData.mission_id === 8) {
            handleEnergyActivate(activePlayerData);
          }
          setTimeout(() => nextTurn(), 500);
        } else {
          setMissionDialogPlayer(activePlayerData);
          setShowEnergyDialog(true);
        }
      } else if (cellType === 'normal') {
        // Evento em casa normal (30% de chance)
        if (Math.random() < 0.3) {
          const normalEvent = getRandomNormalEvent();
          setCurrentNormalEvent(normalEvent);
          setNormalEventPlayer(activePlayerData);
          
          addGameEvent({
            type: "system",
            message: `${activePlayerData.name} encontrou algo interessante na casa ${finalPosition + 1}!`,
          });

          if (activePlayerData.isAI) {
            setTimeout(() => {
              handleNormalEventEffect(normalEvent, activePlayerData);
              nextTurn();
            }, 1000);
          } else {
            setShowNormalEventDialog(true);
          }
        } else {
          setTimeout(() => nextTurn(), 500);
        }
      } else {
        setTimeout(() => nextTurn(), 500);
      }

      setGameStats((prev) => ({
        ...prev,
        totalRolls: prev.totalRolls + 1,
      }));

    } catch (error: any) {
      toast({
        title: "Erro ao realizar jogada",
        description: error.message,
        variant: "destructive"
      });
      setIsRolling(false);
    }
  };

  const nextTurn = () => {
    const nextPlayerIndex = (currentPlayer + 1) % players.length;
    setCurrentPlayer(nextPlayerIndex);
    
    const nextPlayer = players[nextPlayerIndex];
    addGameEvent({
      type: "turn",
      message: `🎯 Vez de ${nextPlayer.name}`,
    });
    
    setIsRolling(false);
  };

  // Verificar vitória por missão ou falência
  const checkVictory = () => {
    players.forEach(player => {
      const progress = player.missionProgress;
      let hasWon = false;
      let winMessage = '';

      switch(player.mission_id) {
        case 1: // Guardião das Relíquias
          if ((progress.relics || 0) >= 3) {
            hasWon = true;
            winMessage = `${player.name} coletou todas as 3 Relíquias Antigas e venceu o jogo! 🏺`;
          }
          break;
        case 2: // Mestre dos Recursos
          if ((progress.resources || 0) >= 12) {
            hasWon = true;
            winMessage = `${player.name} acumulou 12 recursos e venceu o jogo! 💰`;
          }
          break;
        case 3: // Campeão da Arena
          if ((progress.duelsWon || 0) >= 3) {
            hasWon = true;
            winMessage = `${player.name} venceu 3 duelos e é o Campeão da Arena! ⚔️`;
          }
          break;
        case 4: // Enigma das Runas
          if (progress.enigmaAnswered && progress.enigmasSolved) {
            hasWon = true;
            winMessage = `${player.name} resolveu o Enigma das Runas e venceu o jogo! 🧠`;
          }
          break;
        case 5: // Construtor da Aliança
          if ((progress.allianceMarks?.length || 0) >= 4) {
            hasWon = true;
            winMessage = `${player.name} formou alianças com todas as 4 regiões e venceu! 🏛️`;
          }
          break;
        case 6: // O Escolhido do Oráculo
          if ((progress.prophecies || 0) >= 3) {
            hasWon = true;
            winMessage = `${player.name} cumpriu 3 profecias e venceu o jogo! 🧙`;
          }
          break;
        case 7: // Usurpador do Trono
          if (progress.throneDefended) {
            hasWon = true;
            winMessage = `${player.name} conquistou e defendeu o Trono Sagrado! 👑`;
          }
          break;
        case 8: // Despertar do Fluxo
          if ((progress.energyPoints || 0) >= 5) {
            hasWon = true;
            winMessage = `${player.name} ativou todos os 5 Pontos de Energia e restaurou o Fluxo! 🔮`;
          }
          break;
      }

      if (hasWon) {
        toast({
          title: "🎉 VITÓRIA!",
          description: winMessage,
          duration: 10000,
        });
        addGameEvent({
          type: "game",
          message: `🏆 ${winMessage}`,
        });
        // TODO: Implementar tela de vitória
      }
    });

    // Verificar falência (todos os oponentes sem créditos)
    const humanPlayer = players.find(p => !p.isAI);
    if (humanPlayer) {
      const allOpponentsBankrupt = players.filter(p => p.isAI).every(p => p.credits <= 0);
      if (allOpponentsBankrupt && players.filter(p => p.isAI).length > 0) {
        toast({
          title: "🎉 VITÓRIA POR FALÊNCIA!",
          description: `${humanPlayer.name} venceu! Todos os oponentes faliram!`,
          duration: 10000,
        });
        addGameEvent({
          type: "game",
          message: `🏆 ${humanPlayer.name} venceu por falência dos oponentes!`,
        });
      }
    }
  };

  const handleNormalEventEffect = (event: ReturnType<typeof getRandomNormalEvent>, player: Player) => {
    const creditsChange = event.effect.credits || 0;
    
    setPlayers((prevPlayers) =>
      prevPlayers.map((p) =>
        p.id === player.id
          ? { ...p, credits: Math.max(0, p.credits + creditsChange) }
          : p
      )
    );

    addGameEvent({
      type: "system",
      message: `${event.icon} ${player.name}: ${event.effect.message}`,
    });
  };

  const handleBattleComplete = (winnerId: number, loserDamage: number) => {
    if (!battlePlayers) return;

    const opponentId = battlePlayers.player1.id === winnerId
      ? battlePlayers.player2.id
      : battlePlayers.player1.id;

    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id === opponentId);
    
    if (!winner || !loser) return;

    const winnerReward = Math.floor(loser.credits * 0.1);
    const loserPenalty = Math.floor(loser.credits * 0.1);

    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        if (player.id === winner.id) {
          // Registrar vitória de batalha para missão Campeão da Arena
          const newDuelsWon = (player.missionProgress.duelsWon || 0) + 1;
          return { 
            ...player, 
            credits: player.credits + winnerReward,
            lastBattleWon: true,
            missionProgress: {
              ...player.missionProgress,
              duelsWon: newDuelsWon
            }
          };
        }
        if (player.id === loser.id) {
          return { 
            ...player, 
            credits: Math.max(0, player.credits - loserPenalty),
            lastBattleWon: false
          };
        }
        return player;
      })
    );

    addGameEvent({
      type: "system",
      message: `🥊 ${winner.name} venceu a batalha contra ${loser.name}! (+${winnerReward}/-${loserPenalty} créditos)`,
    });

    toast({
      title: "Batalha Finalizada!",
      description: `${winner.name} venceu e recebeu ${winnerReward} créditos!`,
    });

    // Verificar vitória
    setTimeout(() => {
      checkVictory();
      nextTurn();
    }, 1000);
  };

  const handleAIShopPurchase = (aiPlayer: Player) => {
    const availableItems = [
      { id: 'sword_basic', name: 'Espada Básica', price: 5000 },
      { id: 'shield_wood', name: 'Escudo de Madeira', price: 3000 },
      { id: 'ring_wisdom', name: 'Anel da Sabedoria', price: 4000 },
    ];

    const affordableItems = availableItems.filter(item => item.price <= aiPlayer.credits);
    if (affordableItems.length === 0) return;

    const randomItem = affordableItems[Math.floor(Math.random() * affordableItems.length)];
    
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === aiPlayer.id
          ? { ...player, credits: player.credits - randomItem.price }
          : player
      )
    );

    addGameEvent({
      type: "system",
      message: `${aiPlayer.name} comprou ${randomItem.name} por ${randomItem.price} créditos!`,
    });
  };


  const handleShopPurchase = async (item: ShopItem) => {
    if (!shopPlayer) return;

    const newCredits = shopPlayer.credits - item.price;
    
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === shopPlayer.id
          ? { ...player, credits: newCredits }
          : player
      )
    );

    addGameEvent({
      type: "system",
      message: `${shopPlayer.name} comprou ${item.name} por ${item.price} créditos!`,
    });

    setShowShopDialog(false);
    setTimeout(() => nextTurn(), 500);
  };

  const handleLifeCardEffect = async (
    card: LifeCard,
    player?: Player,
    choice?: { targetPlayer?: Player }
  ) => {
    const targetPlayer = player || lifeCardPlayer;
    if (!targetPlayer) return;

    let newCredits = targetPlayer.credits;
    let effectMessage = "";
    let customPlayerUpdates: ((players: Player[]) => Player[]) | null = null;

    if (card.effect.type === 'credits') {
      if (card.effect.percentage) {
        const changeAmount = Math.floor(targetPlayer.credits * Math.abs(card.effect.percentage) / 100);
        newCredits = card.effect.percentage > 0
          ? targetPlayer.credits + changeAmount
          : Math.max(0, targetPlayer.credits - changeAmount);
        effectMessage = `${card.effect.percentage > 0 ? '+' : '-'}${changeAmount} créditos`;
      } else if (typeof card.effect.value === 'number') {
        newCredits = Math.max(0, targetPlayer.credits + card.effect.value);
        effectMessage = `${card.effect.value > 0 ? '+' : ''}${card.effect.value} créditos`;
      }
    }

    if (card.effect.special === 'mission_hint') {
      effectMessage = "recebeu uma dica sobre missões!";
    } else if (card.effect.special === 'shop_discount') {
      effectMessage = "ganhou desconto na próxima compra!";
    } else if (card.effect.special === 'mission_swap') {
      const otherPlayers = players.filter(p => p.id !== targetPlayer.id);

      if (otherPlayers.length === 0) {
        effectMessage = "não encontrou ninguém para trocar missões.";
      } else {
        let swapWith = choice?.targetPlayer;

        if (!swapWith || !otherPlayers.some(p => p.id === swapWith?.id)) {
          swapWith = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
        }

        if (swapWith) {
          const targetMission = targetPlayer.mission_id;
          const swapMission = swapWith.mission_id;

          customPlayerUpdates = (prevPlayers) =>
            prevPlayers.map((p) => {
              if (p.id === targetPlayer.id) {
                return { ...p, mission_id: swapMission };
              }
              if (p.id === swapWith!.id) {
                return { ...p, mission_id: targetMission };
              }
              return p;
            });

          if (targetPlayer.player_id === user?.id) {
            setPlayerMission(swapMission);
          } else if (swapWith.player_id === user?.id) {
            setPlayerMission(targetMission);
          }

          effectMessage = `trocou sua missão com ${swapWith.name}!`;
        } else {
          effectMessage = "não conseguiu trocar de missão.";
        }
      }
    }

    if (customPlayerUpdates) {
      setPlayers((prevPlayers) => customPlayerUpdates!(prevPlayers));
    } else {
      setPlayers((prevPlayers) =>
        prevPlayers.map((p) =>
          p.id === targetPlayer.id
            ? { ...p, credits: newCredits }
            : p
        )
      );
    }

    addGameEvent({
      type: "system",
      message: `🃏 ${targetPlayer.name} - ${card.title}: ${effectMessage}`,
    });

    setShowLifeCardDialog(false);
    if (!player) {
      setTimeout(() => nextTurn(), 500);
    }
  };

  const backToHome = () => {
    navigate('/');
  };

  // Mostrar tela de configurações se ainda não configurado
  if (!gameSettings) {
    return <GameSettings onStart={handleStartGame} />;
  }

  if (players.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlayerData = players[currentPlayer];
  const isMyTurn = currentPlayerData && !currentPlayerData.isAI && currentPlayerData.player_id === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={backToHome}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
          <h1 className="text-2xl font-bold">Jogo Local - vs Máquina</h1>
          <div className="ml-auto">
            {isMyTurn ? (
              <div className="text-green-600 font-medium">É sua vez!</div>
            ) : (
              <div className="text-muted-foreground">
                Vez de {currentPlayerData?.name}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tabuleiro e Legenda */}
          <div className="lg:col-span-8 space-y-6">
            <GameBoard
              players={players}
              currentPlayer={currentPlayer}
              highlightedCell={highlightedCell}
              onCellHover={setHighlightedCell}
            />
            <BoardLegend 
              onCellHover={setHighlightedCell}
              highlightedCell={highlightedCell}
            />
          </div>
          
          {/* Painel Lateral */}
          <div className="lg:col-span-4 space-y-6">
            <DiceRoller 
              onRoll={(diceValue, dice1, dice2) => handleDiceRoll(diceValue, dice1, dice2)} 
              disabled={isRolling || !isMyTurn}
              isRolling={isRolling}
            />
            <PlayerPanel
              players={players}
              currentPlayer={currentPlayer}
              gameStats={gameStats}
            />
            <PlayerMissionPanel 
              missionId={playerMission}
              playerClass={playerClass}
            />
            <GameFeed events={gameEvents} maxEvents={10} />
          </div>
        </div>

        {/* Dialogs */}
        {battlePlayers && (
          <BattleArena
            isOpen={showBattleArena}
            onClose={() => setShowBattleArena(false)}
            player1={battlePlayers.player1}
            player2={battlePlayers.player2}
            onBattleComplete={handleBattleComplete}
          />
        )}

        {shopPlayer && !shopPlayer.isAI && (
          <ShopDialog
            isOpen={showShopDialog}
            onClose={() => {
              setShowShopDialog(false);
              setTimeout(() => nextTurn(), 500);
            }}
            player={shopPlayer}
            onPurchase={handleShopPurchase}
          />
        )}

        {lifeCardPlayer && currentLifeCard && !lifeCardPlayer.isAI && (
          <LifeCardDialog
            isOpen={showLifeCardDialog}
            onClose={() => {
              setShowLifeCardDialog(false);
              setTimeout(() => nextTurn(), 500);
            }}
            card={currentLifeCard}
            player={lifeCardPlayer}
            onApplyEffect={(card, choice) => handleLifeCardEffect(card, undefined, choice)}
            availablePlayers={players}
          />
        )}

        {normalEventPlayer && currentNormalEvent && !normalEventPlayer.isAI && (
          <NormalCellEventDialog
            isOpen={showNormalEventDialog}
            onClose={() => {
              setShowNormalEventDialog(false);
              setTimeout(() => nextTurn(), 500);
            }}
            event={currentNormalEvent}
            onApply={(credits) => {
              handleNormalEventEffect(currentNormalEvent, normalEventPlayer);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SinglePlayerGame;
