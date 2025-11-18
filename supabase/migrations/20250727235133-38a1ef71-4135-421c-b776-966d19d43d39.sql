-- Adicionar coluna de classe à tabela game_players
ALTER TABLE game_players ADD COLUMN class_id text;

-- Atualizar a constraint para permitir valores null inicialmente
-- (para jogadores que ainda não escolheram classe)
ALTER TABLE game_players ADD CONSTRAINT valid_class_id 
CHECK (class_id IS NULL OR class_id IN ('artista', 'executivo', 'hacker', 'buscador', 'influencer', 'cientista'));