import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Bell, Send, Calendar, Cake, Loader2, Mail, Settings, Save } from "lucide-react";

interface ConfiguracoesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigUpdate?: () => void;
}

export function ConfiguracoesModal({ open, onOpenChange, onConfigUpdate }: ConfiguracoesModalProps) {
  const [diasAntecedencia, setDiasAntecedencia] = useState("1");
  
  // Estados para configurações da página
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [rodape, setRodape] = useState("");

  // Carregar configurações existentes
  const { data: configuracoes, refetch: refetchConfig } = trpc.configuracoes.getAll.useQuery();

  useEffect(() => {
    if (configuracoes) {
      setTitulo(configuracoes.titulo || "");
      setSubtitulo(configuracoes.subtitulo || "");
      setRodape(configuracoes.rodape || "");
    }
  }, [configuracoes]);

  const saveConfigMutation = trpc.configuracoes.setMultiple.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      refetchConfig();
      onConfigUpdate?.();
    },
    onError: () => toast.error("Erro ao salvar configurações"),
  });

  const sendUpcomingMutation = trpc.notificacoes.sendUpcoming.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Notificação de eventos próximos enviada!");
      } else {
        toast.error("Falha ao enviar notificação");
      }
    },
    onError: () => toast.error("Erro ao enviar notificação"),
  });

  const sendBirthdaysMutation = trpc.notificacoes.sendBirthdays.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Notificação de aniversários enviada!");
      } else {
        toast.error("Falha ao enviar notificação");
      }
    },
    onError: () => toast.error("Erro ao enviar notificação"),
  });

  const sendDailySummaryMutation = trpc.notificacoes.sendDailySummary.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Resumo diário enviado!");
      } else {
        toast.error("Falha ao enviar resumo");
      }
    },
    onError: () => toast.error("Erro ao enviar resumo"),
  });

  const handleSaveConfig = () => {
    saveConfigMutation.mutate({ titulo, subtitulo, rodape });
  };

  const handleSendUpcoming = () => {
    sendUpcomingMutation.mutate({ dias: parseInt(diasAntecedencia) });
  };

  const handleSendBirthdays = () => {
    sendBirthdaysMutation.mutate();
  };

  const handleSendDailySummary = () => {
    sendDailySummaryMutation.mutate();
  };

  const isNotificationLoading = sendUpcomingMutation.isPending || sendBirthdaysMutation.isPending || sendDailySummaryMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="pagina" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pagina">Página Inicial</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          </TabsList>

          {/* Aba de Configurações da Página */}
          <TabsContent value="pagina" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título Principal</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Calendário Gerencial CGTIC - 2026"
                />
                <p className="text-xs text-muted-foreground">
                  Texto exibido no topo da página
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitulo">Subtítulo</Label>
                <Input
                  id="subtitulo"
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                  placeholder="Ex: Controle de Eventos, Prazos e Responsáveis"
                />
                <p className="text-xs text-muted-foreground">
                  Texto exibido abaixo do título principal
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rodape">Texto do Rodapé</Label>
                <Textarea
                  id="rodape"
                  value={rodape}
                  onChange={(e) => setRodape(e.target.value)}
                  placeholder="Ex: © 2026 CGTIC - Todos os direitos reservados"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Texto exibido no rodapé da página
                </p>
              </div>

              <Button 
                onClick={handleSaveConfig} 
                disabled={saveConfigMutation.isPending}
                className="w-full"
              >
                {saveConfigMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>

          {/* Aba de Notificações */}
          <TabsContent value="notificacoes" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* Notificação de eventos próximos */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <Label className="font-medium">Eventos Próximos</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enviar notificação com os eventos dos próximos dias
                </p>
                <div className="flex items-center gap-3">
                  <Select value={diasAntecedencia} onValueChange={setDiasAntecedencia}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 dia</SelectItem>
                      <SelectItem value="2">2 dias</SelectItem>
                      <SelectItem value="3">3 dias</SelectItem>
                      <SelectItem value="5">5 dias</SelectItem>
                      <SelectItem value="7">7 dias</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleSendUpcoming} 
                    disabled={isNotificationLoading}
                    className="flex-1"
                  >
                    {sendUpcomingMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Enviar
                  </Button>
                </div>
              </div>

              {/* Notificação de aniversários */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Cake className="w-4 h-4 text-pink-500" />
                  <Label className="font-medium">Aniversários da Semana</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enviar notificação com os aniversários dos próximos 7 dias
                </p>
                <Button 
                  onClick={handleSendBirthdays} 
                  disabled={isNotificationLoading}
                  className="w-full"
                >
                  {sendBirthdaysMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Enviar Aniversários
                </Button>
              </div>

              {/* Resumo diário */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-green-500" />
                  <Label className="font-medium">Resumo Diário</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enviar resumo com eventos de hoje e amanhã
                </p>
                <Button 
                  onClick={handleSendDailySummary} 
                  disabled={isNotificationLoading}
                  className="w-full"
                >
                  {sendDailySummaryMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Enviar Resumo
                </Button>
              </div>
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Nota:</strong> As notificações são enviadas para o proprietário do sistema através do serviço Manus.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
