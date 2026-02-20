"use client";

import { CheckCircle, XCircle, X } from "lucide-react";
import useUIStore from "@/stores/useUIStore";
import styles from "./Toast.module.css";

function ToastItem({ toast }) {
  const Icon = toast.type === "error" ? XCircle : CheckCircle;

  return (
    <div
      className={`${styles.toast} ${styles[toast.type] || styles.success}`}
      role="alert"
      aria-live="polite"
    >
      <Icon size={18} className={styles.icon} />
      <span className={styles.message}>{toast.message}</span>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={() => useUIStore.getState().removeToast(toast.id)}
        aria-label="Fechar notificacao"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
