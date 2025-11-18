import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, LogIn, UserPlus, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AuthHeader = () => {
  const { user, signUp, signIn, signOut } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso!",
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, username);
    
    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Cadastro realizado!",
        description: "Bem-vindo à plataforma!",
      });
      setIsOpen(false);
      resetForm();
    }
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Preencha email e senha",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });
      setIsOpen(false);
      resetForm();
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Erro",
        description: "Preencha o email",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`
    });
    
    if (error) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      setIsOpen(false);
      setShowResetPassword(false);
      resetForm();
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setShowResetPassword(false);
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">Bem-vindo!</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Entrar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {showResetPassword ? '🔑 Recuperar Senha' : '🎮 Acesse sua conta'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {showResetPassword 
                ? 'Digite seu email para receber instruções de recuperação' 
                : 'Entre ou cadastre-se para acessar todos os jogos'}
            </DialogDescription>
          </DialogHeader>
          
          {showResetPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar email de recuperação
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setShowResetPassword(false)}
              >
                Voltar para login
              </Button>
            </form>
          ) : (
            <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
                <Button 
                  type="button" 
                  variant="link" 
                  className="w-full text-sm" 
                  onClick={() => setShowResetPassword(true)}
                >
                  Esqueci minha senha
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Nome de usuário</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="seu_username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastrar
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthHeader;