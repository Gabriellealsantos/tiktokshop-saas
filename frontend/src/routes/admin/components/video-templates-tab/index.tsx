import { useCallback, useEffect, useState } from "react";
import { ImageIcon, Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
  Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Textarea,
} from "@/components";
import type { VideoTemplateAdmin, VideoTemplateForm } from "@/models/videoTemplate";
import {
  createVideoTemplate, deleteVideoTemplate, listAdminVideoTemplates, updateVideoTemplate,
} from "@/services/videoTemplateService";
import { ImageUpload, errMessage } from "../viral-tab/components/image-upload";
import { VideoUpload } from "../viral-tab/components/video-upload";

/** Mesmas categorias usadas no filtro da galeria (shared-models-view.tsx). */
const CATEGORIAS = ["Moda", "UGC", "Beleza"];
const SEM_CATEGORIA = "__none__";

const emptyForm = (): VideoTemplateForm => ({
  slug: "", title: "", category: null, thumbnailUrl: "", videoUrl: "",
  videoStyle: "", objective: "", tone: "", energy: "", duration: "",
  motionInstruction: "", sortOrder: 0, active: true,
});

export function VideoTemplatesTab() {
  const [items, setItems] = useState<VideoTemplateAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<VideoTemplateForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VideoTemplateAdmin | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminVideoTemplates();
      setItems(res.data ?? []);
    } catch {
      toast.error("Falha ao carregar os modelos de vídeo.");
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

  const openEdit = (item: VideoTemplateAdmin) => {
    setEditingId(item.id);
    setForm({
      slug: item.slug, title: item.title, category: item.category,
      thumbnailUrl: item.thumbnailUrl ?? "", videoUrl: item.videoUrl,
      videoStyle: item.videoStyle ?? "", objective: item.objective ?? "",
      tone: item.tone ?? "", energy: item.energy ?? "", duration: item.duration ?? "",
      motionInstruction: item.motionInstruction ?? "", sortOrder: item.sortOrder, active: item.active,
    });
    setDialogOpen(true);
  };

  const canSave = form.slug.trim() && form.title.trim() && form.videoUrl.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      if (editingId != null) {
        await updateVideoTemplate(editingId, form);
        toast.success("Modelo atualizado.");
      } else {
        await createVideoTemplate(form);
        toast.success("Modelo criado.");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao salvar o modelo."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVideoTemplate(deleteTarget.id);
      toast.success("Modelo excluído.");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao excluir o modelo."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 entrance">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-400 max-w-2xl">
          Modelos de vídeo públicos do fluxo "Templates" (extrair movimento). Envie um vídeo
          real (MP4/WEBM) — ele aparece na galeria de todos os usuários e alimenta o prompt Veo3
          via os campos de direção abaixo.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="secondary" onClick={load} className="size-9 p-0 rounded-full" aria-label="Recarregar">
            <RefreshCw className="size-4" />
          </Button>
          <Button size="sm" onClick={openCreate} className="h-9">
            <Plus className="size-4 mr-1.5" /> Novo modelo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
          <Loader2 className="size-4 animate-spin" /> Carregando modelos…
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-sm">
          Nenhum modelo cadastrado. Clique em "Novo modelo" para começar.
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-[16px] border border-white/5 bg-white/[0.02] p-4">
              <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-surface-2 flex items-center justify-center">
                {item.videoUrl ? (
                  <video src={item.videoUrl} poster={item.thumbnailUrl ?? undefined} className="w-full h-full object-cover" muted loop autoPlay playsInline preload="metadata" />
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
                {item.category && <p className="text-xs text-zinc-500 truncate mt-0.5">{item.category}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
            <DialogTitle>{editingId != null ? "Editar modelo" : "Novo modelo"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="creme-facial-ugc" className="h-9 bg-black/40 border-white/10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Título *</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Rotina de skincare" className="h-9 bg-black/40 border-white/10 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Categoria</Label>
                <Select
                  value={form.category ?? SEM_CATEGORIA}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v === SEM_CATEGORIA ? null : v }))}
                >
                  <SelectTrigger className="h-9 bg-black/40 border-white/10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
                    <SelectItem value={SEM_CATEGORIA}>Sem categoria</SelectItem>
                    {CATEGORIAS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Ordem de exibição</Label>
                <Input
                  type="number"
                  value={form.sortOrder ?? 0}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))}
                  className="h-9 bg-black/40 border-white/10 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Thumbnail</Label>
                <ImageUpload value={form.thumbnailUrl} folder="video-templates" onChange={(url) => setForm((p) => ({ ...p, thumbnailUrl: url }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Vídeo *</Label>
                <VideoUpload value={form.videoUrl} folder="video-templates" onChange={(url) => setForm((p) => ({ ...p, videoUrl: url }))} />
                <p className="text-[10px] text-zinc-500">MP4/WEBM vertical (9:16), 1080×1920, até 10s.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Estilo do vídeo</Label>
                <Input value={form.videoStyle ?? ""} onChange={(e) => setForm((p) => ({ ...p, videoStyle: e.target.value }))} placeholder="UGC, closeup, mão segurando o produto" className="h-9 bg-black/40 border-white/10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Objetivo</Label>
                <Input value={form.objective ?? ""} onChange={(e) => setForm((p) => ({ ...p, objective: e.target.value }))} placeholder="Demonstrar textura do produto" className="h-9 bg-black/40 border-white/10 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Tom</Label>
                <Input value={form.tone ?? ""} onChange={(e) => setForm((p) => ({ ...p, tone: e.target.value }))} placeholder="Casual, íntimo" className="h-9 bg-black/40 border-white/10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Energia</Label>
                <Input value={form.energy ?? ""} onChange={(e) => setForm((p) => ({ ...p, energy: e.target.value }))} placeholder="Calma, ritmo lento" className="h-9 bg-black/40 border-white/10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Duração</Label>
                <Input value={form.duration ?? ""} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} placeholder="6-8s" className="h-9 bg-black/40 border-white/10 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Instrução de movimento</Label>
              <Textarea
                value={form.motionInstruction ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, motionInstruction: e.target.value }))}
                placeholder="Descreva o movimento de câmera e da cena para orientar o prompt Veo3 gerado a partir deste modelo."
                className="min-h-[100px] font-mono text-xs bg-black/40 border-white/10"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Switch checked={form.active ?? true} onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))} />
              <Label className="text-xs text-zinc-400">Ativo (visível na galeria dos usuários)</Label>
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
            <AlertDialogTitle>Excluir modelo?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              "{deleteTarget?.title}" deixará de aparecer na galeria de todos os usuários. Esta ação não pode ser desfeita.
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