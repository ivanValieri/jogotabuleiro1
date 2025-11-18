import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Play, Users, Crown, CheckCircle, Circle, Copy } from 'lucide-react';

interface GameRoom {
  id: string;
  name: string;
  host_id: string;
  max_players: number;
  status: string;
  created_at: string;
}

interface GamePlayer {
  id: string;
  player_id: string;
  position: number;
  turn_order: number;
  color: string;
  is_ready: boolean;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !roomId) {
      navigate('/');
      return;
    }

    loadRoomData();

    // Configurar tempo real para atualizações da sala
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `room_id=eq.${roomId}`
        },
        () => loadRoomData()
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          if (payload.new.status === 'class_selection') {
            navigate(`/class-selection/${roomId}`);
          } else if (payload.new.status === 'playing') {
            navigate(`/game/${roomId}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, roomId, navigate]);

  const loadRoomData = async () => {
    try {
      // Carregar dados da sala
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;
      setRoom(roomData);

      // Carregar jogadores da sala
      const { data: playersData, error: playersError } = await supabase
        .from('game_players')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('turn_order');

      if (playersError) throw playersError;
      setPlayers(playersData);

      // Verificar se o usuário atual está pronto
      const currentPlayer = playersData.find(p => p.player_id === user?.id);
      setIsReady(currentPlayer?.is_ready || false);

    } catch (error: any) {
      toast({
        title: "Erro ao carregar sala",
        description: error.message,
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReady = async () => {
    try {
      const { error } = await supabase
        .from('game_players')
        .update({ is_ready: !isReady })
        .eq('room_id', roomId)
        .eq('player_id', user?.id);

      if (error) throw error;
      setIsReady(!isReady);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const startGame = async () => {
    if (!room || room.host_id !== user?.id) return;

    // Verificar se todos estão prontos
    const allReady = players.every(p => p.is_ready);
    if (!allReady) {
      toast({
        title: "Aguarde!",
        description: "Todos os jogadores devem estar prontos",
        variant: "destructive"
      });
      return;
    }

    if (players.length < 2) {
      toast({
        title: "Mínimo de jogadores",
        description: "Precisa de pelo menos 2 jogadores para começar",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('game_rooms')
        .update({ status: 'class_selection' })
        .eq('id', roomId);

      if (error) throw error;

      toast({
        title: "Jogo iniciado!",
        description: "Redirecionando para seleção de classes..."
      });

      // Redirecionar para seleção de classes
      navigate(`/class-selection/${roomId}`);
    } catch (error: any) {
      toast({
        title: "Erro ao iniciar jogo",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const leaveRoom = async () => {
    try {
      const { error } = await supabase
        .from('game_players')
        .delete()
        .eq('room_id', roomId)
        .eq('player_id', user?.id);

      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro ao sair da sala",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    toast({
      title: "Link copiado!",
      description: "Compartilhe com seus amigos"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p>Sala não encontrada</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Voltar ao Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isHost = room.host_id === user?.id;
  const allReady = players.every(p => p.is_ready) && players.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Lobby
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{room.name}</h1>
            <p className="text-muted-foreground">
              {players.length}/{room.max_players} jogadores
            </p>
          </div>
          <Button variant="outline" onClick={copyRoomLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar Link
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lista de Jogadores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Jogadores
              </CardTitle>
              <CardDescription>
                Aguardando todos ficarem prontos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={player.profiles?.avatar_url} />
                        <AvatarFallback style={{ backgroundColor: player.color, color: 'white' }}>
                          {player.profiles?.username?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.profiles?.username}</span>
                          {player.player_id === room.host_id && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Jogador {player.turn_order}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {player.is_ready ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {player.is_ready ? 'Pronto' : 'Aguardando'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Slots vazios */}
                {Array.from({ length: room.max_players - players.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg border-dashed opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground">Aguardando jogador...</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Controles */}
          <Card>
            <CardHeader>
              <CardTitle>Controles</CardTitle>
              <CardDescription>
                Prepare-se para o jogo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Seu Status</h3>
                <Button
                  variant={isReady ? "default" : "outline"}
                  onClick={toggleReady}
                  className="w-full"
                >
                  {isReady ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Pronto para Jogar
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 mr-2" />
                      Marcar como Pronto
                    </>
                  )}
                </Button>
              </div>

              {isHost && (
                <div className="space-y-2">
                  <h3 className="font-medium">Ações do Host</h3>
                  <Button
                    onClick={startGame}
                    disabled={!allReady}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Jogo
                  </Button>
                  {!allReady && (
                    <p className="text-sm text-muted-foreground text-center">
                      Aguarde todos os jogadores ficarem prontos
                    </p>
                  )}
                </div>
              )}

              <div className="pt-4 border-t">
                <Button variant="destructive" onClick={leaveRoom} className="w-full">
                  Sair da Sala
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Room;