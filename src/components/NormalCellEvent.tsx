import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NormalCellEvent {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'positive' | 'negative' | 'neutral';
  effect: {
    credits?: number;
    message: string;
  };
}

const NORMAL_CELL_EVENTS: NormalCellEvent[] = [
  {
    id: 'rest_inn',
    title: 'Descanso na Estalagem',
    description: 'Você encontrou uma estalagem aconchegante e descansou.',
    icon: '🏠',
    type: 'positive',
    effect: {
      credits: 500,
      message: 'Você descansou e recuperou energia! +500 créditos'
    }
  },
  {
    id: 'treasure_chest',
    title: 'Baú Escondido',
    description: 'Você encontrou um baú antigo escondido!',
    icon: '💎',
    type: 'positive',
    effect: {
      credits: 1000,
      message: 'Tesouro encontrado! +1000 créditos'
    }
  },
  {
    id: 'merchant',
    title: 'Mercador Viajante',
    description: 'Um mercador oferece uma pequena recompensa por ajudar.',
    icon: '👨‍💼',
    type: 'positive',
    effect: {
      credits: 750,
      message: 'Mercador agradecido! +750 créditos'
    }
  },
  {
    id: 'wild_animals',
    title: 'Animais Selvagens',
    description: 'Você foi atacado por animais selvagens!',
    icon: '🐺',
    type: 'negative',
    effect: {
      credits: -300,
      message: 'Você perdeu alguns itens na fuga! -300 créditos'
    }
  },
  {
    id: 'lost_path',
    title: 'Caminho Perdido',
    description: 'Você se perdeu e gastou recursos para encontrar o caminho.',
    icon: '🗺️',
    type: 'negative',
    effect: {
      credits: -200,
      message: 'Você gastou recursos para se orientar! -200 créditos'
    }
  },
  {
    id: 'mysterious_stranger',
    title: 'Estranho Misterioso',
    description: 'Um estranho oferece uma troca interessante...',
    icon: '🧙',
    type: 'neutral',
    effect: {
      credits: Math.random() > 0.5 ? 500 : -500,
      message: Math.random() > 0.5 
        ? 'A troca foi favorável! +500 créditos'
        : 'A troca não foi boa... -500 créditos'
    }
  },
  {
    id: 'ancient_ruins',
    title: 'Ruínas Antigas',
    description: 'Você explorou ruínas antigas e encontrou artefatos.',
    icon: '🏛️',
    type: 'positive',
    effect: {
      credits: 800,
      message: 'Artefatos valiosos encontrados! +800 créditos'
    }
  },
  {
    id: 'bandit_encounter',
    title: 'Encontro com Bandidos',
    description: 'Bandidos tentaram roubar você, mas você conseguiu escapar.',
    icon: '🗡️',
    type: 'negative',
    effect: {
      credits: -400,
      message: 'Você perdeu alguns itens na fuga! -400 créditos'
    }
  },
  {
    id: 'friendly_village',
    title: 'Vila Amigável',
    description: 'Os habitantes da vila ofereceram hospitalidade.',
    icon: '🏘️',
    type: 'positive',
    effect: {
      credits: 600,
      message: 'Hospitalidade recebida! +600 créditos'
    }
  },
  {
    id: 'storm',
    title: 'Tempestade',
    description: 'Uma tempestade surpreendeu você na estrada.',
    icon: '⛈️',
    type: 'negative',
    effect: {
      credits: -250,
      message: 'Você gastou recursos para se proteger! -250 créditos'
    }
  },
];

export const getRandomNormalEvent = (): NormalCellEvent => {
  const randomIndex = Math.floor(Math.random() * NORMAL_CELL_EVENTS.length);
  const event = { ...NORMAL_CELL_EVENTS[randomIndex] };
  
  // Recalcular efeito para eventos neutros
  if (event.type === 'neutral') {
    event.effect.credits = Math.random() > 0.5 ? 500 : -500;
    event.effect.message = event.effect.credits > 0
      ? 'A troca foi favorável! +500 créditos'
      : 'A troca não foi boa... -500 créditos';
  }
  
  return event;
};

interface NormalCellEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: NormalCellEvent;
  onApply: (credits: number) => void;
}

export const NormalCellEventDialog = ({ 
  isOpen, 
  onClose, 
  event, 
  onApply 
}: NormalCellEventDialogProps) => {
  const handleApply = () => {
    onApply(event.effect.credits || 0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{event.icon}</span>
            <span>{event.title}</span>
          </DialogTitle>
        </DialogHeader>
        <Card className="border-2">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">{event.description}</p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Efeito:</span>
              <Badge 
                variant={event.effect.credits && event.effect.credits > 0 ? "default" : "destructive"}
                className="text-sm"
              >
                {event.effect.credits && event.effect.credits > 0 ? '+' : ''}
                {event.effect.credits} créditos
              </Badge>
            </div>
            <Button onClick={handleApply} className="w-full mt-4">
              Continuar
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

