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

interface AllianceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  region: string;
  onCollect: (region: string) => void;
  collectedRegions: string[];
}

const REGION_INFO: Record<string, { icon: string; name: string; description: string }> = {
  norte: { icon: '❄️', name: 'Norte', description: 'Terras geladas dos guerreiros ancestrais' },
  sul: { icon: '🔥', name: 'Sul', description: 'Desertos ardentes dos nômades sábios' },
  leste: { icon: '🌅', name: 'Leste', description: 'Montanhas místicas dos monges iluminados' },
  oeste: { icon: '🌊', name: 'Oeste', description: 'Costas tempestuosas dos navegadores lendários' }
};

export const AllianceDialog = ({ isOpen, onClose, player, region, onCollect, collectedRegions }: AllianceDialogProps) => {
  const isRelevant = player.mission_id === 5; // Construtor da Aliança
  const alreadyCollected = collectedRegions.includes(region);
  const regionInfo = REGION_INFO[region] || REGION_INFO.norte;

  const handleCollect = () => {
    if (isRelevant && !alreadyCollected) {
      onCollect(region);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🏛️ Marca de Aliança
          </DialogTitle>
        </DialogHeader>

        <Card className="border-2 border-purple-500">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-6xl mb-4">{regionInfo.icon}</div>
            
            <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">
              Região {regionInfo.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {regionInfo.description}
            </p>

            {isRelevant ? (
              <>
                {!alreadyCollected ? (
                  <> <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <p className="font-bold text-lg text-black dark:text-white">
                        Nova Aliança Formada!
                      </p>
                      <p className="text-sm mt-2 text-black dark:text-white">
                        Regiões coletadas: {collectedRegions.length + 1}/4
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {Object.entries(REGION_INFO).map(([key, info]) => (
                        <div key={key} className="text-center">
                          <div className={`text-2xl ${
                            collectedRegions.includes(key) || key === region
                              ? 'opacity-100'
                              : 'opacity-30'
                          }`}>
                            {info.icon}
                          </div>
                          <p className="text-xs mt-1">{info.name}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-500">
                    <p className="text-sm text-black dark:text-yellow-200">
                      Você já coletou a marca desta região!
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-black dark:text-white">
                  Esta região não é relevante para sua missão.
                </p>
                <p className="font-bold mt-2 text-black dark:text-white">
                  +300 créditos de bônus!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <DialogFooter>
          <Button onClick={handleCollect} className="w-full">
            {isRelevant && !alreadyCollected ? 'Formar Aliança' : 'Continuar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllianceDialog;

