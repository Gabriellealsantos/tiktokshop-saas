import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import {
  Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch,
  Checkbox, ScrollArea
} from "@/components";
import type { LiveSalesConfig, LiveSalesMode, LiveSalesSource } from "@/models/live-sales";
import type { Category } from "@/models/category";
import type { Product } from "@/models/product";
import {
  fireLiveSale, getLiveSalesConfig, updateLiveSalesConfig,
} from "@/services/liveSalesAdminService";
import { getCategories } from "@/services/categoryService";
import { searchProducts } from "@/services/productService";

const MODE_HINT: Record<LiveSalesMode, string> = {
  DISABLED: "Desligado — nenhuma venda ao vivo é disparada.",
  MANUAL: "Manual — só dispara pelo botão abaixo.",
  AUTOMATIC: "Automático — dispara uma venda sozinho no intervalo definido.",
};

const SOURCE_HINT: Record<LiveSalesSource, string> = {
  RANDOM: "Aleatório — escolhe qualquer produto do banco.",
  CATEGORY: "Categoria — escolhe aleatoriamente dentro de uma categoria.",
  ADMIN_LIST: "Lista Específica — escolhe apenas dos produtos que você marcar.",
  USER_FAVORITES: "Favoritos — para o afiliado, exibe apenas os favoritos DELE.",
};

