import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Player {
  id: number;
  name: string;
  avatar: string;
  mission_id?: number;
}

interface ThroneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  canClaimThrone: boolean;  // Se venceu uma batalha recentemente
  isOnThrone: boolean;      // Se já está no trono
  battlesWon: number;       // Quantas batalhas venceu no trono
  totalOpponents: number;   // Total de oponentes que precisa derrotar
  onClaimThrone?: () => void;
}

export const ThroneDialog = ({ 
  isOpen, 
  onClose, 
  player, 
  canClaimThrone,
  isOnThrone,
  battlesWon,
  totalOpponents,
  onClaimThrone
}: ThroneDialogProps) => {
  const isRelevant = player.mission_id === 7; // Usurpador do Trono Vazio

  const handleClaim = () => {
    if (onClaimThrone && canClaimThrone && isRelevant) {
      onClaimThrone();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            👑 Trono Sagrado
          </DialogTitle>
        </DialogHeader>

        <Card className="border-2 border-yellow-600">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-6xl mb-4 animate-pulse">👑</div>
            
            {isRelevant ? (
              <>
                {isOnThrone ? (
                  <>
                    <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                      Você Governa o Trono!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Você conquistou o Trono Sagrado. Agora precisa defendê-lo contra todos os oponentes!
                    </p>
                    <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-500">
                      <p className="font-bold text-lg text-black dark:text-yellow-200">
                        Defesas Vitoriosas: {battlesWon}/{totalOpponents}
                      </p>
                      <div className="flex justify-center gap-2 mt-3">
                        {[...Array(totalOpponents)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                              i < battlesWon
                                ? 'bg-green-500 border-green-700 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 border-gray-400'
                            }`}
                          >
                            {i < battlesWon ? '✓' : '?'}
                          </div>
                        ))}
                      </div>
                      {battlesWon < totalOpponents && (
                        <p className="text-sm mt-3 text-black dark:text-yellow-200">
                          Você será desafiado em batalha pelos outros jogadores!
                        </p>
                      )}
                    </div>
                  </>
                ) : canClaimThrone ? (
                  <>
                    <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                      Reivindique o Trono!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Você venceu uma batalha recentemente e pode agora assumir o Trono Sagrado!
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-bold text-black dark:text-white">
                        ⚔️ Desafio do Trono:
                      </p>
                      <p className="text-xs text-black dark:text-white">
                        • Você será movido para a casa do Trono (posição 20)
                      </p>
                      <p className="text-xs text-black dark:text-white">
                        • Precisa vencer TODOS os {totalOpponents} oponentes em batalhas sequenciais
                      </p>
                      <p className="text-xs text-black dark:text-white">
                        • Se perder qualquer batalha, volta para sua posição anterior
                      </p>
                      <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-2">
                        • Vencendo todos = Vitória no jogo!
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold">
                      Trono Inacessível
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      O Trono Sagrado só pode ser reivindicado após vencer uma batalha.
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <p className="text-sm text-black dark:text-white">
                        Vença uma batalha primeiro para poder reivindicar o trono!
                      </p>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold">
                  Majestade Inalcançável
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você contempla o Trono Sagrado, mas ele não faz parte da sua missão.
                </p>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="font-bold text-black dark:text-white">
                    +700 créditos de bônus!
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <DialogFooter>
          {canClaimThrone && isRelevant && !isOnThrone ? (
            <div className="w-full space-y-2">
              <Button onClick={handleClaim} className="w-full">
                Reivindicar o Trono
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Não agora
              </Button>
            </div>
          ) : (
            <Button onClick={onClose} className="w-full">
              Continuar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ThroneDialog;

