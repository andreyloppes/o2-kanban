'use client';

import { Bot } from 'lucide-react';
import useUIStore from '@/stores/useUIStore';
import styles from './AIToggleButton.module.css';

export default function AIToggleButton({ thinking = false }) {
  const aiChatOpen = useUIStore((state) => state.aiChatOpen);

  return (
    <button
      className={`${styles.button} ${aiChatOpen ? styles.buttonActive : ''} ${thinking ? styles.thinking : ''}`}
      onClick={() => useUIStore.getState().toggleAIChat()}
      title="Agente IA"
      aria-label="Abrir agente de IA"
    >
      <Bot size={16} />
      <span>IA</span>
    </button>
  );
}
