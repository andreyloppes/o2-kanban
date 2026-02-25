'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, Calendar, CalendarRange, ListTodo, CheckCircle2 } from 'lucide-react';
import TodoItem from './TodoItem';
import styles from './MyTasksView.module.css';

function getWeekEnd() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

function groupTasks(myTasks, todos) {
  const today = new Date().toISOString().split('T')[0];
  const weekEnd = getWeekEnd();

  const all = [
    ...myTasks.map((t) => ({ ...t, _isTodo: false })),
    ...todos.map((t) => ({ ...t, _isTodo: true })),
  ];

  const active = all.filter((t) => (t._isTodo ? t.status !== 'done' : !t.is_done));
  const done = all.filter((t) => (t._isTodo ? t.status === 'done' : t.is_done));

  const urgent = active.filter((t) => t.priority === 'urgent');
  const nonUrgent = active.filter((t) => t.priority !== 'urgent');

  const todayTasks = nonUrgent.filter((t) => t.due_date === today);
  const weekTasks = nonUrgent.filter((t) => t.due_date && t.due_date > today && t.due_date <= weekEnd);
  const overdueTasks = nonUrgent.filter((t) => t.due_date && t.due_date < today);
  const noDateTasks = nonUrgent.filter((t) => !t.due_date);

  return { urgent, overdueNonUrgent: overdueTasks, today: todayTasks, week: weekTasks, noDate: noDateTasks, done };
}

function Section({ icon: Icon, title, color, items, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  return (
    <div className={styles.section}>
      <button className={styles.sectionHeader} onClick={() => setOpen(!open)}>
        <div className={styles.sectionTitle}>
          <Icon size={16} color={color} />
          <span style={{ color }}>{title}</span>
          <span className={styles.sectionCount}>{items.length}</span>
        </div>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && (
        <div className={styles.sectionItems}>
          {items.map((item) => (
            <TodoItem key={item.id} item={item} isTodo={item._isTodo} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyTasksView({ myTasks, todos, isLoading }) {
  const [showDone, setShowDone] = useState(false);
  const groups = groupTasks(myTasks, todos);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingLine} />
        <div className={styles.loadingLine} style={{ width: '70%' }} />
        <div className={styles.loadingLine} style={{ width: '85%' }} />
      </div>
    );
  }

  const totalActive = groups.urgent.length + groups.overdueNonUrgent.length + groups.today.length + groups.week.length + groups.noDate.length;

  if (totalActive === 0 && groups.done.length === 0) {
    return (
      <div className={styles.empty}>
        <CheckCircle2 size={40} color="var(--text-muted)" />
        <p>Nenhuma tarefa atribuida a voce.</p>
        <p style={{ fontSize: '0.875rem' }}>Use o botao "+ Nova Tarefa" para criar um to-do pessoal.</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <Section
        icon={AlertCircle}
        title="Urgente"
        color="#ef4444"
        items={groups.urgent}
      />
      <Section
        icon={Calendar}
        title="Vencidas"
        color="#f97316"
        items={groups.overdueNonUrgent}
      />
      <Section
        icon={Calendar}
        title="Hoje"
        color="#10b981"
        items={groups.today}
      />
      <Section
        icon={CalendarRange}
        title="Esta Semana"
        color="#6366f1"
        items={groups.week}
      />
      <Section
        icon={ListTodo}
        title="Sem Data"
        color="var(--text-secondary)"
        items={groups.noDate}
      />

      {/* Done section (collapsible) */}
      {groups.done.length > 0 && (
        <div className={styles.section}>
          <button className={styles.sectionHeader} onClick={() => setShowDone(!showDone)}>
            <div className={styles.sectionTitle}>
              <CheckCircle2 size={16} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)' }}>Concluidas</span>
              <span className={styles.sectionCount}>{groups.done.length}</span>
            </div>
            {showDone ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {showDone && (
            <div className={styles.sectionItems}>
              {groups.done.map((item) => (
                <TodoItem key={item.id} item={item} isTodo={item._isTodo} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
