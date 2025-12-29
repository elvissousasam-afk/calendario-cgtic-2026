import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

interface Responsavel {
  id: number;
  nome: string;
}

interface FilterBarProps {
  tipoFilter: string;
  responsavelFilter: string;
  onTipoChange: (value: string) => void;
  onResponsavelChange: (value: string) => void;
  onClearFilters: () => void;
  responsaveis: Responsavel[];
  eventosCount: number;
  filteredCount: number;
}

const TIPOS_EVENTO = [
  { value: "all", label: "Todos os tipos", cor: "#6B7280" },
  { value: "reuniao", label: "Reunião", cor: "#3B82F6" },
  { value: "prazo", label: "Prazo", cor: "#EF4444" },
  { value: "evento", label: "Evento", cor: "#10B981" },
  { value: "feriado", label: "Feriado", cor: "#F59E0B" },
  { value: "aniversario", label: "Aniversário", cor: "#8B5CF6" },
  { value: "outro", label: "Outro", cor: "#6B7280" },
];

export function FilterBar({
  tipoFilter,
  responsavelFilter,
  onTipoChange,
  onResponsavelChange,
  onClearFilters,
  responsaveis,
  eventosCount,
  filteredCount,
}: FilterBarProps) {
  const hasFilters = tipoFilter !== "all" || responsavelFilter !== "all";

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>

        {/* Filtro por tipo */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tipo:</span>
          <Select value={tipoFilter} onValueChange={onTipoChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_EVENTO.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  <div className="flex items-center gap-2">
                    {tipo.value !== "all" && (
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tipo.cor }}
                      />
                    )}
                    {tipo.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por responsável */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Responsável:</span>
          <Select value={responsavelFilter} onValueChange={onResponsavelChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="none">Sem responsável</SelectItem>
              {responsaveis.map((resp) => (
                <SelectItem key={resp.id} value={resp.id.toString()}>
                  {resp.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Limpar filtros */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}

        {/* Contador de resultados */}
        <div className="ml-auto flex items-center gap-2">
          {hasFilters ? (
            <Badge variant="secondary">
              {filteredCount} de {eventosCount} eventos
            </Badge>
          ) : (
            <Badge variant="outline">
              {eventosCount} eventos
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
