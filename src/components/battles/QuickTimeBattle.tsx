import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Zap } from "lucide-react";

interface Player {
  id: number;
  name: string;
  avatar: string;
  credits: number;
}

interface QuickTimeBattleProps {
  player1: Player;
  player2: Player;
  onComplete: (winnerId: number, player1HP: number, player2HP: number) => void;
}

const QuickTimeBattle = ({ player1, player2, onComplete }: QuickTimeBattleProps) => {
  const [player1HP, setPlayer1HP] = useState(100);
  const [player2HP, setPlayer2HP] = useState(100);
  const [currentRound, setCurrentRound] = useState(1);
  const [showTarget, setShowTarget] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [countdown, setCountdown] = useState(3);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [player1Clicked, setPlayer1Clicked] = useState(false);
  const [player2Clicked, setPlayer2Clicked] = useState(false);
  const [player1Ready, setPlayer1Ready] = useState(false);
  const [player2Ready, setPlayer2Ready] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // Não iniciar automaticamente
  }, []);

  useEffect(() => {
    // Iniciar quando ambos estiverem prontos
    if (player1Ready && player2Ready && !gameStarted) {
      setGameStarted(true);
      setTimeout(() => {
        startRound();
      }, 500);
    }
  }, [player1Ready, player2Ready, gameStarted]);

  const handlePlayer1Ready = () => {
    setPlayer1Ready(true);
  };

  const startRound = async () => {
    setIsProcessing(true);
    setShowTarget(false);
    setPlayer1Clicked(false);
    setPlayer2Clicked(false);
    setRoundWinner(null);

    // Countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Mostrar alvo em posição aleatória
    const newX = Math.random() * 60 + 20;
    const newY = Math.random() * 60 + 20;
    setTargetPosition({ x: newX, y: newY });
    setShowTarget(true);
    setIsProcessing(false);

    // IA reage após um delay aleatório
    const aiReactionTime = Math.random() * 800 + 500; // 500-1300ms
    const aiTimeout = setTimeout(() => {
      handlePlayer2Click();
    }, aiReactionTime);

    // Limpar timeout se o jogador clicar primeiro
    const checkInterval = setInterval(() => {
      if (player1Clicked || roundWinner) {
        clearTimeout(aiTimeout);
        clearInterval(checkInterval);
      }
    }, 100);
  };

  const handlePlayer1Click = () => {
    if (!showTarget || player1Clicked) return;
    setPlayer1Clicked(true);

    if (!player2Clicked) {
      // Player 1 venceu
      processRoundResult(player1.id);
    }
  };

  const handlePlayer2Click = () => {
    if (!showTarget || player2Clicked) return;
    setPlayer2Clicked(true);

    if (!player1Clicked) {
      // Player 2 venceu
      processRoundResult(player2.id);
    }
  };

  const processRoundResult = async (winnerId: number) => {
    setShowTarget(false);
    setIsProcessing(true);

    const damage = Math.floor(Math.random() * 16) + 25; // 25-40 dano
    
    let newP1HP = player1HP;
    let newP2HP = player2HP;
    
    if (winnerId === player1.id) {
      newP2HP = Math.max(0, player2HP - damage);
      setPlayer2HP(newP2HP);
      setRoundWinner(`${player1.name} acertou primeiro! ${damage} de dano!`);
    } else {
      newP1HP = Math.max(0, player1HP - damage);
      setPlayer1HP(newP1HP);
      setRoundWinner(`${player2.name} acertou primeiro! ${damage} de dano!`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Verificar fim da batalha
    if (newP1HP <= 0 || newP2HP <= 0 || currentRound >= 3) {
      const finalWinnerId = newP1HP > newP2HP ? player1.id : player2.id;
      onComplete(finalWinnerId, newP1HP, newP2HP);
      return;
    }
    
    // Próximo round
    setCurrentRound(prev => prev + 1);
    await new Promise(resolve => setTimeout(resolve, 500));
    startRound();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">⚡ Duelo de Reflexos!</h2>
        <Badge variant="outline" className="text-lg">
          Round {currentRound}/3
        </Badge>
      </div>

      {/* Instructions */}
      {!gameStarted && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-500">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">📋 Como Jogar</h3>
              <div className="space-y-2 text-left text-sm text-black">
                <p>🎯 Um alvo vermelho aparecerá na tela</p>
                <p>⚡ <strong>CLIQUE NO ALVO</strong> o mais rápido possível!</p>
                <p>🏆 Quem clicar primeiro ganha o round e causa dano</p>
                <p>🎮 Vence quem reduzir o HP do oponente a 0 ou vencer 2 de 3 rounds</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handlePlayer1Ready}
                disabled={player1Ready}
                size="lg"
                className="w-48"
              >
                {player1Ready ? '✓ Pronto!' : 'Estou Pronto!'}
              </Button>
              {player2Ready && (
                <Badge variant="outline" className="text-sm">
                  🤖 {player2.name} está pronto!
                </Badge>
              )}
            </div>
            {player1Ready && !player2Ready && (
              <p className="text-center text-sm text-muted-foreground animate-pulse">
                Aguardando {player2.name}...
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Auto-ready para IA */}
      {!player2Ready && player1Ready && (
        <div style={{ display: 'none' }}>
          {setTimeout(() => setPlayer2Ready(true), 1000)}
        </div>
      )}

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
          {player1Clicked && (
            <Badge className="mt-2 w-full justify-center" variant="default">
              Clicou!
            </Badge>
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
          {player2Clicked && (
            <Badge className="mt-2 w-full justify-center" variant="destructive">
              Clicou!
            </Badge>
          )}
        </Card>
      </div>

      {/* Battle Area */}
      {gameStarted && (
        <>
          <Card className="relative h-64 bg-gradient-to-br from-slate-900 to-slate-800 border-2 overflow-hidden">
            {!showTarget && countdown > 0 && isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="text-6xl font-bold text-white animate-pulse">
                  {countdown}
                </div>
                <p className="text-white text-lg">Prepare-se...</p>
              </div>
            )}

            {showTarget && (
              <button
                onClick={handlePlayer1Click}
                disabled={player1Clicked}
                className="absolute w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-2xl border-4 border-white animate-pulse"
                style={{
                  left: `${targetPosition.x}%`,
                  top: `${targetPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10
                }}
              >
                <Target className="w-10 h-10 text-white" />
              </button>
            )}

            {!showTarget && countdown === 0 && !roundWinner && isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-6 h-6 animate-bounce" />
                  Preparando alvo...
                </div>
              </div>
            )}

            {roundWinner && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-2xl font-bold text-white text-center px-4">
                  {roundWinner}
                </div>
              </div>
            )}
          </Card>

          {showTarget && !player1Clicked && !roundWinner && (
            <Card className="p-3 bg-green-100 dark:bg-green-950 border-green-500 animate-pulse">
              <p className="text-center font-bold text-green-800 dark:text-green-200">
                🎯 CLIQUE NO ALVO VERMELHO AGORA!
              </p>
            </Card>
          )}

          {/* Result */}
          {roundWinner && (
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-500">
              <p className="text-center font-semibold">{roundWinner}</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default QuickTimeBattle;

