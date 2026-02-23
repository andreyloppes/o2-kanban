'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart3 } from 'lucide-react';
import DashboardMetrics from '@/components/Dashboard/DashboardMetrics';
import BoardsOverview from '@/components/Dashboard/BoardsOverview';
import MemberPerformance from '@/components/Dashboard/MemberPerformance';
import AlertsList from '@/components/Analytics/AlertsList';
import PageTransition from '@/components/ui/PageTransition';
import GridSkeleton from '@/components/ui/GridSkeleton';

const STAGE_COLORS = [
  '#6b7280', '#818cf8', '#a78bfa', '#2dd4bf', '#4ade80',
  '#fbbf24', '#fb923c', '#f87171',
];

function StageTimeline({ stages }) {
  if (!stages || stages.length === 0) return null;

  const maxDays = Math.max(...stages.map((s) => s.avg_days), 1);

  return (
    <div
      style={{
        padding: 'var(--space-5)',
        background: 'var(--board-card-bg)',
        border: '1px solid var(--board-card-border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <h3
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: '0 0 var(--space-4)',
        }}
      >
        Tempo por Etapa
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {stages.map((stage, i) => {
          const pct = maxDays > 0 ? (stage.avg_days / maxDays) * 100 : 0;
          const color = STAGE_COLORS[i % STAGE_COLORS.length];
          return (
            <div key={stage.column_title} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                  }}
                >
                  {stage.column_title}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {stage.avg_days} dias ({stage.task_count} tarefas)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.max(pct, 2)}%`,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: color,
                    opacity: 0.85,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Falha ao carregar dashboard');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
          </div>
          <GridSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
          </div>
          <p style={{ color: 'var(--color-danger)' }}>
            Erro ao carregar dashboard. Tente novamente.
          </p>
          <button
            onClick={fetchData}
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-2) var(--space-5)',
              background: 'var(--accent)',
              color: 'var(--text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = data.global.total_boards === 0;

  if (isEmpty) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
          </div>
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-8)',
              color: 'var(--text-muted)',
            }}
          >
            <BarChart3
              size={48}
              style={{ marginBottom: 'var(--space-4)', opacity: 0.4 }}
            />
            <p style={{ fontSize: '1rem', marginBottom: 'var(--space-2)' }}>
              Nenhum board encontrado.
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Crie um board para visualizar suas metricas aqui.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)',
            }}
          >
            <DashboardMetrics global={data.global} />
            <BoardsOverview boards={data.boards} />
            <MemberPerformance members={data.members} />
            <StageTimeline stages={data.stages} />
            {data.alerts && data.alerts.length > 0 && (
              <AlertsList
                alerts={data.alerts.map((a) => ({
                  ...a,
                  message: a.board_title
                    ? `[${a.board_title}] ${a.message}`
                    : a.message,
                }))}
              />
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
