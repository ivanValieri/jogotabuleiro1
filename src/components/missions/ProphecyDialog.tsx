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

interface ProphecyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onFulfill: () => void;
  currentProphecies: number;
}

const PROPHECIES = [
  {
    text: "O viajante que busca o conhecimento encontrará a luz no fim da jornada.",
    reward: "Sabedoria Ancestral"
  },
  {
    text: "Três caminhos se abrem, mas apenas um leva à verdade eterna.",
    reward: "Visão do Oráculo"
  },
  {
    text: "Quando o sol e a lua se encontrarem, o destino será selado.",
    reward: "Bênção Celestial"
  }
];

export const ProphecyDialog = ({ isOpen, onClose, player, onFulfill, currentProphecies }: ProphecyDialogProps) => {
  const isRelevant = player.mission_id === 6; // O Escolhido do Oráculo
  const prophecy = PROPHECIES[currentProphecies % PROPHECIES.length];

  const handleFulfill = () => {
    if (isRelevant) {
      onFulfill();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🔮 Santuário da Profecia
          </DialogTitle>
        </DialogHeader>

        <Card className="border-2 border-cyan-500">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-6xl mb-4 animate-pulse">🔮</div>
            
            {isRelevant ? (
              <>
                <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                  Profecia Revelada
                </h3>
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 p-4 rounded-lg border border-cyan-300">
                  <p className="text-sm italic text-black dark:text-white">
                    "{prophecy.text}"
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="font-bold text-lg text-black dark:text-white">
                    Profecias Cumpridas: {currentProphecies + 1}/3
                  </p>
                  <Badge variant="default" className="mt-2">
                    Recompensa: {prophecy.reward}
                  </Badge>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold">
                  Visão Enigmática
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você teve uma visão, mas ela não é relevante para sua jornada atual.
                </p>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="font-bold text-black dark:text-white">
                    +400 créditos de bônus!
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <DialogFooter>
          <Button onClick={handleFulfill} className="w-full">
            {isRelevant ? 'Cumprir Profecia' : 'Continuar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

