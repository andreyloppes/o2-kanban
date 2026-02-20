import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronsLeft } from "lucide-react";
import useBoardStore from "@/stores/useBoardStore";
import useUIStore from "@/stores/useUIStore";
import { COLUMN_COLOR_MAP } from "@/lib/constants";
import Card from "./Card";
import CreateTaskButton from "./CreateTaskButton";

export default function Column({ column }) {
  const tasks = useBoardStore((state) => state.getTasksByColumn(column.id));
  const isCollapsed = useUIStore((state) => !!state.collapsedColumns[column.id]);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const colorClass = COLUMN_COLOR_MAP[column.color] || "status-backlog";
  const taskCount = tasks.length;

  const handleToggleCollapse = () => {
    useUIStore.getState().toggleColumn(column.id);
  };

  if (isCollapsed) {
    return (
      <div
        ref={setNodeRef}
        className={`column-collapsed ${isOver ? "active-col" : ""}`}
        role="region"
        aria-label={`Coluna ${column.title} (recolhida)`}
        onClick={handleToggleCollapse}
        title={`Expandir coluna ${column.title}`}
      >
        <span className={`status-dot ${colorClass}`} aria-hidden="true"></span>
        <span className="column-collapsed-count">{taskCount}</span>
        <span className="column-collapsed-title">{column.title}</span>
      </div>
    );
  }

  return (
    <div
      className={`column-container ${isOver ? "active-col" : ""}`}
      role="region"
      aria-label={`Coluna ${column.title}`}
    >
      <div className="column-header">
        <div className="column-title-wrap">
          <span className={`status-dot ${colorClass}`} aria-hidden="true"></span>
          <h2 className="column-title">{column.title}</h2>
        </div>
        <div className="column-meta">
          <span className="task-count">{taskCount}</span>
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
    </div>
  );
}
