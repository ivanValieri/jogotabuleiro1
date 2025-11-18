import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getCellByPosition, type CellType } from "@/types/boardCells";
const flowquestBg = "/lovable-uploads/3720f7c5-fa44-404a-b4db-8a2cd9944379.png";

export interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
  avatar: string;
  credits: number;
}

interface GameBoardProps {
  players: Player[];
  currentPlayer: number;
  onPlayerMove?: (playerId: number, newPosition: number) => void;
  highlightedCell?: number | null;
  onCellHover?: (position: number | null) => void;
}

const GameBoard = ({ players, currentPlayer, onPlayerMove, highlightedCell, onCellHover }: GameBoardProps) => {
  const totalCells = 40; // 40 casas no tabuleiro
  const gridCols = 10; // 10 colunas
  const gridRows = 10; // 10 linhas
  
  // Generate path positions (clockwise around the board)
  const generatePath = () => {
    const path = [];
    
    // Top row (left to right) - 10 casas
    for (let i = 0; i < gridCols; i++) path.push({ row: 0, col: i });
    
    // Right column (top to bottom, excluding top corner) - 9 casas
    for (let i = 1; i < gridRows; i++) path.push({ row: i, col: gridCols - 1 });
    
    // Bottom row (right to left, excluding right corner) - 9 casas
    for (let i = gridCols - 2; i >= 0; i--) path.push({ row: gridRows - 1, col: i });
    
    // Left column (bottom to top, excluding corners) - 8 casas
    for (let i = gridRows - 2; i > 0; i--) path.push({ row: i, col: 0 });
    
    return path.slice(0, 40); // Garantir 40 casas
  };

  const path = generatePath();

  // Get cell styling based on type
  const getCellStyling = (type: CellType) => {
    const styles: Record<CellType, { bg: string; icon: string; text: string; size: string }> = {
      start: { bg: 'bg-accent/95 border-accent/80 hover:bg-accent hover:scale-105', icon: '🏁', text: 'text-accent-foreground', size: 'text-4xl' },
      battle: { bg: 'bg-orange-500/95 border-orange-600/80 hover:bg-orange-500 hover:scale-105', icon: '🥊', text: 'text-white', size: 'text-4xl' },
      shop: { bg: 'bg-purple-500/95 border-purple-600/80 hover:bg-purple-500 hover:scale-105', icon: '🏪', text: 'text-white', size: 'text-4xl' },
      life_card: { bg: 'bg-blue-500/95 border-blue-600/80 hover:bg-blue-500 hover:scale-105', icon: '🃏', text: 'text-white', size: 'text-4xl' },
      relic: { bg: 'bg-amber-500/95 border-amber-600/80 hover:bg-amber-500 hover:scale-105', icon: '🏺', text: 'text-white', size: 'text-4xl' },
      resource: { bg: 'bg-emerald-500/95 border-emerald-600/80 hover:bg-emerald-500 hover:scale-105', icon: '💎', text: 'text-white', size: 'text-4xl' },
      enigma: { bg: 'bg-indigo-500/95 border-indigo-600/80 hover:bg-indigo-500 hover:scale-105', icon: '🧩', text: 'text-white', size: 'text-4xl' },
      alliance: { bg: 'bg-purple-600/95 border-purple-700/80 hover:bg-purple-600 hover:scale-105', icon: '🏛️', text: 'text-white', size: 'text-4xl' },
      prophecy: { bg: 'bg-cyan-500/95 border-cyan-600/80 hover:bg-cyan-500 hover:scale-105', icon: '🔮', text: 'text-white', size: 'text-4xl' },
      throne: { bg: 'bg-yellow-600/95 border-yellow-700/80 hover:bg-yellow-600 hover:scale-105', icon: '👑', text: 'text-white', size: 'text-4xl' },
      energy: { bg: 'bg-yellow-500/95 border-yellow-600/80 hover:bg-yellow-500 hover:scale-105', icon: '⚡', text: 'text-white', size: 'text-4xl' },
      normal: { bg: 'bg-green-500/80 border-green-600/60 hover:bg-green-500/95 hover:scale-105', icon: '', text: 'text-white', size: 'text-xs' }
    };
    return styles[type] || styles.normal;
  };

  const getPlayersAtPosition = (position: number) => {
    return players.filter(player => player.position === position);
  };

  const isActivePosition = (position: number) => {
    const currentPlayerData = players.find(p => p.id === currentPlayer);
    return currentPlayerData?.position === position;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-square">
      <div 
        className="absolute inset-0 rounded-xl shadow-board border-2 border-game-path/20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${flowquestBg})` }}
      >
        {/* Dark overlay to improve contrast for game elements */}
        <div className="absolute inset-0 bg-black/10 rounded-xl"></div>
        {/* Grid Container */}
        <div className="grid grid-cols-10 grid-rows-10 gap-px p-2 h-full">
          {Array.from({ length: gridCols * gridRows }, (_, index) => {
            const row = Math.floor(index / gridCols);
            const col = index % gridCols;
            const pathIndex = path.findIndex(p => p.row === row && p.col === col);
            const isPathCell = pathIndex !== -1;
            const playersHere = isPathCell ? getPlayersAtPosition(pathIndex) : [];
            const isActive = isPathCell ? isActivePosition(pathIndex) : false;
            
            // Get cell data from boardCells
            const cellData = isPathCell ? getCellByPosition(pathIndex) : null;
            const cellType = cellData?.type || 'normal';
            
            // Only render path cells, not all grid cells
            if (!isPathCell) {
              return <div key={index} className="relative"></div>;
            }
            
            const isHighlighted = highlightedCell === pathIndex;
            const styling = getCellStyling(cellType);
            
            return (
              <div
                key={index}
                className={cn(
                  "relative rounded-lg transition-all duration-300 border-2 shadow-lg cursor-pointer",
                  styling.bg,
                  isActive && "ring-2 ring-game-highlight shadow-glow",
                  isHighlighted && "ring-4 ring-primary shadow-xl scale-105"
                )}
                onMouseEnter={() => onCellHover && onCellHover(pathIndex)}
                onMouseLeave={() => onCellHover && onCellHover(null)}
                title={cellData?.description || `Casa ${pathIndex + 1}`}
              >
                {/* Path Number / Special Icons */}
                {isPathCell && (
                  <div className={cn(
                    "absolute top-0 left-0 flex items-center justify-center font-bold",
                    cellType !== 'normal' 
                      ? `w-full h-full rounded-lg ${styling.size} ${styling.text}`
                      : "w-6 h-6 text-xs bg-game-board text-game-path rounded-full"
                  )}>
                    {styling.icon || pathIndex + 1}
                  </div>
                )}
                
                {/* Players */}
                {playersHere.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className={cn(
                      "flex flex-wrap gap-1 items-center justify-center",
                      playersHere.length === 1 ? "" : "gap-0.5"
                    )}>
                      {playersHere.map((player, idx) => (
                        <div
                          key={player.id}
                          className={cn(
                            "rounded-full flex items-center justify-center font-bold",
                            "border-2 border-white shadow-lg transition-transform duration-300",
                            playersHere.length === 1 
                              ? "w-10 h-10 text-2xl"
                              : "w-8 h-8 text-xl",
                            player.id === currentPlayer ? "scale-110 animate-bounce ring-2 ring-yellow-400" : "hover:scale-110"
                          )}
                          style={{ backgroundColor: player.color }}
                          title={player.name}
                        >
                          {player.avatar}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Special indicators for corners */}
                {isPathCell && [0, 9, 16, 24].includes(pathIndex) && (
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-accent rounded-full opacity-60" />
                )}
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
};

export default GameBoard;