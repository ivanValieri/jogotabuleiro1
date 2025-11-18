export interface LifeCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'positive' | 'negative' | 'neutral' | 'choice';
  effect: {
    type: 'credits' | 'stat' | 'mission' | 'special';
    value?: number;
    percentage?: number;
    stat?: string;
    special?: string;
  };
}

export const LIFE_CARDS: LifeCard[] = [
  {
    id: 'tax_kingdom',
    title: 'Imposto do Reino',
    description: 'Pague 10% das suas moedas ao tesouro real',
    icon: '💸',
    type: 'negative',
    effect: { type: 'credits', percentage: -10 }
  },
  {
    id: 'rare_learning',
    title: 'Aprendizado Raro',
    description: 'Você encontrou um mentor sábio',
    icon: '🧠',
    type: 'positive',
    effect: { type: 'stat', stat: 'intelligence', value: 1 }
  },
  {
    id: 'old_sage',
    title: 'Velho Sábio',
    description: 'Um ancião lhe dá uma dica sobre a missão de outro jogador',
    icon: '🧙',
    type: 'neutral',
    effect: { type: 'special', special: 'mission_hint' }
  },
  {
    id: 'perfect_disguise',
    title: 'Disfarce Perfeito',
    description: 'Troque de missão com um jogador à sua escolha',
    icon: '🎭',
    type: 'choice',
    effect: { type: 'special', special: 'mission_swap' }
  },
  {
    id: 'treasure_found',
    title: 'Tesouro Encontrado',
    description: 'Você descobriu um baú escondido!',
    icon: '💰',
    type: 'positive',
    effect: { type: 'credits', value: 5000 }
  },
  {
    id: 'bandits_attack',
    title: 'Ataque de Bandidos',
    description: 'Ladrões roubaram parte das suas moedas',
    icon: '🗡️',
    type: 'negative',
    effect: { type: 'credits', value: -3000 }
  },
  {
    id: 'strength_training',
    title: 'Treinamento Intenso',
    description: 'Você treinou com um guerreiro experiente',
    icon: '💪',
    type: 'positive',
    effect: { type: 'stat', stat: 'strength', value: 2 }
  },
  {
    id: 'cursed_artifact',
    title: 'Artefato Amaldiçoado',
    description: 'Um objeto maldito drenou sua energia',
    icon: '💀',
    type: 'negative',
    effect: { type: 'stat', stat: 'strength', value: -1 }
  },
  {
    id: 'merchant_deal',
    title: 'Negócio do Mercador',
    description: 'Um mercador oferece um desconto especial',
    icon: '🛒',
    type: 'positive',
    effect: { type: 'special', special: 'shop_discount' }
  },
  {
    id: 'mystical_fountain',
    title: 'Fonte Mística',
    description: 'Águas mágicas restauram suas energias',
    icon: '⛲',
    type: 'positive',
    effect: { type: 'stat', stat: 'agility', value: 1 }
  },
  {
    id: 'gambling_loss',
    title: 'Aposta Perdida',
    description: 'Você perdeu dinheiro em jogos de azar',
    icon: '🎲',
    type: 'negative',
    effect: { type: 'credits', percentage: -15 }
  },
  {
    id: 'noble_reward',
    title: 'Recompensa Nobre',
    description: 'Um nobre lhe deu uma generosa recompensa',
    icon: '👑',
    type: 'positive',
    effect: { type: 'credits', value: 8000 }
  }
];

export const getRandomLifeCard = (): LifeCard => {
  const randomIndex = Math.floor(Math.random() * LIFE_CARDS.length);
  return LIFE_CARDS[randomIndex];
};

export const getLifeCardPositions = (): number[] => {
  return [5, 11, 17, 23, 29];
};