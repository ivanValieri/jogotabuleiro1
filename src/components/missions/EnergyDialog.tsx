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

interface EnergyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onActivate: () => void;
  currentEnergy: number;
}

export const EnergyDialog = ({ isOpen, onClose, player, onActivate, currentEnergy }: EnergyDialogProps) => {
  const isRelevant = player.mission_id === 8; // Despertar do Fluxo

  const handleActivate = () => {
    if (isRelevant) {
      onActivate();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⚡ Ponto de Energia
          </DialogTitle>
        </DialogHeader>

        <Card className="border-2 border-yellow-500">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-6xl mb-4 animate-pulse">⚡</div>
            
            {isRelevant ? (
              <>
                <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  Energia Ativada!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você canalizou a energia primordial deste ponto. O Fluxo está mais próximo de despertar.
                </p>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="font-bold text-lg text-black dark:text-white">
                    Pontos Ativados: {currentEnergy + 1}/5
                  </p>
                  <div className="flex justify-center gap-2 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          i < currentEnergy + 1
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        {i < currentEnergy + 1 ? '⚡' : '○'}
                      </div>
                    ))}
                  </div>
                  <Badge variant="default" className="mt-2">
                    {5 - (currentEnergy + 1)} pontos restantes
                  </Badge>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold">
                  Pulso de Energia
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você sentiu um pulso de energia, mas não consegue canalizá-lo para sua missão.
                </p>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="font-bold text-black dark:text-white">
                    +600 créditos de bônus!
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <DialogFooter>
          <Button onClick={handleActivate} className="w-full">
            {isRelevant ? 'Ativar Ponto' : 'Continuar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnergyDialog;

