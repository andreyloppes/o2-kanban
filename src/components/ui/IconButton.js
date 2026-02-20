"use client";

import styles from "./IconButton.module.css";

export default function IconButton({
  icon,
  onClick,
  variant = "ghost",
  size = "md",
  ariaLabel,
  disabled,
  title,
  ...rest
}) {
  const className = [
    styles.iconBtn,
    styles[size] || styles.md,
    styles[variant] || styles.ghost,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      {...rest}
    >
      {icon}
    </button>
  );
}
