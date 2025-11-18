-- Remover a restrição antiga que limitava dice_value a 1-6
ALTER TABLE game_moves DROP CONSTRAINT IF EXISTS game_moves_dice_value_check;

-- Adicionar nova restrição para permitir valores de 2 a 12 (soma de dois dados)
ALTER TABLE game_moves ADD CONSTRAINT game_moves_dice_value_check 
CHECK (dice_value >= 2 AND dice_value <= 12);