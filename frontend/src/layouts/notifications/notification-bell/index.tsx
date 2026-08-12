import { useState } from "react";
import { Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverContent, PopoverTrigger, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components";
import { motion } from "motion/react";

import { useNotifications } from "../store";
import { NotificationList } from "../notification-list";

export function NotificationsBell() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const bellButton = (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="relative grid size-9 place-items-center rounded-full btn-3d-neutral text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Notificações"
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      <Bell className="size-4 text-white" />
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-2 top-2 size-2 rounded-full bg-brand-500 ring-2 ring-zinc-950"
        />
      )}
    </motion.button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{bellButton}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="p-0 border-t border-white/10 bg-surface-1/95 backdrop-blur-xl rounded-t-[24px]"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Notificações</SheetTitle>
          </SheetHeader>
          <NotificationList closePanel={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{bellButton}</PopoverTrigger>
      <PopoverContent
        align="end"
        alignOffset={-8}
        sideOffset={16}
        className="w-[380px] p-0 border border-white/10 bg-surface-1/95 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
      >
        <NotificationList closePanel={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
