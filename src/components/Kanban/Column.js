import { useMemo, useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronsLeft, MoreHorizontal, Pencil, Trash2, Check, X, GripVertical } from "lucide-react";
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
  const board = useBoardStore((state) => state.board);
  const filters = useUIStore((state) => state.filters);
  const isCollapsed = useUIStore((state) => !!state.collapsedColumns[column.id]);

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const canEdit = board?.can_edit;

  // Sortable for column reordering
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: 'Column' },
  });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
  });

  const colorClass = COLUMN_COLOR_MAP[column.color] || "status-backlog";
  const taskCount = tasks.length;
  const countLabel = hasActiveFilters ? `${taskCount} de ${columnTasks.length}` : `${taskCount}`;

  const handleToggleCollapse = () => {
    useUIStore.getState().toggleColumn(column.id);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  // Focus input when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditTitle(column.title);
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === column.title) {
      setIsEditing(false);
      return;
    }
    await useBoardStore.getState().updateColumn(column.id, { title: trimmed });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(column.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') handleCancelEdit();
  };

  const handleDelete = async () => {
    setShowMenu(false);
    if (columnTasks.length > 0) {
      useUIStore.getState().addToast('Mova ou delete as tarefas antes de remover a coluna', 'error');
      return;
    }
    await useBoardStore.getState().deleteColumn(column.id);
  };

  if (isCollapsed) {
    return (
      <motion.div
        ref={(node) => {
          setSortableRef(node);
          setDroppableRef(node);
        }}
        className={`column-collapsed ${isOver ? "active-col" : ""}`}
        role="region"
        aria-label={`Coluna ${column.title} (recolhida)`}
        onClick={handleToggleCollapse}
        title={`Expandir coluna ${column.title}`}
        variants={columnVariant}
        style={sortableStyle}
      >
        <span className={`status-dot ${colorClass}`} aria-hidden="true"></span>
        <span className="column-collapsed-count">{countLabel}</span>
        <span className="column-collapsed-title">{column.title}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={setSortableRef}
      className={`column-container ${isOver ? "active-col" : ""}`}
      role="region"
      aria-label={`Coluna ${column.title}`}
      variants={columnVariant}
      style={sortableStyle}
    >
      <div className="column-header">
        <div className="column-title-wrap">
          {canEdit && (
            <button
              className="collapse-col-btn"
              aria-label="Arrastar coluna"
              style={{ cursor: 'grab', touchAction: 'none' }}
              {...attributes}
              {...listeners}
            >
              <GripVertical size={14} className="collapse-icon" />
            </button>
          )}
          <span className={`status-dot ${colorClass}`} aria-hidden="true"></span>
          {isEditing ? (
            <div className="column-edit-wrap">
              <input
                ref={inputRef}
                className="column-edit-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveEdit}
                maxLength={200}
              />
            </div>
          ) : (
            <h2 className="column-title">{column.title}</h2>
          )}
        </div>
        <div className="column-meta">
          <span className="task-count">{countLabel}</span>
          {canEdit && !isEditing && (
            <div className="column-menu-wrap" ref={menuRef}>
              <button
                className="collapse-col-btn"
                aria-label="Opcoes da coluna"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreHorizontal size={16} className="collapse-icon" />
              </button>
              {showMenu && (
                <div className="column-dropdown">
                  <button className="column-dropdown-item" onClick={handleStartEdit}>
                    <Pencil size={14} />
                    Renomear
                  </button>
                  <button
                    className="column-dropdown-item column-dropdown-danger"
                    onClick={handleDelete}
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            className="collapse-col-btn"
            aria-label={`Recolher coluna ${column.title}`}
            onClick={handleToggleCollapse}
          >
            <ChevronsLeft size={16} className="collapse-icon" />
          </button>
        </div>
      </div>

      <div ref={setDroppableRef} className="column-content">
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

        {canEdit && <CreateTaskButton columnId={column.id} />}
      </div>
    </motion.div>
  );
}
