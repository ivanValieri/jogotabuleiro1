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

interface RelicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onCollect: () => void;
  currentRelics: number;
}

export const RelicDialog = ({ isOpen, onClose, player, onCollect, currentRelics }: RelicDialogProps) => {
  const isRelevant = player.mission_id === 1; // Guardião das Relíquias

  const handleCollect = () => {
    if (isRelevant) {
      onCollect();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🏺 Relíquia Antiga
          </DialogTitle>
        </DialogHeader>

        <Card className="border-2 border-amber-500">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-6xl mb-4">🏺</div>
            
            {isRelevant ? (
              <>
                <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  Relíquia Encontrada!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você descobriu uma Relíquia Antiga! Esta é uma das peças necessárias para completar sua missão.
                </p>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="font-bold text-lg text-black dark:text-white">
                    Relíquias Coletadas: {currentRelics}/3
                  </p>
                  <Badge variant="default" className="mt-2">
                    {3 - currentRelics} restantes
                  </Badge>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold">
                  Artefato Interessante
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você encontrou uma relíquia antiga, mas ela não é relevante para sua missão atual.
                </p>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="font-bold text-black dark:text-white">
                    +500 créditos de bônus!
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <DialogFooter>
          <Button onClick={handleCollect} className="w-full">
            {isRelevant ? 'Coletar Relíquia' : 'Continuar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RelicDialog;

