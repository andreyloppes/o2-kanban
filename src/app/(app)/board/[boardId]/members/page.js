'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
import MemberList from '@/components/Members/MemberList';
import InviteForm from '@/components/Members/InviteForm';
import JoinRequestList from '@/components/Members/JoinRequestList';
import PageTransition from '@/components/ui/PageTransition';

export default function BoardMembersPage() {
  const { boardId } = useParams();
  const [members, setMembers] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const [boardTitle, setBoardTitle] = useState('');
  const [joinRequests, setJoinRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!boardId) return;
    try {
      const res = await fetch(`/api/boards/${boardId}/members`);
      if (!res.ok) throw new Error('Falha ao carregar membros');
      const data = await res.json();
      setMembers(data.members || []);
      setCurrentRole(data.currentRole || null);
    } catch (err) {
      setError(err.message);
    }
  }, [boardId]);

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
        setCurrentRole(membersData.currentRole || null);

        if (boardRes.ok) {
          const boardData = await boardRes.json();
          setBoardTitle(boardData.board?.title || '');
        }

        // Buscar solicitacoes pendentes se owner
        if (membersData.currentRole === 'owner') {
          const reqRes = await fetch(`/api/boards/${boardId}/join-requests`);
          if (reqRes.ok) {
            const reqData = await reqRes.json();
            setJoinRequests(reqData.requests || []);
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

  const handleMemberAdded = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
  };

  const handleRoleChanged = (memberId, newRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  const handleMemberRemoved = (memberId) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleRequestHandled = (requestId, action) => {
    setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
    if (action === 'approve') {
      fetchMembers();
    }
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
              {boardTitle ? `Membros - ${boardTitle}` : 'Membros'}
            </h1>
          </div>
        </div>

        {isOwner && (
          <InviteForm boardId={boardId} onMemberAdded={handleMemberAdded} />
        )}

        {isOwner && joinRequests.length > 0 && (
          <JoinRequestList
            requests={joinRequests}
            boardId={boardId}
            onRequestHandled={handleRequestHandled}
          />
        )}

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
            <MemberList
              members={members}
              isOwner={isOwner}
              boardId={boardId}
              onRoleChanged={handleRoleChanged}
              onMemberRemoved={handleMemberRemoved}
            />
          </PageTransition>
        )}
      </div>
    </div>
  );
}
