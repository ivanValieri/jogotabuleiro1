import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LifeCard } from "@/types/lifeCards";
import { Player } from "@/components/GameBoard";

interface LifeCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  card: LifeCard | null;
  player: Player;
  onApplyEffect: (card: LifeCard, choice?: any) => void;
  availablePlayers?: Player[];
}

export const LifeCardDialog = ({ 
  isOpen, 
  onClose, 
  card, 
  player, 
  onApplyEffect,
  availablePlayers = []
}: LifeCardDialogProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  if (!card) return null;

  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'default';
      case 'negative': return 'destructive';
      case 'choice': return 'secondary';
      default: return 'outline';
    }
  };

  const getCardTypeLabel = (type: string) => {
    switch (type) {
      case 'positive': return 'Positiva';
      case 'negative': return 'Negativa';
      case 'choice': return 'Escolha';
      default: return 'Neutra';
    }
  };

  const calculateEffect = () => {
    if (card.effect.type === 'credits') {
      if (card.effect.percentage) {
        const amount = Math.floor(player.credits * Math.abs(card.effect.percentage) / 100);
        return card.effect.percentage > 0 ? `+${amount}` : `-${amount}`;
      }
      return card.effect.value > 0 ? `+${card.effect.value}` : `${card.effect.value}`;
    }
    return null;
  };

  const handleApply = () => {
    if (card.effect.special === 'mission_swap' && selectedPlayer) {
      onApplyEffect(card, { targetPlayer: selectedPlayer });
    } else {
      onApplyEffect(card);
    }
    onClose();
  };

  const isChoiceCard = card.type === 'choice' && card.effect.special === 'mission_swap';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🃏 Carta da Vida
          </DialogTitle>
        </DialogHeader>

        <Card className="border-2">
          <CardHeader className="text-center pb-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl">{card.icon}</span>
              <Badge variant={getCardTypeColor(card.type)}>
                {getCardTypeLabel(card.type)}
              </Badge>
            </div>
            <CardTitle className="text-xl">{card.title}</CardTitle>
            <CardDescription className="text-center">
              {card.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            {card.effect.type === 'credits' && (
              <div className="bg-white dark:bg-white p-3 rounded-lg">
                <p className="font-bold text-lg text-black dark:text-black">
                  {calculateEffect()} créditos
                </p>
              </div>
            )}
            
            {card.effect.type === 'stat' && (
              <div className="bg-white dark:bg-white p-3 rounded-lg">
                <p className="font-bold text-lg text-black dark:text-black">
                  {card.effect.value > 0 ? '+' : ''}{card.effect.value} {card.effect.stat}
                </p>
              </div>
            )}

            {card.effect.special === 'mission_hint' && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  O sábio sussurra segredos sobre as missões dos outros jogadores...
                </p>
              </div>
            )}

            {card.effect.special === 'shop_discount' && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  Próxima compra na loja terá 20% de desconto!
                </p>
              </div>
            )}

            {isChoiceCard && (
              <div className="space-y-3 mt-4">
                <p className="text-sm font-medium">Escolha um jogador para trocar de missão:</p>
                <div className="space-y-2">
                  {availablePlayers.filter(p => p.id !== player.id).map((p) => (
                    <Button
                      key={p.id}
                      variant={selectedPlayer?.id === p.id ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setSelectedPlayer(p)}
                    >
                      {p.avatar} {p.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleApply}
            disabled={isChoiceCard && !selectedPlayer}
          >
            {isChoiceCard ? 'Trocar Missão' : 'Aplicar Efeito'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};