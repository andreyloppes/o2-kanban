"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, Link2, Calendar } from "lucide-react";
import useBoardTaskStore from "@/stores/useBoardTaskStore";
import useUIStore from "@/stores/useUIStore";
import { PRIORITY_COLORS } from "@/lib/constants";

function formatShortDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

export default function BoardTaskItem({ task, boardId }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleToggle() {
    useBoardTaskStore.getState().toggleComplete(boardId, task.id);
  }

  function handleDelete() {
    useUIStore.getState().showConfirmDialog({
      title: "Excluir tarefa",
      message: "Tem certeza que deseja excluir esta tarefa?",
      confirmLabel: "Excluir",
      onConfirm: async () => {
        await useBoardTaskStore.getState().deleteBoardTask(boardId, task.id);
        useUIStore.getState().hideConfirmDialog();
      },
    });
  }

  const priorityColor = PRIORITY_COLORS[task.priority] || "neutral";
  const dueDateStr = formatShortDate(task.due_date);

  return (
    <div className={`board-task-item ${task.is_completed ? "completed" : ""}`}>
      <label className="board-task-checkbox">
        <input
          type="checkbox"
          checked={task.is_completed}
          onChange={handleToggle}
        />
        <span className="checkmark" />
      </label>

      <div className="board-task-content">
        <span className="board-task-title">{task.title}</span>
        <div className="board-task-meta">
          {task.priority && task.priority !== "medium" && (
            <span className={`board-task-priority priority-${priorityColor}`} />
          )}
          {dueDateStr && (
            <span className="board-task-due">
              <Calendar size={10} />
              {dueDateStr}
            </span>
          )}
        </div>
      </div>

      <div className="board-task-actions">
        <button
          className="board-task-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MoreHorizontal size={14} />
        </button>
        {menuOpen && (
          <>
            <div className="board-task-menu-overlay" onClick={() => setMenuOpen(false)} />
            <div className="board-task-menu">
              <button
                onClick={() => {
                  handleDelete();
                  setMenuOpen(false);
                }}
              >
                <Trash2 size={13} />
                Excluir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
