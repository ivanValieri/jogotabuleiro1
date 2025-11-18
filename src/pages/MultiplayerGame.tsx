import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import GameBoard from "@/components/GameBoard";
import DiceRoller from "@/components/DiceRoller";
import PlayerPanel from "@/components/PlayerPanel";
import PlayerMissionPanel from "@/components/PlayerMissionPanel";
import GameFeed from "@/components/GameFeed";
import BoardLegend from "@/components/BoardLegend";
import { ShopDialog } from "@/components/ShopDialog";
import { LifeCardDialog } from "@/components/LifeCardDialog";
import NormalCellEventDialog from "@/components/NormalCellEvent";
import BattleArena from "@/components/battles/BattleArena";
import RelicDialog from "@/components/missions/RelicDialog";
import ResourceDialog from "@/components/missions/ResourceDialog";
import EnigmaDialog from "@/components/missions/EnigmaDialog";
import AllianceDialog from "@/components/missions/AllianceDialog";
import ProphecyDialog from "@/components/missions/ProphecyDialog";
import ThroneDialog from "@/components/missions/ThroneDialog";
import EnergyDialog from "@/components/missions/EnergyDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ShopItem } from "@/types/shop";
import { LifeCard, getRandomLifeCard } from "@/types/lifeCards";
import { MissionProgress } from "@/types/missions";
import { getCellByPosition, TOTAL_CELLS } from "@/types/boardCells";
import { Enigma, getRandomizedEnigma, checkEnigmaAnswer } from "@/types/enigmas";

interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
  avatar: string;
  player_id: string;
  turn_order: number;
  credits: number;
  mission_id?: number;
  class_id?: string;
  missionProgress: MissionProgress;
  enigma?: Enigma;
  lastBattleWon?: boolean;
  isOnThrone?: boolean;
  previousPosition?: number;
}

interface GameEvent {
  id: string;
  type: "roll" | "move" | "turn" | "game" | "system";
  message: string;
  timestamp: Date;
  diceValue?: number;
  playerPosition?: number;
}

interface GamePlayer {
  id: string;
  player_id: string;
  position: number;
  turn_order: number;
  color: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

const MultiplayerGame = () => {
  const { roomId } = useParams<{ roomId: string }>();
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
  const [showShopDialog, setShowShopDialog] = useState(false);
  const [shopPlayer, setShopPlayer] = useState<Player | null>(null);
  const [showLifeCardDialog, setShowLifeCardDialog] = useState(false);
  const [currentLifeCard, setCurrentLifeCard] = useState<LifeCard | null>(null);
  const [lifeCardPlayer, setLifeCardPlayer] = useState<Player | null>(null);
  const [showNormalEventDialog, setShowNormalEventDialog] = useState(false);
  const [normalEventPlayer, setNormalEventPlayer] = useState<Player | null>(null);
  const [showBattleArena, setShowBattleArena] = useState(false);
  const [battlePlayers, setBattlePlayers] = useState<{ player1: Player; player2: Player } | null>(null);
  const [showRelicDialog, setShowRelicDialog] = useState(false);
  const [relicPlayer, setRelicPlayer] = useState<Player | null>(null);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [resourcePlayer, setResourcePlayer] = useState<Player | null>(null);
  const [showEnigmaDialog, setShowEnigmaDialog] = useState(false);
  const [enigmaPlayer, setEnigmaPlayer] = useState<Player | null>(null);
  const [showAllianceDialog, setShowAllianceDialog] = useState(false);
  const [alliancePlayer, setAlliancePlayer] = useState<Player | null>(null);
  const [allianceRegion, setAllianceRegion] = useState<string>('');
  const [showProphecyDialog, setShowProphecyDialog] = useState(false);
  const [prophecyPlayer, setProphecyPlayer] = useState<Player | null>(null);
  const [showThroneDialog, setShowThroneDialog] = useState(false);
  const [thronePlayer, setThronePlayer] = useState<Player | null>(null);
  const [showEnergyDialog, setShowEnergyDialog] = useState(false);
  const [energyPlayer, setEnergyPlayer] = useState<Player | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const assignMissionsToMissingPlayers = async (playersData: any[]) => {
    try {
      // Filtrar jogadores que não têm missão
      const playersWithoutMission = playersData.filter(p => !p.mission_id);
      
      if (playersWithoutMission.length === 0) return;

      // Buscar missões já utilizadas
      const usedMissions = playersData
        .filter(p => p.mission_id)
        .map(p => p.mission_id);

      // Criar lista de missões disponíveis
      const allMissions = [1, 2, 3, 4, 5, 6, 7, 8];
      let availableMissions = allMissions.filter(mission => !usedMissions.includes(mission));
      
      // Se não há missões disponíveis, usar todas novamente
      if (availableMissions.length === 0) {
        availableMissions = [...allMissions];
      }

      // Embaralhar missões
      for (let i = availableMissions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableMissions[i], availableMissions[j]] = [availableMissions[j], availableMissions[i]];
      }

      // Atribuir missões
      for (let i = 0; i < playersWithoutMission.length; i++) {
        const player = playersWithoutMission[i];
        const missionId = availableMissions[i % availableMissions.length];
        
        const { error } = await supabase
          .from('game_players')
          .update({ mission_id: missionId })
          .eq('id', player.id);

        if (error) throw error;
        
        console.log(`Missão ${missionId} atribuída automaticamente ao jogador ${player.id}`);
      }

      toast({
        title: "Missões Corrigidas",
        description: "Missões foram atribuídas automaticamente aos jogadores.",
      });
    } catch (error: any) {
      console.error('Erro ao corrigir missões:', error);
    }
  };

