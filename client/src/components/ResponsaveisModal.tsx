import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { toast } from "sonner";

interface ResponsaveisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResponsaveisModal({ open, onOpenChange }: ResponsaveisModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
  const [setor, setSetor] = useState("");

  const { data: responsaveis, isLoading } = trpc.responsaveis.list.useQuery({ apenasAtivos: true });
  const utils = trpc.useUtils();

  const createMutation = trpc.responsaveis.create.useMutation({
    onSuccess: () => {
      utils.responsaveis.list.invalidate();
      resetForm();
      toast.success("Responsável criado com sucesso!");
    },
    onError: () => toast.error("Erro ao criar responsável"),
  });

  const updateMutation = trpc.responsaveis.update.useMutation({
    onSuccess: () => {
      utils.responsaveis.list.invalidate();
      resetForm();
      toast.success("Responsável atualizado com sucesso!");
    },
    onError: () => toast.error("Erro ao atualizar responsável"),
  });

  const deleteMutation = trpc.responsaveis.delete.useMutation({
    onSuccess: () => {
      utils.responsaveis.list.invalidate();
      toast.success("Responsável removido com sucesso!");
    },
    onError: () => toast.error("Erro ao remover responsável"),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setNome("");
    setEmail("");
    setCargo("");
    setSetor("");
  };

  const handleEdit = (resp: { id: number; nome: string; email: string | null; cargo: string | null; setor: string | null }) => {
    setEditingId(resp.id);
    setNome(resp.nome);
    setEmail(resp.email || "");
    setCargo(resp.cargo || "");
    setSetor(resp.setor || "");
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        nome,
        email: email || undefined,
        cargo: cargo || undefined,
        setor: setor || undefined,
      });
    } else {
      createMutation.mutate({
        nome,
        email: email || undefined,
        cargo: cargo || undefined,
        setor: setor || undefined,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este responsável?")) {
      deleteMutation.mutate({ id });
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Responsáveis</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Novo Responsável
            </Button>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{editingId ? "Editar" : "Novo"} Responsável</h4>
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
          ) : responsaveis?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum responsável cadastrado
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {responsaveis?.map((resp) => (
                <div
                  key={resp.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{resp.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {[resp.cargo, resp.setor].filter(Boolean).join(" • ") || "Sem informações adicionais"}
                    </p>
                    {resp.email && (
                      <p className="text-sm text-muted-foreground">{resp.email}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(resp)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(resp.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
