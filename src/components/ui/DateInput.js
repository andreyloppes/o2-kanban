'use client';

import { useRef } from 'react';
import { Calendar, X } from 'lucide-react';
import styles from './DateInput.module.css';

/**
 * Campo de input de data estilizado com picker nativo.
 * @param {Object} props
 * @param {string} [props.id]
 * @param {string} [props.value='']
 * @param {function} props.onChange
 * @param {string} [props.placeholder='Selecionar data']
 * @param {string} [props.min]
 * @param {string} [props.max]
 * @param {boolean} [props.error=false]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.clearable=true]
 */
export default function DateInput({
  id,
  value = '',
  onChange,
  placeholder = 'Selecionar data',
  min,
  max,
  error = false,
  disabled = false,
  clearable = true,
}) {
  const inputRef = useRef(null);

  const formatDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { value: '' } });
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.showPicker?.();
      inputRef.current.focus();
    }
  };

  return (
    <div
      className={`${styles.dateInput} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
    >
      <Calendar size={16} className={styles.icon} />
      <span className={value ? styles.value : styles.placeholder}>
        {value ? formatDisplay(value) : placeholder}
      </span>
      <input
        ref={inputRef}
        id={id}
        type="date"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        disabled={disabled}
        className={styles.nativeInput}
        tabIndex={-1}
      />
      {clearable && value && !disabled && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear}
          aria-label="Limpar data"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
