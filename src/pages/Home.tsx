import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Users, Gamepad2, Dice6, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AuthHeader from "@/components/AuthHeader";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const games = [
    {
      id: "flowquest",
      title: "FlowQuest",
      description: "Jogo de tabuleiro multiplayer inspirado no Jogo da Vida. Escolha sua classe, complete missões e torne-se o campeão!",
      image: "🎲",
      status: "Disponível",
      players: "2-4 jogadores",
      duration: "30-60 min",
      difficulty: "Fácil",
      features: ["Multiplayer", "Missões", "Classes", "RPG"],
      route: "/lobby"
    },
    {
      id: "flowquest-single",
      title: "FlowQuest - vs Máquina",
      description: "Teste o jogo localmente jogando contra a máquina. Perfeito para desenvolvimento e testes!",
      image: "🤖",
      status: "Disponível",
      players: "1 jogador",
      duration: "20-40 min",
      difficulty: "Fácil",
      features: ["Single Player", "IA", "Local", "Teste"],
      route: "/single-player"
    },
    {
      id: "coming-soon-1",
      title: "Arena Champions",
      description: "Batalhas épicas em tempo real com estratégia e ação. Em breve!",
      image: "⚔️",
      status: "Em Breve",
      players: "2-8 jogadores",
      duration: "15-30 min", 
      difficulty: "Médio",
      features: ["PvP", "Estratégia", "Tempo Real"],
      route: null
    },
    {
      id: "coming-soon-2", 
      title: "Mystic Kingdoms",
      description: "Construa seu reino mágico e domine terras místicas. Em desenvolvimento!",
      image: "🏰",
      status: "Em Desenvolvimento",
      players: "1-6 jogadores",
      duration: "45-90 min",
      difficulty: "Difícil", 
      features: ["Construção", "Magia", "Estratégia"],
      route: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disponível":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "Em Breve":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "Em Desenvolvimento":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil":
        return <Dice6 className="w-4 h-4 text-green-500" />;
      case "Médio":
        return <Gamepad2 className="w-4 h-4 text-yellow-500" />;
      case "Difícil":
        return <Crown className="w-4 h-4 text-red-500" />;
      default:
        return <Gamepad2 className="w-4 h-4" />;
    }
  };

  const handleGameClick = (game: any) => {
    if (!game.route) {
      toast({
        title: "Jogo Indisponível",
        description: "Este jogo ainda está em desenvolvimento. Aguarde novidades!",
        variant: "destructive"
      });
      return;
    }

    // Verificar se o usuário está logado antes de acessar jogos protegidos
    if (game.id === "flowquest" && !user) {
      toast({
        title: "Login Necessário",
        description: "Faça login para acessar o FlowQuest!",
        variant: "destructive"
      });
      return;
    }

    navigate(game.route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                🎮 GameHub
              </h1>
              <p className="text-muted-foreground mt-1">
                Plataforma de jogos multiplayer
              </p>
            </div>
            
            <AuthHeader />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Jogos Disponíveis</h2>
          <p className="text-muted-foreground">
            Escolha um jogo e divirta-se com seus amigos!
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card 
              key={game.id} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
              onClick={() => handleGameClick(game)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="text-4xl mb-2">{game.image}</div>
                  <Badge className={getStatusColor(game.status)}>
                    {game.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {game.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {game.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Game Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {game.players}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Play className="w-4 h-4" />
                    {game.duration}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getDifficultyIcon(game.difficulty)}
                    {game.difficulty}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Características
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {game.features.map((feature) => (
                      <Badge 
                        key={feature} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full mt-4" 
                  disabled={!game.route || (game.id === "flowquest" && !user)}
                  variant={game.route ? "default" : "secondary"}
                >
                  {game.route ? (
                    game.id === "flowquest" && !user ? (
                      "Login Necessário"
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Jogar Agora
                      </>
                    )
                  ) : (
                    "Em Breve"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Mais jogos serão adicionados em breve! Fique ligado para novidades.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;