import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sword, Shield, Zap, Wind } from "lucide-react";

interface Player {
  id: number;
  name: string;
  avatar: string;
  credits: number;
}

interface StrategicBattleProps {
  player1: Player;
  player2: Player;
  onComplete: (winnerId: number, player1HP: number, player2HP: number) => void;
}

type BattleAction = 'heavy_attack' | 'quick_attack' | 'defend' | 'dodge';

interface ActionChoice {
  id: BattleAction;
  name: string;
  icon: React.ReactNode;
  description: string;
  damage: string;
}

const StrategicBattle = ({ player1, player2, onComplete }: StrategicBattleProps) => {
  const [player1HP, setPlayer1HP] = useState(100);
  const [player2HP, setPlayer2HP] = useState(100);
  const [currentRound, setCurrentRound] = useState(1);
  const [player1Action, setPlayer1Action] = useState<BattleAction | null>(null);
  const [player2Action, setPlayer2Action] = useState<BattleAction | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [roundResult, setRoundResult] = useState<string | null>(null);

  const actions: ActionChoice[] = [
    {
      id: 'heavy_attack',
      name: 'Ataque Forte',
      icon: <Sword className="w-5 h-5" />,
      description: 'Alto dano, lento',
      damage: '30-40'
    },
    {
      id: 'quick_attack',
      name: 'Ataque Rápido',
      icon: <Zap className="w-5 h-5" />,
      description: 'Dano médio, rápido',
      damage: '15-25'
    },
    {
      id: 'defend',
      name: 'Defesa',
      icon: <Shield className="w-5 h-5" />,
      description: 'Reduz dano em 50%',
      damage: 'Proteção'
    },
    {
      id: 'dodge',
      name: 'Esquiva',
      icon: <Wind className="w-5 h-5" />,
      description: 'Evita ataques pesados',
      damage: '60% chance'
    }
  ];

  useEffect(() => {
    if (player1Action && player2Action) {
      processRound();
    }
  }, [player1Action, player2Action]);

  const calculateDamage = (action: BattleAction, isDefending: boolean): number => {
    let baseDamage = 0;
    
    switch (action) {
      case 'heavy_attack':
        baseDamage = Math.floor(Math.random() * 11) + 30; // 30-40
        break;
      case 'quick_attack':
        baseDamage = Math.floor(Math.random() * 11) + 15; // 15-25
        break;
      default:
        baseDamage = 0;
    }

    return isDefending ? Math.floor(baseDamage * 0.5) : baseDamage;
  };

  const processRound = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    let p1Damage = 0;
    let p2Damage = 0;
    let result = '';

    // Processar ações
    const p1Defending = player1Action === 'defend';
    const p2Defending = player2Action === 'defend';
    const p1Dodging = player1Action === 'dodge';
    const p2Dodging = player2Action === 'dodge';

    // Player 2 ataca Player 1
    if (player2Action === 'heavy_attack' || player2Action === 'quick_attack') {
      if (p1Dodging && player2Action === 'heavy_attack' && Math.random() < 0.6) {
        result += `${player1.name} esquivou do ataque pesado!\n`;
      } else {
        p1Damage = calculateDamage(player2Action, p1Defending);
        result += `${player2.name} causou ${p1Damage} de dano em ${player1.name}!\n`;
      }
    }

    // Player 1 ataca Player 2
    if (player1Action === 'heavy_attack' || player1Action === 'quick_attack') {
      if (p2Dodging && player1Action === 'heavy_attack' && Math.random() < 0.6) {
        result += `${player2.name} esquivou do ataque pesado!\n`;
      } else {
        p2Damage = calculateDamage(player1Action, p2Defending);
        result += `${player1.name} causou ${p2Damage} de dano em ${player2.name}!\n`;
      }
    }

    // Atualizar HP
    const newP1HP = Math.max(0, player1HP - p1Damage);
    const newP2HP = Math.max(0, player2HP - p2Damage);
    
    setPlayer1HP(newP1HP);
    setPlayer2HP(newP2HP);
    setRoundResult(result);
    setBattleLog(prev => [...prev, `Round ${currentRound}: ${result}`]);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verificar fim da batalha
    if (newP1HP <= 0 || newP2HP <= 0 || currentRound >= 3) {
      const winner = newP1HP > newP2HP ? player1.id : player2.id;
      onComplete(winner, newP1HP, newP2HP);
    } else {
      setCurrentRound(currentRound + 1);
      setPlayer1Action(null);
      setPlayer2Action(null);
      setRoundResult(null);
      setIsProcessing(false);
    }
  };

  const handlePlayer2Action = () => {
    // IA escolhe ação aleatória
    const randomAction = actions[Math.floor(Math.random() * actions.length)].id;
    setPlayer2Action(randomAction);
  };

  useEffect(() => {
    if (player1Action && !player2Action) {
      setTimeout(() => handlePlayer2Action(), 800);
    }
  }, [player1Action]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">⚔️ Batalha Estratégica!</h2>
        <Badge variant="outline" className="text-lg">
          Round {currentRound}/3
        </Badge>
      </div>

      {/* Battle Arena */}
      <div className="grid grid-cols-2 gap-4">
        {/* Player 1 */}
        <Card className="p-4 border-2 border-blue-500">
          <div className="text-center mb-2">
            <div className="text-4xl mb-2">{player1.avatar}</div>
            <h3 className="font-bold">{player1.name}</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>HP:</span>
              <span className="font-bold">{player1HP}/100</span>
            </div>
            <Progress value={player1HP} className="h-3" />
          </div>
          {player1Action && (
            <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900 rounded text-center">
              <Badge>Ação escolhida!</Badge>
            </div>
          )}
        </Card>

        {/* Player 2 */}
        <Card className="p-4 border-2 border-red-500">
          <div className="text-center mb-2">
            <div className="text-4xl mb-2">{player2.avatar}</div>
            <h3 className="font-bold">{player2.name}</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>HP:</span>
              <span className="font-bold">{player2HP}/100</span>
            </div>
            <Progress value={player2HP} className="h-3" />
          </div>
          {player2Action && (
            <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 rounded text-center">
              <Badge>Ação escolhida!</Badge>
            </div>
          )}
        </Card>
      </div>

      {/* Round Result */}
      {roundResult && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-500">
          <p className="text-sm whitespace-pre-line text-center">{roundResult}</p>
        </Card>
      )}

      {/* Action Selection */}
      {!isProcessing && !player1Action && (
        <div className="space-y-2">
          <p className="text-center font-semibold">Escolha sua ação:</p>
          <div className="grid grid-cols-2 gap-2">
            {actions.map(action => (
              <Button
                key={action.id}
                onClick={() => setPlayer1Action(action.id)}
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1"
              >
                {action.icon}
                <span className="font-bold text-sm">{action.name}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
                <Badge variant="secondary" className="text-xs">{action.damage}</Badge>
              </Button>
            ))}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-4">
          <div className="animate-pulse text-lg font-semibold">
            Processando round...
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategicBattle;

