'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

/**
 * Campo de busca com debounce e atalho Ctrl+K / Cmd+K.
 * @param {Object} props
 * @param {string} [props.value='']
 * @param {function} props.onChange - Chamado apos debounce (recebe string)
 * @param {string} [props.placeholder='Buscar tarefas...']
 * @param {number} [props.debounceMs=300]
 */
export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Buscar tarefas...',
  debounceMs = 300,
}) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedRef = useRef(null);
  const inputRef = useRef(null);
  const [isMac, setIsMac] = useState(false);

  // Detectar plataforma
  useEffect(() => {
    setIsMac(navigator.platform?.toUpperCase().includes('MAC') || navigator.userAgent?.includes('Mac'));
  }, []);

  // Debounce
  useEffect(() => {
    clearTimeout(debouncedRef.current);
    debouncedRef.current = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);
    return () => clearTimeout(debouncedRef.current);
  }, [localValue, debounceMs, onChange]);

  // Sync externo -> local
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Atalho Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={styles.searchBar} role="search" aria-label="Buscar tarefas">
      <Search size={16} className={styles.searchIcon} />
      <input
        ref={inputRef}
        type="text"
        className={styles.searchInput}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Campo de busca"
      />
      {localValue ? (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear}
          aria-label="Limpar busca"
        >
          <X size={14} />
        </button>
      ) : (
        <span className={styles.shortcutHint}>
          {isMac ? '⌘K' : 'Ctrl+K'}
        </span>
      )}
    </div>
  );
}
