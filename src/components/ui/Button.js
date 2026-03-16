'use client';

import styles from './Button.module.css';

/**
 * Reusable Button component with variant, size, loading, and disabled support.
 *
 * @param {object} props
 * @param {'primary'|'ghost'|'danger'|'secondary'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.loading=false]
 * @param {React.ReactNode} props.children
 * @param {function} [props.onClick]
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {string} [props.className]
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  type = 'button',
  className,
  ...rest
}) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    loading ? styles.loading : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}
