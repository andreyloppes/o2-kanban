'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';
import AutomationList from '@/components/Automations/AutomationList';
import CreateAutomationForm from '@/components/Automations/CreateAutomationForm';
import PageTransition from '@/components/ui/PageTransition';

export default function BoardAutomationsPage() {
  const { boardId } = useParams();
  const [automations, setAutomations] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const [boardTitle, setBoardTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!boardId) return;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const [automationsRes, boardRes, membersRes] = await Promise.all([
          fetch(`/api/boards/${boardId}/automations`),
          fetch(`/api/boards/${boardId}`),
          fetch(`/api/boards/${boardId}/members`),
        ]);

        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setCurrentRole(membersData.currentRole || null);
        }

        if (boardRes.ok) {
          const boardData = await boardRes.json();
          setBoardTitle(boardData.board?.title || '');
        }

        if (automationsRes.ok) {
          const automationsData = await automationsRes.json();
          setAutomations(automationsData.automations || []);
        } else {
          // Se 403, usuario nao e owner
          const data = await automationsRes.json();
          if (automationsRes.status === 403) {
            setError('Apenas administradores podem acessar automacoes.');
          } else {
            setError(data.error || 'Falha ao carregar automacoes');
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [boardId]);

  const handleAutomationCreated = (newAutomation) => {
    setAutomations((prev) => [newAutomation, ...prev]);
  };

  const handleToggled = (automationId, enabled) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === automationId ? { ...a, enabled } : a))
    );
  };

  const handleDeleted = (automationId) => {
    setAutomations((prev) => prev.filter((a) => a.id !== automationId));
  };

  const isOwner = currentRole === 'owner';

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <Link
              href={`/board/${boardId}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                transition: 'color var(--transition)',
              }}
              title="Voltar ao board"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="page-title">
              {boardTitle ? `Automacoes - ${boardTitle}` : 'Automacoes'}
            </h1>
          </div>
        </div>

        {isOwner && (
          <CreateAutomationForm
            boardId={boardId}
            onAutomationCreated={handleAutomationCreated}
          />
        )}

        {isLoading && (
          <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
        )}

        {error && (
          <p style={{ color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}

        {!isLoading && !error && !isOwner && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
            Apenas administradores podem gerenciar automacoes.
          </p>
        )}

        {!isLoading && !error && isOwner && automations.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
            Nenhuma automacao configurada.
          </p>
        )}

        {!isLoading && !error && automations.length > 0 && (
          <PageTransition>
            <AutomationList
              automations={automations}
              boardId={boardId}
              onToggled={handleToggled}
              onDeleted={handleDeleted}
            />
          </PageTransition>
        )}
      </div>
    </div>
  );
}
