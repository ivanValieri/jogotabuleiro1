-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Perfis são visíveis para todos" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Criar tabela de salas de jogo
CREATE TABLE public.game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  max_players INTEGER DEFAULT 4 CHECK (max_players >= 2 AND max_players <= 6),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  board_size INTEGER DEFAULT 16 CHECK (board_size >= 16 AND board_size <= 64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela game_rooms
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

-- Políticas para game_rooms
CREATE POLICY "Salas são visíveis para todos" 
ON public.game_rooms 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários autenticados podem criar salas" 
ON public.game_rooms 
FOR INSERT 
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host pode atualizar sua sala" 
ON public.game_rooms 
FOR UPDATE 
USING (auth.uid() = host_id);

CREATE POLICY "Host pode deletar sua sala" 
ON public.game_rooms 
FOR DELETE 
USING (auth.uid() = host_id);

-- Criar tabela de jogadores em salas
CREATE TABLE public.game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  position INTEGER DEFAULT 0,
  turn_order INTEGER NOT NULL,
  color TEXT NOT NULL,
  is_ready BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, player_id),
  UNIQUE(room_id, turn_order)
);

-- Habilitar RLS na tabela game_players
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

-- Políticas para game_players
CREATE POLICY "Jogadores da sala podem ver outros jogadores" 
ON public.game_players 
FOR SELECT 
USING (
  room_id IN (
    SELECT room_id FROM public.game_players WHERE player_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem entrar em salas" 
ON public.game_players 
FOR INSERT 
WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Jogadores podem atualizar suas próprias informações" 
ON public.game_players 
FOR UPDATE 
USING (auth.uid() = player_id);

CREATE POLICY "Jogadores podem sair de salas" 
ON public.game_players 
FOR DELETE 
USING (auth.uid() = player_id);

-- Criar tabela de movimentos do jogo
CREATE TABLE public.game_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  dice_value INTEGER NOT NULL CHECK (dice_value >= 1 AND dice_value <= 6),
  old_position INTEGER NOT NULL,
  new_position INTEGER NOT NULL,
  move_type TEXT DEFAULT 'normal' CHECK (move_type IN ('normal', 'start_line_pass')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela game_moves
ALTER TABLE public.game_moves ENABLE ROW LEVEL SECURITY;

-- Políticas para game_moves
CREATE POLICY "Movimentos são visíveis para jogadores da sala" 
ON public.game_moves 
FOR SELECT 
USING (
  room_id IN (
    SELECT room_id FROM public.game_players WHERE player_id = auth.uid()
  )
);

CREATE POLICY "Jogadores podem inserir seus movimentos" 
ON public.game_moves 
FOR INSERT 
WITH CHECK (auth.uid() = player_id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Habilitar tempo real para todas as tabelas
ALTER TABLE public.game_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.game_players REPLICA IDENTITY FULL;
ALTER TABLE public.game_moves REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação do tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_moves;