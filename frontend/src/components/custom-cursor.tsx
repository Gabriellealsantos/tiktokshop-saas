import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringOutRef = useRef<HTMLDivElement>(null);
  const ringInRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    let isHovering = false;

    const updatePosition = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      
      if (cursorRef.current) {
        // Direct DOM manipulation for zero-latency 1:1 speed
        cursorRef.current.style.transform = `translate(${e.clientX - 18}px, ${e.clientY - 18}px)`;
      }

      const target = e.target as HTMLElement;
      const isClickable = target.closest('a, button, input, select, textarea, [role="button"], .cursor-pointer') !== null;
      
      if (isClickable !== isHovering) {
        isHovering = isClickable;
        const scale = isHovering ? 'scale(1.4)' : 'scale(1)';
        
        if (ringOutRef.current) ringOutRef.current.style.transform = scale;
        if (ringInRef.current) ringInRef.current.style.transform = scale;
        if (dotRef.current) dotRef.current.style.transform = scale;
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", updatePosition, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[99999] flex items-center justify-center mix-blend-difference"
        style={{ width: 36, height: 36, willChange: "transform" }}
      >
        {/* Outer Ring */}
        <div 
          ref={ringOutRef}
          className="absolute inset-0 rounded-full border border-white/30 transition-transform duration-200" 
        />
        {/* Inner Ring */}
        <div 
          ref={ringInRef}
          className="absolute inset-[4px] rounded-full border border-white/80 transition-transform duration-200" 
        />
        {/* Center Dot */}
        <div 
          ref={dotRef}
          className="absolute inset-[15px] rounded-full bg-white transition-transform duration-200" 
        />
      </div>
    </>
  );
}
