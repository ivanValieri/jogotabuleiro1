import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GameEvent {
  id: string;
  type: 'roll' | 'move' | 'turn' | 'game' | 'system';
  playerId?: number;
  playerName?: string;
  message: string;
  timestamp: Date;
  diceValue?: number;
  position?: number;
}

interface GameFeedProps {
  events: GameEvent[];
  maxEvents?: number;
}

const GameFeed = ({ events, maxEvents = 50 }: GameFeedProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayEvents = events.slice(-maxEvents);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getDiceIcon = (value: number) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[value - 1] || Dice1;
    return <Icon className="w-4 h-4" />;
  };

  const getEventIcon = (event: GameEvent) => {
    switch (event.type) {
      case 'roll':
        return event.diceValue ? getDiceIcon(event.diceValue) : <Dice1 className="w-4 h-4" />;
      case 'move':
      case 'turn':
      case 'game':
      case 'system':
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getEventColor = (event: GameEvent) => {
    switch (event.type) {
      case 'roll':
        return 'text-accent';
      case 'move':
        return 'text-primary';
      case 'turn':
        return 'text-game-highlight';
      case 'game':
        return 'text-blue-400';
      case 'system':
        return 'text-muted-foreground';
      default:
        return 'text-card-foreground';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <Card className="w-full h-[400px] bg-gradient-card border-card/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-card-foreground text-sm">
          <MessageSquare className="w-4 h-4" />
          Feed de Eventos
          <span className="text-xs text-card-foreground/80 ml-auto font-medium">
            {displayEvents.length} eventos
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[320px] px-4" ref={scrollRef}>
          <div className="space-y-2 pb-4">
            {displayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum evento ainda</p>
                <p className="text-xs">Os eventos do jogo aparecerão aqui</p>
              </div>
            ) : (
              displayEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-md transition-all duration-300",
                    "hover:bg-card/30 border border-transparent hover:border-card/20",
                    index === displayEvents.length - 1 && "animate-in slide-in-from-bottom-2"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 mt-0.5 transition-colors duration-300",
                    getEventColor(event)
                  )}>
                    {getEventIcon(event)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm leading-relaxed",
                      getEventColor(event)
                    )}>
                      {event.message}
                    </p>
                    
                    {/* Additional info */}
                    {(event.diceValue || event.position !== undefined) && (
                      <div className="flex items-center gap-2 mt-1">
                        {event.diceValue && (
                          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                            Dado: {event.diceValue}
                          </span>
                        )}
                        {event.position !== undefined && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                            Casa: {event.position + 1}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex-shrink-0 text-xs text-card-foreground/70 font-medium">
                    {formatTime(event.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default GameFeed;