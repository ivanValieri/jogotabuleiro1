import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, Play, Bot } from "lucide-react";

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface GameSettings {
  aiDifficulty: AIDifficulty;
  numberOfAIs: number;
  initialCredits: number;
  gameSpeed: 'slow' | 'normal' | 'fast';
}

interface GameSettingsProps {
  onStart: (settings: GameSettings) => void;
}

const GameSettings = ({ onStart }: GameSettingsProps) => {
  const [settings, setSettings] = useState<GameSettings>({
    aiDifficulty: 'medium',
    numberOfAIs: 1,
    initialCredits: 50000,
    gameSpeed: 'normal',
  });

  const difficultyInfo = {
    easy: {
      label: 'Fácil',
      description: 'IA toma decisões simples e menos agressivas',
      icon: '😊',
      color: 'bg-green-500/20 text-green-700 dark:text-green-400',
    },
    medium: {
      label: 'Médio',
      description: 'IA balanceada com estratégias moderadas',
      icon: '🤔',
      color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    },
    hard: {
      label: 'Difícil',
      description: 'IA agressiva com estratégias avançadas',
      icon: '🔥',
      color: 'bg-red-500/20 text-red-700 dark:text-red-400',
    },
  };

  const speedInfo = {
    slow: { label: 'Lento', description: 'Animações mais lentas para observar melhor' },
    normal: { label: 'Normal', description: 'Velocidade padrão do jogo' },
    fast: { label: 'Rápido', description: 'Animações aceleradas para testes' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            <CardTitle className="text-2xl">Configurações do Jogo</CardTitle>
          </div>
          <CardDescription>
            Configure a dificuldade e opções antes de começar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dificuldade da IA */}
          <div className="space-y-3">
            <Label htmlFor="difficulty" className="text-base font-semibold">
              Dificuldade da IA
            </Label>
            <Select
              value={settings.aiDifficulty}
              onValueChange={(value: AIDifficulty) =>
                setSettings({ ...settings, aiDifficulty: value })
              }
            >
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(difficultyInfo).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{info.icon}</span>
                      <span>{info.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="p-3 rounded-lg bg-muted/50">
              <Badge className={difficultyInfo[settings.aiDifficulty].color}>
                {difficultyInfo[settings.aiDifficulty].icon}{' '}
                {difficultyInfo[settings.aiDifficulty].label}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {difficultyInfo[settings.aiDifficulty].description}
              </p>
            </div>
          </div>

          {/* Número de IAs */}
          <div className="space-y-3">
            <Label htmlFor="numberOfAIs" className="text-base font-semibold">
              Número de Oponentes IA
            </Label>
            <Select
              value={settings.numberOfAIs.toString()}
              onValueChange={(value) =>
                setSettings({ ...settings, numberOfAIs: parseInt(value) })
              }
            >
              <SelectTrigger id="numberOfAIs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Oponente</SelectItem>
                <SelectItem value="2">2 Oponentes</SelectItem>
                <SelectItem value="3">3 Oponentes</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Você jogará contra {settings.numberOfAIs} oponente{settings.numberOfAIs > 1 ? 's' : ''} controlado{settings.numberOfAIs > 1 ? 's' : ''} por IA
            </p>
          </div>

          {/* Créditos Iniciais */}
          <div className="space-y-3">
            <Label htmlFor="credits" className="text-base font-semibold">
              Créditos Iniciais
            </Label>
            <Input
              id="credits"
              type="number"
              value={settings.initialCredits}
              onChange={(e) =>
                setSettings({ ...settings, initialCredits: parseInt(e.target.value) || 50000 })
              }
              min={10000}
              max={100000}
              step={10000}
            />
            <p className="text-sm text-muted-foreground">
              Valor inicial de créditos para todos os jogadores (10.000 - 100.000)
            </p>
          </div>

          {/* Velocidade do Jogo */}
          <div className="space-y-3">
            <Label htmlFor="speed" className="text-base font-semibold">
              Velocidade do Jogo
            </Label>
            <Select
              value={settings.gameSpeed}
              onValueChange={(value: 'slow' | 'normal' | 'fast') =>
                setSettings({ ...settings, gameSpeed: value })
              }
            >
              <SelectTrigger id="speed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(speedInfo).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {speedInfo[settings.gameSpeed].description}
            </p>
          </div>

          {/* Botão Iniciar */}
          <Button
            onClick={() => onStart(settings)}
            size="lg"
            className="w-full"
          >
            <Play className="w-5 h-5 mr-2" />
            Iniciar Jogo
          </Button>

          {/* Info sobre IA */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Sobre a IA
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  A IA joga automaticamente quando é sua vez. Em casas especiais, ela toma decisões baseadas na dificuldade escolhida.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameSettings;

