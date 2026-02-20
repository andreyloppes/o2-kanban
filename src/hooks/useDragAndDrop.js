"use client";

import { useState, useCallback } from "react";
import useBoardStore from "@/stores/useBoardStore";
import { POSITION_GAP } from "@/lib/constants";

/**
 * Hook que encapsula toda a lógica de drag-and-drop do Kanban.
 * Gerencia activeId e handlers de DnD, com persistência via store.
 */
export default function useDragAndDrop() {
  const [activeId, setActiveId] = useState(null);

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id;
    const overId = over.id;

    if (activeTaskId === overId) return;

    const isActiveCard =
      active.data.current?.type === "Card" ||
      active.data.current?.type === "Task";

    if (!isActiveCard) return;

    const state = useBoardStore.getState();
    const activeTask = state.getTaskById(activeTaskId);
    if (!activeTask) return;

    const isOverCard =
      over.data.current?.type === "Card" ||
      over.data.current?.type === "Task";

    // Verificar se o over é uma coluna (existe no array de columns)
    const isOverColumn = state.columns.some((col) => col.id === overId);

    if (isOverCard) {
      const overTask = state.getTaskById(overId);
      if (!overTask) return;

      // Se estão em colunas diferentes, mover para a coluna do over
      if (activeTask.column_id !== overTask.column_id) {
        useBoardStore.setState((prev) => ({
          tasks: prev.tasks.map((t) =>
            t.id === activeTaskId
              ? { ...t, column_id: overTask.column_id }
              : t
          ),
        }));
      } else {
        // Mesma coluna: reordenar no state local (swap positions)
        useBoardStore.setState((prev) => {
          const tasks = [...prev.tasks];
          const activeIndex = tasks.findIndex((t) => t.id === activeTaskId);
          const overIndex = tasks.findIndex((t) => t.id === overId);
          if (activeIndex === -1 || overIndex === -1) return prev;

          const [removed] = tasks.splice(activeIndex, 1);
          tasks.splice(overIndex, 0, removed);
          return { tasks };
        });
      }
    }

    if (isOverColumn) {
      // Mover para coluna vazia ou diferente
      if (activeTask.column_id !== overId) {
        useBoardStore.setState((prev) => ({
          tasks: prev.tasks.map((t) =>
            t.id === activeTaskId ? { ...t, column_id: overId } : t
          ),
        }));
      }
    }
  }, []);

  const handleDragEnd = useCallback((event) => {
    const currentActiveId = activeId;
    setActiveId(null);

    const { active, over } = event;
    if (!over || !currentActiveId) return;

    const activeTaskId = active.id;
    const overId = over.id;

    const state = useBoardStore.getState();
    const activeTask = state.getTaskById(activeTaskId);
    if (!activeTask) return;

    const targetColumnId = activeTask.column_id;
    const columnTasks = state
      .getTasksByColumn(targetColumnId)
      .filter((t) => t.id !== activeTaskId);

    // Calcular nova posição com float positioning
    let newPosition;

    if (columnTasks.length === 0) {
      // Coluna vazia (ou só tem o card ativo)
      newPosition = POSITION_GAP;
    } else {
      // Encontrar índice onde o card foi solto
      const isOverCard =
        over.data.current?.type === "Card" ||
        over.data.current?.type === "Task";

      if (isOverCard && overId !== activeTaskId) {
        const overIndex = columnTasks.findIndex((t) => t.id === overId);

        if (overIndex === -1) {
          // Over card não está nesta coluna — soltar no final
          newPosition =
            columnTasks[columnTasks.length - 1].position + POSITION_GAP;
        } else if (overIndex === 0) {
          // Soltar no início
          newPosition = columnTasks[0].position / 2;
        } else {
          // Soltar entre dois cards
          const posBefore = columnTasks[overIndex - 1].position;
          const posAfter = columnTasks[overIndex].position;
          newPosition = (posBefore + posAfter) / 2;
        }
      } else {
        // Soltar na coluna diretamente (não sobre um card) — final
        newPosition =
          columnTasks[columnTasks.length - 1].position + POSITION_GAP;
      }
    }

    // Persistir via store (optimistic + API)
    useBoardStore.getState().moveTask(activeTaskId, targetColumnId, newPosition);
  }, [activeId]);

  return {
    activeId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
