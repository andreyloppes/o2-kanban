'use client';

import styles from './CommentItem.module.css';

const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatTimestamp(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Componente visual de um comentario individual.
 * @param {Object} props
 * @param {string} props.author - Nome do autor
 * @param {string} props.content - Conteudo do comentario
 * @param {string} props.timestamp - ISO 8601
 * @param {boolean} [props.isOptimistic=false] - Exibe com opacity reduzida
 * @param {import('react').ReactNode} [props.actions] - Acoes (ex: botao delete)
 */
export default function CommentItem({ author, content, timestamp, isOptimistic = false, actions }) {
  const initial = author ? author.charAt(0).toUpperCase() : '?';

  return (
    <div className={`${styles.commentItem} ${isOptimistic ? styles.optimistic : ''}`}>
      <div
        className={styles.avatar}
        style={{ backgroundColor: getAvatarColor(author) }}
      >
        {initial}
      </div>
      <div className={styles.commentBody}>
        <div className={styles.commentHeader}>
          <span className={styles.authorName}>{author}</span>
          <span className={styles.timestamp}>{formatTimestamp(timestamp)}</span>
          {actions && <span className={styles.actions}>{actions}</span>}
        </div>
        <p className={styles.commentContent}>{content}</p>
      </div>
    </div>
  );
}
