"use client";

import { useEffect } from "react";
import { X, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useUIStore from "@/stores/useUIStore";
import useBoardTaskStore from "@/stores/useBoardTaskStore";
import BoardTaskForm from "./BoardTaskForm";
import BoardTaskItem from "./BoardTaskItem";

export default function BoardTasksPanel({ boardId }) {
  const isOpen = useUIStore((state) => state.boardTasksPanelOpen);
  const close = useUIStore((state) => state.closeBoardTasksPanel);
  const boardTasks = useBoardTaskStore((state) => state.boardTasks);
  const isLoading = useBoardTaskStore((state) => state.isLoading);

  useEffect(() => {
    if (isOpen && boardId) {
      useBoardTaskStore.getState().fetchBoardTasks(boardId);
    }
  }, [isOpen, boardId]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

  const { unlinked, groups } = useBoardTaskStore.getState().getGroupedTasks();
  const total = boardTasks.length;
  const completed = boardTasks.filter((t) => t.is_completed).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="board-tasks-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="board-tasks-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          >
            <div className="board-tasks-header">
              <div className="board-tasks-header-left">
                <CheckSquare size={18} />
                <h2>Tarefas</h2>
                {total > 0 && (
                  <span className="board-tasks-count">
                    {completed}/{total}
                  </span>
                )}
              </div>
              <button className="board-tasks-close" onClick={close}>
                <X size={18} />
              </button>
            </div>

            <div className="board-tasks-body">
              <BoardTaskForm boardId={boardId} />

              {isLoading && boardTasks.length === 0 ? (
                <div className="board-tasks-empty">Carregando...</div>
              ) : total === 0 ? (
                <div className="board-tasks-empty">
                  <CheckSquare size={32} strokeWidth={1} />
                  <p>Nenhuma tarefa pessoal</p>
                  <span>Adicione tarefas para rastrear o que precisa ser feito</span>
                </div>
              ) : (
                <>
                  {unlinked.length > 0 && (
                    <div className="board-tasks-section">
                      <div className="board-tasks-section-header">Sem vinculo</div>
                      {unlinked.map((t) => (
                        <BoardTaskItem key={t.id} task={t} boardId={boardId} />
                      ))}
                    </div>
                  )}

                  {groups.map((group) => (
                    <div key={group.card_id} className="board-tasks-section">
                      <div className="board-tasks-section-header">
                        {group.card_title}
                      </div>
                      {group.tasks.map((t) => (
                        <BoardTaskItem key={t.id} task={t} boardId={boardId} />
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
