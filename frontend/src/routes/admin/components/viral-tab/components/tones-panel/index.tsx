import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
  Input, Label, Switch,
} from "@/components";
import type { ViralToneAdmin, ViralToneForm } from "@/models/viral";
import { createViralTone, listAdminViralTones, updateViralTone } from "@/services/viralService";
import { errMessage } from "../image-upload";

const emptyForm = (): ViralToneForm => ({ slug: "", label: "", description: "", sortOrder: 0, active: true });

export function TonesPanel() {
  const [items, setItems] = useState<ViralToneAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ViralToneForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminViralTones();
      setItems(res.data ?? []);
    } catch {
      toast.error("Falha ao carregar os tons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), sortOrder: items.length });
    setDialogOpen(true);
  };

  const openEdit = (item: ViralToneAdmin) => {
    setEditingId(item.id);
    setForm({ slug: item.slug, label: item.label, description: item.description ?? "", sortOrder: item.sortOrder, active: item.active });
    setDialogOpen(true);
  };

  const canSave = form.slug.trim() && form.label.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      if (editingId != null) {
        await updateViralTone(editingId, form);
        toast.success("Tom atualizado.");
      } else {
        await createViralTone(form);
        toast.success("Tom criado.");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao salvar o tom."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 entrance">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-400 max-w-2xl">
          Tons globais aplicáveis a qualquer template (ex.: Engraçado, Sarcástico). Tons não podem ser
          excluídos — para tirar de circulação, desative o campo "Ativo".
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="secondary" onClick={load} className="size-9 p-0 rounded-full" aria-label="Recarregar">
            <RefreshCw className="size-4" />
          </Button>
          <Button size="sm" onClick={openCreate} className="h-9">
            <Plus className="size-4 mr-1.5" /> Novo tom
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
          <Loader2 className="size-4 animate-spin" /> Carregando tons…
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-sm">Nenhum tom cadastrado.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="relative overflow-hidden flex items-center gap-4 rounded-2xl border border-dash-border bg-dash-surface backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_-8px_oklch(0_0_0/0.5),inset_0_1px_0_0_oklch(1_0_0/0.10)] p-4 transition-all duration-200 hover:bg-dash-surface-hover hover:border-dash-border-hover before:absolute before:inset-0 before:pointer-events-none before:bg-dash-tint after:absolute after:inset-0 after:pointer-events-none after:bg-linear-to-b after:from-white/[0.07] after:via-transparent after:to-transparent">
              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white truncate">{item.label}</p>
                  {!item.active && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">inativo</span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 truncate">{item.slug} · ordem {item.sortOrder}</p>
                {item.description && <p className="text-xs text-zinc-500 truncate mt-0.5">{item.description}</p>}
              </div>
              <Button size="sm" variant="ghost" className="relative z-10 h-9 px-3 shrink-0 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10" onClick={() => openEdit(item)}>
                <Pencil className="size-3.5 mr-1.5" /> Editar
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-white/10 bg-zinc-950 text-white">
          <DialogHeader>
            <DialogTitle>{editingId != null ? "Editar tom" : "Novo tom"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="funny" className="h-9 bg-black/40 border-white/10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Ordem</Label>
                <Input type="number" value={form.sortOrder ?? 0} onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} className="h-9 bg-black/40 border-white/10 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Rótulo *</Label>
              <Input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} placeholder="Engraçado" className="h-9 bg-black/40 border-white/10 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Descrição</Label>
              <Input value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Punchline e humor leve" className="h-9 bg-black/40 border-white/10 text-sm" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch checked={form.active ?? true} onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))} />
              <Label className="text-xs text-zinc-400">Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !canSave}>
              {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
