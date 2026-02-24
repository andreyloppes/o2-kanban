'use client';

import styles from './LabelBadge.module.css';

export default function LabelBadge({ name, color }) {
  return (
    <span
      className={styles.badge}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}40`,
      }}
    >
      {name}
    </span>
  );
}
