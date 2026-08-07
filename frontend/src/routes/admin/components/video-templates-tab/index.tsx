import { useCallback, useEffect, useState } from "react";
import { ImageIcon, Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
  Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Textarea,
} from "@/components";
import type { VideoAudioMode, VideoTemplateAdmin, VideoTemplateForm } from "@/models/videoTemplate";
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
  motionInstruction: "", audioMode: "NARRACAO", sortOrder: 0, active: true,
});

/** Opções do dropdown de áudio/fala (casa com o enum VideoAudioMode do backend). */
const AUDIO_MODES: { value: VideoAudioMode; label: string; hint: string }[] = [
  { value: "NARRACAO", label: "Narração — personagem fala (pt-BR)", hint: "Diálogo, voiceover e CTA falado em português. Comportamento padrão." },
  { value: "MUSICA", label: "Música — sem fala", hint: "Sem diálogo, voz ou narração; trilha/áudio em alta. CTA só visual." },
  { value: "SILENCIO", label: "Silêncio — sem fala", hint: "Sem diálogo, voz ou narração; mantém só o som ambiente da cena (não gera vídeo 100% mudo). CTA só visual." },
];

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
      motionInstruction: item.motionInstruction ?? "", audioMode: item.audioMode ?? "NARRACAO",
      sortOrder: item.sortOrder, active: item.active,
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
            <div key={item.id} className="relative overflow-hidden flex items-center gap-4 rounded-2xl border border-dash-border bg-dash-surface backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_-8px_oklch(0_0_0/0.5),inset_0_1px_0_0_oklch(1_0_0/0.10)] p-4 transition-all duration-200 hover:bg-dash-surface-hover hover:border-dash-border-hover before:absolute before:inset-0 before:pointer-events-none before:bg-dash-tint after:absolute after:inset-0 after:pointer-events-none after:bg-linear-to-b after:from-white/[0.07] after:via-transparent after:to-transparent">
              <div className="relative z-10 w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-surface-2 flex items-center justify-center">
                {item.videoUrl ? (
                  <video src={item.videoUrl} poster={item.thumbnailUrl ?? undefined} className="w-full h-full object-cover" muted loop autoPlay playsInline preload="metadata" />
                ) : item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="size-5 text-white/20" />
                )}
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white truncate">{item.title}</p>
                  {!item.active && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">inativo</span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 truncate">{item.slug}</p>
                {item.category && <p className="text-xs text-zinc-500 truncate mt-0.5">{item.category}</p>}
              </div>
              <div className="relative z-10 flex items-center gap-2 shrink-0">
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
                <ImageUpload value={form.thumbnailUrl} fallbackVideoUrl={form.videoUrl} folder="video-templates" onChange={(url) => setForm((p) => ({ ...p, thumbnailUrl: url }))} />
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
              <Label className="text-xs text-zinc-400">Áudio / fala</Label>
              <Select
                value={form.audioMode ?? "NARRACAO"}
                onValueChange={(v) => setForm((p) => ({ ...p, audioMode: v as VideoAudioMode }))}
              >
                <SelectTrigger className="h-9 bg-black/40 border-white/10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
                  {AUDIO_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-zinc-500">
                {AUDIO_MODES.find((m) => m.value === (form.audioMode ?? "NARRACAO"))?.hint}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Script de movimento (timestamped)</Label>
              <Textarea
                value={form.motionInstruction ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, motionInstruction: e.target.value }))}
                placeholder={"Cole aqui o script de movimento COMPLETO, batida por batida com timestamps — a IA de vídeo segue exatamente este texto.\nEx.: 0.0s–0.8s: the subject looks at the camera and smiles...\n0.8s–1.8s: turns the body slightly and raises the product to chest height...\n\nDeixe vazio para usar um movimento genérico padrão."}
                className="min-h-40 font-mono text-xs bg-black/40 border-white/10"
              />
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Este texto é anexado ao prompt <strong className="text-zinc-400">sem passar pela IA</strong> —
                sai palavra por palavra igual ao que você escrever, para qualquer produto escolhido.
                Descreva <strong className="text-zinc-400">só o movimento</strong>: o produto já chega
                pela imagem que o usuário monta (avatar + produto), então não cite marca, nome nem
                formato. Se o produto for de segurar ou aplicar, inclua os beats dele como{" "}
                <strong className="text-zinc-400">"the product"</strong> — sem esses beats o produto
                não aparece no vídeo. O pronome do sujeito ("she", "he", "the subject") deve casar com
                o público do template, porque ele vale para todos os avatares que o usarem.
              </p>
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