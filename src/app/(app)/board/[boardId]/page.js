'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useBoardStore from '@/stores/useBoardStore';
import Board from '@/components/Kanban/Board';
import Column from '@/components/Kanban/Column';
import DndProvider from '@/components/Kanban/DndProvider';
import TaskForm from '@/components/Kanban/TaskForm';
import TaskModal from '@/components/Kanban/TaskModal';
import BoardSkeleton from '@/components/ui/BoardSkeleton';

export default function BoardPage() {
  const { boardId } = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const columns = useBoardStore((state) => state.columns);
  const board = useBoardStore((state) => state.board);
  const isLoading = useBoardStore((state) => state.isLoading);
  const error = useBoardStore((state) => state.error);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!boardId) return;

    async function fetchBoard() {
      try {
        useBoardStore.getState().setLoading(true);
        const res = await fetch(`/api/boards/${boardId}`);
        if (!res.ok) throw new Error('Falha ao carregar o board');
        const data = await res.json();
        useBoardStore.getState().hydrate(
          data.board,
          data.columns,
          data.tasks,
          data.members
        );
      } catch (err) {
        useBoardStore.getState().setError(err.message);
      }
    }
    fetchBoard();
  }, [boardId]);

  if (!isMounted) return null;

  if (isLoading) {
    return <BoardSkeleton />;
  }

  if (error) {
    return (
      <main
        className="main-area"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <p style={{ color: 'var(--color-danger)' }}>Erro ao carregar o board</p>
        <a
          href="/"
          style={{
            color: 'var(--accent)',
            fontSize: '0.875rem',
            textDecoration: 'underline',
          }}
        >
          Voltar para Meus Quadros
        </a>
      </main>
    );
  }

  return (
    <>
      <DndProvider>
        <Board title={board?.title || 'Kanban'}>
          {columns.map((col) => (
            <Column key={col.id} column={col} />
          ))}
        </Board>
      </DndProvider>
      <TaskForm />
      <TaskModal />
    </>
  );
}
