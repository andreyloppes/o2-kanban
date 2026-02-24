'use client';

import { KanbanSquare, List, Table2, GanttChart, CalendarDays } from 'lucide-react';
import useUIStore from '@/stores/useUIStore';
import styles from './ViewToggle.module.css';

const VIEWS = [
  { key: 'kanban', icon: KanbanSquare, label: 'Kanban' },
  { key: 'list', icon: List, label: 'Lista' },
  { key: 'table', icon: Table2, label: 'Tabela' },
  { key: 'gantt', icon: GanttChart, label: 'Gantt' },
  { key: 'calendar', icon: CalendarDays, label: 'Calendario' },
];

export default function ViewToggle() {
  const boardView = useUIStore((state) => state.boardView);

  return (
    <div className={styles.group} role="radiogroup" aria-label="Visualizacao do board">
      {VIEWS.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          className={`${styles.btn} ${boardView === key ? styles.active : ''}`}
          onClick={() => useUIStore.getState().setBoardView(key)}
          title={label}
          aria-label={label}
          aria-checked={boardView === key}
          role="radio"
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
