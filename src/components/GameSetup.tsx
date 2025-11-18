import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Play, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Player } from "./GameBoard";

interface GameSetupProps {
  onStartGame: (players: Player[]) => void;
}

const GameSetup = ({ onStartGame }: GameSetupProps) => {
  const [players, setPlayers] = useState<Omit<Player, 'position'>[]>([
    { id: 1, name: "Jogador 1", color: "hsl(0 72% 51%)", avatar: "🚗", credits: 50000 },
    { id: 2, name: "Jogador 2", color: "hsl(221 83% 53%)", avatar: "🚲", credits: 50000 }
  ]);
  
  const [newPlayerName, setNewPlayerName] = useState("");

  const availableAvatars = ["🚗", "🚲", "🛵", "🚁", "🚀", "⭐", "🎯", "🎲"];
  const availableColors = [
    "hsl(0 72% 51%)",    // Red
    "hsl(221 83% 53%)",  // Blue
    "hsl(142 76% 36%)",  // Green
    "hsl(280 83% 57%)",  // Purple
  ];

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 4) {
      const usedAvatars = players.map(p => p.avatar);
      const availableAvatar = availableAvatars.find(a => !usedAvatars.includes(a)) || "🎮";
      
      const newPlayer = {
        id: Math.max(...players.map(p => p.id), 0) + 1,
        name: newPlayerName.trim(),
        color: availableColors[players.length] || availableColors[0],
        avatar: availableAvatar,
        credits: 50000
      };
      
      setPlayers([...players, newPlayer]);
      setNewPlayerName("");
    }
  };

  const removePlayer = (id: number) => {
    if (players.length > 2) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const updatePlayer = (id: number, field: 'name' | 'avatar', value: string) => {
    setPlayers(players.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const startGame = () => {
    const gamePlayersWithPositions: Player[] = players.map(p => ({
      ...p,
      position: 0
    }));
    onStartGame(gamePlayersWithPositions);
  };

  const canStartGame = players.length >= 2 && players.every(p => p.name.trim());

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-gradient-card border-card/20">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-card-foreground flex items-center justify-center gap-2">
            <Users className="w-6 h-6" />
            Configuração do Jogo
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Configure os jogadores antes de iniciar a partida
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Players */}
          <div className="space-y-3">
            <h3 className="font-semibold text-card-foreground flex items-center gap-2">
              Jogadores Cadastrados 
              <Badge variant="secondary">{players.length}/4</Badge>
            </h3>
            
            {players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border border-card/20"
              >
                {/* Avatar Selector */}
                <select
                  value={player.avatar}
                  onChange={(e) => updatePlayer(player.id, 'avatar', e.target.value)}
                  className="w-12 h-12 bg-transparent text-xl border-2 border-white rounded-lg text-center cursor-pointer"
                  style={{ backgroundColor: player.color }}
                >
                  {availableAvatars.map(avatar => (
                    <option key={avatar} value={avatar}>{avatar}</option>
                  ))}
                </select>
                
                {/* Name Input */}
                <Input
                  value={player.name}
                  onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                  placeholder="Nome do jogador"
                  className="flex-1"
                />
                
                {/* Color Indicator */}
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: player.color }}
                  title={`Cor do jogador ${index + 1}`}
                />
                
                {/* Remove Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removePlayer(player.id)}
                  disabled={players.length <= 2}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Player */}
          {players.length < 4 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-card-foreground">Adicionar Jogador</h3>
              <div className="flex gap-2">
                <Input
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Nome do novo jogador"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                />
                <Button
                  onClick={addPlayer}
                  disabled={!newPlayerName.trim()}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          )}

          {/* Game Rules */}
          <div className="bg-muted/20 p-4 rounded-lg border border-muted/40">
            <h3 className="font-semibold text-card-foreground mb-2">Regras Básicas</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Cada jogador começa na Casa 1</li>
              <li>• Lance o dado para mover seu avatar</li>
              <li>• O objetivo é completar voltas no tabuleiro</li>
              <li>• Mínimo 2 jogadores, máximo 4</li>
            </ul>
          </div>

          {/* Start Game Button */}
          <Button
            onClick={startGame}
            disabled={!canStartGame}
            size="lg"
            className="w-full text-lg py-6 flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5" />
            Iniciar Partida
          </Button>
          
          {!canStartGame && (
            <p className="text-center text-sm text-muted-foreground">
              {players.length < 2 
                ? "Adicione pelo menos 2 jogadores para começar" 
                : "Verifique se todos os jogadores têm nome"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GameSetup;