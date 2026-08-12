import { useCallback, useEffect, useState } from "react";
import {
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import type {
  GalleryAvatarAdmin,
  GalleryAvatarForm,
} from "@/models/galleryAvatar";
import {
  createGalleryAvatar,
  deleteGalleryAvatar,
  listAdminGalleryAvatars,
  updateGalleryAvatar,
} from "@/services/galleryAvatarService";
import { ImageUpload, errMessage } from "../viral-tab/components/image-upload";

const GENEROS = ["Feminino", "Masculino"];
const GALLERY_TYPE = "SISTEMA";

const emptyForm = (): GalleryAvatarForm => ({
  name: "",
  gender: "Feminino",
  type: GALLERY_TYPE,
  imageUrl: "",
  orderIndex: 0,
  customPrompt: "",
});

export function GalleryAvatarsTab() {
  const [items, setItems] = useState<GalleryAvatarAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<GalleryAvatarForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryAvatarAdmin | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminGalleryAvatars();
      setItems(res.data ?? []);
    } catch {
      toast.error("Falha ao carregar os avatares da galeria.");
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
    setDialogOpen(true);
  };

  const openEdit = (item: GalleryAvatarAdmin) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      gender: item.gender ?? "Feminino",
      type: item.type ?? GALLERY_TYPE,
      imageUrl: item.imageUrl,
      orderIndex: item.orderIndex ?? 0,
      customPrompt: item.customPrompt ?? "",
    });
    setDialogOpen(true);
  };

  const canSave = form.name.trim() && form.imageUrl.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      if (editingId != null) {
        await updateGalleryAvatar(editingId, form);
        toast.success("Avatar atualizado.");
      } else {
        await createGalleryAvatar(form);
        toast.success("Avatar criado.");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao salvar o avatar."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteGalleryAvatar(deleteTarget.id);
      toast.success("Avatar excluído.");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao excluir o avatar."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 entrance">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-400 max-w-2xl">
          Avatares prontos da galeria (fluxo "Avatar"). Envie uma foto de corpo
          inteiro (9:16) — ela aparece para todos os usuários na seleção de
          avatares do sistema.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            onClick={load}
            className="size-9 p-0 rounded-full"
            aria-label="Recarregar"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button size="sm" onClick={openCreate} className="h-9">
            <Plus className="size-4 mr-1.5" /> Novo avatar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
          <Loader2 className="size-4 animate-spin" /> Carregando avatares…
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-sm">
          Nenhum avatar cadastrado. Clique em "Novo avatar" para começar.
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-premium-purple relative overflow-hidden flex items-center gap-4 rounded-2xl border border-white/10 p-4 transition-all duration-200 hover:border-white/20 shadow-lg"
            >
              <div className="relative z-10 w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-surface-2 flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="size-5 text-white/20" />
                )}
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="font-bold text-white truncate">{item.name}</p>
                {item.gender && (
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {item.gender}
                  </p>
                )}
              </div>
              <div className="relative z-10 flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 px-3 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-white/10 bg-zinc-950 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId != null ? "Editar avatar" : "Novo avatar"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Nome *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Ana Beatriz"
                  className="h-9 bg-black/40 border-white/10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Gênero</Label>
                <Select
                  value={form.gender ?? "Feminino"}
                  onValueChange={(v) => setForm((p) => ({ ...p, gender: v }))}
                >
                  <SelectTrigger className="h-9 bg-black/40 border-white/10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
                    {GENEROS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Ordem de exibição</Label>
              <Input
                type="number"
                value={form.orderIndex}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    orderIndex: Number(e.target.value) || 0,
                  }))
                }
                className="h-9 bg-black/40 border-white/10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Prompt Customizado (Aparência, rosto, cabelo)</Label>
              <Input
                value={form.customPrompt ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customPrompt: e.target.value }))
                }
                placeholder="Ex: A 25-year-old latina woman, brown hair..."
                className="h-9 bg-black/40 border-white/10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Foto do avatar *</Label>
              <ImageUpload
                value={form.imageUrl}
                folder="gallery"
                onChange={(url) => setForm((p) => ({ ...p, imageUrl: url }))}
              />
              <p className="text-[10px] text-zinc-500">
                Corpo inteiro, vertical (9:16). PNG, JPG ou WEBP.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !canSave}>
              {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}{" "}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-white/10 bg-zinc-950 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir avatar?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              "{deleteTarget?.name}" deixará de aparecer na galeria de todos os
              usuários. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting && <Loader2 className="size-4 mr-1.5 animate-spin" />}{" "}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
