-- Corrigir search_path da função para segurança
CREATE OR REPLACE FUNCTION public.user_is_in_room(room_uuid uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.game_players 
    WHERE room_id = room_uuid AND player_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';