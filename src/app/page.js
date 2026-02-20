"use client";

import { useState, useEffect } from "react";
import useBoardStore from "@/stores/useBoardStore";
import { DEFAULT_BOARD_ID } from "@/lib/constants";
import Sidebar from "@/components/Kanban/Sidebar";
import Board from "@/components/Kanban/Board";
import Column from "@/components/Kanban/Column";
import DndProvider from "@/components/Kanban/DndProvider";
import TaskForm from "@/components/Kanban/TaskForm";
import TaskModal from "@/components/Kanban/TaskModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ToastContainer from "@/components/ui/Toast";
import "./kanban.css";

export default function KanbanPage() {
  const [isMounted, setIsMounted] = useState(false);
  const columns = useBoardStore((state) => state.columns);
  const board = useBoardStore((state) => state.board);
  const isLoading = useBoardStore((state) => state.isLoading);
  const error = useBoardStore((state) => state.error);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchBoard() {
      try {
        useBoardStore.getState().setLoading(true);
        const res = await fetch(`/api/boards/${DEFAULT_BOARD_ID}`);
        if (!res.ok) throw new Error("Falha ao carregar o board");
        const data = await res.json();
        useBoardStore.getState().hydrate(data.board, data.columns, data.tasks);
      } catch (err) {
        useBoardStore.getState().setError(err.message);
      }
    }
    fetchBoard();
  }, []);

  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="main-area" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Carregando...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="main-area" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Erro ao carregar o board</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <DndProvider>
        <Board title={board?.title || "Kanban"}>
          {columns.map((col) => (
            <Column key={col.id} column={col} />
          ))}
        </Board>
      </DndProvider>
      <TaskForm />
      <TaskModal />
      <ConfirmDialog />
      <ToastContainer />
    </div>
  );
}
