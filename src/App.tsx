import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room";
import ClassSelection from "./pages/ClassSelection";
import MultiplayerGame from "./pages/MultiplayerGame";
import SinglePlayerGame from "./pages/SinglePlayerGame";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/lobby" element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            } />
            <Route path="/room/:roomId" element={
              <ProtectedRoute>
                <Room />
              </ProtectedRoute>
            } />
            <Route path="/class-selection/:roomId" element={
              <ProtectedRoute>
                <ClassSelection />
              </ProtectedRoute>
            } />
            <Route path="/game/:roomId" element={
              <ProtectedRoute>
                <MultiplayerGame />
              </ProtectedRoute>
            } />
            <Route path="/game" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/single-player" element={
              <ProtectedRoute>
                <SinglePlayerGame />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
