import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Player {
  id: number;
  name: string;
  avatar: string;
  credits: number;
  mission_id?: number;
}

interface Resource {
  id: string;
  name: string;
  icon: string;
  price: number;
  description: string;
}

interface ResourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onPurchase: (resource: Resource) => void;
  currentResources: number;
}

const AVAILABLE_RESOURCES: Resource[] = [
  {
    id: 'gold',
    name: 'Ouro Puro',
    icon: '🪙',
    price: 5000,
    description: 'Ouro refinado de alta qualidade'
  },
  {
    id: 'gem',
    name: 'Gema Rara',
    icon: '💎',
    price: 7000,
    description: 'Pedra preciosa extremamente valiosa'
  },
  {
    id: 'artifact',
    name: 'Artefato Mágico',
    icon: '🔱',
    price: 10000,
    description: 'Objeto imbuído de poder arcano'
  }
];

export const ResourceDialog = ({ isOpen, onClose, player, onPurchase, currentResources }: ResourceDialogProps) => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const isRelevant = player.mission_id === 2; // Mestre dos Recursos

  const canAfford = (price: number) => player.credits >= price;

  const handlePurchase = () => {
    if (selectedResource && canAfford(selectedResource.price)) {
      onPurchase(selectedResource);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            💎 Mercado de Recursos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isRelevant && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-500">
              <p className="text-center font-bold">
                Recursos Acumulados: {currentResources}/12
              </p>
              <Badge variant="default" className="w-full mt-2 justify-center">
                {12 - currentResources} restantes para completar sua missão
              </Badge>
            </div>
          )}

          {!isRelevant && (
            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-500">
              <p className="text-sm text-center text-black dark:text-yellow-200">
                ⚠️ Estes recursos não são necessários para sua missão, mas podem ser vendidos por créditos.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {AVAILABLE_RESOURCES.map((resource) => (
              <Card
                key={resource.id}
                className={`cursor-pointer transition-all ${
                  selectedResource?.id === resource.id
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                } ${!canAfford(resource.price) ? 'opacity-50' : ''}`}
                onClick={() => canAfford(resource.price) && setSelectedResource(resource)}
              >
                <CardContent className="pt-6 text-center space-y-2">
                  <div className="text-4xl">{resource.icon}</div>
                  <h3 className="font-bold text-sm">{resource.name}</h3>
                  <p className="text-xs text-muted-foreground">{resource.description}</p>
                  <Badge variant={canAfford(resource.price) ? "default" : "destructive"}>
                    {resource.price} créditos
                  </Badge>
                  {!canAfford(resource.price) && (
                    <p className="text-xs text-red-500">Créditos insuficientes</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm text-black dark:text-white">
              <strong>Seus créditos:</strong> {player.credits}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handlePurchase}
            disabled={!selectedResource || !canAfford(selectedResource.price)}
          >
            Comprar {selectedResource?.name || 'Recurso'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDialog;

