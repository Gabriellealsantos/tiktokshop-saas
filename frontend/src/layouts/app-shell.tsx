import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Boxes,
  BadgeDollarSign,
  ChartNoAxesCombined,
  Home,
  Gift,
  Menu,
  Settings,
  ShieldCheck,
  User,
  Rocket,
  Film,
} from "lucide-react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

import { BrandMark, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, ReferralModal } from "@/components";
import { SignatureBackground } from "@/layouts/signature-background";
import { NotificationsBell } from "@/layouts/notifications/notification-bell";
import { useNotifications } from "@/layouts/notifications/store";
import { useAuth } from "@/context/auth";
import { cn } from "@/utils/utils";

const toolbar = [
  ["/", Home, "Início"],
  ["/products", Boxes, "Produtos"],
  ["/create-avatar", User, "Influencers"],
  ["/templates", Film, "Modelos"],
  ["/trend-boost", Rocket, "Trend AI"],
] as const;

const MotionLink = motion.create(Link);

// Tempo que o popup de venda ao vivo fica visível antes de sumir sozinho.
const SALE_TOAST_MS = 6000;

// Fora do componente (nível de módulo) de propósito: cada página monta seu próprio
// <AppShell>, então navegar entre rotas desmonta/remonta este componente. Um useRef
// resetaria a cada remount e faria a MESMA venda antiga reaparecer como se fosse
// nova a cada troca de página. Vivendo no módulo, sobrevive à navegação.
let lastShownSaleId: string | null = null;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useLocation().pathname;
  const { isAdmin, isAfiliado, user } = useAuth();
  const { latestSale } = useNotifications();
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  // Popup aparece por alguns segundos a cada nova venda ao vivo recebida via WS.
  const [saleVisible, setSaleVisible] = useState(false);
  const saleId = latestSale?.id ?? null;

  // Chaveado pelo id (string), não pelo objeto: evita que um re-render sem nova
  // venda limpe o timer e deixe o toast preso na tela.
  useEffect(() => {
    if (!saleId || saleId === lastShownSaleId) return;
    lastShownSaleId = saleId;
    setSaleVisible(true);
    const t = setTimeout(() => setSaleVisible(false), SALE_TOAST_MS);
    return () => clearTimeout(t);
  }, [saleId]);

  // Rola para o topo sempre que a rota mudar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <div className="min-h-screen text-text-1">
      <SignatureBackground />
      <header className="fixed left-0 right-0 top-4 z-50 flex justify-center px-4 md:px-6">
        <div className="glass-surface glass-surface--nav flex h-14 w-full max-w-[1540px] items-center justify-between pl-4 pr-2">
          <div className="flex items-center gap-6">
            <Link to="/" aria-label="Início">
              <BrandMark className="size-8 drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]" />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              <Link
                to="/admin"
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  (!isAdmin && !isAfiliado) ? "hidden" : "",
                  path.startsWith("/admin")
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white",
                )}
              >
                {isAdmin ? "Admin" : "Afiliado"}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <motion.button
              onClick={() => setIsReferralOpen(true)}
              className="hidden sm:block"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex h-9 items-center gap-1.5 rounded-full btn-3d-neutral px-3 text-xs font-medium text-white">
                <Gift className="size-3.5 text-brand-400" />
                Convide um amigo
              </div>
            </motion.button>

            <NotificationsBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="flex size-9 items-center justify-center overflow-hidden rounded-full btn-brand text-sm font-bold text-white shadow-md transition-colors"
                >
                  {user?.photoUrl ? (
                    <img src={user.photoUrl} alt="Foto de perfil" className="size-full object-cover" />
                  ) : (
                    isAdmin ? "A" : "C"
                  )}
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 border-white/10 bg-zinc-950/90 text-white backdrop-blur-md"
              >
                <DropdownMenuItem
                  asChild
                  className="focus:bg-white/10 focus:text-white cursor-pointer"
                >
                  <Link to="/profile" className="flex w-full items-center gap-2">
                    <User className="size-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>

                {(isAdmin || isAfiliado) && (
                  <DropdownMenuItem
                    asChild
                    className="focus:bg-white/10 focus:text-white cursor-pointer"
                  >
                    <Link to="/admin" className="flex w-full items-center gap-2 text-brand-400 focus:text-brand-300">
                      <ShieldCheck className="size-4" />
                      Painel {isAdmin ? "Admin" : "Afiliado"}
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                  asChild
                  className="focus:bg-white/10 focus:text-white cursor-pointer"
                >
                  <Link to="/settings" className="flex w-full items-center gap-2">
                    <Settings className="size-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet>
              <SheetTrigger asChild>
                <button className="grid size-9 place-items-center rounded-full btn-3d-icon-neutral text-zinc-300 lg:hidden hover:text-white">
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 border-white/10 bg-zinc-950/95 backdrop-blur-xl p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4 pt-14">
                  {toolbar.map(([to, Icon, label]) => {
                    const active = to === "/" ? path === "/" : path.startsWith(to);
                    return (
                      <Link
                        key={to}
                        to={to}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-white/10 text-white"
                            : "text-zinc-400 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        <Icon className="size-4" />
                        {label}
                      </Link>
                    );
                  })}

                  {(isAdmin || isAfiliado) && (
                    <Link
                      to="/admin"
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        path.startsWith("/admin")
                          ? "bg-white/10 text-white"
                          : "text-brand-400 hover:bg-white/5 hover:text-brand-300",
                      )}
                    >
                      <ShieldCheck className="size-4" />
                      {isAdmin ? "Admin" : "Afiliado"}
                    </Link>
                  )}
                </nav>

                <div className="mt-auto border-t border-white/10 px-4 py-4 flex flex-col gap-1">
                  <button
                    onClick={() => setIsReferralOpen(true)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors text-left"
                  >
                    <Gift className="size-4 text-brand-400" />
                    Convide um amigo
                  </button>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Settings className="size-4" />
                    Configurações
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="pt-24">{children}</main>

      <nav 
        className="glass-surface glass-surface--nav fixed bottom-4 lg:bottom-6 left-1/2 z-40 flex h-14 -translate-x-1/2 items-center gap-3 sm:gap-4 rounded-2xl px-4 sm:px-5"
      >
        <TooltipProvider delayDuration={100}>
          {toolbar.map(([to, Icon, label]) => {
            const isRouteActive = to === "/" ? path === "/" : path.startsWith(to);
            const active = isRouteActive && !isReferralOpen;
            return (
              <Tooltip key={to}>
                <TooltipTrigger asChild>
                  <Link
                    to={to}
                    aria-label={label}
                    className="relative grid size-11 place-items-center rounded-full transition-colors hover:bg-white/5"
                  >
                    {active && (
                      <motion.div
                        layoutId="dock-indicator"
                        className="absolute inset-0 rounded-full btn-brand"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "relative z-10 size-5 transition-colors duration-300",
                        active ? "text-white" : "text-zinc-400",
                      )}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={12}
                  className="border border-white/10 bg-zinc-900 text-xs text-white"
                >
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Botão de presente (Indique e ganhe) no menu inferior */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsReferralOpen(true)}
                aria-label="Convide um amigo"
                className="relative grid size-11 place-items-center rounded-full transition-colors hover:bg-white/5"
              >
                {isReferralOpen && (
                  <motion.div
                    layoutId="dock-indicator"
                    className="absolute inset-0 rounded-full btn-brand"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                  />
                )}
                <Gift
                  className={cn(
                    "relative z-10 size-5 transition-colors duration-300",
                    isReferralOpen ? "text-white" : "text-zinc-400",
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={12}
              className="border border-white/10 bg-zinc-900 text-xs text-white"
            >
              <p>Convide um amigo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>

      <AnimatePresence>
        {path !== "/login" && saleVisible && latestSale && (
          <motion.div
            key={latestSale.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-5 z-50 hidden max-w-xs rounded-[16px] border border-success/20 bg-elevated/95 p-4 shadow-2xl lg:block"
          >
            <div className="flex items-center gap-3">
              {latestSale.productImage ? (
                <div className="relative size-12 shrink-0 rounded-lg overflow-hidden ring-1 ring-inset ring-white/10">
                  <img src={latestSale.productImage} alt={latestSale.title} className="w-full h-full object-cover" loading="lazy" />
                  <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-success text-white shadow-sm ring-2 ring-elevated/95">
                    <BadgeDollarSign className="size-3" />
                  </span>
                </div>
              ) : (
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-success/10 text-success">
                  <ChartNoAxesCombined className="size-4" />
                </span>
              )}
              <div>
                <p className="text-xs font-semibold text-text-1">Nova venda confirmada</p>
                <p className="mt-0.5 text-[11px] text-success">{latestSale.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ReferralModal open={isReferralOpen} onOpenChange={setIsReferralOpen} />
    </div>
  );
}
