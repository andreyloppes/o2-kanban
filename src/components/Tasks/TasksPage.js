'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Plus, AlertCircle, Clock, CheckCircle2, ListTodo } from 'lucide-react';
import useTodoStore from '@/stores/useTodoStore';
import MyTasksView from './MyTasksView';
import TeamView from './TeamView';
import ProjectsView from './ProjectsView';
import AddTodoModal from './AddTodoModal';
import PageTransition from '@/components/ui/PageTransition';
import styles from './TasksPage.module.css';

const TABS = [
  { id: 'my', label: 'Minhas Tarefas' },
  { id: 'team', label: 'Time' },
  { id: 'projects', label: 'Por Projeto' },
];

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('my');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { myTasks, todos, teamTasks, isLoading, fetchMyTasks, fetchTodos, fetchTeamTasks } = useTodoStore();

  useEffect(() => {
    fetchMyTasks();
    fetchTodos();
  }, [fetchMyTasks, fetchTodos]);

  useEffect(() => {
    if (activeTab === 'team') {
      fetchTeamTasks();
    }
  }, [activeTab, fetchTeamTasks]);

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const allActiveTasks = [
    ...myTasks.filter((t) => !t.is_done),
    ...todos.filter((t) => t.status !== 'done'),
  ];

  const urgentCount = allActiveTasks.filter((t) => t.priority === 'urgent').length;
  const overdueCount = allActiveTasks.filter((t) => {
    const due = t.due_date;
    return due && due < today;
  }).length;
  const doneTodayCount = [
    ...myTasks.filter((t) => t.is_done && t.updated_at?.startsWith(today)),
    ...todos.filter((t) => t.status === 'done' && t.updated_at?.startsWith(today)),
  ].length;

  const stats = [
    { label: 'Total ativas', value: allActiveTasks.length, icon: ListTodo, color: 'var(--text-primary)' },
    { label: 'Urgentes', value: urgentCount, icon: AlertCircle, color: '#ef4444' },
    { label: 'Vencidas', value: overdueCount, icon: Clock, color: '#f97316' },
    { label: 'Concluídas hoje', value: doneTodayCount, icon: CheckCircle2, color: '#10b981' },
  ];

  return (
    <PageTransition>
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <CheckSquare size={22} color="var(--accent)" />
              <h1 className="page-title">Central de Tarefas</h1>
            </div>
            <button
              className={styles.addBtn}
              onClick={() => setAddModalOpen(true)}
            >
              <Plus size={16} />
              Nova Tarefa
            </button>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <stat.icon size={18} color={stat.color} />
                <div className={styles.statContent}>
                  <span className={styles.statValue} style={{ color: stat.color }}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={styles.content}>
            {activeTab === 'my' && (
              <MyTasksView
                myTasks={myTasks}
                todos={todos}
                isLoading={isLoading}
              />
            )}
            {activeTab === 'team' && (
              <TeamView />
            )}
            {activeTab === 'projects' && (
              <ProjectsView myTasks={myTasks} />
            )}
          </div>
        </div>
      </div>

      <AddTodoModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </PageTransition>
  );
}
