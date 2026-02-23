'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/motion';
import useBoardStore from '@/stores/useBoardStore';
import useUIStore from '@/stores/useUIStore';
import FilterBar from './FilterBar';
import PomodoroWidget from './PomodoroWidget';
import JoinRequestButton from '@/components/Members/JoinRequestButton';

export default function Board({ title, children }) {
  const router = useRouter();
  const board = useBoardStore((state) => state.board);
  const members = useBoardStore((state) => state.members);
  const currentAssignee = useUIStore((state) => state.filters.assignee);

  const visibleMembers = members.slice(0, 4);
  const extraCount = Math.max(0, members.length - 4);

  function handleAvatarClick(slug) {
    if (currentAssignee === slug) {
      useUIStore.getState().setFilter('assignee', null);
    } else {
      useUIStore.getState().setFilter('assignee', slug);
    }
  }

  return (
    <main className="main-area">
      <header className="board-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => router.push('/')} title="Voltar" aria-label="Voltar para Meus Quadros">
            <ArrowLeft size={18} />
          </button>
          <h1 className="header-title">{title}</h1>
        </div>
        <div className="header-right">
          <PomodoroWidget />
          <div className="avatar-group" role="group" aria-label="Membros do board">
            {visibleMembers.map((member) => (
              <button
                key={member.user?.slug || member.id}
                className={`header-avatar header-avatar-btn ${currentAssignee === member.user?.slug ? 'avatar-active' : ''}`}
                style={{ backgroundColor: member.user?.avatar_color || '#6b7280' }}
                title={member.user?.name || 'Membro'}
                onClick={() => handleAvatarClick(member.user?.slug)}
              >
                {(member.user?.name || '?').charAt(0)}
              </button>
            ))}
            {extraCount > 0 && (
              <div className="header-avatar avatar-more" title={`Mais ${extraCount} membros`}>
                +{extraCount}
              </div>
            )}
          </div>
          {board?.can_edit ? (
            <button
              className="members-btn"
              onClick={() => router.push(`/board/${board.id}/members`)}
              title="Gerenciar membros"
            >
              <Users size={16} />
              <span>Membros</span>
            </button>
          ) : (
            <JoinRequestButton />
          )}
        </div>
      </header>

      <FilterBar />

      <motion.div className="board-content" variants={staggerContainer} initial="hidden" animate="visible">
        {children}
      </motion.div>
    </main>
  );
}
