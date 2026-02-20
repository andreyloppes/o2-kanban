"use client";

import { Plus } from "lucide-react";
import useUIStore from "@/stores/useUIStore";

export default function CreateTaskButton({ columnId }) {
  function handleClick() {
    useUIStore.getState().openCreateModal(columnId);
  }

  return (
    <button
      type="button"
      className="create-task-btn"
      onClick={handleClick}
      aria-label="Adicionar tarefa"
    >
      <Plus size={16} />
      Adicionar tarefa
    </button>
  );
}
