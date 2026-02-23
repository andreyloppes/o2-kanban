'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import styles from './InviteForm.module.css';

export default function InviteForm({ boardId, onMemberAdded }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/boards/${boardId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Erro ao convidar' });
        return;
      }

      setFeedback({ type: 'success', message: `${data.member.user?.name || trimmed} adicionado como ${role === 'owner' ? 'Admin' : 'Membro'}` });
      setEmail('');
      setRole('member');
      onMemberAdded?.(data.member);
    } catch {
      setFeedback({ type: 'error', message: 'Erro de conexao. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <UserPlus size={18} />
        Convidar membro
      </h3>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="email"
          placeholder="Email do usuario..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <select
          className={styles.select}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="member">Membro</option>
          <option value="owner">Admin</option>
        </select>
        <button
          className={styles.button}
          type="submit"
          disabled={!email.trim() || isSubmitting}
        >
          {isSubmitting ? 'Convidando...' : 'Convidar'}
        </button>
      </form>
      {feedback && (
        <p className={`${styles.feedback} ${feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}>
          {feedback.message}
        </p>
      )}
      <p className={styles.hint}>
        O usuario precisa ter uma conta na plataforma. Admin pode gerenciar membros e configuracoes do board.
      </p>
    </div>
  );
}
