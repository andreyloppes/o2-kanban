"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Copy, BookOpen, Bug, Zap, Circle, Trash2 } from "lucide-react";
import useUIStore from "@/stores/useUIStore";
import useBoardStore from "@/stores/useBoardStore";
import { TASK_TYPES, TEAM_MEMBERS } from "@/lib/constants";
import { updateTaskSchema } from "@/lib/validators";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import FormField from "@/components/ui/FormField";
import TaskTypeSelector from "@/components/ui/TaskTypeSelector";
import PrioritySelector from "@/components/ui/PrioritySelector";
import IconButton from "@/components/ui/IconButton";
import styles from "./TaskModal.module.css";

const TYPE_ICONS = {
  task: Copy,
  user_story: BookOpen,
  bug: Bug,
  epic: Zap,
  spike: Circle,
};

function formatDate(dateStr) {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default function TaskModal() {
  const activeTaskId = useUIStore((state) => state.activeTaskId);
  const task = useBoardStore((state) =>
    activeTaskId ? state.getTaskById(activeTaskId) : null
  );
  const columns = useBoardStore((state) => state.columns);

  // Editable state
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("task");
  const [editPriority, setEditPriority] = useState("medium");
  const [editDescription, setEditDescription] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state when task changes
  useEffect(() => {
    if (task) {
      setEditTitle(task.title || "");
      setEditType(task.type || "task");
      setEditPriority(task.priority || "medium");
      setEditDescription(task.description || "");
      setEditAssignee(task.assignee || "");
      setErrors({});
      setIsSaving(false);
    }
  }, [task]);

  // Dirty check
  const isDirty = useMemo(() => {
    if (!task) return false;
    return (
      editTitle !== (task.title || "") ||
      editType !== (task.type || "task") ||
      editPriority !== (task.priority || "medium") ||
      editDescription !== (task.description || "") ||
      editAssignee !== (task.assignee || "")
    );
  }, [task, editTitle, editType, editPriority, editDescription, editAssignee]);

  const handleClose = useCallback(() => {
    if (isDirty) {
      useUIStore.getState().showConfirmDialog({
        title: "Descartar alteracoes",
        message: "Voce tem alteracoes nao salvas. Deseja descartar?",
        confirmLabel: "Descartar",
        onConfirm: () => {
          useUIStore.getState().hideConfirmDialog();
          useUIStore.getState().closeTaskModal();
        },
      });
    } else {
      useUIStore.getState().closeTaskModal();
    }
  }, [isDirty]);

  // Escape to close
  useEffect(() => {
    if (!activeTaskId) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        handleClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeTaskId, handleClose]);

  if (!activeTaskId || !task) return null;

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  async function handleSave() {
    const updates = {};
    if (editTitle !== (task.title || "")) updates.title = editTitle.trim();
    if (editType !== (task.type || "task")) updates.type = editType;
    if (editPriority !== (task.priority || "medium")) updates.priority = editPriority;
    if (editDescription !== (task.description || ""))
      updates.description = editDescription.trim() || null;
    if (editAssignee !== (task.assignee || ""))
      updates.assignee = editAssignee || null;

    const result = updateTaskSchema.safeParse(updates);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0];
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const success = await useBoardStore.getState().updateTask(task.id, updates);
      if (success) {
        useUIStore.getState().addToast("Alteracoes salvas", "success");
        useUIStore.getState().closeTaskModal();
      } else {
        useUIStore.getState().addToast("Erro ao salvar. Tente novamente.", "error");
      }
    } catch {
      useUIStore.getState().addToast("Erro ao salvar. Tente novamente.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete() {
    useUIStore.getState().showConfirmDialog({
      title: "Excluir tarefa",
      message:
        "Tem certeza que deseja excluir esta tarefa? Esta acao nao pode ser desfeita.",
      confirmLabel: "Excluir tarefa",
      onConfirm: async () => {
        const success = await useBoardStore.getState().deleteTask(task.id);
        if (success) {
          useUIStore.getState().addToast("Tarefa excluida", "success");
          useUIStore.getState().hideConfirmDialog();
          useUIStore.getState().closeTaskModal();
        } else {
          useUIStore.getState().addToast("Erro ao excluir tarefa.", "error");
          useUIStore.getState().hideConfirmDialog();
        }
      },
    });
  }

  const TypeIcon = TYPE_ICONS[task.type] || Copy;
  const typeLabel = TASK_TYPES[task.type] || task.type;

  const currentColumn = columns.find((c) => c.id === task.column_id);

  const memberOptions = TEAM_MEMBERS.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <TypeIcon size={16} />
            <span>{typeLabel}</span>
          </div>
          <IconButton
            icon={<X size={18} />}
            onClick={handleClose}
            ariaLabel="Fechar"
          />
        </div>

        <div className={styles.body}>
          <FormField label="Titulo" required error={errors.title} htmlFor="modal-title">
            <Input
              id="modal-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Titulo da tarefa..."
              error={!!errors.title}
              maxLength={500}
            />
          </FormField>

          <div className={styles.formGrid}>
            <FormField label="Tipo">
              <TaskTypeSelector value={editType} onChange={setEditType} />
            </FormField>

            <FormField label="Prioridade">
              <PrioritySelector value={editPriority} onChange={setEditPriority} />
            </FormField>
          </div>

          <FormField label="Descricao" htmlFor="modal-desc">
            <Input
              id="modal-desc"
              type="textarea"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Adicione uma descricao..."
              maxLength={5000}
              rows={4}
            />
          </FormField>

          <FormField label="Responsavel" htmlFor="modal-assignee">
            <Select
              id="modal-assignee"
              value={editAssignee}
              onChange={(e) => setEditAssignee(e.target.value)}
              options={memberOptions}
              placeholder="Sem responsavel"
            />
          </FormField>

          <div className={styles.metaSection}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Coluna</span>
              <span className={styles.metaValue}>
                {currentColumn ? currentColumn.title : "---"}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Criado em</span>
              <span className={styles.metaValue}>
                {formatDate(task.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <IconButton
              icon={<Trash2 size={18} />}
              variant="danger"
              onClick={handleDelete}
              ariaLabel="Excluir tarefa"
              title="Excluir tarefa"
            />
          </div>
          <div className={styles.footerRight}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={!isDirty || isSaving}
              onClick={handleSave}
            >
              {isSaving ? "Salvando..." : "Salvar alteracoes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
