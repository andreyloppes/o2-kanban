import Skeleton from './Skeleton';
import gridStyles from '@/components/Boards/BoardGrid.module.css';

export default function GridSkeleton({ count = 6 }) {
  return (
    <div className={gridStyles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            padding: 'var(--space-5)',
            background: 'var(--board-card-bg)',
            border: '1px solid var(--board-card-border)',
            borderRadius: 'var(--radius-lg)',
            minHeight: 140,
          }}
        >
          <Skeleton width="70%" height={18} />
          <Skeleton width="100%" height={14} />
          <Skeleton width="85%" height={14} />
          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            marginTop: 'auto',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border)',
          }}>
            <Skeleton width={40} height={14} />
            <Skeleton width={40} height={14} />
          </div>
        </div>
      ))}
    </div>
  );
}
