import Skeleton from './Skeleton';

function ColumnSkeleton({ cards = 3 }) {
  return (
    <div style={{
      minWidth: 'var(--column-width)',
      width: 'var(--column-width)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
    }}>
      <div style={{
        padding: 'var(--space-5) var(--space-4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Skeleton variant="circle" width={8} height={8} />
          <Skeleton width={80} height={16} />
        </div>
        <Skeleton width={24} height={20} borderRadius="var(--radius-full)" />
      </div>

      <div style={{
        padding: '0 var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}>
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} variant="card" height={100 + Math.random() * 40} borderRadius="var(--radius-md)" />
        ))}
      </div>
    </div>
  );
}

export default function BoardSkeleton() {
  const columnCards = [3, 2, 3, 2, 1];

  return (
    <main className="main-area">
      {/* Header skeleton */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-6)',
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Skeleton width={18} height={18} />
          <Skeleton width={160} height={20} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '-8px' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="circle" width={28} height={28} />
          ))}
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div style={{
        padding: 'var(--space-3) var(--space-6)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Skeleton width={200} height={32} borderRadius="var(--radius-md)" />
          <Skeleton width={80} height={32} borderRadius="var(--radius-md)" />
          <Skeleton width={80} height={32} borderRadius="var(--radius-md)" />
        </div>
      </div>

      {/* Columns skeleton */}
      <div style={{
        flex: 1,
        display: 'flex',
        padding: 'var(--space-6)',
        gap: 'var(--space-4)',
        overflowX: 'auto',
      }}>
        {columnCards.map((cards, i) => (
          <ColumnSkeleton key={i} cards={cards} />
        ))}
      </div>
    </main>
  );
}
