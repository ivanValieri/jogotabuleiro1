import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { ClassSelection } from '@/components/ClassSelection';
import { MISSIONS } from '@/types/missions';

interface GamePlayer {
  id: string;
  player_id: string;
  class_id: string | null;
  profiles: {
    username: string;
  };
}

const ClassSelectionPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !roomId) {
      navigate('/');
      return;
    }

    loadPlayersData();

    // Configurar tempo real para atualizações
    const channel = supabase
      .channel(`class-selection-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_players',
          filter: `room_id=eq.${roomId}`
        },
        () => loadPlayersData()
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
          if (payload.new.status === 'playing') {
            navigate(`/game/${roomId}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, roomId, navigate]);

  const loadPlayersData = async () => {
    try {
      const { data: playersData, error } = await supabase
        .from('game_players')
        .select(`
          id,
          player_id,
          class_id,
          profiles (username)
        `)
        .eq('room_id', roomId)
        .order('turn_order');

      if (error) throw error;
      setPlayers(playersData);

      // Verificar se o usuário atual já escolheu uma classe
      const currentPlayer = playersData.find(p => p.player_id === user?.id);
      if (currentPlayer?.class_id) {
        setSelectedClass(currentPlayer.class_id);
        setHasConfirmed(true);
      }

      // Se todos escolheram classes, aguardar host iniciar o jogo
      const allHaveClasses = playersData.every(p => p.class_id);
      if (allHaveClasses && playersData.length >= 2) {
        checkIfCanStartGame();
      }

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assignMissionsToPlayers = async () => {
    try {
      // Buscar todos os jogadores da sala que não têm missão
      const { data: playersData, error: playersError } = await supabase
        .from('game_players')
        .select('id, player_id, mission_id')
        .eq('room_id', roomId);

      if (playersError) throw playersError;

      // Filtrar jogadores que ainda não têm missão
      const playersWithoutMission = playersData.filter(player => !player.mission_id);
      
      if (playersWithoutMission.length === 0) {
        console.log('Todos os jogadores já têm missões atribuídas');
        return;
      }

      // Buscar missões já utilizadas na sala
      const usedMissions = playersData
        .filter(player => player.mission_id)
        .map(player => player.mission_id);

      // Criar lista de missões disponíveis
      const allMissions = [1, 2, 3, 4, 5, 6, 7, 8];
      let availableMissions = allMissions.filter(mission => !usedMissions.includes(mission));
      
      // Se não há missões disponíveis, usar todas novamente
      if (availableMissions.length === 0) {
        availableMissions = [...allMissions];
      }

      // Embaralhar missões disponíveis
      for (let i = availableMissions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableMissions[i], availableMissions[j]] = [availableMissions[j], availableMissions[i]];
      }

      // Atribuir missões aos jogadores sem missão
      for (let i = 0; i < playersWithoutMission.length; i++) {
        const player = playersWithoutMission[i];
        const missionId = availableMissions[i % availableMissions.length];
        
        const { error: updateError } = await supabase
          .from('game_players')
          .update({ mission_id: missionId })
          .eq('id', player.id);

        if (updateError) {
          console.error(`Erro ao atribuir missão para jogador ${player.id}:`, updateError);
          throw updateError;
        }
        
        console.log(`Missão ${missionId} atribuída ao jogador ${player.id}`);
      }

      console.log('Todas as missões foram atribuídas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atribuir missões:', error);
      throw error;
    }
  };

  const checkIfCanStartGame = async () => {
    try {
      const { data: roomData, error } = await supabase
        .from('game_rooms')
        .select('host_id')
        .eq('id', roomId)
        .single();

      if (error) throw error;

      // Se for o host e todos escolheram classes, iniciar automaticamente
      if (roomData.host_id === user?.id) {
        setTimeout(async () => {
          try {
            // Primeiro, atribuir missões aos jogadores
            await assignMissionsToPlayers();
            
            // Depois, iniciar o jogo
            await supabase
              .from('game_rooms')
              .update({ status: 'playing' })
              .eq('id', roomId);
          } catch (error: any) {
            console.error('Erro ao iniciar jogo:', error);
            toast({
              title: "Erro ao iniciar jogo",
              description: "Houve um problema ao sortear as missões. Tente novamente.",
              variant: "destructive"
            });
          }
        }, 2000); // Aguarda 2 segundos para que todos vejam que as classes foram selecionadas
      }
    } catch (error: any) {
      console.error('Erro ao verificar se pode iniciar:', error);
    }
  };

  const confirmClassSelection = async () => {
    if (!selectedClass) return;

    try {
      const { error } = await supabase
        .from('game_players')
        .update({ class_id: selectedClass })
        .eq('room_id', roomId)
        .eq('player_id', user?.id);

      if (error) throw error;

      setHasConfirmed(true);
      toast({
        title: "Classe confirmada!",
        description: "Aguardando outros jogadores..."
      });

    } catch (error: any) {
      toast({
        title: "Erro ao confirmar classe",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const allPlayersSelected = players.every(p => p.class_id);
  const currentPlayerSelected = players.find(p => p.player_id === user?.id)?.class_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(`/room/${roomId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à Sala
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">FlowQuest - Escolha sua Classe</h1>
            <p className="text-muted-foreground">
              Cada classe tem habilidades únicas que influenciarão sua jornada
            </p>
          </div>
        </div>

        {/* Status dos Jogadores */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Status dos Jogadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="font-medium">{player.profiles.username}</span>
                  {player.class_id ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-muted-foreground rounded-full animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Classes */}
        {!hasConfirmed ? (
          <div className="space-y-6">
            <ClassSelection
              onSelectClass={setSelectedClass}
              selectedClass={selectedClass}
            />
            
            <div className="flex justify-center">
              <Button
                onClick={confirmClassSelection}
                disabled={!selectedClass}
                size="lg"
                className="px-8 py-4 text-lg"
              >
                Confirmar Classe Selecionada
              </Button>
            </div>
          </div>
        ) : (
          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Classe Confirmada!</h2>
              <p className="text-muted-foreground mb-4">
                {allPlayersSelected 
                  ? "Todos os jogadores selecionaram suas classes. Iniciando o jogo..."
                  : "Aguardando outros jogadores escolherem suas classes..."
                }
              </p>
              {allPlayersSelected && (
                <div className="animate-pulse">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClassSelectionPage;