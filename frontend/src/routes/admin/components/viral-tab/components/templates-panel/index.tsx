import { useCallback, useEffect, useState } from "react";
import { ImageIcon, Loader2, Pencil, Plus, RefreshCw, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
  Input, Label, Switch, Textarea,
} from "@/components";
import type { ViralTemplateAdmin, ViralTemplateForm } from "@/models/viral";
import {
  createViralTemplate, deleteViralTemplate, listAdminViralTemplates, updateViralTemplate,
} from "@/services/viralService";
import { ImageUpload, errMessage } from "../image-upload";
import { VideoUpload } from "../video-upload";
import { CharactersManager } from "../characters-manager";

const emptyForm = (): ViralTemplateForm => ({
  slug: "", title: "", subtitle: "", description: "", thumbnailUrl: "", previewVideoUrl: "",
  scriptInstruction: "", promptInstruction: "", category: "", active: true,
});

export function TemplatesPanel() {
  const [items, setItems] = useState<ViralTemplateAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [managing, setManaging] = useState<ViralTemplateAdmin | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ViralTemplateForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ViralTemplateAdmin | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminViralTemplates();
      setItems(res.data ?? []);
    } catch {
      toast.error("Falha ao carregar os templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (item: ViralTemplateAdmin) => {
    setEditingId(item.id);
    setForm({
      slug: item.slug, title: item.title, subtitle: item.subtitle ?? "", description: item.description ?? "",
      thumbnailUrl: item.thumbnailUrl ?? "", previewVideoUrl: item.previewVideoUrl ?? "",
      scriptInstruction: item.scriptInstruction, promptInstruction: item.promptInstruction,
      category: item.category ?? "", active: item.active,
    });
    setDialogOpen(true);
  };

  const canSave = form.slug.trim() && form.title.trim() && form.scriptInstruction.trim() && form.promptInstruction.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const payload = { ...form, category: form.category?.trim() || null };
    try {
      if (editingId != null) {
        await updateViralTemplate(editingId, payload);
        toast.success("Template atualizado.");
      } else {
        await createViralTemplate(payload);
        toast.success("Template criado.");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao salvar o template."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteViralTemplate(deleteTarget.id);
      toast.success("Template excluído.");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao excluir o template."));
    } finally {
      setDeleting(false);
    }
  };

  if (managing) {
    return <CharactersManager template={managing} onBack={() => { setManaging(null); load(); }} />;
  }

  return (
    <div className="space-y-4 entrance">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-400 max-w-2xl">
          Templates do fluxo viral. As instruções (roteiros e prompt) usam placeholders como
          {" "}<code className="text-brand-300">{"{{characterName}}"}</code>,{" "}
          <code className="text-brand-300">{"{{toneLabel}}"}</code> que são preenchidos na geração.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="secondary" onClick={load} className="size-9 p-0 rounded-full" aria-label="Recarregar">
            <RefreshCw className="size-4" />
          </Button>
          <Button size="sm" onClick={openCreate} className="h-9">
            <Plus className="size-4 mr-1.5" /> Novo template
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
          <Loader2 className="size-4 animate-spin" /> Carregando templates…
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-sm">
          Nenhum template cadastrado. Clique em "Novo template" para começar.
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-[16px] border border-white/5 bg-white/[0.02] p-4">
              <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-surface-2 flex items-center justify-center">
                {item.previewVideoUrl ? (
                  <video src={item.previewVideoUrl} poster={item.thumbnailUrl ?? undefined} className="w-full h-full object-cover" muted loop autoPlay playsInline preload="metadata" />
                ) : item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="size-5 text-white/20" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white truncate">{item.title}</p>
                  {!item.active && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">inativo</span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 truncate">{item.slug}</p>
                {item.subtitle && <p className="text-xs text-zinc-500 truncate mt-0.5">{item.subtitle}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" className="h-9 px-3 text-brand-300 hover:text-brand-200 hover:bg-brand-500/10 border border-brand-500/20" onClick={() => setManaging(item)}>
                  <Users className="size-3.5 mr-1.5" /> Personagens
                </Button>
                <Button size="sm" variant="ghost" className="h-9 px-3 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10" onClick={() => openEdit(item)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-9 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20" onClick={() => setDeleteTarget(item)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-white/10 bg-zinc-950 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId != null ? "Editar template" : "Novo template"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="novelinha" className="h-9 bg-black/40 border-white/10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Título *</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Vovôs e Vovós" className="h-9 bg-black/40 border-white/10 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Subtítulo</Label>
              <Input value={form.subtitle ?? ""} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} className="h-9 bg-black/40 border-white/10 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Descrição</Label>
              <Textarea value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="min-h-[60px] bg-black/40 border-white/10 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Thumbnail</Label>
                <ImageUpload value={form.thumbnailUrl} folder="viral/templates" onChange={(url) => setForm((p) => ({ ...p, thumbnailUrl: url }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Vídeo de preview</Label>
                <VideoUpload value={form.previewVideoUrl} folder="viral/templates" onChange={(url) => setForm((p) => ({ ...p, previewVideoUrl: url }))} />
                <p className="text-[10px] text-zinc-500">MP4/WEBM vertical (9:16), 1080×1920, até 10s.</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Categoria</Label>
              <Input
                value={form.category ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="POV, Trend…"
                className="h-9 bg-black/40 border-white/10 text-sm"
              />
              <p className="text-[10px] text-zinc-500">
                Tag livre exibida na vitrine. Deixe vazio se o modelo não tem categoria.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Instrução de roteiros (.md) *</Label>
              <Textarea value={form.scriptInstruction} onChange={(e) => setForm((p) => ({ ...p, scriptInstruction: e.target.value }))} placeholder="Você é um roteirista… {{templateTitle}} {{characterName}} {{toneLabel}}" className="min-h-[120px] font-mono text-xs bg-black/40 border-white/10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Instrução de prompt final (.md) *</Label>
              <Textarea value={form.promptInstruction} onChange={(e) => setForm((p) => ({ ...p, promptInstruction: e.target.value }))} placeholder="Você é um diretor de vídeo… {{scriptTitle}} {{scriptQuote}}" className="min-h-[120px] font-mono text-xs bg-black/40 border-white/10" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch checked={form.active ?? true} onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))} />
              <Label className="text-xs text-zinc-400">Ativo (visível no fluxo do usuário)</Label>
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
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              "{deleteTarget?.title}" e todos os seus personagens serão removidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" disabled={deleting} onClick={handleDelete}>
              {deleting && <Loader2 className="size-4 mr-1.5 animate-spin" />} Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
