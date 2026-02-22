'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import styles from './CommentInput.module.css';

/**
 * Textarea com auto-resize e botao de envio para novos comentarios.
 * @param {Object} props
 * @param {function} props.onSubmit - Recebe string do comentario (trimado)
 * @param {string} [props.placeholder='Adicionar comentario...']
 * @param {boolean} [props.isSubmitting=false]
 * @param {boolean} [props.disabled=false]
 */
export default function CommentInput({
  onSubmit,
  placeholder = 'Adicionar comentário...',
  isSubmitting = false,
  disabled = false,
}) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform?.toUpperCase().includes('MAC') || navigator.userAgent?.includes('Mac'));
  }, []);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isSubmitting) return;
    onSubmit(trimmed);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = value.trim().length > 0;

  return (
    <div className={styles.commentInputWrapper}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isSubmitting}
        readOnly={isSubmitting}
        rows={1}
      />
      <div className={`${styles.footer} ${hasContent ? styles.footerVisible : ''}`}>
        <span className={styles.hint}>
          {isMac ? '⌘+Enter' : 'Ctrl+Enter'} para enviar
        </span>
        <button
          type="button"
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!hasContent || isSubmitting}
        >
          <Send size={12} />
          Enviar
        </button>
      </div>
    </div>
  );
}
