export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'equipment' | 'upgrade';
  category: 'weapon' | 'armor' | 'accessory' | 'strength' | 'intelligence' | 'agility';
  icon: string;
  effect: {
    stat?: string;
    value: number;
  };
}

export const SHOP_ITEMS: ShopItem[] = [
  // Equipamentos
  {
    id: 'sword_basic',
    name: 'Espada Básica',
    description: 'Uma espada simples que aumenta a força em combate',
    price: 5000,
    type: 'equipment',
    category: 'weapon',
    icon: '⚔️',
    effect: { stat: 'strength', value: 2 }
  },
  {
    id: 'shield_wood',
    name: 'Escudo de Madeira',
    description: 'Proteção básica contra ataques',
    price: 3000,
    type: 'equipment',
    category: 'armor',
    icon: '🛡️',
    effect: { stat: 'defense', value: 1 }
  },
  {
    id: 'ring_wisdom',
    name: 'Anel da Sabedoria',
    description: 'Aumenta a inteligência do portador',
    price: 4000,
    type: 'equipment',
    category: 'accessory',
    icon: '💍',
    effect: { stat: 'intelligence', value: 3 }
  },
  
  // Upgrades de Status
  {
    id: 'strength_potion',
    name: 'Poção de Força',
    description: 'Aumenta permanentemente a força',
    price: 8000,
    type: 'upgrade',
    category: 'strength',
    icon: '💪',
    effect: { stat: 'strength', value: 5 }
  },
  {
    id: 'wisdom_scroll',
    name: 'Pergaminho da Sabedoria',
    description: 'Aumenta permanentemente a inteligência',
    price: 7500,
    type: 'upgrade',
    category: 'intelligence',
    icon: '📜',
    effect: { stat: 'intelligence', value: 4 }
  },
  {
    id: 'speed_boots',
    name: 'Botas da Velocidade',
    description: 'Aumenta permanentemente a agilidade',
    price: 6000,
    type: 'upgrade',
    category: 'agility',
    icon: '👟',
    effect: { stat: 'agility', value: 3 }
  }
];