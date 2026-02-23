'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, CheckSquare, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { staggerItem, cardHover, cardTap } from '@/lib/motion';
import styles from './BoardCard.module.css';

export default function BoardCard({ board, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const truncatedDesc =
    board.description && board.description.length > 100
      ? board.description.slice(0, 100) + '...'
      : board.description;

  function handleMenuToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  }

  function handleEdit(e) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (onEdit) onEdit(board);
  }

  function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (onDelete) onDelete(board);
  }

  return (
    <Link href={`/board/${board.id}`} className={styles.card}>
      <motion.div
        className={styles.inner}
        variants={staggerItem}
        whileHover={cardHover}
        whileTap={cardTap}
      >
        <div className={styles.topRow}>
          <h3 className={styles.title}>{board.title}</h3>
          {board.is_owner && (
            <div className={styles.menuWrapper} ref={menuRef}>
              <button
                type="button"
                className={styles.menuBtn}
                onClick={handleMenuToggle}
                aria-label="Opcoes do board"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className={styles.menuDropdown}>
                  <button
                    type="button"
                    className={styles.menuItem}
                    onClick={handleEdit}
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                  <button
                    type="button"
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    onClick={handleDelete}
                  >
                    <Trash2 size={14} />
                    Deletar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {truncatedDesc && (
          <p className={styles.description}>{truncatedDesc}</p>
        )}

        <div className={styles.meta}>
          <span className={styles.metaItem} title="Membros">
            <Users size={14} />
            {board.member_count || 0}
          </span>
          <span className={styles.metaItem} title="Tarefas">
            <CheckSquare size={14} />
            {board.task_count || 0}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
