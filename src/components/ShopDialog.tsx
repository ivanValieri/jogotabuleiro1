import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShopItem, SHOP_ITEMS } from "@/types/shop";
import { Player } from "@/components/GameBoard";
import { useToast } from "@/hooks/use-toast";

interface ShopDialogProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onPurchase: (item: ShopItem) => void;
}

export const ShopDialog = ({ isOpen, onClose, player, onPurchase }: ShopDialogProps) => {
  const [selectedTab, setSelectedTab] = useState("equipment");
  const { toast } = useToast();

  const equipmentItems = SHOP_ITEMS.filter(item => item.type === 'equipment');
  const upgradeItems = SHOP_ITEMS.filter(item => item.type === 'upgrade');

  const handlePurchase = (item: ShopItem) => {
    if (player.credits < item.price) {
      toast({
        title: "Créditos Insuficientes",
        description: `Você precisa de ${item.price} créditos. Você tem ${player.credits}.`,
        variant: "destructive"
      });
      return;
    }

    onPurchase(item);
    toast({
      title: "Compra Realizada!",
      description: `Você comprou ${item.name} por ${item.price} créditos.`,
    });
  };

  const renderItems = (items: ShopItem[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <CardTitle className="text-lg">{item.name}</CardTitle>
              </div>
              <Badge variant={item.type === 'equipment' ? 'default' : 'secondary'}>
                {item.type === 'equipment' ? 'Equipamento' : 'Upgrade'}
              </Badge>
            </div>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  +{item.effect.value} {item.effect.stat}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {item.price} 💰
                </span>
                <Button
                  size="sm"
                  onClick={() => handlePurchase(item)}
                  disabled={player.credits < item.price}
                  className={player.credits < item.price ? "opacity-50" : ""}
                >
                  Comprar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🏪 Loja do Aventureiro
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Seus créditos: <span className="font-bold text-primary">{player.credits} 💰</span>
          </p>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
            <TabsTrigger value="upgrades">Upgrades de Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="equipment" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Equipamentos que você pode usar em batalhas e desafios.
              </p>
              {renderItems(equipmentItems)}
            </div>
          </TabsContent>
          
          <TabsContent value="upgrades" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Melhorias permanentes para seus atributos.
              </p>
              {renderItems(upgradeItems)}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar Loja
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};