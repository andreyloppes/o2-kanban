'use client';

import { X } from 'lucide-react';
import styles from './FilterChip.module.css';

/**
 * Chip visual de filtro ativo.
 * @param {Object} props
 * @param {string} props.label - Texto do chip (ex: "Bug")
 * @param {string} [props.category] - Categoria (ex: "Tipo")
 * @param {function} props.onRemove - Handler ao clicar no X
 * @param {import('react').ReactNode} [props.icon] - Icone opcional
 */
export default function FilterChip({ label, category, onRemove, icon }) {
  return (
    <span className={styles.chip}>
      {icon && <span className={styles.chipIcon}>{icon}</span>}
      {category && <span className={styles.chipCategory}>{category}:</span>}
      <span className={styles.chipLabel}>{label}</span>
      <button
        type="button"
        className={styles.removeBtn}
        onClick={onRemove}
        aria-label={`Remover filtro ${category ? category + ': ' : ''}${label}`}
      >
        <X size={10} />
      </button>
    </span>
  );
}
