import { useEffect, useRef, useCallback } from 'react';
import useUIStore from '@/stores/useUIStore';

/**
 * Hook de atalhos de teclado globais.
 * Registra listeners no document e limpa no unmount.
 *
 * @param {import('next/navigation').AppRouterInstance} router - Router do Next.js
 */
export default function useKeyboardShortcuts(router) {
  const chordKeyRef = useRef(null);
  const chordTimerRef = useRef(null);

  const clearChord = useCallback(() => {
    chordKeyRef.current = null;
    if (chordTimerRef.current) {
      clearTimeout(chordTimerRef.current);
      chordTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    function isTyping() {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (el.isContentEditable) return true;
      return false;
    }

    function handleKeyDown(e) {
      // Never interfere with typing in form elements
      if (isTyping()) return;

      const key = e.key;
      const metaOrCtrl = e.metaKey || e.ctrlKey;

      // --- Chord system: "g then X" ---
      if (chordKeyRef.current === 'g') {
        clearChord();

        if (key === 'b') {
          e.preventDefault();
          router.push('/');
          return;
        }
        if (key === 's') {
          e.preventDefault();
          router.push('/settings');
          return;
        }
        if (key === 'd') {
          e.preventDefault();
          router.push('/dashboard');
          return;
        }
        // If the second key doesn't match, fall through
      }

      // --- Start chord with "g" ---
      if (key === 'g' && !metaOrCtrl && !e.shiftKey && !e.altKey) {
        chordKeyRef.current = 'g';
        chordTimerRef.current = setTimeout(() => {
          chordKeyRef.current = null;
          chordTimerRef.current = null;
        }, 1000);
        return;
      }

      // --- Escape: close any open modal ---
      if (key === 'Escape') {
        const state = useUIStore.getState();
        if (state.commandPaletteOpen) {
          state.setCommandPaletteOpen(false);
          return;
        }
        if (state.shortcutsModalOpen) {
          state.setShortcutsModalOpen(false);
          return;
        }
        if (state.isCreateModalOpen) {
          state.closeCreateModal();
          return;
        }
        if (state.activeTaskId) {
          state.closeTaskModal();
          return;
        }
        if (state.aiChatOpen) {
          state.closeAIChat();
          return;
        }
        return;
      }

      // --- "?" toggle shortcuts help ---
      if (key === '?' || (e.shiftKey && key === '/')) {
        e.preventDefault();
        useUIStore.getState().toggleShortcutsModal();
        return;
      }

      // --- Cmd+K opens command palette ---
      if (metaOrCtrl && key === 'k') {
        e.preventDefault();
        useUIStore.getState().toggleCommandPalette();
        return;
      }

      // --- "/" focus search ---
      if (key === '/' && !e.shiftKey && !metaOrCtrl) {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="search"], input[data-search], input[placeholder*="Buscar"], input[placeholder*="buscar"]'
        );
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      // --- "c" open create task modal ---
      if (key === 'c' && !metaOrCtrl && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        useUIStore.getState().openCreateModal(null);
        return;
      }

      // --- Priority filters: 1, 2, 3, 4 ---
      if (key === '1' && !metaOrCtrl) {
        e.preventDefault();
        useUIStore.getState().setFilter('priority', 'low');
        return;
      }
      if (key === '2' && !metaOrCtrl) {
        e.preventDefault();
        useUIStore.getState().setFilter('priority', 'medium');
        return;
      }
      if (key === '3' && !metaOrCtrl) {
        e.preventDefault();
        useUIStore.getState().setFilter('priority', 'high');
        return;
      }
      if (key === '4' && !metaOrCtrl) {
        e.preventDefault();
        useUIStore.getState().setFilter('priority', 'urgent');
        return;
      }

      // --- "0" clear all filters ---
      if (key === '0' && !metaOrCtrl) {
        e.preventDefault();
        useUIStore.getState().clearFilters();
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearChord();
    };
  }, [router, clearChord]);
}
