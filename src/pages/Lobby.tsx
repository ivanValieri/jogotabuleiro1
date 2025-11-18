import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Users, Play, LogOut, RefreshCw } from 'lucide-react';

interface GameRoom {
  id: string;
  name: string;
  host_id: string;
  max_players: number;
  status: string;
  created_at: string;
  player_count: number;
  host_username: string;
}

const Lobby = () => {
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadRooms();
    
    // Configurar tempo real para salas
    const channel = supabase
      .channel('lobby-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms'
        },
        () => loadRooms()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players'
        },
        () => loadRooms()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('game_rooms')
        .select(`
          *,
          profiles:host_id (username),
          game_players (count)
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRooms = data.map(room => ({
        ...room,
        player_count: room.game_players?.length || 0,
        host_username: room.profiles?.username || 'Usuário'
      }));

      setRooms(formattedRooms);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar salas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async () => {
    if (!roomName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a sala",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          name: roomName.trim(),
          host_id: user?.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Adicionar o host como primeiro jogador
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          room_id: roomData.id,
          player_id: user?.id,
          turn_order: 1,
          color: '#3B82F6', // Azul para o host
          is_ready: true
        });

      if (playerError) throw playerError;

      toast({
        title: "Sala criada!",
        description: "Aguardando outros jogadores..."
      });

      navigate(`/room/${roomData.id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao criar sala",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
      setRoomName('');
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      // Verificar se o usuário já está na sala
      const { data: existingPlayer, error: existingError } = await supabase
        .from('game_players')
        .select('id')
        .eq('room_id', roomId)
        .eq('player_id', user?.id)
        .maybeSingle();

      if (existingError) throw existingError;

      // Se já está na sala, apenas navegar para ela
      if (existingPlayer) {
        navigate(`/room/${roomId}`);
        return;
      }

      const room = rooms.find(r => r.id === roomId);
      if (!room) throw new Error('Sala não encontrada');

      // Buscar jogadores atuais de forma mais robusta
      let currentPlayers = [];
      try {
        const { data: playersData, error: playersError } = await supabase
          .from('game_players')
          .select('id, turn_order, player_id')
          .eq('room_id', roomId)
          .order('turn_order');

        if (playersError) {
          console.warn('Erro ao buscar jogadores, tentando contar pela sala:', playersError);
          // Fallback: usar o count da sala
          currentPlayers = new Array(room.player_count || 0);
        } else {
          currentPlayers = playersData || [];
        }
      } catch (err) {
        console.warn('Erro na consulta de jogadores:', err);
        currentPlayers = new Array(room.player_count || 0);
      }

      if (currentPlayers.length >= room.max_players) {
        toast({
          title: "Sala lotada",
          description: "Esta sala já está cheia",
          variant: "destructive"
        });
        return;
      }

      // Encontrar o próximo turn_order disponível
      const usedTurnOrders = currentPlayers.map(p => p.turn_order || 0);
      let nextTurnOrder = 1;
      while (usedTurnOrders.includes(nextTurnOrder)) {
        nextTurnOrder++;
      }

      // Cores disponíveis para jogadores
      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
      const playerColor = colors[(nextTurnOrder - 1) % colors.length];

      const { error } = await supabase
        .from('game_players')
        .insert({
          room_id: roomId,
          player_id: user?.id,
          turn_order: nextTurnOrder,
          color: playerColor
        });

      if (error) {
        // Se ainda der erro, tentar com upsert
        if (error.message.includes('duplicate key')) {
          console.log('Tentando novamente com turn_order diferente...');
          
          // Tentar alguns turn_orders diferentes
          for (let tryOrder = 1; tryOrder <= room.max_players; tryOrder++) {
            const { error: retryError } = await supabase
              .from('game_players')
              .insert({
                room_id: roomId,
                player_id: user?.id,
                turn_order: tryOrder,
                color: colors[(tryOrder - 1) % colors.length]
              });

            if (!retryError) {
              navigate(`/room/${roomId}`);
              return;
            }
          }
        }
        throw error;
      }

      navigate(`/room/${roomId}`);
    } catch (error: any) {
      toast({
        title: "Erro ao entrar na sala",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Lobby do Jogo</h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Criar Nova Sala */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Criar Nova Sala
              </CardTitle>
              <CardDescription>
                Crie uma sala e convide amigos para jogar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="room-name">Nome da Sala</Label>
                <Input
                  id="room-name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Minha Sala Incrível"
                  onKeyPress={(e) => e.key === 'Enter' && createRoom()}
                />
              </div>
              <Button 
                onClick={createRoom} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Criar Sala
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Salas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Salas Disponíveis
              </CardTitle>
              <CardDescription>
                Entre em uma sala existente para jogar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma sala disponível no momento
                </p>
              ) : (
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{room.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Host: {room.host_username}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {room.player_count}/{room.max_players}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => joinRoom(room.id)}
                          disabled={room.player_count >= room.max_players}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Entrar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Lobby;