import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Player } from "./GameBoard";

interface PlayerPanelProps {
  players: Player[];
  currentPlayer: number;
  gameStats?: {
    totalRolls: number;
    gameStartTime: Date;
  };
}

const PlayerPanel = ({ players, currentPlayer, gameStats }: PlayerPanelProps) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-sm bg-gradient-card border-card/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <User className="w-5 h-5" />
          Jogadores ({players.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Players List */}
        {players.map((player, index) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-all duration-300",
              player.id === currentPlayer 
                ? "bg-primary/10 border-primary/30 shadow-glow" 
                : "bg-card/50 border-card/20 hover:bg-card/70"
            )}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                  "border-2 border-white shadow-md transition-transform duration-300",
                  player.id === currentPlayer ? "scale-110 animate-pulse" : ""
                )}
                style={{ backgroundColor: player.color }}
              >
                {player.avatar}
              </div>
              
              {/* Player Info */}
              <div>
                <p className={cn(
                  "font-semibold text-sm",
                  player.id === currentPlayer ? "text-primary" : "text-card-foreground"
                )}>
                  {player.name}
                </p>
                <p className="text-xs text-card-foreground/80 font-medium">
                  Casa {player.position + 1}
                </p>
                <p className="text-xs text-accent font-bold">
                  💰 {player.credits?.toLocaleString() || '50,000'}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col items-end gap-1">
              {player.id === currentPlayer && (
                <Badge variant="default" className="text-xs flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Sua vez
                </Badge>
              )}
              
              <Badge variant="outline" className="text-xs">
                Pos {player.position + 1}
              </Badge>
            </div>
          </div>
        ))}

        {/* Game Stats */}
        {gameStats && (
          <div className="pt-3 border-t border-card/20">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="space-y-1">
                <p className="text-xs text-card-foreground font-semibold">Jogadas</p>
                <p className="text-lg font-bold text-card-foreground">{gameStats.totalRolls}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-card-foreground font-semibold">Tempo</p>
                <p className="text-lg font-bold text-card-foreground">
                  {formatTime(gameStats.gameStartTime)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Player Indicator */}
        <div className="pt-2 text-center">
          <p className="text-xs text-card-foreground/90 font-medium">
            Vez de: {players.find(p => p.id === currentPlayer)?.name || "Nenhum"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerPanel;