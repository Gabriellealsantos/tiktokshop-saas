import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
  Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Textarea,
} from "@/components";
import type { DashboardInsight, InsightKind } from "@/models/dashboard";
import { INSIGHT_TITLE_MAX, INSIGHT_CONTENT_MAX } from "@/models/dashboard";
import {
  createInsight, deleteInsight, listAllInsights, updateInsight,
} from "@/services/dashboardAdminService";
import { cn } from "@/utils/utils";

const KIND_LABEL: Record<InsightKind, string> = {
  CARD: "Card",
  MOMENT_READ: "Leitura do momento",
};

const emptyForm = (): DashboardInsight => ({
  kind: "CARD", title: "", content: "", orderIndex: 0, active: true,
});

export function InsightsTab() {
  const [insights, setInsights] = useState<DashboardInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<DashboardInsight>(emptyForm());
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DashboardInsight | null>(null);

  // Limite de conteúdo depende do tipo (CARD compacto x Leitura do momento).
  const contentMax = INSIGHT_CONTENT_MAX[form.kind];

  // Validação inline do formulário de tendência (mesmas regras do backend).
  const titleError = !form.title.trim()
    ? "Informe um título."
    : form.title.trim().length > INSIGHT_TITLE_MAX
      ? `O título deve ter no máximo ${INSIGHT_TITLE_MAX} caracteres.`
      : null;
  const contentError = !form.content.trim()
    ? "Informe o conteúdo."
    : form.content.trim().length > contentMax
      ? `O conteúdo deve ter no máximo ${contentMax} caracteres.`
      : null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAllInsights();
      setInsights(res.data ?? []);
    } catch {
      toast.error("Falha ao carregar as tendências.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setAttempted(false);
    setDialogOpen(true);
  };

  const openEdit = (item: DashboardInsight) => {
    setEditingId(item.id ?? null);
    setForm({ ...item });
    setAttempted(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (titleError || contentError) {
      setAttempted(true);
      return;
    }
    setSaving(true);
    try {
      if (editingId != null) {
        await updateInsight(editingId, form);
        toast.success("Tendência atualizada.");
      } else {
        await createInsight(form);
        toast.success("Tendência criada.");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      const msg = axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message : undefined;
      toast.error(msg ?? "Falha ao salvar a tendência.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteInsight(deleteTarget.id);
      toast.success("Tendência excluída.");
      setDeleteTarget(null);
      await load();
    } catch {
      toast.error("Falha ao excluir.");
    }
  };

  return (
    <div className="space-y-4 entrance">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-400 max-w-2xl">
          Conteúdo da aba "Tendências" do dashboard. Cards aparecem no topo; a "Leitura do momento" é o bloco de texto largo.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="secondary" onClick={load} className="size-9 p-0 rounded-full" aria-label="Recarregar">
            <RefreshCw className="size-4" />
          </Button>
          <Button size="sm" onClick={openCreate} className="h-9">
            <Plus className="size-4 mr-1.5" /> Nova tendência
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
          <Loader2 className="size-4 animate-spin" /> Carregando tendências…
        </div>
      ) : insights.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-sm">
          Nenhuma tendência cadastrada. Clique em "Nova tendência" para começar.
        </div>
      ) : (
        <div className="grid gap-3">
          {insights.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-4 rounded-[16px] border p-4 transition-colors",
                item.active ? "border-white/5 bg-white/[0.02]" : "border-white/5 bg-white/[0.01] opacity-60",
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {KIND_LABEL[item.kind]}
                  </span>
                  {!item.active && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                      inativo
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-500">ordem {item.orderIndex ?? 0}</span>
                </div>
                <p className="font-bold text-white truncate">{item.title}</p>
                <p className="text-xs text-zinc-400 truncate">{item.content}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" className="h-9 px-3 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10" onClick={() => openEdit(item)}>
                  <Pencil className="size-3.5 mr-1.5" /> Editar
                </Button>
                <Button size="sm" variant="ghost" className="h-9 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20" onClick={() => setDeleteTarget(item)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setAttempted(false); }}>
        <DialogContent className="border-white/10 bg-zinc-950 text-white">
          <DialogHeader>
            <DialogTitle>{editingId != null ? "Editar tendência" : "Nova tendência"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Tipo</Label>
                <Select value={form.kind} onValueChange={(v: InsightKind) => setForm((p) => ({ ...p, kind: v }))}>
                  <SelectTrigger className="h-9 bg-black/40 border-white/10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="MOMENT_READ">Leitura do momento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="orderIndex" className="text-xs text-zinc-400">Ordem</Label>
                <Input
                  id="orderIndex"
                  type="number"
                  min="0"
                  value={form.orderIndex ?? 0}
                  onChange={(e) => setForm((p) => ({ ...p, orderIndex: e.target.value === "" ? null : Number(e.target.value) }))}
                  className="h-9 bg-black/40 border-white/10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="title" className="text-xs text-zinc-400">Título</Label>
                <span className={cn("text-[10px] tabular-nums", form.title.length >= INSIGHT_TITLE_MAX ? "text-red-400" : "text-zinc-500")}>
                  {form.title.length}/{INSIGHT_TITLE_MAX}
                </span>
              </div>
              <Input
                id="title"
                value={form.title}
                maxLength={INSIGHT_TITLE_MAX}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                aria-invalid={attempted && !!titleError}
                className={cn(
                  "h-9 bg-black/40 border-white/10 text-sm",
                  attempted && titleError && "border-red-500/50 focus-visible:ring-red-500/20",
                )}
              />
              {attempted && titleError && <p className="text-xs text-red-400">{titleError}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-xs text-zinc-400">Conteúdo</Label>
                <span className={cn("text-[10px] tabular-nums", form.content.length >= contentMax ? "text-red-400" : "text-zinc-500")}>
                  {form.content.length}/{contentMax}
                </span>
              </div>
              <Textarea
                id="content"
                rows={4}
                value={form.content}
                maxLength={contentMax}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                aria-invalid={attempted && !!contentError}
                className={cn(
                  "bg-black/40 border-white/10 text-sm",
                  attempted && contentError && "border-red-500/50 focus-visible:ring-red-500/20",
                )}
              />
              {attempted && contentError && <p className="text-xs text-red-400">{contentError}</p>}
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))} />
              <Label className="text-sm text-zinc-300">Ativo (visível no dashboard)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-white/10 bg-zinc-950 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tendência?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              "{deleteTarget?.title}" será removida do dashboard. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
