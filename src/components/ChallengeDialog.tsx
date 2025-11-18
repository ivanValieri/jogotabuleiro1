import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sword, Shield, Zap, Dice6 } from "lucide-react";
import { Player } from "@/components/GameBoard";

interface ChallengeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  challenger: Player;
  availablePlayers: Player[];
  onBattle: (opponent: Player, result: BattleResult) => void;
}

interface BattleResult {
  winner: Player;
  loser: Player;
  winnerReward: number;
  loserPenalty: number;
  battleLog: string[];
}

interface PlayerStats {
  strength: number;
  defense: number;
  agility: number;
  luck: number;
}

const ChallengeDialog = ({ isOpen, onClose, challenger, availablePlayers, onBattle }: ChallengeDialogProps) => {
  const [selectedOpponent, setSelectedOpponent] = useState<Player | null>(null);
  const [battlePhase, setBattlePhase] = useState<'selection' | 'battle' | 'result'>('selection');
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const generatePlayerStats = (player: Player): PlayerStats => {
    // Gerar atributos baseados no player (usando ID como seed para consistência)
    const seed = player.id * 1000;
    return {
      strength: 50 + Math.floor((Math.sin(seed) * 0.5 + 0.5) * 30),
      defense: 50 + Math.floor((Math.sin(seed + 1) * 0.5 + 0.5) * 30),
      agility: 50 + Math.floor((Math.sin(seed + 2) * 0.5 + 0.5) * 30),
      luck: 50 + Math.floor((Math.sin(seed + 3) * 0.5 + 0.5) * 30),
    };
  };

  const simulateBattle = (player1: Player, player2: Player): BattleResult => {
    const stats1 = generatePlayerStats(player1);
    const stats2 = generatePlayerStats(player2);
    const log: string[] = [];

    log.push(`🥊 ${player1.name} vs ${player2.name} - Batalha iniciada!`);
    log.push(`${player1.name}: STR:${stats1.strength} DEF:${stats1.defense} AGI:${stats1.agility} LUCK:${stats1.luck}`);
    log.push(`${player2.name}: STR:${stats2.strength} DEF:${stats2.defense} AGI:${stats2.agility} LUCK:${stats2.luck}`);

    // Três rounds de batalha
    let player1Score = 0;
    let player2Score = 0;

    // Round 1: Força vs Defesa
    const roll1_1 = Math.floor(Math.random() * 20) + 1;
    const roll1_2 = Math.floor(Math.random() * 20) + 1;
    const power1 = stats1.strength + roll1_1;
    const power2 = stats2.defense + roll1_2;
    
    if (power1 > power2) {
      player1Score++;
      log.push(`⚔️ Round 1: ${player1.name} ataque (${stats1.strength}+${roll1_1}=${power1}) > ${player2.name} defesa (${stats2.defense}+${roll1_2}=${power2})`);
    } else {
      player2Score++;
      log.push(`🛡️ Round 1: ${player2.name} defesa (${stats2.defense}+${roll1_2}=${power2}) ≥ ${player1.name} ataque (${stats1.strength}+${roll1_1}=${power1})`);
    }

    // Round 2: Agilidade
    const roll2_1 = Math.floor(Math.random() * 20) + 1;
    const roll2_2 = Math.floor(Math.random() * 20) + 1;
    const speed1 = stats1.agility + roll2_1;
    const speed2 = stats2.agility + roll2_2;
    
    if (speed1 > speed2) {
      player1Score++;
      log.push(`💨 Round 2: ${player1.name} agilidade (${stats1.agility}+${roll2_1}=${speed1}) > ${player2.name} (${stats2.agility}+${roll2_2}=${speed2})`);
    } else {
      player2Score++;
      log.push(`💨 Round 2: ${player2.name} agilidade (${stats2.agility}+${roll2_2}=${speed2}) ≥ ${player1.name} (${stats1.agility}+${roll2_1}=${speed1})`);
    }

    // Round 3: Sorte (decisivo se empate)
    const roll3_1 = Math.floor(Math.random() * 20) + 1;
    const roll3_2 = Math.floor(Math.random() * 20) + 1;
    const luck1 = stats1.luck + roll3_1;
    const luck2 = stats2.luck + roll3_2;
    
    if (luck1 > luck2) {
      player1Score++;
      log.push(`🍀 Round 3: ${player1.name} sorte (${stats1.luck}+${roll3_1}=${luck1}) > ${player2.name} (${stats2.luck}+${roll3_2}=${luck2})`);
    } else {
      player2Score++;
      log.push(`🍀 Round 3: ${player2.name} sorte (${stats2.luck}+${roll3_2}=${luck2}) ≥ ${player1.name} (${stats1.luck}+${roll3_1}=${luck1})`);
    }

    const winner = player1Score > player2Score ? player1 : player2;
    const loser = player1Score > player2Score ? player2 : player1;
    
    log.push(`🏆 ${winner.name} venceu ${player1Score > player2Score ? player1Score : player2Score} x ${player1Score > player2Score ? player2Score : player1Score}!`);

    return {
      winner,
      loser,
      winnerReward: 300,
      loserPenalty: 100,
      battleLog: log
    };
  };

  const handleSelectOpponent = (opponent: Player) => {
    setSelectedOpponent(opponent);
  };

  const handleStartBattle = () => {
    if (!selectedOpponent) return;
    
    setBattlePhase('battle');
    
    // Simular batalha com delay para dramatismo
    setTimeout(() => {
      const result = simulateBattle(challenger, selectedOpponent);
      setBattleResult(result);
      setBattleLog(result.battleLog);
      setBattlePhase('result');
    }, 1000);
  };

  const handleFinishBattle = () => {
    if (battleResult) {
      onBattle(selectedOpponent!, battleResult);
    }
    onClose();
    setBattlePhase('selection');
    setSelectedOpponent(null);
    setBattleResult(null);
    setBattleLog([]);
  };

  const renderSelectionPhase = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-orange-600 mb-2">
          🥊 Casa de Desafio!
        </h3>
        <p className="text-muted-foreground">
          {challenger.name}, escolha um oponente para batalhar!
        </p>
      </div>

      <div className="grid gap-3">
        {availablePlayers.map((player) => {
          const stats = generatePlayerStats(player);
          return (
            <Card 
              key={player.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedOpponent?.id === player.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectOpponent(player)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {player.credits.toLocaleString()} créditos
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      <Sword className="w-3 h-3 mr-1" />
                      {stats.strength}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      {stats.defense}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      {stats.agility}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Dice6 className="w-3 h-3 mr-1" />
                      {stats.luck}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={handleStartBattle}
          disabled={!selectedOpponent}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Iniciar Batalha
        </Button>
      </div>
    </div>
  );

  const renderBattlePhase = () => (
    <div className="text-center space-y-4">
      <div className="animate-pulse">
        <h3 className="text-xl font-bold text-orange-600">⚔️ Batalha em Andamento!</h3>
        <p className="text-muted-foreground">
          {challenger.name} vs {selectedOpponent?.name}
        </p>
      </div>
      <div className="animate-spin mx-auto w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full"></div>
    </div>
  );

  const renderResultPhase = () => (
    <div className="space-y-4">
      {battleResult && (
        <>
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-600 mb-2">
              🏆 {battleResult.winner.name} Venceu!
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Vencedor: +{battleResult.winnerReward} créditos</p>
              <p>Perdedor: -{battleResult.loserPenalty} créditos</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">📝 Log da Batalha</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
                {battleLog.map((log, index) => (
                  <div key={index} className="font-mono text-xs">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleFinishBattle} className="w-full">
            Finalizar Batalha
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {battlePhase === 'selection' && '🥊 Casa de Desafio'}
            {battlePhase === 'battle' && '⚔️ Batalha'}
            {battlePhase === 'result' && '🏆 Resultado'}
          </DialogTitle>
        </DialogHeader>

        {battlePhase === 'selection' && renderSelectionPhase()}
        {battlePhase === 'battle' && renderBattlePhase()}
        {battlePhase === 'result' && renderResultPhase()}
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeDialog;