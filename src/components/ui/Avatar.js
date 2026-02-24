'use client';

import styles from './Avatar.module.css';

const SIZE_MAP = {
  sm: 'sizeSm',
  md: 'sizeMd',
  lg: 'sizeLg',
};

export default function Avatar({ name, color, size = 'md', onClick, active, avatarUrl }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const sizeClass = styles[SIZE_MAP[size] || SIZE_MAP.md];
  const activeClass = active ? styles.active : '';

  const avatarContent = (
    <span
      className={`${styles.avatar} ${sizeClass} ${activeClass}`}
      style={{ backgroundColor: avatarUrl ? 'transparent' : (color || '#3b82f6') }}
      title={name}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className={styles.image} referrerPolicy="no-referrer" />
      ) : (
        initial
      )}
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={styles.avatarBtn}
        onClick={onClick}
        aria-label={name}
      >
        {avatarContent}
      </button>
    );
  }

  return avatarContent;
}
