import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sword, Shield, Zap } from "lucide-react";

interface Player {
  id: number;
  name: string;
  avatar: string;
  credits: number;
}

interface BattleCard {
  id: string;
  type: 'attack' | 'defense' | 'agility';
  value: number;
  icon: React.ReactNode;
  name: string;
}

interface CardBattleProps {
  player1: Player;
  player2: Player;
  onComplete: (winnerId: number, player1HP: number, player2HP: number) => void;
}

const CardBattle = ({ player1, player2, onComplete }: CardBattleProps) => {
  const [player1HP, setPlayer1HP] = useState(100);
  const [player2HP, setPlayer2HP] = useState(100);
  const [currentRound, setCurrentRound] = useState(1);
  const [player1Cards, setPlayer1Cards] = useState<BattleCard[]>([]);
  const [player2Cards, setPlayer2Cards] = useState<BattleCard[]>([]);
  const [player1SelectedCard, setPlayer1SelectedCard] = useState<BattleCard | null>(null);
  const [player2SelectedCard, setPlayer2SelectedCard] = useState<BattleCard | null>(null);
  const [roundResult, setRoundResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    initializeCards();
  }, []);

  const generateCards = (): BattleCard[] => {
    return [
      {
        id: 'attack',
        type: 'attack',
        value: Math.floor(Math.random() * 21) + 70, // 70-90
        icon: <Sword className="w-6 h-6" />,
        name: 'Ataque'
      },
      {
        id: 'defense',
        type: 'defense',
        value: Math.floor(Math.random() * 21) + 70, // 70-90
        icon: <Shield className="w-6 h-6" />,
        name: 'Defesa'
      },
      {
        id: 'agility',
        type: 'agility',
        value: Math.floor(Math.random() * 21) + 70, // 70-90
        icon: <Zap className="w-6 h-6" />,
        name: 'Agilidade'
      }
    ];
  };

  const initializeCards = () => {
    setPlayer1Cards(generateCards());
    setPlayer2Cards(generateCards());
  };

  useEffect(() => {
    if (player1SelectedCard && player2SelectedCard) {
      processRound();
    }
  }, [player1SelectedCard, player2SelectedCard]);

  const handlePlayer1CardSelect = (card: BattleCard) => {
    if (isProcessing || player1SelectedCard) return;
    setPlayer1SelectedCard(card);
  };

  const handlePlayer2CardSelect = () => {
    // IA escolhe carta aleatória disponível
    const availableCards = player2Cards.filter(card => card.id !== player2SelectedCard?.id);
    if (availableCards.length > 0) {
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      setPlayer2SelectedCard(randomCard);
    }
  };

  useEffect(() => {
    if (player1SelectedCard && !player2SelectedCard) {
      setTimeout(() => handlePlayer2CardSelect(), 1000);
    }
  }, [player1SelectedCard]);

  const processRound = async () => {
    if (!player1SelectedCard || !player2SelectedCard) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const p1Value = player1SelectedCard.value;
    const p2Value = player2SelectedCard.value;

    let result = '';
    let damage = 0;

    if (p1Value > p2Value) {
      damage = Math.floor((p1Value - p2Value) / 2);
      const newHP = Math.max(0, player2HP - damage);
      setPlayer2HP(newHP);
      result = `${player1.name} venceu! ${player1SelectedCard.name} (${p1Value}) > ${player2SelectedCard.name} (${p2Value}). ${damage} de dano!`;
    } else if (p2Value > p1Value) {
      damage = Math.floor((p2Value - p1Value) / 2);
      const newHP = Math.max(0, player1HP - damage);
      setPlayer1HP(newHP);
      result = `${player2.name} venceu! ${player2SelectedCard.name} (${p2Value}) > ${player1SelectedCard.name} (${p1Value}). ${damage} de dano!`;
    } else {
      result = `Empate! Ambos escolheram cartas com valor ${p1Value}!`;
    }

    setRoundResult(result);

    // Remover cartas usadas
    setPlayer1Cards(prev => prev.filter(c => c.id !== player1SelectedCard.id));
    setPlayer2Cards(prev => prev.filter(c => c.id !== player2SelectedCard.id));

    await new Promise(resolve => setTimeout(resolve, 2500));

    // Verificar fim da batalha
    if (player1HP <= damage || player2HP <= damage || currentRound >= 3) {
      const winner = (player1HP - damage) > (player2HP - damage) ? player1.id : player2.id;
      onComplete(winner, Math.max(0, player1HP - (p2Value > p1Value ? damage : 0)), Math.max(0, player2HP - (p1Value > p2Value ? damage : 0)));
    } else {
      setCurrentRound(currentRound + 1);
      setPlayer1SelectedCard(null);
      setPlayer2SelectedCard(null);
      setRoundResult(null);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🃏 Duelo de Cartas!</h2>
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
        </Card>
      </div>

      {/* Selected Cards Display */}
      {(player1SelectedCard || player2SelectedCard) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            {player1SelectedCard ? (
              <Card className="p-4 bg-blue-100 dark:bg-blue-950">
                <div className="flex flex-col items-center gap-2">
                  {player1SelectedCard.icon}
                  <span className="font-bold">{player1SelectedCard.name}</span>
                  <Badge variant="default">{player1SelectedCard.value}</Badge>
                </div>
              </Card>
            ) : (
              <div className="text-sm text-muted-foreground">Escolhendo...</div>
            )}
          </div>
          <div className="text-center">
            {player2SelectedCard ? (
              <Card className="p-4 bg-red-100 dark:bg-red-950">
                <div className="flex flex-col items-center gap-2">
                  {player2SelectedCard.icon}
                  <span className="font-bold">{player2SelectedCard.name}</span>
                  <Badge variant="destructive">{player2SelectedCard.value}</Badge>
                </div>
              </Card>
            ) : (
              <div className="text-sm text-muted-foreground">Escolhendo...</div>
            )}
          </div>
        </div>
      )}

      {/* Round Result */}
      {roundResult && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-500">
          <p className="text-center font-semibold">{roundResult}</p>
        </Card>
      )}

      {/* Player 1 Cards */}
      {!isProcessing && !player1SelectedCard && player1Cards.length > 0 && (
        <div className="space-y-2">
          <p className="text-center font-semibold">Escolha sua carta:</p>
          <div className="grid grid-cols-3 gap-2">
            {player1Cards.map(card => (
              <Button
                key={card.id}
                onClick={() => handlePlayer1CardSelect(card)}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                {card.icon}
                <span className="font-bold text-sm">{card.name}</span>
                <Badge variant="secondary">{card.value}</Badge>
              </Button>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Maior valor vence! A diferença causa dano.
          </p>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-4">
          <div className="animate-pulse text-lg font-semibold">
            Comparando cartas...
          </div>
        </div>
      )}
    </div>
  );
};

export default CardBattle;

