import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronsLeft } from "lucide-react";
import { motion } from "framer-motion";
import useBoardStore from "@/stores/useBoardStore";
import useUIStore from "@/stores/useUIStore";
import { COLUMN_COLOR_MAP } from "@/lib/constants";
import Card from "./Card";
import CreateTaskButton from "./CreateTaskButton";

const columnVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
};

export default function Column({ column }) {
  const allTasks = useBoardStore((state) => state.tasks);
  const filters = useUIStore((state) => state.filters);
  const isCollapsed = useUIStore((state) => !!state.collapsedColumns[column.id]);

  const columnTasks = useMemo(() => {
    return allTasks
      .filter((t) => t.column_id === column.id)
      .sort((a, b) => a.position - b.position);
  }, [allTasks, column.id]);

  const tasks = useMemo(() => {
    let filtered = columnTasks;
    if (filters.type) filtered = filtered.filter((t) => t.type === filters.type);
    if (filters.priority) filtered = filtered.filter((t) => t.priority === filters.priority);
    if (filters.assignee) {
      if (filters.assignee === '__unassigned__') {
        filtered = filtered.filter((t) => !t.assignee);
      } else {
        filtered = filtered.filter((t) => t.assignee === filters.assignee);
      }
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(s) || (t.description && t.description.toLowerCase().includes(s))
      );
    }
    return filtered;
  }, [columnTasks, filters]);

  const hasActiveFilters = filters.type !== null || filters.priority !== null || filters.assignee !== null || filters.search !== '';

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const colorClass = COLUMN_COLOR_MAP[column.color] || "status-backlog";
  const taskCount = tasks.length;
  const countLabel = hasActiveFilters ? `${taskCount} de ${columnTasks.length}` : `${taskCount}`;

  const handleToggleCollapse = () => {
    useUIStore.getState().toggleColumn(column.id);
  };

  if (isCollapsed) {
    return (
      <motion.div
        ref={setNodeRef}
        className={`column-collapsed ${isOver ? "active-col" : ""}`}
        role="region"
        aria-label={`Coluna ${column.title} (recolhida)`}
        onClick={handleToggleCollapse}
        title={`Expandir coluna ${column.title}`}
        variants={columnVariant}
      >
        <span className={`status-dot ${colorClass}`} aria-hidden="true"></span>
        <span className="column-collapsed-count">{countLabel}</span>
        <span className="column-collapsed-title">{column.title}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`column-container ${isOver ? "active-col" : ""}`}
      role="region"
      aria-label={`Coluna ${column.title}`}
      variants={columnVariant}
    >
      <div className="column-header">
        <div className="column-title-wrap">
          <span className={`status-dot ${colorClass}`} aria-hidden="true"></span>
          <h2 className="column-title">{column.title}</h2>
        </div>
        <div className="column-meta">
          <span className="task-count">{countLabel}</span>
          <button
            className="collapse-col-btn"
            aria-label={`Recolher coluna ${column.title}`}
            onClick={handleToggleCollapse}
          >
            <ChevronsLeft size={16} className="collapse-icon" />
          </button>
        </div>
      </div>

      <div ref={setNodeRef} className="column-content">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <Card key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="column-empty">
            Nenhuma tarefa
          </div>
        )}

        <CreateTaskButton columnId={column.id} />
      </div>
    </motion.div>
  );
}
