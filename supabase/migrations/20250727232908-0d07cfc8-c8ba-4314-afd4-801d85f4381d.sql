-- Remover a restrição que limita dice_value
ALTER TABLE game_moves DROP CONSTRAINT IF EXISTS game_moves_dice_value_check;