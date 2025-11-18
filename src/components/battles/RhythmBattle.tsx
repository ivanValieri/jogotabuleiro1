import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Music } from "lucide-react";

interface Player {
  id: number;
  name: string;
  avatar: string;
  credits: number;
}

interface Target {
  id: number;
  position: number;
  hit: boolean;
  timing: 'perfect' | 'good' | 'miss' | null;
}

interface RhythmBattleProps {
  player1: Player;
  player2: Player;
  onComplete: (winnerId: number, player1HP: number, player2HP: number) => void;
}

const RhythmBattle = ({ player1, player2, onComplete }: RhythmBattleProps) => {
  const [player1HP, setPlayer1HP] = useState(100);
  const [player2HP, setPlayer2HP] = useState(100);
  const [currentRound, setCurrentRound] = useState(1);
  const [targets, setTargets] = useState<Target[]>([]);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [roundResult, setRoundResult] = useState<string | null>(null);
  const animationRef = useRef<number>();
  const [battleFinished, setBattleFinished] = useState(false);
  const roundRef = useRef(1);

  useEffect(() => {
    // iniciar primeira rodada
    startRound();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startRound = () => {
    if (battleFinished || roundRef.current > 3) return;
    // Criar 5 alvos em posições aleatórias
    const newTargets: Target[] = [];
    for (let i = 0; i < 5; i++) {
      newTargets.push({
        id: i,
        position: (i + 1) * 18, // 18%, 36%, 54%, 72%, 90%
        hit: false,
        timing: null
      });
    }
    setTargets(newTargets);
    setProgress(0);
    setIsPlaying(true);
    setCurrentRound(roundRef.current);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setRoundResult(null);
    
    // Simular pontuação da IA
    setTimeout(() => {
      const aiScore = Math.floor(Math.random() * 41) + 60; // 60-100
      setPlayer2Score(aiScore);
    }, 3500);

    startAnimation();
  };

  const startAnimation = () => {
    const duration = 4000; // 4 segundos
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / duration) * 100;

      if (newProgress >= 100) {
        setProgress(100);
        setIsPlaying(false);
        setTimeout(() => evaluateRound(), 500);
        return;
      }

      setProgress(newProgress);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleClick = () => {
    if (!isPlaying) return;

    const currentPos = progress;
    let bestTarget: Target | null = null;
    let bestDistance = Infinity;

    // Encontrar o alvo mais próximo não atingido
    targets.forEach(target => {
      if (!target.hit) {
        const distance = Math.abs(target.position - currentPos);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestTarget = target;
        }
      }
    });

    if (bestTarget) {
      let timing: 'perfect' | 'good' | 'miss' = 'miss';
      let points = 0;

      if (bestDistance < 3) {
        timing = 'perfect';
        points = 25;
      } else if (bestDistance < 7) {
        timing = 'good';
        points = 15;
      } else {
        timing = 'miss';
        points = 0;
      }

      setTargets(prev => prev.map(t => 
        t.id === bestTarget!.id ? { ...t, hit: true, timing } : t
      ));
      setPlayer1Score(prev => prev + points);
    }
  };

  const evaluateRound = async () => {
    if (battleFinished) return;
    setIsPlaying(false);

    await new Promise(resolve => setTimeout(resolve, 500));

    const p1Damage = Math.floor(player1Score / 3); // Até ~33 de dano
    const p2Damage = Math.floor(player2Score / 3);

    let result = '';
    let newP1HP = player1HP;
    let newP2HP = player2HP;

    if (player1Score > player2Score) {
      const damage = p1Damage;
      newP2HP = Math.max(0, player2HP - damage);
      setPlayer2HP(newP2HP);
      result = `${player1.name} teve melhor timing! Pontos: ${player1Score} vs ${player2Score}. ${damage} de dano!`;
    } else if (player2Score > player1Score) {
      const damage = p2Damage;
      newP1HP = Math.max(0, player1HP - damage);
      setPlayer1HP(newP1HP);
      result = `${player2.name} teve melhor timing! Pontos: ${player2Score} vs ${player1Score}. ${damage} de dano!`;
    } else {
      result = `Empate! Ambos: ${player1Score} pontos!`;
    }

    setRoundResult(result);
    await new Promise(resolve => setTimeout(resolve, 2500));

    // VERIFICAÇÃO CRÍTICA: Se já é o round 3 OU alguém zerou o HP, terminar a batalha
    if (roundRef.current >= 3 || newP1HP <= 0 || newP2HP <= 0) {
      // Determinar vencedor baseado no HP final
      // Em caso de empate no HP, ambos ficam com HP atual
      let finalWinnerId: number;
      
      if (newP1HP > newP2HP) {
        finalWinnerId = player1.id;
      } else if (newP2HP > newP1HP) {
        finalWinnerId = player2.id;
      } else {
        // Empate de HP: vence quem tiver mais HP (neste caso são iguais)
        // Então decidir por quem tem mais HP total ou sortear
        finalWinnerId = newP1HP >= newP2HP ? player1.id : player2.id;
      }
      
      setBattleFinished(true);
      onComplete(finalWinnerId, newP1HP, newP2HP);
      return;
    }

    // Continuar para o próximo round (apenas se ainda houver rounds)
    await new Promise(resolve => setTimeout(resolve, 500));
    roundRef.current = roundRef.current + 1;
    setTimeout(() => {
      startRound();
    }, 300);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🎵 Duelo de Ritmo!</h2>
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
            <div className="text-center">
              <Badge variant="default">Pontos: {player1Score}</Badge>
            </div>
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
            <div className="text-center">
              <Badge variant="destructive">Pontos: {player2Score}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Rhythm Game Area */}
      {isPlaying && (
        <Card className="relative h-32 bg-gradient-to-r from-purple-900 to-pink-900 overflow-hidden cursor-pointer"
              onClick={handleClick}>
          {/* Track line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/30 transform -translate-y-1/2" />
          
          {/* Targets */}
          {targets.map(target => (
            <div
              key={target.id}
              className="absolute top-1/2 transform -translate-y-1/2"
              style={{ left: `${target.position}%` }}
            >
              {!target.hit ? (
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                  <Music className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  target.timing === 'perfect' ? 'bg-green-500' :
                  target.timing === 'good' ? 'bg-blue-500' :
                  'bg-red-500'
                }`}>
                  <span className="text-white text-xs font-bold">
                    {target.timing === 'perfect' ? '★' :
                     target.timing === 'good' ? '✓' : '✗'}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Progress indicator */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
            style={{ left: `${progress}%` }}
          />
        </Card>
      )}

      {/* Instructions */}
      {isPlaying && (
        <p className="text-center text-sm font-semibold">
          Clique quando a linha branca estiver sobre os alvos! 🎯
        </p>
      )}

      {/* Round Result */}
      {roundResult && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-500">
          <p className="text-center font-semibold">{roundResult}</p>
        </Card>
      )}
    </div>
  );
};

export default RhythmBattle;

