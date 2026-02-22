'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MemberList from '@/components/Members/MemberList';
import PageTransition from '@/components/ui/PageTransition';

export default function BoardMembersPage() {
  const { boardId } = useParams();
  const [members, setMembers] = useState([]);
  const [boardTitle, setBoardTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!boardId) return;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const [membersRes, boardRes] = await Promise.all([
          fetch(`/api/boards/${boardId}/members`),
          fetch(`/api/boards/${boardId}`),
        ]);

        if (!membersRes.ok) throw new Error('Falha ao carregar membros');
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);

        if (boardRes.ok) {
          const boardData = await boardRes.json();
          setBoardTitle(boardData.board?.title || '');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [boardId]);

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
              {boardTitle ? `Membros - ${boardTitle}` : 'Membros'}
            </h1>
          </div>
        </div>

        {isLoading && (
          <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
        )}

        {error && (
          <p style={{ color: 'var(--color-danger)' }}>
            Erro ao carregar membros. Tente novamente.
          </p>
        )}

        {!isLoading && !error && members.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
            Nenhum membro encontrado.
          </p>
        )}

        {!isLoading && !error && members.length > 0 && (
          <PageTransition>
            <MemberList members={members} />
          </PageTransition>
        )}
      </div>
    </div>
  );
}
