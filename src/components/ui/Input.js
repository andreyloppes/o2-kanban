"use client";

import { forwardRef } from "react";
import styles from "./Input.module.css";

const Input = forwardRef(function Input(
  {
    label,
    value,
    onChange,
    error,
    placeholder,
    type = "text",
    required,
    rows = 3,
    maxLength,
    disabled,
    id,
    ...rest
  },
  ref
) {
  const isTextarea = type === "textarea";
  const className = [
    styles.input,
    isTextarea ? styles.textarea : "",
    error ? styles.error : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (isTextarea) {
    return (
      <textarea
        ref={ref}
        id={id}
        className={className}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
      />
    );
  }

  return (
    <input
      ref={ref}
      id={id}
      type={type}
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
    />
  );
});

export default Input;
