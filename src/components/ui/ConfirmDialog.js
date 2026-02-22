"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { modalOverlay, modalContent } from "@/lib/motion";
import useUIStore from "@/stores/useUIStore";
import styles from "./ConfirmDialog.module.css";

export default function ConfirmDialog() {
  const confirmDialog = useUIStore((state) => state.confirmDialog);
  const cancelRef = useRef(null);

  // Focus on cancel button when opened (prevent accidental confirm)
  useEffect(() => {
    if (confirmDialog && cancelRef.current) {
      setTimeout(() => cancelRef.current?.focus(), 100);
    }
  }, [confirmDialog]);

  // Escape to close
  useEffect(() => {
    if (!confirmDialog) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        useUIStore.getState().hideConfirmDialog();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirmDialog]);

  if (!confirmDialog) return null;

  const { title, message, onConfirm, confirmLabel } = confirmDialog;

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      useUIStore.getState().hideConfirmDialog();
    }
  }

  function handleCancel() {
    useUIStore.getState().hideConfirmDialog();
  }

  function handleConfirm() {
    if (onConfirm) {
      onConfirm();
    }
  }

  return (
    <motion.div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      variants={modalOverlay}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.dialog} variants={modalContent}>
        <h2 id="confirm-dialog-title" className={styles.title}>
          {title || "Confirmar acao"}
        </h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button
            ref={cancelRef}
            type="button"
            className={styles.btnCancel}
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.btnDanger}
            onClick={handleConfirm}
          >
            {confirmLabel || "Confirmar"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
