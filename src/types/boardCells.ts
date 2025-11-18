export type CellType = 
  | 'start'           // Casa inicial
  | 'battle'          // Casa de batalha
  | 'shop'            // Loja
  | 'life_card'       // Carta da Vida
  | 'relic'           // Relíquia Antiga (Missão 1)
  | 'resource'        // Ouro/Gema/Artefato (Missão 2)
  | 'enigma'          // Enigma Mágico (Missão 4)
  | 'alliance'        // Marca de Aliança (Missão 5)
  | 'prophecy'        // Santuário/Profecia (Missão 6)
  | 'throne'          // Trono Sagrado (Missão 7)
  | 'energy'          // Ponto de Energia (Missão 8)
  | 'normal';         // Casa normal com eventos

export interface BoardCell {
  position: number;
  type: CellType;
  icon: string;
  region?: string;    // Para casas de aliança (norte, sul, leste, oeste)
  description: string;
}

// Tabuleiro expandido para 40 casas
export const BOARD_CELLS: BoardCell[] = [
  // Casa 0: Início
  { position: 0, type: 'start', icon: '🏁', description: 'Casa Inicial' },
  
  // Região Norte (casas 1-10)
  { position: 1, type: 'energy', icon: '⚡', description: 'Ponto de Energia' },
  { position: 2, type: 'alliance', icon: '🏛️', region: 'norte', description: 'Aliança do Norte' },
  { position: 3, type: 'relic', icon: '🏺', description: 'Relíquia Antiga' },
  { position: 4, type: 'normal', icon: '🎲', description: 'Casa Normal' },
  { position: 5, type: 'battle', icon: '🥊', description: 'Casa de Batalha' },
  { position: 6, type: 'resource', icon: '💎', description: 'Mercado de Recursos' },
  { position: 7, type: 'enigma', icon: '🧩', description: 'Enigma Mágico' },
  { position: 8, type: 'life_card', icon: '🃏', description: 'Carta da Vida' },
  { position: 9, type: 'prophecy', icon: '🔮', description: 'Santuário da Profecia' },
  { position: 10, type: 'normal', icon: '🎲', description: 'Casa Normal' },
  
  // Região Leste (casas 11-20)
  { position: 11, type: 'alliance', icon: '🏛️', region: 'leste', description: 'Aliança do Leste' },
  { position: 12, type: 'battle', icon: '🥊', description: 'Casa de Batalha' },
  { position: 13, type: 'relic', icon: '🏺', description: 'Relíquia Antiga' },
  { position: 14, type: 'energy', icon: '⚡', description: 'Ponto de Energia' },
  { position: 15, type: 'shop', icon: '🏪', description: 'Loja' },
  { position: 16, type: 'normal', icon: '🎲', description: 'Casa Normal' },
  { position: 17, type: 'enigma', icon: '🧩', description: 'Enigma Mágico' },
  { position: 18, type: 'life_card', icon: '🃏', description: 'Carta da Vida' },
  { position: 19, type: 'resource', icon: '💎', description: 'Mercado de Recursos' },
  { position: 20, type: 'throne', icon: '👑', description: 'Trono Sagrado' },
  
  // Região Sul (casas 21-30)
  { position: 21, type: 'normal', icon: '🎲', description: 'Casa Normal' },
  { position: 22, type: 'energy', icon: '⚡', description: 'Ponto de Energia' },
  { position: 23, type: 'alliance', icon: '🏛️', region: 'sul', description: 'Aliança do Sul' },
  { position: 24, type: 'prophecy', icon: '🔮', description: 'Santuário da Profecia' },
  { position: 25, type: 'relic', icon: '🏺', description: 'Relíquia Antiga' },
  { position: 26, type: 'battle', icon: '🥊', description: 'Casa de Batalha' },
  { position: 27, type: 'normal', icon: '🎲', description: 'Casa Normal' },
  { position: 28, type: 'life_card', icon: '🃏', description: 'Carta da Vida' },
  { position: 29, type: 'resource', icon: '💎', description: 'Mercado de Recursos' },
  { position: 30, type: 'enigma', icon: '🧩', description: 'Enigma Mágico' },
  
  // Região Oeste (casas 31-39)
  { position: 31, type: 'normal', icon: '🎲', description: 'Casa Normal' },
  { position: 32, type: 'alliance', icon: '🏛️', region: 'oeste', description: 'Aliança do Oeste' },
  { position: 33, type: 'energy', icon: '⚡', description: 'Ponto de Energia' },
  { position: 34, type: 'prophecy', icon: '🔮', description: 'Santuário da Profecia' },
  { position: 35, type: 'battle', icon: '🥊', description: 'Casa de Batalha' },
  { position: 36, type: 'normal', icon: '🎲', description: 'Casa Normal' },
  { position: 37, type: 'enigma', icon: '🧩', description: 'Enigma Mágico' },
  { position: 38, type: 'energy', icon: '⚡', description: 'Ponto de Energia' },
  { position: 39, type: 'life_card', icon: '🃏', description: 'Carta da Vida' },
];

export const TOTAL_CELLS = 40;

export const getCellByPosition = (position: number): BoardCell | undefined => {
  return BOARD_CELLS.find(cell => cell.position === position);
};

export const getCellsByType = (type: CellType): BoardCell[] => {
  return BOARD_CELLS.filter(cell => cell.type === type);
};

