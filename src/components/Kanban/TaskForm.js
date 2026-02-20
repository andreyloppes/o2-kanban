"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import useUIStore from "@/stores/useUIStore";
import useBoardStore from "@/stores/useBoardStore";
import { createTaskSchema } from "@/lib/validators";
import { TEAM_MEMBERS } from "@/lib/constants";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import FormField from "@/components/ui/FormField";
import TaskTypeSelector from "@/components/ui/TaskTypeSelector";
import PrioritySelector from "@/components/ui/PrioritySelector";
import styles from "./TaskForm.module.css";

export default function TaskForm() {
  const isOpen = useUIStore((state) => state.isCreateModalOpen);
  const columnId = useUIStore((state) => state.createModalColumnId);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("task");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef(null);
  const titleInputRef = useRef(null);

  // Focus no titulo ao abrir
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset form quando abrir
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setType("task");
      setPriority("medium");
      setDescription("");
      setAssignee("");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    useUIStore.getState().closeCreateModal();
  }, []);

  // Escape para fechar
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        handleClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = {
      column_id: columnId,
      title: title.trim(),
      type,
      priority,
      description: description.trim() || null,
      assignee: assignee || null,
    };

    const result = createTaskSchema.safeParse(formData);
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
    setIsSubmitting(true);

    try {
      const savedTask = await useBoardStore.getState().addTask(formData);
      if (savedTask) {
        useUIStore.getState().addToast("Tarefa criada com sucesso", "success");
        handleClose();
      } else {
        useUIStore.getState().addToast("Erro ao criar tarefa. Tente novamente.", "error");
      }
    } catch {
      useUIStore.getState().addToast("Erro ao criar tarefa. Tente novamente.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

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
      aria-label="Criar nova tarefa"
    >
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Nova tarefa</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            <FormField label="Titulo" required error={errors.title} htmlFor="task-title">
              <Input
                id="task-title"
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titulo da tarefa..."
                error={!!errors.title}
                required
                maxLength={500}
              />
            </FormField>

            <div className={styles.formGrid}>
              <FormField label="Tipo">
                <TaskTypeSelector value={type} onChange={setType} />
              </FormField>

              <FormField label="Prioridade">
                <PrioritySelector value={priority} onChange={setPriority} />
              </FormField>
            </div>

            <FormField label="Descricao" htmlFor="task-desc">
              <Input
                id="task-desc"
                type="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descricao (opcional)..."
                maxLength={5000}
                rows={3}
              />
            </FormField>

            <FormField label="Responsavel" htmlFor="task-assignee">
              <Select
                id="task-assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                options={memberOptions}
                placeholder="Sem responsavel"
              />
            </FormField>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
