import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, BookOpen, Bug, Zap, Circle } from "lucide-react";
import { TASK_TYPES } from "@/lib/constants";
import Badge from "@/components/ui/Badge";
import DueDateBadge from "@/components/ui/DueDateBadge";
import TaskTimerBadge from "@/components/ui/TaskTimerBadge";
import ColumnAgeBadge from "@/components/ui/ColumnAgeBadge";
import useUIStore from "@/stores/useUIStore";
import useBoardStore from "@/stores/useBoardStore";

const getTypeIcon = (type) => {
  switch (type) {
    case "task":
      return <Copy size={14} className="card-type-icon" />;
    case "user_story":
      return <BookOpen size={14} className="card-type-icon" />;
    case "bug":
      return <Bug size={14} className="card-type-icon icon-bug" />;
    case "epic":
      return <Zap size={14} className="card-type-icon icon-epic" />;
    case "spike":
      return <Circle size={14} className="card-type-icon" />;
    default:
      return <Copy size={14} className="card-type-icon" />;
  }
};

export default function Card({ task }) {
  const canEdit = useBoardStore((state) => state.board?.can_edit);
  const members = useBoardStore((state) => state.members);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "Card", task }, disabled: !canEdit });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
    cursor: isDragging ? "grabbing" : canEdit ? "pointer" : "default",
  };

  const typeLabel = TASK_TYPES[task.type] || task.type;

  const isSelected = useUIStore((state) => state.selectedTaskIds.includes(task.id));

  function handleClick(e) {
    if (isDragging) return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      useUIStore.getState().toggleTaskSelection(task.id);
    } else {
      useUIStore.getState().openTaskModal(task.id);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card ${isDragging ? "dragging" : ""} ${isSelected ? "card-selected" : ""}`}
      role="article"
      aria-label={task.title}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <div className="card-header">
        {getTypeIcon(task.type)}
        <span>{typeLabel}</span>
      </div>

      <p className="card-title">{task.title}</p>

      {(task.priority || (task.tags && task.tags.length > 0)) && (
        <div className="tags-container">
          {task.priority && <Badge priority={task.priority} size="sm" />}
          {task.tags &&
            task.tags.map((tag, idx) => (
              <span
                key={idx}
                className={`tag tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {tag}
              </span>
            ))}
        </div>
      )}

      {task.due_date && <DueDateBadge dueDate={task.due_date} size="sm" />}

      {(task.timer_elapsed_ms > 0 || task.timer_running || task.column_entered_at) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <TaskTimerBadge taskId={task.id} />
          <ColumnAgeBadge columnEnteredAt={task.column_entered_at} />
        </div>
      )}

      {task.assignee && (() => {
        const member = members.find(m => m.user?.slug === task.assignee);
        const user = member?.user;
        return (
          <div className="card-footer">
            <div className="card-meta" />
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || task.assignee}
                className="card-avatar-img"
                title={user.name || task.assignee}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="avatar"
                style={user?.avatar_color ? { background: user.avatar_color } : undefined}
                title={user?.name || task.assignee}
                aria-label={`Responsavel: ${user?.name || task.assignee}`}
              >
                {(user?.name || task.assignee).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
