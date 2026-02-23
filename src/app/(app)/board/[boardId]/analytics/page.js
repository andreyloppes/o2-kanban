'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MetricsGrid from '@/components/Analytics/MetricsGrid';
import TaskDistribution from '@/components/Analytics/TaskDistribution';
import AlertsList from '@/components/Analytics/AlertsList';
import PageTransition from '@/components/ui/PageTransition';

export default function BoardAnalyticsPage() {
  const { boardId } = useParams();
  const [data, setData] = useState(null);
  const [boardTitle, setBoardTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!boardId) return;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const [analyticsRes, boardRes] = await Promise.all([
          fetch(`/api/boards/${boardId}/analytics`),
          fetch(`/api/boards/${boardId}`),
        ]);

        if (!analyticsRes.ok) throw new Error('Falha ao carregar analiticos');
        const analyticsData = await analyticsRes.json();
        setData(analyticsData);

        if (boardRes.ok) {
          const boardData = await boardRes.json();
          setBoardTitle(boardData.board?.title || '');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [boardId]);

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <Link
              href={`/board/${boardId}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                transition: 'color var(--transition)',
              }}
              title="Voltar ao board"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="page-title">
              {boardTitle ? `Analitico - ${boardTitle}` : 'Analitico'}
            </h1>
          </div>
        </div>

        {isLoading && (
          <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
        )}

        {error && (
          <p style={{ color: 'var(--color-danger)' }}>
            Erro ao carregar analiticos. Tente novamente.
          </p>
        )}

        {!isLoading && !error && data && (
          <PageTransition>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <MetricsGrid
                overview={data.overview}
                velocity={data.velocity}
                timing={data.timing}
                health={data.health}
              />
              <TaskDistribution overview={data.overview} />
              <AlertsList alerts={data.alerts} />
            </div>
          </PageTransition>
        )}
      </div>
    </div>
  );
}
