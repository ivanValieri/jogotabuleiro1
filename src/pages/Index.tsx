import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import GameBoard, { Player } from "@/components/GameBoard";
import DiceRoller from "@/components/DiceRoller";
import PlayerPanel from "@/components/PlayerPanel";
import GameFeed, { GameEvent } from "@/components/GameFeed";
import GameSetup from "@/components/GameSetup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Settings } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [gameStats, setGameStats] = useState({
    totalRolls: 0,
    gameStartTime: new Date()
  });
  const [isRolling, setIsRolling] = useState(false);

  // Add game event
  const addGameEvent = (event: Omit<GameEvent, 'id' | 'timestamp'>) => {
    const newEvent: GameEvent = {
      ...event,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };
    setGameEvents(prev => [...prev, newEvent]);
  };

  // Start game
  const handleStartGame = (gamePlayers: Player[]) => {
    setPlayers(gamePlayers);
    setCurrentPlayer(gamePlayers[0]?.id || 0);
    setGameStarted(true);
    setGameStats({
      totalRolls: 0,
      gameStartTime: new Date()
    });
    setGameEvents([]);

    addGameEvent({
      type: 'game',
      message: `🎮 Jogo iniciado com ${gamePlayers.length} jogadores!`,
    });

    addGameEvent({
      type: 'turn',
      playerId: gamePlayers[0]?.id,
      playerName: gamePlayers[0]?.name,
      message: `${gamePlayers[0]?.name} ${gamePlayers[0]?.avatar} começa o jogo!`,
    });

    toast({
      title: "Jogo Iniciado! 🎮",
      description: `Boa sorte para todos os ${gamePlayers.length} jogadores!`,
    });
  };

  // Handle dice roll
  const handleDiceRoll = (diceValue: number) => {
    if (isRolling) return;
    
    setIsRolling(true);
    const playerIndex = players.findIndex(p => p.id === currentPlayer);
    const player = players[playerIndex];
    
    if (!player) {
      setIsRolling(false);
      return;
    }

    // Update stats
    setGameStats(prev => ({
      ...prev,
      totalRolls: prev.totalRolls + 1
    }));

    // Add dice roll event
    addGameEvent({
      type: 'roll',
      playerId: player.id,
      playerName: player.name,
      message: `${player.name} ${player.avatar} tirou ${diceValue} no dado!`,
      diceValue
    });

    // Animate movement step by step
    let currentStep = 0;
    const moveInterval = setInterval(() => {
      if (currentStep < diceValue) {
        currentStep++;
        const newPosition = (player.position + currentStep) % 16;
        
        // Update player position for this step
        setPlayers(prev => prev.map(p => 
          p.id === currentPlayer 
            ? { ...p, position: newPosition }
            : p
        ));

        // If this is the final step, add events and handle turn change
        if (currentStep === diceValue) {
          clearInterval(moveInterval);
          
          addGameEvent({
            type: 'move',
            playerId: player.id,
            playerName: player.name,
            message: `${player.name} chegou na Casa ${newPosition + 1}`,
            position: newPosition
          });

          // Special position events
          if (newPosition === 0) {
            addGameEvent({
              type: 'game',
              playerId: player.id,
              playerName: player.name,
              message: `🏁 ${player.name} passou pela linha de largada!`,
            });
            
            toast({
              title: "Linha de Largada! 🏁",
              description: `${player.name} completou uma volta!`,
            });
          }

          // Next player after a short delay
          setTimeout(() => {
            const nextPlayerIndex = (playerIndex + 1) % players.length;
            setCurrentPlayer(players[nextPlayerIndex].id);
            
            addGameEvent({
              type: 'turn',
              playerId: players[nextPlayerIndex].id,
              playerName: players[nextPlayerIndex].name,
              message: `🎯 Vez de ${players[nextPlayerIndex].name} ${players[nextPlayerIndex].avatar}`,
            });
            
            setIsRolling(false);
          }, 500);
        }
      }
    }, 400); // Move every 400ms for smooth animation
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setPlayers([]);
    setCurrentPlayer(0);
    setGameEvents([]);
    setGameStats({
      totalRolls: 0,
      gameStartTime: new Date()
    });
    setIsRolling(false);
    
    toast({
      title: "Jogo Reiniciado",
      description: "Configure uma nova partida!",
    });
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              🎲 Tabuleiro Multiplayer
            </h1>
            <p className="text-lg text-muted-foreground">
              Jogo de tabuleiro online inspirado no Jogo da Vida
            </p>
          </div>
          
          <GameSetup onStartGame={handleStartGame} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🎲 Tabuleiro Multiplayer</h1>
            <p className="text-muted-foreground">Partida em andamento</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetGame} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Nova Partida
            </Button>
          </div>
        </div>

        {/* Game Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Game Board - Center */}
          <div className="xl:col-span-8 space-y-6">
            <GameBoard 
              players={players}
              currentPlayer={currentPlayer}
            />
            
            {/* Dice Roller */}
            <Card className="bg-gradient-card border-card/20">
              <CardHeader>
                <CardTitle className="text-center text-card-foreground">
                  Controles do Jogo
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <DiceRoller
                  onRoll={handleDiceRoll}
                  disabled={isRolling}
                  isRolling={isRolling}
                />
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="xl:col-span-4 space-y-6">
            <PlayerPanel 
              players={players}
              currentPlayer={currentPlayer}
              gameStats={gameStats}
            />
            
            <GameFeed events={gameEvents} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>🚀 Pronto para migração 3D • GitHub exportável • Supabase ready</p>
        </div>
      </div>
    </div>
  );
};

export default Index;