  useEffect(() => {
    if (!user || !roomId) {
      navigate('/');
      return;
    }

    loadGameData();

    // Configurar tempo real para movimentos do jogo e batalhas
    const channel = supabase
      .channel(`game-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_moves',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          handleRealtimeMove(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_players',
          filter: `room_id=eq.${roomId}`
        },
        () => {
          loadGameData();
        }
      )
      .on(
        'broadcast',
        { event: 'battle_started' },
        (payload) => {
          handleBattleBroadcast(payload.payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, roomId, navigate]);

  const loadGameData = async () => {
    try {
      // Carregar jogadores do jogo
      const { data: playersData, error: playersError } = await supabase
        .from('game_players')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('turn_order');

      if (playersError) throw playersError;

      const formattedPlayers: Player[] = playersData.map((player, index) => ({
        id: player.turn_order,
        name: player.profiles?.username || `Jogador ${player.turn_order}`,
        position: player.position,
        color: player.color,
        avatar: player.profiles?.avatar_url || '',
        player_id: player.player_id,
        turn_order: player.turn_order,
        credits: player.credits || 50000,
        mission_id: player.mission_id,
        class_id: player.class_id,
        missionProgress: player.mission_progress || {
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
        enigma: player.mission_id === 4 ? getRandomizedEnigma() : undefined,
        lastBattleWon: false,
        isOnThrone: false,
      }));

      setPlayers(formattedPlayers);

      // Verificar se há jogadores sem missão e corrigir automaticamente
      const playersWithoutMission = playersData.filter(p => !p.mission_id);
      if (playersWithoutMission.length > 0) {
        console.log(`Encontrados ${playersWithoutMission.length} jogadores sem missão. Corrigindo...`);
        await assignMissionsToMissingPlayers(playersData);
        // Recarregar dados após correção
        loadGameData();
        return;
      }

      // Carregar missão e classe do jogador atual
      const currentPlayerData = playersData.find(p => p.player_id === user?.id);
      if (currentPlayerData) {
        setPlayerMission(currentPlayerData.mission_id);
        setPlayerClass(currentPlayerData.class_id);
      }

      // Carregar eventos do jogo
      const { data: movesData, error: movesError } = await supabase
        .from('game_moves')
        .select(`
          *,
          profiles (username)
        `)
        .eq('room_id', roomId)
        .order('created_at');

      if (movesError) throw movesError;

      const events: GameEvent[] = movesData.map((move, index) => ({
        id: move.id,
        type: 'move',
        message: `${move.profiles?.username || 'Jogador'} tirou ${move.dice_value} e moveu para posição ${move.new_position}`,
        timestamp: new Date(move.created_at),
        diceValue: move.dice_value,
        playerPosition: move.new_position
      }));

      setGameEvents(events);
      setGameStats({
        totalRolls: movesData.length,
        gameStartTime: new Date()
      });

      // Determinar jogador atual baseado no número de movimentos
      if (formattedPlayers.length > 0) {
        setCurrentPlayer(movesData.length % formattedPlayers.length);
      }

    } catch (error: any) {
      toast({
        title: "Erro ao carregar jogo",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRealtimeMove = (newMove: any) => {
    // Recarregar dados do jogo quando houver um novo movimento
    loadGameData();
  };

  const handleBattleBroadcast = async (payload: any) => {
    // Receber notificação de batalha e abrir arena para todos os jogadores
    const { player1_id, player2_id, player1_name, player2_name } = payload;
    
    // Recarregar dados dos jogadores para ter certeza de ter os mais atualizados
    const { data: playersData } = await supabase
      .from('game_players')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq('room_id', roomId)
      .order('turn_order');
    
    if (playersData) {
      const formattedPlayers = playersData.map((player) => ({
        id: player.turn_order,
        name: player.profiles?.username || `Jogador ${player.turn_order}`,
        position: player.position,
        color: player.color,
        avatar: player.profiles?.avatar_url || '',
        player_id: player.player_id,
        turn_order: player.turn_order,
        credits: player.credits || 50000,
        mission_id: player.mission_id,
        class_id: player.class_id,
        missionProgress: player.mission_progress || {
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
        enigma: player.mission_id === 4 ? getRandomizedEnigma() : undefined,
        lastBattleWon: false,
        isOnThrone: false,
      }));
      
      // Encontrar os jogadores
      const p1 = formattedPlayers.find(p => p.player_id === player1_id);
      const p2 = formattedPlayers.find(p => p.player_id === player2_id);
      
      if (p1 && p2) {
        setBattlePlayers({ player1: p1, player2: p2 });
        setShowBattleArena(true);
        
        addGameEvent({
          type: "system",
          message: `🥊 ${player1_name} vs ${player2_name} - Batalha iniciada!`,
        });
      }
    }
  };

  const addGameEvent = (event: Omit<GameEvent, "id" | "timestamp">) => {
    const newEvent: GameEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setGameEvents((prev) => [...prev, newEvent]);
  };

  const handleDiceRoll = async (diceValue: number, dice1: number, dice2: number) => {
    if (isRolling) return;

    const activePlayerData = players[currentPlayer];
    
    // Verificar se é a vez do usuário atual
    if (activePlayerData.player_id !== user?.id) {
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
      
      // Verificar se o jogador passou pela casa 1 (posição 0)
      const passedThroughStart = oldPosition + diceValue >= TOTAL_CELLS;
      if (passedThroughStart) {
        bonusCredits = 150;
      }
      
      // Calcular voltas completas
      if (newPosition >= TOTAL_CELLS) {
        newLaps = Math.floor(newPosition / TOTAL_CELLS);
        newPosition = newPosition % TOTAL_CELLS;
      }
      
      const finalPosition = newPosition;
      
      // Salvar movimento no banco
      const { error: moveError } = await supabase
        .from('game_moves')
        .insert({
          room_id: roomId,
          player_id: user.id,
          dice_value: diceValue,
          old_position: oldPosition,
          new_position: finalPosition,
          laps: newLaps,
          move_type: newLaps > 0 ? 'lap_complete' : 'normal'
        });

      if (moveError) throw moveError;

      // Primeiro, obter dados atuais do jogador
      const { data: playerData, error: fetchError } = await supabase
        .from('game_players')
        .select('laps, credits')
        .eq('room_id', roomId)
        .eq('player_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Calcular novos créditos
      const newCredits = (playerData.credits || 50000) + bonusCredits;

      // Atualizar posição, voltas e créditos do jogador
      const { error: updateError } = await supabase
        .from('game_players')
        .update({ 
          position: finalPosition,
          laps: (playerData.laps || 0) + newLaps,
          credits: newCredits
        })
        .eq('room_id', roomId)
        .eq('player_id', user.id);

      if (updateError) throw updateError;

      // Simular movimento animado casa por casa
      const totalSteps = diceValue;
      for (let step = 1; step <= totalSteps; step++) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        let intermediatePosition = oldPosition + step;
        if (intermediatePosition >= TOTAL_CELLS) {
          intermediatePosition = intermediatePosition % TOTAL_CELLS;
        }
        
        setPlayers((prevPlayers) =>
          prevPlayers.map((player) =>
            player.id === activePlayerData.id
              ? { ...player, position: intermediatePosition }
              : player
          )
        );
      }

      // Eventos especiais
      if (newLaps > 0) {
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} completou ${newLaps} volta(s)!`,
        });
      }

