import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

interface CalendarMonthProps {
  ano: number;
  mes: number;
  eventos: Evento[];
  onDayClick?: (date: Date) => void;
  onEventClick?: (evento: Evento) => void;
}

// Cores neutras para os cabeçalhos dos meses (não conflitam com cores dos eventos)
const MONTH_COLORS: Record<number, string> = {
  1: "bg-slate-700",
  2: "bg-slate-600",
  3: "bg-zinc-700",
  4: "bg-zinc-600",
  5: "bg-neutral-700",
  6: "bg-neutral-600",
  7: "bg-stone-700",
  8: "bg-stone-600",
  9: "bg-gray-700",
  10: "bg-gray-600",
  11: "bg-slate-800",
  12: "bg-zinc-800",
};

const MONTH_NAMES = [
  "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
  "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
];

export function CalendarMonth({ ano, mes, eventos, onDayClick, onEventClick }: CalendarMonthProps) {
  // Ordenar eventos por data
  const eventosOrdenados = useMemo(() => {
    return [...eventos].sort((a, b) => {
      const dateA = typeof a.dataEvento === "string" ? new Date(a.dataEvento) : a.dataEvento;
      const dateB = typeof b.dataEvento === "string" ? new Date(b.dataEvento) : b.dataEvento;
      return dateA.getTime() - dateB.getTime();
    });
  }, [eventos]);

  const headerColor = MONTH_COLORS[mes] || "bg-gray-600";

  const handleAddEvent = () => {
    // Criar data do primeiro dia do mês para adicionar evento
    const date = new Date(ano, mes - 1, 1);
    onDayClick?.(date);
  };

  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border flex flex-col">
      {/* Cabeçalho do mês */}
      <div 
        className={cn("text-white text-center py-3 font-bold text-lg cursor-pointer hover:opacity-90 transition-opacity", headerColor)}
        onClick={handleAddEvent}
        title="Clique para adicionar evento"
      >
        {MONTH_NAMES[mes - 1]}
      </div>

      {/* Lista de eventos */}
      <div className="flex-1 p-3 min-h-[180px] max-h-[250px] overflow-y-auto">
        {eventosOrdenados.length === 0 ? (
          <div 
            className="h-full flex items-center justify-center text-muted-foreground text-sm cursor-pointer hover:bg-accent/30 rounded transition-colors"
            onClick={handleAddEvent}
          >
            <span className="text-center">
              Nenhum evento<br />
              <span className="text-xs">Clique para adicionar</span>
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {eventosOrdenados.map((evento) => {
              const dataEvento = typeof evento.dataEvento === "string" 
                ? new Date(evento.dataEvento) 
                : evento.dataEvento;
              
              return (
                <div
                  key={evento.id}
                  className="p-2 rounded-md cursor-pointer hover:opacity-80 transition-opacity text-white"
                  style={{ backgroundColor: evento.cor || "#3B82F6" }}
                  onClick={() => onEventClick?.(evento)}
                  title={`${evento.titulo}${evento.responsavelNome ? ` - ${evento.responsavelNome}` : ''}`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-bold bg-white/20 rounded px-1.5 py-0.5 shrink-0">
                        {format(dataEvento, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      {evento.horaInicio && (
                        <div className="text-xs bg-white/20 rounded px-1.5 py-0.5 shrink-0">
                          {evento.horaInicio?.substring(0, 5)}{evento.horaFim ? ` - ${evento.horaFim.substring(0, 5)}` : ''}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {evento.titulo}
                      </div>
                      {evento.responsavelNome && (
                        <div className="text-xs opacity-80 truncate">
                          {evento.responsavelNome}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
