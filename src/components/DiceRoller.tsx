import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DiceRollerProps {
  onRoll: (value: number, dice1: number, dice2: number) => void;
  disabled?: boolean;
  isRolling?: boolean;
}

const DiceRoller = ({ onRoll, disabled = false, isRolling = false }: DiceRollerProps) => {
  const [dice1Value, setDice1Value] = useState(1);
  const [dice2Value, setDice2Value] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const rollDice = () => {
    if (disabled || isAnimating) return;
    
    setIsAnimating(true);
    
    // Animate dice roll
    let count = 0;
    const interval = setInterval(() => {
      setDice1Value(Math.floor(Math.random() * 6) + 1);
      setDice2Value(Math.floor(Math.random() * 6) + 1);
      count++;
      
      if (count >= 10) {
        clearInterval(interval);
        const finalDice1 = Math.floor(Math.random() * 6) + 1;
        const finalDice2 = Math.floor(Math.random() * 6) + 1;
        setDice1Value(finalDice1);
        setDice2Value(finalDice2);
        setIsAnimating(false);
        onRoll(finalDice1 + finalDice2, finalDice1, finalDice2);
      }
    }, 100);
  };

  const getDiceFace = (value: number) => {
    const dots = {
      1: [[2, 2]],
      2: [[1, 1], [3, 3]],
      3: [[1, 1], [2, 2], [3, 3]],
      4: [[1, 1], [1, 3], [3, 1], [3, 3]],
      5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
      6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]]
    };

    return dots[value as keyof typeof dots] || dots[1];
  };

  const renderDice = (value: number, label: string) => (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-card-foreground font-semibold">{label}</span>
      <div
        className={cn(
          "relative w-16 h-16 bg-gradient-dice rounded-lg shadow-dice",
          "border-2 border-white/20 transition-all duration-300",
          isAnimating && "animate-spin",
          disabled && "opacity-50"
        )}
      >
        <div className="absolute inset-2 grid grid-cols-3 grid-rows-3 gap-1">
          {Array.from({ length: 9 }, (_, index) => {
            const row = Math.floor(index / 3) + 1;
            const col = (index % 3) + 1;
            const dots = getDiceFace(value);
            const hasDot = dots.some(([r, c]) => r === row && c === col);
            
            return (
              <div
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  hasDot ? "bg-gray-800 scale-100" : "bg-transparent scale-0"
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Two Dice */}
      <div className="flex gap-4 items-center cursor-pointer" onClick={rollDice}>
        {renderDice(dice1Value, "Dado 1")}
        {renderDice(dice2Value, "Dado 2")}
      </div>

      {/* Roll Button */}
      <Button
        onClick={rollDice}
        disabled={disabled || isAnimating}
        className={cn(
          "min-w-[120px] font-bold transition-all duration-300",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          isAnimating && "animate-pulse"
        )}
        size="lg"
      >
        {isAnimating ? "Girando..." : "Lançar Dados"}
      </Button>

      {/* Current Value Display */}
      <div className="text-center">
        <p className="text-sm text-card-foreground font-semibold">Último resultado</p>
        <div className="flex items-center gap-2 justify-center">
          <span className="text-lg font-semibold text-primary">{dice1Value}</span>
          <span className="text-card-foreground font-bold">+</span>
          <span className="text-lg font-semibold text-primary">{dice2Value}</span>
          <span className="text-card-foreground font-bold">=</span>
          <span className="text-2xl font-bold text-primary">{dice1Value + dice2Value}</span>
        </div>
      </div>
    </div>
  );
};

export default DiceRoller;