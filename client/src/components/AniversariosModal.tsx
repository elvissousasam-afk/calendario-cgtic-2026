import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, Edit2, X, Check, Cake } from "lucide-react";
import { toast } from "sonner";

interface AniversariosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AniversariosModal({ open, onOpenChange }: AniversariosModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cargo, setCargo] = useState("");
  const [setor, setSetor] = useState("");

  const { data: aniversarios, isLoading } = trpc.aniversarios.list.useQuery({ apenasAtivos: true });
  const utils = trpc.useUtils();

  const createMutation = trpc.aniversarios.create.useMutation({
    onSuccess: () => {
      utils.aniversarios.list.invalidate();
      resetForm();
      toast.success("Aniversário cadastrado com sucesso!");
    },
    onError: () => toast.error("Erro ao cadastrar aniversário"),
  });

  const updateMutation = trpc.aniversarios.update.useMutation({
    onSuccess: () => {
      utils.aniversarios.list.invalidate();
      resetForm();
      toast.success("Aniversário atualizado com sucesso!");
    },
    onError: () => toast.error("Erro ao atualizar aniversário"),
  });

  const deleteMutation = trpc.aniversarios.delete.useMutation({
    onSuccess: () => {
      utils.aniversarios.list.invalidate();
      toast.success("Aniversário removido com sucesso!");
    },
    onError: () => toast.error("Erro ao remover aniversário"),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setNome("");
    setDataNascimento("");
    setCargo("");
    setSetor("");
  };

  const handleEdit = (aniv: { id: number; nome: string; dataNascimento: Date | string; cargo: string | null; setor: string | null }) => {
    setEditingId(aniv.id);
    setNome(aniv.nome);
    const date = typeof aniv.dataNascimento === "string" ? new Date(aniv.dataNascimento) : aniv.dataNascimento;
    setDataNascimento(format(date, "yyyy-MM-dd"));
    setCargo(aniv.cargo || "");
    setSetor(aniv.setor || "");
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        nome,
        dataNascimento,
        cargo: cargo || undefined,
        setor: setor || undefined,
      });
    } else {
      createMutation.mutate({
        nome,
        dataNascimento,
        cargo: cargo || undefined,
        setor: setor || undefined,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este aniversário?")) {
      deleteMutation.mutate({ id });
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // Ordenar por data de nascimento (mês/dia)
  const sortedAniversarios = aniversarios?.slice().sort((a, b) => {
    const dateA = typeof a.dataNascimento === "string" ? new Date(a.dataNascimento) : a.dataNascimento;
    const dateB = typeof b.dataNascimento === "string" ? new Date(b.dataNascimento) : b.dataNascimento;
    const monthDiff = dateA.getMonth() - dateB.getMonth();
    if (monthDiff !== 0) return monthDiff;
    return dateA.getDate() - dateB.getDate();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cake className="w-5 h-5" />
            Gerenciar Aniversários
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Novo Aniversário
            </Button>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{editingId ? "Editar" : "Novo"} Aniversário</h4>
                <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setor">Setor</Label>
                  <Input
                    id="setor"
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isMutating}>
                  {isMutating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Check className="w-4 h-4 mr-2" />
                  {editingId ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : sortedAniversarios?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum aniversário cadastrado
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {sortedAniversarios?.map((aniv) => {
                const date = typeof aniv.dataNascimento === "string" 
                  ? new Date(aniv.dataNascimento) 
                  : aniv.dataNascimento;
                
                return (
                  <div
                    key={aniv.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <Cake className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">{aniv.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(date, "dd/MM")}
                          {aniv.cargo && ` • ${aniv.cargo}`}
                          {aniv.setor && ` • ${aniv.setor}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(aniv)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(aniv.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
