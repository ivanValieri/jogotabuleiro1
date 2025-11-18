-- Adicionar coluna de voltas para os jogadores
ALTER TABLE public.game_players 
ADD COLUMN laps INTEGER NOT NULL DEFAULT 0;

-- Atualizar a tabela de movimentos para incluir informação de voltas
ALTER TABLE public.game_moves 
ADD COLUMN laps INTEGER;