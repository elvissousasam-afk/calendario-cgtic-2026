import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Trash2 } from "lucide-react";

interface Evento {
  id?: number;
  titulo: string;
  descricao: string | null;
  dataEvento: Date | string;
  horaInicio: string | null;
  horaFim: string | null;
  tipoEvento: string;
  cor: string | null;
  responsavelId: number | null;
}

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evento?: Evento | null;
  selectedDate?: Date | null;
  onSuccess?: () => void;
}

const TIPOS_EVENTO = [
  { value: "reuniao", label: "Reunião", cor: "#3B82F6" },
  { value: "prazo", label: "Prazo", cor: "#EF4444" },
  { value: "evento", label: "Evento", cor: "#10B981" },
  { value: "feriado", label: "Feriado", cor: "#F59E0B" },
  { value: "aniversario", label: "Aniversário", cor: "#8B5CF6" },
  { value: "outro", label: "Outro", cor: "#6B7280" },
];

const CORES = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", 
  "#6B7280", "#EC4899", "#14B8A6", "#F97316", "#8B5CF6"
];

export function EventModal({ open, onOpenChange, evento, selectedDate, onSuccess }: EventModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [tipoEvento, setTipoEvento] = useState("evento");
  const [cor, setCor] = useState("#3B82F6");
  const [responsavelId, setResponsavelId] = useState<string>("");

  const { data: responsaveis } = trpc.responsaveis.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.eventos.create.useMutation({
    onSuccess: () => {
      utils.eventos.list.invalidate();
      onSuccess?.();
      onOpenChange(false);
      // Emitir evento de sincronização
      fetch("/api/sync/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "evento-created", data: { refresh: true } }),
      });
    },
  });

  const updateMutation = trpc.eventos.update.useMutation({
    onSuccess: () => {
      utils.eventos.list.invalidate();
      onSuccess?.();
      onOpenChange(false);
      fetch("/api/sync/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "evento-updated", data: { refresh: true } }),
      });
    },
  });

  const deleteMutation = trpc.eventos.delete.useMutation({
    onSuccess: () => {
      utils.eventos.list.invalidate();
      onSuccess?.();
      onOpenChange(false);
      fetch("/api/sync/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "evento-deleted", data: { refresh: true } }),
      });
    },
  });

  useEffect(() => {
    if (evento) {
      setTitulo(evento.titulo);
      setDescricao(evento.descricao || "");
      const date = typeof evento.dataEvento === "string" 
        ? new Date(evento.dataEvento) 
        : evento.dataEvento;
      setDataEvento(format(date, "yyyy-MM-dd"));
      setHoraInicio(evento.horaInicio || "");
      setHoraFim(evento.horaFim || "");
      setTipoEvento(evento.tipoEvento);
      setCor(evento.cor || "#3B82F6");
      setResponsavelId(evento.responsavelId?.toString() || "");
    } else if (selectedDate) {
      setTitulo("");
      setDescricao("");
      setDataEvento(format(selectedDate, "yyyy-MM-dd"));
      setHoraInicio("");
      setHoraFim("");
      setTipoEvento("evento");
      setCor("#3B82F6");
      setResponsavelId("");
    }
  }, [evento, selectedDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      titulo,
      descricao: descricao || undefined,
      dataEvento,
      horaInicio: horaInicio || undefined,
      horaFim: horaFim || undefined,
      tipoEvento: tipoEvento as "reuniao" | "prazo" | "evento" | "feriado" | "aniversario" | "outro",
      cor,
      responsavelId: responsavelId ? parseInt(responsavelId) : undefined,
    };

    if (evento?.id) {
      updateMutation.mutate({ id: evento.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (evento?.id && confirm("Tem certeza que deseja excluir este evento?")) {
      deleteMutation.mutate({ id: evento.id });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{evento?.id ? "Editar Evento" : "Novo Evento"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Digite o título do evento"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataEvento">Data *</Label>
              <Input
                id="dataEvento"
                type="date"
                value={dataEvento}
                onChange={(e) => setDataEvento(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoEvento">Tipo</Label>
              <Select value={tipoEvento} onValueChange={setTipoEvento}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_EVENTO.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tipo.cor }}
                        />
                        {tipo.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horaInicio">Hora Início</Label>
              <Input
                id="horaInicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaFim">Hora Fim</Label>
              <Input
                id="horaFim"
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Select value={responsavelId} onValueChange={setResponsavelId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {responsaveis?.map((resp) => (
                  <SelectItem key={resp.id} value={resp.id.toString()}>
                    {resp.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {CORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    cor === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setCor(c)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição do evento (opcional)"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            {evento?.id && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {evento?.id ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
