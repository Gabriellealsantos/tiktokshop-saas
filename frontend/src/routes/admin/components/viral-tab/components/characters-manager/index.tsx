import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ImageIcon, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
  Input, Label, Switch, Textarea,
} from "@/components";
import type { ViralCharacterAdmin, ViralCharacterForm, ViralTemplateAdmin } from "@/models/viral";
import {
  addViralCharacter, deleteViralCharacter, listAdminViralCharacters, updateViralCharacter,
} from "@/services/viralService";
import { cn } from "@/utils/utils";
import { ImageUpload, errMessage } from "../image-upload";

const emptyForm = (): ViralCharacterForm => ({
  slug: "", name: "", description: "", imageUrl: "", sortOrder: 0, active: true,
});

interface CharactersManagerProps {
  template: ViralTemplateAdmin;
  onBack: () => void;
}

export function CharactersManager({ template, onBack }: CharactersManagerProps) {
  const [items, setItems] = useState<ViralCharacterAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ViralCharacterForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ViralCharacterAdmin | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminViralCharacters(template.id);
      setItems(res.data ?? []);
    } catch {
      toast.error("Falha ao carregar os personagens.");
    } finally {
      setLoading(false);
    }
  }, [template.id]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), sortOrder: items.length });
    setDialogOpen(true);
  };

  const openEdit = (item: ViralCharacterAdmin) => {
    setEditingId(item.id);
    setForm({
      slug: item.slug, name: item.name, description: item.description ?? "",
      imageUrl: item.imageUrl ?? "", sortOrder: item.sortOrder, active: item.active,
    });
    setDialogOpen(true);
  };

  const canSave = form.slug.trim() && form.name.trim() && form.description.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      if (editingId != null) {
        await updateViralCharacter(editingId, form);
        toast.success("Personagem atualizado.");
      } else {
        await addViralCharacter(template.id, form);
        toast.success("Personagem criado.");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao salvar o personagem."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteViralCharacter(deleteTarget.id);
      toast.success("Personagem excluído.");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao excluir o personagem."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 entrance">
      <div className="flex items-center justify-between gap-4">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-text-2 hover:text-white transition-colors">
          <ChevronLeft className="size-4" /> Voltar aos templates
        </button>
        <Button size="sm" onClick={openCreate} className="h-9">
          <Plus className="size-4 mr-1.5" /> Novo personagem
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white">Personagens de "{template.title}"</h3>
        <p className="text-xs text-text-3">Slug do template: {template.slug}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
          <Loader2 className="size-4 animate-spin" /> Carregando personagens…
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-sm">
          Nenhum personagem. Clique em "Novo personagem" para começar.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-[16px] border border-white/5 bg-white/[0.02] p-3">
              <div className="size-14 shrink-0 rounded-lg overflow-hidden bg-surface-2 flex items-center justify-center">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="size-5 text-white/20" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white truncate">{item.name}</p>
                  {!item.active && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">inativo</span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 truncate">{item.slug} · ordem {item.sortOrder}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button size="sm" variant="ghost" className="h-8 px-2 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10" onClick={() => openEdit(item)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20" onClick={() => setDeleteTarget(item)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-white/10 bg-zinc-950 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId != null ? "Editar personagem" : "Novo personagem"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="char-1" className="h-9 bg-black/40 border-white/10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Ordem</Label>
                <Input type="number" value={form.sortOrder ?? 0} onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} className="h-9 bg-black/40 border-white/10 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Vovô do Triciclo" className="h-9 bg-black/40 border-white/10 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Descrição / direção de cena *</Label>
              <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Idoso pilotando um triciclo infantil como se fosse uma moto potente…" className="min-h-[80px] bg-black/40 border-white/10 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Imagem</Label>
              <ImageUpload value={form.imageUrl} folder={`viral/characters/${template.slug}`} onChange={(url) => setForm((p) => ({ ...p, imageUrl: url }))} />
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

      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-white/10 bg-zinc-950 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir personagem?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              "{deleteTarget?.name}" será removido. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction className={cn("bg-red-500 hover:bg-red-600 text-white")} disabled={deleting} onClick={handleDelete}>
              {deleting && <Loader2 className="size-4 mr-1.5 animate-spin" />} Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
