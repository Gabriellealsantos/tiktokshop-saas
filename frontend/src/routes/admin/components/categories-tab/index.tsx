import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Lock, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
  Input, Label,
} from "@/components";
import type { Category } from "@/models/category";
import {
  createCategory, deleteCategory, getCategories, updateCategory,
} from "@/services/categoryService";

const emptyForm = (): Category => ({ name: "", system: false });

/** Extrai a mensagem de erro de negócio do backend (BusinessException), com fallback. */
const errMessage = (e: unknown, fallback: string): string =>
  (axios.isAxiosError(e) ? (e.response?.data as { message?: string } | undefined)?.message : undefined) ?? fallback;

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Category>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data ?? []);
    } catch {
      toast.error("Falha ao carregar as categorias.");
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

  const openEdit = (item: Category) => {
    setEditingId(item.id ?? null);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (name.length < 2) {
      toast.error("O nome deve ter ao menos 2 caracteres.");
      return;
    }
    setSaving(true);
    try {
      if (editingId != null) {
        await updateCategory(editingId, { ...form, name });
        toast.success("Categoria atualizada.");
      } else {
        await createCategory({ ...form, name });
        toast.success("Categoria criada.");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao salvar a categoria."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success("Categoria excluída.");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao excluir a categoria."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 entrance">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-400 max-w-2xl">
          Categorias usadas para classificar os produtos minerados. O identificador (slug) e a ordem são
          gerados automaticamente. Categorias padrão do sistema não podem ser excluídas.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="secondary" onClick={load} className="size-9 p-0 rounded-full" aria-label="Recarregar">
            <RefreshCw className="size-4" />
          </Button>
          <Button size="sm" onClick={openCreate} className="h-9">
            <Plus className="size-4 mr-1.5" /> Nova categoria
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
          <Loader2 className="size-4 animate-spin" /> Carregando categorias…
        </div>
      ) : categories.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-sm">
          Nenhuma categoria cadastrada. Clique em "Nova categoria" para começar.
        </div>
      ) : (
        <div className="grid gap-3">
          {categories.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-[16px] border border-white/5 bg-white/[0.02] p-4 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {item.system && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                      <Lock className="size-2.5" /> sistema
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-500">ordem {item.sortOrder ?? 0}</span>
                </div>
                <p className="font-bold text-white truncate">{item.name}</p>
                <p className="text-xs text-zinc-400 truncate">{item.slug}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" className="h-9 px-3 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10" onClick={() => openEdit(item)}>
                  <Pencil className="size-3.5 mr-1.5" /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 disabled:opacity-40"
                  disabled={item.system}
                  title={item.system ? "Categorias padrão não podem ser excluídas." : "Excluir"}
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
        <DialogContent className="border-white/10 bg-zinc-950 text-white">
          <DialogHeader>
            <DialogTitle>{editingId != null ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name" className="text-xs text-zinc-400">Nome</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                placeholder="Ex.: Pets"
                autoFocus
                className="h-9 bg-black/40 border-white/10 text-sm"
              />
            </div>

            {editingId != null && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Identificador (slug)</Label>
                  <Input value={form.slug ?? ""} readOnly disabled className="h-9 bg-black/20 border-white/10 text-sm text-zinc-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Ordem</Label>
                  <Input value={form.sortOrder ?? 0} readOnly disabled className="h-9 bg-black/20 border-white/10 text-sm text-zinc-500" />
                </div>
              </div>
            )}
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
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              "{deleteTarget?.name}" será removida. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" disabled={deleting} onClick={handleDelete}>
              {deleting && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