      if (bonusCredits > 0) {
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} passou pela casa INÍCIO e recebeu ${bonusCredits} créditos!`,
        });
        
        toast({
          title: "Bônus Recebido!",
          description: `Você recebeu ${bonusCredits} créditos por passar pela casa INÍCIO`,
        });
      }

      // Verificar tipo da célula usando boardCells.ts
      const cellData = getCellByPosition(finalPosition);
      const cellType = cellData?.type || 'normal';

      // Processar célula baseado no tipo
      if (cellType === 'battle') {
        // Selecionar oponente aleatório (diferente do jogador atual)
        const opponents = players.filter(p => p.id !== activePlayerData.id);
        if (opponents.length > 0) {
          const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
          
          // Broadcast para todos os jogadores via Supabase Realtime
          const channel = supabase.channel(`game-${roomId}`);
          await channel.send({
            type: 'broadcast',
            event: 'battle_started',
            payload: {
              player1_id: activePlayerData.player_id,
              player2_id: randomOpponent.player_id,
              player1_name: activePlayerData.name,
              player2_name: randomOpponent.name,
            }
          });
          
          // Abrir arena localmente também
          setBattlePlayers({ player1: activePlayerData, player2: randomOpponent });
          setShowBattleArena(true);
          
          addGameEvent({
            type: "system",
            message: `${activePlayerData.name} iniciou uma batalha contra ${randomOpponent.name}! 🥊`,
          });
        }
      } else if (cellType === 'shop') {
        setShopPlayer(activePlayerData);
        setShowShopDialog(true);
        
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} chegou à loja! 🏪`,
        });
      } else if (cellType === 'life_card') {
        const randomCard = getRandomLifeCard();
        setCurrentLifeCard(randomCard);
        setLifeCardPlayer(activePlayerData);
        setShowLifeCardDialog(true);
        
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} puxou uma Carta da Vida! 🃏`,
        });
      } else if (cellType === 'relic') {
        setRelicPlayer(activePlayerData);
        setShowRelicDialog(true);
        
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} encontrou uma relíquia antiga! 🏺`,
        });
      } else if (cellType === 'resource') {
        setResourcePlayer(activePlayerData);
        setShowResourceDialog(true);
        
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} chegou ao mercado de recursos! 💎`,
        });
      } else if (cellType === 'enigma') {
        setEnigmaPlayer(activePlayerData);
        setShowEnigmaDialog(true);
        
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} encontrou um enigma mágico! 🧩`,
        });
      } else if (cellType === 'alliance') {
        setAlliancePlayer(activePlayerData);
        setAllianceRegion(cellData?.region || '');
        setShowAllianceDialog(true);
        
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} encontrou uma marca de aliança! 🏛️`,
        });
      } else if (cellType === 'prophecy') {
        setProphecyPlayer(activePlayerData);
        setShowProphecyDialog(true);
        
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} visitou o santuário da profecia! 🔮`,
        });
      } else if (cellType === 'throne') {
        setThronePlayer(activePlayerData);
        setShowThroneDialog(true);
        
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} chegou ao Trono Sagrado! 👑`,
        });
      } else if (cellType === 'energy') {
        setEnergyPlayer(activePlayerData);
        setShowEnergyDialog(true);
        
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} ativou um ponto de energia! ⚡`,
        });
      } else if (cellType === 'normal') {
        setNormalEventPlayer(activePlayerData);
        setShowNormalEventDialog(true);
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
    } finally {
      setIsRolling(false);
    }
  };

  const handlePlayerMove = (playerId: number, newPosition: number) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === playerId ? { ...player, position: newPosition } : player
      )
    );
  };

  const handleBattleComplete = async (result: { winner: Player; loser: Player; damage: number }) => {
    try {
      // Atualizar créditos e progresso dos jogadores
      const winnerReward = 200;
      const loserPenalty = 100;

      const winnerUpdate = supabase
        .from('game_players')
        .update({ 
          credits: result.winner.credits + winnerReward,
        })
        .eq('room_id', roomId)
        .eq('player_id', result.winner.player_id);

      const loserUpdate = supabase
        .from('game_players')
        .update({ credits: Math.max(0, result.loser.credits - loserPenalty) })
        .eq('room_id', roomId)
        .eq('player_id', result.loser.player_id);

      await Promise.all([winnerUpdate, loserUpdate]);

      // Atualizar estado local
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === result.winner.id) {
            const newProgress = { ...p.missionProgress };
            if (p.mission_id === 3) {
              newProgress.duelsWon = (newProgress.duelsWon || 0) + 1;
            }
            return {
              ...p,
              credits: p.credits + winnerReward,
              missionProgress: newProgress,
              lastBattleWon: true,
            };
          } else if (p.id === result.loser.id) {
            return {
              ...p,
              credits: Math.max(0, p.credits - loserPenalty),
              lastBattleWon: false,
            };
          }
          return p;
        })
      );

      // Adicionar evento ao feed
      addGameEvent({
        type: "system",
        message: `🥊 ${result.winner.name} venceu a batalha! (+${winnerReward}/-${loserPenalty} créditos)`,
      });

      toast({
        title: "Batalha Finalizada!",
        description: `${result.winner.name} venceu e recebeu ${winnerReward} créditos!`,
      });

      setShowBattleArena(false);
      loadGameData();
    } catch (error: any) {
      toast({
        title: "Erro na batalha",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleNormalEventComplete = async (creditChange: number) => {
    if (!normalEventPlayer) return;

    try {
      const newCredits = Math.max(0, normalEventPlayer.credits + creditChange);
      
      await supabase
        .from('game_players')
        .update({ credits: newCredits })
        .eq('room_id', roomId)
        .eq('player_id', normalEventPlayer.player_id);

      loadGameData();
      setShowNormalEventDialog(false);
    } catch (error: any) {
      toast({
        title: "Erro no evento",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Handlers para Missões
  const handleRelicCollect = () => {
    if (!relicPlayer || relicPlayer.mission_id !== 1) {
      setShowRelicDialog(false);
      return;
    }

    setPlayers(prev => prev.map(p => 
      p.id === relicPlayer.id 
        ? { ...p, missionProgress: { ...p.missionProgress, relics: (p.missionProgress.relics || 0) + 1 } }
        : p
    ));

    addGameEvent({
      type: "system",
      message: `${relicPlayer.name} coletou uma relíquia! (${(relicPlayer.missionProgress.relics || 0) + 1}/3)`,
    });

    setShowRelicDialog(false);
  };

  const handleResourcePurchase = (resourceType: string, cost: number) => {
    if (!resourcePlayer || resourcePlayer.mission_id !== 2) {
      setShowResourceDialog(false);
      return;
    }

    if (resourcePlayer.credits < cost) {
      toast({
        title: "Créditos Insuficientes",
        description: "Você não tem créditos suficientes!",
        variant: "destructive",
      });
      return;
    }

    setPlayers(prev => prev.map(p => 
      p.id === resourcePlayer.id 
        ? { 
            ...p, 
            credits: p.credits - cost,
            missionProgress: { ...p.missionProgress, resources: (p.missionProgress.resources || 0) + 1 } 
          }
        : p
    ));

    addGameEvent({
      type: "system",
      message: `${resourcePlayer.name} comprou ${resourceType}! (${(resourcePlayer.missionProgress.resources || 0) + 1}/12)`,
    });

    setShowResourceDialog(false);
  };

  const handleEnigmaHint = () => {
    if (!enigmaPlayer || enigmaPlayer.mission_id !== 4) {
      setShowEnigmaDialog(false);
      return;
    }

    setPlayers(prev => prev.map(p => 
      p.id === enigmaPlayer.id 
        ? { ...p, missionProgress: { ...p.missionProgress, enigmaHints: (p.missionProgress.enigmaHints || 0) + 1 } }
        : p
    ));

    addGameEvent({
      type: "system",
      message: `${enigmaPlayer.name} recebeu uma dica do enigma! (${(enigmaPlayer.missionProgress.enigmaHints || 0) + 1}/5)`,
    });

    setShowEnigmaDialog(false);
  };

  const handleEnigmaAnswer = (answerId: string) => {
    if (!enigmaPlayer || !enigmaPlayer.enigma) return;

    const isCorrect = checkEnigmaAnswer(enigmaPlayer.enigma, answerId);
    
    if (isCorrect) {
      addGameEvent({
        type: "system",
        message: `🎉 ${enigmaPlayer.name} respondeu o enigma corretamente e venceu o jogo!`,
      });
      
      toast({
        title: "Vitória!",
        description: "Você respondeu o enigma corretamente!",
      });
    } else {
      addGameEvent({
        type: "system",
        message: `❌ ${enigmaPlayer.name} errou o enigma e foi eliminado do jogo!`,
      });
      
      toast({
        title: "Eliminado!",
        description: "Resposta incorreta! Você foi eliminado.",
        variant: "destructive",
      });
    }

    setShowEnigmaDialog(false);
  };

  const handleAllianceCollect = () => {
    if (!alliancePlayer || alliancePlayer.mission_id !== 5) {
      setShowAllianceDialog(false);
      return;
    }

    const marks = alliancePlayer.missionProgress.allianceMarks || [];
    if (!marks.includes(allianceRegion)) {
      setPlayers(prev => prev.map(p => 
        p.id === alliancePlayer.id 
          ? { ...p, missionProgress: { ...p.missionProgress, allianceMarks: [...marks, allianceRegion] } }
          : p
      ));

      addGameEvent({
        type: "system",
        message: `${alliancePlayer.name} formou aliança na região ${allianceRegion}! (${marks.length + 1}/4)`,
      });
    }

    setShowAllianceDialog(false);
  };

  const handleProphecyFulfill = () => {
    if (!prophecyPlayer || prophecyPlayer.mission_id !== 6) {
      setShowProphecyDialog(false);
      return;
    }

    setPlayers(prev => prev.map(p => 
      p.id === prophecyPlayer.id 
        ? { ...p, missionProgress: { ...p.missionProgress, prophecies: (p.missionProgress.prophecies || 0) + 1 } }
        : p
    ));

    addGameEvent({
      type: "system",
      message: `${prophecyPlayer.name} cumpriu uma profecia! (${(prophecyPlayer.missionProgress.prophecies || 0) + 1}/3)`,
    });

    setShowProphecyDialog(false);
  };

  const handleEnergyActivate = () => {
    if (!energyPlayer || energyPlayer.mission_id !== 8) {
      setShowEnergyDialog(false);
      return;
    }

    setPlayers(prev => prev.map(p => 
      p.id === energyPlayer.id 
        ? { ...p, missionProgress: { ...p.missionProgress, energyPoints: (p.missionProgress.energyPoints || 0) + 1 } }
        : p
    ));

    addGameEvent({
      type: "system",
      message: `${energyPlayer.name} ativou um ponto de energia! (${(energyPlayer.missionProgress.energyPoints || 0) + 1}/5)`,
    });

    setShowEnergyDialog(false);
  };

  const handleShopPurchase = async (item: ShopItem) => {
    if (!shopPlayer) return;

    try {
      const newCredits = shopPlayer.credits - item.price;
      
      // Atualizar créditos do jogador
      const { error } = await supabase
        .from('game_players')
        .update({ credits: newCredits })
        .eq('room_id', roomId)
        .eq('player_id', shopPlayer.player_id);

      if (error) throw error;

      addGameEvent({
        type: "system",
        message: `${shopPlayer.name} comprou ${item.name} por ${item.price} créditos!`,
      });

      loadGameData();
      setShowShopDialog(false);
    } catch (error: any) {
      toast({
        title: "Erro na compra",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLifeCardEffect = async (card: LifeCard, choice?: any) => {
    if (!lifeCardPlayer) return;

    try {
      let newCredits = lifeCardPlayer.credits;
      let effectMessage = "";

      // Aplicar efeito da carta
      if (card.effect.type === 'credits') {
        if (card.effect.percentage) {
          const changeAmount = Math.floor(lifeCardPlayer.credits * Math.abs(card.effect.percentage) / 100);
          newCredits = card.effect.percentage > 0 
            ? lifeCardPlayer.credits + changeAmount
            : Math.max(0, lifeCardPlayer.credits - changeAmount);
          effectMessage = `${card.effect.percentage > 0 ? '+' : '-'}${changeAmount} créditos`;
        } else if (card.effect.value) {
          newCredits = Math.max(0, lifeCardPlayer.credits + card.effect.value);
          effectMessage = `${card.effect.value > 0 ? '+' : ''}${card.effect.value} créditos`;
        }

        // Atualizar créditos do jogador
        const { error } = await supabase
          .from('game_players')
          .update({ credits: newCredits })
          .eq('room_id', roomId)
          .eq('player_id', lifeCardPlayer.player_id);

        if (error) throw error;
      }

      // Efeitos especiais
      if (card.effect.special === 'mission_hint') {
        effectMessage = "recebeu uma dica sobre missões!";
      } else if (card.effect.special === 'shop_discount') {
        effectMessage = "ganhou desconto na próxima compra!";
      } else if (card.effect.special === 'mission_swap' && choice?.targetPlayer) {
        effectMessage = `trocou de missão com ${choice.targetPlayer.name}!`;
      }

      addGameEvent({
        type: "system",
        message: `🃏 ${lifeCardPlayer.name} - ${card.title}: ${effectMessage}`,
      });

      loadGameData();
      setShowLifeCardDialog(false);
    } catch (error: any) {
      toast({
        title: "Erro ao aplicar efeito",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const backToRoom = async () => {
    try {
      // Atualizar status da sala para 'waiting' se necessário
      const { error } = await supabase
        .from('game_rooms')
        .update({ status: 'waiting' })
        .eq('id', roomId);

      if (error) throw error;
      navigate(`/room/${roomId}`);
    } catch (error: any) {
      navigate('/');
    }
  };

  if (players.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlayerData = players[currentPlayer];
  const isMyTurn = currentPlayerData?.player_id === user?.id;
  const challengerPlayer = players.find(p => p.player_id === user?.id);
  const availableOpponents = players.filter(p => p.player_id !== challengerPlayer?.player_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={backToRoom}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à Sala
          </Button>
          <h1 className="text-2xl font-bold">Jogo Multiplayer</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <GameBoard
              players={players}
              currentPlayer={currentPlayer}
              onPlayerMove={handlePlayerMove}
            />
          </div>
          
          <div className="space-y-6">
            <DiceRoller 
              onRoll={handleDiceRoll} 
              disabled={isRolling || !isMyTurn}
              isRolling={isRolling}
            />
            <PlayerPanel
              players={players}
              currentPlayer={currentPlayer}
              gameStats={gameStats}
            />
            <BoardLegend />
          </div>
          
          <div className="space-y-6">
            <PlayerMissionPanel 
              missionId={playerMission}
              playerClass={playerClass}
            />
            <GameFeed events={gameEvents} maxEvents={10} />
          </div>
        </div>

        {/* Battle Arena */}
        {battlePlayers && (
          <BattleArena
            isOpen={showBattleArena}
            onClose={() => setShowBattleArena(false)}
            player1={battlePlayers.player1}
            player2={battlePlayers.player2}
            onComplete={handleBattleComplete}
          />
        )}

        {/* Normal Cell Event Dialog */}
        {normalEventPlayer && (
          <NormalCellEventDialog
            isOpen={showNormalEventDialog}
            onClose={() => setShowNormalEventDialog(false)}
            player={normalEventPlayer}
            onComplete={handleNormalEventComplete}
          />
        )}

        {/* Relic Dialog */}
        {relicPlayer && (
          <RelicDialog
            isOpen={showRelicDialog}
            onClose={() => setShowRelicDialog(false)}
            player={relicPlayer}
            onCollect={handleRelicCollect}
          />
        )}

        {/* Resource Dialog */}
        {resourcePlayer && (
          <ResourceDialog
            isOpen={showResourceDialog}
            onClose={() => setShowResourceDialog(false)}
            player={resourcePlayer}
            onPurchase={handleResourcePurchase}
          />
        )}

        {/* Enigma Dialog */}
        {enigmaPlayer && enigmaPlayer.enigma && (
          <EnigmaDialog
            isOpen={showEnigmaDialog}
            onClose={() => setShowEnigmaDialog(false)}
            player={enigmaPlayer}
            enigma={enigmaPlayer.enigma}
            onHint={handleEnigmaHint}
            onAnswer={handleEnigmaAnswer}
          />
        )}

        {/* Alliance Dialog */}
        {alliancePlayer && (
          <AllianceDialog
            isOpen={showAllianceDialog}
            onClose={() => setShowAllianceDialog(false)}
            player={alliancePlayer}
            region={allianceRegion}
            onCollect={handleAllianceCollect}
          />
        )}

        {/* Prophecy Dialog */}
        {prophecyPlayer && (
          <ProphecyDialog
            isOpen={showProphecyDialog}
            onClose={() => setShowProphecyDialog(false)}
            player={prophecyPlayer}
            onFulfill={handleProphecyFulfill}
          />
        )}

        {/* Throne Dialog */}
        {thronePlayer && (
          <ThroneDialog
            isOpen={showThroneDialog}
            onClose={() => setShowThroneDialog(false)}
            player={thronePlayer}
            availablePlayers={players.filter(p => p.id !== thronePlayer.id)}
          />
        )}

        {/* Energy Dialog */}
        {energyPlayer && (
          <EnergyDialog
            isOpen={showEnergyDialog}
            onClose={() => setShowEnergyDialog(false)}
            player={energyPlayer}
            onActivate={handleEnergyActivate}
          />
        )}

        {/* Shop Dialog */}
        {shopPlayer && (
          <ShopDialog
            isOpen={showShopDialog}
            onClose={() => setShowShopDialog(false)}
            player={shopPlayer}
            onPurchase={handleShopPurchase}
          />
        )}

        {/* Life Card Dialog */}
        {lifeCardPlayer && currentLifeCard && (
          <LifeCardDialog
            isOpen={showLifeCardDialog}
            onClose={() => setShowLifeCardDialog(false)}
            card={currentLifeCard}
            player={lifeCardPlayer}
            onApplyEffect={handleLifeCardEffect}
            availablePlayers={players}
          />
        )}
      </div>
    </div>
  );
};

export default MultiplayerGame;