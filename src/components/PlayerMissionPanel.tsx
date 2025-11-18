import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Scroll } from "lucide-react";
import { getMissionById } from "@/types/missions";

interface PlayerMissionPanelProps {
  missionId?: number;
  className?: string;
  playerClass?: string;
}

const PlayerMissionPanel = ({ missionId, className, playerClass }: PlayerMissionPanelProps) => {
  const mission = missionId ? getMissionById(missionId) : null;

  return (
    <Card className="w-full max-w-sm bg-gradient-card border-card/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Target className="w-5 h-5" />
          Sua Missão
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Classe Selecionada */}
        {playerClass && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Scroll className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Sua Classe</span>
            </div>
            <Badge variant="secondary" className="text-sm">
              {playerClass}
            </Badge>
          </div>
        )}

        {/* Missão Individual */}
        {mission ? (
          <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{mission.icon}</span>
              <div>
                <h3 className="font-bold text-sm text-card-foreground">
                  {mission.title}
                </h3>
                <Badge variant="outline" className="text-xs mt-1">
                  Missão Secreta
                </Badge>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              {mission.description}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-muted/20 border border-muted/20 text-center">
            <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aguardando missão...
            </p>
          </div>
        )}

        {/* Aviso sobre privacidade */}
        <div className="p-2 rounded bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
            ⚠️ Sua missão é secreta! Outros jogadores não podem vê-la.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerMissionPanel;