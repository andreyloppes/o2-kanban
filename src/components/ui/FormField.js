"use client";

import styles from "./FormField.module.css";

export default function FormField({ label, error, required, htmlFor, children }) {
  return (
    <div className={styles.formField}>
      {label && (
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {children}
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}
