'use client';

import Link from 'next/link';
import styles from './BoardsOverview.module.css';

export default function BoardsOverview({ boards }) {
  if (!boards || boards.length === 0) return null;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Visao por Board</h3>
      <div className={styles.tableHeader}>
        <span className={styles.colBoard}>Board</span>
        <span className={styles.colNum}>Tarefas</span>
        <span className={styles.colNum}>Concluidas</span>
        <span className={styles.colNum}>Em Progresso</span>
        <span className={styles.colNum}>Atrasadas</span>
        <span className={styles.colNum}>Membros</span>
        <span className={styles.colNum}>Velocidade</span>
        <span className={styles.colNum}>Lead Time</span>
      </div>
      <div className={styles.tableBody}>
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/board/${board.id}`}
            className={styles.row}
          >
            <span className={styles.colBoard}>{board.title}</span>
            <span className={styles.colNum}>{board.total_tasks}</span>
            <span className={styles.colNum}>{board.completed}</span>
            <span className={styles.colNum}>{board.in_progress}</span>
            <span
              className={`${styles.colNum} ${board.overdue > 0 ? styles.danger : ''}`}
            >
              {board.overdue}
            </span>
            <span className={styles.colNum}>{board.member_count}</span>
            <span className={styles.colNum}>{board.velocity_week}/sem</span>
            <span className={styles.colNum}>
              {board.avg_lead_time_days} dias
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
