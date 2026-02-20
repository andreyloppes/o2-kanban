"use client";

import { Copy, BookOpen, Bug, Zap, Circle } from "lucide-react";
import styles from "./TaskTypeSelector.module.css";

const TYPE_OPTIONS = [
  { value: "task", label: "Tarefa", icon: Copy },
  { value: "user_story", label: "User Story", icon: BookOpen },
  { value: "bug", label: "Bug", icon: Bug },
  { value: "epic", label: "Epico", icon: Zap },
  { value: "spike", label: "Spike", icon: Circle },
];

export default function TaskTypeSelector({ value, onChange }) {
  return (
    <div className={styles.typeSelector} role="radiogroup" aria-label="Tipo da tarefa">
      {TYPE_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`${styles.typeOption} ${isSelected ? styles.selected : ""}`}
            onClick={() => onChange(opt.value)}
          >
            <Icon size={14} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
