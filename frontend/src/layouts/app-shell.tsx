import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Boxes,
  BadgeDollarSign,
  ChartNoAxesCombined,
  Gauge,
  Gift,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  User,
  Zap,
  Film,
} from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "motion/react";

import { BrandMark, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components";
import { SignatureBackground } from "@/layouts/signature-background";
import { NotificationsBell, useNotifications } from "@/layouts/notifications-panel";
import { useAuth } from "@/context/auth";
import { cn } from "@/utils/utils";

const toolbar = [
  ["/", Gauge, "Início"],
  ["/products", Boxes, "Produtos"],
  ["/avatars", User, "Avatares"],
  ["/templates", Film, "Modelos"],
  ["/trend-boost", Zap, "Boost"],
] as const;

const MotionLink = motion.create(Link);

export function AppShell({ children }: { children: ReactNode }) {
  const path = useLocation().pathname;
  const { isAdmin } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const { latestSale } = useNotifications();
  // Popup aparece por alguns segundos a cada nova venda ao vivo recebida via WS.
  const [saleVisible, setSaleVisible] = useState(false);
  const lastSaleId = useRef<string | null>(null);

  useEffect(() => {
    if (latestSale && latestSale.id !== lastSaleId.current) {
      lastSaleId.current = latestSale.id;
      setSaleVisible(true);
      const t = setTimeout(() => setSaleVisible(false), 6000);
      return () => clearTimeout(t);
    }
  }, [latestSale]);

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
                  !isAdmin ? "hidden" : "",
                  path.startsWith("/admin")
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white",
                )}
              >
                Admin
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <MotionLink
              to="/referral"
              className="hidden sm:block"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-white shadow-sm hover:bg-white/10 transition-colors">
                <Gift className="size-3.5 text-brand-400" />
                Indique e Ganhe
              </div>
            </MotionLink>

            <NotificationsBell />

            <motion.button
              onClick={() => setIsDark(!isDark)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="grid size-9 place-items-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </motion.button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="flex size-9 items-center justify-center rounded-full btn-brand text-sm font-bold text-white shadow-md transition-colors"
                >
                  {isAdmin ? "A" : "C"}
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

                {isAdmin && (
                  <DropdownMenuItem
                    asChild
                    className="focus:bg-white/10 focus:text-white cursor-pointer"
                  >
                    <Link to="/admin" className="flex w-full items-center gap-2 text-brand-400 focus:text-brand-300">
                      <ShieldCheck className="size-4" />
                      Painel Admin
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

            <button className="grid size-9 place-items-center rounded-full text-zinc-400 lg:hidden hover:bg-white/10 hover:text-white transition-colors">
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-28">{children}</main>

      <nav className="glass-surface glass-surface--floating fixed bottom-4 lg:bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full p-2" style={{ backdropFilter: 'blur(24px) saturate(140%)' }}>
        <TooltipProvider delayDuration={100}>
          {toolbar.map(([to, Icon, label]) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
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
        </TooltipProvider>
      </nav>

      {path !== "/login" && saleVisible && latestSale && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 right-5 z-30 hidden max-w-xs rounded-[16px] border border-success/20 bg-elevated/95 p-4 shadow-2xl lg:block"
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
    </div>
  );
}
