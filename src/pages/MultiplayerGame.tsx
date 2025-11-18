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
import ChallengeDialog from "@/components/ChallengeDialog";
import { ShopDialog } from "@/components/ShopDialog";
import { LifeCardDialog } from "@/components/LifeCardDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ShopItem } from "@/types/shop";
import { LifeCard, getRandomLifeCard, getLifeCardPositions } from "@/types/lifeCards";

interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
  avatar: string;
  player_id: string;
  turn_order: number;
  credits: number;
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
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [challengePosition, setChallengePosition] = useState<number | null>(null);
  const [showShopDialog, setShowShopDialog] = useState(false);
  const [shopPlayer, setShopPlayer] = useState<Player | null>(null);
  const [showLifeCardDialog, setShowLifeCardDialog] = useState(false);
  const [currentLifeCard, setCurrentLifeCard] = useState<LifeCard | null>(null);
  const [lifeCardPlayer, setLifeCardPlayer] = useState<Player | null>(null);
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

    // Configurar tempo real para movimentos do jogo
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
        credits: player.credits || 50000
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
      const passedThroughStart = oldPosition + diceValue >= 30;
      if (passedThroughStart) {
        bonusCredits = 150;
      }
      
      // Calcular voltas completas
      if (newPosition >= 30) {
        newLaps = Math.floor(newPosition / 30);
        newPosition = newPosition % 30;
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
        if (intermediatePosition >= 30) {
          intermediatePosition = intermediatePosition % 30;
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

      // Verificar se caiu em casa de desafio
      const challengeCells = [5, 11, 19, 26];
      if (challengeCells.includes(finalPosition)) {
        setChallengePosition(finalPosition);
        setShowChallengeDialog(true);
        
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} caiu numa casa de desafio!`,
        });
      }
      
      // Verificar se caiu na casa da loja
      if (finalPosition === 15) {
        setShopPlayer(activePlayerData);
        setShowShopDialog(true);
        
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} chegou à loja! 🏪`,
        });
      }
      
      // Verificar se caiu numa casa de carta da vida
      const lifeCardPositions = getLifeCardPositions();
      if (lifeCardPositions.includes(finalPosition) && !challengeCells.includes(finalPosition)) {
        const randomCard = getRandomLifeCard();
        setCurrentLifeCard(randomCard);
        setLifeCardPlayer(activePlayerData);
        setShowLifeCardDialog(true);
        
        addGameEvent({
          type: "system",
          message: `${activePlayerData.name} puxou uma Carta da Vida! 🃏`,
        });
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

  const handleChallengeBattle = async (opponent: Player, result: any) => {
    try {
      // Atualizar créditos dos jogadores
      const winnerUpdate = supabase
        .from('game_players')
        .update({ credits: result.winner.credits + result.winnerReward })
        .eq('room_id', roomId)
        .eq('player_id', result.winner.player_id);

      const loserUpdate = supabase
        .from('game_players')
        .update({ credits: Math.max(0, result.loser.credits - result.loserPenalty) })
        .eq('room_id', roomId)
        .eq('player_id', result.loser.player_id);

      await Promise.all([winnerUpdate, loserUpdate]);

      // Adicionar evento ao feed
      addGameEvent({
        type: "system",
        message: `🥊 ${result.winner.name} venceu a batalha contra ${result.loser.name}! (+${result.winnerReward}/-${result.loserPenalty} créditos)`,
      });

      toast({
        title: "Batalha Finalizada!",
        description: `${result.winner.name} venceu e recebeu ${result.winnerReward} créditos!`,
      });

      // Recarregar dados do jogo
      loadGameData();
    } catch (error: any) {
      toast({
        title: "Erro na batalha",
        description: error.message,
        variant: "destructive"
      });
    }
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
          </div>
          
          <div className="space-y-6">
            <PlayerMissionPanel 
              missionId={playerMission}
              playerClass={playerClass}
            />
            <GameFeed events={gameEvents} maxEvents={10} />
          </div>
        </div>

        {/* Challenge Dialog */}
        {challengerPlayer && (
          <ChallengeDialog
            isOpen={showChallengeDialog}
            onClose={() => setShowChallengeDialog(false)}
            challenger={challengerPlayer}
            availablePlayers={availableOpponents}
            onBattle={handleChallengeBattle}
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