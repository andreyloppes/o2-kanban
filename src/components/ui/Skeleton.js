import styles from './Skeleton.module.css';

export default function Skeleton({
  variant = 'line',
  width,
  height,
  borderRadius,
  style: customStyle,
  className = '',
}) {
  const defaults = {
    line: { width: '100%', height: 14 },
    circle: { width: 32, height: 32 },
    card: { width: '100%', height: 120 },
  };

  const d = defaults[variant] || defaults.line;

  return (
    <div
      className={`${styles.skeleton} ${variant === 'circle' ? styles.circle : ''} ${className}`}
      style={{
        width: width || d.width,
        height: height || d.height,
        borderRadius: borderRadius || undefined,
        ...customStyle,
      }}
    />
  );
}
