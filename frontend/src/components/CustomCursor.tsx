import { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [hasPointer, setHasPointer] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Check if device supports fine pointer (mouse/trackpad)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setHasPointer(mediaQuery.matches);

    const updatePointer = (e: MediaQueryListEvent) => setHasPointer(e.matches);
    mediaQuery.addEventListener('change', updatePointer);

    return () => mediaQuery.removeEventListener('change', updatePointer);
  }, []);

  useEffect(() => {
    if (!hasPointer) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      // Direct DOM manipulation for instantaneous, lag-free following
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      
      if (!initializedRef.current) {
        cursor.classList.remove('hidden');
        initializedRef.current = true;
      }
    };

    const onMouseLeave = () => {
      cursor.classList.add('hidden');
      initializedRef.current = false;
    };

    const onMouseEnter = () => {
      // Will be revealed on next mouse move to ensure correct coordinates
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !target.closest) return;

      // Selectors for elements that should trigger the cursor growth
      const selector = 'a, button, input, textarea, select, [role="button"], [tabindex]:not([tabindex="-1"]), [class*="card"], [data-cursor-grow], .cursor-pointer, [class*="cursor-pointer"]';
      
      let isHoverable = target.closest(selector) !== null;
      
      // Fallback: check if the computed cursor is pointer (might be overridden by our !important CSS, but kept for safety)
      if (!isHoverable) {
        try {
          isHoverable = window.getComputedStyle(target).cursor === 'pointer';
        } catch (error) {
          // Ignore getComputedStyle errors on detached elements
        }
      }

      if (isHoverable) {
        cursor.classList.add('hovering');
      } else {
        cursor.classList.remove('hovering');
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    document.addEventListener('mouseenter', onMouseEnter, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', onMouseOver);
    };
  }, [hasPointer]);

  // Don't render anything on touch devices
  if (!hasPointer) return null;

  return (
    <div ref={cursorRef} className="custom-cursor-wrapper hidden">
      <div className="custom-cursor-ring" />
      <div className="custom-cursor-dot" />
    </div>
  );
}
