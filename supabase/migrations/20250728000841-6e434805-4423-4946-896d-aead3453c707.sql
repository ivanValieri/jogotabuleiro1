-- Adicionar campo mission_id na tabela game_players
ALTER TABLE game_players ADD COLUMN mission_id integer;

-- Comentário: mission_id será um número de 1 a 8 representando uma das 8 missões disponíveis
COMMENT ON COLUMN game_players.mission_id IS 'ID da missão individual do jogador (1-8)';