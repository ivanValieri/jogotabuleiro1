import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ClassStats {
  creativity?: 'Alta' | 'Média' | 'Baixa';
  charisma?: 'Altíssimo' | 'Alto' | 'Médio' | 'Baixo' | 'Muito Baixo';
  luck?: 'Alta' | 'Média' | 'Baixa';
  resilience?: 'Alta' | 'Média' | 'Baixa';
  income?: 'Médio-Alto' | 'Instável' | 'Baixa' | 'Rápida';
  intelligence?: 'Altíssima' | 'Alta' | 'Média' | 'Abaixo da Média';
  purpose?: 'Alto' | 'Zerado' | 'Lento' | 'Quase Nulo';
}

interface GameClass {
  id: string;
  name: string;
  emoji: string;
  description: string;
  strengths: ClassStats;
  weaknesses: ClassStats;
  specialBonus: string[];
}

const gameClasses: GameClass[] = [
  {
    id: 'artista',
    name: 'Artista Visionário',
    emoji: '🧑‍🎨',
    description: 'Vive com intensidade, cria com emoção. Inspiração é sua arma — mas estabilidade não é seu forte.',
    strengths: {
      creativity: 'Alta',
      charisma: 'Médio',
      luck: 'Alta'
    },
    weaknesses: {
      resilience: 'Baixa',
      income: 'Instável'
    },
    specialBonus: [
      'Pode converter eventos negativos em XP criativo (1x por fase)',
      'Ganha 1 moeda extra sempre que "inspira" outro jogador'
    ]
  },
  {
    id: 'executivo',
    name: 'Executivo Ambicioso',
    emoji: '💼',
    description: 'Nascido para liderar, movido a metas. Controla bem o jogo, mas corre o risco de esquecer o propósito.',
    strengths: {
      income: 'Médio-Alto',
      resilience: 'Alta',
      intelligence: 'Média'
    },
    weaknesses: {
      luck: 'Baixa',
      purpose: 'Zerado'
    },
    specialBonus: [
      'Pode comprar vantagens estratégicas com desconto',
      'Ganha XP extra ao cumprir metas de curto prazo'
    ]
  },
  {
    id: 'hacker',
    name: 'Hacker Solitário',
    emoji: '👩‍💻',
    description: 'Mestre das estratégias e lógica. Resolve quase tudo, mas tem dificuldades em se conectar com os outros.',
    strengths: {
      intelligence: 'Alta',
      resilience: 'Média',
      luck: 'Média'
    },
    weaknesses: {
      charisma: 'Baixo',
      purpose: 'Lento'
    },
    specialBonus: [
      'Pode hackear desafios mentais para sucesso instantâneo (1x por fase)',
      'Pode espiar a próxima Carta de Destino (2x por jogo)'
    ]
  },
  {
    id: 'buscador',
    name: 'Buscador Espiritual',
    emoji: '🧘',
    description: 'Busca significado em cada passo. Cresce no silêncio e conecta-se profundamente com o invisível.',
    strengths: {
      purpose: 'Alto',
      charisma: 'Alto',
      luck: 'Alta'
    },
    weaknesses: {
      income: 'Baixa',
      intelligence: 'Abaixo da Média'
    },
    specialBonus: [
      'Ganha XP extra ao ajudar outro jogador ou ao perdoar traições',
      'Pode evitar até 1 penalidade de estagnação por introspecção'
    ]
  },
  {
    id: 'influencer',
    name: 'Influencer Caótico',
    emoji: '🤹',
    description: 'Vive o agora, vibra com o público. Pode explodir ou se perder no próprio ego.',
    strengths: {
      charisma: 'Altíssimo',
      luck: 'Alta',
      income: 'Rápida'
    },
    weaknesses: {
      resilience: 'Baixa',
      purpose: 'Quase Nulo'
    },
    specialBonus: [
      'Pode repetir uma jogada de evento se "viralizar" (1x por jogo)',
      '⚠️ Se falhar em um evento social, perde metade do XP atual'
    ]
  },
  {
    id: 'cientista',
    name: 'Visionário Cientista',
    emoji: '🧑‍🔬',
    description: 'Gênio silencioso com ambições transformadoras. Calcula cada passo, mas é socialmente travado.',
    strengths: {
      intelligence: 'Altíssima',
      purpose: 'Alto',
      resilience: 'Média'
    },
    weaknesses: {
      charisma: 'Muito Baixo',
      luck: 'Baixa'
    },
    specialBonus: [
      'Pode bloquear 1 evento negativo por "análise antecipada"',
      'Ganha +1 moeda ao vencer desafios mentais complexos'
    ]
  }
];

interface ClassSelectionProps {
  onSelectClass: (classId: string) => void;
  selectedClass?: string;
}

const getStatColor = (stat: string, value: string) => {
  const isPositive = ['Alta', 'Altíssima', 'Alto', 'Altíssimo', 'Médio-Alto', 'Rápida'].includes(value);
  const isNegative = ['Baixa', 'Baixo', 'Muito Baixo', 'Zerado', 'Quase Nulo', 'Instável', 'Lento', 'Abaixo da Média'].includes(value);
  
  if (isPositive) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (isNegative) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
};

const statLabels: Record<keyof ClassStats, string> = {
  creativity: '🎓 Criatividade',
  charisma: '💬 Carisma',
  luck: '🍀 Sorte',
  resilience: '💪 Resiliência',
  income: '💰 Renda',
  intelligence: '🎓 Inteligência',
  purpose: '🧘 Propósito'
};

export const ClassSelection: React.FC<ClassSelectionProps> = ({ onSelectClass, selectedClass }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {gameClasses.map((gameClass) => (
        <Card 
          key={gameClass.id} 
          className={`h-full transition-all duration-200 cursor-pointer hover:shadow-lg ${
            selectedClass === gameClass.id 
              ? 'ring-2 ring-primary shadow-lg' 
              : 'hover:scale-[1.02]'
          }`}
          onClick={() => onSelectClass(gameClass.id)}
        >
          <CardHeader className="text-center pb-4">
            <div className="text-4xl mb-2">{gameClass.emoji}</div>
            <CardTitle className="text-xl">{gameClass.name}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {gameClass.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Pontos Fortes */}
            <div>
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Pontos Fortes:</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(gameClass.strengths).map(([stat, value]) => (
                  <Badge 
                    key={stat} 
                    variant="secondary" 
                    className={getStatColor(stat, value)}
                  >
                    {statLabels[stat as keyof ClassStats]} {value}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pontos Fracos */}
            <div>
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Pontos Fracos:</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(gameClass.weaknesses).map(([stat, value]) => (
                  <Badge 
                    key={stat} 
                    variant="secondary" 
                    className={getStatColor(stat, value)}
                  >
                    {statLabels[stat as keyof ClassStats]} {value}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Bônus Especial */}
            <div>
              <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">Bônus Especial:</h4>
              <ul className="text-sm space-y-1">
                {gameClass.specialBonus.map((bonus, index) => (
                  <li key={index} className="text-muted-foreground">
                    • {bonus}
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              className="w-full mt-4" 
              variant={selectedClass === gameClass.id ? "default" : "outline"}
            >
              {selectedClass === gameClass.id ? 'Classe Selecionada' : 'Escolher Classe'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};