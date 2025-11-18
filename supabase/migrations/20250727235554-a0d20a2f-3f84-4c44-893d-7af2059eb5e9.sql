-- Atualizar a constraint do status da game_rooms para incluir 'class_selection'
ALTER TABLE game_rooms DROP CONSTRAINT IF EXISTS game_rooms_status_check;

ALTER TABLE game_rooms ADD CONSTRAINT game_rooms_status_check 
CHECK (status IN ('waiting', 'class_selection', 'playing', 'finished'));