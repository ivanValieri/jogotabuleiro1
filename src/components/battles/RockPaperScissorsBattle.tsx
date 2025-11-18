import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Player {
  id: number;
  name: string;
  avatar: string;
  credits: number;
}

type Choice = 'sword' | 'bow' | 'shield';

interface RockPaperScissorsBattleProps {
  player1: Player;
  player2: Player;
  onComplete: (winnerId: number, player1HP: number, player2HP: number) => void;
}

const RockPaperScissorsBattle = ({ player1, player2, onComplete }: RockPaperScissorsBattleProps) => {
  const [player1HP, setPlayer1HP] = useState(100);
  const [player2HP, setPlayer2HP] = useState(100);
  const [currentRound, setCurrentRound] = useState(1);
  const [player1Choice, setPlayer1Choice] = useState<Choice | null>(null);
  const [player2Choice, setPlayer2Choice] = useState<Choice | null>(null);
  const [roundResult, setRoundResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const choices = [
    { id: 'sword' as Choice, name: 'Espada', emoji: '🗡️', beats: 'bow' },
    { id: 'bow' as Choice, name: 'Arco', emoji: '🏹', beats: 'shield' },
    { id: 'shield' as Choice, name: 'Escudo', emoji: '🛡️', beats: 'sword' }
  ];

  useEffect(() => {
    if (player1Choice && player2Choice) {
      processRound();
    }
  }, [player1Choice, player2Choice]);

  const handlePlayer1Choice = (choice: Choice) => {
    if (isProcessing || player1Choice) return;
    setPlayer1Choice(choice);
  };

  const handlePlayer2Choice = () => {
    const randomChoice = choices[Math.floor(Math.random() * choices.length)].id;
    setPlayer2Choice(randomChoice);
  };

  useEffect(() => {
    if (player1Choice && !player2Choice) {
      setTimeout(() => handlePlayer2Choice(), 800);
    }
  }, [player1Choice]);

  const processRound = async () => {
    if (!player1Choice || !player2Choice) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const p1ChoiceData = choices.find(c => c.id === player1Choice);
    const p2ChoiceData = choices.find(c => c.id === player2Choice);

    let result = '';
    const baseDamage = 30;

    if (player1Choice === player2Choice) {
      result = `Empate! Ambos escolheram ${p1ChoiceData?.name}!`;
    } else if (p1ChoiceData?.beats === player2Choice) {
      const newHP = Math.max(0, player2HP - baseDamage);
      setPlayer2HP(newHP);
      result = `${player1.name} venceu! ${p1ChoiceData.name} ${p1ChoiceData.emoji} vence ${p2ChoiceData?.name} ${p2ChoiceData?.emoji}! ${baseDamage} de dano!`;
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (newHP <= 0 || currentRound >= 3) {
        onComplete(player1.id, player1HP, newHP);
        return;
      }
    } else {
      const newHP = Math.max(0, player1HP - baseDamage);
      setPlayer1HP(newHP);
      result = `${player2.name} venceu! ${p2ChoiceData?.name} ${p2ChoiceData?.emoji} vence ${p1ChoiceData?.name} ${p1ChoiceData?.emoji}! ${baseDamage} de dano!`;
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (newHP <= 0 || currentRound >= 3) {
        onComplete(player2.id, newHP, player2HP);
        return;
      }
    }

    setRoundResult(result);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Próximo round
    setCurrentRound(currentRound + 1);
    setPlayer1Choice(null);
    setPlayer2Choice(null);
    setRoundResult(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">⚔️ Duelo Clássico!</h2>
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
          {player1Choice && (
            <div className="mt-3 text-center">
              <div className="text-5xl">
                {choices.find(c => c.id === player1Choice)?.emoji}
              </div>
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
          {player2Choice && (
            <div className="mt-3 text-center">
              <div className="text-5xl">
                {choices.find(c => c.id === player2Choice)?.emoji}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Round Result */}
      {roundResult && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-500">
          <p className="text-center font-semibold">{roundResult}</p>
        </Card>
      )}

      {/* Choice Selection */}
      {!isProcessing && !player1Choice && (
        <div className="space-y-2">
          <p className="text-center font-semibold">Escolha sua arma:</p>
          <div className="grid grid-cols-3 gap-2">
            {choices.map(choice => (
              <Button
                key={choice.id}
                onClick={() => handlePlayer1Choice(choice.id)}
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
              >
                <span className="text-4xl">{choice.emoji}</span>
                <span className="font-bold text-sm">{choice.name}</span>
              </Button>
            ))}
          </div>
          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>🗡️ Espada vence 🏹 Arco (corpo a corpo)</p>
            <p>🏹 Arco vence 🛡️ Escudo (flecha passa)</p>
            <p>🛡️ Escudo vence 🗡️ Espada (bloqueia)</p>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-4">
          <div className="animate-pulse text-lg font-semibold">
            Decidindo vencedor...
          </div>
        </div>
      )}
    </div>
  );
};

export default RockPaperScissorsBattle;

