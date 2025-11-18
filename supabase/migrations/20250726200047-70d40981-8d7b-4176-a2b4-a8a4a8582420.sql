-- Corrigir recursão infinita nas políticas RLS da tabela game_players

-- 1. Remover a política problemática
DROP POLICY IF EXISTS "Jogadores da sala podem ver outros jogadores" ON public.game_players;

-- 2. Criar função security definer para verificar se o usuário está na sala
CREATE OR REPLACE FUNCTION public.user_is_in_room(room_uuid uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.game_players 
    WHERE room_id = room_uuid AND player_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 3. Recriar a política usando a função
CREATE POLICY "Jogadores da sala podem ver outros jogadores" 
ON public.game_players 
FOR SELECT 
USING (public.user_is_in_room(room_id));