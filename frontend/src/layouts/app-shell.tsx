import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Boxes,
  BadgeDollarSign,
  ChartNoAxesCombined,
  ChevronDown,
  Clapperboard,
  Coins,
  Gauge,
  Gift,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  WandSparkles,
  Zap,
  Film,
} from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "motion/react";

import { BrandMark } from "@/components/base/brand-mark";
import { SignatureBackground } from "@/layouts/signature-background";
import { NotificationsBell, useNotifications } from "@/layouts/notifications-panel";
import { useMockSession } from "@/lib/mock-session";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const toolbar = [
  ["/", Gauge, "Início"],
  ["/produtos", Boxes, "Produtos"],
  ["/avatares", User, "Avatares"],
  ["/modelos", Film, "Modelos"],
  ["/estudio", Clapperboard, "Estúdio"],
  ["/trend-boost", Zap, "Boost"],
  ["/ferramentas", Sparkles, "IA"],
] as const;

const MotionLink = motion.create(Link);

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { role, toggleRole, credits } = useMockSession();
  const [isDark, setIsDark] = useState(true);
  const { notifications } = useNotifications();
  // We filtered 'venda' in the hook, so we just take the first
  const latestSale = notifications[0];

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
                to="/dashboard"
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  path.startsWith("/dashboard")
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white",
                )}
              >
                Painel
              </Link>
              <Link
                to="/admin"
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  role !== "admin" ? "hidden" : "",
                  path.startsWith("/admin")
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white",
                )}
              >
                Admin
              </Link>
              <Link
                to="/prompts"
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  path.startsWith("/prompts")
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white",
                )}
              >
                Prompts
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div
              aria-label="Seus créditos"
              className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-white shadow-sm"
            >
              <Sparkles className="size-3.5 text-violet-400" />
              <span>{credits} cred</span>
            </div>

            <MotionLink
              to="/indicacao"
              className="hidden sm:block"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-white shadow-sm hover:bg-white/10 transition-colors">
                <Gift className="size-3.5 text-violet-400" />
                Indique e Ganhe
              </div>
            </MotionLink>

            <div className="flex h-9 items-center rounded-full border border-white/10 bg-black/40 p-1 shadow-inner">
              <button
                onClick={() => role !== "admin" && toggleRole()}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                  role === "admin"
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                Admin
              </button>
              <button
                onClick={() => role !== "creator" && toggleRole()}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                  role === "creator"
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                User
              </button>
            </div>

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
                  className="flex size-9 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white shadow-md hover:bg-violet-500 transition-colors"
                >
                  {role === "admin" ? "A" : "C"}
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
                  <Link to="/perfil" className="flex w-full items-center gap-2">
                    <User className="size-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>

                {role === "admin" && (
                  <DropdownMenuItem
                    asChild
                    className="focus:bg-white/10 focus:text-white cursor-pointer"
                  >
                    <Link to="/admin" className="flex w-full items-center gap-2 text-violet-400 focus:text-violet-300">
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
                  <Link to="/configuracoes" className="flex w-full items-center gap-2">
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

      <main className="pt-24">{children}</main>

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
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
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

      {role === "admin" && path !== "/login" && latestSale && (
        <div className="fixed bottom-24 right-5 z-30 hidden max-w-xs rounded-[16px] border border-success/20 bg-elevated/95 p-4 shadow-2xl lg:block">
          <div className="flex items-center gap-3">
            {latestSale.productImage ? (
              <div className="relative size-12 shrink-0 rounded-lg overflow-hidden ring-1 ring-inset ring-white/10">
                <img src={latestSale.productImage} alt={latestSale.productName || "Produto"} className="w-full h-full object-cover" loading="lazy" />
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
              <p className="mt-0.5 text-[11px] text-success">
                {latestSale.commission ? `+ R$ ${latestSale.commission.toFixed(2).replace('.', ',')} em comissão` : "+ R$ 28,40 em comissão"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
