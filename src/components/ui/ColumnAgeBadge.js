import useColumnAge from '@/hooks/useColumnAge';
import styles from './ColumnAgeBadge.module.css';

export default function ColumnAgeBadge({ columnEnteredAt }) {
  const age = useColumnAge(columnEnteredAt);

  if (!age) return null;

  const label = age.days === 1 ? '1 dia' : `${age.days} dias`;

  return (
    <span className={`${styles.badge} ${styles[age.status]}`}>
      {label}
    </span>
  );
}
