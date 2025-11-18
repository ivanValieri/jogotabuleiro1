import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Enigma } from "@/types/enigmas";

interface Player {
  id: number;
  name: string;
  avatar: string;
  mission_id?: number;
}

interface EnigmaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  enigma: Enigma | null;
  hintsReceived: number;
  canAnswer: boolean;
  onReceiveHint: () => void;
  onAnswer?: (answerIndex: number) => void;
}

export const EnigmaDialog = ({ 
  isOpen, 
  onClose, 
  player, 
  enigma,
  hintsReceived,
  canAnswer,
  onReceiveHint,
  onAnswer
}: EnigmaDialogProps) => {
  const isRelevant = player.mission_id === 4; // Enigma das Runas

  if (!enigma) return null;

  const handleAnswer = (index: number) => {
    if (onAnswer && canAnswer) {
      onAnswer(index);
    }
  };

  const handleHintOrClose = () => {
    if (isRelevant && hintsReceived < 5) {
      onReceiveHint();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🧩 Enigma Mágico
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isRelevant ? (
            <>
              {/* Enigma Question */}
              <Card className="border-2 border-indigo-500">
                <CardContent className="pt-6 space-y-4">
                  <div className="text-center">
                    <div className="text-5xl mb-4">🧩</div>
                    <Badge variant="outline" className="mb-2">{enigma.theme}</Badge>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {enigma.question}
                    </p>
                  </div>

                  {/* Hints Received */}
                  {hintsReceived > 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg space-y-2">
                      <p className="font-bold text-sm text-center">
                        Dicas Recebidas ({hintsReceived}/5)
                      </p>
                      {enigma.hints.slice(0, hintsReceived).map((hint, index) => (
                        <p key={index} className="text-sm text-black dark:text-white border-l-4 border-indigo-500 pl-3 py-1">
                          {hint}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Progress */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                    {!canAnswer ? (
                      <>
                        <p className="text-sm font-bold text-black dark:text-white">
                          Complete 1 volta no tabuleiro para poder responder!
                        </p>
                        <p className="text-xs mt-2 text-muted-foreground">
                          Continue coletando dicas a cada casa de enigma que cair.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">
                          ✓ Você pode tentar responder agora!
                        </p>
                        <p className="text-xs mt-2 text-red-500 font-bold">
                          ⚠️ ATENÇÃO: Resposta errada = Eliminação do jogo!
                        </p>
                        <p className="text-xs text-green-600 font-bold">
                          ✓ Resposta correta = Vitória instantânea!
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Answer Options (only if can answer) */}
              {canAnswer && onAnswer && (
                <div className="space-y-2">
                  <p className="text-center font-bold text-sm">Escolha sua resposta:</p>
                  {enigma.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full h-auto py-4 text-left justify-start"
                      onClick={() => handleAnswer(index)}
                    >
                      <span className="font-bold mr-3">{String.fromCharCode(65 + index)})</span>
                      <span className="text-sm">{option}</span>
                    </Button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card className="border-2">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="text-5xl mb-4">🧩</div>
                <h3 className="text-xl font-bold">Runas Misteriosas</h3>
                <p className="text-sm text-muted-foreground">
                  Você encontrou runas antigas, mas não consegue decifrá-las sem a missão correta.
                </p>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="font-bold text-black dark:text-white">
                    +350 créditos de bônus!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          {!canAnswer || !onAnswer ? (
            <Button onClick={handleHintOrClose} className="w-full">
              {isRelevant && hintsReceived < 5 ? 'Receber Dica' : 'Continuar'}
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose} className="w-full">
              Ainda não vou responder
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

