import { useRef, useEffect, useCallback } from 'react';

export default function useDragScroll() {
  const ref = useRef(null);
  const state = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  const handleMouseDown = useCallback((e) => {
    // Only activate on direct clicks on the container or empty areas
    // Skip if clicking on a card, button, input, link, or interactive element
    const tag = e.target.tagName.toLowerCase();
    if (['button', 'input', 'textarea', 'select', 'a'].includes(tag)) return;

    // Skip if the click target is inside a column card or interactive component
    const interactive = e.target.closest(
      '.card, button, a, input, textarea, [role="button"], [draggable="true"], .column-header, .create-task-btn, .add-column-btn, .add-column-form'
    );
    if (interactive) return;

    const el = ref.current;
    if (!el) return;

    state.current.isDown = true;
    state.current.startX = e.pageX - el.offsetLeft;
    state.current.scrollLeft = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  }, []);

  const handleMouseUp = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    state.current.isDown = false;
    el.style.cursor = '';
    el.style.userSelect = '';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!state.current.isDown) return;
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - state.current.startX) * 1.5;
    el.scrollLeft = state.current.scrollLeft - walk;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    state.current.isDown = false;
    el.style.cursor = '';
    el.style.userSelect = '';
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseDown, handleMouseUp, handleMouseMove, handleMouseLeave]);

  return ref;
}
