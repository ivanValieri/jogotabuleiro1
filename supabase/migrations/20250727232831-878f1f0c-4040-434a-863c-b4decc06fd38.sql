-- Primeiro, remover completamente a restrição antiga
ALTER TABLE game_moves DROP CONSTRAINT game_moves_dice_value_check;

-- Depois adicionar a nova restrição para permitir valores de 2 a 12
ALTER TABLE game_moves ADD CONSTRAINT game_moves_dice_value_check 
CHECK (dice_value >= 2 AND dice_value <= 12);