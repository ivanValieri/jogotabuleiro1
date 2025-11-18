import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, MapPin, Swords, ShoppingBag, Cards, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BoardLegendProps {
  onCellHover?: (position: number | null) => void;
  highlightedCell?: number | null;
}

const BoardLegend = ({ onCellHover, highlightedCell }: BoardLegendProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const cellTypes = [
    {
      icon: '🏁',
      name: 'Casa Início',
      color: 'bg-accent',
      positions: [0],
      description: 'Ponto de partida. Passar por aqui concede 150 créditos de bônus.',
      type: 'start'
    },
    {
      icon: '🥊',
      name: 'Casa de Desafio',
      color: 'bg-orange-500',
      positions: [5, 12, 26, 35],
      description: 'Desafie outro jogador em uma batalha épica! O vencedor ganha créditos.',
      type: 'battle'
    },
    {
      icon: '🏪',
      name: 'Loja',
      color: 'bg-purple-500',
      positions: [15],
      description: 'Compre equipamentos e melhorias para fortalecer sua jornada.',
      type: 'shop'
    },
    {
      icon: '🃏',
      name: 'Carta da Vida',
      color: 'bg-blue-500',
      positions: [8, 18, 28, 39],
      description: 'Puxe uma carta que pode mudar seu destino! Efeitos aleatórios positivos ou negativos.',
      type: 'lifeCard'
    },
    {
      icon: '🏺',
      name: 'Relíquia Antiga',
      color: 'bg-amber-500',
      positions: [3, 13, 25],
      description: 'Missão: Guardião das Relíquias - Colete 3 relíquias para vencer!',
      type: 'relic'
    },
    {
      icon: '💎',
      name: 'Mercado de Recursos',
      color: 'bg-emerald-500',
      positions: [6, 19, 29],
      description: 'Missão: Mestre dos Recursos - Compre recursos (ouro, gemas, artefatos) para acumular 12 unidades!',
      type: 'resource'
    },
    {
      icon: '🧩',
      name: 'Enigma Mágico',
      color: 'bg-indigo-500',
      positions: [7, 17, 30, 37],
      description: 'Missão: Enigma das Runas - Colete dicas e responda corretamente para vencer! (Erro = eliminação)',
      type: 'enigma'
    },
    {
      icon: '🏛️',
      name: 'Marca de Aliança',
      color: 'bg-purple-600',
      positions: [2, 11, 23, 32],
      description: 'Missão: Construtor da Aliança - Visite as 4 regiões (Norte, Sul, Leste, Oeste) para formar alianças!',
      type: 'alliance'
    },
    {
      icon: '🔮',
      name: 'Santuário da Profecia',
      color: 'bg-cyan-500',
      positions: [9, 24, 34],
      description: 'Missão: O Escolhido do Oráculo - Cumpra 3 profecias reveladas em santuários secretos!',
      type: 'prophecy'
    },
    {
      icon: '👑',
      name: 'Trono Sagrado',
      color: 'bg-yellow-600',
      positions: [20],
      description: 'Missão: Usurpador do Trono - Após vencer uma batalha, reivindique o trono e derrote todos os oponentes!',
      type: 'throne'
    },
    {
      icon: '⚡',
      name: 'Ponto de Energia',
      color: 'bg-yellow-500',
      positions: [1, 14, 22, 33, 38],
      description: 'Missão: Despertar do Fluxo - Ative 5 pontos de energia para restabelecer o equilíbrio!',
      type: 'energy'
    },
    {
      icon: '✨',
      name: 'Casa Normal',
      color: 'bg-green-500',
      positions: 'restantes',
      description: 'Casas comuns podem ter eventos aleatórios: descanso, encontros, pequenos tesouros ou desafios menores.',
      type: 'normal'
    },
  ];

  const getNormalPositions = () => {
    const allPositions = Array.from({ length: 40 }, (_, i) => i);
    const specialPositions = [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 19, 20, 22, 23, 24, 25, 26, 28, 29, 30, 32, 33, 34, 35, 37, 38, 39];
    return allPositions.filter(pos => !specialPositions.includes(pos));
  };

  const normalPositions = getNormalPositions();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <CardTitle className="text-lg">Legenda do Tabuleiro</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-3">
          {cellTypes.map((cellType, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                highlightedCell !== null && 
                (cellType.type === 'normal' 
                  ? normalPositions.includes(highlightedCell)
                  : cellType.positions.includes(highlightedCell))
                  ? 'border-primary bg-primary/10'
                  : 'border-muted hover:border-primary/50'
              }`}
              onMouseEnter={() => {
                if (onCellHover && cellType.type !== 'normal') {
                  onCellHover(Array.isArray(cellType.positions) ? cellType.positions[0] : null);
                }
              }}
              onMouseLeave={() => onCellHover && onCellHover(null)}
            >
              <div className="flex items-start gap-3">
                <div className={`${cellType.color} w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0`}>
                  {cellType.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{cellType.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {Array.isArray(cellType.positions)
                        ? cellType.positions.length === 1
                          ? `Casa ${cellType.positions[0] + 1}`
                          : `${cellType.positions.length} casas`
                        : `${normalPositions.length} casas`}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cellType.description}
                  </p>
                  {Array.isArray(cellType.positions) && cellType.positions.length > 1 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Casas: {cellType.positions.map(p => p + 1).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Dica */}
          <div className="p-2 rounded bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 mt-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Dica:</strong> Passe o mouse sobre os tipos de casas para destacá-las no tabuleiro!
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default BoardLegend;

