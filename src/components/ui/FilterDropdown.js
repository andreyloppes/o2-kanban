'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import styles from './FilterDropdown.module.css';

/**
 * Dropdown de filtro com selecao single/multi.
 * @param {Object} props
 * @param {string} props.label - Label do trigger (ex: "Tipo")
 * @param {import('react').ReactNode} [props.icon] - Icone do trigger
 * @param {Array<{value: string, label: string, icon?: import('react').ReactNode, color?: string}>} props.options
 * @param {string|null} props.selected - Valor selecionado (null = nenhum)
 * @param {function} props.onChange - Handler (recebe value ou null)
 */
export default function FilterDropdown({ label, icon, options = [], selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleOptionClick = (value) => {
    if (selected === value) {
      onChange(null); // toggle off
    } else {
      onChange(value);
    }
  };

  const handleClear = () => {
    onChange(null);
    setIsOpen(false);
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {icon && <span className={styles.triggerIcon}>{icon}</span>}
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        />
        {selected !== null && (
          <span className={styles.countBadge}>1</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox" aria-label={label}>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`${styles.option} ${selected === opt.value ? styles.optionSelected : ''}`}
              role="option"
              aria-selected={selected === opt.value}
              onClick={() => handleOptionClick(opt.value)}
            >
              <span className={`${styles.checkbox} ${selected === opt.value ? styles.checkboxChecked : ''}`}>
                {selected === opt.value && <Check size={10} className={styles.checkIcon} />}
              </span>
              {opt.color && (
                <span
                  className={styles.optionColorDot}
                  style={{ backgroundColor: opt.color }}
                />
              )}
              {opt.icon && <span className={styles.optionIcon}>{opt.icon}</span>}
              <span>{opt.label}</span>
            </div>
          ))}
          {selected !== null && (
            <div className={styles.clearAction} onClick={handleClear}>
              Limpar seleção
            </div>
          )}
        </div>
      )}
    </div>
  );
}
