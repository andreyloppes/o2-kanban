'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import BoardGrid from '@/components/Boards/BoardGrid';
import CreateBoardModal from '@/components/Boards/CreateBoardModal';
import EditBoardModal from '@/components/Boards/EditBoardModal';
import PageTransition from '@/components/ui/PageTransition';
import GridSkeleton from '@/components/ui/GridSkeleton';
import useUIStore from '@/stores/useUIStore';

export default function MyBoardsPage() {
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);

  const fetchBoards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/boards');
      if (!res.ok) throw new Error('Falha ao carregar boards');
      const data = await res.json();
      setBoards(data.boards || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  function handleBoardCreated() {
    setShowCreateModal(false);
    fetchBoards();
  }

  function handleEditBoard(board) {
    setEditingBoard(board);
  }

  function handleBoardUpdated() {
    setEditingBoard(null);
    fetchBoards();
  }

  function handleDeleteBoard(board) {
    useUIStore.getState().showConfirmDialog({
      title: 'Deletar board',
      message: `Tem certeza que deseja deletar "${board.title}"? Todas as tarefas e dados serao perdidos.`,
      confirmLabel: 'Deletar',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/boards/${board.id}`, {
            method: 'DELETE',
          });
          if (!res.ok && res.status !== 204) {
            throw new Error('Falha ao deletar board');
          }
          useUIStore.getState().addToast('Board deletado com sucesso', 'success');
          fetchBoards();
        } catch {
          useUIStore.getState().addToast('Erro ao deletar board', 'error');
        }
      },
    });
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Meus Quadros</h1>
          </div>
          <GridSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Meus Quadros</h1>
          </div>
          <p style={{ color: 'var(--color-danger)' }}>
            Erro ao carregar boards. Tente novamente.
          </p>
          <button
            onClick={fetchBoards}
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-2) var(--space-5)',
              background: 'var(--accent)',
              color: 'var(--text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Meus Quadros</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-5)',
                background: 'var(--accent)',
                color: 'var(--text-inverse)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'background 0.15s ease',
              }}
            >
              <Plus size={16} />
              Criar board
            </button>
          </div>

          {boards.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-8)',
                color: 'var(--text-muted)',
              }}
            >
              <p style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>
                Nenhum board encontrado.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  padding: 'var(--space-2) var(--space-5)',
                  background: 'var(--accent)',
                  color: 'var(--text-inverse)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                Criar seu primeiro board
              </button>
            </div>
          ) : (
            <BoardGrid
              boards={boards}
              onEdit={handleEditBoard}
              onDelete={handleDeleteBoard}
            />
          )}

          {showCreateModal && (
            <CreateBoardModal
              onClose={() => setShowCreateModal(false)}
              onCreated={handleBoardCreated}
            />
          )}

          {editingBoard && (
            <EditBoardModal
              board={editingBoard}
              onClose={() => setEditingBoard(null)}
              onUpdated={handleBoardUpdated}
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
