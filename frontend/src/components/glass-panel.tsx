import * as React from "react"
import { cn } from "@/utils/utils"

const GlassPanel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      {/* Glass layer: sits BEHIND the content and extends outward, so it never
          changes the size of the children. Nearly transparent so the page
          background shows through. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-4 md:-inset-6 rounded-[28px]",
          // near-transparent veil (background stays visible through it):
          "bg-[linear-gradient(180deg,hsl(255_100%_95%/0.02),hsl(258_90%_70%/0.008))]",
          // light frost — keep it low so the background is not washed out:
          "backdrop-blur-sm",
          // subtle glass edge + top highlight:
          "border border-white/10 ring-1 ring-inset ring-white/[0.06]",
          "shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)]",
        )}
      />
      {/* Content keeps its natural size and paints on top of the glass */}
      <div className="relative">{children}</div>
    </div>
  )
})
GlassPanel.displayName = "GlassPanel"

export { GlassPanel }
