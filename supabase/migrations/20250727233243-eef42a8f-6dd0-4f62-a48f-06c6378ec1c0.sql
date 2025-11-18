-- Atualizar a restrição do move_type para incluir 'lap_complete'
ALTER TABLE game_moves DROP CONSTRAINT game_moves_move_type_check;

ALTER TABLE game_moves ADD CONSTRAINT game_moves_move_type_check 
CHECK (move_type = ANY (ARRAY['normal'::text, 'start_line_pass'::text, 'lap_complete'::text]));