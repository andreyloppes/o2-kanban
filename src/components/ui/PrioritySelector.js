"use client";

import styles from "./PrioritySelector.module.css";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Baixa", color: "var(--color-neutral)", selectedClass: styles.selectedLow },
  { value: "medium", label: "Media", color: "var(--color-warning)", selectedClass: styles.selectedMedium },
  { value: "high", label: "Alta", color: "#f97316", selectedClass: styles.selectedHigh },
  { value: "urgent", label: "Urgente", color: "var(--color-danger)", selectedClass: styles.selectedUrgent },
];

export default function PrioritySelector({ value, onChange, disabled }) {
  return (
    <div className={styles.prioritySelector} role="radiogroup" aria-label="Prioridade da tarefa">
      {PRIORITY_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`${styles.priorityOption} ${isSelected ? opt.selectedClass : ""}`}
            onClick={() => !disabled && onChange(opt.value)}
            disabled={disabled}
          >
            <span
              className={styles.priorityDot}
              style={{ backgroundColor: opt.color }}
            />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
