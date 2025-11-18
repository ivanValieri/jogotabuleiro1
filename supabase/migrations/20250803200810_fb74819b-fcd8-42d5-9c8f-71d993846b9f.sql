-- Adicionar coluna de créditos na tabela game_players
ALTER TABLE public.game_players 
ADD COLUMN credits INTEGER NOT NULL DEFAULT 50000;

-- Atualizar jogadores existentes para ter 50k de créditos iniciais
UPDATE public.game_players 
SET credits = 50000 
WHERE credits IS NULL OR credits = 0;