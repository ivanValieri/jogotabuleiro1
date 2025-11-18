-- Adicionar colunas de atributos para o sistema de loja e cartas de vida
ALTER TABLE public.game_players 
ADD COLUMN strength integer NOT NULL DEFAULT 10,
ADD COLUMN intelligence integer NOT NULL DEFAULT 10,
ADD COLUMN defense integer NOT NULL DEFAULT 10,
ADD COLUMN speed integer NOT NULL DEFAULT 10;