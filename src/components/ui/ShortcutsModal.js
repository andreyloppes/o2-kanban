'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { modalOverlay, modalContent } from '@/lib/motion';
import useUIStore from '@/stores/useUIStore';
import styles from './ShortcutsModal.module.css';

const SHORTCUT_GROUPS = [
  {
    title: 'Geral',
    shortcuts: [
      { keys: ['?'], description: 'Abrir/fechar atalhos' },
      { keys: ['Esc'], description: 'Fechar modal ativo' },
      { keys: ['/'], description: 'Focar busca' },
      { keys: ['\u2318', 'K'], description: 'Focar busca' },
    ],
  },
  {
    title: 'Navegacao',
    shortcuts: [
      { keys: ['g', 'b'], chord: true, description: 'Ir para Boards' },
      { keys: ['g', 's'], chord: true, description: 'Ir para Settings' },
      { keys: ['g', 'd'], chord: true, description: 'Ir para Dashboard' },
    ],
  },
  {
    title: 'Tasks',
    shortcuts: [
      { keys: ['c'], description: 'Criar nova task' },
    ],
  },
  {
    title: 'Filtros',
    shortcuts: [
      { keys: ['1'], description: 'Filtrar por prioridade Low' },
      { keys: ['2'], description: 'Filtrar por prioridade Medium' },
      { keys: ['3'], description: 'Filtrar por prioridade High' },
      { keys: ['4'], description: 'Filtrar por prioridade Urgent' },
      { keys: ['0'], description: 'Limpar todos os filtros' },
    ],
  },
];

function Kbd({ children }) {
  return <span className={styles.kbd}>{children}</span>;
}

function ShortcutKeys({ keys, chord }) {
  return (
    <span className={styles.keys}>
      {keys.map((key, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
          {i > 0 && (
            <span className={styles.then}>{chord ? 'then' : '+'}</span>
          )}
          <Kbd>{key}</Kbd>
        </span>
      ))}
    </span>
  );
}

export default function ShortcutsModal() {
  const isOpen = useUIStore((state) => state.shortcutsModalOpen);
  const close = useUIStore((state) => state.setShortcutsModalOpen);

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      close(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-modal-title"
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div className={styles.modal} variants={modalContent}>
            {/* Header */}
            <div className={styles.header}>
              <h2 id="shortcuts-modal-title" className={styles.title}>
                <span className={styles.titleIcon}>&#9000;</span>
                Atalhos de teclado
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => close(false)}
                aria-label="Fechar"
              >
                &#x2715;
              </button>
            </div>

            {/* Shortcut groups */}
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.title} className={styles.group}>
                <h3 className={styles.groupTitle}>{group.title}</h3>
                {group.shortcuts.map((shortcut, i) => (
                  <div key={i} className={styles.shortcutRow}>
                    <span className={styles.description}>
                      {shortcut.description}
                    </span>
                    <ShortcutKeys
                      keys={shortcut.keys}
                      chord={shortcut.chord}
                    />
                  </div>
                ))}
              </div>
            ))}

            {/* Footer */}
            <div className={styles.footer}>
              <span className={styles.footerHint}>
                Pressione <Kbd>?</Kbd> a qualquer momento para ver os atalhos
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
