import React from 'react';

export function useSpatialNavigation() {
  const isNavigatingRef = React.useRef(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow default behavior for inputs and textareas
      const activeEl = document.activeElement as HTMLElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        if (e.key === 'Escape') {
          activeEl.blur();
          return;
        }
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }

      const focusable = Array.from(
        document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[];

      if (focusable.length === 0) return;

      if (!activeEl || !focusable.includes(activeEl)) {
        if (e.key !== 'Escape') {
          focusable[0].focus();
        }
        return;
      }

      if (e.key === 'Enter') {
        activeEl.click();
        return;
      }
      
      if (e.key === 'Escape') {
        // Find a back button if available or just blur
        const backBtn = (document.querySelector('button[aria-label="Back"]') || 
                        document.querySelector('button[title="Back"]') || 
                        Array.from(document.querySelectorAll('button')).find(b => b.innerText.toLowerCase().includes('back') || b.querySelector('svg')?.innerHTML.includes('polyline points="15 18 9 12 15 6"'))) as HTMLElement;
        if (backBtn) {
          backBtn.click();
        } else {
          activeEl.blur();
        }
        return;
      }

      const rect = activeEl.getBoundingClientRect();
      const currentCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      let bestNext: HTMLElement | null = null;
      let minDistance = Infinity;

      focusable.forEach((el) => {
        if (el === activeEl) return;
        const r = el.getBoundingClientRect();
        
        // Skip hidden elements
        if (r.width === 0 || r.height === 0) return;

        const center = {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
        };

        const dx = center.x - currentCenter.x;
        const dy = center.y - currentCenter.y;
        
        let valid = false;
        let distance = Infinity;

        // Weighting to favor alignment in the direction of movement
        if (e.key === 'ArrowRight' && dx > 0) {
          valid = true;
          distance = dx + Math.abs(dy) * 2;
        } else if (e.key === 'ArrowLeft' && dx < 0) {
          valid = true;
          distance = Math.abs(dx) + Math.abs(dy) * 2;
        } else if (e.key === 'ArrowDown' && dy > 0) {
          valid = true;
          distance = dy + Math.abs(dx) * 2;
        } else if (e.key === 'ArrowUp' && dy < 0) {
          valid = true;
          distance = Math.abs(dy) + Math.abs(dx) * 2;
        }

        if (valid && distance < minDistance) {
          minDistance = distance;
          bestNext = el;
        }
      });

      if (bestNext) {
        (bestNext as HTMLElement).focus();
        isNavigatingRef.current = true;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
