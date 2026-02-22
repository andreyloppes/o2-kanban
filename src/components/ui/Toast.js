"use client";

import { CheckCircle, XCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useUIStore from "@/stores/useUIStore";
import { toastVariants } from "@/lib/motion";
import styles from "./Toast.module.css";

function ToastItem({ toast }) {
  const Icon = toast.type === "error" ? XCircle : CheckCircle;

  return (
    <motion.div
      className={`${styles.toast} ${styles[toast.type] || styles.success}`}
      role="alert"
      aria-live="polite"
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
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
      <div className={styles.progressBar}>
        <div className={`${styles.progressFill} ${styles[`progress-${toast.type}`] || styles['progress-success']}`} />
      </div>
    </motion.div>
  );
}

export default function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);

  return (
    <div className={styles.container}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
