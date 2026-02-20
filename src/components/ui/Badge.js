"use client";

import { TASK_PRIORITIES } from "@/lib/constants";
import styles from "./Badge.module.css";

export default function Badge({ priority, size = "sm" }) {
  const label = TASK_PRIORITIES[priority] || priority;

  const className = [
    styles.badge,
    styles[priority] || "",
    size === "sm" ? styles.sm : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={className}>{label}</span>;
}
