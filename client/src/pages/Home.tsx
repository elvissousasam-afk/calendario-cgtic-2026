import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useSocket } from "@/hooks/useSocket";
import { CalendarMonth } from "@/components/CalendarMonth";
import { EventModal } from "@/components/EventModal";
import { ResponsaveisModal } from "@/components/ResponsaveisModal";
import { AniversariosModal } from "@/components/AniversariosModal";
import { ConfiguracoesModal } from "@/components/ConfiguracoesModal";
import { FilterBar } from "@/components/FilterBar";
import { exportCalendarToPdf } from "@/lib/exportPdf";
import { toast } from "sonner";
import { 
  Plus, Upload, FileDown, Users, Cake, Settings, 
  ChevronLeft, ChevronRight, Sun, Moon, Loader2, LogIn, LogOut, Wifi, WifiOff
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Evento {
  id: number;
  titulo: string;
  descricao: string | null;
  dataEvento: Date | string;
  horaInicio: string | null;
  horaFim: string | null;
  tipoEvento: string;
  cor: string | null;
  responsavelNome: string | null;
  responsavelId: number | null;
}

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [ano, setAno] = useState(2026);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [responsaveisModalOpen, setResponsaveisModalOpen] = useState(false);
  const [aniversariosModalOpen, setAniversariosModalOpen] = useState(false);
  const [configuracoesModalOpen, setConfiguracoesModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Estados dos filtros
  const [tipoFilter, setTipoFilter] = useState("all");
  const [responsavelFilter, setResponsavelFilter] = useState("all");

  const { on, joinRoom, leaveRoom } = useSocket();
  const utils = trpc.useUtils();

  // Buscar configurações
  const { data: configuracoes, refetch: refetchConfig } = trpc.configuracoes.getAll.useQuery();

  // Valores padrão ou das configurações
  const titulo = configuracoes?.titulo || `Calendário Gerencial CGTIC - ${ano}`;
  const subtitulo = configuracoes?.subtitulo || "Controle de Eventos, Prazos e Responsáveis";
  const rodape = configuracoes?.rodape || "";

  // Buscar eventos do ano
  const { data: eventos, isLoading: eventosLoading, refetch } = trpc.eventos.list.useQuery(
    { ano },
    { refetchOnWindowFocus: false }
  );

  // Buscar responsáveis para o filtro
  const { data: responsaveis } = trpc.responsaveis.list.useQuery();

  // Filtrar eventos
  const eventosFiltrados = useMemo(() => {
    if (!eventos) return [];
    
    return eventos.filter((evento) => {
      // Filtro por tipo
      if (tipoFilter !== "all" && evento.tipoEvento !== tipoFilter) {
        return false;
      }
      
      // Filtro por responsável
      if (responsavelFilter !== "all") {
        if (responsavelFilter === "none" && evento.responsavelId !== null) {
          return false;
        }
        if (responsavelFilter !== "none" && evento.responsavelId?.toString() !== responsavelFilter) {
          return false;
        }
      }
      
      return true;
    });
  }, [eventos, tipoFilter, responsavelFilter]);

  // Configurar WebSocket para sincronização em tempo real
  useEffect(() => {
    const room = `calendar-${ano}`;
    joinRoom(room);

    const unsubCreate = on("evento-created", () => {
      refetch();
      toast.info("Novo evento criado por outro usuário", { duration: 3000 });
    });

    const unsubUpdate = on("evento-updated", () => {
      refetch();
      toast.info("Evento atualizado por outro usuário", { duration: 3000 });
    });

    const unsubDelete = on("evento-deleted", () => {
      refetch();
      toast.info("Evento excluído por outro usuário", { duration: 3000 });
    });

    const unsubConnect = on("connect", () => {
      setIsConnected(true);
    });

    const unsubDisconnect = on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      leaveRoom(room);
      unsubCreate();
      unsubUpdate();
      unsubDelete();
      unsubConnect();
      unsubDisconnect();
    };
  }, [ano, joinRoom, leaveRoom, on, refetch]);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedEvento(null);
    setEventModalOpen(true);
  }, []);

  const handleEventClick = useCallback((evento: Evento) => {
    setSelectedEvento(evento);
    setSelectedDate(null);
    setEventModalOpen(true);
  }, []);

  const handleNewEvent = () => {
    setSelectedDate(new Date());
    setSelectedEvento(null);
    setEventModalOpen(true);
  };

  const handleExportPDF = () => {
    if (!eventosFiltrados || eventosFiltrados.length === 0) {
      toast.error("Não há eventos para exportar");
      return;
    }
    
    try {
      exportCalendarToPdf(eventosFiltrados, ano);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  const handleImport = () => {
    toast.info("Funcionalidade de importar em desenvolvimento");
  };

  const handleSettings = () => {
    setConfiguracoesModalOpen(true);
  };

  const handleClearFilters = () => {
    setTipoFilter("all");
    setResponsavelFilter("all");
  };

  const handleConfigUpdate = () => {
    refetchConfig();
  };

  // Agrupar eventos filtrados por mês
  const eventosPorMes = eventosFiltrados?.reduce((acc, evento) => {
    const date = typeof evento.dataEvento === "string" 
      ? new Date(evento.dataEvento) 
      : evento.dataEvento;
    const mes = date.getMonth() + 1;
    if (!acc[mes]) acc[mes] = [];
    acc[mes].push(evento);
    return acc;
  }, {} as Record<number, typeof eventosFiltrados>) || {};

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {titulo.includes("{ano}") ? titulo.replace("{ano}", ano.toString()) : titulo}
              </h1>
              <p className="text-sm text-muted-foreground">
                {subtitulo}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Indicador de conexão */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground mr-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="hidden sm:inline">Sincronizado</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="hidden sm:inline">Offline</span>
                  </>
                )}
              </div>

              {/* Navegação de ano */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setAno(ano - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-2 font-medium">{ano}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setAno(ano + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Toggle tema */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {user?.name || user?.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => logout()}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <a href={getLoginUrl()}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={handleNewEvent} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
            <Button variant="outline" onClick={handleImport} className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setResponsaveisModalOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
            >
              <Users className="w-4 h-4 mr-2" />
              Responsáveis
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setAniversariosModalOpen(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white border-pink-500"
            >
              <Cake className="w-4 h-4 mr-2" />
              Aniversários
            </Button>
            <Button variant="outline" onClick={handleSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </header>

      {/* Calendário */}
      <main className="container py-6 flex-1">
        {/* Barra de filtros */}
        <FilterBar
          tipoFilter={tipoFilter}
          responsavelFilter={responsavelFilter}
          onTipoChange={setTipoFilter}
          onResponsavelChange={setResponsavelFilter}
          onClearFilters={handleClearFilters}
          responsaveis={responsaveis || []}
          eventosCount={eventos?.length || 0}
          filteredCount={eventosFiltrados.length}
        />

        {eventosLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="calendar-grid">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
              <CalendarMonth
                key={mes}
                ano={ano}
                mes={mes}
                eventos={eventosPorMes[mes] || []}
                onDayClick={handleDayClick}
                onEventClick={handleEventClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      {rodape && (
        <footer className="bg-card border-t border-border py-4">
          <div className="container">
            <p className="text-sm text-muted-foreground text-center whitespace-pre-line">
              {rodape}
            </p>
          </div>
        </footer>
      )}

      {/* Modais */}
      <EventModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        evento={selectedEvento}
        selectedDate={selectedDate}
        onSuccess={() => {
          utils.eventos.list.invalidate();
        }}
      />

      <ResponsaveisModal
        open={responsaveisModalOpen}
        onOpenChange={setResponsaveisModalOpen}
      />

      <AniversariosModal
        open={aniversariosModalOpen}
        onOpenChange={setAniversariosModalOpen}
      />

      <ConfiguracoesModal
        open={configuracoesModalOpen}
        onOpenChange={setConfiguracoesModalOpen}
        onConfigUpdate={handleConfigUpdate}
      />
    </div>
  );
}
