-- Remover possíveis duplicatas existentes (usando uma abordagem diferente para UUIDs)
DELETE FROM game_players 
WHERE ctid NOT IN (
    SELECT MIN(ctid) 
    FROM game_players 
    GROUP BY room_id, player_id
);

-- Adicionar constraint única para evitar duplicatas
ALTER TABLE game_players 
ADD CONSTRAINT unique_player_per_room 
UNIQUE (room_id, player_id);