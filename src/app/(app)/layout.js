'use client';

import { useEffect } from 'react';
import useUserStore from '@/stores/useUserStore';
import Sidebar from '@/components/Kanban/Sidebar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ToastContainer from '@/components/ui/Toast';
import '../kanban.css';

export default function AppLayout({ children }) {
  useEffect(() => {
    useUserStore.getState().loadCurrentUser();
    useUserStore.getState().fetchUsers();
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      {children}
      <ConfirmDialog />
      <ToastContainer />
    </div>
  );
}
