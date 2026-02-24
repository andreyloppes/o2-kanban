'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/stores/useUserStore';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import Sidebar from '@/components/Kanban/Sidebar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ToastContainer from '@/components/ui/Toast';
import ShortcutsModal from '@/components/ui/ShortcutsModal';
import CommandPalette from '@/components/ui/CommandPalette';
import useUIStore from '@/stores/useUIStore';
import '../kanban.css';

export default function AppLayout({ children }) {
  const router = useRouter();

  useKeyboardShortcuts(router);

  useEffect(() => {
    useUserStore.getState().initialize();
    useUserStore.getState().fetchUsers();
  }, []);

  const commandPaletteOpen = useUIStore((state) => state.commandPaletteOpen);

  return (
    <div className="app-container">
      <Sidebar />
      {children}
      <ConfirmDialog />
      <ToastContainer />
      <ShortcutsModal />
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => useUIStore.getState().setCommandPaletteOpen(false)}
      />
    </div>
  );
}
