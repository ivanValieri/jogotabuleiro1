import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StrategicBattle from "./StrategicBattle";
import QuickTimeBattle from "./QuickTimeBattle";
import CardBattle from "./CardBattle";
import RockPaperScissorsBattle from "./RockPaperScissorsBattle";
import RhythmBattle from "./RhythmBattle";

interface Player {
  id: number;
  name: string;
  avatar: string;
  credits: number;
}

interface BattleArenaProps {
  isOpen: boolean;
  onClose: () => void;
  player1: Player;
  player2: Player;
  onBattleComplete: (winnerId: number, loserDamage: number) => void;
}

type BattleType = 'strategic' | 'quicktime' | 'card' | 'rps' | 'rhythm';

const battleInfo: Record<BattleType, { name: string; description: string; icon: string }> = {
  strategic: {
    name: 'Batalha Estratégica',
    description: 'Escolha entre ataque, defesa e esquiva',
    icon: '⚔️'
  },
  quicktime: {
    name: 'Duelo de Reflexos',
    description: 'Clique no alvo o mais rápido possível',
    icon: '⚡'
  },
  card: {
    name: 'Duelo de Cartas',
    description: 'Escolha cartas com valores de atributos',
    icon: '🃏'
  },
  rps: {
    name: 'Duelo Clássico',
    description: 'Espada, Arco ou Escudo',
    icon: '🗡️'
  },
  rhythm: {
    name: 'Duelo de Ritmo',
    description: 'Acerte os alvos no momento certo',
    icon: '🎵'
  }
};

const ALL_BATTLE_TYPES: BattleType[] = ['strategic', 'quicktime', 'card', 'rps', 'rhythm'];

const BattleArena = ({ isOpen, onClose, player1, player2, onBattleComplete }: BattleArenaProps) => {
  const [battleType, setBattleType] = useState<BattleType | null>(null);
  const [isRevealing, setIsRevealing] = useState(true);
  const [showBattle, setShowBattle] = useState(false);
  const [remainingTypes, setRemainingTypes] = useState<BattleType[]>(ALL_BATTLE_TYPES);

  const pickBattleType = () => {
    setRemainingTypes((prev) => {
      const pool = prev.length > 0 ? prev : ALL_BATTLE_TYPES;
      const choice = pool[Math.floor(Math.random() * pool.length)];
      setBattleType(choice);
      return pool.filter((type) => type !== choice);
    });
  };

  useEffect(() => {
    if (isOpen) {
      pickBattleType();
      setIsRevealing(true);
      setShowBattle(false);

      // Revelar tipo de batalha
      setTimeout(() => {
        setIsRevealing(false);
        setTimeout(() => {
          setShowBattle(true);
        }, 500);
      }, 2500);
    } else {
      setBattleType(null);
    }
  }, [isOpen]);

  const handleBattleComplete = (winnerId: number, player1HP: number, player2HP: number) => {
    const loserDamage = winnerId === player1.id ? 100 - player2HP : 100 - player1HP;
    
    setTimeout(() => {
      onBattleComplete(winnerId, loserDamage);
      onClose();
    }, 2000);
  };

  if (!battleType) return null;

  const info = battleInfo[battleType];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {isRevealing && (
          <div className="py-12 text-center space-y-6">
            <div className="text-6xl animate-bounce">{info.icon}</div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">{info.name}</h2>
              <p className="text-lg text-muted-foreground">{info.description}</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Preparando batalha...
            </Badge>
          </div>
        )}

        {showBattle && (
          <div className="py-4">
            {battleType === 'strategic' && (
              <StrategicBattle
                player1={player1}
                player2={player2}
                onComplete={handleBattleComplete}
              />
            )}
            {battleType === 'quicktime' && (
              <QuickTimeBattle
                player1={player1}
                player2={player2}
                onComplete={handleBattleComplete}
              />
            )}
            {battleType === 'card' && (
              <CardBattle
                player1={player1}
                player2={player2}
                onComplete={handleBattleComplete}
              />
            )}
            {battleType === 'rps' && (
              <RockPaperScissorsBattle
                player1={player1}
                player2={player2}
                onComplete={handleBattleComplete}
              />
            )}
            {battleType === 'rhythm' && (
              <RhythmBattle
                player1={player1}
                player2={player2}
                onComplete={handleBattleComplete}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BattleArena;