export function LiveSalesTab() {
  const [mode, setMode] = useState<LiveSalesMode>("DISABLED");
  const [sourceType, setSourceType] = useState<LiveSalesSource>("RANDOM");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [adminProductIds, setAdminProductIds] = useState<number[]>([]);
  
  const [interval, setInterval] = useState<string>("");
  const [random, setRandom] = useState(false);
  const [minInterval, setMinInterval] = useState<string>("");
  const [maxInterval, setMaxInterval] = useState<string>("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firing, setFiring] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [resConfig, resCat, resProd] = await Promise.all([
        getLiveSalesConfig(),
        getCategories(),
        searchProducts({ size: 100 })
      ]);
      const config: LiveSalesConfig = resConfig.data;
      setMode(config.mode ?? "DISABLED");
      setSourceType(config.sourceType ?? "RANDOM");
      setCategoryId(config.categoryId ?? null);
      setAdminProductIds(config.adminProductIds ?? []);
      
      setInterval(config.intervalSeconds != null ? String(config.intervalSeconds) : "");
      setRandom(config.randomInterval ?? false);
      setMinInterval(config.intervalMinSeconds != null ? String(config.intervalMinSeconds) : "");
      setMaxInterval(config.intervalMaxSeconds != null ? String(config.intervalMaxSeconds) : "");
      
      setCategories(resCat.data);
      setProducts(resProd.data.content || []);
    } catch {
      toast.error("Falha ao carregar a configuração.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (mode === "AUTOMATIC") {
      if (random) {
        const min = Number(minInterval);
        const max = Number(maxInterval);
        if (!min || !max || min <= 0 || max < min) {
          toast.error("Faixa inválida: defina mín e máx (segundos) com máx ≥ mín.");
          return;
        }
      } else if (interval.trim() === "" || Number(interval) <= 0) {
        toast.error("Defina um intervalo em segundos maior que zero.");
        return;
      }
    }
    if (sourceType === "CATEGORY" && !categoryId) {
       toast.error("Selecione uma categoria.");
       return;
    }
    if (sourceType === "ADMIN_LIST" && adminProductIds.length === 0) {
       toast.error("Selecione ao menos um produto.");
       return;
    }
    setSaving(true);
    try {
      await updateLiveSalesConfig({
        mode,
        sourceType,
        categoryId,
        adminProductIds: adminProductIds.length > 0 ? adminProductIds : null,
        intervalSeconds: interval.trim() === "" ? null : Number(interval),
        randomInterval: random,
        intervalMinSeconds: minInterval.trim() === "" ? null : Number(minInterval),
        intervalMaxSeconds: maxInterval.trim() === "" ? null : Number(maxInterval),
      });
      toast.success("Configuração salva.");
    } catch {
      toast.error("Falha ao salvar a configuração.");
    } finally {
      setSaving(false);
    }
  };

  const handleFire = async () => {
    setFiring(true);
    try {
      await fireLiveSale();
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { message?: string })?.message
        : undefined;
      toast.error(msg ?? "Falha ao disparar. Verifique se há produtos cadastrados no banco.");
    } finally {
      setFiring(false);
    }
  };

  const toggleProduct = (id: number) => {
    setAdminProductIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
        <Loader2 className="size-4 animate-spin" /> Carregando configuração…
      </div>
    );
  }

  const showInterval = mode === "AUTOMATIC";

  return (
    <div className="space-y-4 entrance">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-400 max-w-2xl">
          Controla o motor de "Vendas ao Vivo" — os pop-ups e o incremento em tempo real do dashboard.
          Cada disparo sorteia um produto real cadastrado no banco.
        </p>
        <Button variant="secondary" onClick={load} className="size-9 shrink-0 p-0 rounded-full" aria-label="Recarregar">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <div className="glass-premium-purple relative overflow-hidden rounded-2xl border border-white/10 p-5 max-w-2xl duration-200 shadow-lg">
        <div className="relative z-10 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Modo de disparo</Label>
            <Select value={mode} onValueChange={(v: LiveSalesMode) => setMode(v)}>
              <SelectTrigger className="h-9 bg-black/40 border-white/10 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
                <SelectItem value="DISABLED">Desligado</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
                <SelectItem value="AUTOMATIC">Automático</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">{MODE_HINT[mode]}</p>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Fonte dos Produtos</Label>
            <Select value={sourceType} onValueChange={(v: LiveSalesSource) => setSourceType(v)}>
              <SelectTrigger className="h-9 bg-black/40 border-white/10 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
                <SelectItem value="RANDOM">Todos / Aleatório</SelectItem>
                <SelectItem value="CATEGORY">Por Categoria</SelectItem>
                <SelectItem value="ADMIN_LIST">Lista Específica</SelectItem>
                <SelectItem value="USER_FAVORITES">Favoritos do Usuário</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">{SOURCE_HINT[sourceType]}</p>
          </div>
        </div>

        {sourceType === "CATEGORY" && (
          <div className="space-y-1.5 border border-white/5 bg-black/20 p-4 rounded-xl">
            <Label className="text-xs text-zinc-400">Selecione a Categoria</Label>
            <Select value={categoryId ? String(categoryId) : ""} onValueChange={(v) => setCategoryId(Number(v))}>
              <SelectTrigger className="h-9 bg-black/40 border-white/10 text-sm max-w-xs">
                <SelectValue placeholder="Escolha..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300 max-h-60">
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {sourceType === "ADMIN_LIST" && (
           <div className="space-y-2 border border-white/5 bg-black/20 p-4 rounded-xl">
             <Label className="text-xs text-zinc-400">Marque os produtos que aparecerão nas vendas</Label>
             <ScrollArea className="h-48 rounded-md border border-white/10 bg-black/40 p-2">
               {products.length === 0 ? (
                 <p className="text-sm text-zinc-500 p-2">Nenhum produto cadastrado.</p>
               ) : (
                 products.map(p => (
                   <div key={p.id} className="flex items-center space-x-2 py-1.5 px-2 hover:bg-white/5 rounded-md">
                     <Checkbox 
                       id={`p-${p.id}`} 
                       checked={adminProductIds.includes(p.id)}
                       onCheckedChange={() => toggleProduct(p.id)}
                     />
                     <label htmlFor={`p-${p.id}`} className="text-sm text-zinc-300 cursor-pointer flex-1 truncate">
                       {p.name}
                     </label>
                   </div>
                 ))
               )}
             </ScrollArea>
           </div>
        )}

        {showInterval && (
          <div className="space-y-4 rounded-[12px] border border-white/5 bg-black/20 p-4">
            <div className="flex items-center gap-3">
              <Switch checked={random} onCheckedChange={setRandom} />
              <Label className="text-sm text-zinc-300">
                Intervalo aleatório {random ? "(sorteia dentro da faixa)" : "(intervalo fixo)"}
              </Label>
            </div>

            {random ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="min" className="text-xs text-zinc-400">Mínimo (segundos)</Label>
                  <Input
                    id="min" type="number" min="1" placeholder="ex.: 20"
                    value={minInterval} onChange={(e) => setMinInterval(e.target.value)}
                    className="h-9 bg-black/40 border-white/10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="max" className="text-xs text-zinc-400">Máximo (segundos)</Label>
                  <Input
                    id="max" type="number" min="1" placeholder="ex.: 90"
                    value={maxInterval} onChange={(e) => setMaxInterval(e.target.value)}
                    className="h-9 bg-black/40 border-white/10 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="interval" className="text-xs text-zinc-400">Intervalo (segundos)</Label>
                <Input
                  id="interval" type="number" min="1" placeholder="ex.: 30"
                  value={interval} onChange={(e) => setInterval(e.target.value)}
                  className="h-9 bg-black/40 border-white/10 text-sm max-w-xs"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-white/5">
          <Button onClick={handleSave} disabled={saving} className="h-9 mt-4">
            {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
            Salvar configuração
          </Button>
          <Button
            variant="secondary"
            onClick={handleFire}
            disabled={firing}
            className="h-9 mt-4 border border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
          >
            {firing ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Zap className="size-4 mr-1.5" />}
            Disparar venda agora
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
